/* E. online identities, fandoms, niche communities and music scenes
   Each world is the practice at the centre of its scene, not a palette:
     otherkin     a member-written FAQ and glossary; private journals you can see exist but not open
     witchhouse   a music archive you have to decode: symbol titles, slowed drones, an unlinked page
     soulbonders  a private-by-default archive; a vocabulary the community wrote; a drawer that defaults to "only me"
     healthgoth   a technical-sportswear spec sheet on a flat garment drawing; fabric swatches; a lookbook
     livingdolls  a fashion archive in illustrated doll boxes: open a box, read its label card, arrange a shelf
   All names, posts and handles are invented placeholders. */
(function () {
  const P = window.SC_PAGES;
  // a window that closes stops whatever it was doing (sound, timers that should not resume)
  const onClose = (k, fn) => new MutationObserver(() => { if (!k.win.classList.contains('open') || k.win.style.display === 'none') fn(); })
    .observe(k.win, { attributes: true, attributeFilter: ['class', 'style'] });
  // tabs: buttons with aria-selected, panes with data-p
  const tabs = (stage, pre, onShow) => {
    const bs = stage.querySelectorAll('.' + pre + '-tabs [role=tab]');
    bs.forEach((b) => { b.onclick = () => {
      bs.forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
      stage.querySelectorAll('.' + pre + '-pane').forEach((p) => { p.hidden = p.dataset.p !== b.dataset.t; });
      if (onShow) onShow(b.dataset.t);
    }; });
  };

  /* ---------- otherkin: fieldnotes.of.self ---------- */
  const OK_FAQ = [
    ['What does “otherkin” mean on this board?', 'People who identify as partly, or in some deep way, nonhuman. That is how most of us use the word. Some members would put it differently, and that is allowed here.'],
    ['Is this roleplay?', 'No. Roleplay is something you step into and out of. This board is for talking about identity and experience. Please don’t ask anyone to act it out.'],
    ['Is this a diagnosis, or a medical claim?', 'No. Nobody here is a doctor and this page doesn’t diagnose anyone. Members understand their experience in different ways: spiritual, psychological, both, or neither.'],
    ['Why does this board have its own FAQ?', 'Because no sign-up form had a field for this, and other sites wrote about us without asking. So we wrote our own page, and we keep rewriting it.'],
    ['Can I join?', 'You can read. Nobody here will tell you what you are, and nobody should decide that for you.'],
  ];
  const OK_WORDS = [
    ['kintype', ['what someone identifies as. the word for the “what”, not the “who”.', 'i don’t use it. i just say what i am, in a sentence.', 'can be more than one. can change over the years. no one checks.']],
    ['awakening', ['the slow part where you notice, then name it, usually over years.', 'i dislike this word. for me it felt more like remembering than waking.']],
    ['shift', ['a time when the nonhuman side feels stronger. mental, not physical.', 'some of us never have them, and that doesn’t make anyone less.']],
    ['phantom limbs', ['sensing a part you don’t physically have, like a tail or wings.', 'not everyone experiences these. please don’t ask people to prove it.']],
    ['otherhearted', ['a deep connection to something nonhuman, without identifying as it.', 'added to this page after a long thread in 2004. the thread is still open.']],
  ];
  const OK_WHO = ['tallgrass', 'fernfall', 'quietmoth', 'ashgrove', 'saltmarsh'];
  P.otherkin = { w: 580, html: (h) => `
    <div class="ok-ban"><i class="ok-moon" aria-hidden="true"></i><div><h3>fieldnotes.of.self</h3><small>a community board · written by its members · ${h.years}</small></div></div>
    <div class="ok-crumb">Index › Boards › <b>Read this first</b></div>
    <div class="ok-tabs" role="tablist" aria-label="board sections">
      <button role="tab" aria-selected="true" data-t="faq">read this first</button><button role="tab" aria-selected="false" data-t="words">our words</button><button role="tab" aria-selected="false" data-t="journals">journals</button>
    </div>
    <section class="ok-pane" data-p="faq">
      <p class="ok-mod">Pinned by the moderators. Answers are rewritten whenever members disagree with them.</p>
      ${OK_FAQ.map((q, i) => `<div class="ok-q"><button aria-expanded="false" aria-controls="ok-a${i}">${h.e(q[0])}</button><p id="ok-a${i}" hidden>${h.e(q[1])}</p></div>`).join('')}
    </section>
    <section class="ok-pane" data-p="words" hidden>
      <p class="ok-mod">Definitions written by members, not by a platform. Every version is kept, including the ones that disagree.</p>
      <div class="ok-words">${OK_WORDS.map((w, i) => `<div class="ok-w" data-i="${i}"><b>${w[0]}</b><p class="ok-def" aria-live="polite"></p><button class="ok-more">another member’s version</button></div>`).join('')}</div>
    </section>
    <section class="ok-pane" data-p="journals" hidden>
      <p class="ok-mod">Members kept journals here. The board shows that they exist, and nothing more: an entry is readable only by the person who wrote it.</p>
      <ul class="ok-jr">${['14 Mar 1999', '2 Jun 1999', '30 Oct 2001', '8 Jan 2003'].map((d) => `<li><span>journal entry · ${d}</span><em>🔒 only its writer</em></li>`).join('')}</ul>
      <p class="ok-mod">There is no field here for a species, a type or a label. You are a visitor; nobody will ask you to fill one in.</p>
    </section>
    <p class="ok-log" role="status">This board logs that you read. Never who you are.</p>
    <p class="ok-inv">Handles and posts on this page are invented placeholders, written for this prototype.</p>
    ${h.note('The vocabulary (kintype, awakening, shift, phantom limbs, otherhearted) was built on members’ own sites, mailing lists and FAQs. Its meanings vary from person to person.')}` ,
    run(stage, k) {
      let readFaq = false, readWords = false;
      tabs(stage, 'ok');
      stage.querySelectorAll('.ok-q button').forEach((b) => { b.onclick = () => {
        const a = b.nextElementSibling, open = a.hidden; a.hidden = !open; b.setAttribute('aria-expanded', open);
        if (open && !readFaq) { readFaq = true; k.act('read', 0.5, 'read the members’ FAQ (nothing about the reader was recorded)'); }
      }; });
      stage.querySelectorAll('.ok-w').forEach((el) => {
        const w = OK_WORDS[+el.dataset.i]; let n = 0;
        const show = () => { el.querySelector('.ok-def').innerHTML = '“' + k.esc(w[1][n]) + '” <i>— ' + OK_WHO[(n + +el.dataset.i) % OK_WHO.length] + ' · version ' + (n + 1) + ' of ' + w[1].length + '</i>'; };
        show();
        el.querySelector('.ok-more').onclick = () => {
          n = (n + 1) % w[1].length; show();
          if (!readWords) { readWords = true; k.act('read', 0.5, 'read more than one member’s definition of a word'); }
        };
      });
    } };

  /* ---------- witch house: witchhouse.fm ---------- */
  const WH = [
    { g: '▼†▲ ʜ0ʟʟ0ᴡ ᴄʜ0ɪʀ', d: 'hollow choir', by: '†∆†', t: '6:06', f: 55, key: '▲' },
    { g: '✝ɢʀ∆ᴠᴇ ʟɪɢʜᴛ✝', d: 'grave light', by: '◬◬', t: '4:44', f: 49, key: '▼' },
    { g: '☾ ᴍ1ʀʀ0ʀ ᴡ∆ᴛᴇʀ ☽', d: 'mirror water', by: '†∆†', t: '7:13', f: 41.2, key: '†' },
    { g: '⛧ ᴛᴇʟᴇᴘʜ0ɴᴇ ⛧', d: 'telephone', by: 'ᴠ ✟ ᴠ', t: '5:55', f: 46.2, key: '☾' },
    { g: '▲ꜱ ʟ0ᴡ ∆ꜱ ᴛʜᴇʏ ɢ0▼', d: 'as low as they go', by: '◬◬', t: '9:09', f: 36.7, key: '✝' },
  ];
  P.witchhouse = { w: 540, html: (h) => `
    <div class="wh-tri" aria-hidden="true"><i></i><b>⛧</b></div>
    <h3 class="wh-ttl">▲ ᴡɪᴛᴄʜʜ0ᴜꜱᴇ.ꜰᴍ ▲</h3>
    <p class="wh-meta">ᴀʀᴄʜɪᴠᴇ † ${h.years} † ɴ0 ꜱᴇᴀʀᴄʜ † ɴ0 ɪɴᴅᴇx</p>
    <p class="wh-help">The names are hard to type into a search box. Select a title to decode it; ▶ plays a slowed drone (quiet; synthesised here).</p>
    <ol class="wh-list">${WH.map((t, i) => `<li data-i="${i}"><button class="wh-play" aria-label="play ${h.e(t.d)}">▶</button><button class="wh-dec" aria-expanded="false"><span class="wh-g">${t.g}</span><span class="wh-d">${h.e(t.d)} <i>by ${t.by}</i></span></button><em>${t.t}</em></li>`).join('')}</ol>
    <div class="wh-path"><span>ᴘᴀᴛʜ</span><b class="wh-keys">${WH.map(() => '_').join(' ')}</b><button class="wh-door" hidden>enter ${WH.map((t) => t.key).join('')}</button></div>
    <p class="wh-say" aria-live="polite"></p>
    <section class="wh-hid" hidden tabindex="-1">
      <h4>/ ▲▼†☾✝ /</h4>
      <p>unlisted. no page links here; you got in by reading every title.</p>
      <p>tapes on this page went from one person to the next as private links. the scene was hard to find, and part of that was on purpose.</p>
      <p class="wh-inv">(invented archive: the tracks, artists and tapes here are placeholders.)</p>
    </section>
    ${h.note('Artists often used unicode symbols in names and titles, which made them hard to search for.')}`,
    run(stage, k) {
      const say = (s) => { stage.querySelector('.wh-say').textContent = s; };
      const keys = WH.map(() => '_'); let decoded = 0, found = false, drone = null, beat = null, playing = -1;
      const rows = stage.querySelectorAll('.wh-list li');
      const stop = () => {
        if (beat) { beat(); beat = null; }
        if (drone) { const { a, g, os } = drone, t = a.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); os.forEach((o) => o.stop(t + 0.7)); drone = null; }
        rows.forEach((r) => { r.classList.remove('on'); r.querySelector('.wh-play').textContent = '▶'; });
        playing = -1;
      };
      const play = (i) => {
        const a = k.audio(); if (!a) { say('no audio on this machine.'); return; }
        if (window.Sound && Sound.muted && Sound.muted()) { say('sound is muted on this computer.'); return; }
        const t = WH[i], now = a.currentTime;
        const g = a.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.02, now + 2.5);   // four voices summed: keep the mix well under 0.08
        const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380; f.Q.value = 7;
        const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 200; lfo.connect(lg).connect(f.frequency);
        const os = [1, 1.189, 1.498, 0.5].map((m, j) => {   // a minor chord, detuned, sliding slowly downward: slowed and pitched down
          const o = a.createOscillator(); o.type = j % 2 ? 'sawtooth' : 'triangle'; o.detune.value = (j - 1.5) * 8;
          o.frequency.setValueAtTime(t.f * 2 * m, now); o.frequency.exponentialRampToValueAtTime(t.f * 2 * m * 0.9, now + 20);
          o.connect(f); o.start(now); return o;
        });
        f.connect(g).connect(a.destination); lfo.start(now); os.push(lfo);
        drone = { a, g, os };
        beat = k.every(2200, () => k.tone(t.f, 1.4, 'sine', 0.05, t.f * 0.7));
        playing = i; rows[i].classList.add('on'); rows[i].querySelector('.wh-play').textContent = '■';
        say('playing ' + t.d + ' · slowed · ' + t.t);
      };
      rows.forEach((r) => {
        const i = +r.dataset.i, dec = r.querySelector('.wh-dec');
        r.querySelector('.wh-play').onclick = () => {
          const was = playing; stop(); if (was === i) { say('silence.'); return; }
          play(i); if (!r.dataset.played) { r.dataset.played = 1; k.act('listen', 1, 'played a slowed drone from the archive (“' + WH[i].d + '”)'); }
        };
        dec.onclick = () => {
          const open = r.classList.toggle('dec'); dec.setAttribute('aria-expanded', open);
          if (!open || keys[i] !== '_') return;
          keys[i] = WH[i].key; decoded += 1;
          stage.querySelector('.wh-keys').textContent = keys.join(' ');
          say('decoded: ' + WH[i].d + '. a symbol joins the path.');
          if (decoded === 1) k.act('decode', 1, 'decoded a track title written in symbols');
          if (decoded === WH.length) { const d = stage.querySelector('.wh-door'); d.hidden = false; say('the path is complete. a door appears.'); }
        };
      });
      stage.querySelector('.wh-door').onclick = () => {
        const s = stage.querySelector('.wh-hid'); s.hidden = false; s.focus();
        if (!found) { found = true; k.act('find', 2, 'found the unlisted page by decoding every title'); }
      };
      onClose(k, stop);
    } };

  /* ---------- soulbonders: character_archive ---------- */
  const SB_ITEMS = [
    ['letter', '1 Feb 2011'], ['memory', '19 Apr 2011'], ['reference card', '3 Sep 2012'], ['note', '22 Dec 2013'],
  ];
  const SB_WORDS = [
    ['soulbond', 'a character, or someone else, experienced as sharing your headspace with a will of their own. our word; not everyone here uses it the same way.'],
    ['headspace', 'the inner place where that happens. some describe a house, some a landscape, some nothing visual at all.'],
    ['bondmate', 'one of the people in a soulbond, said with affection. some prefer other words.'],
    ['plural', 'a wider community some soulbonders also belong to, and some don’t. we link to each other’s FAQs and don’t speak for each other.'],
  ];
  P.soulbonders = { w: 560, html: (h) => `
    <div class="sb-sky" aria-hidden="true"></div>
    <header class="sb-head"><span class="sb-lock">🔒 private by default</span><h3>character_archive</h3><small>${h.title} · ${h.years} · a sample archive (invented)</small></header>
    <div class="sb-tabs" role="tablist" aria-label="archive sections">
      <button role="tab" aria-selected="true" data-t="arch">the archive</button><button role="tab" aria-selected="false" data-t="words">words we made</button><button role="tab" aria-selected="false" data-t="drawer">your own drawer</button>
    </div>
    <section class="sb-pane" data-p="arch">
      <p class="sb-p">This archive belongs to an invented keeper. Everything in it is sealed unless the keeper chose otherwise. As a visitor you see what they chose to show: the dates, and one open letter.</p>
      <ul class="sb-items">${SB_ITEMS.map((x) => `<li><span>${x[0]}</span><time>${x[1]}</time><em>sealed by its keeper</em></li>`).join('')}
        <li class="sb-open"><span>open letter</span><time>5 May 2014</time><div><p>To anyone who found this page: a lot of what I keep here is private, and that is the point. The notes are not for proving anything. If you have questions, the community’s own FAQ is a better place to start than a search engine.</p><p class="sb-sig">— the keeper (invented)</p></div></li>
      </ul>
    </section>
    <section class="sb-pane" data-p="words" hidden>
      <p class="sb-p">Profile pages had no field for any of this, so members wrote their own definitions and FAQs on personal sites and forums. These are placeholder versions in that spirit.</p>
      <dl class="sb-dl">${SB_WORDS.map((w) => `<dt>${w[0]}</dt><dd>${h.e(w[1])}</dd>`).join('')}</dl>
    </section>
    <section class="sb-pane" data-p="drawer" hidden>
      <p class="sb-p">A drawer for anything you want to keep: a letter, a memory, a note. It starts private. Nothing you write here leaves this window.</p>
      <label class="sb-lab" for="sb-txt">your note</label>
      <textarea id="sb-txt" class="sb-txt" rows="3" maxlength="400" placeholder="write something to keep…"></textarea>
      <fieldset class="sb-vis"><legend>who can see it</legend>
        ${[['me', 'only me', 1], ['one', 'one person I choose'], ['board', 'the community board']].map((v) => `<label><input type="radio" name="sb-vis" value="${v[0]}"${v[2] ? ' checked' : ''}> ${v[1]}</label>`).join('')}
      </fieldset>
      <button class="sb-keep">keep in the drawer</button>
      <p class="sb-out" aria-live="polite">The drawer is empty. Visible to: no one.</p>
    </section>
    <p class="sb-refuse">This archive does not report to the receipt. Nothing you read or write here is catalogued.</p>
    ${h.note('Experiences differ across the community. This page is a design sketch of a private archive, not a description of any one person.')}`,
    run(stage, k) {
      // deliberately no k.act(): the receipt is the platform's catalogue, and this archive refuses it
      tabs(stage, 'sb');
      const kept = [];
      const who = { me: 'only you', one: 'one person you choose (nothing is sent: this is a prototype)', board: 'the community board on this page (nothing leaves it)' };
      stage.querySelector('.sb-keep').onclick = () => {
        const ta = stage.querySelector('.sb-txt'), t = ta.value.trim(); if (!t) { ta.focus(); return; }
        const v = stage.querySelector('input[name=sb-vis]:checked').value;
        kept.push(v); ta.value = '';
        const shown = kept.filter((x) => x !== 'me').length;
        stage.querySelector('.sb-out').textContent = kept.length + (kept.length === 1 ? ' thing' : ' things') + ' in the drawer. The last one is visible to ' + who[v] + '. ' + (shown ? shown + ' visible beyond you.' : 'None visible beyond you.');
      };
    } };

  /* ---------- health goth: body.system ---------- */
  const HG_SPEC = [
    { x: 50, y: 11, n: 'HOOD', s: 'Storm hood, laminated peak, one-hand drawcord adjuster.', c: '3-layer shell · taped seams' },
    { x: 53, y: 44, n: 'ZIP', s: 'Water-resistant centre-front zip, matte black puller, chin guard.', c: 'coil zip · bonded garage' },
    { x: 22, y: 50, n: 'PANEL', s: '3D spacer mesh under the arm and down the side, for airflow.', c: 'spacer mesh · 240 g/m²' },
    { x: 79, y: 34, n: 'TAPE', s: 'Reflective tape across the shoulder yoke and cuffs.', c: 'retro-reflective · heat-applied' },
    { x: 12, y: 86, n: 'CUFF', s: 'Bonded cuff with a thumb loop, no stitching at the edge.', c: 'laser-cut · bonded hem' },
  ];
  const HG_FAB = ['MATTE', 'MESH', 'REFLECTIVE'];
  P.healthgoth = { w: 580, html: (h) => `
    <header class="hg-head"><small>BODY.SYSTEM — TECHNICAL OUTERWEAR — ${h.years}</small><h3>SHELL / 01</h3><div class="hg-sl" aria-hidden="true"></div></header>
    <div class="hg-grid">
      <figure class="hg-fig">
        <svg viewBox="0 0 300 300" role="img" aria-label="technical flat drawing of a hooded shell jacket, front view">
          <defs>
            <pattern id="hg-mesh" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#101114"/><circle cx="3.5" cy="3.5" r="1.6" fill="#4b5056"/></pattern>
            <clipPath id="hg-clip"><path d="M110 58 Q150 8 190 58 L196 70 L250 92 L286 250 L254 258 L226 140 L222 286 L78 286 L74 140 L46 258 L14 250 L50 92 L104 70 Z"/></clipPath>
            <linearGradient id="hg-refl" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#5d666d"/><stop offset=".45" stop-color="#e7e8ea"/><stop offset=".55" stop-color="#8A9DA8"/><stop offset="1" stop-color="#34383D"/></linearGradient>
          </defs>
          <g class="hg-shell" stroke="#E7E8EA" stroke-width="1.6" stroke-linejoin="round">
            <path d="M110 58 Q150 8 190 58 L196 70 L250 92 L286 250 L254 258 L226 140 L222 286 L78 286 L74 140 L46 258 L14 250 L50 92 L104 70 Z"/>
            <path d="M118 66 Q150 30 182 66" fill="none"/><path d="M150 52 L150 286" fill="none" stroke-dasharray="3 2"/>
            <path d="M88 200 L132 200 L132 236 L88 236 Z M168 200 L212 200 L212 236 L168 236 Z" fill="none"/>
            <path d="M58 100 L74 140 M242 100 L226 140" fill="none"/>
          </g>
          <g class="hg-tape" stroke="none"><path d="M104 82 L196 82 L198 92 L102 92 Z"/><path d="M18 236 L46 242 L44 250 L16 244 Z M282 236 L254 242 L256 250 L284 244 Z"/></g>
          <path class="hg-sheen" clip-path="url(#hg-clip)" d="M0 0 L40 0 L-60 300 L-100 300 Z" fill="rgba(255,255,255,.35)"/>
        </svg>
        ${HG_SPEC.map((s, i) => `<button class="hg-pin" style="left:${s.x}%;top:${s.y}%" aria-label="${String(i + 1).padStart(2, '0')} ${s.n}" aria-pressed="false" data-i="${i}">${String(i + 1).padStart(2, '0')}</button>`).join('')}
      </figure>
      <div class="hg-spec" aria-live="polite"><b>SPEC SHEET</b><p>Select a numbered callout on the drawing.</p></div>
    </div>
    <div class="hg-row"><span class="hg-lbl">SHELL FABRIC</span>${HG_FAB.map((f, i) => `<button class="hg-fab" aria-pressed="${i ? 'false' : 'true'}" data-f="${f}">${f}</button>`).join('')}</div>
    <div class="hg-row"><button class="hg-file">FILE TO LOOKBOOK</button><ol class="hg-book" aria-live="polite"></ol></div>
    ${h.note('A fashion and music aesthetic, mixing goth monochrome with technical sportswear. Not a fitness philosophy.')}`,
    run(stage, k) {
      const seen = new Set(), fabs = new Set(['MATTE']); let fab = 'MATTE', looks = 0, all = false, cur = -1;
      const spec = stage.querySelector('.hg-spec');
      const showSpec = (i) => { const s = HG_SPEC[i]; spec.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + ' / ' + s.n + '</b><p>' + k.esc(s.s) + '</p><small>' + k.esc(s.c).toUpperCase() + '</small><small>SHELL: ' + fab + '</small>'; };
      stage.querySelectorAll('.hg-pin').forEach((b) => { b.onclick = () => {
        const i = +b.dataset.i, s = HG_SPEC[i]; cur = i;
        stage.querySelectorAll('.hg-pin').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        showSpec(i);
        seen.add(i);
        if (seen.size === 1) k.act('spec', 1, 'read a technical spec callout (' + s.n.toLowerCase() + ')');
        if (seen.size === HG_SPEC.length && !all) { all = true; k.act('spec', 1, 'read the full spec sheet, all five callouts'); }
      }; });
      stage.querySelectorAll('.hg-fab').forEach((b) => { b.onclick = () => {
        fab = b.dataset.f; k.win.dataset.hgFab = fab.toLowerCase(); if (cur > -1) showSpec(cur);
        stage.querySelectorAll('.hg-fab').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        if (!fabs.has(fab)) { fabs.add(fab); k.act('fabric', 0.5, 'switched the shell fabric to ' + fab.toLowerCase()); }
      }; });
      k.win.dataset.hgFab = 'matte';
      stage.querySelector('.hg-file').onclick = () => {
        looks += 1; const li = document.createElement('li');
        li.textContent = 'LOOK ' + String(looks).padStart(2, '0') + ' · SHELL / 01 · ' + fab + ' · BLACK';
        const ol = stage.querySelector('.hg-book'); ol.prepend(li); while (ol.children.length > 3) ol.lastChild.remove();
        k.act('lookbook', 1, 'filed a look to the lookbook (' + fab.toLowerCase() + ' shell)');
      };
    } };

  /* ---------- living dolls: porcelain.studio ---------- */
  const LD = [
    { n: 'tea-party dress', c: '#F3D9DF', f: 'cotton lawn, pintucked bodice', e: 'Victorian reference', m: 'lace gathered by hand at the collar. three fittings.' },
    { n: 'high-collar blouse', c: '#FFF7F0', f: 'ivory silk-satin, puff sleeve', e: 'Edwardian reference', m: 'the “porcelain” look is mostly the matte finish of the fabric.' },
    { n: 'ribbon pinafore', c: '#B8A5C9', f: 'linen, grosgrain ribbon ties', e: '1950s storybook reference', m: 'the bow is tied, then stitched, so it stays symmetrical.' },
    { n: 'lace capelet', c: '#E8DCCB', f: 'cotton bobbin lace', e: '1880s reference', m: 'cut from a curtain end found at a market.' },
    { n: 'velvet headbow', c: '#A65F75', f: 'velvet on a hair comb', e: '1960s reference', m: 'wired inside so it keeps its shape all day.' },
  ];
  P.livingdolls = { w: 560, html: (h) => `
    <div class="ld-top"><b>PORCELAIN.STUDIO</b><small>a fashion archive in doll boxes · ${h.years}</small></div>
    <p class="ld-intro">Each piece is kept in an illustrated box. Open one to read its label card, then place it on the display shelf.</p>
    <div class="ld-boxes">${LD.map((d, i) => `<button class="ld-box" data-i="${i}" aria-pressed="false" style="--g:${d.c}"><span class="ld-win" aria-hidden="true"><i class="ld-hang"></i><i class="ld-gar ld-g${i}"></i></span><span class="ld-name">No. 0${i + 1}<br>${h.e(d.n)}</span></button>`).join('')}</div>
    <div class="ld-card" aria-live="polite"><p class="ld-empty">No box open.</p></div>
    <div class="ld-shelf-h">THE DISPLAY SHELF <small>(four places)</small></div>
    <ol class="ld-shelf" aria-live="polite"></ol>
    <p class="ld-foot">The box is a display format, not a person. Pieces and makers are invented.</p>
    ${h.note('Living dolls is a label that covers different communities; it says nothing about any one person.')}`,
    run(stage, k) {
      const shelf = [], opened = new Set(); let cur = -1, moved = false;
      const card = stage.querySelector('.ld-card'), sh = stage.querySelector('.ld-shelf');
      const drawShelf = () => {
        sh.innerHTML = [0, 1, 2, 3].map((s) => {
          const i = shelf[s];
          return i == null ? '<li class="ld-slot"><span>empty</span></li>'
            : `<li class="ld-slot full" style="--g:${LD[i].c}"><i class="ld-mini" aria-hidden="true"></i><span>${k.esc(LD[i].n)}</span><span class="ld-mv"><button data-s="${s}" data-d="-1" aria-label="move ${k.esc(LD[i].n)} left"${s ? '' : ' disabled'}>◀</button><button data-s="${s}" data-d="1" aria-label="move ${k.esc(LD[i].n)} right"${s < shelf.length - 1 ? '' : ' disabled'}>▶</button></span></li>`;
        }).join('');
        sh.querySelectorAll('.ld-mv button').forEach((b) => { b.onclick = () => {
          const s = +b.dataset.s, t = s + +b.dataset.d; [shelf[s], shelf[t]] = [shelf[t], shelf[s]]; drawShelf();
          const nb = sh.querySelector(`.ld-mv button[data-s="${t}"][data-d="${b.dataset.d}"]`) || sh.querySelector(`.ld-mv button[data-s="${t}"]`); if (nb && !nb.disabled) nb.focus();
          if (!moved) { moved = true; k.act('arrange', 1, 'rearranged the display shelf by hand'); }
        }; });
      };
      const drawCard = () => {
        const d = LD[cur], on = shelf.includes(cur);
        card.innerHTML = `<h4>No. 0${cur + 1} · ${k.esc(d.n)}</h4><dl><dt>fabric</dt><dd>${k.esc(d.f)}</dd><dt>era</dt><dd>${k.esc(d.e)}</dd><dt>maker’s note</dt><dd>“${k.esc(d.m)}”</dd></dl><button class="ld-place">${on ? 'take off the shelf' : 'place on the shelf'}</button><span class="ld-msg"></span>`;
        card.querySelector('.ld-place').onclick = () => {
          const at = shelf.indexOf(cur);
          if (at > -1) shelf.splice(at, 1);
          else if (shelf.length >= 4) { card.querySelector('.ld-msg').textContent = 'the shelf is full. take something off first.'; return; }
          else { shelf.push(cur); k.act('shelf', 1, 'placed the “' + d.n + '” on the display shelf'); }
          drawShelf(); drawCard(); card.querySelector('.ld-place').focus();
        };
      };
      stage.querySelectorAll('.ld-box').forEach((b) => { b.onclick = () => {
        cur = +b.dataset.i;
        stage.querySelectorAll('.ld-box').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        drawCard();
        if (!opened.has(cur)) { opened.add(cur); k.act('open', 0.5, 'opened doll box No. 0' + (cur + 1) + ' and read its label card'); }
      }; });
      drawShelf();
    } };
})();
