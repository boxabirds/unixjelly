# Think Jelly: plan

**Status: agreed, not built.** On the course map as "coming later" (`src/curriculum.json`).

The research is in [`docs/research/jelly-think-software-engineering-thinking.md`](../research/jelly-think-software-engineering-thinking.md): 22 missions in 6 arcs, with Wobble, a jelly robot that does exactly what it is told, programmed in a strict, growing subset of real JavaScript.

## Decisions

- **The name is Think Jelly**, not Code Jelly. It teaches a way of thinking, and stays out of the "nobody will write code again" argument.
- **Two courses:**
  - **Think Jelly 1** ("Wobble"): arcs 1 to 4 (the obedient machine; names and patterns; remembering and deciding; data), plus mission 22, the front desk that hands over to Server. Comes after Web Jelly.
  - **Think Jelly 2**: arcs 5 and 6 (what computers can't do, what is too slow, what goes wrong at once; what we shouldn't build, and what is science fiction). Comes after Think 1, alongside Server Jelly.
- **The chain after Web** is Think 1, then Server, then Storage, then SQL ([`web-part-2.md`](web-part-2.md)). Think 2 can be done alongside Server.

## Before building

- Pilot the first missions with the tester before writing the rest, as the research recommends.
- The first loop is `for (const step of times(4))`.
- Name the clashes with the shell the first time each symbol appears: `&&`, `||`, `*`, and exit code 0 (success in the shell, false in JavaScript).
