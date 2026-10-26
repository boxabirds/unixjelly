// Every lesson's mission starts on a fresh sandbox: finishing one lesson inside a folder must not leave the next
// lesson's mission there (a tester found a lesson failing because of where the last one ended). A mission already
// under way keeps its sandbox when you come back to it.
import { launch, guideUrl, verdict } from './lib.mjs';

const b = await launch(), problems = [];
for (const [guide, first, cmd, next] of [['jellyshell', 'cd', 'cd toys', 'home'], ['jellyshell2', 'redirect', 'cd /tmp', 'nano']]) {
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  p.on('pageerror', (e) => problems.push(`${guide}: page error: ${e.message}`));
  const mission = async (id) => {
    await p.evaluate((id) => { location.hash = id; }, id); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('#unStay')?.click());
    for (let k = 0; k < 2; k++) { await p.evaluate(() => { if (document.querySelector('#lcard').dataset.phase !== 'mission') document.querySelector('#lNext').click(); }); await p.waitForTimeout(500); }
  };
  const prompt = () => p.textContent('#termPrompt');
  await p.goto(guideUrl(guide) + '#welcome'); await p.waitForTimeout(2500);
  await mission(first);
  await p.fill('#termIn', cmd); await p.press('#termIn', 'Enter'); await p.waitForTimeout(600);
  const there = await prompt();
  if (/:~\$/.test(there)) problems.push(`${guide}: "${cmd}" did not move away from home (${there})`);
  // the next lesson starts at home
  await mission(next);
  if (!/:~\$/.test(await prompt())) problems.push(`${guide}: the ${next} mission started at "${await prompt()}", not home`);
  // back to the first lesson, whose mission was under way: its sandbox is not wiped again
  await mission(first);
  await p.fill('#termIn', cmd); await p.press('#termIn', 'Enter'); await p.waitForTimeout(600);
  await mission(next);
  await p.fill('#termIn', 'cd ..'); await p.press('#termIn', 'Enter'); await p.waitForTimeout(400);
  const moved = await prompt();
  await p.evaluate(() => document.querySelector('#lBack').click()); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('#lNext').click()); await p.waitForTimeout(500);
  if (await prompt() !== moved) problems.push(`${guide}: going back a phase and on again reset a mission under way (${moved} → ${await prompt()})`);
  await p.close();
}
await b.close();
verdict(problems);
