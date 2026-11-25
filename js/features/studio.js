/* =====================================================================
   studio.js — six small visual-technique tools the visitor picks up and uses on their OWN material:
   a drawing they kept (Journey.mine() items with .img), words they type, or a sample picture drawn here on a canvas.
   Each tool carries one line of the argument, shown quietly at the bottom of its window.

   id           years       tool                    the one-line argument
   ascii        1991–1993   ASCII converter         People drew with the only material they had: the letters on the keyboard.
   dither       1993–1999   dither lens             This look was the hardware's limit, and people made the limit beautiful.
   pixfont      1996–2008   pixel-font signature    This is your mark, not a font you chose from a list.
   glitch       2004–2010   glitch a file           Breaking the tool on purpose was a creative act.
   compress     2010–2016   compression slider      Every share takes a little more away.
   styleprompt  2024        style prompt            The style survives as a preset; the limit that made it is gone.

   Everything is real: the dither is computed, the glitch mutates real JPEG bytes and re-decodes them, the rot is
   real JPEG re-encoding. Nothing is sent anywhere.
   Keeps: the letters the visitor draws (TSKit.state 'pixfont', this browser only, erased with the journey), and
   anything they press "keep it" on (Journey.keepMine, a small thumbnail). From 2010 the first share in the
   compression tool is written to the receipt, because by then it would have been.

   window.Studio = { open(id), sign(text, height) -> HTML string (inline SVG in the visitor's own letters),
                     signURL(text, scale) -> PNG data URL, glyph(ch), toAscii, banner, dither, sample, ARG, TOOLS }
   ===================================================================== */
(function () {
  'use strict';
  const K = window.TSKit; if (!K) return;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = K.esc, W = 240, H = 180;
  const ARG = {
    ascii: 'People drew with the only material they had: the letters on the keyboard.',
    dither: 'This look was the hardware’s limit, and people made the limit beautiful.',
    pixfont: 'This is your mark, not a font you chose from a list.',
    glitch: 'Breaking the tool on purpose was a creative act.',
    compress: 'Every share takes a little more away.',
    styleprompt: 'The style survives as a preset; the limit that made it is gone.',
  };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const cx2 = (c) => c.getContext('2d', { willReadFrequently: true });
  const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const lum = (d, i) => (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
  const status = (w, t) => { const s = $('.st-status', w); if (s) s.textContent = t; };
  const mineImgs = () => (window.Journey && Journey.mine ? Journey.mine() : []).filter((m) => m.img);
  const copyCanvas = (c) => { const o = canvas(c.width, c.height); o.getContext('2d').drawImage(c, 0, 0); return o; };

  /* ---- the sample picture: a small evening landscape made of gradients and shapes (no asset) ---- */
  let SAMPLE = null;
  function sample() {
    if (SAMPLE) return copyCanvas(SAMPLE);
    const c = canvas(W, H), x = cx2(c);
    let g = x.createLinearGradient(0, 0, 0, 122); g.addColorStop(0, '#1f2f7a'); g.addColorStop(0.55, '#d9717a'); g.addColorStop(1, '#ffd98a'); x.fillStyle = g; x.fillRect(0, 0, W, 122);
    g = x.createRadialGradient(170, 84, 3, 170, 84, 52); g.addColorStop(0, '#fffbe0'); g.addColorStop(0.3, '#ffd257'); g.addColorStop(1, 'rgba(255,170,90,0)'); x.fillStyle = g; x.fillRect(100, 20, 140, 110);
    const hills = (col, base, a, f, p) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= W; i += 2) x.lineTo(i, base - a * Math.sin(i / f + p) - a * 0.4 * Math.sin(i / (f * 0.37) + p * 2)); x.lineTo(W, H); x.fill(); };
    hills('#7a5c9c', 104, 16, 40, 1); hills('#4a3f78', 114, 10, 27, 3.4);
    g = x.createLinearGradient(0, 120, 0, H); g.addColorStop(0, '#f2a66f'); g.addColorStop(0.35, '#5a5fa8'); g.addColorStop(1, '#141a48'); x.fillStyle = g; x.fillRect(0, 120, W, 60);
    x.fillStyle = 'rgba(255,236,170,.75)'; for (let i = 0; i < 9; i++) x.fillRect(170 - 26 + i * 2.6, 124 + i * 5, 52 - i * 5.2, 2);   // the sun on the water
    x.fillStyle = '#1b1838'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 138); x.quadraticCurveTo(50, 122, 112, 150); x.quadraticCurveTo(128, 162, 150, H); x.fill();   // near shore
    x.fillStyle = '#2a1f3d'; x.fillRect(38, 112, 34, 24); x.beginPath(); x.moveTo(33, 113); x.lineTo(55, 96); x.lineTo(77, 113); x.fill();   // a small house
    x.fillStyle = '#ffe27a'; x.fillRect(46, 119, 7, 8); x.fillRect(58, 119, 7, 8);
    x.fillStyle = '#17132b'; x.fillRect(96, 104, 4, 40); [[98, 98, 15], [88, 108, 11], [108, 108, 11]].forEach((t) => { x.beginPath(); x.arc(t[0], t[1], t[2], 0, 7); x.fill(); });   // a tree
    x.fillStyle = '#fff'; [[22, 18], [64, 30], [120, 12], [206, 22], [92, 44], [226, 52]].forEach((s) => x.fillRect(s[0], s[1], 1.5, 1.5));
    SAMPLE = c; return copyCanvas(c);
  }
  /* any image -> a W×H canvas, letterboxed on white */
  async function pictureOf(src) {
    if (!src) return sample();
    const i = await load(src), c = canvas(W, H), x = cx2(c), s = Math.min(W / i.width, H / i.height);
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(i, (W - i.width * s) / 2, (H - i.height * s) / 2, i.width * s, i.height * s); return c;
  }
  /* ---- shared "pick a picture": the sample plus each kept drawing; rebuilt every time a window opens ---- */
  const PICK = '<div class="st-pick" role="group" aria-label="pick a picture"></div>';
  function picker(w, onPick, preferMine) {
    const box = $('.st-pick', w), mine = mineImgs();
    const opts = [{ title: 'the sample picture', img: sample().toDataURL('image/png'), src: '' }].concat(mine.map((m) => ({ title: m.title || 'your drawing', img: m.img, src: m.img })));
    box.innerHTML = '<span class="st-lab">picture</span>' + opts.map((o, i) => '<button type="button" data-i="' + i + '" aria-pressed="false" title="' + esc(o.title) + '"><img src="' + o.img + '" alt="' + esc(o.title) + '"></button>').join('') +
      (mine.length ? '' : '<span class="st-hint">drawings you keep will appear here</span>');
    const choose = (i) => {
      $$('button', box).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      if (!opts[i].src) return onPick(sample(), false);
      pictureOf(opts[i].src).then((c) => onPick(c, true), () => onPick(sample(), false));
    };
    box.onclick = (e) => { const b = e.target.closest('button'); if (b) choose(+b.dataset.i); };
    choose(preferMine && mine.length ? 1 : 0);
  }
  let KEPT = 0;
  function keep(w, kind, drawable, title, line) {
    const th = canvas(176, 116), x = th.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 176, 116); x.imageSmoothingEnabled = false; x.drawImage(drawable, 0, 0, 176, 116);
    if (window.Journey && Journey.keepMine) Journey.keepMine({ id: 'Y-' + kind + '-' + K.era() + '-' + Date.now().toString(36) + (++KEPT), title, line, ctx: 'you made this.', img: th.toDataURL('image/jpeg', 0.6) });
    status(w, 'kept, as a small picture in this browser only. it is one of your things now.');
  }

  /* =============== the pixel font (shared by the signature tool and the ASCII banner) =============== */
  /* built-in 5×7 letters, 7 base-32 rows per glyph; the visitor's own 8×8 letters override them */
  const ORDER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.-';
  const PACK = 'ehhvhhhuhhuhhuehgggheuhhhhhuvgguggvvggugggehgnhhfhhhvhhhe44444e72222ichikokihggggggvhrllhhhhpljhhhehhhhheuhhugggehhhliduhhukihfgge11uv444444hhhhhhehhhhha4hhhllrhhha4ahhhha4444v1248gvehjlphe4c4444eeh168gvu11e11u26aiv22vgu11he68guhhev124888ehhehheehhf12c4444404eh164040000066000v000';
  const BASE = {}; [...ORDER].forEach((ch, n) => { BASE[ch] = [...PACK.slice(n * 7, n * 7 + 7)].map((c) => parseInt(c, 32) << 1).concat(0); });
  const FONT = K.state('pixfont', { glyphs: {}, word: '', n: 0 });
  const up = (ch) => String(ch).toUpperCase();
  const glyph = (ch) => FONT.data.glyphs[up(ch)] || BASE[up(ch)] || [0, 0, 0, 0, 0, 0, 0, 0];
  const bit = (g, r, c) => (g[r] >> (7 - c)) & 1;
  /* the visitor's text in their own letters, as inline SVG (uses currentColor, so it takes the colour of where it is put) */
  function sign(text, height) {
    const t = String(text == null ? '' : text).slice(0, 24); let d = '';
    [...t].forEach((ch, n) => { const g = glyph(ch); for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (bit(g, r, c)) d += 'M' + (n * 8 + c) + ' ' + r + 'h1v1h-1z'; });
    return '<svg class="st-sign" role="img" aria-label="' + esc(t) + '" viewBox="0 0 ' + Math.max(8, [...t].length * 8) + ' 8" shape-rendering="crispEdges" style="height:' + (height || '1em') + ';width:auto;max-width:100%;vertical-align:-0.1em"><path fill="currentColor" d="' + d + '"/></svg>';
  }
  function signCanvas(text, scale, fg, bg) {
    const t = [...String(text || '').slice(0, 24)], s = scale || 4, c = canvas(Math.max(1, t.length) * 8 * s, 8 * s), x = c.getContext('2d');
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); } x.fillStyle = fg || '#000';
    t.forEach((ch, n) => { const g = glyph(ch); for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++) if (bit(g, r, k)) x.fillRect((n * 8 + k) * s, r * s, s, s); });
    return c;
  }

  /* =============== 1. ASCII converter (1991–1993) =============== */
  const RAMPS = { classic: ' .:-=+*#%@', blocks: ' ░▒▓█', round: ' .,oO0@', slashes: ' .\'/|\\X#' };
  /* a picture as text: one character per cell, denser characters for brighter cells (it is a dark screen) */
  function toAscii(src, cols, ramp, inv) {
    const rows = Math.max(1, Math.round(cols * src.height / src.width * 0.5)), t = canvas(cols, rows), x = cx2(t);
    x.drawImage(src, 0, 0, cols, rows); const d = x.getImageData(0, 0, cols, rows).data; let out = '';
    for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { let l = lum(d, (r * cols + c) * 4); if (inv) l = 1 - l; out += ramp[Math.min(ramp.length - 1, Math.floor(l * ramp.length))]; } out += '\n'; }
    return out;
  }
  /* words as a banner: one character per pixel of the pixel font, wrapped to the width */
  function banner(text, cols, ramp, inv) {
    const per = Math.max(1, Math.floor(cols / 8)), on = ramp[ramp.length - 1], off = ramp[0], t = [...String(text)]; let out = '';
    for (let s = 0; s < t.length; s += per) { const gs = t.slice(s, s + per).map(glyph); for (let r = 0; r < 8; r++) out += gs.map((g) => { let row = ''; for (let c = 0; c < 8; c++) row += (bit(g, r, c) ^ (inv ? 1 : 0)) ? on : off; return row; }).join('') + '\n'; }
    return out;
  }
  const ascii = {
    glyph: '⌨️', label: 'textpic', from: 1991, to: 1993, title: 'TEXTPIC.EXE — pictures out of letters', w: 600,
    html: () => '<div class="st-row"><span class="st-lab">draw from</span><button type="button" data-mode="pic" aria-pressed="true">a picture</button><button type="button" data-mode="words" aria-pressed="false">my words</button>' +
      '<label class="st-words" hidden>words <input type="text" maxlength="24" value="HELLO" aria-label="your words"></label></div>' + PICK +
      '<div class="st-row"><label>characters <select aria-label="character set">' + Object.keys(RAMPS).map((k) => '<option value="' + k + '">' + k + ' ' + esc(RAMPS[k].trim()) + '</option>').join('') + '</select></label>' +
      '<label>width <input type="range" min="24" max="96" step="4" value="64" aria-label="width in characters"> <output>64</output></label>' +
      '<label><input type="checkbox" data-k="inv"> invert</label><button type="button" data-do="tint">amber / green</button><button type="button" data-do="copy">copy</button></div>' +
      '<div class="st-screen"><pre tabindex="0" aria-label="your text picture"></pre></div><p class="st-status" role="status"></p>',
    init(w) {
      const S = ascii.S = { mode: 'pic', pic: sample() }, pre = $('pre', w), range = $('input[type=range]', w);
      S.draw = () => {
        const cols = +range.value, ramp = RAMPS[$('select', w).value], inv = $('[data-k=inv]', w).checked; $('output', w).textContent = cols;
        pre.textContent = S.mode === 'pic' ? toAscii(S.pic, cols, ramp, inv) : banner($('.st-words input', w).value || ' ', cols, ramp, inv);
        pre.style.setProperty('font-size', '10px', 'important'); const box = pre.parentNode, room = box.clientWidth - 20; if (pre.offsetWidth) pre.style.setProperty('font-size', Math.max(3, Math.min(16, 10 * room / pre.offsetWidth, 10 * 290 / pre.offsetHeight)) + 'px', 'important');   // fit the screen, never scroll sideways
      };
      w.addEventListener('input', S.draw);
      w.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.mode) { S.mode = b.dataset.mode; $$('[data-mode]', w).forEach((m) => m.setAttribute('aria-pressed', String(m === b))); $('.st-words', w).hidden = S.mode !== 'words'; $('.st-pick', w).hidden = S.mode === 'words'; S.draw(); }
        if (b.dataset.do === 'tint') { $('.st-screen', w).classList.toggle('amber'); }
        if (b.dataset.do === 'copy') {
          const done = () => status(w, 'copied. paste it anywhere that has letters.');
          const fall = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand('copy'); done(); } catch (x) { status(w, 'selected. press copy on your keyboard.'); } };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pre.textContent).then(done, fall); else fall();
        }
      });
    },
    open(w) { picker(w, (c) => { ascii.S.pic = c; ascii.S.draw(); }); ascii.S.draw(); },
  };

  /* =============== 2. dither lens (1993–1999) =============== */
  const hex = (h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  const PAL16 = '000000 800000 008000 808000 000080 800080 008080 c0c0c0 808080 ff0000 00ff00 ffff00 0000ff ff00ff 00ffff ffffff'.split(' ').map(hex);
  const PAL2 = [[0, 0, 0], [255, 255, 255]];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  /* reduce a canvas to a palette. mode: 'none' (nearest colour), 'bayer' (ordered 4×4), 'fs' (Floyd–Steinberg error diffusion) */
  function dither(src, pal, mode) {
    const w = src.width, h = src.height, out = canvas(w, h), id = cx2(src).getImageData(0, 0, w, h), d = id.data, f = new Float32Array(d), amp = pal.length === 2 ? 200 : 90;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, t = mode === 'bayer' ? (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * amp : 0, r = f[i] + t, g = f[i + 1] + t, b = f[i + 2] + t;
      let best = pal[0], bd = Infinity; for (let k = 0; k < pal.length; k++) { const p = pal[k], dd = (r - p[0]) * (r - p[0]) * 0.3 + (g - p[1]) * (g - p[1]) * 0.59 + (b - p[2]) * (b - p[2]) * 0.11; if (dd < bd) { bd = dd; best = p; } }
      d[i] = best[0]; d[i + 1] = best[1]; d[i + 2] = best[2]; d[i + 3] = 255;
      if (mode === 'fs') {   // push the error onto the neighbours that have not been drawn yet
        const e = [r - best[0], g - best[1], b - best[2]], put = (xx, yy, k) => { if (xx < 0 || xx >= w || yy >= h) return; const j = (yy * w + xx) * 4; f[j] += e[0] * k; f[j + 1] += e[1] * k; f[j + 2] += e[2] * k; };
        put(x + 1, y, 7 / 16); put(x - 1, y + 1, 3 / 16); put(x, y + 1, 5 / 16); put(x + 1, y + 1, 1 / 16);
      }
    }
    out.getContext('2d').putImageData(id, 0, 0); return out;
  }
  const seg = (name, opts, cur) => '<span class="st-seg" role="group" aria-label="' + name + '">' + opts.map((o) => '<button type="button" data-' + name + '="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + o[1] + '</button>').join('') + '</span>';
  const ditherTool = {
    glyph: '🔍', label: 'dither lens', from: 1993, to: 1999, title: 'Dither Lens 1.0', w: 560,
    html: () => PICK + '<div class="st-row">' + seg('colours', [['16', '16 colours'], ['2', '2 colours']], '16') + seg('pattern', [['none', 'none'], ['bayer', 'ordered'], ['fs', 'diffusion']], 'fs') + '<label><input type="checkbox" data-k="all"> whole picture</label></div>' +
      '<div class="st-stage" tabindex="0" role="group" aria-label="the lens. drag it, or move it with the arrow keys. inside the lens is what the screen could show."><canvas class="orig" width="' + W + '" height="' + H + '"></canvas><canvas class="dith" width="' + W + '" height="' + H + '"></canvas><i class="st-ring" aria-hidden="true"></i></div>' +
      '<p class="st-status" role="status"></p><div class="st-row"><button type="button" data-do="keep">keep it</button><span class="st-hint">outside the lens: the picture. inside: what a 1990s screen could show.</span></div>',
    init(w) {
      const S = ditherTool.S = { pic: sample(), colours: '16', pattern: 'fs', x: 0.68, y: 0.45 }, stage = $('.st-stage', w), o = $('.orig', w), dc = $('.dith', w);
      S.place = () => { const r = stage.clientWidth * 0.19; stage.style.setProperty('--x', S.x * stage.clientWidth + 'px'); stage.style.setProperty('--y', S.y * stage.clientHeight + 'px'); stage.style.setProperty('--r', r + 'px'); };
      S.draw = () => {
        o.getContext('2d').drawImage(S.pic, 0, 0); S.out = dither(S.pic, S.colours === '2' ? PAL2 : PAL16, S.pattern); dc.getContext('2d').drawImage(S.out, 0, 0); S.place();
        status(w, S.colours + ' colours, ' + ({ none: 'no dithering: flat bands', bayer: 'ordered dithering: a woven pattern', fs: 'error diffusion: scattered grain' })[S.pattern] + '.');
      };
      const move = (e) => { const r = stage.getBoundingClientRect(); S.x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); S.y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)); S.place(); };
      stage.addEventListener('pointerdown', (e) => { stage.setPointerCapture && stage.setPointerCapture(e.pointerId); move(e); });
      stage.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.buttons) move(e); });
      stage.addEventListener('keydown', (e) => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!m) return; e.preventDefault(); S.x = Math.max(0, Math.min(1, S.x + m[0] * 0.04)); S.y = Math.max(0, Math.min(1, S.y + m[1] * 0.05)); S.place(); });
      w.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        ['colours', 'pattern'].forEach((k) => { if (b.dataset[k]) { S[k] = b.dataset[k]; $$('[data-' + k + ']', w).forEach((m) => m.setAttribute('aria-pressed', String(m === b))); S.draw(); } });
        if (b.dataset.do === 'keep') keep(w, 'dither', S.out, 'a picture in ' + S.colours + ' colours', 'dithered by you in ' + K.era());
      });
      $('[data-k=all]', w).addEventListener('change', (e) => stage.classList.toggle('all', e.target.checked));
      window.addEventListener('resize', S.place);
    },
    open(w) { picker(w, (c) => { ditherTool.S.pic = c; ditherTool.S.draw(); }); },
  };

  /* =============== 3. pixel-font signature (1996–2008) =============== */
  const pixfont = {
    glyph: '✍️', label: 'my letters', from: 1996, to: 2008, title: 'Letter Workshop — your own 8×8 letters', w: 520,
    html: () => '<div class="st-row"><label>your name or a word <input type="text" class="st-word" maxlength="12" aria-label="your name or a word"></label></div>' +
      '<div class="st-letters" role="group" aria-label="choose a letter to draw"></div>' +
      '<div class="st-edit"><div class="st-grid" role="group" aria-label="letter grid, 8 by 8. arrow keys move, space fills or clears a square."></div>' +
      '<div class="st-side"><div class="st-prev" aria-live="polite"></div><div class="st-row"><button type="button" data-do="clear">clear letter</button><button type="button" data-do="reset">put the plain one back</button><button type="button" data-do="keep">keep it</button></div>' +
      '<p class="st-hint">your letters are saved in this browser only, and erased with your journey.</p></div></div><p class="st-status" role="status"></p>',
    init(w) {
      const S = pixfont.S = { cur: 'A', paint: null }, grid = $('.st-grid', w), word = $('.st-word', w);
      let cells = ''; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) cells += '<button type="button" data-r="' + r + '" data-c="' + c + '" aria-pressed="false" aria-label="row ' + (r + 1) + ', column ' + (c + 1) + '"></button>'; grid.innerHTML = cells;
      S.text = () => (word.value.trim() || 'YOU');
      S.render = () => {
        const letters = [...new Set([...up(S.text())].filter((c) => c !== ' '))]; if (letters.indexOf(S.cur) < 0) S.cur = letters[0];
        $('.st-letters', w).innerHTML = letters.map((l) => '<button type="button" data-l="' + esc(l) + '" aria-pressed="' + (l === S.cur) + '" aria-label="letter ' + esc(l) + '">' + sign(l, '24px') + '</button>').join('');
        const g = glyph(S.cur); $$('button', grid).forEach((b) => b.setAttribute('aria-pressed', String(!!bit(g, +b.dataset.r, +b.dataset.c))));
        $('.st-prev', w).innerHTML = sign(S.text(), '56px') + '<small>' + esc(S.text()) + ', in your letters</small>';
      };
      const set = (b, on) => {   // change one square of the current letter and save the font
        const g = glyph(S.cur).slice(), m = 1 << (7 - +b.dataset.c), r = +b.dataset.r; g[r] = on ? (g[r] | m) : (g[r] & ~m);
        FONT.data.glyphs[S.cur] = g; FONT.save(); S.render();
      };
      grid.addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (!b) return; e.preventDefault(); b.focus(); S.paint = b.getAttribute('aria-pressed') !== 'true'; set(b, S.paint); });
      grid.addEventListener('pointermove', (e) => { if (S.paint === null || !e.buttons) return; const b = document.elementFromPoint(e.clientX, e.clientY); if (b && b.parentNode === grid && (b.getAttribute('aria-pressed') === 'true') !== S.paint) set(b, S.paint); });
      window.addEventListener('pointerup', () => { S.paint = null; });
      grid.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && e.detail === 0) set(b, b.getAttribute('aria-pressed') !== 'true'); });   // keyboard
      grid.addEventListener('keydown', (e) => { const m = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key], b = e.target.closest('button'); if (!m || !b) return; e.preventDefault(); const n = $('[data-r="' + (+b.dataset.r + m[0]) + '"][data-c="' + (+b.dataset.c + m[1]) + '"]', grid); if (n) n.focus(); });
      word.addEventListener('input', () => { FONT.data.word = word.value; FONT.save(); S.render(); });
      w.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.l) { S.cur = b.dataset.l; S.render(); }
        if (b.dataset.do === 'clear') { FONT.data.glyphs[S.cur] = [0, 0, 0, 0, 0, 0, 0, 0]; FONT.save(); S.render(); }
        if (b.dataset.do === 'reset') { delete FONT.data.glyphs[S.cur]; FONT.save(); S.render(); }
        if (b.dataset.do === 'keep') {
          const t = S.text(), th = canvas(176, 116), x = th.getContext('2d'), sc = Math.max(1, Math.min(6, Math.floor(160 / ([...t].length * 8)))), s = signCanvas(t, sc, '#111');
          x.fillStyle = '#fff'; x.fillRect(0, 0, 176, 116); x.drawImage(s, Math.round((176 - s.width) / 2), Math.round((116 - s.height) / 2));
          keep(w, 'pixfont', th, 'your name in your own letters', '“' + t + '”, set in letters you drew in ' + K.era());
        }
      });
    },
    open(w) { const S = pixfont.S, n = window.Journey && Journey.state && Journey.state().name; $('.st-word', w).value = FONT.data.word || (typeof n === 'string' ? n.slice(0, 12) : '') || ''; S.render(); },
  };

  /* =============== 4. glitch a file (2004–2010) =============== */
  const NB = 64;   // how many bytes of the file are shown as text
  function jpegBytes(c, q) { const s = atob(c.toDataURL('image/jpeg', q || 0.72).split(',')[1]), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
  function bytesURL(b) { let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return 'data:image/jpeg;base64,' + btoa(s); }
  /* where the picture data starts: just after the "start of scan" header. Bytes before it describe the file; break those and nothing opens. */
  function scanStart(b) { for (let i = 2; i < b.length - 4; i++) if (b[i] === 0xFF && b[i + 1] === 0xDA) return i + 2 + ((b[i + 2] << 8) | b[i + 3]); return Math.min(b.length - 2, 620); }
  function mutate(b, lo, hi, n) { const c = b.slice(); for (let k = 0; k < n; k++) c[lo + Math.floor(Math.random() * Math.max(1, hi - lo))] = Math.floor(Math.random() * 255); return c; }   // never 0xFF: that would start a new marker
  /* corrupt n bytes between lo and hi; if the result will not decode, try another mutation. -> the new bytes, or null */
  async function glitchBytes(b, lo, hi, n) { for (let t = 0; t < 6; t++) { const c = mutate(b, lo, hi, n); try { await load(bytesURL(c)); return c; } catch (e) { /* try again */ } } return null; }
  const glitch = {
    glyph: '🧨', label: 'glitch a file', from: 2004, to: 2010, title: 'open picture as text', w: 640,
    html: () => PICK + '<div class="st-two"><figure><img class="st-out" alt="the picture, decoded from the bytes on the right"><figcaption>the picture</figcaption></figure>' +
      '<figure class="st-file"><figcaption>the same file, as text <span class="st-where"></span></figcaption><textarea rows="8" spellcheck="false" aria-label="64 bytes of the file, as hexadecimal. change any of them."></textarea><pre aria-hidden="true"></pre>' +
      '<label>where in the file <input type="range" min="0" max="1000" value="150" aria-label="where in the file"></label></figure></div>' +
      '<div class="st-row"><button type="button" data-do="corrupt">corrupt a few bytes</button><button type="button" data-do="restore">restore the file</button><button type="button" data-do="keep">keep it</button></div><p class="st-status" role="status"></p>',
    init(w) {
      const S = glitch.S = { tries: 0 }, ta = $('textarea', w), img = $('.st-out', w), range = $('input[type=range]', w);
      S.off = () => S.lo + Math.floor((+range.value / 1000) * Math.max(0, S.bytes.length - 2 - S.lo - NB));
      S.text = () => {   // the excerpt as hex (editable) and as characters
        const o = S.off(), part = [...S.bytes.subarray(o, o + NB)]; let hx = '', ch = '';
        part.forEach((v, i) => { hx += (v < 16 ? '0' : '') + v.toString(16).toUpperCase() + ((i + 1) % 8 ? ' ' : '\n'); ch += (v > 32 && v < 127 ? String.fromCharCode(v) : '·') + ((i + 1) % 8 ? '' : '\n'); });
        ta.value = hx.trim(); $('pre', w).textContent = ch; $('.st-where', w).textContent = '(bytes ' + o + ' to ' + (o + NB - 1) + ' of ' + S.bytes.length + ')';
      };
      S.show = async (b, note) => {   // decode the bytes; if they will not open, the last picture that did stays
        const url = bytesURL(b); try { await load(url); } catch (e) { status(w, 'this version will not open at all. the last one that opened is still showing.'); return false; }
        S.bytes = b; img.src = url; let n = 0; for (let i = 0; i < b.length; i++) if (b[i] !== S.orig[i]) n++;
        status(w, note || (n ? n + ' byte' + (n === 1 ? '' : 's') + ' changed. the picture is still a picture, just not the one that was saved.' : 'the file as it was saved.')); return true;
      };
      S.use = (c) => { S.orig = jpegBytes(c); S.lo = scanStart(S.orig); S.bytes = S.orig.slice(); S.text(); return S.show(S.bytes); };
      S.corrupt = async () => {
        const o = S.off(), c = await glitchBytes(S.bytes, o, o + NB, 3); S.tries++;
        if (!c) { status(w, 'every try broke the file completely, so it was put back. try another place in the file.'); return; }
        await S.show(c); S.text(); K.tone(90 + Math.random() * 200, 0.08, 'square', 0.03);
      };
      range.addEventListener('input', S.text);
      ta.addEventListener('input', () => { const o = S.off(), b = S.bytes.slice(); (ta.value.match(/[0-9a-f]{2}/gi) || []).slice(0, NB).forEach((h, i) => { b[o + i] = parseInt(h, 16); }); S.show(b).then((ok) => { if (ok) $('pre', w).textContent = [...b.subarray(o, o + NB)].map((v, i) => (v > 32 && v < 127 ? String.fromCharCode(v) : '·') + ((i + 1) % 8 ? '' : '\n')).join(''); }); });
      w.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.do === 'corrupt') S.corrupt();
        if (b.dataset.do === 'restore') { S.bytes = S.orig.slice(); S.text(); S.show(S.bytes); }
        if (b.dataset.do === 'keep' && img.complete && img.naturalWidth) keep(w, 'glitch', img, 'a picture you broke on purpose', 'glitched by hand in ' + K.era());
      });
    },
    open(w) { picker(w, (c) => glitch.S.use(c)); },
  };

  /* =============== 5. compression slider (2010–2016) =============== */
  const compress = {
    glyph: '🔁', label: 'share again', from: 2010, to: 2016, title: 'Reshare', w: 600,
    html: () => PICK + '<div class="st-two"><figure><canvas class="st-first" width="' + W + '" height="' + H + '" role="img" aria-label="the picture as it was made"></canvas><figcaption>as it was made</figcaption></figure>' +
      '<figure><canvas class="st-now" width="' + W + '" height="' + H + '" role="img" aria-label="the picture after being shared"></canvas><figcaption class="st-count" role="status">shared 0 times</figcaption></figure></div>' +
      '<div class="st-meter" aria-hidden="true"><i></i></div><p class="st-size"></p>' +
      '<div class="st-row"><button type="button" data-do="share" class="primary">share again</button><button type="button" data-do="share10">share ×10</button><button type="button" data-do="start">start over</button><button type="button" data-do="keep">keep it</button></div><p class="st-status" role="status"></p>',
    init(w) {
      const S = compress.S = { n: 0, busy: false, logged: false }, first = $('.st-first', w), now = $('.st-now', w);
      S.paint = () => {
        const kb = (b) => (b / 1024).toFixed(1) + ' KB'; $('.st-count', w).textContent = 'shared ' + S.n + ' time' + (S.n === 1 ? '' : 's');
        $('.st-size', w).textContent = 'file: ' + kb(S.size0) + (S.n ? ' when you made it, ' + kb(S.size) + ' now' : ''); $('.st-meter i', w).style.width = Math.min(100, S.n * 2.5) + '%';
      };
      S.use = (c) => { S.n = 0; first.getContext('2d').drawImage(c, 0, 0); now.getContext('2d').drawImage(c, 0, 0); S.size0 = S.size = jpegBytes(c, 0.9).length; S.paint(); status(w, ''); };
      /* one share: the service shrinks the picture a little and saves it again as a low-quality JPEG. Really. */
      S.once = async () => {
        const k = S.n % 2 ? 0.9 : 0.94, t = canvas(Math.round(W * k), Math.round(H * k)); t.getContext('2d').drawImage(now, 0, 0, t.width, t.height);
        const url = t.toDataURL('image/jpeg', 0.3), im = await load(url); now.getContext('2d').drawImage(im, 0, 0, W, H); S.size = Math.round((url.length - 23) * 0.75); S.n++;
      };
      S.share = async (times) => {
        if (S.busy) return; S.busy = true;
        if (!S.logged && typeof logReceipt === 'function') { S.logged = true; logReceipt('shared a picture', 're-saved smaller by the service each time'); }
        try { for (let i = 0; i < times; i++) await S.once(); } catch (e) { /* the picture stays as it is */ }
        S.busy = false; S.paint(); status(w, S.n >= 30 ? 'nobody did this to it. everybody passed it on.' : 'each copy is saved from the copy before it.');
      };
      w.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.do === 'share') S.share(1); if (b.dataset.do === 'share10') S.share(10);
        if (b.dataset.do === 'start') S.use(copyCanvas(first));
        if (b.dataset.do === 'keep') keep(w, 'rot', now, 'a picture after ' + S.n + ' shares', 'shared ' + S.n + ' times in ' + K.era());
      });
    },
    open(w) { compress.S.logged = false; picker(w, (c) => compress.S.use(c), true); },
  };

  /* =============== 6. style prompt (2024) =============== */
  /* Four presets. Whatever is typed is matched to the closest one. Left: what the limit really made (computed above).
     Right: the preset, a smooth and perfectly even imitation, labelled as generated. */
  const PRESETS = {
    y1996: { name: '1996', re: /96|199|retro|pixel|old|web/i, real: '16 colours, no dithering, 240 pixels wide' },
    dither: { name: 'Dithered', re: /dither|dot|halftone|grain|16/i, real: '16 colours, error diffusion' },
    ascii: { name: 'ASCII', re: /ascii|text|letter|type|terminal/i, real: 'ten characters, 64 columns' },
    glitch: { name: 'Glitch', re: /glitch|broke|corrupt|error|vhs/i, real: 'nine bytes changed in the file' },
  };
  function presetArt(kind, src) {
    const B = 480, Bh = 360, c = canvas(B, Bh), x = c.getContext('2d'), big = canvas(B, Bh), bx = big.getContext('2d'); bx.filter = 'blur(2px) saturate(1.15)'; bx.drawImage(src, 0, 0, B, Bh);
    const d = cx2(src).getImageData(0, 0, W, H).data, at = (px, py) => (Math.min(H - 1, py >> 1) * W + Math.min(W - 1, px >> 1)) * 4;
    if (kind === 'dither') { x.fillStyle = '#f7f5f0'; x.fillRect(0, 0, B, Bh); x.fillStyle = '#1d1d1f'; for (let y = 4; y < Bh; y += 8) for (let px = 4; px < B; px += 8) { x.beginPath(); x.arc(px, y, (1 - lum(d, at(px, y))) * 4.4, 0, 7); x.fill(); } }
    if (kind === 'ascii') { x.fillStyle = '#101216'; x.fillRect(0, 0, B, Bh); x.font = '600 11px ui-monospace, Menlo, Consolas, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; const r = ' ·:+*#'; for (let y = 6; y < Bh; y += 12) for (let px = 5; px < B; px += 10) { const i = at(px, y); x.fillStyle = 'rgb(' + (d[i] + 255) / 2 + ',' + (d[i + 1] + 255) / 2 + ',' + (d[i + 2] + 255) / 2 + ')'; x.fillText(r[Math.min(5, Math.floor(lum(d, i) * 6))], px, y); } }
    if (kind === 'glitch') { x.drawImage(big, 0, 0); for (let k = 0; k < 4; k++) { const y = 36 + k * 84; x.drawImage(big, 0, y, B, 24, k % 2 ? 16 : -16, y, B, 24); x.fillStyle = k % 2 ? 'rgba(0,240,255,.28)' : 'rgba(255,0,170,.28)'; x.fillRect(0, y, B, 24); } }
    if (kind === 'y1996') { x.fillStyle = '#fff'; x.fillRect(0, 0, B, Bh); for (let y = 0; y < Bh; y += 12) for (let px = 0; px < B; px += 12) { const i = at(px + 6, y + 6), q = (v) => Math.round(v / 64) * 64; x.fillStyle = 'rgb(' + q(d[i]) + ',' + q(d[i + 1]) + ',' + q(d[i + 2]) + ')'; x.beginPath(); if (x.roundRect) x.roundRect(px + 1, y + 1, 10, 10, 3); else x.rect(px + 1, y + 1, 10, 10); x.fill(); } }
    return c;
  }
  async function realArt(kind, src) {
    if (kind === 'ascii') { const p = document.createElement('pre'); p.textContent = toAscii(src, 64, RAMPS.classic, false); return p; }
    if (kind === 'dither') return dither(src, PAL16, 'fs');
    if (kind === 'y1996') return dither(src, PAL16, 'none');
    const b = jpegBytes(src), lo = scanStart(b), g = await glitchBytes(b, lo + 40, b.length - 2, 9), im = new Image(); im.alt = ''; im.src = bytesURL(g || b); return im;
  }
  const styleprompt = {
    glyph: '🖼️', label: 'Style', from: 2024, to: 2024, title: 'Style', w: 640,
    html: () => '<form class="st-ask"><input type="text" maxlength="60" placeholder="Make it look like…" aria-label="Make it look like"><button type="submit">Generate</button></form>' +
      '<div class="st-chips" role="group" aria-label="suggestions">' + Object.keys(PRESETS).map((k) => '<button type="button" data-p="' + k + '">' + PRESETS[k].name + '</button>').join('') + '</div>' + PICK +
      '<p class="st-status" role="status"></p><div class="st-two st-result" hidden><figure class="st-real"><div class="st-art"></div><figcaption><b>What the limit made</b><span></span></figcaption></figure>' +
      '<figure class="st-gen"><div class="st-art"></div><figcaption><b>What the preset makes</b><span></span></figcaption></figure></div>',
    init(w) {
      const S = styleprompt.S = { pic: sample(), kind: null, n: 0 }, input = $('.st-ask input', w);
      S.run = async (text) => {
        const keys = Object.keys(PRESETS), kind = keys.find((k) => PRESETS[k].re.test(text)) || keys[S.n % 4], P = PRESETS[kind], my = ++S.n; S.kind = kind;
        status(w, 'Generating…'); w.classList.add('busy'); await new Promise((r) => setTimeout(r, 420));
        const real = await realArt(kind, S.pic), gen = presetArt(kind, S.pic); if (my !== S.n) return;
        const put = (sel, node, note) => { const a = $(sel + ' .st-art', w); a.innerHTML = ''; a.appendChild(node); $(sel + ' figcaption span', w).textContent = note; };
        put('.st-real', real, P.real); put('.st-gen', gen, 'Generated · preset “' + P.name + '” · ' + (keys.indexOf(kind) + 1) + ' of 4');
        $('.st-result', w).hidden = false; w.classList.remove('busy'); status(w, 'Done. Closest style: ' + P.name + '.'); const body = $('.app-body', w); if (body) body.scrollTop = body.scrollHeight;
      };
      $('.st-ask', w).addEventListener('submit', (e) => { e.preventDefault(); S.run(input.value); });
      $('.st-chips', w).addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { input.value = PRESETS[b.dataset.p].name; S.run(input.value); } });
    },
    open(w) { const S = styleprompt.S; picker(w, (c) => { S.pic = c; if (S.kind) S.run(PRESETS[S.kind].name); }); },
  };

  /* =============== registration: icons, windows, closing when the era leaves =============== */
  const TOOLS = { ascii, dither: ditherTool, pixfont, glitch, compress, styleprompt };
  function open(id) {
    const t = TOOLS[id]; if (!t) return null;
    const w = K.win('win-' + id, t.title, t.w, '<div class="st st-' + id + '">' + t.html() + '<p class="st-arg">' + esc(ARG[id]) + '</p></div>');
    if (!w.dataset.st) { w.dataset.st = '1'; t.init(w); }
    K.show('win-' + id); t.open(w); return w;
  }
  Object.keys(TOOLS).forEach((id) => { const t = TOOLS[id]; K.icon({ id, glyph: t.glyph, label: t.label, from: t.from, to: t.to, open: () => open(id) }); });
  K.onEra(() => { const y = K.yr(); Object.keys(TOOLS).forEach((id) => { const t = TOOLS[id]; if ((y < t.from || y > t.to) && K.isOpen('win-' + id)) K.hide('win-' + id); }); });

  window.Studio = { open, sign, signURL: (t, s) => signCanvas(t, s, '#000').toDataURL('image/png'), glyph, toAscii, banner, dither, sample, ARG, TOOLS, PAL16, PAL2 };
})();
