(function(){
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const LV = {clear:{word:'Clear',c:'#9CC8EE'},busy:{word:'Busy',c:'#F2C85B'},slow:{word:'Slow',c:'#EC8F4D'},vslow:{word:'Very slow',c:'#B23F36'}};


  /* split words for headline reveals */
  $$('.words').forEach(el=>{
    let i=0;
    const walk = node => [...node.childNodes].forEach(n=>{
      if(n.nodeType===3){
        const frag=document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t=>{
          if(!t) return;
          if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(t));return;}
          const s=document.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=t;frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if(n.nodeType===1) walk(n);
    });
    walk(el);
  });

  /* reveal: only things that start below the fold wait for the scroll */
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.remove('pending');io.unobserve(e.target);onReveal(e.target);}
  }),{rootMargin:'0px 0px -8% 0px',threshold:.08});
  if(!RM){
    $$('.rv, .words, .lvl').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top > innerHeight*0.92){el.classList.add('pending');io.observe(el);} else onReveal(el);
    });
  } else { $$('.lvl').forEach(el=>el.classList.remove('pending')); $$('[data-run]').forEach(el=>el.classList.add('run')); }
  function onReveal(el){
    $$('[data-count]', el).forEach(countUp);
    if(el.matches('[data-run]')) el.classList.add('run');
  }
  function countUp(el){
    if(el.dataset.done) return; el.dataset.done=1;
    const to=+el.dataset.count, t0=performance.now(), dur=1400;
    const step=t=>{const p=Math.min(1,(t-t0)/dur);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  }

  /* chapters, nav, page forecast */
  const chapters = $$('.chapter');
  const nav=$('#nav'), bars=$('#pfBars'), mini=$('#miniBars');
  chapters.forEach((c,i)=>{
    const li=document.createElement('li');li.innerHTML='<a href="#'+c.id+'">'+c.dataset.title+'</a>';nav.appendChild(li);
    const b=document.createElement('a');b.href='#'+c.id;b.dataset.l=c.dataset.l;b.setAttribute('aria-label',c.dataset.title+': '+LV[c.dataset.l].word);bars.appendChild(b);
    const m=document.createElement('i');m.style.background=LV[c.dataset.l].c;m.style.height=({clear:30,busy:55,slow:80,vslow:100})[c.dataset.l]+'%';mini.appendChild(m);
  });
  let cur=-1;
  function setChapter(i){
    if(i===cur) return; cur=i;
    const c=chapters[i], l=c.dataset.l, lv=LV[l];
    document.body.dataset.sky=l;
    $$('#nav a').forEach((a,j)=>a.classList.toggle('on',j===i));
    $$('#pfBars a').forEach((a,j)=>a.classList.toggle('on',j===i));
    $$('#miniBars i').forEach((a,j)=>a.classList.toggle('on',j===i));
    const bar=$$('#pfBars a')[i];
    $('#pfNow').style.left=(bar.offsetLeft+bar.offsetWidth/2-1)+'px';
    const w=$('#pfWord'); w.classList.add('swap');
    setTimeout(()=>{w.querySelector('span').textContent=lv.word;w.querySelector('.dot').style.background=lv.c;w.classList.remove('swap');}, RM?0:180);
    const n=String(i+1).padStart(2,'0')+' / '+String(chapters.length).padStart(2,'0');
    $('#pfStep').textContent=n; $('#miniStep').textContent=n; $('#miniWord').textContent=lv.word;
  }
  function pickChapter(){
    const mid=innerHeight*0.4; let best=0;
    chapters.forEach((c,i)=>{if(c.getBoundingClientRect().top<mid) best=i;});
    setChapter(best);
  }
  document.body.dataset.sky='clear';

  /* scroll-linked drift for the flow phones */
  const drifters=$$('[data-drift]');
  function drift(){
    if(RM||innerWidth<900) {drifters.forEach(d=>d.style.transform='');return;}
    drifters.forEach(d=>{
      const r=d.parentElement.getBoundingClientRect();
      const p=(r.top+r.height/2-innerHeight/2)/innerHeight;
      d.style.transform='translate3d(0,'+(p*+d.dataset.drift).toFixed(1)+'px,0)';
    });
  }
  let ticking=false;
  addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{pickChapter();drift();$(".mini").classList.toggle("hide",scrollY<innerHeight*.6);ticking=false;});},{passive:true});
  addEventListener('resize',()=>{cur=-1;pickChapter();drift();});
  requestAnimationFrame(()=>{pickChapter();drift();});

  /* ---------- the flip phones ---------- */
  const flips=[];
  $$('[data-flip]').forEach(el=>{
    const frames=el.dataset.frames.split('|');
    const tabs=el.dataset.tabs?el.dataset.tabs.split('|'):null;
    const alts=(el.dataset.alts||'').split('|');
    const qs=el.dataset.qs?el.dataset.qs.split('|'):null;
    const glows=el.dataset.glows?el.dataset.glows.split('|'):null;
    const pair=el.hasAttribute('data-pair');
    const interval=+(el.dataset.interval||3400);
    el.innerHTML='<i class="shadow"></i>'+(el.dataset.badge?'<span class="badge">'+el.dataset.badge+'</span>':'')+
      '<div class="card"><div class="fc front"><img width="511" height="1066" alt=""></div><div class="fc back"><img width="511" height="1066" alt="" loading="lazy"></div></div>';
    el.setAttribute('role','button'); el.tabIndex=0;
    const card=el.querySelector('.card'), front=el.querySelector('.front img'), back=el.querySelector('.back img');
    const badge=el.querySelector('.badge');
    front.src=frames[0]; front.alt=alts[0]||''; back.src=frames[1%frames.length];
    const st={el,i:0,angle:0,timer:null,inView:false,hover:false,frames,user:false};
    let tabsEl=null;
    if(tabs && !el.hasAttribute('data-notabs')){
      tabsEl=document.createElement('div');tabsEl.className='tabs';tabsEl.setAttribute('role','group');tabsEl.setAttribute('aria-label','Screens');
      tabsEl.style.setProperty('--dur',interval+'ms');
      tabs.forEach((t,j)=>{const b=document.createElement('button');b.type='button';b.innerHTML=t+'<i class="bar"></i>';b.setAttribute('aria-pressed',j===0);b.onclick=e=>{e.stopPropagation();st.user=true;go(j);restart();};tabsEl.appendChild(b);});
      el.after(tabsEl);
    }
    const qEl=el.parentElement.querySelector('[data-q]');
    const glow=el.dataset.glow?document.getElementById(el.dataset.glow):null;
    function label(){el.setAttribute('aria-label',(alts[st.i]||'Screen')+'. Activate to flip to the next screen.');}
    label();
    function go(j){
      if(j===st.i) return;
      const showingFront=(Math.round(st.angle/180)%2===0);
      const hidden=showingFront?back:front;
      hidden.src=frames[j]; hidden.alt=alts[j]||'';
      (showingFront?front:back).alt='';
      st.angle+=180; st.i=j;
      card.style.transform='rotateY('+st.angle+'deg)';
      if(!RM){el.classList.remove('flipping');void el.offsetWidth;el.classList.add('flipping');setTimeout(()=>el.classList.remove('flipping'),950);}
      if(tabsEl) $$('button',tabsEl).forEach((b,k)=>{b.setAttribute('aria-pressed',k===j); if(k===j){const bar=b.querySelector('.bar');bar.style.animation='none';void bar.offsetWidth;bar.style.animation='';}});
      if(qEl&&qs){qEl.classList.add('swap');setTimeout(()=>{qEl.textContent=qs[j];qEl.classList.remove('swap');},RM?0:260);}
      if(glow&&glows) glow.style.background=glows[j];
      if(badge&&pair) badge.textContent=tabs[j];
      label();
      // preload the one after
      const nx=new Image(); nx.src=frames[(j+1)%frames.length];
    }
    st.go=go;
    if(pair && badge) badge.textContent=tabs[0];
    else if(pair){const b=document.createElement('span');b.className='badge';b.textContent=tabs[0];el.prepend(b);}
    function next(){go((st.i+1)%frames.length);}
    st.next=next;
    function restart(){clearInterval(st.timer);st.timer=null;if(!pair&&!RM&&st.inView&&!st.hover)st.timer=setInterval(next,interval);if(tabsEl)tabsEl.classList.toggle('paused',!st.timer);}
    st.restart=restart;
    el.addEventListener('click',()=>{st.user=true;next();restart();});
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();st.user=true;next();restart();}});
    if(!pair){
      el.addEventListener('pointerenter',()=>{st.hover=true;restart();});
      el.addEventListener('pointerleave',()=>{st.hover=false;restart();});
    }
    flips.push(st);
  });
  // re-query badges for pairs (created after)
  flips.forEach(st=>{if(st.el.hasAttribute('data-pair')){st.badge=st.el.querySelector('.badge');}});
  const fio=new IntersectionObserver(es=>es.forEach(e=>{
    const st=flips.find(s=>s.el===e.target); if(!st) return;
    st.inView=e.isIntersecting; st.restart();
    // before/after: flip to "after" once, the first time it's seen
    if(e.isIntersecting && st.el.hasAttribute('data-pair') && !st.revealed && !RM){
      st.revealed=true; setTimeout(()=>{if(!st.user) st.go(1);}, 700+Math.random()*500);
    }
  }),{threshold:.45});
  flips.forEach(st=>fio.observe(st.el));
  const pairBadge=st=>{const b=st.el.querySelector('.badge'); if(b) b.textContent=st.i? 'After':'Before';};
  flips.filter(s=>s.el.hasAttribute('data-pair')).forEach(st=>{
    const g=st.go; st.go=j=>{g(j);pairBadge(st);};
    st.el.addEventListener('click',()=>pairBadge(st));
    st.el.addEventListener('keydown',()=>pairBadge(st));
  });

  /* marquee of every screen */
  const all=['forecast-block','sources','map-now','zone','household','appeal','decision','log','sensors','quiet','light-busy','map-wiring','forecast-farm','household-paused','quiet-preview','log-accuracy','sensors-table','light-slow','map-history','appeal-filled','forecast-home','quiet-joined','log-rules','map-priority'];
  const mq=$('#marquee');
  [all.slice(0,12),all.slice(12)].forEach((set,r)=>{
    const row=document.createElement('div');row.className='mrow'+(r?' rev':'');
    [...set,...set].forEach((n,k)=>{const im=new Image();im.src='screens/'+n+'.webp';im.loading='lazy';im.width=511;im.height=1066;im.alt=k<set.length?n.replace(/-/g,' ')+' screen':'';if(k>=set.length)im.setAttribute('aria-hidden','true');im.dataset.zoom='';row.appendChild(im);});
    mq.appendChild(row);
  });

  /* type specimen: the verdict word cycles */
  const words=[['Slow','#EC8F4D'],['Busy','#F2C85B'],['Clear','#9CC8EE'],['Very slow','#B23F36']];
  let wi=0; const tw=$('#typeWord'), td=$('#typeDot');
  if(!RM) setInterval(()=>{
    const r=tw.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight) return;
    tw.classList.add('out');
    setTimeout(()=>{wi=(wi+1)%words.length;tw.textContent=words[wi][0];td.style.background=words[wi][1];tw.classList.remove('out');},260);
  },2200);

  /* ad videos: play in view, one sound at a time */
  const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){if(!RM||v.dataset.auto===undefined)v.play().catch(()=>{});}else v.pause();}),{threshold:.35});
  $$('video').forEach(v=>{ if(RM){v.removeAttribute('autoplay');v.pause();v.controls=true;} else vio.observe(v); });
  $$('.sound').forEach(b=>b.addEventListener('click',()=>{
    const v=b.parentElement.querySelector('video'); const on=b.getAttribute('aria-pressed')!=='true';
    $$('.sound').forEach(o=>{o.setAttribute('aria-pressed','false');o.parentElement.querySelector('video').muted=true;});
    if(on){v.muted=false;v.currentTime=0;v.play().catch(()=>{});b.setAttribute('aria-pressed','true');}
  }));

  /* lightbox */
  const lb=$('#lb'), lbi=$('img',lb);
  document.addEventListener('click',e=>{
    const im=e.target.closest('[data-zoom]'); if(!im||!lb.showModal) return;
    lbi.src=im.currentSrc||im.src; lbi.alt=im.alt; lbi.style.maxWidth=im.naturalWidth<700?'min(94vw,420px)':''; lb.showModal();
  });
  lb.addEventListener('click',()=>lb.close());
})();
