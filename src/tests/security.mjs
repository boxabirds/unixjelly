// Jelly Security, played the way a child would: every lesson's demo (src/guides/security/demos.json), including the
// grey-zone choice cards (a wrong pick first, then the right one). After every action, nothing on screen may come
// from a lesson not reached yet (tests/concepts.json).
import { launch, guideUrl, unfinished, verdict, leaks } from './lib.mjs';
import { demos, toLesson, play } from './play.mjs';
const b = await launch(), p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(guideUrl('jellysecurity') + '#welcome', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
const lines = (n) => p.evaluate((n) => [...document.querySelectorAll('#termOut .ln')].slice(-n).map((l) => '   ' + l.textContent).join('\n'), n);
for (const [id, acts] of Object.entries(demos('security'))) {
  await toLesson(p, id); await play(p, acts, async () => { errs.push(...await leaks(p, 'jellysecurity')); });
  await p.screenshot({ path: `sec-${id}.png` }); console.log(`### ${id}\n${await lines(12)}`);
}
const st = await p.evaluate(() => JSON.parse(localStorage.getItem('jellysecurity.v1')));
console.log('DONE', JSON.stringify(st.done), JSON.stringify(st.steps)); console.log(errs);
verdict([...(await unfinished(p, 'jellysecurity.v1')).map((id) => 'not finished: ' + id), ...errs]);
await b.close();
