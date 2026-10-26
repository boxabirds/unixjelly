// Runs every browser test in turn and lists PASS or FAIL for each. Build first: ./build.sh
import { spawnSync } from 'node:child_process';
const here = new URL('.', import.meta.url).pathname;
const tests = ['jellysh', 'shell', 'shell2', 'git', 'web', 'security', 'prereqs', 'fit', 'letters'];
const results = tests.map((t) => {
  process.stdout.write(`${t.padEnd(9)} … `);
  const r = spawnSync('node', [`${here}${t}.mjs`], { encoding: 'utf8', timeout: 60 * 60 * 1000 });
  const last = (r.stdout ?? '').trim().split('\n').at(-1) ?? '';
  console.log(r.status === 0 ? 'PASS' : `FAIL\n${(r.stdout ?? '').trim().split('\n').slice(-12).join('\n')}\n${r.stderr ?? ''}`);
  return r.status === 0;
});
process.exitCode = results.every(Boolean) ? 0 : 1;
