// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ProofPayEscrow} from "../src/ProofPayEscrow.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {SignatureVerifier} from "../src/mocks/SignatureVerifier.sol";
import {Attestation, Attestor, AttNetworkRequest, AttNetworkResponseResolve, IPrimusZKTLS} from "../src/interfaces/IPrimusZKTLS.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract ProofPayEscrowTest is Test {
    MockUSDC usdc;
    SignatureVerifier verifier;
    ProofPayEscrow escrow;

    uint256 attestorKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    uint256 rogueKey = 0xA11CE;
    address attestor;
    address payer = address(0xBEEF);
    address worker = address(0xCAFE);
    address other = address(0xD00D);
    address arbiter = address(0xA2B1);
    address admin = address(0xAD);

    bytes32 constant ID = keccak256("tsk_7Q2M");
    uint128 constant AMOUNT = 2_500e6;
    string constant URL = "https://partner.example/campaigns/cmp_ada/stats";
    string constant CONDS = '[[{"field":"conversions","op":">=","value":"1200"}]]';
    string constant PARAMS = '{"taskId":"tsk_7Q2M","conditionHash":"0xabc"}';
    string constant DATA = '{"conversions":"true"}';

    function setUp() public {
        vm.warp(1_800_000_000);
        attestor = vm.addr(attestorKey);
        usdc = new MockUSDC();
        verifier = new SignatureVerifier(attestor);
        escrow = new ProofPayEscrow(usdc, IPrimusZKTLS(address(verifier)), arbiter, admin);
        usdc.mint(payer, 100_000e6);
        vm.prank(payer);
        usdc.approve(address(escrow), type(uint256).max);
    }

    // ------------------------------------------------------------ helpers
    function _create(uint64 deadline) internal {
        vm.prank(payer);
        escrow.createTask(ID, worker, AMOUNT, deadline, keccak256(bytes(URL)), keccak256(bytes(CONDS)), keccak256(bytes(PARAMS)), keccak256(bytes(DATA)));
    }
    function _funded() internal returns (uint64 deadline) {
        deadline = uint64(block.timestamp + 7 days);
        _create(deadline);
        vm.prank(payer);
        escrow.fund(ID);
    }
    function _att(address recipient, uint64 ts) internal pure returns (Attestation memory a) {
        a.recipient = recipient;
        a.request = AttNetworkRequest(URL, "", "GET", "");
        a.reponseResolve = new AttNetworkResponseResolve[](1);
        a.reponseResolve[0] = AttNetworkResponseResolve("conversions", "json", "$.conversions");
        a.data = DATA;
        a.attConditions = CONDS;
        a.timestamp = ts;
        a.additionParams = PARAMS;
        a.attestors = new Attestor[](1);
        a.attestors[0] = Attestor(address(0), "");
        a.signatures = new bytes[](0);
    }
    function _sign(Attestation memory a, uint256 key) internal view returns (Attestation memory) {
        bytes32 d = verifier.digestOf(a);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, d);
        a.signatures = new bytes[](1);
        a.signatures[0] = abi.encodePacked(r, s, v);
        return a;
    }
    function _good() internal view returns (Attestation memory) {
        return _sign(_att(worker, uint64(block.timestamp)), attestorKey);
    }

    // ------------------------------------------------------------ happy path
    function test_happyPath_settlesToBeneficiary() public {
        _funded();
        assertEq(usdc.balanceOf(address(escrow)), AMOUNT);
        vm.expectEmit(true, true, false, false);
        emit ProofPayEscrow.TaskSettled(ID, worker, AMOUNT, bytes32(0));
        escrow.settle(ID, _good());
        assertEq(usdc.balanceOf(worker), AMOUNT);
        assertEq(usdc.balanceOf(address(escrow)), 0);
        (, , , , , ProofPayEscrow.State st, , , , ) = escrow.tasks(ID);
        assertEq(uint8(st), uint8(ProofPayEscrow.State.Settled));
    }

    function test_anyoneCanSubmit_fundsStillGoToBeneficiary() public {
        _funded();
        vm.prank(other);
        escrow.settle(ID, _good());
        assertEq(usdc.balanceOf(worker), AMOUNT);
        assertEq(usdc.balanceOf(other), 0);
    }

    // ------------------------------------------------------------ replay
    function test_replay_secondTaskRejected() public {
        _funded();
        Attestation memory a = _good();
        escrow.settle(ID, a);
        // Same proof against a second, identically-bound task must not pay again.
        bytes32 id2 = keccak256("tsk_2");
        vm.prank(payer);
        escrow.createTask(id2, worker, AMOUNT, uint64(block.timestamp + 7 days), keccak256(bytes(URL)), keccak256(bytes(CONDS)), keccak256(bytes(PARAMS)), keccak256(bytes(DATA)));
        vm.prank(payer);
        escrow.fund(id2);
        vm.expectRevert(ProofPayEscrow.Replayed.selector);
        escrow.settle(id2, a);
    }

    function test_settleTwice_revertsBadState() public {
        _funded();
        Attestation memory a = _good();
        escrow.settle(ID, a);
        vm.expectRevert(abi.encodeWithSelector(ProofPayEscrow.BadState.selector, ProofPayEscrow.State.Settled));
        escrow.settle(ID, a);
    }

    // ------------------------------------------------------------ binding
    function test_wrongRecipient_reverts() public {
        _funded();
        Attestation memory a = _sign(_att(other, uint64(block.timestamp)), attestorKey);
        vm.expectRevert(ProofPayEscrow.WrongBeneficiary.selector);
        escrow.settle(ID, a);
    }

    function test_wrongUrl_reverts() public {
        _funded();
        Attestation memory a = _att(worker, uint64(block.timestamp));
        a.request.url = "https://evil.example/stats";
        a = _sign(a, attestorKey);
        vm.expectRevert(abi.encodeWithSelector(ProofPayEscrow.NotBound.selector, "url"));
        escrow.settle(ID, a);
    }

    function test_wrongConditions_reverts() public {
        _funded();
        Attestation memory a = _att(worker, uint64(block.timestamp));
        a.attConditions = '[[{"field":"conversions","op":">=","value":"1"}]]';
        a = _sign(a, attestorKey);
        vm.expectRevert(abi.encodeWithSelector(ProofPayEscrow.NotBound.selector, "conditions"));
        escrow.settle(ID, a);
    }

    function test_wrongTaskParams_reverts() public {
        _funded();
        Attestation memory a = _att(worker, uint64(block.timestamp));
        a.additionParams = '{"taskId":"tsk_OTHER","conditionHash":"0xabc"}';
        a = _sign(a, attestorKey);
        vm.expectRevert(abi.encodeWithSelector(ProofPayEscrow.NotBound.selector, "additionParams"));
        escrow.settle(ID, a);
    }

    function test_conditionNotMet_dataMismatch_reverts() public {
        _funded();
        Attestation memory a = _att(worker, uint64(block.timestamp));
        a.data = '{"conversions":"false"}';
        a = _sign(a, attestorKey);
        vm.expectRevert(abi.encodeWithSelector(ProofPayEscrow.NotBound.selector, "data"));
        escrow.settle(ID, a);
    }

    // ------------------------------------------------------------ signature
    function test_unregisteredAttestor_reverts() public {
        _funded();
        Attestation memory a = _sign(_att(worker, uint64(block.timestamp)), rogueKey);
        vm.expectRevert(bytes("attestor not registered"));
        escrow.settle(ID, a);
    }

    function test_tamperedAfterSigning_reverts() public {
        _funded();
        Attestation memory a = _good();
        a.data = DATA; // unchanged data, but tamper with the signed header instead
        a.request.header = "x-tampered: 1";
        vm.expectRevert(bytes("attestor not registered"));
        escrow.settle(ID, a);
    }

    function test_missingSignature_reverts() public {
        _funded();
        Attestation memory a = _att(worker, uint64(block.timestamp));
        vm.expectRevert(bytes("one signature"));
        escrow.settle(ID, a);
    }

    // ------------------------------------------------------------ time
    function test_afterDeadline_settleReverts() public {
        uint64 dl = _funded();
        vm.warp(dl + 1);
        Attestation memory a = _sign(_att(worker, uint64(block.timestamp)), attestorKey);
        vm.expectRevert(ProofPayEscrow.DeadlinePassed.selector);
        escrow.settle(ID, a);
    }

    function test_proofPredatingFunding_reverts() public {
        _funded();
        vm.warp(block.timestamp + 1 hours);
        Attestation memory a = _sign(_att(worker, uint64(block.timestamp - 2 hours)), attestorKey);
        vm.expectRevert(ProofPayEscrow.OutsideWindow.selector);
        escrow.settle(ID, a);
    }

    function test_proofFromTheFuture_reverts() public {
        _funded();
        Attestation memory a = _sign(_att(worker, uint64(block.timestamp + 1 hours)), attestorKey);
        vm.expectRevert(ProofPayEscrow.OutsideWindow.selector);
        escrow.settle(ID, a);
    }

    function test_millisecondTimestamp_isAccepted() public {
        _funded();
        Attestation memory a = _sign(_att(worker, uint64(block.timestamp) * 1000), attestorKey);
        escrow.settle(ID, a);
        assertEq(usdc.balanceOf(worker), AMOUNT);
    }

    // ------------------------------------------------------------ refund
    function test_refund_afterDeadline() public {
        uint64 dl = _funded();
        vm.warp(dl + 1);
        vm.prank(payer);
        escrow.refund(ID);
        assertEq(usdc.balanceOf(payer), 100_000e6);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }

    function test_refund_beforeDeadline_reverts() public {
        _funded();
        vm.prank(payer);
        vm.expectRevert(ProofPayEscrow.DeadlineNotPassed.selector);
        escrow.refund(ID);
    }

    function test_refund_onlyPayer() public {
        uint64 dl = _funded();
        vm.warp(dl + 1);
        vm.prank(other);
        vm.expectRevert(ProofPayEscrow.NotPayer.selector);
        escrow.refund(ID);
    }

    function test_refund_afterSettle_reverts() public {
        uint64 dl = _funded();
        escrow.settle(ID, _good());
        vm.warp(dl + 1);
        vm.prank(payer);
        vm.expectRevert(abi.encodeWithSelector(ProofPayEscrow.BadState.selector, ProofPayEscrow.State.Settled));
        escrow.refund(ID);
    }

    // ------------------------------------------------------------ dispute
    function test_dispute_resolveRelease() public {
        _funded();
        vm.prank(worker);
        escrow.dispute(ID);
        vm.prank(arbiter);
        escrow.resolve(ID, true);
        assertEq(usdc.balanceOf(worker), AMOUNT);
    }

    function test_dispute_resolveRefund() public {
        _funded();
        vm.prank(payer);
        escrow.dispute(ID);
        vm.prank(arbiter);
        escrow.resolve(ID, false);
        assertEq(usdc.balanceOf(payer), 100_000e6);
    }

    function test_dispute_blocksSettle() public {
        _funded();
        vm.prank(payer);
        escrow.dispute(ID);
        Attestation memory a = _good();
        vm.expectRevert(abi.encodeWithSelector(ProofPayEscrow.BadState.selector, ProofPayEscrow.State.Disputed));
        escrow.settle(ID, a);
    }

    function test_dispute_strangerReverts() public {
        _funded();
        vm.prank(other);
        vm.expectRevert(ProofPayEscrow.NotParty.selector);
        escrow.dispute(ID);
    }

    function test_resolve_onlyArbiter() public {
        _funded();
        vm.prank(payer);
        escrow.dispute(ID);
        vm.prank(payer);
        vm.expectRevert(ProofPayEscrow.NotArbiter.selector);
        escrow.resolve(ID, false);
    }

    // ------------------------------------------------------------ access control and setup
    function test_fund_onlyPayer_andOnlyOnce() public {
        _create(uint64(block.timestamp + 1 days));
        vm.prank(other);
        vm.expectRevert(ProofPayEscrow.NotPayer.selector);
        escrow.fund(ID);
        vm.startPrank(payer);
        escrow.fund(ID);
        vm.expectRevert(abi.encodeWithSelector(ProofPayEscrow.BadState.selector, ProofPayEscrow.State.Funded));
        escrow.fund(ID);
        vm.stopPrank();
    }

    function test_create_validation() public {
        vm.startPrank(payer);
        vm.expectRevert(ProofPayEscrow.ZeroValue.selector);
        escrow.createTask(ID, worker, 0, uint64(block.timestamp + 1 days), 0, 0, 0, 0);
        vm.expectRevert(ProofPayEscrow.BadDeadline.selector);
        escrow.createTask(ID, worker, 1, uint64(block.timestamp), 0, 0, 0, 0);
        escrow.createTask(ID, worker, 1, uint64(block.timestamp + 1), 0, 0, 0, 0);
        vm.expectRevert(ProofPayEscrow.TaskExists.selector);
        escrow.createTask(ID, worker, 1, uint64(block.timestamp + 1), 0, 0, 0, 0);
        vm.stopPrank();
    }

    function test_pause_blocksStateChanges_ownerOnly() public {
        vm.prank(other);
        vm.expectRevert();
        escrow.pause();
        vm.prank(admin);
        escrow.pause();
        vm.prank(payer);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        escrow.createTask(ID, worker, 1, uint64(block.timestamp + 1 days), 0, 0, 0, 0);
    }

    function test_refund_worksWhilePaused() public {
        uint64 dl = _funded();
        vm.prank(admin);
        escrow.pause();
        vm.warp(dl + 1);
        vm.prank(payer);
        escrow.refund(ID); // an exit stays open: pausing can never trap funds
        assertEq(usdc.balanceOf(payer), 100_000e6);
    }

    // ------------------------------------------------------------ fuzz
    function testFuzz_escrowBalanceMatchesOpenTasks(uint128 amount) public {
        amount = uint128(bound(amount, 1, 100_000e6));
        vm.prank(payer);
        escrow.createTask(ID, worker, amount, uint64(block.timestamp + 1 days), keccak256(bytes(URL)), keccak256(bytes(CONDS)), keccak256(bytes(PARAMS)), keccak256(bytes(DATA)));
        vm.prank(payer);
        escrow.fund(ID);
        assertEq(usdc.balanceOf(address(escrow)), amount);
        escrow.settle(ID, _good());
        assertEq(usdc.balanceOf(address(escrow)), 0);
        assertEq(usdc.balanceOf(worker), amount);
    }
}
