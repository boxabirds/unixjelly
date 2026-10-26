# How the Jelly guides are built

## The stack

- **One HTML file per guide.** Every guide is a single `index.html` with its CSS and JavaScript inside. There's no backend, no install and no bundler.
- **Three.js 0.169.0** loads from jsDelivr through an import map, for the 3D jelly letters and the 3D tours. **Google Fonts** supplies Titan One, Lexend, JetBrains Mono and VT323. Nothing else comes from the network.
- **Everything else is pretend and runs in the page:**
  - the computer, with its files, users and locks;
  - the shell;
  - the internet, with `jelly.fun`, DNS and HTTP;
  - GitHub and GitHub Pages.

  Jelly Web's browser shows pages in a sandboxed frame with scripts removed.
- **Progress is saved in the browser** (`localStorage`), one key per guide:

  | Guide | Key |
  |---|---|
  | Jelly Shell | `jellyshell.v1` |
  | Jelly Shell 2 | `jellyshell2.v1` |
  | Jelly Git | `jellygit.v1` |
  | Jelly Web | `jellyweb.v1` |
  | Jelly Security | `jellysecurity.v1` |

  If you change what's stored in a way old saves can't handle, bump the number.
- **The jelly physics** is a soft-body simulation ported from [Jelly Baby](https://github.com/scottstts/Jelly-Baby) by Scott Sun. That port is why the project is GPL-3.0.

## Inside a guide

Each guide is one `<script type="module">`, in these sections:

| Section | What it does |
|---|---|
| Jelly physics | `JellyBody` (one squishy letter) and `JellyStage` (a row of letters on a floor, with a camera, dragging, hopping and walking home) |
| 3D font | `makeLetter()` turns a glyph from the built-in font subset into a 3D shape |
| The whole game | `Town`: the 3D tour (Shell, Git and Web only) |
| Backstage | the flip-card animation of a command's journey (Shell, Git and Web only) |
| The shell | **jellysh** (`src/shell/jellysh.js`), a self-contained module: the file tree, quoting, variables, wildcards, `;` `&&` `\|\|` `\|`, redirects, exit codes, the Unix commands, and people and locks. The page gets it as `SH`; `run(line)` is `SH.run(line)`, and `sh`, `find`, `pathOf` and the rest point at it. See `src/shell/README.md` |
| The pretend computer | the starting files (`seed()`), and Shelly's explanations (`explainPath`), which reach the shell through hooks |
| Terminal and file tree | typing, Tab, history, Ctrl keys, helper buttons, and drawing the tree |
| Lessons and progress | `LESSONS`, `check(event)`, the saved `store`, and `taught(concept)`, which says whether a concept's lesson has been reached |
| Panels and navigation | `PANELS`, `go()`, the Enter-means-carry-on handler (`primaryButton()`), `fitAll()` |
| One lesson at a time | `setPhase()`, `paintSteps()`, `showLesson()`, Start over |
| Recap | "What I've learnt", with its Test me mode |

## How the guides share code

All five guides come from one page. Jelly Shell is the **engine**, and every other guide is Jelly Shell with parts swapped out.

```
src/engine/shell.html            the original Jelly Shell page
   + src/engine/base-patch.py    engine changes every guide gets (layout, phases, Enter handling, …)
   + src/engine/shelly-patch.py  Shelly's explanations, Shell 1's path lessons and jelly hunt, later engine-wide fixes
   = build/jelly-shell.src.html  Jelly Shell, and the starting point for every other guide

build/jelly-shell.src.html
   + src/guides/git/build.py       → build/jelly-git.src.html
   + src/guides/web/build.py       → build/jelly-web.src.html
   + src/guides/shell2/build.py    → build/jelly-shell2.src.html
   + src/guides/security/build.py  → build/jelly-security.src.html

each *.src.html
   + the right jelly font subset (tools/inline-font.mjs)
   + a JavaScript syntax check (node --check)
   + a full HTML page wrapper
   = the guide's folder in the repo, for example jellyshell2/index.html
```

`src/build.sh` runs the whole chain.

### How a patch works

The build scripts don't use a templating system. They edit the page with two small helpers:

- `rep(old, new)` replaces an exact piece of text. **That text must appear exactly once**, otherwise the build stops with an error that shows the text it couldn't find.
- `region(start, end, new)` replaces everything between two markers. Lessons, for example, go between `const isCmd = (e, c)` and `const ALL = [`.

This makes every guide's dependence on the engine explicit. If you change engine text that a guide patches, that guide's build fails loudly, in the right place, instead of silently doing something odd. Fix it by updating the `rep` in that guide's `build.py`.

**Order matters.** Engine changes go in `base-patch.py` or `shelly-patch.py`, so all guides inherit them. A guide's own changes go in its `build.py`, plus the separate files it reads in (`lessons.js`, its engine additions and its CSS).

*Why patches, rather than one clean engine?* History. Jelly Shell came first, and each later guide was built by changing a copy of it. A worthwhile clean-up would be to fold `base-patch.py` and `shelly-patch.py` into `shell.html`. The guide builds would keep working as long as the text they patch stays the same.

### The shell is shared by plugging in, not patching

No guide edits the shell. Each one plugs into it from its own engine file:
- **Its own commands**, with `SH.define()`: Git's `git`, Web's `curl`, `ping` and `nslookup`, Shell 2's `nano`, Security's `sign`.
- **Its people**, with `SH.configure({ users, gids })`. This is what switches on locks, in Shell 2 and Security.
- **Its teaching voice**, through hooks: Shelly's lock explanations, first-time tips, and rewording the shell's built-in tips.

The engine adds Jelly Shell's own voice in `src/engine/use-jellysh.py`. A guide that wants to build on it keeps the old hooks (`const base = SH.hooks`) and calls them from its own.

### What each guide changes

| Guide | Files | What it swaps or adds |
|---|---|---|
| Jelly Shell | `engine/` | the original. 15 lessons, the 3D tour and Backstage |
| Jelly Shell 2 | `guides/shell2/` | removes the tour and Backstage. Adds users, groups and file locks (`s2.js`), programs and the PATH, `sudo`, `grep` and pipes, the `nano` editor, and padlocks for your missing keys on the file tree. 15 lessons |
| Jelly Git | `guides/git/` | replaces the file tree with the git map (desk → stage → album → GitHub) and adds a pretend `git` (`git.js`). Has its own tour (`town.js`), Backstage (`show.js`) and 14 lessons. Each lesson's `need` sets up the sandbox for that point in the story |
| Jelly Web | `guides/web/` | adds a pretend internet, a browser, an HTML editor with the tags checker, a Boxes view, and a small git with GitHub Pages (`web.js`). Has its own tour and Backstage, and 17 lessons. A lesson's `tool`, `home` and `project` pick the starting tool, page and folder |
| Jelly Security | `guides/security/` | Shell plus users and locks (`sec.js`), the black hat / white hat swap, and choice cards for the dilemmas. 3 prototype missions |

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

The link then opens that address in a new tab.

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

`npm test` runs `tests/run-all.mjs`, which runs each test and prints PASS or FAIL:

| Test | Checks |
|---|---|
| `shell.mjs`, `shell2.mjs`, `git.mjs`, `web.mjs`, `security.mjs` | plays every mission of that guide in order, typing the commands a child would, then checks every lesson earned its jelly and nothing threw an error |
| `fit.mjs` | opens every panel and lesson phase of every guide at 900 × 560, 1024 × 640, 1366 × 768, 1440 × 900 and 1920 × 1080, and fails if anything needs scrolling. `node tests/fit.mjs jellyweb 1366` checks one guide and saves screenshots at that width |
| `prereqs.mjs` | opens every lesson of each guide that declares `teaches` (Shell 2 and Security so far), as a child jumping ahead would. Fails if any phase shows a concept before the lesson that teaches it. The Shell 2 and Security play-throughs run the same check after every command. Detectors are in `tests/concepts.json` |
| `jellysh.mjs` | the shell module on its own, in Node with no browser: 81 checks of wildcards, exit codes, `&&` and `\|\|`, quoting, variables, pipes, redirects, scripts, the PATH, people and locks. Each check states what real bash does |
| `letters.mjs` | drops some jelly words eight times each and fails if any letter falls over more than half the time. This is the test that caught the falling i |

Screenshots go to `src/tests/out/`.

Tests use software 3D (SwiftShader) so they run anywhere, including machines with no graphics card. That makes the page slow under test, about 6 frames a second. Mission tests wait for state rather than animation. `letters.mjs` steps the physics directly at 60 frames a second, so slow machines give the same answer as fast ones.

## Licence

- GPL-3.0, because the jelly physics is ported from Jelly Baby (GPL-3.0).
- Titan One is under the SIL Open Font License, and so are the other Google Fonts.
