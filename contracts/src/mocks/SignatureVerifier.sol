// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPrimusZKTLS, Attestation} from "../interfaces/IPrimusZKTLS.sol";

/// Re-implements the checks documented for Primus' verifier (single 65-byte signature, packed digest, ecrecover on the
/// raw digest, recovered address must be registered) against a local attestor list. TEST AND DEMO USE ONLY: it lets the
/// escrow tests run with real signatures without the Primus network. Production points the escrow at Primus' verifier.
contract SignatureVerifier is IPrimusZKTLS {
    mapping(address => bool) public registered;

    constructor(address attestor) { registered[attestor] = true; }

    function digestOf(Attestation calldata a) public pure returns (bytes32) {
        bytes memory req = abi.encodePacked(a.request.url, a.request.header, a.request.method, a.request.body);
        bytes memory resp;
        for (uint256 i; i < a.reponseResolve.length; i++) {
            resp = abi.encodePacked(resp, a.reponseResolve[i].keyName, a.reponseResolve[i].parseType, a.reponseResolve[i].parsePath);
        }
        return keccak256(abi.encodePacked(a.recipient, keccak256(req), keccak256(resp), a.data, a.attConditions, a.timestamp, a.additionParams));
    }

    function verifyAttestation(Attestation calldata a) external view {
        require(a.signatures.length == 1, "one signature");
        bytes calldata sig = a.signatures[0];
        require(sig.length == 65, "bad length");
        bytes32 r = bytes32(sig[0:32]);
        bytes32 s = bytes32(sig[32:64]);
        uint8 v = uint8(sig[64]);
        if (v < 27) v += 27;
        address signer = ecrecover(digestOf(a), v, r, s);
        require(signer != address(0) && registered[signer], "attestor not registered");
    }
}
