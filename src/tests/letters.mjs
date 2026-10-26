// Do the jelly letters stay standing? Drops each word several times and watches every letter for four seconds.
// Physics is stepped directly at 60 frames a second, so slow test machines give the same answer as fast ones.
import fs from 'node:fs';
import { launch, guideUrl, verdict } from './lib.mjs';
const words = process.argv.slice(2).length ? process.argv.slice(2) : ['whoami', 'ls -l', 'git', 'mkdir'];
// A test copy of Jelly Shell 2 that lets the test reach the 3D stages.
const html = fs.readFileSync(new URL(guideUrl('jellyshell2')), 'utf8').replace('    stages.add(this);', '    stages.add(this); window.__stages = stages;');
fs.writeFileSync('letters.html', html);
const b = await launch(), p = await b.newPage({ viewport: { width: 1366, height: 768 } });
await p.goto('file://' + process.cwd() + '/letters.html#whoami', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
const problems = [];
for (const word of words) {
  const falls = await p.evaluate((word) => {
    const st = [...window.__stages].find((s) => s.bodies.length && s.canvas.id === 'lessonJelly'), letters = [...word].filter((c) => c !== ' '), fell = {};
    for (let drop = 0; drop < 8; drop++) {
      st.setWord(word);
      // watch the whole time: the engine stands a fallen letter back up after a moment, which would hide the fall
      const down = new Set();
      for (let k = 0; k < 60 * 4; k++) { st.simulate(1 / 60); if (k % 10 === 0) st.bodies.forEach((b, i) => { if (b.isFallen()) down.add(i); }); }
      down.forEach((i) => { fell[letters[i]] = (fell[letters[i]] ?? 0) + 1; });
    }
    return fell;
  }, word);
  console.log(word.padEnd(8), Object.keys(falls).length ? `fell over: ${JSON.stringify(falls)} (out of 8 drops)` : 'all standing');
  // Letters sometimes bump each other over as they land, and the engine stands them back up. That's fine.
  // A letter that falls in more than half the drops can't stand on its own, like the old i.
  for (const [ch, n] of Object.entries(falls)) if (n > 4) problems.push(`"${ch}" in ${word} fell ${n} of 8 times`);
}
verdict(problems);
await b.close();
