  // Four stops, bottom to top: your folder, the stage, the photo album (.git), and GitHub in the cloud.
  build() {
    const Y = this.Y = { desk: -4.8, stage: -1.2, album: 2.4, cloud: 6 };
    this.islands = [this.island(Y.desk, '#ffc61a', 'YOUR FOLDER'), this.island(Y.stage, '#62c934', 'THE STAGE'), this.island(Y.album, '#9b8cff', 'PHOTO ALBUM (.git)'), this.cloudIsland(Y.cloud)];
    const [desk, stage, album] = this.islands;
    const paper = (name, h = .2) => {
      const g = new THREE.Group();
      g.add(part(new THREE.BoxGeometry(.34, .44, .03), '#ffffff'));
      [.08, 0, -.08].forEach((y) => g.add(part(new THREE.BoxGeometry(.22, .025, .035), '#c9c2d6', { p: [0, y + .04, 0], line: 0 })));
      const l = labelSprite(name, { h }); l.position.set(0, .4, .05); g.add(l);
      return g;
    };
    const photo = (id, color) => {
      const g = new THREE.Group();
      g.add(part(new THREE.BoxGeometry(.56, .64, .03), '#ffffff'));
      g.add(part(new THREE.BoxGeometry(.44, .36, .035), color, { p: [0, .08, 0], line: 0 }));
      const l = labelSprite(id, { h: .16 }); l.position.set(0, -.23, .06); g.add(l);
      return g;
    };
    // your computer: a desk, a monitor, you, and the project's files
    desk.add(part(new THREE.BoxGeometry(3.3, .14, 1.1), '#a86b3c', { p: [.75, .95, -.1] }));
    [[-.75, -.5], [2.25, -.5], [-.75, .3], [2.25, .3]].forEach(([x, z]) => desk.add(part(new THREE.CylinderGeometry(.05, .05, .75, 8), '#7b4a26', { p: [x, .55, z] })));
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
    this.files = ['game.py', 'README.md'].map((n, i) => { const g = paper(n); g.position.set(1.45 + i * .55, 1.25, .15); g.userData.y = 1.25; desk.add(g); return g; });
    // another computer, for clone and pull
    const lap = new THREE.Group(); lap.position.set(-1.75, .2, .55);
    lap.add(part(new THREE.BoxGeometry(.75, .06, .5), '#9aa3b8', { p: [0, .02, 0] }));
    this.lapScreen = part(new THREE.BoxGeometry(.75, .48, .04), '#3a4055', { p: [0, .27, -.24], r: [-.25, 0, 0] }); lap.add(this.lapScreen);
    const ll = labelSprite('another computer', { h: .2 }); ll.position.set(0, .75, 0); lap.add(ll);
    desk.add(lap);
    // the stage: curtains, a spotlight, and room for the files waiting for their photo
    stage.add(part(new THREE.BoxGeometry(2.6, .3, 1.5), '#c58a55', { p: [0, .35, 0] }));
    stage.add(part(new THREE.BoxGeometry(2.9, 1.9, .12), '#e0233f', { p: [0, 1.45, -.78] }));
    [-1.38, 1.38].forEach((x) => stage.add(part(new THREE.BoxGeometry(.28, 1.9, .5), '#c41d36', { p: [x, 1.45, -.45] })));
    stage.add(part(new THREE.BoxGeometry(2.9, .3, .6), '#c41d36', { p: [0, 2.45, -.45] }));
    this.spot = new THREE.Mesh(new THREE.ConeGeometry(.85, 2, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff59a', transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false }));
    this.spot.position.set(0, 1.5, .1); stage.add(this.spot);
    this.stagePaper = paper('game.py', .22); this.stagePaper.position.set(0, .78, .2); stage.add(this.stagePaper);
    // the album: a camera on a tripod and a string of photos (commits)
    const cam = new THREE.Group(); cam.position.set(-1.25, .2, .45);
    [[-.18, -.1], [.18, -.1], [0, .2]].forEach(([x, z]) => cam.add(part(new THREE.CylinderGeometry(.03, .03, 1.1, 6), INK, { p: [x, .55, z], r: [z * .5, 0, -x * .5], line: 0 })));
    cam.add(part(new THREE.BoxGeometry(.7, .45, .35), '#2b2d42', { p: [0, 1.25, 0] }));
    cam.add(part(new THREE.CylinderGeometry(.16, .18, .3, 18), '#6b7088', { p: [0, 1.25, .3], r: [Math.PI / 2, 0, 0] }));
    album.add(cam);
    this.flashBall = new THREE.Mesh(new THREE.SphereGeometry(.5, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .85 }));
    this.flashBall.position.set(-1.25, 1.45, .95); this.flashBall.visible = false; album.add(this.flashBall);
    album.add(part(new THREE.CylinderGeometry(.02, .02, 2.4, 6), '#8a5a33', { p: [.55, 2.05, -.2], r: [0, 0, Math.PI / 2], line: 0 }));
    this.photos = [['a1b2c3d', '#62c934'], ['e4f5a6b', '#ffc61a']].map(([id, c], i) => { const g = photo(id, c); g.position.set(.15 + i * .8, 1.7, -.15); g.rotation.z = i ? .06 : -.06; album.add(g); return g; });
    // GitHub's copy, kept safe in the cloud
    const cl = this.islands[3];
    cl.add(part(new THREE.BoxGeometry(1.3, .8, .6), '#dcefff', { p: [0, .95, .1] }));
    const roof = part(new THREE.ConeGeometry(.95, .55, 4), '#3a5bff', { p: [0, 1.62, .1] }); roof.rotation.y = Math.PI / 4; cl.add(roof);
    this.cloudPhotos = [['a1b2c3d', '#62c934'], ['e4f5a6b', '#ffc61a']].map(([id, c], i) => { const g = photo(id, c); g.scale.setScalar(.62); g.position.set(-.27 + i * .54, .98, .44); cl.add(g); return g; });
    // the tube everything travels through
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, Y.cloud - Y.desk + .6, 20, 1, true), new THREE.MeshPhysicalMaterial({ color: '#bfe8ff', transparent: true, opacity: .35, roughness: .1, side: THREE.DoubleSide }));
    tube.position.set(2.9, (Y.cloud + Y.desk) / 2 + .2, 0); this.scene.add(tube);
    this.packet = part(new THREE.CapsuleGeometry(.17, .22, 6, 14), '#62c934', { r: [0, 0, Math.PI / 2] });
    this.packetLabel = labelSprite('game.py', { bg: '#24133b', fg: '#4dff8b', h: .36 });
    this.scene.add(this.packet, this.packetLabel);
    this.packet.visible = this.packetLabel.visible = false;
    this.setState(0, true);
    this.drawScreen(['~/my-game$ _']);
  }
  cloudIsland(y) {
    const g = new THREE.Group(); g.position.set(0, y, 0);
    [[0, 0, 0, 1.25], [1.15, .05, .1, .95], [-1.15, .05, 0, 1], [.55, .5, -.25, .9], [-.6, .45, -.2, .85], [1.95, -.15, 0, .6], [-1.95, -.15, 0, .62]]
      .forEach(([x, yy, z, r]) => g.add(part(new THREE.SphereGeometry(r, 24, 16), '#ffffff', { p: [x, yy, z], s: [1, .6, .8] })));
    const l = labelSprite('GITHUB, IN THE CLOUD', { h: .42 }); l.position.set(-2.1, .95, 1.6); g.add(l);
    this.scene.add(g); return g;
  }
  // What is where at each step of the story. `landed` is true once the jelly bean has arrived.
  setState(i, landed) {
    this.stagePaper.visible = (i === 2 && landed) || (i === 3 && !landed);
    this.photos[1].visible = i >= 4 || (i === 3 && landed);
    this.cloudPhotos[1].visible = i >= 5 || (i === 4 && landed);
    this.lapScreen.material.color.set(i === 5 && landed ? '#4dff8b' : '#3a4055');
    if (i === 3 && landed) this.flashT = this.t;
  }
