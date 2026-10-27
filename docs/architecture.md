# How the Jelly guides are built

## The stack

- **One HTML file per guide.** Every guide is a single `index.html` with its CSS and JavaScript inside. There's no backend, no install and no bundler.
- **Three.js 0.186.1** loads from jsDelivr through an import map, for the 3D jelly letters and the 3D tours. **Google Fonts** supplies Titan One, Lexend, JetBrains Mono and VT323. Nothing else comes from the network.
- **Everything else is pretend and runs in the page:**
  - the computer, with its files, users and locks;
  - the shell;
  - the internet, with `jelly.fun`, DNS and HTTP;
  - GitHub and GitHub Pages.

  Web Jelly's browser shows pages in a sandboxed frame with scripts removed.
- **Progress is saved in the browser** (`localStorage`), one key per guide:

  | Guide | Key |
  |---|---|
  | Shell Jelly | `jellyshell.v1` |
  | Shell Jelly 2 | `jellyshell2.v1` |
  | Git Jelly | `jellygit.v1` |
  | Web Jelly | `jellyweb.v1` |
  | Security Jelly | `jellysecurity.v1` |

  If you change what's stored in a way old saves can't handle, bump the number.
- **The jelly physics** is a soft-body simulation ported from [Jelly Baby](https://github.com/scottstts/Jelly-Baby) by Scott Sun. That port is why the project is GPL-3.0.

## Inside a guide

Each guide is one `<script type="module">`, in these sections:

| Section | What it does |
|---|---|
| Jelly physics | `JellyBody` (one squishy letter) and `JellyStage` (a row of letters on a floor, with a camera, dragging, hopping and walking home) |
| 3D font | `makeLetter()` turns a glyph from the built-in font subset into a 3D shape |
| Overview | `Town`: the engine's original 3D tour. Shell Jelly, Git and Web replace it with the Overview (see below); Shell 2 and Security have none |
| Backstage | a command's journey, as shows you can replay (Shell, Git and Web only): the guide's Overview world up close (`Backstage` in its `overview.js`), hooked up by `engine/use-backstage.py` |
| The shell | **jellysh** (`src/shell/jellysh.js`), a self-contained module: the file tree, quoting, variables, wildcards, `;` `&&` `\|\|` `\|`, redirects, exit codes, the Unix commands, and people and locks. The page gets it as `SH`; `run(line)` is `SH.run(line)`, and `sh`, `find`, `pathOf` and the rest point at it. See `src/shell/README.md` |
| The pretend computer | the starting files (`seed()`), and Shelly's explanations (`explainPath`), which reach the shell through hooks |
| Terminal and file tree | typing, Tab, history, Ctrl keys, helper buttons, and drawing the tree |
| Lessons and progress | `LESSONS`, `check(event)`, the saved `store`, and `taught(concept)`, which says whether a concept's lesson has been reached |
| Panels and navigation | `PANELS`, `go()`, the Enter-means-carry-on handler (`primaryButton()`), `fitAll()` |
| One lesson at a time | `setPhase()`, `paintSteps()`, `showLesson()`, Start over. Each lesson's mission starts on a fresh sandbox (at home, starting files) unless it is already under way, so no lesson depends on where the last one ended. Git and Web turn this off (`FRESH_SANDBOX = false`): Git sets up each lesson from its `need`, and Web keeps the child's website |
| Recap | "What I've learnt", with its Test me mode |

## How the guides share code

All five guides come from one page. Shell Jelly is the **engine**, and every other guide is Shell Jelly with parts swapped out.

```
src/engine/shell.html            the original Shell Jelly page
   + src/engine/base-patch.py    engine changes every guide gets (layout, phases, Enter handling, …)
   + src/engine/shelly-patch.py  Shelly's explanations, Shell 1's path lessons and jelly hunt, later engine-wide fixes
   = build/jelly-shell.src.html  Shell Jelly, and the starting point for every other guide

build/jelly-shell.src.html
   + src/guides/git/build.py       → build/jelly-git.src.html
   + src/guides/web/build.py       → build/jelly-web.src.html
   + src/guides/shell2/build.py    → build/jelly-shell2.src.html
   + src/guides/security/build.py  → build/jelly-security.src.html
   + src/guides/shell/build.py     → build/jelly-shell1.src.html   (Shell Jelly itself: its Overview and Backstage king)

each *.src.html
   + the right jelly font subset (tools/inline-font.mjs)
   + a JavaScript syntax check (node --check)
   + a full HTML page wrapper
   = the guide's folder in the repo, for example jellyshell2/index.html
```

`src/build.sh` runs the whole chain. Each guide goes through `tools/seo.py` before it is wrapped (see Search engines below). The last steps write the landing page from `src/landing.html`, `src/curriculum.json` and `src/problems.json` (`tools/landing.py`), then stamp the version on it.

### The Overview: `engine/overview-kit.js` and each guide's `overview.js`

Shell Jelly, Git and Web each open with an Overview: a little 3D world in one style, where the thing the course is about travels from stop to stop.
- **Shell Jelly:** a computer cut open like a doll's house. You and the terminal at the top, Shelly the shell, King Kernel on the ground floor, the hardware in the cellar, and the file tree growing underground as roots. `ls` rides a lift down as jelly letters; the answer climbs back up as jelly words.
- **Git Jelly:** your computer is the house: your folder on the ground floor, the stage above it, the photo album (`.git`) at the top. The lift tower climbs past the roof into a see-through cloud where GitHub keeps its album, and a friend's house next door clones it. `game.py` travels as jelly letters; commits are photos.
- **Web Jelly:** your house (you at the browser upstairs, the router downstairs), the DNS owl's treehouse next door, the internet cable along the bottom of a cut-open sea, and the server on the far shore. `gerbil.zone`, `203.0.113.7`, `GET /` and `200 OK` all travel as jelly letters.

How it fits together:
- **The kit** (`engine/overview-kit.js`) has the look and the machinery: materials, rooms, the lift, you at your desk, grass, soil, trees and roofs, signs and speech bubbles, jelly words, the step timeline, the camera and the old-machine handling. A guide's `overview.js` defines `TOWN_STEPS` and its world: `const Town = overview((k) => ({ SHOTS, PLAY, reset, tick }))`. `engine/use-overview.py`, run by each of the three builds, swaps the engine's original 3D tour for the kit plus that world.
- **Same interface as the old tour.** `Town`, `TOWN_STEPS`, `step`, `active`, `tick(dt)`, `resize()` and `resetView()` work as before, so the stepper, presenter mode and the frame loop needed no changes. `go(i)` plays step `i` when it's the next one; any other jump replays every step from the start, rushed, so the world is always exactly where that step leaves it. While a step plays, the canvas has `data-playing`.
- **Steps.** Each step names the camera shot it starts on and the one it ends on (`shot`, `ends`); each shot is a box the camera fits, wide or tall. `PLAY[i]` is a short async script of tweens (`hop`, `along`, `pop`, the lift's `in` and `to`, `say`).
- **Look.** Buildings are toon with ink outlines of the same thickness everywhere; characters and travellers are rigid jelly (the welcome letters' material) that squashes and wobbles when poked. Eyes follow whatever is travelling.
- **Old machines.** Everything that never moves is merged into one mesh per material (Shell Jelly's 680 draw calls became under 300, counting the see-through pass). If the first two seconds average under 30 frames a second, the jelly stops being see-through, the costliest effect, and keeps its gloss and colour. In software rendering Shell Jelly's costs about half what the welcome screen's letters do.
- **On its own.** `python3 tools/overview-page.py shell|git|web [out.html]` writes one on a page of its own with Wide and Tall frames, for trying changes without the guide.

### The jelly's look: `jellyMaterial()` and `studio()` in `engine/shell.html`

Three things make the jelly read as jelly rather than pastel plastic. They're cheap on WebGL; none needs WebGPU (see `docs/plans/webgpu.md`).
- **Light to reflect.** `studio()` is three.js's soft `RoomEnvironment` plus a bright four-pane window behind the viewer and a smaller one to the left, baked once into the environment map. Every jelly carries crisp window highlights. The Overview kit uses the same light in the guides.
- **Colour that deepens through thick jelly.** `makeLetter()` works out, once per letter and size, how much jelly lies behind each vertex (`aThick`). `jellyMaterial()` feeds that to the see-through pass, with a light surface tint and a deep, saturated attenuation colour, plus an inner glow where it's thin and a rim. Tone mapping is Neutral: ACES greyed the colours. The jar's sweets add their pattern on top, and it colours the light through them too.
- **A coloured glow on the floor** under each letter, a cheap stand-in for light focused through it (caustics). The floor itself skips tone mapping, so it keeps its colour and fades into the page.

**Speed rule.** Every stage measures its first 120 frames after shader building. Under 30 a second, the see-through pass drops to half resolution. Over 55, the jelly also gets rainbow edges (dispersion), which read the see-through image three times and cost about a quarter of the frame on a slow machine. So old machines are no slower than before.

### Backstage: `engine/use-backstage.py`

Each guide with an Overview (Shell, Git, Web) builds its world twice from one function in its `overview.js`: `Town` for the Overview's steps and `Backstage` for its shows. The world returns `SCENES` (one async function per show) and a `START` shot, and the kit's `play(name)` resets the world and plays one from the start; picking another mid-show cuts straight to it. The kit also holds the shared cast: `robot()` and `character()` (a jelly body that pops and wobbles), `card()` (an answer to carry, big enough to read) and `settleTo()`.

`use-backstage.py` swaps the engine's old flip card for the 3D panel. The guide sets four things before running it: the panel's paragraph, the canvas's description for screen readers, what to pick ("a command", "an address") and the first show, which Enter plays and which is the only one shown until it has played. The house is built the first time the panel opens, so starting a guide doesn't pay for it.

### Jellies bumping into each other: `engine/collide-patch.py`

Each jelly collides as a body-centred lattice: its cage corners plus the centre of every cage cell (the average of the cell's 8 corners). Points of different jellies keep a gap of 0.62 of a cell. The biggest hole in that lattice is about 0.56 of a cell, so no point can squeeze through another jelly. With corners alone, the hole in the middle of a cage square was wider than the gap, and jellies sank into each other.
- **Sharing out a push.** A push on a centre point is shared out to its 8 corners by weight.
- **Only nearby points.** Only pairs whose boxes overlap are checked, and only the points inside the overlap.
- **No garbage.** The point arrays are made once per jelly and reused.
- **Quiet resting.** A bump only plays a sound or wakes a sleeping jelly when the two are moving into each other.

`tests/perf.mjs` measured it against the corners-only version: letters are unchanged within noise, and a settled jar costs about 2 ms per 3 s instead of 2,500–3,700 ms, because it now sleeps.

### The jelly jar: `engine/jar-patch.py`

Adds the jar to every guide.
- **Physics.** A bean shape for the soft bodies, coarser cages for small jellies (`opts.cells`), a tap hook (`onTap`), and resting on other jellies as well as the floor (`opts.restAnywhere`).
- **Rendering.** `JarStage`, a `JellyStage` with a round jar (the physics keeps jellies inside a circle, `bounds.r`) that doesn't tidy up or stand jellies back up. Its background is a sphere with a slow swirl shader instead of the grid floor, which becomes a shadow catcher. The jelly patterns are a small shader painted on each jelly's resting shape (`paintJelly`), so they squish with it. `bean()` draws the same looks in 2D for the cards.
- **The sweets** (`paintJelly`) are made like the jelly letters, see-through with deep colour, and also blend over what's behind them, because three.js's see-through pass never shows other see-through things (in a jar, usually another sweet). A look is either **layers in the jelly** (zebra, stripy, swirly, checked, two-tone, rainbow: the pattern colours the light passing through) or **bits suspended inside** (`BITS`: chocolate chips for spotty, sprinkles, glitter, stars for galaxy, gold leaf for golden). The bits are small instanced meshes bound to the jelly's cage like the eyes, so they ride its wobble and stretch with it; a sleeping jelly's bits aren't updated.
- **Data.** `collect()` keeps this course's finished lessons in `jelly.collection`, with each one's look and its recap line, so a jar in another course can label it.
- **Save files.** `saveJellies()` writes `{ kind: "jelly-save", version: 1, collection, courses, progress }`, where `progress` holds each known course's own store. On claude.ai the file goes through the viewer's `downloads` permission (`claude.use("downloads")`; the hosted guides are published with `capabilities: { downloads: true }`). Anywhere else it is an ordinary browser download.
  - **Loading** checks the file once at the boundary (`readSave`): only known courses, only lesson ticks, only `#rrggbb` colours and known looks.
  - **Merging** (`useSave`) adds to what is there, then reloads.

### Presenter mode: `engine/present-patch.py`

For recording videos. Open a guide with `?present` (16:9) or `?present=tall` (9:16), or press **Shift+P**: once for 16:9, again for 9:16, and a third time to go back to the course. Shift+P works without a reload, so it also works on claude.ai, where a link can't pass `?present` to the page.
- **Every guide.** Shell Jelly, Shell 2, Git, Web and Security all present, every lesson.
- **Keys.** Space or → next, ← back, Home and End, M for sound, and **Tab** hides or shows the Overview's card when it covers what the 3D scene is showing.
- **Jelly letters.** On a lesson's jelly word, the letters can be dragged with the mouse or a finger, and tapped to hop, as in the guides. The cursor stays hidden for recording, except as a grab hand over the letters.
- **Mobile slideshow.** Under 900 × 560 the guide itself doesn't run: the gate offers **Show mobile slideshow**, which is presenter mode with taps. It is 9:16 held upright and 16:9 sideways, with no space kept for a head shot. Tap the right two-thirds (or swipe left) to go on and the left third to go back; a touch that starts on a jelly letter drags it instead; ✕ returns to the gate. Like all presenting it saves nothing, which is why the gate says progress tracking is desktop only. A reload in the same tab comes back to the same frame.
- **Frames.** Each frame is one full-screen idea. Where a course has an **Overview** (the 3D town), its steps come first, with a short card saying where we are. Then a lesson's jelly word, its story, its picture, each point, then for every mission step the task (with the hat to wear, in Security), and whatever that step does:
  - the terminal: the command typed key by key, then its output;
  - nano (Shell 2);
  - a button pressed (GitHub's in Git, the browser's in Web);
  - the changed file, the change marked and typed in (Web's editor);
  - the browser: the address typed, the trip, the page;
  - a choice card picked, and what it says back (Security);
  - the file tree, or Git's map, with what changed marked.

  The course ends with its jar. (No "you earned" frames: nobody is earning anything in a video.)
- **Recorded, not acted live.** When presenting starts, the course runs once, silently, in the hidden app, from each lesson's demo (`src/guides/<guide>/demos.json`). The frames are recorded from what really happened, so **←** and **→** are instant and always agree. While recording, a pretend clock makes everything that waits (a browser's trip, ping's replies, a card's answer) happen at once, so a whole course records in seconds. Pages in Web's browser load for real, so recording waits for each one.
- **Nothing is saved.** Presenting never reads or writes anyone's progress.
- **Resume.** A reload comes back to the same frame.
- **Head shot.** The right-hand side (16:9) or the bottom (9:16) stays clear; `&face=none` uses the whole frame.
- **One lesson.** `&lesson=lsl` presents just that lesson: a Short.
- **Keys.** Space or **→** for the next frame, **←** for the previous one, Home / End for the first or last, M for sound.

`tests/present.mjs` checks, in every guide, that every demo finishes its mission, that the guide's own kinds of frame show, that ← then → comes back to the same frame, and that nothing is saved. It writes screenshots to `tests/out/present-*.png`.

### The course map: `src/curriculum.json`

One file says which courses exist and which must come first. Each course has an id, a title, its folder, the browser storage key it saves progress under, and `needs`: the courses that must be finished first (only the direct ones). A course with `"folder": null` is planned and shows as "coming later". The card fields (`cmd`, `blurb`, `button`, `colour`, `badge`, `pain`) are for the landing page. `lessons` names the file holding the course's `LESSONS`; `tagline` and `about` make its page title and search description. `site` (at the top) is the address the site is published at.

From it, the build makes:
- **the landing page** (`tools/landing.py`): the everyday problems the courses fix ("Sound familiar?"), the courses in order as a grid with each card's step on it, then every lesson with the problem it solves. Don't edit `index.html` by hand: edit `src/landing.html`, the curriculum or `src/problems.json`, then build;
- **the course map** in every guide's side menu (`engine/courses-patch.py`), with ticks for finished courses;
- **the "Comes after" line** on each welcome screen;
- **the next course** on a course's final card and on its "What I've learnt" page.

A course's step is one more than the step of the latest course it needs. `tools/curriculum.py` reads the file for both, and stops the build if a course needs one that doesn't exist, or is listed before a course it needs.

### Search engines: `tools/seo.py` and `src/problems.json`

Every page gets a title (`Git Jelly: learn git and GitHub`), a meta description, a link-preview card (Open Graph) and structured data (JSON-LD: a `Course` for each guide, an `ItemList` of them on the landing page). With `site` set in `curriculum.json` (`https://unixjelly.com/`), they also get canonical links, the home-screen icons and the preview picture, and the build writes `sitemap.xml` and `robots.txt` beside the landing page.

Search engines read pages as a phone does. On a phone a guide shows its gate, so the gate carries the real content: the course name, its blurb, the mobile slideshow button, and every lesson with the problem it solves. The landing page lists the same lessons.

**The icons and the preview picture** are rendered by the Overview kit itself, so they match the house style: the jelly kid for the browser tab and phone home screens, and the Overview house for link previews. `node tools/make-icons.mjs` (from `src/`, needs Python with Pillow) draws `tools/icon-page.html` and `tools/og-page.html` into `src/icons/`: `icon-32.png` (under 1 KB, put into every page as data so it works anywhere), `icon-180.png` and `icon-192.png` (home screens, about 5 KB each) and `og.jpg`. Run it only when they change. The build copies `src/icons/` into the site, and pages link to those files by their full address on `site`.

**Channel art** (YouTube, TikTok, Instagram, X and LinkedIn) is rendered by the guides' own jelly stage: `node tools/brand.mjs` (from `src/`, after `./build.sh`) writes `build/channel-art.html`: "Unix Jelly" in letters wearing the jar's looks, drawn live at each channel's size in three variations, with Save PNG at the exact size. The sizes and looks are listed at the top of the script; the page itself is `tools/channel-art.js`, added to the built Shell Jelly 2 page. `node tools/brand.mjs render` also saves every picture into `src/brand/` without a browser window (slow without a GPU; `ONLY='-a$'` renders one variation).

The problem lines live in `src/problems.json`, keyed by course and lesson id. `tools/lessons.cjs` reads each course's lesson ids straight from its `LESSONS`, and the build stops if a lesson has no line or a line has no lesson.

**Progress across courses.** Each guide also saves `{ done, total }` under one shared key, `jelly.courses`. Guides served from one website (the repo, GitHub Pages) share browser storage, so the map and the landing page can tick off other courses. Copies hosted one per page (such as claude.ai) each have their own storage, so there the map shows the order but only knows the current course's progress.

### How a patch works

The build scripts don't use a templating system. They edit the page with two small helpers:

- `rep(old, new)` replaces an exact piece of text. **That text must appear exactly once**, otherwise the build stops with an error that shows the text it couldn't find.
- `region(start, end, new)` replaces everything between two markers. Lessons, for example, go between `const isCmd = (e, c)` and `const ALL = [`.

This makes every guide's dependence on the engine explicit. If you change engine text that a guide patches, that guide's build fails loudly, in the right place, instead of silently doing something odd. Fix it by updating the `rep` in that guide's `build.py`.

**Order matters.** Engine changes go in `base-patch.py` or `shelly-patch.py`, so all guides inherit them. A guide's own changes go in its `build.py`, plus the separate files it reads in (`lessons.js`, its engine additions and its CSS).

*Why patches, rather than one clean engine?* History. Shell Jelly came first, and each later guide was built by changing a copy of it. A worthwhile clean-up would be to fold `base-patch.py` and `shelly-patch.py` into `shell.html`. The guide builds would keep working as long as the text they patch stays the same.

### The shell is shared by plugging in, not patching

No guide edits the shell. Each one plugs into it from its own engine file:
- **Its own commands**, with `SH.define()`: Git's `git`, Web's `curl`, `ping` and `nslookup`, Shell 2's `nano`, Security's `sign`.
- **Its people**, with `SH.configure({ users, gids })`. This is what switches on locks, in Shell 2 and Security.
- **Its teaching voice**, through hooks: Shelly's lock explanations, first-time tips, and rewording the shell's built-in tips.

The engine adds Shell Jelly's own voice in `src/engine/use-jellysh.py`. A guide that wants to build on it keeps the old hooks (`const base = SH.hooks`) and calls them from its own.

### What each guide changes

| Guide | Files | What it swaps or adds |
|---|---|---|
| Shell Jelly | `engine/`, `guides/shell/` | the original. 15 lessons, the Overview (`guides/shell/overview.js`) and Backstage |
| Shell Jelly 2 | `guides/shell2/` | removes the tour and Backstage. Adds users, groups and file locks (`s2.js`), programs and the PATH, `sudo`, `grep` and pipes, the `nano` editor, and padlocks for your missing keys on the file tree. 15 lessons |
| Git Jelly | `guides/git/` | replaces the file tree with the git map (desk → stage → album → GitHub) and adds a pretend `git` (`git.js`). Has its own Overview and Backstage (`overview.js`) and 14 lessons. Each lesson's `need` sets up the sandbox for that point in the story |
| Web Jelly | `guides/web/` | adds a pretend internet, a browser, an HTML editor with the tags checker, a Boxes view, and a small git with GitHub Pages (`web.js`). Has its own Overview (`overview.js`) and Backstage, and 17 lessons. A lesson's `tool`, `home` and `project` pick the starting tool, page and folder |
| Security Jelly | `guides/security/` | Shell plus users and locks (`sec.js`), the black hat / white hat swap, and choice cards for the dilemmas. HQ's made-up `fingerprint` and `bots` programs. 7 missions |

### The jelly font

The 3D letters can only show characters that are in the guide's built-in font subset. Any other character becomes `?`.

| Subset | Characters | Used by |
|---|---|---|
| `fonts/titan.json` | a–z, 0–9 and `$ ~ / . - _ > ? !` | Shell, Git, Security |
| `fonts/titan-web.json` | the above plus `< : = #` and A–Z | Web |
| `fonts/titan-shell2.json` | the above plus `|` and A–Z | Shell 2 |

To add characters:
1. Download Titan One from Google Fonts and save it as `src/fonts/TitanOne-Regular.ttf`. It's ignored by git.
2. Run:
   ```sh
   node fonts/make-font.mjs 'abc…' > fonts/your-subset.json
   ```
3. Point the guide's line in `build.sh` at the new subset.

### Where "← All the guides" points

By default, each guide links to `../`: the landing page next to the guide folders. To build copies hosted somewhere else, set `JELLY_HOME`:

```sh
JELLY_HOME=https://example.com/jelly/ ./src/build.sh
```

The link then opens that address in a new tab. For the course map, set `JELLY_LINKS` to a JSON object of course id → address, and `LANDING` to where the landing page should be written:

```sh
JELLY_HOME=https://example.com/jelly/ JELLY_LINKS='{"git": "https://example.com/git/"}' LANDING=/tmp/home.html ./src/build.sh
```

## Building

You need Python 3 and Node 18 or newer.

```sh
./src/build.sh
```

This writes `jellyshell/`, `jellyshell2/`, `jellygit/`, `jellyweb/` and `jellysecurity/` at the top of the repo. Working files go in `src/build/`, which git ignores.

The built guides are committed, so the site works with no build step: open `index.html`, or serve the folder.

### The version label

The landing page shows a small label in its top-right corner, like `v1.0.0 · 3076c59`. Use it to check that a deployed copy is up to date.
- **The number** comes from `src/VERSION`. Bump it by hand when you release.
- **The seven characters after it** are a fingerprint of all five built guides. It changes whenever anything in any guide changes, even if nobody bumped the number.

`build.sh` stamps the label as its last step, using `tools/stamp-version.py`.

## Testing

The tests drive a real browser with Playwright.

```sh
cd src
npm install                                        # installs playwright-core and opentype.js
CHROMIUM=/path/to/chromium npm test                # or leave CHROMIUM unset to use Google Chrome
```

`npm test` runs `tests/run-all.mjs`, which runs each test and prints PASS or FAIL. Tests that don't paint the 3D run `JOBS` at a time (default: half the CPU cores); the ones that paint it (`overview`, `jar`, `present`) run one at a time after them. `JOBS=1` runs everything in turn.

| Test | Checks |
|---|---|
| `shell.mjs`, `shell2.mjs`, `git.mjs`, `web.mjs`, `security.mjs` | plays every lesson's demo (`src/guides/<guide>/demos.json`, the same lists presenter mode records) through the page with `tests/play.mjs`, typing and clicking as a child would, then checks every lesson earned its jelly and nothing threw an error. Shell 2 and Security also check nothing untaught shows after every action; Web checks the page never reaches the real internet and your website survives a reload. Shell also opens the lesson's jelly letters full screen, checks Enter doesn't move the lesson on behind them, and closes them with Escape |
| `fit.mjs` | opens every panel and lesson phase of every guide at 900 × 560, 1024 × 640, 1366 × 768, 1440 × 900 and 1920 × 1080, and fails if anything needs scrolling. `node tests/fit.mjs jellyweb 1366` checks one guide and saves screenshots at that width |
| `prereqs.mjs` | opens every lesson of each guide that declares `teaches` (Shell 2 and Security so far), as a child jumping ahead would. Fails if any phase shows a concept before the lesson that teaches it. The Shell 2 and Security play-throughs run the same check after every command. Detectors are in `tests/concepts.json` |
| `jellysh.mjs` | the shell module on its own, in Node with no browser: 81 checks of wildcards, exit codes, `&&` and `\|\|`, quoting, variables, pipes, redirects, scripts, the PATH, people and locks. Each check states what real bash does |
| `curriculum.mjs` | `curriculum.json` against the build, in Node: every course it needs exists and comes earlier, every built course saves under the key the curriculum says and has the course map, and the landing page shows every course |
| `overview.mjs` | the Overview in Shell Jelly, Git and Web: every step plays to its end without errors, the last earns its jelly, and Back then Next comes back to the same step. `node tests/overview.mjs jellygit` checks one guide |
| `fresh.mjs` | Shell and Shell 2: a lesson finished inside a folder doesn't leave the next lesson's mission there, and a mission already under way isn't wiped by going back a phase and on again |
| `jar.mjs` | earns a jelly and checks the card names its look and that it lands in the collection with what it taught. The card opens this course's jar, tapping a jelly shows its label, and the shelf shows one jar per course with the right counts (the planned course's shut). **Save my jellies** downloads a file with everything. In an emptied browser, a file that isn't a save is refused, and **Use my existing jellies** brings everything back. Keys stay in the jar until Escape closes it |
| `present.mjs` | presenter mode in every guide: every lesson's demo finishes its mission, the guide's own kinds of frame show full screen, no "you earned" frames, Tab hides and restores the Overview card, ← then → returns to the same frame, nothing is saved; screenshots, 16:9 and (Shell, Web) 9:16. Then on a phone: the gate shows, a jelly letter can be grabbed and dragged without turning the page, its slideshow taps forward and back, turns to 16:9 sideways, saves nothing |
| `perf.mjs` | not pass/fail: prints the physics work per 3 seconds of jelly time (letters dropping, a jar filling, a settled jar). Run it before and after any 3D or physics change, on the same machine |
| `letters.mjs` | drops some jelly words eight times each and fails if any letter falls over more than half the time. This is the test that caught the falling i |

Screenshots go to `src/tests/out/`.

**The 3D under test.** Tests use the machine's GPU, and fall back to software 3D (SwiftShader) where there is none, such as CI runners and cloud containers. There the page is slow, about 6 frames a second. Mission tests wait for state rather than animation. `letters.mjs` steps the physics directly at 60 frames a second, so slow machines give the same answer as fast ones.

| Setting | Effect |
|---|---|
| `launch({ draw: false })` | for tests that only check text, layout or physics (the play-throughs, `prereqs`, `fresh`, `fit`, `letters`): the page sets `JELLY_DRAW = false` before it loads, so the 3D still moves and collides but isn't painted, and the window light isn't built. Their screenshots show empty 3D boxes |
| `JELLY_DRAW=1` | paints the 3D in every test anyway, to look at the screenshots |
| `JELLY_GL=swiftshader` | forces software 3D even with a GPU, for identical pixels on every machine |
| `JOBS=n` | how many non-painting tests run at once |

## Licence

- GPL-3.0, because the jelly physics is ported from Jelly Baby (GPL-3.0).
- Titan One is under the SIL Open Font License, and so are the other Google Fonts.
