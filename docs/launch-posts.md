# Launch posts (drafts)

Rules used: say it is a **testnet beta**; say what is **Simulation**; never say audited (internal review is fine, say so), trustless, bank-grade or regulated; Primus is credited as plain text, with no implied partnership. Replace `<repo-url>` and `<demo-url>` before posting.

## 1. X / Twitter thread (7 posts)

1/ I built ProofPay: an escrow that pays when a verified fact says so, not when someone clicks "approve". Testnet beta, mock USDC, open source. <demo-url>

2/ The problem: paying a person or an AI agent for an outcome ("1,200 conversions", "uptime ≥ 99.9%") usually means invoices, screenshots and trust. Someone decides it is done, and that someone is often the one paying.

3/ How it works: the payer locks mock USDC against a rule. The worker proves the rule with a zkTLS attestation (Proofs by Primus zkTLS). The escrow checks the proof and releases, or tells you exactly which check failed.

4/ Six named checks, same in the app, the API and the contract: signature valid, attestor registered, bound to this task and worker, not replayed, inside the time window, rule satisfied.

5/ Honest scope: Simulation mode uses a local test attestor and is labelled everywhere. The signature, binding and replay checks are real code, but the attestor is not Primus. The Live path is implemented but not yet run against Primus' service.

6/ What a proof does NOT do: it does not make the source truthful. A wrong dashboard gives a valid proof of a wrong number. The Trust Model page says this in plain words.

7/ Built with Next.js, Foundry (34 contract tests), Playwright and axe. Internally reviewed, not independently audited, testnet only. Code: <repo-url>. Feedback welcome, especially from anyone paying agents for outcomes.

## 2. LinkedIn

**Paying for outcomes shouldn't need an approval step.**

I have been building ProofPay, a testnet escrow where funds release when a cryptographic proof shows the agreed outcome happened.

A payer writes a rule ("conversions ≥ 1,200"), locks mock USDC, and the worker, a contractor or an AI agent, proves it with a zkTLS attestation (Proofs by Primus zkTLS). The escrow verifies six things and pays, or says exactly what failed.

What I care about getting right:
• It says what it does not prove: the source can still be wrong.
• Simulation and Live are strictly separated and always labelled.
• Accessibility checked in CI, 34 contract tests, no secrets in the client.

It is a testnet beta, internally reviewed but not independently audited, and the Live path still needs a run against Primus' service. If you pay agents or contractors for measurable results, I would like to hear where this breaks. <demo-url>

## 3. Show HN

**Show HN: ProofPay, an escrow that releases when a zkTLS proof verifies (testnet)**

I wanted to see if "pay on proof" can be made boring and inspectable. A payer locks mock USDC (Base Sepolia, or a no-chain Simulation) against a rule; the worker produces a Primus zkTLS attestation; the escrow checks recipient, URL, condition, task binding, replay, time window and the signature, then pays.

Things I tried to be straight about: Simulation uses a local test attestor; the Live path is typed against SDK 0.3.15 but not run against Primus yet (assumptions are in DECISIONS.md); contracts are unaudited; a proof only shows the source said something, not that it is true.

There is a Proof tools page that verifies any pasted attestation in the browser. Stack: Next.js, SQLite, viem, Foundry. <repo-url>

## 4. Product Hunt tagline and description

Tagline (≤60): *Pay when it's proven. Testnet escrow.*

Description: ProofPay locks mock USDC against a rule and releases it when a zkTLS proof verifies. Inspect every proof in a three-column X-ray, verify attestations in your browser, and export a ledger that reconciles. Testnet beta, open source, unaudited.

## 5. Short post (Persian)

ProofPay رو ساختم: یک escrow تستی که وقتی یک «واقعیت اثبات‌شده» تایید بشه، پول رو آزاد می‌کنه، نه وقتی کسی دکمهٔ تایید رو بزنه. پرداخت‌کننده پول (USDC آزمایشی) رو روی یک قانون قفل می‌کنه، کارگر (آدم یا ایجنت هوش مصنوعی) با اثبات zkTLS قانون رو ثابت می‌کنه (Proofs by Primus zkTLS)، و escrow شش بررسی رو انجام می‌ده.
نسخهٔ بتای تست‌نت، حسابرسی نشده، بدون پول واقعی. حالت Simulation همه‌جا برچسب داره و مسیر Live هنوز با سرویس واقعی Primus امتحان نشده. <demo-url> · <repo-url>

## 6. Alt text for the OG image

"ProofPay: four stacked plates with a single light beam passing through, and the line 'Pay when it's proven.'"
