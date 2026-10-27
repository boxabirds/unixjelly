# Unix Jelly

Five playful guides: the shell, the shell part 2, git, the web, and security. Open `index.html` for the landing page that links to all of them.

- **Shell Jelly** (`jellyshell/`): the command line.
- **Shell Jelly 2** (`jellyshell2/`): users, file locks, writing your own commands, `sudo`, `grep` and pipes.
- **Git Jelly** (`jellygit/`): git, built on the same ideas.
- **Web Jelly** (`jellyweb/`): HTML, how web pages travel, and publishing with GitHub Pages.
- **Security Jelly 1** (`jellysecurity/`): black hat and white hat. Break into a pretend computer, fix it, test it again. 7 missions: protect your own computer. Part 2, on websites, comes after Web Jelly.

To use the guides there is no build step, no backend and no install. Each guide is a single HTML file. To change them, see [Contributing](#contributing).

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Requirements:

- A laptop or desktop window of at least **900 × 560**. Smaller windows, phones included, get a notice offering the **mobile slideshow** instead: the course as slides you tap through, with no typing and no saved progress.
- An internet connection. Three.js (v0.186.1) loads from jsDelivr and fonts from Google Fonts.

## Shell Jelly

A playful, browser-based introduction to the Unix command line. Learn `ls`, `cd`, `cat` and friends through wobbly 3D jelly letters, an animated "how a command works" tour, and a sandboxed terminal where you complete small missions.

### What's inside

The app is a fixed left nav plus one full-window panel at a time:

| Section | What it does |
| --- | --- |
| Welcome | Draggable 3D jelly letters spelling `ls`, `cd` and `cat`. |
| Overview | A computer cut open like a 3D doll's house: you and the terminal, Shelly the shell, King Kernel and the hardware on their own floors, and the file tree growing underground as roots. Your `ls` rides a lift down as jelly letters, and the answer climbs back up. |
| Backstage | The Overview's house, up close. Press Enter (or pick a command) and follow it: Shelly snips it into words, the program steps out of the `/bin` cupboard, asks King Kernel, visits the file tree in the roots, and carries the answer back. Plays `ls`, `cat` and `mv`. |
| Lessons | 15 short missions, each with a mnemonic and a live terminal sandbox. |

Lessons, in order: the shell is listening, `pwd`, `ls`, `cd`, `/` (the very top, and the slash's two jobs), `~` (home), a "Jelly hunt" navigation game, `cat`, `mkdir`, `cp`, `mv` (and why it also renames), `rm`, Tab and history, `man`, and a final "Great Gerbil Rescue" challenge.

### The sandbox terminal

A small fake shell with an in-memory file tree. It supports `ls [-a] [-l]`, `cd`, `pwd`, `cat`, `echo` (including `> file`), `mkdir [-p]`, `touch`, `cp [-r]`, `mv`, `rm [-r]`, `man`, `clear` and `help`.

The sandbox is more forgiving than a real shell. When a path can't be found, Shelly shows how the path was followed (`~ (home) → toys ✓ → robt.txt ✗`) and explains the likely mistake: already inside that folder, wrong capitals, a missing `.txt`, `/` used where `~` was meant, or a backslash. She then offers a corrected command to click. Unknown commands get a "did you mean" suggestion, `cd` says where you landed, and the first `~` or `/` path gets a one-line explanation. In the Jelly hunt, letters hide in folders marked on the file tree; walking there with `cd` catches them, and they drop into the jelly box until they spell a word.

Keyboard: `Tab` completes, `↑`/`↓` recall history, `Ctrl+C` interrupts, `Ctrl+D` ends `cat` input, `Ctrl+L` clears. On-screen helper buttons cover the same keys. "Start over" resets the current mission, and "Reset sandbox" resets the file tree.

Progress (collected jellies) and sound preference are saved in the browser's `localStorage`. "Empty the jar" clears them.

## Shell Jelly 2

Part two of Shell Jelly: who's in charge? Same format, without the 3D tour (part 1 did the big picture). 15 lessons, each using only what Shell Jelly or an earlier lesson taught:

`whoami` (accounts, and the prompt decoded), `>` and `>>`, `nano` (changing a file, with `Ctrl+O` to save and `Ctrl+X` to exit), `which` (every command is a file in `/bin`), `./` (write a one-line script in nano, run it, and get Permission denied), `ls -l` (reading the lock), `chmod` with letters (`u+x`, `go-r`), the `PATH` and `~/bin` (name your own command anything), groups with `id` and `chgrp`, `su` and `exit`, `sudo` and the two meanings of "root", `grep`, pipes (`|`, `wc -l`) to find out who ate the cookies, an optional binary lesson for the numbers in `chmod 644`, and a final quest to build and test a family-only clubhouse.

The sandbox has three accounts (root, kid and sib), real owner/group/other permission checks on reading, writing, running, listing and entering folders, and scripts that run line by line. Missions that build on earlier ones quietly recreate any missing file after a reset. The file tree marks programs with ▶, and from the `ls -l` lesson on it shows your own keys (`r`, `w`, `x`) next to every file and folder, for whoever you currently are. A small `nano` editor opens inside the terminal window.

## Git Jelly

Same format as Shell Jelly (same nav, 3D cutaway, backstage animation and sandbox), applied to git. Start with Shell Jelly: the git sandbox reuses the shell commands.

| Section | What it does |
| --- | --- |
| Welcome | Intro to git as "a time machine for your code". |
| Overview | Your computer as a 3D doll's house: your folder, the stage and the photo album on their own floors, and a lift tower up to GitHub in a see-through cloud. `game.py` rides up as jelly letters, gets photographed, pushed, and cloned to a friend's house. |
| Backstage | The house up close. Follow `git add`, `git commit` and `git push`: a jelly git robot carries `game.py` onto the stage, takes the photo and pins it in the album, then a jelly pigeon flies a copy up to GitHub, which asks for your token. |
| Lessons | 14 short missions with a live sandbox. |

Lessons, in order: meet git, `config`, `init`, `status`, `add`, `commit`, `log`, `diff`, `restore`, `remote`, `push`, `pull`, `.gitignore`, and a final "daily loop" quest.

The sandbox adds a fake `git` supporting `init`, `config`, `status`, `add`, `commit`, `log`, `diff`, `restore`, `remote`, `push`, `pull` and `clone`. `branch` just shows `main` with a pointer, and other git words (`checkout`, `switch`, `merge`, `rebase`, `stash`, `reset`, `fetch`) answer with a friendly pointer rather than doing anything. Progress is 16 jellies, saved separately from Shell Jelly.

## Web Jelly

Same format again, applied to the web. The lesson panel swaps the file tree for a pretend browser, and the terminal shares its space with an HTML editor.

| Section | What it does |
| --- | --- |
| Welcome | Intro: every web page is a text file that crosses the planet. |
| Overview | A little 3D world: your house, the DNS owl's treehouse, a cut-open sea with the internet cable on its floor, and the server on the far shore. `gerbil.zone`, its number, `GET /` and `200 OK` travel there and back as jelly letters. |
| Backstage | The world up close. Follow an address: Browsy the browser splits it into how to talk, which computer and which file, the DNS owl looks up the number, the letter crosses the sea, and the server answers: the page (200), a 404, or a jelly teapot's 418. |
| Lessons | 17 short missions with an editor, a terminal and a live browser. |

Lessons, in order: view source, tags as boxes with lids, boxes inside boxes, standalone tags (`<hr/>`), lists, `<a>`, `<img/>`, CSS, reading a URL, `curl`, HTTP `GET`, status codes, DNS, `ping`, HTTPS, publishing with `git push` to GitHub Pages, and a final mission to fix Gerald's broken website.

Everything runs on a pretend internet built into the page (`jelly.fun`, `gerbil.zone`, `teapot.jelly`, `moon.base` and friends), so no real network requests are made. The sandbox adds `curl [-I] [-v] [-L] [-o]`, `ping [-c]`, `nslookup`, `open`, and a small `git` with `status`, `add`, `commit`, `push`, `log` and `remote`. HTML is taught the tidy (XHTML) way throughout: every tag is closed, lids close in reverse order, and standalone tags close themselves (`<hr/>`, `<br/>`, `<img/>`). A tag checker under the editor enforces those rules and points at the line, and a Boxes view draws the page as nested boxes. Pages are previewed in a sandboxed frame with scripts removed. The pretend computer (including the kid's website) is saved in `localStorage`, so it survives a reload. Progress is 19 jellies.

## Security Jelly 1

Same skills, different permission. Each mission is a hat swap: wear the black hat (attacker, red team) to break in, the white hat (defender, blue team) to fix it with a named principle, then the black hat again to watch the attack fail. Modern terms come first, with the older words kids will hear alongside. It teaches no new commands: everything it uses comes from the earlier guides.

It has 7 missions on one theme, protect your own computer:
1. **Pick your hat**: permission and the law, and signing a permission slip.
2. **Keys you don't need**: least privilege, with `ls -l`, `su` and `chmod go-rw`.
3. **The guessing machine**: password fingerprints (hashes), a dictionary attack with `grep`, and three random words.
4. **Knock knock, all night**: a game server's log shows bots knocking all night, and one getting in with the default password. Change it, then replay the bots.
5. **A room of its own**: a "free coins" program deletes your homework; run in a spare account, it can't reach it.
6. **Castle layers**: defence in depth, as choice cards.
7. **The grey zone**: choices about what to do when you stumble on a way in.

## How every guide flows

- During the tutorial the section list slides away; a tab on the left edge brings it back.
- Each magic word runs one thing at a time: the story, then "remember it", then the mission one step at a time, with the jelly letters in the top left throughout.
- The **⤢** button on the jelly letters makes them full screen, for squishing. ✕ or Escape brings them back.
- Enter always means "carry on": it presses the one big green button on screen (marked "Enter ↵"). Inside the terminal or editor, Enter keeps its usual meaning. → does the same, and ← goes back a phase.
- When a mission is finished, its last output stays on screen until you press **Collect your jelly**.

## Contributing

The guides are built from the source in `src/`. The rules for how they teach and look are in `docs/`.

| Document | What it covers |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | Rules for anyone, human or AI, changing the guides. Every change starts with a pedagogical assessment |
| [docs/pedagogy.md](docs/pedagogy.md) | How the guides teach: the rules, what testing with children taught us, and which guide teaches which command |
| [docs/design.md](docs/design.md) | How they look: colours, fonts, layout, story pictures, motion |
| [docs/architecture.md](docs/architecture.md) | The technology, how the five guides share one engine, building and testing |
| [docs/new-lesson.md](docs/new-lesson.md) | Playbook and checklist for adding a lesson |
| [docs/plans/jelly-security.md](docs/plans/jelly-security.md) | The planned 16 Security Jelly missions |
| [docs/research/kids-internet-security-resources.md](docs/research/kids-internet-security-resources.md) | The research behind Security Jelly |

Quick start (needs Python 3 and Node 18 or newer):

```sh
./src/build.sh                       # rebuilds every guide folder from src/
cd src && npm install
CHROMIUM=/path/to/chromium npm test  # plays every mission in a real browser; leave CHROMIUM unset to use Google Chrome
```

Commit the source changes and the rebuilt guide folders together.

## Repo layout

- `index.html`: landing page pointing to all five guides, in order, with the problem each lesson solves. Built from `src/landing.html`, `src/curriculum.json` and `src/problems.json`: don't edit it by hand.
- `jellyshell/index.html`: Shell Jelly, the app described above.
- `jellyshell2/index.html`: Shell Jelly 2, users, locks and pipes.
- `jellygit/index.html`: Git Jelly, the follow-on guide to git.
- `jellyweb/index.html`: Web Jelly, the guide to HTML, HTTP and publishing.
- `jellysecurity/index.html`: Security Jelly 1.
- `src/`: the source every guide is built from, the build script and the browser tests. See [docs/architecture.md](docs/architecture.md).
- `docs/`: how the guides teach, look and are built, and how to add a lesson.

The guide folders are build output: change `src/` and rebuild, never edit them directly.

## Credits and licensing

- The jelly wobble is ported from [Jelly Baby](https://github.com/scottstts/Jelly-Baby) by Scott Sun, which is GPL-3.0.
- Letters use Titan One (OFL). Other fonts are Lexend, VT323 and JetBrains Mono via Google Fonts.
- This project is licensed under the GNU General Public License v3.0, because it includes code ported from a GPL-3.0 project. See [LICENSE](LICENSE).
