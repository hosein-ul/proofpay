// G — Thread: the settlement as a conversation between a payer, a worker and the escrow. Conversational archetype, black / white / sky.
export default {
  letter: 'G', name: 'Thread', slug: 'g-thread',
  fonts: 'family=Onest:wght@400;500;600;700;800',
  light: `--bg:#F4F5F7;--surface:#FFFFFF;--sunk:#EBEDF1;--ink:#0E1014;--ink-2:#4B515C;--ink-3:#868D99;--line:rgba(14,16,20,.08);--line-2:rgba(14,16,20,.18);
--acc:#0A84D6;--acc-ink:#FFFFFF;--acc-soft:#E1F1FC;--ok:#0E7E57;--ok-bg:#DDF2EA;--warn:#9A5B07;--warn-bg:#FAEBCC;--bad:#C0352B;--bad-bg:#FADFDC;--info:#0A74BE;--info-bg:#E1F1FC;
--sans:'Onest',ui-sans-serif,system-ui,sans-serif;--r1:12px;--r2:18px;--r3:28px;--shadow:0 1px 2px rgba(14,16,20,.05),0 30px 60px -28px rgba(14,16,20,.3);--shadow-s:0 1px 2px rgba(14,16,20,.1);--bub-w:#0E1014;--bub-wt:#FFFFFF;--bub-g:#E9ECF0`,
  dark: `--bg:#0C0D10;--surface:#16181D;--sunk:#101216;--ink:#EDEFF3;--ink-2:#A4AAB5;--ink-3:#6D7480;--line:rgba(237,239,243,.08);--line-2:rgba(237,239,243,.18);
--acc:#4DB6FF;--acc-ink:#04182A;--acc-soft:rgba(77,182,255,.15);--ok:#52D6A0;--ok-bg:rgba(82,214,160,.13);--warn:#F0B550;--warn-bg:rgba(240,181,80,.13);--bad:#FF8076;--bad-bg:rgba(255,128,118,.13);--info:#4DB6FF;--info-bg:rgba(77,182,255,.15);
--shadow:0 0 0 1px rgba(255,255,255,.06),0 30px 60px -30px rgba(0,0,0,.9);--shadow-s:0 0 0 1px rgba(255,255,255,.07);--bub-w:#EDEFF3;--bub-wt:#0E1014;--bub-g:#22252C`,
  logo: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M4 5h20a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H13l-6 5v-5H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" fill="var(--ink)"/><path d="M8.500 13.500l3.500 3.500 7.500-7.500" fill="none" stroke="var(--acc)" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  miniLogo: `<svg width="22" height="22" viewBox="0 0 28 28"><path d="M4 5h20a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H13l-6 5v-5H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" fill="var(--ink)"/><path d="M8.500 13.500l3.500 3.500 7.500-7.500" fill="none" stroke="var(--acc)" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  cfg: { spark: 'line', chart: 'line', lw: 2.2, seed: 33 },
  css: `
.brand{font-weight:800;letter-spacing:-.035em}
.btn{border-radius:999px;font-weight:600}
.hero{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:56px;align-items:center;padding:32px 0 0}
.stat{display:inline-flex;gap:8px;align-items:center;font:600 13px var(--sans);color:var(--ink-2);padding:6px 14px 6px 10px;border-radius:999px;background:var(--surface);box-shadow:var(--shadow-s)}
.stat i{width:8px;height:8px;border-radius:50%;background:var(--warn)}
h1{font:700 clamp(46px,5.8vw,86px)/.98 var(--sans);letter-spacing:-.045em;margin:22px 0 20px}
h1 em{font-style:normal;color:var(--acc)}
.lede{font-size:18px;color:var(--ink-2);max-width:40ch;margin:0 0 26px}
.attr{margin:20px 0 0;font-size:12.5px;color:var(--ink-3);max-width:44ch}.attr a{border-bottom:1px solid var(--line-2)}
.chat{background:var(--surface);border-radius:var(--r3);box-shadow:var(--shadow);overflow:hidden;display:flex;flex-direction:column;min-height:640px;position:relative}
.ch-head{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--line)}
.avs{display:flex}.av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font:700 13px var(--sans);border:2px solid var(--surface)}
.avs .av+.av{margin-left:-10px}
.av.p{background:var(--ink);color:var(--surface)}.av.w{background:#F1B97C;color:#3a2108}.av.s{background:var(--acc);color:var(--acc-ink)}
.ch-head b{font-weight:700;letter-spacing:-.01em;display:block;line-height:1.15}.ch-head small{color:var(--ink-3);font-size:12.5px}
.msgs{flex:1;padding:22px 20px 10px;display:flex;flex-direction:column;gap:12px;overflow:hidden}
.m{display:flex;gap:10px;max-width:88%;opacity:0;transform:translateY(16px) scale(.96);transform-origin:var(--o,0 100%);transition:opacity .35s,transform .55s cubic-bezier(.3,1.5,.5,1)}
.m.in{opacity:1;transform:none}
.m.me{align-self:flex-end;flex-direction:row-reverse;--o:100% 100%}
.m.sys{align-self:stretch;max-width:100%;justify-content:center}
.bub{padding:11px 16px;border-radius:20px;font-size:15px;line-height:1.4}
.me .bub{background:var(--bub-w);color:var(--bub-wt);border-bottom-right-radius:6px}
.th .bub{background:var(--bub-g);border-bottom-left-radius:6px}
.ts{font-size:11.5px;color:var(--ink-3);margin:4px 6px 0}
.col{display:flex;flex-direction:column;min-width:0}.me .col{align-items:flex-end}
.card{margin-top:8px;border:1px solid var(--line-2);border-radius:var(--r2);background:var(--surface);padding:12px 14px;font-size:13px;min-width:260px;box-shadow:var(--shadow-s)}
.card h6{margin:0 0 8px;font:700 12px var(--sans);display:flex;align-items:center;gap:8px;color:var(--ink-2)}
.card .kv{display:grid;grid-template-columns:96px 1fr;gap:5px 10px}.card .kv dt{color:var(--ink-3)}.card .kv dd{margin:0;font-weight:600;font-variant-numeric:tabular-nums}
.card .claim{margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--acc-soft);color:var(--acc);font-weight:700;display:flex;gap:8px;align-items:center}
:root[data-theme="dark"] .card .claim{color:var(--acc)}
.rd{display:inline-block;height:.95em;vertical-align:-2px;border-radius:99px;background:var(--ink);opacity:.85}
.typing{display:inline-flex;gap:4px;padding:15px 16px;background:var(--bub-g);border-radius:20px;border-bottom-left-radius:6px}
.typing i{width:7px;height:7px;border-radius:50%;background:var(--ink-3);animation:dot 1s infinite}
.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}
@keyframes dot{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-5px);opacity:1}}
.vlist{display:grid;gap:4px;margin-top:6px}
.vi{display:flex;align-items:center;gap:8px;color:var(--ink-3);font-size:13px;transition:color .2s}
.vi b{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line-2);display:grid;place-items:center;transition:all .3s cubic-bezier(.3,1.6,.5,1);flex:none}
.vi svg{width:9px;height:9px;stroke:var(--acc-ink);opacity:0}
.vi.on{color:var(--ink)}.vi.on b{background:var(--acc);border-color:var(--acc);transform:scale(1.1)}.vi.on svg{opacity:1}
.sysb{font-size:13px;color:var(--ink-2);text-align:center;padding:8px 16px;border-radius:999px;background:var(--sunk)}
.sysb b{color:var(--ink);font-weight:700}
.composer{display:flex;align-items:center;gap:10px;padding:12px 16px 16px;border-top:1px solid var(--line)}
.composer .field{flex:1;border-radius:999px;background:var(--sunk);border-color:transparent;height:44px}
.send{width:44px;height:44px;border-radius:50%;border:0;background:var(--acc);color:var(--acc-ink);display:grid;place-items:center;cursor:pointer;transition:transform .3s cubic-bezier(.3,1.6,.5,1)}
.send:hover{transform:scale(1.08)}.send:active{transform:scale(.94)}.send svg{width:18px;height:18px}
.sim{background:var(--sunk);border-style:solid;border-color:transparent}
/* how: a transcript */
.tr2{display:grid;gap:0;border-top:1px solid var(--line-2)}
.tr2 .row{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.4fr);gap:40px;align-items:center;padding:30px 0;border-bottom:1px solid var(--line-2)}
.tr2 h3{margin:0 0 6px;font:700 34px/1 var(--sans);letter-spacing:-.04em}
.tr2 p{margin:0;color:var(--ink-2);max-width:36ch}
.tr2 .who{font:600 12.5px var(--sans);color:var(--ink-3);display:flex;align-items:center;gap:8px;margin-bottom:10px}
.tr2 .who .av{width:22px;height:22px;font-size:10px;border:0}
.tr2 .bub{display:inline-block;max-width:44ch}
.tr2 .row .right{display:flex}.tr2 .row .right.me{justify-content:flex-end}
.tr2 .row .bub{background:var(--bub-g);border-bottom-left-radius:6px}
.tr2 .row .right.me .bub{background:var(--bub-w);color:var(--bub-wt);border-bottom-left-radius:20px;border-bottom-right-radius:6px}
.tr2 .row .right.sys{justify-content:center}.tr2 .row .right.sys .bub{background:var(--sunk);border-radius:999px;font-size:13.5px;color:var(--ink-2)}
/* app: soft bubbles */
.ov-nav .nv.on{background:var(--ink);color:var(--surface)}.ov-nav .nv.on .ct{color:var(--surface)}
.nv{border-radius:999px}
.kpi{border:0;border-radius:var(--r2);background:var(--surface);box-shadow:var(--shadow-s)}
.kpi strong{font-weight:700}
.ov-pane{border:0;border-radius:var(--r2);box-shadow:var(--shadow-s)}
.fi,.att{background:var(--sunk);border-radius:16px 16px 16px 6px;padding:10px 14px;margin-bottom:8px;border-top:0!important}
.att{background:var(--warn-bg);border-radius:16px 16px 6px 16px}
.att:nth-child(2){background:var(--bad-bg)}
.fi+.fi,.att+.att{border-top:0}
.chip{border-radius:999px;font-weight:700}
.tm>div{border:0;border-radius:var(--r3);box-shadow:var(--shadow-s)}
.tm .yes{background:var(--surface)}.tm .no{background:var(--sunk)}
.big{font:700 76px/.95 var(--sans);letter-spacing:-.045em}
h2{font-weight:700;letter-spacing:-.04em}
@media(max-width:1000px){.hero{grid-template-columns:1fr;gap:36px}.tr2 .row{grid-template-columns:1fr;gap:16px}}
@media(max-width:560px){.chat{min-height:640px}.m{max-width:96%}.big{font-size:44px}.card{min-width:0;width:100%}}
`,
  hero: `<main class="hero">
<div><span class="stat"><i></i>Testnet beta · Proofs by Primus zkTLS</span><h1>Pay when<br>it’s <em>proven.</em></h1>
<p class="lede">The payer says what counts. The worker answers with a proof. The escrow replies with the money, or with why not. A task is a short thread you can read.</p>
<div class="cta"><a class="btn pri" href="#">Request access</a><a class="btn" href="#">Try a settlement</a></div>
<p class="attr">A proof shows the source returned this response, not that its data is true. Simulation threads use synthetic proofs and are labelled.</p></div>
<div class="chat" role="img" aria-label="A simulated task thread between a payer, a worker and the escrow">
<div class="ch-head"><div class="avs"><span class="av p">N</span><span class="av w">A</span><span class="av s">P</span></div><div><b>tsk_7Q2M · Q4 growth campaign</b><small>Northgate · Ada (agent) · ProofPay</small></div><span class="sp"></span><span class="sim">Simulation</span></div>
<div class="msgs" id="msgs">
<div class="m me" data-t="300"><div class="col"><div class="bub">Release 2,500.00 USDC to Ada when conversions ≥ 120 by Nov 14.</div>
<div class="card"><h6><span class="chip c-info"><i></i>Funded</span>Task created</h6><dl class="kv"><dt>Amount</dt><dd>2,500.00 USDC</dd><dt>Source</dt><dd>partner.example/api/q4</dd><dt>Rule hash</dt><dd>0x71a3…e90c</dd></dl></div><span class="ts">Northgate · 09:12</span></div></div>
<div class="m th" data-t="1700"><span class="av w">A</span><div class="col"><div class="bub">On it. Pulling the Q4 campaign stats.</div><span class="ts">Ada · agent · 09:40</span></div></div>
<div class="m th" data-t="2900" data-typing="1"><span class="av w">A</span><div class="typing" aria-label="Ada is typing"><i></i><i></i><i></i></div></div>
<div class="m th" data-t="4300"><span class="av w">A</span><div class="col"><div class="bub">Proof attached. The threshold is met.</div>
<div class="card"><h6><span class="chip c-warn"><i></i>Proving</span>Attestation · synthetic</h6><dl class="kv"><dt>Attestor</dt><dd>0x9F3c…c21E</dd><dt>Withheld</dt><dd><span class="rd" style="width:84px"></span> 3 fields</dd></dl><div class="claim"><svg width="16" height="16"><use href="#i-check"/></svg>conversions ≥ 120 → true</div></div><span class="ts">Ada · agent · 09:41</span></div></div>
<div class="m sys" data-t="5700" data-verify="1"><div class="col" style="align-items:center"><span class="sysb"><b>ProofPay</b> is verifying</span><div class="vlist" id="vlist"></div></div></div>
<div class="m sys" data-t="9300"><span class="sysb"><b>Verified.</b> Released 2,500.00 USDC to Ada · agent · tx 0x6be1…d91f</span></div>
</div>
<div class="composer"><label class="field"><input placeholder="Describe a rule to try it…" aria-label="Message"></label><button class="send" aria-label="Send" type="button"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3M3.500 7.500L8 3l4.500 4.500"/></svg></button></div>
</div></main>`,
  how: {
    h2: 'Every state<br>is a message.', p: 'Define, lock, prove, settle. Read the thread and you have the audit trail: who said what, when, with which transaction.',
    html: `<div class="tr2">
<div class="row"><div><div class="who"><span class="av p">N</span>Payer</div><h3>Define</h3><p>Say what counts in plain words. The rule is hashed into the task.</p></div><div class="right me"><span class="bub">Pay Ada 2,500.00 USDC if conversions ≥ 120 by Nov 14.</span></div></div>
<div class="row"><div><div class="who"><span class="av s">P</span>Escrow</div><h3>Lock</h3><p>Funds wait in the escrow until a proof lands or the deadline passes.</p></div><div class="right sys"><span class="bub"><b style="color:var(--ink)">Funded.</b> 2,500.00 USDC locked · tx 0x11aa…42f0</span></div></div>
<div class="row"><div><div class="who"><span class="av w">A</span>Worker</div><h3>Prove</h3><p>Answer with a proof. Only the threshold result is disclosed.</p></div><div class="right"><span class="bub">Proof attached. conversions ≥ 120 is true; 3 fields withheld.</span></div></div>
<div class="row"><div><div class="who"><span class="av s">P</span>Escrow</div><h3>Settle</h3><p>Signature, task binding, replay and window are checked. Then it pays.</p></div><div class="right sys"><span class="bub"><b style="color:var(--ink)">Verified.</b> Released 2,500.00 USDC to Ada · tx 0x6be1…d91f</span></div></div></div>`,
  },
  app: { h2: 'All your threads,<br>one overview.', p: 'Every state change is an event with an actor, a time and a transaction. Demo data, labelled as such.' },
  trust: { h2: 'What the reply proves.<br>And what it doesn’t.', p: 'A proof shows the source returned this response. It does not show the source is right, or that the worker did the work.' },
  spec: {
    h2: 'Direction G.<br>Thread.', p: 'The product as a conversation: bubbles, cards, a checklist that ticks. Black, white and one sky blue. Conversational, plain, quick to read. Elastic motion.',
    typeLab: 'Type · Onest (700–800 display, 400–600 text); tabular figures; no mono face',
    type: `<div class="big">Pay when it’s <span style="color:var(--acc)">proven.</span></div><p style="color:var(--ink-2);max-width:62ch;margin:16px 0 0">Task <span class="num">tsk_7Q2M</span> settled <span class="num">2,500.00</span> USDC to Ada. <span class="num">126,480.50 · 94.1% · 3h 12m</span>.</p>`,
    roles: [['ground', 'var(--bg)'], ['surface', 'var(--surface)'], ['payer', 'var(--bub-w)', 'var(--bub-wt)'], ['worker', 'var(--bub-g)'], ['sky', 'var(--acc)', 'var(--acc-ink)']],
    motionLab: 'Motion · elastic, conversational', motion: 'Messages rise in with a 550 ms overshoot spring. Typing dots bounce on a 1 s loop. The verification ticks pop at 400 ms intervals. Reduced motion shows the whole thread at once.',
  },
  script: `
(function(){
  var P=window.PP,$=P.$,ms=document.querySelectorAll('#msgs .m'),tm=[];
  var S=['Signature valid','Attestor registered','Bound to this task','Not replayed','Within window','Condition satisfied'];
  $('vlist').innerHTML=S.map(function(s){return '<div class="vi"><b><svg viewBox="0 0 12 12"><use href="#i-check"/></svg></b>'+s+'</div>'}).join('');
  var vi=document.querySelectorAll('#vlist .vi');
  function reset(){tm.forEach(clearTimeout);tm=[];ms.forEach(function(m){m.classList.remove('in')});vi.forEach(function(v){v.classList.remove('on')})}
  function run(){reset();
    ms.forEach(function(m){var t=+m.dataset.t;tm.push(setTimeout(function(){m.classList.add('in')},t));
      if(m.dataset.typing){tm.push(setTimeout(function(){m.style.display='none'},4200));}
      if(m.dataset.verify){vi.forEach(function(v,i){tm.push(setTimeout(function(){v.classList.add('on')},t+500+i*450))})}});
    // typing bubble returns for next run
    tm.push(setTimeout(function(){ms.forEach(function(m){m.style.display=''});run()},14500))}
  if(P.reduced){ms.forEach(function(m){if(!m.dataset.typing)m.classList.add('in');else m.style.display='none'});vi.forEach(function(v){v.classList.add('on')})}else run();
})();`,
};
