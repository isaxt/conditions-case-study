/* =====================================================================
   journey.js — the 0.7 layer: a computer you can only keep three things from.

   WHAT IT DOES
   - Every era has 2-4 explorable THINGS (js/content/eras.js). They are read-only samples, so the stacks,
     the viewer and "what you left" treat them like everything else.
   - Five times (the ANCHORS) the computer moves on. A scene asks the visitor to keep three of the things at
     risk. The rest get one of four fates: gone, flattened, gated, displaced. They never vanish silently:
     each leaves a record, and the reason is shown, until 2024, when it no longer is.
   - The era bar stays free. Going back finds a record of what was lost, never the thing itself.
   - "what it noticed" shows what a system could read from the choices (categories, seconds, number of times
     going back), next to what the visitor actually wrote.
   - 2024 shows a "suggestion" while writing a letter (a plain rule list, not a model). 2030 asks a question instead.

   WHAT IT KEEPS
   - Only in this browser, under its own key (thirdspace.journey.v1): the choices, the seconds taken, an optional
     sentence, the log of eras visited. It is shown on the "what it noticed" tab, can be exported, and is erased by
     "erase journey" and by the store's "delete everything". Nothing is sent anywhere. The arrival screen says so first.

   SWITCHES: js/content/eras.js → CFG (keep, perTransition, allowBack).
   Auto-start is off under #quick (so the older tests keep working); add #journey to switch it on.
   ===================================================================== */
(function () {
  'use strict';
  const C = window.TS_CONTENT; if (!C) return;
  const KEY = 'thirdspace.journey.v1';
  const AUTO = !/quick/.test(location.hash) || /journey/.test(location.hash);
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const now = () => new Date().toISOString();

  /* ---------------- state ---------------- */
  const blank = () => ({ v: 1, mode: 'new', passed: {}, kept: {}, lost: {}, opened: {}, unlocked: {}, why: {}, hes: {}, delegated: {}, log: [], going: [], polish: { shown: 0, accepted: 0, refused: 0 }, asks: { shown: 0, answered: 0 }, mine: [], name: '', born: null, sid: Math.random().toString(36).slice(2, 8), greeted: false, revealSeen: false });
  let mem = null;
  function load() { try { const r = localStorage.getItem(KEY); return r ? Object.assign(blank(), JSON.parse(r)) : (mem || blank()); } catch (e) { return mem || blank(); } }
  let J = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(J)); } catch (e) { mem = J; } }
  function log(what) { J.log.push({ t: now(), what }); if (J.log.length > 300) J.log.shift(); save(); }

  /* ---------------- eras and things ---------------- */
  const eraKeys = () => (typeof ERAS !== 'undefined' ? ERAS.map((e) => e.key) : []);
  const idx = (k) => eraKeys().indexOf(k);
  const eraOf = (k) => (typeof ERAS !== 'undefined' && ERAS.find((e) => e.key === k)) || { key: k, label: k, name: '' };
  const curKey = () => { const m = /era-(\w+)/.exec(document.body.className); return m ? m[1] : '1991'; };
  const ALL = [];
  Object.keys(C.THINGS).forEach((ek) => C.THINGS[ek].forEach((t) => ALL.push(Object.assign({ era: ek }, t))));
  // yours: answers you wrote and things you made in the aesthetic windows. they are things too, so they can be carried or lost.
  const mineThings = () => (J.mine || []).map((m) => ({ id: m.id, era: m.era, mine: true, kind: m.kind, theme: m.kind === 'memory' ? 'voice' : 'making', title: m.title, line: m.line, ctx: m.ctx, flat: m.flat, t: m.t, img: m.img }));
  const SHELF = 'thirdspace.shelf.v1';
  const shelf = () => { try { return JSON.parse(localStorage.getItem(SHELF)) || []; } catch (e) { return []; } };
  const leftThings = () => shelf().filter((x) => x.sid !== J.sid).map((x) => ({ id: x.id, era: x.era, left: true, kind: x.kind, theme: x.kind === 'memory' ? 'voice' : 'making', title: 'left by someone before you', line: x.line, ctx: 'someone who used this computer before you left this here, unsigned, for whoever came next.', img: x.img, poke: null }));
  const every = () => ALL.concat(mineThings(), leftThings());
  const byId = (id) => every().find((t) => t.id === id);
  const fateOf = (id) => (J.lost[id] ? J.lost[id].fate : 'here');
  const yearOf = (k) => parseInt(k, 10);
  const opaque = (k) => yearOf(k || curKey()) >= C.CFG.opaqueFrom;
  const reasonOf = (id) => { const l = J.lost[id]; if (!l) return ''; return yearOf(l.scene) >= C.CFG.opaqueFrom || !l.reason ? '' : l.reason; };
  const systemVersion = (t) => { if (t.mine) return t.flat ? 'filed as: ' + t.flat : 'filed.'; const w = (t.line + ' ' + t.ctx).replace(/\s+/g, ' ').split(' ').slice(0, 11).join(' '); return w.replace(/[,.;:]$/, '') + '…'; };

  function bodyFor(t) {
    const f = fateOf(t.id);
    if (f === 'gone') return 'not retained.';
    if (f === 'degraded') return t.line + ' [image and formatting removed]';
    if (f === 'gated') return '[behind a gate. open it in the things window to see what it asks.]';
    if (f === 'displaced') return systemVersion(t);
    return t.line + ' ' + t.ctx;
  }
  function artifact(t) {
    const f = fateOf(t.id), l = J.lost[t.id];
    return {
      id: t.id, origin: 'sample', type: 'thing', year: yearOf(t.era), title: t.title, body: bodyFor(t),
      author: { handle: 'family computer', label: 'the family computer', consent: 'anon', placeholder: true },
      fields: { ctx: f === 'here' ? t.ctx : '', kind: t.kind, theme: t.theme, fate: f, era: t.era },
      tags: [], refs: [], links: [], visibility: 'public', revisions: [], keepHistory: false, binned: false, invented: true, fate: f,
      events: [{ t: null, what: 'written for this prototype (stand-in wording)' }].concat(l ? [{ t: null, what: C.FATES[f].label + (reasonOf(t.id) ? ': ' + reasonOf(t.id) : ': no reason shown') }] : []),
    };
  }
  const baseSamples = window.TS_SAMPLES || (() => []);
  window.TS_SAMPLES = function () { return baseSamples().concat(ALL.map(artifact)); };

  /* ---------------- markup ---------------- */
  function build() {
    if ($('#win-things')) return;
    const w = document.createElement('div');
    w.className = 'window'; w.id = 'win-things'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-labelledby', 'jyTitle');
    w.style.cssText = 'width:520px; top:110px; left:280px; z-index:12;';
    w.innerHTML = '<div class="titlebar" onpointerdown="startDrag(event,\'win-things\')"><span class="ttl" id="jyTitle">things in this year</span>' +
      '<div class="winbtns"><button onclick="minimizeWindow(\'win-things\')" aria-label="minimize">_</button><button onclick="closeWindow(\'win-things\')" aria-label="close">×</button></div></div>' +
      '<div class="winbody jy-body"><div class="jy-tabs" role="tablist" aria-label="the journey"></div><div id="jyMain"></div></div>';
    document.body.appendChild(w);
    const b = document.createElement('button');
    b.id = 'jyBtn'; b.type = 'button'; b.className = 'btn-95'; b.addEventListener('click', () => openThings());
    document.body.appendChild(b);
    const a = document.createElement('div'); a.id = 'jyModal'; a.hidden = true; a.setAttribute('role', 'dialog'); a.setAttribute('aria-modal', 'true'); document.body.appendChild(a);
    if (typeof windowTitles !== 'undefined') windowTitles['win-things'] = 'things in this year';
    w.addEventListener('click', onClick); w.addEventListener('input', onInput); w.addEventListener('submit', onSubmit);
    a.addEventListener('click', onModalClick); a.addEventListener('input', onModalInput);
    label();
  }
  function label() {
    const b = $('#jyBtn'); if (!b) return;
    const k = curKey(), n = (C.THINGS[k] || []).length;
    b.textContent = '◆ things in ' + (k === '2030' ? 'the next web' : eraOf(k).label) + (n ? ' (' + n + ')' : '');
    b.hidden = !n;
    pocket();
  }

  /* ---------------- personality: objects, mote, the box, sounds ----------------
     Every thing is drawn as the kind of object it was (a page, a floppy, a polaroid, a sticky note...),
     mote narrates the transitions, and what you carry sits in a box with three slots. */
  const OBJ = {
    page: ['paper', '📄'], document: ['paper', '📜'], text: ['paper', '✍️'], directory: ['card', '📇'], list: ['card', '📋'],
    memory: ['sticky', '✎'], made: ['polaroid', '★'],
    tool: ['floppy', '💾'], idea: ['sticky', '💡'], links: ['sticky', '🔗'], ad: ['banner', '📢'], form: ['card', '🧾'],
    feed: ['tape', '📰'], video: ['tape', '📼'], control: ['key', '🔘'], forum: ['card', '💬'], photo: ['polaroid', '📷'], record: ['folder', '🗂️'],
  };
  const objOf = (t) => OBJ[t.kind] || ['card', '◆'];
  function objHTML(t, extra) {
    const [shape, glyph] = objOf(t);
    return '<span class="jy-obj o-' + shape + (t.mine ? ' mine' : '') + (extra ? ' ' + extra : '') + '" aria-hidden="true"><i>' + glyph + '</i><b>' + esc(t.title) + '</b><em>' + esc(eraOf(t.era).label) + '</em></span>';
  }
  const MOTE = '<svg class="jy-mote-svg" viewBox="0 0 16 16" width="48" height="48" shape-rendering="crispEdges" aria-hidden="true">' +
    '<rect x="6" y="0" width="4" height="2" fill="#cc0000"/><rect x="7" y="2" width="2" height="2" fill="#1b1b3a"/>' +
    '<rect x="3" y="4" width="10" height="1" fill="#1b1b3a"/><rect x="3" y="13" width="10" height="1" fill="#1b1b3a"/>' +
    '<rect x="2" y="5" width="1" height="8" fill="#1b1b3a"/><rect x="13" y="5" width="1" height="8" fill="#1b1b3a"/>' +
    '<rect x="3" y="5" width="10" height="8" fill="#efe6c8"/><rect x="4" y="7" width="3" height="3" fill="#fff"/><rect x="9" y="7" width="3" height="3" fill="#fff"/>' +
    '<rect x="5" y="8" width="1" height="1" fill="#1b1b3a"/><rect x="10" y="8" width="1" height="1" fill="#1b1b3a"/>' +
    '<rect class="jy-mouth" x="7" y="11" width="2" height="1" fill="#1b1b3a"/><rect x="3" y="10" width="1" height="1" fill="#f0a0b8"/><rect x="12" y="10" width="1" height="1" fill="#f0a0b8"/>' +
    '<rect x="4" y="14" width="2" height="1" fill="#1b1b3a"/><rect x="10" y="14" width="2" height="1" fill="#1b1b3a"/></svg>';
  const RM = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // mote speaks: the whole line is in the DOM for screen readers; the typing is decoration
  function moteHTML(lines, mood) {
    return '<div class="jy-mote' + (mood ? ' m-' + mood : '') + '">' + MOTE + '<p class="jy-bubble" data-type="' + esc(lines.join(' ')) + '">' + esc(lines.join(' ')) + '</p></div>';
  }
  function typeMote(root) {
    const p = $('.jy-bubble', root); if (!p || RM()) return;
    const full = p.dataset.type; let i = 0; p.setAttribute('aria-label', full); p.textContent = '';
    const tick = () => { if (!p.isConnected) return; i += 2; p.textContent = full.slice(0, i); if (i < full.length) setTimeout(tick, 18); else p.classList.add('done'); };
    tick();
  }
  // the scene's stage: a small animated set for each transition (pure CSS; see journey.css)
  const STAGE = {
    weather: '<div class="st-weather"><i class="rain"></i><i class="flash"></i><b class="tower"><u></u><u></u><u></u></b><span class="pg">📄</span><em>SERVER ROOM B · 1993</em></div>',
    trust: '<div class="st-trust"><b class="door"><u>MEMBERS</u></b><i class="rope"></i><i class="post p1"></i><i class="post p2"></i><span class="lock">🔒</span><em>sign in to continue ▸</em></div>',
    pages: '<div class="st-pages"><b class="mine"><u>✨ my page ✨</u><i>♥ ★ ♫ ~*~</i></b><b class="tpl"><u></u><u></u><u></u><u></u></b><em>profile.php?id=</em></div>',
    feeds: '<div class="st-feeds"><b class="thread"><u>re: re: anyone still here?</u><u>re: yes!!</u><u>re: always</u></b><b class="stream"><i></i><i></i><i></i><i></i><i></i><i></i></b><em>for you ▾</em></div>',
    writing: '<div class="st-writing"><p class="mine">i wanted to say thank you, and i’m not sure how</p><p class="ghost">Thank you for your support!</p><i class="caret"></i><em>◇ rewrite</em></div>',
  };
  // tiny sounds, only when the visitor has turned sound on
  function sfx(kind) {
    if (!window.Sound || !Sound.on) return;
    try {
      const a = sfx.ac || (sfx.ac = new (window.AudioContext || window.webkitAudioContext)()); const t = a.currentTime;
      const o = a.createOscillator(), g = a.createGain(); o.connect(g).connect(a.destination);
      const P = { drop: [180, 90, 0.12, 'triangle'], lift: [240, 360, 0.1, 'sine'], stamp: [90, 50, 0.16, 'square'], open: [520, 700, 0.08, 'sine'] }[kind] || [300, 300, 0.05, 'sine'];
      o.type = P[3]; o.frequency.setValueAtTime(P[0], t); o.frequency.exponentialRampToValueAtTime(P[1], t + P[2]);
      g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + P[2] + 0.05); o.start(t); o.stop(t + P[2] + 0.08);
    } catch (e) { /* no audio here */ }
  }
  // what you carry: the things kept at the latest transition, in a box on the desktop
  function carrying() { const ks = C.CFG.anchors.filter((a) => J.kept[a]); return ks.length ? J.kept[ks[ks.length - 1]].filter((id) => fateOf(id) === 'here') : []; }
  function pocket() {
    let p = $('#jyPocket');
    if (!p) { p = document.createElement('div'); p.id = 'jyPocket'; p.setAttribute('aria-label', 'what you are carrying'); document.body.appendChild(p); p.addEventListener('click', (e) => { const b = e.target.closest('[data-thing]'); if (b) openThings('here', b.dataset.thing); }); }
    const c = carrying();
    p.hidden = !c.length || J.mode !== 'on';
    p.innerHTML = '<span class="jy-pk-l">carrying</span>' + c.map((id) => { const t = byId(id); return '<button type="button" data-thing="' + id + '" title="' + esc(t.title) + '">' + objOf(t)[1] + '<span class="sr">' + esc(t.title) + '</span></button>'; }).join('');
  }

  /* ---------------- the things window ---------------- */
  const ui = { tab: 'here', open: null, say: '' };
  const TABS = [['here', 'things here'], ['left', 'what’s left'], ['people', 'people'], ['yours', 'yours'], ['noticed', 'what it noticed'], ['log', 'log']];
  function openThings(tab, id) {
    build(); if (tab) ui.tab = tab; ui.open = id || null; draw();
    if (typeof openWindow === 'function') openWindow('win-things');
    const w = $('#win-things'); w.classList.add('open'); w.style.display = 'flex';
  }
  function draw() {
    const m = $('#jyMain'); if (!m) return;
    $('#win-things .jy-tabs').innerHTML = TABS.map(([k, t]) => '<button class="btn-95' + (ui.tab === k ? ' active' : '') + '" role="tab" aria-selected="' + (ui.tab === k) + '" data-tab="' + k + '">' + t + '</button>').join('');
    let h = '';
    if (ui.open) h = detail(byId(ui.open));
    else if (ui.tab === 'here') h = listHere();
    else if (ui.tab === 'left') h = listLeft();
    else if (ui.tab === 'people') h = listPeople();
    else if (ui.tab === 'yours') h = yoursTab();
    else if (ui.tab === 'noticed') h = reveal();
    else h = logTab();
    m.innerHTML = h + '<div class="jy-say" role="status">' + esc(ui.say) + '</div>';
    label();
  }
  const badge = (id) => { const f = fateOf(id); return f === 'here' ? (J.opened[id] ? '<span class="jy-b ok">opened</span>' : '') : '<span class="jy-b f-' + f + '">' + esc(C.FATES[f].label) + '</span>'; };
  const kept = (id) => Object.keys(J.kept).some((s) => J.kept[s].indexOf(id) >= 0);

  function listHere() {
    const k = curKey(), er = eraOf(k), list = C.THINGS[k] || [];
    let h = '<p class="jy-era"><b>' + esc(er.label) + '</b> · ' + esc(er.name || '') + '</p><p class="jy-help">things you can pick up and read in this era. open one for what it was, and poke it. nothing here is counted unless it says so.</p>';
    if (yourEra() === k) h += '<p class="jy-yoursera">\u2665 this one was yours. you were about ten.</p>';
    h += memCard(k);
    if (J.mode === 'free') h += '<p class="jy-help">you chose to look around without the journey, so nothing is lost. <a href="#" data-act="join">start it anyway</a></p>';
    h += list.length ? '<ul class="jy-list">' + list.map((t) => '<li><button class="jy-row" data-thing="' + t.id + '">' + objHTML(t, 'mini') + '<b>' + esc(t.title) + '</b> ' + badge(t.id) + (kept(t.id) && fateOf(t.id) === 'here' ? ' <span class="jy-b ok">carried</span>' : '') + '<span>' + esc(t.line) + '</span></button></li>').join('') + '</ul>' : '<p class="ts-empty">nothing is catalogued for this era.</p>';
    const lefts = leftThings().filter((t) => t.era === k);
    if (lefts.length) h += '<h4 class="jy-h">left by someone before you</h4><ul class="jy-list">' + lefts.map((t) => '<li><button class="jy-row" data-thing="' + t.id + '">' + objHTML(t, 'mini') + '<b>' + esc(t.line) + '</b> ' + badge(t.id) + '<span>unsigned. left for whoever came next.</span></button></li>').join('') + '</ul>';
    const yours = mineThings().filter((t) => t.era === k);
    if (yours.length) h += '<h4 class="jy-h">yours, from here</h4><ul class="jy-list">' + yours.map((t) => '<li><button class="jy-row" data-thing="' + t.id + '">' + objHTML(t, 'mini' + (fateOf(t.id) !== 'here' ? ' f-' + fateOf(t.id) : '')) + '<b>' + esc(t.title) + '</b> ' + badge(t.id) + '<span>' + esc(fateOf(t.id) === 'here' ? t.line : C.FATES[fateOf(t.id)].note) + '</span></button></li>').join('') + '</ul>';
    return h;
  }
  /* one specific memory from an interview, and the same question for the visitor */
  function memCard(k) {
    const M = C.MEMORIES && C.MEMORIES[k]; if (!M) return '';
    const id = 'Y-mem-' + k, m = (J.mine || []).find((x) => x.id === id), f = m ? fateOf(id) : 'here';
    let mineH;
    if (m && f !== 'here') mineH = '<p class="jy-mem-ans lost">' + esc(C.FATES[f].label) + '</p><small>your answer was left behind going into ' + esc(eraOf(J.lost[id].scene).label) + '. <a href="#" data-thing="' + id + '">see what is left of it</a></small>';
    else if (m && !ui.memEdit) mineH = '<p class="jy-mem-ans">' + esc(m.line) + '</p><button type="button" class="btn-95" data-act="mem-edit">change it</button> <small>this is one of your things now.</small>';
    else mineH = '<textarea id="jyMem" class="field" maxlength="200" rows="2" placeholder="a sentence is enough">' + esc(m ? m.line : '') + '</textarea><button type="button" class="btn-95 jy-go" data-act="mem-save">keep my answer</button> <small>optional. it stays in this browser and becomes one of your things.</small>';
    return '<section class="jy-mem"><div class="jy-mem-theirs"><span class="jy-mem-who">' + esc(M.who) + ' remembers</span><p>' + esc(M.memory) + '</p><small>paraphrased from an interview. a placeholder until they have checked it.</small></div>' +
      '<div class="jy-mem-yours"><label for="jyMem"><b>and you?</b> ' + esc(M.ask) + '</label>' + mineH + '</div></section>';
  }
  // "your year": the era the visitor was about ten in
  function yourEra() { const b = parseInt(J.born, 10); if (!b || b < 1930 || b > 2030) return null; const ks = eraKeys().filter((k) => yearOf(k) <= b + 10); return ks.length ? ks[ks.length - 1] : eraKeys()[0]; }
  function markYourEra() { document.querySelectorAll('.era-btn.jy-mine-era').forEach((b) => b.classList.remove('jy-mine-era')); const k = yourEra(), b = k && $('.era-btn[data-era="' + k + '"]'); if (b) b.classList.add('jy-mine-era'); }
  function setBorn(v) { const n = parseInt(v, 10); J.born = n >= 1930 && n <= 2030 ? n : null; J.greeted = false; save(); markYourEra(); }
  // "bring one real thing": something from the visitor's own internet past, placed in the era they choose
  function bring(text, k) {
    text = String(text || '').trim().slice(0, 80); if (!text) return false; k = C.THINGS[k] ? k : curKey();
    addMine({ id: 'Y-brought', kind: 'memory', era: k, title: 'something you brought: ' + text, line: text, ctx: 'you brought this with you, from your own ' + eraOf(k).label + '.', flat: 'declared interest \u00b7 nostalgia', t: now() });
    log('brought something of their own into ' + eraOf(k).label); return true;
  }
  // leave one thing, unsigned, for the next person at this computer (asked for explicitly; survives "erase journey")
  function leave(id) {
    const m = (J.mine || []).find((x) => x.id === id); if (!m) return false;
    const all = shelf().filter((x) => x.sid !== J.sid); all.push({ id: 'L-' + J.sid, sid: J.sid, era: m.era, kind: m.kind, line: m.line, img: m.img, t: now() });
    try { localStorage.setItem(SHELF, JSON.stringify(all.slice(-12))); } catch (e) { return false; }
    J.leftId = id; save(); log('left one thing, unsigned, for the next person'); return true;
  }
  function addMine(m) {
    J.mine = J.mine || [];
    const i = J.mine.findIndex((x) => x.id === m.id);
    if (i >= 0) J.mine[i] = Object.assign(J.mine[i], m); else J.mine.push(m);
    save(); pocket(); if ($('#jyMain')) draw();
  }
  function answer(k, text) {
    const M = C.MEMORIES[k]; text = String(text || '').trim().slice(0, 200); if (!M || !text) return false;
    if (J.lost['Y-mem-' + k]) return false;
    addMine({ id: 'Y-mem-' + k, kind: 'memory', era: k, title: 'your answer: ' + M.label, line: text, ctx: 'you wrote this in ' + eraOf(k).label + ', when it asked: ' + M.ask, flat: M.flat, t: now() });
    log('answered a question in ' + eraOf(k).label + ' (' + M.label + ')');
    return true;
  }
  // called by the aesthetic windows whenever the visitor does something there (see subcultures.js kit.act)
  function made(c, name, detail) {
    if (!c || (C.MAKES || []).indexOf(name) < 0 || !detail) return;
    let id = 'Y-made-' + c.id, n = 1; while (J.lost[id]) id = 'Y-made-' + c.id + '-' + (++n);
    const fresh = !(J.mine || []).some((x) => x.id === id);
    addMine({ id, kind: 'made', era: curKey(), title: 'made in ' + c.title, line: String(detail).slice(0, 160), ctx: 'you made this in the ' + c.title + ' window.', flat: 'user-generated content \u00b7 ' + (c.kind || 'aesthetic'), t: now() });
    if (fresh) { log('made something in ' + c.title); toast('you made that. it\u2019s yours now. i\u2019ll put it with your things.'); }
  }
  function toast(msg) {
    let t = $('#jyToast'); if (!t) { t = document.createElement('div'); t.id = 'jyToast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = MOTE + '<p>' + esc(msg) + '</p>'; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 5200);
  }
  /* everything that is the visitor's own. in 2030 it comes back whole, signed and dated. */
  function yoursTab() {
    const mine = mineThings(), k = curKey(), home = k === '2030';
    let h = '<p class="jy-help">what you answered and what you made. these are the only things in this computer that are really yours.</p>';
    const bringH = (J.mine || []).some((x) => x.id === 'Y-brought') ? '' : '<form class="jy-bring" data-form="bring"><label for="jyBring"><b>bring one real thing.</b> a site, a game, a username, a song you had on your page.</label><input class="field" id="jyBring" maxlength="80" placeholder="from your own internet"><select id="jyBringEra" aria-label="which year it belongs to">' + eraKeys().filter((x) => x !== '2030').map((x) => '<option value="' + x + '"' + (x === k ? ' selected' : '') + '>' + esc(eraOf(x).label) + '</option>').join('') + '</select><button class="btn-95" type="submit">bring it</button></form>';
    if (!mine.length) return h + bringH + '<p class="ts-empty">nothing yet. answer the question in any era, or make something in one of the aesthetic windows.</p>';
    h += bringH;
    h += home ? '<div class="jy-home"><p><b>2030 hands it back.</b> whole, with your name and the day you made it, whatever happened to it on the way. this is the speculative part.</p><label>sign it <input class="field" id="jyName" maxlength="40" value="' + esc(J.name || '') + '" placeholder="your name, or leave it"></label></div>'
      : '<p class="jy-help">this is how each one stands in ' + esc(eraOf(k).label) + '. keep going: 2030 gives them back.</p>';
    h += '<ul class="jy-yours-list">' + mine.map((t) => {
      const f = home ? 'here' : fateOf(t.id);
      const body = f === 'here' ? '\u201c' + esc(t.line) + '\u201d' : f === 'displaced' ? esc(systemVersion(t)) : f === 'degraded' ? esc(t.line.split(' ').slice(0, 4).join(' ')) + '\u2026' : f === 'gated' ? 'behind a gate.' : 'only a record that it existed.';
      return '<li>' + objHTML(t, 'mini' + (f !== 'here' ? ' f-' + f : '')) + '<div><b>' + esc(t.title) + '</b> ' + (f !== 'here' ? '<span class="jy-b f-' + f + '">' + esc(C.FATES[f].label) + '</span>' : (home && fateOf(t.id) !== 'here' ? '<span class="jy-b ok">returned</span>' : '')) + (t.img && f === 'here' ? '<img class="jy-thumb" alt="your drawing" src="' + t.img + '">' : '') + '<p>' + body + '</p>' +
        (home ? '<small>\u2014 ' + esc(J.name || 'you') + ', ' + new Date(t.t).toLocaleDateString() + ' \u00b7 from ' + esc(eraOf(t.era).label) + '</small>' : '') + '</div></li>';
    }).join('') + '</ul>';
    const c = carrying(); if (c.length) h += '<p class="jy-help">and you are carrying: ' + c.map((id) => esc(byId(id).title)).join(', ') + '.</p>';
    if (home) h += '<div class="jy-leave"><b>leave one for the next person?</b> <small>unsigned. it will be here for whoever uses this computer after you, even if you erase your journey. this is one browser, so \u201cnext\u201d means the next person at this screen.</small>' + (J.leftId ? '<p>you left: \u201c' + esc((byId(J.leftId) || {}).line || '') + '\u201d <a href="#" data-act="unleave">take it back</a></p>' : '<div class="jy-leave-row"><select id="jyLeave" aria-label="which thing to leave">' + mine.map((t) => '<option value="' + t.id + '">' + esc(t.line.slice(0, 50)) + '</option>').join('') + '</select><label><input type="checkbox" id="jyLeaveOk"> yes, leave it unsigned</label><button class="btn-95" data-act="leave">leave it</button></div>') + '</div>';
    return h + (home ? '<p><button class="btn-95 jy-go" data-act="keepsake">open it as a page to keep</button></p>' : '');
  }
  function keepsake() {
    const mine = mineThings(), name = J.name || 'a visitor';
    const li = mine.map((t) => '<li><b>' + esc(t.title) + '</b>' + (t.img ? '<p><img alt="" style="max-width:240px;border:1px solid #999" src="' + t.img + '"></p>' : '') + '<p>\u201c' + esc(t.line) + '\u201d</p><small>' + new Date(t.t).toLocaleDateString() + ' \u00b7 ' + esc(eraOf(t.era).label) + (fateOf(t.id) !== 'here' ? ' \u00b7 was ' + esc(C.FATES[fateOf(t.id)].label) + ' on the way, and came back' : '') + '</small></li>').join('');
    const car = carrying().map((id) => esc(byId(id).title)).join(', ');
    return '<!doctype html><meta charset="utf-8"><title>third space \u00b7 ' + esc(name) + '</title><style>body{max-width:34rem;margin:3rem auto;padding:0 1rem;font:17px/1.5 Georgia,serif;color:#222;background:#fbf7ec}h1{font-size:1.5rem}li{margin:0 0 1.2rem;list-style:none;border-left:4px solid #cc0000;padding-left:.8rem}ul{padding:0}p{margin:.2rem 0}small{color:#666}</style>' +
      '<h1>what ' + esc(name) + ' brought home from the third space</h1><p>These are the things that were yours. Everything else in that computer was a sample.</p><ul>' + li + '</ul>' + (car ? '<p>Carried to the end: ' + car + '.</p>' : '') + '<p><small>Made in a browser. Nothing here was sent anywhere.</small></p>';
  }
  function listLeft() {
    const ids = Object.keys(J.lost);
    let h = '<p class="jy-help">what each era did not carry forward, and how. nothing is deleted from your browser: these were never yours to lose; they are samples. this is how the journey shows loss.</p>';
    if (!ids.length) return h + '<p class="ts-empty">nothing yet. the first transition is into 1993.</p>';
    return h + '<ul class="jy-list">' + ids.map((id) => { const t = byId(id), l = J.lost[id]; return '<li><button class="jy-row" data-thing="' + id + '">' + objHTML(t, 'mini f-' + l.fate) + '<b>' + esc(t.title) + '</b> ' + badge(id) + '<span>' + esc(eraOf(t.era).label) + ' · left behind going into ' + esc(eraOf(l.scene).label) + ' · ' + (reasonOf(id) ? esc(reasonOf(id)) : 'no reason shown') + '</span></button></li>'; }).join('') + '</ul>';
  }
  function listPeople() {
    let h = '<p class="jy-help"><b>stand-ins.</b> these profiles are invented placeholders for people who were interviewed. each links three things. they will be replaced with the real wording of people who agreed, in the way they chose (named, first name, or anonymous).</p>';
    if (ui.room) return roomHTML(ui.room);
    h += '<h4 class="jy-h">two rooms</h4><div class="jy-rooms">' + (C.ROOMS || []).map((r) => '<button type="button" class="jy-roomcard r-' + r.look + '" data-act="room" data-id="' + r.id + '"><b>' + esc(r.who) + '</b><span>' + esc(r.sub) + '</span><i>' + r.objects.map((o) => o.icon).join(' ') + '</i></button>').join('') + '</div><h4 class="jy-h">stand-in profiles</h4>';
    return h + C.PROFILES.map((p) => '<section class="jy-prof"><h4>' + esc(p.handle) + '</h4><div>' + esc(p.note) + '</div><div class="jy-help">' + esc(p.line) + '</div><div>' + p.links.map((id) => { const t = byId(id); return t ? '<button class="btn-95" data-thing="' + id + '">' + esc(t.title) + ' <small>' + esc(eraOf(t.era).label) + '</small></button>' : ''; }).join(' ') + '</div></section>').join('');
  }

  /* a room built from one interview: every object is one memory, and takes you to its year */
  function roomHTML(id) {
    const r = (C.ROOMS || []).find((x) => x.id === id); if (!r) return '';
    const o = r.objects[ui.roomObj || 0], M = C.MEMORIES[o.era];
    const toy = o.toy === 'weather' ? '<div class="jy-toy weather"><button type="button" class="btn-95" data-act="toy-weather">show them the weather</button><div id="jyToy" aria-live="polite"></div></div>'
      : o.toy === 'blank' ? '<div class="jy-toy blank"><textarea id="jyBlank" rows="3" placeholder="a blank page. start, or wait."></textarea><small id="jyBlankNote">if you wait, it starts for you.</small></div>' : '';
    return '<button class="btn-95" data-act="room-close">\u2190 back</button><div class="jy-room r-' + r.look + '"><p class="jy-room-who"><b>' + esc(r.who) + '</b> \u00b7 ' + esc(r.intro) + '</p><div class="jy-room-desk" role="tablist" aria-label="things in the room">' + r.objects.map((x, i) => '<button type="button" role="tab" aria-selected="' + (i === (ui.roomObj || 0)) + '" class="jy-room-obj' + (i === (ui.roomObj || 0) ? ' on' : '') + '" data-act="room-obj" data-i="' + i + '" style="--i:' + i + '"><i>' + x.icon + '</i><span>' + esc(x.label) + '</span></button>').join('') + '</div>' +
      '<div class="jy-room-mem"><span class="jy-mem-who">' + esc(eraOf(o.era).label) + ' \u00b7 ' + esc(M.label) + '</span><p>' + esc(M.memory) + '</p>' + toy + '<p><button class="btn-95 jy-go" data-act="room-go" data-era="' + o.era + '">go to ' + esc(eraOf(o.era).label) + ' and answer it yourself</button></p></div>' +
      '<small>a stand-in room, paraphrased from an interview. it changes when they have seen it and chosen how to appear.</small></div>';
  }
  function detail(t) {
    if (!t) return '';
    const f = fateOf(t.id), l = J.lost[t.id], er = eraOf(t.era);
    let h = '<button class="btn-95" data-act="close-detail">← back</button> <span class="jy-era"><b>' + esc(t.title) + '</b> · ' + esc(er.label) + ' ' + badge(t.id) + '</span>';
    if (f === 'gone') {
      h += '<article class="jy-card gone">' + objHTML(t, 'big f-gone') + '<p><b>this is a record, not the thing.</b></p><p>' + esc(t.title) + ' (' + esc(t.kind) + ', ' + esc(er.label) + ') was here.</p><p class="jy-help">reason: ' + (reasonOf(t.id) ? esc(reasonOf(t.id)) : '<i>not shown</i>') + '</p><p class="jy-help">' + esc(C.FATES.gone.note) + '</p></article>';
      return h + (window.Viewer && !t.mine ? '<p><button class="btn-95" data-act="trace" data-id="' + t.id + '">open the record</button></p>' : '');
    }
    if (f === 'gated' && !J.unlocked[t.id]) return h + gate(t);
    let ctx = t.ctx, line = t.line, poke = !t.mine && !t.left;
    if (f === 'degraded') { ctx = '[image and formatting removed]'; poke = false; if (t.mine) line = t.line.split(' ').slice(0, 4).join(' ') + '\u2026'; }
    if (f === 'displaced') { ctx = systemVersion(t); poke = false; if (t.mine) line = ''; }
    h += '<article class="jy-card' + (f !== 'here' ? ' ' + f : '') + '">' + objHTML(t, 'big' + (f !== 'here' ? ' f-' + f : '')) + '<p class="jy-line">' + esc(line) + '</p><p>' + esc(ctx) + '</p>' +
      (f === 'displaced' ? '<p class="jy-help"><b>the system’s version.</b> it replaced the original. ' + (curKey() === '2030' ? '<a href="#" data-act="orig" data-id="' + t.id + '">see what it said before</a>' : 'the original is not shown in this era.') + '</p>' : '') +
      (f === 'degraded' ? '<p class="jy-help">' + esc(C.FATES.degraded.note) + '</p>' : '') +
      (t.era === '2030' ? '<p class="jy-help">this is speculative. nothing like it exists yet.</p>' : '') + '</article>';
    if (poke) h += '<p><button class="btn-95" data-act="poke" data-id="' + t.id + '">' + esc(t.poke[0]) + '</button></p><div class="jy-poke" id="jyPoke"></div>';
    h += t.mine ? '<p class="jy-help">' + (t.kind === 'memory' ? 'you wrote this.' : 'you made this.') + ' it stays in this browser. see everything of yours under \u201cyours\u201d.</p>' : '<p class="jy-help">wording is a stand-in. <a href="#" data-act="trace" data-id="' + t.id + '">open as a trace</a> to see it held three ways.</p>';
    if (!J.opened[t.id]) { J.opened[t.id] = 1; log('opened “' + t.title + '” (' + er.label + ')'); }
    return h;
  }
  function gate(t) {
    const left = t.theme === 'keeping' || yearOf(curKey()) >= C.CFG.opaqueFrom;   // some gates have no way in
    if (left) return '<article class="jy-card gated"><p><b>not included in your plan.</b></p><p>' + esc(t.title) + ' is still here. you cannot read it.</p><div class="jy-plans"><span>free · headlines only</span><span>plus · ads removed</span><span>premium · archive, but not this one</span></div><p class="jy-help">this is a simulation: nothing can be bought, and none of these buttons does anything. the point is that a way in can simply not exist.</p></article>';
    return '<article class="jy-card gated"><p><b>sign in to continue.</b></p><p>' + esc(t.title) + ' is behind an account.</p><label class="jy-opt"><input type="checkbox" id="jyAgree"> i agree to be known by this site as a name and a number <small>(fictional; nothing is stored beyond a line in your journey log)</small></label><p><button class="btn-95" data-act="unlock" data-id="' + t.id + '" disabled id="jyUnlock">continue</button></p><p class="jy-help">the gate asks for agreement. it does not ask whether you want what is behind it.</p></article>';
  }

  /* ---------------- the reveal ---------------- */
  function reveal() {
    const sc = Object.keys(J.kept);
    let h = '<div class="jy-dossier"><p class="jy-file">FILE · visitor · <span>profile built from 5 choices</span></p><p class="jy-help"><b>fiction.</b> this is what a system could read from the choices you made, using plain rules, next to what you actually wrote. it lives in this browser only.</p>';
    if (!sc.length) return h + '<p class="ts-empty">nothing yet. it only notices at the five transitions. the first is into 1993.</p></div>';
    const tally = {}; let keptN = 0, lostN = 0; const lostT = {};
    sc.forEach((s) => J.kept[s].forEach((id) => { const t = byId(id); if (t) { tally[t.theme] = (tally[t.theme] || 0) + 1; keptN++; } }));
    Object.keys(J.lost).forEach((id) => { const t = byId(id); if (t) { lostT[t.theme] = (lostT[t.theme] || 0) + 1; lostN++; } });
    const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
    h += '<h4>what it kept about each choice</h4>' + sc.map((s) => {
      const titles = J.kept[s].map((id) => '“' + esc((byId(id) || {}).title) + '”').join(', ');
      return '<section class="jy-prof"><b>into ' + esc(eraOf(s).label) + ' · ' + esc(C.SCENES[s].title) + '</b><div>kept: ' + (titles || 'nothing') + '</div><div class="jy-help">categories read: ' + J.kept[s].map((id) => esc(C.THEMES[(byId(id) || {}).theme] || '')).join('; ') + '</div><div class="jy-help">time to choose: ' + Math.round((J.hes[s] || 0) / 1000) + 's' + (J.delegated[s] ? ' · you let it choose' : '') + '</div>' +
        '<div class="jy-help jy-yours">what you wrote: ' + (J.why[s] ? '“' + esc(J.why[s]) + '”' : '<i>nothing. it has no way to know.</i>') + '</div></section>';
    }).join('');
    h += '<h4>what a rule would conclude</h4><p>' + (top ? 'you kept mostly <b>' + esc(C.THEMES[top]) + '</b> (' + tally[top] + ' of ' + keptN + '). a rule would predict you will keep that kind of thing next, and show you more of it.' : 'no pattern yet.') + '</p>';
    h += '<p class="jy-help">it cannot tell: that you kept something for a person, a smell, a mistake. that your hesitation (' + sc.map((s) => Math.round((J.hes[s] || 0) / 1000) + 's').join(', ') + ') may have been reading, not doubt. a system would label it “uncertainty”.</p>';
    h += '<p class="jy-help">left behind: ' + lostN + ' things. what leaving them out says about you is a guess.</p>';
    if (J.going.length) h += '<p class="jy-help">you went back ' + J.going.length + ' time' + (J.going.length === 1 ? '' : 's') + '. a system would call that “churn”. you may have been looking for something.</p>';
    if (J.polish.shown) h += '<p class="jy-help">in 2024 it suggested a rewrite ' + J.polish.shown + ' time' + (J.polish.shown === 1 ? '' : 's') + '. you accepted ' + J.polish.accepted + ' and kept your own ' + J.polish.refused + '.</p>';
    if (J.asks.shown) h += '<p class="jy-help">in 2030 it asked ' + J.asks.shown + ' question' + (J.asks.shown === 1 ? '' : 's') + ' and wrote nothing.</p>';
    const mine = mineThings();
    if (mine.length) h += '<h4>what you told it, and how it was filed</h4>' + mine.map((t) => '<section class="jy-prof"><div class="jy-help jy-yours">' + esc(t.line) + '</div><div class="jy-help">filed as: <b>' + esc(t.flat || 'unfiled') + '</b></div></section>').join('') + '<p class="jy-help">one of these is a sentence about a person, a room, a year. the other is a row in a table.</p>';
    return h + '<p><button class="btn-95" data-act="export">export what it kept (JSON)</button> <button class="btn-95 jy-go" data-tab="yours">see what 2030 hands back \u2192</button></p></div>';
  }
  function logTab() {
    let h = '<p class="jy-help">everything the journey itself has recorded. it is local, you can read all of it, and you can erase it.</p>';
    h += '<p><b>mode:</b> ' + (J.mode === 'on' ? 'journey on' : J.mode === 'free' ? 'looking around (no loss)' : 'not started') + ' · keep ' + C.CFG.keep + (C.CFG.perTransition ? ' at every transition' : ' for the whole journey') + ' · going back: ' + (C.CFG.allowBack ? 'allowed (you find a record, never the thing)' : 'not allowed') + '</p>';
    h += '<ul class="jy-log">' + (J.log.slice(-40).reverse().map((e) => '<li><span>' + new Date(e.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</span> ' + esc(e.what) + '</li>').join('') || '<li>nothing yet.</li>') + '</ul>';
    return h + '<p><button class="btn-95" data-act="export">export (JSON)</button> <button class="btn-95" data-act="reset">erase journey</button> ' + (J.mode !== 'on' ? '<button class="btn-95" data-act="join">start the journey</button>' : '') + '</p>';
  }

  function onClick(e) {
    const tb = e.target.closest('[data-tab]'); if (tb) { ui.tab = tb.dataset.tab; ui.room = null; ui.open = null; ui.say = ''; draw(); return; }
    const op = e.target.closest('[data-thing]'); if (op) { ui.open = op.dataset.thing; ui.say = ''; draw(); return; }
    const a = e.target.closest('[data-act]'); if (!a) return; e.preventDefault();
    const k = a.dataset.act;
    if (k === 'close-detail') { ui.open = null; draw(); }
    else if (k === 'mem-save') { const v = ($('#jyMem') || {}).value; ui.memEdit = false; if (answer(curKey(), v)) { ui.say = 'kept. it is yours.'; sfx('drop'); } draw(); }
    else if (k === 'mem-edit') { ui.memEdit = true; draw(); const ta = $('#jyMem'); if (ta) ta.focus(); }
    else if (k === 'keepsake') { try { const u = URL.createObjectURL(new Blob([keepsake()], { type: 'text/html' })); window.open(u, '_blank'); } catch (e) { ui.say = 'could not open a page here.'; draw(); } log('opened the keepsake page'); }
    else if (k === 'room') { ui.room = a.dataset.id; ui.roomObj = 0; draw(); }
    else if (k === 'room-close') { ui.room = null; draw(); }
    else if (k === 'room-obj') { ui.roomObj = +a.dataset.i; draw(); blankToy(); }
    else if (k === 'room-go') { ui.room = null; ui.tab = 'here'; setEra(a.dataset.era); draw(); }
    else if (k === 'toy-weather') { const places = ['reykjav\u00edk: 4\u00b0, wind', 'nairobi: 22\u00b0, clear', 'osaka: 17\u00b0, light rain', 'lima: 19\u00b0, fog']; $('#jyToy').textContent = places[Math.floor(Math.random() * places.length)] + '. that was the whole demonstration, and it was enough.'; }
    else if (k === 'leave') { if (($('#jyLeaveOk') || {}).checked && leave($('#jyLeave').value)) ui.say = 'left. unsigned.'; else ui.say = 'tick the box if you want to leave it.'; draw(); }
    else if (k === 'unleave') { try { localStorage.setItem(SHELF, JSON.stringify(shelf().filter((x) => x.sid !== J.sid))); } catch (e) { /* nothing */ } J.leftId = null; save(); draw(); }
    else if (k === 'poke') { const t = byId(a.dataset.id); $('#jyPoke').innerHTML = '<div class="jy-result">' + esc(t.poke[1]) + '</div>'; log('poked “' + t.title + '”'); }
    else if (k === 'unlock') { J.unlocked[a.dataset.id] = 1; log('agreed to a gate to open “' + byId(a.dataset.id).title + '”'); save(); ui.say = 'it let you in. it noted that you agreed (see the log).'; draw(); }
    else if (k === 'orig') { const t = byId(a.dataset.id); a.closest('p').innerHTML = '<b>before:</b> ' + esc(t.line + ' ' + t.ctx); }
    else if (k === 'trace') { if (window.Viewer) Viewer.open(a.dataset.id, { tab: fateOf(a.dataset.id) === 'gone' ? 'record' : undefined }); }
    else if (k === 'export') exportJSON();
    else if (k === 'reset') { reset(); ui.say = 'erased. the journey is back to the beginning.'; draw(); }
    else if (k === 'join') { J.mode = 'on'; save(); log('started the journey'); ui.say = 'started. the next transition will ask you to choose.'; draw(); }
  }
  // the blank page in her room: if you don't start, it starts for you. if you type, it stops.
  function blankToy() {
    const ta = $('#jyBlank'); if (!ta) return; clearInterval(blankToy.t); const ghost = 'Here is a draft to get you started: ', note = $('#jyBlankNote'); let i = 0, mine = false;
    ta.addEventListener('input', () => { if (!mine) { mine = true; clearInterval(blankToy.t); if (ta.value.indexOf(ghost.slice(0, i)) === 0) ta.value = ta.value.slice(i); note.textContent = 'you started. it stopped.'; } });
    blankToy.t = setTimeout(() => { blankToy.t = setInterval(() => { if (!ta.isConnected || mine) return clearInterval(blankToy.t); ta.value = ghost.slice(0, ++i); if (i >= ghost.length) { clearInterval(blankToy.t); note.textContent = 'it started for you. she almost never starts from a blank page now.'; } }, 70); }, 2500);
  }
  function onSubmit(e) { const f = e.target.closest('[data-form=bring]'); if (!f) return; e.preventDefault(); if (bring($('#jyBring').value, $('#jyBringEra').value)) { ui.say = 'brought. it is in ' + eraOf($('#jyBringEra').value).label + ' now, and it is yours.'; draw(); } }
  function onInput(e) { if (e.target.id === 'jyAgree') $('#jyUnlock').disabled = !e.target.checked; if (e.target.id === 'jyName') { J.name = e.target.value.slice(0, 40); save(); } }

  function exportJSON() {
    const out = JSON.stringify({ note: 'everything the journey recorded in this browser. nothing was sent anywhere.', journey: J }, null, 2);
    try { const u = URL.createObjectURL(new Blob([out], { type: 'application/json' })); const a = document.createElement('a'); a.href = u; a.download = 'third-space-journey.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); ui.say = 'exported.'; } catch (e) { ui.say = 'could not export here.'; }
    log('exported the journey');
    return out;
  }
  function reset(quiet) {
    J = blank(); try { localStorage.removeItem(KEY); if (quiet === true) localStorage.removeItem(SHELF); } catch (e) { /* nothing to remove */ } mem = null; save();
    if (!quiet) { label(); }
    if ($('#jyMain')) draw();
  }

  /* ---------------- arrival and scenes ---------------- */
  const modal = () => $('#jyModal');
  function showModal(html, theme) { build(); const m = modal(); m.className = theme ? 'th-' + theme : ''; m.innerHTML = '<div class="jy-sheet" tabindex="-1">' + html + '</div>'; m.hidden = false; const s = $('.jy-sheet', m); if (s) s.focus(); }
  function hideModal() { const m = modal(); if (m) { m.hidden = true; m.innerHTML = ''; } }
  let queue = [], scene = null;

  function arrival(then) {
    const A = C.ARRIVAL;
    showModal('<div class="jy-crt"><div class="jy-screen">' + moteHTML(A.mote || [], 'hello') +
      '<h2>' + esc(A.title) + '</h2>' + A.story.map((p) => '<p>' + esc(p) + '</p>').join('') + '</div>' +
      '<aside class="jy-sticky"><h3>' + esc(A.sticky || 'what it keeps, and where') + '</h3><ul>' + A.notes.map((p) => '<li>' + esc(p) + '</li>').join('') + '</ul></aside>' +
      '<div class="jy-you"><label>the year you were born <small>(optional)</small><input class="field" id="jyBorn" inputmode="numeric" maxlength="4" placeholder="e.g. 2005" value="' + esc(J.born || '') + '"></label><label>one real thing from your own internet <small>(optional: a site, a game, a username)</small><input class="field" id="jyBringA" maxlength="80"></label></div>' +
      '<div class="jy-btns"><button class="btn-95 jy-go jy-power" data-a="begin"><span aria-hidden="true">⏻</span> ' + esc(A.begin) + '</button> <button class="btn-95" data-a="free">' + esc(A.free) + '</button></div>' +
      '</div>', 'arrival');
    typeMote(modal());
    arrival.then = then;
  }
  function pool(anchor) {
    const ai = idx(anchor);
    return every().filter((t) => idx(t.era) < ai && idx(t.era) >= 0 && fateOf(t.id) === 'here').sort((a, b) => idx(a.era) - idx(b.era));
  }
  function runScene(anchor) {
    const S = C.SCENES[anchor], p = pool(anchor), need = Math.min(C.CFG.keep, p.length);
    const automatic = !C.CFG.perTransition && Object.keys(J.kept).length > 0;
    scene = { anchor, pool: p, need, picked: [], t0: Date.now(), auto: automatic };
    if (automatic) { const carried = p.filter(kept).map((t) => t.id); scene.picked = carried; return finish(true); }
    const rows = p.map((t) => '<li><label class="jy-pick"><input type="checkbox" data-id="' + t.id + '"><span class="jy-pick-o">' + objHTML(t) + '</span><small>' + esc(t.line) + ' <i>' + (t.mine ? (t.kind === 'memory' ? 'you wrote this' : 'you made this') : esc(C.THEMES[t.theme])) + '</i></small></label></li>').join('');
    const slots = Array.from({ length: need }, () => '<span class="jy-slot"></span>').join('');
    showModal('<div class="jy-stage" aria-hidden="true">' + (STAGE[S.slug] || '') + '</div>' +
      '<p class="jy-kick">upgrading to ' + esc(eraOf(anchor).label) + ' · ' + esc(eraOf(anchor).name || '') + '</p><h2>' + esc(S.title) + '</h2>' +
      moteHTML([S.mote ? S.mote[0] : S.intro]) + '<p class="jy-intro">' + esc(S.intro) + '</p>' +
      (need < p.length ? '<p class="jy-ask"><b>pick ' + need + ' to bring.</b> the rest stays here.</p>' : '<p class="jy-ask">you can bring all of them this time!</p>') +
      '<ul class="jy-picks">' + rows + '</ul>' +
      '<div class="jy-boxrow"><div class="jy-box" aria-hidden="true"><span class="jy-box-l">the box</span>' + slots + '</div><p class="jy-count" role="status" id="jyCount"></p></div>' +
      '<label class="jy-opt">why these? <small>(optional, just for you)</small><input class="field" id="jyWhy" maxlength="140"></label>' +
      '<p class="jy-btns"><button class="btn-95 jy-go" data-a="carry" id="jyCarry" disabled>carry these</button> <button class="btn-95" data-a="delegate">let it choose for me</button></p>', 'scene th-' + S.slug);
    typeMote(modal());
    count();
  }
  function count() {
    const picked = $$('#jyModal .jy-picks input:checked'), full = picked.length >= scene.need;
    $$('#jyModal .jy-picks input').forEach((i) => { i.disabled = full && !i.checked; });
    $('#jyCount').textContent = picked.length + ' of ' + scene.need + ' in the box';
    $$('#jyModal .jy-slot').forEach((sl, i) => { const id = picked[i] && picked[i].dataset.id, t = id && byId(id); sl.innerHTML = t ? '<i>' + objOf(t)[1] + '</i><b>' + esc(t.title) + '</b>' : ''; sl.classList.toggle('full', !!t); });
    $$('#jyModal .jy-pick').forEach((l) => l.classList.toggle('in', l.querySelector('input').checked));
    $('#jyCarry').disabled = picked.length !== scene.need;
  }
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function onModalInput(e) { if (e.target.matches('.jy-picks input')) { sfx(e.target.checked ? 'drop' : 'lift'); count(); } }
  function onModalClick(e) {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
    if (a === 'begin' || a === 'free') { const bv = ($('#jyBorn') || {}).value, br = ($('#jyBringA') || {}).value; if (bv) setBorn(bv); if (br && br.trim()) bring(br, yourEra() || curKey()); }
    if (a === 'begin') { J.mode = 'on'; log('started the journey'); hideModal(); const t = arrival.then; arrival.then = null; if (t) t(); }
    else if (a === 'free') { J.mode = 'free'; log('chose to look around without the journey'); hideModal(); arrival.then = null; draw(); }
    else if (a === 'carry') { scene.picked = $$('#jyModal .jy-picks input:checked').map((i) => i.dataset.id); scene.why = ($('#jyWhy').value || '').trim(); finish(); }
    else if (a === 'delegate') {
      // the system picks by a plain rule: the things you opened most recently, then the oldest. shown in the log and the reveal.
      const opened = scene.pool.filter((t) => J.opened[t.id]).reverse(), rest = scene.pool.filter((t) => !J.opened[t.id]);
      scene.picked = opened.concat(rest).slice(0, scene.need).map((t) => t.id); scene.delegated = true; scene.why = ''; finish();
    }
    else if (a === 'next') { hideModal(); nextScene(); }
  }
  function finish(silent) {
    const S = C.SCENES[scene.anchor], fates = S.fates, lost = [];
    J.kept[scene.anchor] = scene.picked.slice(); J.hes[scene.anchor] = silent ? 0 : Date.now() - scene.t0;
    if (scene.why) J.why[scene.anchor] = scene.why; if (scene.delegated) J.delegated[scene.anchor] = true;
    scene.pool.forEach((t) => { if (scene.picked.indexOf(t.id) < 0) lost.push(t); });
    lost.forEach((t, i) => { J.lost[t.id] = { fate: fates[i % fates.length], scene: scene.anchor, reason: S.reason }; });
    J.passed[scene.anchor] = true;
    log('into ' + eraOf(scene.anchor).label + ': kept ' + scene.picked.map((id) => byId(id).title).join(', ') + (lost.length ? ' · ' + lost.length + ' left behind' : '') + (scene.delegated ? ' (let it choose)' : ''));
    save();
    if (silent) { nextScene(); draw(); return; }
    const opaqueNow = yearOf(scene.anchor) >= C.CFG.opaqueFrom;
    const keptRow = scene.picked.map((id) => '<li class="jy-kept">' + objHTML(byId(id)) + '<span class="jy-stamp s-kept">carried</span></li>').join('');
    const rows = lost.map((t) => { const f = J.lost[t.id].fate; return '<li class="jy-fate" data-f="' + f + '">' + objHTML(t) + '<span class="jy-stamp s-' + f + '">' + esc(C.FATES[f].label) + '</span><small>' + esc(C.FATES[f].note) + ' ' + (opaqueNow ? '<i>no reason is shown.</i>' : 'reason: ' + esc(S.reason) + '.') + '</small></li>'; }).join('');
    showModal('<p class="jy-kick">into ' + esc(eraOf(scene.anchor).label) + '</p><h2>what happened to the rest</h2>' +
      moteHTML([S.mote ? S.mote[1] : S.why].concat(lost.some((t) => t.mine) ? ['and one of those was yours. i\u2019m sorry.'] : []), 'after') +
      '<ul class="jy-aftr">' + keptRow + rows + '</ul>' + (lost.length ? '' : '<p>nothing was left behind this time.</p>') +
      '<p class="jy-help"><b>what this is about.</b> ' + esc(S.why) + '</p><p class="jy-help">you can find what was left behind under “what’s left”. it will be a record, not the thing.</p><p class="jy-btns"><button class="btn-95 jy-go" data-a="next">continue</button></p>', 'after th-' + S.slug);
    typeMote(modal());
    // the fates land one at a time, like stamps (all at once with reduced motion)
    $$('#jyModal .jy-fate').forEach((li, i) => { if (RM()) li.classList.add('landed'); else setTimeout(() => { li.classList.add('landed'); sfx('stamp'); }, 700 + i * 420); });
    pocket();
    draw();
  }
  // a scene waits for the era's own arrival (splash, login ritual) to finish, so the visitor sees where they arrived first
  function whenSettled(fn, n) {
    const r = document.getElementById('ritual'), busy = document.querySelector('[id^=era].show') || (r && r.getClientRects().length && getComputedStyle(r).visibility !== 'hidden' && getComputedStyle(r).opacity !== '0');
    if (!busy || (n || 0) > 100) return fn();
    setTimeout(() => whenSettled(fn, (n || 0) + 1), 300);
  }
  function nextScene() {
    if (scene) { scene = null; }
    const a = queue.shift();
    if (a) { scene = { waiting: true }; whenSettled(() => runScene(a)); }
    else { label(); if (curKey() === '2030' && AUTO && !J.revealSeen) { J.revealSeen = true; save(); openThings('noticed'); } }
  }

  /* ---------------- era changes ---------------- */
  function onEra(before) {
    const nowK = curKey(); label(); if (nowK === before) return;
    if (ui.open && byId(ui.open) && false) ui.open = null;
    ui.open = null; if ($('#jyMain') && $('#win-things').classList.contains('open')) { if (ui.tab === 'here') draw(); }
    polishUpdate(); markYourEra();
    if (yourEra() === nowK && !J.greeted) { J.greeted = true; save(); setTimeout(() => toast('this one was yours. you were about ten.'), 1400); }
    if (idx(nowK) < idx(before) && idx(before) >= 0) { J.going.push({ from: before, to: nowK, t: now() }); log('went back: ' + before + ' → ' + nowK); return; }
    if (!AUTO || J.mode === 'free') return;
    const due = C.CFG.anchors.filter((a) => !J.passed[a] && idx(a) <= idx(nowK) && idx(a) > idx(before) && queue.indexOf(a) < 0);
    if (!due.length) return;
    queue = queue.concat(due);
    if (J.mode === 'new') { whenSettled(() => arrival(() => nextScene())); return; }
    if (!scene && modal().hidden) nextScene();
  }
  function hook() {
    const prev = window.setEra; if (typeof prev !== 'function') return;
    window.setEra = function () { const before = curKey(); const r = prev.apply(this, arguments); try { onEra(before); } catch (e) { if (window.console) console.error(e); } return r; };
  }

  /* ---------------- writing: 2024 suggests, 2030 asks ---------------- */
  function applyPolish(s) { return C.POLISH.reduce((t, [re, to]) => t.replace(re, to), s).trim(); }
  let lastSug = '', lastAsk = -1;
  function polishUpdate() {
    const box = $('#jyPolish'), ta = $('#mailText'); if (!ta) return;
    const host = ta.parentNode; let el = box;
    if (!el) { el = document.createElement('div'); el.id = 'jyPolish'; el.setAttribute('role', 'status'); ta.before(el); }
    const k = curKey(), txt = ta.value.trim(); let keepInView = false;
    if (k === '2024' && txt.length > 12) {
      const sug = applyPolish(txt);
      if (sug && sug !== txt) {
        if (sug !== lastSug) { lastSug = sug; J.polish.shown++; save(); }
        el.className = 'jy-polish p2024'; el.hidden = false;
        keepInView = true;
        el.innerHTML = '<b>suggested:</b> ' + esc(sug) + '<div><button type="button" class="btn-95 jy-go" data-p="use">use suggestion</button> <a href="#" data-p="keep">keep mine</a></div><small>a short list of plain rules that removes hedges and apologies. it will not tell you what it removed.</small>';
        try { ta.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older browser */ }
        return;
      }
    }
    if (k === '2030' && txt.length > 12) {
      const qi = Math.floor(txt.length / 40) % C.NOUS.length;
      if (qi !== lastAsk) { lastAsk = qi; J.asks.shown++; save(); }
      el.className = 'jy-polish p2030'; el.hidden = false;
      keepInView = true;
      el.innerHTML = '<b>mote asks:</b> ' + esc(C.NOUS[qi]) + '<div><input class="field" id="jyAnswer" placeholder="answer, or leave it" aria-label="your answer to the question"> <button type="button" class="btn-95" data-p="answered">answered</button></div><small>it asks and writes nothing. your answer is not kept.</small>';
      try { ta.scrollIntoView({ block: 'nearest' }); } catch (e) { /* older browser */ }
      return;
    }
    el.hidden = true; el.innerHTML = '';
  }
  document.addEventListener('input', (e) => { if (e.target.id === 'mailText') polishUpdate(); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-p]'); if (!b) return; e.preventDefault();
    const ta = $('#mailText'), p = b.dataset.p;
    if (p === 'use') { J.polish.accepted++; log('accepted a suggested rewrite'); ta.value = applyPolish(ta.value.trim()); ta.dispatchEvent(new Event('input', { bubbles: true })); }
    else if (p === 'keep') { J.polish.refused++; log('kept their own words'); $('#jyPolish').hidden = true; lastSug = ''; }
    else if (p === 'answered') { J.asks.answered++; log('answered a question'); $('#jyPolish').innerHTML = '<small>noted nowhere. carry on.</small>'; }
    save();
  });

  /* ---------------- public ---------------- */
  window.Journey = {
    state: () => J, things: (k) => (C.THINGS[k] || []), fateOf, open: openThings, begin: () => { J.mode = 'on'; save(); }, free: () => { J.mode = 'free'; save(); },
    reset, exportJSON, pool, made, answer, keepsake, bring, setBorn, yourEra, leave, shelf, keepMine: (o) => { addMine(Object.assign({ kind: 'made', era: curKey(), t: now(), flat: 'user-generated content \u00b7 image' }, o)); toast('you made that. it\u2019s yours now. i\u2019ll put it with your things.'); }, mine: mineThings, save, carrying, byId, eraOf, obj: (t) => objOf(t)[1], runScene: (a) => { queue = [a]; scene = null; nextScene(); }, ALL,
    banner(a) {
      const f = a.fate || 'here', t = byId(a.id); if (!t) return '';
      if (f === 'here') return '<p class="ts-foot">a thing from ' + esc(eraOf(t.era).label) + '. wording is a stand-in.</p>';
      return '<p class="ts-fiction"><b>' + esc(C.FATES[f].label) + '.</b> ' + esc(C.FATES[f].note) + ' ' + (reasonOf(a.id) ? 'reason: ' + esc(reasonOf(a.id)) + '.' : (opaque() ? 'no reason is shown in this era.' : '')) + '</p>';
    },
  };

  function init() {
    build(); hook();
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal() && !modal().hidden && !scene) hideModal(); });
    new MutationObserver(label).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (!/era-1991/.test(document.body.className) || true) { label(); markYourEra(); }
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
