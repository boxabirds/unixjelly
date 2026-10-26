// Presenter mode: every lesson's demo really finishes its mission, each kind of frame shows full screen with nothing
// from the app around it, ← then → comes back to the same frame, and presenting saves nothing.
// Screenshots of one frame of each kind, wide (16:9) and tall (9:16), go to tests/out/present-<guide>-*.png.
// Run after ./build.sh: node tests/present.mjs [guide-folder]   (default: every guide that has demos)
import { launch, guideUrl, verdict } from './lib.mjs';

const b = await launch(), problems = [];
for (const guide of process.argv[2] ? [process.argv[2]] : ['jellyshell', 'jellyshell2']) {
for (const [shape, w, h] of [['wide', 1920, 1080], ['tall', 608, 1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', (e) => problems.push(`${guide} ${shape}: page error: ${e.message}`));
  const url = guideUrl(guide).replace('index.html', `index.html?present=${shape}`);
  await p.goto(url); await p.waitForTimeout(3000);
  const info = await p.evaluate(() => ({ frames: document.documentElement.dataset.prFrames?.split(' ') ?? [], ok: +document.documentElement.dataset.prOk, key: document.documentElement.dataset.prKey }));
  const missions = info.frames.filter((k) => k === 'earned').length;
  if (!missions || info.ok !== missions) problems.push(`${shape}: ${info.ok} of ${missions} demos finished their mission`);
  if (await p.isVisible('.app')) problems.push(`${shape}: the app shows behind the frames`);

  // One screenshot of each kind of frame, opened cold the way a reload would.
  const open = async (i) => { await p.evaluate(([k, i]) => sessionStorage.setItem('jelly.presentBeat.' + k, i), [info.key, i]); await p.reload(); await p.waitForTimeout(2500); };
  for (const kind of ['intro', 'whole', 'title', 'story', 'visual', 'point', 'task', 'term', 'files', 'nano', 'earned', 'jar']) {
    const i = info.frames.indexOf(kind);
    if (i < 0) { if (!['visual', 'nano', 'whole'].includes(kind) || (kind === 'whole' && guide === 'jellyshell')) problems.push(`${shape}: no ${kind} frame`); continue; } // not every guide has pictures or nano
    await open(i);
    const k = await p.evaluate(() => document.querySelector('#prStage').dataset.k);
    if (k !== kind) problems.push(`${shape}: frame ${i} shows ${k}, not ${kind}`);
    if (kind !== 'jar' && kind !== 'intro' && kind !== 'title' && !(await p.textContent('#prBody')).trim()) problems.push(`${shape}: the ${kind} frame is empty`);
    await p.screenshot({ path: `present-${guide}-${shape}-${kind}.png` });
  }

  // ← then → comes back to the same terminal frame, typing finished.
  const t = info.frames.indexOf('term');
  await open(t);
  const before = await p.innerHTML('#prBody');
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(600); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(4000);
  if (await p.innerHTML('#prBody') !== before) problems.push(`${shape}: ← then → did not come back to the same frame`);
  if (await p.evaluate((k) => localStorage.getItem(k), info.key)) problems.push(`${shape}: presenting saved progress`);
  await p.close();
}
}
await b.close();
verdict(problems);
