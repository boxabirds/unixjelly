// Renders the site's pictures with the Overview kit, so they are the same jelly as the guides:
//   src/icons/icon-{32,180,192}.png   the jelly kid: browser tab (32), iPhone home screen (180), Android (192)
//   src/icons/og.jpg                   the link-preview picture (1200 × 630): the Overview house and the name
// Run from src/ after changing them: node tools/make-icons.mjs. Needs Python with Pillow, which squeezes the icons to
// 64 colours (the tab icon is under 1 KB, the others about 5 KB). The build copies them into the site.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { launch } from '../tests/lib.mjs';
const src = process.cwd().endsWith('/out') ? '../..' : '.'; // lib.mjs moves into tests/out
const read = (f) => fs.readFileSync(`${src}/${f}`, 'utf8');
const page = (name, kit) => { fs.writeFileSync(`${src}/build/${name}.html`, read(`tools/${name}-page.html`).replace('/*KIT*/', kit).replace('/*FONT_JSON*/', read('fonts/titan.json'))); return `file://${fs.realpathSync(`${src}/build/${name}.html`)}`; };
fs.mkdirSync(`${src}/build`, { recursive: true }); fs.mkdirSync(`${src}/icons`, { recursive: true });
const icon = page('icon', read('engine/overview-kit.js')), og = page('og', read('engine/overview-kit.js') + '\n' + read('guides/shell/overview.js'));
const b = await launch();
const shoot = async (url, w, h, type) => {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.goto(url); await p.waitForFunction(() => document.documentElement.dataset.ready, null, { timeout: 120000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const shot = await p.screenshot(type === 'jpeg' ? { type, quality: 82 } : { type }); await p.close(); return shot;
};
const big = await shoot(icon, 512, 512, 'png');
fs.writeFileSync(`${src}/build/icon-512.png`, big);
fs.writeFileSync(`${src}/icons/og.jpg`, await shoot(og, 1200, 630, 'jpeg'));
await b.close();
execFileSync('python3', ['-c', `
from PIL import Image
big = Image.open('${src}/build/icon-512.png').convert('RGB')
for n in (32, 180, 192):
    big.resize((n, n), Image.LANCZOS).quantize(colors=64, method=Image.Quantize.MEDIANCUT).save(f'${src}/icons/icon-{n}.png', optimize=True)
`]);
console.log('wrote', fs.readdirSync(`${src}/icons`).map((f) => `${f} ${fs.statSync(`${src}/icons/${f}`).size}`).join(', '));
