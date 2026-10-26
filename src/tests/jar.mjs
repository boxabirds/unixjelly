// The jelly jars: finishing a lesson puts that lesson's own jelly in the shared collection and names its look on the
// "you earned" card; the card opens this course's jar, tapping a jelly shows what it taught, and the shelf shows one jar
// per course. "Save my jellies" downloads a file and "Use my existing jellies" brings it all back into an empty browser.
// Escape closes the jars, and keys pressed while they are open don't reach the lesson behind.
import fs from 'node:fs';
import { launch, guideUrl, verdict } from './lib.mjs';

const b = await launch(), p = await b.newPage({ viewport: { width: 1366, height: 768 } }), problems = [];
p.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
const home = guideUrl('jellyshell').replace('jellyshell/index.html', 'index.html');

// Another course's jellies are already in the jar, and every Shell 2 lesson but the optional binary one is done.
await p.goto(home);
await p.evaluate(() => {
  const all = {};
  for (let i = 0; i < 6; i++) all[`git:l${i}`] = { at: i, course: 'Jelly Git', word: 'commit', name: 'Save a snapshot', colour: '#9b5cff', look: 'zebra', does: 'Saves a snapshot.', ex: 'git commit' };
  localStorage.setItem('jelly.collection', JSON.stringify(all));
});
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
if (!mine?.look || !mine.does || mine.course !== 'Jelly Shell 2') problems.push(`collection entry for 101: ${JSON.stringify(mine)}`);
// Open this course's jar from the card.
await p.evaluate(() => document.querySelector('#unJar').click()); await p.waitForTimeout(800);
if (!await p.isVisible('#jarBox')) problems.push('See it in my jar did not open the jar');
const title = await p.textContent('#jarTitle'), sum = await p.textContent('#jarSum');
if (title !== 'Jelly Shell 2 jar' || sum !== `${ids.length} jellies`) problems.push(`jar says "${title}", "${sum}"`);

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
await p.screenshot({ path: 'jar.png' });

// The shelf: one jar per course, with Git's jellies in Git's jar and the planned course shut.
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
if (back !== `My jelly jars (${6 + ids.length})` || ticks !== ids.length) problems.push(`after loading: "${back}", ${ticks} lessons ticked`);
if (!/Welcome back/.test(await p.textContent('#toast'))) problems.push('no welcome back after loading');

await p.evaluate(() => document.querySelector('#jarOpen').click()); await p.waitForTimeout(300);
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
if (await p.isVisible('#jarBox')) problems.push('Escape did not close the jar');
await b.close();
verdict(problems);
