// D — Route: settlement as a transit line. Wayfinding × cartographic. Light cool-grey ground, three meaningful line colours.
export default {
  letter: 'D', name: 'Route', slug: 'd-route',
  fonts: 'family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700',
  light: `--bg:#ECEFF2;--surface:#FFFFFF;--sunk:#E1E5EA;--ink:#0F141B;--ink-2:#434C58;--ink-3:#79838F;--line:rgba(15,20,27,.1);--line-2:rgba(15,20,27,.24);
--acc:#0B8F52;--acc-ink:#FFFFFF;--acc-soft:#DAF0E5;--ok:#0A7A49;--ok-bg:#DAF0E5;--warn:#9B5B05;--warn-bg:#FBEACB;--bad:#C0352A;--bad-bg:#FADFDB;--info:#1B5DB4;--info-bg:#DEE9F8;
--refund:#E39A0E;--dispute:#D23A2E;--sans:'Barlow',ui-sans-serif,system-ui,sans-serif;--cond:'Barlow Condensed','Barlow',sans-serif;
--r1:4px;--r2:6px;--r3:10px;--shadow:0 1px 2px rgba(15,20,27,.06),0 18px 40px -20px rgba(15,20,27,.25);--shadow-s:0 1px 2px rgba(15,20,27,.12)`,
  dark: `--bg:#0D1115;--surface:#141A20;--sunk:#0A0D10;--ink:#EEF1F4;--ink-2:#A6AFBA;--ink-3:#6C7683;--line:rgba(238,241,244,.09);--line-2:rgba(238,241,244,.22);
--acc:#38D087;--acc-ink:#04170D;--acc-soft:rgba(56,208,135,.14);--ok:#4FD99A;--ok-bg:rgba(79,217,154,.13);--warn:#F0B454;--warn-bg:rgba(240,180,84,.13);--bad:#FF867B;--bad-bg:rgba(255,134,123,.13);--info:#7DB2F5;--info-bg:rgba(125,178,245,.13);
--refund:#F0B454;--dispute:#FF6F62;--shadow:0 0 0 1px rgba(255,255,255,.05),0 30px 60px -30px rgba(0,0,0,.8);--shadow-s:0 0 0 1px rgba(255,255,255,.06)`,
  logo: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="none" stroke="var(--acc)" stroke-width="4.5"/><rect x="1" y="11.2" width="26" height="5.6" rx="1" fill="var(--ink)"/></svg>`,
  miniLogo: `<svg width="22" height="22" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="var(--acc)" stroke-width="4.5"/><rect x="1" y="11.2" width="26" height="5.6" rx="1" fill="#fff"/></svg>`,
  cfg: { spark: 'line', chart: 'step', noFill: true, lw: 2.4, seed: 3 },
  css: `
.brand{font-family:var(--cond);font-weight:700;font-size:25px;letter-spacing:-.005em}
.btn{font-weight:600;letter-spacing:.005em;text-transform:none}
.hero{padding:28px 0 0}
.d-head{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:56px;align-items:end;margin-bottom:34px}
.linechip{display:inline-flex;align-items:center;gap:10px;font:600 14px var(--sans);color:var(--ink-2)}
.rd{width:26px;height:26px;border-radius:50%;background:var(--acc);color:var(--acc-ink);display:grid;place-items:center;font:700 14px var(--cond)}
h1{font:700 clamp(54px,8vw,124px)/.88 var(--cond);letter-spacing:-.01em;margin:16px 0 0;text-transform:none}
h1 em{font-style:normal;color:var(--acc)}
.lede{font-size:18px;color:var(--ink-2);margin:0 0 22px;max-width:44ch}
.attr{margin:18px 0 0;font-size:13px;color:var(--ink-3);max-width:46ch}.attr a{border-bottom:1px solid var(--line-2)}
.map{background:var(--surface);border:1px solid var(--line-2);border-radius:var(--r3);box-shadow:var(--shadow);overflow:hidden}
.mbar{display:flex;align-items:center;gap:14px;background:var(--ink);color:var(--bg);padding:11px 20px;font:600 14px var(--sans)}
:root[data-theme="dark"] .mbar{background:#212A33;color:var(--ink)}
.mbar .rd{width:22px;height:22px;font-size:12px}
.mbar .next{font:600 15px var(--cond);letter-spacing:.02em;display:flex;gap:10px;align-items:center}
.mbar .sim{color:var(--bg);border-color:rgba(255,255,255,.5)}
:root[data-theme="dark"] .mbar .sim{color:var(--ink)}
.msvg{display:block;width:100%;height:auto;padding:10px 12px 0}
.msvg .main{stroke:var(--acc);stroke-width:14;fill:none;stroke-linecap:round}
.msvg .br{fill:none;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
.msvg .refund{stroke:var(--refund);stroke-dasharray:1 17;stroke-width:9}
.msvg .refund.solid{stroke-dasharray:none;opacity:.22}
.msvg .disp{stroke:var(--dispute);opacity:.28}
.msvg .st{fill:var(--surface);stroke:var(--ink);stroke-width:5;transition:fill .25s steps(2,end)}
.msvg .st.done{fill:var(--ink)}
.msvg .st.cur{stroke:var(--acc);fill:var(--surface);stroke-width:7}
.msvg .bst{fill:var(--surface);stroke:var(--ink-3);stroke-width:4}
.msvg .term{fill:var(--ink-3)}
.msvg .nm{font:700 26px var(--cond);fill:var(--ink);letter-spacing:.005em}
.msvg .nm.sm{font-size:21px;fill:var(--ink-2)}
.msvg .ds{font:500 14.5px var(--sans);fill:var(--ink-3)}
.msvg .tag{font:700 13px var(--sans);letter-spacing:.06em;text-transform:uppercase}
.msvg .pay{opacity:0;transition:opacity .3s}.msvg .pay.show{opacity:1}
.msvg .train rect{fill:var(--ink)}.msvg .train text{font:700 13px var(--sans);fill:var(--surface);letter-spacing:.04em}
.mleg{display:flex;gap:24px;flex-wrap:wrap;padding:12px 20px 14px;border-top:1px solid var(--line);font-size:13px;color:var(--ink-2)}
.mleg span{display:inline-flex;align-items:center;gap:8px}
.mleg i{width:26px;height:6px;border-radius:3px;display:block}
/* how: vertical line diagram + timetable */
.how{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px;align-items:start}
.lined{position:relative;padding-left:56px}
.lined::before{content:"";position:absolute;left:19px;top:14px;bottom:30px;width:12px;border-radius:6px;background:var(--acc)}
.stop{position:relative;padding:0 0 34px}
.stop:last-child{padding-bottom:0}
.stop::before{content:"";position:absolute;left:-46px;top:4px;width:26px;height:26px;border-radius:50%;background:var(--surface);border:5px solid var(--ink);z-index:1}
.stop h3{margin:0 0 4px;font:700 28px/1.1 var(--cond)}
.stop p{margin:0;color:var(--ink-2);max-width:46ch}
.stop .tg{display:inline-block;margin-top:8px;font:600 12.5px var(--sans);color:var(--ink-3);padding:2px 8px;border:1px solid var(--line-2);border-radius:3px}
.tt{border:1px solid var(--line-2);border-radius:var(--r3);overflow:hidden;background:var(--surface);box-shadow:var(--shadow)}
.tt h4{margin:0;padding:12px 18px;background:var(--ink);color:var(--bg);font:700 18px var(--cond);letter-spacing:.02em}
:root[data-theme="dark"] .tt h4{background:#212A33;color:var(--ink)}
.tt table{width:100%;border-collapse:collapse;font-size:14px}
.tt th{text-align:left;font:600 12px var(--sans);color:var(--ink-3);padding:10px 18px 6px;border-bottom:1px solid var(--line-2)}
.tt td{padding:10px 18px;border-bottom:1px solid var(--line)}
.tt tr:last-child td{border-bottom:0}
.tt td:first-child{font:700 18px var(--cond)}
.tt .ex td{color:var(--ink-3)}
/* app: dark rail, stepped chart, feed as stations */
.ov-nav{background:#10161C;border-right:0;color:#E9EDF1}
:root[data-theme="dark"] .ov-nav{background:#0A0D10}
.ov-nav .nv{color:#A9B3BF}.ov-nav .nv:hover{background:rgba(255,255,255,.07)}
.ov-nav .nv.on{background:rgba(255,255,255,.08);color:#fff;box-shadow:inset 3px 0 0 var(--acc);border-radius:0 4px 4px 0}
.ov-ws{border-color:rgba(255,255,255,.12);color:#fff;font-family:var(--cond);font-size:16px}
.ov-ws small{color:#8693A1}
.ov-ph h3{font:700 36px/1 var(--cond);letter-spacing:0}
.kpi{border-radius:var(--r2);border-top:4px solid var(--ink)}
.kpi:nth-child(1){border-top-color:var(--acc)}.kpi:nth-child(5){border-top-color:var(--info)}
.kpi strong{font:700 34px/1 var(--cond);letter-spacing:0}
.ov-pane{border-radius:var(--r2)}
.ov-pane h4{font:700 17px var(--cond);letter-spacing:.01em}
.fi{position:relative;padding-left:26px}
.fi:first-child::after,.fi::after{content:"";position:absolute;left:5px;top:0;bottom:0;width:5px;background:var(--acc)}
.fi:first-child::after{top:14px}.fi:last-child::after{bottom:calc(100% - 14px)}
.fi::before{content:"";position:absolute;left:0;top:11px;width:15px;height:15px;border-radius:50%;background:var(--surface);border:4px solid var(--ink);z-index:1}
.fi .chip{order:2}
.fi{flex-direction:column;gap:2px}
.att{border-left:5px solid var(--warn);padding-left:12px;margin-bottom:8px;background:var(--sunk);border-radius:0 var(--r1) var(--r1) 0;border-top:0!important}
.att:nth-child(2){border-left-color:var(--bad)}
.chip{border-radius:3px;font-weight:700;letter-spacing:.01em}
.chip i{border-radius:1px}
.tscroll th{font:600 12.5px var(--sans);border-bottom:2px solid var(--ink)}
.tscroll tbody tr:hover td:first-child{box-shadow:inset 4px 0 0 var(--acc)}
.tm>div{border-top:6px solid var(--acc)}.tm .no{border-top-color:var(--dispute)}
.tm h3{font:700 30px var(--cond)}
.big{font:700 76px/.9 var(--cond)}
h2{font-family:var(--cond);font-weight:700;letter-spacing:-.005em;font-size:clamp(38px,4.6vw,66px);line-height:.95}
@media(max-width:1000px){.d-head,.how{grid-template-columns:1fr;gap:28px}}
@media(max-width:560px){.mleg{gap:10px 18px}.mbar .next{display:none}.big{font-size:48px}.msvg .nm{font-size:30px}.msvg .ds{font-size:17px}}
`,
  hero: `<main class="hero">
<div class="d-head"><div><span class="linechip"><span class="rd">1</span>Line 1 · Payment · Testnet beta</span><h1>Pay when<br>it’s <em>proven.</em></h1></div>
<div><p class="lede">Funds ride the line from Draft to Settled. They only get off at a station when the proof says so. Wrong turn? Refund and dispute lines are built in.</p><div class="cta"><a class="btn pri" href="#">Request access</a><a class="btn" href="#">Try a settlement</a></div><p class="attr">Proofs by <a href="https://docs.primuslabs.xyz" rel="noopener">Primus zkTLS</a>. A proof shows the source returned this response, not that its data is true.</p></div></div>
<div class="map"><div class="mbar"><span class="rd">1</span><span>Settlement line</span><span class="next" id="next">Next stop · Funded</span><span class="sp"></span><span class="sim">Simulation · synthetic proof</span></div>
<svg class="msvg" id="msvg" viewBox="0 0 1200 350" role="img" aria-label="Route map of a task: Draft, Funded, Awaiting proof, Proving, Verified, Settled, with refund and dispute branches"></svg>
<div class="mleg"><span><i style="background:var(--acc)"></i>Line 1 · Payment</span><span><i style="background:repeating-linear-gradient(90deg,var(--refund) 0 5px,transparent 5px 11px)"></i>Line 2 · Expiry and refund</span><span><i style="background:var(--dispute);opacity:.5"></i>Line 3 · Dispute</span><span class="sp"></span><span class="dim">Task tsk_7Q2M · release 2,500.00 USDC when conversions ≥ 120</span></div></div>
</main>`,
  how: {
    h2: 'Four stops<br>you can read.', p: 'Define, lock, prove, settle. The state names are the same in the contract, the API, the database and this map.',
    html: `<div class="how"><div class="lined">
<div class="stop"><h3>Define</h3><p>Pick a source, a metric and a threshold. The rule is hashed into the task, so the worker cannot prove a different one.</p><span class="tg">Draft</span></div>
<div class="stop"><h3>Lock</h3><p>Fund the escrow. Money waits at Funded until a proof lands or the deadline passes.</p><span class="tg">Funded · Awaiting proof</span></div>
<div class="stop"><h3>Prove</h3><p>The worker attests the source response. Only the threshold result is disclosed.</p><span class="tg">Proving · Verified</span></div>
<div class="stop"><h3>Settle</h3><p>The escrow checks signature, task binding, replay and window, then releases.</p><span class="tg">Settled</span></div></div>
<div class="tt"><h4>Timetable · who moves the task</h4><table><thead><tr><th>State</th><th>Actor</th><th>Evidence</th></tr></thead><tbody>
<tr><td>Draft</td><td>Payer</td><td>Condition hash</td></tr><tr><td>Funded</td><td>Payer</td><td>Deposit tx</td></tr><tr><td>Awaiting proof</td><td>Worker</td><td>—</td></tr><tr><td>Proving</td><td>Worker</td><td>Attestation</td></tr><tr><td>Verified</td><td>Verifier</td><td>Signature check</td></tr><tr><td>Settled</td><td>Escrow</td><td>Release tx</td></tr>
<tr class="ex"><td>Expired → Refunded</td><td>Payer</td><td>Refund tx</td></tr><tr class="ex"><td>Disputed → Resolved</td><td>Arbiter</td><td>Resolution tx</td></tr></tbody></table></div></div>`,
  },
  app: { h2: 'The control room,<br>one screen.', p: 'Every state change is an event with an actor, a time and a transaction. Demo data, labelled as such.' },
  trust: { h2: 'What the signal says.<br>And what it can’t.', p: 'A proof shows the source returned this response. It does not show the source is right, or that the worker did the work.' },
  spec: {
    h2: 'Direction D.<br>Route.', p: 'Settlement as a transit line. Signage typography, three line colours that mean something, stepped motion like a train between stops. Light first. Wayfinding × cartographic.',
    typeLab: 'Type · Barlow Condensed for signage and figures, Barlow for text; tabular figures; no mono face',
    type: `<div class="big">Pay when it’s <span style="color:var(--acc)">proven.</span></div><p style="color:var(--ink-2);max-width:62ch;margin:16px 0 0">Task <span class="num">tsk_7Q2M</span> settled <span class="num">2,500.00</span> USDC to Ada. <span class="num">126,480.50 · 94.1% · 3h 12m</span>.</p>`,
    roles: [['ground', 'var(--bg)'], ['surface', 'var(--surface)'], ['ink', 'var(--ink)', 'var(--bg)'], ['payment', 'var(--acc)', 'var(--acc-ink)'], ['refund', 'var(--refund)', '#1c1200'], ['dispute', 'var(--dispute)', '#fff']],
    motionLab: 'Motion · mechanical, stepped', motion: 'The marker moves between stops in 1.0 s ease-in-out and dwells 0.9 s at each station, which fills in. Hover and press feedback is 150 ms. Reduced motion shows the finished route.',
  },
  script: `
(function(){
  var P=window.PP,svg=P.$('msvg'),X=[70,290,510,730,930,1130],Y=170;
  var ST=[['Draft','Rule written','b'],['Funded','USDC locked','t'],['Awaiting proof','Worker is up','t'],['Proving','Attestation in flight','b'],['Verified','Checks pass','t'],['Settled','Paid out','b']];
  var h='<path class="br refund solid" d="M510 170V300H700"/><path class="br refund" d="M510 170V300H700"/><path class="br disp" d="M730 170V62H1010"/><path class="main" d="M70 170H1130"/>';
  ST.forEach(function(s,i){var x=X[i],top=s[2]==='t';
    h+='<circle class="st" id="st'+i+'" cx="'+x+'" cy="'+Y+'" r="14"/>';
    h+='<text class="nm" x="'+x+'" y="'+(top?Y-48:Y+50)+'" text-anchor="middle">'+s[0]+'</text><text class="ds" x="'+x+'" y="'+(top?Y-27:Y+71)+'" text-anchor="middle">'+s[1]+'</text>'});
  h+='<circle class="bst" cx="510" cy="245" r="10"/><text class="nm sm" x="532" y="243">Expired</text><text class="ds" x="532" y="263">Deadline passed</text>';
  h+='<rect class="term" x="690" y="290" width="20" height="20" rx="3"/><text class="nm sm" x="722" y="299">Refunded</text><text class="ds" x="722" y="319">Back to payer</text>';
  h+='<circle class="bst" cx="730" cy="112" r="10"/><text class="nm sm" x="752" y="110">Disputed</text><text class="ds" x="752" y="130">Flagged</text>';
  h+='<rect class="term" x="1000" y="52" width="20" height="20" rx="3"/><text class="nm sm" x="1032" y="61">Resolved</text><text class="ds" x="1032" y="81">Arbiter decides</text>';
  h+='<text class="tag" x="296" y="224" fill="var(--refund)" style="display:none">Refund</text>';
  h+='<g class="pay" id="pay"><rect x="1000" y="214" width="190" height="34" rx="4" fill="var(--acc)"/><text x="1095" y="236" text-anchor="middle" style="font:700 16px var(--sans);fill:var(--acc-ink)">+2,500.00 USDC</text></g>';
  h+='<g class="train" id="train"><rect x="-37" y="-15" width="74" height="30" rx="6"/><text x="0" y="5" text-anchor="middle">USDC</text></g>';
  svg.innerHTML=h;
  var train=P.$('train'),next=P.$('next'),pay=P.$('pay');
  function place(x){train.setAttribute('transform','translate('+x+','+Y+')')}
  function mark(i){ST.forEach(function(s,j){var c=P.$('st'+j).classList;c.toggle('done',j<i);c.toggle('cur',j===i)});next.textContent=i<5?'Now at · '+ST[i][0]+'    Next · '+ST[i+1][0]:'Arrived · Settled';pay.classList.toggle('show',i===5)}
  var ease=function(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
  if(P.reduced){place(X[5]);mark(5);ST.forEach(function(s,j){P.$('st'+j).classList.add('done')});return}
  var i=0,from=0,t0=0,state='dwell',tdw=0;place(X[0]);mark(0);
  function tick(ts){
    if(document.hidden){requestAnimationFrame(tick);return}
    if(!t0)t0=ts;
    var dt=ts-t0;
    if(state==='dwell'){if(dt>(i===5?3200:900)){if(i===5){i=0;mark(0);place(X[0]);t0=ts;state='dwell';requestAnimationFrame(tick);return}from=X[i];state='move';t0=ts}}
    else{var k=Math.min(1,dt/1000);place(from+(X[i+1]-from)*ease(k));if(k>=1){i++;mark(i);state='dwell';t0=ts}}
    requestAnimationFrame(tick)}
  requestAnimationFrame(tick);
})();`,
};
