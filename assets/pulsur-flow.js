/* ============================================================
   pulsur — free snapshot flow · modal component
   Usage:  <link rel="stylesheet" href="assets/pulsur-flow.css">
           <script src="assets/pulsur-flow.js" defer></script>
   Open:   any element with [data-pulsur-open]
           (links keep their href as a no-JS fallback)
   API:    PulsurFlow.open()  /  PulsurFlow.close()
   ============================================================ */
(function(){
  'use strict';

  var CITIES = {
    'san francisco':['San Francisco','What are the main narratives around public transit in San Francisco?','Public transit','Narratives','4,212'],
    'san jose':['San Jose','What are the main narratives around public transit in San Jose?','Public transit','Narratives','1,204'],
    'baltimore':['Baltimore','What are the main narratives around public transit in Baltimore?','Public transit','Narratives','1,533'],
    'toronto':['Toronto','What are the main narratives around transit reliability in Toronto?','Public transit','Reliability','3,097'],
    'montreal':['Montreal','What are the main narratives around transit reliability in Montreal?','Public transit','Reliability','1,846'],
    'jacksonville':['Jacksonville','What are the main narratives around public transit in Jacksonville?','Public transit','Narratives','912'],
    'atlanta':['Atlanta','What are the main narratives around public transit in Atlanta?','Public transit','Narratives','2,240'],
    'birmingham':['Birmingham','What are the main narratives around public transit in Birmingham?','Public transit','Narratives','764'],
    'washington':['Washington, DC','What are the main narratives around public transit in Washington, DC?','Public transit','Narratives','3,880'],
    'boston':['Boston','What are the main narratives around transit reliability in Boston?','Public transit','Reliability','2,584']
  };
  var OTHER = ['chicago','detroit','new york','los angeles','seattle','miami','dallas','houston','denver','phoenix',
               'london','paris','berlin','madrid','vienna','lisbon','rome','milan','sydney','melbourne','vancouver','calgary','ottawa','amsterdam','brussels'];
  var LIST = 'San Francisco, San Jose, Baltimore, Toronto, Montreal, Jacksonville, Atlanta, Birmingham, Washington DC and Boston';
  var PILLS = '<span class="hi">San Francisco</span><span>San Jose</span><span>Baltimore</span><span>Toronto</span><span>Montreal</span><span>Jacksonville</span><span>Atlanta</span><span>Birmingham</span><span>Washington, DC</span><span>Boston</span>';
  var SF = CITIES['san francisco'];

  var STEP = {ask:0,analyzing:0,match:1,nocity:1,unavailable:1,request:1,'request-done':1,nomatch:1,'nomatch-done':1,dataset:2,contact:2,generating:3,mailbox:3};

  var S = {city:'Montreal', q:'', mode:'Public transit', topic:'Reliability', ev:'1,846', email:'you@organization.com', req:'Chicago'};
  var stack=[], cur='ask', root=null, reduce=false;

  var HTML = ''
  + '<div class="pf-box" role="dialog" aria-modal="true" aria-label="Get your free pulsur snapshot">'
  +   '<div class="pf-head">'
  +     '<span class="pf-mark">p<b>ulsur</b></span>'
  +     '<span class="pf-chip">Free snapshot</span>'
  +     '<span class="pf-steps"><i class="on"></i><i></i><i></i><i></i></span>'
  +     '<button class="pf-x" data-pf="close" aria-label="Close">&times;</button>'
  +   '</div>'
  +   '<div class="pf-body">'

  /* 1 ASK */
  +   '<section class="pf-scr on" data-s="ask">'
  +     '<div class="pf-eyebrow">Explore with pulsur</div>'
  +     '<h2 class="pf-h">What would you like to understand about <em>transportation in a city?</em></h2>'
  +     '<p class="pf-lede">Ask in your own words. pulsur will find the city and show you exactly what it can analyse.</p>'
  +     '<textarea class="pf-ta" data-pf="q" placeholder="e.g. Why are people frustrated with buses in Montreal?"></textarea>'
  +     '<div class="pf-fine">🔒 Your question is saved so we can improve coverage — no account needed.</div>'
  +     '<div class="pf-act"><button class="pf-btn pf-p" data-pf="analyze">See what pulsur can analyse →</button></div>'
  +     '<div class="pf-exl">Try an example</div>'
  +     '<div class="pf-ex">'
  +       '<button data-pf="ex" data-v="Why are people frustrated with buses in Montreal?">💬 Why are people frustrated with buses in <b>Montreal</b>?<span class="ar">→</span></button>'
  +       '<button data-pf="ex" data-v="What do people think about transit in the U.S.?">🌎 What do people think about transit in <b>the U.S.</b>?<span class="ar">→</span></button>'
  +       '<button data-pf="ex" data-v="Why are people frustrated with transit in Chicago?">🚫 Why are people frustrated with transit in <b>Chicago</b>?<span class="ar">→</span></button>'
  +     '</div>'
  +   '</section>'

  /* ANALYZING */
  +   '<section class="pf-scr" data-s="analyzing"><div class="pf-gen">'
  +     '<div class="pf-ring"><i></i></div>'
  +     '<h2 class="pf-h" style="max-width:none;font-size:23px;margin:0">Reading your question…</h2>'
  +     '<div class="pf-stat" data-pf="anastat">Identifying the city…</div>'
  +   '</div></section>'

  /* MATCH */
  +   '<section class="pf-scr" data-s="match">'
  +     '<div class="pf-eyebrow">Here\'s what pulsur can analyse</div>'
  +     '<h2 class="pf-h">We found a match for your question.</h2>'
  +     '<div class="pf-card">'
  +       '<div class="pf-kv"><div class="k">City identified</div><div class="v"><span data-pf="mcity">Montreal</span></div></div>'
  +       '<div class="pf-ref"><div class="k">Closest available analysis</div><div class="t" data-pf="mq"></div></div>'
  +     '</div>'
  +     '<div class="pf-act"><button class="pf-btn pf-p" data-pf="go" data-v="dataset">Yes, analyse this →</button>'
  +       '<button class="pf-btn pf-q" data-pf="go" data-v="nomatch">This doesn\'t match what I need</button></div>'
  +   '</section>'

  /* NO CITY */
  +   '<section class="pf-scr" data-s="nocity">'
  +     '<div class="pf-eyebrow">Here\'s what pulsur can analyse</div>'
  +     '<h2 class="pf-h">Let\'s narrow it to one city.</h2>'
  +     '<div class="pf-card">'
  +       '<div class="pf-note pf-info">🌐 <div>pulsur freemium provides <b>city-level</b> analyses in ' + LIST + '.</div></div>'
  +       '<div class="pf-cities">' + PILLS + '</div>'
  +       '<div class="pf-ref"><div class="k">Suggested start</div><div class="t">' + SF[1] + '</div>'
  +         '<p style="margin-top:9px;font-size:13px;color:#7d95a8">San Francisco has pulsur\'s largest dataset today.</p></div>'
  +     '</div>'
  +     '<div class="pf-act"><button class="pf-btn pf-p" data-pf="sf">Yes, analyse this →</button>'
  +       '<button class="pf-btn pf-q" data-pf="go" data-v="nomatch">This doesn\'t match what I need</button></div>'
  +   '</section>'

  /* UNAVAILABLE */
  +   '<section class="pf-scr" data-s="unavailable">'
  +     '<div class="pf-eyebrow">Here\'s what pulsur can analyse</div>'
  +     '<h2 class="pf-h"><span data-pf="ucity">Chicago</span> isn\'t available yet.</h2>'
  +     '<div class="pf-card">'
  +       '<div class="pf-note pf-warn">⚠ <div><b data-pf="ucity2">Chicago</b> is not currently in pulsur freemium — but we\'re expanding, and demand decides what we add next.</div></div>'
  +       '<div class="pf-cities">' + PILLS + '</div>'
  +       '<div class="pf-ref"><div class="k">Closest free analysis we can offer</div><div class="t">' + SF[1] + '</div></div>'
  +     '</div>'
  +     '<div class="pf-act"><button class="pf-btn pf-p" data-pf="sf">Yes, analyse this →</button>'
  +       '<button class="pf-btn pf-g" data-pf="go" data-v="request">Request <span data-pf="ucity3">Chicago</span> instead</button></div>'
  +   '</section>'

  /* REQUEST CITY */
  +   '<section class="pf-scr" data-s="request">'
  +     '<div class="pf-eyebrow">Request a city</div>'
  +     '<h2 class="pf-h">Tell us where you need coverage.</h2>'
  +     '<p class="pf-lede">We prioritise new cities by demand — we\'ll email you the moment it\'s live.</p>'
  +     '<div class="pf-form two">'
  +       '<div class="pf-fg"><label>Requested city</label><input class="pf-in" data-pf="reqcity"></div>'
  +       '<div class="pf-fg"><label>Work email</label><input class="pf-in" type="email" placeholder="you@organization.com"></div>'
  +     '</div>'
  +     '<div class="pf-form"><div class="pf-fg"><label>What would you like to understand?</label>'
  +       '<textarea class="pf-in" placeholder="e.g. Why are riders frustrated with the Blue Line?"></textarea></div></div>'
  +     '<label class="pf-check"><input type="checkbox" checked> Notify me as soon as this city is available.</label>'
  +     '<label class="pf-check"><input type="checkbox"> I don\'t want occasional pulsur updates and research insights.</label>'
  +     '<div class="pf-act"><button class="pf-btn pf-p" data-pf="go" data-v="request-done">Send my request →</button>'
  +       '<button class="pf-btn pf-q" data-pf="back">Back</button></div>'
  +   '</section>'

  /* REQUEST DONE */
  +   '<section class="pf-scr" data-s="request-done"><div class="pf-mid">'
  +     '<div class="pf-ok"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div>'
  +     '<h2 class="pf-h" style="max-width:none;font-size:24px;margin:0">Request received.</h2>'
  +     '<p class="pf-lede" style="margin:12px auto 0;max-width:44ch">We\'ll email you the moment <b style="color:#eef5fb" data-pf="ucity4">Chicago</b> goes live.</p>'
  +     '<div class="pf-act" style="justify-content:center"><button class="pf-btn pf-p" data-pf="sf">Continue with San Francisco →</button>'
  +       '<button class="pf-btn pf-q" data-pf="go" data-v="ask">Start over</button></div>'
  +   '</div></section>'

  /* NO MATCH */
  +   '<section class="pf-scr" data-s="nomatch">'
  +     '<div class="pf-eyebrow">Tell us more</div>'
  +     '<h2 class="pf-h">What were you hoping to explore?</h2>'
  +     '<p class="pf-lede">Your original question is already saved. Add detail and we\'ll review whether pulsur can support it.</p>'
  +     '<div class="pf-form"><div class="pf-fg"><label>What would you like pulsur to analyse?</label>'
  +       '<textarea class="pf-in" placeholder="Describe the question, city, mode or audience you care about…"></textarea></div>'
  +       '<div class="pf-fg"><label>Email address <span class="o">— required if you\'d like a response</span></label>'
  +       '<input class="pf-in" type="email" placeholder="you@organization.com"></div></div>'
  +     '<label class="pf-check"><input type="checkbox"> I don\'t want occasional pulsur updates and research insights.</label>'
  +     '<div class="pf-act"><button class="pf-btn pf-p" data-pf="go" data-v="nomatch-done">Send my request →</button>'
  +       '<button class="pf-btn pf-q" data-pf="back">Back</button></div>'
  +   '</section>'

  /* NO MATCH DONE */
  +   '<section class="pf-scr" data-s="nomatch-done"><div class="pf-mid">'
  +     '<div class="pf-ok"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div>'
  +     '<h2 class="pf-h" style="max-width:none;font-size:24px;margin:0">Thanks — we\'ve received your request.</h2>'
  +     '<p class="pf-lede" style="margin:12px auto 0;max-width:46ch">We\'ll review whether pulsur can support it and get back to you.</p>'
  +     '<div class="pf-act" style="justify-content:center"><button class="pf-btn pf-g" data-pf="back">Back to the suggested analyses</button>'
  +       '<button class="pf-btn pf-q" data-pf="close">Close</button></div>'
  +   '</div></section>'

  /* DATASET */
  +   '<section class="pf-scr" data-s="dataset">'
  +     '<div class="pf-eyebrow">Ready to analyse</div>'
  +     '<h2 class="pf-h">Here\'s exactly what we\'ll look at.</h2>'
  +     '<div class="pf-card">'
  +       '<div class="pf-ref" style="margin-top:0"><div class="k">Analysis</div><div class="t" data-pf="dq"></div></div>'
  +       '<div class="pf-facts">'
  +         '<div><div class="k">City</div><div class="v" data-pf="dcity"></div></div>'
  +         '<div><div class="k">Mobility mode</div><div class="v" data-pf="dmode"></div></div>'
  +         '<div><div class="k">Topic</div><div class="v" data-pf="dtopic"></div></div>'
  +         '<div><div class="k">Data period</div><div class="v">Jan 2025 – Jul 2026</div></div>'
  +         '<div style="grid-column:1/-1"><div class="k">Available evidence</div><div class="v big"><span data-pf="dev"></span> <u>relevant public posts &amp; comments</u></div></div>'
  +       '</div>'
  +       '<div class="pf-teaser"><div class="k">Not included in the free snapshot</div>'
  +         '<p>Custom date ranges, additional cities, route &amp; time patterns, comparisons and continuous monitoring come with a <a href="pulsur-web-contact.html">custom pulsur study →</a></p></div>'
  +     '</div>'
  +     '<div class="pf-act"><button class="pf-btn pf-p" data-pf="go" data-v="contact">Generate my free snapshot →</button>'
  +       '<button class="pf-btn pf-q" data-pf="back">Go back</button></div>'
  +   '</section>'

  /* CONTACT */
  +   '<section class="pf-scr" data-s="contact">'
  +     '<div class="pf-eyebrow">Almost there</div>'
  +     '<h2 class="pf-h">Where should we send it?</h2>'
  +     '<p class="pf-lede">One free snapshot per email address. We\'ll send a private link, valid 14 days.</p>'
  +     '<div class="pf-form two">'
  +       '<div class="pf-fg"><label>First name</label><input class="pf-in" placeholder="Henriette"></div>'
  +       '<div class="pf-fg"><label>Work email</label><input class="pf-in" type="email" data-pf="email" placeholder="you@organization.com"></div>'
  +       '<div class="pf-fg"><label>Organization</label><input class="pf-in" placeholder="Urban Innovate"></div>'
  +       '<div class="pf-fg"><label>Role <span class="o">— optional</span></label><input class="pf-in" placeholder="Head of Mobility"></div>'
  +     '</div>'
  +     '<label class="pf-check"><input type="checkbox"> I don\'t want occasional pulsur updates and research insights.</label>'
  +     '<div class="pf-act"><button class="pf-btn pf-p" data-pf="generate">Generate my snapshot →</button>'
  +       '<button class="pf-btn pf-q" data-pf="back">Back</button></div>'
  +   '</section>'

  /* GENERATING */
  +   '<section class="pf-scr" data-s="generating"><div class="pf-gen">'
  +     '<div class="pf-ring"><i></i></div>'
  +     '<h2 class="pf-h" style="max-width:none;font-size:25px;margin:0">Building your snapshot…</h2>'
  +     '<div class="pf-bar"><i data-pf="bar"></i></div>'
  +     '<div class="pf-stat" data-pf="genstat">Collecting public conversations…</div>'
  +   '</div></section>'

  /* MAILBOX */
  +   '<section class="pf-scr" data-s="mailbox"><div class="pf-mid">'
  +     '<div class="pf-icon">📬</div>'
  +     '<h2 class="pf-h" style="max-width:none;font-size:26px;margin:0">Check your mailbox.</h2>'
  +     '<p class="pf-lede" style="margin:13px auto 0;max-width:46ch">Your free <b style="color:#eef5fb" data-pf="mbcity">Montreal</b> snapshot is ready. We\'ve emailed you a private link to open it.</p>'
  +     '<div class="pf-mail" data-pf="mbemail">you@organization.com</div>'
  +     '<div class="pf-meta">'
  +       '<div><div class="k">Link valid for</div><div class="v">14 days</div></div>'
  +       '<div><div class="k">Snapshots</div><div class="v">1 per email</div></div>'
  +       '<div><div class="k">City</div><div class="v" data-pf="mbcity2">Montreal</div></div>'
  +     '</div>'
  +     '<div class="pf-teaser" style="text-align:left"><div class="k">While you wait</div>'
  +       '<p>Need route &amp; time patterns, persona × emotion crosstabs and continuous monitoring? <a href="pulsur-web-contact.html">Talk to our team →</a></p></div>'
  +     '<div class="pf-act" style="justify-content:center"><button class="pf-btn pf-g" data-pf="preview">Preview the email →</button>'
  +       '<button class="pf-btn pf-q" data-pf="close">Done</button></div>'
  +   '</div></section>'

  +   '</div>'
  + '</div>';

  /* ---------- helpers ---------- */
  function q(sel){ return root.querySelector('[data-pf="'+sel+'"]'); }
  function setText(k,v){ var els=root.querySelectorAll('[data-pf="'+k+'"]'); for(var i=0;i<els.length;i++) els[i].textContent=v; }
  function steps(n){ var e=root.querySelectorAll('.pf-steps i'); for(var i=0;i<e.length;i++) e[i].classList.toggle('on', i<=n); }

  function go(name, noPush){
    if(!noPush && name!==cur) stack.push(cur);
    var all=root.querySelectorAll('.pf-scr');
    for(var i=0;i<all.length;i++) all[i].classList.remove('on');
    var el=root.querySelector('.pf-scr[data-s="'+name+'"]');
    if(el) el.classList.add('on');
    cur=name; steps(STEP[name]||0);
    root.querySelector('.pf-body').scrollTop=0;
  }
  function back(){ go(stack.pop()||'ask', true); }

  function setCity(c){
    S.city=c[0]; S.q=c[1]; S.mode=c[2]; S.topic=c[3]; S.ev=c[4];
    setText('dcity',c[0]); setText('dq',c[1]); setText('dmode',c[2]); setText('dtopic',c[3]); setText('dev',c[4]);
    setText('mbcity',c[0]); setText('mbcity2',c[0]);
  }
  function title(s){ return s.replace(/\b\w/g,function(m){return m.toUpperCase();}); }

  function detect(t){
    t=(t||'').toLowerCase();
    for(var k in CITIES) if(t.indexOf(k)>-1) return {type:'match', d:CITIES[k]};
    for(var i=0;i<OTHER.length;i++) if(t.indexOf(OTHER[i])>-1) return {type:'unavailable', c:OTHER[i]};
    return {type:'nocity'};
  }

  var ANA=['Identifying the city…','Matching to available datasets…','Checking coverage…'];
  function analyze(){
    var txt=q('q').value.trim();
    if(!txt){ q('q').focus(); return; }
    S.q=txt;
    var res=detect(txt), i=0, st;
    go('analyzing');
    st=q('anastat'); st.textContent=ANA[0];
    var iv=setInterval(function(){ i++; if(i<ANA.length) st.textContent=ANA[i]; }, 520);
    setTimeout(function(){
      clearInterval(iv);
      if(res.type==='match'){ setCity(res.d); setText('mcity',res.d[0]); setText('mq',res.d[1]); go('match',true); }
      else if(res.type==='unavailable'){
        var c=title(res.c);
        setText('ucity',c); setText('ucity2',c); setText('ucity3',c); setText('ucity4',c);
        q('reqcity').value=c; S.req=c; go('unavailable',true);
      } else go('nocity',true);
    }, reduce?200:1600);
  }

  var GEN=['Collecting public conversations…','Filtering for relevance…','Detecting narratives…','Scoring emotion &amp; personas…','Composing your snapshot…'];
  function generate(){
    var em=q('email').value.trim();
    if(em){ S.email=em; setText('mbemail',em); }
    go('generating');
    var bar=q('bar'), st=q('genstat'), i=0;
    bar.style.width='6%'; st.innerHTML=GEN[0];
    var iv=setInterval(function(){ i++; if(i<GEN.length){ st.innerHTML=GEN[i]; bar.style.width=(6+i*22)+'%'; } }, 720);
    setTimeout(function(){ clearInterval(iv); bar.style.width='100%';
      setTimeout(function(){ go('mailbox',true); }, 380); }, reduce?400:3900);
  }

  /* ---------- open / close ---------- */
  function open(){ root.classList.add('pf-on'); document.body.style.overflow='hidden';
    setTimeout(function(){ var t=q('q'); if(t && cur==='ask') t.focus(); }, 260); }
  function close(){ root.classList.remove('pf-on'); document.body.style.overflow=''; }
  function reset(){ stack=[]; go('ask',true); q('q').value=''; }

  /* ---------- boot ---------- */
  function boot(){
    reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    root=document.createElement('div');
    root.className='pf-ov'; root.setAttribute('aria-hidden','true');
    root.innerHTML=HTML;
    document.body.appendChild(root);
    setCity(CITIES['montreal']);

    root.addEventListener('click', function(e){
      if(e.target===root){ close(); return; }
      var b=e.target.closest('[data-pf]'); if(!b) return;
      var a=b.getAttribute('data-pf');
      if(a==='close') close();
      else if(a==='analyze') analyze();
      else if(a==='ex'){ q('q').value=b.getAttribute('data-v'); analyze(); }
      else if(a==='go'){ var v=b.getAttribute('data-v'); if(v==='ask') reset(); else go(v); }
      else if(a==='back') back();
      else if(a==='sf'){ setCity(SF); go('dataset'); }
      else if(a==='generate') generate();
      else if(a==='preview') location.href='pulsur-email-v2.html';
    });

    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && root.classList.contains('pf-on')) close();
    });

    // bind triggers (links keep href as no-JS fallback)
    document.addEventListener('click', function(e){
      var t=e.target.closest('[data-pulsur-open]');
      if(t){ e.preventDefault(); open(); }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.PulsurFlow = {open:function(){open();}, close:function(){close();}};
})();
