/* ---------------- channel art studio (tools/brand.mjs adds this to the built Shell Jelly 2 page) ---------------- */
// Draws "Unix Jelly" at each channel's size, live, with the guides' own jelly. ART (the sizes and the three variations)
// is defined just above this by tools/brand.mjs. Save PNG exports the exact size; artRender() is the headless renderer's.
{
  for (const el of document.body.children) el.style.display = 'none'; // the guide underneath would keep its own 3D running
  document.title = 'Unix Jelly Channel Art';
  const css = document.createElement('style');
  css.textContent = `
    :root { --art-bg: #eef3fb; --art-fg: #24133b; --art-muted: #5d5470; --art-line: #cfd6e6; --art-chip: #ffffff; --art-on: #24133b; --art-on-fg: #ffffff; --art-go: #ff4d6d; }
    @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --art-bg: #17121f; --art-fg: #f1ecf8; --art-muted: #a99fbb; --art-line: #3a3149; --art-chip: #231c2e; --art-on: #f1ecf8; --art-on-fg: #17121f; --art-go: #ff6b85; color-scheme: dark } }
    :root[data-theme="dark"] { --art-bg: #17121f; --art-fg: #f1ecf8; --art-muted: #a99fbb; --art-line: #3a3149; --art-chip: #231c2e; --art-on: #f1ecf8; --art-on-fg: #17121f; --art-go: #ff6b85; color-scheme: dark }
    body { background: var(--art-bg) !important; }
    .art { position: fixed; inset: 0; display: flex; flex-direction: column; gap: 10px; padding-block: 12px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); background: var(--art-bg); color: var(--art-fg); font: 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; }
    .art-bar { display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: center; }
    .art-bar h1 { margin: 0; font: 22px "Titan One", system-ui, sans-serif; letter-spacing: .01em; }
    .art-group { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .art button { font: inherit; color: var(--art-fg); background: var(--art-chip); border: 1.5px solid var(--art-line); border-radius: 999px; padding: 5px 12px; cursor: pointer; }
    .art button small { color: var(--art-muted); margin-left: 4px; }
    .art button[aria-pressed="true"] { background: var(--art-on); color: var(--art-on-fg); border-color: var(--art-on); }
    .art button[aria-pressed="true"] small { color: inherit; opacity: .7; }
    .art button.art-go { background: var(--art-go); border-color: var(--art-go); color: #fff; font-weight: 600; }
    .art button .art-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; border: 1px solid #0003; }
    .art label { display: flex; gap: 6px; align-items: center; color: var(--art-muted); cursor: pointer; }
    .art-stage { flex: 1; min-height: 0; display: grid; place-items: center; }
    .art-frame { position: relative; box-shadow: 0 1px 0 var(--art-line), 0 8px 30px #24133b22; max-width: 100%; }
    .art-frame canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }
    .art-safe { position: absolute; border: 2px dashed #ff4d6dcc; pointer-events: none; display: none; }
    .art-note { margin: 0; color: var(--art-muted); min-height: 1.4em; }
  `;
  document.head.append(css);

  const ui = document.createElement('div');
  ui.className = 'art';
  ui.innerHTML = `
    <header class="art-bar">
      <h1>Unix Jelly channel art</h1>
      <div class="art-group" id="artShots" aria-label="Size"></div>
      <div class="art-group" id="artLooks" aria-label="Variation"></div>
      <div class="art-group">
        <button id="artDrop">Drop again</button>
        <label><input type="checkbox" id="artSafe"> Safe area</label>
        <button id="artSave" class="art-go">Save PNG</button>
      </div>
    </header>
    <main class="art-stage" id="artStage"><div class="art-frame" id="artFrame"><div class="art-safe" id="artSafeBox"></div></div></main>
    <p class="art-note" id="artNote"></p>`;
  document.body.append(ui);
  const $ = (id) => document.getElementById(id);
  const cur = { s: ART.shots[0].file, v: ART.variants[0].name };
  const shot = () => ART.shots.find((s) => s.file === cur.s), variant = () => ART.variants.find((v) => v.name === cur.v);

  // One stage per variation (each has its own sky and floor), reused for every size.
  const made = {};
  let active = null;
  const stageFor = (v) => made[v.name] ??= makeStage(v);
  function makeStage(v) {
    const c = document.createElement('canvas'); $('artFrame').prepend(c);
    const st = new JellyStage(c, { word: 'UJ', size: .07, bg: v.bg, floor: v.floor, colorOffset: 0, frame: 1.2, lookY: .5 });
    stages.delete(st); st.speed.n = 999; st.rich = true; st.back = 0; // its own loop, always full quality
    // the word fills the shot's share of the width (the banner's safe area), centred; up: how high the camera sits
    const fit = st.resize.bind(st);
    st.resize = () => {
      fit(); if (!st.shot) return;
      const cam = st.camera, size = st.opts.size, t = Math.tan(cam.fov * Math.PI / 360);
      const d = Math.max(st.wordWidth * .5 / (t * cam.aspect * st.shot.fill), size * 1.1 / t);
      cam.position.set(0, size * .5 + d * st.shot.up, d - st.back / 2); cam.lookAt(0, size * .35, -st.back / 2);
      st.scene.fog.near = d * 1.4; st.scene.fog.far = d * 4;
    };
    return { c, st };
  }

  function show() {
    const s = shot(), v = variant(), { st } = stageFor(v);
    for (const o of Object.values(made)) o.c.style.visibility = o.st === st ? 'visible' : 'hidden';
    active = st; st.shot = s;
    st.setWord(s.word, v.colours);
    const looks = s.pair ? v.pair : v.looks;
    st.bodies.forEach((b, i) => { paintJelly(b, looks[i % looks.length], v.colours[(i + 3) % v.colours.length]); b.mesh.material.dispersion = .35; });
    drop();
    frame();
    for (const b of document.querySelectorAll('#artShots button')) b.setAttribute('aria-pressed', b.dataset.k === cur.s);
    for (const b of document.querySelectorAll('#artLooks button')) b.setAttribute('aria-pressed', b.dataset.k === cur.v);
    $('artNote').textContent = `${s.w} × ${s.h} px · ${s.tip}`;
  }

  // One row of letters, or with stack one row per word, each further back, so tall pictures read "Unix" above "Jelly".
  // The letters drop from just above the floor, upright: from the guides' height, some land on their backs.
  function drop() {
    const st = active, s = st.shot, size = st.opts.size, gap = size * 2.4;
    const rows = s.stack ? s.word.split(' ') : [s.word.replaceAll(' ', '')];
    st.back = gap * (rows.length - 1);
    let at = 0; st.wordWidth = 0;
    rows.forEach((word, k) => {
      const row = st.bodies.slice(at, at += word.length), x0 = row[0].homeX - row[0].width / 2, x1 = row.at(-1).homeX + row.at(-1).width / 2;
      st.wordWidth = Math.max(st.wordWidth, x1 - x0);
      row.forEach((b) => {
        b.homeX -= (x0 + x1) / 2; b.cx = b.homeX; b.place(size * .25, 0);
        for (let i = 0; i < b.N; i++) b.x[i * 3 + 2] -= st.back - k * gap;
        b.prev.set(b.x); b.updateBox();
      });
    });
    st.bodies.forEach((b, i) => { b.spawnAt = st.t + i * .08; b.visibleNow(false); });
    const half = st.wordWidth / 2 + size * .9;
    Object.assign(st.bounds, { x0: -half, x1: half, z0: -size * 1.6 - st.back });
    st.resize();
  }

  // The preview keeps the shot's shape, as big as the window allows.
  function frame() {
    const s = shot(), box = $('artStage'), k = Math.min(box.clientWidth / s.w, box.clientHeight / s.h), f = $('artFrame');
    f.style.width = `${Math.floor(s.w * k)}px`; f.style.height = `${Math.floor(s.h * k)}px`;
    const safe = $('artSafeBox');
    safe.style.display = s.safe && $('artSafe').checked ? 'block' : 'none';
    if (s.safe) Object.assign(safe.style, { width: `${s.safe[0] / s.w * 100}%`, height: `${s.safe[1] / s.h * 100}%`, left: `${(1 - s.safe[0] / s.w) * 50}%`, top: `${(1 - s.safe[1] / s.h) * 50}%` });
  }

  // The picture at its exact size, drawn once at full resolution (small ones bigger, then scaled down, for smooth edges).
  function snapshot() {
    const s = shot(), st = active, r = st.renderer, pr = r.getPixelRatio(), k = s.w < 400 ? 4 : 1;
    r.setPixelRatio(1); r.setSize(s.w * k, s.h * k, false);
    r.render(st.scene, st.camera);
    const out = document.createElement('canvas'); out.width = s.w; out.height = s.h;
    const g = out.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(r.domElement, 0, 0, s.w, s.h);
    r.setPixelRatio(pr); st.resize();
    return out;
  }

  async function save() {
    const name = `unix-jelly-${cur.s}-${cur.v}.png`, blob = await new Promise((res) => snapshot().toBlob(res, 'image/png'));
    const downloads = await window.claude?.use('downloads');
    if (!downloads) { // opened as a file, not on claude.ai
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
      return;
    }
    $('artNote').textContent = `Saving ${name}…`;
    const done = await downloads.save({ filename: name, data: blob }).then(() => `Saved ${name}.`, (e) => e.code === 'declined' ? 'Not saved.' : `Couldn't save: ${e.message}`);
    $('artNote').textContent = done;
  }

  $('artShots').innerHTML = ART.shots.map((s) => `<button data-k="${s.file}">${s.label}<small>${s.w}×${s.h}</small></button>`).join('');
  $('artLooks').innerHTML = ART.variants.map((v) => `<button data-k="${v.name}"><span class="art-dot" style="background:${v.bg}"></span>${v.label}</button>`).join('');
  $('artShots').onclick = (e) => { const k = e.target.closest('button')?.dataset.k; if (k) { cur.s = k; show(); } };
  $('artLooks').onclick = (e) => { const k = e.target.closest('button')?.dataset.k; if (k) { cur.v = k; show(); } };
  $('artDrop').onclick = drop;
  $('artSafe').onchange = frame;
  $('artSave').onclick = save;
  addEventListener('resize', frame);

  // #profile-b opens that picture
  const want = location.hash.slice(1), hit = ART.shots.find((s) => want.startsWith(s.file + '-'));
  if (hit && ART.variants.some((v) => v.name === want.slice(hit.file.length + 1))) Object.assign(cur, { s: hit.file, v: want.slice(hit.file.length + 1) });
  show();
  let last = performance.now();
  const loop = (now) => { requestAnimationFrame(loop); active.tick(Math.min(.05, (now - last) / 1000)); last = now; };
  requestAnimationFrame(loop);

  // For tools/brand.mjs: settle the letters with physics alone (drawing is the slow part without a GPU), give the eyes
  // and the bits inside a few frames to catch up, then return the picture.
  window.artRender = async (file, name) => {
    Object.assign(cur, { s: file, v: name }); show();
    const st = active;
    for (let i = 0; i < 1500 && !(i > 120 && st.bodies.every((b) => b.sleeping)); i++) st.simulate(1 / 60);
    for (let i = 0; i < 30; i++) await new Promise(requestAnimationFrame);
    return snapshot().toDataURL('image/png');
  };
}
