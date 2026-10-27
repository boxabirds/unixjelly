import { launch, guideUrl, verdict } from './lib.mjs';
const b = await launch({ draw: false });
// Usage: node tests/fit.mjs [guide-folder] [width-to-screenshot]
const [shots] = [process.argv[3]], guides = process.argv[2] ? [process.argv[2]] : ['jellyshell', 'jellyshell2', 'jellygit', 'jellyweb', 'jellysecurity'], problems = [];
for (const guide of guides) {
for (const [W, H] of (process.env.SIZES ?? '900x560,1024x640,1366x768,1440x900,1920x1080').split(',').map((s) => s.split('x').map(Number))) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(guideUrl(guide) + '#welcome', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
  const ids = await p.evaluate(() => [...document.querySelectorAll('.ni')].map((a) => a.dataset.id).concat('recap'));
  const bad = [];
  for (const id of ids) {
    await p.evaluate((id) => { location.hash = id; }, id); await p.waitForTimeout(['whole', 'recap', 'html', 'echo', 'git'].includes(id) ? 900 : 350);
    const lesson = await p.evaluate(() => !document.querySelector('#p-lesson').hidden);
    for (const ph of lesson ? ['meet', 'brain', 'mission'] : ['-']) {
      if (lesson) { await p.evaluate((ph) => { document.querySelector(`#lPhases [data-p=${ph}]`).click(); }, ph); await p.waitForTimeout(250); }
      const measure = () => p.evaluate(() => { const P = [...document.querySelectorAll('.panel')].find((x) => !x.hidden); return [...P.querySelectorAll('[data-fit]')].filter((e) => !e.classList.contains('map-list')).filter((e) => e.offsetParent).map((e) => [e.className.split(' ')[0], e.scrollHeight - e.clientHeight, getComputedStyle(e).getPropertyValue('--fit')]).filter((d) => d[1] > 1); });
      // The side menu slides away when a lesson opens, and text is refitted when its box stops changing. Measure once
      // nothing is sliding any more (a slow machine can take seconds), then once more if needed.
      const settled = () => p.waitForFunction(() => !document.getAnimations().some((a) => a instanceof CSSTransition && a.playState === 'running'), null, { timeout: 15000 }).then(() => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
      await settled(); let o = await measure();
      if (o.length) { await p.waitForTimeout(1500); await settled(); o = await measure(); }
      if (o.length) bad.push(`${id}/${ph}:${JSON.stringify(o)}`);
      if (shots && W === +shots) await p.screenshot({ path: `fc-${guide}-${id}-${ph}-${W}.png` });
    }
  }
  console.log(guide, `${W}x${H}`, bad.join(' ') || 'all fit', errs.length ? 'ERR ' + errs : '');
  if (bad.length || errs.length) problems.push(`${guide} ${W}x${H}`);
  await p.close();
}
}
verdict(problems);
await b.close();
