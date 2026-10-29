// Generates the three Phase 0 brand direction pages. Run: node docs/brand-directions/build.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = dirname(fileURLToPath(import.meta.url));
const NAME = 'ProofPay';

const directions = [
  {
    slug: 'clear-day',
    title: 'Clear Day',
    blurb: 'Bright white, cool grey, crisp hairlines, one confident blue. Stripe/Mercury energy.',
    fonts: 'Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500',
    sans: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
    type: 'Inter (UI + display, tight tracking at size) / JetBrains Mono',
    motion: 'Quick and exact. 140ms ease-out on UI, 600ms staged hero. Numbers count up once.',
    imagery: 'Hairline diagrams, real product UI at high fidelity, a faint cool gradient wash behind the hero. No illustration.',
    logo: `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="8" fill="var(--accent)"/><path d="M9 16.5l4.6 4.6L23 11.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    wordStyle: 'font-weight:650;letter-spacing:-.03em',
    light: { bg: '#F6F7F9', surface: '#FFFFFF', raised: '#FFFFFF', sunken: '#EEF0F4', line: '#E4E7EC', text: '#0B1220', text2: '#4A5568', text3: '#7A8497', accent: '#2557F6', accentSoft: '#E8EEFF', accentInk: '#FFFFFF', ok: '#12805C', okSoft: '#E3F5EE', warn: '#A15C07', warnSoft: '#FDF1DC', bad: '#C2362B', badSoft: '#FCE8E6', info: '#0B7A9B', infoSoft: '#E1F3F9', shadow: '0 1px 2px rgba(11,18,32,.04), 0 8px 24px -8px rgba(11,18,32,.08)', radius: '8px', radiusL: '12px', heroGlow: 'radial-gradient(60% 60% at 80% 0%, rgba(37,87,246,.10), transparent 70%), radial-gradient(50% 50% at 0% 0%, rgba(11,122,155,.07), transparent 70%)' },
    dark: { bg: '#07090D', surface: '#0C1017', raised: '#121824', sunken: '#05070A', line: 'rgba(255,255,255,.07)', text: '#E8ECF4', text2: '#9AA4B5', text3: '#647086', accent: '#5B86FF', accentSoft: 'rgba(91,134,255,.14)', accentInk: '#06102B', ok: '#3DD6A0', okSoft: 'rgba(61,214,160,.12)', warn: '#F2B24A', warnSoft: 'rgba(242,178,74,.12)', bad: '#FF7A70', badSoft: 'rgba(255,122,112,.12)', info: '#4CC9EE', infoSoft: 'rgba(76,201,238,.12)', shadow: '0 0 0 1px rgba(255,255,255,.05), 0 20px 40px -20px rgba(0,0,0,.7)', radius: '8px', radiusL: '12px', heroGlow: 'radial-gradient(60% 60% at 80% 0%, rgba(91,134,255,.14), transparent 70%)' },
    css: `
      .hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:56px;align-items:center;padding:72px 0 56px}
      .hero h1{font-size:clamp(40px,5.4vw,72px);line-height:1.02;letter-spacing:-.045em;font-weight:650;margin:16px 0 20px}
      .preview{border:1px solid var(--line);border-radius:var(--radiusL);background:var(--surface);box-shadow:var(--shadow);margin-right:0}
      .app{border-radius:var(--radiusL)}
      .step{border-top:1px solid var(--line);padding-top:18px}
      @media(max-width:900px){.hero{grid-template-columns:1fr}.preview{margin-right:0}}
    `,
  },
  {
    slug: 'deep-navy',
    title: 'Deep Navy Premium',
    blurb: 'Rich deep navy with a luminous cyan accent, layered depth, restrained glow. Calm and immersive, not a terminal.',
    fonts: 'Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500',
    sans: "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace",
    type: 'Geist (UI + display) / Geist Mono',
    motion: 'Slower and softer: 200–240ms UI, light that follows the cursor, 900ms hero choreography.',
    imagery: 'Layered panels over a deep gradient field, a single luminous arc that traces the proof path. Light, not decoration.',
    logo: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="none" stroke="var(--line-strong)" stroke-width="3"/><path d="M16 4a12 12 0 0 1 11.4 8.3" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="16" r="4" fill="var(--accent)"/></svg>`,
    wordStyle: 'font-weight:600;letter-spacing:-.025em',
    light: { bg: '#EDF1F8', surface: '#FFFFFF', raised: '#FFFFFF', sunken: '#E2E8F3', line: '#D8DFEC', text: '#0A1530', text2: '#44506B', text3: '#78839C', accent: '#0A84C6', accentSoft: '#DDF0FA', accentInk: '#FFFFFF', ok: '#0E8A63', okSoft: '#DEF4EA', warn: '#A25E08', warnSoft: '#FBEFD6', bad: '#C23B30', badSoft: '#FBE6E3', info: '#0A84C6', infoSoft: '#DDF0FA', shadow: '0 1px 2px rgba(10,21,48,.05), 0 16px 40px -12px rgba(10,21,48,.14)', radius: '8px', radiusL: '14px', heroGlow: 'radial-gradient(70% 70% at 50% 0%, rgba(10,132,198,.16), transparent 70%)' },
    dark: { bg: '#0A1224', surface: '#0F1A33', raised: '#15223F', sunken: '#070D1C', line: 'rgba(160,190,255,.10)', text: '#EAF0FF', text2: '#A3B1D1', text3: '#6B7BA0', accent: '#5CE1FF', accentSoft: 'rgba(92,225,255,.12)', accentInk: '#04202B', ok: '#52E0A8', okSoft: 'rgba(82,224,168,.12)', warn: '#FFC468', warnSoft: 'rgba(255,196,104,.12)', bad: '#FF8A80', badSoft: 'rgba(255,138,128,.12)', info: '#5CE1FF', infoSoft: 'rgba(92,225,255,.12)', shadow: '0 0 0 1px rgba(160,190,255,.08), 0 30px 60px -24px rgba(0,0,0,.65), 0 0 80px -30px rgba(92,225,255,.35)', radius: '8px', radiusL: '14px', heroGlow: 'radial-gradient(60% 55% at 50% 0%, rgba(92,225,255,.18), transparent 70%), radial-gradient(40% 40% at 90% 30%, rgba(80,110,255,.18), transparent 70%)' },
    css: `
      .hero{display:grid;gap:44px;justify-items:center;text-align:center;padding:84px 0 40px}
      .hero h1{font-size:clamp(40px,6vw,84px);line-height:1;letter-spacing:-.05em;font-weight:600;margin:16px 0 20px;max-width:14ch}
      .hero p.sub{margin-inline:auto}
      .cta{justify-content:center}
      .preview{width:min(1040px,100%);border:1px solid var(--line);border-radius:var(--radiusL);background:linear-gradient(180deg,var(--raised),var(--surface));box-shadow:var(--shadow);text-align:left;position:relative}
      .preview::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(180deg,rgba(255,255,255,.18),transparent 40%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
      .step{background:linear-gradient(180deg,var(--raised),var(--surface));border:1px solid var(--line);border-radius:var(--radiusL);padding:20px}
      .kpi{background:var(--surface)}
    `,
  },
  {
    slug: 'porcelain',
    title: 'Porcelain',
    blurb: 'Soft cool-white with tactile depth, soft shadows, translucent layers. Modern editorial, sans-serif only.',
    fonts: 'Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500',
    sans: "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",
    type: 'Plus Jakarta Sans (UI + display, heavy display weight) / IBM Plex Mono',
    motion: 'Springy and tactile: 180ms with slight overshoot on press, surfaces that lift on hover.',
    imagery: 'Stacked translucent sheets with soft shadows, rounded forms, pill-shaped data marks. Objects with weight.',
    logo: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="9" fill="var(--accent)" opacity=".92"/><circle cx="20" cy="16" r="9" fill="var(--accent2)" opacity=".85" /></svg>`,
    wordStyle: 'font-weight:800;letter-spacing:-.04em',
    light: { bg: '#EBEFF4', surface: '#F7F9FC', raised: '#FFFFFF', sunken: '#E1E6ED', line: '#DAE0E8', text: '#141B27', text2: '#4B5668', text3: '#7C8799', accent: '#1F6F8B', accent2: '#7BB6C9', accentSoft: '#DCEDF3', accentInk: '#FFFFFF', ok: '#26805F', okSoft: '#DDF1E8', warn: '#9C6209', warnSoft: '#F8EBD3', bad: '#B8403A', badSoft: '#F7E3E1', info: '#1F6F8B', infoSoft: '#DCEDF3', shadow: '0 1px 0 rgba(255,255,255,.9) inset, 0 2px 4px rgba(20,27,39,.05), 0 20px 40px -16px rgba(20,27,39,.16)', radius: '12px', radiusL: '20px', heroGlow: 'radial-gradient(50% 60% at 15% 10%, rgba(123,182,201,.35), transparent 70%), radial-gradient(40% 50% at 90% 20%, rgba(255,255,255,.9), transparent 70%)' },
    dark: { bg: '#10151D', surface: '#161C26', raised: '#1D2430', sunken: '#0C1017', line: 'rgba(255,255,255,.07)', text: '#E9EDF3', text2: '#A0AABB', text3: '#6C7789', accent: '#7BC4DA', accent2: '#3D8FA9', accentSoft: 'rgba(123,196,218,.13)', accentInk: '#08222B', ok: '#6FD3A8', okSoft: 'rgba(111,211,168,.12)', warn: '#EDBE6A', warnSoft: 'rgba(237,190,106,.12)', bad: '#F59088', badSoft: 'rgba(245,144,136,.12)', info: '#7BC4DA', infoSoft: 'rgba(123,196,218,.13)', shadow: '0 1px 0 rgba(255,255,255,.06) inset, 0 24px 48px -20px rgba(0,0,0,.6)', radius: '12px', radiusL: '20px', heroGlow: 'radial-gradient(50% 60% at 15% 10%, rgba(123,196,218,.14), transparent 70%)' },
    css: `
      .hero{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:48px;align-items:center;padding:72px 0 56px}
      .hero h1{font-size:clamp(38px,5vw,66px);line-height:1.04;letter-spacing:-.035em;font-weight:800;margin:16px 0 20px}
      section.how h2{letter-spacing:-.03em}
      .kpis{grid-template-columns:repeat(2,1fr)}.panels{grid-template-columns:1fr}.app{grid-template-columns:150px 1fr}
      .hero{grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr)}
      .eyebrow{border-radius:999px;background:var(--raised);box-shadow:var(--shadow);padding:6px 12px}
      .btn{border-radius:999px}
      .preview{position:relative;padding:14px;border-radius:var(--radiusL);background:color-mix(in srgb,var(--raised) 70%,transparent);backdrop-filter:blur(14px);box-shadow:var(--shadow);border:1px solid color-mix(in srgb,var(--line) 70%,#fff 30%)}
      .app{border-radius:calc(var(--radiusL) - 6px);box-shadow:var(--shadow)}
      .kpi,.step,.feed{border:0!important;box-shadow:var(--shadow);border-radius:var(--radius)}
      .chip{border-radius:999px}
      @media(max-width:900px){.hero{grid-template-columns:1fr}}
    `,
  },
];

const tokenBlock = (t) =>
  Object.entries({
    bg: t.bg, surface: t.surface, raised: t.raised, sunken: t.sunken, line: t.line,
    text: t.text, 'text-2': t.text2, 'text-3': t.text3,
    accent: t.accent, 'accent-2': t.accent2 ?? t.accent, 'accent-soft': t.accentSoft, 'accent-ink': t.accentInk,
    ok: t.ok, 'ok-soft': t.okSoft, warn: t.warn, 'warn-soft': t.warnSoft, bad: t.bad, 'bad-soft': t.badSoft,
    info: t.info, 'info-soft': t.infoSoft, shadow: t.shadow, radius: t.radius, 'radius-l': t.radiusL, 'hero-glow': t.heroGlow,
    'line-strong': t.line,
  }).map(([k, v]) => `--${k}:${v}`).join(';');

const page = (d) => `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${d.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${d.fonts}&display=swap" rel="stylesheet">
<style>
:root{${tokenBlock(d.light)};--sans:${d.sans};--mono:${d.mono}}
:root[data-theme="dark"]{${tokenBlock(d.dark)}}
*{box-sizing:border-box}
a{color:inherit;text-decoration:none}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:400 15px/1.5 var(--sans);font-feature-settings:"tnum" 1,"cv11" 1;-webkit-font-smoothing:antialiased}
.wrap{max-width:1200px;margin:0 auto;padding:0 24px}
.glow{position:absolute;inset:0 0 auto 0;height:720px;background:var(--hero-glow);pointer-events:none;z-index:0}
header.nav{position:relative;z-index:2;display:flex;align-items:center;gap:28px;height:64px}
.brand{display:flex;align-items:center;gap:10px;font-size:18px;${d.wordStyle}}
.brand svg{width:26px;height:26px}
nav.links{display:flex;gap:22px;color:var(--text-2);font-size:14px;margin-left:12px}
.sp{flex:1}
.btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:var(--radius);font:500 14px var(--sans);border:1px solid var(--line);background:var(--raised);color:var(--text);cursor:pointer;transition:transform .14s,box-shadow .14s,background .14s}
.btn:hover{transform:translateY(-1px)}
.btn:focus-visible,.seg button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.btn.primary{background:var(--accent);color:var(--accent-ink);border-color:transparent}
.brand{color:var(--text)}
.btn.sm{height:32px;padding:0 12px;font-size:13px}
.eyebrow{display:inline-flex;gap:8px;align-items:center;font-size:12px;color:var(--text-2);font-weight:500;letter-spacing:.01em}
.dot{width:6px;height:6px;border-radius:50%;background:var(--warn)}
.sub{font-size:18px;line-height:1.5;color:var(--text-2);max-width:46ch;margin:0 0 28px}
.cta{display:flex;gap:12px;flex-wrap:wrap}
.mono{font-family:var(--mono);font-size:.92em}
.num{font-variant-numeric:tabular-nums}
.chip{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px;border-radius:6px;font-size:12px;font-weight:500;white-space:nowrap}
.chip i{width:6px;height:6px;border-radius:50%;background:currentColor}
.c-ok{color:var(--ok);background:var(--ok-soft)}.c-warn{color:var(--warn);background:var(--warn-soft)}.c-bad{color:var(--bad);background:var(--bad-soft)}.c-info{color:var(--info);background:var(--info-soft)}.c-sim{color:var(--text-2);background:var(--sunken);border:1px dashed var(--text-3)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:var(--radius);padding:2px;background:var(--sunken)}
.seg button{border:0;background:none;color:var(--text-2);font:500 12px var(--sans);padding:5px 10px;border-radius:calc(var(--radius) - 2px);cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--raised);color:var(--text);box-shadow:var(--shadow)}
/* app mock */
.app{display:grid;grid-template-columns:184px 1fr;background:var(--bg);border:1px solid var(--line);overflow:hidden;font-size:13px}
.side{background:var(--surface);border-right:1px solid var(--line);padding:14px 10px;display:flex;flex-direction:column;gap:2px}
.side .brand{font-size:15px;padding:4px 8px 14px}.side .brand svg{width:20px;height:20px}
.side a{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:var(--radius);color:var(--text-2)}
.side a.on{background:var(--accent-soft);color:var(--text);font-weight:500}
.side a b{width:14px;height:14px;border-radius:4px;border:1.5px solid currentColor;opacity:.7}
.main{padding:16px;min-width:0}
.top{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.top h2{margin:0;font-size:16px;letter-spacing:-.02em;font-weight:600}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
.kpi{border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);padding:12px}
.kpi small{color:var(--text-3);font-size:11.5px}
.kpi strong{display:block;font-size:20px;letter-spacing:-.03em;font-weight:600;margin:2px 0}
.kpi span.d{font-size:11.5px;color:var(--ok)}
.kpi svg{width:100%;height:26px;margin-top:6px}
.panels{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:10px}
.panel{border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);padding:12px;min-width:0}
.panel h3{margin:0 0 8px;font-size:12.5px;font-weight:600;display:flex;justify-content:space-between;align-items:center}
.chart{width:100%;height:150px;display:block}
.feed{display:grid;gap:0}
.feed div>span:nth-child(2){min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.feed div{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid var(--line)}
.feed div:first-child{border-top:0}
.feed .t{color:var(--text-3);margin-left:auto;font-size:11.5px}
.check li{display:flex;gap:8px;align-items:center;padding:3px 0;color:var(--text-2);list-style:none}
.check{margin:0;padding:0}
.ck{width:14px;height:14px;border-radius:50%;background:var(--ok);display:grid;place-items:center;color:#fff;font-size:9px}
/* section */
section.how{padding:56px 0 80px}
section.how h2{font-size:clamp(28px,3.4vw,44px);letter-spacing:-.04em;line-height:1.05;margin:0 0 36px;max-width:20ch;font-weight:650}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.step h4{margin:14px 0 6px;font-size:16px;letter-spacing:-.02em}.step p{margin:0;color:var(--text-2);font-size:14px}
.step svg{width:100%;height:84px}
.n{font:500 12px var(--mono);color:var(--text-3)}
.spec{padding:56px 0;border-top:1px solid var(--line)}
.spec dl{display:grid;grid-template-columns:140px 1fr;gap:10px 24px;margin:0;color:var(--text-2)}
.spec dt{color:var(--text-3);font-size:12px;text-transform:uppercase;letter-spacing:.06em;padding-top:2px}
.sw{display:flex;gap:6px;flex-wrap:wrap}.sw i{width:56px;height:36px;border-radius:6px;border:1px solid var(--line);display:block;font:500 9px var(--mono);font-style:normal;padding:3px 4px;color:var(--text-2)}
.bar{position:fixed;right:16px;bottom:16px;z-index:9;display:flex;gap:8px;align-items:center;background:var(--raised);border:1px solid var(--line);border-radius:999px;padding:6px 8px 6px 14px;box-shadow:var(--shadow);font-size:12px;color:var(--text-2)}
@media(max-width:900px){.steps,.kpis{grid-template-columns:repeat(2,1fr)}.panels{grid-template-columns:1fr}.app{grid-template-columns:1fr}.side{display:none}nav.links{display:none}}
@media(max-width:520px){.steps,.kpis{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
${d.css}
</style>
</head>
<body>
<div class="glow"></div>
<div class="wrap">
  <header class="nav">
    <a class="brand" href="#">${d.logo}<span>${NAME}</span></a>
    <nav class="links"><span>Product</span><span>Use cases</span><span>Security</span><span>Developers</span></nav>
    <div class="sp"></div>
    <a class="btn sm primary" href="#">Request access</a>
  </header>

  <main>
  <div class="hero">
    <div>
      <span class="eyebrow"><i class="dot"></i> Testnet beta · Proofs by Primus zkTLS</span>
      <h1>Pay when it's proven.</h1>
      <p class="sub">Lock funds against a condition. Your worker proves it with a Primus zkTLS attestation. When it verifies, the escrow releases automatically.</p>
      <div class="cta"><a class="btn primary" href="#">Request access</a><a class="btn" href="#">Try the live demo</a></div>
    </div>
    <div class="preview" id="preview">
      <div class="app" id="app">
        <aside class="side">
          <div class="brand">${d.logo}<span>${NAME}</span></div>
          <a class="on"><b></b>Overview</a><a><b></b>Tasks</a><a><b></b>Proofs</a><a><b></b>Ledger</a><a><b></b>Workers</a><a><b></b>Settings</a>
        </aside>
        <div class="main">
          <div class="top"><h2>Overview</h2><span class="chip c-sim"><i></i>Simulation</span><span class="sp"></span>
            <div class="seg" role="group" aria-label="Range"><button aria-pressed="false">7d</button><button aria-pressed="true">30d</button><button aria-pressed="false">90d</button></div></div>
          <div class="kpis" id="kpis"></div>
          <div class="panels">
            <div class="panel"><h3>Settlement volume <span class="mono num" style="color:var(--text-3)">USDC · demo data</span></h3><svg class="chart" id="chart" viewBox="0 0 520 150" preserveAspectRatio="none" role="img" aria-label="Settlement volume, last 30 days, demo data"></svg></div>
            <div class="panel"><h3>Live proof feed</h3>
              <div class="feed" id="feed"></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <section class="how">
    <span class="n">HOW IT WORKS</span>
    <h2 style="margin-top:10px">Define it. Lock it. Prove it. Settle it.</h2>
    <div class="steps" id="steps"></div>
  </section>

  <section class="spec">
    <span class="n">DIRECTION SPEC — ${d.title.toUpperCase()}</span>
    <h2 style="font-size:28px;letter-spacing:-.03em;margin:8px 0 24px">${d.blurb}</h2>
    <dl>
      <dt>Logo</dt><dd><span class="brand" style="font-size:24px">${d.logo}<span>${NAME}</span></span> &nbsp; <span style="color:var(--text-3)">mark + wordmark; mark scales to a 16px favicon.</span></dd>
      <dt>Type</dt><dd>${d.type}</dd>
      <dt>Colour</dt><dd><div class="sw" id="sw"></div></dd>
      <dt>Imagery</dt><dd>${d.imagery}</dd>
      <dt>Motion</dt><dd>${d.motion}</dd>
    </dl>
  </section>
  </main>
</div>
<div class="bar"><span>${d.title}</span><div class="seg" id="theme"><button data-t="light" aria-pressed="true">Light</button><button data-t="dark" aria-pressed="false">Dark</button></div></div>

<script>
(function(){
  var root=document.documentElement;
  function setTheme(t){root.dataset.theme=t;document.querySelectorAll('#theme button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.t===t)});swatches()}
  document.querySelectorAll('#theme button').forEach(function(b){b.onclick=function(){setTheme(b.dataset.t)}});
  var q=new URLSearchParams(location.search).get('theme');
  // seeded PRNG for natural, repeatable variance
  var s=7;function r(){s=(s*16807)%2147483647;return s/2147483647}
  function series(n,base,vol){var a=[],v=base;for(var i=0;i<n;i++){v=Math.max(base*.35,v+(r()-.45)*vol+Math.sin(i/3.1)*vol*.35);a.push(v)}return a}
  function path(a,w,h,pad){var mx=Math.max.apply(null,a),mn=Math.min.apply(null,a);return a.map(function(v,i){return [i/(a.length-1)*w,h-pad-(v-mn)/(mx-mn||1)*(h-pad*2)]})}
  function line(p){return p.map(function(c,i){return (i?'L':'M')+c[0].toFixed(1)+' '+c[1].toFixed(1)}).join(' ')}
  var K=[['Escrow balance','48,210.00','+4.2%'],['Settled · 30d','126,480.50','+11.8%'],['Open tasks','17','+3'],['Proof success','94.1%','+1.3 pts']];
  document.getElementById('kpis').innerHTML=K.map(function(k,i){var p=path(series(24,50,12),100,26,3);return '<div class="kpi"><small>'+k[0]+'</small><strong class="num">'+k[1]+'</strong><span class="d num">'+k[2]+'</span><svg viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true"><path d="'+line(p)+'" fill="none" stroke="var(--accent)" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg></div>'}).join('');
  var p=path(series(30,60,14),520,150,14),c=document.getElementById('chart');
  var g='';for(var i=1;i<4;i++)g+='<line x1="0" x2="520" y1="'+(i*37)+'" y2="'+(i*37)+'" stroke="var(--line)" stroke-width="1" vector-effect="non-scaling-stroke"/>';
  c.innerHTML='<defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>'+g+'<path d="'+line(p)+' L520 150 L0 150Z" fill="url(#ga)"/><path d="'+line(p)+'" fill="none" stroke="var(--accent)" stroke-width="1.75" vector-effect="non-scaling-stroke"/><circle cx="'+p[22][0]+'" cy="'+p[22][1]+'" r="4" fill="var(--surface)" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke"/>';
  var F=[['c-ok','Settled','Q4 growth bounty · Lumen Labs','2,500.00'],['c-info','Verified','API uptime SLA · Northgate','1,200.00'],['c-warn','Proving','Lead-gen batch 14 · Ada (agent)','850.00'],['c-ok','Settled','Grant milestone 2 · Meridian DAO','5,000.00'],['c-bad','Proof failed','Report delivery · Okafor Studio','640.00']];
  document.getElementById('feed').innerHTML=F.map(function(f,i){return '<div><span class="chip '+f[0]+'"><i></i>'+f[1]+'</span><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+f[2]+'</span><span class="t num">'+f[3]+'</span></div>'}).join('');
  var S=[['01','Define','Pick a source and a rule: conversions ≥ 120 by Nov 14.','<rect x="6" y="14" width="96" height="14" rx="4"/><rect x="6" y="36" width="64" height="14" rx="4"/><rect x="6" y="58" width="80" height="14" rx="4"/>'],['02','Lock','Fund escrow in USDC. Funds stay put until the rule is proven or the deadline passes.','<rect x="30" y="30" width="48" height="40" rx="8"/><path d="M40 30v-8a14 14 0 0 1 28 0v8"/>'],['03','Prove','The worker produces a Primus zkTLS attestation of the source response.','<circle cx="20" cy="46" r="8"/><circle cx="90" cy="46" r="8"/><path d="M30 46h50M66 38l10 8-10 8"/>'],['04','Settle','The escrow checks the attestation and pays the worker. Every step is logged.','<circle cx="54" cy="46" r="26"/><path d="M42 46l9 9 17-18"/>']];
  document.getElementById('steps').innerHTML=S.map(function(x){return '<div class="step"><span class="n">'+x[0]+'</span><svg viewBox="0 0 108 84" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+x[3]+'</svg><h4>'+x[1]+'</h4><p>'+x[2]+'</p></div>'}).join('');
  function swatches(){var cs=getComputedStyle(root);document.getElementById('sw').innerHTML=['bg','surface','raised','line','text','accent','ok','warn','bad'].map(function(k){var v=cs.getPropertyValue('--'+k).trim();return '<i style="background:var(--'+k+')">'+k+'</i>'}).join('')}
  setTheme(q==='dark'?'dark':'light');
})();
</script>
</body>
</html>`;

for (const d of directions) writeFileSync(join(out, `${d.slug}.html`), page(d));

writeFileSync(join(out, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${NAME} brand directions</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:0;padding:48px 24px;max-width:720px;margin-inline:auto;color:#0b1220}a{color:#2557f6}li{margin:14px 0}</style>
<h1>${NAME} — brand directions</h1><ol>${directions.map((d) => `<li><a href="${d.slug}.html"><b>${d.title}</b></a> (<a href="${d.slug}.html?theme=dark">dark</a>)<br>${d.blurb}</li>`).join('')}</ol></html>`);
console.log('built', directions.map((d) => d.slug).join(', '));
