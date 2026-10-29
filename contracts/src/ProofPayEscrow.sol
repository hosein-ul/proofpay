// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPrimusZKTLS, Attestation} from "./interfaces/IPrimusZKTLS.sol";

/// @title ProofPayEscrow
/// @notice TESTNET ONLY. Unaudited. Locks ERC-20 funds against a condition and releases them when a Primus zkTLS
///         attestation, checked by an on-chain verifier, proves the condition for the named beneficiary.
/// @dev What the escrow enforces itself (the Primus verifier only checks the signature, see docs/primus-notes.md §2):
///      binding (recipient, request URL, condition, additionParams, disclosed data), replay, time window, deadline.
contract ProofPayEscrow is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State { None, Draft, Funded, Settled, Refunded, Disputed, Resolved }

    struct Task {
        address payer;
        address beneficiary;
        uint128 amount;
        uint64 deadline;
        uint64 fundedAt;
        State state;
        bytes32 urlHash; // keccak256(bytes(request.url))
        bytes32 conditionsHash; // keccak256(bytes(attConditions))
        bytes32 additionParamsHash; // keccak256(bytes(additionParams))
        bytes32 dataHash; // keccak256(bytes(data)) the verifier must see, e.g. {"conversions":"true"}
    }

    IERC20 public immutable token;
    IPrimusZKTLS public verifier;
    address public arbiter;
    /// Attestations may be at most this far in the future (clock skew) and must not predate funding.
    uint64 public constant MAX_SKEW = 5 minutes;

    mapping(bytes32 => Task) public tasks;
    mapping(bytes32 => bool) public consumed; // attestation digests already used

    event TaskCreated(bytes32 indexed id, address indexed payer, address indexed beneficiary, uint256 amount, uint64 deadline);
    event TaskFunded(bytes32 indexed id, uint256 amount);
    event TaskSettled(bytes32 indexed id, address indexed beneficiary, uint256 amount, bytes32 attestationDigest);
    event TaskRefunded(bytes32 indexed id, address indexed payer, uint256 amount);
    event TaskDisputed(bytes32 indexed id, address indexed by);
    event TaskResolved(bytes32 indexed id, bool released);
    event VerifierChanged(address verifier);
    event ArbiterChanged(address arbiter);

    error BadState(State have);
    error NotPayer();
    error NotArbiter();
    error NotParty();
    error ZeroValue();
    error BadDeadline();
    error TaskExists();
    error DeadlinePassed();
    error DeadlineNotPassed();
    error WrongBeneficiary();
    error NotBound(string field);
    error Replayed();
    error OutsideWindow();

    constructor(IERC20 token_, IPrimusZKTLS verifier_, address arbiter_, address owner_) Ownable(owner_) {
        token = token_;
        verifier = verifier_;
        arbiter = arbiter_;
    }

    // ---------------------------------------------------------------- admin
    function setVerifier(IPrimusZKTLS v) external onlyOwner { verifier = v; emit VerifierChanged(address(v)); }
    function setArbiter(address a) external onlyOwner { arbiter = a; emit ArbiterChanged(a); }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ---------------------------------------------------------------- lifecycle
    function createTask(
        bytes32 id,
        address beneficiary,
        uint128 amount,
        uint64 deadline,
        bytes32 urlHash,
        bytes32 conditionsHash,
        bytes32 additionParamsHash,
        bytes32 dataHash
    ) external whenNotPaused {
        if (tasks[id].state != State.None) revert TaskExists();
        if (amount == 0 || beneficiary == address(0)) revert ZeroValue();
        if (deadline <= block.timestamp) revert BadDeadline();
        tasks[id] = Task(msg.sender, beneficiary, amount, deadline, 0, State.Draft, urlHash, conditionsHash, additionParamsHash, dataHash);
        emit TaskCreated(id, msg.sender, beneficiary, amount, deadline);
    }

    function fund(bytes32 id) external nonReentrant whenNotPaused {
        Task storage t = tasks[id];
        if (t.state != State.Draft) revert BadState(t.state);
        if (msg.sender != t.payer) revert NotPayer();
        if (t.deadline <= block.timestamp) revert DeadlinePassed();
        t.state = State.Funded;
        t.fundedAt = uint64(block.timestamp);
        token.safeTransferFrom(msg.sender, address(this), t.amount);
        emit TaskFunded(id, t.amount);
    }

    /// @notice Anyone may submit the proof; funds always go to the task's beneficiary.
    function settle(bytes32 id, Attestation calldata att) external nonReentrant whenNotPaused {
        Task storage t = tasks[id];
        if (t.state != State.Funded) revert BadState(t.state);
        if (block.timestamp > t.deadline) revert DeadlinePassed();

        if (att.recipient != t.beneficiary) revert WrongBeneficiary();
        if (keccak256(bytes(att.request.url)) != t.urlHash) revert NotBound("url");
        if (keccak256(bytes(att.attConditions)) != t.conditionsHash) revert NotBound("conditions");
        if (keccak256(bytes(att.additionParams)) != t.additionParamsHash) revert NotBound("additionParams");
        if (keccak256(bytes(att.data)) != t.dataHash) revert NotBound("data");
        // The SDK typings do not state the timestamp unit (DECISIONS D6). Anything above 1e12 is milliseconds.
        uint64 ts = att.timestamp > 1e12 ? att.timestamp / 1000 : att.timestamp;
        if (ts < t.fundedAt || ts > block.timestamp + MAX_SKEW) revert OutsideWindow();

        bytes32 digest = keccak256(abi.encode(att.recipient, att.timestamp, att.data, att.attConditions, att.additionParams, att.signatures));
        if (consumed[digest]) revert Replayed();
        consumed[digest] = true;

        verifier.verifyAttestation(att); // reverts on an invalid or unregistered signature

        t.state = State.Settled;
        token.safeTransfer(t.beneficiary, t.amount);
        emit TaskSettled(id, t.beneficiary, t.amount, digest);
    }

    /// @notice After the deadline an unproven task can be refunded to the payer, by the payer.
    function refund(bytes32 id) external nonReentrant {
        Task storage t = tasks[id];
        if (t.state != State.Funded) revert BadState(t.state);
        if (msg.sender != t.payer) revert NotPayer();
        if (block.timestamp <= t.deadline) revert DeadlineNotPassed();
        t.state = State.Refunded;
        token.safeTransfer(t.payer, t.amount);
        emit TaskRefunded(id, t.payer, t.amount);
    }

    function dispute(bytes32 id) external whenNotPaused {
        Task storage t = tasks[id];
        if (t.state != State.Funded) revert BadState(t.state);
        if (msg.sender != t.payer && msg.sender != t.beneficiary) revert NotParty();
        t.state = State.Disputed;
        emit TaskDisputed(id, msg.sender);
    }

    /// @notice The arbiter decides a dispute. This is an explicit trust assumption (docs: Security page).
    function resolve(bytes32 id, bool release) external nonReentrant {
        if (msg.sender != arbiter) revert NotArbiter();
        Task storage t = tasks[id];
        if (t.state != State.Disputed) revert BadState(t.state);
        t.state = State.Resolved;
        token.safeTransfer(release ? t.beneficiary : t.payer, t.amount);
        emit TaskResolved(id, release);
    }
}
