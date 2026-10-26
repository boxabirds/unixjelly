// Jelly Git's Overview: your computer is a house cut open like a doll's house. Your project folder on the ground
// floor, the stage above it, and the photo album (.git) at the top. A lift tower climbs past the roof into a
// see-through cloud where GitHub keeps its copy, and a friend's house next door gets one too.
// game.py travels as jelly letters; commits are photos. Built with the Overview kit (engine/overview-kit.js).
const TOWN_STEPS = [
  { who: 'The overview', text: 'Your code makes a trip with four stops: your folder, the stage, the photo album, and GitHub in the cloud. Press Next to follow one change all the way up.', shot: 'whole' },
  { who: 'Your folder', text: 'This is your computer and your project folder. You just changed game.py: you added lasers! git notices the change, but nothing is saved yet.', shot: 'folder', ends: 'folder' },
  { who: 'The stage', text: 'git add game.py puts the file on the stage. Only files on the stage will be in the next photo. Everything else stays out of it.', shot: 'folder', ends: 'stage' },
  { who: 'The photo album', text: 'git commit -m "add lasers" takes a photo of everything on the stage. Flash! The photo is pinned in the album, a hidden folder called .git. That version is now saved forever, on your computer.', shot: 'stage', ends: 'album' },
  { who: 'GitHub, in the cloud', text: 'git push sends your new photos up to GitHub. Now a copy lives far away, safe even if your computer falls in the bath.', shot: 'album', ends: 'cloud' },
  { who: 'Any computer, anywhere', text: 'On a different computer, git clone copies the whole album down. Later, git pull fetches anything new. Your code follows you everywhere.', shot: 'cloud', ends: 'pull' },
  { who: 'That\'s the overview', text: 'Change, git add, git commit, git push. Remember it as Cats Always Chase Pigeons. Now let\'s zoom in and watch the crew do it.', shot: 'whole', cta: true },
];

const Town = overview((k) => {
  const { V, solid, gel, rbox, blob, label, jellyWord, add, live, T } = k;
  const H = 3.3, W = 8.4, D = 4, SW = 1.9;
  const SX = W / 2 + T + SW / 2; // lift centre
  const LEVEL = { folder: 0, stage: H, album: 2 * H };
  const CY = 3 * H + 6.2; // the cloud's middle; the lift's top stop is inside it
  [['folder', 'YOUR FOLDER', '#ffc61a', '#fff3c4'], ['stage', 'THE STAGE', '#62c934', '#dcf7e5'], ['album', 'THE PHOTO ALBUM (.git)', '#9b8cff', '#ebe6ff']]
    .forEach(([id, sign, floor, wall]) => k.room({ y: LEVEL[id], w: W, h: H, d: D, floor, wall, sign }));
  add(solid(rbox(W + 2 * T + .2, .32, D + .4, .12), '#ff4d6d', { p: [0, 3 * H + .16, .1] }));
  k.roof({ x0: -W / 2 - T - .7, x1: W / 2 + T + .5, y: 3 * H + .45, d: D });
  const lift = k.lift({ x: SX, y0: 0, y1: CY + .6, d: D, at: 0 });
  // the ground, with the friend's house next door
  k.grass(-20, 22, 0); k.soil(-20, 22, -.4, -6); k.pebbles(-18, 20, -1, -5.4, 30);
  [[-8.4, 1], [10.5, 1.1], [14, .85], [-19, .9]].forEach(([x, s]) => k.tree(x, 0, s));
  k.sunBall(-12, 15.5, -6);

  /* a photo: a commit, with its id underneath */
  const photo = (id, color) => {
    const g = new THREE.Group();
    g.add(solid(rbox(.72, .82, .05, .04), '#ffffff'));
    g.add(solid(rbox(.56, .48, .06, .03), color, { p: [0, .08, 0], line: .015 }));
    const l = label(id, { h: .22, font: '"JetBrains Mono", monospace' }); l.position.set(0, -.3, .08); g.add(l);
    return g;
  };
  const string = (x0, x1, y, z) => add(solid(new THREE.CylinderGeometry(.02, .02, x1 - x0, 6), '#8a5a33', { p: [(x0 + x1) / 2, y, z], r: [0, 0, Math.PI / 2], line: 0 }));
  const PHOTOS = [['a1b2c3d', '#62c934'], ['e4f5a6b', '#ffc61a']];
  const pin = (g, at, s = 1) => { g.position.copy(at); g.scale.setScalar(s); return add(g); };

  /* ground floor: you, your project folder */
  const me = k.you({ x: 0, y: LEVEL.folder });
  const scr = { lines: [], t: 0, blink: true };
  const drawScreen = () => {
    const g = me.canvas.getContext('2d'); g.fillStyle = '#06160c'; g.fillRect(0, 0, 400, 290);
    g.fillStyle = '#4dff8b'; g.font = '34px VT323, monospace';
    scr.lines.forEach((l, i) => g.fillText(l + (i === scr.lines.length - 1 && scr.blink ? '_' : ''), 18, 48 + i * 38));
    me.refresh();
  };
  const setScreen = (lines) => { scr.lines = lines; drawScreen(); };
  document.fonts?.ready.then(drawScreen);
  // README.md waits on a shelf; game.py is the one you changed
  const shelf = new THREE.Group(); shelf.position.set(-3.3, 0, -1.3); add(shelf);
  shelf.add(solid(rbox(1.4, 1.5, .7, .08), '#c58a55', { p: [0, .75, 0] }));
  shelf.add(solid(rbox(.62, .8, .04, .03), '#ffffff', { p: [0, 1.25, .38], r: [-.1, 0, 0] }));
  const rl = label('README.md', { h: .24, font: '"JetBrains Mono", monospace' }); rl.position.set(-3.3, 2.0, -.8); add(rl);
  const file = live(jellyWord('game.py', .62, '#ff2f7e'));
  const FILE_HOME = V(-.4, LEVEL.folder, 1.45);

  /* first floor: the stage, with a photographer's camera */
  const st = LEVEL.stage;
  add(solid(rbox(4.2, .45, 2.1, .12), '#c58a55', { p: [.6, st + .22, -.7] }));
  add(solid(rbox(4.6, 2.6, .14, .05), '#e0233f', { p: [.6, st + 1.45, -1.75] }));
  [-1.55, 2.75].forEach((x) => add(solid(rbox(.5, 2.6, .6, .1), '#c41d36', { p: [x, st + 1.45, -1.4] })));
  add(solid(rbox(4.8, .4, .6, .1), '#c41d36', { p: [.6, st + 2.8, -1.4] }));
  const spot = live(new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#fff59a', transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false })));
  spot.position.set(.6, st + 1.65, -.5);
  const tripod = new THREE.Group(); tripod.position.set(-2.9, st, .9); tripod.rotation.y = .7; add(tripod);
  [[-.2, -.12], [.2, -.12], [0, .22]].forEach(([x, z]) => tripod.add(solid(new THREE.CylinderGeometry(.035, .035, 1.25, 6), INK, { p: [x, .62, z], r: [z * .45, 0, -x * .45], line: 0 })));
  tripod.add(solid(rbox(.8, .52, .42, .1), '#2b2d42', { p: [0, 1.4, 0] }));
  tripod.add(solid(new THREE.CylinderGeometry(.18, .2, .32, 18), '#6b7088', { p: [0, 1.4, .34], r: [Math.PI / 2, 0, 0] }));
  blob(tripod, 1.4, 1.2);
  const flash = live(new THREE.Mesh(new THREE.SphereGeometry(.6, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .9, depthWrite: false })));
  flash.position.set(-2.6, st + 1.45, 1.3);
  const STAGE_SPOT = V(.6, st + .45, -.45);

  /* top floor: the photo album, photos pinned on a string */
  const al = LEVEL.album;
  string(-3.6, 3.6, al + 2.35, -D / 2 + .35);
  const SLOT = (i) => V(-1.6 + i * 1.8, al + 1.6, -D / 2 + .45);
  pin(photo(...PHOTOS[0]), SLOT(0), 1.4);
  const newPhoto = live(photo(...PHOTOS[1]));

  /* GitHub, in a see-through cloud: its own album inside */
  const cloudMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: .42, roughness: .35, clearcoat: .6, depthWrite: false });
  const CX = SX - 2.2;
  [[0, 0, 0, 2.3], [2.2, -.25, .2, 1.8], [-2.3, -.3, .1, 1.9], [1, .95, -.4, 1.7], [-1.2, .9, -.5, 1.6], [3.7, -.6, 0, 1.2], [-3.9, -.6, 0, 1.25]]
    .forEach(([x, y, z, r]) => { const m = live(new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), cloudMat)); m.position.set(CX + x, CY + y, z); m.scale.set(1, .72, .85); m.renderOrder = 3; });
  const gh = new THREE.Group(); gh.position.set(CX - .6, CY - 1.4, -.4); add(gh);
  gh.add(solid(rbox(3.2, 1.9, 1.6, .12), '#dcefff', { p: [0, .95, 0] }));
  const ghRoof = new THREE.Shape(); ghRoof.moveTo(-1.9, 0); ghRoof.lineTo(1.9, 0); ghRoof.lineTo(0, .9); ghRoof.closePath();
  gh.add(solid(new THREE.ExtrudeGeometry(ghRoof, { depth: 1.6, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 2 }), '#3a5bff', { p: [0, 1.9, -.8] }));
  const ghSign = label('GITHUB, IN THE CLOUD', { h: .42 }); ghSign.position.set(CX - .6, CY + 2.1, .4); add(ghSign);
  const GH_SLOT = (i) => V(CX - 1.4 + i * .95, CY - .75, .48);
  pin(photo(...PHOTOS[0]), GH_SLOT(0), .75);
  const pushed = live(photo(...PHOTOS[1])); pushed.scale.setScalar(.75);

  /* next door: a friend's computer, for clone and pull */
  const FX = -13.6;
  k.room({ cx: FX, y: 0, w: 4.8, h: H, d: D, floor: '#ff8a2b', wall: '#ffe6d1', sign: 'ANOTHER COMPUTER', door: 'none' });
  add(solid(rbox(4.8 + 2 * T + .2, .32, D + .4, .12), '#3a5bff', { p: [FX, H + .16, .1] }));
  k.roof({ x0: FX - 3.2, x1: FX + 3.2, y: H + .45, d: D, color: '#ffc61a', h: 2.2, chimney: false });
  const friend = k.you({ x: FX + .1, y: 0, color: '#ff8a2b' });
  const drawFriend = (lines) => { const g = friend.canvas.getContext('2d'); g.fillStyle = '#06160c'; g.fillRect(0, 0, 400, 290); g.fillStyle = '#4dff8b'; g.font = '34px VT323, monospace'; lines.forEach((l, i) => g.fillText(l, 18, 48 + i * 38)); friend.refresh(); };
  string(FX - 2.2, FX + 2.2, H - .5, -D / 2 + .35);
  const FR_SLOT = (i) => V(FX - 1.6 + i * .95, H - .95, -D / 2 + .42);
  const pulled = PHOTOS.map((p) => { const g = live(photo(...p)); g.scale.setScalar(.75); return g; });

  const { tween, wait, hop, along, pop, say, shot, look, poke } = k;
  const flashOn = () => { flash.visible = true; k.sfx((s) => s.boing(1800, .15, .12)); return tween(.5, (e) => { flash.scale.setScalar(.2 + e * 2.2); flash.material.opacity = .9 * (1 - e); if (e === 1) flash.visible = false; }); };
  let spotOn = 0;
  return {
    SHOTS: {
      whole: { c: V(-4.2, 8.4, 0), w: 25, h: 21.5 },
      folder: { c: V(1.1, LEVEL.folder + 1.6, 0), w: 12, h: 4.3, room: true },
      stage: { c: V(1.1, LEVEL.stage + 1.6, 0), w: 12, h: 4.3, room: true },
      album: { c: V(1.1, LEVEL.album + 1.6, 0), w: 12, h: 4.3, room: true },
      cloud: { c: V(CX + .4, CY + .2, 0), w: 11, h: 6.6 },
      pull: { c: V(-4.8, 9, 0), w: 24, h: 21 },
    },
    reset() {
      file.visible = false; file.scale.setScalar(0); file.position.copy(FILE_HOME);
      newPhoto.visible = false; newPhoto.scale.setScalar(0); pushed.visible = false; pushed.scale.setScalar(0);
      pulled.forEach((p) => { p.visible = false; p.scale.setScalar(0); });
      flash.visible = false; spotOn = 0;
      setScreen(['~/my-game$ ']); drawFriend(['~$ ']);
    },
    PLAY: [
      async () => {},
      async () => {
        me.typing = true; setScreen(['~/my-game$ nano game.py']); await wait(.7); me.typing = false;
        look(file); await pop(file, 1, .45); poke(me.kid, .2);
        say('Lasers added!', V(1.6, 2.75, 1.2)); setScreen(['~/my-game$ ', '(you added lasers', ' to game.py)']);
      },
      async () => {
        say(null); me.typing = true; setScreen(['$ git add game.py']); await wait(.6); me.typing = false;
        look(file); await lift.in(file, 0); shot('stage'); await lift.to(LEVEL.stage);
        await hop(file, STAGE_SPOT, .7); tween(.4, (e) => { spotOn = e; });
        say('Waiting for the photo', V(2.4, st + 2.55, .8)); setScreen(['$ git add game.py', '$ ']);
      },
      async () => {
        say(null); setScreen(['$ git commit -m', '  "add lasers"', '[main e4f5a6b]', '$ ']); look(file);
        await wait(.3); await flashOn();
        newPhoto.position.copy(STAGE_SPOT).add(V(0, 1.2, .6)); await pop(newPhoto, 1, .35);
        tween(.4, (e) => { spotOn = 1 - e; }); await pop(file, 0, .35); // after a commit the stage is empty again
        look(newPhoto); await lift.in(newPhoto, 1); shot('album'); await lift.to(LEVEL.album);
        await hop(newPhoto, SLOT(1), .7, .6); tween(.3, (e) => newPhoto.scale.setScalar(1 + e * .4)); poke(me.kid, .1);
        say('Saved forever in .git!', V(1.8, al + 2.75, .8));
      },
      async () => {
        say(null); setScreen(['$ git push', ' main -> main', '$ ']);
        pushed.position.copy(SLOT(1)).add(V(0, 0, .3)); await pop(pushed, .75, .3); look(pushed);
        await lift.in(pushed, 1); shot('cloud'); await lift.to(CY - 1.1);
        await hop(pushed, GH_SLOT(1), .7, .6);
        say('Safe on GitHub!', V(CX + .4, CY + 1.4, 1));
      },
      async () => {
        say(null); drawFriend(['~$ git clone', '   my-game', 'done!']); shot('pull');
        await Promise.all(pulled.map((p, i) => {
          p.position.copy(GH_SLOT(i)).add(V(0, 0, .3));
          return pop(p, .75, .3).then(() => along(p, [p.position.clone(), V(CX - 6, CY + .5, 1.5), V(FX + 3, H + 3.5, 1.6), FR_SLOT(i)], 2.2 + i * .25));
        }));
        look(pulled[1]); poke(friend.kid, .3); k.sfx((s) => s.ding());
        say('Got it!', V(FX - 1.2, 2.9, 1));
      },
      async () => { say(null); },
    ],
    tick(dt, t) {
      spot.material.opacity = .06 + spotOn * .22 + Math.sin(t * 3) * .02;
      scr.t += dt; if (scr.t > .5) { scr.t = 0; scr.blink = !scr.blink; drawScreen(); }
    },
  };
});
