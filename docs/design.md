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

**Owner, group and everyone else** (Jelly Shell 2 and Security) always use the same three colours, in pictures and in `ls -l`:

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

- **Desktop or tablet only, at least 900 × 560.** Smaller windows show a friendly "needs a bigger screen" notice instead. A phone layout isn't built yet.
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
| **▶ program** | a file that has an `x` key, in Jelly Shell 2 |
| the keys you hold, like `r w -` | only once "Read the locks" has been taught (`taught('locks')`); a grey `-` means no key |

There is no padlock, because it could mean "can't read" or "can't change". Clicking a folder types its `cd` command for you.

## Motion and sound

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
