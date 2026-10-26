import opentype from 'opentype.js';
const font = opentype.loadSync(new URL('./TitanOne-Regular.ttf', import.meta.url).pathname);
const chars = process.argv[2] || 'abcdefghijklmnopqrstuvwxyz0123456789$~/.-_>?! ';
const glyphs = {};
const r = n => Math.round(n);
for (const ch of chars) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(0, 0, font.unitsPerEm); // y-down
  let o = '';
  for (const c of p.commands) {
    const t = c.type.toLowerCase();
    if (c.type === 'M' || c.type === 'L') o += `${t} ${r(c.x)} ${r(-c.y)} `;
    else if (c.type === 'Q') o += `q ${r(c.x)} ${r(-c.y)} ${r(c.x1)} ${r(-c.y1)} `;
    else if (c.type === 'C') o += `b ${r(c.x)} ${r(-c.y)} ${r(c.x1)} ${r(-c.y1)} ${r(c.x2)} ${r(-c.y2)} `;
  }
  const bb = g.getBoundingBox();
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: o.trim() };
}
const out = { glyphs, familyName: 'Titan One', ascender: font.ascender, descender: font.descender,
  underlinePosition: -100, underlineThickness: 50, resolution: font.unitsPerEm,
  boundingBox: { yMin: font.tables.head.yMin, xMin: font.tables.head.xMin, yMax: font.tables.head.yMax, xMax: font.tables.head.xMax },
  original_font_information: { copyright: 'Titan One, SIL Open Font License 1.1' }, cssFontWeight: 'normal', cssFontStyle: 'normal' };
process.stdout.write(JSON.stringify(out));
