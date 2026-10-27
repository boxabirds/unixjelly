// Runs every browser test and lists PASS or FAIL for each. Build first: ./build.sh
// Tests that don't paint the 3D run JOBS at a time (default: half the CPU cores). The ones that paint it run one by
// one afterwards, so they don't starve each other. JOBS=1 runs everything in turn.
import { spawn } from 'node:child_process';
import os from 'node:os';
const here = new URL('.', import.meta.url).pathname;
const together = ['fit', 'prereqs', 'security', 'shell2', 'web', 'git', 'shell', 'fresh', 'letters', 'curriculum', 'jellysh'];
const alone = ['overview', 'jar', 'present'];
const jobs = Math.max(1, +process.env.JOBS || Math.floor(os.cpus().length / 2));

const run = (t) => new Promise((done) => {
  const c = spawn('node', [`${here}${t}.mjs`]), out = [], err = [];
  c.stdout.on('data', (d) => out.push(d)); c.stderr.on('data', (d) => err.push(d));
  const timer = setTimeout(() => c.kill(), 60 * 60 * 1000);
  c.on('close', (code) => { clearTimeout(timer); done({ t, ok: code === 0, out: Buffer.concat(out).toString().trim(), err: Buffer.concat(err).toString() }); });
});
const report = (r) => console.log(`${r.t.padEnd(9)} … ${r.ok ? 'PASS' : `FAIL\n${r.out.split('\n').slice(-12).join('\n')}\n${r.err}`}`);

const results = [], queue = [...together];
await Promise.all(Array.from({ length: jobs }, async () => {
  while (queue.length) { const r = await run(queue.shift()); report(r); results.push(r); }
}));
for (const t of alone) { const r = await run(t); report(r); results.push(r); }
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
