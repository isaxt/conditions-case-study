/* =====================================================================
   threshold.js: the moment the archive ends (0.11)
   Going from the archive into 2030 is not just another tab. When the visitor
   asks for 2030, the old desktop falls apart, the screen goes dark, and the
   computer reads back everything it catalogued about them: what they carried,
   what they left, what they made, how often they let it write for them. Then
   it says two futures are loading, and the visitor has to press and hold to go
   on. A second, shorter spectacle plays when they "take the wheel back" and the
   autopilot future hands over to the human web.
   Keeps nothing. Skipped under #quick; reduced motion gets a short version.
   ===================================================================== */
(function () {
  'use strict';
  const QUICK = /quick/.test(location.hash) || window.TS_QUICK === true;
  const RM = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const curEra = () => { const m = /era-(\w+)/.exec(document.body.className); return m ? m[1] : '1991'; };
  let busy = false, after = [];
  let lastGesture = 0;
  ['pointerdown', 'keydown'].forEach((t) => document.addEventListener(t, () => { lastGesture = Date.now(); }, true));
  const gesture = () => (navigator.userActivation && navigator.userActivation.isActive) || Date.now() - lastGesture < 1200;

  function catalog() {
    const out = { carried: [], left: [], made: [], wrote: 0, kept: 0 };
    if (!window.Journey) return out;
    try {
      const s = Journey.state();
      out.carried = Journey.carrying().map((id) => Journey.byId(id)).filter(Boolean).map((t) => t.title);
      out.left = Object.keys(s.lost || {}).map((id) => Journey.byId(id)).filter(Boolean).map((t) => t.title);
      out.made = Journey.mine().map((t) => t.title);
      out.wrote = (s.polish || {}).accepted || 0;
      out.kept = Object.keys(s.kept || {}).reduce((n, k) => n + (s.kept[k] || []).length, 0);
    } catch (e) { /* empty catalog */ }
    return out;
  }

  function overlay(cls) {
    const o = document.createElement('div');
    o.id = 'threshold'; o.className = cls; o.setAttribute('role', 'dialog'); o.setAttribute('aria-live', 'polite');
    o.innerHTML = '<div class="th-noise" aria-hidden="true"></div><div class="th-inner"><pre class="th-out"></pre><div class="th-act"></div></div><button type="button" class="th-skip">skip</button>';
    document.body.appendChild(o);
    return o;
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, RM() ? Math.min(ms, 120) : ms));

  async function typeIn(pre, text, cps) {
    if (RM()) { pre.textContent += text + '\n'; return; }
    for (const ch of text) { pre.textContent += ch; await wait(1000 / (cps || 45)); }
    pre.textContent += '\n';
  }

  // press-and-hold: the visitor has to commit to the future
  function hold(box, label) {
    return new Promise((resolve) => {
      box.innerHTML = '<button type="button" class="th-hold"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" class="th-ring-bg"/><circle cx="60" cy="60" r="54" class="th-ring"/></svg><span>' + esc(label) + '</span></button><p class="th-hint">press and hold</p>';
      const b = box.querySelector('.th-hold'), ring = box.querySelector('.th-ring');
      const LEN = 2 * Math.PI * 54; ring.style.strokeDasharray = LEN; ring.style.strokeDashoffset = LEN;
      let p = 0, dir = 0, raf = 0, last = 0;
      const tick = (t) => {
        const dt = last ? (t - last) / 1000 : 0; last = t;
        p = Math.max(0, Math.min(1, p + dir * dt / (RM() ? 0.6 : 2.2)));
        ring.style.strokeDashoffset = LEN * (1 - p);
        b.style.setProperty('--p', p);
        document.getElementById('threshold').style.setProperty('--p', p);
        if (p >= 1) { cancelAnimationFrame(raf); resolve(); return; }
        if (p > 0 || dir > 0) raf = requestAnimationFrame(tick); else { last = 0; raf = 0; }
      };
      const down = (e) => { e.preventDefault(); dir = 1; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
      const up = () => { dir = -1.6; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
      b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up);
      b.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
      b.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') up(); });
      b.focus();
    });
  }

  async function enter(go) {
    busy = true;
    const C = catalog();
    // 1. the old desktop falls apart
    document.body.classList.add('th-falling');
    document.querySelectorAll('#desktop .icon').forEach((ic, i) => { ic.style.setProperty('--r', ((i * 37) % 50 - 25) + 'deg'); ic.style.setProperty('--d', ((i * 53) % 400) + 'ms'); });
    await wait(1300);
    const o = overlay('th-enter');
    let skipped = false;
    o.querySelector('.th-skip').onclick = () => { skipped = true; finish(); };
    const pre = o.querySelector('.th-out'), act = o.querySelector('.th-act');
    await wait(500);
    const lines = [];
    if (!skipped) await typeIn(pre, 'this is where the archive ends.', 32);
    await wait(500);
    if (!skipped) await typeIn(pre, 'everything after this hasn’t happened yet.', 36);
    await wait(700);
    if (!skipped) {
      pre.textContent += '\n';
      await typeIn(pre, 'before you go, here’s everything this computer catalogued about you:', 55);
      await wait(300);
      const row = (k, v) => lines.push('  ' + (k + ' ').padEnd(30, '.') + ' ' + v);
      row('things you carried', C.carried.length ? C.carried.slice(0, 3).join(', ') : 'nothing');
      row('things you left behind', C.left.length ? C.left.length + (C.left[0] ? ' (like ' + C.left[0] + ')' : '') : 'none');
      row('things you made', C.made.length ? C.made.length : 'none yet');
      row('times you let it write', C.wrote);
      row('choices it watched you make', C.kept + C.left.length);
      for (const l of lines) { if (skipped) break; pre.textContent += l + '\n'; await wait(260); }
      await wait(600);
      pre.textContent += '\n';
      await typeIn(pre, 'two futures are loading.', 30);
      await wait(250);
      await typeIn(pre, 'one where the computer keeps going the way it’s been going.', 50);
      await typeIn(pre, 'one where it gives things back.', 50);
      await wait(400);
    }
    if (!skipped) { o.classList.add('ready'); await hold(act, 'enter the future'); }
    finish();
    function finish() {
      if (!busy) return;
      o.classList.add('flash');
      document.body.classList.remove('th-falling');
      document.querySelectorAll('#desktop .icon').forEach((ic) => { ic.style.removeProperty('--r'); ic.style.removeProperty('--d'); });
      go();
      busy = false;
      const q = after; after = []; q.forEach((f) => { try { f(); } catch (e) { /* keep going */ } });
      document.body.classList.add('th-arrived'); setTimeout(() => document.body.classList.remove('th-arrived'), 2600);
      setTimeout(() => o.remove(), RM() ? 50 : 900);
    }
  }

  // autopilot -> the human web: the generated screen cracks, the lights come up warm
  async function handover(go) {
    busy = true;
    const o = overlay('th-hand');
    const pre = o.querySelector('.th-out');
    let done = false;
    const finish = () => { if (done) return; done = true; o.classList.add('flash'); go(); busy = false; const q = after; after = []; q.forEach((f) => f()); setTimeout(() => o.remove(), RM() ? 50 : 1100); };
    o.querySelector('.th-skip').onclick = finish;
    await wait(900);
    if (!done) await typeIn(pre, 'autopilot off.', 24);
    await wait(500);
    if (!done) await typeIn(pre, 'ok. let’s try this again, with people in charge this time.', 40);
    await wait(500);
    if (!done) o.classList.add('sunrise');
    await wait(1800);
    finish();
  }

  // wrap setEra: a click that asks for 2030 from the archive gets the threshold first
  function hook() {
    const prev = window.setEra; if (typeof prev !== 'function') return;
    window.setEra = function (key) {
      const from = curEra();
      if (!QUICK && !busy && key === '2030' && from !== '2030' && gesture()) {
        const args = arguments, self = this;
        enter(() => prev.apply(self, args));
        return;
      }
      return prev.apply(this, arguments);
    };
  }
  window.Threshold = {
    busy: () => busy,
    after: (f) => { if (busy) after.push(f); else f(); },
    handover: (go) => { if (QUICK || busy) { go(); return; } handover(go); },
    enter: (go) => { if (QUICK || busy) { go(); return; } enter(go); },
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
})();
