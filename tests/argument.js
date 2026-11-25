// node tests/argument.js  — the five argument features (js/features/argument.js), in Chromium via file://
// say hi · the effort meter · the defaults room · one sentence · what the metric saw.  Screenshots go to SHOTS (or argv[2]).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../index.html') + '#quick';
const SHOTS = process.argv[2] || '/tmp/claude-0/-home-claude/e154b737-6951-5d67-bad2-5e7af83c8004/scratchpad/argument';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.route(/fonts\.g/, (r) => r.abort());
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errs.push(m.text()); });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
  const era = async (k) => { await p.evaluate((k) => { setEra(k); const s = document.querySelector('#era1999'); if (s) s.classList.remove('show', 'ready', 'play'); }, k); await p.waitForTimeout(250); };   // the 1999 splash is a full-page intro; step past it
  const click = (sel) => p.$eval(sel, (el) => el.click());                       // el.click(): popups and the guide can sit on top in late eras
  const type = async (sel, text) => { await p.focus(sel); await p.keyboard.type(text); };
  const only = (id) => p.evaluate((id) => { document.querySelectorAll('.window.open').forEach((w) => { if (w.id !== id) closeWindow(w.id); }); const w = document.getElementById(id); if (w) { w.style.left = '420px'; w.style.top = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--chrome-h'), 10) || 100) + 70 + 'px'; } const g = document.getElementById('guide'); if (g) g.style.display = 'none'; const pl = document.getElementById('popupLayer'); if (pl) pl.innerHTML = ''; }, id);
  const shot = async (name) => { await p.waitForTimeout(150); await p.screenshot({ path: path.join(SHOTS, name + '.png') }); };
  const sent = () => p.waitForSelector('#win-sayhi .hi.sent', { timeout: 6000 });
  const rec = (k) => p.evaluate((k) => Argument.record(k), k);

  /* ---------- icons ---------- */
  await era('1991'); ok(await p.evaluate(() => !!window.Argument && [...document.querySelectorAll('.app-icon[data-app="sayhi"], .app-icon[data-app="defaults"]')].every((e) => e.style.display === 'none')), '1991: Argument is there, no say-hi or defaults icons yet');
  await era('1993'); ok(await p.evaluate(() => ['sayhi', 'defaults'].every((id) => document.querySelector('.app-icon[data-app="' + id + '"]').style.display !== 'none') && document.querySelector('.app-icon[data-app="sentence"]').style.display === 'none'), '1993: say hi + defaults icons; one sentence arrives in 1996');

  /* ---------- 1 · say hi ---------- */
  await p.evaluate(() => Argument.open('sayhi')); await only('win-sayhi');
  await click('#win-sayhi [data-hi-go]'); ok(/550|address/.test(await p.textContent('#win-sayhi .hi-err')), '1993: no address typed, no send');
  await type('#win-sayhi [data-hi="to"]', 'afriend@campus.example'); await type('#win-sayhi [data-hi="subj"]', 'hello from the lab'); await type('#win-sayhi [data-hi="body"]', 'i was thinking of you today and the long walk home.');
  await shot('sayhi-1993'); await p.click('#win-sayhi [data-hi-go]'); await sent(); const r93 = await rec('1993');
  ok(r93 && r93.keys >= 80 && r93.mine === r93.words && r93.words >= 10, '1993: mail typed by hand: ' + JSON.stringify(r93));
  ok(/keystrokes/.test(await p.textContent('#win-sayhi .ag-tally')) && /only these counts are kept/.test(await p.textContent('#win-sayhi .ag-tally')), '1993: the tally shows, and says only counts are kept');
  ok(!/long walk home/.test(await p.evaluate(() => JSON.stringify(localStorage))), 'the typed message is not in localStorage, only the tally');
  await era('1999'); ok(/Instant Message/.test(await p.textContent('#win-sayhi .hi')), 'the open say-hi window redraws for 1999');
  await type('#win-sayhi [data-hi="name"]', 'walkhome99'); await type('#win-sayhi [data-hi="body"]', 'thinking of you. call me later?'); await p.keyboard.press('Enter'); await sent(); const r99 = await rec('1999');
  ok(r99 && r99.keys >= 35 && r99.mine === r99.words, '1999: instant message: ' + JSON.stringify(r99));
  await era('2006'); await type('#win-sayhi [data-hi="body"]', 'miss u!! thinking of you'); await click('#win-sayhi [data-hi-pick="glit:rain"]'); await click('#win-sayhi [data-hi-go]'); await sent(); await only('win-sayhi'); await shot('sayhi-2006');
  await era('2010'); await click('#win-sayhi [data-hi-pick="filt:warm"]'); await type('#win-sayhi [data-hi="body"]', 'thought of you'); await click('#win-sayhi [data-hi-go]'); await sent(); const r10 = await rec('2010');
  ok(r10 && r10.keys === 14 && r10.choices === 2 && r10.mine === 3, '2010: a filter and a caption: ' + JSON.stringify(r10));
  await era('2024'); await only('win-sayhi'); await shot('sayhi-2024'); await click('#win-sayhi .hi-sugg .hi-q'); await sent(); const r24 = await rec('2024');
  ok(r24 && r24.keys === 0 && r24.choices === 1 && r24.mine === 0 && r24.words === 3, '2024: one suggested reply, none of the words yours: ' + JSON.stringify(r24));
  ok(r93.keys > r99.keys && r99.keys > r10.keys && r10.keys > r24.keys, 'keystrokes fall: ' + [r93.keys, r99.keys, r10.keys, r24.keys].join(' > '));
  await era('2030'); await type('#win-sayhi [data-hi="feel"]', 'remembered'); await click('#win-sayhi [data-hi-pick="mode:draft"]');
  ok(/remembered/.test(await p.inputValue('#win-sayhi #hi30 textarea')), '2030: the agent drafts from what you said you want them to feel');
  await type('#win-sayhi #hi30 textarea', ' i still have your mixtape.'); await only('win-sayhi'); await shot('sayhi-2030'); await click('#win-sayhi [data-hi-go]'); await sent(); const r30 = await rec('2030');
  ok(r30 && r30.keys > 20 && r30.mine > 0 && r30.mine < r30.words, '2030: drafted by the agent, changed by you: ' + JSON.stringify(r30));
  ok(await p.evaluate(() => document.querySelectorAll('#win-sayhi .ag-col.done').length) === 6, 'the "so far" strip shows the six eras done'); await shot('sayhi-2030-sent');

  /* ---------- 2 · effort meter ---------- */
  const e93 = await p.evaluate(() => Argument.effort('1993')), e24 = await p.evaluate(() => Argument.effort('2024'));
  ok(e93.k >= 80 && e93.c >= 2 && e24.k === 0 && e24.c >= 1, 'effort is counted per era: 1993 ' + JSON.stringify(e93) + ' · 2024 ' + JSON.stringify(e24));
  const chipN = async () => +(await p.textContent('#agChip b')).replace(/\D/g, '');
  await era('2004'); const n0 = await chipN(); await p.evaluate(() => Argument.open('defaults')); await click('#win-defaults [data-df="5"]'); await p.waitForTimeout(80);
  ok(await chipN() === n0 + 1, '2004: one click on a control moves the chip by one (' + n0 + ' → ' + (n0 + 1) + ')');
  await p.click('#agChip'); ok(await p.evaluate(() => TSKit.isOpen('win-effort') && document.querySelectorAll('#win-effort .ef-row').length >= 6 && /frictionless/.test(document.querySelector('#win-effort .ef-line').textContent) && /only these counts/.test(document.querySelector('#win-effort .ef-foot').textContent)), 'the chip opens the effort panel: a row per era, the honest line, what is kept');
  ok(await chipN() === n0 + 1, 'opening the meter is not counted as effort');
  ok(!!(await p.evaluate(() => JSON.parse(localStorage.getItem('thirdspace.kit.argument') || '{}').effort)), 'counts persist in TSKit.state("argument")');
  await only('win-effort'); await shot('effort-panel-2004');
  await era('2030'); ok(await p.evaluate(() => !!document.querySelector('#win-effort #efShare') && /yours to set/.test(document.querySelector('#win-effort .ef-own').textContent)), '2030: the panel says the number is yours to set');
  await p.evaluate(() => TSKit.hide('win-effort'));

  /* ---------- 3 · defaults ---------- */
  const dc = (k) => p.evaluate((k) => Argument.defaults(k), k);
  await era('1993'); await p.evaluate(() => Argument.open('defaults')); await only('win-defaults'); let d = await dc('1993');
  ok(d.total <= 3 && d.forYou === 0 && d.byYou === 0, '1993: almost nothing, all off: ' + JSON.stringify(d));
  await click('#win-defaults [data-df="0"]'); d = await dc('1993'); ok(d.byYou === 1 && /1\s*by you/.test(await p.textContent('#win-defaults .df-count')), '1993: tick one, "1 by you"'); await shot('defaults-1993');
  await era('1999'); d = await dc('1999'); ok(d.forYou === 3, '1999: three boxes pre-ticked'); await era('2008'); await only('win-defaults'); await shot('defaults-2008');
  await era('2016'); d = await dc('2016'); ok(d.total >= 14 && d.forYou >= 13, '2016: a long list, nearly all on: ' + JSON.stringify(d));
  await click('#win-defaults [data-df="11"]'); ok(await p.evaluate(() => !!document.querySelector('#win-defaults .df-ask')) && (await dc('2016')).byYou === 0, '2016: a resisting switch asks "are you sure?" first');
  await click('#win-defaults [data-df-off]'); ok((await dc('2016')).byYou === 1, '2016: "turn off" does turn it off');
  await click('#win-defaults [data-df="0"]'); ok((await dc('2016')).byYou === 2, '2016: "best posts first" goes off…'); await only('win-defaults'); await shot('defaults-2016');
  await p.waitForTimeout(2900); ok((await dc('2016')).byYou === 1 && /switched itself back on/.test(await p.textContent('#win-defaults .df-note')), '…and switches itself back on, said plainly');
  await era('2024'); d = await dc('2024'); ok(d.total >= 16 && d.forYou === d.total, '2024: everything decided: ' + JSON.stringify(d));
  await click('#win-defaults [data-df="5"]'); ok((await dc('2024')).byYou === 0 && /managed/i.test(await p.textContent('#win-defaults .df-note')), '2024: a managed switch does not move'); await only('win-defaults'); await shot('defaults-2024');
  await era('2030'); await click('#win-defaults [data-df="0"]'); d = await dc('2030'); ok(d.byYou === 1 && /set by/.test(await p.textContent('#win-defaults .df-list')) && /you, just now/.test(await p.textContent('#win-defaults .df-list')), '2030: every default has an author, and changing one makes it yours'); await only('win-defaults'); await shot('defaults-2030');
  await p.evaluate(() => TSKit.hide('win-defaults'));

  /* ---------- 4 · one sentence ---------- */
  const LINE = 'The first thing I remember is waiting for the modem to finish singing so I could look at a page about owls that a stranger in another country had made by hand.';
  await era('1996'); await p.evaluate(() => Argument.open('sentence')); await only('win-sentence');
  ok(await p.evaluate(() => !!document.querySelector('#snIn')), 'no written answer yet: it asks for one sentence');
  await type('#snIn', LINE); await p.keyboard.press('Enter');
  const fr = (y) => p.textContent('#win-sentence .sf[data-era="' + y + '"]');
  ok((await fr('1996')).includes(LINE) && (await fr('2030')).includes(LINE), 'the sentence is whole in the 1996 and 2030 frames');
  ok(!(await fr('2010')).includes(LINE) && (await fr('2010')).includes(LINE.slice(0, 140)) && /see more/.test(await fr('2010')), '2010 cuts it at 140 with "see more"');
  ok(!/owls|modem/.test(await fr('2024')) && /memory about/.test(await fr('2024')), '2024 keeps a summary and drops the specifics: ' + (await fr('2024')).replace(/\s+/g, ' ').slice(0, 90));
  ok(/— you,/.test(await fr('2030')), '2030 signs and dates it');
  await shot('sentence-strip'); await click('#win-sentence .sf[data-era="2030"]'); ok(await p.evaluate(() => document.querySelector('#win-sentence .sf[data-era="2030"]').classList.contains('big')), 'clicking a frame enlarges it'); await shot('sentence-enlarged');
  await click('#win-sentence [data-sn="keep"]'); ok(await p.evaluate((l) => (Journey.mine().find((m) => m.kind === 'memory') || {}).line === l, LINE), '"keep it" hands the sentence to Journey.answer');
  await p.evaluate(() => TSKit.hide('win-sentence'));

  /* ---------- 5 · what the metric saw ---------- */
  ok(await p.evaluate(() => document.querySelector('#agMetric') === null || document.querySelector('#agMetric').hidden), 'the metric overlay is off by default');
  const seen = {};
  for (const k of ['1996', '2008', '2016', '2024', '2030']) {
    await era(k); await p.evaluate(() => Argument.metric(true)); await p.waitForTimeout(120);
    if (k === '2008') { await p.mouse.click(700, 500); await p.mouse.click(820, 620); await p.waitForTimeout(150); }
    seen[k] = await p.evaluate(() => ({ kind: document.querySelector('#agMetric').dataset.kind, text: document.querySelector('#agMetric .mt-main').textContent, dots: document.querySelectorAll('#agMetric .mt-dot').length, ghosts: document.querySelectorAll('#agMetric .mt-ghost').length, pe: getComputedStyle(document.querySelector('#agMetric')).pointerEvents, tint: getComputedStyle(document.querySelector('#agMetric .mt-tint')).pointerEvents, x: getComputedStyle(document.querySelector('#agMetricX')).pointerEvents, sim: /simulation/.test(document.querySelector('#agMetric .mt-hud').textContent) }));
    if (k === '1996' || k === '2008' || k === '2016' || k === '2024') { await only('none'); await shot('metric-' + k); }
    if (k !== '2030') await p.evaluate(() => Argument.metric(false));
  }
  ok(seen['1996'].kind === 'hits' && seen['2008'].kind === 'clicks' && seen['2016'].kind === 'engage' && seen['2024'].kind === 'predict' && seen['2030'].kind === 'own' && new Set(Object.values(seen).map((s) => s.text)).size === 5, 'the overlay differs by era: ' + Object.values(seen).map((s) => s.kind).join(', '));
  ok(seen['2008'].dots === 2 && seen['2024'].ghosts >= 2 && /time on site/.test(seen['2016'].text) && /illustration/.test(seen['2024'].text) && /unless you switch it on/.test(seen['2030'].text), 'clicks leave marks (2008), a timer runs (2016), ghosts are labelled illustration (2024), 2030 measures nothing unasked');
  ok(Object.values(seen).every((s) => s.pe === 'none' && s.tint === 'none' && s.x === 'auto' && s.sim), 'the overlay is pointer-transparent except its own button, and labelled a simulation');
  ok(await p.evaluate(() => document.querySelector('#agMetricBtn').getAttribute('aria-pressed')) === 'true', 'the switch by the chip shows it is on'); await p.click('#agMetricX');
  ok(await p.evaluate(() => document.querySelector('#agMetric').hidden && document.querySelector('#agMetricBtn').getAttribute('aria-pressed') === 'false'), 'its own button switches it off');
  await p.focus('#agMetricBtn'); await p.keyboard.press('Enter'); ok(await p.evaluate(() => !document.querySelector('#agMetric').hidden), 'the switch works from the keyboard'); await p.evaluate(() => Argument.metric(false));

  /* ---------- the chip in place, every era: overlaps nothing fixed ---------- */
  const clash = [];
  for (const k of ['1993', '1996', '1999', '2004', '2006', '2008', '2010', '2014', '2016', '2024', '2030']) {
    await era(k); await p.waitForTimeout(200);
    const hit = await p.evaluate(() => { const d = document.querySelector('#agDock').getBoundingClientRect(); if (!d.width) return ['dock not visible']; return [...document.querySelectorAll('#jyBtn, #jyPocket, #fuBtn, #jyToast, #taskbar, #guide, #eraBar, #eraNote, #desktop .icon, .wh')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && !(r.right <= d.left || r.left >= d.right || r.bottom <= d.top || r.top >= d.bottom); }).map((el) => el.id || el.className); });
    if (hit.length) clash.push(k + ': ' + hit.join(','));
    if (k === '1996' || k === '2014' || k === '2030') { await only('none'); await shot('chip-' + k); }
  }
  ok(!clash.length, 'the effort chip overlaps nothing in any era' + (clash.length ? ' — ' + clash.join(' | ') : ''));

  /* ---------- erase, 390px, errors ---------- */
  await p.evaluate(() => Journey.reset()); ok(await p.evaluate(() => Object.keys(Argument.record()).length === 0 && Object.keys(Argument.effort()).length <= 1), 'erasing the journey erases the counts');
  await p.setViewportSize({ width: 390, height: 800 }); const wide = [];
  for (const k of ['1993', '2006', '2016', '2024', '2030']) {
    await era(k);
    for (const id of ['sayhi', 'defaults', 'sentence', 'effort']) {
      if (id === 'sentence' && k === '1993') continue; await p.evaluate((id) => Argument.open(id), id); await p.waitForTimeout(60);
      if (id === 'sentence' && await p.$('#snIn')) { await type('#snIn', 'a short one about owls'); await p.keyboard.press('Enter'); }
      const o = await p.evaluate((id) => { const w = document.getElementById('win-' + id), b = w.querySelector('.app-body'), r = w.getBoundingClientRect(); return { page: document.documentElement.scrollWidth, body: b.scrollWidth - b.clientWidth, w: Math.round(r.width) }; }, id);
      if (o.page > 390 || o.body > 1 || o.w > 390) wide.push(k + '/' + id + ' ' + JSON.stringify(o));
      if (k === '2016' && id === 'sayhi') await shot('mobile-sayhi-2016'); if (k === '2030' && id === 'sentence') await shot('mobile-sentence-2030');
      await p.evaluate((id) => TSKit.hide('win-' + id), id);
    }
    await p.evaluate(() => Argument.metric(true)); if (await p.evaluate(() => document.documentElement.scrollWidth) > 390) wide.push(k + '/metric'); await p.evaluate(() => Argument.metric(false));
  }
  ok(!wide.length, 'no sideways scrolling at 390px' + (wide.length ? ' — ' + wide.join(' | ') : ''));
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
})();
