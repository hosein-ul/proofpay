// I — Weight: proof gains weight. A pure variable-type direction on a mid-tone ground; one ink, no accent colour. Typographic × data-dense pro.
export default {
  letter: 'I', name: 'Weight', slug: 'i-weight',
  fonts: 'family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000',
  light: `--bg:#D2D8DF;--surface:#EBEEF2;--sunk:#DDE2E8;--ink:#0A0E12;--ink-2:#38414B;--ink-3:#69737E;--line:rgba(10,14,18,.14);--line-2:rgba(10,14,18,.4);
--acc:#0A0E12;--acc-ink:#EDF0F3;--acc-soft:rgba(10,14,18,.08);--ok:#0C6F49;--ok-bg:rgba(12,111,73,.12);--warn:#8A5605;--warn-bg:rgba(138,86,5,.13);--bad:#B5301F;--bad-bg:rgba(181,48,31,.12);--info:#1B4F9C;--info-bg:rgba(27,79,156,.12);
--sans:'Roboto Flex',ui-sans-serif,system-ui,sans-serif;--r1:0px;--r2:0px;--r3:0px;--shadow:0 30px 60px -34px rgba(10,14,18,.5);--shadow-s:0 1px 0 rgba(10,14,18,.2)`,
  dark: `--bg:#0D1116;--surface:#141920;--sunk:#10151B;--ink:#EEF1F4;--ink-2:#A8AFB8;--ink-3:#6E7782;--line:rgba(238,241,244,.1);--line-2:rgba(238,241,244,.4);
--acc:#EEF1F4;--acc-ink:#0A0E12;--acc-soft:rgba(238,241,244,.09);--ok:#4FD99A;--ok-bg:rgba(79,217,154,.13);--warn:#F0B550;--warn-bg:rgba(240,181,80,.13);--bad:#FF8176;--bad-bg:rgba(255,129,118,.13);--info:#7DB1F5;--info-bg:rgba(125,177,245,.13);
--shadow:0 0 0 1px rgba(255,255,255,.06),0 30px 60px -30px rgba(0,0,0,.9);--shadow-s:0 0 0 1px rgba(255,255,255,.1)`,
  logo: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect x="2" y="3" width="1" height="22" fill="var(--ink)"/><rect x="7" y="3" width="3" height="22" fill="var(--ink)"/><rect x="13" y="3" width="6" height="22" fill="var(--ink)"/><rect x="21.500" y="3" width="5" height="22" fill="var(--ink)" opacity="0"/></svg>`,
  miniLogo: `<svg width="22" height="22" viewBox="0 0 28 28"><rect x="2" y="3" width="1" height="22" fill="var(--ink)"/><rect x="7" y="3" width="3" height="22" fill="var(--ink)"/><rect x="13" y="3" width="6" height="22" fill="var(--ink)"/></svg>`,
  cfg: { spark: 'none', chart: 'step', noFill: true, lw: 1.4, seed: 5 },
  css: `
body{font-variation-settings:"wdth" 100,"opsz" 14;font-optical-sizing:auto}
.brand{font-weight:800;letter-spacing:-.03em;font-variation-settings:"wdth" 110}
.btn{border-radius:0;border-color:var(--ink);font-weight:600;font-variation-settings:"wdth" 100}
.btn.pri{background:var(--ink);color:var(--surface);border-color:var(--ink)}
.btn.pri:hover{background:var(--ink-2);filter:none}
.hero{padding:22px 0 0}
.mline{display:flex;gap:16px;align-items:center;font:500 12.5px var(--sans);color:var(--ink-2);margin-bottom:10px;letter-spacing:.01em}
.mline b{font-weight:700;color:var(--ink)}
h1{margin:0;font-family:var(--sans);font-size:200px;line-height:.86;letter-spacing:-.04em;font-optical-sizing:auto;font-variation-settings:"wdth" 100;white-space:nowrap}
h1 .ln{display:table}
h1 .lt{font-variation-settings:"wght" 200,"wdth" 100,"opsz" 144}
.rule{height:1px;background:var(--ink);margin:26px 0 0;transition:none}
.rail{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:0}
.rl{padding:14px 18px 0 0;font:500 13px var(--sans);color:var(--ink-3);transition:color .3s;border-right:0}
.rl b{display:block;font:700 15px var(--sans);letter-spacing:-.01em}
.rl small{display:block;font:500 12px var(--sans);font-variant-numeric:tabular-nums;color:var(--ink-3);margin-top:2px}
.rl.on{color:var(--ink)}.rl.on small{color:var(--ink-2)}
.h-bot{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:56px;align-items:start;margin-top:30px}
.lede{font-size:19px;line-height:1.45;color:var(--ink-2);margin:0 0 22px;max-width:40ch;font-variation-settings:"wght" 380,"opsz" 20}
.attr{margin:16px 0 0;font-size:12.5px;color:var(--ink-3);max-width:46ch}.attr a{border-bottom:1px solid var(--line-2)}
.rd{display:flex;gap:8px;align-items:center;font:500 12px var(--sans);color:var(--ink-3)}
.sim{border-radius:0;border:1px solid var(--ink);color:var(--ink);font-weight:600}
/* how: weight index */
.idx{border-top:2px solid var(--ink)}
.ir{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) 150px;gap:32px;align-items:center;padding:12px 0 14px;border-bottom:1px solid var(--line-2);cursor:default}
.ir .w{font-size:clamp(56px,8.4vw,128px);line-height:.95;letter-spacing:-.045em;font-variation-settings:"wght" var(--w),"wdth" 100,"opsz" 144;transition:font-variation-settings .6s cubic-bezier(.2,.8,.2,1)}
.ir:hover .w{font-variation-settings:"wght" 1000,"wdth" 100,"opsz" 144}
.ir p{margin:0;color:var(--ink-2);font-size:16px;max-width:38ch}
.ir .ev{font:500 12.5px var(--sans);color:var(--ink-3);text-align:right;font-variant-numeric:tabular-nums}
.ir .ev b{display:block;color:var(--ink);font-weight:700}
/* app: data-dense */
.win{border:1px solid var(--ink);box-shadow:var(--shadow);font-variation-settings:"wdth" 88,"opsz" 10}
.ov-nav{border-right:1px solid var(--ink);background:var(--sunk)}
.nv{height:28px;font-weight:500}
.nv.on{background:var(--ink);color:var(--surface);font-weight:700}.nv.on .ct{color:var(--surface)}
.ov-top{border-bottom:1px solid var(--ink);height:44px}
.ov-ph h3{font:300 44px/1 var(--sans);letter-spacing:-.04em;font-variation-settings:"wght" 900,"wdth" 100,"opsz" 40}
.ov-kpis{gap:0;border:1px solid var(--ink)}
.kpi{border:0;border-right:1px solid var(--ink);border-radius:0;background:var(--surface)}.kpi:last-child{border-right:0}
.kpi strong{font:800 34px/1 var(--sans);letter-spacing:-.04em;font-variation-settings:"wght" 700,"wdth" 90,"opsz" 36}
.kpi small{font-weight:500;color:var(--ink-2)}
.ov-pane{border:1px solid var(--ink);border-radius:0;background:var(--surface)}
.ov-pane h4{font:700 12px var(--sans);letter-spacing:.02em;text-transform:none}
.chip{border-radius:0;height:20px;font-size:11.5px;font-weight:700;padding:0 8px}
.chip i{border-radius:0;width:6px;height:6px}
.tscroll th{border-bottom:1px solid var(--ink);font-weight:600;color:var(--ink-2)}
.tscroll td{height:32px;border-bottom:1px solid var(--line)}
.tscroll tbody tr:hover{background:var(--ink);color:var(--surface)}.tscroll tbody tr:hover .dim,.tscroll tbody tr:hover .hash{color:inherit;opacity:.7}
.idn{border-radius:0;width:12px;height:12px;vertical-align:-1px}
.search,.field{border-radius:0;border-color:var(--ink)}
.kpi:nth-child(5) .d{color:var(--ok)}
/* trust: weight = what the proof carries */
.tm{gap:0;border-top:2px solid var(--ink)}
.tm>div{background:transparent;border:0;border-radius:0;padding:28px 28px 20px 0}
.tm>div+div{border-left:1px solid var(--line-2);padding-left:28px;padding-right:0}
.tm h3{font-size:clamp(34px,4.4vw,64px);line-height:.95;letter-spacing:-.045em;font-variation-settings:"wght" 900,"wdth" 100,"opsz" 144;margin-bottom:6px}
.tm .no h3{font-variation-settings:"wght" 100,"wdth" 100,"opsz" 144}
.tm li{font-variation-settings:"wght" 560,"opsz" 18}.tm .no li{font-variation-settings:"wght" 300,"opsz" 18}
.tm .no li b{font-weight:300}
.tm li svg{display:none}.tm li{grid-template-columns:1fr}
.big{font-size:82px;line-height:.92;letter-spacing:-.045em;font-variation-settings:"wght" 900,"wdth" 100,"opsz" 144}
.wscale{display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:20px;font-size:42px;letter-spacing:-.03em;line-height:1.1}
.wscale span{font-variation-settings:"wght" var(--w),"opsz" 48}
.wscale small{display:block;font:500 11px var(--sans);color:var(--ink-3);letter-spacing:0}
h2{font-weight:800;letter-spacing:-.04em;font-variation-settings:"wght" 850,"wdth" 100,"opsz" 96}
@media(max-width:1000px){.h-bot{grid-template-columns:1fr;gap:20px}.ir{grid-template-columns:1fr;gap:10px}.ir .ev{text-align:left}.rail{grid-template-columns:repeat(2,1fr)}}
@media(max-width:700px){.tm{grid-template-columns:1fr}.tm>div+div{border-left:0;border-top:1px solid var(--line-2);padding-left:0}.big{font-size:46px}.rail{grid-template-columns:repeat(2,1fr)}}
`,
  hero: `<main class="hero">
<div class="mline"><b>Testnet beta</b><span>Proofs by Primus zkTLS</span><span class="sp"></span><span class="sim">Simulation</span></div>
<h1 id="h1" aria-label="Pay when it’s proven."><span class="ln" aria-hidden="true">Pay when</span><span class="ln" aria-hidden="true">it’s <span id="pv">proven.</span></span></h1>
<div class="rule" id="rule"></div>
<div class="rail" id="rail" aria-hidden="true"></div>
<div class="h-bot"><div class="rd"><span>The heavier the word, the further the proof has come. It starts at hairline and reaches full weight when the escrow settles.</span></div>
<div><p class="lede">Lock funds against a condition. Your worker proves it with a Primus zkTLS attestation. The escrow releases only when it verifies.</p><div class="cta"><a class="btn pri" href="#">Request access</a><a class="btn" href="#">Try a settlement</a></div><p class="attr">A proof shows the source returned this response, not that its data is true.</p></div></div>
</main>`,
  how: {
    h2: 'Four words.<br>Four weights.', p: 'Define, lock, prove, settle. Each step carries more evidence than the last, so each is set a little heavier.',
    html: `<div class="idx">
<div class="ir" style="--w:100"><span class="w">Define</span><p>A source, a metric, a threshold, a date. The rule is hashed into the task.</p><div class="ev"><b>Condition hash</b>wght 100</div></div>
<div class="ir" style="--w:350"><span class="w">Lock</span><p>Fund the escrow. Money waits until a proof lands or the deadline passes.</p><div class="ev"><b>Deposit tx</b>wght 350</div></div>
<div class="ir" style="--w:650"><span class="w">Prove</span><p>The worker attests the source response. Only the threshold result is disclosed.</p><div class="ev"><b>Attestation</b>wght 650</div></div>
<div class="ir" style="--w:1000"><span class="w">Settle</span><p>Signature, task binding, replay and window are checked on-chain. Then it pays.</p><div class="ev"><b>Release tx</b>wght 1000</div></div></div>`,
  },
  app: { h2: 'Dense, on purpose.', p: 'A working surface for people who read tables all day. Every state change is an event with an actor, a time and a transaction. Demo data, labelled as such.' },
  trust: { h2: 'Heavy and light.', p: 'What a proof carries is set in weight. What it cannot carry is set in hairline. A proof shows the source returned this response, not that the source is right.' },
  spec: {
    h2: 'Direction I.<br>Weight.', p: 'Type is the whole image. One ink on a grey ground, a single variable family, weight as meaning: hairline for the claim, black for the settled. Brave: no accent colour at all.',
    typeLab: 'Type · Roboto Flex, a variable font used on weight, width and optical size; tabular figures; no mono face',
    type: `<div class="big">Pay when it’s proven.</div><div class="wscale">${[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((w) => `<span style="--w:${w}">Aa<small>${w}</small></span>`).join('')}</div>`,
    roles: [['ground', 'var(--bg)'], ['surface', 'var(--surface)'], ['ink', 'var(--ink)', 'var(--surface)'], ['state', 'var(--ok-bg)', 'var(--ok)']],
    motionLab: 'Motion · variable-axis, smooth', motion: 'The word proven moves from weight 100 to 1000 over four steps while a rule beneath it thickens. Letters near the pointer gain weight. Reduced motion holds the final weight.',
  },
  script: `
(function(){
  var P=window.PP,h=P.$('h1'),pv=P.$('pv'),rule=P.$('rule'),rail=P.$('rail');
  function split(el,cls){var out=[];[].slice.call(el.childNodes).forEach(function(n){if(n.nodeType===3){var f=document.createDocumentFragment();n.textContent.split('').forEach(function(c){var s=document.createElement('span');s.className='lt';s.textContent=c;f.appendChild(s);out.push(s)});el.replaceChild(f,n)}else if(n.nodeType===1&&n!==pv){out=out.concat(split(n))}});return out}
  var lines=h.querySelectorAll('.ln'),base=[],prov=[];
  lines.forEach(function(l){var arr=split(l);arr.forEach(function(s){if(!pv.contains(s))base.push(s)})});
  prov=[].slice.call(pv.childNodes).length?[]:[];
  // pv was skipped by split() because it is the animated word; split it separately
  prov=split(pv);
  var ST=[['Define',100],['Lock',350],['Prove',650],['Settle',1000]];
  rail.innerHTML=ST.map(function(s){return '<div class="rl"><b>'+s[0]+'</b><small>wght '+s[1]+'</small></div>'}).join('');
  var rl=rail.children,cur=3,W=P.reduced?1000:100,target=P.reduced?1000:100,mx=-1e4,my=-1e4,R=170,hover=false;
  function fit(){h.style.fontSize='100px';prov.forEach(function(s){s.style.fontVariationSettings='"wght" 1000,"wdth" 100,"opsz" 144'});base.forEach(function(s){s.style.fontVariationSettings='"wght" 200,"wdth" 100,"opsz" 144'});
    var w=0;lines.forEach(function(l){w=Math.max(w,l.getBoundingClientRect().width)});var box=h.parentNode.clientWidth;h.style.fontSize=Math.min(360,100*box/w*.995)+'px'}
  var lt=base.concat(prov);
  function frame(){
    W+=(target-W)*.07;
    var all=lt,cs=all.map(function(s){var r=s.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
    for(var i=0;i<all.length;i++){var isP=i>=base.length,b=isP?W:200,d=Math.hypot(cs[i][0]-mx,cs[i][1]-my),p=hover&&d<R?Math.pow(1-d/R,2)*650:0;
      all[i].style.fontVariationSettings='"wght" '+Math.min(1000,Math.round(b+p))+',"wdth" 100,"opsz" 144'}
    rule.style.height=(1+W/1000*15).toFixed(1)+'px';
    requestAnimationFrame(frame)}
  function setStage(i){for(var k=0;k<rl.length;k++)rl[k].classList.toggle('on',k===i);target=ST[i][1]}
  fit();addEventListener('resize',fit);document.fonts&&document.fonts.ready.then(fit);
  if(P.reduced){lt.forEach(function(s,i){s.style.fontVariationSettings='"wght" '+(i>=base.length?1000:200)+',"wdth" 100,"opsz" 144'});rule.style.height='16px';setStage(3);return}
  h.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;hover=true});h.addEventListener('pointerleave',function(){hover=false});
  var i=0;setStage(0);
  setInterval(function(){if(document.hidden)return;i++;if(i>3){i=0;W=60}setStage(i)},1900);
  requestAnimationFrame(frame);
})();`,
};
