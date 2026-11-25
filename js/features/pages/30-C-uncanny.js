/* C. surreal, liminal, unsettling — worlds: each page is the practice, not a palette */
(function () {
  const P = window.SC_PAGES;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  /* ---------------- weirdcore: somewhere.unknown, a verification test that answers wrong ---------------- */
  const WC_T = ['the sky from the back seat', 'an empty playground', 'a door in a field', 'the pool after closing', 'a hallway you know', 'an eye', 'a red balloon', 'stairs to the ceiling', 'a window at dusk'];
  const WC_R = [
    ['the place you grew up', 'correct. you have never been here.'],
    ['the door you came in through', 'all of these were the same door.'],
    ['yourself', 'verified. you are not a robot. we are less sure you are you.'],
  ];
  const WC_SAY = ['do you remember?', 'you were here', 'this is not your house', 'it was always like this', 'who left the lights on', 'come back'];
  P.weirdcore = { w: 540, html: (h) => `
    <div class="wc-sky" aria-hidden="true"><i class="wc-cl wc-c1"></i><i class="wc-cl wc-c2"></i><b class="wc-eye"><u></u></b></div>
    <p class="wc-lost">?? °N · ??? °W · somewhere.unknown</p>
    <div class="wc-cap">
      <div class="wc-hd"><small>select all squares with</small><b class="wc-q">${WC_R[0][0]}</b><small>if there are none, click skip</small></div>
      <div class="wc-grid" role="group" aria-label="image squares"></div>
      <div class="wc-ft"><button class="wc-re" aria-label="new images">↻</button><span class="wc-step">1 of 3</span><button class="wc-skip">skip</button><button class="wc-verify">VERIFY</button></div>
      <div class="wc-over" aria-hidden="true"></div>
    </div>
    <p class="wc-live" aria-live="polite">this will only take a moment.</p>
    <div class="wc-map"><h4>places you have been (can't be reached twice)</h4><ul></ul></div>
    ${h.note('weirdcore and dreamcore pair familiar images (playgrounds, pools, clouds, eyes) with crooked text, low resolution and questions that sound like interface prompts. the effect is recognising something you cannot place.')}`,
  run(stage, k) {
    let round = 0, order = [], done = false, said = 0;
    const gone = new Set(), grid = $('.wc-grid', stage), live = $('.wc-live', stage), over = $('.wc-over', stage);
    const shuffle = () => { order = WC_T.map((_, i) => i).sort(() => Math.random() - 0.5); };
    const draw = () => {
      grid.innerHTML = order.map((t) => gone.has(t)
        ? `<button class="wc-tile wc-gone" disabled aria-label="unreachable"><span>?</span></button>`
        : `<button class="wc-tile wc-t${t}" data-t="${t}" aria-pressed="false" aria-label="${WC_T[t]}"><span aria-hidden="true">${['☁️', '', '🚪', '', '', '👁', '🎈', '', '🌙'][t]}</span></button>`).join('');
      $$('.wc-tile:not([disabled])', grid).forEach((b) => { b.onclick = () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); k.tone(on ? 1046 : 784, 0.3, 'triangle', 0.03); }; });
      $('.wc-q', stage).textContent = done ? 'nothing. you can go.' : WC_R[round][0];
      $('.wc-step', stage).textContent = done ? '✓' : (round + 1) + ' of 3';
    };
    const scrawl = (t) => {
      const s = document.createElement('span'); s.textContent = t;
      s.style.cssText = 'left:' + (4 + Math.random() * 46) + '%;top:' + (34 + Math.random() * 46) + '%;transform:rotate(' + (Math.random() * 16 - 8) + 'deg)';
      over.appendChild(s); if (over.children.length > 4) over.firstChild.remove();
    };
    const verify = (skip) => {
      if (done) { done = false; round = 0; $('.wc-verify', stage).textContent = 'VERIFY'; shuffle(); draw(); live.textContent = gone.size >= WC_T.length ? 'there is nowhere left to go. that is okay.' : 'again. it will be different this time.'; return; }
      const picked = $$('.wc-tile[aria-pressed="true"]', grid).map((b) => +b.dataset.t);
      if (!picked.length && !skip) { live.textContent = 'please select all matching images. (there are always some.)'; return; }
      k.tone(392, 0.9, 'sine', 0.04); k.tone(396.5, 0.9, 'sine', 0.04);
      const ul = $('.wc-map ul', stage);
      picked.forEach((t) => { gone.add(t); const li = document.createElement('li'); li.innerHTML = '<s>' + WC_T[t] + '</s> <i>' + (10 + Math.floor(Math.random() * 80)) + '.?? °N · ' + (100 + Math.floor(Math.random() * 79)) + '.?? °W</i>'; ul.prepend(li); });
      k.act('verify', 1, skip ? 'skipped “select all squares with ' + WC_R[round][0] + '”' : 'answered “select all squares with ' + WC_R[round][0] + '” (' + picked.length + ' squares)');
      live.textContent = skip ? 'skipping is also an answer.' : WC_R[round][1];
      scrawl(WC_SAY[++said % WC_SAY.length]);
      round++;
      if (round >= WC_R.length) { done = true; k.act('complete', 1.5, 'passed the somewhere.unknown verification'); $('.wc-verify', stage).textContent = 'AGAIN?'; }
      else $('.wc-verify', stage).textContent = 'VERIFY';
      shuffle(); draw();
    };
    $('.wc-verify', stage).onclick = () => verify(false);
    $('.wc-skip', stage).onclick = () => verify(true);
    $('.wc-re', stage).onclick = () => { shuffle(); draw(); k.tone(300, 0.4, 'sine', 0.03, 200); live.textContent = 'new images. the same images.'; };
    shuffle(); draw(); scrawl(WC_SAY[0]);
  } };

  /* ---------------- liminal: level_001/, walk the rooms while the directory stops being true ---------------- */
  const LM_KIND = ['hall', 'office', 'wait', 'pool'];
  const LM_DESC = [
    ['a hallway. yellow wallpaper, a fluorescent hum. exits as listed.', 'an office partition with no desk. the carpet is damp. exits as listed.', 'a waiting room. no reception desk, no clock. exits as listed.', 'a tiled room with a pool. the water is perfectly still. exits as listed.'],
    ['a hallway. you have seen this wallpaper before.', 'the same office, but the chairs face the other way.', 'a waiting room. your number has not been called.', 'the pool room again. the water level is higher.'],
    ['ROOM {n}. ROOM {n}. ROOM {n}.', 'there is no west exit. there was never a west exit.', 'this entry was edited while you were reading it.', 'exits: north, north, north.'],
    ['you are here ▸ you are here ▸ you are here', '[directory not found]', 'the hum is louder than it should be.', 'you have been walking for a long time. the directory agrees.'],
  ];
  const LM_WIKI = {
    0: [['wanderer_17', 'the hum is the same pitch in every room. hum along and it stops.'], ['m0th_lamp', 'room numbers are not in order. do not try to count.']],
    1: [['wanderer_17', 'concrete, puddles, lights that work most of the time.'], ['quiet_exit', 'there are crates here. someone has been labelling them.']],
  };
  P.liminal = { w: 560, html: (h) => `
    <div class="lm-view lm-k-hall" tabindex="0" aria-label="the room. use the arrow keys or the buttons to walk.">
      <i class="lm-ceil"></i><i class="lm-wl"></i><i class="lm-wr"></i><i class="lm-floor"></i><i class="lm-back"><b class="lm-door"></b></i><i class="lm-dl"></i><i class="lm-dr"></i>
      <span class="lm-hud">LEVEL <b class="lm-lv">0</b> · ROOM <b class="lm-rm">0037</b></span>
    </div>
    <div class="lm-ctl">
      <div class="lm-pad"><button data-go="f" aria-label="walk forward">↑</button><button data-go="l" aria-label="turn left">←</button><button data-go="b" aria-label="turn back">↓</button><button data-go="r" aria-label="turn right">→</button></div>
      <div class="lm-dir" aria-live="polite"><b>BUILDING DIRECTORY</b><p class="lm-txt">you are here: ROOM 0037. a hallway. yellow wallpaper, a fluorescent hum. exits as listed.</p><p class="lm-ex">↑ ROOM 0038 · ← ROOM 0078 · → ROOM 0060</p></div>
    </div>
    <button class="lm-noclip" hidden>⟟ noclip (walk into the wall)</button>
    <div class="lm-wiki"><h4>level <span class="lm-lv2">0</span> · entry (collaborative · unverified)</h4><ul></ul>
      <div class="lm-add-row"><label class="lm-lbl" for="lm-in">add one line to the entry</label><input id="lm-in" class="lm-in" maxlength="90" placeholder="what did you notice?"><button class="lm-add">add</button></div></div>
    ${h.note('liminal-space photos show empty places built for crowds. the backrooms began as one such photo and a short post in 2019, and grew into a shared fiction: levels, rules and entries written by many people.')}`,
  run(stage, k) {
    const s = { lv: 0, rm: 37, steps: 0, clipped: false };
    const view = $('.lm-view', stage), wiki = $('.lm-wiki ul', stage), pad4 = (n) => String(n).padStart(4, '0');
    const drawWiki = () => { wiki.innerHTML = LM_WIKI[s.lv].map((x) => '<li>' + k.esc(x[1]) + ' <i>— ' + k.esc(x[0]) + '</i></li>').join(''); $('.lm-lv2', stage).textContent = s.lv; };
    const walk = (d) => {
      s.steps++;
      const st = Math.min(3, Math.floor(s.steps / 4)), lie = st >= 2;
      s.rm = d === 'f' ? s.rm + (lie && Math.random() < 0.5 ? 0 : 1) : d === 'b' ? s.rm + 7 : s.rm + (d === 'l' ? 41 : 23);
      if (s.rm < 1) s.rm += 50;
      const kind = s.lv ? 'concrete' : rnd(LM_KIND);
      view.className = 'lm-view lm-k-' + kind + (Math.random() < 0.5 ? ' lm-xl' : '') + (Math.random() < 0.5 ? ' lm-xr' : '') + (st >= 3 ? ' lm-off' : '');
      view.classList.remove('lm-step'); void view.offsetWidth; view.classList.add('lm-step');
      $('.lm-rm', stage).textContent = pad4(s.rm);
      const txt = s.lv ? rnd(['concrete, puddles, a crate with a label you can almost read.', 'a stairwell that only goes down. exits as listed.', 'the lights here work. mostly.']) : rnd(LM_DESC[st]).replace(/\{n\}/g, pad4(s.rm));
      $('.lm-txt', stage).textContent = (st >= 3 ? 'you are here: ROOM ' + pad4(s.rm - 1) + '? ' : 'you are here: ROOM ' + pad4(s.rm) + '. ') + txt;
      $('.lm-ex', stage).textContent = lie ? '↑ ROOM ' + pad4(s.rm) + ' · ← ROOM ' + pad4(s.rm) + ' · → ????' : '↑ ROOM ' + pad4(s.rm + 1) + ' · ← ROOM ' + pad4(s.rm + 41) + ' · → ROOM ' + pad4(s.rm + 23);
      k.tone(70 + Math.random() * 10, 0.12, 'triangle', 0.06, 45); k.tone(120, 0.5, 'sawtooth', 0.008);
      if (s.steps === 5) k.act('walk', 0.5, 'walked five rooms into the backrooms');
      if (s.steps === 15) k.act('walk', 1, 'walked fifteen rooms in and stopped trusting the directory');
      if (s.steps >= 10 && !s.lv) $('.lm-noclip', stage).hidden = false;
    };
    $$('.lm-pad button', stage).forEach((b) => { b.onclick = () => walk(b.dataset.go); });
    view.addEventListener('keydown', (e) => { const d = { ArrowUp: 'f', ArrowDown: 'b', ArrowLeft: 'l', ArrowRight: 'r' }[e.key]; if (d) { e.preventDefault(); walk(d); } });
    $('.lm-noclip', stage).onclick = (e) => {
      e.currentTarget.hidden = true; s.lv = 1; s.steps = 0; s.rm = 1;
      view.classList.add('lm-clip'); k.tone(900, 0.8, 'sawtooth', 0.03, 40);
      k.after(700, () => { $('.lm-lv', stage).textContent = '1'; walk('f'); drawWiki(); view.focus(); });
      k.act('noclip', 2, 'noclipped out of level 0 into level 1');
    };
    const add = () => {
      const inp = $('.lm-in', stage), t = inp.value.trim(); if (!t) return;
      LM_WIKI[s.lv].push([k.handle, t]); inp.value = ''; drawWiki();
      k.act('write', 2, 'added a line to the level ' + s.lv + ' entry: “' + t + '”');
    };
    $('.lm-add', stage).onclick = add;
    $('.lm-in', stage).addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    drawWiki();
  } };

  /* ---------------- horror: broadcast_07, a tape whose alerts contradict and whose transcript changes on rewind ---------------- */
  const HR = [
    ['THIS IS A TEST OF THE REGIONAL BROADCAST SYSTEM.', 'THIS IS NOT A TEST OF THE REGIONAL BROADCAST SYSTEM.', 'THIS WAS A TEST.'],
    ['RESIDENTS ARE ADVISED TO REMAIN INDOORS.', 'RESIDENTS ARE ADVISED TO GO OUTSIDE AND WAIT.', 'THERE ARE NO RESIDENTS IN YOUR AREA.'],
    ['DO NOT LOOK AT THE SKY TONIGHT.', 'THE SKY IS NORMAL TONIGHT.', 'YOU HAVE ALREADY LOOKED.'],
    ['COUNT THE PEOPLE IN YOUR HOME.', 'COUNT THEM AGAIN.', 'THE NUMBER SHOULD BE THE SAME.'],
    ['IF YOU HEAR YOUR NAME FROM ANOTHER ROOM, DO NOT ANSWER.', 'IF YOU HEAR YOUR NAME, ANSWER. IT IS ONLY US.', 'NOBODY CALLED YOUR NAME.'],
    ['THIS BROADCAST WILL NOT REPEAT.', 'THIS BROADCAST WILL REPEAT.', 'THIS BROADCAST HAS REPEATED {p} TIMES.'],
    ['END OF MESSAGE. STAY TUNED.', 'END OF MESSAGE. PLEASE STOP RECORDING.', 'END OF MESSAGE.'],
  ];
  const HR_HID = ['a second clock in the corner reads 03:13.', 'the station ID is upside down for one frame.', 'the weather map shows a town that is not on the map.', 'someone is standing at the edge of the frame. next frame: no one.', 'the caption bar reads your city, misspelled.', 'the channel number is 08, not 07.', 'the tape label, in handwriting: “do not tape over”.'];
  P.horror = { w: 560, html: (h) => `
    <div class="hr-tv">
      <div class="hr-scr hr-bars" aria-hidden="true"><i class="hr-trk"></i><i class="hr-noise"></i>
        <span class="hr-osd">STOP</span><span class="hr-sp">SP</span>
        <div class="hr-card"><small>REGIONAL INFORMATION SERVICE · BROADCAST 07</small><p class="hr-msg"></p></div>
        <span class="hr-hid"></span><span class="hr-time">00:00:00</span><span class="hr-ch">CH 07</span>
      </div>
      <div class="hr-deck"><b>VCR</b><button data-v="rew">◀◀ REW</button><button data-v="play">▶ PLAY</button><button data-v="ff">FF ▶▶</button><span class="hr-pass">pass 1</span></div>
    </div>
    <p class="hr-live" aria-live="polite">insert tape. press play.</p>
    <div class="hr-tr"><h4>TRANSCRIPT · broadcast_07 (community-made · unreliable)</h4><ol></ol></div>
    ${h.note('analog horror is fiction made to look like found footage, public-service films and emergency broadcasts. fans watch frame by frame for hidden details. the official look is what makes it unsettling.')}`,
  run(stage, k) {
    const s = { pos: -1, pass: 0, playing: false, heard: [], found: new Set() };
    const scr = $('.hr-scr', stage), msg = $('.hr-msg', stage), osd = $('.hr-osd', stage), live = $('.hr-live', stage), ol = $('.hr-tr ol', stage), play = $('[data-v="play"]', stage);
    const ts = (i) => '00:00:' + String(4 + i * 12).padStart(2, '0');
    const line = (i, p) => HR[i][Math.min(p, 2)].replace('{p}', s.pass + 1);
    const show = () => {
      scr.classList.toggle('hr-bars', s.pos < 0); scr.classList.toggle('hr-paused', !s.playing && s.pos >= 0);
      msg.textContent = s.pos >= 0 ? line(s.pos, s.pass) : '';
      $('.hr-time', stage).textContent = s.pos >= 0 ? ts(s.pos) : '00:00:00';
      osd.textContent = s.playing ? '▶ PLAY' : s.pos >= 0 ? '❚❚ PAUSE' : 'STOP';
      play.textContent = s.playing ? '❚❚ PAUSE' : '▶ PLAY';
      $('.hr-hid', stage).textContent = !s.playing && s.pos >= 0 ? '▸ frame ' + ts(s.pos) + ': ' + HR_HID[s.pos] : '';
      $('.hr-pass', stage).textContent = 'pass ' + (s.pass + 1);
      ol.innerHTML = s.heard.map((x) => { const now = line(x, s.pass), was = s.pass ? line(x, s.pass - 1) : now; return '<li><em>' + ts(x) + '</em> ' + (was !== now ? '<s>' + k.esc(was) + '</s> ' : '') + k.esc(now) + '</li>'; }).join('');
    };
    const step = () => {
      if (s.pos >= HR.length - 1) { s.playing = false; live.textContent = 'end of tape.'; show(); return; }
      s.pos++; if (!s.heard.includes(s.pos)) s.heard.push(s.pos);
      k.tone(1000, 0.12, 'sine', 0.02); live.textContent = line(s.pos, s.pass); show();
    };
    play.onclick = () => {
      s.playing = !s.playing;
      if (s.playing) {
        if (s.pos < 0) { k.tone(853, 0.7, 'sine', 0.02); k.tone(960, 0.7, 'sine', 0.02); k.act('play', 0.5, 'played the broadcast_07 tape'); }
        if (s.pos >= HR.length - 1) s.playing = false; else step();
      } else if (s.pos >= 0 && !s.found.has(s.pos)) {
        s.found.add(s.pos); k.act('inspect', 1, 'paused broadcast_07 at ' + ts(s.pos) + ' and found: ' + HR_HID[s.pos]);
        live.textContent = 'paused. look closely: ' + HR_HID[s.pos];
      }
      show();
    };
    $('[data-v="ff"]', stage).onclick = () => { k.tone(1600, 0.15, 'square', 0.01, 2400); step(); };
    $('[data-v="rew"]', stage).onclick = () => {
      if (s.pos < 0) return;
      s.playing = false; s.pos = -1; s.pass++; scr.classList.add('hr-rew');
      k.tone(1400, 0.6, 'sawtooth', 0.012, 300); k.after(600, () => scr.classList.remove('hr-rew'));
      k.act('rewind', 1, 'rewound broadcast_07 (pass ' + (s.pass + 1) + ') and the transcript changed');
      live.textContent = 'rewound. the transcript has been corrected.'; show();
    };
    k.every(2800, () => { if (s.playing) step(); });
    show();
  } };

  /* ---------------- deepfried: meme_rotator, actually fry an image and grow its family tree ---------------- */
  const DF_EMO = ['😂', '💯', '🔥', '👌', '😳', '🅱️', '‼️', '👀'];
  const DF_OPS = { sat: 'saturate', con: 'contrast', jpg: 'jpeg crunch', noise: 'noise', emo: 'emoji', eye: 'laser eyes' };
  P.deepfried = { w: 560, html: (h) => `
    <div class="df-top"><b>meme_rotator</b><span class="df-lvl" aria-live="polite">fry level 0</span></div>
    <div class="df-main">
      <div class="df-pan"><canvas class="df-cv" width="240" height="240" role="img" aria-label="the meme being edited"></canvas><small class="df-by"></small></div>
      <div class="df-tools">
        <div class="df-ops">${Object.keys(DF_OPS).map((o) => `<button data-op="${o}">${DF_OPS[o]}</button>`).join('')}</div>
        <div class="df-caprow"><label class="df-lbl" for="df-in">add a caption layer</label><input id="df-in" class="df-in" maxlength="28" placeholder="WHEN THE"><button class="df-cap">add</button></div>
        <button class="df-post">⟳ REPOST AS NEW GENERATION</button>
      </div>
    </div>
    <div class="df-tree"><h4>family tree <small>(pick any generation to edit from it)</small></h4><ul class="df-root"></ul></div>
    ${h.note('deep-frying is a set of edits: over-saturation, contrast, repeated jpeg compression, emoji and lens-flare "laser eyes". each repost adds a layer, so the image carries its own history.')}`,
  run(stage, k) {
    const cv = $('.df-cv', stage), cx = cv.getContext('2d', { willReadFrequently: true }), N = 240;
    const nodes = []; let cur = null, ops = [], q = Promise.resolve();
    const font = (px) => px + 'px Impact, Anton, "Arial Black", sans-serif';
    const cap = (t, y) => { cx.font = font(28); cx.textAlign = 'center'; cx.lineWidth = 5; cx.strokeStyle = '#000'; cx.fillStyle = '#fff'; cx.strokeText(t.toUpperCase(), N / 2, y, N - 14); cx.fillText(t.toUpperCase(), N / 2, y, N - 14); };
    const base = () => {
      const g = cx.createLinearGradient(0, 0, 0, N); g.addColorStop(0, '#9fd3ff'); g.addColorStop(1, '#ffe7a0'); cx.fillStyle = g; cx.fillRect(0, 0, N, N);
      cx.font = '120px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('😐', N / 2, 128);
      cx.textBaseline = 'alphabetic'; cap('when the fridge', 36); cap('hums at 3am', 228);
    };
    const pix = (fn) => { const d = cx.getImageData(0, 0, N, N), a = d.data; for (let i = 0; i < a.length; i += 4) fn(a, i); cx.putImageData(d, 0, 0); };
    const load = (url) => new Promise((res) => { const im = new Image(); im.onload = () => { cx.drawImage(im, 0, 0, N, N); res(); }; im.src = url; });
    const OP = {
      sat: () => pix((a, i) => { const m = (a[i] + a[i + 1] + a[i + 2]) / 3; for (let c = 0; c < 3; c++) a[i + c] = m + (a[i + c] - m) * 1.9; }),
      con: () => pix((a, i) => { for (let c = 0; c < 3; c++) a[i + c] = (a[i + c] - 128) * 1.5 + 128; }),
      noise: () => pix((a, i) => { const n = (Math.random() - 0.5) * 70; for (let c = 0; c < 3; c++) a[i + c] += n; }),
      jpg: () => load(cv.toDataURL('image/jpeg', 0.04 + Math.random() * 0.05)),
      emo: () => { cx.save(); cx.translate(20 + Math.random() * 200, 30 + Math.random() * 180); cx.rotate(Math.random() - 0.5); cx.font = (24 + Math.random() * 40) + 'px "Noto Color Emoji", sans-serif'; cx.textAlign = 'center'; cx.fillText(rnd(DF_EMO), 0, 0); cx.restore(); },
      eye: () => { [[98, 112], [142, 112]].forEach(([x, y]) => { const g = cx.createRadialGradient(x, y, 0, x, y, 30); g.addColorStop(0, '#fff'); g.addColorStop(0.2, '#ff2020'); g.addColorStop(1, 'rgba(255,0,0,0)'); cx.fillStyle = g; cx.fillRect(x - 60, y - 30, 120, 60); cx.fillStyle = 'rgba(255,240,240,.9)'; cx.fillRect(x - 55, y - 1, 110, 2); cx.fillRect(x - 1, y - 22, 2, 44); }); },
    };
    const lvl = () => { $('.df-lvl', stage).textContent = 'fry level ' + ops.length + (ops.length >= 6 ? ' 🔥🔥🔥' : ops.length >= 3 ? ' 🔥' : ''); };
    const doOp = (o) => (q = q.then(() => OP[o]()).then(() => { ops.push(o); lvl(); }));
    const post = (by) => { const n = { id: nodes.length, parent: cur ? cur.id : null, gen: cur ? cur.gen + 1 : 0, by, ops: ops.slice(), url: cv.toDataURL('image/png') }; nodes.push(n); cur = n; ops = []; lvl(); tree(); return n; };
    const tree = () => {
      const li = (n) => `<li><button class="df-node${n === cur ? ' df-cur' : ''}" data-id="${n.id}" aria-pressed="${n === cur}"><img src="${n.url}" alt=""><span>gen ${n.gen} · ${k.esc(n.by)}<em>${n.ops.length ? k.esc(Array.from(new Set(n.ops.map((o) => DF_OPS[o] || o))).join(', ')) : 'the original'}</em></span></button>` +
        (nodes.some((c) => c.parent === n.id) ? '<ul>' + nodes.filter((c) => c.parent === n.id).map(li).join('') + '</ul>' : '') + '</li>';
      $('.df-root', stage).innerHTML = nodes.filter((n) => n.parent == null).map(li).join('');
      $('.df-by', stage).textContent = 'editing from gen ' + cur.gen + ' (' + cur.by + ')';
      $$('.df-node', stage).forEach((b) => { b.onclick = () => { const n = nodes[+b.dataset.id]; q = q.then(() => load(n.url)).then(() => { const was = cur; cur = n; ops = []; lvl(); tree(); if (was !== n) k.act('branch', 1, 'picked up generation ' + n.gen + ' of the meme to edit it'); }); }; });
    };
    base(); post('original poster (unknown)');
    ['sat', 'jpg'].forEach(doOp); q = q.then(() => post('reposter_88'));
    ['emo', 'con', 'jpg'].forEach(doOp); q = q.then(() => post('fry_cook_2017'));
    $$('[data-op]', stage).forEach((b) => { b.onclick = () => { k.tone(140 + Math.random() * 120, 0.18, 'sawtooth', 0.05, 60); doOp(b.dataset.op); }; });
    const addCap = () => { const inp = $('.df-in', stage), t = inp.value.trim(); if (!t) return; inp.value = ''; q = q.then(() => { cx.textBaseline = 'alphabetic'; cap(t, 40 + Math.random() * 170); ops.push('caption'); lvl(); }); k.act('caption', 1, 'captioned the meme “' + t + '”'); };
    $('.df-cap', stage).onclick = addCap;
    $('.df-in', stage).addEventListener('keydown', (e) => { if (e.key === 'Enter') addCap(); });
    $('.df-post', stage).onclick = () => {
      q = q.then(() => {
        if (!ops.length) { $('.df-lvl', stage).textContent = 'fry it first. a repost needs an edit.'; return; }
        const n = ops.length; const g = post(k.handle);
        k.act('fry', 1, 'deep-fried the meme to level ' + n + ' (' + Array.from(new Set(g.ops.map((o) => DF_OPS[o] || o))).join(', ') + ')');
        k.act('repost', 1.5, 'reposted it as generation ' + g.gen + ' of the family tree');
        [196, 147].forEach((f, i) => k.after(i * 90, () => k.tone(f, 0.15, 'square', 0.04)));
      });
    };
  } };

  /* ---------------- carpets: carpet.world, identify a floor, then add your own to the atlas ---------------- */
  const CW_DYE = ['#1E6D69', '#54476D', '#C5B69A', '#29353B', '#8E3B46'];
  const CW_PAT = {
    dots: (g, i, a, s) => `radial-gradient(circle,${i} 0 ${s * 0.12}px,transparent ${s * 0.12 + 1}px) 0 0/${s}px ${s}px,radial-gradient(circle,${a} 0 ${s * 0.07}px,transparent ${s * 0.07 + 1}px) ${s / 2}px ${s / 2}px/${s}px ${s}px,${g}`,
    diamond: (g, i, a, s) => `radial-gradient(circle,${a} 0 2px,transparent 3px) 0 0/${s}px ${s}px,linear-gradient(135deg,${i} 25%,transparent 25%) ${-s / 2}px 0/${s}px ${s}px,linear-gradient(225deg,${i} 25%,transparent 25%) ${-s / 2}px 0/${s}px ${s}px,linear-gradient(315deg,${i} 25%,transparent 25%) 0 0/${s}px ${s}px,linear-gradient(45deg,${i} 25%,transparent 25%) 0 0/${s}px ${s}px,${g}`,
    confetti: (g, i, a, s) => `radial-gradient(circle at 20% 30%,${i} 0 3px,transparent 4px) 0 0/${s}px ${s}px,radial-gradient(circle at 70% 65%,${a} 0 2.5px,transparent 3.5px) 0 0/${s}px ${s}px,radial-gradient(circle at 45% 85%,${i} 0 1.5px,transparent 2.5px) 0 0/${s * 0.7}px ${s * 0.7}px,radial-gradient(circle at 80% 15%,${a} 0 2px,transparent 3px) 0 0/${s * 1.3}px ${s * 1.3}px,${g}`,
    runway: (g, i, a, s) => `radial-gradient(circle,${a} 0 2px,transparent 3px) 0 0/${s / 2}px ${s / 2}px,repeating-linear-gradient(60deg,transparent 0 ${s * 0.9}px,${i} ${s * 0.9}px ${s}px),repeating-linear-gradient(-30deg,transparent 0 ${s * 1.4}px,${a} ${s * 1.4}px ${s * 1.4 + 3}px),${g}`,
    wave: (g, i, a, s) => `repeating-radial-gradient(circle at 0 100%,transparent 0 ${s * 0.3}px,${i} ${s * 0.3}px ${s * 0.38}px,transparent ${s * 0.38}px ${s * 0.5}px,${a} ${s * 0.5}px ${s * 0.54}px,transparent ${s * 0.54}px ${s * 0.7}px) 0 0/${s}px ${s}px,${g}`,
  };
  const CW_SPEC = [
    ['runway', 0, 1, 2, 'Kettle Valley Regional · Concourse C', 'teal ground, lines like runways seen from the tower. everyone photographs their shoes on it.', 'tray_table_up'],
    ['confetti', 1, 4, 0, 'Saint Ambrose Field · Gate 9', 'purple confetti from the nineties. replaced once; people asked for it back.', 'jetlag_jo'],
    ['diamond', 3, 2, 0, 'North Fennick Intl. · Pier D', 'charcoal diamonds. hides coffee, suitcases and decades.', 'gate_lurker'],
    ['dots', 2, 3, 1, 'Cape Orrin · Arrivals Hall', 'sand with dark dots. the first thing you see after customs.', 'carry_on_only'],
    ['wave', 0, 2, 4, 'Lindqvist Intl. · Link Corridor', 'waves in a corridor nowhere near the sea.', 'layover_lou'],
  ];
  const cwBg = (m, g, i, a, s) => CW_PAT[m](CW_DYE[g], CW_DYE[i], CW_DYE[a], s || 28);
  P.carpets = { w: 580, html: (h) => `
    <header class="cw-head"><span class="cw-pin" aria-hidden="true">📍</span><div><h3>carpet.world</h3><p>a community atlas of airport floors</p></div><em class="cw-score">0 IDs</em></header>
    <section class="cw-id"><h4>IDENTIFY THIS FLOOR</h4>
      <div class="cw-spec" role="img" aria-label="a carpet specimen photo, with a pair of shoes at the bottom"><span class="cw-shoes" aria-hidden="true"><i>👟</i><i>👟</i></span><b class="cw-tag">CW-112</b></div>
      <div class="cw-opts" role="group" aria-label="where is it?"></div>
      <p class="cw-live" aria-live="polite">where was this photo taken? (feet included, as is tradition.)</p>
      <button class="cw-next">next floor →</button></section>
    <section class="cw-make"><h4>SUBMIT A FLOOR</h4>
      <div class="cw-mk"><div class="cw-prev" aria-hidden="true"></div>
        <div class="cw-ctl"><div class="cw-row"><span>motif</span>${Object.keys(CW_PAT).map((m) => `<button class="cw-b" data-m="${m}">${m}</button>`).join('')}</div>
          <div class="cw-row"><span>ground</span>${CW_DYE.map((d, i) => `<button class="cw-dye" data-g="${i}" style="--d:${d}" aria-label="dye ${d}"></button>`).join('')}</div>
          <label class="cw-row"><span>where</span><input class="cw-in" maxlength="40" placeholder="airport, gate or concourse"></label>
          <button class="cw-sub">submit to the atlas</button></div></div></section>
    <section class="cw-atlas"><h4>THE ATLAS</h4><div class="cw-grid"></div></section>
    ${h.note('airport-carpet fans photograph, compare and swap identifications of terminal floors, often with their own shoes in the frame. the airports and patterns on this page are invented; the practice is real.')}`,
  run(stage, k) {
    const s = { i: 0, ids: 0, answered: false, m: 'dots', g: 0 }, live = $('.cw-live', stage);
    const atlas = CW_SPEC.slice(0, 3).map((x) => ({ bg: cwBg(x[0], x[1], x[2], x[3]), where: x[4], by: x[6] }));
    const drawAtlas = () => { $('.cw-grid', stage).innerHTML = atlas.map((x) => `<figure><i style="background:${x.bg}"></i><figcaption><b>${k.esc(x.where)}</b><small>by ${k.esc(x.by)}</small></figcaption></figure>`).join(''); };
    const spec = () => {
      const x = CW_SPEC[s.i]; s.answered = false;
      $('.cw-spec', stage).style.background = cwBg(x[0], x[1], x[2], x[3], 34);
      $('.cw-tag', stage).textContent = 'CW-' + (112 + s.i * 37);
      const opts = [x[4]].concat(CW_SPEC.filter((y) => y !== x).sort(() => Math.random() - 0.5).slice(0, 2).map((y) => y[4])).sort(() => Math.random() - 0.5);
      $('.cw-opts', stage).innerHTML = opts.map((o) => `<button class="cw-opt">${k.esc(o)}</button>`).join('');
      $$('.cw-opt', stage).forEach((b) => { b.onclick = () => guess(b, x); });
      live.textContent = 'where was this photo taken? (feet included, as is tradition.)';
    };
    const guess = (b, x) => {
      if (s.answered) return; s.answered = true;
      const right = b.textContent === x[4];
      $$('.cw-opt', stage).forEach((o) => { o.disabled = true; if (o.textContent === x[4]) o.classList.add('cw-ok'); });
      if (!right) b.classList.add('cw-no');
      if (right) { s.ids++; $('.cw-score', stage).textContent = s.ids + (s.ids === 1 ? ' ID' : ' IDs'); }
      k.tone(right ? 660 : 220, 0.25, 'sine', 0.04); if (right) k.after(120, () => k.tone(880, 0.3, 'sine', 0.04));
      live.textContent = (right ? 'yes: ' : 'not quite. it’s ') + x[4] + '. “' + x[5] + '” (first posted by ' + x[6] + ')';
      k.act('identify', 1, 'identified a carpet as ' + b.textContent + (right ? ' (right)' : ' (it was ' + x[4] + ')'));
      if (!atlas.some((a) => a.where === x[4])) { atlas.push({ bg: cwBg(x[0], x[1], x[2], x[3]), where: x[4], by: x[6] }); drawAtlas(); }
    };
    $('.cw-next', stage).onclick = () => { s.i = (s.i + 1) % CW_SPEC.length; spec(); $('.cw-opt', stage).focus(); };
    const prev = () => {
      $('.cw-prev', stage).style.background = cwBg(s.m, s.g, (s.g + 2) % 5, (s.g + 4) % 5);
      $$('.cw-b', stage).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === s.m)));
      $$('.cw-dye', stage).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.g === s.g)));
    };
    $$('.cw-b', stage).forEach((b) => { b.onclick = () => { s.m = b.dataset.m; k.tone(500, 0.06, 'sine', 0.03); prev(); }; });
    $$('.cw-dye', stage).forEach((b) => { b.onclick = () => { s.g = +b.dataset.g; k.tone(400, 0.06, 'sine', 0.03); prev(); }; });
    $('.cw-sub', stage).onclick = () => {
      const inp = $('.cw-in', stage), where = inp.value.trim();
      if (!where) { live.textContent = 'every floor in the atlas needs a where. which gate?'; inp.focus(); return; }
      atlas.unshift({ bg: cwBg(s.m, s.g, (s.g + 2) % 5, (s.g + 4) % 5), where, by: k.handle }); inp.value = ''; drawAtlas();
      k.tone(523, 0.12, 'sine', 0.04); k.after(110, () => k.tone(784, 0.2, 'sine', 0.04));
      k.act('submit', 2, 'submitted a ' + s.m + ' carpet from “' + where + '” to the atlas');
      live.textContent = 'added to the atlas. someone, somewhere, will look down and recognise it.';
    };
    spec(); prev(); drawAtlas();
  } };
})();
