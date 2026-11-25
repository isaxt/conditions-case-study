// node tests/journey07.js  — the 0.7 journey layer, end to end (Chromium via file://)
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html') + '#journey&quick';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_TUNNEL|net::/.test(m.text())) errs.push(m.text()); });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  const things = await p.evaluate(() => Object.keys(TS_CONTENT.THINGS).map((k) => [k, TS_CONTENT.THINGS[k].length]));
  ok(things.length === 12 && things.every(([, n]) => n >= 3), 'every one of the 12 eras has 3+ things');
  ok(await p.evaluate(() => ERAS.every((e) => TS_CONTENT.THINGS[e.key])), 'every era key has content');
  ok(await p.evaluate(() => TS_CONTENT.PROFILES.every((x) => x.links.length === 3 && x.links.every((id) => Journey.ALL.some((t) => t.id === id)))), 'profiles: 3 valid links each');
  ok(await p.evaluate(() => Store.get('T-1991-first') && Store.get('T-1991-first').type === 'thing'), 'things are store artifacts');
  const settle = () => p.waitForFunction(() => !document.querySelector('[id^=era].show') && !(document.getElementById('ritual') && document.getElementById('ritual').getClientRects().length), null, { timeout: 25000 }).catch(() => {});
  // arrival shows disclosure before any scene
  await p.evaluate(() => setEra('1993')); await p.waitForSelector('#jyModal:not([hidden])');
  ok(/stays in this browser|in this browser/i.test(await p.textContent('.jy-sheet')) && /nothing sent anywhere/i.test(await p.textContent('.jy-sheet')), 'arrival discloses what it keeps and that it is local');
  await p.click('[data-a=begin]'); await p.waitForSelector('.jy-picks input');
  ok((await p.$$('.jy-picks input')).length === 4, 'scene 1: pool of 4, keep 3');
  const bx = await p.$$('.jy-picks input'); for (const x of bx.slice(0, 3)) await x.check();
  ok(await p.evaluate(() => [...document.querySelectorAll('.jy-picks input')].filter((i) => i.disabled).length === 1), 'fourth box locks at three');
  await p.fill('#jyWhy', 'a person'); await p.click('#jyCarry'); await p.click('[data-a=next]');
  let s = await p.evaluate(() => Journey.state());
  ok(s.kept['1993'].length === 3 && Object.keys(s.lost).length === 1 && s.lost['T-1991-link'].fate === 'gone', 'one thing gone, three kept');
  ok(s.why['1993'] === 'a person' && s.hes['1993'] > 0, 'sentence and seconds recorded');
  // gone thing: record only, with reason before 2024
  await p.evaluate(() => Journey.open('left')); await p.click('#win-things [data-thing="T-1991-link"]');
  ok(/record, not the thing/.test(await p.textContent('#jyMain')) && /overwritten/.test(await p.textContent('#jyMain')), 'gone = record + reason');
  // things here are explorable
  await p.evaluate(() => setEra('1996')); await p.evaluate(() => Journey.open('here'));
  await settle(); await p.click('#win-things [data-thing="T-1996-guest"]'); await p.click('#win-things [data-act=poke]');
  ok(/your line is added/.test(await p.textContent('#jyPoke')), 'poke gives a result');
  // the other four scenes, one at a time; checks each fate type appears
  const go = async (k) => { await p.evaluate((k) => setEra(k), k); if (k === '1999') { await p.waitForSelector('.s99-enter', { state: 'visible', timeout: 25000 }); await p.click('.s99-enter'); } await p.waitForSelector('.jy-picks input', { timeout: 30000 }); const bs = await p.$$('.jy-picks input'); for (const x of bs.slice(0, 3)) await x.check(); await p.click('#jyCarry'); await p.click('[data-a=next]'); };
  await go('1999'); await settle(); await go('2006'); await go('2010'); await go('2024');
  s = await p.evaluate(() => Journey.state());
  const fates = new Set(Object.values(s.lost).map((l) => l.fate));
  ok(['gone', 'gated', 'degraded', 'displaced'].every((f) => fates.has(f)), 'all four fates occurred: ' + [...fates]);
  ok(Object.keys(s.passed).length === 5, 'five scenes passed');
  // fate rendering
  const ids = Object.entries(s.lost); const pick = (f) => ids.find(([, l]) => l.fate === f)[0];
  await settle(); await p.evaluate(() => Journey.open('left'));
  await p.click('#win-things [data-thing="' + pick('degraded') + '"]'); ok(/image and formatting removed/.test(await p.textContent('#jyMain')), 'degraded is flattened');
  await p.click('#win-things [data-act=close-detail]'); await p.click('#win-things [data-thing="' + pick('displaced') + '"]'); ok(/system.s version/.test(await p.textContent('#jyMain')) && /not shown in this era/.test(await p.textContent('#jyMain')), 'displaced shows system version; original hidden');
  await p.click('#win-things [data-act=close-detail]');
  const g = ids.filter(([, l]) => l.fate === 'gated').map(([id]) => id);
  await p.click('#win-things [data-thing="' + g[0] + '"]'); ok(/not included in your plan|sign in to continue/.test(await p.textContent('#jyMain')), 'gated shows a gate (2024: a gate with no way in)');
  ok(await p.evaluate(() => !document.querySelector('#jyUnlock')), 'in 2024 the gate has no way in');
  await p.click('#win-things [data-act=close-detail]');
  // opaque reasons from 2024
  ok(await p.evaluate(() => { const l = Journey.state().lost; const id = Object.keys(l).find((k) => l[k].scene === '2024'); return !!id; }), '2024 losses exist');
  const txt = await p.textContent('#jyMain'); ok(/no reason shown/.test(txt), '2024 losses show no reason');
  // going back
  await p.evaluate(() => setEra('1999')); await p.waitForSelector('.s99-enter', { state: 'visible', timeout: 25000 }); await p.click('.s99-enter'); await settle(); s = await p.evaluate(() => Journey.state());
  ok(s.going.length === 1, 'going back is logged');
  ok(await p.evaluate(() => !document.getElementById('jyModal') || document.getElementById('jyModal').hidden), 'going back never re-asks');
  // a gated thing from an older (pre-2024) scene can be unlocked
  const g99 = g.find((id) => s.lost[id].scene === '1999');
  if (g99) { await p.evaluate((id) => Journey.open('here', id), g99); const un = await p.$('#jyUnlock'); if (un) { await p.check('#jyAgree'); await p.click('#jyUnlock'); ok(await p.evaluate((id) => !!Journey.state().unlocked[id], g99), 'an account gate can be passed (and is logged)'); } }
  // black box: stacks "why" hidden in 2024 only
  await p.evaluate(() => setEra('2024'));
  await p.evaluate(() => { openWindow('win-maze'); });
  const whyHidden = await p.evaluate(() => { const el = document.querySelector('.st-why'); return el ? getComputedStyle(el).fontSize : 'none'; });
  ok(whyHidden === '0px' || whyHidden === 'none', 'black-box: why panel suppressed in 2024 (' + whyHidden + ')');
  // displaced writing in 2024, a question in 2030
  await p.evaluate(() => openWindow('win-mail')); 
  await p.fill('#mailText', 'i think maybe sorry, i just wanted to say hello to you properly');
  ok(/suggested/.test(await p.textContent('#jyPolish')), '2024 suggests a rewrite while writing');
  ok(await p.evaluate(() => { const e = document.getElementById('jyPolish'), t = document.getElementById('mailText'), f = document.querySelector('#win-mail .ai-foot'), r = e.getBoundingClientRect(), tr = t.getBoundingClientRect(), fr = f.getBoundingClientRect(); return r.height > 20 && r.bottom <= fr.top + 1 && tr.bottom <= fr.top + 1 && tr.top >= 0; }), '2024 suggestion and the letter box are both visible above the pinned footer');
  await p.click('[data-p=use]'); ok(!/maybe/.test(await p.inputValue('#mailText')), 'accepting replaces their words');
  await p.evaluate(() => setEra('2030')); await p.fill('#mailText', 'something longer to trigger a question here please');
  ok(/mote asks/.test(await p.textContent('#jyPolish')), '2030 asks instead');
  await p.waitForTimeout(800);
  ok(await p.evaluate(() => { if (typeof focusWindow === 'function') focusWindow('win-mail'); const e = document.getElementById('jyPolish'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && e.contains(t); }), '2030 question is actually visible');
  const val = await p.inputValue('#mailText'); ok(val.startsWith('something longer'), '2030 never edits their text');
  // reveal
  await p.evaluate(() => Journey.open('noticed')); const rv = await p.textContent('#jyMain');
  ok(/what you wrote/.test(rv) && /time to choose/.test(rv) && /a person/.test(rv), 'reveal shows categories, seconds, and their own sentence');
  // export + erase
  ok(await p.evaluate(() => JSON.parse(Journey.exportJSON()).journey.kept['1993'].length === 3), 'export contains the record');
  await p.evaluate(() => Store.destroyAll()); ok(await p.evaluate(() => Object.keys(Journey.state().kept).length === 0 && localStorage.getItem('thirdspace.journey.v1') === null || Object.keys(Journey.state().kept).length === 0), 'delete-everything also erases the journey');
  // free mode: nothing lost
  await p.evaluate(() => { Journey.reset(); Journey.free(); setEra('1991'); }); await p.evaluate(() => setEra('2024'));
  ok(await p.evaluate(() => document.getElementById('jyModal').hidden && Object.keys(Journey.state().lost).length === 0), 'free mode: no scenes, nothing lost');
  // mobile
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(() => Journey.open('here'));
  const box = await p.evaluate(() => { const r = document.getElementById('win-things').getBoundingClientRect(); return [r.left, r.right, innerWidth]; });
  ok(box[0] >= 0 && box[1] <= box[2] + 1, 'mobile: things window fits');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})();
