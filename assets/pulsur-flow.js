/* ============================================================
   pulsur — free snapshot flow · two-pane modal
   Usage: include pulsur-flow.css + this file.
   Open:  any element with [data-pulsur-open]  (href kept as fallback)
   API:   PulsurFlow.open() / .close()
   ============================================================ */
(function(){
  'use strict';

  var CITY = {
    'san francisco':['San Francisco','What are the main narratives around public transit in San Francisco?','Public transit','Narratives',4212],
    'san jose':['San Jose','What are the main narratives around public transit in San Jose?','Public transit','Narratives',1204],
    'baltimore':['Baltimore','What are the main narratives around public transit in Baltimore?','Public transit','Narratives',1533],
    'toronto':['Toronto','What are the main narratives around transit reliability in Toronto?','Public transit','Reliability',3097],
    'montreal':['Montreal','What are the main narratives around transit reliability in Montreal?','Public transit','Reliability',1846],
    'jacksonville':['Jacksonville','What are the main narratives around public transit in Jacksonville?','Public transit','Narratives',912],
    'atlanta':['Atlanta','What are the main narratives around public transit in Atlanta?','Public transit','Narratives',2240],
    'birmingham':['Birmingham','What are the main narratives around public transit in Birmingham?','Public transit','Narratives',764],
    'washington':['Washington, DC','What are the main narratives around public transit in Washington, DC?','Public transit','Narratives',3880],
    'boston':['Boston','What are the main narratives around transit reliability in Boston?','Public transit','Reliability',2584]
  };
  var OTHER=['chicago','detroit','new york','los angeles','seattle','miami','dallas','houston','denver','phoenix','austin',
    'london','paris','berlin','madrid','vienna','lisbon','rome','milan','sydney','melbourne','vancouver','calgary','ottawa','amsterdam','brussels','copenhagen','oslo','helsinki','zurich'];
  var PILLS='<span class="hi">San Francisco</span><span>San Jose</span><span>Baltimore</span><span>Toronto</span><span>Montreal</span><span>Jacksonville</span><span>Atlanta</span><span>Birmingham</span><span>Washington, DC</span><span>Boston</span>';
  var SF=CITY['san francisco'];
  var QUOTES=['the bus just never showed','missed my transfer again','felt safe riding at night','way too packed at 8am','is the app ever accurate?','fares went up again'];

  var RAIL={ask:0,analyzing:0,match:1,nocity:1,unavailable:1,request:1,'request-done':1,nomatch:1,'nomatch-done':1,dataset:2,contact:2,generating:3,mailbox:3};
  var VIS={ask:'listen',analyzing:'scan',match:'city',nocity:'city',unavailable:'city',request:'globe','request-done':'done',
           nomatch:'globe','nomatch-done':'done',dataset:'data',contact:'secure',generating:'build',mailbox:'mail'};

  var S={city:'Montreal',q:'',mode:'Public transit',topic:'Reliability',ev:1846,email:'you@organization.com'};
  var stack=[],cur='ask',root=null,reduce=false;

  var H=''
  +'<div class="pf-box" role="dialog" aria-modal="true" aria-label="Get your free pulsur snapshot">'

  /* ---------- STAGE ---------- */
  +'<div class="pf-stage">'
  + '<canvas class="pf-cv"></canvas>'
  + '<div class="pf-brand"><span class="pf-mark">p<b>ulsur</b></span><span class="pf-dot"></span></div>'
  + '<div class="pf-well">'
  +   '<div class="pf-v on" data-v="listen">'
  +     '<div class="pf-float">'
  +       '<q style="left:4%;top:12%;animation-delay:0s">the bus just never showed</q>'
  +       '<q style="right:2%;top:32%;animation-delay:1.8s">too packed at 8am</q>'
  +       '<q style="left:8%;top:56%;animation-delay:3.6s">missed my transfer</q>'
  +       '<q style="right:6%;top:74%;animation-delay:5.4s">felt safe last night</q>'
  +       '<q style="left:16%;top:88%;animation-delay:7.2s">fares went up again</q>'
  +     '</div>'
  +     '<div class="pf-vk">Listening</div>'
  +     '<div class="pf-vt">1.8<span style="font-size:.62em">M</span></div>'
  +     '<div class="pf-vs">public conversations about transportation, already out there</div>'
  +   '</div>'
  +   '<div class="pf-v" data-v="scan"><div class="pf-scan"><i></i></div>'
  +     '<div class="pf-vk" style="margin-top:20px">Analysing</div>'
  +     '<div class="pf-vs" data-pf="scantx">Reading your question…</div></div>'
  +   '<div class="pf-v" data-v="city">'
  +     '<div class="pf-ring2"><span class="pf-pin">📍</span></div>'
  +     '<div class="pf-vk" data-pf="citykey">City identified</div>'
  +     '<div class="pf-vt grad" data-pf="cityname">Montreal</div>'
  +     '<div class="pf-vs" data-pf="citysub">Public transit · Reliability</div></div>'
  +   '<div class="pf-v" data-v="globe"><div class="pf-ring2"><span class="pf-pin">🌍</span></div>'
  +     '<div class="pf-vk">Coverage</div><div class="pf-vt" style="font-size:26px">Growing</div>'
  +     '<div class="pf-vs">Demand decides which city we add next</div></div>'
  +   '<div class="pf-v" data-v="data">'
  +     '<div class="pf-vk">Evidence available</div>'
  +     '<div class="pf-num" data-pf="bignum">0</div>'
  +     '<div class="pf-vs">relevant public posts &amp; comments<br>Jan 2025 – Jul 2026</div></div>'
  +   '<div class="pf-v" data-v="secure"><div class="pf-ring2"><span class="pf-pin">🔐</span></div>'
  +     '<div class="pf-vk">Almost ready</div><div class="pf-vt" style="font-size:26px">One per email</div>'
  +     '<div class="pf-vs">Your private link stays valid for 14 days</div></div>'
  +   '<div class="pf-v" data-v="build"><div class="pf-scan"><i></i></div>'
  +     '<div class="pf-vk" style="margin-top:20px">Building</div>'
  +     '<div class="pf-vs" data-pf="buildtx">Collecting conversations…</div></div>'
  +   '<div class="pf-v" data-v="mail"><div class="pf-env">📬</div>'
  +     '<div class="pf-vk" style="margin-top:18px">Sent</div>'
  +     '<div class="pf-vt" style="font-size:25px">Check your inbox</div></div>'
  +   '<div class="pf-v" data-v="done"><div class="pf-ok" style="width:96px;height:96px"><svg viewBox="0 0 24 24" style="width:42px;height:42px"><path d="M20 6L9 17l-5-5"/></svg></div>'
  +     '<div class="pf-vk" style="margin-top:18px">Received</div>'
  +     '<div class="pf-vs">We\'ll be in touch</div></div>'
  + '</div>'
  + '<div class="pf-rail">'
  +   '<div class="r on" data-r="0"><span class="n">1</span><span class="l">Ask your question</span></div>'
  +   '<div class="r" data-r="1"><span class="n">2</span><span class="l">Match a city</span></div>'
  +   '<div class="r" data-r="2"><span class="n">3</span><span class="l">Confirm the data</span></div>'
  +   '<div class="r" data-r="3"><span class="n">4</span><span class="l">Get your link</span></div>'
  + '</div>'
  +'</div>'

  /* ---------- PANEL ---------- */
  +'<div class="pf-panel">'
  +'<button class="pf-x" data-pf="close" aria-label="Close">&times;</button>'
  +'<div class="pf-body">'

  +'<section class="pf-scr on" data-s="ask">'
  + '<div class="pf-eyebrow">Free snapshot</div>'
  + '<h2 class="pf-h">What do you want to know about <em>your city?</em></h2>'
  + '<p class="pf-lede">Ask in plain language. pulsur finds the city and shows you exactly what it can analyse.</p>'
  + '<textarea class="pf-ta" data-pf="q" placeholder="e.g. Why are people frustrated with buses in Montreal?"></textarea>'
  + '<div class="pf-fine">🔒 Saved so we can improve coverage — no account needed.</div>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="analyze">Analyse this →</button></div>'
  + '<div class="pf-exl">Or try one of these</div>'
  + '<div class="pf-ex">'
  +   '<button data-pf="ex" data-v="Why are people frustrated with buses in Montreal?">💬 Frustration with buses in <b>Montreal</b><span class="ar">→</span></button>'
  +   '<button data-pf="ex" data-v="What do people think about transit in the U.S.?">🌎 Transit sentiment across <b>the U.S.</b><span class="ar">→</span></button>'
  +   '<button data-pf="ex" data-v="Why are people frustrated with transit in Chicago?">🚫 Transit in <b>Chicago</b> (not covered)<span class="ar">→</span></button>'
  + '</div>'
  +'</section>'

  +'<section class="pf-scr" data-s="analyzing">'
  + '<div class="pf-eyebrow">Working</div>'
  + '<h2 class="pf-h">Reading your question…</h2>'
  + '<p class="pf-lede">Identifying the city and matching it to a dataset we can actually analyse.</p>'
  +'</section>'

  +'<section class="pf-scr" data-s="match">'
  + '<div class="pf-eyebrow">Match found</div>'
  + '<h2 class="pf-h">We can analyse this.</h2>'
  + '<div class="pf-ref" style="margin-top:22px"><div class="k">Closest available analysis</div><div class="t" data-pf="mq"></div></div>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="go" data-v="dataset">Yes, analyse this →</button>'
  +   '<button class="pf-btn pf-q" data-pf="go" data-v="nomatch">Not what I need</button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="nocity">'
  + '<div class="pf-eyebrow">Narrow it down</div>'
  + '<h2 class="pf-h">Which city should we look at?</h2>'
  + '<div class="pf-note pf-info" style="margin-top:20px">🌐 <div>pulsur gives <b>city-level</b> analyses. Free snapshots cover ten cities today.</div></div>'
  + '<div class="pf-cities">'+PILLS+'</div>'
  + '<div class="pf-ref" style="margin-top:20px"><div class="k">Suggested start</div><div class="t">'+SF[1]+'</div></div>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="sf">Start with San Francisco →</button>'
  +   '<button class="pf-btn pf-q" data-pf="go" data-v="nomatch">Not what I need</button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="unavailable">'
  + '<div class="pf-eyebrow">Not covered yet</div>'
  + '<h2 class="pf-h"><span data-pf="ucity">Chicago</span> isn\'t live yet.</h2>'
  + '<div class="pf-note pf-warn" style="margin-top:20px">⚠ <div>We\'re expanding — and <b>demand decides</b> what we add next.</div></div>'
  + '<div class="pf-cities">'+PILLS+'</div>'
  + '<div class="pf-ref" style="margin-top:20px"><div class="k">Closest free analysis</div><div class="t">'+SF[1]+'</div></div>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="sf">Use San Francisco →</button>'
  +   '<button class="pf-btn pf-g" data-pf="go" data-v="request">Request <span data-pf="ucity3">Chicago</span></button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="request">'
  + '<div class="pf-eyebrow">Request a city</div>'
  + '<h2 class="pf-h">Tell us where you need coverage.</h2>'
  + '<div class="pf-form two"><div class="pf-fg"><label>City</label><input class="pf-in" data-pf="reqcity"></div>'
  +   '<div class="pf-fg"><label>Work email</label><input class="pf-in" type="email" placeholder="you@organization.com"></div></div>'
  + '<div class="pf-form"><div class="pf-fg"><label>What would you like to understand?</label>'
  +   '<textarea class="pf-in" placeholder="e.g. Why are riders frustrated with the Blue Line?"></textarea></div></div>'
  + '<label class="pf-check"><input type="checkbox" checked> Notify me when this city goes live.</label>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="go" data-v="request-done">Send request →</button>'
  +   '<button class="pf-btn pf-q" data-pf="back">Back</button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="request-done">'
  + '<div class="pf-eyebrow">Done</div>'
  + '<h2 class="pf-h">Request received.</h2>'
  + '<p class="pf-lede">We\'ll email you the moment <b style="color:#eef5fb" data-pf="ucity4">Chicago</b> goes live.</p>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="sf">Continue with San Francisco →</button>'
  +   '<button class="pf-btn pf-q" data-pf="go" data-v="ask">Start over</button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="nomatch">'
  + '<div class="pf-eyebrow">Tell us more</div>'
  + '<h2 class="pf-h">What were you hoping to explore?</h2>'
  + '<p class="pf-lede">Your original question is saved. Add detail and we\'ll review whether pulsur can support it.</p>'
  + '<div class="pf-form"><div class="pf-fg"><label>What should pulsur analyse?</label>'
  +   '<textarea class="pf-in" placeholder="The question, city, mode or audience you care about…"></textarea></div>'
  +   '<div class="pf-fg"><label>Email <span class="o">— if you\'d like a reply</span></label><input class="pf-in" type="email" placeholder="you@organization.com"></div></div>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="go" data-v="nomatch-done">Send →</button>'
  +   '<button class="pf-btn pf-q" data-pf="back">Back</button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="nomatch-done">'
  + '<div class="pf-eyebrow">Done</div>'
  + '<h2 class="pf-h">Thanks — we\'ve got it.</h2>'
  + '<p class="pf-lede">We\'ll review whether pulsur can support it and get back to you.</p>'
  + '<div class="pf-act"><button class="pf-btn pf-g" data-pf="back">Back to suggestions</button>'
  +   '<button class="pf-btn pf-q" data-pf="close">Close</button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="dataset">'
  + '<div class="pf-eyebrow">Ready</div>'
  + '<h2 class="pf-h">Here\'s exactly what we\'ll look at.</h2>'
  + '<div class="pf-ref" style="margin-top:22px"><div class="k">Analysis</div><div class="t" data-pf="dq"></div></div>'
  + '<div class="pf-facts">'
  +   '<div><div class="k">City</div><div class="v" data-pf="dcity"></div></div>'
  +   '<div><div class="k">Mode</div><div class="v" data-pf="dmode"></div></div>'
  +   '<div><div class="k">Topic</div><div class="v" data-pf="dtopic"></div></div>'
  +   '<div><div class="k">Period</div><div class="v">Jan 2025 – Jul 2026</div></div>'
  + '</div>'
  + '<div class="pf-teaser"><div class="k">Not in the free snapshot</div>'
  +   '<p>Route &amp; time patterns, comparisons and continuous monitoring come with a <a href="pulsur-web-contact.html">custom study →</a></p></div>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="go" data-v="contact">Generate my snapshot →</button>'
  +   '<button class="pf-btn pf-q" data-pf="back">Back</button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="contact">'
  + '<div class="pf-eyebrow">Last step</div>'
  + '<h2 class="pf-h">Where should we send it?</h2>'
  + '<p class="pf-lede">One free snapshot per email. Your private link stays valid for 14 days.</p>'
  + '<div class="pf-form two">'
  +   '<div class="pf-fg"><label>First name</label><input class="pf-in" placeholder="Henriette"></div>'
  +   '<div class="pf-fg"><label>Work email</label><input class="pf-in" type="email" data-pf="email" placeholder="you@organization.com"></div>'
  +   '<div class="pf-fg"><label>Organization</label><input class="pf-in" placeholder="Urban Innovate"></div>'
  +   '<div class="pf-fg"><label>Role <span class="o">— optional</span></label><input class="pf-in" placeholder="Head of Mobility"></div>'
  + '</div>'
  + '<label class="pf-check"><input type="checkbox"> I don\'t want occasional pulsur research insights.</label>'
  + '<div class="pf-act"><button class="pf-btn pf-p" data-pf="generate">Send my snapshot →</button>'
  +   '<button class="pf-btn pf-q" data-pf="back">Back</button></div>'
  +'</section>'

  +'<section class="pf-scr" data-s="generating">'
  + '<div class="pf-eyebrow">Building</div>'
  + '<h2 class="pf-h">Composing your snapshot…</h2>'
  + '<div class="pf-bar"><i data-pf="bar"></i></div>'
  + '<div class="pf-stat" data-pf="genstat">Collecting public conversations…</div>'
  +'</section>'

  +'<section class="pf-scr" data-s="mailbox">'
  + '<div class="pf-eyebrow">All done</div>'
  + '<h2 class="pf-h">Check your mailbox.</h2>'
  + '<p class="pf-lede">Your free <b style="color:#eef5fb" data-pf="mbcity">Montreal</b> snapshot is ready. We\'ve emailed a private link.</p>'
  + '<div class="pf-mail" data-pf="mbemail">you@organization.com</div>'
  + '<div class="pf-meta">'
  +   '<div><div class="k">Valid for</div><div class="v">14 days</div></div>'
  +   '<div><div class="k">Snapshots</div><div class="v">1 per email</div></div>'
  +   '<div><div class="k">City</div><div class="v" data-pf="mbcity2">Montreal</div></div>'
  + '</div>'
  + '<div class="pf-teaser"><div class="k">Go deeper</div>'
  +   '<p>Route &amp; time patterns, persona × emotion and monitoring — <a href="pulsur-web-contact.html">talk to our team →</a></p></div>'
  + '<div class="pf-act"><button class="pf-btn pf-g" data-pf="preview">Preview the email →</button>'
  +   '<button class="pf-btn pf-q" data-pf="close">Done</button></div>'
  +'</section>'

  +'</div></div></div>';

  /* ---------- helpers ---------- */
  function el(k){ return root.querySelector('[data-pf="'+k+'"]'); }
  function setAll(k,v){ var n=root.querySelectorAll('[data-pf="'+k+'"]'); for(var i=0;i<n.length;i++) n[i].textContent=v; }

  function stage(v){
    var all=root.querySelectorAll('.pf-v');
    for(var i=0;i<all.length;i++) all[i].classList.remove('on');
    var t=root.querySelector('.pf-v[data-v="'+v+'"]'); if(t) t.classList.add('on');
  }
  function rail(n){
    var rs=root.querySelectorAll('.pf-rail .r');
    for(var i=0;i<rs.length;i++){
      rs[i].classList.toggle('on', i===n);
      rs[i].classList.toggle('done', i<n);
      rs[i].querySelector('.n').innerHTML = (i<n) ? '&#10003;' : (i+1);
    }
  }
  function count(node,to){
    if(reduce){ node.textContent=to.toLocaleString(); return; }
    var t0=null,dur=1100;
    function step(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/dur), e=1-Math.pow(1-p,3);
      node.textContent=Math.round(to*e).toLocaleString(); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  function go(name,noPush){
    if(!noPush && name!==cur) stack.push(cur);
    var all=root.querySelectorAll('.pf-scr');
    for(var i=0;i<all.length;i++) all[i].classList.remove('on');
    var s=root.querySelector('.pf-scr[data-s="'+name+'"]'); if(s) s.classList.add('on');
    cur=name; rail(RAIL[name]||0); stage(VIS[name]||'listen');
    if(name==='dataset') count(el('bignum'), S.ev);
    root.querySelector('.pf-body').scrollTop=0;
  }
  function back(){ go(stack.pop()||'ask',true); }

  function setCity(c){
    S.city=c[0]; S.q=c[1]; S.mode=c[2]; S.topic=c[3]; S.ev=c[4];
    setAll('dcity',c[0]); setAll('dq',c[1]); setAll('dmode',c[2]); setAll('dtopic',c[3]);
    setAll('mbcity',c[0]); setAll('mbcity2',c[0]);
    setAll('cityname',c[0]); setAll('citysub',c[2]+' · '+c[3]); setAll('citykey','City identified');
  }
  function cap(s){ return s.replace(/\b\w/g,function(m){return m.toUpperCase();}); }
  function detect(t){
    t=(t||'').toLowerCase();
    for(var k in CITY) if(t.indexOf(k)>-1) return {t:'match',d:CITY[k]};
    for(var i=0;i<OTHER.length;i++) if(t.indexOf(OTHER[i])>-1) return {t:'unavailable',c:OTHER[i]};
    return {t:'nocity'};
  }

  var ANA=['Identifying the city…','Matching available datasets…','Checking coverage…'];
  function analyze(){
    var v=el('q').value.trim(); if(!v){ el('q').focus(); return; }
    S.q=v; var r=detect(v), i=0;
    go('analyzing');
    var st=el('scantx'); st.textContent=ANA[0];
    var iv=setInterval(function(){ i++; if(i<ANA.length) st.textContent=ANA[i]; },520);
    setTimeout(function(){
      clearInterval(iv);
      if(r.t==='match'){ setCity(r.d); setAll('mq',r.d[1]); go('match',true); }
      else if(r.t==='unavailable'){
        var c=cap(r.c); setAll('ucity',c); setAll('ucity3',c); setAll('ucity4',c);
        el('reqcity').value=c;
        setAll('cityname',c); setAll('citysub','Not covered yet'); setAll('citykey','Requested city');
        go('unavailable',true);
      } else {
        setAll('cityname','10 cities'); setAll('citysub','live for free snapshots'); setAll('citykey','Coverage');
        go('nocity',true);
      }
    }, reduce?200:1700);
  }

  var GEN=['Collecting public conversations…','Filtering for relevance…','Detecting narratives…','Scoring emotion &amp; personas…','Composing your snapshot…'];
  function generate(){
    var e=el('email').value.trim(); if(e){ S.email=e; setAll('mbemail',e); }
    go('generating');
    var bar=el('bar'), st=el('genstat'), bt=el('buildtx'), i=0;
    bar.style.width='7%'; st.innerHTML=GEN[0]; bt.innerHTML=GEN[0];
    var iv=setInterval(function(){ i++; if(i<GEN.length){ st.innerHTML=GEN[i]; bt.innerHTML=GEN[i]; bar.style.width=(7+i*21)+'%'; } },740);
    setTimeout(function(){ clearInterval(iv); bar.style.width='100%';
      setTimeout(function(){ go('mailbox',true); },420); }, reduce?400:4000);
  }

  /* ---------- stage canvas ---------- */
  function canvas(){
    var cv=root.querySelector('.pf-cv'); if(!cv||reduce) return;
    var ctx=cv.getContext('2d'),W,Ht,dpr=Math.min(devicePixelRatio||1,2),p=[];
    function rz(){ W=cv.offsetWidth; Ht=cv.offsetHeight; if(!W||!Ht) return;
      cv.width=W*dpr; cv.height=Ht*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.min(46,Math.round(W*Ht/9000)); p=[];
      for(var i=0;i<n;i++) p.push({x:Math.random()*W,y:Math.random()*Ht,vx:(Math.random()-.5)*.19,vy:(Math.random()-.5)*.19,r:Math.random()*1.6+.6,t:Math.random()*6});
    }
    rz(); addEventListener('resize',rz);
    (function loop(){
      if(W&&Ht){
        ctx.clearRect(0,0,W,Ht);
        for(var i=0;i<p.length;i++){ var a=p[i]; a.x+=a.vx; a.y+=a.vy; a.t+=.01;
          if(a.x<0)a.x=W; if(a.x>W)a.x=0; if(a.y<0)a.y=Ht; if(a.y>Ht)a.y=0;
          for(var j=i+1;j<p.length;j++){ var b=p[j],dx=a.x-b.x,dy=a.y-b.y,d=dx*dx+dy*dy;
            if(d<11000){ ctx.strokeStyle='rgba(95,185,225,'+((1-d/11000)*.15)+')'; ctx.lineWidth=1;
              ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } } }
        for(var k=0;k<p.length;k++){ var c=p[k],pl=(Math.sin(c.t)+1)/2;
          ctx.fillStyle = k%4===0 ? 'rgba(143,219,53,'+(.3+pl*.4)+')' : 'rgba(120,200,235,'+(.2+pl*.3)+')';
          ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,6.283); ctx.fill(); }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- open/close ---------- */
  function open(){ root.classList.add('pf-on'); root.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    setTimeout(function(){ var t=el('q'); if(t&&cur==='ask') t.focus(); },320); }
  function close(){ root.classList.remove('pf-on'); root.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  function reset(){ stack=[]; el('q').value=''; go('ask',true); }

  function boot(){
    reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    root=document.createElement('div'); root.className='pf-ov'; root.setAttribute('aria-hidden','true');
    root.innerHTML=H; document.body.appendChild(root);
    setCity(CITY['montreal']); canvas();

    root.addEventListener('click',function(e){
      if(e.target===root){ close(); return; }
      var b=e.target.closest('[data-pf]'); if(!b) return;
      var a=b.getAttribute('data-pf');
      if(a==='close') close();
      else if(a==='analyze') analyze();
      else if(a==='ex'){ el('q').value=b.getAttribute('data-v'); analyze(); }
      else if(a==='go'){ var v=b.getAttribute('data-v'); if(v==='ask') reset(); else go(v); }
      else if(a==='back') back();
      else if(a==='sf'){ setCity(SF); go('dataset'); }
      else if(a==='generate') generate();
      else if(a==='preview') location.href='pulsur-email-v2.html';
    });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&root.classList.contains('pf-on')) close(); });
    document.addEventListener('click',function(e){
      var t=e.target.closest('[data-pulsur-open]'); if(t){ e.preventDefault(); open(); }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.PulsurFlow={open:open,close:close};
})();
