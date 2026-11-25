# Third Space — notes for adding a small feature

Static site, no build step: plain HTML/CSS/vanilla JS in IIFEs, classic script order (see the bottom of index.html). Open index.html via file://. Add `#quick` to skip slow intros. The page opens on a full-page 1991 document; call `setEra('1996')` to reach a desktop. Era keys: 1991 1993 1996 1999 2004 2006 2008 2010 2014 2016 2024 2030. `body` carries `era-<key>`; 2030 may also carry `pq` (second speculative step).

## Helpers: `window.TSKit` (js/features/kit.js — read its header)
era(), yr(), onEra(fn), esc(), win(id,title,width,bodyHTML), show/hide/isOpen/title, icon({id,glyph,label,from,to,open}), state(name,defaults)->{data,save()}, reduced(), say(text), tone(freq,secs,type,vol,toFreq).
Windows made with TSKit.win get class `window app-win`; era skins restyle every `button` inside windows, so scope your CSS as `html body #<your-win-id> ...` to win. The shared 1996–2030 skins change fonts and colours of windows: set your own explicitly.

## The visitor's own things: `window.Journey`
- `Journey.mine()` -> [{id, kind:'memory'|'made', era, title, line, img?}]  what they wrote or made (img = small data-URL thumbnail for drawings).
- `Journey.keepMine({ id, title, line, ctx, img? })` adds a made thing (it can then be carried, lost and handed back in 2030). Use ids like `Y-<feature>-<n>`.
- `Journey.answer(eraKey, text)`, `Journey.fateOf(id)` ('here'|'gone'|'degraded'|'gated'|'displaced'), `Journey.carrying()` -> ids, `Journey.byId(id)`, `Journey.eraOf(key).label`, `Journey.state()` (the whole record: .name, .kept, .lost, .polish, .mine, .log), `Journey.save()`, `Journey.open(tab)` (tabs: here, left, people, yours, noticed, log).
- `logReceipt(action, note)` writes a line to the site's receipt ("what the computer kept"). Use it only where a real system of that era would have logged the act (roughly 2008 onward).
- `window.Sound.on` is true when the visitor switched sound on. Never play sound otherwise; TSKit.tone already checks.

## Rules
- No libraries, no network, no external assets. Emoji, CSS, SVG and canvas only. Fonts: system fonts, or ones already loaded ('Caveat', 'VT323', 'Courier New').
- No real product names, logos or characters. Invent names. Invented people must read as invented.
- Local only: persist with TSKit.state (it is erased with the journey). Say on screen what is kept when you keep something the visitor typed or made.
- Accessible: real buttons, keyboard operable, visible focus, aria-live for changing text, respect TSKit.reduced(). Works at 390px wide with no sideways scrolling.
- Tone of the project: the historical eras (1991–2010) are playful and a bit silly; 2014–2024 behave accurately like current interfaces (no whimsy; the absence is the point); 2030 is speculative, calm, and hands things back. The project is not anti-technology: show the real gain, then what it asks for.
- Thesis: as digital environments optimise for efficiency, prediction and monetisation, connection, expression and authorship get removed, concealed or flattened. Can design recover them?
- Code style: 2-space indent, single quotes, template literals or string concat for markup, a header comment saying what the file does and what it keeps.
- Tests: Playwright + Chromium are installed (`require('playwright')`; do not install). See tests/apps.js for the pattern. Abort Google Fonts requests in tests (`page.route(/fonts\.g/, r => r.abort())`).
