# Prototype 0.9 — period apps, and a more visual future

## Period apps (js/features/apps.js, css/features/apps.css, tests/apps.js: 20 checks)
Icons sit in a third column on the desktop, only in the years each app existed. All names are invented (no real product names or logos).
- **the web** (1993–2030): one browser whose frame and search change with the era. Type anything.
  1993 a hand-kept "What's New" list, no search · 1996–99 the "Seeker!" portal and home pages under construction ·
  2004–08 clean search, blogs, forums, a game that needs a plug-in (sponsored links from 2006) ·
  2010–16 autocomplete, ads on top, "personalised for you", people-also-ask · 2024 an AI overview on top, a paywall below ·
  2030 "you don't search here": it hands over to the agent. From 2010 each search is written to the receipt.
- **paint** (1993–2010): pencil, brush, spray, fill, eraser, line, box, oval, 20 colours, undo.
- **kid stamps** (1996–2010): rainbow, bubbles and drip brushes, stamps, a mixer, BOOM to clear, OOPS to undo.
- "keep it" turns a drawing into one of the visitor's own things (a small thumbnail, local only), so it can be carried, lost and handed back in 2030.

## The two speculative steps, made visual (js/features/future.js, css/features/future.css)
- After AI: an aurora scene where the screen assembles itself from the three carried things (its layout and colour change with what they kept most); the dial is a segmented control; each errand is a small trip there and back with an "as you / as agent" stamp; provenance is drawn as a chain with a broken link.
- After the locks: five padlocks shake open over a moving lattice (they close again, glowing, once everything is re-sealed); re-sealed rows get a lattice texture; the read-once note is an iridescent envelope; the cats are joined by two waves that settle when you look.

## Hosting
Plain HTML/CSS/JS is still the right choice: no build step, opens from a folder, and any static host serves it (drag the folder onto Netlify, or GitHub Pages). Move to something else only when you need visitors' data to be shared between browsers; then add a small backend, not a rewrite.
