// Channel art (YouTube, TikTok, Instagram, X, LinkedIn): a word in jelly letters, each letter in one of the jar's looks, rendered by the
// guides' own engine at full quality. Run from src/ after ./build.sh: node tools/brand.mjs [out-dir]
// It loads the built Jelly Shell 2 page (its font has capitals) with a full-window jelly stage added on top (build/brand.html), waits for the
// letters to drop and settle, and saves each picture. Without a GPU this is slow: a few minutes a picture.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { launch } from '../tests/lib.mjs';

const src = process.cwd().endsWith('/out') ? '../..' : '.'; // lib.mjs moves into tests/out
const out = fs.realpathSync(process.argv[2] ?? src) + (process.argv[2] ? '' : '/brand');
fs.mkdirSync(out, { recursive: true });

// The stage, added at the end of the page's module so it can use JellyStage, paintJelly and the looks.
const STAGE = `
{ const q = new URLSearchParams(location.search);
  if (q.has('brand')) {
    const fill = +q.get('fill'), c = document.createElement('canvas');
    for (const el of document.body.children) el.style.display = 'none'; // the guide underneath would keep its own 3D running
    Object.assign(c.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: 9999 }); document.body.append(c);
    const st = new JellyStage(c, { word: q.get('word'), size: .07, bg: q.get('bg'), floor: q.get('floor'), colorOffset: 0, frame: 1.2, lookY: .5 });
    stages.delete(st); st.speed.n = 999; st.rich = true; // its own loop, always full quality
    st.setWord(q.get('word'), q.get('colours').split(','));
    const looks = q.get('looks').split(','), cols = q.get('colours').split(',');
    st.bodies.forEach((b, i) => { paintJelly(b, looks[i % looks.length], cols[(i + 3) % cols.length]); b.mesh.material.dispersion = .35; });
    // stack: one row of letters per word, each row further back, so tall pictures read "unix" above "jelly"
    const size = st.opts.size, rows = q.has('stack') ? q.get('word').split(' ') : [], gap = size * 2.4, back = gap * Math.max(0, rows.length - 1);
    if (rows.length) {
      let at = 0; st.wordWidth = 0;
      rows.forEach((word, k) => {
        const row = st.bodies.slice(at, at += word.length), x0 = row[0].homeX - row[0].width / 2, x1 = row.at(-1).homeX + row.at(-1).width / 2;
        st.wordWidth = Math.max(st.wordWidth, x1 - x0);
        row.forEach((b) => {
          b.homeX -= (x0 + x1) / 2; b.cx = b.homeX; b.place(size * (1.2 + Math.random() * .8), (Math.random() - .5) * .12);
          for (let i = 0; i < b.N; i++) b.x[i * 3 + 2] -= back - k * gap;
          b.prev.set(b.x); b.updateBox();
        });
      });
      const half = st.wordWidth / 2 + size * .9;
      Object.assign(st.bounds, { x0: -half, x1: half, z0: st.bounds.z0 - back });
    }
    // the word fills the given share of the width (the banner's safe area), centred
    const fit = st.resize.bind(st);
    st.resize = () => {
      fit(); const cam = st.camera, t = Math.tan(cam.fov * Math.PI / 360), up = +q.get('up');
      const d = Math.max(st.wordWidth * .5 / (t * cam.aspect * fill), size * 1.1 / t);
      cam.position.set(0, size * .5 + d * up, d - back / 2); cam.lookAt(0, size * .35, -back / 2);
      st.scene.fog.near = d * 1.4; st.scene.fog.far = d * 4;
    };
    st.resize();
    // Drop and settle with physics alone (drawing is the slow part without a GPU), then draw a second or so of frames, which the eyes and the bits inside follow.
    const still = () => st.bodies.every((b) => b.sleeping);
    let frames = 0;
    const draw = () => { requestAnimationFrame(draw); st.tick(1 / 60); frames++; };
    const settle = () => {
      for (let i = 0; i < 120; i++) st.simulate(1 / 60);
      if (still() || st.t > 20) requestAnimationFrame(draw); else setTimeout(settle);
    };
    settle();
    window.brandStage = st; window.brandStill = () => frames > 90 && still();
  }
}
`;
const page = fs.readFileSync(`${src}/build/jelly-shell2.html`, 'utf8'), at = page.lastIndexOf('</script>');
fs.writeFileSync(`${src}/build/brand.html`, page.slice(0, at) + STAGE + page.slice(at));
const url = `file://${fs.realpathSync(`${src}/build/brand.html`)}`;

// Three variations, so the art can be rotated. Each letter gets a look; colours follow the house palette. pair: the
// round profile picture's two letters, which get bright looks of their own.
const VARIANTS = [
  { name: 'a', bg: '#d4eeff', floor: '#bfe3ff', colours: ['#ff4d6d', '#ffc61a', '#62c934', '#3a5bff', '#9b5cff', '#ff8a2b'],
    looks: ['spotty', 'golden', 'glitter', 'galaxy', 'rainbow', 'sprinkle', 'zebra', 'swirly', 'checked'], pair: ['spotty', 'glitter'] },
  { name: 'b', bg: '#fff0b3', floor: '#ffe7a8', colours: ['#9b5cff', '#ff4d6d', '#3a5bff', '#62c934', '#ff8a2b', '#ffc61a'],
    looks: ['sprinkle', 'golden', 'stripy', 'galaxy', 'spotty', 'two-tone', 'glitter', 'rainbow', 'golden'], pair: ['sprinkle', 'golden'] },
  { name: 'c', bg: '#eadcff', floor: '#dcc8ff', colours: ['#62c934', '#3a5bff', '#ff8a2b', '#ff4d6d', '#ffc61a', '#9b5cff'],
    looks: ['glitter', 'checked', 'spotty', 'swirly', 'golden', 'galaxy', 'sprinkle', 'stripy', 'two-tone'], pair: ['glitter', 'spotty'] },
];
// What each channel asks for. fill: how much of the width the word takes (the YouTube banner keeps it inside the
// safe area, 1235 of 2560, which every device shows).
// up: how high the camera sits, as a share of its distance. Tall pictures stack the words and look down more.
const SHOTS = [
  { file: 'youtube-banner', w: 2560, h: 1440, word: 'Unix Jelly', fill: .4, up: .1 },
  { file: 'profile', w: 800, h: 800, word: 'UJ', fill: .8, up: .1, pair: 1 }, // every channel's round picture
  { file: 'x-header', w: 1500, h: 500, word: 'Unix Jelly', fill: .62, up: .1 },
  { file: 'linkedin-banner', w: 1584, h: 396, word: 'Unix Jelly', fill: .58, up: .1 },
  { file: 'vertical', w: 1080, h: 1920, word: 'Unix Jelly', fill: .84, up: .6, stack: 1 }, // TikTok, Reels and Stories
  { file: 'instagram-post', w: 1080, h: 1350, word: 'Unix Jelly', fill: .78, up: .55, stack: 1 },
];

const b = await launch();
// ONLY picks pictures by name, for trying things out: ONLY=profile-a, or ONLY='-a$' for one variation
for (const v of VARIANTS) for (const s of SHOTS) {
  if (process.env.ONLY && !new RegExp(process.env.ONLY).test(`${s.file}-${v.name}`)) continue;
  const p = await b.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  const q = new URLSearchParams({ brand: 1, word: s.word, fill: s.fill, up: s.up, ...(s.stack && { stack: 1 }), bg: v.bg, floor: v.floor, colours: v.colours.join(','), looks: (s.pair ? v.pair : v.looks).join(',') });
  await p.goto(`${url}?${q}`, { timeout: 180000 });
  await p.waitForFunction(() => window.brandStill?.(), null, { timeout: 240000, polling: 2000 }).catch(() => console.log('  (still wobbling; taking it anyway)'));
  await p.waitForTimeout(1500);
  const file = `${out}/${s.file}-${v.name}.png`;
  await p.screenshot({ path: file }); await p.close();
  console.log('wrote', file);
}
await b.close();
// The YouTube watermark is the profile picture, small.
if (!process.env.ONLY) for (const v of VARIANTS) execFileSync('python3', ['-c', `from PIL import Image; Image.open('${out}/profile-${v.name}.png').resize((150, 150), Image.LANCZOS).save('${out}/youtube-watermark-${v.name}.png')`]);
console.log('done');
