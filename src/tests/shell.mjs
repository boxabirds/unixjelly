// Jelly Shell, played the way a child would: every lesson's demo (src/guides/shell/demos.json) typed into the page,
// then every lesson must have earned its jelly with no page errors.
import { launch, guideUrl, unfinished, verdict } from './lib.mjs';
import { demos, toLesson, play } from './play.mjs';
const b = await launch(), p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
await p.goto(guideUrl('jellyshell') + '#welcome', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
const D = demos('shell');
for (const [id, acts] of Object.entries(D)) { await toLesson(p, id); await play(p, acts); await p.waitForTimeout(1000); }
const st = await p.evaluate(() => JSON.parse(localStorage.getItem('jellyshell.v1')));
console.log(Object.keys(D).map((i) => `${i}${st.done[i] ? '✓' : '✗(' + (st.steps[i] || []).map((x) => x ? 1 : 0).join('') + ')'}`).join(' '));
console.log(errs.join('\n') || 'no page errors');
verdict([...(await unfinished(p, 'jellyshell.v1')).map((id) => 'not finished: ' + id), ...errs]);
await b.close();
