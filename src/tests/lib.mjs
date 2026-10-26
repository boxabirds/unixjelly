// Shared set-up for the browser tests: start Chromium, find a built guide, and report PASS or FAIL.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname), repo = path.resolve(here, '../..');
// Screenshots land in tests/out, which git ignores.
fs.mkdirSync(path.join(here, 'out'), { recursive: true }); process.chdir(path.join(here, 'out'));

export const guideUrl = (folder) => 'file://' + path.join(repo, folder, 'index.html');
// CHROMIUM=/path/to/chromium picks a browser. Without it, Playwright uses the installed Google Chrome.
// Software WebGL (SwiftShader) keeps the 3D jelly working on machines and CI runners without a GPU.
export const launch = () => chromium.launch({
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : { channel: 'chrome' }),
  headless: false, args: ['--headless=new', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});
// Every lesson in the guide's menu that has not earned its jelly yet.
export const unfinished = (p, key) => p.evaluate((key) => {
  const done = JSON.parse(localStorage.getItem(key) ?? '{}').done ?? {};
  return [...document.querySelectorAll('.ni')].map((a) => a.dataset.id).filter((id) => !['welcome', 'whole', 'backstage'].includes(id) && !done[id]);
}, key);
export function verdict(problems) {
  console.log(problems.length ? `FAIL ${problems.join('; ')}` : 'PASS');
  process.exitCode = problems.length ? 1 : 0;
}
