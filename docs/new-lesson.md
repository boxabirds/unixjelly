# Playbook: adding a lesson

How to add a lesson (a "magic word") to a guide, from idea to release. Read `pedagogy.md` first. Most bad lessons break rule 1: they use something nobody has taught yet.

## 1. Plan it on paper

Answer these before writing any code.

1. **What is the one idea?** One lesson teaches one command or one idea. If you need the word "and" to describe it, it's probably two lessons.
2. **What does it need?** List every command, symbol and word the lesson will use: in the story, the points, the mission steps, Shelly's messages and the example files. Check each one against the [prerequisite map](pedagogy.md#prerequisite-map). Anything missing must be taught first, in an earlier lesson or an earlier guide.
3. **Where is it used again?** Name a later lesson, or a later guide, that uses it.
4. **Which guide does it belong to?** If the topic belongs to another guide, put it there (rule 2). Security never introduces commands.
5. **What will a child get wrong?** Guess the two or three likeliest mistakes. Each gets a helpful response from Shelly (step 5 below).

## 2. Write the lesson

Lessons live in `src/guides/<guide>/lessons.js`. Shell Jelly's lessons are in `src/engine/shell.html` and `src/engine/shelly-patch.py`. The order in the `LESSONS` list is the order in the menu.

```js
{ id: 'grep',                       // unique within the guide; used in the URL (#grep) and for saved progress
  word: 'grep',                     // the jelly letters. Every character must be in the guide's font subset
  name: 'Find the needle',          // shown in the menu
  stands: 'Global Regular Expression Print',  // the label on the jelly box: what the word stands for
  color: '#62c934',                 // one of the six jelly colours
  teaches: ['grep'],                // concept ids this lesson introduces (see step 3a)
  previews: [],                     // concepts it mentions on purpose before their own lesson, with an explanation
  seq: true,                        // steps must be done in order
  onlyHere: true,                   // steps only count while this lesson is open
  visual: `…`,                      // the story picture (see design.md, Story pictures)
  title: 'Search inside files',     // big heading on the story
  why: '…',                         // the story: why this exists. About 60–90 words
  mnem: 'grep: the word first, then where to look.',  // the one-line memory hook
  points: ['…', '…', '…'],          // "Remember it": three short points
  steps: [                          // the mission, two to five steps
    { t: 'Find the cookies in your diary: <code>grep cookie diary.txt</code>',
      ok: (e) => isCmd(e, 'grep') && e.info.matches > 0 && e.args.includes('diary.txt'),
      hint: 'Type <code>grep</code>, the word to find, then the file.', // optional: the "?" bubble next to the step
      show: () => { … },                 // optional: make the thing to use glow while the hint is open
      doIt: () => { … } },               // optional: "Do it for me". The lesson then gives no jelly (engine/help-patch.py)
  ],
  setup: () => { … },               // optional: put back files this lesson needs (step 6)
},
```

Writing tips:
- **Story.** Start from the problem, then the name and why it's called that. End with what the child is about to do.
- **Picture.** Show the real thing from this lesson: the real file name, the real `ls -l` line. If the story says "look at the picture", the picture must show exactly that.
- **Points.** Each one is a usable fact, often with a `<code>` example. Three is the right number.
- **Steps.** Each step is one action, with the exact command in `<code>`. Later steps can ask the child to work something out ("Give it to the family group."). Only do that once the command has been practised.
- **Hint and Do it for me.** A hint says where to look and what to do, using only words already taught. `doIt` does the step the way the child would, so they see it happen, and it must make the step's own `ok` pass: the guide only forces the tick as a fallback.
- **Words.** UK spelling, short sentences, one new idea per paragraph. Explain a term the first time it appears.

## 3. Check steps by results, not by typing

A step's `ok(event)` decides whether the step is done. Prefer checking **what changed** over **what was typed**, so every sensible way of doing it counts:

```js
// Good: any chmod that leaves hello with an owner x key
ok: (e) => isCmd(e, 'chmod') && !!(modeOf(kidFile('hello')) & 0o100)
// Too strict: only this exact spelling
ok: (e) => e.line === 'chmod u+x hello'
```

Events your `ok` can receive:

| `e.type` | When | Useful fields |
|---|---|---|
| `cmd` | after every command | `cmd`, `args`, `toks`, `ok` (did it work), `cwd`, `info` (below); in Shell Jelly 2 also `line` (as typed) and `user` |
| `tab`, `up`, `ctrlc`, `ctrld` | Tab, ↑, Ctrl+C, Ctrl+D | none |
| `nano` (Shell 2) | nano saved or closed | `saved` (path), `changed`, `content`; or `exit`, `path` |
| `edit` (Web) | the HTML editor changed | see `guides/web/web.js` |
| `choice` (Security) | a choice card was picked | `k`, the step's index |

`e.info` holds what the command did:

| Field | Set by |
|---|---|
| `hits` | the paths `cat` read |
| `target`, `peek`, `all` | `ls` |
| `created`, `removed` | `mkdir`, `touch`, `rm` |
| `kind`, `intoDir` | `mv` and `cp` |
| `wrote` (`{name, mode}`) | `>` and `>>` |
| `denied` | a lock said no |
| `ran` | a program file was run |
| `matches` | `grep` |
| `pipe` | the commands joined by `\|` |
| `inner` | the command `sudo` ran |

The full list for each guide is in its `run` / `run1` function. Search for `info.`.

### 3a. Declare what the lesson teaches, and guard what it shows

1. Give every new concept an id and put it in the lesson's `teaches`.
2. Add how to spot it on screen in `src/tests/concepts.json`. That can be selectors, patterns in commands, or patterns in words.
3. Anywhere the guide shows that concept **outside its own lesson**, ask `taught('id')` first, and say something simpler until it's taught. That covers Shelly messages, tips, notes and file tree markers. Example from Shell Jelly 2:
   ```js
   const lockTip = (tip) => taught('locks') ? tip : 'The computer said no. The lesson "Read the locks" explains why.';
   ```
4. If the lesson must mention a later concept, say so in `previews` and explain it on screen ("That one is a secret for later").

## 3b. Give it a demo

Add the lesson's demo to its guide's `src/guides/<guide>/demos.json`, under the lesson's id: the actions a presenter's video should show, one per frame, in order. The build puts it into the lesson. Each action is one of these:
- a command, like `'ls -l'`;
- `'@type:text'`, typed into nano (`\\n` for a new line);
- `'@key:Control+x'`, a key pressed in nano.
- `'@tab:cat secr'`, `'@up'`, `'@enter'` or `'@ctrlc'`, a special key in the terminal: Tab after typing the text, ↑, Enter on what is typed, or Ctrl+C;
- `{ "click": "[data-gh=create]" }`, a button pressed (add `"label"` if the button has no words);
- `{ "edit": ["from", "to"] }`, a change to the open file (Web);
- `{ "visit": "jelly.fun" }`, an address typed in the browser, or `{ "link": "About me" }`, a link clicked in the page (Web);
- `{ "choose": 2 }`, a choice card picked, counting from 0 (Security);
- `{ "wait": 2600 }`, time passing (for example before stopping `ping`). Presenter mode doesn't need these.

The demo must finish the mission. Both the guide's play-through test (it plays the same demos) and `node tests/present.mjs` fail if it doesn't.

## 4. Add any new command to the pretend computer

If the lesson introduces a command, add it everywhere the shell needs to know about it:

1. **`BIN`**: the list of programs in `/bin`. It drives `ls /bin`, Tab completion and "did you mean".
2. **The command itself.** If every Unix computer has it (`tail`, `uniq`…), add it to the shell module, `src/shell/jellysh.js`, with a check in `tests/jellysh.mjs` against real bash. If it belongs to the guide (`git`, `nano`), add it in the guide's engine file with `SH.define('name', (c) => …)`. See `src/shell/README.md`.
3. **A `MAN` entry**: name, how to use it, a description and an example. That gives you `man` and `--help` for free.
4. **The `help` list.**
5. **Locks**, if it reads, writes, runs or enters something: check with `can(node, 4 | 2 | 1)`, fail with the real error message (`Permission denied`), and give the guide's `denied` hook the chance to explain.
6. **Exit code:** `c.fail(message, tip, code)`. Use `0` for success, usually `1` for failure, and match real bash where it differs.
7. **Real messages.** Copy real error text where there is one (`which: no cd in (/bin:/home/kid/bin)`). Add a tip or a Shelly explanation underneath.

## 5. Help with likely mistakes

For each mistake you guessed in step 1:
- **An error the child might hit:** add a tip (`fail(message, tip)`) or a Shelly line (`out.push({ h: shelly('…'), t: '' })`). Say what happened, why, and what to try. Offer a clickable fix with `tryCmd('…')`.
- **A wrong result that isn't an error**, like a program file whose line isn't a command: catch it where it happens. The `./` lesson uses `afterNano` to look at what was saved.
- **A deliberate failure** (a cliffhanger) must say it's deliberate, so nobody tries to fix it early.

## 6. Make it work when started in the middle

Children jump around, and press Start over. If the lesson needs files from earlier lessons, put them back in `setup`:

```js
setup: () => ensure('/home/kid/hello', () => run1(`echo "${HELLO}" > /home/kid/hello`), 'Your hello program wasn\'t here, so Shelly wrote it again.'),
```

In Shell Jelly 2, `setup` runs when the mission starts and after Start over, and it only acts if the file is missing. Git Jelly does the same job with each lesson's `need` level, and Web Jelly with `project`. In another guide, copy Shell 2's two hooks from `guides/shell2/build.py`. Search for `L.setup`.

## 7. Jelly word, recap and colour

1. Check that every character of `word` is in the guide's font subset. A missing one shows as `?`. See `architecture.md`, The jelly font.
2. Add a recap entry in the guide's recap data:
   ```js
   grep: { does: 'Prints every line with a word in it.', ex: 'grep cookie diary.txt', quiz: 'Find every line about pizza in menu.txt.' },
   ```
   `quiz` is a question the child answers from memory in "Test me" mode, so make it a task, not a definition.
3. Pick a colour different from the lessons either side of it.
4. Add the problem the lesson solves to `src/problems.json`, in the learner's words ("Why does it say Permission denied?"). It shows on the landing page and the guide's small-screen page, and the build stops without it.

## 8. Build and test

```sh
./src/build.sh
cd src && CHROMIUM=/path/to/chromium npm test
```

1. Add the lesson's commands to the guide's test plan, in the same order a child would type them. Include at least one likely mistake, so the help messages run too. For example, `tests/shell2.mjs` writes `hello` wrongly first, then fixes it.
2. All tests must say PASS, including `prereqs`, which opens every lesson cold and fails if anything appears before it's taught.
3. Run `node tests/fit.mjs <guide-folder> 900` and `… 1366`. Look at the screenshots of your lesson in `src/tests/out/`, every phase, both sizes. Nothing should be cut off, and text should stay readable.
4. Play the lesson yourself in a browser, typing, not pasting.

## 9. Watch a child

Sit with a child from the 9–14 age range, and say as little as you can:
- Write down their words when they get stuck.
- Every stumble is a bug, even if the text is right.
- Fix the cause, then add the finding to the table in `pedagogy.md`, rule 14.

## 10. Release

1. Update the guide's lesson list in `README.md` and, if needed, the prerequisite map in `pedagogy.md`.
2. Commit the source and the rebuilt guide folders together.

## Adding a whole course

1. Write the pedagogical assessment first (`CLAUDE.md`, rule zero). List what the course uses from every other course.
2. Add it to `src/curriculum.json`, after the courses it needs, with `needs` listing the direct ones only. Leave `folder` and `store` as `null` while it's only planned: it then shows as "coming later" everywhere.
3. When it's built, set `folder` and `store` (the guide's `KEY`, usually `<folder>.v1`) and add its line to `build.sh`.
4. `node tests/curriculum.mjs` checks the map against the build.

## Checklist

- [ ] One idea, in the right guide.
- [ ] A written pedagogical assessment came first (`CLAUDE.md`), and any gaps were agreed.
- [ ] Every command, symbol and word it uses is taught earlier, or in this lesson before it's needed.
- [ ] `teaches` (and any `previews`) are filled in; new concepts have detectors in `tests/concepts.json`; anything shown elsewhere asks `taught()`.
- [ ] It's used again later, in this guide or the next.
- [ ] Story, picture, memory hook and three points. The picture shows the real thing.
- [ ] Two to five steps, each one action, each checked by result.
- [ ] Shelly helps with the two or three likeliest mistakes; any cliffhanger is labelled.
- [ ] `setup` puts back anything the lesson needs from earlier ones.
- [ ] New commands are in `BIN`, the shell, `man` and `help`, and respect locks, with real error messages.
- [ ] The jelly word's characters are in the font; there's a recap entry with a task-style quiz.
- [ ] Tests updated; `npm test` passes; fit screenshots checked at 900 and 1366.
- [ ] Watched a child use it; findings added to `pedagogy.md`.
