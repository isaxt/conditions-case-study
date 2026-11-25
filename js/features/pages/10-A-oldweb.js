/* A. old web, retro technology — worlds: each page is the practice, not a palette */
(function () {
  const P = window.SC_PAGES;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));

  /* ---------------- y2k: future.exe, configure a translucent gadget and launch it into the millennium ---------------- */
  const Y = {
    shell: [['ice', 'polar ice', 'rgba(200,215,232,.62)'], ['aqua', 'cyber aqua', 'rgba(0,217,255,.5)'], ['lime', 'lime shock', 'rgba(180,255,57,.55)'], ['orchid', 'orchid', 'rgba(244,167,255,.58)'], ['smoke', 'midnight smoke', 'rgba(39,33,61,.55)']],
    form: [['pod', 'pod'], ['flip', 'flip'], ['disc', 'disc']],
    extras: ['MP3 ×120 songs', 'infrared beam', 'WAP browser', 'glow keys', 'pager'],
  };
  P.y2k = { w: 580, html: (h) => `
    <div class="y-top"><b class="y-logo">future<i>.exe</i></b><span class="y-clock" aria-hidden="true">12.31.1999 <u>23:59:40</u></span></div>
    <div class="y-orbit">
      <i class="y-ring y-r1"></i><i class="y-ring y-r2"></i><i class="y-star"></i>
      <div class="y-dev" data-form="pod" style="--sh:${Y.shell[0][2]}"><i class="y-guts"></i><i class="y-scr"><span class="y-nm">ZIP 2000</span></i><i class="y-shine"></i></div>
      ${['shell', 'form', 'extras', 'launch'].map((p, i) => `<button class="y-pl y-p${i + 1}" data-p="${p}" aria-pressed="${i ? 'false' : 'true'}"><b>0${i + 1}</b>${p}</button>`).join('')}
    </div>
    <div class="y-panel"></div>
    <p class="y-live" aria-live="polite">configure your device. the future ships at midnight.</p>
    <div class="y-shelf"><h4>◖ pre-orders ◗</h4><ol><li class="y-empty">none yet. be the first on your block.</li></ol></div>
    ${h.note('y2k design sold the future as an object you could hold: see-through plastic showing the circuitry, chrome, orbit diagrams on launch pages.')}`,
  run(stage, k) {
    const s = { shell: 0, form: 0, extras: new Set(), name: 'ZIP 2000', pane: 'shell', sec: 40, busy: false, n: 0 };
    const dev = $('.y-dev', stage), panel = $('.y-panel', stage), live = $('.y-live', stage), clock = $('.y-clock u', stage);
    const say = (t) => { live.textContent = t; };
    const spec = () => Y.shell[s.shell][1] + ' ' + Y.form[s.form][1] + (s.extras.size ? ', ' + Array.from(s.extras).join(', ') : '');
    const paint = () => { dev.style.setProperty('--sh', Y.shell[s.shell][2]); dev.dataset.form = Y.form[s.form][0]; $('.y-nm', dev).textContent = s.name; dev.classList.toggle('y-glow', s.extras.has('glow keys')); };
    const pane = () => {
      $$('.y-pl', stage).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.p === s.pane)));
      if (s.pane === 'shell') panel.innerHTML = '<h4>choose a translucent shell</h4><div class="y-opts">' + Y.shell.map((x, i) => `<button class="y-gel" data-i="${i}" style="--sh:${x[2]}" aria-pressed="${i === s.shell}">${x[1]}</button>`).join('') + '</div>';
      if (s.pane === 'form') panel.innerHTML = '<h4>choose a form factor</h4><div class="y-opts">' + Y.form.map((x, i) => `<button class="y-gel" data-i="${i}" aria-pressed="${i === s.form}">${x[1]}</button>`).join('') + '</div>';
      if (s.pane === 'extras') panel.innerHTML = '<h4>add features (up to 3)</h4><div class="y-opts">' + Y.extras.map((x) => `<button class="y-gel" data-x="${x}" aria-pressed="${s.extras.has(x)}">${x}</button>`).join('') + '</div>';
      if (s.pane === 'launch') panel.innerHTML = `<h4>name it, then launch</h4><div class="y-launch"><label>model name <input class="y-in" maxlength="14" value="${k.esc(s.name)}"></label><button class="y-go">▲ LAUNCH</button></div>`;
      $$('.y-gel', panel).forEach((b) => { b.onclick = () => pick(b); });
      const go = $('.y-go', panel); if (go) go.onclick = launch;
      const inp = $('.y-in', panel); if (inp) inp.oninput = () => { s.name = inp.value.trim().toUpperCase() || 'ZIP 2000'; paint(); };
    };
    const pick = (b) => {
      if (s.busy) return;
      k.tone(660 + Math.random() * 400, 0.09, 'sine', 0.04, 1500);
      if (s.pane === 'shell') { s.shell = +b.dataset.i; k.act('shell', 0.5, 'chose a translucent ' + Y.shell[s.shell][1] + ' shell for a future.exe device'); }
      if (s.pane === 'form') s.form = +b.dataset.i;
      if (s.pane === 'extras') { const x = b.dataset.x; if (s.extras.has(x)) s.extras.delete(x); else if (s.extras.size < 3) s.extras.add(x); else { say('three features max. the future has a weight limit.'); return; } }
      paint(); pane(); say('your device: ' + spec() + '.');
    };
    const launch = () => {
      if (s.busy) return; s.busy = true; stage.classList.add('y-count');
      if (s.name !== 'ZIP 2000') k.act('name', 1, 'named their future.exe device “' + s.name + '”');
      [3, 2, 1].forEach((n, i) => k.after(i * 600, () => { say('T–' + n); k.tone(440 * (i + 1), 0.25, 'square', 0.025); }));
      k.after(1800, () => {
        dev.classList.add('y-fly'); k.tone(180, 1.3, 'sawtooth', 0.03, 2200); clock.textContent = '00:00:00'; clock.parentNode.firstChild.textContent = '01.01.2000 ';
        s.n++; say(s.name + ' launched. happy new millennium. nothing broke.');
        const ol = $('.y-shelf ol', stage), li = document.createElement('li');
        li.innerHTML = '<i style="--sh:' + Y.shell[s.shell][2] + '"></i><b>' + k.esc(s.name) + '</b> ' + k.esc(spec()) + ' <em>· ' + k.esc(k.handle) + '</em>';
        const e = $('.y-empty', ol); if (e) e.remove(); ol.prepend(li);
        k.act('launch', 2, 'launched “' + s.name + '” (' + spec() + ')');
      });
      k.after(3800, () => { dev.classList.remove('y-fly'); stage.classList.remove('y-count'); s.busy = false; s.sec = 40; clock.parentNode.firstChild.textContent = '12.31.1999 '; say('the clock has rolled back. configure another?'); });
    };
    $$('.y-pl', stage).forEach((b) => { b.onclick = () => { s.pane = b.dataset.p; k.tone(990, 0.06, 'sine', 0.03); pane(); }; });
    k.every(1000, () => { if (s.busy) return; s.sec = s.sec >= 59 ? 40 : s.sec + 1; clock.textContent = '23:59:' + s.sec; });
    paint(); pane();
  } };

  /* ---------------- aero: edenOS, a glossy desktop where popping bubbles fills an eco gadget ---------------- */
  const WX = [['☀', '24°', 'air quality: lovely'], ['⛅', '22°', 'pollen: friendly'], ['🌈', '21°', 'tomorrow: also good'], ['☀', '25°', 'ice caps: data unavailable'], ['🌤', '23°', 'everything: in harmony']];
  P.aero = { w: 580, html: (h) => `
    <div class="ae-desk">
      <div class="ae-sky" aria-hidden="true"><i class="ae-sun"></i><i class="ae-cl ae-c1"></i><i class="ae-cl ae-c2"></i><i class="ae-hill"></i><i class="ae-hill2"></i></div>
      <div class="ae-pond" role="group" aria-label="bubbles: press one to pop it"></div>
      <aside class="ae-side">
        <section class="ae-gad"><h4>aquarium</h4><div class="ae-tank"><i class="ae-water"></i><span class="ae-f1" aria-hidden="true">🐠</span><span class="ae-f2" aria-hidden="true">🐟</span><span class="ae-pl" aria-hidden="true">🌿</span></div><p class="ae-pct" aria-live="polite">0% · pop bubbles to fill it</p></section>
        <section class="ae-gad"><h4>weather</h4><p class="ae-wx" aria-live="polite"><b>☀ 24°</b> air quality: lovely</p><button class="ae-ref">↻ refresh</button></section>
        <section class="ae-gad"><h4>wind farm</h4><div class="ae-tur" aria-hidden="true"><i class="ae-bl"></i><i class="ae-mast"></i></div><p class="ae-kw">idle</p></section>
      </aside>
      <div class="ae-bar"><span class="ae-orb" aria-hidden="true"></span><b>edenOS</b><span class="ae-tray">🔊 <u class="ae-clk">12:00</u></span></div>
    </div>
    ${h.note('aero interfaces paired glossy glass with water, skies and grass, as if technology and nature were the same project. "frutiger aero" is a name fans gave it later.')}`,
  run(stage, k) {
    const pond = $('.ae-pond', stage), desk = $('.ae-desk', stage), pct = $('.ae-pct', stage), kw = $('.ae-kw', stage);
    let fill = 0, popped = 0, wx = 0, full = false;
    const draw = () => {
      desk.style.setProperty('--fill', fill / 100); desk.style.setProperty('--spin', (3.2 - fill / 40) + 's');
      desk.classList.toggle('ae-on', fill > 0); desk.classList.toggle('ae-l1', fill >= 30); desk.classList.toggle('ae-l2', fill >= 60); desk.classList.toggle('ae-l3', fill >= 100);
      pct.textContent = fill >= 100 ? '100% · ecosystem balanced ✓' : fill + '% · pop bubbles to fill it';
      kw.textContent = fill ? Math.round(fill * 1.8) + ' kW · clean' : 'idle';
    };
    const pop = (b) => {
      k.tone(520 + Math.random() * 300, 0.14, 'sine', 0.05, 1400 + Math.random() * 500); b.classList.add('ae-pop'); b.disabled = true;
      setTimeout(() => b.remove(), 220);
      popped++; fill = Math.min(100, fill + 10); draw();
      if (popped === 1) k.act('pop', 0.5, 'popped a bubble on the edenOS desktop');
      if (fill >= 100 && !full) { full = true; k.act('fill', 2, 'filled the edenOS aquarium until the ecosystem read “balanced”'); [523, 659, 784, 1046].forEach((f, i) => k.after(i * 110, () => k.tone(f, 0.4, 'sine', 0.035))); }
    };
    const spawn = () => {
      if (pond.children.length >= 6) return;
      const b = document.createElement('button');
      b.className = 'ae-bub'; b.setAttribute('aria-label', 'bubble');
      const sz = 26 + Math.random() * 26;
      b.style.cssText = 'left:' + (4 + Math.random() * 80) + '%;top:' + (12 + Math.random() * 62) + '%;width:' + sz + 'px;height:' + sz + 'px;animation-delay:' + (Math.random() * -4).toFixed(1) + 's';
      b.onclick = () => pop(b);
      pond.appendChild(b);
    };
    $('.ae-ref', stage).onclick = () => {
      wx = (wx + 1) % WX.length; const w = WX[wx];
      $('.ae-wx', stage).innerHTML = '<b>' + w[0] + ' ' + w[1] + '</b> ' + w[2];
      k.tone(880, 0.12, 'sine', 0.03, 1320);
      if (wx === 3) k.act('forecast', 0.5, 'refreshed the edenOS weather until it said “ice caps: data unavailable”');
    };
    const clk = () => { const d = new Date(); $('.ae-clk', stage).textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };
    for (let i = 0; i < 4; i++) spawn();
    k.every(1300, spawn); k.every(20000, clk); clk(); draw();
  } };

  /* ---------------- desktopcore: archive://desktop, someone's computer, folder by folder ---------------- */
  const FS = {
    'C:\\My Documents': ['school/', 'my site/', 'music/', 'pics/', 'DO_NOT_OPEN.exe'],
    'C:\\My Documents\\school': ['essay_final_FINAL2.doc', 'timetable.txt'],
    'C:\\My Documents\\my site': ['index.htm', 'guestbook.txt'],
    'C:\\My Documents\\music': ['mix_for_the_bus.m3u'],
    'C:\\My Documents\\pics': ['our_cat.bmp'],
    'C:\\Recycle Bin': ['poem.txt'],
  };
  const FILES = {
    'essay_final_FINAL2.doc': 'The Internet Will Change Everything\nby J. (period 3)\n\nIn the future everyone will have a homepage. You will be able to talk to someone in another country for free. My dad says it is a fad. I think he is wrong.\n\n[teacher: B+. cite your sources.]',
    'timetable.txt': 'MON  maths / art / ART AGAIN\nTUE  science (bring goggles)\nWED  computer lab!!! 45 min\nTHU  pe :(\nFRI  library, dial-up after 6pm only',
    'index.htm': '<html>\n<body bgcolor="black">\n<center>\n<h1>WELCOME TO MY PAGE</h1>\n<img src="construction.gif">\nthis page is under construction\n<marquee>thanx for visiting!!</marquee>\n<!-- todo: everything -->',
    'guestbook.txt': '#1  cool site. —a friend from class\n#2  ur cat is cute —(no name)\n#3  how did u make the text move —someone at the library',
    'mix_for_the_bus.m3u': '#EXTM3U\n01 track01_from_the_radio.mp3\n02 song_i_dont_know_the_name_of.mp3\n03 track01_from_the_radio (1).mp3\n04 the_good_part_only.mp3\n(total time: exactly one bus ride)',
    'our_cat.bmp': '   /\\_/\\  \n  ( o.o ) \n   > ^ <    our cat, 640×480, 256 colours.\n            took 4 minutes to open.',
    'poem.txt': 'nobody reads this folder\nso i can say it here:\ni like the sound the modem makes.\nit sounds like it is trying very hard.',
  };
  P.desktopcore = { w: 600, html: (h) => `
    <div class="dk-desk">
      <div class="dk-icons"><button class="dk-ic" data-go="C:\\My Documents"><i class="dk-fold"></i>My Documents</button><button class="dk-ic" data-go="C:\\Recycle Bin"><i class="dk-bin"></i>Recycle Bin</button></div>
      <div class="dk-win dk-ex">
        <div class="dk-tb"><span>📁 Exploring</span><em aria-hidden="true">_ □ ×</em></div>
        <div class="dk-addr"><button class="dk-up" aria-label="up one folder">⬆ Up</button><span class="dk-path">C:\\My Documents</span></div>
        <div class="dk-list" role="list"></div>
        <div class="dk-st" aria-live="polite">this is someone's computer. have a look around.</div>
      </div>
      <div class="dk-win dk-np" hidden><div class="dk-tb"><span class="dk-fn">Notepad</span><button class="dk-x" aria-label="close file">×</button></div><pre class="dk-txt"></pre><div class="dk-npbar"></div></div>
      <div class="dk-flash" aria-hidden="true"></div>
    </div>
    <div class="dk-task"><span class="dk-start">⊞ Start</span><button class="dk-prt">📷 PrtSc</button><span class="dk-found">0 files opened</span><span class="dk-clock">4:12 PM</span></div>
    ${h.note('desktopcore looks back at old operating systems: icons, dialog boxes, folders you arranged yourself. part of the appeal is that the computer felt like a room someone lived in.')}`,
  run(stage, k) {
    let cwd = 'C:\\My Documents', shots = 0;
    const seen = new Set();
    const list = $('.dk-list', stage), np = $('.dk-np', stage), st = $('.dk-st', stage);
    const click = () => k.tone(1400, 0.02, 'square', 0.03);
    const icon = (f) => f.endsWith('/') ? 'dk-fold' : /\.exe$/.test(f) ? 'dk-exe' : /\.(bmp)$/.test(f) ? 'dk-img' : 'dk-doc';
    const show = () => {
      $('.dk-path', stage).textContent = cwd;
      list.innerHTML = (FS[cwd] || []).map((f) => `<button class="dk-ic" role="listitem" data-f="${k.esc(f)}"><i class="${icon(f)}"></i>${k.esc(f.replace('/', ''))}</button>`).join('') || '<p class="dk-empty">(this folder is empty)</p>';
      $$('.dk-ic', list).forEach((b) => { b.onclick = () => open(b.dataset.f); });
    };
    const go = (p) => { cwd = p; click(); np.hidden = true; show(); st.textContent = (FS[p] || []).length + ' object(s)'; };
    const open = (f) => {
      click();
      if (f.endsWith('/')) return go(cwd + '\\' + f.slice(0, -1));
      np.hidden = false;
      const bar = $('.dk-npbar', np);
      if (f === 'DO_NOT_OPEN.exe') {
        $('.dk-fn', np).textContent = '⚠ DO_NOT_OPEN';
        $('.dk-txt', np).textContent = 'This program has performed an illegal operation\nand will be shut down.\n\n(it was a joke. there was never a program.\nhi.)';
        bar.innerHTML = ''; [330, 262].forEach((f2, i) => k.after(i * 140, () => k.tone(f2, 0.2, 'triangle', 0.05)));
      } else {
        $('.dk-fn', np).textContent = f + ' - Notepad';
        $('.dk-txt', np).textContent = FILES[f] || '';
        bar.innerHTML = cwd === 'C:\\Recycle Bin' ? '<button class="dk-rest">↶ Restore</button>' : '';
        const r = $('.dk-rest', np);
        if (r) r.onclick = () => {
          FS['C:\\Recycle Bin'] = FS['C:\\Recycle Bin'].filter((x) => x !== f); FS['C:\\My Documents'].push(f);
          k.tone(523, 0.1, 'square', 0.03); k.after(110, () => k.tone(784, 0.15, 'square', 0.03));
          k.act('restore', 1.5, 'restored ' + f + ' from someone’s Recycle Bin'); go('C:\\My Documents'); st.textContent = f + ' restored to My Documents.';
        };
      }
      const full = cwd + '\\' + f;
      if (!seen.has(full)) { seen.add(full); k.act('open', 0.5, 'opened ' + full); }
      $('.dk-found', stage).textContent = seen.size + ' files opened';
      st.textContent = 'opened ' + f;
      $('.dk-x', np).focus();
    };
    $('.dk-x', np).onclick = () => { np.hidden = true; click(); const b = list.querySelector('.dk-ic'); if (b) b.focus(); };
    $('.dk-up', stage).onclick = () => { if (cwd.split('\\').length > 2) go(cwd.slice(0, cwd.lastIndexOf('\\'))); else st.textContent = 'you are as far up as this computer goes.'; };
    $$('.dk-icons .dk-ic', stage).forEach((b) => { b.onclick = () => go(b.dataset.go); });
    $('.dk-prt', stage).onclick = () => {
      shots++; const fl = $('.dk-flash', stage); fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on');
      k.tone(2000, 0.05, 'square', 0.03); k.after(70, () => k.tone(1200, 0.08, 'square', 0.03));
      const name = 'screenshot' + String(shots).padStart(3, '0') + '.bmp';
      FS['C:\\My Documents\\pics'].push(name); FILES[name] = '[ a screenshot of this desktop, ' + (cwd === 'C:\\My Documents' ? 'at the top' : 'inside ' + cwd) + ' ]\n\n(saved by ' + k.handle + '. someone will find it in pics/ one day.)';
      k.act('screenshot', 1, 'took a screenshot of someone else’s desktop (' + name + ')');
      st.textContent = 'saved ' + name + ' to pics.';
      if (cwd.endsWith('pics')) show();
    };
    show();
  } };

  /* ---------------- metro: a live-tile start screen you arrange and recolour ---------------- */
  const ACC = [['cobalt', '#0050EF'], ['lime', '#7FBA00'], ['red', '#E51400'], ['amber', '#F0A30A'], ['magenta', '#D80073'], ['teal', '#00ABA9']];
  const APPS = [
    { n: 'people', g: '☺', z: 'm', live: ['3 new photos from friends', 'someone changed their status'] },
    { n: 'mail', g: '✉', z: 's', live: ['2 unread'] },
    { n: 'weather', g: '☀', z: 'w', live: ['18° · light rain later', 'tomorrow 21°'] },
    { n: 'music', g: '♫', z: 's', live: ['now playing: track 04'] },
    { n: 'photos', g: '▣', z: 'm', live: ['last week: 41 photos'] },
    { n: 'calendar', g: '▦', z: 's', live: ['3:00 dentist'] },
    { n: 'maps', g: '⌖', z: 's', live: [] }, { n: 'store', g: '⬚', z: 's', live: ['12 updates'] }, { n: 'games', g: '◈', z: 'm', live: ['your turn'] },
  ];
  P.metro = { w: 560, html: (h) => `
    <div class="mt-scr">
      <div class="mt-head"><h3>start</h3><span>${h.e(window.ThirdSpaceNext && ThirdSpaceNext.me && ThirdSpaceNext.me.handle || 'you')}</span></div>
      <div class="mt-grid" role="list" aria-label="start screen tiles"></div>
      <div class="mt-tools" hidden><span class="mt-sel"></span><button data-t="l" aria-label="move tile earlier">◀</button><button data-t="r" aria-label="move tile later">▶</button><button data-t="z">resize</button><button data-t="u">unpin</button><button data-t="d">done</button></div>
      <div class="mt-row"><span>accent</span>${ACC.map((a) => `<button class="mt-acc" data-c="${a[1]}" style="--c:${a[1]}" aria-label="${a[0]} accent"></button>`).join('')}</div>
      <div class="mt-row mt-all"><span>all apps</span><span class="mt-off"></span></div>
      <p class="mt-live" aria-live="polite">tap a tile to arrange it. tiles flip on their own.</p>
    </div>
    ${h.note('metro / flat design replaced glossy realism with typography and colour fields. personalising meant choosing one accent colour and arranging tiles, inside a grid that stayed the same for everyone.')}`,
  run(stage, k) {
    const pinned = APPS.slice(0, 8).map((a) => Object.assign({}, a)), off = [Object.assign({}, APPS[8])];
    let sel = null;
    const grid = $('.mt-grid', stage), tools = $('.mt-tools', stage), live = $('.mt-live', stage), done = new Set();
    const log = (n, w, d) => { if (!done.has(d)) { done.add(d); k.act(n, w, d); } };
    const say = (t) => { live.textContent = t; };
    const draw = () => {
      grid.innerHTML = pinned.map((a, i) => `<button class="mt-tile mt-${a.z}${sel === i ? ' mt-on' : ''}" role="listitem" data-i="${i}" aria-pressed="${sel === i}" aria-label="${a.n} tile"><span class="mt-f"><b>${a.g}</b><em>${a.n}</em></span><span class="mt-b">${k.esc(a.live[0] || a.n)}</span></button>`).join('');
      $$('.mt-tile', grid).forEach((b) => { b.onclick = () => { const i = +b.dataset.i; sel = sel === i ? null : i; k.tone(1800, 0.03, 'sine', 0.03); draw(); focusSel(); }; });
      tools.hidden = sel == null; if (sel != null) $('.mt-sel', tools).textContent = pinned[sel].n;
      $('.mt-off', stage).innerHTML = off.length ? off.map((a, i) => `<button class="mt-pin" data-i="${i}">+ ${a.n}</button>`).join('') : '<i>everything is pinned</i>';
      $$('.mt-pin', stage).forEach((b) => { b.onclick = () => { const a = off.splice(+b.dataset.i, 1)[0]; pinned.push(a); log('pin', 1, 'pinned ' + a.n + ' to the start screen'); say(a.n + ' pinned.'); draw(); }; });
    };
    const focusSel = () => { const b = sel != null && grid.querySelector('[data-i="' + sel + '"]'); if (b) b.focus(); };
    const tool = (t) => {
      if (sel == null) return; const a = pinned[sel];
      if (t === 'l' || t === 'r') { const j = sel + (t === 'l' ? -1 : 1); if (j < 0 || j >= pinned.length) return; pinned[sel] = pinned[j]; pinned[j] = a; sel = j; log('arrange', 1, 'rearranged the start screen (moved ' + a.n + ')'); say(a.n + ' moved to position ' + (j + 1) + '.'); }
      if (t === 'z') { a.z = { s: 'm', m: 'w', w: 's' }[a.z]; log('resize', 0.5, 'resized the ' + a.n + ' tile'); say(a.n + ' is now ' + { s: 'small', m: 'medium', w: 'wide' }[a.z] + '.'); }
      if (t === 'u') { off.push(pinned.splice(sel, 1)[0]); say(a.n + ' unpinned. find it under all apps.'); sel = null; }
      if (t === 'd') sel = null;
      k.tone(1200, 0.03, 'sine', 0.025); draw(); focusSel();
    };
    $$('button', tools).forEach((b) => { b.onclick = () => tool(b.dataset.t); });
    grid.addEventListener('keydown', (e) => { if (sel == null) return; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); tool(e.key === 'ArrowLeft' ? 'l' : 'r'); } });
    $$('.mt-acc', stage).forEach((b) => {
      b.onclick = () => {
        stage.style.setProperty('--mt', b.dataset.c); $$('.mt-acc', stage).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        const name = b.getAttribute('aria-label').replace(' accent', '');
        k.tone(700, 0.08, 'sine', 0.03); log('accent', 1, 'set the start screen accent colour to ' + name); say('every tile is ' + name + ' now.');
      };
    });
    k.every(2600, () => {
      const ts = $$('.mt-tile', grid).filter((t) => pinned[+t.dataset.i] && pinned[+t.dataset.i].live.length);
      const t = ts[Math.floor(Math.random() * ts.length)]; if (!t) return;
      const a = pinned[+t.dataset.i]; a.live.push(a.live.shift()); $('.mt-b', t).textContent = a.live[0];
      t.classList.toggle('mt-flip');
    });
    stage.style.setProperty('--mt', ACC[0][1]); draw();
  } };
})();
