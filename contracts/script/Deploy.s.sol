// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ProofPayEscrow} from "../src/ProofPayEscrow.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {IPrimusZKTLS} from "../src/interfaces/IPrimusZKTLS.sol";

/// Base Sepolia (84532) only. Reads PRIVATE_KEY from the environment of the machine you run it on.
/// Never commit it, never paste it in chat. Use a throwaway testnet key.
///   PRIMUS_VERIFIER  address of Primus' verifier proxy (re-check it in Primus' docs first; see docs/primus-notes.md §4)
///   ARBITER          address that can resolve disputes (defaults to the deployer)
///   USDC             optional existing ERC-20; otherwise a MockUSDC is deployed
contract Deploy is Script {
    function run() external {
        require(block.chainid == 84532, "Base Sepolia only");
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address verifier = vm.envAddress("PRIMUS_VERIFIER");
        address arbiter = vm.envOr("ARBITER", deployer);
        address usdc = vm.envOr("USDC", address(0));

        vm.startBroadcast(pk);
        if (usdc == address(0)) usdc = address(new MockUSDC());
        ProofPayEscrow escrow = new ProofPayEscrow(MockUSDC(usdc), IPrimusZKTLS(verifier), arbiter, deployer);
        vm.stopBroadcast();

        console.log("USDC (mock) :", usdc);
        console.log("Escrow      :", address(escrow));
        console.log("Verifier    :", verifier);
    }
}
