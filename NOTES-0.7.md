# Prototype 0.7 — a computer you can only keep three things from

Adds a journey layer on top of 0.6. The written breakdown (what, why, trade-offs) is the Claude Doc "Third Space 0.7 — what changed and why". This file is the short technical version.

## New files
- `js/content/eras.js` — ALL wording (stand-ins): CFG, arrival, 38 things over 12 eras, 5 scenes, fates, 4 stand-in profiles, 3 Nous questions, 3 polish rules.
- `js/features/journey.js` — arrival, things window, scenes, keep-three, four fates, going back, reveal, export/erase, 2024 suggestion / 2030 question.
- `css/features/journey.css` — styling, plus the 2024 "why is not shown" rule.
- `tests/journey07.js` — 34 checks (`node tests/journey07.js`).

## Small patches to 0.6 files
`store.js` (destroyAll also erases the journey), `lenses.js` (shows a thing's context), `viewer.js` (type "thing" + fate banner), `index.html` (links).

## Switches (js/content/eras.js → CFG)
`keep` (3), `perTransition` (true), `allowBack` (true, informational), `anchors`, `opaqueFrom` (2024).

## Behaviour notes
- Auto-start is off under `#quick`; add `#journey` to turn it on in a quick URL.
- Journey data lives in localStorage key `thirdspace.journey.v1`; nothing leaves the browser.
- Scenes wait for an era's splash/login ritual to finish.
- Everything is a stand-in until you replace it. No quotes are used.

## 0.7.1 — worlds and personality (Nov 11)

### Field-guide worlds
All 33 aesthetic windows were rebuilt around the practice at the centre of each scene (nightcore speeds up a track, vaporwave slows one down, the backrooms let you walk until the directory stops making sense, studyblr runs a study session with a plant). The old shared trio (palette swatches, asset chips, glossary) is no longer the default anywhere.
- Contract: `SC_PAGES[id] = { w, html(h), run(stage, k) }`. `h.note()` adds the field note (the archive layer). `k` gives `act`, `every`, `after`, `onClose`, `audio`, `tone`, `handle` (see the comment above `kit()` in `js/features/subcultures.js`).
- Shared fixes: a world's look file now wins over palette-derived colours; each world sets its own width (`--sc-w`) past the global 540px cap; on phones mote's box steps aside while a world is open.
- Sound is synthesised in the browser, starts only from a click, stays quiet and stops when the window closes.
- Identity communities (otherkin, soulbonders) are read-only spaces in the community's own (placeholder) words; soulbonders deliberately logs nothing to the receipt and says so.
- Test: `node tests/worlds.js` (all 33 worlds, desktop + phone, no errors, no sideways scrolling).

### Journey personality
Arrival is a CRT that boots, with mote and a sticky note of what is kept. Each transition is staged in the look of the era it leads into with a small animated set (storm/server, velvet rope, glitter page into template, forum into feed, handwriting overwritten). Things are drawn as the objects they were; you drop three into a box; fates land as stamps; a "carrying" box sits on the desktop; "what it noticed" is a confidential file with your own sentence on a sticky note. New copy: `ARRIVAL.mote`, `ARRIVAL.sticky`, `SCENES[*].mote` in `js/content/eras.js`.

### To check
Field-note claims in the worlds (e.g. the backrooms' 2019 origin, art hoe's origins, seapunk's 2011 tag), and the invented names. The coquette notebook's ruled lines don't line up with its text yet.

## 0.7.2 — personal, and a little whimsical (Nov 12)

### One memory, one question (js/content/eras.js → MEMORIES)
Every era's "things here" tab opens with one specific memory paraphrased from the interviews (placeholders, not quotes: check each with the speaker) and the same question for the visitor. An answer becomes one of the visitor's own things.

### What you make is yours, and can be lost
Things made in the aesthetic windows (acts named in `MAKES`) and answers to the questions join the keep-three pool, marked "yours". If one is left behind mote says so. Fates apply to them: a displaced answer shows only how a system filed it (`flat`).

### The "yours" tab and 2030
"yours" lists everything the visitor wrote or made, as it stands in the current era. In 2030 everything comes back whole, signed and dated, and can be opened as a keepsake page. "what it noticed" now shows the visitor's words next to how they were filed.

### Hidden little things (js/features/whimsy.js)
1991–2010 hide small pointless interactions: a cat, a cloud that rains, a hit counter, an under-construction digger, a sparkle star, a marquee, a poke, photo filters, typed words ("hello" in 1991, "mote"). From 2014 there are none; the same corner asks for a star rating, as current interfaces do. In 2030 the visitor can hide a note that turns up in 1996. Finds live in `thirdspace.whimsy.v1` and are erased with the journey.

### Fixed
In 1991 the journey button, things window and pocket were hidden under the full-page 1991 document. They now sit above it.

### Tests
`node tests/personal.js` (23 checks). Disclosure on the arrival sheet was extended to cover answers and made things.
