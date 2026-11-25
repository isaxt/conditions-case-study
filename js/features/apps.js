/* =====================================================================
   apps.js — small period applications on the desktop (0.9). All invented: no real product names or logos.

   the web      a browser whose chrome and search change with the era. Type anything; the results are written
                the way that year would have answered (hand-kept list → portal directory → clean search →
                ads and autocomplete → an AI overview on top). In 2030 you don't search, you ask your agent.
   paint        a grey toolbox paint program: pencil, brush, spray, fill, eraser, line, box, oval. 1993–2010.
   kid stamps   the loud one: rainbow and bubble brushes, stamps, a mixer, a BOOM eraser and an "oops". 1996–2010.

   A drawing can be kept: it becomes one of the visitor's own things (a small thumbnail, in this browser only).
   From 2010 a search is written to the receipt, because by then it would have been. Before that it isn't.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const era = () => { const m = /era-(\w+)/.exec(document.body.className); return m ? m[1] : '1991'; };
  const yr = () => parseInt(era(), 10);
  const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

  function win(id, title, w, body) {
    let el = $('#' + id); if (el) return el;
    el = document.createElement('div'); el.className = 'window app-win'; el.id = id; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', title);
    el.style.cssText = 'width:' + w + 'px; top:130px; left:260px; z-index:14;';
    el.innerHTML = '<div class="titlebar" onpointerdown="startDrag(event,\'' + id + '\')"><span class="ttl">' + esc(title) + '</span><div class="winbtns"><button onclick="minimizeWindow(\'' + id + '\')" aria-label="minimize">_</button><button onclick="closeWindow(\'' + id + '\')" aria-label="close">×</button></div></div><div class="winbody app-body">' + body + '</div>';
    document.body.appendChild(el); if (typeof windowTitles !== 'undefined') windowTitles[id] = title;
    return el;
  }
  const show = (id) => { if (typeof openWindow === 'function') openWindow(id); const w = $('#' + id); w.classList.add('open'); w.style.display = 'flex'; };
  const setTitle = (id, t) => { const x = $('#' + id + ' .ttl'); if (x) x.textContent = t; if (typeof windowTitles !== 'undefined') windowTitles[id] = t; };

  /* =============================== the web =============================== */
  const group = () => { const y = yr(); return y <= 1993 ? 'g93' : y <= 1999 ? 'g96' : y <= 2008 ? 'g04' : y <= 2016 ? 'g10' : y <= 2024 ? 'g24' : 'g30'; };
  const BROWSER = { g93: 'Wayfarer 1.0', g96: 'Wayfarer 3 Gold', g04: 'Otter', g10: 'Otter', g24: 'Otter', g30: 'ask' };
  const web = { hist: [], q: '' };
  function openWeb() { win('win-web', 'the web', 560, '<div id="webUI"></div>'); const w = $('#win-web'); if (!w.dataset.wired) { w.dataset.wired = 1; w.addEventListener('click', webClick); w.addEventListener('submit', webSubmit); w.addEventListener('input', webInput); } web.hist = []; web.q = ''; drawWeb('home'); show('win-web'); }
  function chrome(g, addr, inner) {
    const tb = g === 'g93' || g === 'g96' ? '<div class="wb-bar"><button data-w="back">◀ Back</button><button data-w="home">Home</button><button data-w="reload">Reload</button><span class="wb-throb" aria-hidden="true">' + (g === 'g93' ? '🌍' : '◇') + '</span></div>'
      : '<div class="wb-bar"><button data-w="back" aria-label="back">←</button><button data-w="home" aria-label="home">⌂</button>' + (g === 'g04' ? '<span class="wb-tab">' + esc(addr.replace(/^.*?\/\//, '').slice(0, 22)) + '</span><span class="wb-tab dim">+</span>' : '') + '</div>';
    return '<div class="wb wb-' + g + ' wb-y' + yr() + '">' + tb + '<div class="wb-addr"><span>' + (g === 'g93' ? 'URL:' : g === 'g96' ? 'Location:' : '') + '</span><code>' + esc(addr) + '</code></div><div class="wb-view" id="wbView" tabindex="0">' + inner + '</div><div class="wb-status" id="wbStatus">' + (g === 'g93' || g === 'g96' ? 'Document: Done.' : '') + '</div></div>';
  }
  const form = (ph, btn, extra) => '<form class="wb-search" role="search"><input id="wbQ" name="q" autocomplete="off" maxlength="60" placeholder="' + ph + '" value="' + esc(web.q) + '" aria-label="search"><button type="submit">' + btn + '</button>' + (extra || '') + '</form>';
  function home(g) {
    if (g === 'g93') return '<h1>What’s New on the Web</h1><p><i>A list kept by hand. To be added, write to the person who keeps it.</i></p><ul>' + ['A weather map from a university, updated daily', 'A coffee pot you can check from another building', 'A museum exhibit about old maps', 'A physics department phone list', 'A page of someone’s favourite recipes', 'The list of all known web servers (it fits on one page)'].map((x, i) => '<li><a href="#" data-w="page" data-i="' + i + '">' + x + '</a></li>').join('') + '</ul><hr>' + form('open a URL', 'Open') + '<p><small>There is nothing to search yet. There is a list, and someone who keeps it.</small></p>';
    if (g === 'g96') return '<div class="wb-portal"><div class="wb-logo">Seeker<i>!</i></div>' + form('search the web', 'Seek!') + '<table><tr><td><b><a href="#" data-w="cat">Arts</a></b><br><small>Humanities, Photography…</small></td><td><b><a href="#" data-w="cat">Computers</a></b><br><small>Internet, WWW, Games…</small></td></tr><tr><td><b><a href="#" data-w="cat">Recreation</a></b><br><small>Hobbies, Pets, Travel…</small></td><td><b><a href="#" data-w="cat">Society</a></b><br><small>People, Home Pages…</small></td></tr></table><p class="wb-new">NEW! <a href="#" data-w="cat">Cool Site of the Day</a> · <a href="#" data-w="cat">Add Your Site</a></p><p><small>Every site here was looked at by a person and filed by hand.</small></p></div>';
    if (g === 'g04') return '<div class="wb-clean"><div class="wb-logo2">seek</div>' + form('', 'Search', '<button type="submit" class="alt">I’m feeling curious</button>') + '<p><small>Searching 4,285,199,774 pages</small></p></div>';
    if (g === 'g10') return '<div class="wb-clean"><div class="wb-logo2">seek</div>' + form('', '🔍') + '<div id="wbSug" class="wb-sug"></div>' + (yr() >= 2014 ? '<p class="wb-cookie">We use cookies to personalise your results. <button data-w="ok">OK</button></p>' : '') + '</div>';
    if (g === 'g24') return '<div class="wb-clean"><div class="wb-logo2">seek <sup>◇ AI</sup></div>' + form('Ask anything', '◇') + '<p><small>Answers are generated and may contain errors.</small></p></div>';
    return '<div class="wb-ask"><p class="big">You don’t search here.</p><p>You say what you want, and your agent goes and comes back. Nobody types into a box and reads ten links.</p><button data-w="agent">ask your agent →</button></div>';
  }
  function results(g, q) {
    const Q = cap(q), e = esc(q), E = esc(Q), y = yr(); const r = (t, u, d, cls) => '<li class="' + (cls || '') + '"><a href="#" data-w="res" data-t="' + esc(t) + '">' + t + '</a><cite>' + u + '</cite><p>' + d + '</p></li>';
    const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'page';
    if (g === 'g93') return '<h1>Host not found</h1><p>The web has a few hundred sites, and <b>' + e + '</b> is not one of them yet.</p><p>Try the <a href="#" data-w="home">What’s New list</a>. Or make the page yourself. That is how the rest got here.</p>';
    if (g === 'g96') return '<div class="wb-portal"><div class="wb-logo sm">Seeker<i>!</i></div><p>Found <b>14</b> sites for <b>' + e + '</b>:</p><ul class="wb-res">' +
      r('~*~ ' + E + '’s Home Page ~*~', 'members.hometown.example/~' + slug + '/', 'Welcome!! This page is UNDER CONSTRUCTION. Sign my guestbook. You are visitor #000213.') +
      r('The Unofficial ' + E + ' FAQ v1.2', 'ftp.archive.example/pub/faq/' + slug + '.txt', 'Plain text. Maintained by one volunteer. Last updated March 1997. Corrections welcome by email.') +
      r('The ' + E + ' WebRing', 'ring.example/' + slug, '[ Previous | Random | Next | Join ] 37 sites about ' + e + ', linked to each other in a circle.') +
      r('My ' + E + ' Links', 'www.cs.someuniversity.example/~jl/links.html', 'A list of every ' + e + ' page I have found so far. Tell me if I am missing one.') + '</ul></div>';
    if (g === 'g04') return '<div class="wb-top"><b class="wb-logo2 sm">seek</b>' + form('', 'Search') + '</div><p class="wb-count">Results 1–10 of about 1,240,000 for <b>' + e + '</b> (0.21 seconds)</p><div class="wb-cols"><ul class="wb-res">' +
      r(E + ' — the free encyclopedia anyone can edit', 'openpedia.example/wiki/' + slug, 'This article is a stub. You can help by expanding it.') +
      r('everything i know about ' + e + ' (long post)', 'smallblog.example/2004/06/' + slug, 'posted by the author at 2:14 am · 23 comments · trackbacks (4)') +
      r(e + ' — general discussion (page 1 of 37)', 'boards.example/viewtopic.php?t=4411', 'Re: Re: Re: ' + e + ' · by a regular · “use the search function before posting”') +
      r('Play ' + E + ' Game (free!)', 'arcade.example/play/' + slug, 'Requires a plug-in to play.', 'flash') + '</ul>' + (y >= 2006 ? '<aside class="wb-ads"><b>Sponsored Links</b><p><a href="#" data-w="ad">' + E + ' — Low Prices</a><br>Huge selection. Free shipping.</p><p><a href="#" data-w="ad">Find ' + E + ' Near You</a><br>Compare and save today.</p></aside>' : '') + '</div>';
    if (g === 'g10') return '<div class="wb-top"><b class="wb-logo2 sm">seek</b>' + form('', '🔍') + '</div><p class="wb-count">About 48,300,000 results' + (y >= 2014 ? ' · <span class="wb-pers">personalised for you</span>' : '') + '</p><ul class="wb-res">' +
      r(E + ' — Official Site | Shop Now', 'www.' + slug + '-deals.example', 'Up to 40% off. Free returns.', 'ad') + (y >= 2016 ? r('Best ' + E + ' 2016 — Compare Top 10', 'top10.example/' + slug, 'We may earn a commission.', 'ad') : '') +
      (y >= 2016 ? '<li class="wb-paa"><b>People also ask</b><details><summary>What is ' + e + '?</summary><p>' + E + ' is a thing people search for.</p></details><details><summary>Is ' + e + ' worth it?</summary><p>It depends who is asking.</p></details></li>' : '') +
      r('17 ' + E + ' Facts That Will Blow Your Mind', 'listsite.example/' + slug + '-facts', 'Number 9 will surprise you. (slideshow, 17 pages)') +
      r(E + ' — Encyclopedia', 'openpedia.example/wiki/' + slug, 'A long article with 212 references and a talk page.') +
      r(e + ' — videos', 'videosite.example/results?q=' + slug, '▶ 3:41 · ▶ 10:02 · ▶ 0:58 · autoplay is on') + '</ul>';
    if (g === 'g24') return '<div class="wb-top"><b class="wb-logo2 sm">seek <sup>◇</sup></b>' + form('Ask anything', '◇') + '</div><div class="wb-ai"><b>◇ AI Overview</b><p>' + E + ' is a widely discussed topic. Many people find it useful, while others have raised concerns. Key points include its background, common uses, and things to consider.</p><small>Generated. May contain errors. <a href="#" data-w="src">Show sources ▾</a></small><div id="wbSrc" hidden><small>3 sources. Two are summaries of each other.</small></div></div><ul class="wb-res">' +
      r(E + ' — Shop the Look', 'sponsored · store.example', 'Sponsored', 'ad') + r(E + ': Everything You Need to Know (2024 Guide)', 'contentfarm.example/' + slug, 'Updated daily. Reading time: 14 minutes. The answer is in paragraph 22.') +
      r(e + ' — what do real people think? (forum)', 'forum.example/r/' + slug, 'People add “forum” to a search now, to find a person.') + r('The truth about ' + e, 'newspaper.example/' + slug, '🔒 Subscribe to continue reading.', 'lock') + '</ul>';
    return home('g30');
  }
  function page(g, t) {
    const y = yr();
    if (g === 'g93') return '<h1>' + esc(t) + '</h1><p>This page is plain text and a few links. It loaded in nine seconds. Someone at a university put it here because they could.</p><p><a href="#" data-w="back">Back</a></p>';
    if (g === 'g96') return '<div class="wb-geo"><h1>' + esc(t) + '</h1><p class="uc">🚧 UNDER CONSTRUCTION 🚧</p><p>hi!! thanks for stopping by. this is my page. i made it myself. more coming soon (i promise).</p><p>[ <a href="#" data-w="back">back</a> ] [ sign guestbook ] [ email me ]</p><p><small>best viewed at 800x600</small></p></div>';
    if (/Play .* Game/.test(t)) return '<div class="wb-plug"><p>🧩</p><p><b>' + (y >= 2024 ? 'This content is no longer supported.' : 'Click to activate plug-in.') + '</b></p><p><small>' + (y >= 2024 ? 'The game still exists. The thing that ran it does not.' : 'It would have worked, here. Go to 2024 and try again.') + '</small></p><p><a href="#" data-w="back">back</a></p></div>';
    if (g === 'g04') return '<h2>' + esc(t) + '</h2><p>One person wrote this, with their name on it, and other people answered underneath. It goes on for a while. Nobody ranked the replies.</p><p><a href="#" data-w="back">← back to results</a></p>';
    if (g === 'g10') return '<h2>' + esc(t) + '</h2><p class="wb-pop">Before you read: sign up for our newsletter! <button data-w="ok">No thanks</button></p><p>Page 1 of 17. <b>Next ›</b></p><p><a href="#" data-w="back">← back to results</a></p>';
    return '<h2>' + esc(t) + '</h2><p class="wb-pop">Continue in the app · Accept all cookies · Subscribe</p><p>The first screen is not the article.</p><p><a href="#" data-w="back">← back to results</a></p>';
  }
  function drawWeb(kind, arg) {
    const g = group(), slug = (web.q || '').toLowerCase().replace(/[^a-z0-9]+/g, '+');
    const addr = g === 'g30' ? 'ask' : kind === 'home' ? (g === 'g93' ? 'http://info.example/whats-new.html' : g === 'g96' ? 'http://www.seeker.example/' : 'https://seek.example') : kind === 'results' ? (g === 'g96' ? 'http://www.seeker.example/bin/search?p=' + slug : 'https://seek.example/search?q=' + slug + (g === 'g10' || g === 'g24' ? '&src=hp&uid=7f3a…&personal=1' : '')) : 'http://…/' + String(arg || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 28);
    setTitle('win-web', BROWSER[g] + (g === 'g30' ? '' : ' — the web'));
    $('#webUI').innerHTML = chrome(g, addr, kind === 'home' ? home(g) : kind === 'results' ? results(g, web.q) : page(g, arg));
    web.cur = [kind, arg]; web.g = g;
    if (g === 'g93' || g === 'g96') { const v = $('#wbView'), st = $('#wbStatus'); v.classList.add('loading'); st.textContent = g === 'g93' ? 'Connecting to host…' : 'Connect: Contacting host… 28.8 kbps'; setTimeout(() => { if ($('#wbView') === v) { v.classList.remove('loading'); st.textContent = 'Document: Done.'; } }, 900); }
  }
  const go = (kind, arg) => { if (web.cur) web.hist.push(web.cur); drawWeb(kind, arg); };
  function webSubmit(e) { e.preventDefault(); const q = ($('#wbQ').value || '').trim(); if (!q) return; web.q = q; go('results'); if (yr() >= 2010 && yr() < 2030 && typeof logReceipt === 'function') logReceipt('searched for “' + q + '”', 'query · added to your profile'); }
  function webInput(e) { if (e.target.id !== 'wbQ' || web.g !== 'g10') return; const s = $('#wbSug'), v = e.target.value.trim(); if (!s) return; s.innerHTML = v ? [v + ' near me', v + ' meme', 'why is ' + v + ' so', v + ' vs'].map((x) => '<button type="button" data-w="sug">' + esc(x) + '</button>').join('') : ''; }
  function webClick(e) {
    const b = e.target.closest('[data-w]'); if (!b) return; e.preventDefault(); const k = b.dataset.w;
    if (k === 'back') { const h = web.hist.pop(); if (h) drawWeb(h[0], h[1]); }
    else if (k === 'home') { web.q = ''; go('home'); } else if (k === 'reload') drawWeb(web.cur[0], web.cur[1]);
    else if (k === 'res' || k === 'page') go('page', k === 'page' ? b.textContent : b.dataset.t);
    else if (k === 'cat') go('page', b.textContent); else if (k === 'ad') go('page', b.textContent);
    else if (k === 'sug') { web.q = b.textContent; go('results'); }
    else if (k === 'ok') b.parentNode.remove(); else if (k === 'src') $('#wbSrc').hidden = false;
    else if (k === 'agent') { if (window.Future) Future.open(); }
  }

  /* =============================== paint + kid stamps =============================== */
  const TOOLS = {
    paint: [['pencil', '✏️'], ['brush', '🖌️'], ['spray', '💨'], ['fill', '🪣'], ['eraser', '🧽'], ['line', '╱'], ['box', '▭'], ['oval', '◯']],
    kid: [['rainbow', '🌈'], ['bubbles', '🫧'], ['drip', '💧'], ['stamp', '⭐'], ['mixer', '🌀'], ['eraser', '🧽']],
  };
  const COLORS = ['#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff8040', '#804000', '#80ff80', '#ff80c0'];
  const STAMPS = ['⭐', '🐸', '🌼', '🚀', '🐟', '🍕', '👾', '🦋', '💥', '🎈'];
  function openArt(mode) {
    const id = mode === 'kid' ? 'win-kid' : 'win-paint', P = { mode, tool: TOOLS[mode][0][0], color: mode === 'kid' ? '#ff00ff' : '#000000', stamp: STAMPS[0], undo: [], hue: 0 };
    if (!$('#' + id)) {
      win(id, mode === 'kid' ? 'kid stamps' : 'untitled - paint', 560, '<div class="art art-' + mode + '"><div class="art-tools" role="toolbar" aria-label="tools">' + TOOLS[mode].map(([t, g]) => '<button type="button" data-tool="' + t + '" aria-label="' + t + '" title="' + t + '">' + g + '</button>').join('') + '</div><div class="art-stage"><canvas width="440" height="290" aria-label="drawing area"></canvas></div><div class="art-pal">' + (mode === 'kid' ? '<div class="art-stamps">' + STAMPS.map((s) => '<button type="button" data-stamp="' + s + '" aria-label="stamp ' + s + '">' + s + '</button>').join('') + '</div>' : '') + '<div class="art-cols">' + COLORS.map((c) => '<button type="button" data-col="' + c + '" style="background:' + c + '" aria-label="colour ' + c + '"></button>').join('') + '</div><div class="art-act"><button type="button" data-do="undo">' + (mode === 'kid' ? 'OOPS!' : 'Undo') + '</button><button type="button" data-do="clear">' + (mode === 'kid' ? '💣 BOOM' : 'Clear') + '</button><button type="button" data-do="keep" class="keep">keep it</button></div></div><div class="art-status" role="status"></div></div>');
      wire($('#' + id), P);
    }
    show(id);
  }
  function wire(w, P) {
    const cv = $('canvas', w), cx = cv.getContext('2d', { willReadFrequently: true }), st = $('.art-status', w);
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.lineCap = 'round'; cx.lineJoin = 'round';
    const mark = () => { w.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('on', b.dataset.tool === P.tool)); w.querySelectorAll('[data-col]').forEach((b) => b.classList.toggle('on', b.dataset.col === P.color)); w.querySelectorAll('[data-stamp]').forEach((b) => b.classList.toggle('on', b.dataset.stamp === P.stamp)); st.textContent = P.tool + (P.tool === 'stamp' ? ' ' + P.stamp : ''); };
    const snap = () => { P.undo.push(cx.getImageData(0, 0, cv.width, cv.height)); if (P.undo.length > 12) P.undo.shift(); };
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * cv.width / r.width), Math.round((e.clientY - r.top) * cv.height / r.height)]; };
    function fill(x, y, hex) {
      const im = cx.getImageData(0, 0, cv.width, cv.height), d = im.data, W = cv.width, H = cv.height, i0 = (y * W + x) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2]], c = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
      if (Math.abs(t[0] - c[0]) + Math.abs(t[1] - c[1]) + Math.abs(t[2] - c[2]) < 8) return;
      const same = (i) => Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) < 60, stack = [[x, y]];
      while (stack.length) { const [px, py] = stack.pop(); if (px < 0 || py < 0 || px >= W || py >= H) continue; const i = (py * W + px) * 4; if (!same(i)) continue; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]); }
      cx.putImageData(im, 0, 0);
    }
    let down = false, last = null, start = null, base = null;
    function stroke(x, y) {
      const t = P.tool, [lx, ly] = last || [x, y];
      if (t === 'pencil' || t === 'brush' || t === 'eraser' || t === 'rainbow') {
        cx.strokeStyle = t === 'eraser' ? '#fff' : t === 'rainbow' ? 'hsl(' + (P.hue = (P.hue + 9) % 360) + ',95%,55%)' : P.color; cx.lineWidth = t === 'pencil' ? 1.5 : t === 'brush' ? 7 : t === 'rainbow' ? 10 : 16;
        cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(x, y); cx.stroke();
      } else if (t === 'spray') { cx.fillStyle = P.color; for (let i = 0; i < 22; i++) { const a = Math.random() * 6.28, r = Math.random() * 13; cx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 1, 1); } }
      else if (t === 'bubbles') { cx.strokeStyle = P.color; cx.lineWidth = 1.5; const r = 4 + Math.random() * 12; cx.beginPath(); cx.arc(x + (Math.random() - .5) * 14, y + (Math.random() - .5) * 14, r, 0, 6.28); cx.stroke(); }
      else if (t === 'drip') { cx.fillStyle = P.color; cx.beginPath(); cx.arc(x, y, 5, 0, 6.28); cx.fill(); if (Math.random() < .3) cx.fillRect(x - 1.5, y, 3, 10 + Math.random() * 40); }
      else if (t === 'line' || t === 'box' || t === 'oval') {
        cx.putImageData(base, 0, 0); cx.strokeStyle = P.color; cx.lineWidth = 2; cx.beginPath(); const [sx, sy] = start;
        if (t === 'line') { cx.moveTo(sx, sy); cx.lineTo(x, y); } else if (t === 'box') cx.rect(sx, sy, x - sx, y - sy); else cx.ellipse((sx + x) / 2, (sy + y) / 2, Math.abs(x - sx) / 2, Math.abs(y - sy) / 2, 0, 0, 6.28);
        cx.stroke();
      }
      last = [x, y];
    }
    function tap(x, y) {
      if (P.tool === 'fill') fill(x, y, P.color);
      else if (P.tool === 'stamp') { cx.font = '34px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(P.stamp, x, y); }
      else if (P.tool === 'mixer') { const h = 24; for (let yy = 0; yy < cv.height; yy += h) { const im = cx.getImageData(0, yy, cv.width, h); cx.putImageData(im, Math.round((Math.random() - .5) * 60), yy); } }
      else return false; return true;
    }
    cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); snap(); const [x, y] = pos(e); if (tap(x, y)) return; down = true; last = null; start = [x, y]; base = cx.getImageData(0, 0, cv.width, cv.height); stroke(x, y); });
    cv.addEventListener('pointermove', (e) => { if (!down) return; const [x, y] = pos(e); stroke(x, y); });
    const up = () => { down = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    // keyboard: arrows move a pen, space draws a dot/stamp, so the canvas is not pointer-only
    cv.tabIndex = 0; let kx = 220, ky = 145;
    cv.addEventListener('keydown', (e) => { const d = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] }[e.key]; if (d) { e.preventDefault(); if (!P.kb) { snap(); P.kb = 1; } last = [kx, ky]; kx = Math.max(0, Math.min(cv.width, kx + d[0])); ky = Math.max(0, Math.min(cv.height, ky + d[1])); start = start || [kx, ky]; base = base || cx.getImageData(0, 0, cv.width, cv.height); if (!tap(kx, ky) && !/line|box|oval/.test(P.tool)) stroke(kx, ky); } else if (e.key === ' ') { e.preventDefault(); snap(); tap(kx, ky); } });
    w.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tool]'), c = e.target.closest('[data-col]'), s = e.target.closest('[data-stamp]'), d = e.target.closest('[data-do]');
      if (t) P.tool = t.dataset.tool; else if (c) P.color = c.dataset.col; else if (s) { P.stamp = s.dataset.stamp; P.tool = 'stamp'; }
      else if (d) {
        const k = d.dataset.do;
        if (k === 'undo') { const im = P.undo.pop(); if (im) cx.putImageData(im, 0, 0); st.textContent = P.mode === 'kid' ? 'oops! (it’s ok.)' : 'undone'; return; }
        if (k === 'clear') { snap(); if (P.mode === 'kid') { const stg = $('.art-stage', w); stg.classList.remove('boom'); void stg.offsetWidth; stg.classList.add('boom'); } cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); st.textContent = P.mode === 'kid' ? 'BOOM.' : 'cleared'; return; }
        if (k === 'keep') {
          const th = document.createElement('canvas'); th.width = 176; th.height = 116; th.getContext('2d').drawImage(cv, 0, 0, 176, 116);
          if (window.Journey && Journey.keepMine) { P.n = (P.n || 0) + 1; Journey.keepMine({ id: 'Y-draw-' + P.mode + '-' + era() + '-' + P.n, title: 'a drawing you made (' + (P.mode === 'kid' ? 'kid stamps' : 'paint') + ')', line: 'drawn by hand in ' + era(), ctx: 'you drew this.', img: th.toDataURL('image/jpeg', 0.55) }); }
          st.textContent = 'kept. it is one of your things now.'; return;
        }
      } else return;
      mark();
    });
    mark();
  }

  /* =============================== icons on the desktop (placed by kit.js) =============================== */
  const K = window.TSKit;
  K.icon({ id: 'web', glyph: (y) => (y <= 1999 ? '🧭' : y >= 2030 ? '◇' : '🌐'), label: (y) => (y >= 2030 ? 'ask' : 'the web'), from: 1993, to: 2030, open: openWeb });
  K.icon({ id: 'paint', glyph: '🎨', label: 'paint', from: 1993, to: 2010, open: () => openArt('paint') });
  K.icon({ id: 'kid', glyph: '🖍️', label: 'kid stamps', from: 1996, to: 2010, open: () => openArt('kid') });
  // an open app that doesn't exist in this era closes; the browser redraws in the new era's clothes
  K.onEra(() => { const y = yr(); if (y < 1993 || y > 2010) K.hide('win-paint'); if (y < 1996 || y > 2010) K.hide('win-kid'); if (K.isOpen('win-web')) { web.hist = []; drawWeb(web.q ? 'results' : 'home'); } });
  window.Apps = { openWeb, openArt, group };
})();
