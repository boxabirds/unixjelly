# Presenter mode: assessment

**Status: built for every guide (Shell, Shell 2, Git, Web, Security), in 16:9 and 9:16.** Shift+P starts it (twice for 9:16, three times to stop), and the Overview's 3D town comes first. Tab hides the Overview's card; there are no "you earned" frames. On small screens the same show is the **mobile slideshow**, offered by the gate and tapped through. Each guide's demos are in `src/guides/<guide>/demos.json`, shared with its play-through test.

**What changed from the proposal:** it is not a screencast of the app. Each frame is one idea, full screen: the task, then the terminal (keys typed, then the result), then the file tree if it changed. The course is run once silently when presenting starts, and the frames are recorded from what really happened.

**Defaults chosen** while the questions below were open:
- the right-hand side (16:9) or the bottom (9:16) is kept clear for the head shot, and `&face=none` uses the whole frame;
- a long-form video is a course, and a Short is a lesson;
- the content is the same as the interactive course;
- you record the browser window.

## The request

Present the courses on video, with your voice-over and head shot:
- **long-form YouTube** at 16:9;
- **vertical Shorts** at 9:16.

The page drops all clutter. **Space** or **→** moves forward one beat, and **←** moves back one. Every beat animates in, and answers are typed as if by a person.

## How big a job it is

It's **mostly additive, not a rewrite.** Four things already exist that it can build on:

1. **Lessons are data.** Every lesson in every guide is a list: a story, the "remember it" points, an optional picture, and mission steps, each with a check. The engine draws all five guides from that data. A presenter can walk the same list beat by beat.
2. **The shell is predictable.** `jellysh` gives the same output for the same commands every time. So **←** doesn't need an undo: reset the sandbox and replay the earlier commands instantly, without animation. Back and forward then always agree.
3. **The scripts are already written.** Each guide's play-through test (`tests/shell2.mjs` and the others) types the commands a child would, lesson by lesson. Those are demo scripts.
4. **Keyboard stepping exists.** → and ← already move through a lesson's phases.

The real work is in five places:

| Piece | What it is | Size |
|---|---|---|
| **Demo scripts in the lessons** | Move each test's commands into the lesson data (`demo: [...]`), so the tests and the presenter share one script. Most demo actions are typed commands. Some guides also need other actions: typing in nano (Shell 2), the pretend GitHub (Git), clicks in the pretend browser (Web), and picking an answer (Security). | medium (one-off; makes the tests simpler too) |
| **The beat model** | Turn a lesson into beats. The order: the title (the jelly letters drop), the story, each point appearing, the picture, then for each mission step: show the task, type the command at human speed, press Enter, show the output, tick it. A course gets an intro (where it sits on the course map) and an outro (its jar filling up). | medium |
| **The 16:9 stage** | A fixed 1920 × 1080 frame scaled into the window, so every recording has the same pixels. No side menu, buttons or handles, and bigger type. A **keep-clear area** for your head shot, so nothing important sits under your face. Small progress dots. | medium |
| **The 9:16 stage** | A different layout, not just a squeeze. The jelly word sits on top, then the card, then the terminal. The file tree comes in only when a beat needs it. One Short per lesson. | medium |
| **Fitting** | Bigger type means some lessons' text won't fit. The existing fit test gains the two presenter sizes, and long texts get a shorter presenter version where needed. | small to medium |

**Optional:** a **notes window**. A second window, kept in step with the first, shows the voice-over prompts and what the next beat will be. You'd keep it on your other screen.

## Suggested order

1. **Shell 2, 16:9 only.** Demo scripts, the beat model, the stage, typing, back and forward. This proves the design on the guide with the most moving parts in its terminal (nano, `su`, the padlocks).
2. **The 9:16 layout,** still on Shell 2.
3. **The other guides,** adding their special demo actions (GitHub, the browser, the hats).
4. **The notes window, intros and outros.**

## Questions that change the design

1. **Head shot:** where does it go? In a corner over the frame (I keep that corner clear), or in a band of its own? For Shorts, at the top or the bottom?
2. **Video size:** is a long-form video one whole course, and a Short one lesson?
3. **Content:** the same as the interactive course, or trimmed for video (for example, skipping optional lessons, or only the key mission steps)?
4. **Notes window:** wanted?
5. **Recording:** you record the browser window (for example with OBS), and the page only has to give exact 1920 × 1080 or 1080 × 1920 frames. Is that how you want to record?
