# Prototype 0.10 — the catalog, built

Shared helpers for small features: `js/features/kit.js` (see DEV-API.md). Each group has its own JS, CSS and test.

## Visual techniques (js/features/studio.js · tests/studio.js)
| Tool | Years | What the visitor does | Argument |
| --- | --- | --- | --- |
| ASCII converter | 1991–93 | turns a picture, a kept drawing or typed words into text art | people drew with the only material they had |
| Dither lens | 1993–99 | drags a lens showing 16 or 2 colours, three dither methods | the look was the hardware's limit, made beautiful |
| Pixel-font signature | 1996–2008 | redraws the letters of their name on an 8×8 grid | your mark, not a font chosen from a list |
| Glitch a file | 2004–10 | edits real JPEG bytes and watches the picture break | breaking the tool on purpose was a creative act |
| Compression slider | 2010–16 | shares their drawing again and again; it rots | every share takes a little more away |
| Style prompt | 2024 | "make it look like 1996": the real effect beside a too-clean preset | the style survives as a preset; the limit is gone |

## The argument (js/features/argument.js · tests/argument.js)
- Say hi: the same task (tell a friend you're thinking of them) done the way each era did; a tally of keystrokes, choices and "% yours".
- Effort meter: counts keys and clicks per era (counts only); "frictionless" means fewer decisions were yours; theirs to set in 2030.
- Defaults room: each era's settings dialog, from "you decide" to "managed for you"; some switches resist, and say so.
- One sentence: their first answer as each era displays it (handwritten, templated, truncated, ranked, summarised, returned).
- What the metric saw: a click-through overlay of what each era measured (hits, clicks, time on site, predicted next action, nothing).

## Personal (journey.js)
Your year (birth year → the era you were ten, marked and greeted) · bring one real thing · two rooms built from the interviews · leave one thing, unsigned, for the next person at this computer.

## Whimsy (js/features/toys.js · tests/toys.js)
Desktop pet (ages 1996–2010; a re-engagement notification from 2014; comes back in 2030) · screensavers (become "are you still watching?" from 2014; in 2030 the screen just dims) · sound board (synthesised era noises) · chain letter (1999, returns in 2008, 2016, 2024, and as a record in 2030) · bug garden (a real grid game that shrinks each era and auto-solves in 2024; full size again in 2030).

## Fixes
Real product names in the 1993/1996 skins replaced with the invented ones (Wayfarer, Explora); tool windows stay on screen and clear of the 2024 ask bar; the bin's "still here" slip sits under windows; the 1999 search no longer scrolls sideways on phones; kit state defaults are deep-copied.
