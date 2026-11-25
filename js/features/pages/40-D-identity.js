/* D. Tumblr-era identity, fashion, emotional aesthetics.
   Each world is the scene's own practice: reblogging into a diary, a sticker sheet, a mood strip,
   a sketchbook, a study session, a wardrobe + diary, a get-ready-with-me card. Session only. */
(function () {
  const P = window.SC_PAGES;
  const q = (r, s) => r.querySelector(s), qa = (r, s) => Array.from(r.querySelectorAll(s));
  // log an act, but only the first n of each kind (the receipt wants meaningful acts, not every click)
  const capped = (k, n) => { const c = {}; return (name, w, d) => { c[name] = (c[name] || 0) + 1; if (c[name] <= n) k.act(name, w, d); }; };
  const clock = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  const calm = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const say = (stage, t) => { const l = q(stage, '.dw-live'); if (l) l.textContent = t; };
  const press = (list, on) => list.forEach((b) => b.setAttribute('aria-pressed', String(b === on)));
  const eraYear = () => (typeof currentEra !== 'undefined' && currentEra) || '2014';
  const live = '<p class="dw-live" aria-live="polite"></p>';

  /* ---- soft grunge & 2014 tumblr: a dashboard you reblog from, into a blog whose theme you set ---- */
  const SG_PH = { rain: 'rain on a bus window', rose: 'a wilted rose on a windowsill', tape: 'a cassette and a ticket stub', sky: 'an overcast field' };
  const SG_FEED = [
    ['paperbackrain', 'rain', 'left the window open so the room sounds like somewhere else', '#rain #2am', 214],
    ['wiltedtapes', 'tape', 'found the stub in my coat pocket. keeping it', '#gigs #keep', 87],
    ['overcast-kid', 'sky', '', '#grey #no caption', 1204],
    ['sillflowers', 'rose', 'still pretty though', '#flowers #soft', 33],
  ];
  const sgPh = (p) => `<span class="sg-ph sg-ph-${p}" role="img" aria-label="${SG_PH[p]}"><i></i></span>`;
  P.softgrunge = { w: 560, html: (h) => `
    <div class="sg-room">
      <nav class="sg-bar" aria-label="blog sections"><b aria-hidden="true">t</b>${['dashboard', 'write', 'your blog', 'customize'].map((t, i) => `<button class="sg-tab" data-p="${i}" aria-pressed="${!i}">${t}</button>`).join('')}</nav>
      <section class="sg-p sg-dash" data-p="0">
        ${SG_FEED.map(([u, p, t, g, n], i) => `<article class="sg-post"><header><i class="sg-av sg-ph-${p}"></i><b>${u}</b></header>${sgPh(p)}${t ? `<p>${t}</p>` : ''}<small>${g}</small>
          <footer><span><b class="sg-n">${n}</b> notes</span><button class="sg-like" aria-pressed="false" aria-label="like ${u}'s post">♡</button><button class="sg-rb" data-i="${i}">↻ reblog</button></footer></article>`).join('')}
      </section>
      <section class="sg-p sg-write" data-p="1" hidden>
        <p class="sg-lbl">photo</p><div class="sg-pick">${Object.keys(SG_PH).map((p, i) => `<button class="sg-pk" data-ph="${p}" aria-pressed="${!i}" aria-label="${SG_PH[p]}">${sgPh(p)}</button>`).join('')}</div>
        <label class="sg-lbl">your line (yours, not a lyric)<textarea class="sg-line" maxlength="140" rows="2" placeholder="something you'd only say at 3am"></textarea></label>
        <label class="sg-lbl">tags<input class="sg-tags" maxlength="40" placeholder="#me #rain"></label>
        <button class="sg-go">post to your blog</button>
      </section>
      <section class="sg-p sg-blog" data-p="2" data-cur="default" hidden>
        <header class="sg-bhead"><span class="sg-hd sg-ph sg-ph-rain"><i></i></span><h3 class="sg-bt">diary_2014</h3><p class="sg-bd">a chronological mood archive</p>
          <button class="sg-play" aria-pressed="false">▶ untitled demo (on loop)</button></header>
        <ol class="sg-arch"><li class="sg-empty">nothing yet. reblog something, or write your own.</li></ol>
      </section>
      <section class="sg-p sg-theme" data-p="3" hidden>
        <label class="sg-lbl">blog title<input class="sg-ti" maxlength="24" value="diary_2014"></label>
        <label class="sg-lbl">description<input class="sg-de" maxlength="48" value="a chronological mood archive"></label>
        <p class="sg-lbl">header photo</p><div class="sg-pick sg-hdp">${Object.keys(SG_PH).map((p, i) => `<button data-ph="${p}" aria-pressed="${!i}" aria-label="${SG_PH[p]}">${sgPh(p)}</button>`).join('')}</div>
        <p class="sg-lbl">cursor</p><div class="sg-curs">${[['default', '↖'], ['heart', '♡'], ['cross', '✝'], ['star', '✧']].map(([c, s], i) => `<button data-cur="${c}" aria-pressed="${!i}" aria-label="${c} cursor">${s}</button>`).join('')}</div>
        <button class="sg-go sg-save">save theme</button>
      </section>
      ${live}${h.note('every blog, username and post on this dashboard is invented for the prototype.')}
    </div>`,
  run(stage, k) {
    const act = capped(k, 3), tabs = qa(stage, '.sg-tab'), arch = q(stage, '.sg-arch');
    const show = (i) => { press(tabs, tabs[i]); qa(stage, '.sg-p').forEach((p) => { p.hidden = p.dataset.p !== String(i); }); };
    tabs.forEach((b, i) => { b.onclick = () => show(i); });
    const add = (ph, line, tags, via) => {
      const e = q(arch, '.sg-empty'); if (e) e.remove();
      const li = document.createElement('li');
      li.innerHTML = `<time>${clock()}</time><figure class="sg-pol">${sgPh(ph)}<figcaption></figcaption></figure><small></small><em>${via ? 'reblogged from ' + k.esc(via) : 'posted by you'}</em>`;
      q(li, 'figcaption').textContent = line; q(li, 'small').textContent = tags;
      arch.prepend(li);
    };
    qa(stage, '.sg-like').forEach((b) => { b.onclick = () => {
      const on = b.getAttribute('aria-pressed') !== 'true', n = q(b.parentNode, '.sg-n');
      b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '♥' : '♡'; n.textContent = +n.textContent + (on ? 1 : -1);
    }; });
    qa(stage, '.sg-rb').forEach((b) => { b.onclick = () => {
      if (b.disabled) return;
      const [u, p, t, g] = SG_FEED[b.dataset.i], n = q(b.parentNode, '.sg-n');
      add(p, t, g, u); b.disabled = true; b.textContent = '↻ reblogged'; n.textContent = +n.textContent + 1;
      say(stage, 'reblogged to your blog, ' + clock()); act('reblog', 1, 'reblogged ' + SG_PH[p] + ' from ' + u);
    }; });
    let ph = 'rain';
    const pk = qa(stage, '.sg-pk'); pk.forEach((b) => { b.onclick = () => { ph = b.dataset.ph; press(pk, b); }; });
    q(stage, '.sg-write .sg-go').onclick = () => {
      const line = q(stage, '.sg-line').value.trim(), tags = q(stage, '.sg-tags').value.trim();
      if (!line) { say(stage, 'write a line first. it can be one word.'); q(stage, '.sg-line').focus(); return; }
      add(ph, line, tags, ''); q(stage, '.sg-line').value = ''; q(stage, '.sg-tags').value = '';
      show(2); say(stage, 'posted to your blog.');
      act('post', 2, 'posted a grainy photo of ' + SG_PH[ph] + ' with their own line: “' + line.slice(0, 50) + '”');
    };
    let hd = 'rain', cur = 'default';
    const hp = qa(stage, '.sg-hdp button'), cp = qa(stage, '.sg-curs button');
    hp.forEach((b) => { b.onclick = () => { hd = b.dataset.ph; press(hp, b); }; });
    cp.forEach((b) => { b.onclick = () => { cur = b.dataset.cur; press(cp, b); }; });
    q(stage, '.sg-save').onclick = () => {
      const blog = q(stage, '.sg-blog');
      q(blog, '.sg-bt').textContent = q(stage, '.sg-ti').value.trim() || 'untitled';
      q(blog, '.sg-bd').textContent = q(stage, '.sg-de').value.trim();
      q(blog, '.sg-hd').className = 'sg-hd sg-ph sg-ph-' + hd; blog.dataset.cur = cur;
      show(2); say(stage, 'theme saved.'); act('theme', 1, 'customised their blog theme (' + cur + ' cursor, ' + SG_PH[hd] + ' header)');
    };
    // the music player every blog had: a slow synthesised loop, only while it is on and the window is open
    const notes = [220, 261.6, 329.6, 293.7, 246.9, 196, 220, 164.8]; let stop = null, i = 0;
    const play = q(stage, '.sg-play');
    play.onclick = () => {
      if (stop) { stop(); stop = null; play.setAttribute('aria-pressed', 'false'); play.textContent = '▶ untitled demo (on loop)'; return; }
      play.setAttribute('aria-pressed', 'true'); play.textContent = '❚❚ untitled demo (on loop)';
      stop = k.every(650, () => { k.tone(notes[i++ % notes.length], 1.1, 'triangle', 0.03); });
      act('music', 0.5, 'left the music player on');
    };
  } };

  /* ---- pastel goth: a sticker sheet for one phone case, pastel ground, dark outlines ---- */
  const PG_ST = {
    bat: ['#C9B6E4', '<path d="M12 8.5l1.2-2 .6 2.2c2.6-2.2 6.4-2.4 9.2-.2-1.6.2-2.6 1.6-2.6 3.6-1.4-.8-3-.6-4 .8-.8-.8-2.4-.4-3.4 2.4-1-2.8-2.6-3.2-3.4-2.4-1-1.4-2.6-1.6-4-.8 0-2-1-3.4-2.6-3.6 2.8-2.2 6.6-2 9.2.2l.6-2.2z"/>'],
    skull: ['#F3EAF1', '<path d="M5 11a7 7 0 1 1 14 0v3h-2v4H7v-4H5z"/><circle cx="9" cy="11" r="1.9" fill="#222027"/><circle cx="15" cy="11" r="1.9" fill="#222027"/><path d="M10 18v-2M12 18v-2M14 18v-2"/>'],
    bow: ['#E8B7D0', '<path d="M12 12L3 6.5v11zM12 12l9-5.5v11z"/><circle cx="12" cy="12" r="2.6"/>'],
    heart: ['#E8B7D0', '<path d="M12 20.5C3.5 14 2.5 8.5 6 5.5c2.6-2.1 5.4-.4 6 2 .6-2.4 3.4-4.1 6-2 3.5 3 2.5 8.5-6 15z"/>'],
    moon: ['#F7E7A8', '<path d="M15 3a9 9 0 1 0 6 13A7 7 0 0 1 15 3z"/>'],
    cross: ['#A7D8D2', '<path d="M10 2.5h4v5h5v4h-5v10h-4v-10H5v-4h5z"/>'],
    ghost: ['#FFFFFF', '<path d="M5 21V10a7 7 0 0 1 14 0v11l-2.3-2-2.4 2-2.3-2-2.3 2-2.4-2z"/><circle cx="9.6" cy="10" r="1.2" fill="#222027"/><circle cx="14.4" cy="10" r="1.2" fill="#222027"/>'],
    star: ['#C9B6E4', '<path d="M12 2.5l2.8 6.4 7 .6-5.3 4.6 1.6 6.9L12 17.3 5.9 21l1.6-6.9L2.2 9.5l7-.6z"/>'],
    coffin: ['#A7D8D2', '<path d="M9 2h6l3.5 6L15 22H9L5.5 8z"/><path d="M12 7v8M9.5 10h5" fill="none"/>'],
  };
  const pgSvg = (s) => `<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="${PG_ST[s][0]}" stroke="#222027" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">${PG_ST[s][1]}</g></svg>`;
  P.pastelgoth = { w: 560, html: (h) => `
    <div class="pg-room">
      <header class="pg-head"><h3>graveyard.girl</h3><p>one phone case · pastel ground · dark outlines</p></header>
      <div class="pg-work">
        <div class="pg-case" data-g="pink"><div class="pg-layer" role="group" aria-label="phone case"></div><i class="pg-cam" aria-hidden="true"></i></div>
        <div class="pg-side">
          <p class="pg-lbl">ground</p><div class="pg-grounds">${['pink', 'lilac', 'mint', 'cream'].map((g, i) => `<button data-g="${g}" aria-pressed="${!i}" aria-label="${g} ground"></button>`).join('')}</div>
          <p class="pg-lbl">stickers</p><div class="pg-tray">${Object.keys(PG_ST).map((s) => `<button data-s="${s}" aria-pressed="false" aria-label="${s} sticker">${pgSvg(s)}</button>`).join('')}</div>
          <p class="pg-hint">pick a sticker, then tap the case. drag to move; drag off the case to peel it. keys: enter on a sticker places it, arrows nudge, delete peels.</p>
          <button class="pg-seal">seal it with a gloss coat</button>
        </div>
      </div>
      <div class="pg-shelf" hidden><p class="pg-lbl">your cases</p><div class="pg-row"></div></div>
      ${live}${h.note('pastel goth mixed the sweet and the macabre on purpose, mostly through fashion, accessories and DIY.')}
    </div>`,
  run(stage, k) {
    const act = capped(k, 4), cs = q(stage, '.pg-case'), layer = q(stage, '.pg-layer'), tray = qa(stage, '.pg-tray button');
    let sel = null;
    const place = (s, x, y) => {
      if (layer.children.length >= 24) { say(stage, 'the case is full. peel one off first.'); return; }
      const b = document.createElement('button');
      b.className = 'pg-st'; b.dataset.s = s; b.setAttribute('aria-label', s + ' sticker: arrows move it, delete peels it off');
      b.style.cssText = `left:${x}%;top:${y}%;--r:${Math.round(Math.random() * 40 - 20)}deg`; b.innerHTML = pgSvg(s);
      layer.appendChild(b); cs.classList.remove('sealed');
      if (!calm()) k.tone(660, 0.12, 'sine', 0.03, 990);
      say(stage, s + ' stuck on.'); act('sticker', 0.5, 'stuck a ' + s + ' sticker on a ' + cs.dataset.g + ' phone case');
      return b;
    };
    tray.forEach((b) => { b.onclick = (e) => {
      sel = b.dataset.s; press(tray, b);
      if (e.detail === 0) place(sel, 20 + Math.random() * 60, 15 + Math.random() * 70).focus(); // keyboard: place it straight away
      else say(stage, sel + ' picked. tap the case to stick it.');
    }; });
    const pct = (e) => { const r = cs.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; };
    let drag = null;
    cs.addEventListener('pointerdown', (e) => {
      const st = e.target.closest('.pg-st');
      if (st) { drag = st; st.setPointerCapture(e.pointerId); st.classList.add('lift'); return; }
      if (sel) { const [x, y] = pct(e); place(sel, x, y); }
      else say(stage, 'pick a sticker from the sheet first.');
    });
    cs.addEventListener('pointermove', (e) => { if (!drag) return; const [x, y] = pct(e); drag.style.left = x + '%'; drag.style.top = y + '%'; });
    const drop = (e) => {
      if (!drag) return; const [x, y] = pct(e);
      if (x < -8 || x > 108 || y < -8 || y > 108) { drag.remove(); say(stage, 'peeled off.'); } else drag.classList.remove('lift');
      drag = null;
    };
    cs.addEventListener('pointerup', drop); cs.addEventListener('pointercancel', drop);
    layer.addEventListener('keydown', (e) => {
      const st = e.target.closest('.pg-st'); if (!st) return;
      const mv = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key];
      if (mv) { e.preventDefault(); st.style.left = Math.min(100, Math.max(0, parseFloat(st.style.left) + mv[0])) + '%'; st.style.top = Math.min(100, Math.max(0, parseFloat(st.style.top) + mv[1])) + '%'; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); st.remove(); say(stage, 'peeled off.'); }
    });
    const gs = qa(stage, '.pg-grounds button');
    gs.forEach((b) => { b.onclick = () => { cs.dataset.g = b.dataset.g; press(gs, b); act('ground', 0.5, 'chose a ' + b.dataset.g + ' ground for the case'); }; });
    q(stage, '.pg-seal').onclick = () => {
      const n = layer.children.length;
      if (n < 2) { say(stage, 'a case needs at least two stickers.'); return; }
      cs.classList.add('sealed'); if (!calm()) [523, 659, 784].forEach((f, i) => k.after(i * 110, () => k.tone(f, 0.25, 'sine', 0.03)));
      const shelf = q(stage, '.pg-shelf'), mini = cs.cloneNode(true);
      mini.classList.add('pg-mini'); mini.removeAttribute('aria-label'); mini.setAttribute('aria-hidden', 'true');
      qa(mini, 'button').forEach((x) => x.setAttribute('tabindex', '-1'));
      shelf.hidden = false; q(shelf, '.pg-row').appendChild(mini);
      say(stage, 'sealed. ' + n + ' stickers under gloss.');
      k.act('case', 2, 'designed and sealed a ' + cs.dataset.g + ' phone case with ' + n + ' stickers');
    };
  } };

  /* ---- gloomcore: a dark visual diary arranged by mood. weather and rooms only, no gore ---- */
  const GC_T = { overcast: 'overcast sky', rain: 'rain on glass', wilt: 'a wilted flower', static: 'tv static', lamp: 'a streetlight in fog', trees: 'treeline at dusk' };
  const GC_SLOTS = ['morning', 'midday', 'afternoon', 'evening', 'night'];
  const GC_MOODS = ['melancholy', 'numb', 'restless', 'heavy', 'tender'];
  const gcArt = (t) => `<span class="gc-art gc-${t}" aria-hidden="true">${t === 'static' ? '<canvas width="40" height="28"></canvas>' : t === 'wilt' ? '<i>🥀</i>' : '<i></i>'}</span>`;
  P.gorecore = { w: 560, html: (h) => `
    <div class="gc-room">
      <header class="gc-head"><h3>gloom_archive</h3><p>a dark visual diary, arranged by mood. this room keeps to the gloom side: weather, rooms, wilted things.</p></header>
      <p class="gc-lbl">today, in five pictures</p>
      <ol class="gc-strip">${GC_SLOTS.map((s, i) => `<li><button class="gc-slot" data-i="${i}" aria-pressed="${!i}" aria-label="${s}: empty"><span class="gc-plus">+</span></button><small>${s}</small></li>`).join('')}</ol>
      <p class="gc-lbl">choose a picture for the <b class="gc-which">morning</b></p>
      <div class="gc-pics">${Object.keys(GC_T).map((t) => `<button class="gc-pic" data-t="${t}">${gcArt(t)}<small>${GC_T[t]}</small></button>`).join('')}</div>
      <p class="gc-lbl">which shelf does it go on</p>
      <div class="gc-moods">${GC_MOODS.map((m) => `<button data-m="${m}" aria-pressed="false">${m}</button>`).join('')}</div>
      <label class="gc-lbl">name it in your own words <span>(optional)</span><input class="gc-name" maxlength="48" placeholder="like a sunday at 5pm"></label>
      <button class="gc-file">file this day</button>
      <section class="gc-arch" hidden><p class="gc-lbl">the archive, by mood</p><div class="gc-shelves"></div></section>
      ${live}${h.note('gloomcore is melancholy and heaviness; gorecore can involve body horror, which this room leaves out on purpose.')}
    </div>`,
  run(stage, k) {
    const act = capped(k, 3), slots = qa(stage, '.gc-slot'), moods = qa(stage, '.gc-moods button');
    let day = [], sel = 0, mood = '', n = 0;
    const pickSlot = (i) => { sel = i; press(slots, slots[i]); q(stage, '.gc-which').textContent = GC_SLOTS[i]; };
    slots.forEach((b, i) => { b.onclick = () => pickSlot(i); });
    qa(stage, '.gc-pic').forEach((b) => { b.onclick = () => {
      const t = b.dataset.t; day[sel] = t;
      slots[sel].innerHTML = gcArt(t); slots[sel].setAttribute('aria-label', GC_SLOTS[sel] + ': ' + GC_T[t]);
      say(stage, GC_SLOTS[sel] + ': ' + GC_T[t] + '.');
      act('arrange', 0.5, 'chose ' + GC_T[t] + ' for the ' + GC_SLOTS[sel]);
      const next = GC_SLOTS.findIndex((_, i) => !day[i]); if (next > -1) pickSlot(next);
      paint();
    }; });
    moods.forEach((b) => { b.onclick = () => { mood = b.dataset.m; press(moods, b); }; });
    q(stage, '.gc-file').onclick = () => {
      const filled = day.filter(Boolean).length, name = q(stage, '.gc-name').value.trim();
      if (filled < 3) { say(stage, 'pick at least three pictures for the day.'); return; }
      if (!mood) { say(stage, 'choose a shelf for it first.'); return; }
      n += 1;
      const shelves = q(stage, '.gc-shelves');
      let sh = q(shelves, `[data-m="${mood}"]`);
      if (!sh) { sh = document.createElement('div'); sh.className = 'gc-shelf'; sh.dataset.m = mood; sh.innerHTML = `<h4>${mood}</h4>`; shelves.appendChild(sh); }
      const e = document.createElement('div'); e.className = 'gc-entry';
      e.innerHTML = `<div class="gc-mini">${GC_SLOTS.map((_, i) => day[i] ? gcArt(day[i]) : '<span class="gc-art gc-none"></span>').join('')}</div><small>day ${n}<span></span></small>`;
      q(e, 'small span').textContent = name ? ' · ' + name : '';
      sh.appendChild(e); q(stage, '.gc-arch').hidden = false;
      if (name) k.act('name', 2, 'named a feeling in their own words: “' + name + '”');
      k.act('file', 1, 'filed a day of ' + filled + ' pictures under “' + mood + '”');
      day = []; mood = ''; press(moods, null); q(stage, '.gc-name').value = '';
      slots.forEach((b, i) => { b.innerHTML = '<span class="gc-plus">+</span>'; b.setAttribute('aria-label', GC_SLOTS[i] + ': empty'); });
      pickSlot(0); paint(); say(stage, 'filed under ' + sh.dataset.m + '. the strip is empty again.');
      if (!calm()) k.tone(110, 1.4, 'sine', 0.04, 82);
    };
    // the static tiles flicker (once, if motion is reduced)
    const paint = () => qa(stage, '.gc-static canvas').forEach((c) => {
      const x = c.getContext('2d'), im = x.createImageData(c.width, c.height);
      for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 150 | 0; im.data[i] = im.data[i + 1] = v; im.data[i + 2] = v + 8; im.data[i + 3] = 255; }
      x.putImageData(im, 0, 0);
    });
    paint(); if (!calm()) k.every(120, paint);
  } };

  /* ---- art hoe: a sketchbook page, then the gallery wall with a label you write ---- */
  const AH_BR = { pencil: [1.4, 0.8, 'graphite'], ink: [2.6, 1, 'ink'], marker: [9, 0.45, 'marker'], wash: [22, 0.06, 'watercolour'], eraser: [18, 1, ''] };
  const AH_INK = [['#3b3631', 'charcoal'], ['#E8B923', 'sunflower'], ['#F28C8C', 'coral'], ['#75B9A7', 'sage'], ['#9C86DB', 'lilac'], ['#4F73B0', 'cobalt']];
  const AH_PAPER = '#fbf6ea';
  P.arthoe = { w: 580, html: (h) => `
    <div class="ah-room">
      <header class="ah-head"><h3>artclub.jpg</h3><p>a sketchbook, then the gallery · ${h.years}</p></header>
      <div class="ah-v ah-bookv">
        <div class="ah-book"><canvas class="ah-cv" width="560" height="360" tabindex="0" aria-label="sketchbook page. draw with a pointer. with keys: arrows move the pen, space lifts or lowers it."></canvas><i class="ah-pen" aria-hidden="true"></i></div>
        <div class="ah-tools">
          <div class="ah-br">${Object.keys(AH_BR).map((b, i) => `<button data-b="${b}" aria-pressed="${!i}">${b === 'wash' ? 'watercolour' : b}</button>`).join('')}</div>
          <div class="ah-ink">${AH_INK.map(([c, n], i) => `<button data-c="${c}" style="--c:${c}" aria-pressed="${!i}" aria-label="${n}"></button>`).join('')}</div>
          <div class="ah-acts"><button class="ah-clear">new page</button><button class="ah-hang">hang it in the gallery →</button></div>
        </div>
      </div>
      <div class="ah-v ah-galv" hidden>
        <div class="ah-wall"><figure class="ah-frame"><img alt="your sketchbook page, framed"></figure>
          <div class="ah-label"><b class="ah-lt">Untitled</b>, <span class="ah-ly"></span><span class="ah-la"></span><span class="ah-lm"></span><p class="ah-lc"></p></div></div>
        <label class="ah-f">title<input class="ah-ti" maxlength="40" placeholder="untitled (tuesday)"></label>
        <label class="ah-f">wall text: what were you looking at?<textarea class="ah-ca" maxlength="180" rows="2" placeholder="the light on the kitchen table, mostly"></textarea></label>
        <div class="ah-acts"><button class="ah-print">print the label</button><button class="ah-back">← back to the sketchbook</button></div>
      </div>
      ${live}${h.note('art hoe grew on tumblr and instagram around 2015, started by young artists of colour who wanted to see themselves, and their own work, inside art history.')}
    </div>`,
  run(stage, k) {
    const cv = q(stage, '.ah-cv'), x = cv.getContext('2d'), pen = q(stage, '.ah-pen'), used = new Set();
    let br = 'pencil', ink = AH_INK[0][0], strokes = 0, last = null;
    const paper = () => { x.globalAlpha = 1; x.fillStyle = AH_PAPER; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#8a7a5a'; for (let i = 0; i < 700; i++) { x.globalAlpha = Math.random() * 0.06; x.fillRect(Math.random() * cv.width, Math.random() * cv.height, 1.5, 1.5); } };
    paper();
    const seg = (a, b) => {
      const [w, al] = AH_BR[br];
      x.globalAlpha = al; x.strokeStyle = br === 'eraser' ? AH_PAPER : ink; x.lineWidth = w; x.lineCap = br === 'marker' ? 'square' : 'round'; x.lineJoin = 'round';
      const j = br === 'pencil' ? () => Math.random() - 0.5 : () => 0;
      x.beginPath(); x.moveTo(a[0] + j(), a[1] + j()); x.lineTo(b[0] + j(), b[1] + j()); x.stroke();
      if (br === 'wash') { x.lineWidth = w * 0.6; x.stroke(); }
    };
    const end = () => {
      if (!last) return; last = null; strokes += 1; if (br !== 'eraser') used.add(AH_BR[br][2]);
      if (strokes === 4) k.act('draw', 1, 'drew a page in the sketchbook (' + Array.from(used).join(', ') + ')');
    };
    const at = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); last = at(e); seg(last, [last[0] + 0.1, last[1]]); });
    cv.addEventListener('pointermove', (e) => { if (!last) return; const p = at(e); seg(last, p); last = p; });
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    // keyboard drawing: a visible pen you steer with the arrows
    let kp = [280, 180], down = false;
    const mark = () => { pen.style.setProperty('--x', kp[0] / cv.width); pen.style.setProperty('--y', kp[1] / cv.height); pen.classList.toggle('down', down); };
    cv.addEventListener('focus', () => { pen.hidden = false; mark(); }); cv.addEventListener('blur', () => { pen.hidden = true; });
    cv.addEventListener('keydown', (e) => {
      const mv = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] }[e.key];
      if (e.key === ' ') { e.preventDefault(); down = !down; if (down) last = kp.slice(); else end(); say(stage, down ? 'pen down' : 'pen up'); }
      if (mv) { e.preventDefault(); const n = [Math.min(cv.width, Math.max(0, kp[0] + mv[0])), Math.min(cv.height, Math.max(0, kp[1] + mv[1]))]; if (down) { seg(kp, n); last = n; } kp = n; }
      mark();
    });
    pen.hidden = true;
    const bs = qa(stage, '.ah-br button'), is = qa(stage, '.ah-ink button');
    bs.forEach((b) => { b.onclick = () => { br = b.dataset.b; press(bs, b); }; });
    is.forEach((b) => { b.onclick = () => { ink = b.dataset.c; press(is, b); if (br === 'eraser') { br = 'pencil'; press(bs, bs[0]); } }; });
    q(stage, '.ah-clear').onclick = () => { paper(); used.clear(); strokes = 0; say(stage, 'new page.'); };
    const view = (g) => { q(stage, '.ah-bookv').hidden = g; q(stage, '.ah-galv').hidden = !g; };
    const medium = () => { const m = Array.from(used); return (m.length ? m.join(', ').replace(/, ([^,]*)$/, ' and $1') : 'blank') + ' on sketchbook paper'; };
    q(stage, '.ah-hang').onclick = () => {
      if (!strokes) { say(stage, 'draw something first, even a line.'); cv.focus(); return; }
      q(stage, '.ah-frame img').src = cv.toDataURL('image/png');
      q(stage, '.ah-ly').textContent = eraYear(); q(stage, '.ah-la').textContent = k.handle; q(stage, '.ah-lm').textContent = medium();
      view(true); say(stage, 'hung on the wall. now write its label.');
      k.act('hang', 1, 'hung their own drawing in the gallery');
    };
    q(stage, '.ah-back').onclick = () => view(false);
    q(stage, '.ah-print').onclick = () => {
      const t = q(stage, '.ah-ti').value.trim(), c = q(stage, '.ah-ca').value.trim();
      q(stage, '.ah-lt').textContent = t || 'Untitled'; q(stage, '.ah-lc').textContent = c;
      q(stage, '.ah-label').classList.add('printed'); say(stage, 'label printed.');
      if (c) k.act('label', 2, 'wrote a museum label for their own drawing: “' + (t || 'untitled') + '”');
    };
  } };

  /* ---- studyblr & plant mom: a study session, a to-do, highlighted notes, a plant that grows ---- */
  const ST_NOTES = ['Photosynthesis turns light, water and carbon dioxide into sugar and oxygen.', 'It happens mostly in the chloroplasts of leaf cells.', 'Stomata are tiny pores that let gases in and out of the leaf.', 'Water leaves through the stomata too: this is transpiration.', 'Roots take up water and minerals; the xylem carries them upward.'];
  const ST_HL = [['#F5E27A', 'yellow'], ['#F2B8C6', 'pink'], ['#B9DDB0', 'green'], ['#C9B8EC', 'lilac']];
  const ST_LEAF = [[-40, 0.15, 86], [40, 0.3, 76], [-35, 0.5, 64], [38, 0.65, 54], [-30, 0.8, 46]];
  P.studyblr = { w: 600, html: (h) => `
    <div class="st-room">
      <header class="st-head"><h3>small-rituals</h3><p>today's study spread · <span class="st-day">day 1</span> of 100</p></header>
      <div class="st-grid">
        <section class="st-card st-tm"><h4>session</h4><div class="st-clock" role="timer">25:00</div>
          <div class="st-len">${[15, 25, 45].map((m) => `<button data-m="${m}" aria-pressed="${m === 25}">${m}</button>`).join('')}</div>
          <button class="st-go">start</button><small>sped up: one second here is one minute</small></section>
        <section class="st-card st-pl"><h4>desk plant</h4>
          <svg class="st-svg" viewBox="0 0 120 132" role="img" aria-label="a small potted plant"><path class="st-stem" d="M60 100C60 86 56 72 60 40" pathLength="1"/>
            ${ST_LEAF.map(([r, a, y]) => `<g transform="translate(60 ${y}) rotate(${r < 0 ? 180 + r : r})"><ellipse class="st-lf" data-at="${a}" cx="11" cy="0" rx="11" ry="4.6"/></g>`).join('')}
            <g transform="translate(60 38)"><g class="st-fl"><circle r="5" cx="0" cy="-5"/><circle r="5" cx="5" cy="1"/><circle r="5" cx="-5" cy="1"/><circle r="3" class="st-fc"/></g></g>
            <path class="st-pot" d="M38 104h44l-6 26H44z"/><rect class="st-rim" x="35" y="98" width="50" height="8" rx="2"/></svg>
          <div class="st-moist" aria-label="soil moisture"><i></i></div><button class="st-water">water it</button></section>
        <section class="st-card st-td"><h4>to do</h4><ul class="st-list"></ul>
          <form class="st-add"><input maxlength="40" aria-label="new to-do" placeholder="write one thing"><button>add</button></form></section>
        <section class="st-card st-nt"><h4>notes · ch. 4, plants</h4>
          <div class="st-hl">${ST_HL.map(([c, n], i) => `<button data-c="${c}" style="--c:${c}" aria-pressed="${!i}" aria-label="${n} highlighter"></button>`).join('')}</div>
          <div class="st-txt">${ST_NOTES.map((s) => `<span class="st-s" role="button" tabindex="0" aria-pressed="false">${s}</span>`).join(' ')}</div></section>
      </div>
      <div class="st-done" hidden></div>
      ${live}${h.note('studyblrs posted desks, notes and timers, often as a "100 days of productivity" challenge: the aesthetic grew around the habit.')}
    </div>`,
  run(stage, k) {
    const act = capped(k, 3), svg = q(stage, '.st-svg'), clockEl = q(stage, '.st-clock'), go = q(stage, '.st-go'), list = q(stage, '.st-list');
    let len = 25, left = 25, running = false, stop = null, g = 0, moist = 70, day = 1;
    const draw = () => {
      clockEl.textContent = String(left).padStart(2, '0') + ':00';
      q(svg, '.st-stem').style.strokeDashoffset = 1 - Math.max(0.12, g);
      qa(svg, '.st-lf').forEach((l) => l.classList.toggle('on', g >= +l.dataset.at));
      q(svg, '.st-fl').classList.toggle('on', g >= 1); svg.classList.toggle('thirsty', moist <= 0);
      q(stage, '.st-moist i').style.width = moist + '%';
    };
    const lens = qa(stage, '.st-len button');
    lens.forEach((b) => { b.onclick = () => { if (running) return; len = left = +b.dataset.m; press(lens, b); draw(); }; });
    const finish = () => {
      stop(); stop = null; running = false; go.textContent = 'start another';
      const done = qa(list, '[aria-pressed="true"]').length, all = list.children.length, leaves = qa(svg, '.st-lf.on').length;
      const card = q(stage, '.st-done'); card.hidden = false;
      card.innerHTML = `<b>day ${day}/100</b><span>${len} minutes studied · ${done} of ${all} ticked off · the plant ${g >= 1 ? 'flowered' : 'grew ' + leaves + ' leaves'}</span><small>#100daysofproductivity #studyblr</small>`;
      q(stage, '.st-day').textContent = 'day ' + (++day);
      say(stage, 'session done. ' + len + ' minutes.'); if (!calm()) [784, 988, 1175].forEach((f, i) => k.after(i * 160, () => k.tone(f, 0.4, 'sine', 0.04)));
      k.act('session', 2, 'finished a ' + len + '-minute study session (sped up)');
      left = len; draw(); // the plant keeps what it grew; only the clock resets
    };
    go.onclick = () => {
      if (running) { stop(); stop = null; running = false; go.textContent = 'resume'; say(stage, 'paused.'); return; }
      running = true; go.textContent = 'pause'; q(stage, '.st-done').hidden = true; say(stage, 'session started.');
      stop = k.every(1000, () => {
        left -= 1; moist = Math.max(0, moist - 6);
        if (moist > 0) g = Math.min(1, g + 1 / len);
        if (moist === 0 && left % 5 === 0) say(stage, 'the plant looks thirsty.');
        draw(); if (left <= 0) finish();
      });
    };
    q(stage, '.st-water').onclick = () => { moist = Math.min(100, moist + 45); draw(); say(stage, 'watered.'); act('water', 0.5, running ? 'watered the desk plant mid-session' : 'watered the desk plant'); };
    const addTodo = (t, mine) => {
      const li = document.createElement('li'); li.innerHTML = '<button aria-pressed="false"><span></span></button>';
      q(li, 'span').textContent = t; list.appendChild(li);
      q(li, 'button').onclick = (e) => { const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); if (on) act('tick', 0.5, 'ticked off “' + t + '”'); };
      if (mine) act('todo', 1, 'wrote a to-do in their own hand: “' + t + '”');
    };
    ['make tea', 'reread chapter 4'].forEach((t) => addTodo(t, false));
    q(stage, '.st-add').onsubmit = (e) => { e.preventDefault(); const i = q(e.target, 'input'), t = i.value.trim(); if (t) { addTodo(t, true); i.value = ''; } };
    let hl = ST_HL[0][0]; const hs = qa(stage, '.st-hl button');
    hs.forEach((b) => { b.onclick = () => { hl = b.dataset.c; press(hs, b); }; });
    qa(stage, '.st-s').forEach((b) => { b.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } }; b.onclick = () => {
      const on = b.getAttribute('aria-pressed') !== 'true' || b.style.getPropertyValue('--h') !== hl;
      b.setAttribute('aria-pressed', String(on)); b.style.setProperty('--h', on ? hl : 'transparent');
      if (on) act('highlight', 0.5, 'highlighted a line of their notes');
    }; });
    draw();
  } };

  /* ---- coquette: tie a bow, lay out an outfit, write a line in a ribboned diary ---- */
  const CQ_RIB = [['#E7A6B8', 'blush'], ['#F1E2CF', 'cream'], ['#8E2F3E', 'velvet red'], ['#AFC6DD', 'powder blue']];
  const CQ_IT = [['dress', '👗', 'a tea dress', 50, 48], ['blouse', '👚', 'a blouse', 22, 30], ['flats', '🩰', 'ballet flats', 78, 78], ['hat', '👒', 'a straw hat', 78, 22], ['socks', '🧦', 'frilled socks', 22, 76], ['pearls', '', 'pearls', 50, 13], ['rose', '🌹', 'a rose', 8, 50], ['book', '📖', 'a paperback', 50, 86], ['bow', '', 'your bow', 92, 50]];
  P.coquette = { w: 560, html: (h) => `
    <div class="cq-room">
      <header class="cq-head"><h3>ribbon.html</h3><p>a digital wardrobe &amp; visual diary</p><div class="cq-pearls" aria-hidden="true">${'<i></i>'.repeat(9)}</div></header>
      <section class="cq-sec"><h4>i. tie a bow</h4>
        <div class="cq-bowbox"><svg class="cq-bow" data-step="0" viewBox="0 0 240 130" role="img" aria-label="a ribbon, untied">
          <path class="cq-r0" d="M10 64C60 52 100 74 140 60S200 58 230 66"/>
          <path class="cq-l1" pathLength="1" d="M120 62C92 20 46 26 56 60C64 88 100 78 120 62"/><path class="cq-l2" pathLength="1" d="M120 62C148 20 194 26 184 60C176 88 140 78 120 62"/>
          <path class="cq-t" pathLength="1" d="M117 64C106 86 94 102 82 120M123 64C134 86 146 102 158 120"/><ellipse class="cq-k" cx="120" cy="62" rx="9" ry="11"/></svg></div>
        <div class="cq-rib">${CQ_RIB.map(([c, n], i) => `<button data-c="${c}" style="--c:${c}" aria-pressed="${!i}" aria-label="${n} ribbon"></button>`).join('')}</div>
        <div class="cq-steps"><button data-s="1">make the first loop</button><button data-s="2" disabled>cross the second loop over</button><label>pull it tight<input class="cq-pull" type="range" min="0" max="100" value="0" disabled></label></div></section>
      <section class="cq-sec"><h4>ii. lay out an outfit</h4>
        <div class="cq-cloth" aria-label="flat-lay">${CQ_IT.map(([id, em, n, x, y]) => `<span class="cq-it cq-it-${id}" data-id="${id}" style="left:${x}%;top:${y}%" aria-hidden="true">${em || (id === 'pearls' ? '<i></i>'.repeat(9) : '')}</span>`).join('')}</div>
        <div class="cq-items">${CQ_IT.map(([id, em, n]) => `<button data-id="${id}" aria-pressed="false"${id === 'bow' ? ' hidden' : ''}>${n}</button>`).join('')}</div></section>
      <section class="cq-sec"><h4>iii. the diary</h4>
        <div class="cq-book"><i class="cq-ribbon" aria-hidden="true"></i><p class="cq-date"></p>
          <label>dear diary,<textarea class="cq-line" maxlength="200" rows="3" placeholder="today i wore…"></textarea></label>
          <button class="cq-close">close it and tie the ribbon</button></div>
        <ol class="cq-pages"></ol></section>
      ${live}${h.note('coquette draws on romantic, vintage-feminine styling. this room keeps to ribbons, clothes and keepsakes.')}
    </div>`,
  run(stage, k) {
    const bow = q(stage, '.cq-bow'), pull = q(stage, '.cq-pull'), [s1, s2] = qa(stage, '.cq-steps button');
    let col = CQ_RIB[0], tied = false;
    const step = (n) => { bow.dataset.step = n; if (!calm()) k.tone(440 + n * 110, 0.2, 'sine', 0.025); };
    const rs = qa(stage, '.cq-rib button');
    rs.forEach((b, i) => { b.onclick = () => { col = CQ_RIB[i]; press(rs, b); stage.style.setProperty('--rib', col[0]); }; });
    stage.style.setProperty('--rib', col[0]);
    s1.onclick = () => { step(1); s1.disabled = true; s2.disabled = false; s2.focus(); say(stage, 'one loop. now cross the other over it.'); };
    s2.onclick = () => { step(2); s2.disabled = true; pull.disabled = false; pull.focus(); say(stage, 'two loops. pull it tight.'); };
    pull.oninput = () => {
      bow.style.setProperty('--t', pull.value / 100); if (pull.value > 20) bow.dataset.step = 3;
      if (pull.value >= 100 && !tied) {
        tied = true; pull.disabled = true; bow.setAttribute('aria-label', 'a ' + col[1] + ' bow, tied'); bow.classList.add('tied');
        if (!calm()) [880, 1109, 1319].forEach((f, i) => k.after(i * 90, () => k.tone(f, 0.5, 'sine', 0.025)));
        const it = q(stage, '.cq-items [data-id="bow"]'); it.hidden = false; it.textContent = 'your ' + col[1] + ' bow';
        say(stage, 'tied. your bow is in the wardrobe now.'); k.act('bow', 1, 'tied a ' + col[1] + ' ribbon into a bow');
      }
    };
    const worn = new Set(); let logged = false;
    qa(stage, '.cq-items button').forEach((b) => { b.onclick = () => {
      const id = b.dataset.id, on = !worn.has(id); on ? worn.add(id) : worn.delete(id);
      b.setAttribute('aria-pressed', String(on)); q(stage, '.cq-it-' + id).classList.toggle('on', on);
      say(stage, (on ? 'laid out ' : 'put away ') + b.textContent + '.');
      if (worn.size >= 4 && !logged) { logged = true; k.act('outfit', 1, 'laid out a flat-lay: ' + CQ_IT.filter((x) => worn.has(x[0])).map((x) => x[2]).join(', ')); }
    }; });
    const d = new Date();
    q(stage, '.cq-date').textContent = d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }).toLowerCase();
    q(stage, '.cq-close').onclick = () => {
      const ta = q(stage, '.cq-line'), t = ta.value.trim(), book = q(stage, '.cq-book');
      if (!t) { say(stage, 'write a line first.'); ta.focus(); return; }
      book.classList.add('shut'); k.after(calm() ? 0 : 900, () => book.classList.remove('shut'));
      const li = document.createElement('li'); li.innerHTML = '<small></small><p></p>';
      q(li, 'small').textContent = q(stage, '.cq-date').textContent; q(li, 'p').textContent = t;
      q(stage, '.cq-pages').prepend(li); ta.value = '';
      say(stage, 'tied shut. the page is pressed below.'); k.act('diary', 2, 'wrote a line in the ribboned diary');
    };
  } };

  /* ---- baddie: a get-ready-with-me card for a beauty editorial. looks, layout, caption, tags ---- */
  const BD_STEPS = [['base', 'base', ['dewy', 'matte', 'glazed']], ['eyes', 'eyes', ['winged liner', 'soft smoke', 'rhinestones']], ['lips', 'lips', ['clear gloss', 'liner + gloss', 'chrome']], ['nails', 'nails', ['chrome', 'french tip', 'pink jelly']], ['extra', 'finish', ['gold hoops', 'sunglasses', 'chrome star']]];
  const bdSlug = (v) => v.replace(/[^a-z]+/g, '-');
  P.baddie = { w: 600, html: (h) => `
    <div class="bd-room">
      <header class="bd-mast"><h3>GLOSS.CLUB</h3><small>the beauty editorial · get ready with me</small></header>
      <div class="bd-work">
        <article class="bd-card" data-lay="cover"><span class="bd-mag">GLOSS</span><h4 class="bd-hl">GET READY WITH ME</h4>
          <div class="bd-tiles">${BD_STEPS.map(([id, n, o]) => `<div class="bd-t bd-t-${id}" data-v="${bdSlug(o[0])}"><i></i><span>${n}: <b>${o[0]}</b></span></div>`).join('')}</div>
          <p class="bd-cap">your caption here</p><p class="bd-tags"></p></article>
        <div class="bd-ctrl">
          ${BD_STEPS.map(([id, n, o], s) => `<div class="bd-row"><span>${s + 1}. ${n}</span>${o.map((v, i) => `<button data-k="${id}" data-v="${v}" aria-pressed="${!i}">${v}</button>`).join('')}</div>`).join('')}
          <div class="bd-row"><span>layout</span>${['cover', 'split', 'grid'].map((l, i) => `<button data-lay="${l}" aria-pressed="${!i}">${l}</button>`).join('')}</div>
          <label class="bd-f">headline<input class="bd-hi" maxlength="28" value="GET READY WITH ME"></label>
          <label class="bd-f">caption<textarea class="bd-ci" maxlength="120" rows="2" placeholder="say it how you'd say it"></textarea></label>
          <label class="bd-f">tags<input class="bd-ti" maxlength="50" placeholder="#grwm #glam"></label>
          <button class="bd-post">POST</button>
        </div>
      </div>
      <section class="bd-grid" hidden><p class="bd-lbl">YOUR GRID</p><div class="bd-row-g"></div></section>
      ${live}${h.note('baddie is a confident, finished beauty look shaped by being seen online. here you only build the card; every product is generic, no brands.')}
    </div>`,
  run(stage, k) {
    const act = capped(k, 5), card = q(stage, '.bd-card');
    qa(stage, '.bd-row button[data-k]').forEach((b) => { b.onclick = () => {
      const id = b.dataset.k, v = b.dataset.v, t = q(card, '.bd-t-' + id);
      press(qa(stage, `.bd-row button[data-k="${id}"]`), b); t.dataset.v = bdSlug(v); q(t, 'b').textContent = v;
      t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop');
      act('look', 0.5, 'chose ' + v + ' for the ' + id);
    }; });
    const lays = qa(stage, '.bd-row button[data-lay]'); let layLogged = false;
    lays.forEach((b) => { b.onclick = () => { card.dataset.lay = b.dataset.lay; press(lays, b); if (!layLogged) { layLogged = true; k.act('layout', 0.5, 'set the card to a ' + b.dataset.lay + ' layout'); } }; });
    const sync = () => {
      q(card, '.bd-hl').textContent = q(stage, '.bd-hi').value.trim() || 'GET READY WITH ME';
      q(card, '.bd-cap').textContent = q(stage, '.bd-ci').value.trim() || 'your caption here';
      q(card, '.bd-tags').textContent = q(stage, '.bd-ti').value.trim().split(/[\s,]+/).filter(Boolean).map((t) => '#' + t.replace(/^#+/, '')).join(' ');
    };
    qa(stage, '.bd-f input, .bd-f textarea').forEach((i) => { i.oninput = sync; });
    q(stage, '.bd-post').onclick = () => {
      const cap = q(stage, '.bd-ci').value.trim();
      if (!cap) { say(stage, 'write a caption first.'); q(stage, '.bd-ci').focus(); return; }
      const grid = q(stage, '.bd-grid'), cell = document.createElement('div'); cell.className = 'bd-cell';
      cell.appendChild(card.cloneNode(true)); cell.insertAdjacentHTML('beforeend', '<span class="bd-likes">♥ <b>0</b></span>');
      grid.hidden = false; q(grid, '.bd-row-g').prepend(cell);
      const n = q(cell, '.bd-likes b'); let likes = 0, target = 40 + Math.floor(Math.random() * 400);
      const stop = k.every(250, () => { likes = Math.min(target, likes + 1 + Math.floor(Math.random() * 25)); n.textContent = likes; if (likes >= target) stop(); });
      say(stage, 'posted to your grid.'); if (!calm()) k.tone(1318, 0.15, 'square', 0.02);
      k.act('post', 2, 'posted a get-ready-with-me card: “' + cap.slice(0, 50) + '”');
    };
  } };
})();
