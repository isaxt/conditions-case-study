/* =====================================================================
   future.js: the speculative end, in two steps (0.11, replaces 0.8's "after AI / after the locks").

   STEP 1 · AUTOPILOT       (era 2030)      the way things have been going, kept going. agents run your day,
                                              everything you lost is regenerated as a perfect copy nobody made,
                                              and a version of you keeps posting while you're away. it is fast,
                                              smooth and genuinely convenient. it is also 0% yours.
   STEP 2 · THE HUMAN WEB   (era 2030 + pq) people in charge, machines helping. what you lost comes back whole,
                                              signed and dated. the feed ends. the helper asks before it writes,
                                              and marks its words. a robot fixes the old family computer and shows
                                              its work. you can give a note that can only be given once.

   Both are built from what the visitor did in the archive: what they carried, what they left, what they made,
   whether they took the 2024 rewrite. Not anti-AI: the human web is full of AI, quantum and robots; they just
   work for people's time, creativity and good design. Spectacle entrances live in threshold.js.
   Honest limits: nothing here is a real agent, signature or lock. They are simulations, and the window says so.
   State lives inside the journey record (J.future), so the same export and erase apply.
   ===================================================================== */
(function () {
  'use strict';
  if (!window.Journey || !window.TS_CONTENT) return;
  const C = window.TS_CONTENT;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const J = () => Journey.state();
  const F = () => { const j = J(); j.future = j.future || { dial: null, signed: {}, note: '', noteRead: false, moteRead: false, ended: false }; j.future.signed = j.future.signed || {}; return j.future; };
  const save = () => Journey.save();
  const is2030 = () => /era-2030/.test(document.body.className);
  const isPQ = () => is2030() && document.body.classList.contains('pq');
  const name = () => J().name || 'you';
  const RM = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COPY = {
    aiTitle: 'autopilot', pqTitle: 'the human web',
    spec: 'this part is a guess. nothing here is a real agent, signature or robot; it’s a sketch of how they could behave.',
    dial: ['i do it myself', 'it asks me first', 'it drafts, i edit', 'it just does it'],
    moteNote: (kept) => kept ? 'you carried “' + kept + '” all the way here. i noticed. i’m really glad it was that one.' : 'you came all this way without carrying anything. that’s ok. i liked the company.',
  };

  /* ---------------- what the archive gives the future ---------------- */
  function inputs() {
    const j = J(), carried = Journey.carrying().map((id) => Journey.byId(id)).filter(Boolean), mine = Journey.mine();
    const lost = Object.keys(j.lost || {}).map((id) => ({ t: Journey.byId(id), l: j.lost[id] })).filter((x) => x.t);
    const tally = {}; Object.keys(j.kept || {}).forEach((s) => j.kept[s].forEach((id) => { const t = Journey.byId(id); if (t) tally[t.theme] = (tally[t.theme] || 0) + 1; }));
    const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0] || null;
    const p = j.polish || { accepted: 0, refused: 0 };
    const dialFrom = p.accepted > p.refused ? 2 : 1;
    const why = p.accepted + p.refused === 0 ? 'you never met the 2024 suggestion, so it starts by asking.' : p.accepted > p.refused ? 'in 2024 you took its rewrite ' + p.accepted + ' time' + (p.accepted === 1 ? '' : 's') + ', so it starts by drafting.' : 'in 2024 you kept your own words ' + p.refused + ' time' + (p.refused === 1 ? '' : 's') + ', so it starts by asking.';
    const memory = mine.filter((t) => t.kind === 'memory')[0] || null;
    return { carried, mine, lost, top, dialFrom, why, polish: p, memory };
  }
  const dial = () => { const f = F(); return f.dial == null ? inputs().dialFrom : f.dial; };

  /* ---------------- markup ---------------- */
  function build() {
    if ($('#win-after')) return;
    const w = document.createElement('div'); w.className = 'window'; w.id = 'win-after'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-labelledby', 'fuTitle');
    w.style.cssText = 'width:720px; top:150px; left:280px; z-index:13;';
    w.innerHTML = '<div class="titlebar" onpointerdown="startDrag(event,\'win-after\')"><span class="ttl" id="fuTitle">autopilot</span><div class="winbtns"><button onclick="minimizeWindow(\'win-after\')" aria-label="minimize">_</button><button onclick="closeWindow(\'win-after\')" aria-label="close">×</button></div></div><div class="winbody fu-body" id="fuMain"></div><div class="fu-foot">last edited by: <b id="fuWho">nobody, automatically</b></div>';
    document.body.appendChild(w);
    if (typeof windowTitles !== 'undefined') windowTitles['win-after'] = 'autopilot';
    w.addEventListener('click', onClick); w.addEventListener('input', onInput);
    const b = document.createElement('button'); b.id = 'fuBtn'; b.type = 'button'; b.className = 'btn-95'; b.hidden = true; b.onclick = () => open(); document.body.appendChild(b);
    const next = $('.era-btn[data-era="2030"]');
    if (next) next.textContent = 'the future ▸';
    if (next && !$('#fuStage')) { const s = document.createElement('button'); s.id = 'fuStage'; s.className = 'era-btn'; s.dataset.stage = 'pq'; s.textContent = 'human web ▸▸'; s.title = 'the human web (speculative)'; s.onclick = () => stage('pq', true); next.after(s); }
  }
  function open() { build(); draw(); if (typeof openWindow === 'function') openWindow('win-after'); const w = $('#win-after'); w.classList.add('open'); w.style.display = 'flex'; }
  function stage(s, fromClick) {
    const apply = () => {
      document.body.classList.toggle('pq', s === 'pq'); sync();
      if (s === 'pq') { const lbl = $('#eraLabel'); if (lbl) lbl.textContent = 'the human web (the future)'; open(); }
    };
    const enterPQ = () => (fromClick && s === 'pq' && window.Threshold ? Threshold.handover(apply) : apply());
    if (!is2030()) { stage.keep = s === 'pq'; setEra('2030'); stage.keep = false; if (window.Threshold && Threshold.busy()) { Threshold.after(() => { stage.keep = true; enterPQ(); stage.keep = false; }); return; } }
    if (s === 'pq' && isPQ()) { apply(); return; }
    enterPQ();
  }
  function sync() {
    build(); const b = $('#fuBtn'), st = $('#fuStage'), nx = $('.era-btn[data-era="2030"]');
    b.hidden = !is2030(); b.textContent = isPQ() ? '☀ the human web' : '◎ autopilot';
    if (st) st.classList.toggle('active', isPQ()); if (nx && is2030()) nx.classList.toggle('active', !isPQ());
    const t = $('#fuTitle'); if (t) t.textContent = isPQ() ? COPY.pqTitle : COPY.aiTitle;
    const who = $('#fuWho'); if (who) who.textContent = isPQ() ? name() + ', by hand' : 'nobody, automatically';
    if (!is2030()) { stopAuto(); const w = $('#win-after'); if (w && w.classList.contains('open') && typeof closeWindow === 'function') closeWindow('win-after'); }
    else if ($('#win-after').classList.contains('open')) draw();
  }
  const sec = (id, h, body) => '<section class="fu-sec" id="fu-' + id + '"><h3>' + h + '</h3>' + body + '</section>';
  function draw() {
    const m = $('#fuMain'); if (!m) return;
    stopAuto();
    m.className = 'winbody fu-body ' + (isPQ() ? 'fu-pq' : 'fu-ai');
    m.innerHTML = (isPQ() ? drawPQ() : drawAI()) + '<p class="fu-spec">' + COPY.spec + '</p><div class="fu-say" role="status" id="fuSay"></div>';
    if (draw.mode !== isPQ()) { m.scrollTop = 0; draw.mode = isPQ(); }
    const w = $('#win-after'); if (w) w.classList.toggle('fu-human', isPQ());
    if (!isPQ()) startAuto();
  }
  const say = (t) => { const s = $('#fuSay'); if (s) s.textContent = t; };

  /* ================= STEP 1 · autopilot ================= */
  // corporate rewrite of the visitor's own memory: the meaning survives, the person doesn't
  function polish(line) {
    if (!line) return 'Reflecting on where it all began. Grateful for every step of the journey! #throwback #growth';
    const short = line.length > 60 ? line.slice(0, 57).trim() + '…' : line;
    return 'Reflecting on a cherished early-internet memory: “' + short.replace(/^i /i, 'I ') + '.” Grateful for the journey! #throwback #nostalgia';
  }
  const DAY = (I) => [
    ['08:02', 'replied to 14 messages as you', 'sounded just like you. nobody noticed.'],
    ['08:03', 'wrote today’s journal entry', '“' + polish(I.memory && I.memory.line) + '”'],
    ['09:15', 'liked 312 posts', 'the ones you would probably have liked.'],
    ['11:40', 'summarised the letter your friend took a week to write', '3 bullet points. 9 seconds.'],
    ['13:00', 'turned your favourites into “top picks”', I.carried.length ? I.carried.map((t) => t.title).join(', ') + ', sorted by engagement.' : 'you didn’t carry anything, so it picked for you.'],
    ['16:22', 'went to the guestbook and signed it in your name', 'the owner thinks you stopped by.'],
    ['21:00', 'posted a memory as you', 'you were asleep. it got 48 likes.'],
  ];
  const FEED = ['booked a dentist appointment for you', 'answered a survey as you', 'unfollowed someone you hadn’t opened in a while', 'wished your cousin a happy birthday', 'generated a playlist that sounds like you', 'archived 1,204 photos it decided you didn’t need', 'wrote a review for a place you’ve never been', 'replied “sounds good!” to your group chat', 'made a highlight reel of your year', 'filled in a form with all six fields'];

  function drawAI() {
    const I = inputs(), f = F();
    const lostRows = I.lost.length ? I.lost.slice(0, 5) : [{ t: { title: 'a homemade page', era: '1996' }, l: { scene: '2006' }, sample: true }];
    let h = '<div class="fu-hero ap" aria-hidden="true"><div class="ap-cursor"></div><div class="ap-stat"><b id="apCount">1,204</b><span>things done for you today</span></div><div class="ap-stat"><b>6h 12m</b><span>time saved</span></div><div class="ap-stat red"><b>0%</b><span>of it yours</span></div></div>';
    h += '<p class="fu-lead">welcome back, ' + esc(name()) + '. well, you never really left. the computer has been running your stuff for you, and honestly, it’s really good at it.</p>';
    // 1. your day
    h += sec('day', 'your day, handled', '<ol class="ap-day">' + DAY(I).map((r) => '<li><time>' + r[0] + '</time><div><b>' + esc(r[1]) + '</b><small>' + esc(r[2]) + '</small></div><button type="button" class="ap-undo" disabled title="already sent">undo</button></li>').join('') + '</ol>');
    // 2. what you lost, regenerated
    h += sec('remade', 'it remade what you lost', '<p>you left some things behind on the way here. no problem. it made new ones that look exactly right.</p><div class="ap-remade">' + lostRows.map((x) =>
      '<div class="ap-pair"><div class="ap-orig"><small>yours, ' + esc(Journey.eraOf ? (Journey.eraOf(x.t.era) || {}).label || x.t.era : x.t.era) + '</small><b>' + esc(x.t.title) + '</b><em>left behind in ' + esc(x.l.scene || '') + '</em></div><span class="ap-arrow">→</span><div class="ap-gen"><small>generated, 2030</small><b>' + esc(x.t.title) + ' (perfect copy)</b><em>looks right · made by nobody</em></div></div>').join('') + '</div>' + (lostRows[0].sample ? '<p class="ap-note">(you didn’t lose anything, so here’s someone else’s.)</p>' : ''));
    // 3. the you it learned
    const voice = I.polish.accepted > I.polish.refused ? 'you let it rewrite you, so it writes the way it thinks you write.' : I.polish.refused ? 'you kept your own words, so it studied them until it could do them too.' : 'it never saw you write, so it made up a voice for you.';
    h += sec('you', 'the you it learned', '<div class="ap-twin"><div class="ap-av" aria-hidden="true"></div><div><b>' + esc(name()) + ' (auto)</b><p>' + esc(voice) + ' it keeps posting while you’re away, so nobody misses you.</p>' + (I.top ? '<p class="ap-tags"><i>likes: ' + esc(C.THEMES[I.top]) + '</i><i>active: always</i><i>mood: optimised</i></p>' : '<p class="ap-tags"><i>likes: whatever performs</i><i>active: always</i></p>') + '</div></div>' +
      '<p class="ap-live-h">while you were reading this, it also:</p><ul class="ap-live" id="apLive" aria-live="off"></ul>');
    h += '<p class="fu-next"><button type="button" class="fu-btn go wheel" data-a="pq">take the wheel back ▸▸</button><small>it’s all very convenient. none of it is you.</small></p>';
    return h;
  }
  let autoT = 0, countT = 0;
  function startAuto() {
    if (RM()) return;
    let n = 1204, k = 0;
    countT = setInterval(() => { const c = $('#apCount'); if (!c) return; n += 1 + Math.floor(Math.random() * 6); c.textContent = n.toLocaleString('en-US'); }, 700);
    autoT = setInterval(() => {
      const ul = $('#apLive'); if (!ul) return;
      const li = document.createElement('li'); li.textContent = FEED[k++ % FEED.length]; ul.prepend(li);
      while (ul.children.length > 5) ul.lastChild.remove();
    }, 2200);
  }
  function stopAuto() { clearInterval(autoT); clearInterval(countT); autoT = countT = 0; }

  /* ================= STEP 2 · the human web ================= */
  function drawPQ() {
    const I = inputs(), f = F(), d = dial(), kept = I.carried[0];
    let h = '<div class="fu-hero hw" aria-hidden="true"><div class="hw-sky"></div><div class="hw-sun"></div><div class="hw-ring r1"></div><div class="hw-ring r2"></div><div class="hw-grid"></div><div class="hw-motes">' + Array.from({ length: 14 }, (_, i) => '<i style="--i:' + i + '"></i>').join('') + '</div><div class="hw-sign"><small>the human web</small>made by people<br>helped by machines</div></div>';
    h += '<p class="fu-lead">hi ' + esc(name()) + '. this one is still full of AI, quantum computers and robots. the difference is who they work for: your time, the things you make, and design that’s actually good.</p>';
    // 1. everything back
    const back = I.lost.map((x) => '<li><span class="hw-stamp">back</span><b>' + esc(x.t.title) + '</b><small>' + (x.t.mine ? 'made by you' : 'made by someone, ' + esc((Journey.eraOf(x.t.era) || {}).label || x.t.era)) + ' · lost in ' + esc(x.l.scene) + ' · back whole, colours and all</small></li>').join('');
    const carried = I.carried.map((t) => '<li class="carried"><span class="hw-stamp">yours</span><b>' + esc(t.title) + '</b><small>you carried this one yourself, the whole way</small></li>').join('');
    const mine = I.mine.map((t) => '<li class="mine"><span class="hw-stamp">' + (f.signed[t.id] ? 'signed' : 'made') + '</span><b>' + esc(t.title) + '</b><small>' + (f.signed[t.id] ? 'signed by ' + esc(name()) + ' · ' + esc((Journey.eraOf(t.era) || {}).label || t.era) : 'by you, ' + esc((Journey.eraOf(t.era) || {}).label || t.era)) + '</small>' + (f.signed[t.id] ? '' : '<button type="button" class="fu-btn sm" data-a="sign" data-id="' + t.id + '">sign it</button>') + '</li>').join('');
    h += sec('back', 'everything you lost, back', '<p>every thing keeps its history now: who made it, when, and what happened to it. nothing gets flattened on the way.</p>' + ((back + carried + mine) ? '<ul class="hw-back">' + carried + back + mine + '</ul>' : '<p class="hw-empty">nothing carried, nothing lost. a clean slate is allowed too.</p>'));
    // 2. time
    h += sec('time', 'your time is worth something here', '<div class="hw-time"><div class="hw-feed">' + ['a friend posted a drawing', 'your cousin started a garden page', 'the forum has 3 new replies', 'someone signed your guestbook'].map((x) => '<p>' + x + '</p>').join('') + '<p class="hw-end">that’s everything for today. see you tomorrow! ☀</p></div><ul class="hw-rules"><li>the feed ends.</li><li>no streaks, no “are you still watching?”</li><li>nothing plays by itself.</li><li>slow things are allowed to stay slow.</li></ul></div>');
    // 3. the helper
    h += sec('helper', 'a helper that asks first', '<p>' + esc(I.why) + ' you’re in charge of the dial.</p><input type="range" min="0" max="3" step="1" value="' + d + '" id="fuDial" aria-label="how much the helper does"><div class="fu-dial-l">' + COPY.dial.map((x, i) => '<span class="' + (i === d ? 'on' : '') + '">' + x + '</span>').join('') + '</div>' +
      '<label class="fu-write">try it: write a line to someone<textarea id="fuLine" rows="2" maxlength="160" placeholder="start a sentence…"></textarea></label><div id="fuDraft" class="fu-draft" aria-live="polite"></div>' +
      '<div class="hw-bot"><div class="hw-arm" aria-hidden="true"><i></i><b></b></div><p>meanwhile, a little robot fixed the old family computer from 1991. it left a note: <i>“replaced the battery, cleaned the keyboard, kept the stickers. everything’s where you left it.”</i></p></div>');
    // 4. give
    h += sec('give', 'a note you can only give once', '<p>quantum messages can’t be copied, only handed over. so giving something means something again.</p>' +
      '<div class="fu-q"><b>from mote, for you</b>' + (f.moteRead ? '<p class="fu-gone">read once. it’s gone now, and that’s ok.</p>' : '<button type="button" class="fu-qenv" data-a="read">✉ <span>open it (once)</span></button> <button type="button" class="fu-btn" data-a="copy">copy it first</button>') + '<div id="fuQ"></div></div>' +
      '<label class="fu-write">leave one for the next person at this computer<input id="fuNote" maxlength="80" value="' + esc(f.note || '') + '" placeholder="they can read it exactly once"></label><button type="button" class="fu-btn" data-a="leave">give it</button>');
    h += sec('home', 'take it home', '<p>everything that was yours comes back with you, signed and dated.' + (kept ? ' you carried <b>' + esc(kept.title) + '</b> all the way to the end.' : '') + '</p><button type="button" class="fu-btn go" data-a="home">take it home</button>');
    return h;
  }
  // the helper's "draft": plain rules, no model. its words are marked so the visitor can see whose is whose.
  const TAILS = [' and i hope you are doing well.', ' — let me know what works for you.', ' and thank you again for everything.'];
  function draft() {
    const ta = $('#fuLine'), box = $('#fuDraft'); if (!ta || !box) return; const v = ta.value.trim(), d = dial();
    if (v.length < 6) { box.innerHTML = ''; return; }
    const words = v.split(/\s+/).length;
    if (d === 0) box.innerHTML = '<p class="fu-mine-w">' + esc(v) + '</p><small>100% yours. it did nothing, like you asked.</small>';
    else if (d === 1) box.innerHTML = '<p class="fu-ask">mote asks: ' + esc(C.NOUS[v.length % C.NOUS.length]) + '</p><small>100% yours. it asked, and wrote nothing.</small>';
    else if (d === 2) { const t = TAILS[v.length % TAILS.length], tw = t.trim().split(/\s+/).length; box.innerHTML = '<p><span class="fu-mine-w">' + esc(v) + '</span><span class="fu-its-w">' + esc(t) + '</span></p><small>' + Math.round(100 * words / (words + tw)) + '% yours. <span class="fu-its-w">its words are marked</span>, and you can <button type="button" class="fu-btn sm" data-a="strip">take them out</button></small>'; }
    else box.innerHTML = '<p class="fu-its-w">Hi! Just following up on this. Let me know what works for you, and thanks again for everything.</p><small>0% yours. even here, you can still choose that. it’s marked so everyone knows.</small>';
  }

  /* ---------------- events ---------------- */
  function onInput(e) {
    if (e.target.id === 'fuDial') { F().dial = +e.target.value; save(); const v = ($('#fuLine') || {}).value; draw(); const ta = $('#fuLine'); if (ta && v) { ta.value = v; draft(); } const d = $('#fuDial'); if (d) d.focus(); }
    else if (e.target.id === 'fuLine') draft();
  }
  function onClick(e) {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; e.preventDefault();
    const a = b.dataset.a, f = F(), id = b.dataset.id; let redraw = true, msg = '';
    if (a === 'sign') { f.signed[id] = 1; msg = 'signed. from now on it carries your name.'; }
    else if (a === 'strip') { redraw = false; const box = $('#fuDraft'); box.innerHTML = '<p class="fu-mine-w">' + esc($('#fuLine').value.trim()) + '</p><small>100% yours again.</small>'; }
    else if (a === 'pq') { stage('pq', true); return; }
    else if (a === 'read') { redraw = false; f.moteRead = true; save(); const kept = Journey.carrying().map((i) => Journey.byId(i)).filter(Boolean)[0]; const q = $('#fuQ'); q.innerHTML = '<p class="fu-qmsg">' + esc(COPY.moteNote(kept && kept.title)) + '</p>'; b.parentNode.querySelectorAll('button').forEach((x) => x.remove()); setTimeout(() => { const g = $('#fuQ'); if (g) g.insertAdjacentHTML('beforeend', '<small>you’ve read it now. nobody else can.</small>'); }, 2400); }
    else if (a === 'copy') { redraw = false; $('#fuQ').innerHTML = '<p class="fu-qmsg scr">y̶o̶u̶ ?¿ c̷a̷r̷ ░▒▓ ¿? a̶l̶l̶</p><small>it can’t be copied. the copy is just noise, and the note is still unread.</small>'; }
    else if (a === 'leave') { const v = ($('#fuNote').value || '').trim(); if (v) { f.note = v.slice(0, 80); f.noteRead = false; msg = 'given. the next person can read it once.'; } }
    else if (a === 'home') { Journey.open('yours'); return; }
    save(); if (redraw) { draw(); if (msg) say(msg); }
  }

  /* ---------------- wiring ---------------- */
  function init() {
    build();
    const prev = window.setEra;
    window.setEra = function () { const r = prev.apply(this, arguments); if (!stage.keep) document.body.classList.remove('pq'); sync(); if (is2030() && !isPQ() && !/quick/.test(location.hash)) setTimeout(() => { if (is2030() && !isPQ()) open(); }, 900); return r; };
    sync();
  }
  window.Future = { open, stage, inputs, dial, state: F, isPQ };
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
