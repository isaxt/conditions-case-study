# Third Space — 0.11 notes

From the audit after playtest 2.

## New
- **Boot-up** (`js/core/boot.js`, `css/core/boot.css`). On open, a beige 1991 laptop powers on: blue LCD warms up, the BIOS counts memory, complains about the CMOS checksum, DOS starts, `dir` lists the family's files, someone types `www`, and the 1991 page appears. Click or any key skips. Off under `#quick`. All names (Hearth Computing, HearthDOS) are invented.
- **Pixel icons** (`js/core/pixicons.js`). Every desktop icon is redrawn as a 24×24 pixel sprite: the emoji is drawn small, snapped to a 32-colour palette, given hard edges and a dark outline, shown at 2× with nearest-neighbour scaling. Folder, computer, recycle bin and globe are hand-drawn.
- **Glitch & net art** rebuilt (`buildGlitch` in `js/features/cultures.js`). A picture you can really break (it corrupts the JPEG bytes, the way glitch artists do), a colour-shift slider, "use my drawing", "keep it". Under it, six real works with one-line descriptions: JODI, Vuk Ćosić, Olia Lialina, Alexei Shulgin, Takeshi Murata, Rosa Menkman. Check the wording against sources before showing it.
- **The threshold** (`js/features/threshold.js`). Clicking into 2030 from the archive: the desktop falls apart, the screen goes black, the computer reads back everything it catalogued about you, says two futures are loading, and you press and hold to go on.
- **Two new futures** (`js/features/future.js`, `css/features/future.css`), replacing "after AI / after the locks":
  - **autopilot (2030)**: the way it's been going, kept going. It runs your day, rewrites your memory in a corporate voice, regenerates what you lost as perfect copies nobody made, and keeps a version of you posting. Counters tick, a ghost cursor moves, nothing can be undone.
  - **the human web (2030 ▸▸)**: reached by "take the wheel back" (a second spectacle). Still full of AI, quantum and robots, working for people: what you lost comes back whole and signed, the feed ends, the helper asks first and marks its words, a robot fixes the old computer and shows its work, a note can only be given once.
- **2014** picture is dithered like a tumblr gif (ordered Bayer dither, SVG filter) with a faded tint, grain, light leak and vignette.

## Fixed / removed
- 1991 shows only the page: the effort meter, "what the metric saw", "things in 1991" and the cat are hidden.
- The rotating star is gone (and the sparkle glyph in AI UI is now ◇).
- Every window body has padding and scrolls; tall windows scroll instead of running off screen.
- "why i'm here / i haven't written this one yet", the "not mine" note and every "practice:" line are removed.
- Desktop icon labels wrap inside their tile ("weird core", "desktop core").
- Casual copy pass: era notes, mote, arrival card, transition scenes, fates, readme.
