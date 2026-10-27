# How the jelly letters tidy themselves up

Children drag the jelly letters, fling them and knock them over. When everything has stopped moving, the letters stand back up and hop home into their word, in order, without falling over. This page explains how. First in plain English, then the technical detail.

The code is in `src/engine/shell.html`: `JellyStage.shuffleHome`, `JellyStage.carry`, `JellyBody.standUpIfFallen`, `JellyBody.isFallen` and `JellyBody.facingFront`. The jar (`JarStage`) doesn't use it: jellies in a jar stay where they land.

## In plain English

**Wait until everyone has calmed down.** Nothing happens while a child is dragging a letter, while letters are still dropping in, or while any letter is wobbling. Once everything has been still for a moment, the tidying starts.

**First, anyone lying down gets up.** A letter that has been on its side for about a second springs back upright, like a weeble. If it's close to its home spot, it stands up there; otherwise it stands up where it is.

**Then, who is out of place?** Each letter has a home spot in the word. A letter more than a whisker away from its spot is a *stray*. A letter that is home but facing the wrong way is just turned round.

**An invisible hand carries each stray home.** The hand holds the letter by the top, with one finger on each side so it can't spin, and carries it in small bouncy hops. The jelly squishes and dangles as it goes, because it is still real jelly being carried, not a picture being slid across the screen.

**If the way is blocked, go round.** A letter can walk straight home only if nobody stands between it and its spot, and its spot is empty. Otherwise it steps out into a lane, either in front of the row or behind it. It walks along the lane to just in front of its spot, waits there if the spot is still taken, and steps in when it's free. Each lane holds one letter at a time.

**Land gently.** On arrival the hand lowers the letter onto its spot over a moment before letting go, so thin letters like `i` and `l` don't topple.

**If a letter gets bumped out of place on the way, it becomes a stray too**, and gets carried home in its turn.

**If it all gets tangled up, give up gracefully.** After 20 seconds of trying, every letter pops straight home.

**Finish with a squish.** When everyone is home, they all do a tiny happy hop, one after another, and there is a ding.

## Is it a standard algorithm?

No. It's a hand-made combination of well-known ideas:

- **A greedy, reactive planner.** Every frame, each stray looks at where everyone is now and decides its next move. There is no plan made in advance. Game AI often works this way. It's simple and copes with children interfering, but it can't see ahead, which is why it can get stuck (below).
- **Passing lanes, like railway sidings.** On a single line, two trains can't pass each other unless one pulls into a siding. The two lanes are the sidings. Puzzles about this are studied as *pebble motion on graphs* and *train shunting*.
- **Many movers sharing space.** Planning paths for many movers that mustn't collide is *multi-agent path finding* (MAPF). Real MAPF solvers plan all the paths together, or reserve space over time. This one only shares out the two lanes.
- **Moving by physics, not by animation.** The hand is the same soft position constraint as the mouse drag, solved inside the jelly's physics, an extended position-based dynamics (XPBD) soft body. That is what makes the letters squish and swing while they travel. Most games would play an animation here instead.

## Technical detail

### When it runs

`shuffleHome(dt)` is called from `JellyStage.simulate` after every physics frame.

| Condition | Effect |
|---|---|
| a child is dragging (`stage.drag`), or any letter hasn't dropped in yet (`t < spawnAt`) | stop: any carried letter is released and homing ends |
| not homing, and every letter is still for 0.6 s | start homing |

**Still** means, for every letter: not grabbed, not fallen, and either asleep or on the floor with an RMS speed under 0.03.

**Fallen** (`isFallen`) means the letter's height is less than 75% of its standing height. Standing back up is separate from homing: in `simulate`, a letter that has been asleep for 1.1 s calls `standUpIfFallen()`. That re-places it upright with a small drop, at home if within 0.6 letter-sizes of its spot, otherwise where it lies. Homing waits for it, because a fallen letter isn't still.

### Starting: who is a stray

A letter's home is `(homeX + restMean.x, restMean.z)`, the centre of its rest shape when standing in its spot.

| Test | Rule |
|---|---|
| at home (`atHome`) | within 0.1 sizes along the row (x) and 0.2 sizes front to back (z) |
| stray | not at home when homing starts |
| home but turned (`facingFront` false) | snapped straight: re-placed upright at home, facing front. `facingFront` takes the line between the letter's two foot nodes and needs it to point along +x (dot product above 0.9) |
| becomes a stray mid-homing | a non-stray pushed more than 0.5 sizes along the row or 0.6 front to back |

### Carrying: the invisible hand

`carry(b)` grabs the nodes in the top 40% of the letter's rest shape, split into a left half and a right half. Each half is held by its own position constraint. The two targets keep their rest spacing, so the letter can't twist round the hand.

Each constraint is solved like the mouse drag, `solveGrabPoint`: XPBD with compliance `α = 1 / (90 h²)`, so the hand is soft. The jelly's own shear and bulk constraints still act, which is why the letter squishes and dangles.

The hand's target moves towards the current waypoint at 0.16 world units a second (about 2.3 letter heights a second, at the guides' letter size of 0.07). It bobs in hops: the height is `y0 + 0.06·size + 0.25·size·|sin(π·phase)|`, with the phase advancing 1.7 hops a second. Each new hop plays a small boing.

### Routing

The **main row** is everything within 0.7 sizes of the home line (z). For a stray at `c`, heading to home `(hx, hz)`:

- **spot free:** no other letter in the main row overlaps the home spot. The overlap distance is the two half-widths plus 0.3 × the letter gap.
- **between:** some other letter in the main row lies between `c.x` and `hx`.
- **blocked** = between, or the spot isn't free.

| State | Waypoint |
|---|---|
| no lane, not blocked | straight home `(hx, hz)` |
| no lane, blocked | claim a lane: the front (`hz + 1.15·size`) if free, else the back (`hz − 1.15·size`). If neither is free, release the letter for this frame (it waits) |
| in a lane, not yet in it | step out sideways: `(c.x, lane)` |
| in the lane, not yet level with home | move along the lane: `(hx, lane)` |
| level with home, spot taken | hold in front of the gap |
| level with home, spot free | step in: `(hx, hz)` |

### Landing and finishing

On reaching home while carried, the hand eases the letter 20% of the way to its exact rest position each frame for 0.4 s, then lets go and frees its lane. A letter that arrives home uncarried but turned round is snapped straight.

Homing ends when no letter moved this frame and everything is still. The letters then do a small hop in place, 70 ms apart, with a ding.

**Timeout:** after 20 s of homing, every letter is released and re-placed at home.

### Where it gets stuck, by design

These were found by running the real code, not by reasoning about it. Every ordering of the five letters of `mkdir` was dropped onto the stage, one letter per wrong spot, and played to the end (120 orderings):

| Outcome | Orderings |
|---|---|
| tidied up | 69 (median 7.7 s, slowest 20.2 s) |
| hit the 20-second timeout | 29 |
| never started | 22 |

Every ordering of three letters tidies up, including a full cycle (c in a's spot, a in t's, t in c's): as soon as one letter steps into a lane, its old spot is free for another. Cycles alone don't cause deadlock. Three things do:

- **Hold and wait (deadlock).** A letter keeps its lane while it waits for its spot. If the letters sitting in those spots are themselves waiting for a lane, nobody can move. With the word back to front, `m` takes the front lane and `k` the back lane. Each waits by its spot, but `r` is in m's spot and `i` is in k's, and they are waiting for a lane. It is the classic deadlock: resources (lanes) held while waiting, no way to take one back, and a circle of waiting. Only the 20-second timeout ends it. With two lanes, this needs at least two letters waiting for lanes, so it doesn't happen with three letters.
- **"Home" and "free" disagree.** A letter counts as home within 0.1 sizes of its exact spot. But a spot counts as free only if no one is within the two half-widths plus 0.3 × the gap. At rest, the letters are packed with only 4–10% to spare on that test (p and w in `pwd`: 1.04). So a neighbour nudged a hair off its spot still counts as home, yet looks like it's in the way. The waiting letter holds in its lane until the timeout. In `pwd`, dragging just the `p` to the far end does it.
- **Never still, so never starts.** Homing needs every letter still: asleep, or on the floor with an RMS speed under 0.03. A wide letter squeezed into a narrow letter's spot (an `m` where the `k` was) stays wedged against its neighbours, and they jiggle at around 0.04–0.06 for ever. The 0.6-second wait for calm never completes, so tidying never starts. All 22 "never started" orderings were like this.

Two smaller ones:
- **Turning is a snap, not a carry.** Wrong-facing letters are re-placed rather than turned in the hand.
- **Idle cost.** Even when every letter is asleep, it measures every letter's centre each frame, which creates new arrays. That's small, but it breaks the "nothing allocated in the physics loop" rule in `CLAUDE.md`.

Each of these is an example on the under-the-hood page (`under-the-hood/reshuffle.html`, from `src/tools/under-the-hood/reshuffle.js`). `tests/reshuffle.mjs` plays every example and checks it still ends the way the page says, so a change to the rules can't quietly make the page wrong.

### How it could improve

1. **Plan the moves once.** Getting letters home is a permutation: each letter belongs in one spot. Split it into cycles. For each cycle, park one letter in a lane, shift the rest home one by one, then bring the parked one in. That is cycle sort with one buffer slot. It always finishes, in about one move per letter plus one per cycle, and it never holds a lane while waiting, so it can't deadlock. With ten letters at most, the planning cost is nothing.
2. **More parking.** Add lanes further out, or a parking spot at each end, so letters never queue for a lane.
3. **One measure for "home" and "free".** Give the spot-free test the same slack as "home" (0.1 sizes), or, when a spot is overlapped by its neighbour, nudge that neighbour back to its exact home first.
4. **Don't hold a lane while waiting.** If the letter in your spot needs a lane, give yours up. Or keep a who-waits-for-whom graph, and when it has a cycle, send one letter to park. Keep the timeout only as a last resort, and make it a hop home rather than a teleport.
5. **Unwedge before waiting for calm.** If letters overlap and keep jiggling for more than a second or two, push them apart (or carry the wedged one out), rather than waiting for a calm that won't come.
6. **Carry the awkward ones.** Lift fallen letters and turn wrong-facing ones upright in the hand, using a third grab point to control the turn, instead of re-placing them. Start when the letters are "mostly still", with a cap.
7. **Sleep properly.** Skip all of this when every letter is asleep, and reuse the arrays.

Measure any change with `node tests/perf.mjs` before and after, on the same machine, and check `node tests/letters.mjs` still passes.
