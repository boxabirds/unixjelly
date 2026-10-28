/* ---------------- the block editor (guides/web/editor.html) ---------------- */
// The editor runs in its own frame, so its styles and the guide's never mix. It reports every change as a
// { type: 'blocks' } event, which goes to check() like a typed command does in the other guides.
const EDITOR_HTML = __EDITOR_HTML__;
const editorFrame = $('#editor');
let BE = null;
// A part of the editor shows once the lesson that teaches it is reached: blocks by their own names, tools by theirs.
const KIND_IDS = ['heading', 'para', 'text', 'bold', 'italic', 'list', 'item', 'table', 'row', 'cell', 'picture', 'link', 'form', 'textbox', 'button'];
// Every child starts with a page that only uses lesson 1's blocks: a heading and a paragraph.
const leaf = (id, text) => ({ id, kind: 'text', kids: [], style: null, attrs: {}, text });
const START_SITE = { site: [{ name: 'index.html', title: 'My jelly page', code: null, broken: false, root: { id: 1, kind: 'page', style: null, attrs: {}, kids: [
  { id: 2, kind: 'heading', style: null, attrs: {}, kids: [leaf(3, 'My jelly page')] },
  { id: 4, kind: 'para', style: null, attrs: {}, kids: [leaf(5, 'I like jelly.')] },
] } }] };
// A mission may use anything taught up to and including its own lesson, in course order, as the prerequisite tests
// expect: a child who jumps ahead to lesson 13 still gets the HTML view its mission needs.
const upTo = (concept, at = cur, inOrder = false) => { const k = LESSONS.findIndex((L) => L.teaches?.includes(concept)); return k < 0 || k <= at || (!inOrder && !!store.done[LESSONS[k].id]); };
// what the editor shows in exercise number `at` (inOrder: by course order alone, as presenter mode shows the course)
const gateAt = (at, inOrder = false) => {
  const up = (c) => upTo(c, at, inOrder);
  return { kinds: KIND_IDS.filter(up), views: ['blocks', up('tags') && 'tags', up('html') && 'html'].filter(Boolean), moving: up('moving'), colours: up('colours'), pages: up('pages'), title: up('title') };
};
function gateEditor() { BE?.gate(gateAt(cur)); }
let siteTimer;
const SAVE_MS = 400;
function saveSite() { clearTimeout(siteTimer); siteTimer = setTimeout(() => { store.web1 = BE.dump(); save(); }, SAVE_MS); }
let editorLoaded; const prReady = new Promise((r) => { editorLoaded = r; }); // presenter mode waits for the editor
editorFrame.addEventListener('load', () => {
  const w = editorFrame.contentWindow;
  const ready = () => { BE = w.BE; BE.load(store.web1 ?? START_SITE); gateEditor(); BE.on = (e) => { saveSite(); check(e); }; editorLoaded(); };
  if (w.BE?.ready) ready(); else w.BE.onready = ready;
}, { once: true });
editorFrame.srcdoc = EDITOR_HTML;
// A copy of the website as each exercise's mission begins, so Start over can put it back. Kept until a step is done.
function webMission(L) {
  if (!BE || (store.steps[L.id] ?? []).some(Boolean)) return;
  store.web1Start = { ...store.web1Start, [L.id]: BE.dump() }; save();
}
function webStartOver(L) {
  const was = store.web1Start?.[L.id];
  if (was && BE) { const on = BE.on; BE.on = null; BE.load(was); BE.do.mode('edit'); BE.on = on; gateEditor(); store.web1 = BE.dump(); }
  if (!store.done[L.id] && store.nojelly) delete store.nojelly[L.id];
  save(); paintHelp();
}
// The lesson decides what is on the mission's workbench: the editor, or (in "Pages can do almost anything") the examples.
function webLesson(L) {
  gateEditor();
  $('#editor').hidden = !!L.demos; $('#webDemos').hidden = !L.demos;
}

/* ---------------- what pages can do: three small live examples ---------------- */
// Built into the guide, so no child is sent off to another website. Nothing here asks for a camera or microphone.
// DEMO does each one for a child who asks for help: a squiggle, a spin, a tune.
const DEMO = {};
const glowHere = (sel) => document.querySelectorAll(sel).forEach((el) => { el.classList.remove('hint-glow'); void el.offsetWidth; el.classList.add('hint-glow'); });
(() => {
  const cv = $('#demoDraw'), g = cv.getContext('2d');
  let drawing = false, last = null;
  const at = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  cv.addEventListener('pointerdown', (e) => { drawing = true; last = at(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = at(e); g.strokeStyle = JELLY[Math.floor(performance.now() / 400) % JELLY.length]; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(...last); g.lineTo(...p); g.stroke(); last = p;
  });
  cv.addEventListener('pointerup', () => { if (drawing) check({ type: 'demo', k: 'draw' }); drawing = false; });
  $('#demoClear').onclick = () => g.clearRect(0, 0, cv.width, cv.height);
  const SQUIGGLE = 40;
  DEMO.draw = () => {
    g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i <= SQUIGGLE; i++) { const x = cv.width * (.15 + .7 * i / SQUIGGLE), y = cv.height * (.5 + .25 * Math.sin(i / 3)); g.strokeStyle = JELLY[i % JELLY.length]; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); check({ type: 'demo', k: 'draw' });
  };

  const cube = $('#demoCube'), SPIN = .6, TURNED = 40;
  let turn = null, rx = -20, ry = 30, moved = 0;
  const paint = () => { cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
  $('#demoSpin').addEventListener('pointerdown', (e) => { turn = [e.clientX, e.clientY]; moved = 0; e.currentTarget.setPointerCapture(e.pointerId); });
  $('#demoSpin').addEventListener('pointermove', (e) => {
    if (!turn) return;
    const dx = e.clientX - turn[0], dy = e.clientY - turn[1]; turn = [e.clientX, e.clientY];
    ry += dx * SPIN; rx -= dy * SPIN; moved += Math.abs(dx) + Math.abs(dy); paint();
  });
  $('#demoSpin').addEventListener('pointerup', () => { if (moved > TURNED) check({ type: 'demo', k: 'spin' }); turn = null; });
  paint();
  const TURN_DEG = 120;
  DEMO.spin = () => { ry += TURN_DEG; cube.style.transition = 'transform .8s'; paint(); setTimeout(() => { cube.style.transition = ''; }, 900); check({ type: 'demo', k: 'spin' }); };

  // the drums: each pad is a note; three different notes make a tune
  const NOTES = [262, 330, 392, 523], played = new Set(), TUNE = 3;
  $('#demoDrums').innerHTML = NOTES.map((f, i) => `<button data-f="${f}" style="background:${JELLY[i]}" aria-label="Drum ${i + 1}"></button>`).join('');
  $('#demoDrums').onclick = (e) => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    sound.boing(+b.dataset.f, .35, .14); played.add(b.dataset.f);
    b.animate([{ transform: 'scale(.85)' }, { transform: 'none' }], { duration: 220, easing: 'ease-out' });
    if (played.size >= TUNE) check({ type: 'demo', k: 'sound' });
  };
  const BEAT_MS = 120;
  DEMO.drums = () => [...$('#demoDrums').children].slice(0, TUNE).forEach((d, i) => setTimeout(() => d.click(), i * BEAT_MS));
})();

/* ---------------- presenter mode: the missions, played live ---------------- */
// Each step plays in front of the viewer, in a second copy of the editor (the guide's own can't move: an iframe reloads
// when it is moved). A big pointer goes to what the step uses (the hint's glow says where), clicks, and the step's
// "Do it for me" happens; new words are typed in. Going back, or opening a frame cold, shows the step already done.
// The presenter records each step's editor before and after (snap); show(frame, play) puts it on screen.
const PR_LIVE = (() => {
  const POINTER_MS = 650, PRESS_MS = 220, TYPE_MS = 55, REST_MS = 300;
  let box = null, frame = null, live = null, ready = null, pointer = null, run = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // the guide's helpers and the steps' doIt use BE: for a moment, that is the presenter's copy
  const as = (fn) => { const main = BE; BE = live; try { return fn(); } finally { BE = main; } };
  function mount() {
    if (ready) return ready;
    box = document.createElement('div'); box.className = 'pr-live';
    frame = document.createElement('iframe'); frame.title = 'The block editor and the page'; box.append(frame);
    pointer = document.createElement('div'); pointer.className = 'pr-pointer'; pointer.hidden = true;
    pointer.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l16 11-7 1.5 4 7.5-3 1.5-4-7.5L5 21z" fill="#fff" stroke="#24133b" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    $('#prStage').append(box, pointer);
    ready = new Promise((r) => {
      frame.addEventListener('load', () => { const w = frame.contentWindow, go = () => { live = w.BE; r(); }; if (w.BE?.ready) go(); else w.BE.onready = go; }, { once: true });
    });
    frame.srcdoc = EDITOR_HTML;
    return ready;
  }
  // where the hint points: the first thing it would make glow that is on screen, in the editor or on the page
  function target(step) {
    let sel = null; const glow = live.glow; live.glow = (s) => { sel = s; };
    try { as(() => step.show?.()); } finally { live.glow = glow; }
    if (!sel) return null;
    const doc = frame.contentDocument, page = live.state.page;
    for (const [d, box] of [[doc, frame], [page, doc.querySelector('#pageFrame')]]) {
      const el = [...(d?.querySelectorAll(sel) ?? [])].find((e) => e.getClientRects().length);
      if (el) { const f = box.getBoundingClientRect(), outer = box === frame ? { left: 0, top: 0 } : frame.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: outer.left + f.left + r.left + Math.min(r.width / 2, 40), y: outer.top + f.top + r.top + r.height / 2 }; }
    }
    return null;
  }
  async function play(f, me) {
    const step = LESSONS[f.li].steps[f.n], at = target(step), s = $('#prStage').getBoundingClientRect(), to = at && { x: at.x - s.left, y: at.y - s.top };
    if (to) {
      const from = pointer.hidden ? { x: s.width * .9, y: s.height * .9 } : { x: parseFloat(pointer.style.left), y: parseFloat(pointer.style.top) };
      pointer.hidden = false;
      await pointer.animate([{ left: from.x + 'px', top: from.y + 'px' }, { left: to.x + 'px', top: to.y + 'px' }], { duration: POINTER_MS, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }).finished;
      Object.assign(pointer.style, { left: to.x + 'px', top: to.y + 'px' });
      if (me !== run) return;
      pointer.animate([{ transform: 'scale(1)' }, { transform: 'scale(.8)' }, { transform: 'scale(1)' }], { duration: PRESS_MS });
      sound.boing(520, .15, .06); await wait(PRESS_MS);
    }
    if (me !== run) return;
    // the blocks are drawn again after a change, so an input is known by its block, not by the element
    const doc = frame.contentDocument, said = (i) => i.dataset.id ?? i.dataset.attr ?? '', before = new Map([...doc.querySelectorAll('input')].map((i) => [said(i), i.value]));
    as(() => step.doIt());
    // words that changed are typed in, letter by letter
    for (const i of doc.querySelectorAll('input')) {
      const text = i.value; if (!text || before.get(said(i)) === text) continue;
      for (let k = 1; k <= text.length && me === run; k++) { i.value = text.slice(0, k); await wait(TYPE_MS); }
      i.value = text; await wait(REST_MS);
    }
  }
  return {
    can: (L) => !L.demos,
    snap: () => BE.dump(),
    async show(f, animate) {
      const me = ++run;
      if (!f) { if (box) box.hidden = true; if (pointer) pointer.hidden = true; return; }
      await mount(); if (me !== run) return;
      box.hidden = false; live.on = null; live.gate(gateAt(f.li, true)); live.load(animate ? f.before : f.after);
      if (!animate) { pointer.hidden = true; return; }
      await wait(REST_MS); if (me === run) play(f, me);
    },
  };
})();
