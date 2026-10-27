// Channel art (YouTube, TikTok, Instagram, X, LinkedIn): "Unix Jelly" in jelly letters, each letter in one of the jar's
// looks, drawn by the guides' own engine. Run from src/ after ./build.sh:
//   node tools/brand.mjs                    writes build/channel-art.html: the art drawn live in the browser, with the
//                                           sizes, the three variations, Drop again, and Save PNG at the exact size
//   node tools/brand.mjs render [out-dir]   also renders every picture into src/brand/ (or out-dir) with no browser
//                                           window; without a GPU, about a minute a picture
// The page is the built Shell Jelly 2 page (its font has capitals) with tools/channel-art.js added to its module.
import fs from 'node:fs';
import { launch } from '../tests/lib.mjs';

const src = process.cwd().endsWith('/out') ? '../..' : '.'; // lib.mjs moves into tests/out

// Three variations, so the art can be rotated. Each letter gets a look; colours follow the house palette. pair: the
// round profile picture's two letters, which get bright looks of their own.
const VARIANTS = [
  { name: 'a', label: 'Sky', bg: '#d4eeff', floor: '#bfe3ff', colours: ['#ff4d6d', '#ffc61a', '#62c934', '#3a5bff', '#9b5cff', '#ff8a2b'],
    looks: ['spotty', 'golden', 'glitter', 'galaxy', 'rainbow', 'sprinkle', 'zebra', 'swirly', 'checked'], pair: ['spotty', 'glitter'] },
  { name: 'b', label: 'Lemon', bg: '#fff0b3', floor: '#ffe7a8', colours: ['#9b5cff', '#ff4d6d', '#3a5bff', '#62c934', '#ff8a2b', '#ffc61a'],
    looks: ['sprinkle', 'golden', 'stripy', 'galaxy', 'spotty', 'two-tone', 'glitter', 'rainbow', 'golden'], pair: ['sprinkle', 'golden'] },
  { name: 'c', label: 'Lilac', bg: '#eadcff', floor: '#dcc8ff', colours: ['#62c934', '#3a5bff', '#ff8a2b', '#ff4d6d', '#ffc61a', '#9b5cff'],
    looks: ['glitter', 'checked', 'spotty', 'swirly', 'golden', 'galaxy', 'sprinkle', 'stripy', 'two-tone'], pair: ['glitter', 'spotty'] },
];
// What each channel asks for. fill: how much of the width the word takes. up: how high the camera sits, as a share of
// its distance; tall pictures stack the words and look down more. safe: the middle part every device shows.
const SHOTS = [
  { file: 'youtube-banner', label: 'YouTube banner', w: 2560, h: 1440, word: 'Unix Jelly', fill: .4, up: .1, safe: [1235, 338],
    tip: 'TVs show all of it, phones only the middle: keep the word inside the safe area.' },
  { file: 'profile', label: 'Profile picture', w: 800, h: 800, word: 'UJ', fill: .8, up: .1, pair: 1,
    tip: 'For every channel. Shown as a circle.' },
  { file: 'youtube-watermark', label: 'YouTube watermark', w: 150, h: 150, word: 'UJ', fill: .8, up: .1, pair: 1,
    tip: 'Sits in the corner of every video.' },
  { file: 'x-header', label: 'X header', w: 1500, h: 500, word: 'Unix Jelly', fill: .62, up: .1,
    tip: 'Your profile picture covers the lower left corner.' },
  { file: 'linkedin-banner', label: 'LinkedIn banner', w: 1584, h: 396, word: 'Unix Jelly', fill: .58, up: .1,
    tip: 'Your profile picture covers part of the left side.' },
  { file: 'vertical', label: 'TikTok · Reels · Stories', w: 1080, h: 1920, word: 'Unix Jelly', fill: .84, up: .6, stack: 1, safe: [1080, 1420],
    tip: 'Buttons and captions cover the top and bottom 250 px.' },
  { file: 'instagram-post', label: 'Instagram post', w: 1080, h: 1350, word: 'Unix Jelly', fill: .78, up: .55, stack: 1,
    tip: 'Portrait 4:5, the feed\'s biggest shape.' },
];

const page = fs.readFileSync(`${src}/build/jelly-shell2.html`, 'utf8'), at = page.lastIndexOf('</script>');
const art = `\nconst ART = ${JSON.stringify({ variants: VARIANTS, shots: SHOTS })};\n${fs.readFileSync(`${src}/tools/channel-art.js`, 'utf8')}`;
const html = (page.slice(0, at) + art + page.slice(at)).replace(/<title>[^<]*<\/title>/, '<title>Unix Jelly Channel Art</title>');
fs.writeFileSync(`${src}/build/channel-art.html`, html);
console.log('wrote build/channel-art.html');
if (process.argv[2] !== 'render') process.exit(0);

fs.mkdirSync(process.argv[3] ?? `${src}/brand`, { recursive: true });
const out = fs.realpathSync(process.argv[3] ?? `${src}/brand`);
const b = await launch();
// A small window: the previews are cheap, and each picture is drawn once at its full size.
const p = await b.newPage({ viewport: { width: 640, height: 640 } });
await p.goto(`file://${fs.realpathSync(`${src}/build/channel-art.html`)}`, { timeout: 180000 });
await p.waitForFunction(() => window.artRender, null, { timeout: 180000 });
// ONLY picks pictures by name, for trying things out: ONLY=profile-a, or ONLY='-a$' for one variation
for (const v of VARIANTS) for (const s of SHOTS) {
  const name = `${s.file}-${v.name}`;
  if (process.env.ONLY && !new RegExp(process.env.ONLY).test(name)) continue;
  const data = await p.evaluate(([file, variant]) => window.artRender(file, variant), [s.file, v.name]);
  fs.writeFileSync(`${out}/${name}.png`, Buffer.from(data.split(',')[1], 'base64'));
  console.log('wrote', `${out}/${name}.png`);
}
await b.close();
