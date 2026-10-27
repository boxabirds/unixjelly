// Web Jelly, played the way a child would: every lesson's demo (src/guides/web/demos.json): editing the website,
// visiting addresses, clicking links, curl, ping. The lessons build on each other (your website), so they're played in
// order. The page must not reach the real internet. Then a reload: your website must still be there.
import { launch, guideUrl, unfinished, verdict } from './lib.mjs';
import { demos, toLesson, play, done } from './play.mjs';
const b = await launch({ draw: false }), p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });
p.on('request', (r) => { if (!/^(file|data|about|blob):/.test(r.url()) && !/jsdelivr|googleapis|gstatic/.test(r.url())) errs.push('REQUEST ' + r.url()); });
await p.goto(guideUrl('jellyweb') + '#html', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
await p.evaluate(() => document.querySelector('#coach [data-g=hide]')?.click());
const D = demos('web');
for (const [id, acts] of Object.entries(D)) {
  await toLesson(p, id); await play(p, acts); await done(p, id);
  console.log(id.padEnd(6), await p.evaluate((id) => { const s = JSON.parse(localStorage.getItem('jellyweb.v1')); return (s.steps?.[id] ?? []).map((x) => x ? 1 : 0).join('') + (s.done?.[id] ? ' DONE' : ''); }, id));
}
const left = await unfinished(p, 'jellyweb.v1');
await p.reload(); await p.waitForTimeout(2500);
await toLesson(p, 'css'); const h1 = (await p.locator('#edText').inputValue()).match(/<h1>(.*?)<\/h1>/)?.[1];
if (h1 !== 'Sam the Great') errs.push(`after a reload the website was not there (h1: ${h1})`);
console.log('ERRORS', errs);
verdict([...left.map((id) => 'not finished: ' + id), ...errs]);
await b.close();
