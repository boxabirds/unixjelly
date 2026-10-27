// Shell Jelly's Overview: a computer cut open like a doll's house. You and the terminal at the top, Shelly the shell,
// King Kernel on the ground floor, the hardware in the cellar, and the file tree growing underground as roots.
// The letters you type travel as jelly in a little lift, and the answer climbs back up as jelly words.
// Backstage uses the same house, filmed closer, with one show per command (ls, cat, mv): Shelly snips the line into
// words, the program comes out of the /bin cupboard as a character, asks King Kernel, and carries the answer back.
// Built with the Overview kit (engine/overview-kit.js).
const TOWN_STEPS = [
  { who: 'A computer, cut open', text: 'This is the inside of a computer, cut open like a doll\'s house. Every command you type rides down through the floors and back up again. Press Next to follow one.', shot: 'whole' },
  { who: 'You and the terminal', text: 'You type ls. The terminal is the window that shows your letters. It does not understand them. It only passes them on.', shot: 'you', ends: 'you' },
  { who: 'Shelly the shell', text: 'You press Enter. Your letters jump out and ride the lift down to Shelly. Shelly is the shell: a program that reads your words and works out what you want.', shot: 'you', ends: 'shell' },
  { who: 'King Kernel', text: 'Shelly finds the program called ls in the /bin cupboard, then asks King Kernel to run it. The kernel is the boss of the whole computer. Only the kernel may touch the hardware.', shot: 'shell', ends: 'kernel' },
  { who: 'The disk and the file tree', text: 'The kernel reads the disk. Every file lives in one giant tree that grows upside down, like roots. The top is called the root and is written /. Your home folder is /home/kid.', shot: 'kernel', ends: 'tree' },
  { who: 'All the way back up', text: 'The answer climbs back up: pets, snacks, toys. The lift carries it to the top, and the words appear on your screen. All of that took less than a blink.', shot: 'tree', ends: 'you' },
  { who: 'That\'s the overview', text: 'You → terminal → shell → kernel → hardware, and back. Every command in this guide makes that trip. Now let\'s zoom right into the green screen.', shot: 'whole', cta: true },
];

// The house, for the Overview (mode 'overview': its steps) or Backstage (mode 'backstage': its shows).
function shellHouse(k, mode) {
  const { V, solid, gel, rbox, eye, smile, wobbly, poke, blob, label, textPlane, jellyWord, add, live, T } = k;
  const H = 3.3, W = 8.4, D = 4, SW = 1.9; // floor height, room width, depth, lift shaft width
  const SX = W / 2 + T + SW / 2, XR = W / 2 + T + SW + T; // lift centre, outer right edge
  const LEVEL = { you: 3 * H, shell: 2 * H, kernel: H, hw: 0 };
  [['you', 'YOU + THE TERMINAL', '#ffc61a', '#fff3c4'], ['shell', 'SHELLY THE SHELL', '#62c934', '#dcf7e5'], ['kernel', 'KING KERNEL', '#7f97ff', '#e3e8ff'], ['hw', 'HARDWARE', '#ff8a2b', '#ffe6d1']]
    .forEach(([id, sign, floor, wall]) => k.room({ y: LEVEL[id], w: W, h: H, d: D, floor, wall, sign }));
  add(solid(rbox(XR + W / 2 + T + .2, .32, D + .4, .12), '#ff4d6d', { p: [(XR - W / 2 - T) / 2, 4 * H + .16, .1] })); // the attic ceiling
  const lift = k.lift({ x: SX, y0: 0, y1: 4 * H, d: D, at: LEVEL.you });
  k.roof({ x0: -W / 2 - T - .7, x1: XR + .7, y: 4 * H + .45, d: D });
  // the ground: grass at ground-floor level, soil all the way down, cut open at the front
  for (const [x0, x1] of [[-16, -W / 2 - T], [XR, 18]]) { k.grass(x0, x1, H); k.soil(x0, x1, H - .4, -9.2); }
  k.soil(-W / 2 - T, XR, -.3, -9.3);
  k.pebbles(-13, 16, -1, -8);
  [[-8, 1], [-11.5, .8], [10, 1.1], [13, .85]].forEach(([x, s]) => k.tree(x, H, s));
  k.sunBall(-9, 15.5, -6); k.cloud(7.5, 15, -5); k.cloud(-4.5, 18, -7); k.cloud(12, 11.5, -6);

  /* top floor: you and the terminal */
  const me = k.you({ x: 0, y: LEVEL.you });
  const scr = { lines: [], cursor: true, blink: true, t: 0 };
  const drawScreen = () => {
    const g = me.canvas.getContext('2d'); g.fillStyle = '#06160c'; g.fillRect(0, 0, 400, 290);
    g.fillStyle = '#4dff8b'; g.font = '36px VT323, monospace';
    scr.lines.forEach((l, i) => g.fillText(l + (i === scr.lines.length - 1 && scr.cursor && scr.blink ? '_' : ''), 20, 52 + i * 40));
    me.refresh();
  };
  const setScreen = (lines, cursor = true) => { scr.lines = lines; scr.cursor = cursor; drawScreen(); };
  document.fonts?.ready.then(drawScreen);

  /* first floor: Shelly the shell, and the /bin cupboard */
  const sh = LEVEL.shell, CRAB = '#ff5a4e';
  const shelly = live(wobbly(new THREE.Group())); shelly.position.set(-1.9, sh, .2); shelly.rotation.y = .35;
  blob(shelly, 2.6, 1.8);
  shelly.add(gel(new THREE.SphereGeometry(.62, 28, 18), CRAB, { p: [0, .48, 0], s: [1.3, .68, 1] }));
  // a real spiral shell, thick at the opening and thin in the middle
  class Spiral extends THREE.Curve { getPoint(t, out = V()) { const a = t * Math.PI * 3.2, r = .62 * (1 - t * .88); return out.set(Math.cos(a) * r, Math.sin(a) * r, t * .5); } }
  const spiral = new Spiral(), TUB = 120, RAD = 16, spGeo = new THREE.TubeGeometry(spiral, TUB, .34, RAD, false);
  { const P = spGeo.attributes.position, c = V(); for (let i = 0; i <= TUB; i++) { const s = 1 - (i / TUB) * .84; spiral.getPoint(i / TUB, c); for (let j = 0; j <= RAD; j++) { const n = i * (RAD + 1) + j; P.setXYZ(n, c.x + (P.getX(n) - c.x) * s, c.y + (P.getY(n) - c.y) * s, c.z + (P.getZ(n) - c.z) * s); } } spGeo.computeVertexNormals(); }
  shelly.add(gel(spGeo, '#b18cff', { p: [-.15, 1.22, -.3], s: [.82, .82, .82], r: [0, -.25, .4] }));
  [-1, 1].forEach((sd) => {
    shelly.add(solid(new THREE.CylinderGeometry(.04, .05, .5, 8), CRAB, { p: [sd * .26, .92, .38], r: [.25, 0, -sd * .15], line: .02 }));
    eye(shelly, [sd * .3, 1.2, .46], .15);
    for (let n = 0; n < 3; n++) shelly.add(solid(new THREE.CapsuleGeometry(.05, .45, 4, 8), '#e04437', { p: [sd * (.62 + n * .1), .18, -.25 + n * .25], r: [0, 0, sd * 1.05], line: .02 }));
  });
  smile(shelly, [0, .5, .6], .12);
  const claws = [-1, 1].map((sd) => {
    const g = new THREE.Group(); g.position.set(sd * 1.0, .62, .38); g.rotation.y = -sd * .4; shelly.add(g);
    g.add(gel(new THREE.CapsuleGeometry(.07, .4, 4, 8), CRAB, { p: [-sd * .25, -.08, -.05], r: [0, 0, sd * 1.2] }));
    const lo = gel(new THREE.SphereGeometry(.22, 18, 12), CRAB, { s: [1.25, .5, .9] }), up = gel(new THREE.SphereGeometry(.22, 18, 12), CRAB, { s: [1.25, .5, .9] });
    const top = new THREE.Group(); top.add(up); up.position.set(sd * .14, .05, 0); g.add(lo, top); lo.position.set(sd * .14, -.06, 0);
    return { top, sd };
  });
  const cupboard = new THREE.Group(); cupboard.position.set(2.2, sh, -1.25); add(cupboard);
  cupboard.add(solid(rbox(1.6, 2.15, .9, .1), '#c58a55', { p: [0, 1.08, 0] }));
  const drawers = {};
  ['cat', 'cp', 'ls', 'mv'].forEach((n, i) => {
    const d = new THREE.Group(); d.userData.live = true; d.position.set(0, 1.78 - i * .46, .44); cupboard.add(d);
    d.add(solid(rbox(1.3, .36, .3, .06), '#ffe2b8', { p: [0, 0, -.1] }));
    const lab = textPlane(n, .62, .24); lab.position.z = .06; d.add(lab);
    drawers[n] = d;
  });
  const binSign = label('/bin', { h: .3, bg: '#ffe2b8' }); binSign.position.set(2.2, sh + 2.5, -1); add(binSign);
  blob(cupboard, 2, 1.2);
  add(solid(new THREE.CylinderGeometry(.3, .22, .45, 16), '#ff8a2b', { p: [-3.6, sh + .23, -1.4] }));
  add(solid(new THREE.SphereGeometry(.42, 16, 12), '#3fae4f', { p: [-3.6, sh + .8, -1.4], s: [1, 1.2, 1] }));

  /* ground floor: King Kernel, a jelly gumdrop with a crown (a face, not a screen, so he can't be mistaken for the terminal) */
  const kn = LEVEL.kernel;
  add(solid(rbox(2.4, .04, 3.6, .02), '#e0233f', { p: [-.9, kn + .02, .1], line: .02 }));
  [-3.2, 1.6].forEach((x) => { const b = add(solid(rbox(.9, 1.5, .06, .03), '#e0233f', { p: [x, kn + 2.1, -D / 2 + .04] })); b.add(solid(new THREE.SphereGeometry(.18, 14, 10), '#ffc61a', { s: [1, 1, .3] })); });
  const throne = new THREE.Group(); throne.position.set(-.9, kn, -.9); add(throne);
  throne.add(solid(rbox(2, 2.7, .35, .16), '#9b5cff', { p: [0, 1.35, -.45] }));
  throne.add(solid(rbox(1.9, .6, 1.3, .14), '#b18cff', { p: [0, .3, 0] }));
  [-1, 1].forEach((sd) => throne.add(solid(rbox(.3, .9, 1.2, .12), '#9b5cff', { p: [sd * 1.0, .55, 0] })));
  blob(throne, 2.8, 2);
  const king = wobbly(new THREE.Group()); king.userData.live = true; king.position.set(0, .6, .05); throne.add(king);
  king.add(gel(new THREE.LatheGeometry([[0, 0], [.72, 0], [.8, .12], [.8, .55], [.7, .98], [.48, 1.3], [.2, 1.46], [0, 1.49]].map(([x, y]) => new THREE.Vector2(x, y)), 40), '#ffc61a'));
  k.toon('#e0233f').side = THREE.DoubleSide; k.toon('#ffb000').side = THREE.DoubleSide;
  king.add(solid(new THREE.CylinderGeometry(.92, 1.0, 1.3, 30, 1, true, Math.PI * .55, Math.PI * .9), '#e0233f', { p: [0, .62, 0] }));
  const crown = new THREE.Group(); crown.position.set(0, 1.36, 0); king.add(crown);
  crown.add(solid(new THREE.CylinderGeometry(.34, .38, .24, 12, 1, true), '#ffb000', { line: .02 }));
  for (let n = 0; n < 6; n++) { const a = n / 6 * Math.PI * 2; crown.add(solid(new THREE.ConeGeometry(.08, .24, 6), '#ffb000', { p: [Math.sin(a) * .34, .22, Math.cos(a) * .34], line: .015 })); }
  crown.add(solid(new THREE.SphereGeometry(.07, 12, 8), '#3a5bff', { p: [0, 0, .38], line: .015 }));
  [-1, 1].forEach((sd) => { eye(king, [sd * .24, 1.0, .62], .14); king.add(solid(new THREE.CapsuleGeometry(.07, .28, 4, 8), '#8a5a33', { p: [sd * .2, .78, .7], r: [0, 0, sd * 1.25], line: .015 })); });

  /* cellar: the hardware */
  const hw = LEVEL.hw, TX = -1.6;
  const disk = new THREE.Group(); disk.position.set(TX, hw, -.3); add(disk);
  disk.add(solid(rbox(2, .5, 1.7, .12), '#5a5f74', { p: [0, .25, 0] }));
  const platters = [0, 1, 2].map((n) => { const m = solid(new THREE.CylinderGeometry(.68, .68, .05, 40), '#d7deea', { p: [-.15, .56 + n * .13, 0], line: .02 }); m.add(solid(new THREE.BoxGeometry(.5, .052, .06), '#9aa3bb', { line: 0 })); m.userData.live = true; disk.add(m); return m; });
  disk.add(solid(new THREE.CylinderGeometry(.08, .08, .5, 10), '#9aa3bb', { p: [-.15, .7, 0] }));
  disk.add(solid(rbox(.12, .1, .95, .04), '#ff4d6d', { p: [.6, .92, .15], r: [0, .7, 0] }));
  blob(disk, 2.8, 2.2);
  const diskSign = label('disk', { h: .3 }); diskSign.position.set(TX, hw + 1.55, .4); add(diskSign);
  const board = new THREE.Group(); board.position.set(1.8, hw, -1.1); add(board);
  board.add(solid(rbox(2, .12, 1.3, .04), '#2e9e52', { p: [0, .5, 0] }));
  [-.6, .6].forEach((x) => board.add(solid(new THREE.CylinderGeometry(.06, .06, .5, 8), '#9aa3bb', { p: [x, .25, 0] })));
  board.add(solid(rbox(.6, .16, .6, .05), '#24133b', { p: [-.4, .62, 0], line: 0 }));
  [0, 1].forEach((n) => board.add(solid(rbox(.12, .45, 1, .03), '#3fae4f', { p: [.4 + n * .3, .78, 0] })));
  const chipSign = label('chip + memory', { h: .26 }); chipSign.position.set(1.8, hw + 1.45, -.8); add(chipSign);
  const bulb = add(new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff3a0' }))); bulb.position.set(.3, hw + 2.5, 0);
  add(solid(new THREE.CylinderGeometry(.015, .015, .62, 6), INK, { p: [.3, hw + 2.95, 0], line: 0 }));

  /* underground: the file tree, growing down as roots */
  const NZ = D / 2 + .35;
  const NODES = { '/': [0, -1.5], bin: [-2.4, -3.1], home: [0, -3.1], tmp: [2.4, -3.1], kid: [0, -4.7], toys: [-2.1, -6.3], snacks: [0, -6.3], pets: [2.1, -6.3] };
  const FILES = mode === 'backstage' ? [['kid', 'secret-diary.txt', [-4.4, -6.3]], ['pets', 'hamster.txt', [2.1, -7.9]]] : []; // Backstage's shows need these two files
  FILES.forEach(([, n, at]) => { NODES[n] = at; });
  const nodePos = (n) => V(TX + NODES[n][0], NODES[n][1], NZ);
  const rootGeo = (A, B) => new THREE.TubeGeometry(new THREE.CubicBezierCurve3(A, A.clone().add(V(0, -.7, 0)), B.clone().add(V(0, .7, 0)), B), 24, .075, 8, false);
  add(new THREE.Mesh(rootGeo(V(TX, -.3, NZ - .1), nodePos('/')), k.toon('#e7b57f')));
  [['/', 'bin'], ['/', 'home'], ['/', 'tmp'], ['home', 'kid'], ['kid', 'toys'], ['kid', 'snacks'], ['kid', 'pets'], ...FILES.map(([a, b]) => [a, b])].forEach(([a, b]) => add(new THREE.Mesh(rootGeo(nodePos(a), nodePos(b)), k.toon('#e7b57f'))));
  const nodes = {};
  for (const n of Object.keys(NODES)) {
    const m = live(wobbly(new THREE.Group())); m.position.copy(nodePos(n)).add(V(0, -.3, 0));
    // folders are jelly beans; files are jelly pages
    m.add(n.includes('.') ? gel(rbox(.46, .58, .14, .06), '#ffffff', { p: [0, .32, 0] }) : gel(new THREE.SphereGeometry(n === '/' ? .36 : .3, 24, 16), n === '/' ? '#ff4d6d' : '#ffc61a', { p: [0, .3, 0], s: [1.25, .9, .9] }));
    const l = label(n === '/' ? '/ (root)' : n, { h: .44 }); l.position.set(0, -.24, .3); m.add(l); m.userData.label = l;
    nodes[n] = m;
  }

  /* the travellers: your command, the answer, and a spark */
  const cmd = live(jellyWord('ls', .8, '#ff2f7e', true));
  const ANSWER = [['pets', '#ff8a2b'], ['snacks', '#3a5bff'], ['toys', '#ff4d6d']];
  const words = ANSWER.map(([w, c]) => live(jellyWord(w, .3, c)));
  const spark = live(new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff27a' })));

  let diskSpeed = 6, snip = 0;
  const drawerOut = {}; // how far each /bin drawer is pulled out, 0 to 1
  const SPOT = { shell: V(-.1, sh, 1.1), kernel: V(1.1, kn, .9), hw: V(TX + .2, hw + .98, .2), drawer: V(2.2, sh + 1.0, .2) };
  const AT = { shelly: V(-.2, sh + 2.0, .9), king: V(1.3, kn + 2.55, .4) };
  const { tween, wait, hop, along, pop, say, shot, look } = k;
  /* Backstage's shows: one per command. The typed line comes down as jelly words, Shelly snips it at the spaces,
     the program steps out of the /bin cupboard as a character, asks King Kernel, and carries the answer back up. */
  const caption = (html) => { if (typeof showCap === 'function') showCap(html); };
  const SHOW = mode !== 'backstage' ? {} : {
    ls: { line: 'ls', reach: ['kid'], out: ['pets  secret-diary.txt  snacks  toys'],
      shell: 'Just one word: the program to run is <b>ls</b>. No extra words, so it will look in the folder you are standing in.',
      hi: 'ls, reporting! I find names.', ask: 'Your Majesty, may I peek in /home/kid?', grant: 'You may look. No touching!', burp: 'Got the list!',
      back: 'ls reads the names of everything in the folder and carries them back up to the screen.' },
    cat: { line: 'cat secret-diary.txt', reach: ['kid', 'secret-diary.txt'], out: ['Day 1: I taught my computer ls.', 'It listed everything. Even my socks.'],
      shell: 'Snip! Spaces split words. The first word, <b>cat</b>, is the program. Everything after it, <b>secret-diary.txt</b>, is the argument: what the program should work on.',
      hi: 'Meow. I mean: cat, reporting for duty!', ask: 'Your Majesty, may I read secret-diary.txt?', grant: 'It belongs to the kid. Granted!', burp: 'HACK! HACK! Coughed up like a hairball.',
      back: 'cat carries the whole file back and coughs every line onto the screen. That is all cat does, and it is brilliant at it.' },
    mv: { line: 'mv hamster.txt sir-fluffington.txt', cwd: '~/pets', reach: ['kid', 'pets', 'hamster.txt'], out: [],
      shell: 'Three words! <b>mv</b> is the program. Then two arguments: where the file <b>is</b>, then where it should <b>go</b>.',
      hi: 'mv here. I change name tags.', ask: 'May I change the label on hamster.txt?', grant: 'Same hamster, new name tag. Granted!', burp: 'Done! The hamster did not even notice.',
      back: 'mv does not carry the hamster anywhere. It just rewrites the label on the disk. That is why moving and renaming are the same job. Notice the screen says nothing: no news is good news.' },
  };
  const lines = {}, programs = {}, cards = {}, DRAWER = ['cat', 'cp', 'ls', 'mv'];
  k.jelly('#3a5bff'); // made now, so the slow-machine fallback (plain jelly) reaches it too
  const recolour = (o, c) => o.traverse((m) => { if (m.isMesh && m.material.isMeshPhysicalMaterial) m.material = k.jelly(c); });
  const { character, robot, card, HEAD, settleTo } = k; // the kit's characters and answer card, shared with Git's and Web's Backstage
  const kitty = () => character((b) => {
    const C = '#ff8a2b';
    b.add(gel(new THREE.CapsuleGeometry(.28, .5, 6, 14), C, { p: [-.1, .42, 0], r: [0, 0, Math.PI / 2] }));
    b.add(gel(new THREE.SphereGeometry(.33, 22, 16), C, { p: [.42, .78, .05] }));
    [-1, 1].forEach((sd) => b.add(gel(new THREE.ConeGeometry(.11, .24, 10), C, { p: [.42 + sd * .17, 1.1, .05] })));
    [-1, 1].forEach((sd) => eye(b, [.42 + sd * .12, .83, .34], .075));
    smile(b, [.42, .66, .36], .06);
    b.add(gel(new THREE.TorusGeometry(.26, .055, 8, 20, Math.PI * 1.2), C, { p: [-.55, .7, 0], r: [0, 0, .5] }));
    [[-.35, .12], [-.35, -.12], [.15, .12], [.15, -.12]].forEach(([x, z]) => b.add(gel(new THREE.CapsuleGeometry(.06, .2, 4, 8), C, { p: [x, .14, z] })));
  });
  for (const [id, s] of Object.entries(SHOW)) {
    // the typed line as jelly words, one group per word, laid out like the line on the screen
    const g = live(new THREE.Group()), gap = .32, ws = s.line.split(' ').map((w, i) => {
      const j = jellyWord(w, .42, '#ff2f7e'); g.add(j);
      const b = new THREE.Box3().setFromObject(j); j.userData.w = b.max.x - b.min.x;
      const tag = label(i ? 'argument' : 'program', { h: .3, top: true, bg: i ? '#d4e4ff' : '#ffd6e4' }); tag.position.set(0, .78, 0); j.add(tag); j.userData.tag = tag;
      return j;
    });
    const total = ws.reduce((a, j) => a + j.userData.w, 0) + gap * (ws.length - 1); let x = -total / 2;
    ws.forEach((j) => { j.position.set(x + j.userData.w / 2, .14, 0); j.userData.home = j.position.clone(); x += j.userData.w + gap; }); // lifted so y and p hang above the floor
    g.userData.width = total; lines[id] = { g, ws };
    programs[id] = id === 'cat' ? kitty() : robot(id, id === 'ls' ? '#7aa8ff' : '#ffc61a');
    if (s.out.length) cards[id] = card(s.out);
  }
  if (mode === 'backstage') { const n = nodes['hamster.txt'], alt = label('sir-fluffington.txt', { h: .44 }); alt.position.copy(n.userData.label.position); alt.visible = false; n.add(alt); n.userData.alt = alt; }
  function resetShows() {
    for (const [id, { g, ws }] of Object.entries(lines)) {
      g.visible = false; g.scale.setScalar(0);
      ws.forEach((j) => { g.add(j); j.position.copy(j.userData.home); j.scale.setScalar(1); j.visible = true; recolour(j, '#ff2f7e'); j.userData.tag.visible = false; });
      const P = programs[id]; P.visible = false; P.scale.setScalar(0);
      if (cards[id]) { k.scene.add(cards[id]); cards[id].visible = false; cards[id].scale.setScalar(0); cards[id].rotation.set(0, 0, 0); }
    }
    const h = nodes['hamster.txt']; if (h) { h.userData.label.visible = true; h.userData.alt.visible = false; }
  }
  async function runShow(id) {
    const s = SHOW[id], { g, ws } = lines[id], P = programs[id], prompt = `kid@jelly:${s.cwd ?? '~'}$ `, AT_YOU = V(1.6, LEVEL.you + 2.75, 1.2);
    shot('you'); caption('<b>Front.</b> Someone types at the green screen…');
    setScreen([prompt]); me.typing = true;
    for (let n = 1; n <= s.line.length; n++) { setScreen([prompt + s.line.slice(0, n)]); k.sfx((x) => x.boing(1400, .03, .03)); await wait(.06); }
    me.typing = false; await wait(.35);
    caption('<b>Enter!</b> Now let\'s peek backstage. Your letters jump out and ride the lift down to Shelly, the shell.');
    setScreen([prompt + s.line], false); poke(me.kid, .15);
    const fit = Math.min(1, 1.4 / g.userData.width);
    g.position.copy(me.at()); look(g); await pop(g, fit, .4); await lift.in(g, 0);
    shot('shell'); await lift.to(LEVEL.shell);
    const floorFit = Math.min(1, 6.4 / g.userData.width); // a long line still fits between Shelly and the cupboard
    await Promise.all([hop(g, V(.5, sh, 1.15), .6), tween(.6, (e) => g.scale.setScalar(fit + (floorFit - fit) * e))]);
    // Shelly snips at the spaces: the first word is the program, the rest are its arguments
    say(ws.length > 1 ? 'Snip! Spaces split words.' : 'One word. Easy!', AT.shelly); poke(shelly, .3); snip = 1.4; await wait(.6);
    await tween(.45, (e) => ws.forEach((j, i) => { j.position.x = j.userData.home.x + (i - (ws.length - 1) / 2) * .45 / floorFit * e; }));
    ws.forEach((j, i) => { recolour(j, i ? '#3a5bff' : '#ff2f7e'); j.userData.tag.visible = true; });
    caption(`<b>Shelly the shell:</b> ${s.shell}`); await wait(2);
    say(null); caption(`<b>Shelly</b> looks for a program called <b>${id}</b> in the <b>/bin</b> cupboard. /bin is where programs live.`);
    const [pw, ...args] = ws; k.scene.attach(pw); pw.userData.tag.visible = false; look(pw);
    await hop(pw, V(2.2, sh + 1.78 - DRAWER.indexOf(id) * .46 - .2, -.3), .6);
    await tween(.35, (e) => { drawerOut[id] = e; }); await pop(pw, 0, .25);
    P.position.set(2.2, sh, -.2); look(P); await pop(P, 1, .45); await hop(P, V(1.4, sh, 1.0), .5); poke(P.userData.body, .3);
    tween(.3, (e) => { drawerOut[id] = 1 - e; });
    say(s.hi, V(1.4, sh + 2.25, 1.1));
    // the arguments go along with the program, held up over its head
    args.forEach((a) => { P.attach(a); a.userData.tag.visible = false; });
    await Promise.all(args.map((a, i) => settleTo(a, V(0, HEAD + i * .4, 0), .34)));
    g.visible = false; await wait(1.3);
    say(null); caption('<b>Rule of the castle:</b> programs may not touch the disk themselves. They must ask King Kernel.');
    await lift.in(P, 0); shot('kernel'); await lift.to(LEVEL.kernel); await hop(P, V(1.4, kn, .9), .6);
    say(s.ask, V(1.4, kn + 2.4, 1.1)); await wait(1.6);
    poke(king, .35); say(s.grant, AT.king); await wait(1.5);
    say(null); caption('<b>King Kernel</b> opens the disk, and the program finds what it came for.');
    await lift.in(P, 0); shot('roots'); await lift.to(LEVEL.hw); await hop(P, V(.4, hw, 1.2), .6);
    diskSpeed = 22; spark.visible = true; spark.position.set(TX, -.3, NZ); look(spark);
    for (const n of ['/', 'home', ...s.reach]) { await along(spark, [spark.position.clone(), nodePos(n)], .45); poke(nodes[n], .35); }
    if (id === 'ls') ['toys', 'snacks', 'pets', 'secret-diary.txt'].forEach((n) => poke(nodes[n], .3));
    if (id === 'mv') { const n = nodes['hamster.txt']; n.userData.label.visible = false; n.userData.alt.visible = true; poke(n, .45); k.sfx((x) => x.boing(700, .2, .08)); }
    spark.visible = false; diskSpeed = 6;
    const c = cards[id];
    if (c) {
      c.position.copy(nodePos(s.reach.at(-1))).add(V(0, .4, .5)); c.scale.setScalar(.01); look(c);
      await Promise.all([pop(c, 1, .5), hop(c, V(TX + 5.2, -3.6, NZ + .9), .7, .5)]);
      caption(`<b>The answer</b>, ready to go back up: ${s.out.length} line${s.out.length > 1 ? 's' : ''} for the screen.`); await wait(2.4);
      await Promise.all([along(c, [c.position.clone(), nodePos('/').add(V(0, .4, .6)), P.position.clone().add(V(0, HEAD + 1, .2))], 1.1), pop(c, .32, 1.1)]);
      P.attach(c); await settleTo(c, V(0, HEAD + .3 + args.length * .4, .1), c.scale.x, .4);
    }
    caption(`<b>Back it goes.</b> ${s.back}`); look(P);
    await lift.in(P, 0); shot('whole'); await lift.to(LEVEL.you); shot('you');
    await hop(P, V(-.2, LEVEL.you, 1.4), .6);
    if (c) { k.scene.attach(c); await Promise.all([hop(c, me.at(), .5, .4), pop(c, .15, .5)]); await pop(c, 0, .2); }
    args.forEach((a) => pop(a, 0, .2));
    setScreen([prompt + s.line, ...s.out, prompt]); poke(me.kid, .3); k.sfx((x) => x.ding());
    say(s.burp, AT_YOU); await wait(1.6);
    say(null); caption('<b>Done.</b> That whole trip happens every time you press Enter, and it takes less than a blink. Try another one.');
    await pop(P, 0, .3); look(null);
  }
  return {
    START: mode === 'backstage' ? 'you' : 'whole',
    SCENES: mode === 'backstage' ? Object.fromEntries(Object.keys(SHOW).map((id) => [id, () => runShow(id)])) : null,
    SHOTS: {
      whole: { c: V(1.1, 4.6, 0), w: 13.6, h: 23.4 },
      you: { c: V(1.1, LEVEL.you + 1.6, 0), w: 12, h: 4.3, room: true },
      shell: { c: V(1.1, LEVEL.shell + 1.6, 0), w: 12, h: 4.3, room: true },
      kernel: { c: V(1.1, LEVEL.kernel + 1.6, 0), w: 12, h: 4.3, room: true },
      tree: { c: V(.6, -2, 0), w: 11, h: 10.4 },
      roots: { c: V(-.6, -2.7, 0), w: 13.6, h: 11.8 },
    },
    reset() {
      cmd.visible = false; cmd.scale.setScalar(0); cmd.position.copy(me.at());
      words.forEach((w) => { w.visible = false; w.scale.setScalar(0); }); spark.visible = false;
      setScreen(['kid@jelly:~$ ']); diskSpeed = 6; for (const n in drawerOut) drawerOut[n] = 0;
      resetShows();
    },
    PLAY: [
      async () => {},
      async () => { me.typing = true; await wait(.4); setScreen(['kid@jelly:~$ l']); k.sfx((s) => s.boing(1400, .03, .03)); await wait(.45); setScreen(['kid@jelly:~$ ls']); k.sfx((s) => s.boing(1400, .03, .03)); await wait(.3); me.typing = false; },
      async () => {
        setScreen(['kid@jelly:~$ ls'], false); poke(me.kid, .15); look(cmd);
        cmd.position.copy(me.at()); await pop(cmd, 1, .4); await lift.in(cmd, 0);
        shot('shell'); await lift.to(LEVEL.shell); await hop(cmd, SPOT.shell); poke(shelly, .3); snip = 1.2;
        say('l, s… that means list!', AT.shelly);
      },
      async () => {
        look(cmd); say(null); await hop(cmd, SPOT.drawer, .6); await tween(.35, (e) => { drawerOut.ls = e; }); say('Found the ls program!', AT.shelly); await wait(.6);
        await lift.in(cmd, 0); tween(.3, (e) => { drawerOut.ls = 1 - e; }); say(null);
        shot('kernel'); await lift.to(LEVEL.kernel); await hop(cmd, SPOT.kernel); poke(king, .35);
        say('You may look. Granted!', AT.king);
      },
      async () => {
        look(cmd); say(null); await lift.in(cmd, 0); shot('tree'); await lift.to(LEVEL.hw); await hop(cmd, SPOT.hw);
        diskSpeed = 22; spark.visible = true; spark.position.set(TX, -.3, NZ); look(spark);
        for (const n of ['/', 'home', 'kid']) { await along(spark, [spark.position.clone(), nodePos(n)], .55); poke(nodes[n], .35); }
        ['toys', 'snacks', 'pets'].forEach((n) => poke(nodes[n], .3));
      },
      async () => {
        spark.visible = false; diskSpeed = 6; pop(cmd, 0, .3);
        await Promise.all(words.map((w, i) => { w.position.copy(nodePos(ANSWER[i][0])); return pop(w, 1, .35); }));
        look(words[1]);
        await Promise.all(words.map((w, i) => along(w, [w.position.clone(), nodePos('kid'), nodePos('home'), nodePos('/'), V(TX, -.2, NZ), V(TX + 1.6, hw + 1.6, 1.2), lift.slot(i + 1)], 1.7 + i * .15).then(() => k.ride(w, lift.off(i + 1)))));
        shot('whole'); await lift.to(LEVEL.you); shot('you');
        await Promise.all(words.map((w, i) => hop(w, me.at(), .45 + i * .1, .5).then(() => pop(w, 0, .2))));
        setScreen(['kid@jelly:~$ ls', 'pets  snacks  toys', 'kid@jelly:~$ ']); poke(me.kid, .3); look(null); k.sfx((s) => s.ding());
      },
      async () => {},
    ],
    tick(dt, t) {
      snip = Math.max(0, snip - dt); claws.forEach((c, i) => { c.top.rotation.z = c.sd * (.15 + Math.abs(Math.sin(t * (snip > 0 ? 14 : 2) + i)) * (snip > 0 ? .5 : .12)); });
      platters.forEach((p) => { p.rotation.y += dt * diskSpeed; });
      for (const [n, d] of Object.entries(drawers)) d.position.z = .44 + (drawerOut[n] ?? 0) * .55;
      crown.rotation.z = Math.sin(t * 1.3) * .04;
      for (const n of Object.keys(nodes)) nodes[n].rotation.y = Math.sin(t * .9 + n.length) * .12;
      spark.scale.setScalar(1 + Math.sin(t * 18) * .2);
      scr.t += dt; if (scr.t > .5) { scr.t = 0; scr.blink = !scr.blink; if (scr.cursor) drawScreen(); }
    },
  };
}
const Town = overview((k) => shellHouse(k, 'overview'));
const Backstage = overview((k) => shellHouse(k, 'backstage'));
