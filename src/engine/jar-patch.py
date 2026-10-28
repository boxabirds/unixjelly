# The jelly jar. Every finished lesson earns a jelly with its own look (zebra, spotty, golden…), and the jellies
# live in a glass jar you can open from the side menu: grab them, fling them, shake the jar, and tap one to see
# what you learnt and where. The jar holds jellies from every course, through one storage key, 'jelly.collection'.
# The jellies are the same soft bodies as the jelly letters, in the shape of the bean on the "you earned" card.
# Run by shelly-patch.py, after courses-patch.py.

# ---------- physics: a bean shape, a round jar, a tap hook (bumping and sleeping are every jelly's own: JellyStage in shell.html) ----------
rep('const letterCache = new Map();', r'''// The jelly-baby outline from the "you earned" card (bean() below), as a shape the jelly physics can extrude.
const BEAN = '●';
function beanShape(size) {
  const k = size / 62, X = (x) => (x - 30) * k, Y = (y) => (66 - y) * k, s = new THREE.Shape();
  s.moveTo(X(30), Y(4));
  s.bezierCurveTo(X(48), Y(4), X(56), Y(18), X(54), Y(36));
  s.bezierCurveTo(X(52), Y(56), X(42), Y(66), X(29), Y(66));
  s.bezierCurveTo(X(16), Y(66), X(5), Y(56), X(6), Y(38));
  s.bezierCurveTo(X(7), Y(18), X(12), Y(4), X(30), Y(4));
  return s;
}
const letterCache = new Map();''')
rep('const shapes = FONT.generateShapes(ch, size);', 'const shapes = ch === BEAN ? [beanShape(size)] : FONT.generateShapes(ch, size);')
# Puff a jelly baby's flat faces into domes, and remember how far out the face is at each point, so the eyes sit on it.
rep("geo.translate(sx, sy, sz); geo.computeBoundingBox();", r"""geo.translate(sx, sy, sz); geo.computeBoundingBox();
  let eyeZ = null;
  if (ch === BEAN) {
    const bb2 = geo.boundingBox, a = (bb2.max.x - bb2.min.x) / 2, b = bb2.max.y / 2, z0 = bb2.max.z, P = geo.attributes.position;
    const puff = (x, y) => 1 + 1.1 * Math.max(0, 1 - (x / a) ** 2 - ((y - b) / b) ** 2);
    for (let i = 0; i < P.count; i++) P.setZ(i, P.getZ(i) * puff(P.getX(i), P.getY(i)));
    geo.computeVertexNormals(); geo.computeBoundingBox();
    eyeZ = (x, y) => z0 * puff(x, y);
  }""")
rep("const out = { geo, polys, box: geo.boundingBox.clone(), centerShift: -sx };", "const out = { geo, polys, box: geo.boundingBox.clone(), centerShift: -sx, eyeZ };")
rep("this.eyes = this.makeEyes(polys, box, bind);", "this.eyeZ = L.eyeZ; this.eyes = this.makeEyes(polys, box, bind); this.inside = { bind, polys, box }; // for what a sweet has suspended inside")
# a sweet's suspended bits ride its wobble, like the eyes
rep("      b.updateEyes(dt, this.look, this.t);", "      b.updateEyes(dt, this.look, this.t); b.bits?.update();")
rep("return { b: bind(x, y, z), r, ball, pupil,", "return { b: bind(x, y, this.eyeZ ? this.eyeZ(x, y) : z), r, ball, pupil,")
# A jelly baby is puffier than a letter: thinner middle, much rounder edges.
rep("let geo = new THREE.ExtrudeGeometry(shapes, { depth: size * .3, curveSegments: 7, bevelEnabled: true, bevelThickness: size * .09, bevelSize: size * .05, bevelSegments: 4 });",
    "let geo = new THREE.ExtrudeGeometry(shapes, ch === BEAN ? { depth: size * .08, curveSegments: 10, bevelEnabled: true, bevelThickness: size * .1, bevelSize: size * .08, bevelSegments: 6 } : { depth: size * .3, curveSegments: 7, bevelEnabled: true, bevelThickness: size * .09, bevelSize: size * .05, bevelSegments: 4 });")
# A round jar: jellies are kept inside a circle instead of a box.
rep("      x[j] = clamp(x[j], B.x0, B.x1); x[j + 2] = clamp(x[j + 2], B.z0, B.z1);",
    "      if (B.r) { const dx = x[j] - B.ox, dz = x[j + 2] - B.oz, rr = Math.hypot(dx, dz); if (rr > B.r) { x[j] = B.ox + dx * B.r / rr; x[j + 2] = B.oz + dz * B.r / rr; } if (x[j + 1] > B.top) x[j + 1] = B.top; }\n      else { x[j] = clamp(x[j], B.x0, B.x1); x[j + 2] = clamp(x[j + 2], B.z0, B.z1); }")
rep("if (tap) { d.b.hop(1.1); sound.boing(380, .4); }", "if (tap) { d.b.hop(1.1); sound.boing(380, .4); this.onTap?.(d.b); }")

# ---------- the jar stage and the jelly looks ----------
rep('let lastT = performance.now();', r'''/* ---------------- the jelly jar ---------------- */
// Every jelly's look. The pattern is painted on the jelly's resting shape, so it squishes along with the jelly.
const LOOKS = ['classic', 'zebra', 'spotty', 'stripy', 'swirly', 'sprinkle', 'checked', 'two-tone', 'glitter', 'rainbow', 'galaxy', 'golden'];
const PATTERN_GLSL = `
float jh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 jhue(float h) { return clamp(abs(mod(h * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.); }
vec3 jellyPattern(vec3 base) {
  vec2 q = vR.xy; float on = 0.; vec3 c2 = vec3(1.);
  if (uPat == 1) { on = step(.58, fract(q.x * 5. + sin(q.y * 9.) * .35 + vR.z * 2.)); c2 = vec3(.09, .05, .14); }
  else if (uPat == 2) { vec2 g = floor(q * 6.), f = fract(q * 6.) - .5, o = (vec2(jh(g), jh(g + 3.1)) - .5) * .35; on = 1. - step(.2, length(f - o)); }
  else if (uPat == 3) { on = step(.5, fract((q.x + q.y) * 5.)); }
  else if (uPat == 4) { vec2 c = q - vec2(0., .5); on = step(.5, fract(atan(c.y, c.x) / 6.2832 * 2. + length(c) * 7.)); }
  else if (uPat == 5) { vec2 g = floor(q * 16.), f = fract(q * 16.) - .5; on = step(.55, jh(g)) * (1. - step(.22, length(f))); c2 = jhue(jh(g + 5.)); }
  else if (uPat == 6) { on = mod(floor(q.x * 7.) + floor(q.y * 7.), 2.); }
  else if (uPat == 7) { on = step(.5, q.y); c2 = uC2; }
  else if (uPat == 8) { vec3 g = floor(vR * 45.); on = step(.86, jh(g.xy + g.z * 7.1)); }
  else if (uPat == 9) { return jhue(q.y * .9 + q.x * .3) * .85 + .15; }
  else if (uPat == 10) { vec2 c = q - vec2(0., .5); float sw = .5 + .5 * sin(atan(c.y, c.x) * 2. + length(c) * 14.); vec3 g = floor(vR * 40.);
    return mix(mix(vec3(.07, .05, .22), base, sw * .55), vec3(1.), step(.9, jh(g.xy + g.z * 3.3))); }
  else if (uPat == 11) { vec3 g = floor(vR * 45.); on = step(.9, jh(g.xy + g.z * 7.1)); }
  return mix(base, c2, on);
}`;
// A sweet is made like the jelly letters: see-through, deep colour where it's thick. Its look is either layers in the
// jelly itself (the pattern colours the light passing through, so stripes are clear or coloured bands inside), or bits
// suspended in it: chocolate chips, sprinkles, glitter, stars, gold leaf. Solid things inside see-through jelly show
// through it, bent by it, so the bits are ordinary little meshes that ride the jelly's wobble like the eyes.
const BITS = {
  spotty: { n: 14, geo: () => new THREE.SphereGeometry(1, 10, 8), s: [.075, .055, .075], mat: () => new THREE.MeshStandardMaterial({ color: '#4a2a17', roughness: .55 }) },
  sprinkle: { n: 26, reach: 1.2, geo: () => new THREE.CapsuleGeometry(.4, 1.6, 3, 6), s: [.022, .032, .022], mat: () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .4 }), colours: ['#ff4d6d', '#ffc61a', '#62c934', '#3a5bff', '#ffffff', '#ff8ad8'] },
  glitter: { n: 70, geo: () => new THREE.OctahedronGeometry(1), s: [.04, .04, .012], mat: () => new THREE.MeshStandardMaterial({ color: '#f4f6ff', metalness: 1, roughness: .15 }) },
  galaxy: { n: 60, geo: () => new THREE.IcosahedronGeometry(1), s: [.022, .022, .022], mat: () => new THREE.MeshBasicMaterial({ color: '#fffbe0' }) },
  golden: { n: 16, reach: .5, geo: () => new THREE.BoxGeometry(1, 1, 1), s: [.3, .05, .008], mat: () => new THREE.MeshStandardMaterial({ color: '#ffc84a', metalness: 1, roughness: .25 }) },
};
const COMPASS = Array.from({ length: 8 }, (_, i) => [Math.cos(i * Math.PI / 4), Math.sin(i * Math.PI / 4)]);
const bitParts = new Map(); // one geometry and material per kind, shared by every sweet
const LAYERED = ['zebra', 'stripy', 'swirly', 'checked', 'two-tone', 'rainbow']; // looks made of bands inside the jelly
function paintJelly(b, look, color2) {
  const pat = LOOKS.indexOf(look), m = b.mesh.material, P = b.geo.attributes.position.array;
  b.geo.setAttribute('aR', new THREE.BufferAttribute(Float32Array.from(P, (v) => v / b.size), 3));
  if (look === 'golden') { m.color.set('#ffe7a3'); m.attenuationColor.set('#ffb000'); } // clear amber, for the gold leaf
  if (look === 'galaxy') { m.color.set('#6a5acd'); m.attenuationColor.set('#24164f'); } // deep space
  // Also blended over what's behind it: three.js's see-through pass never shows other see-through things, and in a jar
  // the thing behind a sweet is usually another sweet.
  m.transparent = true; m.opacity = .9;
  if (LAYERED.includes(look)) {
    const jellyLook = m.onBeforeCompile;
    m.onBeforeCompile = (sh) => {
      jellyLook(sh);
      sh.uniforms.uPat = { value: pat }; sh.uniforms.uC2 = { value: new THREE.Color(color2) };
      sh.vertexShader = 'attribute vec3 aR;\nvarying vec3 vR;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vR = aR;');
      sh.fragmentShader = 'varying vec3 vR;\nuniform int uPat;\nuniform vec3 uC2;\n' + PATTERN_GLSL + '\n' + sh.fragmentShader
        .replace('material.attenuationColor = attenuationColor;', 'material.attenuationColor = jellyPattern(attenuationColor);');
    };
    m.customProgramCacheKey = () => 'jelly-layers' + b.size;
  }
  const kind = BITS[look];
  if (!kind) return;
  // scatter the bits through the inside of the sweet's resting shape, then bind each to the jelly's cage
  const parts = bitParts.get(look) ?? bitParts.set(look, { geo: kind.geo(), mat: kind.mat() }).get(look);
  const { bind, polys, box } = b.inside, zMid = (box.min.z + box.max.z) / 2, zHalf = (box.max.z - box.min.z) * .22;
  const mesh = new THREE.InstancedMesh(parts.geo, parts.mat, kind.n); mesh.frustumCulled = false;
  const items = [];
  for (let tries = 0; items.length < kind.n && tries < kind.n * 40; tries++) {
    const x = box.min.x + Math.random() * (box.max.x - box.min.x), y = box.min.y + Math.random() * (box.max.y - box.min.y);
    // a bit turns any way, so the whole of its reach has to fit inside the letter, or it pokes out through the jelly
    const sc = b.size * (.75 + Math.random() * .5), r = Math.max(...kind.s) * (kind.reach ?? 1) * sc * .85;
    if (!inside(polys, x, y) || !COMPASS.every(([dx, dy]) => inside(polys, x + dx * r, y + dy * r))) continue;
    const local = new THREE.Matrix4().compose(new THREE.Vector3(), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3)),
      new THREE.Vector3(...kind.s).multiplyScalar(sc));
    items.push({ b: bind(x, y, zMid + (Math.random() * 2 - 1) * zHalf), local });
  }
  mesh.count = items.length;
  if (kind.colours) items.forEach((_, i) => mesh.setColorAt(i, new THREE.Color(kind.colours[i % kind.colours.length])));
  b.mesh.add(mesh); // the jelly's mesh is in world space, so this stays put; it goes when the jelly goes
  const F = new THREE.Matrix4(), M = new THREE.Matrix4();
  let fresh = true;
  b.bits = {
    // follow the jelly: each bit sits where its cage points are now, stretched and turned the way the jelly is there
    update() {
      if (b.sleeping && !fresh) return; fresh = false;
      const x = b.x, nF = b.nodalF;
      items.forEach((it, i) => {
        let px = 0, py = 0, pz = 0; const f = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (const [id, w] of it.b) { px += x[id * 3] * w; py += x[id * 3 + 1] * w; pz += x[id * 3 + 2] * w; for (let k = 0; k < 9; k++) f[k] += nF[id * 9 + k] * w; }
        F.set(f[0], f[1], f[2], 0, f[3], f[4], f[5], 0, f[6], f[7], f[8], 0, 0, 0, 0, 1);
        M.multiplyMatrices(F, it.local).setPosition(px, py, pz); mesh.setMatrixAt(i, M);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
// A square glass sweet jar. Jellies are dropped in one by one and tumble onto each other.
class JarStage extends JellyStage {
  // A round sweet jar in the jelly style: see-through glass with a rainbow sheen, a puffy lid that has popped off,
  // and a coaster, floating on soft rainbow swirls. The jar is rigid; only the jellies wobble.
  setWord() {
    const s = this.opts.size, R = this.R = s * 1.9, Rn = this.Rn = s * 1.45, H = this.H = s * 4.6, t = s * .12;
    // ox, oz: where the jar's middle is (it moves when shaken); top: the ceiling, which is only low while the lid is on
    this.bounds = { r: R, ox: 0, oz: 0, top: Infinity, x0: -R, x1: R, z0: -R, z1: R }; this.wordWidth = R * 2;
    // Neutral tone mapping keeps the jellies' colours bright; the filmic one used for the letters washes bright colours out.
    this.renderer.toneMapping = THREE.NeutralToneMapping; this.renderer.toneMappingExposure = 1;
    // the background: a big sphere painted with slowly morphing pastel swirls (the jellies refract it, too)
    this.scene.fog = null;
    this.bg = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { uT: { value: 0 } },
      vertexShader: 'varying vec3 vP; void main() { vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `varying vec3 vP; uniform float uT;
        vec3 hue(float h) { return clamp(abs(mod(h * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.); }
        void main() {
          float u = atan(vP.x, -vP.z), v = vP.y;
          float w = sin(u * 2.3 + sin(v * 3.1 + uT * .21) * 1.7 + uT * .09) + sin(v * 4.2 - u * 1.3 + sin(u * 1.7 - uT * .17) * 1.2);
          vec3 c = mix(vec3(1., .97, .93), hue(fract(w * .16 + v * .25 + uT * .015)), .13 + .04 * sin(w * 2.));
          gl_FragColor = vec4(c, 1.);
        }` });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(4, 48, 32), this.bg); sky.renderOrder = -1; this.scene.add(sky);
    // the grid floor becomes an invisible one that only catches soft shadows
    const floor = this.scene.children.find((o) => o.isMesh && o.geometry.type === 'PlaneGeometry');
    floor.material = new THREE.ShadowMaterial({ opacity: .14 }); floor.position.y = -s * .2;
    const jelly = (color, transmission, extra = {}) => new THREE.MeshPhysicalMaterial({ color, transmission, thickness: s * .3, roughness: .15, ior: 1.36, clearcoat: 1, clearcoatRoughness: .06, sheen: .15, sheenColor: new THREE.Color('#ffffff'), attenuationColor: new THREE.Color(color), attenuationDistance: s * .8, ...extra });
    // glass: a lathe profile with a rounded base, straight sides, a shoulder and a neck
    const prof = [];
    const arc = (cx, cy, r, a0, a1, n = 8) => { for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; prof.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a))); } };
    prof.push(new THREE.Vector2(0, -t));
    arc(R + t - s * .5, s * .5 - t, s * .5, -Math.PI / 2, 0);
    prof.push(new THREE.Vector2(R + t, H * .74));
    for (let k = 1; k <= 10; k++) { const q = k / 10, e = q * q * (3 - 2 * q); prof.push(new THREE.Vector2(R + t - (R - Rn) * e, H * .74 + H * .18 * q)); }
    prof.push(new THREE.Vector2(Rn + t, H));
    const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), new THREE.MeshPhysicalMaterial({ color: '#e6f7ff', transparent: true, opacity: .1, roughness: .06, clearcoat: 1, clearcoatRoughness: .04, iridescence: .7, iridescenceIOR: 1.3, specularIntensity: 1, side: THREE.DoubleSide, depthWrite: false }));
    glass.renderOrder = 2;
    const vessel = this.vessel = new THREE.Group(); vessel.add(glass); this.scene.add(vessel);
    // a chunky white lip round the neck
    const lip = new THREE.Mesh(new THREE.TorusGeometry(Rn + t, s * .13, 16, 64), jelly('#ffffff', .2)); lip.rotation.x = Math.PI / 2; lip.position.y = H; vessel.add(lip);
    // the lid has popped off and bobs above the jar, tilted, so jellies can drop in
    const puck = (r, h, round) => { const pts = [new THREE.Vector2(0, 0)]; for (let k = 0; k <= 12; k++) { const a = -Math.PI / 2 + Math.PI * k / 12; pts.push(new THREE.Vector2(r - round + round * Math.cos(a), h / 2 + h / 2 * Math.sin(a))); } pts.push(new THREE.Vector2(0, h)); return new THREE.LatheGeometry(pts, 48); };
    const lid = this.lid = new THREE.Group();
    const cap = this.cap = new THREE.Mesh(puck(Rn + s * .3, s * .55, s * .26), jelly('#ff4d6d', .35)); cap.castShadow = true;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(s * .32, 24, 16), jelly('#ffc61a', .3)); knob.scale.y = .75; knob.position.y = s * .62; knob.castShadow = true;
    lid.add(cap, knob); lid.position.set(R * .85, H + s * .75, -s * .3); lid.rotation.set(.2, 0, -.6); this.scene.add(lid);
    this.lidOff = { p: lid.position.clone(), r: lid.rotation.clone() };
    // a lemon coaster to stand on
    const coaster = new THREE.Mesh(puck(R + s * .7, s * .2, s * .1), jelly('#ffc61a', .25)); coaster.position.y = -s * .2 - t; coaster.receiveShadow = true; vessel.add(coaster);
    const sc = this.sun.shadow.camera; sc.left = -R * 2.5; sc.right = R * 2.5; sc.top = H * 1.6; sc.bottom = -R * 2.5; sc.near = .01; sc.far = 4; sc.updateProjectionMatrix();
    this.sun.position.set(R * .8, H * 3, H * 1.6); this.sun.target.position.set(0, H * .3, 0);
    this.resize();
  }
  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight; if (!w || !h || !this.H) return;
    this.renderer.setSize(w, h, false);
    const cam = this.camera, a = w / h, t = Math.tan(cam.fov * Math.PI / 360), dist = Math.max(this.H * .9 / t, this.R * 2.1 / (t * a));
    cam.aspect = a; cam.position.set(0, this.H * .95, dist); cam.lookAt(0, this.H * .58, 0); cam.updateProjectionMatrix();
  }
  tick(dt) {
    if (!REDUCED) this.bg.uniforms.uT.value += dt;
    if (this.shakeT != null) this.shaking(dt);
    else if (!REDUCED) this.lid.position.y = this.H + this.opts.size * (.75 + .1 * Math.sin(this.bg.uniforms.uT.value * 1.6));
    super.tick(dt);
  }
  // Shake the jar: the lid goes on, the jar is shaken hard in a figure of eight, and the lid pops off again. The jar's
  // walls really move, so the glass throws the jellies about; while the lid is on it is a ceiling, so nobody escapes.
  shaking(dt) {
    const t = this.shakeT += dt, s = this.opts.size, B = this.bounds, L = this.lid, off = this.lidOff, ease = (q) => q * q * (3 - 2 * q);
    // about 2 g at the ends of each swing; then the lid stays on a moment (hold) so nothing is still flying when it lifts
    const on = .35, rock = 1.8, hold = .6, open = on + rock + hold, end = open + .5, amp = s * .575, hz = 4, w = (t - on) * hz * Math.PI * 2;
    const env = t > on && t < on + rock ? Math.min(1, (t - on) / .2, (on + rock - t) / .2) : 0;
    B.ox = amp * env * Math.sin(w); B.oz = amp * .45 * env * Math.sin(2 * w + .7);
    this.vessel.position.set(B.ox, s * .125 * env * Math.abs(Math.sin(w)), B.oz);
    this.vessel.rotation.set(B.oz / amp * .14, 0, -B.ox / amp * .2);
    if (env) {
      // each time the jar changes direction it slams the jellies up into the lid and sets them tumbling
      const half = Math.floor(w / Math.PI);
      if (half !== this.lastJolt) {
        this.lastJolt = half;
        for (const b of this.bodies) {
          const c = b.center(), up = .65 + Math.random() * .3, side = [(Math.random() - .5) * .6, (Math.random() - .5) * .6], spin = [0, 1, 2].map(() => (Math.random() - .5) * 20);
          b.wake();
          for (let i = 0; i < b.N; i++) {
            const j = i * 3, rx = b.x[j] - c[0], ry = b.x[j + 1] - c[1], rz = b.x[j + 2] - c[2];
            b.v[j] += side[0] + spin[1] * rz - spin[2] * ry; b.v[j + 1] += up + spin[2] * rx - spin[0] * rz; b.v[j + 2] += side[1] + spin[0] * ry - spin[1] * rx;
          }
        }
        sound.boing(420 + Math.random() * 260, .09, .09);
      }
    }
    for (const b of this.bodies) b.wake();
    // the lid: down onto the neck, along for the ride, then back up to where it floats
    const q = t < on ? ease(t / on) : t < open ? 1 : 1 - ease(Math.min(1, (t - open) / (end - open)));
    L.position.set(off.p.x + (B.ox - off.p.x) * q, off.p.y + (this.vessel.position.y + this.H + s * .05 - off.p.y) * q + (t > open ? s * .6 * Math.sin(Math.min(1, (t - open) / (end - open)) * Math.PI) : 0), off.p.z + (B.oz - off.p.z) * q);
    L.rotation.set(off.r.x * (1 - q) + this.vessel.rotation.x * q, 0, off.r.z * (1 - q) + this.vessel.rotation.z * q);
    B.top = t >= on && t < open ? this.H - s * .1 : Infinity;
    if (t >= on && !this.lidDown) { this.lidDown = true; sound.boing(300, .18, .08); }
    if (t >= open && !this.lidUp) { this.lidUp = true; sound.boing(720, .3, .1); }
    if (t >= end) { this.shakeT = null; B.ox = B.oz = 0; B.top = Infinity; this.vessel.position.set(0, 0, 0); this.vessel.rotation.set(0, 0, 0); }
  }
  // No tidying up and no standing up: jellies in a jar just lie where they land.
  tidy() {}
  fill(items) {
    for (const b of this.bodies) { this.scene.remove(b.mesh); b.eyes.forEach((e) => this.scene.remove(e.ball, e.pupil)); b.geo.dispose(); b.mesh.material.dispose(); }
    this.bodies = [];
    // Every jelly is the size it would be in the fullest jar: the most jellies any course gives (MOST_JELLIES), with
    // room to shake. So jellies are the same size in every jar, however few it holds.
    const big = 1.8, grow = big * Math.cbrt(6 / Math.max(6, MOST_JELLIES, items.length));
    items.forEach((it, i) => {
      // 3 cage cells across, not the letters' 6.5: a jar holds many more jellies than a word has letters
      const b = new JellyBody(this, BEAN, it.colour, 0, this.opts.size * grow, 3);
      paintJelly(b, it.look, JELLY[(JELLY.indexOf(it.colour) + 3) % JELLY.length] ?? '#ffffff');
      b.item = it; this.bodies.push(b); this.scene.add(b.mesh); b.eyes.forEach((e) => this.scene.add(e.ball, e.pupil));
      this.toss(b, i * (REDUCED ? .02 : .09));
    });
  }
  // Drop a jelly in from above the rim, at a random spot, turned a random way.
  toss(b, delay = 0) {
    const s = this.opts.size, ang = Math.random() * Math.PI * 2, rad = Math.sqrt(Math.random()) * this.Rn * .55, x0 = Math.cos(ang) * rad, z0 = Math.sin(ang) * rad, turn = Math.random() * Math.PI * 2, c = Math.cos(turn), sn = Math.sin(turn);
    b.cx = x0; b.place(this.H + s * (.4 + Math.random() * 1.2), (Math.random() - .5) * 2.4);
    for (let i = 0; i < b.N; i++) { const j = i * 3, x = b.x[j] - x0, z = b.x[j + 2]; b.x[j] = x0 + x * c - z * sn; b.x[j + 2] = z0 + x * sn + z * c; }
    b.v.fill(0); b.sleeping = false; b.quiet = 0; b.dirty = true; b.updateBox();
    // never start inside another jelly: collisions can't separate two that begin inside each other, so rise above any
    // jelly already dropped in over the same spot (it falls first, and stays ahead)
    const lift = Math.max(0, ...this.bodies.filter((o) => o !== b && o.lo && [0, 2].every((k) => o.lo[k] < b.hi[k] + b.cell && b.lo[k] < o.hi[k] + b.cell)).map((o) => o.hi[1] + b.cell - b.lo[1]));
    for (let i = 1; i < b.x.length; i += 3) b.x[i] += lift;
    b.prev.set(b.x); b.updateBox();
    b.spawnAt = this.t + delay; b.visibleNow(false);
  }
  shake() {
    if (this.shakeT != null) return;
    if (!REDUCED) { this.shakeT = 0; this.lastJolt = -1; this.lidDown = this.lidUp = false; return; }
    // reduced motion: no lid and no rocking, just a quick hop for everyone
    for (const b of this.bodies) { b.wake(); for (let i = 0; i < b.N; i++) { b.v[i * 3] += (Math.random() - .5) * .6; b.v[i * 3 + 1] += .5 + Math.random() * .6; b.v[i * 3 + 2] += (Math.random() - .5) * .3; } }
    sound.boing(240, .5, .14);
  }
}

let lastT = performance.now();''')

# While the jar is open, the jelly letters behind it stop, so the jar gets the whole frame.
rep("  for (const s of stages) if (s.active && !document.hidden) s.tick(dt);", "  for (const s of stages) if (s.active && !document.hidden && (s === jar || $('#jarBox').hidden)) s.tick(dt);")

# ---------- each lesson's jelly, the collection, and the jar window ----------
rep("  $('#jarCount').textContent = `${n} / ${ALL.length} jellies`; paintCourses(n, ALL.length);",
    "  $('#jarCount').textContent = `${n} / ${ALL.length} jellies`; paintCourses(n, ALL.length); collect();")
rep('/* ---------------- panels + navigation ---------------- */', r'''/* ---------------- the jelly jar: collecting ---------------- */
// Each lesson's jelly has a look. The last lesson of a course gives the golden one. The others take turns through
// the patterns, starting at a different place in each course, so jellies from different courses look different.
const LOOK_NAMES = { classic: 'classic', zebra: 'zebra', spotty: 'spotty', stripy: 'stripy', swirly: 'swirly', sprinkle: 'sprinkle', checked: 'checked', 'two-tone': 'two-tone', glitter: 'glitter', rainbow: 'rainbow', galaxy: 'galaxy', golden: 'golden' };
const look = (id) => {
  const i = ALL.findIndex((a) => a.id === id), plain = Object.keys(LOOK_NAMES).filter((k) => k !== 'golden');
  return i === ALL.length - 1 ? 'golden' : plain[(i + COURSES.indexOf(COURSE) * 4) % plain.length];
};
// The most jellies one course gives: a lesson each, plus the overview and backstage where a course has them.
// tests/jar.mjs checks that no course gives more, and that a jar this full still holds them all.
const MOST_JELLIES = 17;
const jarStore = () => { try { return JSON.parse(localStorage.getItem('jelly.collection')) || {}; } catch { return {}; } };
// Keep this course's finished lessons in the shared collection, with what each one taught, for the jar's labels.
function collect() {
  const all = jarStore(), words = (typeof RECAP !== 'undefined' && RECAP.words) || {};
  for (const a of ALL) {
    const key = `${COURSE.id}:${a.id}`;
    if (!store.done[a.id]) { delete all[key]; continue; }
    all[key] ??= { at: Date.now() };
    Object.assign(all[key], { course: COURSE.title, word: a.word ?? '', name: a.name, colour: a.color, look: look(a.id), does: words[a.id]?.does ?? '', ex: words[a.id]?.ex ?? '' });
  }
  try { localStorage.setItem('jelly.collection', JSON.stringify(all)); } catch {}
  $('#jarOpen').textContent = `My jelly jars (${Object.keys(all).length})`;
}

/* ---------------- panels + navigation ---------------- */''')

rep('<div class="toast" id="toast" role="status"></div>', '''<div class="jarbox" id="jarBox" hidden role="dialog" aria-modal="true" aria-label="Your jelly jars">
  <div class="jar-card">
    <div class="jar-head"><div><h2 id="jarTitle">Your jelly jars</h2><p id="jarSum"></p></div><div class="jar-btns"><button class="btn alt" id="jarBack" hidden>← All my jars</button><button class="btn" id="jarShake" hidden>Shake it!</button><button class="btn alt" id="jarClose">Close</button></div></div>
    <div class="jar-view"><div class="shelf" id="jarShelf"></div><canvas id="jarCanvas" hidden></canvas><div class="jar-pop" id="jarPop" hidden></div><p class="jar-empty" id="jarEmpty" hidden>No jellies in this jar yet. Finish a lesson to earn one!</p></div>
    <div class="jar-foot"><p class="jar-tip" id="jarTip"></p><div class="jar-file"><button class="pill-ink" id="jarSave">Save my jellies</button><button class="pill-ink" id="jarLoad">Use my existing jellies</button><input type="file" id="jarFile" accept=".json,application/json" hidden></div></div>
  </div>
</div>
<div class="toast" id="toast" role="status"></div>''')
rep('<button class="pill" id="resetBtn">Empty the jar</button>', '<button class="pill" id="resetBtn">Start this course again</button>')
rep('Yes, empty it', "Yes, start again")
rep("toast('Jar emptied. Fresh start!')", "toast('This course\\'s jellies are out of the jar. Fresh start!')")
rep('<div class="beans" id="beans"></div>', '<div class="beans" id="beans"></div><button class="jar-open" id="jarOpen">My jelly jars</button>')

# The "you earned" card shows the jelly's own look, and the jelly that flies into the jar is that one.
rep("<div class=\"un-card\">${bean(item.color, 'un-bean')}", "<div class=\"un-card\">${bean(item.color, 'un-bean', look(id))}")
rep('<div class="un-earned">You earned the <b style="color:${item.color}">${esc(item.word ?? item.name)}</b> jelly!</div>',
    '<div class="un-earned">You earned the ${LOOK_NAMES[look(id)]} <b style="color:${item.color}">${esc(item.word ?? item.name)}</b> jelly!</div><button class="un-jar" id="unJar">See it in my jar</button>')
rep("$('#unStay').onclick = () => { G.card = false; renderGuide(); primaryButton()?.focus({ preventScroll: true }); };",
    "$('#unStay').onclick = () => { G.card = false; renderGuide(); primaryButton()?.focus({ preventScroll: true }); };\n  $('#unJar').onclick = () => { G.card = false; renderGuide(); openJar(COURSE.id); };")
rep("  const fly = document.createElement('div'); fly.className = 'flyer'; fly.innerHTML = bean(color);",
    "  const fly = document.createElement('div'); fly.className = 'flyer'; fly.innerHTML = from.outerHTML.replace('un-bean', '');")

# bean(): the card's jelly, now with an optional look painted inside its outline.
region('const bean = (color, cls = \'\') => `', '\n', r'''let beanN = 0;
const BEAN_PATH = 'M30 4c18 0 26 14 24 32-2 20-12 30-25 30S5 56 6 38C7 18 12 4 30 4z';
// Fixed "random" sprinkles and sparkles, the same every time.
const DOTS = Array.from({ length: 34 }, (_, i) => [(i * 37 % 52) + 4, (i * 23 % 62) + 4, ['#ff4d6d', '#62c934', '#3a5bff', '#ffc61a', '#9b5cff', '#fff'][i % 6]]);
const LOOK_SVG = {
  zebra: () => [6, 18, 30, 42, 54].map((x) => `<path d="M${x - 4} 0q6 20 0 35t2 35h5q-6-20 0-35t-2-35z" fill="${INK}" opacity=".85"/>`).join(''),
  spotty: () => DOTS.slice(0, 12).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" opacity=".85"/>`).join(''),
  stripy: () => [-40, -24, -8, 8, 24, 40, 56].map((x) => `<path d="M${x} 70l40-70h7l-40 70z" fill="#fff" opacity=".7"/>`).join(''),
  swirly: () => [8, 16, 24, 32].map((r) => `<circle cx="30" cy="38" r="${r}" fill="none" stroke="#fff" stroke-width="3.5" opacity=".7"/>`).join(''),
  sprinkle: () => DOTS.map(([x, y, c], i) => `<rect x="${x}" y="${y}" width="6" height="2.4" rx="1.2" fill="${c}" transform="rotate(${i * 47 % 180} ${x + 3} ${y + 1})"/>`).join(''),
  checked: () => Array.from({ length: 49 }, (_, i) => (i % 7 + Math.floor(i / 7)) % 2 ? `<rect x="${i % 7 * 10}" y="${Math.floor(i / 7) * 10}" width="10" height="10" fill="#fff" opacity=".65"/>` : '').join(''),
  'two-tone': (c) => `<rect x="0" y="36" width="60" height="40" fill="${JELLY[(JELLY.indexOf(c) + 3) % JELLY.length]}"/>`,
  glitter: () => DOTS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff"/>`).join(''),
  rainbow: () => ['#ff4d6d', '#ff8a2b', '#ffc61a', '#62c934', '#3a5bff', '#9b5cff'].map((c, i) => `<rect x="0" y="${i * 12}" width="60" height="12" fill="${c}"/>`).join(''),
  galaxy: (c) => `<rect width="60" height="70" fill="#120c38"/><circle cx="30" cy="38" r="16" fill="${c}" opacity=".45"/>` + DOTS.slice(0, 20).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#fff"/>`).join(''),
  golden: () => `<rect width="60" height="70" fill="#ffc61a"/>` + DOTS.slice(0, 14).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#fff"/>`).join(''),
};
const bean = (color, cls = '', lk = 'classic') => { const id = 'bn' + beanN++, art = LOOK_SVG[lk]?.(color) ?? ''; return `<svg class="bean-svg ${cls}" viewBox="0 0 60 70" aria-hidden="true">${art ? `<clipPath id="${id}"><path d="${BEAN_PATH}"/></clipPath>` : ''}<path d="${BEAN_PATH}" fill="${color}"/>${art ? `<g clip-path="url(#${id})">${art}</g>` : ''}<path d="${BEAN_PATH}" fill="none" stroke="${INK}" stroke-width="4"/><ellipse cx="18" cy="15" rx="5" ry="3" fill="#fff" opacity=".55"/><ellipse cx="22" cy="29" rx="7" ry="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/><ellipse cx="38" cy="29" rx="7" ry="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/><g class="pp"><circle cx="22" cy="31" r="3.6" fill="${INK}"/><circle cx="38" cy="31" r="3.6" fill="${INK}"/></g><path d="M22 45q8 7 16 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></svg>`; };
''', keep_end=False)

# The jar window: opened from the side menu. The 3D jar is made the first time it opens.
rep("  if (e.key === 'Escape') $('.app').classList.remove('peek');", "  if (!$('#jarBox').hidden) { if (e.key === 'Escape') closeJar('the Esc key', e); return; }\n  if (e.key === 'Escape') $('.app').classList.remove('peek');")
rep("  const fwd = e.key === 'PageDown'", "  if (!$('#jarBox').hidden) return;\n  const fwd = e.key === 'PageDown'")
rep('/* ---------------- panels + navigation ---------------- */', r'''/* ---------------- the jelly jar: the window ---------------- */
// Opens on a shelf with one jar per course, in course order. Tap a jar to open it in 3D.
let jar = null, jarKeys = '', jarCourse = null;
const lidColour = (c) => JELLY[COURSES.indexOf(c) % JELLY.length];
const jelliesOf = (all, c) => Object.entries(all).filter(([k]) => k.startsWith(c.id + ':')).map(([, v]) => v).sort((a, b) => a.at - b.at);
function openJar(id) {
  $('#jarBox').hidden = false; $('#jarPop').hidden = true;
  if (id) showJar(course(id)); else showShelf();
  $('#jarClose').focus({ preventScroll: true });
}
function showShelf() {
  const all = jarStore(), prog = courseStore(), n = Object.keys(all).length;
  jarCourse = null; $('#jarPop').hidden = true;
  $('#jarTitle').textContent = 'Your jelly jars';
  $('#jarSum').textContent = n ? `${n} ${n === 1 ? 'jelly' : 'jellies'} so far` : '';
  $('#jarTip').textContent = 'One jar for every course. Tap a jar to open it.';
  $('#jarShelf').hidden = false; $('#jarCanvas').hidden = true; $('#jarEmpty').hidden = true; $('#jarBack').hidden = true; $('#jarShake').hidden = true;
  $('#jarShelf').innerHTML = COURSES.map((c) => {
    const mine = jelliesOf(all, c), total = prog[c.id]?.total, later = !c.folder;
    const beans = mine.slice(0, 24).map((it, k) => {
      const row = Math.floor(k / 5), x = 14 + (k % 5) * 17 + (row % 2) * 8, y = 118 - row * 15;
      return `<g transform="rotate(${(k * 53 % 50) - 25} ${x + 8} ${y + 9})">${bean(it.colour, '', it.look).replace('<svg class="bean-svg ', `<svg x="${x}" y="${y}" width="16" height="19" class="mini-bean `)}</g>`;
    }).join('');
    const note = later ? 'coming later' : mine.length ? `${mine.length}${total ? ` of ${total}` : ''} ${mine.length === 1 ? 'jelly' : 'jellies'}` : 'empty';
    return `<button class="shelf-jar${c === COURSE ? ' here' : ''}${later ? ' later' : ''}" data-course="${c.id}"${later ? ' disabled' : ''}>
      <svg viewBox="0 0 120 150" aria-hidden="true"><rect x="14" y="6" width="92" height="16" rx="8" fill="${lidColour(c)}" stroke="${INK}" stroke-width="3"/>
        <path d="M24 24h72v8q14 6 14 24v74q0 14-14 14H24q-14 0-14-14V56q0-18 14-24z" fill="#ffffff80" stroke="${INK}" stroke-width="3"/>${beans}
        <path d="M18 60q0-14 10-20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>
      <b>${esc(c.title)}</b><small>${esc(note)}</small></button>`;
  }).join('');
}
function showJar(c) {
  const all = jarStore(), items = jelliesOf(all, c);
  jarCourse = c;
  $('#jarTitle').textContent = `${c.title} jar`;
  $('#jarSum').textContent = `${items.length} ${items.length === 1 ? 'jelly' : 'jellies'}`;
  $('#jarTip').textContent = 'Grab a jelly and fling it. Tap one to see where you got it.';
  $('#jarShelf').hidden = true; $('#jarCanvas').hidden = false; $('#jarEmpty').hidden = items.length > 0; $('#jarBack').hidden = false; $('#jarShake').hidden = false;
  if (booted && !jar) {
    jar = new JarStage($('#jarCanvas'), { word: '', size: .052 * Math.min(1, Math.cbrt(20 / Math.max(20, items.length))), bg: '#e9f5ff', floor: '#cfe6ff' });
    jar.onTap = (b) => showJelly(b.item); $('#jarCanvas').stage = jar; // tests find the jar here
  }
  const keys = c.id + '|' + items.map((it) => it.word + it.at).join();
  if (jar && keys !== jarKeys) { jarKeys = keys; jar.cap.material.color.set(lidColour(c)); jar.cap.material.attenuationColor.set(lidColour(c)); jar.fill(items); }
  requestAnimationFrame(() => jar?.resize());
}
// The jar has closed by itself while testers played with the jellies. Every press, release and click in the jar window
// is logged as [jar], and so is what closed it, so a tester can paste the console from the browser's developer tools.
const jarSeen = (e) => `${e.type} on ${e.target.id ? '#' + e.target.id : e.target.className || e.target.tagName} at ${Math.round(e.clientX)},${Math.round(e.clientY)} (${e.pointerType || 'mouse'}, button ${e.button}${jar?.drag ? ', carrying a jelly' : ''})`;
for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'click']) $('#jarBox').addEventListener(t, (e) => console.info('[jar]', jarSeen(e)), true);
function closeJar(why = 'something else', e) {
  console.info('[jar] closed by', why, e ? '· ' + jarSeen(e) : ''); console.trace('[jar] the code that closed it');
  $('#jarBox').hidden = true; primaryButton()?.focus({ preventScroll: true });
}
function showJelly(it) {
  const pop = $('#jarPop');
  pop.innerHTML = `<button class="jar-x" aria-label="Close">×</button>${bean(it.colour, 'pop-bean', it.look)}<div><div class="pop-name">The ${esc(LOOK_NAMES[it.look] ?? it.look)} jelly</div>
    <div class="pop-word" style="color:${it.colour}">${esc(it.word || it.name)}</div><div class="pop-where">${esc(it.name)} · ${esc(it.course)}</div>
    ${it.does ? `<p>${esc(it.does)}</p>` : ''}${it.ex ? `<code>${esc(it.ex)}</code>` : ''}</div>`;
  pop.hidden = false; pop.querySelector('.jar-x').onclick = () => { pop.hidden = true; };
}
$('#jarOpen').onclick = () => openJar(); $('#beans').onclick = () => openJar();
$('#jarShelf').addEventListener('click', (e) => { const b = e.target.closest('.shelf-jar'); if (b && !b.disabled) showJar(course(b.dataset.course)); });
$('#jarBack').onclick = showShelf;
$('#jarClose').onclick = (e) => closeJar('the Close button', e); $('#jarShake').onclick = () => jar?.shake();
$('#jarBox').addEventListener('click', (e) => { if (e.target === $('#jarBox')) closeJar('a click on the dimmed area around the jar', e); });

/* ---------------- saving and loading jellies ---------------- */
// Progress lives only in this browser. A save file keeps it safe, carries it to another computer, and carries it
// between guides hosted as separate pages (as on claude.ai), which can't see each other's storage.
// On claude.ai a page may only offer a file through the viewer's "downloads" permission; anywhere else it's an ordinary download.
const DOWNLOADS = window.claude?.use?.('downloads') ?? Promise.resolve(null);
const readKey = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const writeKey = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
async function saveJellies() {
  save(); collect();
  const progress = Object.fromEntries(COURSES.filter((c) => c.store && readKey(c.store)).map((c) => [c.store, readKey(c.store)]));
  const file = JSON.stringify({ kind: 'jelly-save', version: 1, saved: new Date().toISOString(), collection: jarStore(), courses: courseStore(), progress }, null, 1);
  const name = `my-jellies-${new Date().toISOString().slice(0, 10)}.json`, dl = await DOWNLOADS;
  if (dl) return dl.save({ filename: name, data: file }).then(() => toast('Saved! Keep that file somewhere safe.'), (e) => { if (e?.code !== 'declined') toast('Saving a file isn\'t possible here, sorry.'); });
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([file], { type: 'application/json' })); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Saved! Look in your Downloads folder.');
}
// The file comes from outside, so it's checked once, here: only known courses, only lesson ticks, only safe colours and looks.
function readSave(text) {
  let d; try { d = JSON.parse(text); } catch { return null; }
  if (!d || d.kind !== 'jelly-save' || typeof d.collection !== 'object' || typeof d.progress !== 'object') return null;
  const str = (v) => typeof v === 'string' ? v.slice(0, 300) : '';
  const collection = Object.fromEntries(Object.entries(d.collection).filter(([k, v]) => /^[a-z0-9]+:[a-z0-9-]+$/.test(k) && v && typeof v === 'object').map(([k, v]) => [k, {
    at: Number.isFinite(v.at) ? v.at : 0, course: str(v.course), word: str(v.word), name: str(v.name), does: str(v.does), ex: str(v.ex),
    colour: /^#[0-9a-f]{6}$/i.test(v.colour) ? v.colour : '#ff4d6d', look: LOOKS.includes(v.look) ? v.look : 'classic' }]));
  const ticks = (o) => Object.fromEntries(Object.entries(o && typeof o === 'object' ? o : {}).filter(([k, v]) => /^[a-z0-9-]+$/.test(k) && v === true));
  const progress = Object.fromEntries(COURSES.filter((c) => c.store && d.progress[c.store]).map((c) => [c.store, { done: ticks(d.progress[c.store].done) }]));
  const courses = Object.fromEntries(Object.entries(d.courses ?? {}).filter(([k, v]) => course(k) && Number.isFinite(v?.done) && Number.isFinite(v?.total)).map(([k, v]) => [k, { done: v.done, total: v.total }]));
  return { collection, progress, courses };
}
// Loading adds to what's here and never takes anything away.
function useSave(d) {
  for (const [key, p] of Object.entries(d.progress)) {
    if (key === KEY) { Object.assign(store.done, p.done); save(); continue; }
    const cur = readKey(key) ?? {}; writeKey(key, { ...cur, done: { ...(cur.done ?? {}), ...p.done } });
  }
  writeKey('jelly.collection', { ...d.collection, ...jarStore() });
  const prog = courseStore();
  for (const [k, v] of Object.entries(d.courses)) if (!prog[k] || prog[k].done < v.done) prog[k] = v;
  writeKey('jelly.courses', prog);
  writeKey('jelly.welcomeBack', Object.keys(jarStore()).length);
  location.reload();
}
$('#jarSave').onclick = saveJellies;
$('#jarLoad').onclick = () => $('#jarFile').click();
$('#jarFile').onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  const d = readSave(await f.text());
  if (!d) return toast('That file isn\'t a jelly save. Look for one called my-jellies….json');
  useSave(d);
};
{ const n = readKey('jelly.welcomeBack'); if (n) { try { localStorage.removeItem('jelly.welcomeBack'); } catch {} setTimeout(() => toast(`Welcome back! ${n} jellies are on your shelf.`), 900); } }

/* ---------------- panels + navigation ---------------- */''')

rep('.side-foot{display:grid;gap:8px}', '''.side-foot{display:grid;gap:8px}
/* the jelly jar */
.beans{cursor:pointer}
/* the earned card on short screens: the next-course buttons and the jar link make it taller */
@media (max-height:680px){.upnext .un-card{padding:12px 28px 16px;gap:2px}.upnext .un-bean{width:54px}.upnext .un-word{font-size:2.1rem}.upnext .un-label{margin-top:4px}.upnext .un-btns{margin-top:6px}.upnext .un-earned{font-size:1.25rem}.upnext .un-name{font-size:.95rem}}
.un-jar{font:inherit;font-weight:700;font-size:.9rem;color:var(--blue);background:none;border:0;text-decoration:underline;cursor:pointer;padding:0}
.jar-open{grid-column:1/-1;justify-self:start;font:inherit;font-weight:700;font-size:.82rem;color:var(--ink);background:var(--lemon);border:0;border-radius:999px;padding:2px 10px;cursor:pointer}
.jarbox[hidden]{display:none}
.jarbox{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:#24133b88;backdrop-filter:blur(3px);padding:16px}
.jar-card{width:min(860px,100%);height:min(680px,100%);display:grid;grid-template-rows:auto 1fr auto;gap:10px;background:#fff;border:5px solid var(--ink);border-radius:30px;box-shadow:0 10px 0 var(--ink);padding:18px 22px}
.jar-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.jar-head h2{font-family:var(--display);font-weight:400;font-size:clamp(1.5rem,1rem + 2vh,2.2rem);margin:0}
.jar-head p{color:var(--ink-soft);margin:0}
.jar-btns{display:flex;gap:10px;align-items:center}
.jar-view{position:relative;min-height:0;border-radius:20px;overflow:hidden;border:3px solid var(--ink)}
.jar-view canvas{width:100%;height:100%;display:block;touch-action:none}
.jar-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.jar-tip{margin:0;color:var(--ink-soft);font-size:.9rem}
.jar-file{display:flex;gap:8px;flex-wrap:wrap}
.pill-ink{font:inherit;font-weight:700;font-size:.85rem;color:var(--ink);background:#fff;border:3px solid var(--ink);border-radius:999px;padding:3px 12px;cursor:pointer;box-shadow:0 3px 0 var(--ink)}
.pill-ink:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
.shelf{position:absolute;inset:0;overflow:auto;display:flex;flex-wrap:wrap;align-content:flex-start;justify-content:center;gap:18px 14px;padding:16px;background:linear-gradient(135deg,#fff3e6,#f3e8ff 50%,#e6f6ff)}
.shelf[hidden]{display:none}
.shelf-jar{width:clamp(118px,15vw,150px);display:grid;justify-items:center;gap:2px;font:inherit;color:var(--ink);background:none;border:0;cursor:pointer;padding:4px 4px 10px;border-bottom:8px solid var(--lemon);border-radius:0 0 6px 6px;transition:transform .15s}
.shelf-jar:hover:not(:disabled){transform:translateY(-4px) rotate(-1.5deg)}
.shelf-jar svg{width:100%;height:auto}
.shelf-jar b{font-family:var(--display);font-weight:400;font-size:1rem;line-height:1.1;text-align:center}
.shelf-jar small{color:var(--ink-soft);font-size:.8rem}
.shelf-jar.here b{color:var(--berry)}
.shelf-jar.later{opacity:.45;cursor:default}
.jar-view canvas[hidden]{display:none}
.jar-empty{position:absolute;inset:0;display:grid;place-items:center;margin:0;font-family:var(--display);font-size:1.2rem;color:var(--ink-soft)}
.jar-pop{position:absolute;top:12px;left:12px;max-width:min(360px,calc(100% - 24px));display:flex;gap:12px;align-items:flex-start;background:#fff;border:4px solid var(--ink);border-radius:20px;box-shadow:0 6px 0 var(--ink);padding:12px 16px}
.jar-pop .pop-bean{width:56px;flex:none}
.pop-name{font-family:var(--mono);font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}
.pop-word{font-family:var(--display);font-size:1.7rem;line-height:1.05;-webkit-text-stroke:1.5px var(--ink);paint-order:stroke fill}
.pop-where{font-weight:700;font-size:.85rem;margin-bottom:4px}
.jar-pop p{margin:0 0 6px;font-size:.9rem;color:var(--ink-soft)}
.jar-pop code{font-family:var(--mono);font-size:.85rem;background:#24133b12;border-radius:6px;padding:1px 6px}
.jar-x{position:absolute;top:4px;right:8px;border:0;background:none;font-size:1.4rem;cursor:pointer;color:var(--ink-soft)}''')
