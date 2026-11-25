/* =====================================================================
   kit.js — shared helpers for the small feature files (apps, studio, argument, toys). Read DEV-API.md.
   window.TSKit = {
     era()            -> '1996'            current era key        yr() -> 1996 (number)
     onEra(fn)        call fn(eraKey) now and on every era change
     esc(str)         HTML-escape
     win(id, title, width, bodyHTML)  -> the window element (created once; class "window app-win")
     show(id) / hide(id) / isOpen(id) / title(id, text)
     icon({ id, glyph, label, from, to, open })   a desktop icon, shown only when from <= year <= to.
                      glyph/label may be functions of the year. Icons flow into two free columns; never position them yourself.
     state(name, defaults) -> { data, save() }   small persisted state (localStorage 'thirdspace.kit.<name>'),
                      erased automatically with "erase journey" / "delete everything". Local only; nothing is sent.
     reduced()        true when the visitor prefers reduced motion
     say(text)        a short line in the shared toast at the bottom of the screen
     tone(freq, secs, type, vol, toFreq)  one quiet synthesised note, only if the visitor switched sound on
   }
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const era = () => { const m = /era-(\w+)/.exec(document.body.className); return m ? m[1] : '1991'; };
  const yr = () => parseInt(era(), 10);
  const subs = []; let last = null;
  const fire = () => { const k = era(); if (k === last) return; last = k; layout(); subs.forEach((f) => { try { f(k); } catch (e) { console.error(e); } }); };
  function onEra(fn) { subs.push(fn); try { fn(era()); } catch (e) { console.error(e); } }

  function win(id, title, w, body) {
    let el = $('#' + id); if (el) return el;
    el = document.createElement('div'); el.className = 'window app-win'; el.id = id; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', title);
    el.style.cssText = 'width:' + w + 'px; top:' + (120 + (document.querySelectorAll('.app-win').length % 5) * 22) + 'px; left:' + (300 + (document.querySelectorAll('.app-win').length % 5) * 26) + 'px; z-index:14; --app-w:' + w + 'px;';
    el.innerHTML = '<div class="titlebar" onpointerdown="startDrag(event,\'' + id + '\')"><span class="ttl">' + esc(title) + '</span><div class="winbtns"><button onclick="minimizeWindow(\'' + id + '\')" aria-label="minimize">_</button><button onclick="closeWindow(\'' + id + '\')" aria-label="close">×</button></div></div><div class="winbody app-body">' + body + '</div>';
    document.body.appendChild(el); if (typeof windowTitles !== 'undefined') windowTitles[id] = title;
    return el;
  }
  // windows are centred on first open by the core, often before their content is drawn; once the content is in,
  // pull the window up so its bottom stays above the taskbar (never above the era bar)
  function fit(w) {
    if (!w || window.innerWidth <= 700) return;
    const bar = document.getElementById('eraBar'), note = document.getElementById('eraNote');
    const ask = document.querySelector('#askbar'), askB = ask && getComputedStyle(ask).position === 'fixed' && ask.offsetParent !== null ? ask.getBoundingClientRect().bottom : 0;
    const minTop = Math.max((bar ? bar.offsetHeight : 0) + (note ? note.offsetHeight : 0), askB) + 10, r = w.getBoundingClientRect(), maxBottom = window.innerHeight - 44;
    if (r.top < minTop) w.style.top = minTop + 'px';
    if (w.getBoundingClientRect().bottom > maxBottom) w.style.top = Math.max(minTop, w.getBoundingClientRect().top - (w.getBoundingClientRect().bottom - maxBottom)) + 'px';
    const body = w.querySelector('.winbody'); if (body) body.style.maxHeight = Math.max(200, maxBottom - Math.max(minTop, w.getBoundingClientRect().top) - 34) + 'px';
  }
  const show = (id) => { if (typeof openWindow === 'function') openWindow(id); const w = $('#' + id); if (w) { w.classList.add('open'); w.style.display = 'flex'; requestAnimationFrame(() => requestAnimationFrame(() => fit(w))); } };
  const hide = (id) => { const w = $('#' + id); if (w && w.classList.contains('open') && typeof closeWindow === 'function') closeWindow(id); };
  const isOpen = (id) => { const w = $('#' + id); return !!(w && w.classList.contains('open') && w.style.display !== 'none'); };
  const title = (id, t) => { const x = $('#' + id + ' .ttl'); if (x) x.textContent = t; if (typeof windowTitles !== 'undefined') windowTitles[id] = t; };

  /* ---- desktop icons: two free columns (left 200px and 284px), filled top to bottom ---- */
  const ICONS = [];
  function icon(a) { ICONS.push(a); layout(); return a; }
  function layout() {
    const d = $('#desktop'); if (!d) return; const y = yr(); let n = 0; const rows = Math.max(3, Math.floor((window.innerHeight - 190) / 106));
    ICONS.forEach((a) => {
      let el = $('.app-icon[data-app="' + a.id + '"]', d);
      if (!el) { el = document.createElement('div'); el.className = 'icon app-icon'; el.dataset.app = a.id; el.tabIndex = 0; el.setAttribute('role', 'button'); el.onclick = () => a.open(); el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.open(); } }; d.appendChild(el); }
      const on = y >= (a.from || 0) && y <= (a.to || 9999); el.style.display = on ? '' : 'none'; if (!on) return;
      const g = typeof a.glyph === 'function' ? a.glyph(y) : a.glyph, l = typeof a.label === 'function' ? a.label(y) : a.label;
      el.innerHTML = '<div class="glyph">' + g + '</div><div class="label">' + esc(l) + '</div>';
      el.style.left = (200 + Math.floor(n / rows) * 88) + 'px'; el.style.top = (12 + (n % rows) * 106) + 'px'; n++;
    });
  }
  window.addEventListener('resize', layout);

  /* ---- small persisted state, erased with the journey ---- */
  const STATES = [];
  function state(name, defaults) {
    const key = 'thirdspace.kit.' + name; let data;
    const fresh = () => JSON.parse(JSON.stringify(defaults || {}));
    try { data = Object.assign(fresh(), JSON.parse(localStorage.getItem(key)) || {}); } catch (e) { data = fresh(); }
    const s = { data, save() { try { localStorage.setItem(key, JSON.stringify(s.data)); } catch (e) { /* session only */ } }, reset() { Object.keys(s.data).forEach((k) => delete s.data[k]); Object.assign(s.data, JSON.parse(JSON.stringify(defaults || {}))); try { localStorage.removeItem(key); } catch (e) { /* nothing */ } if (s.onReset) s.onReset(); } };
    STATES.push(s); return s;
  }
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function say(msg) { let t = $('#whSay'); if (!t) { t = document.createElement('div'); t.id = 'whSay'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => t.classList.remove('on'), 5200); }
  let AC = null;
  function tone(f, d, type, v, to) {
    if (!window.Sound || !Sound.on) return;
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d); g.gain.setValueAtTime(Math.min(v == null ? 0.05 : v, 0.08), t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + d + 0.02); } catch (e) { /* no audio */ }
  }
  function init() {
    fire(); new MutationObserver(fire).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (window.Journey && Journey.reset) { const r = Journey.reset; Journey.reset = function () { STATES.forEach((s) => s.reset()); return r.apply(this, arguments); }; }
  }
  window.TSKit = { era, yr, onEra, esc, win, show, fit, hide, isOpen, title, icon, state, reduced, say, tone };
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
