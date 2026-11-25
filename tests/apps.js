// node tests/apps.js — the period apps: the web per era, paint, kid stamps
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html') + '#quick';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/fonts\.g/, (r) => r.abort());
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  const go = async (k) => { await p.evaluate((k) => { setEra(k); document.querySelectorAll('[id^=era].show').forEach((x) => x.classList.remove('show')); }, k); };
  const icons = () => p.evaluate(() => [...document.querySelectorAll('.app-icon')].filter((e) => e.style.display !== 'none').map((e) => e.dataset.app).join(','));
  await go('1993'); { const i = (await icons()).split(','); ok(i.includes('web') && i.includes('paint') && !i.includes('kid'), '1993 has the web and paint'); }
  await go('1996'); ok((await icons()).split(',').includes('kid'), '1996 adds kid stamps');
  await go('2016'); { const i = (await icons()).split(','); ok(i.includes('web') && !i.includes('paint') && !i.includes('kid'), '2016 has the web but no paint or kid stamps'); }
  const search = async (k, q) => { await go(k); await p.evaluate(() => Apps.openWeb()); if (await p.$('#wbQ')) { await p.fill('#wbQ', q); await p.evaluate(() => document.querySelector('#win-web form').requestSubmit()); } return p.textContent('#wbView'); };
  ok(/Host not found/.test(await search('1993', 'cats')), '1993: there is no search, only a list');
  ok(/Found 14 sites/.test(await search('1996', 'cats')) && /UNDER CONSTRUCTION/.test(await p.textContent('#wbView')), '1996: a portal with hand-filed home pages');
  let t = await search('2004', 'cats'); ok(/stub/.test(t) && !/Sponsored/.test(t), '2004: clean results, no ads yet');
  await p.click('#win-web li.flash a'); ok(/plug-in/.test(await p.textContent('#wbView')), 'the Flash-style game asks for a plug-in');
  t = await search('2016', 'cats'); ok(/People also ask/.test(t) && /personalised/.test(t) && await p.$('#win-web li.ad') !== null, '2016: ads on top, personalised, people also ask');
  ok(await p.evaluate(() => /searched for/.test(document.body.textContent)), 'from 2010 a search is written to the receipt');
  t = await search('2024', 'cats'); ok(/AI Overview/.test(t) && /Subscribe to continue/.test(t), '2024: an AI overview on top and a paywall below');
  await go('2030'); await p.evaluate(() => Apps.openWeb()); ok(/don.t search here/.test(await p.textContent('#wbView')), '2030: you ask your agent instead');
  // paint
  await go('1999'); await p.evaluate(() => { const e = document.querySelector('#era1999'); if (e) e.classList.remove('show'); Apps.openArt('paint'); });
  const blank = await p.evaluate(() => document.querySelector('#win-paint canvas').toDataURL().length);
  const box = await (await p.$('#win-paint canvas')).boundingBox();
  await p.evaluate(() => { const w = document.getElementById('win-paint'); w.style.zIndex = 99999; });
  await p.mouse.move(box.x + 40, box.y + 40); await p.mouse.down(); await p.mouse.move(box.x + 200, box.y + 120, { steps: 6 }); await p.mouse.up();
  ok(await p.evaluate((n) => document.querySelector('#win-paint canvas').toDataURL().length !== n, blank), 'paint: dragging draws');
  await p.click('#win-paint [data-do=undo]'); ok(await p.evaluate((n) => document.querySelector('#win-paint canvas').toDataURL().length === n, blank), 'paint: undo restores');
  await p.click('#win-paint [data-tool=fill]'); await p.click('#win-paint [data-col="#ff0000"]'); await p.mouse.click(box.x + 100, box.y + 100);
  ok(await p.evaluate(() => { const c = document.querySelector('#win-paint canvas').getContext('2d').getImageData(5, 5, 1, 1).data; return c[0] === 255 && c[1] === 0; }), 'paint: the bucket fills');
  await p.click('#win-paint [data-do=keep]'); ok(await p.evaluate(() => Journey.mine().some((m) => /^Y-draw-paint/.test(m.id) && /^data:image/.test(m.img))), 'a kept drawing becomes one of your things');
  // kid stamps
  await p.evaluate(() => { Apps.openArt('kid'); document.getElementById('win-kid').style.zIndex = 99999; });
  const kb = await (await p.$('#win-kid canvas')).boundingBox(); const kblank = await p.evaluate(() => document.querySelector('#win-kid canvas').toDataURL().length);
  await p.click('#win-kid [data-stamp="🐸"]'); await p.mouse.click(kb.x + 80, kb.y + 80);
  ok(await p.evaluate((n) => document.querySelector('#win-kid canvas').toDataURL().length !== n, kblank), 'kid stamps: a stamp lands');
  await p.click('#win-kid [data-do=clear]'); ok(/BOOM/.test(await p.textContent('#win-kid .art-status')), 'kid stamps: BOOM clears');
  await go('2016'); ok(await p.evaluate(() => !document.getElementById('win-paint').classList.contains('open')), 'paint closes when its era ends');
  await p.setViewportSize({ width: 390, height: 844 }); await go('2004'); await p.evaluate(() => Apps.openArt('kid'));
  ok(await p.evaluate(() => { const r = document.getElementById('win-kid').getBoundingClientRect(); return r.right <= innerWidth + 1; }), 'fits a phone');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})();
