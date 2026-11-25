/* =====================================================================
   pixicons.js: pixel-art desktop icons (0.11)
   Every desktop icon used to be a plain emoji. This redraws each one as a
   chunky pixel sprite, in the spirit of mid-90s desktops: the emoji is drawn
   small onto a 24×24 canvas, its colours snapped to a 32-colour palette, its
   edges made hard, and a dark one-pixel outline added. The sprite is shown at
   2× with nearest-neighbour scaling. A few icons are hand-drawn instead.
   Keeps nothing; the sprites are cached in memory for the visit.
   ===================================================================== */
(function () {
  'use strict';
  const N = 24;                       // sprite size in pixels
  const cache = new Map();
  // a bright, slightly candy 32-colour palette (sweetie-16 + extras), so every icon shares one set of colours
  const PAL = ['#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75', '#a7f070', '#38b764', '#257179', '#29366f', '#3b5dc9',
    '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57', '#ffffff', '#000000', '#ff77a8', '#ffccaa', '#c2c3c7',
    '#ab5236', '#7e2553', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff004d', '#8f563b', '#d9a066', '#eec39a']
    .map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  const OUT = [26, 28, 44];
  function near(r, g, b) {
    let best = 0, bd = 1e9;
    for (let i = 0; i < PAL.length; i++) { const p = PAL[i], d = (p[0] - r) * (p[0] - r) * 0.3 + (p[1] - g) * (p[1] - g) * 0.59 + (p[2] - b) * (p[2] - b) * 0.11; if (d < bd) { bd = d; best = i; } }
    return PAL[best];
  }

  // hand-drawn sprites for the most "computer" icons (16×16, scaled into the 24 grid). '.' = clear
  const HAND = {
    folder: { pal: { k: '#1a1c2c', y: '#ffcd75', o: '#ef7d57', w: '#fff3c4' }, rows: [
      '................', '................', '.kkkkk..........', 'kyyyyyk.........', 'kyyyyyykkkkkkkk.', 'kwwwwwwwwwwwwwyk',
      'kyyyyyyyyyyyyyok', 'kyyyyyyyyyyyyyok', 'kyyyyyyyyyyyyyok', 'kyyyyyyyyyyyyyok', 'kyyyyyyyyyyyyyok', 'kyyyyyyyyyyyyyok',
      'kooooooooooooook', '.kkkkkkkkkkkkkk.', '................', '................'] },
    computer: { pal: { k: '#1a1c2c', g: '#c2c3c7', d: '#94b0c2', b: '#29366f', c: '#41a6f6', s: '#73eff7' }, rows: [
      '................', '.kkkkkkkkkkkkkk.', '.kggggggggggggk.', '.kgkkkkkkkkkkgk.', '.kgkbbbbbbbbkgk.', '.kgkbcsbbbbbkgk.',
      '.kgkbbcbbbbbkgk.', '.kgkbbbbbbbbkgk.', '.kgkkkkkkkkkkgk.', '.kggggggggggddk.', '.kkkkkkkkkkkkkk.', '.....kggggk.....',
      '..kkkkkkkkkkkk..', '..kggggggggggk..', '..kkkkkkkkkkkk..', '................'] },
    bin: { pal: { k: '#1a1c2c', g: '#c2c3c7', w: '#f4f4f4', d: '#566c86' }, rows: [
      '................', '.....kkkkkk.....', '..kkkkkkkkkkkk..', '..kwwwwwwwwwwk..', '..kkkkkkkkkkkk..', '...kgwgwgwgwk...',
      '...kgwgwgwgdk...', '...kgwgwgwgdk...', '...kgwgwgwgdk...', '...kgwgwgwgdk...', '...kgwgwgwgdk...', '...kgwgwgwgdk...',
      '...kgdgdgdgdk...', '....kkkkkkkk....', '................', '................'] },
    globe: { pal: { k: '#1a1c2c', b: '#3b5dc9', c: '#41a6f6', g: '#38b764', l: '#a7f070' }, rows: [
      '................', '.....kkkkkk.....', '...kkccbbbbkk...', '..kccggbbbbbbk..', '..kcgglgbbccbk..', '.kbbggggbbcccbk.',
      '.kbbbggbbbbccbk.', '.kbbbbbbbbbbbbk.', '.kbbbbbgggbbbbk.', '.kbbbbglllgbbbk.', '..kbbbbgggbbbk..', '..kbbbbbgbbbbk..',
      '...kkbbbbbbkk...', '.....kkkkkk.....', '................', '................'] },
  };
  const HAND_FOR = { '🗃': 'folder', '🗂': 'folder', '🖥': 'computer', '🗑': 'bin', '🌐': 'globe', '🧭': 'globe' };

  function hand(name) {
    const h = HAND[name], c = document.createElement('canvas'); c.width = c.height = 16;
    const g = c.getContext('2d');
    h.rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '.') return; g.fillStyle = h.pal[ch]; g.fillRect(x, y, 1, 1); }));
    return c.toDataURL();
  }

  function sprite(glyph) {
    if (cache.has(glyph)) return cache.get(glyph);
    let url = '';
    try {
      if (HAND_FOR[glyph]) url = hand(HAND_FOR[glyph]);
      else {
        const c = document.createElement('canvas'); c.width = c.height = N;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '18px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
        g.fillText(glyph, N / 2, N / 2 + 1);
        const im = g.getImageData(0, 0, N, N), d = im.data, solid = new Uint8Array(N * N);
        let any = 0;
        for (let i = 0; i < N * N; i++) {
          const a = d[i * 4 + 3];
          if (a > 100) {
            // un-premultiply the anti-aliasing, then snap to the palette
            const p = near(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
            d[i * 4] = p[0]; d[i * 4 + 1] = p[1]; d[i * 4 + 2] = p[2]; d[i * 4 + 3] = 255; solid[i] = 1; any++;
          } else d[i * 4 + 3] = 0;
        }
        if (!any) { cache.set(glyph, ''); return ''; }
        // one-pixel dark outline around the shape
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const i = y * N + x; if (solid[i]) continue;
          const nb = (x > 0 && solid[i - 1]) || (x < N - 1 && solid[i + 1]) || (y > 0 && solid[i - N]) || (y < N - 1 && solid[i + N]);
          if (nb) { d[i * 4] = OUT[0]; d[i * 4 + 1] = OUT[1]; d[i * 4 + 2] = OUT[2]; d[i * 4 + 3] = 255; }
        }
        g.putImageData(im, 0, 0);
        url = c.toDataURL();
      }
    } catch (e) { url = ''; }
    cache.set(glyph, url);
    return url;
  }

  // swap any emoji glyph on a desktop icon for its sprite (icons are re-rendered on era change, so watch for them)
  function swap(root) {
    (root || document).querySelectorAll('#desktop .icon .glyph, .px-swap .glyph').forEach((gl) => {
      if (gl.querySelector('img.px-ico')) return;
      const t = (gl.textContent || '').trim();
      if (!t || t.length > 8 || /^[\w\s]+$/.test(t)) return;
      const url = sprite(t); if (!url) return;
      gl.dataset.g = t;
      gl.innerHTML = '<img class="px-ico" src="' + url + '" alt="" width="48" height="48" draggable="false">';
    });
  }
  window.PixIcons = { sprite, swap };
  let pending = false;
  const mo = new MutationObserver(() => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; swap(); }); });
  const start = () => { swap(); const d = document.getElementById('desktop') || document.body; mo.observe(d, { childList: true, subtree: true, characterData: true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
