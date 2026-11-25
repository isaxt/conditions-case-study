/* B. glitch, cyberculture, remix, internet-native art
   0.7.1 worlds: each page is the practice at the centre of its scene (trace, navigate, release a demo,
   speed up, slow down, tune, chop, wander), not a palette + chips + glossary.
   Every sound here is synthesised in this file (no audio files), starts only from a click,
   stops when the window closes or the visitor presses stop, and stays quiet (gain <= 0.08). */
(function () {
  const P = window.SC_PAGES;
  const $ = (s, r) => r.querySelector(s), $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const RM = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const isOpen = (w) => w.classList.contains('open') && w.style.display !== 'none';
  const FW = (s) => s.replace(/[!-~]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)).replace(/ /g, '　');
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const ch = (st, ms, l, v, a) => ms.map((m) => [st, m, l, v, a]);
  const VOL = 0.06, TAU = Math.PI * 2;
  const pressed = (btns, on) => btns.forEach((b) => b.setAttribute('aria-pressed', b === on ? 'true' : 'false'));

  /* ---- a tiny offline synth: notes [step, midi, lengthInSteps, voice, vol] -> one looping AudioBuffer ---- */
  function render(ac, bpm, steps, notes) {
    const sr = ac.sampleRate, sp = 60 / bpm / 4, len = Math.round(steps * sp * sr);
    const buf = ac.createBuffer(1, len, sr), d = buf.getChannelData(0);
    notes.forEach(([st, m, l, v, a]) => {
      const s0 = Math.round(st * sp * sr), n = Math.min(Math.round(l * sp * sr), len - s0), f = mtof(m);
      a = a || 0.3;
      for (let i = 0; i < n; i++) {
        const t = i / sr, p = f * t, r = Math.min(1, i / 120, (n - i) / 240); let x;
        if (v === 'ep') x = (Math.sin(TAU * p) + 0.35 * Math.sin(TAU * 2 * p) * Math.exp(-t * 7)) * Math.exp(-t * 2.2);
        else if (v === 'sq') x = (Math.sin(TAU * p) > 0 ? 0.4 : -0.4) * Math.exp(-t * 3);
        else if (v === 'saw') x = ((p % 1) + ((p * 1.008) % 1) - 1) * 0.6 * Math.exp(-t * 2.5);
        else if (v === 'pad') x = (Math.sin(TAU * p) + 0.5 * Math.sin(TAU * p * 1.004) + 0.2 * Math.sin(TAU * p * 2)) * Math.min(1, t / 0.4, (n - i) / (sr * 0.4)) * 0.6;
        else if (v === 'bass') x = Math.sin(TAU * p) * Math.exp(-t * 2.5) + 0.15 * Math.sin(TAU * 2 * p) * Math.exp(-t * 6);
        else if (v === 'kick') x = Math.sin(TAU * (45 * t + 3.3 * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 9);
        else if (v === 'hat') x = (Math.random() * 2 - 1) * Math.exp(-t * 70) * 0.5;
        else if (v === 'vib') x = Math.sin(TAU * p + 0.5 * Math.sin(TAU * 5.5 * t)) * Math.min(1, t / 0.06) * Math.exp(-t * 0.9);
        else if (v === 'mallet') x = Math.sin(TAU * p) * Math.exp(-t * 3.5) + 0.2 * Math.sin(TAU * 4 * p) * Math.exp(-t * 14);
        else x = Math.sin(TAU * p) * Math.exp(-t * 3);
        d[s0 + i] += x * a * r;
      }
    });
    let pk = 0; for (let i = 0; i < len; i++) pk = Math.max(pk, Math.abs(d[i]));
    if (pk > 0) for (let i = 0; i < len; i++) d[i] *= 0.9 / pk;
    return buf;
  }
  const BUFS = {};
  const loop = (ac, key, spec) => BUFS[key] || (BUFS[key] = render(ac, spec.bpm, spec.steps, spec.notes));
  function noise(ac) { if (BUFS.noise) return BUFS.noise; const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (BUFS.noise = b); }
  function verb(ac, secs) {
    const c = ac.createConvolver(), sr = ac.sampleRate, n = Math.round(sr * secs), b = ac.createBuffer(2, n, sr);
    for (let k = 0; k < 2; k++) { const d = b.getChannelData(k); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
    c.buffer = b; return c;
  }
  // lowpass -> (dry + reverb) -> out; returns the knobs
  function space(ac, from, to, secs) {
    const lp = ac.createBiquadFilter(), dry = ac.createGain(), wet = ac.createGain(), cv = verb(ac, secs || 2.5);
    lp.type = 'lowpass'; lp.frequency.value = 12000; wet.gain.value = 0;
    from.connect(lp); lp.connect(dry).connect(to); lp.connect(cv).connect(wet).connect(to);
    return { lp, dry, wet };
  }
  const glide = (param, v, ac) => { if (param && ac) param.setTargetAtTime(v, ac.currentTime, 0.12); };

  /* one looping player per world; stops itself when the window closes or is minimised */
  function deck(k) {
    let live = [];
    const D = { on: false, src: null, ac: null };
    D.play = (buf, rate, wire) => {
      D.stop(true);
      const ac = k.audio(); if (!ac) return null;
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buf; src.loop = true; src.playbackRate.value = rate || 1;
      g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(VOL, ac.currentTime + 0.3);
      if (wire) wire(ac, src, g); else src.connect(g);
      g.connect(ac.destination); src.start();
      live = [src, g]; Object.assign(D, { on: true, src, ac, g });
      return src;
    };
    D.add = (node) => live.push(node);
    D.stop = (quiet) => {
      if (!live.length) return;
      const nodes = live, ac = D.ac; live = []; D.on = false; D.src = null;
      try { D.g.gain.setTargetAtTime(0, ac.currentTime, 0.03); } catch (e) { /* closed */ }
      setTimeout(() => nodes.forEach((n) => { try { if (n.stop) n.stop(); n.disconnect(); } catch (e) { /* already gone */ } }), 160);
      if (!quiet && D.onstop) D.onstop();
    };
    new MutationObserver(() => { if (D.on && !isOpen(k.win)) D.stop(); }).observe(k.win, { attributes: true, attributeFilter: ['class', 'style'] });
    return D;
  }
  // a one-shot slice of a buffer (chops, blips)
  function shot(k, buf, off, dur, rate) {
    const ac = k.audio(); if (!ac) return;
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = buf; s.playbackRate.value = rate || 1; g.gain.value = VOL;
    s.connect(g).connect(ac.destination); s.start(0, off, dur);
  }

  /* =============================== cyberpunk =============================== */
  const CP_HOPS = [
    ['your deck', 'a packet leaves this window', 14, 76], ['relay isp-04', 'logs kept 90 days', 52, 42],
    ['arcology cdn', 'cached on three continents', 92, 72], ['ad exchange', 'your session auctioned in 40 ms', 124, 26],
    ['data broker', 'profile merged with 2,481 others', 160, 70], ['CAM-03', 'the camera at the top of this board', 190, 30],
  ];
  const CP_DECOY = [[34, 16], [76, 14], [110, 52], [146, 86], [178, 40], [98, 88]];
  const CP_AMB = ['CAM-03 pans 4°', 'MAP refresh · 6 nodes', 'LOG rotated', 'CAM-03 focus: subject', 'heat map updated', 'packet loss 0.2%'];
  P.cyberpunk = { w: 600, html: (h) => {
    const nodes = CP_HOPS.map((n, i) => `<g class="cp-n" data-i="${i}"><circle cx="${n[2]}" cy="${n[3]}" r="4"/><text x="${n[2] + [-4, 6, -6, -6, 0, -2][i]}" y="${n[3] + [-8, -7, 13, -7, 14, -8][i]}" text-anchor="${['start', 'start', 'end', 'end', 'middle', 'end'][i]}">${n[0]}</text></g>`).join('');
    const lines = CP_HOPS.slice(1).map((n, i) => `<line data-i="${i + 1}" x1="${CP_HOPS[i][2]}" y1="${CP_HOPS[i][3]}" x2="${n[2]}" y2="${n[3]}"/>`).join('') +
      CP_DECOY.map(([x, y], i) => `<line class="cp-d" x1="${CP_HOPS[i][2]}" y1="${CP_HOPS[i][3]}" x2="${x}" y2="${y}"/><circle class="cp-d" cx="${x}" cy="${y}" r="2"/>`).join('');
    const towers = [[0, 40, 22], [24, 26, 16], [42, 52, 20], [64, 18, 26], [92, 34, 18], [112, 8, 22], [136, 44, 16], [154, 24, 24], [180, 36, 20]]
      .map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${90 - y}"/>`).join('');
    return `
    <div class="cp-rain" aria-hidden="true"></div>
    <header class="cp-head"><small>GRID-WATCH // SECTOR 9 · ${h.years}</small><h3 data-t="${h.title}">${h.title}</h3><p>every panel on this board is watching another one. trace the signal back, then name who is watching.</p></header>
    <div class="cp-grid">
      <section class="cp-p cp-cam"><h4>CAM-03 <i>watches → MAP</i></h4><div class="cp-feed"><svg viewBox="0 0 200 90" aria-hidden="true" preserveAspectRatio="xMidYMax slice"><g class="cp-twr">${towers}</g><text class="cp-neon" x="68" y="44">夜</text><text class="cp-neon cp-n2" x="140" y="62">OPEN 24H</text></svg><em>● REC</em><b class="cp-tag" hidden></b></div></section>
      <section class="cp-p cp-map"><h4>MAP <i>watches → LOG</i></h4><svg viewBox="0 0 200 96" role="img" aria-label="a network map: six hops from your deck to CAM-03">${lines}${nodes}<circle class="cp-pk" r="3.5" cx="14" cy="76"/></svg></section>
      <section class="cp-p cp-log"><h4>LOG <i>watches → YOU</i></h4><ol class="cp-lines" aria-live="polite"></ol></section>
      <section class="cp-p cp-you"><h4>YOU <i>watch → CAM-03</i></h4><dl><dt>subject</dt><dd class="cp-who">anon</dd><dt>dwell</dt><dd class="cp-dwell">00:00</dd><dt>clicks</dt><dd class="cp-clicks">0</dd><dt>keys</dt><dd class="cp-keys">0</dd></dl></section>
    </div>
    <div class="cp-ctl"><button type="button" class="cp-b cp-trace">▸ TRACE SIGNAL</button><button type="button" class="cp-b cp-jack" aria-pressed="false">JACK IN</button></div>
    <form class="cp-name" hidden><label for="cp-in">who is watching? name them</label><span><input id="cp-in" type="text" maxlength="32" autocomplete="off" placeholder="name_"><button class="cp-b">TAG IT</button></span></form>
    ${h.note('cyberpunk began as a strand of 1980s science fiction. its look (neon, rain, screens inside screens) later travelled into games, film and the early web, often as a warning about who owns the network.')}`;
  },
  run(stage, k) {
    const lines = $('.cp-lines', stage), tr = $('.cp-trace', stage), jk = $('.cp-jack', stage), form = $('.cp-name', stage), pk = $('.cp-pk', stage), tag = $('.cp-tag', stage);
    const dk = deck(k); let hop = -1, t = 0, clicks = 0, keys = 0, jackedOnce = false;
    $('.cp-who', stage).textContent = k.handle;
    const stamp = () => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
    const log = (s, hot) => { const li = document.createElement('li'); li.textContent = stamp() + '  ' + s; if (hot) li.className = 'hot'; lines.appendChild(li); while (lines.children.length > 6) lines.firstChild.remove(); };
    log('board online · 4 panels'); log('subject ' + k.handle + ' entered');
    k.every(1000, () => { t++; $('.cp-dwell', stage).textContent = stamp(); if (t % 7 === 0) log(CP_AMB[(t / 7) % CP_AMB.length]); });
    stage.addEventListener('click', (e) => { clicks++; $('.cp-clicks', stage).textContent = clicks; const p = e.target.closest('.cp-p'); if (p) log('subject clicked ' + p.querySelector('h4').firstChild.textContent.trim()); });
    stage.addEventListener('keydown', () => { keys++; $('.cp-keys', stage).textContent = keys; });
    tr.onclick = () => {
      if (hop >= CP_HOPS.length - 1) { hop = -1; $$('.cp-n, .cp-map line', stage).forEach((n) => n.classList.remove('on')); form.hidden = true; }
      hop++; const n = CP_HOPS[hop], l = $(`.cp-map line[data-i="${hop}"]`, stage);
      $(`.cp-n[data-i="${hop}"]`, stage).classList.add('on'); if (l) l.classList.add('on');
      pk.setAttribute('cx', n[2]); pk.setAttribute('cy', n[3]);
      log('hop ' + hop + ': ' + n[0] + ' · ' + n[1], hop === CP_HOPS.length - 1);
      k.tone(180 * Math.pow(1.26, hop), 0.12, 'square', 0.03);
      if (hop === CP_HOPS.length - 1) {
        tr.textContent = '↺ TRACE AGAIN'; form.hidden = false; $('.cp-cam', stage).classList.add('caught');
        log('the signal ends at the camera on this board. it was watching you watch it.', true);
        k.act('trace', 1, 'traced a signal ' + hop + ' hops back to CAM-03, a camera on the same board');
      } else tr.textContent = '▸ NEXT HOP (' + (hop + 1) + '/' + (CP_HOPS.length - 1) + ')';
    };
    form.onsubmit = (e) => {
      e.preventDefault(); const inp = $('input', form), v = inp.value.trim(); if (!v) return;
      tag.hidden = false; tag.textContent = 'WATCHED BY: ' + v; inp.value = '';
      log('subject named the watcher: ' + v, true); k.act('name', 2, 'named who is watching: “' + v + '”');
    };
    const setJack = (on) => { k.win.classList.toggle('cp-in', on); jk.setAttribute('aria-pressed', String(on)); jk.textContent = on ? 'JACK OUT' : 'JACK IN'; };
    dk.onstop = () => setJack(false);
    jk.onclick = () => {
      if (dk.on) { dk.stop(true); setJack(false); log('subject jacked out'); return; }
      const ac = k.audio(); setJack(true); log('subject jacked in · the board can see more of you now', true);
      if (ac) dk.play(loop(ac, 'cp', { bpm: 60, steps: 32, notes: [...ch(0, [33, 40, 45], 32, 'pad', 0.5), ...ch(0, [57, 60, 64], 16, 'pad', 0.14), ...ch(16, [55, 58, 62], 16, 'pad', 0.14)] }), 1,
        (a, src, g) => { const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; src.connect(lp).connect(g); });
      if (!jackedOnce) { jackedOnce = true; k.act('jack', 0.5, 'jacked in to the board'); }
    };
  } };

  /* =============================== net.art =============================== */
  const NA_LINKS = [['lost', 'a link that goes nowhere'], ['refuse', 'a page that refuses you'], ['many', 'a window that will not stay single'], ['eye', 'text that is a picture'], ['mirror', 'a page that only repeats you']];
  const NA_EYE = ['      lookinglookinglook\n   look            look\n look    ingloo      look\nlook   lookinglook    look\n look    ingloo      look\n   look            look\n      lookinglookinglook',
    '\n\n\nlookinglookinglookinglook\n\n\n'];
  const NA_MANY = ['hello?', 'are you still there', 'i am also a window', 'close me', 'please do not close me', 'there are more of us', 'this is the last one'];
  const NA_PAGES = {
    index: () => `<!-- you are reading the source. the source is also part of the work. -->
      <h1>between.htm</h1><p>a site about the machine that stands between two people. each link is a different relationship to it.</p>
      <ul class="na-ul">${NA_LINKS.map(([g, t]) => `<li><button type="button" class="na-a" data-go="${g}">${t}</button></li>`).join('')}</ul>`,
    lost: () => `<!-- the link worked perfectly. it was built to arrive here. -->
      <h2 class="na-404">Not Found</h2><p>The requested URL /between/you.htm was not found on this server.</p><hr><address>HTTP/1.0 server at between.htm port 80</address>
      <p class="na-late" hidden>the link was always going to break. the break is the piece. <button type="button" class="na-a" data-go="index">return</button></p>`,
    refuse: () => `<!-- the machine decides when. you only decide whether to wait. -->
      <h2>this page refuses to load.</h2><div class="na-bar"><i></i></div><p><button type="button" class="na-no">load anyway</button></p><p class="na-said" aria-live="polite"></p>`,
    many: () => `<!-- every window is the same window. -->
      <p>this window wants company.</p><p><button type="button" class="na-open">open another window</button></p><div class="na-pile"></div>`,
    eye: () => `<!-- the picture is made of a sentence. the sentence is made of a picture. -->
      <pre class="na-pre" aria-label="an eye drawn with the word looking">${NA_EYE[0]}</pre><p><button type="button" class="na-read" aria-pressed="false">read it as text</button></p>`,
    mirror: () => `<!-- nothing you type here is sent anywhere. the machine only hands it back. -->
      <p><label for="na-say">say something to the machine:</label></p><p class="na-row"><input id="na-say" type="text" maxlength="60" autocomplete="off"><button type="button" class="na-send">send</button></p><p class="na-echo" aria-live="polite"></p>`,
  };
  P.netart = { w: 560, html: (h) => `
    <div class="na-chrome"><button type="button" class="na-nav na-back" aria-label="back">◀</button><button type="button" class="na-nav" data-go="index" aria-label="home">⌂</button><span class="na-url">file:///between/index.htm</span><button type="button" class="na-nav na-src" aria-pressed="false">view source</button></div>
    <div class="na-vp" tabindex="-1"></div>
    <div class="na-trail"><p><b>your path:</b> <span class="na-path">index</span></p><p class="na-st" aria-live="polite">navigation is part of the work. where you click is what it becomes.</p><button type="button" class="na-sign">sign this path as a work</button><ol class="na-works"></ol></div>
    ${h.note('net.art (with the dot) named a mid-1990s group of artists who worked with browsers, links, errors and email as material. many of their works only made sense when you clicked through them, and some were made to break.')}`,
  run(stage, k) {
    const vp = $('.na-vp', stage), url = $('.na-url', stage), src = $('.na-src', stage), st = $('.na-st', stage);
    let cur = 'index', hist = [], trail = ['index'], seen = { index: 1 }, srcOn = false, srcOnce = false, stopLate = null;
    const label = (g) => (NA_LINKS.find((x) => x[0] === g) || [g, 'the index'])[1];
    const show = () => {
      url.textContent = (srcOn ? 'view-source:' : '') + 'file:///between/' + cur + '.htm';
      if (srcOn) { vp.innerHTML = '<pre class="na-code"></pre>'; $('.na-code', vp).textContent = NA_PAGES[cur]().replace(/\n\s+/g, '\n'); }
      else vp.innerHTML = NA_PAGES[cur]();
      $('.na-path', stage).textContent = trail.join(' › ');
      if (stopLate) stopLate();
      if (cur === 'lost' && !srcOn) stopLate = k.after(2200, () => { const p = $('.na-late', vp); if (p) p.hidden = false; });
    };
    const go = (g, back) => {
      if (!NA_PAGES[g]) return;
      if (!back) hist.push(cur);
      cur = g; srcOn = false; src.setAttribute('aria-pressed', 'false'); trail.push(g); if (trail.length > 12) trail.shift(); show(); vp.focus();
      st.textContent = 'now at ' + g + '.htm';
      if (!seen[g]) { seen[g] = 1; k.act('follow', 0.5, 'followed “' + label(g) + '”'); }
    };
    stage.addEventListener('click', (e) => {
      const a = e.target.closest('[data-go]'); if (a) { go(a.dataset.go); return; }
      if (e.target.closest('.na-back')) { if (hist.length) go(hist.pop(), true); return; }
      if (e.target.closest('.na-no')) {
        const b = e.target.closest('.na-no'), n = (+b.dataset.n || 0) + 1, said = ['no.', 'still no.', 'you could ask more nicely.', 'fine. here it is: nothing. you waited for it, and that is the relationship.'];
        b.dataset.n = n; b.style.marginLeft = (n < 4 ? 20 + Math.random() * 40 * n : 0) + 'px'; $('.na-said', vp).textContent = said[Math.min(n, 4) - 1]; if (n >= 4) b.disabled = true; return;
      }
      if (e.target.closest('.na-open')) {
        const pile = $('.na-pile', vp), n = pile.children.length; if (n >= NA_MANY.length) return;
        const w = document.createElement('div'); w.className = 'na-mini'; w.style.left = (8 + (n * 37) % 60) + '%'; w.style.top = (n * 18) + 'px';
        w.innerHTML = '<div><span>untitled</span><button type="button" class="na-x" aria-label="close this window">×</button></div><p>' + NA_MANY[n] + '</p>'; pile.appendChild(w); return;
      }
      if (e.target.closest('.na-x')) { e.target.closest('.na-mini').remove(); return; }
      if (e.target.closest('.na-read')) { const b = e.target.closest('.na-read'), on = b.getAttribute('aria-pressed') !== 'true', pre = $('.na-pre', vp); b.setAttribute('aria-pressed', String(on)); pre.classList.toggle('flat', on); b.textContent = on ? 'see it as a picture' : 'read it as text'; return; }
      if (e.target.closest('.na-send')) {
        const inp = $('#na-say', vp), v = inp.value.trim(); if (!v) return;
        $('.na-echo', vp).textContent = v + ' / ' + v.split('').reverse().join('') + ' / ' + v.toUpperCase();
        url.textContent = 'file:///between/mirror.htm?you=' + encodeURIComponent(v).slice(0, 40); inp.value = '';
      }
    });
    stage.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'na-say') $('.na-send', vp).click(); });
    src.onclick = () => {
      srcOn = !srcOn; src.setAttribute('aria-pressed', String(srcOn)); show();
      if (srcOn && !srcOnce) { srcOnce = true; k.act('source', 1, 'opened the source of ' + cur + '.htm and found a note left in it'); }
    };
    $('.na-sign', stage).onclick = () => {
      if (trail.length < 3) { st.textContent = 'a path needs at least three pages before it is a work.'; return; }
      const li = document.createElement('li'); li.textContent = '“' + trail.join(' › ') + '” · a path by ' + k.handle; $('.na-works', stage).prepend(li);
      st.textContent = 'signed. the same pages in another order would be another work.';
      k.act('sign', 2, 'signed a path of ' + trail.length + ' pages as a work: ' + trail.join(' › ')); trail = [cur]; $('.na-path', stage).textContent = cur;
    };
    k.every(2600, () => { const pre = $('.na-pre:not(.flat)', vp); if (pre && !RM()) { pre.textContent = NA_EYE[1]; k.after(180, () => { if (pre.isConnected) pre.textContent = NA_EYE[0]; }); } });
    show();
  } };

  /* =============================== demoscene =============================== */
  const DS = [
    { id: 'plasma', name: 'plasma.4k', grp: 'lowfat', size: '4 KB intro', hw: '486DX2-66 · VGA 320×200 · 256 colours', note: 'three sine waves added per pixel. the colours move, the pixels do not: only the palette is rotated.', p: ['frequency', 4, 24, 10], code: 'c=sin(x/f)+sin(y/f)+sin((x+y+t)/f)' },
    { id: 'stars', name: 'warp.256b', grp: 'tiny ops', size: '256 bytes', hw: 'any PC · real mode · no libraries', note: 'every star is x, y, z. divide x and y by z and that is the whole trick.', p: ['warp speed', 1, 20, 6], code: 'z-=v;sx=x/z*w;sy=y/z*w' },
    { id: 'scroll', name: 'greetings.prg', grp: 'copperline', size: '64 KB demo part', hw: 'Amiga 500 · 7 MHz · 512 KB', note: 'a sine-wave scroller over copper bars. the text greets other groups, which is how the scene said hello.', p: ['wave height', 0, 30, 14], code: 'y=h*sin(x/20+t)' },
  ];
  const DS_COMPO = [['lowfat', 'plasma.4k', 211], ['quartz', 'tunnel vision', 188], ['tiny ops', 'warp.256b', 164], ['nullsect', 'rotozoom 2', 97]];
  P.demoscene = { w: 580, html: (h) => `
    <div class="ds-bars" aria-hidden="true"><i></i><i></i><i></i></div>
    <header class="ds-top"><h3>demo.exe</h3><p>party release list · ${h.years} · real-time, no video, only math</p></header>
    <div class="ds-scr"><canvas width="160" height="100" aria-label="a running demo effect"></canvas><span class="ds-osd"></span></div>
    <div class="ds-list" role="group" aria-label="productions">${DS.map((d, i) => `<button type="button" class="ds-prod" data-i="${i}" aria-pressed="${i ? 'false' : 'true'}"><b>${d.name}</b><em>${d.size}</em></button>`).join('')}</div>
    <dl class="ds-info"><dt>by</dt><dd class="ds-grp"></dd><dt>runs on</dt><dd class="ds-hw"></dd><dt>notes</dt><dd class="ds-nt"></dd><dt>core</dt><dd><code class="ds-code"></code> <small class="ds-bytes"></small></dd></dl>
    <div class="ds-tw"><label for="ds-p" class="ds-pl"></label><input id="ds-p" type="range"><output class="ds-pv"></output><button type="button" class="ds-b ds-mus" aria-pressed="false">♪ music</button></div>
    <form class="ds-rel"><label for="ds-g">your group</label><input id="ds-g" type="text" maxlength="16" autocomplete="off"><button class="ds-b">release at the party ▸</button></form>
    <ol class="ds-res" aria-live="polite"></ol>
    ${h.note('groups and productions here are invented. the scene itself is real: people met at parties to show demos in competitions, judged by the crowd, and greeted each other inside the work.')}`,
  run(stage, k) {
    const cv = $('canvas', stage), g = cv.getContext('2d'), W = 160, H = 100, img = g.createImageData(W, H), rng = $('#ds-p', stage), dk = deck(k), mus = $('.ds-mus', stage);
    let cur = 0, t = 0, raf = 0, val = DS.map((d) => d.p[3]), seen = {}, greet = 'GREETINGS TO EVERY GROUP AT THE PARTY ... ';
    const pal = []; for (let i = 0; i < 256; i++) { const a = i / 256 * TAU; pal.push([128 + 127 * Math.sin(a), 90 + 90 * Math.sin(a + 2.1), 160 + 95 * Math.sin(a + 4.2)].map(Math.round)); }
    const stars = Array.from({ length: 160 }, () => [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()]);
    const draw = () => {
      const v = val[cur];
      if (cur === 0) {
        const d = img.data; let o = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++, o += 4) {
          const c = Math.sin(x / v) + Math.sin(y / v) + Math.sin((x + y + t * 30) / v) + Math.sin(Math.hypot(x - 80, y - 50) / v);
          const p = pal[((c + 4) * 32 + t * 60) & 255]; d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2]; d[o + 3] = 255;
        }
        g.putImageData(img, 0, 0);
      } else if (cur === 1) {
        g.fillStyle = '#080A12'; g.fillRect(0, 0, W, H);
        stars.forEach((s) => { s[2] -= v * 0.0016; if (s[2] <= 0.02) { s[0] = Math.random() * 2 - 1; s[1] = Math.random() * 2 - 1; s[2] = 1; }
          const x = 80 + s[0] / s[2] * 40, y = 50 + s[1] / s[2] * 40, b = Math.round(255 * (1 - s[2])); g.fillStyle = `rgb(${b},${b},${Math.min(255, b + 40)})`; g.fillRect(x | 0, y | 0, s[2] < 0.3 ? 2 : 1, 1); });
      } else {
        g.fillStyle = '#080A12'; g.fillRect(0, 0, W, H);
        ['#7B61FF', '#FF3CAC', '#00F5D4'].forEach((c, i) => { const y = 50 + 34 * Math.sin(t * 1.4 + i * 2.1), gr = g.createLinearGradient(0, y - 6, 0, y + 6); gr.addColorStop(0, 'transparent'); gr.addColorStop(0.5, c); gr.addColorStop(1, 'transparent'); g.fillStyle = gr; g.fillRect(0, y - 6, W, 12); });
        g.font = '10px monospace'; g.fillStyle = '#FFEA00'; const off = (t * 40) % (greet.length * 7);
        for (let i = 0; i < 26; i++) { const n = Math.floor(off / 7) + i, x = i * 7 - (off % 7); g.fillText(greet[n % greet.length], x, 54 + v * Math.sin(x / 20 + t * 3)); }
      }
    };
    const tick = () => { raf = 0; if (!isOpen(k.win)) return; t += 1 / 60; draw(); raf = requestAnimationFrame(tick); };
    const start = () => { if (RM()) { t = 1.3; draw(); return; } if (!raf) raf = requestAnimationFrame(tick); };
    k.every(800, () => { if (!raf) start(); });
    const pick = (i) => {
      const d = DS[cur = i]; pressed($$('.ds-prod', stage), $$('.ds-prod', stage)[i]);
      $('.ds-grp', stage).textContent = d.grp + ' · ' + d.size; $('.ds-hw', stage).textContent = d.hw; $('.ds-nt', stage).textContent = d.note;
      $('.ds-code', stage).textContent = d.code; $('.ds-bytes', stage).textContent = '(' + d.code.length + ' bytes)';
      $('.ds-pl', stage).textContent = d.p[0]; Object.assign(rng, { min: d.p[1], max: d.p[2], value: val[i] }); $('.ds-pv', stage).textContent = val[i];
      $('.ds-osd', stage).textContent = d.name.toUpperCase() + ' · ' + d.size.toUpperCase(); if (RM()) start();
    };
    $$('.ds-prod', stage).forEach((b) => { b.onclick = () => { const i = +b.dataset.i; pick(i); if (!seen[i]) { seen[i] = 1; k.act('watch', 0.5, 'watched ' + DS[i].name + ' (' + DS[i].size + ' on ' + DS[i].hw.split(' · ')[0] + ')'); } }; });
    rng.oninput = () => { val[cur] = +rng.value; $('.ds-pv', stage).textContent = rng.value; if (RM()) draw(); };
    rng.onchange = () => k.act('tweak', 1, 'set the ' + DS[cur].p[0] + ' of ' + DS[cur].name + ' to ' + rng.value);
    $('#ds-g', stage).value = k.handle;
    mus.onclick = () => {
      if (dk.on) { dk.stop(); return; }
      const ac = k.audio(); if (!ac) return; const n = [], A = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]];
      A.forEach((c, b) => { for (let s = 0; s < 16; s++) n.push([b * 16 + s, c[s % 3] + 12, 1, 'sq', 0.25]); n.push([b * 16, c[0] - 12, 6, 'sq', 0.4], [b * 16 + 8, c[0] - 12, 6, 'sq', 0.4]); });
      dk.play(loop(ac, 'ds', { bpm: 125, steps: 64, notes: n }), 1); mus.setAttribute('aria-pressed', 'true'); mus.textContent = '■ music';
    };
    dk.onstop = () => { mus.setAttribute('aria-pressed', 'false'); mus.textContent = '♪ music'; };
    $('.ds-rel', stage).onsubmit = (e) => {
      e.preventDefault(); const grp = ($('#ds-g', stage).value.trim() || k.handle).slice(0, 16), d = DS[cur], name = d.name.replace(/\..*/, '') + '_' + val[cur];
      const pts = 90 + Math.round(Math.random() * 140), all = DS_COMPO.concat([[grp, name, pts]]).sort((a, b) => b[2] - a[2]), place = all.findIndex((x) => x[1] === name) + 1;
      $('.ds-res', stage).innerHTML = all.map((x) => `<li class="${x[1] === name ? 'me' : ''}"><b>${k.esc(x[1])}</b> by ${k.esc(x[0])}<em>${x[2]} pts</em></li>`).join('');
      greet = 'HELLO ' + grp.toUpperCase() + '! ' + greet; k.tone(523, 0.1, 'square', 0.03); k.after(110, () => k.tone(784, 0.18, 'square', 0.03));
      k.act('release', 2, 'released “' + name + '” as ' + grp + ' at the party (placed ' + place + ' of ' + all.length + ')');
    };
    pick(0);
  } };

  /* =============================== nightcore =============================== */
  const NC = [
    { t: 'night bus', mood: 'euphoric', bpm: 132, ch: [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]] },
    { t: 'paper lanterns', mood: 'heartbreak', bpm: 128, ch: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [52, 55, 60]] },
    { t: 'glass highway', mood: 'night', bpm: 136, ch: [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]] },
  ];
  const NC_LEAD = [0, 1, 2, 3, 2, 1, 3, 4, 2, 3, 4, 3, 1, 2, 0, null];
  const NC_RATES = [1, 1.15, 1.25, 1.35, 1.5];
  const NC_COV = [['#FF3EB5', '#6B5BFF'], ['#6B5BFF', '#29E7FF'], ['#E8E8F0', '#FF3EB5'], ['#29E7FF', '#17132B']];
  const ncFace = (i) => { const [hair, eye] = NC_COV[i]; return `<svg viewBox="0 0 160 90" aria-hidden="true"><path d="M50 92 Q52 50 80 46 Q108 50 110 92Z" fill="${hair}"/><ellipse cx="80" cy="47" rx="20" ry="22" fill="#FFE6DA"/><path d="M58 46 Q58 18 80 19 Q102 18 102 46 L97 33 L90 41 L84 29 L76 40 L70 30 L63 42Z" fill="${hair}"/><ellipse cx="72" cy="51" rx="4" ry="6" fill="${eye}"/><ellipse cx="88" cy="51" rx="4" ry="6" fill="${eye}"/><circle cx="71" cy="49" r="1.7" fill="#fff"/><circle cx="87" cy="49" r="1.7" fill="#fff"/><path d="M77 61 Q80 63 83 61" stroke="#c66" fill="none"/><path d="M56 48 Q56 12 80 12 Q104 12 104 48" stroke="#17132B" stroke-width="3" fill="none"/><rect x="51" y="42" width="9" height="14" rx="4" fill="${eye}"/><rect x="100" y="42" width="9" height="14" rx="4" fill="${eye}"/><text x="24" y="26" fill="#fff">✦</text><text x="128" y="70" fill="#fff">✦</text></svg>`; };
  const NC_SEED = [['paper lanterns', 1.3, 'sakura_edits_08', 48210], ['glass highway', 1.2, 'xXmidnightXx', 9122], ['night bus', 1.35, 'tempo_kid', 120554]];
  P.nightcore = { w: 560, html: (h) => `
    <header class="nc-head"><h3>nightdrive<span>.mp3</span></h3><small>fan edits archive · ${h.years} · faster, higher, same song</small></header>
    <div class="nc-step"><span>1</span><b>pick the original</b></div>
    <div class="nc-row" role="group" aria-label="originals">${NC.map((x, i) => `<button type="button" class="nc-pill nc-src" data-i="${i}" aria-pressed="${i ? 'false' : 'true'}">${x.t}<em>${x.bpm} bpm</em></button>`).join('')}</div>
    <div class="nc-step"><span>2</span><b>speed it up</b></div>
    <div class="nc-deck"><button type="button" class="nc-play" aria-label="play">▶</button><div class="nc-wave" aria-hidden="true">${'<i></i>'.repeat(24)}</div><p class="nc-read" aria-live="polite"></p></div>
    <div class="nc-row" role="group" aria-label="speed">${NC_RATES.map((r, i) => `<button type="button" class="nc-pill nc-rate" data-r="${r}" aria-pressed="${i ? 'false' : 'true'}">×${r.toFixed(2)}</button>`).join('')}</div>
    <div class="nc-step"><span>3</span><b>pick a cover</b></div>
    <div class="nc-row nc-covers" role="group" aria-label="covers">${NC_COV.map((c, i) => `<button type="button" class="nc-cov nc-c${i}" data-i="${i}" aria-pressed="${i ? 'false' : 'true'}" aria-label="cover ${i + 1}">${ncFace(i)}</button>`).join('')}</div>
    <div class="nc-thumb nc-c0"><div class="nc-art">${ncFace(0)}</div><p><b>Nightcore</b> - <span class="nc-tt">night bus</span></p><em class="nc-dur">×1.00</em></div>
    <button type="button" class="nc-up">⇪ upload edit</button>
    <div class="nc-arch"><div class="nc-ah"><b>the archive</b><span role="group" aria-label="sort"><button type="button" class="nc-sort" data-s="tempo" aria-pressed="true">by tempo</button><button type="button" class="nc-sort" data-s="mood" aria-pressed="false">by mood</button></span></div><ol class="nc-list"></ol></div>
    ${h.note('nightcore began in the early 2000s as sped-up trance and eurodance. on video sites it settled into a format: the whole track played faster so pitch and tempo rise together, an anime-style picture, and a title that starts “Nightcore -”. the uploaders and tracks here are invented.')}`,
  run(stage, k) {
    const dk = deck(k), play = $('.nc-play', stage), list = $('.nc-list', stage);
    let src = 0, rate = 1, cov = 0, sort = 'tempo', sped = {};
    const edits = NC_SEED.map(([t, r, u, v]) => ({ t, r, u, v, mood: NC.find((x) => x.t === t).mood, bpm: NC.find((x) => x.t === t).bpm, cov: [1, 3, 0][NC_SEED.findIndex((q) => q[2] === u)] }));
    const buf = (i) => { const ac = k.audio(); if (!ac) return null; const x = NC[i], n = [];
      x.ch.forEach((c, b) => { const o = b * 16, tones = [c[0], c[1], c[2], c[0] + 12, c[1] + 12];
        for (let s = 0; s < 16; s += 4) n.push([o + s, 0, 4, 'kick', 0.9], [o + s + 2, 0, 1, 'hat', 0.25], [o + s + 2, c[0] - 12, 2, 'bass', 0.45]);
        NC_LEAD.forEach((ix, s) => { if (ix != null) n.push([o + s, tones[ix] + 12, 2, 'saw', 0.2]); }); });
      return loop(ac, 'nc' + i, { bpm: x.bpm, steps: 64, notes: n }); };
    const read = () => { const x = NC[src], st = 12 * Math.log2(rate); $('.nc-read', stage).textContent = x.bpm + ' → ' + Math.round(x.bpm * rate) + ' bpm · ' + (st ? '+' + st.toFixed(1) : '0') + ' semitones' + (rate > 1 ? ' · pitch and tempo rise together' : ' · the original');
      $('.nc-tt', stage).textContent = x.t; $('.nc-dur', stage).textContent = '×' + rate.toFixed(2); k.win.style.setProperty('--nc-sp', (0.9 / rate).toFixed(2) + 's'); };
    const draw = () => {
      const rows = edits.slice().sort((a, b) => sort === 'tempo' ? b.bpm * b.r - a.bpm * a.r : a.mood.localeCompare(b.mood) || b.bpm * b.r - a.bpm * a.r);
      list.innerHTML = rows.map((e) => `<li class="${e.mine ? 'mine' : ''}"><span class="nc-mini nc-c${e.cov}">${ncFace(e.cov)}</span><p><b>Nightcore - ${k.esc(e.t)}</b><small>×${e.r.toFixed(2)} · ${Math.round(e.bpm * e.r)} bpm · ${e.mood} · by ${k.esc(e.u)}</small></p><em>${e.v.toLocaleString('en-US')} views</em></li>`).join('');
    };
    const setPlay = (on) => { play.textContent = on ? '■' : '▶'; play.setAttribute('aria-label', on ? 'stop' : 'play'); k.win.classList.toggle('nc-on', on); };
    dk.onstop = () => setPlay(false);
    play.onclick = () => { if (dk.on) { dk.stop(); return; } const b = buf(src); if (b) { dk.play(b, rate); setPlay(true); } };
    $$('.nc-src', stage).forEach((b) => { b.onclick = () => { src = +b.dataset.i; pressed($$('.nc-src', stage), b); read(); if (dk.on) { dk.play(buf(src), rate); setPlay(true); } }; });
    $$('.nc-rate', stage).forEach((b) => { b.onclick = () => {
      rate = +b.dataset.r; pressed($$('.nc-rate', stage), b); read(); if (dk.on) glide(dk.src.playbackRate, rate, dk.ac);
      const key = src + ':' + rate; if (rate > 1 && !sped[key]) { sped[key] = 1; k.act('speed', 0.5, 'sped “' + NC[src].t + '” up to ×' + rate.toFixed(2)); }
    }; });
    $$('.nc-cov', stage).forEach((b) => { b.onclick = () => { cov = +b.dataset.i; pressed($$('.nc-cov', stage), b); const th = $('.nc-thumb', stage); th.className = 'nc-thumb nc-c' + cov; $('.nc-art', th).innerHTML = ncFace(cov); }; });
    $$('.nc-sort', stage).forEach((b) => { b.onclick = () => { sort = b.dataset.s; pressed($$('.nc-sort', stage), b); draw(); }; });
    $('.nc-up', stage).onclick = () => {
      if (rate === 1) { $('.nc-read', stage).textContent = 'it is not an edit yet: speed it up first.'; return; }
      edits.push({ t: NC[src].t, r: rate, u: k.handle, v: 0, mood: NC[src].mood, bpm: NC[src].bpm, cov, mine: true }); draw();
      $('.nc-read', stage).textContent = 'uploaded. strangers are finding it.';
      k.act('upload', 2, 'uploaded “Nightcore - ' + NC[src].t + '” at ×' + rate.toFixed(2) + ' with cover ' + (cov + 1));
    };
    k.every(1500, () => { let ch = false; edits.forEach((e) => { if (e.mine && e.v < 5000) { e.v += 1 + Math.floor(Math.random() * 9); ch = true; } }); if (ch) draw(); });
    read(); draw();
  } };

  /* =============================== vaporwave =============================== */
  const VW_LAYERS = [['sun', 'sunset'], ['grid', 'grid'], ['win', 'old window'], ['palm', 'palm 🌴'], ['bust', 'bust 🗿']];
  const VW_SEED = [['ｃｏｒｐｏｒａｔｅ　ｌｏｂｂｙ', 64, 'p1ana_tapes'], ['ｆｏｏｄ　ｃｏｕｒｔ　ｆｏｒｅｖｅｒ', 80, 'dream_kiosk']];
  P.vaporwave = { w: 560, html: (h) => `
    <h3 class="vw-ttl">ｖａｐｏｒｗａｖｅ</h3><p class="vw-sub">take something smooth that was made to sell, and slow it down until it sounds like a memory</p>
    <div class="vw-box"><div class="vw-tb"><span>▣ SOURCE.WAV</span><em>_ □ ×</em></div><div class="vw-bd">
      <p class="vw-src"><b>corporate_training_tape_side_b.wav</b><small>smooth jazz loop · 96 bpm · invented for this page</small></p>
      <div class="vw-ctl"><button type="button" class="vw-b vw-play">▶ play</button><button type="button" class="vw-b vw-chop" aria-pressed="false">loop one bar</button></div>
      <label class="vw-sl">speed <input type="range" class="vw-spd" min="50" max="100" value="100"><output class="vw-sv">100%</output></label>
      <label class="vw-sl">reverb <input type="range" class="vw-rev" min="0" max="100" value="0"><output class="vw-rv">0</output></label>
    </div></div>
    <div class="vw-two">
      <div class="vw-box"><div class="vw-tb"><span>▣ COVER.BMP</span><em>×</em></div><div class="vw-bd"><div class="vw-cover" aria-hidden="true"><i class="vw-l-sun"></i><i class="vw-l-grid"></i><i class="vw-l-win"><b>▣ welcome</b></i><i class="vw-l-palm">🌴</i><i class="vw-l-bust">🗿</i><p class="vw-cname"></p></div>
        <div class="vw-lay" role="group" aria-label="cover layers">${VW_LAYERS.map(([id, t]) => `<button type="button" class="vw-chip" data-l="${id}" aria-pressed="false">${t}</button>`).join('')}</div></div></div>
      <div class="vw-box"><div class="vw-tb"><span>▣ NAME.TXT</span><em>×</em></div><div class="vw-bd"><label for="vw-n">title</label><input id="vw-n" type="text" maxlength="24" value="memory plaza" autocomplete="off"><p class="vw-fw" aria-live="polite"></p><button type="button" class="vw-b vw-rel">⏏ release on tape</button></div></div>
    </div>
    <ol class="vw-list"></ol>
    ${h.note('vaporwave grew on music blogs and download sites around 2010–2012: producers slowed and looped smooth jazz, muzak and advertising sound, and gave it fullwidth titles and found corporate imagery. the releases and tapes here are invented.')}`,
  run(stage, k) {
    const dk = deck(k), play = $('.vw-play', stage), spd = $('.vw-spd', stage), rev = $('.vw-rev', stage), chop = $('.vw-chop', stage), nm = $('#vw-n', stage), cover = $('.vw-cover', stage);
    let fx = null, layers = new Set(), named = false;
    const rel = VW_SEED.map(([t, s, u]) => ({ t, s, u, cv: 'bust, palm, grid' }));
    const draw = () => { $('.vw-list', stage).innerHTML = rel.map((r) => `<li class="${r.mine ? 'mine' : ''}"><i aria-hidden="true">▭</i><b>${k.esc(r.t)}</b><small>${r.s}% speed · cover: ${k.esc(r.cv || 'blank')} · by ${k.esc(r.u)} · name your price</small></li>`).join(''); };
    const title = () => FW(nm.value.trim() || 'untitled');
    const name = () => { $('.vw-fw', stage).textContent = title(); $('.vw-cname', stage).textContent = title(); };
    const knobs = () => { $('.vw-sv', stage).textContent = spd.value + '%'; $('.vw-rv', stage).textContent = rev.value;
      if (!dk.on || !fx) return; glide(dk.src.playbackRate, spd.value / 100, dk.ac); glide(fx.wet.gain, rev.value / 70, dk.ac); glide(fx.dry.gain, 1 - rev.value / 160, dk.ac); glide(fx.lp.frequency, 2000 + spd.value * 90, dk.ac); };
    const setChop = () => { if (!dk.src) return; const b = dk.src.buffer, on = chop.getAttribute('aria-pressed') === 'true'; dk.src.loopStart = on ? b.duration / 4 : 0; dk.src.loopEnd = on ? b.duration / 4 + b.duration / 8 : b.duration; };
    dk.onstop = () => { play.textContent = '▶ play'; };
    play.onclick = () => {
      if (dk.on) { dk.stop(); return; }
      const ac = k.audio(); if (!ac) return; const n = [], C = [[50, 54, 57, 61], [47, 50, 54, 57], [52, 55, 59, 62], [45, 49, 52, 55]], L = [[0, 69, 6], [6, 71, 2], [8, 73, 8], [16, 74, 4], [20, 73, 4], [24, 71, 8], [32, 69, 6], [38, 66, 2], [40, 64, 8], [48, 61, 4], [52, 64, 4], [56, 69, 8]];
      C.forEach((c, b) => { n.push(...ch(b * 16, c, 10, 'ep', 0.25), ...ch(b * 16 + 10, c, 6, 'ep', 0.15), [b * 16, c[0] - 12, 6, 'bass', 0.5], [b * 16 + 10, c[0] - 5, 6, 'bass', 0.4]); });
      L.forEach(([s, m, l]) => n.push([s, m, l, 'vib', 0.2]));
      dk.play(loop(ac, 'vw', { bpm: 96, steps: 64, notes: n }), spd.value / 100, (a, src, g) => { fx = space(a, src, g, 3.2); const dl = a.createDelay(1), fb = a.createGain(); dl.delayTime.value = 0.42; fb.gain.value = 0.3; fx.lp.connect(dl); dl.connect(fb).connect(dl); dl.connect(fx.wet); });
      play.textContent = '■ stop'; knobs(); setChop();
    };
    spd.oninput = knobs; rev.oninput = knobs;
    spd.onchange = () => { if (spd.value < 100) k.act('slow', 1, 'slowed the source tape to ' + spd.value + '% (reverb ' + rev.value + ')'); };
    chop.onclick = () => { chop.setAttribute('aria-pressed', String(chop.getAttribute('aria-pressed') !== 'true')); setChop(); };
    nm.oninput = name;
    nm.onchange = () => { if (!named) { named = true; k.act('rename', 0.5, 'renamed the loop “' + title() + '”'); } };
    $$('.vw-chip', stage).forEach((b) => { b.onclick = () => { const l = b.dataset.l, on = !layers.has(l); on ? layers.add(l) : layers.delete(l); b.setAttribute('aria-pressed', String(on)); cover.classList.toggle('has-' + l, on); }; });
    $('.vw-rel', stage).onclick = () => {
      const cv = VW_LAYERS.filter(([id]) => layers.has(id)).map(([id]) => id).join(', ');
      rel.unshift({ t: title(), s: +spd.value, u: k.handle, cv, mine: true }); draw();
      k.act('release', 2, 'released “' + title() + '” on tape at ' + spd.value + '% speed' + (cv ? ', cover: ' + cv : ''));
    };
    name(); draw();
  } };

  /* =============================== seapunk =============================== */
  const SP = [
    { f: 89.3, n: 'shell static', dj: 'aquaflora', s: [62, 66, 69, 73], bpm: 104 },
    { f: 93.7, n: 'dolphin dial-up', dj: 'hydr0_kid', s: [60, 64, 67, 71], bpm: 116 },
    { f: 99.1, n: 'lagoon.gif', dj: 'mermaidmodem', s: [57, 60, 64, 67], bpm: 96 },
    { f: 104.5, n: 'trident hours', dj: 'neptune_exe', s: [64, 67, 71, 74], bpm: 122 },
  ];
  P.seapunk = { w: 560, html: (h) => `
    <div class="sp-sea" aria-hidden="true"><i class="sp-rays"></i><i class="sp-dark"></i><i class="sp-glow"></i><span class="sp-dol">🐬</span><b class="sp-tri"></b><u class="sp-bub sp-b1"></u><u class="sp-bub sp-b2"></u><u class="sp-bub sp-b3"></u><p class="sp-m">-0 m</p></div>
    <header class="sp-head"><h3>abyss.fm</h3><p>underwater radio · ${h.years} · tune in, then sink</p></header>
    <div class="sp-glass">
      <div class="sp-face"><button type="button" class="sp-pow" aria-pressed="false">⏻ power</button><p class="sp-now" aria-live="polite">static between stations</p></div>
      <label class="sp-lbl" for="sp-f">frequency <output class="sp-fv">96.0</output> FM</label>
      <input id="sp-f" class="sp-rng" type="range" min="880" max="1080" value="960">
      <div class="sp-ticks" aria-hidden="true">${SP.map((s) => `<i style="left:${((s.f * 10 - 880) / 2).toFixed(1)}%">${s.f}</i>`).join('')}</div>
      <label class="sp-lbl" for="sp-d">depth <output class="sp-dv">0</output> m</label>
      <input id="sp-d" class="sp-rng" type="range" min="0" max="200" value="0">
    </div>
    <div class="sp-glass"><div class="sp-dh"><b>your dash</b><button type="button" class="sp-rb">⟲ reblog this</button></div><div class="sp-dash"><p class="sp-empty">nothing reblogged yet</p></div></div>
    ${h.note('seapunk started around 2011 as a half-joke tag on social media, then became a look (turquoise, dolphins, early 3D water) and a small music scene, before fashion took it up. the stations and djs here are invented.')}`,
  run(stage, k) {
    const dk = deck(k), fr = $('#sp-f', stage), dp = $('#sp-d', stage), pow = $('.sp-pow', stage), now = $('.sp-now', stage), sea = $('.sp-sea', stage);
    let nodes = null, at = -1, tuned = {}, deep = {}, dash = [];
    const near = () => { const f = fr.value / 10; let bi = 0; SP.forEach((s, i) => { if (Math.abs(s.f - f) < Math.abs(SP[bi].f - f)) bi = i; }); return [bi, Math.max(0, 1 - Math.abs(SP[bi].f - f) / 1.2)]; };
    const buf = (i) => { const ac = k.audio(), s = SP[i], n = []; for (let x = 0; x < 32; x++) n.push([x, s.s[(x * 3) % 4] + (x % 8 < 4 ? 12 : 0), 2, x % 2 ? 'sine' : 'mallet', 0.22]);
      n.push([0, s.s[0] - 24, 14, 'bass', 0.5], [16, s.s[1] - 24, 14, 'bass', 0.5], ...ch(0, s.s, 32, 'pad', 0.1)); return loop(ac, 'sp' + i, { bpm: s.bpm, steps: 32, notes: n }); };
    const start = (i) => {
      at = i; dk.play(buf(i), 1, (ac, src, g) => {
        const nz = ac.createBufferSource(), ng = ac.createGain(), sg = ac.createGain(), lp = ac.createBiquadFilter();
        nz.buffer = noise(ac); nz.loop = true; lp.type = 'lowpass'; src.connect(sg).connect(lp); nz.connect(ng).connect(lp); lp.connect(g); nz.start(); dk.add(nz); nodes = { ng, sg, lp };
      }); upd();
    };
    const upd = () => {
      const [i, sig] = near(), d = dp.value / 200; $('.sp-fv', stage).textContent = (fr.value / 10).toFixed(1); $('.sp-dv', stage).textContent = dp.value;
      sea.style.setProperty('--d', d.toFixed(2)); $('.sp-m', stage).textContent = '-' + dp.value + ' m'; k.win.style.setProperty('--sp-d', d.toFixed(2));
      now.textContent = sig > 0.5 ? SP[i].f + ' · “' + SP[i].n + '” with dj ' + SP[i].dj + (d > 0.6 ? ' · far above you now' : '') : 'static between stations';
      if (!dk.on) return; if (i !== at) { start(i); return; }
      glide(nodes.sg.gain, sig, dk.ac); glide(nodes.ng.gain, (1 - sig) * 0.35, dk.ac); glide(nodes.lp.frequency, 9000 * Math.pow(0.03, d), dk.ac);
    };
    dk.onstop = () => { pow.setAttribute('aria-pressed', 'false'); k.win.classList.remove('sp-on'); };
    pow.onclick = () => { if (dk.on) { dk.stop(); return; } if (!k.audio()) return; pow.setAttribute('aria-pressed', 'true'); k.win.classList.add('sp-on'); start(near()[0]); };
    fr.oninput = upd; dp.oninput = upd;
    fr.onchange = () => { const [i, sig] = near(); if (sig > 0.6 && !tuned[i]) { tuned[i] = 1; k.act('tune', 1, 'tuned abyss.fm to ' + SP[i].f + ' “' + SP[i].n + '”'); } };
    dp.onchange = () => { const m = +dp.value; [100, 200].forEach((x) => { if (m >= x && !deep[x]) { deep[x] = 1; k.act('dive', 0.5, 'dove to -' + x + ' m' + (x === 200 ? ', where the light runs out' : '')); } }); };
    $('.sp-rb', stage).onclick = () => {
      const [i, sig] = near(), what = sig > 0.5 ? SP[i].n : 'static'; dash.unshift({ what, d: +dp.value, notes: 1 }); dash = dash.slice(0, 6); drawDash();
      k.act('reblog', 2, 'reblogged “' + what + '” from -' + dp.value + ' m');
    };
    const drawDash = () => { $('.sp-dash', stage).innerHTML = dash.map((x) => `<figure style="--d:${(x.d / 200).toFixed(2)}"><span aria-hidden="true">🐬</span><figcaption>${k.esc(x.what)}<small>-${x.d} m · ${x.notes} notes</small></figcaption></figure>`).join(''); };
    k.every(2000, () => { if (!dash.length) return; dash.forEach((x) => { if (Math.random() < 0.5) x.notes += 1 + Math.floor(Math.random() * 4); }); drawDash(); });
    upd();
  } };

  /* =============================== future funk =============================== */
  const FF = [
    { t: 'Harbor Lights at 2 A.M.', kana: 'ハーバー・ライツ', a: 'Pacific Hotel Band', y: 1983, tr: 0, bpm: 100, c: ['#FF4F9A', '#FFB45C'] },
    { t: 'Poolside Telephone', kana: 'プールサイド・テレフォン', a: 'Night Pool Club', y: 1985, tr: 2, bpm: 104, c: ['#45D7E8', '#FFF0D8'] },
    { t: 'Neon Coastline', kana: 'ネオン・コーストライン', a: 'Weather Report FM', y: 1982, tr: -3, bpm: 98, c: ['#4B2E83', '#FF4F9A'] },
    { t: 'Last Train Lovers', kana: 'ラスト・トレイン', a: 'Sunday Drive Ensemble', y: 1986, tr: 5, bpm: 106, c: ['#FFB45C', '#45D7E8'] },
  ];
  const FF_CH = [[53, 57, 60, 64], [52, 55, 59, 62], [57, 60, 64, 67], [50, 53, 57, 60]];
  P.futurefunk = { w: 580, html: (h) => `
    <header class="ff-head"><h3>citypop<span>.club</span></h3><p>record store &amp; listening room · ${h.years} · open late</p></header>
    <div class="ff-shop">
      <div class="ff-crate"><p class="ff-lbl">crate · シティポップ · ¥500 each</p><div class="ff-sleeve"><div class="ff-art"><i class="ff-sun"></i><i class="ff-city"></i></div><div class="ff-obi"><b class="ff-kana"></b><small class="ff-t"></small></div></div>
        <div class="ff-flip"><button type="button" class="ff-b ff-prev" aria-label="previous record">◀</button><button type="button" class="ff-b ff-pull">pull it out</button><button type="button" class="ff-b ff-next" aria-label="next record">▶</button></div></div>
      <div class="ff-tt"><div class="ff-disc" aria-hidden="true"><i></i></div><p class="ff-np" aria-live="polite">the turntable is empty</p><button type="button" class="ff-b ff-stop">■ lift the needle</button></div>
    </div>
    <div class="ff-chop"><p class="ff-lbl">chop it · tap pads to build an 8-slot loop</p>
      <div class="ff-pads">${['A', 'B', 'C', 'D'].map((x, i) => `<button type="button" class="ff-pad" data-i="${i}" disabled>${x}</button>`).join('')}</div>
      <ol class="ff-pat" aria-label="your pattern">${'<li></li>'.repeat(8)}</ol>
      <div class="ff-flip"><button type="button" class="ff-b ff-clear">clear</button><button type="button" class="ff-b ff-edit">▶ play the edit (+kick, ×1.12)</button><button type="button" class="ff-b ff-rel">put it on the shelf</button></div></div>
    <ol class="ff-shelf"></ol>
    ${h.note('future funk producers took 1980s japanese city pop and disco, chopped short loops, sped them up and put a four-on-the-floor kick under them, often with an anime still as the cover. every record in this crate is invented.')}`,
  run(stage, k) {
    const dk = deck(k), np = $('.ff-np', stage); let i = 0, rec = -1, pat = [], shelf = [];
    const buf = (r) => { const ac = k.audio(); if (!ac) return null; const x = FF[r], n = [];
      FF_CH.forEach((c, b) => { const o = b * 16, cc = c.map((m) => m + x.tr);
        n.push(...ch(o, cc, 5, 'ep', 0.22), ...ch(o + 6, cc, 3, 'ep', 0.16), ...ch(o + 10, cc, 5, 'ep', 0.18));
        [0, 3, 8, 11, 14].forEach((s, j) => n.push([o + s, cc[0] - 12 + (j === 1 ? 12 : 0), 2, 'bass', 0.45]));
        for (let s = 0; s < 16; s += 2) n.push([o + s, 0, 1, 'hat', s % 8 === 4 ? 0.4 : 0.15]); n.push([o, 0, 4, 'kick', 0.6], [o + 8, 0, 4, 'kick', 0.5]);
        n.push([o + 12, cc[3] + 12, 2, 'mallet', 0.15], [o + 14, cc[2] + 12, 2, 'mallet', 0.12]); });
      return loop(ac, 'ff' + r, { bpm: x.bpm, steps: 64, notes: n }); };
    const show = () => { const x = FF[i], s = $('.ff-sleeve', stage); s.style.setProperty('--a', x.c[0]); s.style.setProperty('--b', x.c[1]); $('.ff-kana', stage).textContent = x.kana; $('.ff-t', stage).textContent = x.t + ' · ' + x.a + ' · ' + x.y; s.classList.remove('ff-in'); void s.offsetWidth; s.classList.add('ff-in'); };
    const patDraw = () => $$('.ff-pat li', stage).forEach((li, j) => { li.textContent = pat[j] != null ? 'ABCD'[pat[j]] : ''; li.className = pat[j] != null ? 'p' + pat[j] : ''; });
    const setSpin = (on) => k.win.classList.toggle('ff-spin', on);
    dk.onstop = () => { setSpin(false); np.textContent = rec < 0 ? 'the turntable is empty' : 'needle up · ' + FF[rec].t; };
    $('.ff-prev', stage).onclick = () => { i = (i + FF.length - 1) % FF.length; show(); k.tone(1800, 0.03, 'triangle', 0.02); };
    $('.ff-next', stage).onclick = () => { i = (i + 1) % FF.length; show(); k.tone(1800, 0.03, 'triangle', 0.02); };
    $('.ff-pull', stage).onclick = () => {
      const b = buf(i); rec = i; pat = []; patDraw(); $$('.ff-pad', stage).forEach((p) => { p.disabled = false; });
      $('.ff-disc', stage).style.setProperty('--a', FF[i].c[0]);
      if (b) { dk.play(b, 1); setSpin(true); } np.textContent = 'now playing: ' + FF[i].t + ' · ' + FF[i].a + ' (' + FF[i].y + ')';
      k.act('dig', 1, 'pulled “' + FF[i].t + '” from the crate');
    };
    $('.ff-stop', stage).onclick = () => dk.stop();
    $$('.ff-pad', stage).forEach((p) => { p.onclick = () => {
      if (rec < 0) return; const j = +p.dataset.i, b = buf(rec); if (b) shot(k, b, j * b.duration / 4, b.duration / 8);
      pat.push(j); if (pat.length > 8) pat.shift(); patDraw(); p.classList.remove('hit'); void p.offsetWidth; p.classList.add('hit');
    }; });
    $('.ff-clear', stage).onclick = () => { pat = []; patDraw(); };
    $('.ff-edit', stage).onclick = () => {
      if (rec < 0 || pat.length < 2) { np.textContent = 'pull a record and tap at least two pads first'; return; }
      const b = buf(rec), ac = k.audio(); if (!b || !ac) return;
      const sd = b.getChannelData(0), seg = Math.floor(b.length / 8), out = ac.createBuffer(1, seg * 8, b.sampleRate), d = out.getChannelData(0), beat = seg / 2, sr = b.sampleRate;
      for (let s = 0; s < 8; s++) { const from = pat[s % pat.length] * seg * 2; for (let x = 0; x < seg; x++) d[s * seg + x] = sd[from + x]; }
      for (let x = 0; x < d.length; x++) { const p = x % beat, t = p / sr; d[x] = d[x] * (0.3 + 0.7 * Math.min(1, p / (beat * 0.6))) + 0.8 * Math.sin(TAU * (45 * t + 3.3 * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 9); }
      let pk = 0; for (let x = 0; x < d.length; x++) pk = Math.max(pk, Math.abs(d[x])); for (let x = 0; x < d.length; x++) d[x] *= 0.9 / pk;
      dk.play(out, 1.12); setSpin(true); np.textContent = 'your edit: ' + pat.map((x) => 'ABCD'[x]).join(' ') + ' · sped up, kick under it';
      k.act('chop', 1, 'chopped “' + FF[rec].t + '” into ' + pat.map((x) => 'ABCD'[x]).join('') + ' and put a kick under it');
    };
    $('.ff-rel', stage).onclick = () => {
      if (rec < 0 || pat.length < 2) { np.textContent = 'nothing to shelve yet: chop something first'; return; }
      const t = FF[rec].t + ' (' + k.handle + ' edit)'; shelf.unshift({ t, p: pat.map((x) => 'ABCD'[x]).join(''), c: FF[rec].c }); shelf = shelf.slice(0, 5);
      $('.ff-shelf', stage).innerHTML = shelf.map((s) => `<li style="--a:${s.c[0]};--b:${s.c[1]}"><i aria-hidden="true"></i><b>${k.esc(s.t)}</b><small>future funk · chop ${s.p} · ×1.12</small></li>`).join('');
      k.act('release', 2, 'put “' + t + '” on the shelf');
    };
    show();
  } };

  /* =============================== mallsoft =============================== */
  const MS = [
    { u: '101', n: 'Fountain Court', open: 1, d: 0, s: 'the fountain still runs. the PA speaker is right above you.', tag: 'water · muzak, close' },
    { u: '104', n: 'Tapes & Records', open: 0, d: 1, s: 'shutter down. a price gun left on the counter, visible through the slats.', tag: 'shutter hum' },
    { u: '108', n: 'One-Hour Photo', open: 0, d: 1, s: 'a sign: “back in 1 hour”. the paper has gone yellow.', tag: 'fluorescent buzz' },
    { u: '112', n: 'Food Court', open: 1, d: 2, s: 'twelve counters, one open. chairs stacked on the tables.', tag: 'ice machine · distant muzak' },
    { u: '115', n: 'Waterbed Gallery', open: 0, d: 2, s: 'the carpet still shows where the beds stood.', tag: 'air vents' },
    { u: '120', n: 'Arcade', open: 0, d: 3, s: 'one cabinet behind the shutter is still running its attract-mode loop.', tag: 'a cabinet, faintly' },
    { u: '130', n: 'Anchor Store (east)', open: 0, d: 3, s: 'the biggest room in the mall. the escalator is roped off but still moving.', tag: 'escalator · nothing else' },
  ];
  const MS_AUD = [[9000, 1, 0.15], [2600, 0.55, 0.6], [1100, 0.3, 0.9], [520, 0.15, 1.1]];
  P.mallsoft = { w: 560, html: (h) => `
    <div class="ms-sign"><b>MALL DIRECTORY</b><span>LEVEL B1 · mall_archive/ · ${h.years}</span></div>
    <div class="ms-hall" aria-hidden="true">${MS.map((m) => `<i class="${m.open ? 'op' : 'cl'}" data-u="${m.u}"><b>${m.u}</b></i>`).join('')}<span class="ms-you">●</span></div>
    <div class="ms-pa"><button type="button" class="ms-b ms-play" aria-pressed="false">▶ the PA</button><span class="ms-np">muzak_loop_04 (fountain court) · invented</span></div>
    <div class="ms-dir"><label class="ms-find"><span>search the archive</span><input type="text" class="ms-q" maxlength="30" autocomplete="off" placeholder="escalator, photo, water…"></label>
      <ul class="ms-units">${MS.map((m, i) => `<li><button type="button" class="ms-u" data-i="${i}" aria-pressed="${i ? 'false' : 'true'}"><em>${m.u}</em>${m.n}<small>${m.open ? 'open' : 'closed'} · ${m.tag}</small></button></li>`).join('')}</ul></div>
    <div class="ms-front"><div class="ms-shop" aria-hidden="true"><i class="ms-shut"></i><b class="ms-name"></b></div><p class="ms-here" aria-live="polite"></p><button type="button" class="ms-b ms-rec">● record the room tone</button></div>
    <ol class="ms-tapes"></ol>
    ${h.note('mallsoft (and the related signalwave) takes vaporwave into the building itself: muzak heard from far away, through empty corridors and closed shutters. alongside it, people filmed and recorded malls that were closing. the stores and tapes here are invented.')}`,
  run(stage, k) {
    const dk = deck(k), play = $('.ms-play', stage), here = $('.ms-here', stage), rec = $('.ms-rec', stage); let at = 0, fx = null, tapes = [], walked = {}, recording = false;
    const aud = () => { if (!dk.on || !fx) return; const m = MS[at], [f, dry, wet] = MS_AUD[m.d]; glide(fx.lp.frequency, m.open ? f : f * 0.45, dk.ac); glide(fx.dry.gain, dry, dk.ac); glide(fx.wet.gain, wet, dk.ac); };
    const walk = (i) => {
      at = i; const m = MS[i]; pressed($$('.ms-u', stage), $$('.ms-u', stage)[i]);
      $('.ms-you', stage).style.left = ((i + 0.5) / MS.length * 100) + '%'; $$('.ms-hall i', stage).forEach((x, j) => x.classList.toggle('at', j === i));
      const f = $('.ms-front', stage); f.classList.toggle('closed', !m.open); f.style.setProperty('--far', m.d / 3); $('.ms-name', stage).textContent = m.n.toUpperCase();
      here.textContent = 'unit ' + m.u + ', ' + m.n + '. ' + m.s + (dk.on ? ' ' + ['the muzak is right here.', 'the muzak is a corridor away.', 'the muzak is two corridors away now, mostly echo.', 'the muzak is almost only the building now.'][m.d] : '');
      aud();
    };
    dk.onstop = () => { play.setAttribute('aria-pressed', 'false'); play.textContent = '▶ the PA'; };
    play.onclick = () => {
      if (dk.on) { dk.stop(); return; }
      const ac = k.audio(); if (!ac) return; const n = [], C = [[48, 52, 55, 59], [45, 48, 52, 55], [50, 53, 57, 60], [43, 47, 50, 53]], M = [76, 74, 72, 71, 72, 74, 76, 79];
      C.forEach((c, b) => { n.push(...ch(b * 16, c, 14, 'ep', 0.2), [b * 16, c[0] - 12, 8, 'bass', 0.4], [b * 16 + 8, c[2] - 12, 8, 'bass', 0.3]); M.forEach((m, j) => { if ((j + b) % 3 !== 2) n.push([b * 16 + j * 2, m - (b % 2) * 2, 3, 'mallet', 0.15]); }); });
      dk.play(loop(ac, 'ms', { bpm: 84, steps: 64, notes: n }), 1, (a, src, g) => { fx = space(a, src, g, 4); });
      play.setAttribute('aria-pressed', 'true'); play.textContent = '■ the PA'; aud(); walk(at);
    };
    $$('.ms-u', stage).forEach((b) => { b.onclick = () => { const i = +b.dataset.i; walk(i); k.tone(660, 0.25, 'sine', 0.02); if (!walked[i] && i) { walked[i] = 1; k.act('walk', 0.5, 'walked to unit ' + MS[i].u + ', ' + MS[i].n + (MS[i].open ? '' : ' (shuttered)')); } }; });
    $('.ms-q', stage).oninput = (e) => { const q = e.target.value.trim().toLowerCase(); $$('.ms-u', stage).forEach((b) => { const m = MS[+b.dataset.i]; b.parentNode.hidden = !!q && !(m.n + ' ' + m.tag + ' ' + m.s).toLowerCase().includes(q); }); };
    rec.onclick = () => {
      if (recording) return; recording = true; rec.disabled = true; const m = MS[at]; let s = 0; rec.textContent = '● REC 0:00';
      const stop = k.every(500, () => { s += 5; rec.textContent = '● REC 0:' + String(Math.min(s, 30)).padStart(2, '0'); });
      k.after(3200, () => {
        stop(); recording = false; rec.disabled = false; rec.textContent = '● record the room tone';
        tapes.unshift('TAPE ' + String(tapes.length + 1).padStart(2, '0') + ' · unit ' + m.u + ' ' + m.n + ' · ' + m.tag + ' · 0:30 · recorded by ' + k.handle);
        $('.ms-tapes', stage).innerHTML = tapes.slice(0, 6).map((t) => '<li>' + k.esc(t) + '</li>').join('');
        here.textContent = 'thirty seconds of ' + m.n + ' kept. someone meant this place to be forgotten.';
        k.act('record', 2, 'recorded 0:30 of room tone at unit ' + m.u + ', ' + m.n);
      });
    };
    walk(0);
  } };
})();
