// The jelly jars: finishing a lesson puts that lesson's own jelly in the shared collection and names its look on the
// "you earned" card; the card opens this course's jar, tapping a jelly shows what it taught, and the shelf shows one jar
// per course. "Save my jellies" downloads a file and "Use my existing jellies" brings it all back into an empty browser.
// Escape closes the jars, and keys pressed while they are open don't reach the lesson behind.
// Shaking puts the lid on, shakes the jar hard and takes the lid off again, with every jelly still inside.
// No jelly is ever inside another: after landing and after shaking, in a full jar and in Git's jar of 6 big ones.
import fs from 'node:fs';
import { launch, guideUrl, verdict, overlap, distortion } from './lib.mjs';

const b = await launch(), p = await b.newPage({ viewport: { width: 1024, height: 640 } }), problems = [];
p.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
// Jellies are sized for the fullest jar a course can give (MOST_JELLIES in engine/jar-patch.py). No course may give more.
const MOST = +fs.readFileSync(new URL('../engine/jar-patch.py', import.meta.url), 'utf8').match(/const MOST_JELLIES = (\d+);/)[1];
for (const g of ['jellyshell', 'jellyshell2', 'jellygit', 'jellyweb', 'jellysecurity']) {
  await p.goto(guideUrl(g)); const n = +(await p.textContent('#jarCount')).match(/\/ (\d+)/)[1];
  if (n > MOST) problems.push(`${g} gives ${n} jellies, more than the jar is sized for (MOST_JELLIES = ${MOST})`);
}
await p.evaluate(() => localStorage.clear()); // opening the guides recorded their progress; the checks below start empty
const home = guideUrl('jellyshell').replace('jellyshell/index.html', 'index.html');

// Another course's jellies are already in the jar, and every Shell 2 lesson but the optional binary one is done.
await p.goto(home);
await p.evaluate((MOST) => {
  const all = {};
  for (let i = 0; i < MOST; i++) all[`web:l${i}`] = { at: i, course: 'Web Jelly', word: 'html', name: 'A web page', colour: '#ff5c8a', look: 'dots', does: 'Makes a page.', ex: 'cat index.html' };
  for (let i = 0; i < 6; i++) all[`git:l${i}`] = { at: i, course: 'Git Jelly', word: 'commit', name: 'Save a snapshot', colour: '#9b5cff', look: 'zebra', does: 'Saves a snapshot.', ex: 'git commit' };
  localStorage.setItem('jelly.collection', JSON.stringify(all));
}, MOST);
await p.goto(guideUrl('jellyshell2') + '#welcome'); await p.waitForTimeout(2500);
const ids = await p.evaluate(() => [...document.querySelectorAll('.ni')].map((a) => a.dataset.id).filter((i) => i !== 'welcome'));
await p.goto(home);
await p.evaluate((ids) => localStorage.setItem('jellyshell2.v1', JSON.stringify({ done: Object.fromEntries(ids.filter((i) => i !== 'binary').map((i) => [i, true])) })), ids);

// Earn the last jelly.
await p.goto(guideUrl('jellyshell2') + '#binary'); await p.waitForTimeout(2500);
for (let k = 0; k < 2; k++) { await p.evaluate(() => { if (document.querySelector('#lcard').dataset.phase !== 'mission') document.querySelector('#lNext').click(); }); await p.waitForTimeout(500); }
for (const c of ['chmod 600 note.txt', 'chmod 644 note.txt', 'chmod 900 note.txt']) { await p.fill('#termIn', c); await p.press('#termIn', 'Enter'); await p.waitForTimeout(700); }
await p.waitForTimeout(1200); await p.evaluate(() => document.querySelector('#lNext').click()); await p.waitForTimeout(1200);
const earned = await p.evaluate(() => document.querySelector('.un-earned')?.textContent ?? '');
if (!/You earned the (zebra|spotty|stripy|swirly|sprinkle|checked|two-tone|glitter|rainbow|galaxy|classic|golden) 101 jelly!/.test(earned)) problems.push(`card says "${earned}"`);
const mine = await p.evaluate(() => JSON.parse(localStorage.getItem('jelly.collection'))['shell2:binary']);
if (!mine?.look || !mine.does || mine.course !== 'Shell Jelly 2') problems.push(`collection entry for 101: ${JSON.stringify(mine)}`);
// Open this course's jar from the card.
await p.evaluate(() => document.querySelector('#unJar').click()); await p.waitForTimeout(800);
if (!await p.isVisible('#jarBox')) problems.push('See it in my jar did not open the jar');
const title = await p.textContent('#jarTitle'), sum = await p.textContent('#jarSum');
if (title !== 'Shell Jelly 2 jar' || sum !== `${ids.length} jellies`) problems.push(`jar says "${title}", "${sum}"`);

// Keys pressed while the jar is open stay in the jar.
const before = await p.evaluate(() => location.hash);
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
if (await p.evaluate(() => location.hash) !== before) problems.push('→ moved the lesson behind the open jar');

// Let the jellies land, then tap around the bottom of the jar until one answers.
await p.waitForTimeout(12000);
const box = await p.locator('#jarCanvas').boundingBox();
let popped = false;
for (const fy of [.8, .75, .7, .85, .65]) for (const fx of [.5, .45, .55, .4, .6]) {
  if (popped) break;
  await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy); await p.waitForTimeout(300);
  popped = await p.isVisible('#jarPop');
}
if (!popped) problems.push('tapping the jellies never showed what one taught');
else if (!/jelly/i.test(await p.textContent('#jarPop'))) problems.push('the jelly label is empty');
// No jelly may be inside another: the share of any jelly's surface inside another's (tests/lib.mjs). Measured: 5% to 32%
// when jellies were dropped in on top of each other and put to sleep like that, or caught in each other's cage (1.8.3);
// 0 to 1% since.
const jarStage = () => document.querySelector('#jarCanvas').stage;
const asleep = () => p.waitForFunction(() => { const j = document.querySelector('#jarCanvas').stage; return j.shakeT == null && j.bodies.every((b) => b.sleeping); }, null, { timeout: 180000, polling: 250 }).catch(async () => problems.push(`the jellies never settled: ${await p.evaluate(() => { const j = document.querySelector('#jarCanvas').stage, a = j.bodies.filter((b) => !b.sleeping); return `${document.querySelector('#jarTitle').textContent}, ${a.length} of ${j.bodies.length} awake, speeds ${a.map((b) => b.rms.toFixed(3)).join(' ')}, press ${a.map((b) => b.press.toFixed(2)).join(' ')}, grounded ${a.map((b) => +!!b.grounded).join('')}`; })}`));
// A full jar after a shake leaves one jelly with 2-3% of its cells squashed: one or two cells, not visible, even with 20
// jellies. 5% still catches the bending that was visible at twice today's shake.
const BENT = .05;
const bent = async (when) => { const o = await distortion(p, jarStage); console.log(`jellies bent out of shape ${when}: ${(o * 100).toFixed(0)}%`); if (o > BENT) problems.push(`jellies bent out of shape ${when} (${(o * 100).toFixed(0)}% of one's cells)`); };
const inside = async (when) => { const o = await overlap(p, jarStage); console.log(`jellies inside each other ${when}: ${(o * 100).toFixed(0)}%`); if (o > .03) problems.push(`jellies inside each other ${when} (${(o * 100).toFixed(0)}% of one's surface)`); };
await asleep(); await inside('after landing'); await bent('after landing');
await p.screenshot({ path: 'jar.png' });
// Shake: the lid goes on, the jar really moves, the lid comes off, and every jelly is still inside the glass.
await p.click('#jarShake');
const jarIs = (f) => p.waitForFunction(f, null, { timeout: 60000, polling: 100 }).then(() => true, () => false);
if (!await jarIs(() => document.querySelector('#jarCanvas').stage.bounds.top < Infinity)) problems.push('shaking: the lid never went on');
if (!await jarIs(() => Math.abs(document.querySelector('#jarCanvas').stage.bounds.ox) > .005)) problems.push('shaking: the jar never moved');
// while the lid is on, nothing gets above the neck; and it's a real shake: jellies are thrown up into the top half
const lidOn = () => p.evaluate(() => { const j = document.querySelector('#jarCanvas').stage; return j.bounds.top < Infinity ? { up: j.bodies.filter((b) => b.center()[1] > j.H).length, high: Math.max(...j.bodies.map((b) => b.hi[1])) / j.H } : null; });
let thrown = 0;
for (let k = 0; k < 900; k++) { const on = await lidOn(); if (!on) break; thrown = Math.max(thrown, on.high); if (on.up > 0) { problems.push(`shaking: ${on.up} jellies above the neck with the lid on`); break; } await p.waitForTimeout(100); }
console.log(`shaking threw a jelly up to ${(thrown * 100).toFixed(0)}% of the jar's height`);
if (thrown < .8) problems.push(`shaking is too gentle: the highest jelly only reached ${(thrown * 100).toFixed(0)}% of the jar's height`);
await p.screenshot({ path: 'jar-shaking.png' });
if (!await jarIs(() => document.querySelector('#jarCanvas').stage.shakeT == null)) problems.push('shaking: the lid never came off');
const escaped = await p.evaluate(() => { const j = document.querySelector('#jarCanvas').stage; return j.bodies.filter((b) => { const c = b.center(); return Math.hypot(c[0], c[2]) > j.R || c[1] > j.H; }).length; });
if (escaped) problems.push(`shaking: ${escaped} jellies ended up outside the jar`);
await asleep(); await inside('after shaking'); await bent('after shaking');
await p.screenshot({ path: 'jar-shaken.png' });

// The shelf: one jar per course, with Git's jellies in Git's jar and the planned course shut.
await p.click('#jarBack'); await p.waitForTimeout(400);
// Git's jar: 6 jellies, the biggest size, where the overlap was first seen
await p.evaluate(() => document.querySelector('.shelf-jar[data-course=git]').click());
await p.waitForTimeout(500); await asleep(); await inside('in Git\'s jar');
// shaken three times running, as a child would
for (let k = 1; k <= 3; k++) { await p.click('#jarShake'); await p.waitForTimeout(500); await asleep(); await inside(`in Git's jar after shake ${k}`); await bent(`in Git's jar after shake ${k}`); }
await p.screenshot({ path: 'jar-git.png' });
await p.click('#jarBack'); await p.waitForTimeout(400);
// Web's jar: the most jellies a course gives (MOST) all fit: once settled, none sticks out of the top of the glass (measured: 93% of its height)
const FULL = 1;
const fill = () => p.evaluate(() => { const j = document.querySelector('#jarCanvas').stage; return Math.max(...j.bodies.map((b) => b.hi[1])) / j.H; });
await p.evaluate(() => document.querySelector('.shelf-jar[data-course=web]').click());
await p.waitForTimeout(500); await asleep(); await inside(`in a jar of ${MOST}`);
const filled = await fill(); console.log(`${MOST} jellies fill the jar to ${(filled * 100).toFixed(0)}% of its height`);
if (filled > FULL) problems.push(`${MOST} jellies don't fit: they reach ${(filled * 100).toFixed(0)}% of the jar's height`);
for (let k = 1; k <= 2; k++) { await p.click('#jarShake'); await p.waitForTimeout(500); await asleep(); await inside(`in a jar of ${MOST} after shake ${k}`); await bent(`in a jar of ${MOST} after shake ${k}`); }
await p.screenshot({ path: 'jar-full.png' });
await p.click('#jarBack'); await p.waitForTimeout(400);
const shelf = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('.shelf-jar')].map((j) => [j.dataset.course, [j.querySelector('small').textContent, j.disabled]])));
if (shelf.git?.[0] !== '6 jellies') problems.push(`Git's jar says ${JSON.stringify(shelf.git)}`);
if (!shelf.shell2?.[0].startsWith(`${ids.length} of ${ids.length}`)) problems.push(`Shell 2's jar says ${JSON.stringify(shelf.shell2)}`);
if (!shelf.security2?.[1]) problems.push('the planned course\'s jar can be opened');
await p.screenshot({ path: 'jar-shelf.png' });

// Save my jellies: a file with every jelly and this course's ticks.
const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#jarSave')]);
const saved = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
if (!saved.collection?.['shell2:binary'] || !saved.collection['git:l0'] || !saved.progress?.['jellyshell2.v1']?.done?.binary) problems.push('the save file is missing jellies or ticks');
fs.writeFileSync('my-jellies.json', JSON.stringify(saved));

// A new browser: nothing. Use my existing jellies: everything is back.
await p.goto(home); await p.evaluate(() => localStorage.clear());
await p.goto(guideUrl('jellyshell2') + '#welcome'); await p.waitForTimeout(2500);
if (await p.textContent('#jarOpen') !== 'My jelly jars (0)') problems.push('the browser was not empty');
await p.setInputFiles('#jarFile', { name: 'notes.json', mimeType: 'application/json', buffer: Buffer.from('{"hello": 1}') }); await p.waitForTimeout(500);
if (!/isn't a jelly save/.test(await p.textContent('#toast'))) problems.push('a file that isn\'t a jelly save was not refused');
await Promise.all([p.waitForEvent('load'), p.setInputFiles('#jarFile', 'my-jellies.json')]); await p.waitForTimeout(2500);
const back = await p.textContent('#jarOpen'), ticks = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('jellyshell2.v1')).done).length);
if (back !== `My jelly jars (${6 + MOST + ids.length})` || ticks !== ids.length) problems.push(`after loading: "${back}", ${ticks} lessons ticked`);
if (!/Welcome back/.test(await p.textContent('#toast'))) problems.push('no welcome back after loading');

await p.evaluate(() => document.querySelector('#jarOpen').click()); await p.waitForTimeout(300);
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
if (await p.isVisible('#jarBox')) problems.push('Escape did not close the jar');
await b.close();
verdict(problems);
