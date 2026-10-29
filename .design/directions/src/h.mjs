// H — Section: the settlement as an engineering drawing. Orthographic section A–A, hatching, balloons, title block. Graphite + safety orange.
// The drawing is computed geometry; hatch patterns are SVG <pattern>s.
const LAYERS = [
  ['WORKER', 'hSparse', 'Asks the source for its data through the attestor, as an ordinary HTTPS request.'],
  ['SOURCE · TLS', 'hCross', 'Answers over TLS. Private fields stay on the source page.'],
  ['ATTESTOR', 'hDots', 'Signs only the disclosed claim: the threshold was met.'],
  ['VERIFIER', 'hDense', 'Contract checks signature, task binding, replay and time window.'],
  ['ESCROW', 'hSolid', 'Releases 2,500.00 USDC to the worker. Refund after the deadline.'],
];
const X0 = 190, W = 440, H = 62, GAP = 30, Y0 = 44;
let dwg = `<defs>
<pattern id="hSparse" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="14" stroke="var(--ink)" stroke-width="1" opacity=".55"/></pattern>
<pattern id="hCross" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V12M0 0H12" stroke="var(--ink)" stroke-width=".9" opacity=".55" fill="none"/></pattern>
<pattern id="hDots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="var(--ink)" opacity=".6"/></pattern>
<pattern id="hDense" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink)" stroke-width="1" opacity=".6"/></pattern>
<pattern id="hSolid" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--ink)" stroke-width="3.4" opacity=".92"/></pattern>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 1L10 5 0 9z" fill="var(--acc)"/></marker>
<marker id="ad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1L10 5 0 9z" fill="var(--ink)"/></marker>
</defs>`;
// centreline (dash-dot)
dwg += `<line x1="${X0 + W / 2}" y1="18" x2="${X0 + W / 2}" y2="${Y0 + 5 * (H + GAP) + 6}" stroke="var(--ink)" stroke-width="1" stroke-dasharray="14 4 2 4" opacity=".7"/>`;
LAYERS.forEach((l, i) => {
  const y = Y0 + i * (H + GAP), hh = i === 4 ? H + 18 : H;
  dwg += `<g class="ly" data-i="${i}"><rect x="${X0}" y="${y}" width="${W}" height="${hh}" fill="var(--paper)"/><rect x="${X0}" y="${y}" width="${W}" height="${hh}" fill="url(#${l[1]})"/><rect class="edge" x="${X0}" y="${y}" width="${W}" height="${hh}" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  dwg += `<rect x="${X0 + W / 2 - 78}" y="${y + hh / 2 - 15}" width="156" height="30" fill="var(--paper)" stroke="var(--ink)" stroke-width="1"/><text x="${X0 + W / 2}" y="${y + hh / 2 + 5}" text-anchor="middle" class="lt">${l[0]}</text>`;
  // balloon + leader + note
  const by = y + hh / 2;
  dwg += `<line x1="${X0 + W}" y1="${by}" x2="${X0 + W + 52}" y2="${by}" stroke="var(--ink)" stroke-width="1"/><circle class="bl" cx="${X0 + W + 66}" cy="${by}" r="14" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/><text x="${X0 + W + 66}" y="${by + 5}" text-anchor="middle" class="bn">${i + 1}</text>`;
  dwg += `<foreignObject x="${X0 + W + 92}" y="${by - 24}" width="330" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="note"><b>${l[0].replace(' · ', ' / ')}.</b> ${l[2]}</div></foreignObject></g>`;
  if (i < 4) {
    const ya = y + hh + 2, yb = y + hh + GAP - 2;
    dwg += `<line class="fa" data-i="${i}" x1="${X0 + W / 2}" y1="${ya}" x2="${X0 + W / 2}" y2="${yb}" stroke="var(--acc)" stroke-width="4" marker-end="url(#ah)" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`;
  }
});
// vertical dimension: what the proof covers (layers 2–4)
const dy1 = Y0 + 1 * (H + GAP), dy2 = Y0 + 3 * (H + GAP) + H;
dwg += `<line x1="150" y1="${dy1}" x2="150" y2="${dy2}" stroke="var(--ink)" stroke-width="1" marker-start="url(#ad)" marker-end="url(#ad)"/><line x1="140" y1="${dy1}" x2="${X0 - 4}" y2="${dy1}" stroke="var(--ink)" stroke-width=".8"/><line x1="140" y1="${dy2}" x2="${X0 - 4}" y2="${dy2}" stroke="var(--ink)" stroke-width=".8"/>
<text transform="translate(136 ${(dy1 + dy2) / 2}) rotate(-90)" text-anchor="middle" class="dm">WHAT THE PROOF COVERS</text>`;
// horizontal dimension: payout
const ey = Y0 + 4 * (H + GAP) + H + 18 + 26;
dwg += `<g class="pay"><line x1="${X0}" y1="${ey}" x2="${X0 + W}" y2="${ey}" stroke="var(--acc)" stroke-width="1.6" marker-start="url(#ah)" marker-end="url(#ah)"/><line x1="${X0}" y1="${ey - 12}" x2="${X0}" y2="${ey + 8}" stroke="var(--acc)"/><line x1="${X0 + W}" y1="${ey - 12}" x2="${X0 + W}" y2="${ey + 8}" stroke="var(--acc)"/><rect x="${X0 + W / 2 - 128}" y="${ey - 12}" width="256" height="24" fill="var(--paper)"/><text x="${X0 + W / 2}" y="${ey + 5}" text-anchor="middle" class="dm" style="fill:var(--acc);font-weight:700;font-size:14px">2,500.00 USDC RELEASED</text></g>`;
// section markers
dwg += `<g class="dm"><text x="28" y="26" style="font-weight:700;font-size:16px">A</text><path d="M16 38H56" stroke="var(--ink)" stroke-width="2" marker-end="url(#ad)"/><text x="1160" y="26" style="font-weight:700;font-size:16px">A</text><path d="M1184 38H1144" stroke="var(--ink)" stroke-width="2" marker-end="url(#ad)"/></g>`;

export default {
  letter: 'H', name: 'Section', slug: 'h-section',
  fonts: 'family=Chivo:wght@400;500;700;800&family=Chivo+Mono:wght@400;500;600',
  light: `--bg:#E6E8EB;--surface:#FAFBFC;--paper:#FAFBFC;--sunk:#EEF0F2;--ink:#171A1E;--ink-2:#4B525B;--ink-3:#868D97;--line:rgba(23,26,30,.14);--line-2:rgba(23,26,30,.5);
--acc:#FF5A0A;--acc-ink:#140900;--acc-soft:#FFE5D6;--ok:#17744B;--ok-bg:transparent;--warn:#956008;--warn-bg:transparent;--bad:#BE3328;--bad-bg:transparent;--info:#1F55A8;--info-bg:transparent;
--sans:'Chivo',ui-sans-serif,system-ui,sans-serif;--mono:'Chivo Mono',ui-monospace,monospace;--r1:0px;--r2:0px;--r3:0px;--shadow:0 1px 0 rgba(23,26,30,.08),0 24px 50px -26px rgba(23,26,30,.4);--shadow-s:0 1px 0 rgba(23,26,30,.2)`,
  dark: `--bg:#0F1113;--surface:#16191C;--paper:#16191C;--sunk:#1C2024;--ink:#E9ECEF;--ink-2:#A5ACB5;--ink-3:#6E7680;--line:rgba(233,236,239,.13);--line-2:rgba(233,236,239,.5);
--acc:#FF6B24;--acc-ink:#140900;--acc-soft:rgba(255,107,36,.16);--ok:#4DD497;--ok-bg:transparent;--warn:#F0B550;--warn-bg:transparent;--bad:#FF8176;--bad-bg:transparent;--info:#7BAEF5;--info-bg:transparent;
--shadow:0 0 0 1px rgba(255,255,255,.06),0 30px 60px -30px rgba(0,0,0,.9);--shadow-s:0 0 0 1px rgba(255,255,255,.1)`,
  logo: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect x="2.500" y="2.500" width="23" height="23" fill="none" stroke="var(--ink)" stroke-width="2"/><path d="M5 22L22 5M5 16L16 5M11 22L22 11M5 10L10 5M17 22L22 17" stroke="var(--ink)" stroke-width="1.200"/><path d="M2 14H26" stroke="var(--acc)" stroke-width="2.600"/></svg>`,
  miniLogo: `<svg width="22" height="22" viewBox="0 0 28 28"><rect x="2.500" y="2.500" width="23" height="23" fill="none" stroke="var(--ink)" stroke-width="2"/><path d="M5 22L22 5M5 16L16 5M11 22L22 11" stroke="var(--ink)" stroke-width="1.200"/><path d="M2 14H26" stroke="var(--acc)" stroke-width="2.600"/></svg>`,
  cfg: { spark: 'line', chart: 'line', noFill: true, lw: 1.6, seed: 41 },
  css: `
body{background:var(--bg)}
.brand{font-weight:800;letter-spacing:-.03em}
.btn{border-radius:0;border:1.5px solid var(--ink);background:var(--surface);font-weight:700}
.btn.pri{background:var(--acc);border-color:var(--ink);color:var(--acc-ink);box-shadow:3px 3px 0 var(--ink)}
.btn.pri:hover{filter:none;transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--ink)}
.btn.pri:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink)}
.btn.ghost{border-color:transparent}
.hero{padding:26px 0 0}
.h-top{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.8fr);gap:48px;align-items:end;margin-bottom:28px}
.meta{font:500 12px var(--mono);color:var(--ink-3);letter-spacing:.06em;margin-bottom:14px}
h1{font:800 clamp(48px,7.4vw,112px)/.9 var(--sans);letter-spacing:-.045em;margin:0}
h1 em{font-style:normal;box-shadow:inset 0 -.16em 0 var(--acc)}
.lede{font-size:17px;color:var(--ink-2);margin:0 0 20px;max-width:42ch}
.attr{margin:16px 0 0;font-size:12.5px;color:var(--ink-3);max-width:44ch}.attr a{border-bottom:1px solid var(--line-2)}
.sheet{position:relative;background:var(--paper);border:2px solid var(--ink);box-shadow:var(--shadow);padding:22px 22px 0}
.sheet::before{content:"";position:absolute;inset:8px;border:1px solid var(--ink);pointer-events:none;opacity:.7}
.zn{position:absolute;font:500 10.5px var(--mono);color:var(--ink-3)}
.dsvg{display:block;width:100%;height:auto;position:relative}
.dsvg text{font-family:var(--mono)}
.dsvg .lt{font:600 13px var(--mono);letter-spacing:.12em;fill:var(--ink)}
.dsvg .bn{font:700 13px var(--mono);fill:var(--ink)}
.dsvg .dm{font:500 11.5px var(--mono);fill:var(--ink);letter-spacing:.08em}
.dsvg .note{font:400 13.5px/1.4 var(--sans);color:var(--ink-2);padding-right:8px}
.dsvg .note b{color:var(--ink);font-weight:700;font-family:var(--mono);font-size:11.5px;letter-spacing:.06em}
.dsvg .ly .edge{transition:stroke .3s steps(2,end)}
.dsvg .ly.on .edge{stroke:var(--acc);stroke-width:3.5}
.dsvg .ly.on .bl{fill:var(--acc)}.dsvg .ly.on .bn{fill:var(--acc-ink)}
.dsvg .fa{transition:stroke-dashoffset .6s steps(8,end)}.dsvg .fa.on{stroke-dashoffset:0!important}
.dsvg .pay{opacity:0;transition:opacity .4s steps(3,end)}.dsvg .pay.on{opacity:1}
.tbk{display:grid;grid-template-columns:repeat(12,1fr);border-top:2px solid var(--ink);margin:6px -22px 0;font-size:12.5px;position:relative}
.tbk>div{padding:8px 12px 9px;border-left:1px solid var(--ink);border-bottom:1px solid var(--ink);min-width:0}
.tbk>div:first-child{border-left:0}
.tbk small{display:block;font:500 10px var(--mono);color:var(--ink-3);letter-spacing:.08em;text-transform:uppercase}
.tbk b{font-weight:700;display:block}
.tbk .c3{grid-column:span 3}.tbk .c2{grid-column:span 2}.tbk .c4{grid-column:span 4}.tbk .c6{grid-column:span 6}.tbk .c1{grid-column:span 1}
.tbk .big{font:800 22px/1.1 var(--sans);letter-spacing:-.02em}
.stamp{display:inline-block;font:700 11px var(--mono);letter-spacing:.14em;color:var(--acc);border:1.5px solid var(--acc);padding:2px 8px;transform:none}
/* how: schedule of parts */
.parts{width:100%;border-collapse:collapse;border:2px solid var(--ink);background:var(--paper);box-shadow:var(--shadow)}
.parts th{text-align:left;font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;padding:10px 16px;border-bottom:2px solid var(--ink);border-right:1px solid var(--ink);background:var(--sunk)}
.parts td{padding:20px 16px;border-bottom:1px solid var(--ink);border-right:1px solid var(--ink);vertical-align:top;font-size:15px;color:var(--ink-2)}
.parts tr:last-child td{border-bottom:0}.parts td:last-child,.parts th:last-child{border-right:0}
.parts td:first-child{width:72px}.parts td b{font:800 30px/1 var(--sans);letter-spacing:-.03em;color:var(--ink);display:block}
.bal{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;border:1.5px solid var(--ink);font:700 13px var(--mono);background:var(--paper)}
.parts .mono{font:500 12.5px var(--mono);color:var(--ink)}
.hatchlegend{display:flex;gap:22px;flex-wrap:wrap;margin-top:14px;font:500 11.5px var(--mono);color:var(--ink-2)}
.hatchlegend span{display:inline-flex;align-items:center;gap:8px}
.hatchlegend svg{width:34px;height:16px;border:1px solid var(--ink)}
/* app */
.win{border:2px solid var(--ink);box-shadow:var(--shadow)}
.ov-nav{border-right:2px solid var(--ink);background:var(--sunk)}
.nv{font-family:var(--mono);font-size:12px;letter-spacing:.02em}
.nv.on{background:var(--ink);color:var(--paper)}.nv.on .ct{color:var(--paper)}
.ov-top{border-bottom:2px solid var(--ink);font-family:var(--mono);font-size:12px}
.ov-ph h3{font:800 34px/1 var(--sans);letter-spacing:-.04em}
.kpi{border:1px solid var(--ink);border-radius:0;background:var(--paper);margin-right:-1px}
.ov-kpis{gap:0}
.kpi small{font:500 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase}
.kpi strong{font:800 30px/1 var(--sans)}
.ov-pane{border:1px solid var(--ink);border-radius:0}
.ov-pane h4{font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid var(--ink);padding-bottom:8px;margin:-2px 0 12px}
.ov-pane h4+div+h4{margin-top:18px}
.chip{border-radius:0;background:transparent!important;border:1.5px solid currentColor;font:700 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;height:22px}
.chip i{display:none}
.c-mute{color:var(--ink-2)}
.sim{border-radius:0;border:1.5px solid var(--acc);color:var(--acc);font:700 10.5px var(--mono);letter-spacing:.1em;text-transform:uppercase}
.tscroll th{font:600 10.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;border-bottom:2px solid var(--ink)}
.tscroll td{height:36px;border-bottom:1px solid var(--line-2);font-size:13px}
.hash{font-family:var(--mono);font-size:12px}
.tscroll tbody tr:hover{background:var(--acc-soft)}
.idn{border-radius:0;width:14px;height:14px;vertical-align:-2px;background-image:none!important;border:1.5px solid var(--ink)}
.search,.field{border-radius:0;border:1.5px solid var(--ink)}
/* trust as general notes */
.tm{counter-reset:note;gap:0;border:2px solid var(--ink);background:var(--paper);box-shadow:var(--shadow)}
.tm>div{border:0;border-radius:0;padding:26px 28px}.tm>div+div{border-left:2px solid var(--ink);background:repeating-linear-gradient(135deg,transparent 0 9px,var(--line) 9px 10px)}
.tm h3{font:600 12px var(--mono);letter-spacing:.12em;text-transform:uppercase;margin-bottom:2px}
.tm li{grid-template-columns:40px 1fr;counter-increment:note;border-top:1px solid var(--ink)}
.tm li svg{display:none}.tm li::before{content:counter(note);width:26px;height:26px;border-radius:50%;border:1.5px solid var(--ink);display:grid;place-items:center;font:700 12px var(--mono);color:var(--ink)}
.tm .yes{color:inherit}
.big{font:800 76px/.9 var(--sans);letter-spacing:-.045em}
h2{font-weight:800;letter-spacing:-.04em}
.kick{font:500 12px var(--mono);letter-spacing:.08em;color:var(--ink-3)}
@media(max-width:1000px){.h-top{grid-template-columns:1fr;gap:20px}.tbk{grid-template-columns:repeat(6,1fr)}.tbk .c6,.tbk .c4,.tbk .c3{grid-column:span 6}.tbk .c2,.tbk .c1{grid-column:span 3}.parts td:nth-child(3){display:none}.parts th:nth-child(3){display:none}}
@media(max-width:700px){.dsvg{min-width:900px}.dwrap{overflow-x:auto;margin:0 -22px;padding:0 22px}.tm{grid-template-columns:1fr}.tm>div+div{border-left:0;border-top:2px solid var(--ink)}.big{font-size:46px}.ov-kpis{gap:0}}
`,
  hero: `<main class="hero">
<div class="h-top"><div><div class="meta">DRAWING PP-001 · REV A · SECTION A–A · SCALE 1:1</div><h1>Pay when<br>it’s <em>proven.</em></h1></div>
<div><p class="lede">Cut through a settlement and you find five layers. Funds only move when the proof passes through all of them, in order. Here is the section.</p><div class="cta"><a class="btn pri" href="#">Request access</a><a class="btn" href="#">Try a settlement</a></div><p class="attr">Proofs by <a href="https://docs.primuslabs.xyz" rel="noopener">Primus zkTLS</a>. A proof shows the source returned this response, not that its data is true.</p></div></div>
<div class="sheet"><span class="zn" style="left:50%;top:-1px;transform:translate(-50%,-100%)">1 &nbsp; 2 &nbsp; 3 &nbsp; 4 &nbsp; 5 &nbsp; 6</span>
<div class="dwrap"><svg class="dsvg" id="dwg" viewBox="0 0 1200 600" role="img" aria-label="Section drawing of a settlement: worker, source over TLS, attestor, verifier contract and escrow, with the flow of the proof marked in orange">${dwg}</svg></div>
<div class="tbk"><div class="c3"><small>Project</small><b class="big">ProofPay</b></div><div class="c3"><small>Drawing</small><b>Escrow release · section A–A</b></div><div class="c2"><small>Status</small><b>Testnet beta</b></div><div class="c2"><small>Mode</small><b><span class="stamp">Simulation</span></b></div><div class="c2"><small>Sheet</small><b>1 / 1</b></div>
<div class="c3"><small>Task</small><b>tsk_7Q2M</b></div><div class="c3"><small>Rule</small><b>conversions ≥ 120</b></div><div class="c2"><small>Drawn</small><b>Worker</b></div><div class="c2"><small>Checked</small><b>Verifier</b></div><div class="c2"><small>Rev</small><b>A</b></div></div></div>
<div class="hatchlegend"><span><svg><rect width="34" height="16" fill="url(#hSparse)"/></svg>Private to the worker</span><span><svg><rect width="34" height="16" fill="url(#hCross)"/></svg>Source data, private</span><span><svg><rect width="34" height="16" fill="url(#hDots)"/></svg>Signed claim</span><span><svg><rect width="34" height="16" fill="url(#hDense)"/></svg>On-chain check</span><span><svg><rect width="34" height="16" fill="url(#hSolid)"/></svg>Funds</span></div>
</main>`,
  how: {
    h2: 'Schedule<br>of parts.', p: 'Four steps, four parts. Each has one owner and one piece of evidence. The escrow only ever inspects parts 3 and 4.',
    html: `<table class="parts"><thead><tr><th>Item</th><th>Part</th><th>Description</th><th>Evidence</th></tr></thead><tbody>
<tr><td><span class="bal">1</span></td><td><b>Define</b></td><td>A source, a metric, a threshold, a date. The rule is hashed into the task, so the worker cannot prove a different one.</td><td class="mono">condition hash</td></tr>
<tr><td><span class="bal">2</span></td><td><b>Lock</b></td><td>Fund the escrow. Money waits until a proof lands or the deadline passes.</td><td class="mono">deposit tx</td></tr>
<tr><td><span class="bal">3</span></td><td><b>Prove</b></td><td>The worker attests the source response. Only the threshold result is disclosed.</td><td class="mono">attestation · signature</td></tr>
<tr><td><span class="bal">4</span></td><td><b>Settle</b></td><td>Signature, task binding, replay and window are checked on-chain. Then the escrow releases.</td><td class="mono">release tx</td></tr></tbody></table>`,
  },
  app: { h2: 'The register.<br>Sheet 2 of 2.', p: 'Every state change is an event with an actor, a time and a transaction. Demo data, labelled as such.' },
  trust: { h2: 'General notes.', p: 'A proof shows the source returned this response. It does not show the source is right, or that the worker did the work.' },
  spec: {
    h2: 'Direction H.<br>Section.', p: 'A settlement drawn like a part: hatching for what is private, balloons for the parts, a title block for the status. Graphite on cool white, one safety orange for the flow of the proof. Technical, exact, stepped.',
    typeLab: 'Type · Chivo (800 display, 400–700 text), Chivo Mono for annotations and dimensions only; tabular figures',
    type: `<div class="big">Pay when it’s <span style="box-shadow:inset 0 -.16em 0 var(--acc)">proven.</span></div><p style="color:var(--ink-2);max-width:62ch;margin:16px 0 0">Task <span class="num">tsk_7Q2M</span> settled <span class="num">2,500.00</span> USDC to Ada. <span class="num">126,480.50 · 94.1% · 3h 12m</span>.</p>`,
    roles: [['paper', 'var(--paper)'], ['table', 'var(--bg)'], ['graphite', 'var(--ink)', 'var(--paper)'], ['flow', 'var(--acc)', 'var(--acc-ink)']],
    motionLab: 'Motion · draw-on, stepped', motion: 'Layers take the orange edge in order; arrows draw on in 8 hard steps; the payout dimension appears last. Buttons press 2 px into their hard shadow. Reduced motion shows the finished drawing.',
  },
  script: `
(function(){
  var P=window.PP,ly=document.querySelectorAll('#dwg .ly'),fa=document.querySelectorAll('#dwg .fa'),pay=document.querySelector('#dwg .pay'),t=[];
  function reset(){t.forEach(clearTimeout);t=[];ly.forEach(function(e){e.classList.remove('on')});fa.forEach(function(e){e.classList.remove('on')});pay.classList.remove('on')}
  function run(){reset();
    ly.forEach(function(e,i){t.push(setTimeout(function(){e.classList.add('on')},500+i*900));if(fa[i])t.push(setTimeout(function(){fa[i].classList.add('on')},500+i*900+300))});
    t.push(setTimeout(function(){pay.classList.add('on')},500+5*900));
    t.push(setTimeout(run,500+5*900+4500))}
  if(P.reduced){ly.forEach(function(e){e.classList.add('on')});fa.forEach(function(e){e.classList.add('on')});pay.classList.add('on')}else run();
})();`,
};
