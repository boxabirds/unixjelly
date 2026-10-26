// How much computer time the jelly physics costs, for comparing before and after a change. Not a pass/fail test:
// the numbers depend on the machine, so run it on the old build and the new one, on the same machine, and compare.
// Some children have old computers: a change to the 3D or the physics must not make these numbers worse.
// Run after ./build.sh: node tests/perf.mjs [guide-folder]   (prints milliseconds of work per 3 seconds of jelly time)
import fs from 'node:fs';
import path from 'node:path';
import { launch } from './lib.mjs';

const here = path.dirname(new URL(import.meta.url).pathname), guide = process.argv[2] ?? 'jellyshell2';
// A copy of the guide that lets this script reach its 3D stages. The guide itself never exposes them.
const page = path.join(here, 'out', 'perf.html');
fs.writeFileSync(page, fs.readFileSync(path.join(here, '../..', guide, 'index.html'), 'utf8').replace('const stages = new Set();', 'const stages = new Set(); window.__stages = stages;'));

const b = await launch(), runs = [];
for (let r = 0; r < 3; r++) {
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto('file://' + page + '#welcome'); await p.waitForTimeout(2500);
  await p.evaluate(() => { const all = {}; for (let i = 0; i < 15; i++) all[`git:l${i}`] = { at: i, course: 'Jelly Git', word: 'w', name: 'n', colour: '#9b5cff', look: 'zebra', does: '', ex: '' }; localStorage.setItem('jelly.collection', JSON.stringify(all)); });
  await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(() => { document.querySelector('#jarOpen').click(); document.querySelector('.shelf-jar[data-course=git]').click(); });
  await p.waitForTimeout(500);
  runs.push(await p.evaluate(() => {
    const all = [...window.__stages], jar = all.find((s) => s.bodies.length >= 15), letters = all.find((s) => s !== jar && s.bodies.length);
    const time = (s, steps) => { const t0 = performance.now(); for (let k = 0; k < steps; k++) s.simulate(1 / 60); return performance.now() - t0; };
    const pour = time(jar, 180); time(jar, 600);
    const settled = time(jar, 180);
    letters.drop(); const drop = time(letters, 180);
    return { 'letters dropping': drop, 'jar filling': pour, 'jar settled': settled };
  }));
  await p.close();
}
await b.close();
for (const k of Object.keys(runs[0])) console.log(`${k.padEnd(17)} ${runs.map((r) => Math.round(r[k])).join(' / ')} ms`);
