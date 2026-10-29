// E — Specimen: a proof as a security-printed certificate. Banknote engraving × stationery. Two inks (ultramarine + coral), computed guilloché.
const r1 = (n) => Math.round(n * 10) / 10;
// closed guilloché curve family around (cx,cy)
function rosette(cx, cy, R, A, k, n, step = 3, off = 0) {
  let d = '';
  for (let j = 0; j < n; j++) {
    let p = '';
    for (let a = 0; a <= 360; a += step) {
      const t = (a * Math.PI) / 180, r = R + A * Math.sin(k * t + (2 * Math.PI * j) / n + off);
      p += (a ? 'L' : 'M') + r1(cx + r * Math.cos(t)) + ' ' + r1(cy + r * Math.sin(t));
    }
    d += `<path d="${p}Z"/>`;
  }
  return d;
}
// wavy band, horizontal (or vertical) braided lines
function band(x0, y0, len, amp, lam, n, vertical = false, step = 6) {
  let d = '';
  for (let j = 0; j < n; j++) {
    let p = '';
    for (let s = 0; s <= len; s += step) {
      const w = amp * Math.sin((2 * Math.PI * s) / lam + (Math.PI * j) / n * 2);
      const x = vertical ? x0 + w : x0 + s, y = vertical ? y0 + s : y0 + w;
      p += (s ? 'L' : 'M') + r1(x) + ' ' + r1(y);
    }
    d += `<path d="${p}"/>`;
  }
  return d;
}
const certBorder = band(30, 36, 940, 13, 64, 7) + band(30, 584, 940, 13, 64, 7) + band(36, 76, 468, 13, 64, 7, true) + band(964, 76, 468, 13, 64, 7, true);
const medal = rosette(790, 312, 96, 26, 14, 18, 3) + rosette(790, 312, 60, 12, 9, 10, 4, 1);
const logoRos = rosette(14, 14, 7, 3, 7, 6, 12);
const swWater = rosette(60, 60, 34, 10, 9, 12, 4);

export default {
  letter: 'E', name: 'Specimen', slug: 'e-specimen',
  fonts: 'family=Manrope:wght@400;500;600;700;800',
  light: `--bg:#E6ECF6;--surface:#F8FAFE;--sunk:#DBE4F1;--ink:#0D1649;--ink-2:#3B4673;--ink-3:#7280AA;--line:rgba(27,45,154,.13);--line-2:rgba(27,45,154,.3);
--acc:#1B2D9A;--acc-ink:#FFFFFF;--acc-soft:#DFE5FA;--coral:#EE5239;--ok:#0F7556;--ok-bg:#D9F0E8;--warn:#955608;--warn-bg:#F8E8CB;--bad:#BF3328;--bad-bg:#F8DDD9;--info:#1B2D9A;--info-bg:#DFE5FA;
--sans:'Manrope',ui-sans-serif,system-ui,sans-serif;--r1:2px;--r2:3px;--r3:4px;--shadow:0 1px 0 #fff inset,0 24px 50px -26px rgba(13,22,73,.4);--shadow-s:0 1px 2px rgba(13,22,73,.16);--paper:#FBFCFF`,
  dark: `--bg:#090E2C;--surface:#101745;--sunk:#060A20;--ink:#E8EDFF;--ink-2:#A5B1E8;--ink-3:#6B78B6;--line:rgba(160,178,255,.14);--line-2:rgba(160,178,255,.32);
--acc:#93A4FF;--acc-ink:#0A1034;--acc-soft:rgba(147,164,255,.15);--coral:#FF7B63;--ok:#5ADBA9;--ok-bg:rgba(90,219,169,.13);--warn:#F2BB63;--warn-bg:rgba(242,187,99,.13);--bad:#FF8C82;--bad-bg:rgba(255,140,130,.13);--info:#93A4FF;--info-bg:rgba(147,164,255,.15);
--shadow:0 0 0 1px rgba(160,178,255,.1),0 30px 60px -30px rgba(0,0,0,.8);--shadow-s:0 0 0 1px rgba(160,178,255,.12);--paper:#131B4E`,
  logo: `<svg width="30" height="30" viewBox="0 0 28 28" aria-hidden="true"><g fill="none" stroke="var(--acc)" stroke-width=".6">${logoRos}</g><circle cx="14" cy="14" r="3.2" fill="var(--coral)"/></svg>`,
  miniLogo: `<svg width="22" height="22" viewBox="0 0 28 28"><g fill="none" stroke="var(--acc)" stroke-width=".7">${logoRos}</g><circle cx="14" cy="14" r="3.2" fill="var(--coral)"/></svg>`,
  cfg: { spark: 'bars', chart: 'line', lw: 1.6, seed: 12 },
  bg: '',
  css: `
body{background:radial-gradient(60% 40% at 50% 0%,color-mix(in oklab,var(--surface) 70%,transparent),transparent 70%),var(--bg)}
.brand{font-weight:800;letter-spacing:-.03em}
.btn{border-radius:var(--r2);font-weight:700}
.btn.pri{background:var(--acc);box-shadow:0 1px 0 rgba(255,255,255,.25) inset}
.hero{text-align:center;padding:30px 0 0}
.kick{display:inline-flex;gap:10px;align-items:center;font:700 11.5px var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--ink-2)}
.kick::before,.kick::after{content:"";width:44px;height:1px;background:var(--line-2)}
h1{font:800 clamp(42px,6.2vw,92px)/.98 var(--sans);letter-spacing:-.045em;margin:20px auto 18px;max-width:14ch;text-wrap:balance;color:var(--ink)}
h1 em{font-style:normal;color:var(--acc);position:relative}
h1 em::after{content:"";position:absolute;left:0;right:0;bottom:.06em;height:.075em;background:var(--coral)}
.lede{font-size:18px;color:var(--ink-2);max-width:54ch;margin:0 auto 26px}
.cta{justify-content:center}
.cert{position:relative;margin:44px auto 0;width:min(1000px,100%);aspect-ratio:1000/620;text-align:left;filter:drop-shadow(0 30px 40px color-mix(in oklab,var(--acc) 18%,transparent))}
.cert svg.face{position:absolute;inset:0;width:100%;height:100%}
.cert .paper{fill:var(--paper);stroke:var(--acc);stroke-width:1.2}
.cert .g{fill:none;stroke:var(--acc);stroke-width:.55;opacity:.7}
.cert .g2{fill:none;stroke:var(--coral);stroke-width:.5;opacity:.75}
.cert .rot{transform-origin:790px 312px;animation:spin 120s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.cert .ring{font:700 11px var(--sans);letter-spacing:.22em;fill:var(--acc)}
.cert .micro{font:600 5px var(--sans);fill:var(--acc);opacity:.8;letter-spacing:.04em}
.cert .serial{font:700 20px var(--sans);fill:var(--coral);letter-spacing:.06em;font-variant-numeric:tabular-nums}
.cert .wm{font:800 120px var(--sans);fill:var(--acc);opacity:.045;letter-spacing:-.02em}
.ctxt{position:absolute;left:11.5%;top:17%;width:52%;display:grid;gap:10px}
.ctxt .ck{font:700 11px var(--sans);letter-spacing:.2em;color:var(--acc);text-transform:uppercase}
.ctxt h3{margin:0;font:800 clamp(24px,3.6vw,46px)/1 var(--sans);letter-spacing:-.04em}
.ctxt p{margin:0;font-size:clamp(12px,1.35vw,15.5px);color:var(--ink-2);line-height:1.45}
.claim{font:800 clamp(20px,3.1vw,38px)/1.1 var(--sans);letter-spacing:-.035em;color:var(--acc);padding:2px 0 4px;border-bottom:2px solid var(--coral);display:inline-block;width:max-content;max-width:100%}
.cgrid{display:grid;grid-template-columns:auto 1fr;gap:5px 18px;font-size:clamp(11px,1.2vw,14px);margin-top:4px}
.cgrid dt{color:var(--ink-3);font-weight:600}.cgrid dd{margin:0;font-weight:700;font-variant-numeric:tabular-nums}
.sheen{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;background:radial-gradient(420px 260px at var(--sx,30%) var(--sy,20%),rgba(255,255,255,.9),transparent 70%);opacity:.0;transition:opacity .4s}
.cert:hover .sheen{opacity:.85}
.sweep{position:absolute;inset:0;overflow:hidden;pointer-events:none;border-radius:4px}
.sweep::after{content:"";position:absolute;top:-20%;bottom:-20%;width:16%;left:-30%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.75),transparent);transform:skewX(-18deg);animation:sweep 9s cubic-bezier(.4,0,.2,1) 2s infinite;mix-blend-mode:soft-light}
@keyframes sweep{0%{left:-30%}35%,100%{left:130%}}
:root[data-theme="dark"] .sweep::after{opacity:.3}
.cert .tagsim{position:absolute;right:5%;bottom:8.5%;font:800 11px var(--sans);letter-spacing:.16em;color:var(--acc);border:1.5px dashed var(--acc);padding:4px 9px;text-transform:uppercase;background:var(--paper)}
/* how: security features */
.feat{display:grid;grid-template-columns:1.2fr 1fr 1fr 1.2fr;gap:18px}
.ft{position:relative;padding:22px;background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r3);box-shadow:inset 0 0 0 5px var(--surface),inset 0 0 0 6px var(--line);display:grid;gap:10px;align-content:start}
.ft .sw{height:120px;display:grid;place-items:center;border-bottom:1px solid var(--line);margin:-4px -4px 6px}
.ft .n{font:800 11px var(--sans);letter-spacing:.18em;color:var(--coral);text-transform:uppercase}
.ft h3{margin:0;font:800 22px var(--sans);letter-spacing:-.03em}
.ft p{margin:0;color:var(--ink-2);font-size:14.5px}
.ft svg{max-width:100%}
.mp{font:600 5.5px var(--sans);fill:var(--acc);letter-spacing:.05em}
/* app: paper panes with double rule */
.ov-pane,.kpi{border:1px solid var(--line-2);box-shadow:inset 0 0 0 3px var(--surface),inset 0 0 0 4px var(--line)}
.kpi{padding:16px 18px 14px}
.ov-nav{background:var(--acc);color:#fff;border-right:0}
:root[data-theme="dark"] .ov-nav{background:#0C1235}
.ov-nav .nv{color:rgba(255,255,255,.75)}.ov-nav .nv:hover{background:rgba(255,255,255,.1)}
.ov-nav .nv.on{background:rgba(255,255,255,.16);color:#fff;box-shadow:inset 3px 0 0 var(--coral)}
.ov-ws{border-color:rgba(255,255,255,.2);color:#fff}.ov-ws small{color:rgba(255,255,255,.65)}
.ov-ph h3{font-weight:800}
.chip{border-radius:2px;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;font-weight:800;height:22px}
.sim{border-radius:2px;text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:800;border-color:var(--acc);color:var(--acc)}
.tscroll th{text-transform:uppercase;letter-spacing:.09em;font-size:10.5px;font-weight:800;border-bottom:1px solid var(--acc)}
.tm>div{box-shadow:inset 0 0 0 5px var(--surface),inset 0 0 0 6px var(--line);border-color:var(--line-2)}
.tm .no{background:repeating-linear-gradient(135deg,transparent 0 10px,var(--line) 10px 11px),var(--surface)}
.big{font:800 70px/1 var(--sans);letter-spacing:-.045em}
.kick2{color:var(--coral)}
@media(max-width:1000px){.feat{grid-template-columns:repeat(2,1fr)}.ctxt{left:7%;width:60%;top:12%}}
@media(max-width:700px){.feat{grid-template-columns:1fr}.cert{aspect-ratio:1000/900}.cert svg.face{display:none}.cert{background:var(--paper);border:1px solid var(--acc);padding:22px 20px 60px;filter:none;box-shadow:inset 0 0 0 5px var(--paper),inset 0 0 0 6px var(--line-2)}.ctxt{position:relative;left:0;top:0;width:100%}.cert .tagsim{right:auto;left:20px;bottom:20px}.big{font-size:42px}.cert .sweep{display:none}}
`,
  hero: `<main class="hero">
<span class="kick">Testnet beta · Proofs by Primus zkTLS</span>
<h1>Pay when it’s <em>proven.</em></h1>
<p class="lede">An escrow that releases only against a proof of the outcome. The proof says one thing and keeps the rest of the page private. This is what it looks like when it arrives.</p>
<div class="cta"><a class="btn pri" href="#">Request access</a><a class="btn" href="#">Try a settlement</a></div>
<div class="cert" id="cert">
<svg class="face" viewBox="0 0 1000 620" aria-hidden="true">
<rect class="paper" x="8" y="8" width="984" height="604" rx="4"/>
<g class="g">${certBorder}</g>
<rect x="22" y="22" width="956" height="576" fill="none" stroke="var(--acc)" stroke-width=".8"/><rect x="92" y="92" width="816" height="436" fill="none" stroke="var(--acc)" stroke-width=".5" opacity=".6"/>
<text class="wm" x="300" y="500" aria-hidden="true">PROVEN</text>
<g class="rot"><g class="g">${medal}</g></g>
<circle cx="790" cy="312" r="48" fill="var(--paper)" stroke="var(--acc)" stroke-width="1.2"/><circle cx="790" cy="312" r="40" fill="var(--acc-soft)" stroke="var(--coral)" stroke-width=".8"/>
<path d="M770 314l14 14 28-30" fill="none" stroke="var(--acc)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<defs><path id="ringp" d="M790 312m-133 0a133 133 0 1 1 266 0a133 133 0 1 1 -266 0"/></defs>
<text class="ring"><textPath href="#ringp" startOffset="0">VERIFIED · SIMULATION SPECIMEN · NOT A REAL ATTESTATION · NO FUNDS MOVED · </textPath></text>
<text class="serial" x="880" y="76" text-anchor="end">No. 7Q2M-0041</text>
<text class="micro" x="100" y="520" textLength="560" lengthAdjust="spacing">PROOFPAY SIMULATION SPECIMEN PROOFPAY SIMULATION SPECIMEN PROOFPAY SIMULATION SPECIMEN PROOFPAY SIMULATION SPECIMEN PROOFPAY SIMULATION</text>
<text class="micro" x="100" y="527" textLength="560" lengthAdjust="spacing">CONDITION HASH 0X71A3 BOUND TO TASK TSK7Q2M REPLAY REJECTED WINDOW OPEN SIGNATURE RECOVERED REGISTERED ATTESTOR ONLY</text>
</svg>
<div class="ctxt"><span class="ck">Certificate of outcome</span><h3>Proof of Outcome</h3>
<p>The source returned a response in which</p><span class="claim">conversions ≥ 120</span><p>is <b style="color:var(--ink)">true</b>. Three other fields were withheld and stay private.</p>
<dl class="cgrid"><dt>Payable to</dt><dd>Ada · agent</dd><dt>Amount</dt><dd>2,500.00 USDC</dd><dt>Task</dt><dd>tsk_7Q2M</dd><dt>Attestor</dt><dd>0x9F3c…c21E</dd><dt>Issued</dt><dd>2026-11-12 09:41 UTC (simulated)</dd></dl></div>
<span class="tagsim">Simulation · synthetic proof</span><div class="sweep"></div><div class="sheen"></div>
</div></main>`,
  how: {
    h2: 'Four security features.<br>Four steps.', p: 'Like a banknote, each step has one feature that is easy to check and hard to fake. The escrow only ever checks the last two.',
    html: `<div class="feat">
<div class="ft"><div class="sw"><svg viewBox="0 0 220 80" width="220"><text x="110" y="52" text-anchor="middle" style="font:800 34px var(--sans);fill:var(--coral);letter-spacing:.05em">No. 7Q2M</text><path d="M20 66H200" stroke="var(--acc)" stroke-width=".8"/></svg></div><span class="n">01 · Serial</span><h3>Define</h3><p>A source, a metric, a threshold, a date. The rule is hashed into a serial the proof must carry.</p></div>
<div class="ft"><div class="sw"><svg viewBox="0 0 120 120" width="120"><g fill="none" stroke="var(--acc)" stroke-width=".5" opacity=".85">${swWater}</g></svg></div><span class="n">02 · Watermark</span><h3>Lock</h3><p>Funds in escrow are the watermark: always there, never in the way.</p></div>
<div class="ft"><div class="sw"><svg viewBox="0 0 220 90" width="220"><g class="mp"><text x="8" y="16" textLength="204">PROOFPAY SIMULATION SPECIMEN PROOFPAY SIMULATION SPECIMEN</text><text x="8" y="26" textLength="204">ACCOUNT ID WITHHELD SPEND WITHHELD REVENUE WITHHELD</text><text x="8" y="36" textLength="204">PROOFPAY SIMULATION SPECIMEN PROOFPAY SIMULATION SPECIMEN</text></g><rect x="38" y="44" width="144" height="30" fill="var(--paper)" stroke="var(--coral)"/><text x="110" y="64" text-anchor="middle" style="font:800 15px var(--sans);fill:var(--acc)">conversions ≥ 120</text></svg></div><span class="n">03 · Microprint</span><h3>Prove</h3><p>Everything is printed too small to read, except the one window the worker opens.</p></div>
<div class="ft"><div class="sw"><svg viewBox="0 0 120 120" width="120"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--acc)" stroke-width="1"/><circle cx="60" cy="60" r="40" fill="var(--acc-soft)" stroke="var(--coral)" stroke-width=".8"/><path d="M42 61l12 12 24-26" fill="none" stroke="var(--acc)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="n">04 · Seal</span><h3>Settle</h3><p>The escrow checks the seal: signature, binding, replay and window. Then it pays.</p></div></div>`,
  },
  app: { h2: 'The register,<br>kept on paper-grade rules.', p: 'Every state change is an event with an actor, a time and a transaction. Demo data, labelled as such.' },
  trust: { h2: 'What the seal says.<br>And what it cannot.', p: 'A proof shows the source returned this response. It does not show the source is right, or that the worker did the work.' },
  spec: {
    h2: 'Direction E.<br>Specimen.', p: 'The proof as a security-printed certificate: two inks, computed guilloché, microprint, a seal. Sans only. Brave: fintech that looks like the instrument it verifies, and says SPECIMEN on it where it is simulated.',
    typeLab: 'Type · Manrope (800 display, 600–700 text); tabular figures; no mono face',
    type: `<div class="big">Pay when it’s <span style="color:var(--acc)">proven.</span></div><p style="color:var(--ink-2);max-width:62ch;margin:16px 0 0">Task <span class="num">tsk_7Q2M</span> settled <span class="num">2,500.00</span> USDC to Ada. <span class="num">126,480.50 · 94.1% · 3h 12m</span>.</p>`,
    roles: [['paper', 'var(--surface)'], ['ground', 'var(--bg)'], ['ink', 'var(--acc)', 'var(--acc-ink)'], ['text', 'var(--ink)', 'var(--surface)'], ['coral', 'var(--coral)', '#fff']],
    motionLab: 'Motion · calm, ambient', motion: 'The medallion rosette turns once every two minutes. A soft sheen crosses the certificate every nine seconds and follows the pointer on hover. Controls respond in 150 ms. Reduced motion stops both.',
  },
  script: `
(function(){
  var c=document.getElementById('cert');
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--sx',((e.clientX-r.left)/r.width*100)+'%');c.style.setProperty('--sy',((e.clientY-r.top)/r.height*100)+'%')});
})();`,
};
