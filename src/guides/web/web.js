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
const upTo = (concept) => { const k = LESSONS.findIndex((L) => L.teaches?.includes(concept)); return k < 0 || k <= cur || !!store.done[LESSONS[k].id]; };
function gateEditor() {
  if (!BE) return;
  BE.gate({
    kinds: KIND_IDS.filter(upTo),
    views: ['blocks', upTo('tags') && 'tags', upTo('html') && 'html'].filter(Boolean),
    moving: upTo('moving'), colours: upTo('colours'), pages: upTo('pages'), title: upTo('title'),
  });
}
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
// Presenter mode plays each step's "Do it for me", then shows this: a picture of the editor and the page.
const prSnapshot = (li) => (LESSONS[li].demos || !BE ? null : { k: 'web', li, html: BE.snapshot() });
// A copy of the website as each exercise's mission begins, so Start over can put it back. Kept until a step is done.
function webMission(L) {
  if (!BE || (store.steps[L.id] ?? []).some(Boolean)) return;
  store.web1Start = { ...store.web1Start, [L.id]: BE.dump() }; save();
}
function webStartOver(L) {
  const was = store.web1Start?.[L.id];
  if (was && BE) { BE.load(was); BE.do.mode('edit'); gateEditor(); store.web1 = BE.dump(); }
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
