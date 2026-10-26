// The course map (curriculum.json) against what was built: every course is listed in the right order,
// every built course exists and keeps its progress under the key the map says, and the landing page shows them all.
// Run after ./build.sh: node tests/curriculum.mjs
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname), src = path.resolve(here, '..'), repo = path.resolve(src, '..');
const courses = JSON.parse(fs.readFileSync(path.join(src, 'curriculum.json'), 'utf8')).courses, problems = [];
const ids = courses.map((c) => c.id);
courses.forEach((c, i) => {
  for (const n of c.needs) {
    if (!ids.includes(n)) problems.push(`${c.id} needs ${n}, which is not a course`);
    else if (ids.indexOf(n) > i) problems.push(`${c.id} is listed before ${n}, which it needs`);
  }
  if (!c.folder) return;
  const file = path.join(repo, c.folder, 'index.html');
  if (!fs.existsSync(file)) return problems.push(`${c.id}: ${c.folder}/index.html was not built`);
  const page = fs.readFileSync(file, 'utf8');
  if (!page.includes(`const KEY = '${c.store}'`)) problems.push(`${c.id}: the guide does not save under ${c.store}`);
  if (!page.includes('id="courses"')) problems.push(`${c.id}: no course map in the side menu`);
  for (const other of ids) if (!page.includes(`"id": "${other}"`)) problems.push(`${c.id}: its course map is missing ${other}`);
});
const landing = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
for (const c of courses) if (!landing.includes(`>${c.title}</h2>`)) problems.push(`landing page is missing ${c.title}`);
console.log(problems.length ? `FAIL ${problems.join('; ')}` : `PASS ${courses.length} courses`);
process.exitCode = problems.length ? 1 : 0;
