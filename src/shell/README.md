# jellysh: a small Unix shell, made for teaching

`jellysh.js` is the shell behind every Jelly guide. It's one self-contained file:
- no page, no DOM, no lessons and no storage;
- no dependencies;
- runs in a browser or in Node.

You give it a file tree, and it runs command lines the way bash does, with kinder messages. The guides add their own commands (`git`, `curl`, `nano`…) and their teaching voice (Shelly) from outside, through `define()` and hooks.

Its tests run in plain Node: `node tests/jellysh.mjs`. Each check states what real bash does.

## What it can do

| Area | Supported |
|---|---|
| Words | spaces split words; `'single'` and `"double"` quotes; `\` escapes; `#` comments |
| Expansion | `$NAME`, `${NAME}`, `$?`, `$1`…`$9`, `$#`, `$0`; `NAME=value` on its own line, or just for one command (`NAME=value cmd`); `export`, `unset`; `echo ~` |
| Wildcards | `*`, `?` and `[abc]` / `[!abc]`, matched against the file tree. Results are sorted. Hidden files only match a pattern that starts with `.`. A pattern with no match is passed on as typed, as bash does. Quoted or escaped wildcards stay plain characters |
| Joining commands | `;`, `&&`, `\|\|` and pipes (`\|`). Only a command's output goes down a pipe: errors and tips stay on screen |
| Redirects | `>`, `>>` and `<` |
| Exit codes | every command sets `$?`. `0` means it worked; usually `1` means it failed; `2` means a missing file for `ls` or `grep`, or a syntax error; `126` means you can't run it (no `x` key); `127` means command not found. `grep` returns `1` when nothing matches |
| Files | `pwd` `ls` (`-a` `-l`) `cd` (`..` `~` `-`) `cat` `echo` (`-n`) `mkdir` (`-p`) `touch` `cp` (`-r`) `mv` `rm` (`-r`) |
| Text | `grep` (`-i` `-c` `-n` `-v`) `wc` (`-l` `-w` `-c`) `sort` `head` / `tail` (`-n`), reading files or a pipe |
| Programs | `which`; the PATH (`/bin` then `~/bin`); `./script` and scripts on the PATH. A script runs one line at a time, with `$1`…, and carries on after a failed line. A file in `/bin` with machine code in it runs the command of the same name, so `/bin/ls` works |
| People and locks | **off unless the guide passes `users`.** Owner, group and mode on every file; `r`/`w`/`x` checked for reading, writing, running, listing and entering folders; `chmod` (letters like `u+x,go-w`, or numbers like `644`); `chgrp`; `id`; `groups`; `su` and `exit`; `sudo` for people in the `sudo` group; new files belong to whoever made them |
| Other | `true`, `false`, `history`, `whoami`, `hostname`, `date` |

## Deliberate differences from bash

These are choices made for teaching, or things the guides don't need.

- **`~` stays as typed** in commands other than `echo`, so Shelly can explain a path in the form the child wrote it ("~ (home) → snacks ✓"). Real bash expands it first. Messages therefore say `cd: ~/snak: No such file or directory` where bash would say `/home/kid/snak`.
- **Friendly tips** follow many real error messages, such as "Tip: add -p to build all the folders on the way". A guide can reword or remove any of them with the `tip` hook.
- **Passwords are skipped.** `su` doesn't ask for a password, and `sudo` "types" yours. The guides say so on screen.
- **No background jobs** (`&`), no `2>`, no `$(…)` or backticks, no `if`/`for`/functions.
- **Locks are checked on the last file or folder of a path**, not on every folder along the way.
- **`ls -l`** shows a fixed date, and folders show size 4096.
- **`cat` with no file and no pipe** waits for you to type, like the real one. The guide's page handles that typing and Ctrl+D.

## Using it

```js
const SH = JellySh.create({ newId: () => 'n' + nid++ });   // newId: how new files get their ids
SH.reset(rootNode);                                         // a tree of { name, type: 'dir'|'file', content, children, parent }
const result = SH.run('ls *.txt | wc -l && echo done');
// result: { out, ok, status, info, cmd, args, toks, line, user }
```

| Field of `result` | What it holds |
|---|---|
| `out` | the lines to show, in order. `{ t, c }` is text, where `c` is `''` for output, `'er'` for an error, `'tip'`, `'mute'` (a note) or `'dir'`. `{ h, t }` is HTML (its `t` is the plain text used by pipes and files) |
| `status` | the exit code. `ok` is `status === 0` |
| `info` | what the last command did, for lesson checks: `hits` (files `cat` read), `created`, `removed`, `target`, `peek`, `all`, `wrote` (`{ name, mode }` for `>` and `>>`), `denied`, `ran`, `lineFailed`, `matches`, `pipe`, `inner` (what `sudo` ran), `mode` / `was` / `file` (chmod), `group`, `user` (su), `left` (exit) |
| `cmd`, `args`, `toks` | the last command and its words, after expansion |
| `SH.sh` | the shell's state: `root`, `home`, `cwd`, `user`, `vars`, `status`, `hist`, `catMode`, `su`… |

The file helpers are `find`, `pathOf`, `pretty`, `splitPath`, `node`, `clone`, `allNodes`, `locate`, `glob`, `pathDirs`. The lock helpers are `own`, `grp`, `modeOf`, `keySet`, `can`, `modeStr`, `triplet`, `claimNew`.

### Options

Pass these to `create()`, or later to `configure()`:

| Option | Meaning |
|---|---|
| `home`, `user`, `host`, `path` | where home is (`/home/kid`), who is typing (`kid`), the computer's name (`jelly`), and the PATH (`/bin:~/bin`) |
| `users`, `gids` | switch on people and locks: `{ kid: { uid: 1000, groups: ['kid', 'sudo', 'family'] }, … }`. The first group is the person's own |
| `manual` | `{ ls: [name, usage, description, example] }`, used for `cmd --help` |
| `builtins` | words that are part of the shell rather than programs (`which cd` finds nothing) |
| `newId` | makes ids for new files |

### Adding a command

```js
SH.define('hello', (c) => {
  // c.cmd, c.args, c.rest (args without -flags), c.flags (a Set of letters), c.stdin, c.line, c.info, c.out
  c.say(`hello, ${c.args[0] ?? 'world'}`);     // output
  c.say('a note', 'mute');                      // not output: stays on screen, skips pipes and files
  c.note('<b>Shelly</b> says…');                // HTML note
  c.fail('hello: no', 'a kind tip', 2);         // error + tip, and the exit code
});
```

A defined command takes part in pipes, `&&`, `||`, redirects and `$?` automatically. Defining a name again replaces the old command.

### Hooks: the guide's teaching voice

| Hook | Called when | What it can do |
|---|---|---|
| `pathMiss(path, line)` | a path doesn't exist | return HTML lines (Shelly's "I followed your path…") |
| `before(c)` / `after(c)` | around every command | add tips or notes |
| `notFound(c)` | a command doesn't exist | explain it; return `true` once handled |
| `denied(c, { op, node, tip })` | a lock said no | `op` is `read`, `write`, `create`, `delete`, `list`, `enter` or `exec`. When `tip` is given, return the tip to show (or another one); otherwise add notes with `c.note()` |
| `tip(key, text)` | before any built-in tip is shown | return different words, or `null` to show none. The keys are written next to each tip in the source, for example `rm.dir`, `chmod.digits`, `sudo.password` |
| `scriptFailed(c, { line, number, node })` | a script line was not a command | explain it |
| `afterWrite(c, node, mode)` | `>` or `>>` wrote a file | add to `c.info` |
| `modeHTML(node)` | `ls -l` shows a lock | return coloured HTML |

To build on hooks that are already set, keep the old ones: `const base = SH.hooks;`, then call `base.before?.(c)` from inside your own.
