// node tests/studio.js [screenshot-dir] — the six visual-technique tools (js/features/studio.js)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../index.html') + '#quick';
const SHOTS = process.argv[2]; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route(/fonts\.g/, (r) => r.abort());
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  const go = async (k) => { await p.evaluate((k) => { setEra(k); document.querySelectorAll('[id^=era].show').forEach((x) => x.classList.remove('show')); }, k); };
  const icon = (id) => p.evaluate((id) => { const e = document.querySelector('.app-icon[data-app="' + id + '"]'); return !!e && e.style.display !== 'none'; }, id);
  const open = async (id) => { await p.evaluate((id) => { Studio.open(id); document.getElementById('win-' + id).style.zIndex = 99999; }, id); await p.waitForTimeout(150); };
  const shot = async (id, n) => { if (SHOTS) await p.screenshot({ path: path.join(SHOTS, id + (n || '') + '.png') }); };
  const isOpen = (id) => p.evaluate((id) => document.getElementById('win-' + id).classList.contains('open'), id);
  const range = async (id, inside, outside) => { await go(inside); const a = await icon(id); await go(outside); const z = await icon(id); await go(inside); ok(a && !z, id + ': icon shows in ' + inside + ', not in ' + outside); };
  const setRange = (sel, v) => p.evaluate(([sel, v]) => { const e = document.querySelector(sel); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [sel, v]);

  // a kept drawing first, so the pickers have something of the visitor's own
  await go('1999'); await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 176; c.height = 116; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 176, 116); x.fillStyle = '#e02020'; x.beginPath(); x.arc(70, 58, 40, 0, 7); x.fill(); x.fillStyle = '#2040e0'; x.fillRect(100, 20, 60, 70); Journey.keepMine({ id: 'Y-draw-test-1', title: 'a drawing you made (paint)', line: 'test', ctx: 'you drew this.', img: c.toDataURL('image/jpeg', 0.6) }); });

  // 1. ASCII
  await range('ascii', '1993', '1996'); await open('ascii');
  const a1 = await p.textContent('#win-ascii pre'); await setRange('#win-ascii input[type=range]', 32); const a2 = await p.textContent('#win-ascii pre');
  ok(a1.trim().length > 200 && a2 !== a1 && a2.split('\n')[0].length === 32, 'ascii: a picture becomes text, and the width changes it');
  await p.check('#win-ascii [data-k=inv]'); ok(await p.textContent('#win-ascii pre') !== a2, 'ascii: invert changes it');
  ok(await p.$$eval('#win-ascii .st-pick button', (x) => x.length) === 2, 'ascii: the picker offers the sample and the kept drawing');
  await p.click('#win-ascii .st-pick button:nth-of-type(2)'); await p.waitForTimeout(200); ok(await p.textContent('#win-ascii pre') !== a2, 'ascii: works on the visitor\'s own drawing');
  await p.click('#win-ascii [data-mode=words]'); await p.fill('#win-ascii .st-words input', 'HI'); const ban = await p.textContent('#win-ascii pre');
  ok(ban.split('\n').length === 9 && /@/.test(ban), 'ascii: typed words become a banner');
  await p.click('#win-ascii [data-mode=pic]'); await p.click('#win-ascii .st-pick button:nth-of-type(1)'); await p.uncheck('#win-ascii [data-k=inv]'); await setRange('#win-ascii input[type=range]', 72); await shot('ascii');
  await go('1996'); ok(!(await isOpen('ascii')), 'ascii: closes when its era ends');

  // 2. dither
  await range('dither', '1996', '2004'); await open('dither');
  const colours = () => p.evaluate(() => { const c = document.querySelector('#win-dither .dith'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, s = new Set(); for (let i = 0; i < d.length; i += 4) s.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); return s.size; });
  const sig = () => p.evaluate(() => document.querySelector('#win-dither .dith').toDataURL().length + ':' + document.querySelector('#win-dither .dith').toDataURL().slice(-60));
  const n16 = await colours(), s1 = await sig(); ok(n16 > 2 && n16 <= 16, 'dither: 16 colours at most (' + n16 + ')');
  await p.click('#win-dither [data-pattern=bayer]'); const s2 = await sig(); ok(s2 !== s1, 'dither: the pattern changes the picture');
  await p.click('#win-dither [data-colours="2"]'); ok(await colours() === 2, 'dither: 2 colours');
  const x0 = await p.evaluate(() => getComputedStyle(document.querySelector('#win-dither .st-stage')).getPropertyValue('--x'));
  await p.focus('#win-dither .st-stage'); await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowLeft');
  const x1 = await p.evaluate(() => getComputedStyle(document.querySelector('#win-dither .st-stage')).getPropertyValue('--x')); ok(parseFloat(x1) < parseFloat(x0), 'dither: arrow keys move the lens');
  const sb = await (await p.$('#win-dither .st-stage')).boundingBox(); await p.mouse.move(sb.x + 60, sb.y + 60);
  ok(Math.abs(parseFloat(await p.evaluate(() => getComputedStyle(document.querySelector('#win-dither .st-stage')).getPropertyValue('--x'))) - 60) < 3, 'dither: the pointer moves the lens');
  await p.click('#win-dither [data-colours="16"]'); await p.click('#win-dither [data-pattern=fs]'); await p.mouse.move(sb.x + sb.width * 0.62, sb.y + sb.height * 0.5); await shot('dither');
  await p.click('#win-dither [data-do=keep]'); ok(await p.evaluate(() => Journey.mine().some((m) => /^Y-dither/.test(m.id) && /^data:image/.test(m.img))), 'dither: keep it adds one of your things');

  // 3. pixel font
  await range('pixfont', '2004', '2010'); await open('pixfont'); await p.fill('#win-pixfont .st-word', 'AB');
  const g1 = await p.evaluate(() => Studio.sign('AB')); await p.click('#win-pixfont .st-grid [data-r="7"][data-c="7"]');
  const g2 = await p.evaluate(() => Studio.sign('AB')); ok(g1 !== g2 && /<svg/.test(g2), 'pixfont: a drawn pixel changes Studio.sign');
  await p.focus('#win-pixfont .st-grid [data-r="7"][data-c="7"]'); await p.keyboard.press('ArrowLeft'); await p.keyboard.press('Space');
  ok(await p.evaluate((g) => Studio.sign('AB') !== g, g2), 'pixfont: the grid works from the keyboard');
  ok(await p.evaluate(() => /glyphs/.test(localStorage.getItem('thirdspace.kit.pixfont') || '')), 'pixfont: the letters are saved locally');
  ok(await p.evaluate(() => { const d = (t) => /d="([^"]*)"/.exec(Studio.sign(t))[1]; return d('B') === d('b') && d('B').length > 20 && d('C') !== d('B'); }), 'pixfont: sign uses the built-in letters too');
  await p.click('#win-pixfont [data-do=keep]'); ok(await p.evaluate(() => Journey.mine().some((m) => /^Y-pixfont/.test(m.id) && /^data:image/.test(m.img))), 'pixfont: keep it adds one of your things');
  await p.fill('#win-pixfont .st-word', 'ISABELLA'); const gb = await (await p.$('#win-pixfont .st-grid')).boundingBox();
  for (const [r, c] of [[0, 0], [1, 1], [2, 2]]) await p.mouse.click(gb.x + (c + 0.5) * gb.width / 8, gb.y + (r + 0.5) * gb.height / 8);
  await shot('pixfont');

  // 4. glitch
  await range('glitch', '2006', '2014'); await open('glitch'); await p.waitForFunction(() => document.querySelector('#win-glitch .st-out').naturalWidth > 0);
  const src0 = await p.getAttribute('#win-glitch .st-out', 'src'), hex0 = await p.inputValue('#win-glitch textarea');
  ok(/^data:image\/jpeg/.test(src0) && /^([0-9A-F]{2}\s?){64}$/.test(hex0.trim()), 'glitch: the picture and 64 of its bytes as text');
  await p.click('#win-glitch [data-do=corrupt]'); await p.waitForFunction((s) => document.querySelector('#win-glitch .st-out').src !== s || /put back/.test(document.querySelector('#win-glitch .st-status').textContent), src0);
  const src1 = await p.getAttribute('#win-glitch .st-out', 'src');
  ok(src1 !== src0 && await p.evaluate(() => { const i = document.querySelector('#win-glitch .st-out'); return i.complete && i.naturalWidth > 0; }), 'glitch: corrupting bytes changes the file, and it still decodes');
  ok(await p.inputValue('#win-glitch textarea') !== hex0, 'glitch: the changed bytes show in the text');
  const hex1 = await p.inputValue('#win-glitch textarea'); await p.fill('#win-glitch textarea', (hex1.slice(0, 2) === '11' ? '22' : '11') + hex1.slice(2)); await p.waitForTimeout(300);
  ok(await p.getAttribute('#win-glitch .st-out', 'src') !== src1, 'glitch: typing over a byte re-decodes the picture');
  for (let i = 0; i < 3; i++) { await p.click('#win-glitch [data-do=corrupt]'); await p.waitForTimeout(250); }
  ok(await p.evaluate(() => document.querySelector('#win-glitch .st-out').naturalWidth > 0), 'glitch: survives repeated corruption'); await shot('glitch');
  await p.click('#win-glitch [data-do=restore]'); await p.waitForTimeout(250); ok(await p.getAttribute('#win-glitch .st-out', 'src') === src0, 'glitch: restore puts the file back');

  // 5. compression
  await range('compress', '2014', '2024'); await open('compress'); await p.waitForTimeout(250);
  ok(await p.getAttribute('#win-compress .st-pick button:nth-of-type(2)', 'aria-pressed') === 'true', 'compress: starts on the visitor\'s own drawing');
  const now = () => p.evaluate(() => document.querySelector('#win-compress .st-now').toDataURL()); const c0 = await now();
  await p.click('#win-compress [data-do=share]'); await p.waitForFunction(() => /shared 1 time/.test(document.querySelector('#win-compress .st-count').textContent)); const c1 = await now();
  ok(c1 !== c0, 'compress: one share re-saves the picture');
  await p.click('#win-compress [data-do=share10]'); await p.waitForFunction(() => /shared 11 times/.test(document.querySelector('#win-compress .st-count').textContent));
  ok(await now() !== c1, 'compress: the counter rises to 11 and the picture keeps changing');
  ok(await p.evaluate(() => document.querySelector('#win-compress .st-first').toDataURL()) === c0, 'compress: the original stays beside it');
  ok(await p.evaluate(() => Trace.entries.filter((e) => e.label === 'shared a picture').length) === 1, 'compress: written to the receipt once');
  await p.click('#win-compress .st-pick button:nth-of-type(1)'); for (let i = 0; i < 3; i++) { await p.click('#win-compress [data-do=share10]'); await p.waitForTimeout(500); } await shot('compress');

  // 6. style prompt
  await range('styleprompt', '2024', '2016'); await open('styleprompt');
  await p.fill('#win-styleprompt .st-ask input', 'a dithered poster'); await p.click('#win-styleprompt .st-ask button');
  await p.waitForFunction(() => /Done/.test(document.querySelector('#win-styleprompt .st-status').textContent));
  ok(await p.evaluate(() => !!document.querySelector('#win-styleprompt .st-gen canvas') && !!document.querySelector('#win-styleprompt .st-real canvas')) && /Generated/.test(await p.textContent('#win-styleprompt .st-gen figcaption')), 'style prompt: returns a result labelled as generated, beside what the limit made');
  await shot('styleprompt');
  for (const k of ['ascii', 'glitch', 'y1996']) { await p.click('#win-styleprompt [data-p=' + k + ']'); await p.waitForTimeout(900); await p.waitForFunction(() => /Done/.test(document.querySelector('#win-styleprompt .st-status').textContent)); await shot('styleprompt', '-' + k); }
  ok(await p.evaluate(() => document.querySelectorAll('#win-styleprompt .st-art > *').length === 2), 'style prompt: every suggestion returns a pair');
  await go('2030'); ok(!(await isOpen('styleprompt')), 'style prompt: closes when 2024 ends');

  // a phone: every tool fits, nothing scrolls sideways
  await p.setViewportSize({ width: 390, height: 844 });
  for (const [id, k] of [['ascii', '1993'], ['dither', '1996'], ['pixfont', '2004'], ['glitch', '2006'], ['compress', '2014'], ['styleprompt', '2024']]) {
    await go(k); await open(id); if (id === 'styleprompt') { await p.click('#win-styleprompt [data-p=ascii]'); await p.waitForTimeout(900); }
    const r = await p.evaluate((id) => { const w = document.getElementById('win-' + id), r = w.getBoundingClientRect(), b = w.querySelector('.app-body'); return { fits: r.left >= -1 && r.right <= innerWidth + 1, page: document.documentElement.scrollWidth <= innerWidth + 1, body: b.scrollWidth <= b.clientWidth + 1 }; }, id);
    ok(r.fits && r.page && r.body, id + ': fits a 390px phone with no sideways scrolling ' + JSON.stringify(r)); await shot(id, '-phone');
    await p.evaluate((id) => closeWindow('win-' + id), id);
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})();
