# Progress

## Done
- **Phase 0** research and brand: docs/primus-notes.md, DECISIONS.md, docs/copy-options.md; nine brand directions (`.design/`), "Descent" chosen.
- **Phase 1** foundation: tokens, design system, domain model and state machine, SQLite + seed, HTTP API.
- **Phase 2** app (Simulation): overview, task builder, task detail, Proof Inspector, proofs, ledger, workers, settings, command palette, 404/error.
- **Phase 3** website and docs: home with interactive demo, product, use cases, security/Trust Model, developers + API reference, request access, status, changelog, brand, legal templates, `/design`, OG image, sitemap/robots.
- **Phase 4** real integration: `ProofPayEscrow` + 30 Foundry tests, `SignatureVerifier` (test/demo), deploy script, `PrimusProvider` (typed against SDK 0.3.15), signed-request endpoint, demo partner API.
- **Phase 5** QA: lint 0 errors, typecheck clean, 22 unit + 30 contract + 37 Playwright (9 flows + 28 axe) passing; Lighthouse site 96–97 / a11y 100 / BP 100 / SEO 100, app 94–95 (production build); README with screenshots.

- **Round 2**: dashboard redesign (hero band, icon KPIs, pipeline, top workers), Proof tools page, in-browser Primus flow on Live tasks, Live readiness checklist, demo key moved out of the client bundle.

## Known gaps
- Live end-to-end not run against Primus (no credentials/template): see DECISIONS D6.
- 22 lint warnings remain (React-compiler rules, deliberate patterns, see eslint.config.mjs).
- Request-access admin list is API-only (`/api/admin/access-requests`, Bearer `ADMIN_TOKEN`).
