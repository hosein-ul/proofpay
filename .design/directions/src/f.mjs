// F — Ink Arch: two-tone rhythm with oversized organic curves. The real Proof Inspector, staged large, rising out of an ink arch.
export default {
  letter: 'F', name: 'Ink Arch', slug: 'f-ink-arch',
  fonts: 'family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800',
  light: `--bg:#F5F6F8;--surface:#FFFFFF;--sunk:#ECEEF2;--ink:#0B0D12;--ink-2:#454B57;--ink-3:#7D8492;--line:rgba(11,13,18,.09);--line-2:rgba(11,13,18,.2);
--ink0:#0B0D12;--ink20:#454B57;--ink30:#7D8492;--line0:rgba(11,13,18,.09);--line20:rgba(11,13,18,.2);
--acc:#2B5CFF;--acc-ink:#FFFFFF;--acc-soft:#E4EBFF;--ok:#0E7E57;--ok-bg:#DDF2EA;--warn:#9A5B07;--warn-bg:#FAEBCC;--bad:#C0352B;--bad-bg:#FADFDC;--info:#2B5CFF;--info-bg:#E4EBFF;
--band:#0B0D12;--bink:#F4F6F9;--bink2:#A9B0BC;--bink3:#737B89;--bline:rgba(255,255,255,.1);--bline2:rgba(255,255,255,.24);
--sans:'Bricolage Grotesque',ui-sans-serif,system-ui,sans-serif;--r1:9px;--r2:14px;--r3:22px;--shadow:0 2px 4px rgba(11,13,18,.05),0 28px 60px -24px rgba(11,13,18,.35);--shadow-s:0 1px 2px rgba(11,13,18,.12)`,
  dark: `--bg:#090A0E;--surface:#13161C;--sunk:#0C0E12;--ink:#EEF0F4;--ink-2:#A3AAB6;--ink-3:#6B7380;--line:rgba(238,240,244,.09);--line-2:rgba(238,240,244,.2);
--ink0:#EEF0F4;--ink20:#A3AAB6;--ink30:#6B7380;--line0:rgba(238,240,244,.09);--line20:rgba(238,240,244,.2);
--acc:#7C9BFF;--acc-ink:#07102E;--acc-soft:rgba(124,155,255,.15);--ok:#52D6A0;--ok-bg:rgba(82,214,160,.13);--warn:#F0B550;--warn-bg:rgba(240,181,80,.13);--bad:#FF8076;--bad-bg:rgba(255,128,118,.13);--info:#7C9BFF;--info-bg:rgba(124,155,255,.15);
--band:#EDEFF3;--bink:#0B0D12;--bink2:#454B57;--bink3:#7D8492;--bline:rgba(11,13,18,.1);--bline2:rgba(11,13,18,.22);
--shadow:0 0 0 1px rgba(255,255,255,.06),0 30px 60px -30px rgba(0,0,0,.9);--shadow-s:0 0 0 1px rgba(255,255,255,.07)`,
  logo: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M2 26V14a12 12 0 0 1 24 0v12z" fill="var(--ink)"/><circle cx="14" cy="17" r="4.2" fill="var(--acc)"/></svg>`,
  miniLogo: `<svg width="22" height="22" viewBox="0 0 28 28"><path d="M2 26V14a12 12 0 0 1 24 0v12z" fill="var(--ink)"/><circle cx="14" cy="17" r="4.2" fill="var(--acc)"/></svg>`,
  cfg: { spark: 'bars', chart: 'bars', barR: 3, seed: 21 },
  css: `
.brand{font-weight:800;letter-spacing:-.035em;font-variation-settings:"wdth" 90}
.btn{border-radius:999px;font-weight:600}
.btn.pri{box-shadow:0 8px 22px -8px color-mix(in oklab,var(--acc) 70%,transparent)}
.hero{padding:36px 0 0;position:relative}
.h-top{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,.7fr);gap:48px;align-items:end}
h1{font:800 clamp(56px,8.6vw,132px)/.86 var(--sans);letter-spacing:-.032em;font-variation-settings:"wdth" 78;margin:0}
h1 em{font-style:normal;color:var(--acc)}
.lede{font-size:18px;color:var(--ink-2);margin:0 0 20px;max-width:34ch}
.attr{margin:16px 0 0;font-size:12.5px;color:var(--ink-3);max-width:40ch}.attr a{border-bottom:1px solid var(--line-2)}
.stat{display:inline-flex;align-items:center;gap:8px;font:600 13px var(--sans);color:var(--ink-2);margin-bottom:14px}
.stat i{width:8px;height:8px;border-radius:50%;background:var(--warn)}
/* the arch: full-bleed ink band with a huge rising curve */
.arch{--r:240px;margin:54px calc(50% - 50vw) 0;background:var(--band);border-radius:var(--r) var(--r) 0 0;padding:84px calc(50vw - 50%) 0;position:relative;overflow:hidden;--ink:var(--bink);--ink-2:var(--bink2);--ink-3:var(--bink3);--line:var(--bline);--line-2:var(--bline2)}
.arch::before{content:"";position:absolute;inset:0;background-image:radial-gradient(var(--bline2) 1px,transparent 1.2px);background-size:22px 22px;-webkit-mask:radial-gradient(70% 90% at 50% 0%,#000,transparent);mask:radial-gradient(70% 90% at 50% 0%,#000,transparent);opacity:.7}
.arch-lab{position:relative;display:flex;justify-content:center;align-items:center;gap:12px;color:var(--bink2);font:600 13px var(--sans);margin-bottom:26px}
.arch-lab .sim{color:var(--bink);border-color:var(--bink3)}
.insp{--ink:var(--ink0);--ink-2:var(--ink20);--ink-3:var(--ink30);--line:var(--line0);--line-2:var(--line20);position:relative;max-width:1120px;margin:0 auto;background:var(--surface);color:var(--ink);border-radius:var(--r3) var(--r3) 0 0;box-shadow:0 -10px 60px -20px rgba(0,0,0,.5);transform-origin:50% 100%;transform:scale(var(--sc,.96))}
.ib-top{display:flex;align-items:center;gap:12px;padding:14px 22px;border-bottom:1px solid var(--line);font-size:13px}
.ib-top b{font-weight:700;font-size:15px;letter-spacing:-.02em}
.ib-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}
.ic{padding:20px 22px 22px;position:relative}
.ic+.ic{border-left:1px solid var(--line)}
.ic+.ic::before{content:"";position:absolute;left:-9px;top:26px;width:17px;height:17px;border-radius:50%;background:var(--acc);box-shadow:0 0 0 4px var(--surface)}
.ic+.ic::after{content:"";position:absolute;left:-4px;top:32px;width:5px;height:5px;border-top:2px solid var(--acc-ink);border-right:2px solid var(--acc-ink);transform:rotate(45deg)}
.ic h5{margin:0 0 4px;font:800 18px var(--sans);letter-spacing:-.03em}
.ic small{color:var(--ink-3);font-size:12.5px;display:block;margin-bottom:12px}
.kv{display:grid;grid-template-columns:104px 1fr;gap:7px 10px;font-size:12.5px}
.kv dt{color:var(--ink-3)}.kv dd{margin:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-variant-numeric:tabular-nums}
.priv{display:inline-block;font:700 10.5px var(--sans);padding:1px 7px;border-radius:99px;background:var(--sunk);color:var(--ink-2);margin-left:6px;vertical-align:1px}
.rd{display:inline-block;height:1em;vertical-align:-2px;border-radius:99px;background:var(--ink);opacity:.9}
.claim{display:flex;align-items:center;gap:10px;margin-top:12px;padding:12px 14px;border-radius:var(--r1);background:var(--acc);color:var(--acc-ink);font:700 15px var(--sans);letter-spacing:-.01em}
.ib-check{display:flex;gap:8px;flex-wrap:wrap;padding:16px 22px 22px;border-top:1px solid var(--line)}
.step{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 12px 0 8px;border-radius:99px;background:var(--sunk);font:600 12.5px var(--sans);color:var(--ink-3);transition:all .3s cubic-bezier(.2,.8,.2,1)}
.step b{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line-2);display:grid;place-items:center;transition:all .3s}
.step svg{width:9px;height:9px;opacity:0;stroke:var(--acc-ink)}
.step.on{background:var(--acc-soft);color:var(--ink)}.step.on b{background:var(--acc);border-color:var(--acc)}.step.on svg{opacity:1}
.toast{position:absolute;right:26px;bottom:-1px;transform:translateY(120%);opacity:0;display:flex;gap:12px;align-items:center;padding:12px 16px;background:var(--acc);color:var(--acc-ink);border-radius:16px 16px 0 0;font:600 13.5px var(--sans);transition:transform .6s cubic-bezier(.2,.9,.2,1),opacity .4s;z-index:3}
.toast.show{transform:translateY(0);opacity:1}
.toast b{font-weight:800}
/* how: a flowing arc through four numerals */
.flow{position:relative;padding-top:10px}
.flow svg.arc{display:block;width:100%;height:150px;overflow:visible}
.flow .ap{fill:none;stroke:var(--line-2);stroke-width:2;vector-effect:non-scaling-stroke}
.flow .dot{fill:var(--acc)}
.fcols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:-36px}
.fc .nn{font:800 clamp(64px,9vw,128px)/.8 var(--sans);letter-spacing:-.06em;font-variation-settings:"wdth" 76;color:transparent;-webkit-text-stroke:1.5px var(--ink);display:block;margin-bottom:12px;transition:color .4s}
.fc:hover .nn{color:var(--acc);-webkit-text-stroke-color:var(--acc)}
.fc h3{margin:0 0 6px;font:800 24px var(--sans);letter-spacing:-.03em}
.fc p{margin:0;color:var(--ink-2);font-size:15px;max-width:30ch}
.fc:nth-child(2){margin-top:30px}.fc:nth-child(3){margin-top:-10px}.fc:nth-child(4){margin-top:24px}
/* app: ink band with asymmetric corners, window stays light */
.wrap>section.sec:nth-of-type(2){background:var(--band);border-radius:140px 14px 140px 14px;margin:96px -32px 0;padding:80px 32px 40px;--ink:var(--bink);--ink-2:var(--bink2);--ink-3:var(--bink3);--line:var(--bline);--line-2:var(--bline2);color:var(--bink)}
.wrap>section.sec:nth-of-type(2) .win{--ink:var(--ink0);--ink-2:var(--ink20);--ink-3:var(--ink30);--line:var(--line0);--line-2:var(--line20);color:var(--ink0)}
.ov-nav .nv.on{background:var(--ink);color:var(--surface)}
.ov-nav .nv.on .ct{color:var(--surface)}
.ov-ph h3{font-weight:800;font-size:32px;letter-spacing:-.045em;font-variation-settings:"wdth" 85}
.kpi{border:0;background:var(--sunk);border-radius:var(--r2)}
.kpi:first-child{background:var(--acc);color:var(--acc-ink)}.kpi:first-child small,.kpi:first-child strong span{color:color-mix(in oklab,var(--acc-ink) 70%,transparent)}.kpi:first-child .d{color:var(--acc-ink)}.kpi:first-child .spark i{background:var(--acc-ink)}
.kpi strong{font-weight:800;font-variation-settings:"wdth" 88;font-size:28px}
.ov-pane{border-radius:var(--r2)}
.ov-pane h4{font-weight:800;font-size:15px;letter-spacing:-.02em}
.tm>div{border:0;background:var(--sunk);position:relative;overflow:hidden}
.tm>div:first-child{border-radius:110px 14px 14px 14px;background:var(--band);color:var(--bink);--ink:var(--bink);--ink-2:var(--bink2);--ink-3:var(--bink3);--line:var(--bline)}
.tm>div:last-child{border-radius:14px 110px 14px 14px}
.tm>div:first-child .yes,.tm .yes svg{color:var(--ok)}
.tm h3{font-weight:800;font-size:26px}
.tm>div{padding:44px 40px 30px}
.big{font:800 84px/.88 var(--sans);letter-spacing:-.035em;font-variation-settings:"wdth" 78}
h2{font-weight:800;font-variation-settings:"wdth" 82;letter-spacing:-.03em;font-size:clamp(36px,5vw,72px);line-height:.92}
@media(max-width:1000px){.h-top{grid-template-columns:1fr;gap:24px}.ib-cols{grid-template-columns:1fr}.ic+.ic{border-left:0;border-top:1px solid var(--line)}.ic+.ic::before,.ic+.ic::after{display:none}.fcols{grid-template-columns:repeat(2,1fr);margin-top:20px}.fc:nth-child(n){margin-top:0}.flow svg.arc{display:none}.wrap>section.sec:nth-of-type(2){border-radius:70px 12px 70px 12px;margin:72px -20px 0;padding:56px 20px 24px}.toast{right:12px}}
@media(max-width:560px){.fcols{grid-template-columns:1fr}.arch{--r:90px;padding-top:60px}.big{font-size:48px}.tm>div:first-child{border-radius:60px 12px 12px 12px}.tm>div:last-child{border-radius:12px 60px 12px 12px}.tm>div{padding:34px 24px 24px}}
`,
  hero: `<main class="hero">
<div class="h-top"><h1>Pay when<br>it’s <em>proven.</em></h1>
<div><span class="stat"><i></i>Testnet beta · mock USDC on Base Sepolia</span><p class="lede">Lock funds against a condition. The worker proves it. The escrow reads the proof and pays, or doesn’t.</p><div class="cta"><a class="btn pri" href="#">Request access</a><a class="btn" href="#">Try a settlement</a></div><p class="attr">Proofs by <a href="https://docs.primuslabs.xyz" rel="noopener">Primus zkTLS</a>. A proof shows the source returned this response, not that its data is true.</p></div></div>
<div class="arch" id="arch"><div class="arch-lab"><span>The Proof Inspector: what each side sees</span><span class="sim">Simulation · synthetic proof</span></div>
<div class="insp" id="insp">
<div class="ib-top"><b>tsk_7Q2M</b><span class="chip c-info" id="ist"><i></i>Proving</span><span class="dim">Release 2,500.00 USDC when conversions ≥ 120</span><span class="sp"></span><span class="dim">Base Sepolia</span></div>
<div class="ib-cols">
<div class="ic"><h5>What the source saw</h5><small>An ordinary TLS request. Private to the worker.</small><dl class="kv"><dt>Request</dt><dd>GET partner.example/api/q4</dd><dt>Auth</dt><dd>Bearer ••••••••</dd><dt>TLS</dt><dd>1.3 · 200 OK</dd><dt>account_id</dt><dd>acct_88213 <span class="priv">private</span></dd><dt>spend_usd</dt><dd>48,210.55 <span class="priv">private</span></dd><dt>revenue</dt><dd>212,904.10 <span class="priv">private</span></dd><dt>conversions</dt><dd>138</dd></dl></div>
<div class="ic"><h5>What the attestor signed</h5><small>Only the claim, bound to this task.</small><dl class="kv"><dt>recipient</dt><dd>0x4B1e…9aD2</dd><dt>condition</dt><dd>conversions ≥ 120</dd><dt>additionParams</dt><dd>{"taskId":"tsk_7Q2M"}</dd><dt>timestamp</dt><dd>2026-11-12 09:41:07Z</dd><dt>attestor</dt><dd>0x9F3c…c21E</dd><dt>signature</dt><dd>0x3045…a9b1 · 65 B</dd></dl></div>
<div class="ic"><h5>What the verifier learns</h5><small>One fact. Everything else is a blank.</small><dl class="kv"><dt>account_id</dt><dd><span class="rd" style="width:96px"></span></dd><dt>spend_usd</dt><dd><span class="rd" style="width:70px"></span></dd><dt>revenue</dt><dd><span class="rd" style="width:84px"></span></dd></dl><div class="claim"><svg width="16" height="16"><use href="#i-check"/></svg>conversions ≥ 120 → true</div></div>
</div>
<div class="ib-check" id="ibc"></div>
<div class="toast" id="toast"><svg width="18" height="18"><use href="#i-check"/></svg><span><b>Settled</b> · +2,500.00 USDC → Ada · agent · simulated</span></div>
</div></div></main>`,
  how: {
    h2: 'Four steps,<br>one curve.', p: 'Define the rule, lock the funds, prove the outcome, settle. The escrow only ever reads the last two.',
    html: `<div class="flow"><svg class="arc" viewBox="0 0 1200 150" preserveAspectRatio="none" aria-hidden="true"><path class="ap" id="arcp" d="M0 120C170 120 170 30 300 30S430 128 600 100 700 12 900 30 1050 120 1200 40"/><circle class="dot" id="arcd" r="7" cx="0" cy="120"/></svg>
<div class="fcols"><div class="fc"><span class="nn">01</span><h3>Define</h3><p>A source, a metric, a threshold, a date. The rule is hashed into the task.</p></div><div class="fc"><span class="nn">02</span><h3>Lock</h3><p>Fund the escrow. The money waits until a proof lands or the deadline passes.</p></div><div class="fc"><span class="nn">03</span><h3>Prove</h3><p>The worker attests the source response. Only the threshold result is disclosed.</p></div><div class="fc"><span class="nn">04</span><h3>Settle</h3><p>Signature, binding, replay and window are checked on-chain. Then it pays.</p></div></div></div>`,
  },
  app: { h2: 'One ledger.<br>Every receipt.', p: 'Every state change is an event with an actor, a time and a transaction. Demo data, labelled as such.' },
  trust: { h2: 'What it proves.<br>Where it stops.', p: 'A proof shows the source returned this response. It does not show the source is right, or that the worker did the work.' },
  spec: {
    h2: 'Direction F.<br>Ink Arch.', p: 'A two-tone page: clean light and deep ink by intent. Oversized curves are the only decoration; the real Proof Inspector is the image. Product-led, one electric-blue signal.',
    typeLab: 'Type · Bricolage Grotesque (narrow width 78 for display, 90 for UI); tabular figures; no mono face',
    type: `<div class="big">Pay when it’s <span style="color:var(--acc)">proven.</span></div><p style="color:var(--ink-2);max-width:62ch;margin:16px 0 0">Task <span class="num">tsk_7Q2M</span> settled <span class="num">2,500.00</span> USDC to Ada. <span class="num">126,480.50 · 94.1% · 3h 12m</span>.</p>`,
    roles: [['ground', 'var(--bg)'], ['surface', 'var(--surface)'], ['ink band', 'var(--band)', 'var(--bink)'], ['signal', 'var(--acc)', 'var(--acc-ink)']],
    motionLab: 'Motion · scroll-linked + snappy', motion: 'The arch’s curve tightens and the inspector settles to full scale as you scroll. The checklist ticks in 450 ms steps, then the settled toast rises. Reduced motion shows the finished state.',
  },
  script: `
(function(){
  var P=window.PP,$=P.$;
  var S=['Signature valid','Attestor registered','Bound to task','Not replayed','Within window','Condition satisfied'];
  $('ibc').innerHTML=S.map(function(s){return '<span class="step"><b><svg viewBox="0 0 12 12"><use href="#i-check"/></svg></b>'+s+'</span>'}).join('');
  var steps=document.querySelectorAll('#ibc .step'),toast=$('toast'),st=$('ist'),t=[];
  function clear(){t.forEach(clearTimeout);t=[]}
  function cycle(){clear();steps.forEach(function(s){s.classList.remove('on')});toast.classList.remove('show');st.className='chip c-info';st.innerHTML='<i></i>Proving';
    steps.forEach(function(s,i){t.push(setTimeout(function(){s.classList.add('on')},700+i*450))});
    t.push(setTimeout(function(){st.className='chip c-ok';st.innerHTML='<i></i>Settled';toast.classList.add('show')},700+6*450+250));
    t.push(setTimeout(cycle,700+6*450+5200))}
  if(P.reduced){steps.forEach(function(s){s.classList.add('on')});toast.classList.add('show');st.className='chip c-ok';st.innerHTML='<i></i>Settled'}else cycle();
  // scroll-linked arch
  var arch=$('arch'),insp=$('insp');
  function onS(){if(P.reduced)return;var p=Math.min(1,Math.max(0,scrollY/380));arch.style.setProperty('--r',(innerWidth<560?90:240)-(innerWidth<560?50:170)*p+'px');insp.style.setProperty('--sc',(.95+.05*p).toFixed(3))}
  var raf;addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(onS)},{passive:true});onS();
  // ambient dot on the arc
  var ap=$('arcp'),ad=$('arcd');
  if(ap&&ad&&!P.reduced){var len=ap.getTotalLength(),t0=null;(function f(ts){if(t0===null)t0=ts;var k=((ts-t0)%9000)/9000,pt=ap.getPointAtLength(len*k);ad.setAttribute('cx',pt.x);ad.setAttribute('cy',pt.y);requestAnimationFrame(f)})(0)}
})();`,
};
