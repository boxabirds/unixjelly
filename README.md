# Jelly Shell

A playful, browser-based introduction to the Unix command line. Learn `ls`, `cd`, `cat` and friends through wobbly 3D jelly letters, an animated "how a command works" tour, and a sandboxed terminal where you complete small missions.

There is no build step, no backend and no install. The whole app is a single HTML file.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Requirements:

- A laptop or desktop window of at least **900 × 560**. Smaller windows show a "needs a bigger screen" notice (a phone layout is not built yet).
- An internet connection. Three.js (v0.169.0) loads from jsDelivr and fonts from Google Fonts.

## What's inside

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

## Repo layout

- `index.html`: the current app.
- `index-v1.html`, `index-v2.html`: earlier iterations, kept for reference.

## Credits and licensing

- The jelly wobble is ported from [Jelly Baby](https://github.com/scottstts/Jelly-Baby) by Scott Sun, which is GPL-3.0.
- Letters use Titan One (OFL). Other fonts are Lexend, VT323 and JetBrains Mono via Google Fonts.
- This repo has no `LICENSE` file yet. Because of the GPL-3.0 port, check licensing before redistributing.
