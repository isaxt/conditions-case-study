/* =====================================================================
   whimsy.js — small things someone hid on purpose (0.7.2).

   The historical eras (1991–2010) each hide one or two little interactions that do nothing useful:
   a cat, a cloud you can make rain, a hit counter, a sparkle trail, a marquee, a poke, a photo filter.
   From 2014 on there are none. The same corner asks you to rate your experience instead, the way current
   interfaces do. In 2030 you can hide a note of your own for the next person at this computer.

   Finds are kept in this browser only (thirdspace.whimsy.v1), shown in a toast, and erased with the journey.
   All copy is in COPY below. Respects reduced motion (nothing drifts; everything is still clickable).
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'thirdspace.whimsy.v1';
  const COPY = {
    cat: ['meow.', 'purr.', '(the cat has read your whole hard drive and has no notes.)'],
    cloud: 'weather in another country: light rain. someone once showed this to a room of people, and that was the whole internet.',
    counter: 'you are visitor ', counterEnd: 'ok, ok. you are all of them.',
    digger: ['dig', 'dig dig', 'found: one (1) penny from 1996. this page will be finished any day now.'],
    star: 'sparkles on. nobody asked for these. that was the point.',
    marquee: '~*~ welcome to our computer ~*~ please sign the guestbook ~*~ best viewed with your eyes ~*~ ',
    marqueeEnd: 'wheeeee',
    poke: ['you poked mote.', 'mote poked you back.', 'poke war declared. there are no winners.'],
    filter: 'everything looks like a memory now.',
    typed: { hello: 'hello, world.', mote: 'you called?' },
    left: 'someone left this here: ',
    end: 'nobody hides things for fun past here. everything is where the numbers say it should be.',
    rate: 'How are we doing?', rated: 'Thanks! Your feedback helps us improve your experience.',
    leaveT: 'hide something for the next person', leaveP: 'a few words. they will find it in 1996.', leaveB: 'hide it', leaveDone: 'hidden. it is waiting in 1996.',
    found: (n, N) => '(' + n + ' of ' + N + ' little things found)',
  };
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const RM = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W; try { W = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { W = {}; }
  W.found = W.found || {}; W.count = W.count || 41;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(W)); } catch (e) { /* session only */ } };
  const era = () => { const m = /era-(\w+)/.exec(document.body.className); return m ? m[1] : '1991'; };
  const ALL = ['cat', 'cloud', 'counter', 'digger', 'marquee', 'poke', 'filter', 'typed'];

  function say(msg) {
    let t = $('#whSay'); if (!t) { t = document.createElement('div'); t.id = 'whSay'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => t.classList.remove('on'), 5200);
  }
  function found(id, msg) {
    const first = !W.found[id]; W.found[id] = 1; save();
    const n = Object.keys(W.found).length;
    say(msg + (first ? '  ' + COPY.found(n, ALL.length) : ''));
    if (first && window.Journey && Journey.state) { const J = Journey.state(); J.log.push({ t: new Date().toISOString(), what: 'found a little thing: ' + id }); }
  }
  const el = (cls, html, label) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'wh ' + cls; b.innerHTML = html; if (label) b.setAttribute('aria-label', label); return b; };

  /* ---------------- the eggs ---------------- */
  const EGGS = {
    cat: { eras: ['1991', '1993'], make() {
      const b = el('wh-cat', '=^..^=', 'a small cat'); let n = 0;
      b.onclick = () => { found('cat', COPY.cat[Math.min(n++, COPY.cat.length - 1)]); b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); b.textContent = n % 2 ? '=^-.-^=' : '=^..^='; };
      return b; } },
    cloud: { eras: ['1993'], make() {
      const b = el('wh-cloud', '<i></i>', 'a cloud');
      b.onclick = () => { b.classList.add('rain'); found('cloud', COPY.cloud); setTimeout(() => b.classList.remove('rain'), 4500); };
      return b; } },
    counter: { eras: ['1996', '1999'], make() {
      const b = el('wh-counter', '', 'a hit counter'); let clicks = 0;
      const draw = () => { b.innerHTML = '<span>' + COPY.counter + '</span>' + String(W.count).padStart(6, '0').split('').map((d) => '<b>' + d + '</b>').join(''); };
      b.onclick = () => { W.count++; clicks++; save(); draw(); found('counter', clicks >= 5 ? COPY.counterEnd : COPY.counter + W.count + '.'); };
      draw(); return b; } },
    digger: { eras: ['1996'], make() {
      const b = el('wh-digger', '<i>🚧</i><u>⛏️</u>', 'an under construction sign'); let n = 0;
      b.onclick = () => { b.classList.remove('dig'); void b.offsetWidth; b.classList.add('dig'); const m = COPY.digger[Math.min(n++, 2)]; if (n >= 3) { found('digger', m); b.querySelector('u').textContent = '🪙'; } else say(m); };
      return b; } },
    marquee: { eras: ['1999', '2004'], make() {
      const b = el('wh-marquee', '<span>' + esc(COPY.marquee + COPY.marquee) + '</span>', 'a scrolling message'); let n = 0;
      b.onclick = () => { n++; b.dataset.s = String(Math.min(n, 3)); if (n >= 3) found('marquee', COPY.marqueeEnd); else say(n === 1 ? 'faster?' : 'faster.'); };
      return b; } },
    poke: { eras: ['2006', '2008'], make() {
      const b = el('wh-poke', '👉 poke', 'poke'); let n = 0;
      b.onclick = () => { const i = Math.min(n++, 2); say(COPY.poke[0]); setTimeout(() => found('poke', COPY.poke[Math.max(1, i)]), 1400); b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); };
      return b; } },
    filter: { eras: ['2010'], make() {
      const b = document.createElement('div'); b.className = 'wh wh-filter'; b.setAttribute('role', 'group'); b.setAttribute('aria-label', 'photo filters');
      b.innerHTML = [['sepia(.7) contrast(1.05)', 'warm'], ['saturate(1.5) hue-rotate(-12deg)', 'bright'], ['grayscale(.6) contrast(.9) brightness(1.1)', 'faded']].map(([f, n]) => '<button type="button" data-f="' + f + '" title="' + n + '" aria-label="' + n + ' filter"></button>').join('');
      b.onclick = (e) => { const x = e.target.closest('[data-f]'); if (!x) return; const d = $('#desktop') || document.body; d.style.filter = x.dataset.f; found('filter', COPY.filter); clearTimeout(b.t); b.t = setTimeout(() => { d.style.filter = ''; }, 6000); };
      return b; } },
    // a note the visitor hid in 2030, found in 1996
    left: { eras: ['1996'], when: () => !!W.left, make() {
      const b = el('wh-left', '📝', 'a folded note');
      b.onclick = () => say(COPY.left + '“' + W.left + '”');
      return b; } },
    // from 2014 the same corner asks for a rating, the way current interfaces do
    rate: { eras: ['2014', '2016', '2024'], make() {
      const b = document.createElement('div'); b.className = 'wh wh-rate'; b.setAttribute('role', 'group'); b.setAttribute('aria-label', COPY.rate);
      b.innerHTML = '<span>' + COPY.rate + '</span>' + [1, 2, 3, 4, 5].map((i) => '<button type="button" data-r="' + i + '" aria-label="' + i + ' star' + (i > 1 ? 's' : '') + '">☆</button>').join('') + '<button type="button" class="x" data-x aria-label="dismiss">×</button>';
      b.onclick = (e) => {
        if (e.target.closest('[data-x]')) { b.remove(); return; }
        const r = e.target.closest('[data-r]'); if (!r) return;
        b.innerHTML = '<span>' + COPY.rated + '</span>';
        if (typeof logReceipt === 'function') logReceipt('rated their experience ' + r.dataset.r + '/5', 'feedback · attached to your profile');
        setTimeout(() => b.remove(), 3500);
      };
      return b; } },
    leave: { eras: ['2030'], make() {
      const b = document.createElement('form'); b.className = 'wh wh-leave';
      b.innerHTML = '<label for="whLeave">' + COPY.leaveT + '</label><input id="whLeave" maxlength="60" placeholder="' + COPY.leaveP + '" value="' + esc(W.left || '') + '"><button type="submit">' + COPY.leaveB + '</button>';
      b.onsubmit = (e) => { e.preventDefault(); const v = $('#whLeave').value.trim(); if (!v) return; W.left = v.slice(0, 60); save(); say(COPY.leaveDone); };
      return b; } },
  };

  function sparkle(ms) {
    if (RM() || sparkle.on) return; sparkle.on = true;
    const mv = (e) => { if (Math.random() > .35) return; const s = document.createElement('i'); s.className = 'wh-spark'; s.textContent = ['★', '☆', '⋆', '·'][Math.floor(Math.random() * 4)]; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; s.style.color = ['#ff66cc', '#ffcc00', '#66ccff', '#fff'][Math.floor(Math.random() * 4)]; document.body.appendChild(s); setTimeout(() => s.remove(), 700); };
    document.addEventListener('pointermove', mv);
    setTimeout(() => { document.removeEventListener('pointermove', mv); sparkle.on = false; }, ms);
  }

  // typed words: "hello" in 1991, "mote" in any era that still hides things
  let buf = '';
  document.addEventListener('keydown', (e) => {
    if (e.key.length !== 1 || /input|textarea/i.test((e.target.tagName || '')) || e.target.isContentEditable) return;
    buf = (buf + e.key.toLowerCase()).slice(-8);
    const k = era(), old = ['1991', '1993', '1996', '1999', '2004', '2006', '2008', '2010'].indexOf(k) >= 0;
    if (old && buf.endsWith('mote')) { found('typed', COPY.typed.mote); buf = ''; }
    else if (k === '1991' && buf.endsWith('hello')) { found('typed', COPY.typed.hello); buf = ''; }
  });

  let last = null;
  function render() {
    const k = era(); if (k === last) return; const prev = last; last = k;
    document.querySelectorAll('.wh').forEach((n) => n.remove());
    const d = $('#desktop'); if (d) d.style.filter = '';
    Object.keys(EGGS).forEach((id) => { const g = EGGS[id]; if (g.eras.indexOf(k) < 0 || (g.when && !g.when())) return; const n = g.make(); n.dataset.egg = id; document.body.appendChild(n); });
    if (k === '2014' && prev && !W.endSaid && Object.keys(W.found).length) { W.endSaid = 1; save(); setTimeout(() => say('mote: ' + COPY.end), 1200); }
  }
  function reset() { W = { found: {}, count: 41 }; try { localStorage.removeItem(KEY); } catch (e) { /* nothing */ } last = null; render(); }

  function init() {
    render(); new MutationObserver(render).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (window.Journey && Journey.reset) { const r = Journey.reset; Journey.reset = function () { reset(); return r.apply(this, arguments); }; }
  }
  window.Whimsy = { state: () => W, reset, eggs: ALL };
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
