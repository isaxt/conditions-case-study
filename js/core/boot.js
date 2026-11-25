/* =====================================================================
   boot.js: turning the computer on (0.11)
   The first time the page opens, the family computer powers up the way a
   1991 laptop did: a blue LCD warms up, the BIOS counts the memory, it
   complains about a CMOS checksum, DOS starts, someone types `www`, and the
   1991 page appears. Click or press any key to skip.
   Keeps nothing. Skipped under #quick (tests) and window.TS_QUICK.
   ===================================================================== */
(function () {
  'use strict';
  if (/quick/.test(location.hash) || window.TS_QUICK === true) return;
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = RM ? 0.35 : 1;

  const el = document.createElement('div');
  el.id = 'boot';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'the computer is starting up');
  el.innerHTML =
    '<div class="bt-bezel">' +
      '<div class="bt-screen off">' +
        '<pre class="bt-out" aria-live="polite"></pre>' +
        '<div class="bt-glare" aria-hidden="true"></div>' +
      '</div>' +
      '<div class="bt-chin"><span class="bt-brand">HEARTH 386SX</span><span class="bt-led" aria-hidden="true"></span></div>' +
    '</div>' +
    '<button type="button" class="bt-skip">click or press any key to skip</button>';
  document.body.appendChild(el);
  document.documentElement.classList.add('booting');

  const scr = el.querySelector('.bt-screen');
  // 0.11b: the LCD glow is an ordered-dither picture (4x4 bayer, 5 shades of blue), scaled up with hard pixels
  (function lcd() {
    try {
      const W = 200, H = 150, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const g = cv.getContext('2d'), im = g.createImageData(W, H), d = im.data;
      const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const P = [[78, 116, 168], [104, 145, 196], [132, 172, 220], [160, 196, 236], [196, 222, 248]];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const dx = (x - W * 0.42) / W, dy = (y - H * 0.3) / H;
        let v = 1 - Math.sqrt(dx * dx * 1.4 + dy * dy * 2.2) * 1.5;          // a soft hot spot, top left of centre
        v += 0.06 * Math.sin(x / 9);                                          // faint backlight banding
        v = Math.max(0, Math.min(0.999, v)) * (P.length - 1);
        const lo = Math.floor(v), f = v - lo, t = (B[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        const c = P[Math.min(P.length - 1, lo + (f > t ? 1 : 0))], i = (y * W + x) * 4;
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
      g.putImageData(im, 0, 0);
      el.style.setProperty('--lcd', 'url(' + cv.toDataURL() + ')');
    } catch (e) { /* the plain gradient stays */ }
  })();
  const out = el.querySelector('.bt-out');
  let done = false, timers = [];
  const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms * SPEED)));
  const put = (s) => { out.textContent += s; };
  const line = async (s, ms) => { put(s + '\n'); await wait(ms == null ? 110 : ms); };
  const type = async (s, ms) => { for (const ch of s) { if (done) return; put(ch); await wait(ms || 70); } put('\n'); };
  const beep = (f, t) => { try { if (window.Sound && window.Sound.on && window.TSKit) TSKit.tone(f || 880, t || 0.12, 'square', 0.04); } catch (e) { /* quiet */ } };

  async function bios() {
    scr.className = 'bt-screen lcd';
    await wait(500);
    beep(988, 0.1);
    await line('Hearthstone VGA BIOS Version 2.21');
    await line('Copyright (c) Hearth Computing 1989, 1990. All Rights Reserved.', 260);
    await line('');
    await line('HearthBIOS 80386 ROM PLUS Version 1.10 22');
    await line('Copyright (C) 1985-1990 Hearth Computing Ltd.');
    await line('All Rights Reserved', 300);
    await line('');
    await line('Laptop 8100V', 300);
    await line('');
    // the memory count
    put('Memory Test :      ');
    const start = out.textContent.length;
    for (let k = 0; k <= 3712; k += 128) {
      if (done) return;
      out.textContent = out.textContent.slice(0, start) + String(k).padStart(5, ' ') + 'K';
      await wait(28);
    }
    put(' OK\n');
    await wait(240);
    await line('640K Base Memory, 384K Over Base Memory, 03072K Extended', 380);
    await line('');
    await line('Checksum error on extended CMOS', 260);
    await line('Invalid configuration information - please run SETUP program', 200);
    await line('Diskette drive 1 seek failure', 420);
    await line('');
    put('Strike the F1 key to continue, F2 to run the setup utility');
    await wait(900);
    put('   [F1]\n');
    await wait(500);
  }

  async function dos() {
    out.textContent = '';
    await wait(250);
    await line('Starting HearthDOS...', 700);
    await line('');
    await line('HIMEM is testing extended memory...done.', 280);
    await line('');
    put('C:\\>');
    await wait(500);
    await type('dir /w', 85);
    await wait(150);
    await line('');
    await line(' Volume in drive C is FAMILY');
    await line(' Directory of C:\\', 140);
    await line('');
    await line('[WINDOWS]      [GAMES]        [HOMEWORK]     [DAD]');
    await line('PAINT.EXE      REVERSI.EXE    NOTEPAD.EXE    MUM.WRI');
    await line('LETTERS.TXT    README.TXT     DONOTOPEN.TXT  WWW.EXE', 140);
    await line('       12 File(s)    13,549,568 bytes free', 520);
    await line('');
    put('C:\\>');
    await wait(650);
    await type('www', 120);
    await wait(250);
    await line('');
    await line('Line Mode Browser 1.0, starting...', 600);
    await line('Connecting to info.cern.ch ...', 900);
  }

  function finish() {
    if (done) return; done = true;
    timers.forEach(clearTimeout);
    el.classList.add('gone');
    document.documentElement.classList.remove('booting');
    setTimeout(() => el.remove(), RM ? 0 : 700);
    document.removeEventListener('keydown', skip, true);
  }
  function skip(e) {
    if (e && e.type === 'keydown' && (e.metaKey || e.ctrlKey)) return;
    finish();
  }
  el.addEventListener('click', skip);
  document.addEventListener('keydown', skip, true);

  (async () => {
    await wait(350);
    scr.classList.add('warm');        // the backlight flickers on
    await wait(700);
    if (!done) await bios();
    if (!done) await dos();
    if (!done) { scr.classList.add('fade'); await wait(500); }
    finish();
  })();
})();
