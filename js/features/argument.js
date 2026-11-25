/* =====================================================================
   argument.js — five small features that make the thesis argument visible (0.9). All invented; no real products.
   Read DEV-API.md. Uses window.TSKit and window.Journey. Styles: css/features/argument.css. Test: tests/argument.js.

   1  say hi (same task, twelve eras)   icon "say hi", 1993–2030, #win-sayhi
      One task, "tell a friend you're thinking of them", done the way each year did it, then a tally of what it
      asked of you. ARGUMENT: the task never changed; what got optimised away was your part in it.
   2  the effort meter                   a quiet chip, every era, opens #win-effort
      Counts the keystrokes and choices each era has asked of you. ARGUMENT: "frictionless" is a measurement of
      how few of the decisions were yours.
   3  the defaults room                  icon "defaults", 1993–2030, #win-defaults
      What was already decided before you arrived, as that year's own settings dialog. ARGUMENT: authorship is
      not taken in one move; it is pre-ticked, one reasonable default at a time.
   4  one sentence                       icon "one sentence", 1996–2030, #win-sentence
      Your own sentence as six systems would show it: handwritten, templated, truncated, ranked, summarised,
      returned. ARGUMENT: the words stay the same; each system keeps only the part of them it has a use for.
   5  what the metric saw                a switch beside the effort chip, every era, #agMetric
      The screen as that era's measurement sees it: hits, clicks, engagement, a predicted next action, and in
      2030 nothing unless you ask. ARGUMENT: a system can only optimise what it counts, and it never counted
      what the thing was for.

   WHAT IT KEEPS (TSKit.state('argument'), this browser only, erased with the journey): counts only.
   effort[era] = { k keystrokes, c choices }, hi[era] = { keys, choices, secs, mine, words }, share (a 2030 dial).
   Never the text you type: messages, names and settings choices live in memory until the page closes.
   The one exception is opt-in and says so: "keep it" in one sentence hands the sentence to Journey.answer().
   ===================================================================== */
(function () {
  'use strict';
  const K = window.TSKit; if (!K) return;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = K.esc, era = K.era, yr = K.yr;
  const ERAS = ['1991', '1993', '1996', '1999', '2004', '2006', '2008', '2010', '2014', '2016', '2024', '2030'];
  const S = K.state('argument', { effort: {}, hi: {}, share: 50 });
  S.data.effort = Object.assign({}, S.data.effort); S.data.hi = Object.assign({}, S.data.hi);   // TSKit.state copies defaults shallowly: keep its defaults untouched so a reset really is empty
  const J = () => window.Journey;
  const label = (k) => { try { return J().eraOf(k).label; } catch (e) { return k; } };
  const grp = (y) => (y <= 2008 ? 'old' : y <= 2024 ? 'pill' : 'own');           // how the chip and panel dress
  const retitle = (id, t) => { K.title(id, t); if (typeof refreshTabs === 'function') refreshTabs(); };   // keep the taskbar tab in step with the era
  const pad = (n, w) => String(Math.max(0, Math.round(n))).padStart(w, '0');

  /* =========================== 2 · the effort meter ===========================
     Counts, per era: printable keys typed into fields, and clicks on buttons, links and inputs.
     Its own chip, panel and the metric overlay are not counted (looking at the meter is not effort the era asked for). */
  const eff = (k) => S.data.effort[k] || (S.data.effort[k] = { k: 0, c: 0 });
  const typable = (t) => !!t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && !/^(checkbox|radio|range|button|submit)$/.test(t.type)) || t.isContentEditable);
  let saveT = 0, drawT = 0;
  function bump() {
    clearTimeout(saveT); saveT = setTimeout(() => S.save(), 400);
    if (!drawT) drawT = requestAnimationFrame(() => { drawT = 0; drawChip(); if (K.isOpen('win-effort')) drawEffort(); if (M.on) drawMetric(); });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey || !typable(e.target)) return;
    eff(era()).k++; if (hi.live && e.target.closest('#win-sayhi')) { hi.keys++; hi.t0 = hi.t0 || Date.now(); } bump();
  }, true);
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('button, a, input, select, textarea, [role=button], [role=switch]');
    if (M.on && !(e.target.closest && e.target.closest('#agMetric, #agDock'))) metricClick(e);
    if (!t || t.closest('#agDock, #win-effort, #agMetric')) return;
    eff(era()).c++; if (hi.live && t.tagName === 'BUTTON' && t.closest('#win-sayhi .hi')) { hi.choices++; hi.t0 = hi.t0 || Date.now(); } bump();
  }, true);

  function dock() {
    let d = $('#agDock'); if (d) return d;
    d = document.createElement('div'); d.id = 'agDock';
    d.innerHTML = '<button type="button" id="agChip" aria-haspopup="dialog"></button><button type="button" id="agMetricBtn" aria-pressed="false" title="what the metric saw (a simulation)"></button>';
    document.body.appendChild(d);
    $('#agChip').onclick = () => open('effort'); $('#agMetricBtn').onclick = () => metric();
    return d;
  }
  function drawChip() {
    const d = dock(), y = yr(), g = grp(y), e = eff(era()), n = e.k + e.c;
    d.className = 'ag-' + g + ' ag-y' + era();
    const c = $('#agChip');
    c.innerHTML = g === 'old' ? '<i>effort</i><b class="ag-odo">' + pad(n, 5).split('').map((x) => '<u>' + x + '</u>').join('') + '</b>'
      : g === 'pill' ? '<span class="ag-ring" aria-hidden="true"></span><i>' + (y >= 2024 ? 'Activity today' : 'Activity') + '</i><b>' + n + '</b>'
        : '<i>asked of you</i><b>' + n + '</b>';
    c.setAttribute('aria-label', 'effort meter: ' + e.k + ' keystrokes and ' + e.c + ' choices asked of you in ' + label(era()) + '. open the meter');
    const m = $('#agMetricBtn'); m.setAttribute('aria-pressed', String(M.on));
    m.innerHTML = '<span aria-hidden="true">◉</span> ' + (g === 'old' ? 'what the metric saw' : g === 'pill' ? 'Metric view' : 'what is measured');
  }
  function drawEffort() {
    const y = yr(), g = grp(y), cur = era(), rows = ERAS.filter((k) => S.data.effort[k] && (k === cur || eff(k).k + eff(k).c > 0));
    if (!rows.includes(cur)) rows.push(cur); rows.sort();
    const max = Math.max(10, ...rows.map((k) => eff(k).k + eff(k).c));
    const bars = rows.map((k) => { const e = eff(k); return '<div class="ef-row' + (k === cur ? ' cur' : '') + '"><span>' + esc(label(k)) + '</span><div class="ef-bar"><i style="width:' + (e.k / max * 100) + '%"></i><i class="c" style="width:' + (e.c / max * 100) + '%"></i></div><em>' + e.k + ' keys · ' + e.c + (e.c === 1 ? ' choice' : ' choices') + '</em></div>'; }).join('');
    $('#efUI').className = 'ef ef-' + g + ' ef-y' + cur;
    $('#efUI').innerHTML = '<div class="ef-head"><b>' + (g === 'old' ? 'effort odometer' : g === 'pill' ? 'Activity' : 'what each era asked of you') + '</b><span>' + (g === 'pill' ? 'Keystrokes and taps, by era' : 'your keystrokes and choices, era by era') + '</span></div>' +
      '<div class="ef-chart" role="img" aria-label="' + rows.map((k) => label(k) + ': ' + eff(k).k + ' keystrokes, ' + eff(k).c + ' choices').join('; ') + '">' + bars + '</div>' +
      '<p class="ef-key"><i></i> keystrokes <i class="c"></i> choices (clicks on buttons, links, fields)</p>' +
      '<p class="ef-line">a system would call a low number “frictionless”. it also means fewer of the decisions were yours.</p>' +
      (g === 'own' ? '<div class="ef-own"><label for="efShare">here the number is yours to set. how much of the doing do you want back?</label><input type="range" id="efShare" min="0" max="100" step="10" value="' + (S.data.share | 0) + '"><output id="efShareOut">' + shareWords(S.data.share) + '</output></div>' : '') +
      '<div class="ef-acts"><button type="button" role="switch" id="efMetric" aria-checked="' + M.on + '"><span class="ef-sw" aria-hidden="true"></span>what the metric saw</button>' +
      (y >= 1993 ? '<button type="button" data-ag="defaults">defaults</button>' : '') + (y >= 1996 ? '<button type="button" data-ag="sentence">one sentence</button>' : '') + '</div>' +
      '<p class="ef-foot">only these counts are kept, per era, in this browser. nothing about what you typed or clicked on. erasing your journey erases them.</p>';
  }
  const shareWords = (v) => (v <= 20 ? 'do most of it for me' : v <= 60 ? 'ask me about the parts that are mine' : 'leave it to me. i will ask when i want help');
  function openEffort() {
    const w = K.win('win-effort', 'effort', 380, '<div id="efUI"></div>');
    if (!w.dataset.wired) {
      w.dataset.wired = 1;
      w.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'efMetric') { metric(); const m = $('#efMetric'); if (m) m.focus(); } else if (b.dataset.ag) open(b.dataset.ag); });
      w.addEventListener('input', (e) => { if (e.target.id === 'efShare') { S.data.share = +e.target.value; $('#efShareOut').textContent = shareWords(S.data.share); S.save(); } });
    }
    drawEffort(); K.show('win-effort');
  }

  /* =========================== 1 · say hi ===========================
     Each era is a small form. Fields marked data-mine carry the visitor's own words; data-hi-q buttons send words the
     system supplied. On send we count: keys typed in the window, buttons pressed, seconds, and whose words they were. */
  const FRIEND = 'a friend';
  const hi = { live: false, keys: 0, choices: 0, t0: 0, last: null };
  const inp = (n, ph, mine, max) => '<input data-hi="' + n + '"' + (mine ? ' data-mine' : '') + ' maxlength="' + (max || 60) + '" autocomplete="off" placeholder="' + esc(ph) + '" aria-label="' + esc(ph || n) + '">';
  const area = (ph, max) => '<textarea data-hi="body" data-mine rows="3" maxlength="' + (max || 240) + '" placeholder="' + esc(ph) + '" aria-label="' + esc(ph) + '"></textarea>';
  const go = (l) => '<button type="button" class="hi-go" data-hi-go>' + l + '</button>';
  const q = (text, l, cls) => '<button type="button" class="hi-q ' + (cls || '') + '" data-hi-q="' + esc(text) + '">' + (l || esc(text)) + '</button>';
  const pick = (n, opts, lbl) => '<div class="hi-pick" role="group" aria-label="' + esc(lbl) + '"><span>' + esc(lbl) + '</span>' + opts.map((o, i) => '<button type="button" data-hi-pick="' + n + ':' + o[0] + '" aria-pressed="' + (i === 0) + '">' + o[1] + '</button>').join('') + '</div>';
  const row = (l, f) => '<label class="hi-row"><span>' + l + '</span>' + f + '</label>';
  const HI = {
    '1993': () => '<div class="hi-top">MAIL 1.2 &nbsp; compose &nbsp; (no address book, no drafts)</div><p class="hi-hint">' + FRIEND + ' is at <b>afriend@campus.example</b>. you type the address, the subject and every word.</p>' +
      row('To:', inp('to', 'someone@somewhere')) + row('Subject:', inp('subj', 'subject', true)) + area('the message') + go('Send'),
    '1996': () => '<div class="hi-top">~*~ ' + FRIEND + '’s guestbook ~*~</div><p class="hi-hint">thanks for stopping by!! please sign before you go.</p>' + row('Your name:', inp('name', 'your name')) +
      area('write anything') + pick('card', [['sun', '🌻'], ['cat', '🐱'], ['bow', '🌈']], 'a picture for your entry') + '<button type="button" class="hi-midi" data-hi-midi>♪ add a little tune</button>' + go('Sign the Guestbook!'),
    '1999': () => '<div class="hi-top">afriend2000 — Instant Message</div><p class="hi-away"><b>afriend2000</b> is away: <i>“brb dinner ~*~ leave a msg”</i></p>' + row('your screen name:', inp('name', 'make one up', false, 16)) +
      '<div class="hi-line">' + inp('body', 'type a message', true, 200).replace('data-hi="body"', 'data-hi="body" data-enter') + go('Send') + '</div>',
    '2004': () => '<div class="hi-top">' + FRIEND + '’s weblog</div><div class="hi-post"><b>new host!</b><p>moved the whole blog over the weekend. say hi so i know the comments still work.</p><small>posted 11:42 pm · 0 comments</small></div>' +
      row('Name', inp('name', 'name (optional)')) + area('leave a comment') + go('Post Comment'),
    '2006': () => '<div class="hi-top">' + FRIEND + '’s Friends Comments</div>' + area('leave a comment (html ok!!)', 200) + pick('glit', [['pink', '✨ pink'], ['rain', '🌈 rainbow'], ['gold', '⭐ gold']], 'glitter') + go('Post A Comment'),
    '2008': () => '<div class="hi-top"><b>' + FRIEND + '</b> &nbsp;Wall · Info · Photos</div>' + area('Write something…', 420) + '<div class="hi-line">' + q('', '👉 Poke ' + FRIEND, 'poke') + go('Share') + '</div>',
    '2010': () => '<div class="hi-top">New photo</div><div class="hi-photo" aria-label="a photo of a window at dusk (drawn in CSS)"></div>' + pick('filt', [['none', 'Normal'], ['warm', 'Amber'], ['fade', '1977-ish'], ['mono', 'Inkwell-ish']], 'filter') +
      '<div class="hi-line">' + inp('body', 'Write a caption… @afriend', true, 140).replace('data-hi="body"', 'data-hi="body" data-enter') + go('Share') + '</div>',
    '2014': () => '<div class="hi-card"><div class="hi-who"><span class="hi-av"></span><b>' + FRIEND + '</b><small>2 hrs</small></div><p>long week.</p></div><div class="hi-react" role="group" aria-label="react">' + ['👍', '❤️', '😂', '😮', '😢'].map((x) => q(x)).join('') + '</div>' +
      '<div class="hi-stick" role="group" aria-label="stickers">' + ['🤗', '🌻', '🐥'].map((x) => q(x)).join('') + '</div><div class="hi-line">' + inp('body', 'Write a comment…', true, 200).replace('data-hi="body"', 'data-hi="body" data-enter') + go('Post') + '</div>',
    '2016': () => '<div class="hi-story"><div class="hi-who"><span class="hi-av"></span><b>' + FRIEND + '</b><small>4h</small><em>🔥 12</em></div><p>long week.</p></div><div class="hi-react" role="group" aria-label="quick reactions">' + ['😂', '😮', '😍', '😢', '👏', '🔥'].map((x) => q(x)).join('') + '</div>' +
      '<div class="hi-line">' + inp('body', 'Send message', true, 200).replace('data-hi="body"', 'data-hi="body" data-enter') + go('Send') + '</div>',
    '2024': () => '<div class="hi-who"><span class="hi-av"></span><b>' + FRIEND + '</b><small>Active 3d ago</small></div><div class="hi-assist"><span>◇ You haven’t talked in a while. Assistant can check in for you.</span>' + q('Hi! Just checking in. Thinking of you, hope you’re having a great week! 💛', 'Send for me', 'auto') + '</div>' +
      '<div class="hi-sugg" role="group" aria-label="suggested replies">' + ['Thinking of you! 💛', 'Miss you!', 'Hope you’re well 🙏'].map((x) => q(x)).join('') + '</div><div class="hi-line">' + inp('body', 'Message', true, 200).replace('data-hi="body"', 'data-hi="body" data-enter') + go('↑') + '</div>',
    '2030': () => '<p class="hi-ask">before anything is written: <b>what do you want ' + FRIEND + ' to feel?</b></p>' + inp('feel', 'in your own words', true, 80) + pick('mode', [['mine', 'i’ll write it'], ['draft', 'draft it, i’ll change it'], ['agent', 'send it for me']], 'how much should your agent do?') +
      '<div id="hi30">' + area('your message, all yours') + '</div><p class="hi-hint">whichever you choose, ' + FRIEND + ' is told who wrote it.</p>' + go('send'),
  };
  const WAIT = { '1993': [2400, ['Connecting to mailhost…', 'HELO campus.example', 'DATA … 250 OK']], '1996': [1100, ['Contacting host…', 'Document: Done.']], '1999': [500, ['sending…']] };
  const SENT = {
    '1993': 'Message queued. It arrives when their machine next checks for mail: a few minutes, or tomorrow.', '1996': 'signed!! your entry is at the bottom of the page with today’s date, for anyone to read.',
    '1999': 'sent. Auto response from afriend2000: brb dinner ~*~ leave a msg', '2004': 'Comment posted. It sits under the post, in the order it was written.', '2006': 'comment posted on ' + FRIEND + '’s page. everyone who visits gets the glitter.',
    '2008': 'Posted on ' + FRIEND + '’s Wall.', '2010': 'Shared. 1 photo, 1 filter, 1 caption.', '2014': 'Sent.', '2016': 'Delivered. 🔥 13', '2024': 'Sent', '2030': 'sent, and signed with who wrote which part.',
  };
  const words = (s) => String(s || '').toLowerCase().match(/[\p{L}\p{N}’']+/gu) || [];
  /* whose words: every word of the sent text that the system did not supply counts as the visitor's */
  function whose(text, supplied) { const pool = {}; words(supplied).forEach((w) => { pool[w] = (pool[w] || 0) + 1; }); const all = words(text); let n = 0; all.forEach((w) => { if (pool[w]) pool[w]--; else n++; }); return [n, all.length]; }

  function drawHi(sent) {
    const k = era(), ui = $('#hiUI'); if (!ui || !HI[k]) return;
    retitle('win-sayhi', 'say hi · ' + label(k));
    hi.live = !sent; if (!sent) { hi.keys = 0; hi.choices = 0; hi.t0 = 0; }
    const body = sent ? '<p class="hi-rcpt">' + esc(sent.note || SENT[k]) + '</p><div class="hi-msg" data-o="' + esc(sent.opt || '') + '">' + (sent.text ? esc(sent.text) : '<i>(no words)</i>') + '</div>' + tally(k) + '<button type="button" class="hi-again" data-hi-again>do it again</button>'
      : '<p class="hi-task">the task, every year: <b>tell ' + FRIEND + ' you’re thinking of them.</b> <small>(' + FRIEND + ' is a stand-in. nothing is sent anywhere.)</small></p>' + HI[k]() + '<p class="hi-err" role="alert"></p><p class="hi-status" role="status"></p>';
    ui.innerHTML = '<div class="hi hi-y' + k + (sent ? ' sent' : '') + '">' + body + '</div>' + strip(k);
  }
  function tally(k) {
    const r = S.data.hi[k]; if (!r) return '';
    const cell = (n, l) => '<div><dd>' + n + '</dd><dt>' + l + '</dt></div>';
    return '<div class="ag-tally" role="status"><b>what ' + esc(label(k)) + ' asked of you</b><dl>' + cell(r.keys, 'keystrokes') + cell(r.choices, r.choices === 1 ? 'choice' : 'choices') + cell(r.secs + 's', 'time') + cell(r.words ? r.mine + ' of ' + r.words : 'none', 'words yours') + '</dl>' +
      '<p>' + (k === '2030' ? 'this time the split was yours to set.' : r.keys < 3 ? 'one tap. it works, and it is kind. none of it had to come from you.' : 'every one of those was you.') + ' only these counts are kept, in this browser. your words are not.</p></div>';
  }
  /* "so far": one column per era, bar = keystrokes, figure = % of the words that were yours */
  function strip(cur) {
    const ks = ERAS.slice(1), max = Math.max(20, ...ks.map((k) => (S.data.hi[k] || {}).keys || 0)), done = ks.filter((k) => S.data.hi[k]);
    const cols = ks.map((k) => { const r = S.data.hi[k], pct = r ? (r.words ? Math.round(r.mine / r.words * 100) : 0) : null; return '<div class="ag-col' + (r ? ' done' : '') + (k === cur ? ' cur' : '') + '"><i style="height:' + (r ? Math.max(2, r.keys / max * 44) : 44) + 'px"></i><b>' + (r ? pct + '%' : k === '2030' ? 'yours' : '·') + '</b><span>’' + k.slice(2) + '</span></div>'; }).join('');
    return '<div class="ag-strip" role="img" aria-label="so far: ' + (done.map((k) => label(k) + ' ' + S.data.hi[k].keys + ' keystrokes, ' + (S.data.hi[k].words ? Math.round(S.data.hi[k].mine / S.data.hi[k].words * 100) : 0) + ' percent yours').join('; ') || 'no eras done yet') + '"><em>so far · bar: your keystrokes · figure: how much of it was your words' + (S.data.hi['2030'] ? '' : ' · 2030: yours to set') + '</em><div class="ag-cols">' + cols + '</div></div>';
  }
  function hiSend(text, supplied, note, opt) {
    const k = era(), ui = $('#win-sayhi .hi'), w = WAIT[k] || [250, [yr() >= 2030 ? 'sending…' : 'Sending…']], st = $('.hi-status', ui);
    hi.live = false; $$('button, input, textarea', ui).forEach((b) => { b.disabled = true; });
    w[1].forEach((line, i) => setTimeout(() => { if (st) st.textContent = line; }, i * w[0] / w[1].length));
    const keys = hi.keys, choices = hi.choices, t0 = hi.t0 || Date.now();
    setTimeout(() => {
      if (era() !== k) return; const [mine, n] = whose(text, supplied);
      S.data.hi[k] = { keys, choices, secs: Math.max(1, Math.round((Date.now() - t0) / 1000)), mine, words: n }; S.save();
      if (yr() >= 2008 && typeof logReceipt === 'function') logReceipt('said hi to ' + FRIEND, keys + ' keystrokes');
      K.tone(660, 0.12, 'sine', 0.04, 880); drawHi({ text, note, opt });
    }, w[0]);
  }
  function hiClick(e) {
    const b = e.target.closest('button'), ui = $('#win-sayhi .hi'); if (!b || !ui) return;
    const val = (n) => (($('[data-hi="' + n + '"]', ui) || {}).value || '').trim(), err = (m) => { $('.hi-err', ui).textContent = m; };
    if (b.dataset.hiAgain !== undefined) return drawHi();
    if (b.dataset.hiPick) {                                                    // a choice: filter, glitter, picture, or how much the agent does
      const [n, v] = b.dataset.hiPick.split(':'); $$('button', b.parentNode).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); ui.dataset[n] = v;
      if (n === 'mode') { const feel = val('feel') || 'thought of'; $('#hi30').innerHTML = v === 'agent' ? '<p class="hi-hint">your agent will write it from what you said above, and say that it did.</p>' : area(v === 'draft' ? 'change any of it' : 'your message, all yours'); if (v === 'draft') { $('#hi30 textarea').value = 'thinking of you today. i hope you feel ' + feel + '.'; ui.dataset.draft = $('#hi30 textarea').value; } }
      return;
    }
    if (b.dataset.hiMidi !== undefined) { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => K.tone(f, 0.16, 'square', 0.03), i * 130)); b.textContent = '♪ ♫ tune added ♫ ♪'; ui.dataset.tune = 1; return; }
    if (b.dataset.hiQ !== undefined) {                                         // one tap: the system's words (or no words at all)
      const t = b.dataset.hiQ; return hiSend(t, t, b.classList.contains('poke') ? 'You poked ' + FRIEND + '. That is the whole message.' : b.classList.contains('auto') ? 'Sent by Assistant on your behalf.' : '');
    }
    if (b.dataset.hiGo === undefined) return;
    const k = era(), body = val('body');
    if (k === '1993' && !/^\S+@\S+$/.test(val('to'))) return err('550 no such user. the address has to be typed exactly: afriend@campus.example');
    if (k === '2030') {
      const feel = val('feel'), mode = ui.dataset.mode || 'mine', me = (J() && J().state().name) || 'you';
      if (mode === 'agent') { if (!feel) return err('your agent needs one thing from you first: what should they feel?'); return hiSend(FRIEND + ', ' + me + ' is thinking of you and wants you to feel ' + feel + '.', FRIEND + ', ' + me + ' is thinking of you and wants you to feel', 'sent. written by your agent, from the words you gave it. ' + FRIEND + ' can see that.'); }
      if (!body) return err('nothing to send yet.');
      return hiSend(body, mode === 'draft' ? ui.dataset.draft || '' : '', mode === 'draft' ? 'sent. drafted by your agent, changed by you. ' + FRIEND + ' can see which words were whose.' : 'sent. written by you. your agent only carried it.');
    }
    if (!body) return err(yr() <= 2010 ? 'you have to write something first. nobody else will.' : 'Write a message, or pick one above.');
    hiSend((val('subj') ? val('subj') + ' — ' : '') + body, '', '', ui.dataset.glit || ui.dataset.filt || ui.dataset.card || '');
  }
  function openHi() {
    const w = K.win('win-sayhi', 'say hi', 430, '<div id="hiUI"></div>');
    if (!w.dataset.wired) { w.dataset.wired = 1; w.addEventListener('click', hiClick); w.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter !== undefined) { e.preventDefault(); const g = $('#win-sayhi [data-hi-go]'); if (g) g.click(); } }); }
    drawHi(); K.show('win-sayhi');
  }

  /* =========================== 3 · the defaults room ===========================
     Each item: [label, pre-set on?, lock]. lock: 'r' resists (asks if you are sure), 'v' reverts (switches itself back on),
     'm' managed (cannot be changed). 2030 items add who set it and why. Choices live in memory only. */
  const DEF = {
    '1993': ['Preferences', 'Nothing here was chosen for you. You decide.', [['Load images automatically', 0], ['Underline links', 0]]],
    '1996': ['General Preferences', 'Everything starts off. Switch on what you want.', [['Auto load images', 0], ['Play sounds on pages', 0], ['Accept a “cookie” when a page offers one', 0]]],
    '1999': ['Setup — step 3 of 4', 'Almost done! Click Next to continue.', [['Yes! Send me the weekly newsletter', 1], ['Install the SearchPal toolbar', 1], ['Make StartHere my home page', 1], ['Put a shortcut on my desktop', 0], ['Share my address with selected partners', 0]]],
    '2004': ['Account preferences', 'You can change these at any time.', [['Remember me on this computer', 1], ['Send me product news', 1], ['Send me offers from our partners', 1], ['List me in the member directory', 1], ['Add the toolbar with this download', 1], ['Let people find me by email address', 0], ['Use my town for local results', 0]]],
    '2006': ['Account settings', 'Privacy and notifications', [['My profile can be viewed by: everyone', 1], ['Show people when I am online', 1], ['Email me when someone comments', 1], ['Play my profile song automatically', 1], ['Add the founder as my first friend', 1], ['Show my birthday to my friends', 1], ['Post comments without my approval', 1], ['Require a last name to add me', 0]]],
    '2008': ['Privacy', 'Control who can see your information.', [['Publish what I do to my friends’ feeds', 1], ['Friends can tag me in photos', 1], ['Applications my friends use can see my info', 1, 'r'], ['Let search engines find my profile', 1], ['Show my name next to adverts my friends see', 1, 'r'], ['Email me about comments, tags, pokes and invitations', 1], ['Show relationship changes in the feed', 1], ['Everyone in my networks can see my profile', 1], ['Keep me logged in', 1], ['Hide my friends list', 0]]],
    '2010': ['Settings', 'Recommended settings are on.', [['Push notifications', 1], ['Location services', 1, 'v'], ['Find friends from my contacts', 1], ['Share to my other accounts', 1], ['Photos are public', 1], ['Add location to my photos', 1], ['Email digests', 1], ['People you may know', 1], ['Tag suggestions', 1, 'r'], ['Personalised ads', 1, 'r'], ['Play sounds', 0], ['Private account', 0]]],
    '2014': ['Settings', 'Recommended settings are on.', [['Push notifications', 1], ['Location services', 1, 'v'], ['Sync contacts continuously', 1], ['Read receipts', 1], ['Show when I was last active', 1], ['Autoplay videos', 1, 'v'], ['Background app refresh', 1], ['Photos are public', 1], ['Email digests', 1], ['People you may know', 1], ['Tag suggestions', 1, 'r'], ['Ads based on my activity off this app', 1, 'r'], ['Share usage data to improve the product', 1], ['Private account', 0]]],
    '2016': ['Settings', 'Recommended settings are on.', [['Show the best posts first', 1, 'v'], ['Push notifications', 1], ['Activity status', 1], ['Location history', 1, 'v'], ['Sync contacts continuously', 1], ['Autoplay videos', 1], ['Stories advance automatically', 1], ['Suggested posts', 1], ['Similar account suggestions', 1], ['Save my search history', 1], ['Streak reminders', 1], ['Face recognition in photos', 1, 'r'], ['Ad personalisation', 1, 'r'], ['Share data with measurement partners', 1, 'r'], ['Notify me about people I may know', 1], ['Data saver', 0]]],
    '2024': ['Settings', 'Optimised for you based on your activity', [['Smart replies', 1], ['Assistant summaries', 1], ['Assistant can act on my behalf', 1, 'r'], ['Use my content to improve the model', 1, 'r'], ['Personalised feed', 1, 'm'], ['Predictive loading', 1, 'm'], ['Activity across apps and sites', 1, 'm'], ['Precise location', 1, 'm'], ['Contact sync', 1, 'm'], ['Ad topics', 1, 'm'], ['Partner measurement', 1, 'm'], ['Autoplay', 1, 'm'], ['Suggested content', 1, 'm'], ['Smart notification delivery', 1, 'm'], ['Memory: remember details about me', 1, 'm'], ['Voice activation', 1, 'm'], ['Linked devices', 1, 'm'], ['Diagnostics and usage', 1, 'm']]],
    '2030': ['defaults, with their authors', 'every default here says who set it and why. any of them is yours to change.', [
      ['suggest replies for me', 1, '', 'the app’s maker', 'most people accepted them in testing. it is also cheaper for the maker when you type less.'],
      ['remember what i wrote', 1, '', 'you, in 2024', 'you said yes once, on a busy day. you can say no now.'],
      ['notifications from the family chat', 1, '', 'the last person on this computer', 'they wanted to hear from everyone. you might not.'],
      ['keep a receipt of what was done for me', 1, '', 'your agent', 'so you can read it, and undo things.'],
      ['let my agent act without asking', 0, '', 'your agent', 'it asks first until you tell it otherwise.'],
      ['rank what i see', 0, '', 'the commons charter', 'order is by time unless you ask for another order.'],
      ['measure my time here', 0, '', 'nobody', 'nothing is counted unless you switch it on.'],
      ['share my activity with partners', 0, '', 'the law', 'a maker may not pre-tick this one any more.'],
      ['autoplay', 0, '', 'the app’s maker', 'they would prefer it on. they have to say so here.']]],
  };
  const DF = {};                                                              // per era, this visit only: { v: values, mine: Set, ask: index being resisted, note }
  const df = (k) => DF[k] || (DF[k] = { v: DEF[k][2].map((it) => !!it[1]), mine: new Set(), ask: -1, note: '', told: false });
  function dfCount(k) { const d = df(k); return { forYou: d.v.filter((on, i) => on && !d.mine.has(i)).length, byYou: d.mine.size, total: d.v.length }; }
  function drawDefaults() {
    const k = era(), y = yr(), ui = $('#dfUI'); if (!ui || !DEF[k]) return;
    const [ttl, sub, items] = DEF[k], d = df(k), c = dfCount(k), g = y <= 1996 ? 'grey' : y <= 2008 ? 'form' : y <= 2016 ? 'tog' : y <= 2024 ? 'man' : 'own';
    retitle('win-defaults', 'defaults · ' + label(k));
    const li = items.map((it, i) => '<li class="' + (it[2] === 'm' ? 'managed' : '') + '"><button type="button" role="switch" class="df-t" data-df="' + i + '" aria-checked="' + d.v[i] + '"' + (it[2] === 'm' ? ' aria-disabled="true"' : '') + '><span class="df-box" aria-hidden="true"></span><span class="df-l">' + esc(it[0]) +
      (it[2] === 'm' ? ' <em>Managed for you</em>' : '') + (it[3] ? ' <small>set by <b>' + esc(d.mine.has(i) ? 'you, just now' : it[3]) + '</b>' + (d.mine.has(i) ? '' : ': ' + esc(it[4])) + '</small>' : '') + '</span></button>' +
      (d.ask === i ? '<div class="df-ask" role="alertdialog" aria-label="are you sure?"><p>' + (y >= 2024 ? 'Turning this off may limit features and make your experience less helpful.' : 'Are you sure? You may miss things from your friends, and what you see will be less relevant.') + '</p><button type="button" class="keep" data-df-keep>Keep on</button><button type="button" data-df-off="' + i + '">Turn off</button></div>' : '') + '</li>').join('');
    ui.className = 'df df-' + g + ' df-y' + k;
    ui.innerHTML = '<div class="df-head"><b>' + esc(ttl) + '</b><span>' + (g === 'man' ? '◇ ' : '') + esc(sub) + '</span></div><ul class="df-list">' + li + '</ul>' +
      (g === 'tog' ? '<button type="button" class="df-rec" data-df-rec>Use recommended settings</button>' : g === 'grey' || g === 'form' ? '<div class="df-btns"><button type="button" data-df-ok>' + (k === '1999' ? 'Next >' : y >= 2004 ? 'Save changes' : 'OK') + '</button></div>' : '') +
      '<p class="df-note" role="status">' + esc(d.note) + '</p><p class="df-count" role="status"><b>' + c.forYou + '</b> ' + (c.forYou === 1 ? 'thing' : 'things') + ' decided for you · <b>' + c.byYou + '</b> by you</p>' +
      '<p class="df-foot">a simulation of what ' + esc(label(k)) + ' settings were like. no real product. your choices here are not kept.</p>';
  }
  function dfClick(e) {
    const b = e.target.closest('button'), k = era(); if (!b || !DEF[k]) return; const d = df(k), items = DEF[k][2];
    const set = (i, on) => { d.v[i] = on; d.mine.add(i); d.ask = -1; };
    if (b.dataset.dfOk !== undefined) return K.hide('win-defaults');
    if (b.dataset.dfKeep !== undefined) d.ask = -1;
    else if (b.dataset.dfOff !== undefined) set(+b.dataset.dfOff, false);
    else if (b.dataset.dfRec !== undefined) { d.v = items.map(() => true); d.mine.clear(); d.note = 'Recommended settings applied. (recommended by the people who make it. every switch is on again.)'; }
    else if (b.dataset.df !== undefined) {
      const i = +b.dataset.df, lock = items[i][2];
      if (lock === 'm') d.note = 'This setting is managed for you and can’t be changed here.';
      else if (lock === 'r' && d.v[i]) d.ask = i;
      else {
        set(i, !d.v[i]);
        if (lock === 'v' && !d.v[i]) setTimeout(() => {                         // the toggle that turns itself back on
          if (d.v[i]) return; d.v[i] = true; d.mine.delete(i);
          d.note = d.told ? '' : '“' + items[i][0] + '” switched itself back on. real settings have done this after an update; here it is simulated, and said once.'; d.told = true;
          if (era() === k && K.isOpen('win-defaults')) drawDefaults();
        }, 2600);
      }
    } else return;
    drawDefaults(); const f = d.ask >= 0 ? $('#dfUI .df-ask .keep') : b.dataset.df !== undefined ? $('#dfUI [data-df="' + b.dataset.df + '"]') : null; if (f) f.focus();
  }
  function openDefaults() { const w = K.win('win-defaults', 'defaults', 400, '<div id="dfUI"></div>'); if (!w.dataset.wired) { w.dataset.wired = 1; w.addEventListener('click', dfClick); } drawDefaults(); K.show('win-defaults'); }

  /* =========================== 4 · one sentence ===========================
     The visitor's first written answer (or one typed here, held in memory) shown as six systems would show it.
     The 2024 "summary" is plain string rules (keyword → topic); no model, and it says so. */
  const sen = { typed: '', big: -1, kept: false };
  const firstMem = () => { try { return J().mine().find((m) => m.kind === 'memory'); } catch (e) { return null; } };
  const TOPICS = [[/gam|play|level|score/i, 'gaming'], [/chat|messag|friend|talk|forum|room/i, 'social'], [/song|music|band|mp3|listen/i, 'music'], [/draw|paint|page|site|built|made|make|wrote|write/i, 'creating'], [/video|watch|film|clip/i, 'video'], [/mum|mom|dad|sister|brother|family|home/i, 'family']];
  function summarise(t) { const topic = (TOPICS.find((x) => x[0].test(t)) || [0, 'browsing'])[1], mood = /love|fun|happy|best|miss|laugh|favou?rite/i.test(t) ? 'positive' : 'neutral'; return { tags: ['nostalgia', topic, mood], line: 'User shared a ' + mood + ' memory about ' + topic + '.' }; }
  function drawSentence() {
    const ui = $('#snUI'); if (!ui) return; const m = firstMem(), t = m ? m.line : sen.typed, e = esc(t), n = t.length, me = (J() && J().state().name) || 'you';
    if (!t) { ui.innerHTML = '<div class="sn"><p class="sn-lead">you haven’t written anything yet. type one sentence: the first thing you remember doing online will do.</p><div class="sn-form"><input id="snIn" maxlength="200" autocomplete="off" aria-label="one sentence of your own" placeholder="a sentence is enough"><button type="button" data-sn="show">show it six ways</button></div><p class="sn-foot">it stays on this screen unless you choose to keep it.</p></div>'; return; }
    const s = summarise(t), when = new Date(m && m.t ? m.t : Date.now()).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    const F = [
      ['1996', 'handwritten', '<div class="sf-page"><p class="sf-text">' + e + '</p><span>~ written by hand, kept on the page ~</span></div>'],
      ['2006', 'templated', '<div class="sf-prof"><b>About me:</b><p class="sf-text">' + esc(t.slice(0, 150)) + '</p><small>' + Math.max(0, 150 - n) + ' characters left</small></div>'],
      ['2010', 'truncated', '<div class="sf-feed"><span class="hi-av"></span><p class="sf-text">' + (n > 140 ? esc(t.slice(0, 140)) + '… <u>see more</u>' : e) + '</p><small>' + Math.min(n, 140) + '/140</small></div>'],
      ['2016', 'ranked', '<div class="sf-rank"><div><b>Sponsored · a brand</b><span>❤ 12.4k &nbsp;↻ 3.1k</span></div><div><b>someone you may know</b><span>❤ 2,381 &nbsp;↻ 407</span></div><div class="you"><p class="sf-text">' + e + '</p><span>❤ 0 &nbsp;↻ 0 · ranked 3rd for your friends</span></div></div>'],
      ['2024', 'summarised', '<div class="sf-sum"><div>' + s.tags.map((x) => '<i>' + x + '</i>').join('') + '</div><p class="sf-text">◇ ' + s.line + '</p><small>' + words(t).length + ' words → 3 tags. made with string rules here, not a model.</small></div>'],
      ['2030', 'returned', '<div class="sf-back"><p class="sf-text">' + e + '</p><span>— ' + esc(me) + ', ' + when + '. whole, and yours.</span></div>'],
    ];
    ui.innerHTML = '<div class="sn"><p class="sn-lead">' + (m ? 'the first thing you wrote here, as six systems would show it.' : 'your sentence, as six systems would show it.') + ' <small>click a frame to enlarge it.</small></p><div class="sn-strip">' +
      F.map((f, i) => '<button type="button" class="sf sf-y' + f[0] + (sen.big === i ? ' big' : '') + '" data-sn="big" data-i="' + i + '" data-era="' + f[0] + '" aria-pressed="' + (sen.big === i) + '"><em>' + f[0] + ' · ' + f[1] + '</em>' + f[2] + '</button>').join('') + '</div>' +
      (m ? '<p class="sn-foot">same words every time. each system kept the part it had a use for.</p>' : '<p class="sn-foot">' + (sen.kept ? 'kept. it is one of your things now, in this browser, and can be lost and handed back like the others.' : 'same words every time. <button type="button" data-sn="keep">keep it as my answer in ' + esc(label(era())) + '</button> <button type="button" data-sn="clear">write another</button><br>keeping stores the sentence in this browser with your journey. otherwise it is forgotten when you close this.') + '</p>') + '</div>';
  }
  function snClick(e) {
    const b = e.target.closest('[data-sn]'); if (!b) return; const a = b.dataset.sn;
    if (a === 'show') { sen.typed = ($('#snIn').value || '').trim(); sen.kept = false; }
    else if (a === 'big') sen.big = sen.big === +b.dataset.i ? -1 : +b.dataset.i;
    else if (a === 'clear') { sen.typed = ''; sen.big = -1; }
    else if (a === 'keep') { try { J().answer(era(), sen.typed); } catch (x) { /* no journey */ } sen.kept = true; }
    drawSentence(); const f = a === 'big' ? $('#snUI [data-i="' + b.dataset.i + '"]') : $('#snIn'); if (f) f.focus();
  }
  function openSentence() { const w = K.win('win-sentence', 'one sentence', 620, '<div id="snUI"></div>'); if (!w.dataset.wired) { w.dataset.wired = 1; w.addEventListener('click', snClick); w.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'snIn') $('#snUI [data-sn="show"]').click(); }); } drawSentence(); K.show('win-sentence'); }

  /* =========================== 5 · what the metric saw ===========================
     An overlay, off by default, pointer-transparent except its close button. Everything in it is invented and labelled. */
  const M = { on: false, t0: 0, clicks: 0, marks: [], hits: 4812, depth: 0, at: null, timer: 0 };
  const kind = (y) => (y <= 1999 ? 'hits' : y <= 2008 ? 'clicks' : y <= 2016 ? 'engage' : y <= 2024 ? 'predict' : 'own');
  function overlay() {
    let o = $('#agMetric'); if (o) return o;
    o = document.createElement('div'); o.id = 'agMetric'; o.hidden = true;
    o.innerHTML = '<div class="mt-tint"></div><div class="mt-layer" aria-hidden="true"></div><section class="mt-hud" aria-label="what the metric saw (a simulation)"><small>what the metric saw · simulation</small><div class="mt-main" aria-live="off"></div><p class="mt-q">optimisation has become one of the only values these systems are measured against. this is everything that value can see.</p><button type="button" id="agMetricX">switch off</button></section>';
    document.body.appendChild(o); $('#agMetricX').onclick = () => metric(false);
    document.addEventListener('scroll', (e) => { const t = e.target; if (!M.on || !t || !t.scrollHeight) return; const d = t.scrollTop / Math.max(1, t.scrollHeight - t.clientHeight); if (d > M.depth) M.depth = Math.min(1, d); }, true);
    return o;
  }
  function metricClick(e) { M.clicks++; M.at = [e.clientX, e.clientY]; if (kind(yr()) === 'clicks') { M.marks.push([e.clientX, e.clientY, M.clicks]); if (M.marks.length > 40) M.marks.shift(); } setTimeout(() => M.on && drawMetric(), 60); }
  function drawMetric() {
    const o = overlay(), k = kind(yr()), main = $('.mt-main', o), layer = $('.mt-layer', o), secs = Math.floor((Date.now() - M.t0) / 1000);
    o.hidden = !M.on; o.dataset.kind = k; o.className = 'mt-' + k; if (!M.on) return;
    let h = '', l = '';
    if (k === 'hits') h = '<b class="mt-big">' + pad(M.hits, 6).replace(/(\d{3})$/, ',$1') + '</b><span>hits</span><p>a request arrived. that is all it knows: not who, not why, not whether you stayed.</p>';
    else if (k === 'clicks') { h = '<b class="mt-big">' + M.clicks + '</b><span>clicks</span><p>each click leaves a mark. it knows where you clicked, not what you meant.</p>'; l = M.marks.map((m) => '<i class="mt-dot" style="left:' + m[0] + 'px;top:' + m[1] + 'px">' + m[2] + '</i>').join(''); }
    else if (k === 'engage') h = '<dl><div><dt>time on site</dt><dd>' + pad(secs / 60 | 0, 2) + ':' + pad(secs % 60, 2) + '</dd></div><div><dt>scroll depth</dt><dd><span class="mt-bar"><i style="width:' + Math.round(M.depth * 100) + '%"></i></span>' + Math.round(M.depth * 100) + '%</dd></div><div><dt>session value</dt><dd>$' + (secs * 0.0004 + M.clicks * 0.0021).toFixed(4) + '</dd></div></dl><p>staying is the product. it cannot tell enjoying from being unable to leave.</p>';
    else if (k === 'predict') {
      const at = M.at || [innerWidth / 2, innerHeight / 2], P = [58, 23, 11, 5];
      const els = $$('#desktop .icon, .window.open .winbody button, .window.open .winbody a, #taskbar button').map((el) => [el, el.getBoundingClientRect()]).filter((x) => x[1].width > 8 && x[1].height > 8 && x[1].top > 40 && x[1].bottom < innerHeight && x[1].right < innerWidth && !x[0].closest('#agDock'))
        .sort((a, b) => Math.hypot(a[1].left + a[1].width / 2 - at[0], a[1].top + a[1].height / 2 - at[1]) - Math.hypot(b[1].left + b[1].width / 2 - at[0], b[1].top + b[1].height / 2 - at[1])).slice(0, 4);
      l = els.map((x, i) => '<i class="mt-ghost" style="left:' + (x[1].left - 3) + 'px;top:' + (x[1].top - 3) + 'px;width:' + (x[1].width + 6) + 'px;height:' + (x[1].height + 6) + 'px"><b>' + P[i] + '%</b></i>').join('');
      h = '<b class="mt-big">' + (els.length ? P[0] + '%' : '—') + '</b><span>predicted next action</span><p>illustration only: the percentages are invented and no model is running. the point is that the next thing you do is already a number.</p>';
    } else { const e = eff(era()); h = '<b class="mt-big">' + (e.k + e.c) + '</b><span>your own counter</span><p>nothing is measured unless you switch it on. you switched this on: ' + e.k + ' keystrokes and ' + e.c + ' choices, counted for you, kept in this browser, shown to nobody.</p>'; }
    main.innerHTML = h; layer.innerHTML = l;
  }
  function metric(on) {
    M.on = on === undefined ? !M.on : !!on;
    if (M.on) { M.t0 = Date.now(); M.clicks = 0; M.marks = []; M.depth = 0; M.hits++; clearInterval(M.timer); M.timer = setInterval(drawMetric, 1000); } else clearInterval(M.timer);
    drawMetric(); drawChip(); if (K.isOpen('win-effort')) drawEffort();
    return M.on;
  }

  /* =========================== wiring =========================== */
  const OPEN = { sayhi: [openHi, 1993], defaults: [openDefaults, 1993], sentence: [openSentence, 1996], effort: [openEffort, 0] };
  function open(id) { const o = OPEN[id]; if (!o) return false; if (yr() < o[1]) { K.say('that isn’t here yet in ' + label(era()) + '.'); return false; } o[0](); return true; }
  K.icon({ id: 'sayhi', glyph: (y) => (y <= 1993 ? '📨' : y <= 1996 ? '📖' : y <= 1999 ? '💬' : y <= 2006 ? '✍️' : y <= 2008 ? '👉' : y <= 2010 ? '📷' : y <= 2016 ? '❤️' : y <= 2024 ? '💛' : '🤝'), label: 'say hi', from: 1993, to: 2030, open: () => open('sayhi') });
  K.icon({ id: 'defaults', glyph: (y) => (y <= 1996 ? '☑️' : y <= 2008 ? '📋' : y <= 2024 ? '⚙️' : '🗝️'), label: 'defaults', from: 1993, to: 2030, open: () => open('defaults') });
  K.icon({ id: 'sentence', glyph: (y) => (y <= 2008 ? '🖋️' : '❝'), label: 'one sentence', from: 1996, to: 2030, open: () => open('sentence') });
  K.onEra(() => {
    const y = yr(); M.hits++; M.marks = []; drawChip();
    if (K.isOpen('win-sayhi')) { if (y >= 1993) drawHi(); else K.hide('win-sayhi'); }
    if (K.isOpen('win-defaults')) { if (y >= 1993) drawDefaults(); else K.hide('win-defaults'); }
    if (K.isOpen('win-sentence')) { if (y >= 1996) drawSentence(); else K.hide('win-sentence'); }
    if (K.isOpen('win-effort')) drawEffort();
    if (M.on) drawMetric();
  });
  S.onReset = () => { Object.keys(DF).forEach((k) => delete DF[k]); sen.typed = ''; sen.kept = false; drawChip(); ['sayhi', 'defaults', 'sentence', 'effort'].forEach((id) => { if (K.isOpen('win-' + id)) OPEN[id][0](); }); };

  window.Argument = {
    open,                                                                      // open('sayhi' | 'defaults' | 'sentence' | 'effort')
    effort: (k) => (k ? Object.assign({}, eff(k)) : JSON.parse(JSON.stringify(S.data.effort))),
    record: (k) => (k ? S.data.hi[k] || null : JSON.parse(JSON.stringify(S.data.hi))),
    defaults: (k) => dfCount(k || era()),
    metric,                                                                    // metric(true | false) or metric() to toggle; returns the new state
    metricKind: () => kind(yr()),
    summarise,
  };
})();
