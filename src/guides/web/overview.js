// Jelly Web's Overview: one page's trip across a little world. Your house (you at the browser upstairs, the router
// downstairs), the DNS owl's treehouse next door, the internet cable along the bottom of a cut-open sea, and the
// server's building on the far shore. The name, the number, GET / and 200 OK all travel as jelly letters.
// Built with the Overview kit (engine/overview-kit.js).
const TOWN_STEPS = [
  { who: 'The overview', text: 'Loading one web page is a trip with five stops: your computer, your router, the DNS phonebook, the internet, and a server far away. Press Next to follow one page all the way there and back.', shot: 'whole' },
  { who: 'Your computer', text: 'You type gerbil.zone into the browser and press Enter. The browser is a program that fetches pages and draws them. But it has a problem: it has no idea where gerbil.zone is.', shot: 'computer', ends: 'computer' },
  { who: 'The DNS phonebook', text: 'Computers only understand numbers. So your computer asks the DNS phonebook: "What is the number for gerbil.zone?" The owl looks it up: 203.0.113.7. Now it knows where to send the letter.', shot: 'computer', ends: 'dns' },
  { who: 'Your router and the internet', text: 'The browser writes a polite letter: GET /, which means "your home page, please". Your router sends it out across the internet, through cables that run along the bottom of the sea. A shark was once filmed biting one!', shot: 'dns', ends: 'sea' },
  { who: 'The server', text: 'The letter arrives at the server: a computer in a giant building that never sleeps. It reads the letter, finds index.html in a folder (just like cat), and writes back.', shot: 'sea', ends: 'server' },
  { who: 'All the way back', text: 'The reply rides back: 200 OK, plus the HTML. Under the sea, through your router, onto your screen. Your browser reads the HTML and builds the page, box by box. All in less than a second.', shot: 'server', ends: 'computer' },
  { who: 'That\'s the overview', text: 'Type an address, look up the number, send a GET, the server replies, the browser builds. Every page you have ever seen made this trip. Now let\'s zoom in and watch the crew do it.', shot: 'whole', cta: true },
];

const Town = overview((k) => {
  const { V, solid, gel, rbox, eye, smile, wobbly, blob, label, jellyWord, add, live, T } = k;
  const H = 3.3, W = 8.4, D = 4, SW = 1.9;
  const SX = W / 2 + T + SW / 2;
  const LEVEL = { router: 0, computer: H };
  k.room({ y: LEVEL.router, w: W, h: H, d: D, floor: '#62c934', wall: '#dcf7e5', sign: 'YOUR ROUTER (WI-FI)' });
  k.room({ y: LEVEL.computer, w: W, h: H, d: D, floor: '#ffc61a', wall: '#fff3c4', sign: 'YOUR COMPUTER' });
  add(solid(rbox(W + 2 * T + .2, .32, D + .4, .12), '#ff4d6d', { p: [0, 2 * H + .16, .1] }));
  k.roof({ x0: -W / 2 - T - .7, x1: SX + SW / 2 + T + .7, y: 2 * H + .45, d: D });
  const lift = k.lift({ x: SX, y0: 0, y1: 2 * H, d: D, at: LEVEL.computer });
  // land, a cut-open sea, and the far shore
  const SEA0 = 9, SEA1 = 23, BED = -4.2, FAR = 29.5;
  k.grass(-18, SEA0, 0); k.soil(-18, SEA0, -.4, -6.4); k.grass(SEA1, 38, 0); k.soil(SEA1, 38, -.4, -6.4);
  k.soil(SEA0, SEA1, BED - .1, -6.4); add(solid(rbox(SEA1 - SEA0, .2, D, .05), '#e8c98f', { p: [(SEA0 + SEA1) / 2, BED, 0], line: .02 }));
  k.pebbles(-16, SEA0 - .5, -1, -5.6, 18); k.pebbles(SEA1 + .5, 37, -1, -5.6, 12);
  const water = live(new THREE.Mesh(new THREE.BoxGeometry(SEA1 - SEA0, -.35 - BED, D), new THREE.MeshPhysicalMaterial({ color: '#3a8cff', transparent: true, opacity: .42, roughness: .2, clearcoat: .8, depthWrite: false })));
  water.position.set((SEA0 + SEA1) / 2, (BED - .35) / 2, 0); water.renderOrder = 2;
  const fin = live(solid(new THREE.ConeGeometry(.3, .7, 4), '#8e9ab5', { s: [1, 1, .35] }));
  [[-6.5, .9], [-15.5, .8], [34.5, 1], [36.8, .8]].forEach(([x, s]) => k.tree(x, 0, s));
  k.sunBall(18, 9.5, -8); k.cloud(4, 10.5, -7); k.cloud(27, 9, -7, .8);
  // the internet: a cable from your router, along the sea floor, to the server
  const CABLE = [V(1.4, .55, .1), V(2.6, .1, 1.5), V(4.6, -.55, 2.15), V(8.2, -.8, 2.15), V(9.6, BED + .25, 1.2), V(16, BED + .2, 1.2), V(22.4, BED + .25, 1.2), V(23.8, -.8, 2.15), V(27.2, -.55, 2.15), V(28.4, .1, 1.4), V(FAR - .6, .7, .2)];
  add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(CABLE), 160, .1, 10), k.toon('#2b2d42')));

  /* top floor: you, with a browser */
  const me = k.you({ x: 0, y: LEVEL.computer });
  let screenState = { url: '', page: false };
  const drawScreen = () => {
    const g = me.canvas.getContext('2d'), st = screenState; g.save(); g.scale(400 / 320, 290 / 210);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 320, 210);
    g.fillStyle = '#eef0f6'; g.fillRect(0, 0, 320, 44); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(2, 2, 316, 206);
    g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(12, 9, 296, 28, 14); g.fill(); g.stroke();
    g.fillStyle = INK; g.font = '20px "JetBrains Mono", monospace'; g.fillText(st.url, 26, 30);
    if (st.page) {
      g.fillStyle = '#d4eeff'; g.fillRect(4, 46, 312, 160);
      g.fillStyle = '#3a5bff'; g.font = '26px "Titan One", sans-serif'; g.fillText('Gerald\'s Zone', 18, 84);
      g.fillStyle = '#e3b27a'; g.beginPath(); g.ellipse(74, 140, 46, 30, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = INK; [[140, 120, 150], [140, 140, 130], [140, 160, 110]].forEach(([x, y, w]) => g.fillRect(x, y, w, 8));
    }
    g.restore(); me.refresh();
  };
  const setScreen = (st) => { screenState = { ...screenState, ...st }; drawScreen(); };
  document.fonts?.ready.then(drawScreen);

  /* ground floor: the router, your home's post office */
  const router = new THREE.Group(); router.position.set(1.2, LEVEL.router, -.6); add(router);
  router.add(solid(rbox(1.4, .7, 1, .08), '#c58a55', { p: [0, .35, 0] }));
  router.add(solid(rbox(1.8, .5, 1, .12), '#2b2d42', { p: [0, .95, 0] }));
  [-.6, .6].forEach((x, i) => router.add(solid(new THREE.CylinderGeometry(.05, .05, 1.1, 8), '#2b2d42', { p: [x, 1.65, -.3], r: [0, 0, i ? -.2 : .2] })));
  blob(router, 2.4, 1.6);
  const leds = [-.6, -.3, 0, .3, .6].map((x) => { const m = live(new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), new THREE.MeshBasicMaterial({ color: '#4dff8b' }))); m.position.set(1.2 + x, .95, -.08); return m; });
  add(solid(new THREE.CylinderGeometry(.3, .22, .45, 16), '#ff8a2b', { p: [-3.4, .23, -1.3] }));
  add(solid(new THREE.SphereGeometry(.42, 16, 12), '#3fae4f', { p: [-3.4, .8, -1.3], s: [1, 1.2, 1] }));
  const ROUTER_AT = V(1.2, LEVEL.router + 1.25, .5);

  /* next door: the DNS owl in a treehouse, with a very big phonebook */
  const DX = -11.5, DY = 3.8;
  add(solid(new THREE.CylinderGeometry(.55, .8, DY, 14), '#8a5a33', { p: [DX, DY / 2, -.6] }));
  [[-2, 1.6, -3.2, 1.6], [2, 1.8, -3.3, 1.5], [0, 3.1, -3.4, 1.8]].forEach(([x, y, z, r]) => add(solid(new THREE.SphereGeometry(r, 20, 14), '#3fae4f', { p: [DX + x, DY + y, z] })));
  add(solid(rbox(5, .3, 3.4, .1), '#c58a55', { p: [DX, DY - .15, 0] }));
  add(solid(rbox(4.4, 2.4, .2, .06), '#ffe6d1', { p: [DX, DY + 1.2, -1.6] }));
  const hutRoof = new THREE.Shape(); hutRoof.moveTo(-2.7, 0); hutRoof.lineTo(2.7, 0); hutRoof.lineTo(0, 1.4); hutRoof.closePath();
  add(solid(new THREE.ExtrudeGeometry(hutRoof, { depth: 3.4, bevelEnabled: true, bevelThickness: .1, bevelSize: .1, bevelSegments: 2 }), '#ff8a2b', { p: [DX, DY + 2.4, -1.8] }));
  const dnsSign = label('DNS PHONEBOOK', { h: .46 }); dnsSign.position.set(DX, DY - .6, 1.85); add(dnsSign);
  const owl = live(new THREE.Group()); owl.position.set(DX - .9, DY, .1); owl.rotation.y = .3; owl.scale.setScalar(1.3); wobbly(owl);
  owl.add(gel(new THREE.SphereGeometry(.62, 26, 18), '#a8743f', { p: [0, .72, 0], s: [1, 1.15, .9] }));
  owl.add(gel(new THREE.SphereGeometry(.4, 20, 14), '#f1d7a8', { p: [0, .6, .32], s: [1, 1.1, .55] }));
  [-1, 1].forEach((sd) => { eye(owl, [sd * .24, 1.1, .5], .19); owl.add(solid(new THREE.ConeGeometry(.11, .34, 8), '#8a5a2e', { p: [sd * .36, 1.52, 0], r: [0, 0, sd * -.35] })); });
  owl.add(solid(new THREE.ConeGeometry(.08, .22, 8), '#ffb000', { p: [0, .92, .62], r: [Math.PI / 2 + .3, 0, 0] }));
  blob(owl, 1.6, 1.4);
  const book = new THREE.Group(); book.position.set(DX + .8, DY, .3); book.rotation.y = -.4; add(book);
  book.add(solid(rbox(.3, .8, .3, .05), '#8a5a33', { p: [0, .4, 0] }));
  book.add(solid(rbox(1.7, .06, 1.1, .02), '#e0233f', { p: [0, .84, 0], r: [-.5, 0, 0] }));
  [-1, 1].forEach((sd) => book.add(solid(rbox(.78, .06, 1, .02), '#ffffff', { p: [sd * .41, .9, .02], r: [-.5, 0, 0] })));
  const page = new THREE.Group(); page.position.set(0, .93, .02); page.rotation.x = -.5; page.userData.live = true; book.add(page);
  page.add(solid(rbox(.76, .03, .96, .01), '#fff7e0', { p: [.38, 0, 0], line: .015 }));
  const DNS_AT = V(DX + .3, DY + .1, 1.1);
  // the phone line from your router to the treehouse
  const WIRE = [V(.2, 1.4, .3), V(-3.2, 2.6, .6), V(-5, 3.4, .9), V(-7.6, 4.4, .9), V(DX + 2.4, DY + .9, .9), DNS_AT.clone()];
  add(solid(new THREE.CylinderGeometry(.08, .1, 4.6, 8), '#8a5a33', { p: [-7.6, 2.3, .9] }));
  add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(WIRE.slice(0, 5)), 60, .04, 6), k.toon('#2b2d42')));

  /* the far shore: the server, in a building that never sleeps */
  k.room({ cx: FAR, y: 0, w: 7.6, h: H, d: D, floor: '#9b8cff', wall: '#ebe6ff', sign: 'THE SERVER', door: 'none' });
  add(solid(rbox(7.6 + 2 * T + .2, .32, D + .4, .12), '#3a5bff', { p: [FAR, H + .16, .1] }));
  const rackLeds = [];
  [-2.4, -1.2, 0, 1.2].forEach((dx) => {
    add(solid(rbox(.9, 2.3, .9, .08), '#3a4055', { p: [FAR + dx, 1.15, -1.2] }));
    for (let n = 0; n < 5; n++) { const m = live(new THREE.Mesh(new THREE.BoxGeometry(.55, .07, .04), new THREE.MeshBasicMaterial({ color: '#4dff8b' }))); m.position.set(FAR + dx, .45 + n * .38, -.73); rackLeds.push(m); }
  });
  const SERVER_AT = V(FAR + 2.2, 1.1, .8);
  const servePaper = live(new THREE.Group()); servePaper.add(solid(rbox(.7, .9, .05, .03), '#ffffff'));
  [.2, .05, -.1, -.25].forEach((y) => servePaper.add(solid(rbox(.46, .05, .06, .01), '#c9c2d6', { p: [0, y, 0], line: 0 })));
  const sl = label('index.html', { h: .26, font: '"JetBrains Mono", monospace' }); sl.position.set(0, .66, .05); servePaper.add(sl);

  /* the travellers */
  const name = live(jellyWord('gerbil.zone', .42, '#ff2f7e'));
  const num = live(jellyWord('203.0.113.7', .42, '#3a5bff'));
  const get = live(jellyWord('GET /', .5, '#ff8a2b', true));
  const ok = live(jellyWord('200 OK', .5, '#62c934', true));

  const { tween, wait, hop, along, pop, say, shot, look, poke } = k;
  let ledFast = false, rackFast = false, owlReads = false;
  const backWire = () => [...WIRE].reverse().map((p) => p.clone());
  return {
    DIR: V(.08, .12, 1),
    SHOTS: {
      whole: { c: V(9.6, 1.6, 0), w: 50, h: 15 },
      computer: { c: V(1.1, LEVEL.computer + 1.6, 0), w: 12, h: 4.3, room: true },
      home: { c: V(1.1, LEVEL.router + 1.6, 0), w: 12, h: 4.3, room: true },
      dns: { c: V(-8.2, 3.6, 0), w: 14, h: 7.8 },
      sea: { c: V(16, -1.6, 0), w: 22, h: 8 },
      server: { c: V(FAR, 1.6, 0), w: 11, h: 4.6, room: true },
    },
    reset() {
      [name, num, get, ok, servePaper].forEach((o) => { o.visible = false; o.scale.setScalar(0); });
      ledFast = rackFast = owlReads = false; setScreen({ url: '', page: false });
    },
    PLAY: [
      async () => {},
      async () => {
        me.typing = true;
        for (let n = 1; n <= 11; n++) { setScreen({ url: 'gerbil.zone'.slice(0, n) }); k.sfx((s) => s.boing(1400, .03, .03)); await wait(.09); }
        me.typing = false; await wait(.2);
        name.position.copy(me.at()); look(name); await pop(name, 1, .4); poke(me.kid, .15);
        say('Where is gerbil.zone?', V(1.6, LEVEL.computer + 2.75, 1.2));
      },
      async () => {
        say(null); look(name); await lift.in(name, 0); await lift.to(LEVEL.router); shot('home');
        await hop(name, ROUTER_AT, .5); ledFast = true; await wait(.3);
        shot('dns'); await along(name, WIRE.map((p) => p.clone()), 2); ledFast = false;
        owlReads = true; poke(owl, .3); say('gerbil.zone? Let me look…', V(DX, DY + 3.25, .8)); await wait(1);
        await pop(name, 0, .3); num.position.copy(DNS_AT); await pop(num, 1, .35); look(num); owlReads = false;
        say('That\'s 203.0.113.7!', V(DX, DY + 3.25, .8)); poke(owl, .2);
      },
      async () => {
        say(null); look(num); shot('home'); await along(num, backWire(), 1.8);
        get.position.copy(ROUTER_AT).add(V(-.6, 0, .2)); look(get); await pop(get, 1, .35); await pop(num, 0, .25); ledFast = true;
        say('GET /  to 203.0.113.7', V(1.2, LEVEL.router + 2.75, 1.2)); await wait(.8); say(null);
        shot('sea'); await along(get, CABLE.slice(0, 8).map((p) => p.clone().add(V(0, .35, 0))), 3.2); ledFast = false;
      },
      async () => {
        look(get); shot('server'); await along(get, CABLE.slice(7).map((p) => p.clone().add(V(0, .35, 0))).concat([SERVER_AT.clone()]), 1.6);
        rackFast = true; await wait(.6);
        servePaper.position.copy(SERVER_AT).add(V(-1.1, 1.0, 0)); await pop(servePaper, 1, .35);
        say('Here is index.html!', V(FAR + .4, 2.85, .8));
      },
      async () => {
        say(null); rackFast = false; await pop(get, 0, .25);
        ok.position.copy(SERVER_AT); look(ok); await pop(ok, 1, .35);
        shot('whole');
        await Promise.all([
          along(ok, [SERVER_AT.clone(), ...[...CABLE].reverse().map((p) => p.clone().add(V(0, .35, 0)))], 3.6),
          along(servePaper, [servePaper.position.clone(), ...[...CABLE].reverse().map((p) => p.clone().add(V(0, 1.1, 0)))], 3.6),
        ]);
        ledFast = true; await lift.in(ok, 0); k.ride(servePaper, V(0, 1.1, -.3), undefined); ledFast = false;
        shot('computer'); await lift.to(LEVEL.computer);
        await Promise.all([hop(ok, me.at(), .5, .5), hop(servePaper, me.at(), .55, .6)]);
        await Promise.all([pop(ok, 0, .2), pop(servePaper, 0, .2)]);
        setScreen({ page: true }); poke(me.kid, .3); look(null); k.sfx((s) => s.ding());
      },
      async () => { say(null); },
    ],
    tick(dt, t) {
      leds.forEach((m, n) => { m.visible = Math.sin(t * (ledFast ? 22 : 6) + n * 1.7) > -.2; });
      rackLeds.forEach((m, n) => { m.material.color.set(Math.sin(t * (rackFast ? 18 : 4) + n * 2.3) > 0 ? '#4dff8b' : '#1f6b3a'); });
      page.rotation.z = owlReads ? Math.sin(t * 6) * .9 - .6 : 0;
      const a = t * .5; fin.position.set(16 + Math.cos(a) * 4.5, -.25, Math.sin(a) * 1.2); fin.rotation.y = -a;
    },
  };
});
