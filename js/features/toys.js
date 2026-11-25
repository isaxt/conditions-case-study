/* =====================================================================
   toys.js — five things that are on the computer for no reason except that somebody liked them.
   All invented (no real products, characters or sounds). Read DEV-API.md.

   1. THE DESKTOP PET   an egg in 1996 that hatches when petted, a child in 1999, a sulky teen in 2004, grown by
                        2006–2010. It wanders the bottom edge; click it to feed it, pet it or name it.
        in 2014:        it is gone. In its place: a push notice, "your pet misses you! open the app", which leads to
                        a "streak lost / buy treats" screen that goes nowhere. 2016–2024: only a badge count, growing.
        in 2030:        "it kept your pet. want it back?" If the visitor says yes it returns, old, with its name.

   2. SCREENSAVERS      after 45 idle seconds: stars (1993), flying shapes (1996), a bouncing THIRD SPACE logo that
                        sometimes hits the corner exactly (1999), photo bubbles of your own drawings (2004–2008),
                        a soft clock (2010).
        in 2014:        there are no screensavers. Idleness is asked about: "Are you still there?" /
                        "Are you still watching?" with a countdown and a continue button.
        in 2030:        the screen dims and says "take your time. nothing is waiting."

   3. THE SOUND BOARD   each era's noises, synthesised here: a modem handshake, a startup chime, a door opening
                        when a friend signs on, a poke, a polyphonic ringtone. Each with what it meant.
        in 2014:        a settings list of notification sounds: a three-note ping, a "sent" whoosh, a buzz.
        in 2030:        one soft tone, and "silence (default)".

   4. THE CHAIN LETTER  1999: "send this turnip to 7 friends". Forward it or delete it; it does not matter.
                        2008: it is back as Fwd: Fwd: Re: Fwd: with everyone's signatures.
        in 2016/2024:   a screenshot of itself shared as a post with reaction counts; then an AI summary:
                        "this message may be a chain letter. Summary: a chain letter."
        in 2030:        returned to the visitor as a record with its whole route. Theirs to keep or to stop.

   5. BUG GARDEN        a real grid game (reveal, flag, first click safe, timer). 9×9 with 10 bugs in 1993–1999,
                        8×8 with 7 and hints in 2004–2008, 6×6 with 4 and "share your score" in 2010.
        in 2014:        5×5 with 2, a daily streak, "watch an ad for an extra life". 2024: 4×4 with 1 and an
                        "◇ auto-solve" button that plays it for you and congratulates you.
        in 2030:        the game returns at whatever size the visitor picks: "as hard as you like."

   Kept (this browser only, via TSKit.state, erased with the journey): the pet's name and how it was treated;
   what was done with the chain letter; best times per era. Sound: the board plays only on its own buttons,
   quietly (master gain 0.07), never by itself, and stops when its window closes.
   ===================================================================== */
(function () {
  'use strict';
  const K = window.TSKit; if (!K) return;
  const $ = (s, r) => (r || document).querySelector(s), esc = K.esc, yr = K.yr, era = K.era;
  const body = (id) => $('#' + id + ' .app-body');
  const receipt = (a, n) => { if (typeof logReceipt === 'function') logReceipt(a, n); };
  const mk = (tag, id, cls) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; return e; };
  const SIM = 'Simulation: nothing is charged, played or sent. The button this copies leads to a payment sheet; this one leads nowhere.';

  /* =============================== 1. the desktop pet =============================== */
  const P = K.state('toys.pet', { name: '', fed: 0, pets: 0, hatched: 0, seen: {}, back: null, simSaid: 0 });
  // 16×16 sprites. k outline, b body, l belly, w eye-white, o eye, p pink, g green, y petal, e shell, s speckle, r grey
  const SPR = {
    egg: ['................', '................', '......kkkk......', '....kkeeeekk....', '...keeeeseeek...', '...keeeeeeeek...', '..keeseeeeeeek..', '..keeeeeeeseek..', '..keeeeeeeeeek..', '..kekeeekeeekk..', '..kkekekekekek..', '..keeekeeekeek..', '..keeseeeeeeek..', '...keeeeeesek...', '....kkeeeekk....', '......kkkk......'],
    baby: ['................', '................', '................', '........gg......', '.......gg.......', '.......g........', '.....kkkkkk.....', '....kbbbbbbk....', '...kbbbbbbbbk...', '...kbwobbwobk...', '...kboobboobk...', '...kpbbkkbbpk...', '...kbbbbbbbbk...', '....kbbbbbbk....', '.....kkkkkk.....', '................'],
    child: ['.......g.gg.....', '......gg.g......', '.......gg.......', '....kkkkkkkk....', '...kbbbbbbbbk...', '..kbbbbbbbbbbk..', '..kbwobbbbwobk..', '..kboobbbboobk..', '..kpbbbkkbbbpk..', '..kbbbllllbbbk..', '..kbbllllllbbk..', '..kbbllllllbbk..', '...kbbllllbbk...', '...kkkkkkkkkk...', '...kbbk..kbbk...', '...kkkk..kkkk...'],
    teen: ['.....gg.g.......', '....ggggg.......', '....kkkkkkk.....', '...kgggbbbbk....', '..rkggbbbbbkr...', '..rkgbbbkkbkr...', '..rkgbbbwobkr...', '...kbbbbbbbk....', '...kbbbkkbbk....', '...kbbbbbbbk....', '...kbllllbbk....', '...kbllllbbk....', '...kbllllbbk....', '...kkkkkkkkk....', '...kbbk.kbbk....', '...kkkk.kkkk....'],
    grown: ['......y.y.......', '.....yypyy......', '......y.y.......', '.......g........', '...kkkkkkkkkk...', '..kbbbbbbbbbbk..', '.kbbbbbbbbbbbbk.', '.kbbwobbbbwobbk.', '.kbboobbbboobbk.', '.kbpbbkbbkbbpbk.', '.kbbbbbkkbbbbbk.', '.kbbblllllbbbbk.', '.kbbllllllllbbk.', '..kbbllllllbbk..', '..kkkkkkkkkkkk..', '..kkkk....kkkk..'],
    elder: ['.....w.w.w......', '......www.......', '.....w.g.w......', '.......g........', '...kkkkkkkkkk...', '..kbbbbbbbbbbk..', '.kbkkkkbbkkkkbk.', '.kkkwokkkkwokkk.', '.kbkookbbkookbk.', '.kbkkkkbbkkkkbk.', '.kbpbbbkkbbbpbk.', '.kbbblllllbbbbk.', '.kbbllllllllbbk.', '..kbbllllllbbk..', '..kkkkkkkkkkkk..', '..kkkk....kkkk..'],
  };
  const LEAF = ['................', '........gg......', '.......gg.......', '.......g........']; // a grown pet nobody fed has a leaf, not a flower
  const PAL = { k: '#2b2140', w: '#fff', o: '#2b2140', p: '#ff7fa8', g: '#4fae4a', y: '#ffd84a', e: '#fff6dc', s: '#d9b98a', r: '#8d8aa0' };
  const BODY = { egg: ['#fff6dc', '#fff'], baby: ['#ffc7a1', '#ffe6d3'], child: ['#ffab6e', '#ffe0c2'], teen: ['#a98bf5', '#d9ccff'], grown: ['#ff9a55', '#ffe0c2'], elder: ['#d9a98c', '#f1dccd'] };
  const FOOD = { 1996: '🍪', 1999: '🍕', 2004: '🍜', 2006: '🧁', 2008: '🌮', 2010: '🥑', 2030: '🍵' };
  const petName = () => P.data.name || 'your pet';
  const care = () => P.data.fed + P.data.pets;
  function stage() { const y = yr(); return y === 1996 ? (P.data.hatched ? 'baby' : 'egg') : y === 1999 ? 'child' : y === 2004 ? 'teen' : y >= 2006 && y <= 2010 ? 'grown' : y === 2030 ? 'elder' : null; }
  function sprite(st) {
    let rows = SPR[st]; if (st === 'grown' && care() < 3) rows = LEAF.concat(rows.slice(4));
    const col = (c) => c === 'b' ? BODY[st][0] : c === 'l' ? BODY[st][1] : PAL[c]; let out = '';
    rows.forEach((row, y) => { for (let x = 0; x < 16;) { const c = row[x]; let n = 1; while (x + n < 16 && row[x + n] === c) n++; // run-length: one rect per run
      if (c !== '.') { const eye = c === 'o' || c === 'w'; if (eye) out += '<rect x="' + x + '" y="' + y + '" width="' + n + '" height="1" fill="' + BODY[st][0] + '"/>';
        out += '<rect' + (eye ? ' class="ty-eye"' : '') + ' x="' + x + '" y="' + y + '" width="' + n + '" height="1" fill="' + col(c) + '"/>'; } x += n; } });
    return '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + out + '</svg>';
  }
  let petEl = null, petMenu = null, petTimer = null;
  const lane = () => innerWidth < 700 ? [150, Math.max(160, innerWidth - 110)] : [215, 345]; // right of the bottom-left buttons, left of where windows open, under the icons
  function bubble(t, ms) { if (!petEl) return; const f = $('.ty-pet-fx', petEl); f.textContent = t; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); clearTimeout(bubble.t); bubble.t = setTimeout(() => f.classList.remove('on'), ms || 2600); }
  function petDraw() {
    const st = stage(); if (!petEl || !st) return;
    petEl.className = 'ty-pet ty-st-' + st + (care() >= 3 ? ' ty-loved' : ''); petEl.dataset.stage = st;
    const b = $('.ty-pet-b', petEl); b.innerHTML = sprite(st); b.setAttribute('aria-label', (st === 'egg' ? 'an egg' : petName() + ', a small creature') + '. open its menu');
  }
  function petMake() {
    petEl = mk('div', 'tyPet'); petEl.innerHTML = '<span class="ty-pet-fx" aria-hidden="true"></span><button type="button" class="ty-pet-b" aria-haspopup="true" aria-expanded="false"></button>';
    petEl.style.left = lane()[1] - 40 + 'px'; document.body.appendChild(petEl); petDraw();
    $('.ty-pet-b', petEl).onclick = () => petMenu ? menuClose() : menuOpen();
    petTimer = setInterval(() => { // wander a little: pick a spot in the lane, walk there, face the way it is going
      if (!petEl || petMenu || K.reduced() || stage() === 'egg' || Math.random() < .35) return;
      const [a, z] = lane(), now = parseFloat(petEl.style.left) || a, to = Math.round(a + Math.random() * (z - a));
      petEl.classList.toggle('ty-left', to < now); petEl.classList.add('ty-walk'); petEl.style.left = to + 'px'; setTimeout(() => petEl && petEl.classList.remove('ty-walk'), 2400);
    }, 3800);
    const y = era(), st = stage(), first = !P.data.seen[y]; P.data.seen[y] = 1;
    if (yr() === 1999 && !P.data.hatched) { P.data.hatched = 1; if (first) setTimeout(() => bubble('(it hatched while you were away.)', 4200), 900); }
    else if (first && st !== 'egg' && st !== 'baby') setTimeout(() => bubble({ child: 'it grew!', teen: 'it is a teenager now. sorry.', grown: care() >= 3 ? 'all grown. it kept the flower.' : 'all grown.', elder: 'oh. hello again.' }[st] || '', 4200), 900);
    P.save();
  }
  function petGone() { menuClose(); clearInterval(petTimer); if (petEl) petEl.remove(); petEl = null; }
  function menuClose() { if (!petMenu) return; petMenu.remove(); petMenu = null; const b = petEl && $('.ty-pet-b', petEl); if (b) b.setAttribute('aria-expanded', 'false'); }
  function menuOpen() {
    const st = stage(), egg = st === 'egg'; petMenu = mk('div', 'tyPetMenu'); petMenu.setAttribute('role', 'group'); petMenu.setAttribute('aria-label', 'pet menu');
    petMenu.innerHTML = '<p class="ty-pm-name"><b>' + esc(egg ? 'an egg' : petName()) + '</b> <i>' + ({ egg: 'warm. it ticks.', baby: 'brand new', child: 'small and busy', teen: 'do not look at it', grown: 'grown', elder: 'old, and glad' }[st]) + '</i></p>'
      + '<p class="ty-pm-say" aria-live="polite">' + (egg ? 'somebody left this here.' : 'fed ' + P.data.fed + ' · petted ' + P.data.pets) + '</p>'
      + '<div class="ty-pm-btns"><button type="button" data-p="feed">feed ' + (FOOD[yr()] || '🍪') + '</button><button type="button" data-p="pet">pet ✋</button><button type="button" data-p="name">name…</button></div>'
      + '<form hidden><label for="tyPetName">its name</label><input id="tyPetName" maxlength="14" autocomplete="off" value="' + esc(P.data.name) + '"><button type="submit">ok</button><small>kept in this browser only.</small></form>';
    document.body.appendChild(petMenu);
    const r = petEl.getBoundingClientRect(); petMenu.style.left = Math.max(8, Math.min(innerWidth - petMenu.offsetWidth - 8, r.left - 50)) + 'px'; petMenu.style.bottom = (innerHeight - r.top + 8) + 'px';
    $('.ty-pet-b', petEl).setAttribute('aria-expanded', 'true'); $('button', petMenu).focus();
    const say = (t) => { $('.ty-pm-say', petMenu).textContent = t; };
    petMenu.onclick = (e) => { const a = e.target.closest('[data-p]'); if (!a) return; petAct(a.dataset.p, say); };
    petMenu.onkeydown = (e) => { if (e.key === 'Escape') { menuClose(); $('.ty-pet-b', petEl).focus(); } };
    $('form', petMenu).onsubmit = (e) => { e.preventDefault(); const v = $('#tyPetName').value.trim().slice(0, 14); if (!v) return; petCall(v); say('it is ' + v + ' now. it seems to agree.'); $('.ty-pm-name b', petMenu).textContent = stage() === 'egg' ? 'an egg (' + v + ')' : v; $('form', petMenu).hidden = true; };
  }
  function petCall(name) { P.data.name = String(name).slice(0, 14); P.save(); petDraw(); }
  function petAct(what, say) {
    say = say || (() => {}); const st = stage(); if (!st) return;
    if (what === 'name') { const f = $('form', petMenu); f.hidden = false; $('#tyPetName').focus(); return; }
    if (st === 'egg') {
      if (what === 'feed') { say('you offer the egg a biscuit. the egg declines.'); bubble('…'); return; }
      P.data.pets++; P.save(); petEl.classList.remove('ty-hop'); void petEl.offsetWidth; petEl.classList.add('ty-hop');
      if (P.data.pets >= 3) { P.data.hatched = 1; P.save(); petDraw(); bubble('!!', 3000); say('it hatched. it is looking at you like you are the first thing it has ever seen. you are.'); K.tone(880, .25, 'square', .04, 1320); }
      else { say(['tap. something tapped back.', 'a crack. keep going.'][P.data.pets - 1] || 'tap.'); bubble('tk'); }
      return;
    }
    if (what === 'feed') { P.data.fed++; bubble((FOOD[yr()] || '🍪') + ' nom'); say(st === 'teen' ? 'it ate it without looking up. (it was hungry.)' : st === 'elder' ? 'it takes its time over the tea.' : 'gone in one bite. fed ' + P.data.fed + ' times.'); K.tone(520, .12, 'square', .04, 700); }
    else { P.data.pets++; bubble('♥'); say(st === 'teen' ? 'ugh. (it liked that.)' : st === 'elder' ? 'it leans into your hand. it remembers.' : 'it wiggles. petted ' + P.data.pets + ' times.'); K.tone(700, .18, 'sine', .04, 990); }
    P.save(); petEl.classList.remove('ty-hop'); void petEl.offsetWidth; petEl.classList.add('ty-hop'); petDraw();
  }
  /* 2014–2024: the pet is an app that wants you back. 2030: it is offered back. */
  const APP = 'Critterloop';
  let noteEl = null, badgeT = null;
  function noteGone() { clearInterval(badgeT); if (noteEl) noteEl.remove(); noteEl = null; }
  function petNote() {
    noteGone(); const y = yr(); if (y < 2014) return; const nm = P.data.name;
    noteEl = mk('div', 'tyNote', 'ty-note ty-note-' + y);
    if (y === 2014) {
      noteEl.innerHTML = '<button type="button" class="ty-push" data-n="open"><span class="ty-appico" aria-hidden="true">🐾<em>1</em></span><span><small>' + APP + ' · now</small><b>' + esc(nm ? nm + ' misses you!' : 'Your pet misses you!') + ' 🥺</b><span>Open the app to save your streak.</span></span></button><button type="button" class="ty-x" data-n="x" aria-label="dismiss notification">×</button>';
    } else if (y <= 2024) {
      let n = y === 2016 ? 27 : 140; const lab = () => (n > 99 ? '99+' : String(n));
      noteEl.innerHTML = '<button type="button" class="ty-badge" data-n="open" aria-label="' + APP + ', ' + lab() + ' notifications"><span class="ty-appico" aria-hidden="true">🐾<em>' + lab() + '</em></span></button>';
      badgeT = setInterval(() => { n++; const b = noteEl && $('.ty-badge', noteEl); if (!b) return; $('em', b).textContent = lab(); b.setAttribute('aria-label', APP + ', ' + lab() + ' notifications'); }, 9000);
    } else if (P.data.back === true) { noteGone(); if (!petEl) petMake(); return; }
    else if (P.data.back === false) noteEl.innerHTML = '<button type="button" class="ty-rest" data-n="back">' + esc(petName()) + ' is resting. wake it?</button>';
    else noteEl.innerHTML = '<p><b>it kept your pet.</b> ' + esc(nm ? 'want ' + nm + ' back?' : 'want it back?') + '</p><div><button type="button" data-n="back">yes, bring it back</button><button type="button" data-n="rest">not now</button></div>';
    document.body.appendChild(noteEl);
    noteEl.onclick = (e) => { const a = e.target.closest('[data-n]'); if (!a) return; const n = a.dataset.n;
      if (n === 'x') noteGone(); else if (n === 'open') petApp();
      else if (n === 'back') { P.data.back = true; P.save(); noteGone(); petMake(); $('.ty-pet-b', petEl).focus(); bubble((nm ? nm + '. yes. that is me. ' : 'oh. hello again. ') + (care() ? 'you fed me ' + P.data.fed + ' times, long ago.' : 'you came back.'), 6000); }
      else { P.data.back = false; P.save(); petNote(); } };
  }
  function petApp() { // the "streak lost" screen. It goes nowhere, and says so once.
    K.win('win-pet', APP, 340, ''); K.title('win-pet', APP); const nm = P.data.name || 'Your pet';
    body('win-pet').innerHTML = '<div class="ty-app"><p class="ty-app-ico" aria-hidden="true">💔</p><h2>Streak lost</h2><p>' + esc(nm) + ' waited for you. Your <b>' + (care() || 3) + '-day streak</b> has ended.</p>'
      + '<button type="button" class="ty-cta" data-a="buy">Restore streak · 50 treats</button><div class="ty-packs"><button type="button" data-a="buy"><b>80</b> treats<span>0.99</span></button><button type="button" data-a="buy" class="best"><em>BEST VALUE</em><b>500</b> treats<span>4.99</span></button><button type="button" data-a="buy"><b>1,200</b> treats<span>9.99</span></button></div>'
      + '<button type="button" class="ty-no" data-a="no">No thanks, let ' + esc(P.data.name || 'my pet') + ' be sad</button><p class="ty-sim" role="status"></p></div>';
    body('win-pet').onclick = (e) => { const a = e.target.closest('[data-a]'); if (!a) return; if (a.dataset.a === 'no') { K.hide('win-pet'); return; }
      $('#win-pet .ty-sim').textContent = SIM; if (!P.data.simSaid) { P.data.simSaid = 1; P.save(); receipt('opened ' + APP + ' from a notification', 're-engagement · streak-loss offer shown'); } };
    K.show('win-pet');
  }
  function petEra() { const st = stage(); K.hide('win-pet'); petGone(); noteGone(); if (yr() >= 2014) petNote(); else if (st) petMake(); }

  /* =============================== 2. screensavers =============================== */
  const IDLE_MS = 45000; // how long nothing has to happen
  const S = K.state('toys.saver', { corners: 0 });
  let sv = null, svStop = null, idleT = null, svAt = 0, svXY = null;
  const svKind = () => { const y = yr(); return y < 1993 ? null : y === 1993 ? 'stars' : y === 1996 ? 'shapes' : y === 1999 ? 'logo' : y <= 2008 ? 'photos' : y === 2010 ? 'clock' : y <= 2024 ? 'still' : 'dim'; };
  const svBlocked = () => { const m = $('#jyModal'); return (m && !m.hidden && m.offsetParent !== null) || !!$('[id^=era].show') || document.hidden || !svKind(); };
  function saverOff() { if (!sv) return; if (svStop) svStop(); svStop = null; sv.remove(); sv = null; arm(); }
  function saverOn() {
    saverOff(); const kind = svKind(); if (!kind) return null; clearTimeout(idleT);
    sv = mk('div', 'tySaver', 'ty-sv ty-sv-' + kind); sv.dataset.kind = kind; sv.setAttribute('role', 'dialog'); sv.setAttribute('aria-label', kind === 'still' ? 'idle check' : 'screensaver'); svAt = Date.now(); svXY = null;
    const hint = '<p class="ty-sv-hint" role="status">' + (kind === 'dim' ? '' : 'screensaver. press any key or move the mouse to come back.') + '</p>';
    if (kind === 'stars' || kind === 'shapes' || kind === 'logo') { sv.innerHTML = '<canvas></canvas>' + hint; document.body.appendChild(sv); svStop = svCanvas(kind, $('canvas', sv)); }
    else if (kind === 'photos') {
      const mine = (window.Journey && Journey.mine ? Journey.mine() : []).filter((m) => m.img), em = ['🌅', '🐶', '🎂', '🏖️', '🌸', '🎸', '🧁', '🚲'];
      sv.innerHTML = Array.from({ length: 8 }, (_, i) => { const m = mine[i % (mine.length || 1)]; return '<i class="ty-bub" style="--x:' + (6 + (i * 37) % 84) + '%;--d:' + (i * -2.7) + 's;--s:' + (90 + (i * 53) % 90) + 'px;' + (m ? 'background-image:url(' + m.img + ')' : '--h:' + (i * 47) % 360) + '">' + (m ? '' : em[i]) + '</i>'; }).join('')
        + '<p class="ty-sv-cap">' + (mine.length ? 'your drawings, floating' : 'my pictures') + '</p>' + hint; document.body.appendChild(sv);
    } else if (kind === 'clock') {
      sv.innerHTML = '<div class="ty-clock"><b></b><span></span></div>' + hint; document.body.appendChild(sv);
      const tick = () => { const d = new Date(); $('b', sv).textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); $('span', sv).textContent = d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }); };
      tick(); const t = setInterval(tick, 1000); svStop = () => clearInterval(t);
    } else if (kind === 'still') { // 2014–2024: no screensaver. A question, a countdown, a button.
      const y = yr(), watch = y >= 2016; let n = 30;
      sv.innerHTML = '<div class="ty-still"><h2>' + (watch ? 'Are you still watching?' : 'Are you still there?') + '</h2><p role="status">' + (watch ? 'Playback will pause in ' : 'For your security, you will be signed out in ') + '<b>0:30</b>.</p><button type="button">' + (watch ? 'Continue watching' : 'Stay signed in') + '</button></div>';
      document.body.appendChild(sv); const btn = $('button', sv); btn.onclick = saverOff; btn.focus();
      const t = setInterval(() => { n--; if (n > 0) $('b', sv).textContent = '0:' + String(n).padStart(2, '0'); else { clearInterval(t); $('p', sv).textContent = watch ? 'Paused due to inactivity.' : 'Your session is paused.'; } }, 1000); svStop = () => clearInterval(t);
    } else { sv.innerHTML = '<p class="ty-dim" role="status">take your time. nothing is waiting.</p>'; document.body.appendChild(sv); }
    return kind;
  }
  /* the three canvas savers. Each returns a stop function. With reduced motion: one still frame. */
  function svCanvas(kind, c) {
    const g = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight, still = K.reduced(); let raf = 0, last = performance.now();
    const rnd = (a, b) => a + Math.random() * (b - a), HUE = ['#ff4fa3', '#ffd400', '#3ddc84', '#4fc3ff', '#ff7a1a', '#b388ff'];
    const stars = Array.from({ length: kind === 'stars' ? 260 : 90 }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(.05, 1) }));
    const shapes = kind === 'shapes' ? Array.from({ length: 16 }, (_, i) => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(.2, 1), r: rnd(0, 6), k: i % 4, c: HUE[i % 6] })) : [];
    g.font = 'italic 900 ' + Math.max(28, Math.min(64, W / 14)) + 'px "Arial Black", Arial, sans-serif'; const lw = g.measureText('THIRD SPACE').width + 24, lh = Math.max(44, Math.min(90, W / 10));
    const L = { x: rnd(0, W - lw), y: rnd(0, H - lh), vx: .16, vy: .11, c: 0, n: 0, tx: -1, ty: -2, party: 0, bits: [] };
    function shape(s, px, py, size) { g.save(); g.translate(px, py); g.rotate(s.r); g.fillStyle = s.c; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath();
      if (s.k === 0) g.rect(-size, -size, size * 2, size * 2); else if (s.k === 1) g.arc(0, 0, size, 0, 7); else if (s.k === 2) { g.moveTo(0, -size * 1.2); g.lineTo(size * 1.1, size); g.lineTo(-size * 1.1, size); g.closePath(); }
      else for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, q = i % 2 ? size * .5 : size * 1.2; g.lineTo(Math.sin(a) * q, -Math.cos(a) * q); }
      g.fill(); g.stroke(); g.restore(); }
    function frame(now) {
      const dt = Math.min(50, now - last); last = now; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      if (kind !== 'logo') {
        stars.forEach((s) => { s.z -= dt * .00035; if (s.z < .02) { s.z = 1; s.x = rnd(-1, 1); s.y = rnd(-1, 1); } const px = W / 2 + s.x / s.z * W * .5, py = H / 2 + s.y / s.z * H * .5, sz = Math.max(1, (1 - s.z) * 3); g.fillStyle = 'rgba(255,255,255,' + (1 - s.z) + ')'; g.fillRect(px, py, sz, sz); });
        shapes.sort((a, b) => b.z - a.z).forEach((s) => { s.z -= dt * .00022; s.r += dt * .0012; if (s.z < .06) { s.z = 1; s.x = rnd(-1, 1); s.y = rnd(-1, 1); } shape(s, W / 2 + s.x / s.z * W * .32, H / 2 + s.y / s.z * H * .32, 9 / s.z); });
      } else {
        L.x += L.vx * dt; L.y += L.vy * dt; let hit = 0;
        if (L.x <= 0 || L.x >= W - lw) { L.x = Math.max(0, Math.min(W - lw, L.x)); L.vx *= -1; L.tx = now; hit = 1; }
        if (L.y <= 0 || L.y >= H - lh) { L.y = Math.max(0, Math.min(H - lh, L.y)); L.vy *= -1; L.ty = now; hit = 1; }
        if (hit) { L.c = (L.c + 1) % 6; L.n++;
          if (Math.abs(L.tx - L.ty) < 40) { L.party = now + 2600; L.vy = Math.sign(L.vy) * .11; S.data.corners++; S.save(); L.bits = Array.from({ length: 60 }, () => ({ x: L.x + lw / 2, y: L.y + lh / 2, vx: rnd(-.5, .5), vy: rnd(-.6, .2), c: HUE[Math.floor(rnd(0, 6))] })); L.tx = -1; L.ty = -999; }
          else if (L.n % 5 === 0) { const t = (L.vx > 0 ? W - lw - L.x : L.x) / Math.abs(L.vx), vy = (L.vy > 0 ? H - lh - L.y : L.y) / t; if (t > 0 && vy > .04 && vy < .3) L.vy = Math.sign(L.vy) * vy; } // every fifth bounce: aim for a corner
        }
        g.fillStyle = HUE[L.c]; g.textBaseline = 'middle'; g.fillText('THIRD SPACE', L.x + 12, L.y + lh / 2); g.strokeStyle = HUE[L.c]; g.lineWidth = 3; g.strokeRect(L.x + 2, L.y + 2, lw - 4, lh - 4);
        if (now < L.party) { L.bits.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; b.vy += dt * .0012; g.fillStyle = b.c; g.fillRect(b.x, b.y, 7, 7); });
          g.save(); g.font = '700 22px "Courier New", monospace'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('◇ IT HIT THE CORNER ◇  (' + S.data.corners + (S.data.corners === 1 ? ' time)' : ' times)'), W / 2, H / 2); g.restore(); }
      }
      if (!still) raf = requestAnimationFrame(frame);
    }
    if (still && kind === 'logo') { L.x = (W - lw) / 2; L.y = (H - lh) / 2; L.vx = L.vy = 0; }
    frame(last); return () => cancelAnimationFrame(raf);
  }
  function arm() { clearTimeout(idleT); idleT = setTimeout(() => { if (svBlocked() || sv) arm(); else saverOn(); }, IDLE_MS); }
  function onInput(e) {
    if (!sv) { arm(); return; }
    const kind = sv.dataset.kind, key = e.type === 'keydown';
    if (kind === 'still') { if (key && !/^(Tab|Shift|Control|Alt|Meta)$/.test(e.key)) saverOff(); return; } // a question needs an answer: a key, or its button
    if (!key) { if (Date.now() - svAt < 400) return; if (e.type === 'pointermove') { if (!svXY) { svXY = [e.clientX, e.clientY]; return; } if (Math.abs(e.clientX - svXY[0]) + Math.abs(e.clientY - svXY[1]) < 8) return; } }
    saverOff();
  }
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => addEventListener(ev, onInput, { capture: true, passive: true }));

  /* =============================== 3. the sound board =============================== */
  const GAIN = 0.07; let AC = null, master = null, live = [], sndT = null;
  function audio() { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = GAIN; master.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); return AC.currentTime + .03; }
  function o(t, f, d, type, v, to) { const os = AC.createOscillator(), g = AC.createGain(); os.type = type || 'sine'; os.frequency.setValueAtTime(f, t); if (to) os.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v == null ? .5 : v, t + Math.min(.01, d / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + d); os.connect(g).connect(master); os.start(t); os.stop(t + d + .03); live.push(os); }
  function nz(t, d, v, f, q, type) { const n = Math.ceil(AC.sampleRate * d), buf = AC.createBuffer(1, n, AC.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = buf; fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f, t); fl.Q.value = q || 1; if (Array.isArray(arguments[6])) fl.frequency.exponentialRampToValueAtTime(arguments[6][0], t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(fl).connect(g).connect(master); s.start(t); live.push(s); }
  const seq = (t, notes, step, len, type, v) => { notes.forEach((f, i) => { if (f) o(t + i * step, f, len, type, v); }); return notes.length * step + len; };
  // every sound: [id, glyph, name, what it meant, play(t) -> seconds]
  const SND = {
    old: [
      ['modem', '☎', 'modem handshake', 'two machines agreeing to talk. it meant the phone line was yours for the evening.', (t) => {
        [[697, 1209], [770, 1336], [852, 1477], [697, 1336], [941, 1336], [770, 1209], [852, 1336]].forEach((p, i) => { o(t + i * .1, p[0], .08, 'sine', .3); o(t + i * .1, p[1], .08, 'sine', .3); });
        o(t + .9, 2100, .7, 'sine', .35); seq(t + 1.7, [1200, 2400, 1200, 2400, 980, 1650, 1180, 1850, 980, 1650], .07, .07, 'square', .18); o(t + 2.4, 1100, .5, 'sawtooth', .16, 2600); o(t + 2.9, 2600, .3, 'sawtooth', .14, 600);
        nz(t + 3.2, 1.5, .5, 1800, .6); o(t + 3.2, 1400, 1.5, 'square', .06, 1500); return 4.8; }],
      ['chime', '☼', 'startup chime', 'the computer was awake, and pleased about it.', (t) => { [293.7, 370, 440, 587.3, 659.3].forEach((f, i) => o(t + i * .09, f, 2.2 - i * .1, i % 2 ? 'triangle' : 'sine', .26)); return 2.3; }],
      ['msg', '✉', 'you have a message', 'two notes. it meant someone, somewhere, had thought of you.', (t) => { o(t, 659.3, .22, 'triangle', .45); o(t + .2, 987.8, .5, 'triangle', .45); return .8; }],
      ['disk', '💾', 'disk drive', 'the sound of waiting for something you were about to own.', (t) => { for (let i = 0; i < 14; i++) { const x = t + i * .11 + (i % 3) * .02; nz(x, .05, .5, 300 + (i % 4) * 90, 3); o(x, 82 + (i % 2) * 12, .06, 'square', .2); } nz(t + 1.6, .5, .25, 520, 8); return 2.1; }],
    ],
    mid: [
      ['ding', '💬', 'instant message', 'it meant a small window had opened with a friend inside.', (t) => { o(t, 1318.5, .16, 'sine', .45); o(t + .11, 1760, .5, 'sine', .4); o(t + .11, 880, .5, 'triangle', .15); return .7; }],
      ['door', '🚪', 'door opens, door closes', 'a friend signed on. later, a friend signed off. you heard both.', (t) => { o(t, 180, .5, 'sawtooth', .16, 430); nz(t + .5, .12, .5, 240, 2, 'lowpass'); o(t + 1.2, 420, .35, 'sawtooth', .14, 170); nz(t + 1.55, .2, .7, 160, 1, 'lowpass'); o(t + 1.55, 70, .2, 'sine', .5); return 1.9; }],
      ['poke', '👉', 'a poke', 'it meant nothing. that was what it was for.', (t) => { o(t, 260, .14, 'sine', .5, 720); o(t + .14, 720, .3, 'sine', .4, 300); return .5; }],
      ['snap', '📷', 'camera shutter', 'a phone pretending to be a camera, so everyone knew a picture happened.', (t) => { nz(t, .04, .8, 3200, 1, 'highpass'); nz(t + .09, .07, .7, 1800, 2); o(t + .09, 140, .05, 'square', .2); return .3; }],
      ['ring', '📱', 'polyphonic ringtone', 'you chose it. people knew it was your phone from across the room.', (t) => { const m = [659, 784, 880, 784, 659, 0, 988, 880, 784, 880, 1047, 0, 880, 784, 659, 587]; seq(t, m, .14, .13, 'square', .2); seq(t, m.map((f, i) => i % 4 === 0 && f ? f / 2 : 0), .14, .5, 'triangle', .28); seq(t, m.map((f) => f ? f * 1.5 : 0), .14, .1, 'square', .07); return 2.4; }],
    ],
    now: [
      ['ping', '🔔', 'Notification', 'It meant an app wanted you back. Sometimes a person was behind it.', (t) => { [987.8, 1318.5, 1174.7].forEach((f, i) => { o(t + i * .13, f, .5, 'sine', .4); o(t + i * .13, f * 2, .12, 'sine', .08); }); return .9; }],
      ['sent', '➤', 'Sent', 'It meant the message had left. Not that it had arrived, or been read.', (t) => { nz(t, .38, .6, 500, 1.4, 'bandpass', [3600]); return .45; }],
      ['buzz', '📳', 'Vibrate', 'It meant the same as the ping, but only you were supposed to know.', (t) => { [0, .32].forEach((d) => { o(t + d, 150, .24, 'square', .28); o(t + d, 152, .24, 'sawtooth', .2); }); return .6; }],
    ],
    calm: [
      ['tone', '○', 'one soft tone', 'it means something you asked to be told about has happened. that is all it can mean.', (t) => { const os = AC.createOscillator(), g = AC.createGain(); os.frequency.value = 396; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.45, t + .5); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); os.connect(g).connect(master); os.start(t); os.stop(t + 2.7); live.push(os); o(t + .1, 594, 2.2, 'sine', .1); return 2.7; }],
      ['hush', '·', 'silence (default)', 'this is the default. nothing here asks for you unless you asked it to.', () => 0.6],
    ],
  };
  const sndBand = () => { const y = yr(); return y <= 1999 ? 'old' : y <= 2010 ? 'mid' : y <= 2024 ? 'now' : 'calm'; };
  function sndStop() { clearTimeout(sndT); live.forEach((n) => { try { n.stop(); n.disconnect(); } catch (e) { /* already ended */ } }); live = []; const st = $('#win-sounds .ty-sb-st'); if (st) st.textContent = ''; document.querySelectorAll('#win-sounds .playing').forEach((b) => b.classList.remove('playing')); }
  function sndPlay(id) {
    const s = SND[sndBand()].find((x) => x[0] === id); if (!s) return false; sndStop(); let d = .6;
    try { d = s[4](audio()); } catch (e) { /* no audio here: the board still shows what it would have played */ }
    const st = $('#win-sounds .ty-sb-st'), b = $('#win-sounds [data-s="' + id + '"]'); if (st) st.textContent = (id === 'hush' ? '(nothing is playing. on purpose.)' : 'playing: ' + s[2]); if (b) b.classList.add('playing');
    sndT = setTimeout(() => { if (st) st.textContent = ''; if (b) b.classList.remove('playing'); live = []; }, d * 1000 + 150); return true;
  }
  function sndDraw() {
    const band = sndBand(), now = band === 'now', ttl = { old: 'NOISEBOX 1.0', mid: 'my sounds ♪', now: 'Sounds & Haptics', calm: 'sounds' }[band];
    K.title('win-sounds', now ? 'Sounds & Haptics' : 'sounds');
    body('win-sounds').innerHTML = '<div class="ty-sb ty-sb-' + band + '"><h2><span aria-hidden="true">' + (band === 'old' ? '🔊 ' : '') + '</span>' + ttl + '<i class="ty-eq" aria-hidden="true"><b></b><b></b><b></b><b></b></i></h2><ul>'
      + SND[band].map((s) => '<li><button type="button" data-s="' + s[0] + '"><span aria-hidden="true">' + s[1] + '</span> ' + esc(s[2]) + '</button><p>' + esc(s[3]) + '</p></li>').join('') + '</ul>'
      + '<p class="ty-sb-st" role="status"></p><p class="ty-sb-note">' + (now ? 'Sounds play quietly when you press a row, whatever the site’s sound switch says. Nothing plays automatically. Closing this window stops playback.' : 'this is a sound app: a button plays its noise, quietly, even if the site’s sound switch is off. nothing plays by itself. closing the window stops it.') + ' <button type="button" data-s="!stop">stop</button></p></div>';
  }
  function sndOpen() {
    const w = K.win('win-sounds', 'sounds', 380, '');
    if (!w.dataset.ty) { w.dataset.ty = 1; w.addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; if (b.dataset.s === '!stop') sndStop(); else sndPlay(b.dataset.s); });
      new MutationObserver(() => { if (!K.isOpen('win-sounds')) sndStop(); }).observe(w, { attributes: true, attributeFilter: ['class', 'style'] }); } // closing or minimising the window stops the sound
    sndDraw(); K.show('win-sounds');
  }

  /* =============================== 4. the chain letter =============================== */
  const C = K.state('toys.chain', { act: null, n: 0, opened: {}, kept: null, liked: 0 });
  const FRIENDS = ['pip_the_brave', 'moonbeam77', 'Gus from work', 'aunt Tildy', 'xX_frogboy_Xx', 'L. Okonkwo-Reyes', 'the whole choir list', 'dj_sprocket', 'your own second address', 'Mr. Abernathy-Quill (dentist)', 'wendeline', 'cousin Bartek'];
  const CH_ERAS = { 1999: 'you have 1 new message ✉', 2008: 'Inbox (1) · Fwd: Fwd: Re: Fwd: …', 2016: 'Suggested for you · 1 new post', 2024: '◇ 1 message summarised', 2030: 'something was returned to you ✉' };
  const TURNIP = '<pre aria-hidden="true">      \\|/\n     .-"-.\n    /  o o\\\n    \\  ~  /\n     \'._.\'\n       \'</pre>';
  const LETTER = '<p>!!! DO NOT DELETE !!! THIS IS <b>THE LUCKY TURNIP</b> !!!</p>' + TURNIP + '<p>this turnip has been travelling the world since <b>1987</b>. it has been round the globe <b>9 times</b> (once by mistake).</p><p>a man in Lower Wobbleton DELETED it and his toast landed butter side down for <b>a week</b>. a girl sent it to 7 friends and the next day she found a coin. (it was 5p. but STILL.)</p><p>send this to <b>7 friends</b> in the next <b>7 minutes</b> and something mildly nice will happen to you on thursday. break the chain and your socks will never match again.</p><p>this is NOT a joke. the turnip KNOWS.</p>';
  const did = () => C.data.act === 'fwd' ? 'you forwarded this to ' + C.data.n + (C.data.n === 1 ? ' person' : ' people') + ' in 1999' : C.data.act === 'del' ? 'you deleted this in 1999' : 'you never opened this in 1999';
  let mailEl = null;
  function chChip() {
    if (mailEl) mailEl.remove(); mailEl = null; const y = era(); if (!CH_ERAS[y]) return;
    mailEl = mk('button', 'tyMail', 'ty-mail ty-mail-' + y + (C.data.opened[y] ? ' read' : '')); mailEl.type = 'button';
    mailEl.textContent = C.data.opened[y] ? (yr() <= 2008 || y === '2030' ? '✉ the turnip letter' : 'The Lucky Turnip') : CH_ERAS[y]; mailEl.onclick = chOpen; document.body.appendChild(mailEl);
  }
  function chDraw() {
    const y = yr(), b = body('win-chain'), n = C.data.n, fw = C.data.act === 'fwd'; let h = '';
    if (y === 1999) {
      K.title('win-chain', 'mail: 1 new message');
      h = '<div class="ty-ch ty-ch-99"><dl><dt>From:</dt><dd>Dottie Marblewick &lt;dmarble@plumnet.example&gt;</dd><dt>To:</dt><dd>you, and 46 others</dd><dt>Subject:</dt><dd><b>FWD: FWD: !!! THE LUCKY TURNIP !!! (do NOT delete)</b></dd></dl><div class="ty-ch-body">' + LETTER + '</div>'
        + (C.data.act ? '<p class="ty-ch-done" role="status">' + (fw ? 'sent. ' + n + ' turnip' + (n === 1 ? ' is' : 's are') + ' now in transit. nothing can stop this.' : 'deleted. (check your socks.)') + '</p>'
          : '<fieldset><legend>forward to how many friends?</legend><input type="range" id="tyChN" min="1" max="12" value="7" aria-label="how many friends"><output id="tyChOut" for="tyChN"></output><div class="ty-ch-btns"><button type="button" data-c="fwd">forward ➜</button><button type="button" data-c="del">delete</button></div></fieldset>')
        + '<p class="ty-ch-kept">what you do with the turnip is remembered in this browser only. the friends are invented; nothing is sent.</p></div>';
    } else if (y === 2008) {
      K.title('win-chain', 'Inbox: Fwd: Fwd: Re: Fwd: FW: Fwd: fwd: THE LUCKY TURNIP');
      const sigs = FRIENDS.slice(0, fw ? Math.max(2, Math.min(n, 6)) : 2);
      h = '<div class="ty-ch ty-ch-08"><h2>Fwd: Fwd: Re: Fwd: FW: Fwd: fwd: RE: THE LUCKY TURNIP (it works!!)</h2><p class="ty-ch-from"><b>aunt Tildy</b> to you and 212 others · <a href="#" data-c="noop">show details</a></p>'
        + '<p class="ty-ch-me">' + esc(did()) + '. ' + (fw ? 'it went round and came back.' : 'it did not notice. it came back.') + '</p><p>omg this actually works, i found my other glove!! sending to everyone ♥</p>'
        + '<blockquote><p>&gt; passing this on just in case. you never know. — Gus</p><blockquote><p>&gt;&gt; I do not usually send these but</p><blockquote><div class="ty-ch-body">' + LETTER + '</div></blockquote></blockquote></blockquote>'
        + '<div class="ty-ch-sigs">' + sigs.map((s, i) => '<p>-- <br>' + esc(s) + ['<br><i>~*~ dance like nobody is watching ~*~</i>', '<br>sent from my pocket telephone, excuse typos', '<br><small>This e-mail is confidential and intended for the addressee only. If you are not the addressee, the turnip already knows.</small>', '<br>♪ currently listening to: the same song again ♪', '<br>Please consider the environment before printing this turnip.', '<br>xoxo'][i] + '</p>').join('') + '</div></div>';
    } else if (y === 2016) {
      K.title('win-chain', 'Post');
      h = '<div class="ty-ch ty-ch-16"><p class="ty-ch-why">Suggested for you · ' + (fw ? 'because ' + esc(did()) : 'based on your contacts') + '</p><div class="ty-ch-who"><span aria-hidden="true">🥲</span><p><b>remember when??</b><small>Sponsored-adjacent page · 2 hrs</small></p></div><p>who else got THIS in their inbox 😂😂 tag someone who would have forwarded it</p>'
        + '<div class="ty-ch-shot"><div class="ty-ch-body">' + LETTER + '</div><i>screenshot · 14% battery</i></div>'
        + '<p class="ty-ch-counts">😂❤️😮 <b id="tyChLikes">' + (14208 + C.data.liked).toLocaleString('en-US') + '</b> · 2.1K comments · 9.8K shares</p><div class="ty-ch-btns"><button type="button" data-c="like" aria-pressed="' + !!C.data.liked + '">👍 Like</button><button type="button" data-c="noop">💬 Comment</button><button type="button" data-c="noop">↗ Share</button></div>'
        + '<p class="ty-ch-me">' + esc(did()) + '. Nobody forwards it now. It is shared as a picture of itself.</p></div>';
    } else if (y === 2024) {
      K.title('win-chain', 'Mail');
      h = '<div class="ty-ch ty-ch-24"><h2>The Lucky Turnip</h2><div class="ty-ch-ai"><b>◇ Summary</b><p>This message may be a chain letter. Summary: a chain letter.</p><small>Generated by AI. Check important info.</small></div>'
        + '<p class="ty-ch-me">Why am I seeing this? Based on your activity: ' + esc(did()) + '.</p><div class="ty-ch-btns"><button type="button" data-c="noop">Thanks for sharing!</button><button type="button" data-c="noop">Haha</button><button type="button" data-c="noop">Unsubscribe</button></div>'
        + '<details><summary>Show original message</summary><div class="ty-ch-body">' + LETTER + '</div></details><p class="ty-ch-done" role="status"></p></div>';
    } else {
      K.title('win-chain', 'returned to you');
      const route = [['1987', 'the turnip sets out (it says).'], ['1999', did() + '.' + (fw ? '' : ' it kept going anyway.')], ['2008', 'it came back as Fwd: Fwd: Re: Fwd:, carrying everyone’s signatures.'], ['2016', 'a screenshot of it was shared as a post. 14,208 reactions. nobody read it.'], ['2024', 'a machine summarised it: “a chain letter.”'], ['2030', 'it is returned to you, with its route. it is yours.']];
      h = '<div class="ty-ch ty-ch-30"><h2>the lucky turnip</h2><p>a silly letter, and everywhere it went.</p><ol>' + route.map((r) => '<li><b>' + r[0] + '</b> ' + esc(r[1]) + '</li>').join('') + '</ol><details><summary>read it again</summary><div class="ty-ch-body">' + LETTER + '</div></details>'
        + '<p class="ty-ch-done" role="status">' + (C.data.kept === true ? 'kept. it is with your things now.' : C.data.kept === false ? 'the chain stops here. thank you for your service, turnip.' : '') + '</p>' + (C.data.kept == null ? '<div class="ty-ch-btns"><button type="button" data-c="keep">keep it</button><button type="button" data-c="stop">let it finally stop</button></div>' : '') + '</div>';
    }
    b.innerHTML = h; const r = $('#tyChN', b); if (r) { const out = () => { const v = +r.value; $('#tyChOut', b).textContent = v + ': ' + FRIENDS.slice(0, v).join(', '); }; r.oninput = out; out(); }
  }
  function chAct(a) {
    if (a === 'fwd' || a === 'del') { if (C.data.act || yr() !== 1999) return; const r = $('#tyChN'); C.data.act = a; C.data.n = a === 'fwd' ? Math.max(1, Math.min(12, +(r && r.value) || 7)) : 0; }
    else if (a === 'like') { C.data.liked = C.data.liked ? 0 : 1; receipt((C.data.liked ? 'reacted to' : 'removed a reaction from') + ' a suggested post', 'interest signal: nostalgia · chain letters'); }
    else if (a === 'keep') { C.data.kept = true; try { Journey.keepMine({ id: 'Y-chain-1', title: 'the lucky turnip', line: 'a chain letter from 1999. ' + did() + '.', ctx: 'it came back to you in 2030 with its whole route.' }); } catch (e) { /* no journey here */ } }
    else if (a === 'stop') C.data.kept = false;
    else { const d = $('#win-chain .ty-ch-done'); if (d && yr() === 2024) d.textContent = 'Simulation: no reply was sent.'; return; }
    C.save(); chDraw(); chChip();
  }
  function chOpen() {
    if (!CH_ERAS[era()]) return; const w = K.win('win-chain', 'mail', 430, '');
    if (!w.dataset.ty) { w.dataset.ty = 1; w.addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; e.preventDefault(); chAct(b.dataset.c); }); }
    C.data.opened[era()] = 1; C.save(); chDraw(); chChip(); K.show('win-chain');
  }

  /* =============================== 5. bug garden =============================== */
  const M = K.state('toys.mines', { best: {}, streak: 0, free: 'classic', adSaid: 0 });
  const FREE = { gentle: [6, 4], classic: [9, 10], thorny: [12, 26] };
  function mCfg() { const y = yr();
    return y <= 1999 ? { w: 9, n: 10, skin: 'm93' } : y <= 2008 ? { w: 8, n: 7, hints: 1, skin: 'm04' } : y === 2010 ? { w: 6, n: 4, share: 1, skin: 'm10' } : y <= 2016 ? { w: 5, n: 2, streak: 1, ad: 1, skin: 'm14' }
      : y === 2024 ? { w: 4, n: 1, streak: 1, auto: 1, skin: 'm14 ty-m24' } : { w: FREE[M.data.free][0], n: FREE[M.data.free][1], free: 1, skin: 'm30' }; }
  let G = null, mTick = null, mAuto = null, mLong = 0, mMsg = '';
  const mNear = (i) => { const w = G.w, x = i % w, y = (i - x) / w, out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const a = x + dx, b = y + dy; if ((dx || dy) && a >= 0 && b >= 0 && a < w && b < w) out.push(b * w + a); } return out; };
  const mTime = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  function mNew() { const c = mCfg(); clearInterval(mTick); clearInterval(mAuto); mMsg = ''; G = { w: c.w, n: c.n, cells: Array.from({ length: c.w * c.w }, () => ({ bug: 0, open: 0, flag: 0, near: 0 })), started: 0, over: 0, won: 0, secs: 0, auto: 0, hint: -1, focus: 0, era: era() }; mDraw(); }
  function mPlace(safe) { // bugs go down after the first click, never on it or beside it
    const ban = new Set([safe].concat(mNear(safe))); let left = G.n;
    while (left > 0) { const i = Math.floor(Math.random() * G.cells.length); if (ban.has(i) || G.cells[i].bug) continue; G.cells[i].bug = 1; left--; }
    G.cells.forEach((c, i) => { c.near = mNear(i).filter((j) => G.cells[j].bug).length; });
    G.started = 1; G.t0 = Date.now(); mTick = setInterval(() => { G.secs = Math.min(5999, Math.round((Date.now() - G.t0) / 1000)); const t = $('#win-mines .ty-m-time'); if (t) t.textContent = mTime(G.secs); }, 500);
  }
  function mReveal(i, quiet) {
    const c = G && G.cells[i]; if (!c || G.over || c.open || c.flag) return; if (!G.started) mPlace(i); G.hint = -1; G.focus = i;
    if (c.bug) { c.open = 1; G.over = 1; clearInterval(mTick); G.cells.forEach((x) => { if (x.bug) x.open = 1; }); K.tone(200, .3, 'sawtooth', .04, 90);
      mMsg = mCfg().streak ? 'Out of lives.' : mCfg().free ? 'a ladybird. she moves over. try again whenever.' : 'you woke a ladybird. she is not angry, just disappointed.'; mDraw(); return; }
    const stack = [i]; while (stack.length) { const j = stack.pop(), x = G.cells[j]; if (x.open || x.flag) continue; x.open = 1; if (!x.near) mNear(j).forEach((k) => { if (!G.cells[k].open && !G.cells[k].bug) stack.push(k); }); }
    if (G.cells.every((x) => x.bug || x.open)) mWin(); else if (!quiet) mDraw();
  }
  function mWin() {
    const c = mCfg(), k = c.free ? '2030-' + M.data.free : era(); G.over = G.won = 1; clearInterval(mTick); G.secs = Math.round((Date.now() - G.t0) / 1000); G.cells.forEach((x) => { if (x.bug) x.flag = 1; });
    const best = M.data.best[k], rec = !G.auto && (best == null || G.secs < best); if (rec) M.data.best[k] = G.secs; if (c.streak) M.data.streak++; M.save(); K.tone(660, .2, 'square', .04, 990);
    mMsg = G.auto ? 'Solved for you in ' + mTime(G.secs) + '! 🎉 You are in the top 3% of players today.' : c.streak ? 'Level complete! +10 coins.' + (rec ? ' New best: ' + mTime(G.secs) + '.' : '') : c.free ? 'the garden is clear. ' + mTime(G.secs) + '. nobody is counting but you.' : 'every bug found, none disturbed. ' + mTime(G.secs) + (rec ? ' — a new best!' : '.');
    mDraw();
  }
  function mFlag(i) { const c = G && G.cells[i]; if (!c || G.over || c.open) return; c.flag = c.flag ? 0 : 1; G.focus = i; mDraw(); }
  function mSolve() { // 2024: it plays itself, and then it congratulates you
    if (!G || G.over) mNew(); G.auto = 1; if (!G.started) mPlace(0);
    const todo = G.cells.map((c, i) => (!c.bug && !c.open ? i : -1)).filter((i) => i >= 0);
    const step = () => { const i = todo.shift(); if (i == null || G.over) { clearInterval(mAuto); return; } G.cells[i].flag = 0; mReveal(i); };
    if (K.reduced()) { while (todo.length && !G.over) step(); } else { clearInterval(mAuto); mAuto = setInterval(step, 140); step(); }
  }
  function mDraw() {
    const c = mCfg(), b = body('win-mines'); if (!b || !G) return; const flags = G.cells.filter((x) => x.flag).length, k = c.free ? '2030-' + M.data.free : era(), best = M.data.best[k];
    const face = G.won ? '🌻' : G.over ? '🥀' : '🌼', hadFocus = b.contains(document.activeElement) && document.activeElement.dataset.i != null;
    let h = '<div class="ty-m ty-' + c.skin + '"><div class="ty-m-head"><span class="ty-m-left" aria-label="bugs left to mark">' + String(Math.max(0, G.n - flags)).padStart(3, '0') + '</span><button type="button" class="ty-m-face" data-m="new" aria-label="new game">' + (c.streak ? 'New game' : face) + '</button><span class="ty-m-time" aria-label="time">' + mTime(G.secs) + '</span></div>'
      + '<div class="ty-m-grid" role="grid" aria-label="bug garden, ' + G.w + ' by ' + G.w + ', ' + G.n + (G.n === 1 ? ' bug' : ' bugs') + '" style="--n:' + G.w + '">';
    G.cells.forEach((x, i) => { const r = Math.floor(i / G.w) + 1, col = i % G.w + 1, t = x.open ? (x.bug ? '🐞' : x.near || '') : x.flag ? '🌷' : '';
      h += '<button type="button" role="gridcell" data-i="' + i + '" tabindex="' + (i === G.focus ? 0 : -1) + '" class="' + (x.open ? 'open n' + x.near + (x.bug ? ' bug' : '') : 'shut') + (x.flag ? ' flag' : '') + (i === G.hint ? ' hint' : '') + '" aria-label="row ' + r + ', column ' + col + ': ' + (x.open ? (x.bug ? 'a ladybird' : x.near ? x.near + ' nearby' : 'clear') : x.flag ? 'marked with a tulip' : 'long grass') + '">' + t + '</button>'; });
    h += '</div><p class="ty-m-msg" role="status">' + esc(mMsg) + '</p><div class="ty-m-tools">';
    if (c.hints) h += '<button type="button" data-m="hint">💡 hint</button>';
    if (c.share && G.won) h += '<button type="button" data-m="share">share your score</button>';
    if (c.ad && G.over && !G.won) h += '<button type="button" data-m="ad">▶ Watch an ad for an extra life</button>';
    if (c.auto) h += '<button type="button" data-m="auto" class="ty-m-auto">◇ auto-solve</button>';
    if (c.free) h += '<label>as hard as you like. <select data-m="free" aria-label="how hard">' + Object.keys(FREE).map((f) => '<option' + (f === M.data.free ? ' selected' : '') + ' value="' + f + '">' + f + ' (' + FREE[f][0] + '×' + FREE[f][0] + ', ' + FREE[f][1] + ')</option>').join('') + '</select></label>';
    h += '</div><p class="ty-m-foot">' + (c.streak ? '🔥 Daily streak: ' + M.data.streak + (M.data.streak === 1 ? ' day' : ' days') + '. Come back tomorrow to keep it.' + (best != null ? ' Best ' + mTime(best) + '.' : '')
      : (best != null ? 'best in ' + (c.free ? 'this garden' : era()) + ': ' + mTime(best) + ' (kept in this browser). ' : '') + 'click to part the grass · right-click, long-press or F plants a tulip · arrows move') + '</p></div>';
    b.innerHTML = h; if (hadFocus) { const f = $('[data-i="' + G.focus + '"]', b); if (f) f.focus(); }
  }
  function mTool(a) {
    const say = (t) => { mMsg = t; mDraw(); };
    if (a === 'new') mNew(); else if (a === 'auto') mSolve();
    else if (a === 'hint') { if (G.over) return; if (!G.started) { say('start anywhere. the first step is always safe.'); return; } const safe = G.cells.map((c, i) => (!c.bug && !c.open ? i : -1)).filter((i) => i >= 0); G.hint = safe[Math.floor(Math.random() * safe.length)]; say('psst. that one is safe.'); }
    else if (a === 'share') { receipt('shared a game score', 'bug garden · ' + mTime(G.secs) + ' · visible to friends and their friends'); say('posted to your wall: “cleared the bug garden in ' + mTime(G.secs) + '!” 2 people like this.'); }
    else if (a === 'ad') { say('Simulation: there is no ad and no extra life. The real button plays 30 seconds of video first. Press New game.'); if (!M.data.adSaid) { M.data.adSaid = 1; M.save(); receipt('asked for a rewarded ad', 'ad opportunity · game over screen'); } }
  }
  function mOpen() {
    const w = K.win('win-mines', 'bug garden', 330, '');
    if (!w.dataset.ty) { w.dataset.ty = 1;
      w.addEventListener('click', (e) => { const cell = e.target.closest('[data-i]'), t = e.target.closest('button[data-m]'); if (cell) { if (Date.now() - mLong < 500) return; mReveal(+cell.dataset.i); const f = $('#win-mines [data-i="' + G.focus + '"]'); if (f) f.focus(); } else if (t) mTool(t.dataset.m); });
      w.addEventListener('change', (e) => { if (e.target.dataset.m === 'free') { M.data.free = e.target.value; M.save(); mNew(); } });
      w.addEventListener('contextmenu', (e) => { const cell = e.target.closest('[data-i]'); if (!cell) return; e.preventDefault(); if (Date.now() - mLong > 500) mFlag(+cell.dataset.i); });
      let lp = null; w.addEventListener('pointerdown', (e) => { const cell = e.target.closest('[data-i]'); clearTimeout(lp); if (cell && e.pointerType !== 'mouse') lp = setTimeout(() => { mLong = Date.now(); mFlag(+cell.dataset.i); }, 480); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => w.addEventListener(ev, () => clearTimeout(lp)));
      w.addEventListener('keydown', (e) => { const cell = e.target.closest && e.target.closest('[data-i]'); if (!cell) return; const i = +cell.dataset.i, wd = G.w, mv = { ArrowLeft: i % wd ? -1 : 0, ArrowRight: i % wd < wd - 1 ? 1 : 0, ArrowUp: i >= wd ? -wd : 0, ArrowDown: i < wd * (wd - 1) ? wd : 0 }[e.key];
        if (mv != null) { e.preventDefault(); const n = $('#win-mines [data-i="' + (i + mv) + '"]'); if (mv && n) { cell.tabIndex = -1; n.tabIndex = 0; n.focus(); G.focus = i + mv; } }
        else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); mFlag(i); const f = $('#win-mines [data-i="' + i + '"]'); if (f) f.focus(); } });
    }
    K.title('win-mines', yr() >= 2014 && yr() <= 2024 ? 'Bug Garden' : 'bug garden'); if (!G || G.era !== era() || G.over) mNew(); else mDraw(); K.show('win-mines');
  }

  /* =============================== wiring =============================== */
  K.icon({ id: 'sounds', glyph: (y) => (y <= 1999 ? '🔊' : y <= 2010 ? '🎵' : y <= 2024 ? '🔔' : '○'), label: 'sounds', from: 1993, to: 2030, open: sndOpen });
  K.icon({ id: 'mines', glyph: (y) => (y <= 2010 ? '🐞' : y <= 2024 ? '🎮' : '🌼'), label: 'bug garden', from: 1993, to: 2030, open: mOpen });
  K.onEra(() => {
    saverOff(); sndStop(); clearInterval(mAuto); clearInterval(mTick); G = null;
    ['win-sounds', 'win-chain', 'win-mines'].forEach((id) => K.hide(id)); // each era's version is a different thing: close, and redraw when opened again
    petEra(); chChip(); arm();
  });
  P.onReset = petEra; C.onReset = chChip; // "erase journey" takes the pet and the turnip with it
  document.addEventListener('pointerdown', (e) => { if (petMenu && !petMenu.contains(e.target) && !(petEl && petEl.contains(e.target))) menuClose(); });

  window.Toys = {
    IDLE_MS,
    open(id) { ({ sounds: sndOpen, chain: chOpen, mines: mOpen, pet: petApp })[id](); },
    screensaver(on) { if (on) return saverOn(); saverOff(); return null; },
    saver: () => (sv ? sv.dataset.kind : null),
    pet: () => ({ here: !!petEl, stage: petEl ? stage() : null, name: P.data.name, fed: P.data.fed, pets: P.data.pets, back: P.data.back }),
    petDo(what, v) { if (what === 'name') petCall(v); else if (petEl) petAct(what); },
    sounds: { list: () => SND[sndBand()].map((s) => s[0]), play: sndPlay, stop: sndStop, gain: GAIN, playing: () => live.length },
    chain: { state: () => C.data, act: chAct },
    mines: { state: () => (G ? { w: G.w, n: G.n, started: G.started, over: G.over, won: G.won, auto: G.auto, secs: G.secs, cells: G.cells.map((c) => ({ bug: c.bug, open: c.open, flag: c.flag })) } : null), reveal: mReveal, flag: mFlag, reset: mNew, best: () => M.data.best },
  };
})();
