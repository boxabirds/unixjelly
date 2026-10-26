import { launch, guideUrl, unfinished, verdict } from './lib.mjs';
const b = await launch();
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
await p.goto(guideUrl('jellyshell') + '#welcome', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
const t = p.locator('#termIn');
const go = async (id) => { await p.evaluate((id) => { location.hash = id; }, id); await p.waitForTimeout(500); for (let k = 0; k < 2; k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(300); } };
const type = async (...cmds) => { for (const c of cmds) { await t.fill(c); await t.press('Enter'); await p.waitForTimeout(150); } };
const plan = {
  echo: ['echo hello', 'echo Sam', 'ECHO hi'], pwd: ['pwd', 'cd toys', 'pwd', 'cd ~'], ls: ['ls', 'ls snacks', 'ls -a'], cd: ['cd toys', 'cd ..', 'cd toys', 'cd'],
  root: ['cd /', 'ls', 'cd /tmp/dark/cave'], home: ['cd ~', 'cd ~/snacks', 'cat pizza.txt', 'cat ~/toys/robot.txt'], hunt: ['cd ~/toys', 'cd box', 'cd /tmp/dark', 'cd ~/pets', 'cd ~/snacks', 'cd ~'], cat: ['cat /home/kid/toys/robot.txt', 'cat secret-diary.txt', 'cat snacks/pizza.txt snacks/cookie.txt'], mkdir: ['mkdir fort', 'touch fort/flag.txt', 'ls fort'],
  cp: ['cp snacks/pizza.txt snacks/pizza2.txt', 'cp snacks/cookie.txt toys'], mv: ['mv pets/hamster.txt pets/sir-fluffington.txt', 'mv snacks/cookie.txt toys'], rm: ['rm snacks/broccoli.txt', 'rm toys'],
  man: ['man ls', 'cp --help'], quest: ['cat note-from-gerbil.txt', 'cd /tmp/dark/cave', 'mv gerbil.txt ~/pets'],
};
for (const [id, cmds] of Object.entries(plan)) { await go(id); await type(...cmds); await p.waitForTimeout(1300); }
await go('keys'); await type('cd'); await t.fill('cat secr'); await t.press('Tab'); await t.press('Enter'); await p.waitForTimeout(200); await t.press('ArrowUp'); await t.fill(''); await t.fill('cat'); await t.press('Enter'); await t.press('Control+c'); await type('clear'); await p.waitForTimeout(1300);
const st = await p.evaluate(() => JSON.parse(localStorage.getItem('jellyshell.v1')));
console.log(Object.keys(plan).concat('keys').map((i) => `${i}${st.done[i] ? '✓' : '✗(' + (st.steps[i] || []).map((x) => x ? 1 : 0).join('') + ')'}`).join(' '));
console.log(errs.join('\n') || 'no page errors'); verdict([...(await unfinished(p, 'jellyshell.v1')).map((id) => 'not finished: ' + id), ...errs]);
await b.close();
