// Help with every step, in every module: the "?" has a hint that makes something glow, and "Do it for me" really does
// the step, so it ticks by its own check (before the guide would force the tick). Doing every step this way is also a
// play-through of every mission. An exercise done with help gives no jelly, but counts as done.
// node tests/help.mjs [folder] [exercise,exercise…]
import { launch, guideUrl, verdict } from './lib.mjs';

const GUIDES = process.argv[2] ? [process.argv[2]] : ['jellyshell', 'jellyshell2', 'jellygit', 'jellysecurity', 'jellyweb'];
const ONLY = process.argv[3]?.split(',');
const HOVER_MS = 450, TICK_MS = 500, CHEER_MS = 1300; // the bubble opens after 200 ms; the forced tick waits 700 ms
const b = await launch({ draw: false }), problems = [];

for (const g of GUIDES) {
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  p.on('pageerror', (e) => problems.push(`${g}: page error: ${e.message}`));
  await p.goto(guideUrl(g)); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  const ids = await p.evaluate(() => [...document.querySelectorAll('.ni')].map((a) => a.dataset.id));
  let exercises = 0, steps = 0;
  for (const id of ids) {
    if (ONLY && !ONLY.includes(id)) continue;
    await p.goto(guideUrl(g) + '#' + id); await p.waitForTimeout(700);
    if (await p.evaluate(() => document.querySelector('#p-lesson').hidden)) continue; // not an exercise: the welcome page, the overview…
    for (let k = 0; k < 2; k++) if (await p.evaluate(() => document.querySelector('#lcard').dataset.phase !== 'mission')) { await p.evaluate(() => document.querySelector('#lNext').click()); await p.waitForTimeout(350); }
    const n = await p.evaluate(() => document.querySelectorAll('#lPips .pip').length);
    if (!n) continue;
    exercises++;
    const fr = g === 'jellyweb' ? p.frames().find((f) => f.url().startsWith('about:srcdoc')) : null;
    let warned = false;
    for (let k = 0; k < n; k++) {
      steps++;
      if (await p.evaluate((k) => document.querySelectorAll('#lPips .pip')[k]?.classList.contains('ok'), k)) continue; // an earlier step did this one too
      const step = (await p.textContent('#lTask')).replace(/\s+/g, ' ').slice(0, 70), where = `${g} ${id} step ${k + 1} ("${step}")`;
      if (await p.isHidden('#lHint')) { problems.push(`${where}: no hint`); }
      else {
        await p.hover('#lHint'); await p.waitForTimeout(HOVER_MS);
        const hint = await p.evaluate(() => document.querySelector('#knPop.on')?.textContent ?? '');
        const glows = await p.evaluate(() => document.querySelectorAll('.hint-glow').length) + (fr ? await fr.evaluate(() => document.querySelectorAll('.hint-glow').length + document.querySelector('iframe').contentDocument.querySelectorAll('.hint-glow').length) : 0);
        if (hint.length < 10) problems.push(`${where}: the hint bubble is empty`);
        if (!glows) problems.push(`${where}: the hint makes nothing glow`);
        await p.mouse.move(5, 760); await p.waitForTimeout(300);
      }
      if (await p.isHidden('#lDoIt')) { problems.push(`${where}: no "Do it for me"`); break; }
      await p.evaluate(() => document.querySelector('#lDoIt').click());
      if (!warned) {
        if (!await p.isVisible('#doitPop')) problems.push(`${where}: "Do it for me" didn't warn about the jelly`);
        await p.evaluate(() => document.querySelector('#doitYes').click()); warned = true;
      } else if (await p.isVisible('#doitPop')) problems.push(`${where}: warned again in an exercise already done with help`);
      await p.waitForTimeout(TICK_MS);
      if (!await p.evaluate((k) => document.querySelectorAll('#lPips .pip')[k]?.classList.contains('ok'), k)) {
        const out = g === 'jellyweb' ? '' : await p.evaluate(() => document.querySelector('#termOut')?.textContent.slice(-160).replace(/\s+/g, ' '));
        problems.push(`${where}: "Do it for me" didn't make the step tick by its own check${out ? ` (the terminal says: …${out})` : ''}`);
        await p.waitForTimeout(CHEER_MS);
        if (!await p.evaluate((k) => document.querySelectorAll('#lPips .pip')[k]?.classList.contains('ok'), k)) { problems.push(`${where}: not ticked even by force`); break; }
      }
      await p.waitForTimeout(CHEER_MS);
    }
    if (await p.evaluate(() => [...document.querySelectorAll('#lPips .pip')].every((x) => x.classList.contains('ok')))) {
      if (!/Finish the exercise/.test(await p.textContent('#lNext'))) problems.push(`${g} ${id}: the button doesn't say Finish the lesson`);
      await p.evaluate(() => document.querySelector('#lNext').click()); await p.waitForTimeout(600);
      if (await p.isVisible('#upnext') && !/No jelly this time/.test(await p.textContent('#upnext'))) problems.push(`${g} ${id}: the card doesn't say no jelly`);
      if (await p.isVisible('#unStay')) await p.click('#unStay');
    }
  }
  const count = await p.textContent('#jarCount');
  if (!/^0 \//.test(count)) problems.push(`${g}: exercises done with help gave jellies (${count})`);
  console.log(`${g}: ${exercises} exercises, ${steps} steps`);
  if (!exercises) problems.push(`${g}: found no exercises to play`);
  await p.close();
}
await b.close();
verdict(problems);
