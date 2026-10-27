// Git Jelly, played the way a child would: every lesson's demo (src/guides/git/demos.json) typed into the page.
// The lessons build on each other, so they're played in order without resetting. Then two typos, to check git's
// helpful replies, and the git map's final state.
import { launch, guideUrl, unfinished, verdict } from './lib.mjs';
import { demos, toLesson, play, done } from './play.mjs';
const b = await launch({ draw: false }), p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });
await p.goto(guideUrl('jellygit') + '#git', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
const lastLines = (n) => p.evaluate((n) => [...document.querySelectorAll('#termOut .ln')].slice(-n).map((l) => l.textContent).join('\n'), n);
const D = demos('git');
for (const [id, acts] of Object.entries(D)) { await toLesson(p, id); await play(p, acts); await done(p, id); }
await play(p, ['git log --oneline', 'git comit -m x', 'git push origin master']); console.log('--- log and typos ---\n' + await lastLines(14));
const st = await p.evaluate(() => JSON.parse(localStorage.getItem('jellygit.v1')));
console.log('\nLESSONS DONE:', Object.keys(D).map((i) => `${i}${st.done[i] ? '✓' : '✗(' + (st.steps[i] || []).map((x) => x ? 1 : 0).join('') + ')'}`).join(' '));
console.log('git map text:', (await p.evaluate(() => document.querySelector('#map').innerText)).replace(/\n+/g, ' | ').slice(0, 600));
console.log(errs.join('\n') || 'no page errors');
verdict([...(await unfinished(p, 'jellygit.v1')).map((id) => 'not finished: ' + id), ...errs]);
await b.close();
