// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Mirrors the structs and the view function documented in docs/primus-notes.md §2
/// (source: primus-labs/zktls-contracts). The field name `reponseResolve` is spelled as upstream spells it.
/// Re-check against the deployed verifier before using it with a real address.
struct Attestor {
    address attestorAddr;
    string url;
}

struct AttNetworkRequest {
    string url;
    string header;
    string method;
    string body;
}

struct AttNetworkResponseResolve {
    string keyName;
    string parseType;
    string parsePath;
}

struct Attestation {
    address recipient;
    AttNetworkRequest request;
    AttNetworkResponseResolve[] reponseResolve;
    string data;
    string attConditions;
    uint64 timestamp;
    string additionParams;
    Attestor[] attestors;
    bytes[] signatures;
}

interface IPrimusZKTLS {
    /// Reverts when the attestation is not signed by a registered attestor. Does not check expiry, replay or binding.
    function verifyAttestation(Attestation calldata attestation) external view;
}
