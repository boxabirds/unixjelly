// Shell Jelly, played the way a child would: every lesson's demo (src/guides/shell/demos.json) typed into the page,
// then every lesson must have earned its jelly with no page errors.
import { launch, guideUrl, unfinished, verdict } from './lib.mjs';
import { demos, toLesson, play, done } from './play.mjs';
const b = await launch({ draw: false }), p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
await p.goto(guideUrl('jellyshell') + '#welcome', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
const D = demos('shell');
for (const [id, acts] of Object.entries(D)) { await toLesson(p, id); await play(p, acts); await done(p, id); }
// The lesson's jelly letters go full screen and come back: ⤢, then Escape. While open, Enter mustn't move the lesson on.
const jelly = () => p.evaluate(() => ({ open: !document.querySelector('#jellyFull').hidden, inFull: !!document.querySelector('#jellyFull #lessonJelly'), inBox: !!document.querySelector('.ljelly #lessonJelly'), phase: document.querySelector('.lesson')?.dataset.phase, hash: location.hash }));
await p.click('#jellyGrow'); await p.waitForTimeout(500);
const opened = await jelly();
if (!opened.open || !opened.inFull) errs.push('full-screen jelly did not open with the letters in it');
await p.keyboard.press('Enter'); await p.waitForTimeout(300);
const after = await jelly();
if (after.phase !== opened.phase || after.hash !== opened.hash) errs.push('Enter moved the lesson on behind the full-screen jelly');
if (!after.open) { await p.click('#jellyGrow'); await p.waitForTimeout(500); } // Enter presses ✕, which is fine: Escape is checked on its own
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
const closed = await jelly();
if (closed.open || !closed.inBox) errs.push('Escape did not put the jelly letters back in their window');
const st = await p.evaluate(() => JSON.parse(localStorage.getItem('jellyshell.v1')));
console.log(Object.keys(D).map((i) => `${i}${st.done[i] ? '✓' : '✗(' + (st.steps[i] || []).map((x) => x ? 1 : 0).join('') + ')'}`).join(' '));
console.log(errs.join('\n') || 'no page errors');
verdict([...(await unfinished(p, 'jellyshell.v1')).map((id) => 'not finished: ' + id), ...errs]);
await b.close();
