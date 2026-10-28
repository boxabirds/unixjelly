// The Overview in every module that has one (Shell Jelly, Git): every step plays to its end without errors, the
// last one earns the Overview's jelly, and going back lands on the step before, ready to play forward again.
// Screenshots of every step go to tests/out/overview-<guide>-<n>.png. Run one guide: node tests/overview.mjs jellygit
import { launch, guideUrl, verdict } from './lib.mjs';

const b = await launch(), problems = [];
for (const [guide, key] of [['jellyshell', 'jellyshell.v1'], ['jellygit', 'jellygit.v1']].filter(([g]) => !process.argv[2] || g === process.argv[2])) {
const p = await b.newPage({ viewport: { width: 1024, height: 640 } });
const say = (m) => problems.push(`${guide}: ${m}`);
p.on('pageerror', (e) => say(`page error: ${e.message}`));
await p.goto(guideUrl(guide) + '#whole'); await p.waitForTimeout(3500);
const settle = async () => { for (let k = 0; k < 400 && await p.evaluate(() => 'playing' in document.querySelector('#town').dataset); k++) await p.waitForTimeout(250); };
const next = () => p.evaluate(() => document.querySelector('#townNext').click());
const who = () => p.textContent('#townWho');
const steps = await p.evaluate(() => document.querySelectorAll('#townDots i').length);
if (steps < 5) say(`only ${steps} steps`);
await p.screenshot({ path: `overview-${guide}-0.png` });
for (let i = 1; i < steps; i++) { await next(); await p.waitForTimeout(300); await settle(); await p.waitForTimeout(1500); await p.screenshot({ path: `overview-${guide}-${i}.png` }); }
if (!await p.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').done?.whole, key)) say('the last step did not earn the Overview jelly');
await p.evaluate(() => document.querySelector('#unStay')?.click());
const last = await who();
await p.evaluate(() => document.querySelector('#townPrev').click()); await p.waitForTimeout(1500);
if (await who() === last) say('Back did not go back a step');
await next(); await p.waitForTimeout(300); await settle();
if (await who() !== last) say(`Next after Back showed "${await who()}", not "${last}"`);
await p.close();
}
await b.close();
verdict(problems);
