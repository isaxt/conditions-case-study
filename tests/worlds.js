// node tests/worlds.js — every field-guide world opens in an era where it lives, has its ritual and field note,
// survives clicks on its first buttons, and fits a phone without sideways scrolling.
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html') + '#quick';
let fails = 0; const ok = (c, m) => { if (!c) { console.log('FAIL ' + m); fails++; } };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errs.push(m.text()); });
  await p.route(/fonts\.g/, (r) => r.abort());
  await p.goto(URL);
  const list = await p.evaluate(() => ThirdSpaceNext.cultures.filter((c) => (window.SC_PAGES || {})[c.id] && SC_PAGES[c.id].run).map((c) => ({ id: c.id, from: c.from || 1991 })));
  ok(list.length === 33, 'expected 33 worlds, found ' + list.length);
  const keys = await p.evaluate(() => ERAS.map((e) => e.key));
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await p.setViewportSize(vp);
    for (const w of list) {
      const era = keys.find((k) => +k >= w.from) || '2030';
      const before = errs.length;
      await p.evaluate(([era, id]) => { setEra(era); document.querySelectorAll('[id^=era].show').forEach((e) => e.classList.remove('show')); openWindow('win-c-' + id); }, [era, w.id]);
      const r = await p.evaluate((id) => {
        const win = document.getElementById('win-c-' + id), st = win.querySelector('.cult-stage');
        const btns = [...st.querySelectorAll('button')].filter((x) => !x.disabled && x.offsetParent).slice(0, 4);
        btns.forEach((x) => { try { x.click(); } catch (e) { /* counted below */ } });
        return { note: !!st.querySelector('.sc-note'), world: win.classList.contains('sc-world'), btns: btns.length, over: (() => { const wb = win.querySelector('.winbody'); wb.scrollLeft = 999; const o = wb.scrollLeft; wb.scrollLeft = 0; return o; })(), ww: win.getBoundingClientRect().width, vw: innerWidth };
      }, w.id);
      await p.waitForTimeout(150);
      ok(r.world && r.note, w.id + ': world + field note');
      ok(r.btns > 0, w.id + ': has buttons to press');
      ok(r.over <= 2, w.id + ': no sideways scrolling at ' + vp.width + ' (' + r.over + 'px)');
      ok(r.ww <= r.vw, w.id + ': window fits viewport at ' + vp.width);
      ok(errs.length === before, w.id + ': no errors at ' + vp.width + ' ' + errs.slice(before).join(' | '));
      await p.evaluate((id) => closeWindow('win-c-' + id), w.id);
    }
  }
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL ' + list.length + ' WORLDS PASSED'); process.exit(fails ? 1 : 0);
})();
