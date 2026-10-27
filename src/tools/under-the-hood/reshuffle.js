/* ---------------- under the hood: how the jelly letters tidy up (tools/under-the-hood.py adds this to Shell Jelly) ---------------- */
// The real jelly stage and its real tidying code (JellyStage.shuffleHome), with the workings drawn on top: each letter's
// home spot, the two lanes, where each letter is heading, and the invisible hand. Nothing here decides anything: it
// reads the decisions shuffleHome records (b.why, b.goalX, b.goalZ, stage.still, stage.calm…) and shows them.
// The rules are written up in docs/design/letter-reshuffle.md.
{
  for (const el of document.body.children) el.style.display = 'none'; // the guide underneath would keep its own 3D running
  const SIZE = .07;
  // Each example: a word, and where some of its letters start. at: which letter's spot (default its own); dx, dz: how far
  // from there, in letter sizes (z is towards you); yaw: turned round; lying: on its side. expect is what really happens,
  // checked by tests/reshuffle.mjs: tidy (everyone gets home), turn (only a turn), tangle (the 20 s timeout), never
  // (tidying never starts). If the rules change and a test fails, the words on this page need changing too.
  const SCENES = [
    { id: 'aside', expect: 'tidy', name: 'Knocked aside', word: 'cat', set: { 2: { dx: .4, dz: 1.1 } },
      say: 'The <b>t</b> has been knocked out of the row, towards you. Nothing stands between it and its spot, so the hand carries it straight home.' },
    { id: 'round', expect: 'tidy', name: 'Walk round', word: 'ls', set: { 0: { at: 1, dx: 1.2 } },
      say: 'The <b>l</b> has been dragged to the far end, past the <b>s</b>. The s is in its way, so the l steps into the front lane, walks along it, and steps back in.' },
    { id: 'swap', expect: 'tidy', name: 'Swap places', word: 'ls', set: { 0: { at: 1 }, 1: { at: 0 } },
      say: 'The <b>l</b> and the <b>s</b> are in each other\'s spots. Both are blocked, so one takes the front lane and the other the back lane, and they pass.' },
    { id: 'weeble', expect: 'tidy', name: 'Fallen over', word: 'cat', set: { 1: { dx: 1.1, dz: 1.1, lying: true } },
      say: 'The <b>a</b> is lying on its side, in front of the row. Tidying can\'t start while anyone is lying down, so first it lies still for a moment, then springs up like a weeble, where it is. Then it gets carried home.' },
    { id: 'backwards', expect: 'turn', name: 'Facing backwards', word: 'pwd', set: { 1: { yaw: Math.PI } },
      say: 'The <b>w</b> is in its spot, but facing away from you. It isn\'t a stray, so nobody carries it: it\'s simply turned round. That\'s the one cheat in the whole thing.' },
    { id: 'cycle', expect: 'tidy', name: 'Round in a circle', word: 'cat', set: { 0: { at: 1 }, 1: { at: 2 }, 2: { at: 0 } },
      say: 'Each letter is in the next one\'s spot: c in a\'s, a in t\'s, t in c\'s. With only two lanes, can they sort themselves out? Yes: as soon as one letter steps into a lane, its old spot is free for another.' },
    { id: 'tangle', expect: 'tangle', name: 'Back to front', word: 'mkdir', set: { 0: { at: 4 }, 1: { at: 3 }, 3: { at: 1 }, 4: { at: 0 } },
      say: 'The word is back to front. <b>m</b> takes the front lane and <b>k</b> the back lane, and each waits by its spot. But <b>r</b> is in m\'s spot and <b>i</b> is in k\'s, and they are waiting for a lane, which m and k are holding. Everyone waits for everyone: a <b>deadlock</b>. Watch the clock.' },
    { id: 'close', expect: 'tangle', name: 'So close', word: 'pwd', set: { 0: { at: 2, dx: 1.2 } },
      say: 'Only the <b>p</b> is out of place. It walks round by the front lane and waits by its spot, which looks empty. But the <b>w</b> has been nudged a hair off its exact spot. That still counts as home, because "home" allows a little slack. The rule that asks "is anyone in my spot?" allows almost none: the letters are packed with only a few per cent to spare. So to that rule, the w is in the way, and the p waits for a gap that never opens.' },
    { id: 'jam', expect: 'never', name: 'Wedged', word: 'mkdir', set: { 0: { at: 1 }, 1: { at: 4 }, 2: { at: 0 }, 4: { at: 2 } },
      say: 'The wide <b>m</b> has been squeezed into the narrow <b>k</b>\'s spot. It and its neighbours keep jiggling against each other and never quite stop, so the wait for calm never ends and tidying never starts.' },
    { id: 'scramble', name: 'Scramble', word: 'mkdir', random: true,
      say: 'Every letter flung somewhere at random, some on their sides. Press <b>Scramble</b> again for a new mess.' },
    { id: 'play', name: 'Your turn', word: 'jelly', set: {},
      say: 'Grab the letters and fling them, or knock them over. Let go, and watch them tidy up.' },
  ];
  const WHY = {
    straight: 'walking straight home', 'step-out': 'stepping out into the {lane} lane', along: 'walking along the {lane} lane',
    hold: 'waiting in the {lane} lane: someone is in its spot', 'step-in': 'stepping back into its spot',
    wait: 'waiting: both lanes are taken', landing: 'being lowered gently onto its spot', home: 'home',
  };
  const RULES = [
    ['calm', 'Wait for calm', 'Nothing starts until every letter has been still for 0.6 seconds.'],
    ['stand', 'Stand up', 'A letter lying on its side for 1.1 seconds springs back up.'],
    ['strays', 'Find the strays', 'Any letter not on its spot is a stray. One facing backwards is just turned round.'],
    ['carry', 'Carry home', 'An invisible hand holds the top of each stray and carries it home in hops.'],
    ['lanes', 'Go round', 'Blocked? Step into the front or back lane, walk along, wait for the gap, step in. One letter per lane.'],
    ['land', 'Land gently', 'Lower it onto its spot for 0.4 seconds before letting go, so it doesn\'t topple.'],
    ['tangle', 'Give up gracefully', 'Still tangled after 20 seconds? Everyone pops straight home.'],
    ['done', 'Happy squish', 'Everyone\'s home: a little hop each, and a ding.'],
  ];

  const css = document.createElement('style');
  css.textContent = `
    :root { --u-bg: #f3efe6; --u-fg: #24133b; --u-muted: #5d5470; --u-card: #ffffff; --u-line: #24133b; --u-soft: #e9e2d3; --u-hi: #ffc61a; --u-go: #62c934; }
    @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --u-bg: #17121f; --u-fg: #f1ecf8; --u-muted: #b3a9c4; --u-card: #231c2e; --u-line: #f1ecf8; --u-soft: #2e2540; color-scheme: dark } }
    :root[data-theme="dark"] { --u-bg: #17121f; --u-fg: #f1ecf8; --u-muted: #b3a9c4; --u-card: #231c2e; --u-line: #f1ecf8; --u-soft: #2e2540; color-scheme: dark }
    body { background: var(--u-bg) !important; }
    .uth { min-height: 100vh; background: var(--u-bg); color: var(--u-fg); font: 15px/1.5 "Lexend", system-ui, sans-serif; padding-block: 18px 28px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); box-sizing: border-box; display: grid; gap: 14px; max-width: 1360px; margin: 0 auto; }
    .uth * { box-sizing: border-box; }
    .uth h1 { font: 30px/1.1 "Titan One", system-ui, sans-serif; margin: 0; text-wrap: balance; }
    .uth h2 { font: 18px/1.2 "Titan One", system-ui, sans-serif; margin: 0 0 6px; }
    .uth a { color: inherit; }
    .uth-top { display: flex; flex-wrap: wrap; gap: 6px 20px; align-items: baseline; justify-content: space-between; }
    .uth-top p { margin: 4px 0 0; color: var(--u-muted); max-width: 70ch; }
    .uth-back { font-weight: 600; white-space: nowrap; }
    .uth-scenes { display: flex; flex-wrap: wrap; gap: 6px; }
    .uth button { font: inherit; font-size: 14px; color: var(--u-fg); background: var(--u-card); border: 2px solid var(--u-line); border-radius: 999px; padding: 4px 12px; cursor: pointer; box-shadow: 0 2px 0 var(--u-line); }
    .uth button[aria-pressed="true"] { background: var(--u-hi); color: #24133b; }
    .uth-main { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 14px; align-items: start; }
    @media (max-width: 900px) { .uth-main { grid-template-columns: minmax(0, 1fr); } }
    @media (max-width: 600px) { .uth-stage { --shape: 4 / 3; } }
    .uth-stage { position: relative; aspect-ratio: var(--shape, 16 / 9); width: 100%; max-width: 100%; border: 3px solid var(--u-line); border-radius: 18px; overflow: hidden; background: #d4eeff; }
    .uth-stage canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .uth-stage canvas.ov { pointer-events: none; }
    .uth-stage .gl { touch-action: none; }
    .uth-clock { position: absolute; left: 12px; top: 10px; font: 600 13px/1.3 ui-monospace, Menlo, monospace; background: #24133bdd; color: #fff; border-radius: 10px; padding: 4px 9px; pointer-events: none; }
    .uth-controls { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }
    .uth-controls label { display: flex; gap: 5px; align-items: center; color: var(--u-muted); font-size: 14px; }
    .uth-side { display: grid; gap: 12px; min-width: 0; }
    .uth-card { background: var(--u-card); border: 3px solid var(--u-line); border-radius: 18px; padding: 12px 14px; min-width: 0; }
    .uth-now { font: 18px/1.3 "Titan One", system-ui, sans-serif; margin: 0 0 4px; }
    .uth-meter { height: 8px; border-radius: 99px; background: var(--u-soft); overflow: hidden; margin: 6px 0 2px; }
    .uth-meter i { display: block; height: 100%; width: 0; background: var(--u-go); }
    .uth-meter.red i { background: #ff4d6d; }
    .uth-small { color: var(--u-muted); font-size: 13px; margin: 0; }
    .uth-letters { display: grid; gap: 4px; margin: 6px 0 0; padding: 0; list-style: none; }
    .uth-letters li { display: flex; gap: 8px; align-items: baseline; }
    .uth-letters b { flex: 0 0 auto; min-width: 26px; text-align: center; font: 16px/1.3 "Titan One", system-ui, sans-serif; color: #fff; border-radius: 8px; padding: 0 6px; -webkit-text-stroke: .5px #24133b; }
    .uth-log { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; font-size: 13px; max-height: 190px; overflow: auto; }
    .uth-log li span { color: var(--u-muted); font-family: ui-monospace, Menlo, monospace; margin-right: 6px; }
    .uth-rules { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin: 0; padding: 0; list-style: none; counter-reset: r; }
    .uth-rules li { background: var(--u-card); border: 2px solid var(--u-line); border-radius: 14px; padding: 8px 10px; font-size: 13px; opacity: .55; transition: opacity .2s, transform .2s, background .2s; counter-increment: r; }
    .uth-rules li b { display: block; font: 15px/1.2 "Titan One", system-ui, sans-serif; }
    .uth-rules li b::before { content: counter(r) ". "; }
    .uth-rules li.on { opacity: 1; background: var(--u-hi); color: #24133b; transform: translateY(-2px); }
    .uth-say { margin: 0; }
    .uth-key { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 13px; color: var(--u-muted); margin-top: 6px; }
    .uth-key i { display: inline-block; width: 18px; height: 0; border-top: 3px dashed #ff8a2b; vertical-align: middle; margin-right: 4px; }
    .uth-key i.home { width: 10px; height: 10px; border: 2px solid #24133b; border-radius: 50%; }
    .uth-key i.hand { width: 10px; height: 10px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px #24133b; }
    .uth-key i.goal { border-top: 3px solid #24133b; }
  `;
  document.head.append(css);
  const ui = document.createElement('div');
  ui.className = 'uth';
  ui.innerHTML = `
    <header class="uth-top">
      <div><h1>Under the hood: how the jelly letters tidy up</h1>
      <p>Knock the letters in any Unix Jelly guide over, and they stand back up and hop home in order. These are the real jellies and the real code, with the workings drawn on. Pick an example, or make your own mess.</p></div>
      <a class="uth-back" href="../">← Unix Jelly</a>
    </header>
    <nav class="uth-scenes" id="uScenes" aria-label="Examples"></nav>
    <div class="uth-main">
      <div>
        <div class="uth-stage" id="uStage"><canvas class="gl" id="uGl" aria-label="The jelly letters. Drag them to knock them about."></canvas><canvas class="ov" id="uOv"></canvas><div class="uth-clock" id="uClock"></div></div>
        <div class="uth-controls">
          <button id="uPlay">Pause</button><button id="uStep" disabled>Step ▸ 0.1 s</button><button id="uAgain">Start again</button>
          <label>Speed <select id="uSpeed"><option value="1">1×</option><option value="0.5">½×</option><option value="0.25">¼×</option></select></label>
          <label><input type="checkbox" id="uShow" checked> Show the workings</label>
          <label><input type="checkbox" id="uSound"> Sound</label>
        </div>
        <div class="uth-key"><span><i class="home"></i>home spot</span><span><i></i>lane (front and back)</span><span><i class="goal"></i>where it's heading</span><span><i class="hand"></i>the invisible hand</span></div>
      </div>
      <aside class="uth-side">
        <section class="uth-card"><p class="uth-say" id="uSay"></p></section>
        <section class="uth-card" aria-live="polite"><p class="uth-now" id="uNow"></p><div class="uth-meter" id="uMeter"><i></i></div><p class="uth-small" id="uDetail"></p><ul class="uth-letters" id="uLetters"></ul></section>
        <section class="uth-card"><h2>What happened</h2><ol class="uth-log" id="uLog"></ol></section>
      </aside>
    </div>
    <section><h2>The rules, in order</h2><ol class="uth-rules" id="uRules"></ol></section>
    <p class="uth-small">The rules in full, with every number: <a href="https://github.com/boxabirds/unixjelly/blob/HEAD/docs/design/letter-reshuffle.md">docs/design/letter-reshuffle.md</a>. The physics is a soft-body simulation ported from Jelly Baby by Scott Sun.</p>`;
  document.body.append(ui);
  const $ = (id) => document.getElementById(id);
  $('uRules').innerHTML = RULES.map(([k, t, d]) => `<li data-k="${k}"><b>${t}</b>${d}</li>`).join('');
  $('uScenes').innerHTML = SCENES.map((s) => `<button data-k="${s.id}">${s.name}</button>`).join('');
  sound.muted = true;

  // the stage: the guides' own JellyStage, with a camera that looks down a little, so both lanes are in view. It frames
  // the stage's walls, which is as far as any letter (or lane) can go.
  const st = new JellyStage($('uGl'), { word: 'cat', size: SIZE, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.2, lookY: .5 });
  stages.delete(st);
  const fit = st.resize.bind(st);
  st.resize = () => {
    fit(); const cam = st.camera, t = Math.tan(cam.fov * Math.PI / 360);
    const d = Math.max(Math.max(st.bounds.x1, SIZE * 2) * 1.08 / (t * cam.aspect), SIZE * 2.4 / t);
    cam.position.set(0, SIZE * .4 + d * .62, d * .8); cam.lookAt(0, SIZE * .25, SIZE * .1);
    st.scene.fog.near = d * 2; st.scene.fog.far = d * 5;
  };

  let scene = SCENES[0], letters = [], cols = [], speed = 1, paused = false, log = [], seen = [], t0 = 0, rnd = 1;
  const rand = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;

  function start(s, again = false) {
    scene = s;
    if (s.random && again) rnd = (rnd * 48271) % 2147483647 || 7;
    for (const b of document.querySelectorAll('#uScenes button')) b.setAttribute('aria-pressed', b.dataset.k === s.id);
    $('uSay').innerHTML = s.say;
    st.setWord(s.word);
    letters = [...s.word.replace(/ /g, '')]; cols = letters.map((_, i) => JELLY[(st.opts.colorOffset + i) % JELLY.length]);
    st.homing = false; st.calm = 0; st.lanes = {}; st.drag = null; st.tangledAt = null; st.still = false;
    st.bodies.forEach((b, i) => {
      const p = s.random ? { at: Math.floor(rand() * letters.length), dx: (rand() - .5) * 2.5, dz: (rand() - .5) * 2.6, yaw: rand() < .3 ? Math.PI : (rand() - .5) * .8, lying: rand() < .3 } : s.set[i] ?? {};
      pose(b, st.bodies[p.at ?? i].homeX + (p.dx ?? 0) * SIZE, (p.dz ?? 0) * SIZE, p);
      Object.assign(b, { stray: false, lane: null, why: null, carry: null, grab: null, restTime: 0, stoodAt: null, turnedAt: null });
    });
    st.resize(); t0 = st.t; log = []; seen = st.bodies.map(() => ({})); note('Letters drop in where the example puts them.');
    paint();
  }
  // Put a letter somewhere: upright or on its side, turned by yaw about the vertical, dropped from just above the floor.
  // Always inside the stage's walls, as in the guides: a letter can't be dragged through them.
  function pose(b, x, z, { yaw = 0, lying = false }) {
    x = clamp(x, st.bounds.x0 + SIZE * .7, st.bounds.x1 - SIZE * .7); z = clamp(z, -SIZE * 1.1, SIZE * 1.1);
    b.cx = x; b.place(SIZE * (lying ? .5 : .15), lying ? Math.PI / 2 : 0);
    const c = Math.cos(yaw), s = Math.sin(yaw);
    for (let i = 0; i < b.N; i++) { const dx = b.x[i * 3] - x, dz = b.x[i * 3 + 2]; b.x[i * 3] = x + dx * c - dz * s; b.x[i * 3 + 2] = z + dx * s + dz * c; }
    b.prev.set(b.x); b.updateBox(); b.spawnAt = st.t; b.visibleNow(true);
  }

  const time = () => (st.t - t0).toFixed(1).padStart(4) + ' s';
  function note(text, at = st.t) { log.push(`<li><span>${(at - t0).toFixed(1).padStart(4)} s</span>${text}</li>`); const el = $('uLog'); el.innerHTML = log.join(''); el.scrollTop = el.scrollHeight; }
  const name = (i) => `<b style="color:${cols[i]}">${letters[i]}</b>`;
  const why = (b) => (WHY[b.why] ?? '').replace('{lane}', b.lane ?? '');
  // What changed since the last frame, in words.
  function events() {
    if (st.homing && !seen.homing) note(`Everyone is still: tidying starts. Strays: ${st.bodies.map((b, i) => b.stray ? name(i) : '').filter(Boolean).join(' ') || 'none'}.`);
    if (!st.homing && seen.homing && st.tangledAt !== seen.tangledAt) note('20 seconds and still tangled: everyone pops straight home.');
    else if (!st.homing && seen.homing) note('Everyone is home. A little squish each, and a ding.');
    seen.homing = st.homing; seen.tangledAt = st.tangledAt;
    st.bodies.forEach((b, i) => {
      // a decision is logged once it has lasted 0.3 s (letters flick between "walking along" and "waiting" as they arrive)
      const s = seen[i], key = b.why && b.stray ? b.why + (b.lane ?? '') : null;
      if (key !== s.pend) { s.pend = key; s.since = st.t; }
      else if (st.homing && key && key !== s.key && st.t - s.since >= .3) { note(`${name(i)} ${why(b)}.`, s.since); s.key = key; }
      if (b.stray === false && s.stray && st.homing) note(`${name(i)} is home.`);
      if (b.stoodAt != null && b.stoodAt !== s.stoodAt) note(`${name(i)} was lying down: it springs back up.`);
      if (b.turnedAt != null && b.turnedAt !== s.turnedAt) note(`${name(i)} was facing backwards: it's turned round.`);
      Object.assign(s, { stray: b.stray, stoodAt: b.stoodAt, turnedAt: b.turnedAt });
    });
  }

  // The side panel: which rule is in charge right now, and what each letter is doing.
  function paint() {
    const B = st.bodies, fallen = B.filter((b) => b.isFallen()), dropping = B.some((b) => st.t < b.spawnAt);
    let now, detail = '', meter = 0, red = false, rule = 'calm';
    if (st.drag) { now = 'You\'re holding a letter'; detail = 'Tidying waits until you let go.'; }
    else if (dropping) now = 'Dropping in…';
    else if (st.homing) {
      const busy = B.filter((b) => b.stray);
      now = `Tidying up: ${busy.length} to go`; meter = st.homeTime / 20; red = st.homeTime > 10;
      detail = `${st.homeTime.toFixed(1)} of 20 seconds before everyone pops home.`;
      rule = busy.some((b) => b.why === 'landing') ? 'land' : busy.some((b) => b.lane || b.why === 'wait') ? 'lanes' : 'carry';
      if (st.homeTime > 17) rule = 'tangle';
    } else if (fallen.length) {
      now = 'Someone has fallen over'; rule = 'stand';
      const b = fallen[0]; meter = Math.min(1, (b.restTime || 0) / 1.1);
      detail = b.sleeping ? 'Lying still… after 1.1 seconds it springs up.' : 'It has to lie still first.';
    } else if (!st.still) { now = 'Waiting for calm'; detail = 'Somebody is still wobbling.'; }
    else if (st.calm < .6) { now = 'Waiting for calm'; meter = st.calm / .6; detail = `Everyone still for ${st.calm.toFixed(2)} of 0.6 seconds.`; }
    else { now = 'All tidy'; rule = 'done'; detail = 'Every letter is on its spot. Drag one to start again.'; }
    if (!st.homing && B.some((b) => b.turnedAt != null && st.t - b.turnedAt < 1.2)) rule = 'strays';
    if (st.tangledAt != null && st.t - st.tangledAt < 2) rule = 'tangle';
    $('uNow').textContent = now; $('uDetail').textContent = detail;
    $('uMeter').firstChild.style.width = `${Math.min(1, meter) * 100}%`; $('uMeter').classList.toggle('red', red);
    for (const li of document.querySelectorAll('#uRules li')) li.classList.toggle('on', li.dataset.k === rule);
    $('uLetters').innerHTML = B.map((b, i) => `<li><b style="background:${cols[i]}">${letters[i]}</b><span>${
      b.isFallen() ? 'lying on its side' : st.homing ? (b.stray ? why(b) : 'home') : st.t < b.spawnAt ? 'dropping' : b.sleeping ? 'still' : 'wobbling'}</span></li>`).join('');
    $('uClock').textContent = `${time()}${paused ? '  ❚❚ paused' : speed < 1 ? `  ${speed === .5 ? '½' : '¼'}× speed` : ''}`;
  }

  // The workings, drawn over the 3D: home spots, the main row, the lanes, each stray's goal and the hand.
  const ov = $('uOv'), g = ov.getContext('2d'), V = new THREE.Vector3();
  const at = (x, y, z) => { V.set(x, y, z).project(st.camera); return [(V.x + 1) / 2 * ov.width, (1 - V.y) / 2 * ov.height]; };
  function draw() {
    const r = ov.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
    if (ov.width !== Math.round(r.width * dpr)) { ov.width = Math.round(r.width * dpr); ov.height = Math.round(r.height * dpr); }
    g.clearRect(0, 0, ov.width, ov.height);
    if (!$('uShow').checked || !st.bodies.length) return;
    g.save(); g.scale(1, 1); const u = dpr;
    const B = st.bodies, hz = B[0].restMean[2], x0 = st.bounds.x0, x1 = st.bounds.x1;
    const line = (pts, color, w, dash = []) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = color; g.lineWidth = w * u; g.setLineDash(dash.map((d) => d * u)); g.stroke(); g.setLineDash([]); };
    // the main row (where a letter counts as "in the way") and the two lanes
    g.fillStyle = '#24133b14'; g.beginPath(); [[x0, hz - SIZE * .7], [x1, hz - SIZE * .7], [x1, hz + SIZE * .7], [x0, hz + SIZE * .7]].map(([x, z]) => at(x, 0, z)).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.fill();
    for (const [side, dz] of [['front', 1.15], ['back', -1.15]]) {
      const who = st.lanes?.[side], c = who ? cols[B.indexOf(who)] : '#ff8a2b';
      line([at(x0, 0, hz + dz * SIZE), at(x1, 0, hz + dz * SIZE)], c, who ? 4 : 2.5, [10, 7]);
      const [lx, ly] = at(x0, 0, hz + dz * SIZE); g.font = `600 ${12 * u}px system-ui, sans-serif`; g.fillStyle = '#24133b'; g.fillText(`${side} lane${who ? ': taken' : ''}`, lx + 8 * u, ly - 6 * u);
    }
    B.forEach((b, i) => {
      const [hx, hzz] = [b.homeX + b.restMean[0], b.restMean[2]], [sx, sy] = at(hx, 0, hzz);
      g.beginPath(); g.arc(sx, sy, 9 * u, 0, Math.PI * 2); g.lineWidth = 2.5 * u; g.strokeStyle = cols[i]; g.stroke();
      g.font = `${13 * u}px "Titan One", system-ui, sans-serif`; g.fillStyle = cols[i]; g.textAlign = 'center'; g.fillText(letters[i], sx, sy + 26 * u); g.textAlign = 'left';
      if (st.homing && b.stray && b.why && b.goalX != null) {
        const c = b.center(), [ax, ay] = at(c[0], 0, c[2]), [bx, by] = at(b.goalX, 0, b.goalZ);
        line([[ax, ay], [bx, by]], '#24133b', 2.5);
        const a = Math.atan2(by - ay, bx - ax); g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - 10 * u * Math.cos(a - .45), by - 10 * u * Math.sin(a - .45)); g.lineTo(bx - 10 * u * Math.cos(a + .45), by - 10 * u * Math.sin(a + .45)); g.closePath(); g.fillStyle = '#24133b'; g.fill();
      }
      if (b.carry) {
        const k = b.carry, [kx, ky] = at(k.p[0] - k.ox, k.p[1] + SIZE * .35, k.p[2] - k.oz);
        g.beginPath(); g.arc(kx, ky, 8 * u, 0, Math.PI * 2); g.fillStyle = '#ffffffee'; g.fill(); g.lineWidth = 2.5 * u; g.strokeStyle = '#24133b'; g.stroke();
        if (k.hold) { g.font = `600 ${12 * u}px system-ui, sans-serif`; g.fillStyle = '#24133b'; g.fillText('waiting', kx + 12 * u, ky + 4 * u); }
      }
    });
    g.restore();
  }

  let last = performance.now();
  const loop = (now) => {
    requestAnimationFrame(loop);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    st.tick(paused ? 0 : dt * speed);
    events(); paint(); draw();
  };
  requestAnimationFrame(loop);

  $('uScenes').onclick = (e) => { const k = e.target.closest('button')?.dataset.k; if (k) start(SCENES.find((s) => s.id === k), true); };
  $('uAgain').onclick = () => start(scene);
  $('uPlay').onclick = () => { paused = !paused; $('uPlay').textContent = paused ? 'Play' : 'Pause'; $('uStep').disabled = !paused; };
  $('uStep').onclick = () => { st.tick(.05); st.tick(.05); };
  $('uSpeed').onchange = (e) => { speed = +e.target.value; };
  $('uSound').onchange = (e) => { sound.muted = !e.target.checked; };
  // keys belong to this page, not the guide hidden underneath
  addEventListener('keydown', (e) => {
    e.stopImmediatePropagation();
    if (e.key === ' ' && e.target === document.body) { e.preventDefault(); $('uPlay').click(); }
  }, true);
  start(SCENES[0]);

  // For checks: for each pair of neighbours at rest, how far apart their home spots are, against the distance the
  // "is my spot free?" rule needs (shuffleHome's pad). Below 1 means a neighbour at home looks like it's in the way.
  window.uthPad = (word) => { st.setWord(word); const B = st.bodies, gap = SIZE * .14;
    return B.slice(1).map((o, i) => { const b = B[i], d = (o.homeX + o.restMean[0]) - (b.homeX + b.restMean[0]), pad = (b.width + o.width) / 2 + gap * .3;
      return `${[...word.replace(/ /g, '')][i]}${[...word.replace(/ /g, '')][i + 1]} ${(d / pad).toFixed(2)} (mass offsets ${(b.restMean[0] / SIZE).toFixed(2)}, ${(o.restMean[0] / SIZE).toFixed(2)})`; }); };
  // For checks: each letter's state right now.
  window.uthState = () => ({ homing: !!st.homing, still: st.still, calm: +(st.calm || 0).toFixed(2), letters: st.bodies.map((b, i) => ({ l: letters[i], sleeping: b.sleeping, grounded: b.grounded, rms: +b.rms.toFixed(4), fallen: b.isFallen(), x: +((b.center()[0] - b.homeX - b.restMean[0]) / SIZE).toFixed(2) })) });
  // For tools/under-the-hood.py's check: play one example with physics alone and report what happened.
  window.uthScenes = SCENES.filter((s) => s.expect).map((s) => ({ id: s.id, expect: s.expect }));
  window.uthRun = (id, seconds = 40) => {
    start(typeof id === 'string' ? SCENES.find((s) => s.id === id) : { id: 'try', name: 'try', say: '', ...id });
    let sawHoming = false, done = null;
    for (let i = 0; i < seconds * 60 && done == null; i++) {
      st.simulate(1 / 60); events();
      if (st.homing) sawHoming = true;
      if (sawHoming && !st.homing) done = st.t - t0;
    }
    return { id: id.id ?? id, done, tangled: st.tangledAt != null, turned: st.bodies.some((b) => b.turnedAt != null), log: log.map((l) => l.replace(/<[^>]+>/g, '')) };
  };
}
