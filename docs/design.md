# How the Jelly guides look

All five guides share one look, because they are built from one engine (see `architecture.md`). Changing a style in the engine changes every guide. Guide-specific styles live in each guide's own CSS file.

## Feel

Bright, chunky and friendly, like a toy box. Everything has a thick dark outline and a hard shadow, so it looks like something you could pick up. The jelly letters wobble and can be squished. Motion is bouncy but quick, and it never gets in the way of reading.

## Colour

Colours are CSS variables on `:root` in `src/engine/shell.html`.

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#24133b` | all text, outlines and shadows |
| `--ink-soft` | `#56467a` | secondary text |
| `--card` | `#ffffff` | cards and panels |
| `--sky` `--sun` `--lilac` `--mint` | `#d4eeff` `#fff0b3` `#eadcff` `#d8f6e4` | page and section backgrounds |
| `--berry` | `#ff4d6d` | highlights, emphasis in headings |
| `--lime` | `#62c934` | the main "carry on" button, success |
| `--lemon` | `#ffc61a` | ordinary buttons, chips, tips in the terminal |
| `--blue` `--orange` `--grape` | `#3a5bff` `#ff8a2b` `#9b5cff` | lesson colours, focus rings |
| `--term` `--phos` | `#06160c` `#4dff8b` | the terminal's background and prompt |

**Jelly colours** (`JELLY` in the engine): berry, lime, blue, lemon, orange, grape, in that order. Each lesson picks one as its colour. That colour is used for its jelly letters, its menu dot and its story button.

**Text in the terminal:**

| Kind of line | Colour |
|---|---|
| ordinary output | pale green |
| folders | light blue |
| errors | pink (`--err`) |
| tips | lemon |
| quiet notes ("You are now in ~") | grey-green |
| `Shelly:` | lilac, bold |
| "Try:" chips | lemon buttons you can click |

**Owner, group and everyone else** (Shell Jelly 2 and Security) always use the same three colours, in pictures and in `ls -l`:

| Keys | Colour in story pictures | Colour in the terminal |
|---|---|---|
| owner's | mint | green |
| group's | lemon | yellow |
| everyone else's | pink | blue |

The set of keys that applies to the person typing is underlined.

## Type

| Role | Font |
|---|---|
| Headings, buttons, the jelly letters | **Titan One** |
| Body text | **Lexend**, picked for reading ease |
| Code, the terminal, commands | **JetBrains Mono** |
| The old-computer screen in Backstage | **VT323** |

- All fonts come from Google Fonts. The jelly letters use a subset of Titan One built into each page (see `architecture.md`).
- **Ligatures are switched off everywhere.** JetBrains Mono normally joins symbols into single shapes (`>>`, `../`, `...`). Children copy exactly what they see, so every character must look like itself.
- Commands appear in `<code>`, keys in `<kbd>`, and the main key hint is the **Enter ↵** keycap.

## Shapes

| Element | Style |
|---|---|
| Panels and boxes (`.box`) | 4px ink border, 22px corners, `0 6px 0` ink shadow |
| Buttons (`.btn`) | 3px ink border, 14px corners, `0 4px 0` ink shadow; they press down when clicked |
| The main button (`.btn.go`) | lime |
| Chips and tags | pill-shaped, with a 2–3px border |

## Layout

- **Desktop or tablet only, at least 900 × 560.** Smaller windows show a friendly notice instead, with a **Show mobile slideshow** button: presenter mode's frames, tapped through (see architecture.md). The interactive guide on a phone isn't built yet.
- **One panel at a time:** Welcome, then the lessons, then "What I've learnt". The left menu (250px) is visible on Welcome and the recap. During lessons it slides away, and a tab on the left edge brings it back.
- **No scrolling.** Every panel must fit the window at every size from 900 × 560 up to 1920 × 1080. Text in areas marked `data-fit` shrinks a little (down to 56%) to fit. The terminal and the file tree may scroll inside their own boxes. `tests/fit.mjs` checks every panel and phase at five window sizes.
- **The lesson screen** has the jelly box in the top-left corner, with the title or the current mission step beside it. The work area sits below:
  - The story and "remember it" phases show text on the left and the picture on the right.
  - The mission phase shows the terminal on the left and the file tree (or browser, or git map) on the right.

  The footer holds Back, Start over (only once there is something to undo), the three phase pills and the main button.
- **Keys:**
  - **Enter** and **→** do what the main button does.
  - **←** goes back a phase in the same lesson.
  - Mid-mission, → says to finish first rather than leaving.
- **The end of a mission** keeps the last output on screen. The task card says the mission is done, and the main button becomes **Collect your jelly**. Only that button opens the "you earned a jelly" card.

## Story pictures

Each lesson's story phase has one picture, made in HTML and CSS rather than images, so it stays sharp at any size. Reuse these patterns before inventing a new one:

| Pattern | Class | Use it for |
|---|---|---|
| Labelled pieces | `.lsl` with `.pv` boxes, built by the `lab()` helper in Shell 2's `lessons.js` | taking something apart (a prompt, an `ls -l` line, a `chmod` command), with a small label under each piece |
| Before and after | `.tz-eq` rows | "you type this → this happens" |
| Folder tree | `.treeviz` | where things are |
| Table | `.terms` | words and their meanings, or the binary table |
| Mock tool | `.nanoviz`, `.grepviz`, `.pipeviz` | a small fake screen of the tool in use |

- Pictures must show real, specific things: the actual diary's `ls -l` line, not a made-up one.
- Never say "look at the picture" unless the picture shows exactly what the text describes.

## The file tree

| Marker | Meaning |
|---|---|
| **YOU ARE HERE** | the folder you are standing in |
| `~ home` and `the very top` | home and `/` |
| **▶ program** | a file that has an `x` key, in Shell Jelly 2 |
| padlocks for the keys you're missing | Shell Jelly 2, only once "Read the locks" has been taught (`taught('locks')`). Padlock + eye: you can't read it. Padlock + pencil: you can't change it. Padlock + door: you can't go into this folder. A file with no `x` gets no padlock, because most files aren't programs |

A plain padlock is never used: it could mean "can't read" or "can't change", and testers asked which. Each padlock carries the thing you can't do, and the legend under the map says so. Clicking a folder types its `cd` command for you.

## The course map

- **In the side menu**, under the jar, a "Course map" lists every course with its step number. The current course is yellow and says "you are here"; finished ones are green with "✓ finished"; planned ones are faded and say "coming later". The others say what they come after.
- **On the welcome screen**, one line says which course comes first ("Comes after Shell Jelly 2 ✓").
- **At the end of a course**, the final card offers up to two next courses as yellow buttons, and "What I've learnt" repeats them. The next course is one that isn't finished and whose needs are met.
- **The landing page** opens with the everyday problems the courses fix, then the courses in order as a grid, each card labelled with its step ("Step 3 · either order" where two share one), then every lesson with the problem it solves.

- **What's in a course?** A `?` beside each course on the map opens a card: the course's one-line summary and every word it teaches, each with an example (from that course's "What I've learnt" page), and a link to open it. Planned courses show their short description.

## The Overview

- **One style, three worlds.** Shell Jelly's computer is a doll's house; Git Jelly's is a house whose lift tower reaches a see-through cloud (GitHub), with a friend's house next door; Web Jelly's is a little world: your house, the DNS owl's treehouse, a cut-open sea with the cable on its floor, and the server on the far shore.
- **A doll's house, cut open.** In Shell Jelly each layer of the computer is a floor: you and the terminal at the top (yellow), Shelly the shell (green), King Kernel on the ground floor (blue), the hardware in the cellar (orange). Floors stack, so nothing pokes into anything else, and each stop fills the frame, wide or tall.
- **Things you can follow.** What the course is about travels as jelly letters (the same font as the welcome letters): `ls` and its answer, `game.py`, `gerbil.zone`, its number, `GET /` and `200 OK`. Commits are photos. No tube, packets or blank sheets that need explaining.
- **See-through where it helps.** GitHub's cloud and the sea are see-through, so you can see GitHub's album and the cable on the sea floor.
- **The file tree is the roots**, growing down from the disk under the house, so "a tree that grows upside down" is something you see. `/` is berry, folders are lemon.
- **Characters have faces.** King Kernel is a gumdrop with a crown, eyes and a moustache; nothing but the terminal has a screen. Characters and travellers are rigid jelly that squashes when something reaches it; the house is toon with even ink outlines.
- **Signs** are painted on the back walls (floors and walls hide them); only speech bubbles float on top.
- **Its name.** "Overview", not "The whole game": a child doesn't know the teacher's phrase.

## The jelly jar

- **Every finished lesson earns a jelly with its own look:** classic, zebra, spotty, stripy, swirly, sprinkle, checked, two-tone, glitter, rainbow or galaxy, in the lesson's colour. The last lesson of a course gives a **golden** jelly. Each course starts at a different place in the list, so jellies from different courses look different.
- **The "you earned" card** names the look ("You earned the zebra `ls -l` jelly!"), shows that jelly, and has a **See it in my jar** link.
- **The shelf.** **My jelly jars** in the side menu opens a shelf with one jar per course, in course order. Each jar wears its course's lid colour and shows its jellies piled inside, with "7 of 15 jellies", "empty" or "coming later" underneath. Empty jars are a set waiting to be completed.
- **A jar** opens from the shelf, or from the card's link (that course's jar). It's a round sweet jar in the jelly style: see-through glass with a rainbow sheen, a white lip, a puffy berry lid that has popped off and bobs above it, and a lemon coaster. The jar is rigid; only the jellies wobble. Behind it, soft pastel rainbow swirls drift slowly (they stop when the computer asks for less motion). The jellies are the same soft bodies as the jelly letters, in the shape of the card's jelly, with their faces puffed into domes. Colours stay bright: the jar uses neutral tone mapping (the letters' filmic one washes bright colours out), very little sheen, and clear glass. Grab one and fling it, press **Shake it!**, or tap one to see its look, its word, the lesson, the course, what it does and an example.
- **The sweets in a jar are real jelly too:** see-through, with their look either as layers inside the jelly or as things suspended in it, like chocolate chips, sprinkles, glitter, stars or gold leaf.
- **Every course's jellies, everywhere.** Guides served from one website share them (the `jelly.collection` key), so the Shell 2 shelf shows the Git jar full too. Hosted one per page (claude.ai), each guide only sees its own, until the child loads a save file.
- **Save my jellies** downloads `my-jellies-<date>.json`: every jelly, every course's ticks and the course map. **Use my existing jellies** loads one back. It only ever adds (nothing is taken away), and then says "Welcome back!". Progress otherwise lives only in this browser, so this is how a child keeps it safe, moves to another computer, or fills the other jars on claude.ai.
- **Starting a course again** takes that course's jellies out of the jar, and nobody else's.
- While the jar is open, the jelly letters behind it pause, and keys stay in the jar (**Escape** closes it).
- A few seconds after the last drop, fling or shake, the jar settles and falls asleep: silent, and almost free for the computer. Bumps only make a sound when jellies really move into each other.

## Motion and sound

- **The jelly looks like jelly:** glossy, with window highlights, colour that deepens where it's thick and lightens at the edges, and a soft glow of its colour on the floor. Bright, saturated sweet colours, not pastels (see architecture.md, The jelly's look).
- Jelly letters drop in, wobble, hop when you get something right, and walk back to their places if knocked out of line. Thin letters have a heavier base so they stay upright (`tests/letters.mjs` checks this).
- Earning a lesson's jelly gives confetti, a sound, and the jelly flying into the jar.
- **Reduced motion** is respected. When the computer asks for less movement, there is no confetti and nothing flies to the jar. Panels and the file tree appear without sliding, and animations in the tours run faster. The jelly letters still wobble when touched.
- Sound can be turned off, and the choice is remembered.

## Words on screen

Write the way you'd talk to a bright 10-year-old:
- short sentences and UK spelling;
- one new idea per paragraph;
- a joke where it helps you remember.

See `pedagogy.md` for the teaching rules behind the words.
