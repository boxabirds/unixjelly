import { launch, guideUrl, unfinished, verdict } from './lib.mjs';
const b = await launch();
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(guideUrl('jellyshell2') + '#welcome', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
const t = p.locator('#termIn');
const toMission = async () => { for (let k = 0; k < 2; k++) { await p.evaluate(() => { if (document.querySelector('#lcard').dataset.phase !== 'mission') document.querySelector('#lNext').click(); }); await p.waitForTimeout(500); } };
let mark = 0;
const run = async (...cs) => { for (const c of cs) {
  if (c.startsWith('@type:')) { await p.fill('#nanoText', c.slice(6).replace(/\\n/g, '\n')); await p.waitForTimeout(150); continue; }
  if (c.startsWith('@key:')) { await p.press(c.includes('Ctrl') || c.includes('Control') ? '#nanoText' : '#nanoText', c.slice(5)); await p.waitForTimeout(350); continue; }
  await t.fill(c); await t.press('Enter'); await p.waitForTimeout(450); } };
const fresh = () => p.evaluate((m) => { const all = [...document.querySelectorAll('#termOut .ln')]; return all.map((l) => '   ' + l.textContent).join('\n'); });
const PLAN = {
  whoami: ['whoami', 'hostname', 'ls /home'],
  redirect: ['echo I like cheese > note.txt', 'cat note.txt', 'echo and jelly >> note.txt', 'cat note.txt'],
  nano: ['nano note.txt', '@type:I like pizza\\nand jelly', '@key:Control+x', '@key:y', 'cat note.txt'],
  which: ['which ls', 'ls /bin', 'which cd'],
  dotslash: ['nano hello', '@type:hello', '@key:Control+o', '@key:Control+x', 'chmod u+x hello', './hello', 'chmod u-x hello', 'nano hello', '@type:echo Hello from my program!', '@key:Control+o', '@key:Control+x', 'cat hello', 'hello', './hello'],
  lsl: ['ls -l', 'ls -l /bin', 'ls -l /home'],
  chmod: ['chmod u+x hello', 'ls -l', './hello'],
  path: ['echo $PATH', 'mkdir ~/bin', 'mv hello ~/bin/hi', 'cd /', 'hi', 'cd'],
  groups: ['id', 'id sib', 'mkdir comics', 'chgrp family comics', 'chmod g+w comics'],
  su: ['su sib', 'whoami', 'cat diary.txt', 'touch comics/kapow.txt', 'exit'],
  sudo: ['cat /tmp/chest.txt', 'sudo whoami', 'sudo cat /tmp/chest.txt'],
  grep: ['grep cookie diary.txt', 'grep gerald story.txt', 'grep -i gerald story.txt'],
  pipe: ['grep cookie kitchen.log', 'grep cookie kitchen.log | grep sib', 'grep cookie kitchen.log | grep sib | wc -l'],
  binary: ['chmod 600 note.txt', 'chmod 644 note.txt', 'chmod 900 note.txt'],
  quest: ['mkdir clubhouse', 'chgrp family clubhouse', 'chmod o-rx clubhouse', 'echo "echo knock knock knock" > clubhouse/knock', 'chmod u+x clubhouse/knock', 'su sib', './clubhouse/knock', 'exit'],
};
const only = process.argv[2];
for (const [id, cmds] of Object.entries(PLAN)) {
  if (only && id !== only) continue;
  await p.evaluate((id) => { location.hash = id; }, id); await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('#unStay')?.click());
  await toMission();
  await p.evaluate(() => { document.querySelector('#termOut').innerHTML = ''; });
  await run(...cmds);
  await p.screenshot({ path: `s2-${id}.png` });
  const st = await p.evaluate((id) => JSON.parse(localStorage.getItem('jellyshell2.v1')).steps[id], id);
  console.log(`\n### ${id} ${JSON.stringify(st)}\n${await fresh()}`);
}
const st = await p.evaluate(() => JSON.parse(localStorage.getItem('jellyshell2.v1')).done);
console.log('\nDONE', Object.keys(st).length, JSON.stringify(st)); console.log('ERRORS', errs);
verdict([...(await unfinished(p, 'jellyshell2.v1')).map((id) => 'not finished: ' + id), ...errs]);
await b.close();
