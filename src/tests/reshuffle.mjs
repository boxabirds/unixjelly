// The under-the-hood page (under-the-hood/reshuffle.html): every example does what its words say. Each is played with
// the real physics and the real tidying rules (no drawing), and must end the way its `expect` says: tidy (everyone gets
// home without the 20-second timeout), turn (a letter is only turned round), tangle (the timeout fires), or never
// (tidying never starts). If the rules change and this fails, the page's words need changing too.
import path from 'node:path';
import { launch, verdict } from './lib.mjs';
const b = await launch({ draw: false }), p = await b.newPage({ viewport: { width: 1200, height: 800 } }), problems = [];
p.on('pageerror', (e) => problems.push('page error: ' + e.message));
await p.goto('file://' + path.resolve('../../../under-the-hood/reshuffle.html'), { waitUntil: 'load', timeout: 120000 });
await p.waitForFunction(() => window.uthRun, null, { timeout: 120000 });
for (const { id, expect } of await p.evaluate(() => window.uthScenes)) {
  const r = await p.evaluate((id) => window.uthRun(id, 35), id);
  const got = r.tangled ? 'tangle' : r.done != null ? 'tidy' : r.turned ? 'turn' : 'never';
  console.log(`${id.padEnd(10)} expected ${expect.padEnd(7)} got ${got}${r.done != null ? ` (${r.done.toFixed(1)} s)` : ''}`);
  if (got !== expect) problems.push(`${id}: expected ${expect}, got ${got}`);
}
verdict(problems);
await b.close();
