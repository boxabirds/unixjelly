// Jump straight to every lesson, as a child clicking around the menu would, and check each phase of it
// (the story, "remember it" and the first mission step) for concepts that a later lesson teaches.
// Concepts and how to spot them: tests/concepts.json. Lessons say what they teach with `teaches`.
import { launch, guideUrl, leaks, verdict } from './lib.mjs';
const guides = process.argv[2] ? [process.argv[2]] : ['jellyshell2', 'jellysecurity'];
const b = await launch({ draw: false }), problems = [];
for (const guide of guides) {
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto(guideUrl(guide) + '#welcome', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
  const ids = await p.evaluate(() => [...document.querySelectorAll('.ni')].filter((a) => a.dataset.teaches !== undefined && a.dataset.teaches !== '' || a.dataset.previews).map((a) => a.dataset.id));
  for (const id of ids) {
    await p.evaluate(() => localStorage.clear());
    await p.evaluate((id) => { location.hash = id; }, id); await p.waitForTimeout(500);
    for (const ph of ['meet', 'brain', 'mission']) {
      await p.evaluate((ph) => document.querySelector(`#lPhases [data-p=${ph}]`).click(), ph); await p.waitForTimeout(300);
      problems.push(...await leaks(p, guide, { earlier: true }));
    }
  }
  console.log(guide, ids.length, 'lessons checked');
  if (!ids.length) problems.push(`${guide}: no lessons say what they teach, so nothing was checked`);
  await p.close();
}
const unique = [...new Set(problems)];
unique.forEach((x) => console.log('  ' + x));
verdict(unique);
await b.close();
