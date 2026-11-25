// node tests/personal.js — 0.7.2: memories + questions, made things, "yours", keepsake, and the hidden little things
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html') + '#journey&quick';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/fonts\.g/, (r) => r.abort());
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  ok(await p.evaluate(() => ERAS.every((e) => TS_CONTENT.MEMORIES[e.key] && TS_CONTENT.MEMORIES[e.key].ask)), 'every era has a memory and a question');
  // 1991: hidden cat, typed hello
  ok(await p.$('.wh-cat') !== null, '1991 hides a cat');
  await p.evaluate(() => document.querySelector('.wh-cat').click());
  ok(await p.evaluate(() => Whimsy.state().found.cat === 1 && /meow/.test(document.getElementById('whSay').textContent)), 'the cat answers and is counted');
  await p.keyboard.type('hello'); ok(await p.evaluate(() => Whimsy.state().found.typed === 1), 'typing hello in 1991 is answered');
  // answer the 1991 question, start the journey
  await p.evaluate(() => Journey.open('here')); await p.fill('#jyMem', 'my uncle’s beige tower in the hallway');
  await p.click('#win-things [data-act=mem-save]');
  ok(await p.evaluate(() => Journey.mine().length === 1 && Journey.mine()[0].kind === 'memory'), 'an answer becomes one of your things');
  await p.evaluate(() => { closeWindow('win-things'); setEra('1993'); }); await p.waitForSelector('#jyModal:not([hidden])');
  ok(/anything you write/.test(await p.textContent('.jy-sheet')), 'arrival discloses that answers and made things are kept');
  await p.click('[data-a=begin]'); await p.waitForSelector('.jy-picks input');
  ok((await p.$$('.jy-picks input')).length === 5 && await p.$('.jy-picks .jy-obj.mine') !== null, 'your answer is in the pool, marked yours');
  // leave your own answer behind
  const ids = await p.$$eval('.jy-picks input', (xs) => xs.map((x) => x.dataset.id));
  for (const id of ids.filter((i) => !/^Y-/.test(i)).slice(0, 3)) await p.check('.jy-picks input[data-id="' + id + '"]', { force: true });
  await p.click('#jyCarry');
  ok(/one of those was yours/.test(await p.getAttribute('.jy-sheet .jy-bubble', 'data-type')), 'mote says one of those was yours');
  await p.click('[data-a=next]');
  ok(await p.evaluate(() => Journey.fateOf('Y-mem-1991') === 'gone'), 'your own answer can be lost');
  ok(await p.$('.wh-cloud') !== null, '1993 hides a cloud');
  // make something in a world: it becomes yours
  await p.evaluate(() => { setEra('2004'); openWindow('win-c-indieweb'); });
  await p.evaluate(() => Journey.made(ThirdSpaceNext.cultures.find((c) => c.id === 'indieweb'), 'publish', 'published a page about my cat'));
  ok(await p.evaluate(() => Journey.mine().some((t) => t.id === 'Y-made-indieweb')) && await p.evaluate(() => document.getElementById('jyToast').classList.contains('on')), 'making something in a world makes it yours (and mote notices)');
  ok(await p.evaluate(() => { Journey.made(ThirdSpaceNext.cultures[0], 'tune', 'x'); return Journey.mine().length === 2; }), 'non-making acts are not kept as yours');
  await p.evaluate(() => closeWindow('win-c-indieweb'));
  ok(await p.$('.wh-marquee') !== null && await p.$('.wh-star') === null, '2004 hides a marquee (the star was removed in 0.11)');
  // modern eras: no eggs, a rating chip instead
  await p.evaluate(() => { const s = Journey.state(); ['1999', '2006', '2010', '2024'].forEach((a) => { s.passed[a] = true; }); s.lost['Y-made-indieweb'] = { fate: 'displaced', scene: '2010', reason: '' }; setEra('2016'); });
  ok(await p.evaluate(() => !document.querySelector('.wh-cat,.wh-star,.wh-marquee,.wh-counter,.wh-poke') && !!document.querySelector('.wh-rate')), '2016 hides nothing and asks for a rating instead');
  await p.evaluate(() => Journey.open('yours'));
  const y16 = await p.textContent('#jyMain');
  ok(/filed as: user-generated content/.test(y16) && !/about my cat/.test(y16), 'in 2016 your displaced thing shows only how it was filed');
  // 2030: handed back whole, signed; keepsake; hide a note
  await p.evaluate(() => setEra('2030')); await p.evaluate(() => Journey.open('yours'));
  await p.fill('#jyName', 'isa');
  const y30 = await p.evaluate(() => { Journey.open('yours'); return document.getElementById('jyMain').textContent; });
  ok(/about my cat/.test(y30) && /beige tower/.test(y30) && /isa/.test(y30) && /returned/.test(y30), '2030 hands everything of yours back, signed');
  ok(await p.evaluate(() => /beige tower/.test(Journey.keepsake()) && /isa/.test(Journey.keepsake())), 'the keepsake page holds your own words');
  await p.evaluate(() => Journey.open('noticed')); ok(/filed as/.test(await p.textContent('#jyMain')), 'the file shows your words next to how they were filed');
  await p.fill('#whLeave', 'look under the counter'); await p.evaluate(() => document.querySelector('.wh-leave').requestSubmit());
  await p.evaluate(() => setEra('1996')); ok(await p.$('.wh-left') !== null, 'a note hidden in 2030 turns up in 1996');
  // erase
  await p.evaluate(() => Store.destroyAll());
  ok(await p.evaluate(() => Journey.mine().length === 0 && Object.keys(Whimsy.state().found).length === 0 && !Whimsy.state().left), 'delete-everything erases yours and the finds');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); if (fails) process.exitCode = 1;
})();
// ---- 0.10: your year, bring one thing, the shelf between sessions, two rooms ----
(async () => {
  const { chromium } = require('playwright'); const path = require('path');
  const URL = 'file://' + path.resolve(__dirname, '../index.html') + '#journey&quick';
  let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) { fails++; process.exitCode = 1; } };
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.route(/fonts\.g/, (r) => r.abort());
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => setEra('1993')); await p.waitForSelector('#jyBorn');
  await p.fill('#jyBorn', '2005'); await p.fill('#jyBringA', 'the penguin game');
  await p.click('[data-a=free]');
  ok(await p.evaluate(() => Journey.yourEra() === '2014' && !!document.querySelector('.era-btn.jy-mine-era[data-era="2014"]')), 'born 2005: 2014 is marked as their era');
  ok(await p.evaluate(() => Journey.mine().some((m) => m.id === 'Y-brought' && m.era === '2014' && /penguin/.test(m.line))), 'the thing they brought becomes theirs, in their era');
  await p.evaluate(() => setEra('2014')); await p.waitForTimeout(1700);
  ok(await p.evaluate(() => /this one was yours/.test(document.getElementById('jyToast').textContent)), 'mote greets them in their era');
  await p.evaluate(() => Journey.open('people'));
  ok((await p.$$('.jy-roomcard')).length === 2, 'two rooms, one per interview');
  await p.click('.jy-roomcard'); await p.click('#win-things [data-act=toy-weather]');
  ok(/whole demonstration/.test(await p.textContent('#jyToy')), 'the weather demonstration works in his room');
  await p.click('.jy-room-obj[data-i="1"]'); ok(/fax/.test(await p.textContent('.jy-room-mem')), 'each object is one memory');
  await p.click('#win-things [data-act=room-go]'); ok(await p.evaluate(() => /era-1996/.test(document.body.className)), 'an object takes you to its year');
  // leave one for the next person; it survives "erase journey" and is found by the next visitor
  await p.evaluate(() => { setEra('2030'); Journey.open('yours'); });
  await p.check('#jyLeaveOk'); await p.click('#win-things [data-act=leave]');
  ok(await p.evaluate(() => Journey.shelf().length === 1), 'a thing can be left, unsigned, only after ticking the box');
  await p.evaluate(() => Journey.reset()); await p.reload();
  await p.evaluate(() => { Journey.free(); setEra('2014'); Journey.open('here'); });
  ok(/left by someone before you/.test(await p.textContent('#jyMain')) && /penguin/.test(await p.textContent('#jyMain')), 'the next person finds it in its year');
  await p.evaluate(() => Store.destroyAll()); ok(await p.evaluate(() => Journey.shelf().length === 0), 'delete-everything empties the shelf too');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); console.log(fails ? fails + ' FAILED (0.10)' : 'ALL PASSED (0.10)');
})();
