# Presenter mode: a course as a minimal, full-screen slide show, for recording videos with a voice-over and a head shot.
# Not a screencast of the app: one idea per frame. For a lesson: its jelly word, its story, its picture, each point,
# then for every step of the mission: the task, the terminal (the command typed key by key, then its result), and the
# file tree if anything changed. Then the jelly it earns. The course ends with its jar filling up.
#
# Open a guide with ?present (16:9, the right-hand side kept clear for a head shot), ?present=tall (9:16 for Shorts,
# the bottom kept clear), or add &face=none to use the whole frame, or &lesson=<id> for just one lesson (a Short).
# Or press Shift+P in any guide: 16:9 at once (no reload), Shift+P again for 9:16, and again to go back to the guide.
#   Space or →  next frame      ←  previous frame      Home / End  first / last frame      M  sound on or off
#   Tab  hide or show the Overview's card (it can cover what the 3D scene is showing)
# A reload comes back to the same frame. Nothing is saved, so presenting never touches anyone's progress.
#
# Small screens (under 900 × 560) can't run the guide, so its gate offers the same show as a mobile slideshow: 9:16
# held upright or 16:9 sideways, no space kept for a head shot, tap the right of the screen (or swipe left) to go on and
# the left to go back, ✕ back to the gate.
#
# How: when presenting starts, the whole course is run once, silently, in the hidden app, using each lesson's `demo`
# list. Every frame is recorded from what really happened (the prompt, the output, the file tree before and after).
# Presenting then just shows the recorded frames, so ← and → are instant and always agree.
# Run by shelly-patch.py, after jar-patch.py.

# ---------- presenting never reads or writes saved progress ----------
rep("const KEY = ", """// Presenter mode (see present-patch.py): ?present in the address, or switched on with Shift+P for this tab.
let PRESENT = (() => { let s = null; try { s = sessionStorage.getItem('jelly.present'); } catch {} const q = new URLSearchParams(location.search).get('present'); return q !== null ? (q === 'tall' ? 'tall' : 'wide') : s; })();
const KEY = """)
rep("""const store = (() => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
})();""", """const store = (() => {
  if (PRESENT) return { muted: true };
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
})();""")
rep("const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} };", "const save = () => { if (PRESENT) return; try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} };")
rep("  try { localStorage.setItem('jelly.courses', JSON.stringify(all)); } catch {}", "  if (!PRESENT) try { localStorage.setItem('jelly.courses', JSON.stringify(all)); } catch {}")
rep("const jarStore = () => { try { return JSON.parse(localStorage.getItem('jelly.collection')) || {}; } catch { return {}; } };",
    "let presentJars = {};\nconst jarStore = () => { if (PRESENT) return presentJars; try { return JSON.parse(localStorage.getItem('jelly.collection')) || {}; } catch { return {}; } };")
rep("  try { localStorage.setItem('jelly.collection', JSON.stringify(all)); } catch {}", "  if (PRESENT) presentJars = all; else try { localStorage.setItem('jelly.collection', JSON.stringify(all)); } catch {}")

rep('/* ---------------- panels + navigation ---------------- */', r'''/* ---------------- presenter mode: recording the frames ---------------- */
// A pretend clock while recording: things that wait (a browser's trip, ping's replies, a choice card's answer) happen
// at once and in order, so recording a whole course takes seconds, not minutes. The real timers come back afterwards.
const CLOCK = { now: 0, timers: new Map(), id: 1, real: null };
function clockOn() {
  CLOCK.real = { setTimeout: window.setTimeout, clearTimeout: window.clearTimeout, setInterval: window.setInterval, clearInterval: window.clearInterval };
  const add = (fn, ms, a, every) => { const id = CLOCK.id++; CLOCK.timers.set(id, { at: CLOCK.now + Math.max(0, +ms || 0), fn, a, every }); return id; };
  window.setTimeout = (fn, ms, ...a) => add(fn, ms, a, 0);
  window.setInterval = (fn, ms, ...a) => add(fn, ms, a, Math.max(1, +ms || 0));
  window.clearTimeout = window.clearInterval = (id) => { CLOCK.timers.delete(id); };
}
function clockOff() { Object.assign(window, CLOCK.real); CLOCK.timers.clear(); }
// Let promises settle, then run every timer due in the next few pretend seconds, earliest first.
async function prFlush(ms = 3000) {
  const end = CLOCK.now + ms;
  for (let n = 0; n < 3000; n++) {
    for (let k = 0; k < 20; k++) await null;
    let next = null;
    for (const e of CLOCK.timers) if (e[1].at <= end && (!next || e[1].at < next[1].at)) next = e;
    if (!next) return;
    const [id, t] = next; CLOCK.now = t.at;
    if (t.every) t.at += t.every; else CLOCK.timers.delete(id);
    if (typeof t.fn === 'function') t.fn(...t.a);
  }
}
// Jelly Web's browser, as a frame needs it (null in guides without one, or before the first page).
const prBrowser = () => typeof BW === 'undefined' || !BW.url ? null : {
  url: BW.url, view: BW.view, lock: bwLock.className, lockHtml: bwLock.innerHTML, journey: bwJourney.innerHTML, pop: bwPop.hidden ? '' : bwPop.innerHTML,
  page: BW.view === 'page' ? bwFrame.srcdoc : BW.view === 'source' ? $('#bwSource').innerHTML : $('#bwBoxes').innerHTML,
};
// A page in the browser loads for real (it's a frame), so wait for it before the next step uses it.
async function prLoaded(before) {
  if (typeof bwFrame === 'undefined' || BW.view !== 'page' || bwFrame.srcdoc === before) return;
  await new Promise((r) => { const done = () => { bwFrame.removeEventListener('load', done); r(); }; bwFrame.addEventListener('load', done); CLOCK.real.setTimeout.call(window, done, 1500); });
  await prFlush();
}
// Jelly Web has a terminal and an editor in one place: switch to the one the next action needs.
const prTool = (t) => { const tab = document.querySelector(`.wtab[data-tool=${t}]`); if (tab && WB.tool !== t) tab.click(); };

// Run every lesson's demo once, silently, and record a frame for each thing worth a whole screen.
// A demo is a list of actions. A string is typed in the terminal ('@tab:', '@up', '@enter', '@ctrlc' press a key;
// '@type:' and '@key:' work nano). An object does something else:
//   { click: selector }   press a button (GitHub's, the browser's)    { edit: [from, to] }  change the open file
//   { visit: address }    type an address in the browser bar          { link: text }        click a link in the page
//   { choose: n | 'good' | 'bad' }   pick a choice card      { wait: ms }  let time pass (here it already does: see prFlush)
async function prCapture() {
  const frames = [{ k: 'intro' }], muted = sound.muted, ok = [];
  // the overview (Jelly Shell, Git and Web): one frame per step of the 3D town, right after the intro
  if (PR.townGo && PANELS.some((p) => p.id === 'whole')) TOWN_STEPS.forEach((_, n) => frames.push({ k: 'whole', n }));
  sound.muted = true; store.done = {}; store.steps = {};
  clockOn();
  for (const [li, L] of LESSONS.entries()) {
    frames.push({ k: 'title', li }, { k: 'story', li });
    if (L.visual) frames.push({ k: 'visual', li });
    L.points.forEach((_, n) => frames.push({ k: 'point', li, n }));
    if (!L.demo?.length) continue;
    // guides whose lessons build on each other (Git, Web) carry on from the lesson before, like a child would
    go(L.id); if (FRESH_SANDBOX || li === 0) resetSandbox(); setPhase('mission'); renderMap(); await prFlush();
    let shown = -1;
    for (const a of L.demo) {
      const st = store.steps[L.id] ?? [], i = L.steps.findIndex((x, k) => !st[k]);
      if (i >= 0 && i !== shown) { frames.push({ k: 'task', li, n: i }); shown = i; }
      const mapHtml = () => $('#map')?.innerHTML ?? '', map0 = mapHtml(), web0 = prBrowser(), page0 = typeof bwFrame === 'undefined' ? '' : bwFrame.srcdoc, prompt = promptText(), lines = termOut.children.length;
      const out = (skip = 1) => [...termOut.children].slice(lines + skip).map((e) => e.outerHTML).join('');
      let term = null, visited = false;
      if (typeof a === 'object') {
        if (a.click) { const el = $(a.click); frames.push({ k: 'click', li, label: a.label ?? el.getAttribute('aria-label') ?? el.textContent.trim() }); el.click(); }
        else if (a.edit) { prTool('edit'); const before = edText.value; edText.value = before.replace(a.edit[0], a.edit[1]); edText.dispatchEvent(new Event('input')); frames.push({ k: 'edit', li, file: ED.path, before, after: edText.value }); }
        else if (a.visit) { bwUrl.value = a.visit; navigate(a.visit, 'bar'); visited = true; }
        else if (a.link) { const l = [...bwFrame.contentDocument.querySelectorAll('a')].find((x) => x.textContent.includes(a.link)); frames.push({ k: 'click', li, label: l.textContent, link: true }); l.click(); }
        else if ('choose' in a) { const c = L.steps[i].choices, n = a.choose === 'good' ? c.findIndex((x) => x.good) : a.choose === 'bad' ? c.findIndex((x) => !x.good) : a.choose; frames.push({ k: 'choice', li, n: i, pick: n }); document.querySelectorAll('.choice')[n].click(); }
      } else if (a.startsWith('@type:')) { nanoText.value = a.slice(6).replace(/\\n/g, '\n'); nanoText.dispatchEvent(new Event('input')); frames.push({ k: 'nano', li, file: $('#nanoName').textContent, text: nanoText.value, typed: true }); }
      else if (a.startsWith('@key:')) {
        const k = a.slice(5), ctrl = /^Control\+/.test(k), before = { file: $('#nanoName').textContent, text: nanoText.value };
        nanoText.dispatchEvent(new KeyboardEvent('keydown', { key: ctrl ? k.slice(8) : k, ctrlKey: ctrl, bubbles: true, cancelable: true }));
        frames.push({ k: 'nano', li, ...before, key: ctrl ? `Ctrl+${k.slice(8).toUpperCase()}` : k.toUpperCase(), msg: $('#nanoMsg').textContent });
      } else if (/^@(tab:|up$|enter$|ctrlc$)/.test(a)) {
        // a special key in the terminal: Tab completes, ↑ brings back the last command, Enter runs what is typed, Ctrl+C stops
        prTool('term');
        const typed = a.startsWith('@tab:') ? a.slice(5) : a === '@up' ? '' : termIn.value, key = { '@up': '↑', '@enter': 'Enter', '@ctrlc': 'Ctrl+C' }[a] ?? 'Tab';
        termIn.value = typed;
        if (key === 'Tab') completeTab(); else if (key === '↑') recall(-1); else if (key === 'Enter') submit(); else ctrlC();
        term = { k: 'term', li, prompt, cmd: typed, key, after: key === 'Tab' || key === '↑' ? termIn.value : null, skip: key === 'Enter' ? 1 : 0 };
      } else { prTool('term'); termIn.value = a; submit(); term = { k: 'term', li, prompt, cmd: a, skip: 1 }; }
      await prFlush(); await prLoaded(page0);
      if (term && typeof NANO !== 'undefined' && NANO.open && !a.startsWith('@')) frames.push({ ...term, out: '' }, { k: 'nano', li, file: $('#nanoName').textContent, text: nanoText.value });
      else if (term) frames.push({ ...term, out: out(term.skip) });
      if (typeof BW === 'undefined') renderMap(); // Web's renderMap reloads the page; everywhere else it just redraws the tree
      if (mapHtml() !== map0) frames.push({ k: 'files', li, before: map0, after: mapHtml() });
      const web = prBrowser();
      if (web && (visited || JSON.stringify(web) !== JSON.stringify(web0))) frames.push({ k: 'browser', li, ...web, typed: visited });
    }
    if (G.review === L.id) ok.push(L.id);
    G.review = null; store.done[L.id] = true; paintProgress();
  }
  clockOff();
  frames.push({ k: 'jar' });
  sound.muted = muted;
  document.documentElement.dataset.prOk = ok.length; // how many demos really finished their mission, for tests
  document.documentElement.dataset.prDemos = LESSONS.filter((L) => L.demo?.length).length;
  return frames;
}

/* ---------------- presenter mode: showing a frame ---------------- */
const PR = { i: 0, frames: [], typing: null, jelly: null };
function presentGo(i) {
  if (!PR.frames.length) return; // still recording
  i = Math.max(0, Math.min(PR.frames.length - 1, i));
  if (PR.typing) { PR.typing.skip = true; return; } // a press while typing finishes the typing at once
  const forward = i === PR.i + 1;
  PR.i = i; $('#prBar').style.width = `${(i + 1) / PR.frames.length * 100}%`;
  try { sessionStorage.setItem('jelly.presentBeat.' + KEY, i); } catch {} // a reload comes back to this frame
  prShow(PR.frames[i], forward);
}
function prShow(f, animate) {
  const L = LESSONS[f.li], stage = $('#prStage'), body = $('#prBody');
  stage.dataset.k = f.k; stage.style.setProperty('--c', L?.color ?? '#ff4d6d');
  if (!$('#jarBox').hidden) closeJar();
  $('#prJelly').hidden = f.k !== 'title' && f.k !== 'intro';
  $('#prTown').hidden = f.k !== 'whole';
  const label = (t) => `<div class="pr-label">${t}</div>`;
  body.innerHTML = {
    whole: () => `<div class="pr-town-card">${label(`Overview · ${f.n + 1} of ${TOWN_STEPS.length}`)}<div class="pr-h">${esc(TOWN_STEPS[f.n].who)}</div><p class="pr-big">${esc(TOWN_STEPS[f.n].text.replace(/ Press Next[^.]*\./, ''))}</p></div>`,
    intro: () => `<div class="pr-intro">${label(esc(COURSE.title))}<h1>${$('#p-welcome h1').innerHTML}</h1></div>`,
    title: () => `<div class="pr-title">${label(`Magic word ${f.li + 1} of ${LESSONS.length}`)}<div class="pr-name">${esc(L.name)}</div><div class="pr-stands">${esc(L.stands)}</div></div>`,
    story: () => `${label(esc(L.word))}<h2 class="pr-h">${esc(L.title)}</h2><p class="pr-big">${L.why}</p>`,
    visual: () => `<div class="pr-visual">${L.visual}</div>`,
    point: () => `${label(`Remember it · ${f.n + 1} of ${L.points.length}`)}<p class="pr-big">${L.points[f.n]}</p>`,
    task: () => `${label(`Mission · step ${f.n + 1} of ${L.steps.length}`)}${L.steps[f.n].hat ? `<b class="hat-chip ${L.steps[f.n].hat} pr-hat">${L.steps[f.n].hat} hat</b>` : ''}<p class="pr-big">${L.steps[f.n].t}</p>`,
    click: () => `${label(f.link ? 'Click the link' : 'Click')}<div class="pr-click"><span class="${f.link ? 'pr-link' : 'pr-btn'}">${esc(f.label)}</span></div>`,
    edit: () => `${label(`Change ${esc(f.file.split('/').pop())}`)}<pre class="pr-code">${prChange(f.before, f.after)}</pre>`,
    browser: () => `<div class="pr-browser"><div class="pr-bw-top"><span class="${esc(f.lock)}">${f.lockHtml}</span><span class="pr-url"></span></div><div class="bw-journey pr-journey">${f.journey}</div><div class="pr-page">${f.view === 'page' ? `<iframe sandbox="" title="The web page" srcdoc="${esc(f.page)}"></iframe>` : f.view === 'source' ? `<pre class="bw-source">${f.page}</pre>` : `<div class="bw-boxes">${f.page}</div>`}${f.pop ? `<div class="bw-pop pr-pop">${f.pop}</div>` : ''}</div></div>`,
    choice: () => { const st = L.steps[f.n], c = st.choices[f.pick]; return `${label(`Mission · step ${f.n + 1} of ${L.steps.length}`)}<p class="pr-q">${st.t}</p><div class="pr-choices">${st.choices.map((x, k) => `<div class="pr-choice${k === f.pick ? (x.good ? ' good' : ' bad') : ''}">${x.c}</div>`).join('')}</div><p class="pr-say">${c.say}</p>`; },
    term: () => `<div class="pr-term term-body"><div class="ln"><span class="p">${esc(f.prompt)}</span> <span class="pr-typed"></span><span class="pr-caret"></span></div><div class="pr-out">${f.out}</div></div>${f.key ? `<div class="pr-key pr-termkey">${esc(f.key)}</div>` : ''}`,
    nano: () => `<div class="pr-nano"><div class="nano-top"><span>GNU nano</span><b>${esc(f.file)}</b><span></span></div><pre class="pr-nano-text"></pre><div class="nano-msg">${esc(f.msg ?? '')}</div>${f.key ? `<div class="pr-key">${esc(f.key)}</div>` : ''}</div>`,
    files: () => `${label(f.after.includes('class="gm"') ? 'The git map' : 'The file tree')}<div class="pr-files map-list">${prDiff(f.before, f.after)}</div>`,
    jar: () => '',
  }[f.k]();
  // the town only draws while it is on screen; moved out of the hidden app, it is told so directly
  if (PR.town) { PR.town.active = f.k === 'whole'; }
  if (f.k === 'whole') { if ($('#town').parentNode !== $('#prTown')) $('#prTown').append($('#town')); PR.town.resize(); PR.townGo(f.n); }
  if (f.k === 'jar') { store.done = Object.fromEntries(LESSONS.map((x) => [x.id, true])); paintProgress(); openJar(COURSE.id); }
  if (f.k === 'title' || f.k === 'intro') prJelly(f.k === 'intro' ? COURSE.title.replace(/^Jelly /, '').toLowerCase() : L.word, L?.color);
  if (f.k === 'nano') $('.pr-nano-text').textContent = f.text;
  if (f.k === 'term') $('.pr-typed').textContent = f.after ?? f.cmd;
  if (f.k === 'browser') $('.pr-url').textContent = f.url;
  prFit(body);
  if (!animate || REDUCED) return;
  body.animate([{ opacity: 0, transform: 'translateY(26px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
  if (f.k === 'term') prType($('.pr-typed'), f.cmd, $('.pr-out'), f);
  if (f.k === 'nano' && f.typed) prType($('.pr-nano-text'), f.text);
  if (f.k === 'files') body.querySelectorAll('.pr-new').forEach((r, n) => r.animate([{ background: '#ffc61a', transform: 'scale(1.04)' }, { transform: 'none' }], { duration: 900, delay: 250 + n * 120 }));
  if (f.k === 'click') { sound.boing(520, .15, .06); $('.pr-click > span').animate([{ transform: 'none' }, { transform: 'translateY(.12em) scale(.94)', boxShadow: 'none' }, { transform: 'none' }], { duration: 420, delay: 450 }); }
  if (f.k === 'edit' && $('.pr-code ins')) prType($('.pr-code ins'), $('.pr-code ins').textContent);
  if (f.k === 'browser' && f.typed) prType($('.pr-url'), f.url, $('.pr-page'));
  if (f.k === 'choice') { $('.pr-choice.good, .pr-choice.bad')?.animate([{ transform: 'scale(.9)' }, { transform: 'scale(1.05)' }, { transform: 'none' }], { duration: 450, delay: 300, easing: 'cubic-bezier(.3,1.5,.5,1)' }); $('.pr-say').animate([{ opacity: 0 }, { opacity: 0, offset: .5 }, { opacity: 1 }], { duration: 1200 }); }
}
// Keys typed one at a time, then the result appears.
async function prType(el, text, then, f) {
  const t = PR.typing = { skip: false }, key = document.querySelector('.pr-termkey');
  if (then) then.hidden = true;
  if (key) key.hidden = true;
  el.textContent = '';
  for (const ch of text) { if (t.skip) break; el.textContent += ch; sound.blip(); await new Promise((r) => setTimeout(r, 45 + Math.random() * 60)); }
  el.textContent = text;
  // then the special key is pressed: its keycap pops up and the line changes (Tab completes it, ↑ brings one back)
  if (key) {
    if (!t.skip) await new Promise((r) => setTimeout(r, 300));
    key.hidden = false; key.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.3,1.5,.5,1)' }); sound.boing(520, .15, .06);
    if (f?.after != null) el.textContent = f.after;
  }
  if (then) { await new Promise((r) => setTimeout(r, t.skip ? 0 : 280)); then.hidden = false; then.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 }); }
  PR.typing = null;
}
// The file tree after the step, with rows that are new or changed marked.
// Jelly Git's map keeps its four zones, with its changed rows marked the same way.
function prDiff(before, after) {
  const parse = (h) => { const t = document.createElement('template'); t.innerHTML = h; return t.content; }, rows = (c) => [...c.querySelectorAll('.mrow,.grow')], key = (r) => r.dataset.path ?? r.dataset.k ?? r.textContent;
  const old = new Map(rows(parse(before)).map((r) => [key(r), r.outerHTML])), now = parse(after);
  rows(now).forEach((r) => { if (old.get(key(r)) !== r.outerHTML) r.classList.add('pr-new'); });
  const gm = now.querySelector('.gm');
  if (gm) { gm.querySelectorAll('button').forEach((b) => b.remove()); return gm.outerHTML; }
  return rows(now).map((r) => r.outerHTML).join('');
}
// The open file with this step's change: the new text marked (typed in when the frame shows), the removed text struck out.
// Only the lines around the change, so it stays big enough to read.
function prChange(before, after) {
  let a = 0; while (a < before.length && a < after.length && before[a] === after[a]) a++;
  let z = 0; while (z < before.length - a && z < after.length - a && before[before.length - 1 - z] === after[after.length - 1 - z]) z++;
  const pre = after.slice(0, a).split('\n').slice(-5).join('\n'), post = after.slice(after.length - z).split('\n').slice(0, 5).join('\n');
  const gone = before.slice(a, before.length - z), [, lead, added, trail] = after.slice(a, after.length - z).match(/^(\s*)([\s\S]*?)(\s*)$/); // spaces and line breaks around the change aren't marked
  return esc(pre) + (gone.trim() ? `<del>${esc(gone)}</del>` : '') + esc(lead) + (added ? `<ins>${esc(added)}</ins>` : '') + esc(trail) + esc(post);
}
// The jelly word on the title frames: its own full-size 3D stage, made the first time it is needed.
function prJelly(word, color) {
  if (!booted) return;
  if (!PR.jelly) {
    PR.jelly = new JellyStage($('#prJelly'), { word, size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.1, lookY: .55 });
    // no grid floor on a presenter frame: an invisible one that only catches the letters' shadows
    PR.jelly.scene.children.find((o) => o.isMesh && o.geometry.type === 'PlaneGeometry').material = new THREE.ShadowMaterial({ opacity: .12 });
  }
  PR.jelly.opts.colorOffset = Math.max(0, JELLY.indexOf(color)); PR.jelly.setWord(word);
}
// Big text shrinks until it fits its frame.
function prFit(el) {
  // a lesson's picture is drawn for the small card, so it is zoomed up to fill the frame, then down until it fits
  for (const v of el.querySelectorAll('.pr-visual')) {
    let z = Math.min(3, (el.clientWidth * .9) / Math.max(1, v.scrollWidth)); v.style.zoom = z;
    while ((el.scrollHeight > el.clientHeight + 1 || v.getBoundingClientRect().width > el.clientWidth) && z > .6) { z -= .1; v.style.zoom = z; }
  }
  for (const t of el.querySelectorAll('.pr-big,.pr-files,.pr-term,.pr-code')) {
    let s = 1; t.style.setProperty('--s', 1);
    while (el.scrollHeight > el.clientHeight + 1 && s > .5) { s -= .05; t.style.setProperty('--s', s.toFixed(2)); }
  }
}

// Start presenting: hide the app, record the frames, show the first (or the one a reload came back to).
// Runs at start-up for ?present, or straight away from Shift+P with no reload: inside claude.ai the page can't see
// its address, so a keypress is the only way in there.
async function presentStart(shape, slides = false) {
  PRESENT = shape;
  store.done = {}; store.steps = {}; store.phase = {}; sound.muted = true; // fresh, and nothing is saved from here on
  const face = slides ? 'none' : new URLSearchParams(location.search).get('face') ?? 'right';
  document.documentElement.classList.add('present', `present-${shape}`, `face-${face}`);
  document.documentElement.classList.toggle('slides', slides);
  document.body.insertAdjacentHTML('beforeend', '<div class="pr-stage" id="prStage"><canvas id="prJelly" hidden></canvas><div class="pr-town" id="prTown" hidden></div><div class="pr-body" id="prBody"></div><div class="pr-bar"><i id="prBar"></i></div>' + (slides ? '<button class="pr-close" id="prClose" type="button" aria-label="Close the slideshow">✕</button>' + (slidesHinted() ? '' : '<div class="pr-hint" id="prHint">Tap the right side to go on, the left to go back</div>') : '') + '</div>');
  if (slides) slideControls();
  if (!booted) boot();
  $('#prBody').innerHTML = '<div class="pr-label">Getting the show ready…</div>';
  PR.frames = await prCapture();
  // &lesson=<id>: just that lesson's frames, for a Short
  const only = LESSONS.findIndex((L) => L.id === new URLSearchParams(location.search).get('lesson'));
  if (only >= 0) PR.frames = PR.frames.filter((f) => f.li === only);
  document.documentElement.dataset.prFrames = PR.frames.map((f) => f.k).join(' '); document.documentElement.dataset.prLessons = PR.frames.map((f) => f.li ?? -1).join(' '); document.documentElement.dataset.prKey = KEY; // for tests
  let at = 0; try { at = +sessionStorage.getItem('jelly.presentBeat.' + KEY) || 0; } catch {}
  PR.i = -1; presentGo(at);
}
// The presenter's keys come first, before the guide's own.
addEventListener('keydown', (e) => {
  // Shift+P: 16:9 presenting, then 9:16, then back to the guide (with its saved progress, untouched)
  if (e.key === 'P' && e.shiftKey && !e.target.closest?.('input:not([readonly]),textarea')) {
    e.preventDefault(); e.stopImmediatePropagation();
    const next = !PRESENT ? 'wide' : PRESENT === 'wide' ? 'tall' : null;
    try { if (next) sessionStorage.setItem('jelly.present', next); else sessionStorage.removeItem('jelly.present'); } catch {}
    if (!PRESENT) return presentStart('wide');
    if (next === 'tall') { PRESENT = 'tall'; document.documentElement.classList.replace('present-wide', 'present-tall'); return prShow(PR.frames[PR.i], false); }
    const u = new URL(location.href);
    if (u.searchParams.has('present')) { u.searchParams.delete('present'); location.replace(u); } else location.reload();
    return;
  }
  if (!PRESENT || !e.isTrusted) return;
  const fwd = e.key === ' ' || e.key === 'ArrowRight' || e.key === 'PageDown', back = e.key === 'ArrowLeft' || e.key === 'PageUp';
  e.preventDefault(); e.stopImmediatePropagation();
  if (fwd || back) presentGo(PR.i + (fwd ? 1 : -1));
  else if (e.key === 'Home' || e.key === 'End') presentGo(e.key === 'Home' ? 0 : PR.frames.length - 1);
  else if (e.key === 'm' || e.key === 'M') sound.muted = !sound.muted;
  else if (e.key === 'Tab') $('#prStage').classList.toggle('pr-nocard');
}, true);

// The mobile slideshow: the gate's button starts it, and a reload of the same tab comes straight back to it.
const slideShape = () => innerWidth > innerHeight ? 'wide' : 'tall';
const slidesHinted = () => { try { return sessionStorage.getItem('jelly.slidesHinted'); } catch {} };
$('#slides').addEventListener('click', () => { try { sessionStorage.setItem('jelly.slides', '1'); } catch {} presentStart(slideShape(), true); });
function slideControls() {
  let down = null;
  addEventListener('pointerdown', (e) => { down = e.clientX; });
  addEventListener('pointerup', (e) => {
    if (down === null || e.target.closest('#prClose')) return;
    const dx = e.clientX - down; down = null;
    $('#prHint')?.remove(); try { sessionStorage.setItem('jelly.slidesHinted', '1'); } catch {}
    // a swipe goes the way the finger pushes; a tap goes by which side it lands on
    presentGo(PR.i + (Math.abs(dx) > 40 ? (dx < 0 ? 1 : -1) : e.clientX > innerWidth / 3 ? 1 : -1));
  });
  $('#prClose').addEventListener('click', () => { try { sessionStorage.removeItem('jelly.slides'); } catch {} location.reload(); });
  // turning the phone swaps 9:16 and 16:9
  addEventListener('resize', () => {
    if (slideShape() === PRESENT || !PR.frames.length) return;
    document.documentElement.classList.replace(`present-${PRESENT}`, `present-${slideShape()}`); PRESENT = slideShape(); prShow(PR.frames[PR.i], false);
  });
}

/* ---------------- panels + navigation ---------------- */''')

# Record the frames and show the first (or the one a reload came back to) once the page is ready.
# The overview's 3D town and its stepper, for presenter mode's overview frames.
rep("  const town = new Town($('#town'));", "  const town = PR.town = new Town($('#town'));")
rep("  const townGo = (i) => {", "  const townGo = PR.townGo = (i) => {")
# The 3D normally waits for a screen at least 900 wide; a presenter's 9:16 window is narrower but wants it.
rep("const roomy = () => innerWidth >= 900 && innerHeight >= 560;", "const roomy = () => !!PRESENT || (innerWidth >= 900 && innerHeight >= 560);")
# (at the very end of start-up, after the 3D has booted: the page waits for its font part-way through starting)
rep("if (roomy()) boot();", "if (roomy()) boot();\nif (PRESENT) presentStart(PRESENT);\nelse if (!roomy() && (() => { try { return sessionStorage.getItem('jelly.slides'); } catch {} })()) presentStart(slideShape(), true);")

# ---------- the look: one big idea per frame ----------
rep('.side-foot{display:grid;gap:8px}', '''.side-foot{display:grid;gap:8px}
/* presenter mode: the app still runs every command, but is never drawn (no layout work, its 3D stages sleep);
   a full-screen frame sits on top */
.present .app,.present .toast,.present .flyer,.present .gate{display:none!important}
.present body,.present *{cursor:none!important}
.pr-stage{position:fixed;inset:0;z-index:70;background:#fff8ec;color:var(--ink);overflow:hidden;--u:1vmin;--pad:calc(6 * var(--u))}
.present-tall .pr-stage{--u:1.45vw}
.pr-stage[data-k=title],.pr-stage[data-k=intro]{background:#d4eeff}
.pr-town{position:absolute;inset:0}
.pr-town[hidden]{display:none}
.pr-town canvas{width:100%;height:100%;display:block}
.pr-stage[data-k=whole] .pr-body{justify-content:flex-end}
.pr-stage[data-k=browser]{background:#d4eeff}
.present-tall .pr-stage[data-k=whole] .pr-body{justify-content:flex-start}
.pr-town-card{background:#fffffff0;border:calc(.5 * var(--u)) solid var(--ink);border-radius:calc(2.4 * var(--u));box-shadow:0 var(--u) 0 var(--ink);padding:calc(2.4 * var(--u)) calc(3 * var(--u));display:grid;gap:var(--u);max-width:min(100%, calc(62 * var(--u)))}
.pr-town-card .pr-h{font-size:calc(3.6 * var(--u))}
.pr-town-card .pr-big{font-size:calc(2.6 * var(--u) * var(--s, 1))}
.pr-stage[data-k=term],.pr-stage[data-k=nano]{background:#1b0f2c}
.pr-body{position:absolute;inset:var(--pad);display:flex;flex-direction:column;justify-content:center;gap:calc(2.4 * var(--u));z-index:1}
.face-right.present-wide .pr-body{right:31vw}
.face-right.present-tall .pr-body{bottom:30vh}
#prJelly{position:absolute;inset:0;width:100%;height:100%}
#prJelly[hidden]{display:none}
.pr-label{font-family:var(--mono);font-size:calc(2.4 * var(--u));letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft)}
.pr-h{font-family:var(--display);font-weight:400;font-size:calc(6 * var(--u));line-height:1.05;margin:0}
.pr-big{font-size:calc((5 * var(--u)) * var(--s, 1));line-height:1.3;margin:0;max-width:30ch;text-wrap:pretty}
.pr-big code,.pr-big kbd{font-family:var(--mono);background:#24133b14;border-radius:.3em;padding:0 .25em}
.pr-stage[data-k=title] .pr-body,.pr-stage[data-k=intro] .pr-body{justify-content:flex-end}
.present-tall .pr-stage[data-k=title] .pr-body,.present-tall .pr-stage[data-k=intro] .pr-body{justify-content:flex-start}
.pr-name{font-family:var(--display);font-size:calc(7 * var(--u));line-height:1}
.pr-stands{font-family:var(--mono);font-size:calc(3.2 * var(--u));color:var(--ink-soft)}
.pr-intro h1{font-family:var(--display);font-weight:400;font-size:calc(9 * var(--u));line-height:1;margin:0}
.pr-intro h1 em{font-style:normal;color:var(--berry)}
.pr-visual{align-self:flex-start}
.present .jar-head{display:none}
.pr-stage .pr-term{flex:none;font-family:var(--mono);font-size:calc((4.2 * var(--u)) * var(--s, 1));line-height:1.45;color:#e8f6ec;background:none;padding:0;overflow:visible;cursor:none}
.pr-term .p{color:#7dff9b}
.pr-caret{display:inline-block;width:.6em;height:1.1em;vertical-align:-.15em;background:#7dff9b;margin-left:.1em;animation:pr-blink 1s steps(1) infinite}
@keyframes pr-blink{50%{opacity:0}}
.pr-out .ln{white-space:pre-wrap}
.pr-nano{font-family:var(--mono);font-size:calc(3.4 * var(--u));color:#e8fff0;display:grid;gap:calc(1 * var(--u));position:relative}
.pr-nano .nano-top{display:flex;justify-content:space-between;gap:1em;background:#d9ffe6;color:#0f2a1c;padding:.2em .6em;font-weight:700;font-size:1em}
.pr-nano-text{margin:0;font:inherit;min-height:30vh;white-space:pre-wrap}
.pr-nano .nano-msg{color:#ffd36b;font-size:1em}
.pr-termkey{position:relative!important;right:auto!important;bottom:auto!important;align-self:flex-start;margin-top:calc(2 * var(--u))}
.pr-key{position:absolute;right:0;bottom:-calc(1 * var(--u));font-size:calc(4 * var(--u));background:#fff;color:var(--ink);border:calc(.5 * var(--u)) solid var(--ink);border-radius:calc(1.4 * var(--u));padding:.2em .6em;box-shadow:0 calc(.8 * var(--u)) 0 var(--ink);font-weight:700}
.pr-stage .pr-files{flex:none;font-size:calc((3.2 * var(--u)) * var(--s, 1));background:#fff;border:calc(.5 * var(--u)) solid var(--ink);border-radius:calc(2.4 * var(--u));padding:.8em 1em;box-shadow:0 calc(1 * var(--u)) 0 var(--ink);overflow:visible;align-self:flex-start;min-width:50%}
.pr-files .pr-new{background:#fff3b8;outline:calc(.3 * var(--u)) solid #ffc61a}
.pr-files .mrow .lock-ico{width:1.9em;height:1.25em}
.pr-hat{align-self:flex-start;font-size:calc(2.6 * var(--u))}
.pr-click{display:flex;align-items:center;gap:calc(2 * var(--u))}
.pr-btn,.pr-link{font-size:calc(5 * var(--u));line-height:1.2;max-width:100%}
.pr-btn{font-family:var(--display);background:var(--lemon);border:calc(.5 * var(--u)) solid var(--ink);border-radius:calc(2 * var(--u));padding:.35em .8em;box-shadow:0 calc(1 * var(--u)) 0 var(--ink)}
.pr-link{color:#1a3fd6;text-decoration:underline;text-decoration-thickness:.08em;font-family:Verdana,sans-serif}
.pr-stage .pr-code{margin:0;font-family:var(--mono);font-size:calc(3.1 * var(--u) * var(--s, 1));line-height:1.45;white-space:pre-wrap;background:#fff;border:calc(.5 * var(--u)) solid var(--ink);border-radius:calc(2 * var(--u));padding:.7em 1em;box-shadow:0 calc(1 * var(--u)) 0 var(--ink)}
.pr-code ins{text-decoration:none;background:#fff3b8;outline:calc(.25 * var(--u)) solid #ffc61a;border-radius:.15em}
.pr-code del{background:#ffe1e7;color:#b0002a}
.pr-browser{display:flex;flex-direction:column;background:#fff;border:calc(.5 * var(--u)) solid var(--ink);border-radius:calc(2 * var(--u));box-shadow:0 calc(1 * var(--u)) 0 var(--ink);overflow:hidden;flex:1;min-height:0}
.pr-bw-top{display:flex;align-items:center;gap:calc(1.4 * var(--u));padding:calc(1.2 * var(--u)) calc(1.6 * var(--u));background:#eef0f6;border-bottom:calc(.3 * var(--u)) solid #24133b22}
.pr-bw-top .bw-lock{height:auto;font-size:calc(2 * var(--u));padding:.2em .7em}
.pr-url{flex:1;font-family:var(--mono);font-size:calc(3.2 * var(--u));background:#fff;border:calc(.3 * var(--u)) solid var(--ink);border-radius:999px;padding:.15em .8em;min-height:1.5em}
.pr-journey{zoom:1.8;min-height:0}
.present-tall .pr-journey{zoom:1.2}
.pr-page{position:relative;flex:1;min-height:0;display:flex}
.pr-page iframe{border:0;width:100%;flex:1;zoom:1.6}
.present-tall .pr-page iframe{zoom:1.2}
.pr-page .bw-source,.pr-page .bw-boxes{flex:1;margin:0;overflow:hidden;font-size:calc(2.4 * var(--u));padding:calc(1.6 * var(--u))}
.pr-page .pr-pop{position:absolute;inset:auto calc(2 * var(--u)) calc(2 * var(--u)) auto;max-width:70%;font-size:calc(2.4 * var(--u))}
.pr-q{font-size:calc(4 * var(--u));line-height:1.3;margin:0;max-width:34ch}
.pr-q .addr{font-family:var(--mono)}
.pr-choices{display:grid;gap:calc(1.2 * var(--u))}
.pr-choice{font-size:calc(3 * var(--u));border:calc(.4 * var(--u)) solid #24133b33;border-radius:calc(1.6 * var(--u));padding:.4em .8em;background:#fff;color:#24133b99}
.pr-choice.good{border-color:var(--ink);background:#d8f6e4;color:var(--ink)}
.pr-choice.bad{border-color:var(--ink);background:#ffe1e7;color:var(--ink)}
.pr-say{font-size:calc(3 * var(--u));line-height:1.35;margin:0;max-width:40ch}
.pr-stage .pr-files:has(.gm){zoom:1.7;font-size:1rem;padding:.4em;min-width:0}
.present-tall .pr-stage .pr-files:has(.gm){zoom:1.25}
/* Tab hides the Overview's card, so it never covers what the scene is showing */
.pr-town-card{transition:opacity .25s,transform .25s}
.pr-nocard .pr-town-card{opacity:0;transform:translateY(calc(2 * var(--u)))}
.pr-bar{position:absolute;left:0;right:0;bottom:0;height:calc(.6 * var(--u));background:#24133b14;z-index:2}
.pr-bar i{display:block;height:100%;width:0;background:var(--c, #ff4d6d);transition:width .3s}
.pr-stage[data-k=term] .pr-bar,.pr-stage[data-k=nano] .pr-bar{background:#ffffff14}
/* the mobile slideshow: the whole stage takes the taps (nothing inside it is interactive), plus a close button and a first hint */
.slides .pr-stage{touch-action:pan-y;user-select:none;-webkit-user-select:none}
.slides .pr-stage>*:not(.pr-close),.slides .jarbox{pointer-events:none}
.slides .pr-stage *{cursor:default!important}
.slides .pr-body{top:calc(var(--pad) + 40px)} /* clear of the close button */
.pr-close{position:absolute;z-index:3;top:calc(10px + env(safe-area-inset-top,0px));right:calc(10px + env(safe-area-inset-right,0px));width:40px;height:40px;border-radius:50%;border:3px solid var(--ink);background:#fff;color:var(--ink);font:700 18px/1 var(--body,inherit);box-shadow:0 3px 0 var(--ink)}
.pr-hint{position:absolute;z-index:3;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:max-content;max-width:calc(100% - 32px);text-align:center;background:var(--ink);color:#fff;border-radius:999px;padding:8px 16px;font-size:.9rem;animation:prHint 1.6s ease-in-out infinite alternate}
@keyframes prHint{to{transform:translateX(-50%) translateY(-4px)}}
/* the last frame is the jar, full screen */
.present .jarbox{visibility:visible;z-index:75;padding:0;background:none;backdrop-filter:none}
.present .jar-card{width:100vw;height:100vh;border:0;border-radius:0;box-shadow:none;padding:calc(4 * var(--u))}
.present .jar-btns,.present .jar-foot{display:none}
.present .jar-view{border:0}''')
