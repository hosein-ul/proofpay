# Design brief — ProofPay (working title; one config constant)

## What it is
Condition-based escrow on testnet. A payer locks USDC against a condition ("conversions ≥ 120 by Nov 14"); the worker (an AI agent or contractor) proves it with a Primus zkTLS attestation; the escrow checks the attestation and releases. Type (domains.md): **Bank/fintech + developer tool/API + web application**, plus a public marketing site and docs hub. A persuasion surface (site), a tool (app) and a reading surface (docs) under one identity.

## Who, where
Payers: finance leads, growth/marketing leads, agent operators, DeFi grants programmes. Workers: AI agents (via API) and contractors. Auditors: read-only. Desktop-first for the app (dense tables, keyboard), responsive marketing site. They know what escrow and USDC are; they do NOT know zkTLS. They fear paying for something that did not happen, and fear being asked to trust a dashboard screenshot.

## The one job
Understand in five seconds that money is released only when a proof of the outcome verifies — then try a settlement without signing up.

## The specific truth
zkTLS lets a worker prove **one fact about a private page while everything else stays hidden** (selective disclosure: a boolean or threshold, not the data). It proves the source said so, **not** that the source is true or the work was done. That honesty is the product's character. (Assumption marked: Primus attestation fields as in docs/primus-notes.md.)

## Content inventory (only what exists or will really exist)
- Words: headline "Pay when it's proven."; Define → Lock → Prove → Settle; Trust Model (what a proof does / does not guarantee); use cases (agent payouts, performance marketing, contractor milestones, DeFi bounties, vendor SLAs); honest comparison table; FAQ.
- Things to look at: the app itself (Overview, Tasks, Task Builder, Task Detail, Proof Inspector, Ledger, Workers); the attestation structure (recipient, request, responseResolve, data, attConditions, timestamp, additionParams, attestor, signature); the escrow state machine (Draft→Funded→Awaiting proof→Proving→Verified→Settled; Expired→Refunded; Disputed→Resolved); the architecture path (Worker → Source over TLS → Primus attestor → attestation → verifier → escrow → payout).
- Things to do: Request early access; Try a settlement (Simulation); read docs.
- Real facts: Base Sepolia testnet, mock 6-decimal USDC, Primus attestor docs. **No** customers, logos, stats, TVL, testimonials. Demo data is labelled demo.
- Missing, to be produced: brand mark, all imagery (built in code), OG images. No photography needed.

## Flows
1. Visitor: land → see mechanism → try a settlement (Simulation) → request access.
2. Payer: build task (worker → source → condition → amount/deadline → review + Trust Model) → fund → watch proof → settle/refund/dispute.
3. Worker/agent: receive task → generate proof → see verification checklist resolve.
Wrong: proof invalid, attestor unknown, condition not met, expired, network error — each with recovery text.

## The world (nouns)
Receipt, redaction bar, seal, stamp, signature, attestor, attestation, TLS handshake, session, response body, JSON path, threshold, boolean, escrow, vault, deadline, ledger line, double entry, release, refund, arbiter, testnet faucet, hash, nonce, timestamp, beneficiary, checklist.

## Looking around (principles, not looks)
| Studied | Principle extracted | Not taking |
| --- | --- | --- |
| Escrow/milestone sites (search; thin results; docs-led e.g. milestone→verified→release flows) | The category leads with *two-sided anxiety* (payer fears non-delivery, worker fears non-payment) and shows release as a flow | padlock/shield imagery, "secure" copy, generic blue |
| Redaction in art and documents (Holzer *AKA* etchings, declassified pages) | A page can be defined by what is withheld; the one visible line gains force from the black around it | the spy/FOIA aesthetic, stamps like "CLASSIFIED" |
| Exploded-view / patent isometric drawings | Separation of layers explains an assembly; labels with leader lines; hidden structure in dashed line | CAD-cold greyscale, numbered callouts everywhere |
| Blue-and-white porcelain (cobalt under glaze) | One pigment under a clear glaze on a white body; surfaces that feel fired and tactile, pattern as border not fill | chinoiserie, floral pattern, "heritage" kitsch |
| Ledger/receipt print forms (outside category) | Column discipline and tabular figures are themselves identity | warm paper, typewriter nostalgia |

Useful conventions to keep: tables with right-aligned numbers, status chips with icons, hash truncation with copy, a visible environment/mode badge. Empty conventions to break: shield/padlock imagery, dark glowing "web3" hero, three-card feature row, "secure by design" copy.

## Candidate ideas ("this is a Y")
1. The product is a redacted document — only the proven claim is visible (selective disclosure made visual).
2. The settlement is a beam of light passing down an exploded stack of layers (source, TLS, attestor, verifier, escrow).
3. A payment is a sentence you assemble from tactile parts — the condition builder is the hero.
4. The escrow is a vault door that opens only for a key shaped like the claim. (K: metaphor gimmick — rejected.)
5. A ledger that grows a line when proof lands. (data-led, generic — rejected.)
6. A courier handoff with a signature on delivery. (cute, hides the mechanism — rejected.)

Chosen three: **A Redacted** (1), **B Descent** (2), **C Sentence** (3). Brave: **C** (breaks the convention that the hero is a fixed claim: the headline is an editable sentence that drives a live proof). Quiet: **A** (restraint; one signal colour; the redaction bar is the whole asset system).

## Autopilot, named and set aside
Visual: dark near-black ground, cyan/green glow, grid lines, glass cards, floating coins/blockchain cubes (C); or white + indigo gradient + three feature cards (B). Both set aside.
Content: logo row, stats band ("$X settled"), testimonials, pricing tiers, three feature cards. None justified by the inventory.

## Axis table
| Axis | A — Redacted (Clear Day) | B — Descent (Deep Navy) | C — Sentence (Porcelain) |
| --- | --- | --- | --- |
| Idea | the product is a redacted document; only the proven claim shows | settlement is a beam of light descending through exploded layers | a payment is a sentence assembled from tactile parts |
| Temperature and value | cool, high-key white with ink black | cold, low-key deep navy with one warm light | cool-neutral glaze white, mid-high key, soft |
| Colour strategy | monochrome + one signal (marker yellow, used only on the disclosed claim) | tonal navy ramp + one luminous warm-white light | tonal glaze whites + one pigment (underglaze cobalt) |
| Type voice | tight neo-grotesque (Instrument Sans) + document mono (IBM Plex Mono) | extended grotesque (Archivo, wide width for display; tabular figures, no mono face) | geometric-humanist (Red Hat Display + Red Hat Text; tabular figures, no mono face) |
| Density and pace | dense, editorial, hairline-ruled, long narrative | sparse and cinematic up top, dense in the app | balanced, generous, tool-first |
| Geometry and surface | square-eased (2–4px), print flat, hairlines | chamfered slabs, 8/14px, layered lit surfaces | soft 14–28px radii, pill controls, raised glaze |
| Imagery medium | typographic/document artefact (the attestation itself) | isometric exploded stack built as CSS 3D slabs + light | staged tactile UI objects (chips, disc, seal) |
| Layout archetype | marginal/sidenote grid; document centre column | framed stage + pinned stepper | live demo / try-it: composer on a split |
| Motion character + signature | mechanical/stepped; **bars un-redact in steps** | weighty/cinematic; **beam descends through layers** | playful/elastic springs; **chips snap into the sentence, disc drops with settle** |
| Tradition crossed | Swiss × ledger/receipt forms × technical manual | Technical/blueprint × dark premium tech | Soft UI × blue-and-white ceramic |

Pairwise differences: A/B 10, A/C 9, B/C 9 (each ≥ 6).
Hard checks: typefaces differ ✓ · ground values differ (white / navy / glaze-white; A vs C both light: A pure cool white + ink, C tinted glaze with depth, differ in value strategy and surface) ✓ · openings differ ✓ · imagery media differ ✓ · at most one data-led ✓ (none on marketing; Overview mocks are the app) · none matches an attractor (B avoids neon cyan: warm light, wide type, no grid/ticker; A is not cream/serif; C is not beige/purple) ✓ · ledger checked (empty ledger) ✓.

## Assets plan (all in code)
Brand mark (per direction), hero artefact, layered background, 2+ section visuals, one explainer diagram, a staged product mock (Overview), icons (Lucide), OG later. Third-party marks: USDC and Base are named → official marks needed at build time (`@web3icons`), caption "marks belong to their owners; not a partnership"; Primus: text attribution only, no logo. In these mocks: neutral lettered tiles, marked placeholder.

## User constraints that win (explicit in the original brief)
Light-first with a polished dark theme; no cream/serif, no neon/terminal, no purple-pink blobs, no glassmorphism overload, no emoji, no fake social proof, "Simulation" labelled everywhere, "Testnet beta", honest Trust Model. Dark variants are shown for all three.
