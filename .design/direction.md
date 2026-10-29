---
project: ProofPay
mode: studio
direction: Descent (B), light-first
chosen: 2026-10-29 by user from B (light variant shown in their screenshot)
status: locked
---

# Direction — Descent

## Concept
A settlement is a beam of warm light descending through an exploded stack of layers (worker, source over TLS, attestor, verifier, escrow). The product makes that mechanism visible everywhere: plates, one beam, lit states.

## Position
Cool, high-key light ground with deep-navy ink (dark theme is a designed equal) · layered surfaces with a warm amber light as the single signal · dense and exact in the app, cinematic and spacious on the site · extended grotesque display, plain grotesque UI · eased 8/14/22 radii, chamfered plates · tonal navy ramp + one light · computed exploded stack, light field backgrounds, real product UI · weighty, cinematic, 200 ms feedback · framed stage hero, then alternating light/ink bands.

## Colour (hex, contrast measured against `ground` unless noted)
| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| ground | `#EDF1F8` | `#0A1326` | page |
| ground-raised | `#FFFFFF` | `#0F1A33` | cards, panels |
| ground-sunk | `#E3E9F4` | `#070E1E` | wells, inputs, table heads |
| ground-lift | `#F6F8FC` | `#13223F` | hover, selected rows |
| line / line-strong | navy 11% / 22% | blue-white 11% / 20% | borders (alpha, never solid grey) |
| text | `#0A1530` (15.8:1) | `#EBF0FF` (15.2:1) | body, headings |
| text-2 | `#41506E` (7.4:1) | `#A2B2D4` (8.4:1) | secondary |
| text-3 | `#76839E` (3.7:1) | `#6A7DA6` (4.2:1) | hints, large only |
| light (fill) | `#E39A16` | `#FFE3A6` | beam, key action fill, lit edges |
| light-text | `#8F5200` (6.1:1 on white) | `#FFE3A6` | amber text on surfaces |
| on-light | `#1B1405` | `#1B1405` | text on light fill (10:1+) |
| ok / warn / bad / info | `#0E7F59` `#9A5B05` `#B8362D` `#2D56C9` | `#5FE1B0` `#F7BC5E` `#FF8F86` `#86A9FF` | state only, always with an icon or text |

Strategy: tonal navy + one warm light. The light appears on at most three things per screen: the primary action, the current/lit element, the key figure. Green/red/blue are states, never decoration.

## Type
Families: **Archivo** (variable, wdth 62–125) for display and UI; **JetBrains Mono** only for hashes, addresses, code and shortcuts. Source: Google Fonts via `next/font`, self-hosted, `display: swap`.

| Level | Size | Line-height | Tracking | Weight/width | Notes |
| --- | --- | --- | --- | --- | --- |
| display | clamp(44, 6.4vw, 96) | 0.98 | −0.045em | 560 / wdth 122 | balance; site only |
| h1 | clamp(34, 4vw, 56) | 1.02 | −0.04em | 560 / wdth 118 | |
| h2 | clamp(28, 3.4vw, 44) | 1.06 | −0.035em | 560 / wdth 114 | |
| h3 | 20–24 | 1.15 | −0.025em | 600 / wdth 108 | |
| body-lg | 18 | 1.55 | 0 | 400 | |
| body | 15 (app 13.5) | 1.5 | 0 | 400 | |
| small | 12.5 | 1.4 | 0 | 500 | |
| label | 12 | 1.2 | +0.01em | 500 | sentence case, no tracked caps |
| numeric | any | — | −0.02em | 560, tabular-nums | decimals dimmed with text-3, unit smaller |

## Space and grid
4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. 12 columns, max width 1240 (site) / fluid (app), gutters 24, margins 20 (mobile) to 32. Section rhythm on the site is uneven: 128, 96, 160, 112. The app is dense: rows 40 (comfortable) / 32 (compact).

## Shape
Radius: 6 (chips, inputs inside rows), 8 (controls), 14 (panels), 22 (stage, window). Concentric. Borders: alpha hairlines. Elevation: 3 steps: `rest` (hairline + inner top highlight), `raised` (layered shadow), `float` (overlays). Texture: grain at 5% over atmosphere only; one dot grid used for stages and empty states.

## Signature device
**The beam** (a vertical warm-light line with a travelling packet) and **the plate** (a dimetric slab with a lit edge). Must appear in: the hero stage, the Proof Inspector verification, empty states and loaders (a packet descending a short stack). Never: as decoration behind body text, in tables, or more than once per viewport.

## Visual asset system
Medium: computed dimetric plates (SVG, projection kx 0.9 / ky 0.34), light fields (radial warm gradient + dot grid + grain), and real product UI built from the real components. Real marks via maintained packages (USDC, Base, Ethereum from `@web3icons/react`; source brands from `simple-icons`) wrapped once in `<TokenIcon>`, `<ChainIcon>`, `<BrandMark>`; every wall carries "marks belong to their owners; compatibility, not partnership". Primus: text attribution only (`Proofs by Primus zkTLS`), no logo.
Backgrounds, one per section family: (1) hero *atmosphere*: warm top light + faint plates in perspective; (2) *floor grid*: ruled dimetric floor fading out; (3) *ink band*: deep navy with dot grid and one lit plate edge; (4) *contour*: low-contrast topographic lines for docs; (5) *paper*: plain ground for tables. Mobile: stack becomes a cropped viewBox; light fields stay, plates simplify.

## Motion
Character: weighty and cinematic; the beam is the only thing allowed to be slow. Tokens: 90/160/240/400/700 ms; ease-out `cubic-bezier(.16,1,.3,1)`; snap `cubic-bezier(.2,0,0,1)`. Signature moment (hero, 6 beats): packet leaves worker → source lights → attestor seal rings → verifier squares tick one by one → escrow plate lights → "Released 2,500.00 USDC" with a settled chip. Ambient: none except the packet (loops with a 3.6 s rest, pauses off-screen). Scroll: three moments only (stack explode on enter, architecture beam follows scroll, comparison rows reveal). Never animates: table rows, numbers in the ledger, anything in forms.

## Components
Nav: sticky, 64 px, blur only when stuck, hairline. Buttons: 40/34, 8 radius; primary is light fill with inner highlight, secondary is raised with hairline; hover moves border toward light; press 1 px. Inputs: sunk well, hairline, focus ring 2 px light + 4 px quiet. Panels: raised with inner top highlight. Tables: sticky head, right-aligned numerals, hover lift, 40/32. Status: chip with dot + text. Overlays: scale from origin 160 ms. Empty: dot-grid stage with a short plate stack and one clear action. Footer: ink band.

## Voice
Plain, specific, calm. "Funds release when the proof verifies." / "Proof failed: the source returned 96, the rule needs 120." / "Simulation: this proof is synthetic." Never: trustless, bank-grade, audited, seamless, supercharge, unlock.

## Never in this project
- Dark neon + grid + glow terminal; purple-to-pink gradients; glass cards on everything; floating coins or blockchain cubes.
- Cream paper + serif; warm beige.
- Three identical feature cards; invented logos, customers, figures, testimonials.
- Gold on gold (light text on light fills); light used on more than three things per screen.

## Files
Tokens: `src/styles/tokens.css`. Plate/beam assets: `src/components/brand/`. Directions archive: `.design/directions/` (A–I; B chosen).
