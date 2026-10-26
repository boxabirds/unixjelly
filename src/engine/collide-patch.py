# Jellies bumping into each other, for every jelly in every guide (letters and the jar's jelly babies).
# Before: only the cage corners of different jellies kept a gap, and the gap was smaller than the hole in the
# middle of a cage square, so a corner of one jelly could slip through another jelly's square and they overlapped.
# Now each jelly is a body-centred lattice: its cage corners plus the centre of every cage cell. Its biggest hole is
# then about 0.56 of a cell, smaller than the gap kept between jellies, so nothing can squeeze through.
# Bumps only make a sound and wake a sleeping jelly when the two are really moving into each other, so jellies
# resting against each other stay quiet and can fall asleep.
# Run by shelly-patch.py, before jar-patch.py.

rep("      const c = corners(i, j, k);\n", "      const c = corners(i, j, k); cellNodes.push(c);\n")
rep("    const index = new Map(), rest = [];", "    const index = new Map(), rest = [], cellNodes = [];")
rep("    this.elements = []; this.edges = [];", "    this.elements = []; this.edges = []; this.cellNodes = cellNodes; // for collisions: each cell's centre is the average of its 8 corners")
region("  // Letters bump into each other: cage nodes of different letters keep a minimum gap.", "  // Stage two of tidying up", r'''  // Jellies bump into each other: collision points of different jellies keep a minimum gap (see collide-patch.py).
  // Only pairs whose bounding boxes touch are checked, so jellies standing apart cost nothing.
  collide() {
    const live = this.bodies.filter((b) => this.t >= b.spawnAt && b.lo), d = this.opts.size / (this.opts.cells ?? 6.5) * .62, d2 = d * d, cap = d * .3;
    for (let a = 0; a < live.length; a++) for (let c = a + 1; c < live.length; c++) {
      const P = live[a], Q = live[c];
      if (P.sleeping && Q.sleeping) continue;
      const lo = [0, 1, 2].map((k) => Math.max(P.lo[k], Q.lo[k]) - d), hi = [0, 1, 2].map((k) => Math.min(P.hi[k], Q.hi[k]) + d);
      if (lo.some((v, k) => v > hi[k])) continue;
      const ps = P.points(lo, hi), qs = Q.points(lo, hi);
      let hit = false;
      for (let a2 = 0; a2 < ps.m; a2++) for (let b2 = 0; b2 < qs.m; b2++) {
        const dx = qs.x[b2] - ps.x[a2], dy = qs.y[b2] - ps.y[a2], dz = qs.z[b2] - ps.z[a2], r2 = dx * dx + dy * dy + dz * dz;
        if (r2 >= d2 || r2 < 1e-14) continue;
        const r = Math.sqrt(r2), depth = d - r; if (depth < 1e-4) continue;
        const nx = dx / r, ny = dy / r, nz = dz / r, push = Math.min(depth, cap) / (ps.W[a2] + qs.W[b2]);
        P.shift(ps, a2, -nx * push, -ny * push, -nz * push); Q.shift(qs, b2, nx * push, ny * push, nz * push);
        // a real bump: moving into each other, not two jellies resting cheek to cheek
        if ((qs.vx[b2] - ps.vx[a2]) * nx + (qs.vy[b2] - ps.vy[a2]) * ny + (qs.vz[b2] - ps.vz[a2]) * nz < -.12) hit = true;
        P.dirty = Q.dirty = true;
      }
      if (hit) {
        for (const b of [P, Q]) { if (b.sleeping) b.wake(); b.updateBox(); }
        if (performance.now() - (this.lastBump || 0) > 260) { this.lastBump = performance.now(); sound.boing(300 + Math.random() * 160, .18, .07); }
      }
    }
  }
''')
rep("  wake() { this.sleeping = false; this.quiet = 0; }", r'''  wake() { this.sleeping = false; this.quiet = 0; }
  // The collision points inside a box: cage corners (ids 0…N-1), then cell centres (ids N…). Each has a weighted
  // inverse mass W, so a push on it can be shared out to its corners. The arrays are made once per jelly and reused,
  // so colliding makes no garbage for old computers to clean up.
  points(lo, hi) {
    const x = this.x, v = this.v, C = this.cellNodes, N = this.N, inv = this.inv, n = N + C.length;
    const s = this.pts ??= { id: new Int32Array(n), x: new Float64Array(n), y: new Float64Array(n), z: new Float64Array(n), vx: new Float64Array(n), vy: new Float64Array(n), vz: new Float64Array(n), W: new Float64Array(n), m: 0 };
    this.cellW ??= Float64Array.from(C, (c) => c.reduce((a, i) => a + inv[i], 0) / 64);
    let m = 0;
    const keep = (id, px, py, pz, vx, vy, vz, W) => {
      if (px < lo[0] || px > hi[0] || py < lo[1] || py > hi[1] || pz < lo[2] || pz > hi[2]) return;
      s.id[m] = id; s.x[m] = px; s.y[m] = py; s.z[m] = pz; s.vx[m] = vx; s.vy[m] = vy; s.vz[m] = vz; s.W[m] = W; m++;
    };
    for (let i = 0; i < N; i++) { const j = i * 3; keep(i, x[j], x[j + 1], x[j + 2], v[j], v[j + 1], v[j + 2], inv[i]); }
    // a cell whose first corner is more than a cell away from the box can't have its centre inside it: skip the averaging
    const e = this.cellSize ??= Math.max(...[0, 1, 2].map((k) => Math.abs(this.rest[this.cellNodes[0]?.[7] * 3 + k] - this.rest[this.cellNodes[0]?.[0] * 3 + k]) || 0)) * 1.5;
    for (let k = 0; k < C.length; k++) {
      const c = C[k], j0 = c[0] * 3;
      if (x[j0] < lo[0] - e || x[j0] > hi[0] + e || x[j0 + 1] < lo[1] - e || x[j0 + 1] > hi[1] + e || x[j0 + 2] < lo[2] - e || x[j0 + 2] > hi[2] + e) continue;
      let px = 0, py = 0, pz = 0, vx = 0, vy = 0, vz = 0;
      for (let q = 0; q < 8; q++) { const j = c[q] * 3; px += x[j]; py += x[j + 1]; pz += x[j + 2]; vx += v[j]; vy += v[j + 1]; vz += v[j + 2]; }
      keep(N + k, px / 8, py / 8, pz / 8, vx / 8, vy / 8, vz / 8, this.cellW[k]);
    }
    s.m = m;
    return s;
  }
  shift(s, k, dx, dy, dz) {
    const x = this.x, id = s.id[k];
    const move = (i, w) => { const j = i * 3; x[j] += dx * w; x[j + 1] = Math.max(0, x[j + 1] + dy * w); x[j + 2] += dz * w; };
    if (id < this.N) move(id, this.inv[id]);
    else { const c = this.cellNodes[id - this.N]; for (let q = 0; q < 8; q++) move(c[q], this.inv[c[q]] / 8); }
    // the point itself moved, so the next pair sees where it is now
    s.x[k] += dx * s.W[k]; s.y[k] += dy * s.W[k]; s.z[k] += dz * s.W[k];
  }''')
