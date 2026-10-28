# Working on the Jelly guides

Five interactive guides that teach children (about 9 to 14) the command line, git, the web and security. The source is in `src/`, and the guide folders at the top of the repo are built from it. Never edit a guide folder by hand: change `src/` and run `./src/build.sh`.

Read these before changing anything a learner sees:
- `docs/pedagogy.md`: the teaching rules, and the prerequisite map of which guide teaches what. Its first section, "The rules on one screen", is the checklist every change must pass. The two most broken: define every term in plain English before using it, and give terms from earlier courses a dotted underline with a pop-up explanation.
- `docs/design.md`
- `docs/new-lesson.md`

## Rule zero: assess the teaching before you build

Every request that changes what a learner sees or reads needs a written **pedagogical assessment** first, *before any code*. Requests from the project owner are included. "What a learner sees" means lesson text, a Shelly message or tip, a story picture, a file tree marker, a new command or option, or any element that shows information.

The assessment has five parts:

1. **What will be on screen.** List every command, option, symbol, term and visual convention the change shows. That includes things that look harmless: `r w x`, `~`, a padlock, the word "prompt", Shelly's name.
2. **Where each is taught.** Look up each one in the prerequisite map (`docs/pedagogy.md`) and in the lessons' `teaches` lists. Give the guide and lesson, or say "not taught anywhere".
3. **When it will appear.** Name every lesson and phase where it can appear. Consider a child working in order, a child who jumps ahead from the menu, and a child who types something early.
4. **Gaps.** Anything that can appear before the lesson that teaches it.
5. **Recommendation.** For each gap, choose one:
   - teach it first, saying which lesson or which guide;
   - hide it until it's taught, using `taught('concept')`;
   - reword it without the concept;
   - drop it.

   If the request itself conflicts with a teaching rule, say so plainly and propose an alternative.

What to do with the assessment:
- **Gaps or conflicts:** give the assessment to the owner and agree the approach before building.
- **No gaps:** include a short version (a sentence or two) in your reply and carry on.

**Never show a concept before it is taught.** This rule has been broken repeatedly: `chmod 600` before binary, `whoami` and `sign` with no introduction, "prompt" and "Shelly" undefined, and `r w x` keys shown before the locks lesson. The assessment exists to stop the next one.

## How prerequisites are enforced in code

| Piece | What it does |
|---|---|
| `teaches` and `previews` | Each lesson in a guide's `lessons.js` lists the concept ids it `teaches`, and any it deliberately `previews` (mentions on purpose, early, with an explanation). |
| `taught('concept')` | Returns true only once the lesson that teaches the concept is finished, or while the child is in it. Concepts from earlier guides count as taught. Any code that shows a concept must check it first: Shelly messages, tips, notes, file tree markers. For example, in Shell Jelly 2, refusals before "Read the locks" say "The computer said no. The lesson Read the locks explains why" instead of talking about keys. |
| `src/tests/concepts.json` | How to spot each concept on screen: CSS selectors, patterns in commands shown, patterns in words. When you add a concept, add how to spot it here. |
| `src/tests/prereqs.mjs` | Opens every lesson cold, as a child jumping ahead would, and checks each phase. |
| The play-through tests (`shell2.mjs`, `security.mjs`) | Check the screen after every command. |
| `src/tests/help.mjs` | Plays every step of every module with "Do it for me". Each step needs a hint (the "?") and a `doIt` that makes its own check pass. A terminal step that names its commands in `<code>` gets both by default (`engine/help-patch.py`); any other step needs its own. |

Real command output is not checked. When a child types `ls -l` early, the real computer answers, and Shelly's tip explains it. Everything the guide itself says is checked.

Security Jelly and Shell Jelly 2 declare `teaches`. **Shell Jelly, Git Jelly and Web Jelly don't yet**, so the tests can't check them. Add `teaches` and detectors to a guide the next time you work on it.

## Definition of done

1. A pedagogical assessment was written, and agreed if it found a gap.
2. `./src/build.sh` succeeds, and the build output is committed with the source.
3. `cd src && CHROMIUM=/path/to/chromium npm test` prints PASS for every test. That includes `prereqs`, `fit` and `letters`.
4. You looked at screenshots of every changed screen at 900 × 560 and 1366 × 768.
5. `src/VERSION` is bumped for a release. The build stamps it, with a fingerprint of the guides, on the landing page.
6. Docs are updated:
   - the prerequisite map, if something new is taught;
   - the "what testers found" table in `docs/pedagogy.md`, if this came from a child's confusion;
   - `docs/new-lesson.md`, if the process changed.

## The course order

`src/curriculum.json` is the only place that says which course comes before which. The landing page, the course map in each guide, the "Comes after" line and the next-course buttons are all built from it, so never write course order into a guide's text or into `index.html` by hand. A course may only use what its `needs` (and their needs) teach. When a new course needs another, add it to `needs` first, then check the dependency holds (see rule zero).

## The shell

All five guides share one shell: `src/shell/jellysh.js`, a self-contained module with its own Node test (`tests/jellysh.mjs`, checked against real bash). Guides plug in commands with `SH.define()` and their teaching voice with hooks. They never patch the shell. Its deliberate differences from bash are listed in `src/shell/README.md`.

## Performance

Some children have old computers. A change to the 3D or the physics must not make the guides slower.
- **Measure before and after:** run `node tests/perf.mjs` on the old build and the new one, on the same machine. It prints the work done per 3 seconds of jelly time for dropping letters, a filling jar and a settled jar.
- **Things that stay still must sleep:** a settled jar should cost almost nothing.
- **Nothing allocated in the physics loop:** reuse arrays, so old computers don't stall collecting garbage.

## Other house rules

- UK English, short sentences, one new idea per paragraph. Shelly is kind and never sarcastic.
- Security Jelly teaches **no new commands**. Anything it needs comes from an earlier guide.
- Use real command names and real error messages. Pretend only where necessary, and say when the sandbox differs from a real computer.
- Modern terms first, with the older ones alongside (allow list / whitelist).
- **Enter** and **→** do what the big green button does. **←** goes back a phase. The end of a mission waits on **Collect your jelly**, so the child can read the last output.
