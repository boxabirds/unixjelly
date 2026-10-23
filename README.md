# Jelly Unix

Three playful guides: the shell first, then git, then the web. Open `index.html` for the landing page that links to all three.

- **Jelly Shell** (`jellyshell/`): the command line.
- **Jelly Git** (`jellygit/`): git, built on the same ideas.
- **Jelly Web** (`jellyweb/`): HTML, how web pages travel, and publishing with GitHub Pages.

There is no build step, no backend and no install. Each guide is a single HTML file.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Requirements:

- A laptop or desktop window of at least **900 × 560**. Smaller windows show a "needs a bigger screen" notice (a phone layout is not built yet).
- An internet connection. Three.js (v0.169.0) loads from jsDelivr and fonts from Google Fonts.

## Jelly Shell

A playful, browser-based introduction to the Unix command line. Learn `ls`, `cd`, `cat` and friends through wobbly 3D jelly letters, an animated "how a command works" tour, and a sandboxed terminal where you complete small missions.

### What's inside

The app is a fixed left nav plus one full-window panel at a time:

| Section | What it does |
| --- | --- |
| Welcome | Draggable 3D jelly letters spelling `ls`, `cd` and `cat`. |
| The whole game | A 3D cutaway of a computer (terminal, shell, kernel, hardware, file tree) that follows `ls` through each layer. |
| Backstage | A flip-card animation. Press Enter on the "green screen", then watch the shell, `/bin`, the kernel and the disk cooperate. Plays `ls`, `cat` and `mv`. |
| Lessons | 13 short missions, each with a mnemonic and a live terminal sandbox. |

Lessons, in order: the shell is listening, `pwd`, `ls`, `cd`, paths, `cat`, `mkdir`, `cp`, `mv` (and why it also renames), `rm`, Tab and history, `man`, and a final "Great Gerbil Rescue" challenge.

### The sandbox terminal

A small fake shell with an in-memory file tree. It supports `ls [-a] [-l]`, `cd`, `pwd`, `cat`, `echo` (including `> file`), `mkdir [-p]`, `touch`, `cp [-r]`, `mv`, `rm [-r]`, `man`, `clear` and `help`.

Keyboard: `Tab` completes, `↑`/`↓` recall history, `Ctrl+C` interrupts, `Ctrl+D` ends `cat` input, `Ctrl+L` clears. On-screen helper buttons cover the same keys. "Start over" resets the current mission, and "Reset sandbox" resets the file tree.

Progress (collected jellies) and sound preference are saved in the browser's `localStorage`. "Empty the jar" clears them.

## Jelly Git

Same format as Jelly Shell (same nav, 3D cutaway, backstage animation and sandbox), applied to git. Start with Jelly Shell: the git sandbox reuses the shell commands.

| Section | What it does |
| --- | --- |
| Welcome | Intro to git as "a time machine for your code". |
| The whole game | A 3D cutaway of how a file moves from your desk to the stage to the photo album to GitHub. |
| Backstage | A flip-card animation of `git add` and friends. |
| Lessons | 14 short missions with a live sandbox. |

Lessons, in order: meet git, `config`, `init`, `status`, `add`, `commit`, `log`, `diff`, `restore`, `remote`, `push`, `pull`, `.gitignore`, and a final "daily loop" quest.

The sandbox adds a fake `git` supporting `init`, `config`, `status`, `add`, `commit`, `log`, `diff`, `restore`, `remote`, `push`, `pull` and `clone`. `branch` just shows `main` with a pointer, and other git words (`checkout`, `switch`, `merge`, `rebase`, `stash`, `reset`, `fetch`) answer with a friendly pointer rather than doing anything. Progress is 16 jellies, saved separately from Jelly Shell.

## Jelly Web

Same format again, applied to the web. The lesson panel swaps the file tree for a pretend browser, and the terminal shares its space with an HTML editor.

| Section | What it does |
| --- | --- |
| Welcome | Intro: every web page is a text file that crosses the planet. |
| The whole game | A 3D trip of one page request: your computer, the router, the DNS phonebook, the undersea internet, the server, and back. |
| Backstage | A flip-card animation of the browser crew loading `gerbil.zone`, a 404, and a teapot's 418. |
| Lessons | 17 short missions with an editor, a terminal and a live browser. |

Lessons, in order: view source, tags as boxes with lids, boxes inside boxes, standalone tags (`<hr/>`), lists, `<a>`, `<img/>`, CSS, reading a URL, `curl`, HTTP `GET`, status codes, DNS, `ping`, HTTPS, publishing with `git push` to GitHub Pages, and a final mission to fix Gerald's broken website.

Everything runs on a pretend internet built into the page (`jelly.fun`, `gerbil.zone`, `teapot.jelly`, `moon.base` and friends), so no real network requests are made. The sandbox adds `curl [-I] [-v] [-L] [-o]`, `ping [-c]`, `nslookup`, `open`, and a small `git` with `status`, `add`, `commit`, `push`, `log` and `remote`. HTML is taught the tidy (XHTML) way throughout: every tag is closed, lids close in reverse order, and standalone tags close themselves (`<hr/>`, `<br/>`, `<img/>`). A tag checker under the editor enforces those rules and points at the line, and a Boxes view draws the page as nested boxes. Pages are previewed in a sandboxed frame with scripts removed. The pretend computer (including the kid's website) is saved in `localStorage`, so it survives a reload. Progress is 19 jellies.

## How every guide flows

- During the tutorial the section list slides away; a tab on the left edge brings it back.
- Each magic word runs one thing at a time: the story, then "remember it", then the mission one step at a time, with the jelly letters in the top left throughout.
- Enter always means "carry on": it presses the one big green button on screen (marked "Enter ↵"). Inside the terminal or editor, Enter keeps its usual meaning.

## Repo layout

- `index.html`: landing page pointing to the three guides: shell, then git, then the web.
- `jellyshell/index.html`: Jelly Shell, the app described above.
- `jellygit/index.html`: Jelly Git, the follow-on guide to git.
- `jellyweb/index.html`: Jelly Web, the guide to HTML, HTTP and publishing.

## Credits and licensing

- The jelly wobble is ported from [Jelly Baby](https://github.com/scottstts/Jelly-Baby) by Scott Sun, which is GPL-3.0.
- Letters use Titan One (OFL). Other fonts are Lexend, VT323 and JetBrains Mono via Google Fonts.
- This project is licensed under the GNU General Public License v3.0, because it includes code ported from a GPL-3.0 project. See [LICENSE](LICENSE).
