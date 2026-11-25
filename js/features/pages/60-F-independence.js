/* F. independence, collecting, resistance to optimization
   Each world is the practice at the centre of its scene:
     solarpunk  a city map where every lot shows what it gives back; swap buildings, watch the commons ledger
     indieweb   write a small page by hand, add a button badge, join a webring, publish to the members list
     lofi       a chronological feed you subscribe to by hand: posts come at their own pace; reply or bookmark only
     obscura    a searchable atlas of niche communities; deeper entries are reachable only by "see also"
   All names, sites and posts are invented placeholders. */
(function () {
  const P = window.SC_PAGES;

  /* ---------- solarpunk: a city that gives back ---------- */
  const DIMS = ['shade', 'water', 'food', 'repair', 'power'];
  const SP = {
    park: { n: 'car park', s: 'P', g: {}, t: 'holds cars, stores heat.' },
    office: { n: 'glass office', s: '▦', g: { power: -1 }, t: 'empty after six, lit all night.' },
    garden: { n: 'rooftop garden', s: '✿', g: { food: 2, shade: 1 }, t: 'vegetables for the block, cool roofs.' },
    cistern: { n: 'rain cistern', s: '≋', g: { water: 3 }, t: 'stores storm water for the gardens.' },
    solar: { n: 'solar co-op', s: '☀', g: { power: 3, shade: 1 }, t: 'owned by the street; panels shade the square.' },
    repair: { n: 'repair café', s: '⚒', g: { repair: 3 }, t: 'fix it before you replace it. tea is free.' },
    trees: { n: 'tree arcade', s: '♣', g: { shade: 3, water: 1 }, t: 'a covered walk under old trees.' },
    tools: { n: 'tool library', s: '⚙', g: { repair: 2, food: 1 }, t: 'borrow a ladder, a drill, a seed press.' },
  };
  const SP_START = ['park', 'office', 'garden', 'park', 'office', 'park', 'trees', 'park', 'office', 'park', 'repair', 'office'];
  P.solarpunk = { w: 580, html: (h) => `
    <div class="sol-sun" aria-hidden="true"><i></i></div>
    <header class="sol-head"><h3>the commons map</h3><p>${h.years} · every building says what it gives back</p></header>
    <div class="sol-wrap">
      <div class="sol-map" role="group" aria-label="city lots">${SP_START.map((b, i) => `<button class="sol-lot" data-i="${i}" aria-pressed="false"></button>`).join('')}</div>
      <aside class="sol-led" aria-label="commons ledger"><h4>commons ledger</h4>${DIMS.map((d) => `<div class="sol-row" data-d="${d}"><span>${d}</span><i><b></b></i><em></em></div>`).join('')}<p class="sol-sum" aria-live="polite"></p></aside>
    </div>
    <section class="sol-pick" aria-live="polite"><p>Choose a lot on the map to see what it gives back.</p></section>
    ${h.note('Solarpunk imagines technology organised around community and ecology. This map is a sketch of that idea, not a planning tool.')}`,
    run(stage, k) {
      const city = SP_START.slice(); let sel = -1, balanced = false;
      const lots = stage.querySelectorAll('.sol-lot'), pick = stage.querySelector('.sol-pick');
      const gives = (b) => { const g = SP[b].g, ks = Object.keys(g); return ks.length ? ks.map((d) => (g[d] > 0 ? '+' : '') + g[d] + ' ' + d).join(', ') : 'nothing'; };
      const draw = () => {
        lots.forEach((l, i) => { const b = SP[city[i]]; l.className = 'sol-lot sol-' + city[i]; l.innerHTML = '<b aria-hidden="true">' + b.s + '</b><span>' + b.n + '</span>'; l.setAttribute('aria-label', 'lot ' + (i + 1) + ': ' + b.n + ', gives back ' + gives(city[i])); });
        const tot = {}; DIMS.forEach((d) => { tot[d] = 0; }); city.forEach((b) => Object.keys(SP[b].g).forEach((d) => { tot[d] += SP[b].g[d]; }));
        stage.querySelectorAll('.sol-row').forEach((r) => { const v = tot[r.dataset.d]; r.querySelector('b').style.width = Math.max(0, Math.min(100, v * 12.5)) + '%'; r.querySelector('em').textContent = v; r.classList.toggle('low', v < 3); });
        const low = DIMS.filter((d) => tot[d] < 3);
        stage.querySelector('.sol-sum').textContent = low.length ? 'the block is short of ' + low.join(', ') + '.' : 'every commons is covered. the block can look after itself.';
        if (!low.length && !balanced) { balanced = true; k.act('commons', 2, 'rebuilt the block until every commons was covered (shade, water, food, repair, power)'); }
      };
      const showPick = () => {
        const cur = city[sel], b = SP[cur];
        pick.innerHTML = `<p><b>lot ${sel + 1} · ${b.n}</b> gives back: <em>${gives(cur)}</em>. ${b.t}</p><div class="sol-opts">${Object.keys(SP).filter((x) => x !== 'park' && x !== 'office' && x !== cur).map((x) => `<button data-b="${x}"><b aria-hidden="true">${SP[x].s}</b> ${SP[x].n} <small>${gives(x)}</small></button>`).join('')}</div>`;
        pick.querySelectorAll('button').forEach((o) => { o.onclick = () => {
          const was = city[sel]; city[sel] = o.dataset.b; draw(); showPick();
          k.act('build', 1, 'turned a ' + SP[was].n + ' into a ' + SP[o.dataset.b].n);
          lots[sel].focus();
        }; });
      };
      lots.forEach((l, i) => { l.onclick = () => { sel = i; lots.forEach((x) => x.setAttribute('aria-pressed', x === l ? 'true' : 'false')); showPick(); }; });
      draw();
    } };

  /* ---------- personal-web revival: a page you write yourself ---------- */
  const IW_BADGES = [['made', 'by hand'], ['no', 'tracking'], ['best viewed', 'with eyes'], ['rss', 'feed']];
  const IW_RING = ['~moss', '~paperlantern', '~longletter', '~tinkerbox', '~fieldradio'];
  const IW_START = '<h1>my small corner</h1>\n<p>i collect <b>train tickets</b> and old manuals.</p>\n<p>this page has no likes. write back.</p>';
  P.indieweb = { w: 580, html: (h) => `
    <header class="iw-top"><b>thirdspace.net</b><small>${h.title} · ${h.years} · a page is a place you build</small></header>
    <div class="iw-two">
      <section class="iw-ed"><label for="iw-src">index.html <small>(h1 p b i u hr br work)</small></label><textarea id="iw-src" spellcheck="false" rows="7">${h.e(IW_START)}</textarea>
        <label for="iw-now">/now</label><input id="iw-now" maxlength="80" placeholder="what you are doing these days" value="reading slowly, fixing a radio">
        <div class="iw-bdg" role="group" aria-label="88×31 buttons">${IW_BADGES.map((b, i) => `<button class="iw-88 iw-88-${i}" aria-pressed="false" data-i="${i}"><span>${b[0]}</span><span>${b[1]}</span></button>`).join('')}</div>
        <div class="iw-acts"><button class="iw-ring">join the webring</button><button class="iw-pub">publish</button></div>
      </section>
      <section class="iw-pre" aria-label="your page, as visitors see it"><div class="iw-url">thirdspace.net/<span class="iw-me"></span>/</div><div class="iw-out"></div><p class="iw-nowout"></p><div class="iw-shown"></div><nav class="iw-nav" hidden></nav></section>
    </div>
    <section class="iw-mem"><h4>members · recently updated, by hand</h4><ul aria-live="polite">
      <li><b>~moss</b> <span>pressing ferns, again</span> <time>2 days ago</time></li><li><b>~longletter</b> <span>a new page about envelopes</span> <time>last week</time></li><li><b>~fieldradio</b> <span>fixed the guestbook</span> <time>in march</time></li>
    </ul></section>
    ${h.note('The members and sites here are invented. A retro look is not the same as an independent practice: the point is owning the page.')}`,
    run(stage, k) {
      const me = '~' + ((k.handle || 'anon').toLowerCase().replace(/[^a-z0-9]/g, '') || 'anon');
      const src = stage.querySelector('#iw-src'), now = stage.querySelector('#iw-now'), out = stage.querySelector('.iw-out');
      const on = new Set(); let wrote = false, ringed = false, pub = null, ri = 0;
      stage.querySelector('.iw-me').textContent = me;
      // a tiny, safe subset of html: everything is escaped, then only bare tags from the allowlist come back
      const render = () => {
        out.innerHTML = k.esc(src.value).replace(/&lt;(\/?)(h1|h2|p|b|i|u|em|strong|small)&gt;/g, '<$1$2>').replace(/&lt;(hr|br)\s*\/?&gt;/g, '<$1>');
        stage.querySelector('.iw-nowout').textContent = now.value.trim() ? 'now: ' + now.value.trim() : '';
        stage.querySelector('.iw-shown').innerHTML = [...on].sort().map((i) => `<span class="iw-88 iw-88-${i}" aria-label="${IW_BADGES[i].join(' ')}"><span>${IW_BADGES[i][0]}</span><span>${IW_BADGES[i][1]}</span></span>`).join('');
      };
      src.addEventListener('input', () => { render(); if (!wrote) { wrote = true; k.act('write', 1, 'wrote their own page by hand'); } });
      now.addEventListener('input', render);
      stage.querySelectorAll('.iw-bdg button').forEach((b) => { b.onclick = () => {
        const i = +b.dataset.i, add = !on.has(i); add ? on.add(i) : on.delete(i); b.setAttribute('aria-pressed', add);
        render(); if (add) k.act('badge', 0.5, 'added an 88×31 “' + IW_BADGES[i].join(' ') + '” button');
      }; });
      const nav = stage.querySelector('.iw-nav');
      const drawRing = () => { nav.innerHTML = `<button data-d="-1" aria-label="previous site in the ring">←</button> <span>webring: <b>${IW_RING[ri]}</b></span> <button data-d="1" aria-label="next site in the ring">→</button>`;
        nav.querySelectorAll('button').forEach((b) => { b.onclick = () => { ri = (ri + IW_RING.length + +b.dataset.d) % IW_RING.length; drawRing(); nav.querySelector(`[data-d="${b.dataset.d}"]`).focus(); }; }); };
      stage.querySelector('.iw-ring').onclick = (e) => {
        if (ringed) return; ringed = true; nav.hidden = false; drawRing(); e.target.textContent = 'in the webring ✓';
        k.act('ring', 1, 'joined a webring, linking to their neighbours by hand');
      };
      stage.querySelector('.iw-pub').onclick = (e) => {
        const ul = stage.querySelector('.iw-mem ul'), line = now.value.trim() || 'a new page';
        if (!pub) { pub = document.createElement('li'); pub.className = 'iw-you'; ul.prepend(pub); k.act('publish', 2, 'published a hand-made page at thirdspace.net/' + me); }
        pub.innerHTML = '<b>' + k.esc(me) + '</b> <span>' + k.esc(line) + '</span> <time>just now</time>';
        e.target.textContent = 'publish again';
      };
      render();
    } };

  /* ---------- lo-fi reverie: slow.network ---------- */
  const LF = [
    { n: 'kitchen window', by: '~juniper', p: ['frost on the inside of the glass this morning. the kettle took forever.', 'a pigeon sat on the sill for the whole of breakfast.', 'nothing happened today. the light was nice around four.'] },
    { n: 'bus 41, notes', by: '~ottoline', p: ['the driver waved at another driver. counted four waves today.', 'someone left a paperback on the back seat. i left it there too.', 'missed my stop on purpose. it was raining nicely.'] },
    { n: 'bucket garden', by: '~wren', p: ['the basil came back. i did nothing.', 'three tomatoes. one was eaten by something small.', 'repotted the mint into a bigger bucket. it is winning.'] },
    { n: 'expired film', by: '~halide', ph: 1, p: ['roll 9 back from the lab. half of it is light leaks. keeping all of it.', 'a blurry one of the stairwell. i like it more than the sharp ones.', 'out of film until payday.'] },
  ];
  P.lofi = { w: 560, html: (h) => `
    <header class="lf-head"><h3>slow.network</h3><small>${h.title} · ${h.years} · chronological · no counts · nothing recommended</small></header>
    <section class="lf-dir"><h4>directory <small>(you subscribe by hand; nothing is suggested)</small></h4>
      <ul>${LF.map((s, i) => `<li><span><b>${s.n}</b> ${s.by}</span><button class="lf-sub" data-i="${i}" aria-pressed="false">subscribe</button></li>`).join('')}</ul></section>
    <section class="lf-feed"><h4>your feed <small>(newest first, strictly by time)</small></h4>
      <ol class="lf-posts" aria-live="polite"></ol>
      <p class="lf-end">nothing yet. subscribe to someone, then wait: people post when they post.</p></section>
    ${h.note('“Lo-fi reverie” and “algorithm dropouts” are interpretive trend labels for a wish for slower online life, not one organised movement. Writers here are invented.')}`,
    run(stage, k) {
      const subs = new Set(), next = LF.map(() => 0), ol = stage.querySelector('.lf-posts'), end = stage.querySelector('.lf-end');
      let n = 0;
      const clock = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
      const left = () => [...subs].filter((i) => next[i] < LF[i].p.length);
      const post = (i) => {
        const s = LF[i], txt = s.p[next[i]++], li = document.createElement('li'), id = 'lf-r' + n++;
        li.innerHTML = `<header><b>${s.n}</b> ${s.by} · <time>${clock()}</time></header>${s.ph ? '<div class="lf-ph" aria-hidden="true"></div>' : ''}<p>${k.esc(txt)}</p>
          <div class="lf-do"><button class="lf-rb" aria-expanded="false" aria-controls="${id}">reply</button><button class="lf-bm" aria-pressed="false">bookmark</button></div>
          <form class="lf-rf" id="${id}" hidden><label class="lf-vh" for="${id}i">reply to ${s.by}</label><input id="${id}i" maxlength="120" placeholder="a few words, to them only"><button>send</button></form><ul class="lf-rs"></ul>`;
        ol.prepend(li);
        const rf = li.querySelector('form'), rb = li.querySelector('.lf-rb');
        rb.onclick = () => { rf.hidden = !rf.hidden; rb.setAttribute('aria-expanded', !rf.hidden); if (!rf.hidden) rf.querySelector('input').focus(); };
        rf.onsubmit = (e) => { e.preventDefault(); const v = rf.querySelector('input').value.trim(); if (!v) return;
          li.querySelector('.lf-rs').insertAdjacentHTML('beforeend', '<li>you: ' + k.esc(v) + ' <i>(only ' + s.by + ' sees this)</i></li>'); rf.reset(); rf.hidden = true; rb.setAttribute('aria-expanded', 'false');
          k.act('reply', 2, 'replied to a stranger’s post on “' + s.n + '”'); };
        const bm = li.querySelector('.lf-bm');
        bm.onclick = () => { const was = bm.getAttribute('aria-pressed') === 'true'; bm.setAttribute('aria-pressed', !was); bm.textContent = was ? 'bookmark' : 'bookmarked'; if (!was && !bm.dataset.did) { bm.dataset.did = 1; k.act('bookmark', 0.5, 'bookmarked a post from “' + s.n + '”'); } };
        end.textContent = left().length ? 'that is everything for now. more when they write it.' : 'you are caught up. the feed ends here.';
      };
      stage.querySelectorAll('.lf-sub').forEach((b) => { b.onclick = () => {
        const i = +b.dataset.i, add = !subs.has(i); add ? subs.add(i) : subs.delete(i);
        b.setAttribute('aria-pressed', add); b.textContent = add ? 'subscribed' : 'subscribe';
        if (add) { k.act('subscribe', 1, 'subscribed by hand to “' + LF[i].n + '”'); k.after(1500, () => { if (subs.has(i) && next[i] === 0) post(i); }); }
      }; });
      k.every(9000, () => { const l = left(); if (l.length) post(l[Math.floor(Math.random() * l.length)]); });
    } };

  /* ---------- internet obscura: obscura.index ---------- */
  const OB = {
    '012': { n: 'hotel-art spotters', d: 1, p: 'photograph the framed prints in hotel rooms and find the same print in other cities.', v: 'flash glare, beige walls, room numbers.', a: 'a shared list of identical prints', s: ['031', '047'], t: 'photo travel art' },
    '018': { n: 'transit-map redrawers', d: 1, p: 'redraw city transit maps, including for cities that never built a line.', v: '45° angles, coloured lines, dot stations.', a: 'versions, critiques, “fantasy maps”', s: ['064', '031'], t: 'maps design city' },
    '023': { n: 'lost-pet-poster archivists', d: 1, p: 'photograph and transcribe lost-pet posters before the rain takes them.', v: 'tape, tear-off phone tabs, felt pen.', a: 'transcriptions, outcomes where known', s: ['058', '071'], t: 'street paper archive' },
    '027': { n: 'lift-chime recordists', d: 1, p: 'record the chimes and voices of lifts, building by building.', v: 'brushed steel, button panels, floor numbers.', a: 'short sound files, floor plans', s: ['064', '089'], t: 'sound buildings recording' },
    '031': { n: 'duplicate-painting trackers', d: 2, p: 'follow one mass-produced painting through charity shops and house sales.', v: 'gilt frames, price stickers.', a: 'sightings, with dates and towns', s: ['089', '012'], t: 'art collecting' },
    '047': { n: 'key-fob collectors', d: 2, p: 'collect the plastic fobs that hotels and motels once hung on room keys.', v: 'diamond shapes, embossed numbers.', a: 'scans, return-postage notes', s: ['097'], t: 'collecting travel' },
    '058': { n: 'found-list readers', d: 2, p: 'collect shopping lists left in trolleys and read them closely.', v: 'receipt paper, pencil, crossings-out.', a: 'scans, handwriting notes', s: ['097', '023'], t: 'paper handwriting archive' },
    '064': { n: 'station-voice composers', d: 2, p: 'write and record announcements for transit maps that do not exist.', v: 'a calm voice, a two-note chime.', a: 'audio, scripts, imaginary timetables', s: ['089'], t: 'sound maps' },
    '071': { n: 'weather-diary keepers', d: 2, p: 'keep one line of weather per day, for years, and compare diaries.', v: 'ruled notebooks, temperatures in the margin.', a: 'diaries, cross-checks', s: ['097'], t: 'diary weather' },
    '089': { n: 'night-hum mappers', d: 3, p: 'record the low hum of buildings at night and map the frequencies.', v: 'spectrograms, a dark street, a pin.', a: 'a map of hums by street', s: ['097', '027'], t: 'sound city night' },
    '097': { n: 'the index of indexes', d: 3, p: 'a small group that catalogues other catalogues, and mostly argues about naming.', v: 'card drawers, numbers inside numbers.', a: 'a list of lists; a long thread about the word “niche”', s: ['012'], t: 'archive classification' },
  };
  P.obscura = { w: 580, html: (h) => `
    <div class="ob-tab">OBSCURA.INDEX</div>
    <div class="ob-sheet">
      <header class="ob-head"><small>ATLAS OF NICHE ONLINE COMMUNITIES · DRAFT ENTRIES</small><h3>${h.title}</h3></header>
      <form class="ob-find" role="search"><label for="ob-q">search the listed entries</label><span><input id="ob-q" maxlength="30" placeholder="e.g. sound, paper, maps"><button>search</button></span></form>
      <p class="ob-cnt" aria-live="polite"></p>
      <ul class="ob-list"></ul>
      <article class="ob-card" tabindex="-1" aria-live="polite" hidden></article>
      <p class="ob-path"></p>
    </div>
    ${h.note('Entries are invented examples. Deeper entries are not listed: they are reached only by reference, the way obscure communities are often found.')}`,
    run(stage, k) {
      const known = new Set(Object.keys(OB).filter((x) => OB[x].d === 1)), opened = new Set(), path = [];
      let q = '', deepest = 1;
      const list = stage.querySelector('.ob-list'), card = stage.querySelector('.ob-card');
      const draw = () => {
        const ids = [...known].sort().filter((x) => !q || (OB[x].n + ' ' + OB[x].p + ' ' + OB[x].t).toLowerCase().includes(q));
        list.innerHTML = ids.map((x) => `<li><button data-id="${x}"><small>No. ${x}</small> ${OB[x].n} <em>depth ${OB[x].d}</em></button></li>`).join('');
        list.querySelectorAll('button').forEach((b) => { b.onclick = () => open(b.dataset.id, false); });
        const hidden = Object.keys(OB).length - known.size;
        stage.querySelector('.ob-cnt').textContent = (ids.length ? ids.length + ' listed entr' + (ids.length === 1 ? 'y' : 'ies') + (q ? ' for “' + q + '”' : '') : 'no listed entry for “' + q + '”. some things are only reachable by reference.') + (hidden ? ' · ' + hidden + ' unlisted' : ' · every entry found');
      };
      const open = (id, viaLink) => {
        const e = OB[id], fresh = !known.has(id); known.add(id);
        if (!viaLink) path.length = 0; path.push(id);
        card.hidden = false;
        card.innerHTML = `<header><small>No. ${id} · depth ${e.d}</small><h4>${e.n}</h4></header><dl><dt>practice</dt><dd>${e.p}</dd><dt>visual language</dt><dd>${e.v}</dd><dt>artefacts</dt><dd>${e.a}</dd></dl>
          <p class="ob-see">see also: ${e.s.map((s) => `<button data-id="${s}">No. ${s}${known.has(s) ? '' : ' <i>(unlisted)</i>'}</button>`).join(' ')}</p>${fresh ? '<span class="ob-stamp">NEWLY FILED</span>' : ''}`;
        card.querySelectorAll('.ob-see button').forEach((b) => { b.onclick = () => open(b.dataset.id, true); });
        stage.querySelector('.ob-path').textContent = 'path: ' + path.map((x) => 'No. ' + x).join(' → ');
        if (!opened.has(id)) { opened.add(id); if (opened.size <= 3) k.act('open', 0.5, 'opened specimen card No. ' + id + ' (' + e.n + ')'); }
        if (viaLink && e.d > deepest) { deepest = e.d; k.act('deeper', 1.5, 'followed “see also” links to depth ' + e.d + ' of the atlas'); }
        draw(); card.focus();
      };
      stage.querySelector('.ob-find').onsubmit = (ev) => {
        ev.preventDefault(); q = stage.querySelector('#ob-q').value.trim().toLowerCase(); draw();
        if (q) k.act('search', 0.5, 'searched the atlas for “' + q + '”');
      };
      stage.querySelector('#ob-q').addEventListener('input', (ev) => { if (!ev.target.value.trim()) { q = ''; draw(); } });
      draw();
    } };
})();
