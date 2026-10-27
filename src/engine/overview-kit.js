// The Overview kit. Every guide's Overview is a little 3D world drawn in one style: buildings cut open like a doll's
// house in cartoon toon with even ink outlines, characters and travellers in rigid jelly that squashes when poked,
// signs painted on walls, and things you can follow (jelly words, a lift, a letter) instead of tubes and packets.
// A guide supplies TOWN_STEPS (who, text, the camera shot it starts on, and where it ends) and a world:
//   const Town = overview((k) => ({ SHOTS, PLAY, reset, tick }));
// A world can instead offer named SCENES, each played from the start with play(name), and a START shot (Backstage).
// `k` holds the building blocks below. PLAY[i] is an async script for step i, made of k's tweens.
// Needs from the page: THREE, FONT, INK, REDUCED, clamp, mergeVertices, mergeGeometries, RoundedBoxGeometry, RoomEnvironment,
// and `towns`, whose members the page's frame loop ticks while they're on screen.
function overview(world) {
  return class { constructor(canvas) { return makeOverview(canvas, world); } };
}

function makeOverview(canvas, world) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const ease = (k) => k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
  let rush = false;
  const sfx = (f) => { if (!rush && typeof sound !== 'undefined') f(sound); };

  /* materials: buildings are cartoon (flat bands of light, ink outlines); everything alive, and every traveller, is jelly */
  const toonGrad = (() => { const t = new THREE.DataTexture(new Uint8Array([95, 180, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const OUTLINE = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  const cache = new Map(), memo = (key, f) => cache.get(key) ?? cache.set(key, f()).get(key);
  const toon = (c) => memo('t' + c, () => new THREE.MeshToonMaterial({ color: c, gradientMap: toonGrad }));
  // The same jelly as the guides' letters: a light surface, colour that deepens through thick parts, crisp highlights.
  const jelly = (c) => memo('j' + c, () => {
    const hsl = new THREE.Color(c).getHSL({});
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.1), Math.max(.62, hsl.l)), transmission: .6, thickness: .7, roughness: .06, ior: 1.4,
      attenuationColor: new THREE.Color().setHSL(hsl.h, 1, Math.max(.4, hsl.l * .78)), attenuationDistance: .3,
      clearcoat: 1, clearcoatRoughness: .03, specularIntensity: 1,
    });
  });
  // An ink outline of the same thickness on every part, whatever its size.
  function solid(geo, color, { p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0], line = .035 } = {}) {
    const m = new THREE.Mesh(geo, toon(color)); m.position.set(...p); m.scale.set(...s); m.rotation.set(...r);
    if (line) {
      geo.computeBoundingBox(); const d = geo.boundingBox.getSize(V()), c = geo.boundingBox.getCenter(V());
      const o = new THREE.Mesh(geo, OUTLINE), f = (dim, sc) => dim * sc > 1e-4 ? 1 + 2 * line / (dim * sc) : 1;
      o.scale.set(f(d.x, s[0]), f(d.y, s[1]), f(d.z, s[2])); o.position.copy(c).multiply(V(1, 1, 1).sub(o.scale)); m.add(o);
    }
    return m;
  }
  function gel(geo, color, { p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0] } = {}) {
    const m = new THREE.Mesh(geo, jelly(color)); m.position.set(...p); m.scale.set(...s); m.rotation.set(...r); return m;
  }
  const rbox = (w, h, d, rad = .08) => new RoundedBoxGeometry(w, h, d, 2, Math.min(rad, w / 2.01, h / 2.01, d / 2.01));
  const EYE_W = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .25 }), EYE_B = new THREE.MeshStandardMaterial({ color: '#15091f', roughness: .2 });
  const eyes = [];
  function eye(parent, pos, r) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), EYE_W), pupil = new THREE.Mesh(new THREE.SphereGeometry(r * .52, 16, 10), EYE_B);
    ball.position.set(...pos); pupil.position.z = r * .62; ball.add(pupil); parent.add(ball);
    eyes.push({ ball, pupil, r, blink: 2 + Math.random() * 4 }); return ball;
  }
  function smile(parent, pos, w = .1) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(w, w * .22, 6, 14, Math.PI), new THREE.MeshBasicMaterial({ color: INK }));
    m.position.set(...pos); m.rotation.z = Math.PI; parent.add(m); return m;
  }
  // Squash and stretch: a poke makes a character wobble like jelly, then settle. Origins sit at their feet.
  const wobblers = [];
  function wobbly(obj) { obj.userData.wob = { x: 0, v: 0, base: obj.scale.clone(), ph: Math.random() * 6 }; wobblers.push(obj); return obj; }
  const poke = (obj, a = .25) => { obj.userData.wob.v += a * 9; sfx((s) => s.boing(380 + a * 600, .25, .07)); };
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#24133b66'); gr.addColorStop(1, '#24133b00'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const BLOB = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  function blob(parent, w, d, p = [0, .01, 0]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), BLOB);
    m.rotation.x = -Math.PI / 2; m.position.set(...p); parent.add(m); return m;
  }
  // Signs sit in the scene, so floors and walls hide them; speech bubbles (top) always show.
  function label(text, { bg = '#ffffff', fg = INK, h = .5, top = false, font = '"Titan One", sans-serif' } = {}) {
    const c = document.createElement('canvas'), g = c.getContext('2d'), fs = 64;
    g.font = `${fs}px ${font}`;
    const w = Math.ceil(g.measureText(text).width) + 56; c.width = w; c.height = 110;
    g.font = `${fs}px ${font}`; g.fillStyle = bg; g.strokeStyle = INK; g.lineWidth = 8;
    g.beginPath(); g.roundRect(6, 6, w - 12, 98, 30); g.fill(); g.stroke();
    g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(text, 28, 60);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: !top })); sp.renderOrder = top ? 5 : 0;
    sp.scale.set(h * w / 110, h, 1); return sp;
  }
  function textPlane(text, w, h, { bg = '#ffe2b8', fg = INK, font = '700 40px "JetBrains Mono", monospace' } = {}) {
    const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w); const g = c.getContext('2d');
    g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, c.height / 2 + 2);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t }));
  }
  // Jelly letters: the same font and shape as the guide's jelly letters, but rigid.
  function letterGeo(ch, size) {
    return memo('L' + ch + size, () => {
      let geo = new THREE.ExtrudeGeometry(FONT.generateShapes(ch, size), { depth: size * .3, curveSegments: 7, bevelEnabled: true, bevelThickness: size * .09, bevelSize: size * .05, bevelSegments: 4 });
      geo.deleteAttribute('uv'); geo.deleteAttribute('normal'); geo = mergeVertices(geo, size * 1e-4); geo.computeVertexNormals(); geo.computeBoundingBox();
      // centred across, but kept on the font's baseline, so - stays in the middle and y hangs below
      const bb = geo.boundingBox; geo.translate(-(bb.min.x + bb.max.x) / 2, 0, -(bb.min.z + bb.max.z) / 2); geo.computeBoundingBox();
      return geo;
    });
  }
  // A word on the baseline y = 0, centred on x = 0. Big words get eyes, like the letters on the welcome screen.
  function jellyWord(text, size, color, withEyes = false) {
    const g = new THREE.Group(), gap = size * .1, sp = size * .35; let x = 0;
    const ls = [...text].map((ch) => {
      if (ch === ' ') { x += sp; return null; }
      const geo = letterGeo(ch, size), b = geo.boundingBox, w = b.max.x - b.min.x, m = new THREE.Mesh(geo, jelly(color));
      m.position.x = x + w / 2; x += w + gap; g.add(m);
      if (withEyes) { const r = size * .085, y = b.max.y * .74, z = b.max.z + r * .2; (w < size * .45 ? [0] : [-w * .2, w * .2]).forEach((ex) => eye(m, [ex, y, z], r)); }
      return m;
    }).filter(Boolean);
    ls.forEach((m) => { m.position.x -= (x - gap) / 2; });
    return g;
  }

  /* the 3D stage */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#bfe6ff');
  // the guides' window light (studio(), in shell.html) where the page has it; the plain room on the prototype pages
  scene.environment = typeof studio === 'function' ? studio(renderer) : new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .7;
  scene.add(new THREE.HemisphereLight('#ffffff', '#ffd98a', 1.5));
  const sun = new THREE.DirectionalLight('#ffffff', 2.1); sun.position.set(5, 14, 10); scene.add(sun);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, .1, 260);
  const add = (...o) => { scene.add(...o); return o[0]; };
  // Things that move are marked live; everything else is merged into one mesh per material once the world is built.
  const live = (o) => { o.userData.live = true; if (!o.parent) scene.add(o); return o; };

  /* scenery every world uses */
  const T = .3; // wall thickness
  // One floor of a building cut open at the front: floor, back wall, side walls (with a doorway on one side), a sign.
  function room({ cx = 0, y, w, h, d, floor, wall, sign, door = 'right', doorD = 1.8 }) {
    add(solid(rbox(w + 2 * T, .3, d + .2, .1), floor, { p: [cx, y - .15, .1] }));
    add(solid(rbox(w, h, T, .06), wall, { p: [cx, y + h / 2, -d / 2 - T / 2] }));
    for (const side of [-1, 1]) {
      const x = cx + side * (w / 2 + T / 2);
      if ((side > 0 ? 'right' : 'left') !== door) { add(solid(rbox(T, h, d, .08), wall, { p: [x, y + h / 2, 0] })); continue; }
      const back = d - doorD;
      add(solid(rbox(T, h, back, .08), wall, { p: [x, y + h / 2, -d / 2 + back / 2] }));
      add(solid(rbox(T, h - 2.3, doorD, .08), wall, { p: [x, y + 2.3 + (h - 2.3) / 2, d / 2 - doorD / 2] }));
    }
    if (sign) { const s = label(sign, { h: .46 }); s.position.set(cx - w / 2 + .35 + s.scale.x / 2, y + h - .45, -d / 2 + .25); add(s); }
  }
  // A lift shaft from y0 to y1, open at the front, with a car that carries travellers. x is the shaft's centre.
  const lifts = [];
  function lift({ x, y0, y1, d, w = 1.9, side = 1, at = y0, pit = true }) {
    if (pit) add(solid(rbox(w + T * 2, .3, d + .2, .1), '#b49cff', { p: [x, y0 - .15, .1] }));
    add(solid(rbox(w, y1 - y0, T, .06), '#e6dcff', { p: [x, (y0 + y1) / 2, -d / 2 - T / 2] }));
    add(solid(rbox(T, y1 - y0, d, .08), '#c7b4ff', { p: [x + side * (w / 2 + T / 2), (y0 + y1) / 2, 0] }));
    [-.7, .7].forEach((dx) => add(solid(new THREE.CylinderGeometry(.05, .05, y1 - y0, 8), '#9b5cff', { p: [x + dx, (y0 + y1) / 2, -d / 2 + .1] })));
    const pulley = live(solid(new THREE.CylinderGeometry(.32, .32, .16, 24), '#ffc61a', { p: [x, y1 - .45, 0], r: [Math.PI / 2, 0, 0] }));
    const rope = live(new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1, 6), toon('#56467a')));
    const cab = live(new THREE.Group());
    cab.add(solid(rbox(1.6, .14, 1.7, .06), '#ffc61a', { p: [0, .07, 0] }));
    cab.add(solid(rbox(1.6, 1.75, .1, .04), '#ffe27a', { p: [0, .9, -.8] }));
    cab.add(solid(rbox(1.7, .16, 1.8, .07), '#ff4d6d', { p: [0, 1.8, 0] }));
    [[-.77, -.8], [.77, -.8], [-.77, .8], [.77, .8]].forEach(([px, pz]) => cab.add(solid(new THREE.CylinderGeometry(.05, .05, 1.7, 8), '#ff4d6d', { p: [px, .9, pz] })));
    cab.position.set(x, at, .25);
    const L = {
      cab, home: at,
      slot: (i) => cab.position.clone().add([V(0, .14, 0), V(0, .14, .35), V(0, .62, -.2), V(0, 1.1, -.5)][i]),
      off: (i) => [V(0, .14, 0), V(0, .14, .35), V(0, .62, -.2), V(0, 1.1, -.5)][i],
      async in(o, i) { await hop(o, L.slot(i)); ride(o, L.off(i)); },
      to(y) { const a = cab.position.y; sfx((s) => s.blip()); return tween(.5 + Math.abs(y - a) / 3.3 * .45, (e) => { cab.position.y = a + (y - a) * e; }); },
      tick() { rope.position.set(x, (pulley.position.y + cab.position.y + 1.88) / 2, 0); rope.scale.y = Math.max(.01, pulley.position.y - cab.position.y - 1.88); pulley.rotation.y = cab.position.y * 1.5; },
    };
    lifts.push(L); return L;
  }
  // You: a jelly baby on a stool at a desk, with a screen the world draws on (a terminal, a browser).
  function you({ x, y, color = '#9b5cff' }) {
    add(solid(new THREE.CylinderGeometry(2, 2, .04, 40), '#eadcff', { p: [x - .4, y + .02, .6], s: [1.3, 1, .8], line: .02 }));
    const desk = new THREE.Group(); desk.position.set(x + 1.2, y, -.6); desk.rotation.y = -.5; add(desk);
    desk.add(solid(rbox(2.6, .16, 1.3, .06), '#c58a55', { p: [0, 1.0, 0] }));
    [[-1.15, -.5], [1.15, -.5], [-1.15, .5], [1.15, .5]].forEach(([px, pz]) => desk.add(solid(new THREE.CylinderGeometry(.06, .06, .95, 8), '#8a5a33', { p: [px, .5, pz] })));
    desk.add(solid(rbox(1.7, 1.3, 1, .18), '#efe3c8', { p: [0, 1.75, -.15] }));
    desk.add(solid(rbox(.5, .14, .5, .05), '#efe3c8', { p: [0, 1.12, -.15] }));
    const c = document.createElement('canvas'); c.width = 400; c.height = 290;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.36, .98), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    screen.position.set(0, 1.78, .36); desk.add(screen);
    desk.add(solid(rbox(1.2, .08, .4, .04), '#ffffff', { p: [0, 1.12, .38] }));
    blob(desk, 3.2, 1.8);
    const kid = live(wobbly(new THREE.Group())); kid.position.set(x - 1.25, y, .35); kid.rotation.y = .75;
    add(solid(new THREE.CylinderGeometry(.42, .36, .62, 20), '#3a5bff', { p: [x - 1.25, y + .31, .35] }));
    blob(scene, 1.4, 1.4, [x - 1.25, y + .02, .35]);
    kid.add(gel(new THREE.CapsuleGeometry(.36, .42, 8, 18), color, { p: [0, 1.05, 0] }));
    kid.add(gel(new THREE.SphereGeometry(.4, 28, 20), color, { p: [0, 1.78, 0] }));
    const arms = [-1, 1].map((sd) => { const a = new THREE.Group(); a.position.set(sd * .38, 1.32, .05); a.add(gel(new THREE.CapsuleGeometry(.1, .34, 6, 10), color, { p: [0, -.12, .16], r: [1.1, 0, 0] })); kid.add(a); return a; });
    [-1, 1].forEach((sd) => kid.add(gel(new THREE.CapsuleGeometry(.12, .32, 6, 10), color, { p: [sd * .17, .64, .32], r: [1.35, 0, 0] })));
    [-.15, .15].forEach((ex) => eye(kid, [ex, 1.86, .33], .095)); smile(kid, [0, 1.68, .38], .09);
    const Y = { kid, screen, canvas: c, typing: false, refresh: () => { tex.needsUpdate = true; }, at: () => screen.getWorldPosition(V()).add(V(.15, -.25, .35)) };
    yous.push({ Y, arms }); return Y;
  }
  const yous = [];
  // Outside: grass, soil cut open at the front, pebbles, lollipop trees, clouds and a sun.
  const grass = (x0, x1, y, d = 4.6) => add(solid(rbox(x1 - x0, .4, d, .15), '#62c934', { p: [(x0 + x1) / 2, y - .2, 0] }));
  const soil = (x0, x1, y0, y1, d = 4) => add(solid(rbox(x1 - x0, y0 - y1, d, .1), '#a5683a', { p: [(x0 + x1) / 2, (y0 + y1) / 2, 0] }));
  function pebbles(x0, x1, y0, y1, n = 26, z = 2.02) { for (let i = 0; i < n; i++) { const r = .08 + ((i * 37) % 7) * .025; add(solid(new THREE.SphereGeometry(r, 8, 6), i % 3 ? '#c9a27e' : '#8d6c55', { p: [x0 + ((i * 53) % 29) / 29 * (x1 - x0), y0 - ((i * 31) % 70) / 70 * (y0 - y1), z], s: [1.3, .8, .4], line: 0 })); } }
  function tree(x, y, s = 1, z = -.6) { add(solid(new THREE.CylinderGeometry(.14 * s, .18 * s, 1.6 * s, 10), '#8a5a33', { p: [x, y + .8 * s, z] })); add(solid(new THREE.SphereGeometry(1 * s, 20, 14), '#3fae4f', { p: [x, y + 2.1 * s, z] })); }
  const cloud = (x, y, z, s = 1) => [[0, 0, .9], [.9, -.15, .7], [-.85, -.2, .65]].forEach(([dx, dy, r]) => add(solid(new THREE.SphereGeometry(r * s, 18, 12), '#ffffff', { p: [x + dx * s, y + dy * s, z], s: [1, .8, .8], line: .03 })));
  const sunBall = (x, y, z) => add(solid(new THREE.SphereGeometry(1.1, 24, 16), '#ffd84d', { p: [x, y, z] }));
  // A gabled roof from x0 to x1, with a round window.
  function roof({ x0, x1, y, d, color = '#ff6f8a', h = 3, chimney = true }) {
    const sh = new THREE.Shape(); sh.moveTo(x0, 0); sh.lineTo(x1, 0); sh.lineTo((x0 + x1) / 2, h); sh.closePath();
    add(solid(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: .18, bevelSize: .18, bevelSegments: 3 }), color, { p: [0, y, -d / 2] }));
    add(solid(new THREE.CylinderGeometry(.62, .62, .12, 32), '#ffffff', { p: [(x0 + x1) / 2, y + h * .37, d / 2 + .24], r: [Math.PI / 2, 0, 0] }));
    add(solid(new THREE.CylinderGeometry(.48, .48, .14, 32), '#bfe6ff', { p: [(x0 + x1) / 2, y + h * .37, d / 2 + .26], r: [Math.PI / 2, 0, 0], line: 0 }));
    if (chimney) add(solid(rbox(.7, 1.4, .7, .1), '#c58a55', { p: [x0 + (x1 - x0) * .2, y + h * .58, -.4] }));
  }

  /* a tiny timeline: each step is a little script of tweens. A new step rushes the one still playing to its end;
     going back replays every step from the start, rushed, so the world is always exactly where that step leaves it. */
  const tweens = new Set();
  const tween = (dur, fn, e = ease) => rush || REDUCED ? (fn(1), Promise.resolve()) : new Promise((res) => tweens.add({ t: 0, dur, fn, e, res }));
  const wait = (s) => tween(s, () => {});
  const riders = new Map(); // object → where it sits in its lift
  const ride = (o, off, L = lifts[0]) => riders.set(o, [L, off]), unride = (o) => riders.delete(o);
  function hop(o, to, dur = .55, up = .8) { unride(o); const from = o.position.clone(); return tween(dur, (e) => { o.position.lerpVectors(from, to, e); o.position.y += Math.sin(Math.PI * e) * up; }); }
  function along(o, pts, dur) { unride(o); const c = new THREE.CatmullRomCurve3(pts); return tween(dur, (e) => o.position.copy(c.getPoint(e))); }
  const pop = (o, to = 1, dur = .35) => { const from = o.scale.x; o.visible = true; return tween(dur, (e) => { o.scale.setScalar(from + (to - from) * e); if (e === 1 && to === 0) o.visible = false; }, (e) => 1 - (1 - e) ** 3); };
  // move something inside whatever carries it (a character holding it up) to a new spot and size
  const settleTo = (o, to, size, dur = .5) => { const p0 = o.position.clone(), s0 = o.scale.x; return tween(dur, (e) => { o.position.lerpVectors(p0, to, e); o.scale.setScalar(s0 + (size - s0) * e); }); };
  const bubbles = [];
  function say(text, at) {
    bubbles.splice(0).forEach((b) => b.removeFromParent());
    if (!text) return;
    const b = label(text, { h: .4, top: true }); b.position.copy(at); add(b); bubbles.push(b);
  }

  /* camera: each shot is a box to fit, whatever the frame's shape */
  /* Backstage's cast: programs as characters, and the card that carries an answer */
  // A program is a character: it pops (outer) and wobbles (body) separately, so the two never fight over its size.
  const character = (build) => { const o = live(new THREE.Group()), body = new THREE.Group(); body.scale.setScalar(1.35); wobbly(body); o.add(body); build(body); o.userData.body = body; return o; };
  const HEAD = 2.65; // just over a character's head, where it holds what it carries
  const robot = (name, color) => character((b) => {
    b.add(gel(rbox(.8, .7, .6, .18), color, { p: [0, .58, 0] }));
    b.add(gel(rbox(.66, .5, .5, .16), '#e9ecf5', { p: [0, 1.22, 0] }));
    [-.15, .15].forEach((x) => eye(b, [x, 1.25, .27], .085));
    b.add(solid(new THREE.CylinderGeometry(.025, .025, .3, 6), INK, { p: [0, 1.6, 0], line: 0 }));
    b.add(gel(new THREE.SphereGeometry(.07, 12, 8), '#ff4d6d', { p: [0, 1.78, 0] }));
    [-.2, .2].forEach((x) => b.add(solid(new THREE.CylinderGeometry(.05, .05, .26, 8), INK, { p: [x, .13, 0], line: 0 })));
    const t = textPlane(name, .5, .26, { bg: '#ffffff' }); t.position.set(0, .58, .31); b.add(t);
  });
  // The answer a program carries back: a card with the lines it will print.
  // Shown big beside the roots so it can be read, then shrunk to be carried.
  const card = (rows) => {
    const c = document.createElement('canvas'), w = 1024, g = c.getContext('2d'), font = (px) => `700 ${px}px "JetBrains Mono", monospace`;
    g.font = font(100); const px = Math.min(46, Math.floor(100 * (w - 80) / Math.max(...rows.map((r) => g.measureText(r).width))));
    const lh = Math.round(px * 1.45), h = 56 + rows.length * lh; c.width = w; c.height = h;
    g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 30); g.fill(); g.stroke();
    g.fillStyle = INK; g.font = font(px); g.textBaseline = 'middle'; rows.forEach((r, i) => g.fillText(r, 40, 28 + lh * (i + .5)));
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const m = live(new THREE.Mesh(new THREE.PlaneGeometry(4.8, 4.8 * h / w), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, transparent: true }))); m.visible = false; return m;
  };
  const view = { yaw: 0, pitch: 0, zoom: 1 }, cam = { c: V(), dist: 0, shot: null };
  let gaze = null;
  const k = {
    V, ease, toon, jelly, solid, gel, rbox, eye, smile, wobbly, poke, blob, label, textPlane, jellyWord, sfx,
    scene, add, live, camera, T, room, lift, you, grass, soil, pebbles, tree, cloud, sunBall, roof,
    tween, wait, hop, along, pop, ride, unride, say,
    character, robot, card, HEAD, settleTo,
    shot: (s) => { cam.shot = s; }, look: (o) => { gaze = o; },
    get rush() { return rush; },
  };
  const W = world(k);
  const DIR = (W.DIR ?? V(.1, .11, 1)).clone().normalize();
  // A tall frame is narrow, so room shots crop to the room itself.
  const fitDist = (s) => { const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), w = camera.aspect < 1 && s.room ? s.w * .78 : s.w; return Math.max(s.h / 2 / t, w / 2 / (t * camera.aspect)) * 1.04 + (s.d ?? 2); };

  // Old machines: draw everything that never moves as one mesh per material (hundreds of draw calls become a few dozen).
  {
    scene.updateMatrixWorld(true);
    const groups = new Map(), done = [];
    scene.traverse((o) => {
      if (!o.isMesh || !(o.material.isMeshToonMaterial || o.material === OUTLINE || o.material === BLOB)) return;
      for (let a = o; a; a = a.parent) if (a.userData.live) return;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const key of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(key)) g.deleteAttribute(key);
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g.applyMatrix4(o.matrixWorld);
      (groups.get(o.material) ?? groups.set(o.material, []).get(o.material)).push(g); done.push(o);
    });
    done.forEach((o) => o.removeFromParent());
    for (const [m, gs] of groups) { const mesh = new THREE.Mesh(mergeGeometries(gs), m); if (m === BLOB) mesh.renderOrder = 1; scene.add(mesh); }
  }

  /* pointer: grab to turn, scroll to zoom, double-click to straighten */
  let easeHome = false, drag = null;
  canvas.style.cursor = 'grab';
  const endDrag = () => { drag = null; canvas.style.cursor = 'grab'; };
  canvas.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; easeHome = false; drag = { x: e.clientX, y: e.clientY, yaw: view.yaw, pitch: view.pitch }; });
  canvas.addEventListener('pointermove', (e) => { if (!drag) return; if (!e.buttons) return endDrag(); view.yaw = clamp(drag.yaw - (e.clientX - drag.x) * .006, -.8, .8); view.pitch = clamp(drag.pitch + (e.clientY - drag.y) * .005, -.35, .7); });
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag); canvas.addEventListener('lostpointercapture', endDrag);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); easeHome = false; view.zoom = clamp(view.zoom * Math.exp(e.deltaY * .0012), .5, 1.6); }, { passive: false });
  canvas.addEventListener('dblclick', () => { easeHome = true; });
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };

  // Old machines: if two seconds of frames (after the first few, which compile shaders) average under 30 a second,
  // the jelly stops being see-through, the costliest effect. It keeps its gloss and colour.
  const speed = { n: 0, time: 0 };
  const plainJelly = () => { for (const [key, m] of cache) if (key[0] === 'j') { m.transmission = 0; m.needsUpdate = true; } };

  function reset() {
    for (const tw of tweens) tw.res(); tweens.clear(); riders.clear();
    lifts.forEach((L) => { L.cab.position.y = L.home; }); yous.forEach((y) => { y.Y.typing = false; });
    say(null); gaze = null; W.reset();
  }
  let shown = 0, playing = null, queue = Promise.resolve(), t = 0;
  const tmp = V(), look = V();
  const api = {
    active: true, step: 0, speed, plainJelly,
    get busy() { return !!playing; },
    resize,
    resetView() { easeHome = true; },
    // Show step i: the next step plays (the canvas says data-playing while it does); any other jump (back, or
    // straight to a step) lands where that step ends.
    go(i) {
      api.step = i;
      queue = queue.then(async () => {
        if (playing) { rush = true; for (const tw of [...tweens]) { tw.fn(1); tw.res(); } tweens.clear(); await playing; rush = false; }
        if (i === shown + 1) { shown = i; cam.shot = TOWN_STEPS[i].shot; canvas.dataset.playing = i; playing = W.PLAY[i]().finally(() => { playing = null; delete canvas.dataset.playing; }); return; }
        reset(); rush = true; for (let n = 1; n <= i; n++) await W.PLAY[n](); rush = false;
        shown = i; cam.shot = TOWN_STEPS[i].ends ?? TOWN_STEPS[i].shot;
      });
      return queue;
    },
    // Play one of the world's named scenes from the start (Backstage's shows). Resolves when it ends or is cut short.
    play(name) {
      return new Promise((done) => {
        queue = queue.then(async () => {
          if (playing) { rush = true; for (const tw of [...tweens]) { tw.fn(1); tw.res(); } tweens.clear(); await playing; rush = false; }
          reset(); cam.shot = W.START; canvas.dataset.playing = name;
          playing = W.SCENES[name]().finally(() => { playing = null; delete canvas.dataset.playing; done(); });
        });
      });
    },
    tick(dt) {
      t += dt;
      if (speed.n < 140 && ++speed.n > 20) { speed.time += dt; if (speed.n === 140 && speed.time / 120 > 1 / 30) plainJelly(); }
      for (const tw of [...tweens]) { tw.t += dt; const e = Math.min(1, tw.t / tw.dur); tw.fn(tw.e(e)); if (e >= 1) { tweens.delete(tw); tw.res(); } }
      for (const [o, [L, off]] of riders) o.position.copy(L.cab.position).add(off);
      lifts.forEach((L) => L.tick());
      for (const o of wobblers) {
        const w = o.userData.wob; w.v += (-110 * w.x - 7 * w.v) * dt; w.x += w.v * dt;
        const b = Math.sin(t * 2.2 + w.ph) * .018, sy = 1 + w.x + b, sxz = 1 - (w.x + b) * .5; o.scale.set(w.base.x * sxz, w.base.y * sy, w.base.z * sxz);
      }
      yous.forEach(({ Y, arms }) => arms.forEach((a, i) => { a.rotation.x = Y.typing ? Math.sin(t * 22 + i * 2) * .25 : Math.sin(t * 1.5 + i) * .05; }));
      W.tick?.(dt, t);
      // eyes follow whatever is travelling, or else look at you
      look.copy(gaze?.visible ? gaze.getWorldPosition(tmp) : camera.position);
      for (const e of eyes) {
        const v = e.ball.worldToLocal(look.clone()).normalize(); v.z = Math.max(v.z, .55); v.normalize().multiplyScalar(e.r * .62); e.pupil.position.copy(v);
        e.blink -= dt; e.ball.scale.y = e.blink < 0 ? .12 : 1; if (e.blink < -.12) e.blink = 2 + Math.random() * 4;
      }
      // the camera glides to the step's shot; your own turn and zoom sit on top
      const s = W.SHOTS[cam.shot], g = 1 - Math.exp(-dt * 2.4);
      cam.c.lerp(s.c, g); cam.dist += (fitDist(s) - cam.dist) * g;
      if (easeHome && !drag) { const e = 1 - Math.exp(-dt * 4); view.yaw -= view.yaw * e; view.pitch -= view.pitch * e; view.zoom += (1 - view.zoom) * e; }
      const sph = new THREE.Spherical().setFromVector3(DIR.clone().multiplyScalar(cam.dist * view.zoom));
      sph.theta += view.yaw + (drag ? 0 : Math.sin(t * .35) * .03); sph.phi = clamp(sph.phi - view.pitch, .3, Math.PI / 2 + .25);
      camera.position.copy(cam.c).add(V().setFromSpherical(sph)); camera.lookAt(cam.c);
      if (window.JELLY_DRAW !== false) renderer.render(scene, camera); // off in tests that don't look at it (tests/lib.mjs)
    },
  };
  new ResizeObserver(resize).observe(canvas); resize();
  new IntersectionObserver(([en]) => { api.active = en.isIntersecting; }).observe(canvas);
  cam.shot = W.START ?? TOWN_STEPS[0].shot; cam.c.copy(W.SHOTS[cam.shot].c); reset(); cam.dist = fitDist(W.SHOTS[cam.shot]);
  towns.push(api);
  return api;
}
