// Prints a course's lessons as JSON ([{id, word, title}]), read straight from its LESSONS array in the source.
// Usage: node tools/lessons.cjs guides/git/lessons.js
// The array is cut out by matching brackets and evaluated with every name it refers to (helpers, pictures) stubbed out,
// so only the plain fields are trustworthy.
const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8'), i = s.indexOf('[', s.indexOf('const LESSONS = ['));
let depth = 0, j = i, quote = null;
for (; j < s.length; j++) {
  const c = s[j];
  if (quote) { if (c === '\\') j++; else if (c === quote) quote = null; continue; }
  if (c === "'" || c === '"' || c === '`') quote = c;
  else if (c === '[') depth++;
  else if (c === ']' && --depth === 0) break;
}
const stub = new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : stub, apply: () => stub });
const names = new Proxy({}, { has: (t, k) => typeof k === 'string' && !(k in globalThis), get: (t, k) => k === Symbol.unscopables ? undefined : stub });
const lessons = new Function('names', `with (names) { return ${s.slice(i, j + 1)} }`)(names);
console.log(JSON.stringify(lessons.map((L) => ({ id: L.id, word: L.word, title: L.title }))));
