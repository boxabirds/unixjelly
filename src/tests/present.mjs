// Presenter mode, in every guide: every lesson's demo really finishes its mission, the kinds of frame each guide
// needs are there and show full screen with nothing from the app around it, ← then → comes back to the same frame,
// and presenting saves nothing. Jelly Shell is checked frame kind by frame kind; the other guides check their own
// special frames (nano, GitHub's buttons and the git map, the editor and the browser, the choice cards).
// On a phone, the gate's mobile slideshow: tap right and left, turning the phone, nothing saved.
// Screenshots go to tests/out/present-<guide>-<shape>-<kind>.png.
// Run after ./build.sh: node tests/present.mjs [guide-folder]   (default: every guide)
import { launch, guideUrl, verdict } from './lib.mjs';

const ALL = ['intro', 'whole', 'title', 'story', 'visual', 'point', 'task', 'term', 'files', 'jar'];
const GUIDES = {
  jellyshell: { shapes: ['wide', 'tall'], shots: ALL, need: ['intro', 'whole', 'title', 'story', 'point', 'task', 'term', 'files', 'jar'] },
  jellyshell2: { shapes: ['wide'], shots: ['term', 'nano', 'files'], need: ['term', 'nano', 'files'] },
  jellygit: { shapes: ['wide'], shots: ['click', 'files'], need: ['whole', 'term', 'click', 'files'] },
  jellyweb: { shapes: ['wide', 'tall'], shots: ['edit', 'browser', 'click'], need: ['whole', 'term', 'edit', 'browser', 'click'] },
  jellysecurity: { shapes: ['wide'], shots: ['choice', 'task'], need: ['term', 'choice'] },
};
const ready = (p) => p.waitForFunction(() => document.documentElement.dataset.prFrames, null, { timeout: 300000 });

const b = await launch(), problems = [];
for (const [guide, G] of Object.entries(GUIDES).filter(([g]) => !process.argv[2] || g === process.argv[2])) {
for (const shape of G.shapes) {
  const p = await b.newPage({ viewport: shape === 'tall' ? { width: 608, height: 1080 } : { width: 1920, height: 1080 } });
  const say = (m) => problems.push(`${guide} ${shape}: ${m}`);
  p.on('pageerror', (e) => say(`page error: ${e.message}`));
  await p.goto(guideUrl(guide).replace('index.html', `index.html?present=${shape}`)); await ready(p);
  const info = await p.evaluate(() => ({ frames: document.documentElement.dataset.prFrames.split(' '), ok: +document.documentElement.dataset.prOk, demos: +document.documentElement.dataset.prDemos, key: document.documentElement.dataset.prKey }));
  const missions = info.demos;
  if (!missions || info.ok !== missions) say(`${info.ok} of ${missions} demos finished their mission`);
  for (const k of G.need) if (!info.frames.includes(k)) say(`no ${k} frame`);
  if (await p.isVisible('.app')) say('the app shows behind the frames');
  if (info.frames.includes('earned')) say('a "you earned" frame: not for videos');

  // One screenshot of each kind of frame, opened cold the way a reload would.
  const open = async (i) => { await p.evaluate(([k, i]) => sessionStorage.setItem('jelly.presentBeat.' + k, i), [info.key, i]); await p.reload(); await ready(p); await p.waitForTimeout(2500); };
  for (const kind of G.shots) {
    const i = info.frames.indexOf(kind);
    if (i < 0) continue; // not every guide has pictures or an overview; the ones it needs are checked above
    await open(i);
    const k = await p.evaluate(() => document.querySelector('#prStage').dataset.k);
    if (k !== kind) say(`frame ${i} shows ${k}, not ${kind}`);
    if (!['jar', 'intro', 'title'].includes(kind) && !(await p.textContent('#prBody')).trim()) say(`the ${kind} frame is empty`);
    await p.screenshot({ path: `present-${guide}-${shape}-${kind}.png` });
  }

  // Tab hides the Overview's card and brings it back.
  if (info.frames.includes('whole')) {
    await open(info.frames.indexOf('whole'));
    // waits for the fade, which takes a few frames: slow when a heavy 3D scene is drawn without a GPU
    const fades = (hidden) => p.waitForFunction((hidden) => { const o = +getComputedStyle(document.querySelector('.pr-town-card')).opacity; return hidden ? o < .1 : o > .9; }, hidden, { timeout: 20000 }).then(() => true, () => false);
    await p.keyboard.press('Tab'); if (!(await fades(true))) say('Tab did not hide the Overview card');
    await p.keyboard.press('Tab'); if (!(await fades(false))) say('Tab did not bring the Overview card back');
  }

  // ← then → comes back to the same terminal frame, typing finished.
  await open(info.frames.indexOf('term'));
  const before = await p.innerHTML('#prBody');
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(600); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(4000);
  if (await p.innerHTML('#prBody') !== before) say('← then → did not come back to the same frame');
  if (await p.evaluate((k) => localStorage.getItem(k), info.key)) say('presenting saved progress');
  await p.close();
}
}

// A phone gets the gate, not the guide, and the gate's button starts the show as a mobile slideshow you tap through.
for (const guide of Object.keys(GUIDES).filter((g) => !process.argv[2] || g === process.argv[2])) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }), p = await ctx.newPage();
  const say = (m) => problems.push(`${guide} phone: ${m}`);
  p.on('pageerror', (e) => say(`page error: ${e.message}`));
  await p.goto(guideUrl(guide));
  if (await p.isVisible('.app') || !(await p.isVisible('#slides'))) say('no gate with a slideshow button');
  const saved = await p.evaluate(() => JSON.stringify(localStorage));
  await p.tap('#slides'); await ready(p);
  const key = await p.evaluate(() => document.documentElement.dataset.prKey), beat = () => p.evaluate((k) => +sessionStorage.getItem('jelly.presentBeat.' + k), key);
  if (!(await p.evaluate(() => document.documentElement.classList.contains('present-tall')))) say('upright phone did not get 9:16');
  await p.touchscreen.tap(330, 420); await p.waitForTimeout(400); await p.touchscreen.tap(330, 420); await p.waitForTimeout(400);
  if (await beat() !== 2) say(`two taps on the right went to frame ${await beat()}, not 2`);
  await p.touchscreen.tap(40, 420); await p.waitForTimeout(400);
  if (await beat() !== 1) say(`a tap on the left went to frame ${await beat()}, not 1`);
  await p.setViewportSize({ width: 844, height: 390 }); await p.waitForTimeout(400);
  if (!(await p.evaluate(() => document.documentElement.classList.contains('present-wide')))) say('turning the phone did not switch to 16:9');
  if (await p.evaluate(() => JSON.stringify(localStorage)) !== saved) say('the slideshow saved progress');
  await ctx.close();
}
await b.close();
verdict(problems);
