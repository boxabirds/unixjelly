# How the Jelly guides teach

These guides are for children of about 9 to 14 who have never used a command line. Most of the rules below come from watching real children use them. Several came from an 11-year-old tester getting stuck.

## The order of the guides

1. **Jelly Shell**: moving around folders and working with files.
2. **Jelly Shell 2**: users, file locks, writing your own commands, `sudo`, `grep` and pipes.
3. **Jelly Git**: saving versions of your work and putting it on GitHub.
4. **Jelly Web**: HTML, how a page travels across the internet, and publishing it.
5. **Jelly Security** (prototype): thinking like an attacker, then building like a defender.

Each guide may use anything taught by the guides before it, and nothing else. The [prerequisite map](#prerequisite-map) at the end lists who teaches what.

## The rules

### 1. Never use anything before it is taught

This is the most important rule, and the easiest one to break. It covers commands, symbols and everyday words. An adult reads straight past these, but a child stops dead.

Examples from testing:
- **"Prompt"** was used before it was explained. It also means something different to a child who has used a chatbot.
- **Shelly** started talking in Jelly Shell 2, but she was only ever introduced in Jelly Shell's 3D tour.
- **`chmod 600`** appeared before anyone had learnt binary. The tester asked "where did the number come from? What if you set it to 9?" Chapters now use the letter form (`chmod go-rw`). The numbers have their own optional lesson.
- **`whoami`** and **`sign`** turned up as if from nowhere. The tester asked "how do they just make these commands?" That question became a whole lesson in Jelly Shell 2: make your own command.

Before a lesson ships, check every command, symbol and term it uses against the prerequisite map. If something isn't taught yet, teach it first, in an earlier lesson or an earlier guide. Don't explain it in passing.

**How the rule is enforced:**
- **A written assessment first.** Every change to what a learner sees starts with a pedagogical assessment, before any code (see `CLAUDE.md`). That applies to the owner's own suggestions too.
- **Lessons say what they teach.** Each lesson lists the concepts it `teaches`. It can also list concepts it deliberately `previews`; those mentions are on purpose and explained.
- **Code asks before showing.** Code that shows a concept asks `taught('concept')` first. Until the lesson is reached, it says something that doesn't need the concept. For example: "The computer said no. The lesson Read the locks explains why."
- **Tests check every screen.**
  - `tests/prereqs.mjs` opens every lesson cold, as a child jumping ahead would.
  - The play-through tests check the screen after every command.
  - Both fail if anything appears before the lesson that teaches it.

  How each concept is spotted is in `src/tests/concepts.json`. Real command output isn't checked, but everything the guide itself says is.
- **Not every guide is covered yet.** Jelly Shell 2 and Jelly Security declare `teaches`. Jelly Shell, Jelly Git and Jelly Web don't yet.

### 2. Each guide teaches its own topic, not someone else's

When a guide needs a skill from another topic, that skill belongs in the other guide. Jelly Security once taught users, groups and file locks on the side, as well as security. Children ended up learning two things at once and understanding neither. Those topics moved into Jelly Shell 2. The rule for Jelly Security is now strict: it teaches **no new commands**. It only adds ways of thinking, such as the hats, the attacker's goals and the security principles. It can also add pretend props that aren't commands, such as a permission slip or a robot.

### 3. Teach it once, then use it again

A command taught once and never used again is forgotten. When you add a concept, decide where it gets used again, later in the same guide or in the next one. For example, `>` and `>>` are taught in Jelly Shell 2 and used again in Jelly Git (`echo "OOPS" > game.py`) and Jelly Web (`curl … > page.html`).

### 4. One thing at a time

Every lesson runs in three phases, and only one is on screen at a time:

1. **The story:** why the thing exists, with one picture.
2. **Remember it:** a one-line memory hook and three short points.
3. **The mission:** one step at a time, in a live sandbox.

**Enter** always means "carry on". It presses the one big green button marked **Enter ↵**. During a lesson, the side menu slides out of the way.

### 5. Do it, don't just read it

Every concept ends with the child typing it and seeing what happens. Mission steps check what the child actually did (the file exists, the lock changed, the program ran), not whether they typed the exact letters shown. Any reasonable way of doing the step counts.

### 6. A shell that explains

A real shell says `No such file or directory` and nothing else. Shelly, the shell in these guides, explains what went wrong:
- She shows how she followed the path: `~ (home) → toys ✓ → robt.txt ✗`.
- She suggests the likely mistake: already inside that folder, wrong capitals, a missing `.txt`, or `/` where `~` was meant.
- She offers a corrected command to click.

Every error that a child is likely to hit deserves an explanation. When the sandbox behaves differently from a real computer, it says so. For example: "On a real computer, `su` asks for that person's password. The sandbox skips it."

### 7. Be real

Use real command names, real error messages (`bash: ./hello: Permission denied`, `./hello: line 1: hello: command not found`) and real behaviour. Pretend only where you have to, such as the internet, GitHub or other people, and say that it's pretend. Children will meet the real thing, and it should feel familiar.

### 8. Modern words first, old words alongside

Children will meet the older terms in films, games and videos. Say the modern term first and mention the older one once, alongside it:

| Modern (say this) | Older (they'll hear this) |
|---|---|
| attacker, malicious hacker | black hat |
| ethical hacker, security researcher, penetration tester | white hat |
| red team (allowed attackers) / blue team (defenders) | — |
| allow list / deny list | whitelist / blacklist |
| coordinated vulnerability disclosure | responsible disclosure |

### 9. Explain the name

Command names look random to a child. Every lesson explains where its word comes from, plus a joke or memory hook where one helps:
- `pwd` is **P**rint **W**orking **D**irectory ("Pirate, Where's Dis?").
- `cat` is short for con**cat**enate.
- `chmod` is **CH**ange **MOD**e.

### 10. Cliffhangers are fine, if you say so

Jelly Shell 2 deliberately lets `./hello` fail with "Permission denied" so that the next lesson can explain locks. Without warning, a child will try to fix it themselves and get lost. The message now says: "That is the cliffhanger: don't try to fix it yet!"

### 11. Kind, funny, never scary

- Short sentences and plain words, in UK English. At most one new idea per paragraph.
- Jokes are welcome. Shelly is kind, never sarcastic about a mistake.
- In Jelly Security, attackers are like the weather: always there, so you build a roof. There are no shock stories and no "a stranger will find you".

### 12. Security has its own extra rules

- **Permission first.** The child signs a permission slip for the pretend computer. Every black-hat step happens under that permission. The Computer Misuse Act (UK) is named. Before a US edition, check the US law, the CFAA.
- **Only pretend targets.** Only the sandbox and `.test` websites are attacked. No real website, account or person is ever involved.
- **Attack, fix, attack again.** Each mission is black hat (break in), then white hat (fix it with a named principle), then black hat again (watch the attack fail).
- **Not everything gets simulated.** Grooming and sextortion are never simulated. The guide points to help instead: CEOP (UK), NetSmartz (US), eSafety (AU), Childline (0800 1111 in the UK), and a trusted adult.
- **Mix real and fake.** Missions about scams include genuine messages too, so the lesson is about telling them apart, not "trust nothing".

See `plans/jelly-security.md` for the full 16-mission plan, and `research/kids-internet-security-resources.md` for the research behind it.

### 13. Rewards

Every finished lesson earns a jelly letter, which flies into the jar. The **Jelly hunt** in Jelly Shell turns path navigation into a game: letters hide in folders, and walking there with `cd` catches them. Use the jellies as rewards for doing things, not as decoration.

### 14. Watch a child use it

Nothing replaces watching a real child. Treat every moment of confusion as a bug, even if the text is technically correct. Write it down in their words and fix the cause, not just the sentence. Some past findings:

| What the child did or said | What was wrong | What changed |
|---|---|---|
| Pressed Enter to move on, and nothing happened | Enter worked in some places but not others | Enter always means "carry on", with an **Enter ↵** keycap on the button |
| "Too much on the screen", tiny text | Every panel was showing at once | Story, remember it, mission, one at a time; the menu slides away |
| `cd ~/snacks`, then `ls snacks` | `/` and `~` were never really explained | "The very top" and "Home" became lessons of their own, plus the jelly hunt game; Shelly explains paths |
| Couldn't follow web tags | Tags went by too fast, and the HTML style was inconsistent | A whole lesson on tags as boxes with lids, always in the tidy (XHTML) style: `<li></li>`, `<hr/>` |
| "Where did 600 come from? What's 5? What about 9?" | Octal numbers before binary | Letter form (`go-rw`) first; numbers only in an optional binary lesson |
| "What does sign mean? How did they make that command?" | A made-up command, never explained | Jelly Shell 2 teaches making your own command and putting it on the PATH |
| "What is Shelly?" | Shelly was introduced only in a 3D tour that Shell 2 doesn't have | Shelly introduces herself the first time she speaks |
| "Prompt?" | The word was used before it was explained, and it means something else to chatbot users | Explained at first use, including the chatbot meaning |
| "What does the lock mean?" | A padlock on a file could mean "can't read" or "can't change" | Each padlock shows what it stops: an eye (can't read), a pencil (can't change), a door (can't go in). Only after `ls -l` has been taught. Testers liked the padlocks; they only needed to know which kind |
| "How do you change a file?" | Only `>` and `>>` had been taught | A `nano` lesson; programs are now written in nano |
| Wrote `hello` into the program, then reached for `chmod` early | No feedback when the file wasn't a command; the cliffhanger wasn't flagged | Shelly checks the file, the cliffhanger is flagged, and script errors name the line |
| The last step's output vanished behind the "you earned a jelly" card | The card appeared the moment the mission finished | The output stays on screen; the big button becomes **Collect your jelly** |
| Arrow keys jumped to another lesson | → and ← moved between lessons, not through the current one | → does what the big button does, ← goes back a phase; mid-mission, → says to finish first |
| `r w x` keys appeared before they were taught | Refusals were explained with keys and owners, and key letters showed on the file tree when jumping ahead | Everything about keys waits for `taught('locks')`; `tests/prereqs.mjs` and the play-throughs now catch any concept shown early |
| "The i keeps falling over" | Thin letters had no base to stand on | Heavier base for thin letters; `tests/letters.mjs` catches it if it comes back |
| `>>` looked like `>`, `../` like `./` | The code font was joining some symbols into one shape | Font ligatures switched off everywhere |

## Prerequisite map

What each guide teaches, in order. A later guide may use anything above it.

**Jelly Shell**
- the prompt (`$` means ready), Enter, capitals matter, spaces split words
- `echo`, `pwd`, folder = directory
- `ls`, `ls -a`, options (start with `-`), hidden dot files
- `cd`, `cd ..`, plain `cd` goes home
- `/` the very top and absolute paths; relative paths; `~` home and `~/` paths
- `cat`, `cat a b`, Ctrl+D (done), Ctrl+C (stop)
- `mkdir`, `touch`, `cp`, `cp -r`, `mv` (move and rename), `rm`, `rm -r`
- Tab completion, ↑ for history, `clear`, `man`, `--help`
- Backstage: the shell finds programs in `/bin`; the kernel does the work; arguments

**Jelly Shell 2**
- accounts and users, `whoami`, `hostname`, `/home`, the prompt taken apart
- `>` and `>>`
- `nano` (Ctrl+O saves, Ctrl+X exits)
- programs are files, `which`, commands built into the shell
- scripts and `./`
- `ls -l`: file or folder, the three sets of keys `r` `w` `x`, owner and group
- `chmod` with letters (`u` `g` `o` `a`, `+` `-` `=`)
- the PATH, `echo $PATH`, your own `~/bin`
- groups, `id`, `groups`, `chgrp`
- `su`, `exit`; the root user and its two meanings; `sudo`
- `grep` (`-i` `-c` `-n` `-v`), pipes `|`, `wc -l`, `sort`, `head`
- optional: binary, and `chmod` numbers

**Jelly Git**
- `git`, `git --version`, `git config --global` (quotes around spaces)
- repository, `git init`, the hidden `.git` folder
- `git status`, the stage, `git add`, `git add .`
- `git commit -m`, `git log`, `--oneline`, HEAD
- `git diff`, `--staged`, `git restore`
- remotes, `git remote add origin`, `-v`, `git push -u origin main`, tokens instead of passwords
- `git clone`, `git pull`
- `.gitignore`, `*.log`

**Jelly Web**
- HTML, view source, `open`
- tags as boxes with lids, nesting, tags that close themselves (`<hr/>`, `<br/>`)
- lists (`<ul>` `<ol>` `<li>`), links and attributes (`href`), pictures (`src`, `alt`)
- CSS: `<style>`, rules, the cascade
- reading a URL, `curl` (`-v`, `-I`, `> file`)
- HTTP `GET`, headers, `Content-Type`, status codes (2xx–5xx, 404, 418, 500)
- DNS, IP addresses, `nslookup`, `ping` (`-c`)
- HTTPS and the padlock ("encrypted, not trustworthy"), being sent round from http to https
- GitHub Pages: publishing with `git push`

**Jelly Security** (prototype)
- black hat, white hat and grey hat; red team and blue team; permission and the law
- least privilege
- the grey zone and coordinated vulnerability disclosure

### Known gaps for planned Security missions

The 16-mission Security plan needs these, and **no guide teaches them yet**:
- web forms;
- cookies (how a site remembers you are logged in);
- query strings (`?name=value`);
- HTML comments (`<!-- -->`);
- reading a web address from right to left (`bank.com.login-check.test` is not the bank);
- `;` to run two commands in a row;
- git branches and pull requests, and viewing an old commit;
- routers and firewalls.

Each one belongs in an earlier guide (or a "part 2" of one), not in Security.
