# Course order, recap layer and course navigator: pedagogical assessment

**Status:**
- **Agreed:** Git comes before Web (option A), and Security splits into Part 1 (after Shell 2) and Part 2 (after Web).
- **Built:** the course order lives in `src/curriculum.json`. From it come the course map in every guide's side menu, the "Comes after" line on each welcome screen, the next course at the end of a course, and the landing page's steps. Security's prototype is now "Security Jelly 1", and its grey-zone dilemma shows the address as a picture.
- **Agreed:** Finding 3. Security uses Shell 2's people and groups exactly, and recaps Shell 2's locks instead of re-teaching them.
- **Not built yet:** the recap marks and popups, and the prerequisite interstitial. The welcome screen's "Comes after" line is the first part of the interstitial.

## The requests

1. **Course order:** Shell → Shell 2 → Security | Git | Web, the last three in any order, each expecting Shell 2.
2. **A prerequisite interstitial** at the start of each later course. It explains what the course expects, links to it, and explains the recap marks.
3. **Recap marks:** a dotted underline and a small `?` next to any Shell 1 or Shell 2 term. Clicking shows a popup with a summary, an example, the course that covers it, and a link there ("your progress is saved, come back any time").
4. **A course navigator** in the left column, and the next recommended course when a course is finished.

## What each course really uses (checked against the lessons)

| Course | Uses from Shell 1 | Uses from Shell 2 | Uses from other courses |
|---|---|---|---|
| Shell 2 | everything | — | — |
| Git | `cd`, `ls -a`, `cat` | `>` and `>>` (`echo "lives = 5" >> game.py`, `echo "OOPS" > game.py`, `.gitignore`) | — |
| Web | `cd ~/site`, `ls`, `cat`, paths | `>` (`curl … > jelly.html`) | **Git: `git add`, `git commit`, `git push`** in "Go live!" and the final quest, which says "remember Git Jelly?" |
| Security (prototype) | `cat`, paths | `whoami`, `ls -l`, `su`/`exit`, `chmod` letters, the idea that a command is a program on the PATH (`sign`) | **Web:** the grey-zone dilemma "change the number at the end of the school website's address" assumes you know a web address has parts |

## Finding 1: Web needs Git

Web can't come before Git. Its publishing lessons are three git commands, taught in Git. Options:

- **A. Order them: Shell → Shell 2 → Git → Web.** *(Recommended.)* Nothing to rewrite, and Web's "remember Git Jelly?" stays true.
- **B. Teach the three git commands again inside Web.** That's duplication, and it would make Web's publishing lessons twice as long.
- **C. Recap popups for git inside Web.** This breaks rule 1 for a child who hasn't done Git: a popup would be teaching something new, not recapping.

## Finding 2: Security splits in two

**The prototype's 3 missions** need only Shell 1 and 2, plus one fix. The "school website's address" dilemma should show the address in a picture, for example `school.test/marks?pupil=1042` with the number highlighted. Then it doesn't depend on knowing how URLs work.

**The 16-mission plan** is different. Most of its missions lean on Web or Git:

| Needs only Shell 1 + 2 | Needs Web | Needs Git | Needs something no course teaches yet |
|---|---|---|---|
| 0 Pick your hat · 3 The Guessing Machine · 5 Keys you don't need · 6 The Sandbox Room · the grey zone | 2 Knock Knock (401/429) · 4 Lookalike (URLs) · 7 Bouncer (requests) · 8 Secret Page (curl, 403) · 10 Out of the Box (DNS, ping) · 13 Who Else Can See? (HTTPS) · 14 Robo (view source) · 16 Report (`security.txt` with curl) | 7 (`.gitignore` as a deny list) · 11 Hiding Isn't Locking (git history) · 16 (pull requests) | forms (1, 9) · `;` (9, now in the shell, not yet taught) · HTML comments (14) · query strings (15) · branches and pull requests (11, 16) |

**Recommendation:**
- **Security Part 1**, the missions that need only Shell 2, can sit beside Git, as you suggested.
- **Security Part 2** comes after Web, and every mission in it declares the courses it needs. If one isn't done, the mission's interstitial says so and links to it. It doesn't use popups, because the child may never have seen that material.
- The "not taught anywhere" gaps go into Web or Shell 2 before the missions that need them.

## Finding 3: Security should use Shell 2's computer (agreed)

Shell 2's computer gives everyone their own group: `kid`'s files belong to group `kid`, and `family` is a shared club. Security's computer puts everything at home in group `family`. A child coming from Shell 2 would see the same commands behave differently, for example `ls -l` showing `kid family` instead of `kid kid`.

**Recommendation:** Security uses Shell 2's people and groups exactly. The diary's hole becomes "everyone else can read it" (`-rw-rw-rw-`, owner `kid`, group `kid`).

Security's mission text should also become recap rather than re-teaching. Today it explains the three sets of keys from scratch. It should say "Remember the locks from Shell Jelly 2?" and mark the terms for recap.

## The proposed course order

```
Shell Jelly  →  Shell Jelly 2  ─┬─→  Git Jelly  →  Web Jelly  →  Security Part 2
                                └─→  Security Part 1
```

The landing page and the course navigator would show this as a small map, not a straight list.

## How the recap layer would work, and keep to rule 1

- **Recap only covers prerequisite courses.** A course's prerequisites are declared once: Shell 2 needs Shell; Git needs Shell 2; Web needs Git; Security Part 1 needs Shell 2. The marks only appear on concepts from those courses, so they always recap and never teach something new.
- **The interstitial** opens before a course's first lesson. It lists what the course expects, grouped by course with links: "Shell Jelly 2: `>` and `>>`, `ls -l` and the three sets of keys, `su`". It explains the dotted underline and `?`, and has a button to start. It's shown once, and can be opened again from the menu.
- **Recap marks come from data, not hand-typing.** The concept list we already have (`teaches`, plus a one-line summary and an example for each concept) becomes the recap dictionary.
  - Lessons mark a term with a tiny helper, like `r('locks', 'the locks')`.
  - Commands shown in `<code>` that exactly match a prerequisite command, like `ls -l` or `chmod`, are marked automatically, but only the first time on each screen, to keep it subtle.
- **The popup** shows:
  - the idea in one sentence;
  - an example, like `chmod u+x hello`;
  - where it was taught, like "Shell Jelly 2 · Change the lock";
  - a link, with the note: "Your progress here is saved, so you can come back."
- **The tests extend naturally.** `prereqs.mjs` already fails if a concept appears early. It would also fail if a recap mark points at a concept that isn't in the course's declared prerequisites.

## Course navigator and next course

- **In the left column, a "Courses" section** shows the map above as a short list, with the current course highlighted and a tick on finished ones.
- **At the end of a course,** the final card offers the next course on the map. After Shell 2 there are two choices: Git, or Security Part 1.

## Two technical limits worth knowing

1. **Ticks across courses** (whether a *different* course is finished) work when the guides are served from one website, as in the repo, because they share browser storage. On claude.ai each guide is a separate artifact with separate storage, so there the navigator can't tell whether another course is finished.
2. **Links to a particular lesson**, like `jellyshell2/#chmod`, work in the repo. On claude.ai a link opens the other guide where you last left it, not at that lesson.

## Decisions needed

1. **Order:** Git before Web (option A)?
2. **Security:** split into Part 1 (beside Git, after Shell 2) and Part 2 (after Web)?
3. **Security's computer:** switch to Shell 2's people and groups? **Agreed.**
