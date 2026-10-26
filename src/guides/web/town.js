  // Five stops: your computer at the bottom, the router, the internet (under the sea), the server at the top,
  // and the DNS phonebook off to the side, where the router goes to look up numbers.
  build() {
    const Y = this.Y = { desk: -4.8, router: -1.2, sea: 2.4, server: 6, dns: -1.2 }; // one height per island, in order
    this.islands = [this.island(Y.desk, '#ffc61a', 'YOUR COMPUTER'), this.island(Y.router, '#62c934', 'YOUR ROUTER (WI-FI)'), this.seaIsland(Y.sea), this.island(Y.server, '#9b8cff', 'THE SERVER'), this.island(Y.router, '#ff8a2b', 'DNS PHONEBOOK', 7.2)];
    const [desk, router, , server, dns] = this.islands;
    // your computer: a desk, a monitor showing a browser, and you
    desk.add(part(new THREE.BoxGeometry(2.2, .14, 1.1), '#a86b3c', { p: [.3, .95, -.1] }));
    [[-.65, -.5], [1.25, -.5], [-.65, .3], [1.25, .3]].forEach(([x, z]) => desk.add(part(new THREE.CylinderGeometry(.05, .05, .75, 8), '#7b4a26', { p: [x, .55, z] })));
    desk.add(part(new THREE.BoxGeometry(1.5, 1.05, .5), '#e3d6bc', { p: [.3, 1.62, -.35] }));
    this.screenCanvas = document.createElement('canvas'); this.screenCanvas.width = 320; this.screenCanvas.height = 210;
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas); this.screenTex.colorSpace = THREE.SRGBColorSpace;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.24, .8), new THREE.MeshBasicMaterial({ map: this.screenTex }));
    scr.position.set(.3, 1.64, -.09); desk.add(scr);
    desk.add(part(new THREE.BoxGeometry(.9, .07, .32), '#ffffff', { p: [.3, 1.05, .25] }));
    const kid = new THREE.Group(); kid.position.set(-.9, .2, .75); kid.rotation.y = 2.3;
    kid.add(part(new THREE.CapsuleGeometry(.28, .45, 6, 14), '#ff4d6d', { p: [0, .75, 0] }));
    kid.add(part(new THREE.SphereGeometry(.34, 20, 14), '#ffcf9e', { p: [0, 1.42, 0] }));
    kid.add(part(new THREE.SphereGeometry(.36, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), '#5a2d0c', { p: [0, 1.48, -.02] }));
    [-.12, .12].forEach((x) => kid.add(part(new THREE.SphereGeometry(.05, 10, 8), INK, { p: [x, 1.45, .3], line: 0 })));
    desk.add(kid); this.kid = kid;
    // the router: your home's post office, with antennas and blinking lights
    router.add(part(new THREE.BoxGeometry(1.6, .45, .9), '#2b2d42', { p: [0, .62, 0] }));
    [-.55, .55].forEach((x, i) => router.add(part(new THREE.CylinderGeometry(.05, .05, 1, 8), '#2b2d42', { p: [x, 1.25, -.3], r: [0, 0, i ? -.18 : .18] })));
    this.leds = [-.5, -.25, 0, .25, .5].map((x) => { const m = part(new THREE.SphereGeometry(.06, 10, 8), '#4dff8b', { p: [x, .62, .46], line: 0 }); router.add(m); return m; });
    // the DNS phonebook: a wise owl with a very big book
    const owl = this.owl = new THREE.Group(); owl.position.set(-.5, .2, .2);
    owl.add(part(new THREE.SphereGeometry(.55, 22, 16), '#a8743f', { p: [0, .75, 0], s: [1, 1.15, .9] }));
    owl.add(part(new THREE.SphereGeometry(.36, 20, 14), '#f1d7a8', { p: [0, .62, .3], s: [1, 1.1, .6], line: 0 }));
    [-1, 1].forEach((sd) => {
      owl.add(part(new THREE.SphereGeometry(.17, 16, 12), '#ffffff', { p: [sd * .2, 1.12, .4] }));
      owl.add(part(new THREE.SphereGeometry(.08, 10, 8), INK, { p: [sd * .2, 1.12, .55], line: 0 }));
      owl.add(part(new THREE.ConeGeometry(.1, .3, 8), '#8a5a2e', { p: [sd * .32, 1.52, 0], r: [0, 0, sd * -.35] }));
    });
    owl.add(part(new THREE.ConeGeometry(.07, .2, 8), '#ffb000', { p: [0, .98, .5], r: [Math.PI / 2 + .3, 0, 0] }));
    dns.add(owl);
    const book = this.book = new THREE.Group(); book.position.set(.85, .32, .2); book.rotation.y = -.5;
    [-1, 1].forEach((sd) => book.add(part(new THREE.BoxGeometry(.7, .06, .9), '#ffffff', { p: [sd * .36, 0, 0], r: [0, 0, sd * .12] })));
    book.add(part(new THREE.BoxGeometry(1.5, .04, .95), '#e0233f', { p: [0, -.06, 0] }));
    this.bookPage = part(new THREE.BoxGeometry(.66, .02, .86), '#fff7e0', { p: [.34, .08, 0], line: 0 }); book.add(this.bookPage);
    const bl = labelSprite('jelly.fun = 203.0.113.42', { h: .2 }); bl.position.set(0, .45, .2); book.add(bl);
    dns.add(book);
    // the internet: cables under the sea, with a curious shark
    const pts = [[-2.1, -.02, .4], [-1.2, -.04, .9], [0, -.05, .6], [1.2, -.04, .9], [2.1, -.02, .4]].map((p) => new THREE.Vector3(...p));
    this.islands[2].add(part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .09, 10), '#2b2d42', { line: 1.04 }));
    const fin = this.fin = part(new THREE.ConeGeometry(.22, .5, 4), '#8e9ab5', { s: [1, 1, .35] });
    this.islands[2].add(fin);
    // the server: racks of computers in a building that never sleeps
    this.racks = [-.8, 0, .8].map((x) => {
      server.add(part(new THREE.BoxGeometry(.62, 1.7, .7), '#3a4055', { p: [x, 1.05, -.1] }));
      return [0, 1, 2, 3, 4].map((k) => { const m = part(new THREE.BoxGeometry(.4, .06, .04), '#4dff8b', { p: [x, .45 + k * .3, .27], line: 0 }); server.add(m); return m; });
    }).flat();
    this.servePaper = part(new THREE.BoxGeometry(.34, .44, .03), '#ffffff', { p: [1.5, 1, .5] });
    const sl = labelSprite('index.html', { h: .2 }); sl.position.set(0, .4, .05); this.servePaper.add(sl); server.add(this.servePaper);
    // the tube everything travels through, and a side tube to the phonebook
    const glass = () => new THREE.MeshPhysicalMaterial({ color: '#bfe8ff', transparent: true, opacity: .35, roughness: .1, side: THREE.DoubleSide });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, Y.server - Y.desk + .6, 20, 1, true), glass());
    tube.position.set(2.9, (Y.server + Y.desk) / 2 + .2, 0); this.scene.add(tube);
    const side = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 2.3, 16, 1, true), glass());
    side.rotation.z = Math.PI / 2; side.position.set(4.15, Y.router + .8, 0); this.scene.add(side);
    this.packet = part(new THREE.CapsuleGeometry(.17, .22, 6, 14), '#62c934', { r: [0, 0, Math.PI / 2] });
    this.packetLabel = labelSprite('gerbil.zone', { bg: '#24133b', fg: '#4dff8b', h: .36 });
    this.scene.add(this.packet, this.packetLabel);
    this.packet.visible = this.packetLabel.visible = false;
    this.setState(0, true);
  }
  seaIsland(y) {
    const g = new THREE.Group(); g.position.set(0, y, 0);
    // see-through water, so the cable on the sea floor shows
    const water = part(new THREE.CylinderGeometry(2.3, 2.3, .5, 44), '#3a8cff', { p: [0, .07, 0], line: 0 });
    Object.assign(water.material, { transparent: true, opacity: .55, depthWrite: false }); water.renderOrder = 2; g.add(water);
    g.add(part(new THREE.TorusGeometry(2.3, .035, 8, 64), INK, { p: [0, .32, 0], r: [Math.PI / 2, 0, 0], line: 0 }));
    g.add(part(new THREE.CylinderGeometry(2.3, 2.3, .06, 44), '#e8c98f', { p: [0, -.17, 0] }));
    g.add(part(new THREE.CylinderGeometry(2.15, .5, 1.7, 9), '#c58a55', { p: [0, -1.02, 0] }));
    const l = labelSprite('THE INTERNET (UNDER THE SEA!)', { h: .42 }); l.position.set(-2.1, .45, 1.6); g.add(l);
    this.scene.add(g); return g;
  }
  // The monitor shows a little browser: an address bar, then either a blank page or Gerald's page.
  drawScreen(st) {
    const g = this.screenCanvas.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 320, 210);
    g.fillStyle = '#eef0f6'; g.fillRect(0, 0, 320, 44); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(2, 2, 316, 206);
    g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(12, 9, 296, 28, 14); g.fill(); g.stroke();
    g.fillStyle = INK; g.font = '20px "JetBrains Mono", monospace'; g.fillText(st.url ?? '', 26, 30);
    if (st.page) {
      g.fillStyle = '#d4eeff'; g.fillRect(4, 46, 312, 160);
      g.fillStyle = '#3a5bff'; g.font = '26px "Titan One", sans-serif'; g.fillText('Gerald\'s Zone', 18, 84);
      g.fillStyle = '#e3b27a'; g.beginPath(); g.ellipse(74, 140, 46, 30, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = INK; [[140, 120, 150], [140, 140, 130], [140, 160, 110]].forEach(([x, y, w]) => g.fillRect(x, y, w, 8));
    }
    this.screenTex.needsUpdate = true;
  }
  // What is where at each step of the story. `landed` is true once the jelly bean has arrived.
  setState(i, landed) {
    this.servePaper.visible = i === 4 && landed;
    this.drawScreen({ url: i === 0 ? '' : 'gerbil.zone', page: i >= 6 || (i === 5 && landed) });
    if (i === 2 && landed) this.packetLabel.userData.set('203.0.113.7');
  }
