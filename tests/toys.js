// node tests/toys.js — the five toys: the pet, screensavers, the sound board, the chain letter, bug garden
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../index.html') + '#quick';
const SHOTS = process.env.TOYS_SHOTS || ''; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/fonts\.g/, (r) => r.abort());
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  const go = async (k) => { await p.evaluate((k) => { setEra(k); document.querySelectorAll('[id^=era].show').forEach((x) => x.classList.remove('show')); }, k); await p.waitForTimeout(60); };
  const shot = async (n) => { if (SHOTS) { await p.waitForTimeout(350); await p.screenshot({ path: path.join(SHOTS, n + '.png') }); } };
  const front = (id) => p.evaluate((id) => { const w = document.getElementById(id); w.style.zIndex = 99999; w.style.left = '520px'; w.style.top = '130px'; }, id);
  const pet = () => p.evaluate(() => Toys.pet());
  const sprite = () => p.evaluate(() => document.querySelector('#tyPet svg').innerHTML);

  // ---- 1. the pet ----
  await go('1993'); ok(!(await pet()).here, '1993: no pet yet');
  await go('1996'); ok((await pet()).stage === 'egg', '1996: an egg is on the desktop');
  await p.click('#tyPet .ty-pet-b'); ok(await p.$('#tyPetMenu') !== null, 'clicking it opens a small menu');
  for (let i = 0; i < 3; i++) await p.click('#tyPetMenu [data-p=pet]');
  ok((await pet()).stage === 'baby', 'petting the egg three times hatches it'); const baby = await sprite();
  await p.click('#tyPetMenu [data-p=name]'); await p.fill('#tyPetName', 'Biscuit'); await p.keyboard.press('Enter');
  ok((await pet()).name === 'Biscuit', 'it can be named');
  await p.click('#tyPetMenu [data-p=feed]'); await p.click('#tyPetMenu [data-p=feed]'); ok((await pet()).fed === 2, 'it can be fed, and that is remembered');
  await p.keyboard.press('Escape'); ok(await p.$('#tyPetMenu') === null, 'Escape closes the menu');
  await p.focus('#tyPet .ty-pet-b'); await p.keyboard.press('Enter'); ok(await p.$('#tyPetMenu') !== null, 'the menu opens from the keyboard'); await p.keyboard.press('Escape');
  for (const k of ['1999', '2004', '2006', '2008', '2010']) { await go(k); ok((await pet()).here, k + ': the pet is there (' + (await pet()).stage + ')'); if (k === '1999') await shot('pet-1999'); }
  await go('2006'); ok((await pet()).stage === 'grown' && await sprite() !== baby, 'it looks different in 2006 than in 1996');
  const clear = await p.evaluate(() => { const r = document.getElementById('tyPet').getBoundingClientRect(); return [...document.querySelectorAll('#jyBtn, #fuBtn, #guide, .wh')].every((e) => { const q = e.getBoundingClientRect(); return q.width === 0 || r.right < q.left || r.left > q.right || r.bottom < q.top || r.top > q.bottom; }); });
  ok(clear, 'the pet overlaps none of the bottom buttons, the guide or the hidden things');
  await go('2014'); ok(!(await pet()).here && /Biscuit misses you/.test(await p.textContent('#tyNote')), '2014: the pet is gone; a notification says it misses you'); await shot('pet-2014');
  await p.click('#tyNote [data-n=open]'); ok(/Streak lost/.test(await p.textContent('#win-pet')), 'the notification leads to a streak-lost screen');
  await p.evaluate(() => document.querySelector('#win-pet .ty-cta').click()); ok(/Simulation/.test(await p.textContent('#win-pet .ty-sim')), 'buying treats goes nowhere and says so'); await front('win-pet'); await shot('pet-2014-app');
  await go('2016'); const n1 = await p.textContent('#tyNote em'); await go('2024'); ok(!(await pet()).here && +n1 === 27 && (await p.textContent('#tyNote em')) === '99+', '2016–2024: only a badge, and the count grows');
  await go('2030'); ok(!(await pet()).here && /want Biscuit back/.test(await p.textContent('#tyNote')), '2030: it kept your pet, and asks'); await shot('pet-2030-ask');
  await p.click('#tyNote [data-n=back]'); ok((await pet()).here && (await pet()).stage === 'elder' && (await pet()).name === 'Biscuit', '2030: it comes back, older, with its name'); await shot('pet-2030-back');

  // ---- 2. screensavers ----
  const saver = async (k) => { await go(k); return p.evaluate(() => Toys.screensaver(true)); };
  ok(await saver('1996') === 'shapes' && await p.$('#tySaver canvas') !== null, '1996: flying shapes on a canvas'); await p.waitForTimeout(900); await shot('saver-1996');
  await p.keyboard.press('a'); ok(await p.$('#tySaver') === null, 'any key dismisses it');
  ok(await saver('1999') === 'logo', '1999: the bouncing logo'); await p.waitForTimeout(600); await shot('saver-1999'); await p.keyboard.press('Escape'); ok(await p.$('#tySaver') === null, '1999: dismissed');
  ok(await saver('2008') === 'photos' && await saver('2010') === 'clock', '2008 photo bubbles, 2010 a clock'); await shot('saver-2010'); await p.keyboard.press('x');
  ok(await saver('2016') === 'still' && /still watching/i.test(await p.textContent('#tySaver')) && await p.$('#tySaver button') !== null, '2016: "Are you still watching?" with a continue button'); await shot('saver-2016');
  await p.mouse.move(300, 300); await p.mouse.move(500, 500); ok(await p.$('#tySaver') !== null, '2016: moving the mouse is not an answer'); await p.keyboard.press('Enter'); ok(await p.$('#tySaver') === null, '2016: a key (or the button) dismisses it');
  ok(await saver('2030') === 'dim' && /take your time/.test(await p.textContent('#tySaver')), '2030: it dims and says take your time'); await shot('saver-2030'); await p.keyboard.press('a');
  await go('2004'); await p.evaluate(() => { const e = document.createElement('div'); e.id = 'eraTestIntro'; e.className = 'show'; document.body.appendChild(e); });
  ok(typeof (await p.evaluate(() => Toys.IDLE_MS)) === 'number', 'the idle delay is a constant'); await p.evaluate(() => document.getElementById('eraTestIntro').remove());

  // ---- 3. the sound board ----
  const sounds = async (k) => { await go(k); await p.evaluate(() => Toys.open('sounds')); return p.evaluate(() => Toys.sounds.list().join(',')); };
  const s96 = await sounds('1996'); await front('win-sounds'); await shot('sounds-1996'); const s08 = await sounds('2008'); await front('win-sounds'); await shot('sounds-2008'); const s16 = await sounds('2016'); await front('win-sounds'); await shot('sounds-2016');
  ok(/modem/.test(s96) && /door/.test(s08) && /ping/.test(s16) && s96 !== s08 && s08 !== s16, 'different sounds in 1996, 2008 and 2016');
  ok(await p.evaluate(() => ['sounds', 'mines'].every((id) => document.querySelector('.app-icon[data-app=' + id + ']').style.display !== 'none')), 'the sounds and game icons are on the desktop');
  const before = errs.length; await p.click('#win-sounds [data-s=ping]'); await p.waitForTimeout(150);
  ok(errs.length === before && /playing/i.test(await p.textContent('#win-sounds .ty-sb-st')), 'pressing a sound throws nothing and says what is playing');
  ok(await p.evaluate(() => Toys.sounds.gain <= 0.08) && /Nothing plays automatically/.test(await p.textContent('#win-sounds .ty-sb-note')), 'it is quiet and says it never plays by itself');
  await p.evaluate(() => closeWindow('win-sounds')); await p.waitForTimeout(60); ok(await p.evaluate(() => Toys.sounds.playing() === 0), 'closing the window stops the sound');
  await sounds('2030'); ok(/silence \(default\)/.test(await p.textContent('#win-sounds')), '2030: one soft tone and silence (default)');

  // ---- 4. the chain letter ----
  await go('1996'); ok(await p.$('#tyMail') === null, 'no chain letter before 1999');
  await go('1999'); ok(/1 new message/.test(await p.textContent('#tyMail')), '1999: you have 1 new message');
  await p.click('#tyMail'); ok(/LUCKY TURNIP/.test(await p.textContent('#win-chain')), 'it opens the chain letter'); await front('win-chain'); await shot('chain-1999');
  await p.evaluate(() => { const r = document.getElementById('tyChN'); r.value = 7; r.dispatchEvent(new Event('input')); }); await p.evaluate(() => document.querySelector('#win-chain [data-c=fwd]').click());
  ok(await p.evaluate(() => Toys.chain.state().act === 'fwd' && Toys.chain.state().n === 7), 'forwarding to 7 friends is remembered');
  const chain = async (k) => { await go(k); await p.click('#tyMail'); await p.waitForTimeout(30); return p.textContent('#win-chain'); };
  ok(/Fwd: Fwd: Re: Fwd:/.test(await chain('2008')) && /forwarded this to 7 people in 1999/.test(await p.textContent('#win-chain')), '2008: Fwd: Fwd: Re: Fwd:, and it knows you forwarded it');
  let t = await chain('2016'); await front('win-chain'); await shot('chain-2016'); ok(/forwarded this to 7 people in 1999/.test(t) && /14,208/.test(t) && /screenshot/.test(t), '2016: a screenshot shared as a post, with reaction counts');
  t = await chain('2024'); ok(/Summary: a chain letter/.test(t) && /forwarded this to 7 people in 1999/.test(t), '2024: an AI summary: "a chain letter"'); await front('win-chain'); await shot('chain-2024');
  t = await chain('2030'); ok(/1987/.test(t) && /2016/.test(t) && /forwarded this to 7 people in 1999/.test(t), '2030: returned as a record with its whole route');

  // ---- 5. bug garden ----
  const size = async (k) => { await go(k); await p.evaluate(() => Toys.open('mines')); return p.evaluate(() => { const s = Toys.mines.state(); return [s.w, s.n, !!document.querySelector('#win-mines [data-m=auto]')]; }); };
  const m96 = await size('1996');
  await front('win-mines'); await p.click('#win-mines [data-i="40"]');
  let st = await p.evaluate(() => Toys.mines.state()); ok(st.started && !st.over && st.cells[40].open && !st.cells[40].bug && st.cells.filter((c) => c.bug).length === 10, 'the first click is safe and 10 bugs are placed');
  const shut = st.cells.findIndex((c) => !c.open);
  await p.click('#win-mines [data-i="' + shut + '"]', { button: 'right' }); ok(await p.evaluate((i) => Toys.mines.state().cells[i].flag === 1, shut), 'right-click marks a cell');
  await p.focus('#win-mines [data-i="' + shut + '"]'); await p.keyboard.press('f'); ok(await p.evaluate((i) => Toys.mines.state().cells[i].flag === 0, shut), 'F toggles the mark from the keyboard'); await shot('mines-1996');
  await p.evaluate(() => Toys.mines.state().cells.forEach((c, i) => { if (!c.bug) Toys.mines.reveal(i); }));
  st = await p.evaluate(() => Toys.mines.state()); ok(st.won && st.over && await p.evaluate(() => Toys.mines.best()['1996'] != null), 'revealing every safe cell wins, and the best time is kept');
  await p.evaluate(() => { Toys.mines.reset(); Toys.mines.reveal(0); const s = Toys.mines.state(); Toys.mines.reveal(s.cells.findIndex((c) => c.bug)); });
  ok(await p.evaluate(() => { const s = Toys.mines.state(); return s.over && !s.won; }), 'stepping on a bug loses');
  const m08 = await size('2008'), m16 = await size('2016'); await front('win-mines'); await shot('mines-2016'); const m24 = await size('2024');
  ok(m96[0] === 9 && m96[1] === 10 && m08[0] === 8 && m16[0] === 5 && m24[0] === 4 && m24[1] === 1, 'the board shrinks: 9×9 → 8×8 → 5×5 → 4×4');
  ok(!m96[2] && !m08[2] && !m16[2] && m24[2], 'auto-solve exists only in 2024');
  await front('win-mines'); await p.click('#win-mines [data-m=auto]'); await p.waitForFunction(() => Toys.mines.state().won, null, { timeout: 5000 });
  ok(/Solved for you/.test(await p.textContent('#win-mines .ty-m-msg')), '2024: it plays itself and congratulates you'); await shot('mines-2024');
  await go('2030'); ok(await p.evaluate(() => !document.getElementById('win-mines').classList.contains('open')), 'the game closes when its era ends');
  await p.evaluate(() => Toys.open('mines')); ok(/as hard as you like/.test(await p.textContent('#win-mines')), '2030: as hard as you like');

  // ---- phone width ----
  await p.setViewportSize({ width: 390, height: 844 });
  for (const [k, id] of [['1999', 'mines'], ['1999', 'chain'], ['2008', 'sounds'], ['2016', 'chain'], ['2030', 'mines']]) {
    await go(k); await p.evaluate((id) => Toys.open(id), id);
    ok(await p.evaluate((id) => { const r = document.getElementById('win-' + id).getBoundingClientRect(); const inner = [...document.querySelectorAll('#win-' + id + ' .app-body *')].every((e) => e.getBoundingClientRect().right <= r.right + 1); return r.right <= innerWidth + 1 && inner; }, id), '390px: ' + id + ' in ' + k + ' fits, no sideways scrolling from it');
  }
  for (const k of ['1999', '2014', '2030']) { await go(k); ok(await p.evaluate(() => [...document.querySelectorAll('#tyPet, #tyNote, #tyMail')].every((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; })), '390px: the pet, notice and chip stay on screen in ' + k);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); if (sw > 391) console.log('NOTE ' + k + ': page scrollWidth ' + sw + 'px at 390 (not from the toys: ' + await p.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('#tyPet,#tyNote,#tyMail,.app-win')).slice(0, 2).map((e) => e.className || e.tagName).join(', ')) + ')'); if (k === '1999') await shot('phone-1999'); }
  await go('1999'); ok(await p.evaluate(() => { const r = document.getElementById('tyPet').getBoundingClientRect(); return [...document.querySelectorAll('#jyBtn, #fuBtn, .wh')].every((e) => { const q = e.getBoundingClientRect(); return q.width === 0 || r.right <= q.left || r.left >= q.right || r.bottom <= q.top || r.top >= q.bottom; }); }), '390px: the pet overlaps none of the bottom buttons or the hit counter');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})();
