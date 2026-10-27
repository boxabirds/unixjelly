// Shared set-up for the browser tests: start Chromium, find a built guide, and report PASS or FAIL.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname), repo = path.resolve(here, '../..');
// Screenshots land in tests/out, which git ignores.
fs.mkdirSync(path.join(here, 'out'), { recursive: true }); process.chdir(path.join(here, 'out'));

export const guideUrl = (folder) => 'file://' + path.join(repo, folder, 'index.html');
// CHROMIUM=/path/to/chromium picks a browser. Without it, Playwright uses the installed Google Chrome.
// The 3D uses the machine's GPU, falling back to software WebGL (SwiftShader) where there is none. JELLY_GL=swiftshader
// forces software everywhere, for identical pixels on every machine.
// draw: false is for tests that only check text, layout or physics: the 3D still runs, but isn't painted, which is
// most of the cost without a GPU. JELLY_DRAW=1 paints it anyway, to look at those tests' screenshots.
export async function launch({ draw = true } = {}) {
  const b = await chromium.launch({
    ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : { channel: 'chrome' }),
    headless: false, args: ['--headless=new', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--hide-scrollbars', ...(process.env.JELLY_GL === 'swiftshader' ? ['--use-gl=angle', '--use-angle=swiftshader'] : [])],
  });
  if (draw || process.env.JELLY_DRAW) return b;
  const off = () => { window.JELLY_DRAW = false; };
  const page = b.newPage.bind(b), context = b.newContext.bind(b);
  b.newPage = async (o) => { const p = await page(o); await p.addInitScript(off); return p; };
  b.newContext = async (o) => { const c = await context(o); await c.addInitScript(off); return c; };
  return b;
}
// Every lesson in the guide's menu that has not earned its jelly yet.
export const unfinished = (p, key) => p.evaluate((key) => {
  const done = JSON.parse(localStorage.getItem(key) ?? '{}').done ?? {};
  return [...document.querySelectorAll('.ni')].map((a) => a.dataset.id).filter((id) => !['welcome', 'whole', 'backstage'].includes(id) && !done[id]);
}, key);
export function verdict(problems) {
  console.log(problems.length ? `FAIL ${problems.join('; ')}` : 'PASS');
  process.exitCode = problems.length ? 1 : 0;
}

// Prerequisite leaks: is anything on the lesson screen from a concept this child hasn't been taught yet?
// Allowed: concepts taught by lessons already finished, the open lesson's own concepts and its deliberate previews.
// With earlier: true (used when jumping straight to a lesson), every lesson before this one counts as taught.
const CONCEPTS = JSON.parse(fs.readFileSync(path.join(here, 'concepts.json'), 'utf8'));
export const leaks = (p, guide, { earlier = false } = {}) => !CONCEPTS[guide] ? [] : p.evaluate(({ C, key, earlier }) => {
  const panel = document.querySelector('#p-lesson');
  if (!panel || panel.hidden) return [];
  const done = JSON.parse(localStorage.getItem(key) ?? '{}').done ?? {}, here = location.hash.slice(1), allowed = new Set(), owner = {};
  const items = [...document.querySelectorAll('.ni')], at = items.findIndex((a) => a.dataset.id === here);
  items.forEach((a, i) => {
    const list = (k) => (a.dataset[k] || '').split(' ').filter(Boolean);
    list('teaches').forEach((c) => { owner[c] = a.dataset.id; if (done[a.dataset.id] || i === at || (earlier && i < at)) allowed.add(c); });
    if (i === at) list('previews').forEach((c) => allowed.add(c));
  });
  // getClientRects is empty for anything inside display:none. (offsetParent can't be used: SVG elements don't have one.)
  const shown = (el) => el.getClientRects().length > 0;
  const lessonEls = ['#lStands', '#lTitle', '#lWhy', '#lVisual', '#lPoints', '#lMnem', '#lTaskN', '#lTask'].map((s) => document.querySelector(s)).filter((el) => el && shown(el));
  // the guide's own words in the terminal: Shelly, tips and notes. Real command output and typed commands don't count.
  // A guide line starts with Shelly, a tip or a note. Real output (like an ls -l row) starts with the command's own text.
  const guideLines = [...panel.querySelectorAll('#termOut .ln')].filter((l) => l.firstChild === l.firstElementChild && l.firstElementChild?.matches('.shelly, .tip, .mute'));
  const codeText = [...lessonEls.flatMap((el) => [...el.querySelectorAll('code, kbd')].map((c) => c.textContent)), ...guideLines.map((l) => l.textContent)];
  const wordText = [...lessonEls.map((el) => el.textContent), ...guideLines.map((l) => l.textContent)];
  const out = [];
  for (const [c, d] of Object.entries(C)) {
    if (allowed.has(c) || !owner[c]) continue;
    const say = (where, what) => out.push(`"${c}" (taught in ${owner[c]}) shown in ${here}: ${where} ${JSON.stringify(what.trim().slice(0, 90))}`);
    for (const sel of d.selectors ?? []) { const el = [...panel.querySelectorAll(sel)].find(shown); if (el) say(`element ${sel}`, el.textContent); }
    for (const re of d.code ?? []) { const t = codeText.find((x) => new RegExp(re).test(x)); if (t !== undefined) say('code', t); }
    for (const re of d.words ?? []) { const t = wordText.find((x) => new RegExp(re, 'i').test(x)); if (t !== undefined) say('text', t); }
  }
  return [...new Set(out)];
}, { C: CONCEPTS[guide], key: guide + '.v1', earlier });

// How far the jellies on a stage are inside each other: the biggest share of any jelly's drawn surface that is inside
// another jelly's drawn surface (0 when none overlap). It works on any stage, letters or jar, and uses only what is
// drawn, not the physics, so it can't be fooled by the physics' own idea of where things are. stage: a function, run in
// the page, that returns the stage.
export const overlap = (p, stage) => p.evaluate((src) => {
  const B = (0, eval)(src)().bodies.filter((b) => b.lo && b.mesh.visible);
  const world = (b) => { const V = b.bIds.length / 4, w = new Float64Array(V * 3); for (let v = 0; v < V; v++) for (let s = 0; s < 4; s++) for (let k = 0; k < 3; k++) w[v * 3 + k] += b.x[b.bIds[v * 4 + s] * 3 + k] * b.bW[v * 4 + s]; return w; };
  // a point is inside a closed surface when a ray from it crosses the surface an odd number of times
  const inside = (w, idx, x, y, z) => {
    let c = 0;
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, e = idx[t + 2] * 3;
      const d0 = (w[b + 1] - w[a + 1]) * (z - w[a + 2]) - (w[b + 2] - w[a + 2]) * (y - w[a + 1]), d1 = (w[e + 1] - w[b + 1]) * (z - w[b + 2]) - (w[e + 2] - w[b + 2]) * (y - w[b + 1]), d2 = (w[a + 1] - w[e + 1]) * (z - w[e + 2]) - (w[a + 2] - w[e + 2]) * (y - w[e + 1]);
      if ((d0 > 0 && d1 > 0 && d2 > 0) || (d0 < 0 && d1 < 0 && d2 < 0)) c += (w[a] * d1 + w[b] * d2 + w[e] * d0) / (d0 + d1 + d2) > x ? 1 : 0;
    }
    return c % 2 === 1;
  };
  let worst = 0;
  for (const P of B) for (const Q of B) {
    if (P === Q || ![0, 1, 2].every((k) => P.lo[k] < Q.hi[k] && Q.lo[k] < P.hi[k])) continue;
    const wp = world(P), wq = world(Q), idx = Q.geo.index.array;
    let n = 0;
    for (let v = 0; v < wp.length; v += 9) if (inside(wq, idx, wp[v], wp[v + 1], wp[v + 2])) n++;
    worst = Math.max(worst, n / (wp.length / 9));
  }
  return worst;
}, stage.toString());

// How bent out of shape the jellies on a stage are: the biggest share of any jelly's cage cells (tetrahedra) that are
// turned inside out or squashed to under half their size (0 when every jelly has sprung back). A jelly that is left
// like this stays bent for good, because its own springs pull it towards the wrong shape.
export const distortion = (p, stage) => p.evaluate((src) => {
  const SQUASHED = .5;
  let worst = 0;
  for (const b of (0, eval)(src)().bodies.filter((b) => b.lo)) {
    const x = b.x;
    let bad = 0;
    for (const e of b.elements) {
      const [o0, o1, o2, o3] = e.o, d = (k, o) => x[o + k] - x[o0 + k];
      const v = (d(0, o1) * (d(1, o2) * d(2, o3) - d(2, o2) * d(1, o3)) - d(1, o1) * (d(0, o2) * d(2, o3) - d(2, o2) * d(0, o3)) + d(2, o1) * (d(0, o2) * d(1, o3) - d(1, o2) * d(0, o3))) / 6;
      if (v < e.vol * SQUASHED) bad++;
    }
    worst = Math.max(worst, bad / b.elements.length);
  }
  return worst;
}, stage.toString());
