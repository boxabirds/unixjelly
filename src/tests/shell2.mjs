// Jelly Shell 2, played the way a child would: every lesson's demo (src/guides/shell2/demos.json) typed into the page.
// After every action, nothing on screen may come from a lesson not reached yet (tests/concepts.json).
// Prints each lesson's terminal and saves a screenshot (tests/out/s2-<lesson>.png). node tests/shell2.mjs <lesson> plays one.
import { launch, guideUrl, unfinished, verdict, leaks } from './lib.mjs';
import { demos, toLesson, play } from './play.mjs';
const b = await launch(), p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(guideUrl('jellyshell2') + '#welcome', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
const lines = () => p.evaluate(() => [...document.querySelectorAll('#termOut .ln')].map((l) => '   ' + l.textContent).join('\n'));
for (const [id, acts] of Object.entries(demos('shell2'))) {
  if (process.argv[2] && id !== process.argv[2]) continue;
  await toLesson(p, id);
  await p.evaluate(() => { document.querySelector('#termOut').innerHTML = ''; });
  await play(p, acts, async () => { errs.push(...await leaks(p, 'jellyshell2')); });
  await p.screenshot({ path: `s2-${id}.png` });
  console.log(`\n### ${id} ${JSON.stringify(await p.evaluate((id) => JSON.parse(localStorage.getItem('jellyshell2.v1')).steps[id], id))}\n${await lines()}`);
}
console.log('\nDONE', JSON.stringify(await p.evaluate(() => JSON.parse(localStorage.getItem('jellyshell2.v1')).done))); console.log('ERRORS', errs);
verdict([...(process.argv[2] ? [] : (await unfinished(p, 'jellyshell2.v1')).map((id) => 'not finished: ' + id)), ...errs]);
await b.close();
