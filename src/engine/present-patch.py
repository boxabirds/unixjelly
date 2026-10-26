# Presenter mode: a course as a minimal, full-screen slide show, for recording videos with a voice-over and a head shot.
# Not a screencast of the app: one idea per frame. For a lesson: its jelly word, its story, its picture, each point,
# then for every step of the mission: the task, the terminal (the command typed key by key, then its result), and the
# file tree if anything changed. Then the jelly it earns. The course ends with its jar filling up.
#
# Open a guide with ?present (16:9, the right-hand side kept clear for a head shot), ?present=tall (9:16 for Shorts,
# the bottom kept clear), or add &face=none to use the whole frame, or &lesson=<id> for just one lesson (a Short).
# Or press Shift+P in any guide: 16:9 at once (no reload), Shift+P again for 9:16, and again to go back to the guide.
#   Space or →  next frame      ←  previous frame      Home / End  first / last frame      M  sound on or off
# A reload comes back to the same frame. Nothing is saved, so presenting never touches anyone's progress.
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
// Run every lesson's demo once, silently, and record a frame for each thing worth a whole screen.
function prCapture() {
  const frames = [{ k: 'intro' }], muted = sound.muted, ok = [];
  // the overview (Jelly Shell, Git and Web): one frame per step of the 3D town, right after the intro
  if (PR.townGo && PANELS.some((p) => p.id === 'whole')) TOWN_STEPS.forEach((_, n) => frames.push({ k: 'whole', n }));
  sound.muted = true; store.done = {}; store.steps = {};
  LESSONS.forEach((L, li) => {
    frames.push({ k: 'title', li }, { k: 'story', li });
    if (L.visual) frames.push({ k: 'visual', li });
    L.points.forEach((_, n) => frames.push({ k: 'point', li, n }));
    if (!L.demo?.length) return;
    go(L.id); resetSandbox(); setPhase('mission'); renderMap();
    let shown = -1;
    for (const a of L.demo) {
      const st = store.steps[L.id] ?? [], i = L.steps.findIndex((s, k) => !st[k]);
      if (i >= 0 && i !== shown) { frames.push({ k: 'task', li, n: i }); shown = i; }
      const map0 = $('#map').innerHTML, prompt = promptText(), lines = termOut.children.length;
      if (a.startsWith('@type:')) { nanoText.value = a.slice(6).replace(/\\n/g, '\n'); nanoText.dispatchEvent(new Event('input')); frames.push({ k: 'nano', li, file: $('#nanoName').textContent, text: nanoText.value, typed: true }); }
      else if (a.startsWith('@key:')) {
        const k = a.slice(5), ctrl = /^Control\+/.test(k), before = { file: $('#nanoName').textContent, text: nanoText.value };
        nanoText.dispatchEvent(new KeyboardEvent('keydown', { key: ctrl ? k.slice(8) : k, ctrlKey: ctrl, bubbles: true, cancelable: true }));
        frames.push({ k: 'nano', li, ...before, key: ctrl ? `Ctrl+${k.slice(8).toUpperCase()}` : k.toUpperCase(), msg: $('#nanoMsg').textContent });
      } else if (/^@(tab:|up$|enter$|ctrlc$)/.test(a)) {
        // a special key in the terminal: Tab completes, ↑ brings back the last command, Enter runs what is typed, Ctrl+C stops
        const typed = a.startsWith('@tab:') ? a.slice(5) : a === '@up' ? '' : termIn.value, key = { '@up': '↑', '@enter': 'Enter', '@ctrlc': 'Ctrl+C' }[a] ?? 'Tab';
        termIn.value = typed;
        if (key === 'Tab') completeTab(); else if (key === '↑') recall(-1); else if (key === 'Enter') submit(); else ctrlC();
        const out = [...termOut.children].slice(lines + (key === 'Enter' ? 1 : 0)).map((e) => e.outerHTML).join('');
        frames.push({ k: 'term', li, prompt, cmd: typed, key, after: key === 'Tab' || key === '↑' ? termIn.value : null, out });
      } else {
        termIn.value = a; submit();
        if (typeof NANO !== 'undefined' && NANO.open) frames.push({ k: 'term', li, prompt, cmd: a, out: '' }, { k: 'nano', li, file: $('#nanoName').textContent, text: nanoText.value });
        else frames.push({ k: 'term', li, prompt, cmd: a, out: [...termOut.children].slice(lines + 1).map((e) => e.outerHTML).join('') });
      }
      renderMap();
      if ($('#map').innerHTML !== map0) frames.push({ k: 'files', li, before: map0, after: $('#map').innerHTML });
    }
    if (G.review === L.id) ok.push(L.id);
    G.review = null; store.done[L.id] = true; paintProgress();
    frames.push({ k: 'earned', li });
  });
  frames.push({ k: 'jar' });
  sound.muted = muted;
  document.documentElement.dataset.prOk = ok.length; // how many demos really finished their mission, for tests
  return frames;
}

/* ---------------- presenter mode: showing a frame ---------------- */
const PR = { i: 0, frames: [], typing: null, jelly: null };
function presentGo(i) {
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
    task: () => `${label(`Mission · step ${f.n + 1} of ${L.steps.length}`)}<p class="pr-big">${L.steps[f.n].t}</p>`,
    term: () => `<div class="pr-term term-body"><div class="ln"><span class="p">${esc(f.prompt)}</span> <span class="pr-typed"></span><span class="pr-caret"></span></div><div class="pr-out">${f.out}</div></div>${f.key ? `<div class="pr-key pr-termkey">${esc(f.key)}</div>` : ''}`,
    nano: () => `<div class="pr-nano"><div class="nano-top"><span>GNU nano</span><b>${esc(f.file)}</b><span></span></div><pre class="pr-nano-text"></pre><div class="nano-msg">${esc(f.msg ?? '')}</div>${f.key ? `<div class="pr-key">${esc(f.key)}</div>` : ''}</div>`,
    files: () => `${label('The file tree')}<div class="pr-files map-list">${prDiff(f.before, f.after)}</div>`,
    earned: () => `<div class="pr-earned">${bean(L.color, 'pr-bean', look(L.id))}<div class="pr-big">You earned the ${LOOK_NAMES[look(L.id)]} <b style="color:${L.color}">${esc(L.word)}</b> jelly!</div></div>`,
    jar: () => '',
  }[f.k]();
  // the town only draws while it is on screen; moved out of the hidden app, it is told so directly
  if (PR.town) { PR.town.active = f.k === 'whole'; }
  if (f.k === 'whole') { if ($('#town').parentNode !== $('#prTown')) $('#prTown').append($('#town')); PR.town.resize(); PR.townGo(f.n); }
  if (f.k === 'jar') { store.done = Object.fromEntries(LESSONS.map((x) => [x.id, true])); paintProgress(); openJar(COURSE.id); }
  if (f.k === 'title' || f.k === 'intro') prJelly(f.k === 'intro' ? COURSE.title.replace(/^Jelly /, '').toLowerCase() : L.word, L?.color);
  if (f.k === 'nano') $('.pr-nano-text').textContent = f.text;
  if (f.k === 'term') $('.pr-typed').textContent = f.after ?? f.cmd;
  prFit(body);
  if (!animate || REDUCED) return;
  body.animate([{ opacity: 0, transform: 'translateY(26px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
  if (f.k === 'term') prType($('.pr-typed'), f.cmd, $('.pr-out'), f);
  if (f.k === 'nano' && f.typed) prType($('.pr-nano-text'), f.text);
  if (f.k === 'files') body.querySelectorAll('.pr-new').forEach((r, n) => r.animate([{ background: '#ffc61a', transform: 'scale(1.04)' }, { transform: 'none' }], { duration: 900, delay: 250 + n * 120 }));
  if (f.k === 'earned') { $('.pr-bean').animate([{ transform: 'scale(.3) rotate(-20deg)' }, { transform: 'scale(1.15) rotate(6deg)' }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.3,1.5,.5,1)' }); confetti(L.color); sound.ding(); }
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
function prDiff(before, after) {
  const rows = (h) => { const t = document.createElement('template'); t.innerHTML = h; return [...t.content.querySelectorAll('.mrow')]; };
  const old = new Map(rows(before).map((r) => [r.dataset.path ?? r.textContent, r.outerHTML]));
  return rows(after).map((r) => { if (old.get(r.dataset.path ?? r.textContent) !== r.outerHTML) r.classList.add('pr-new'); return r.outerHTML; }).join('');
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
  for (const t of el.querySelectorAll('.pr-big,.pr-files,.pr-term')) {
    let s = 1; t.style.setProperty('--s', 1);
    while (el.scrollHeight > el.clientHeight + 1 && s > .5) { s -= .05; t.style.setProperty('--s', s.toFixed(2)); }
  }
}

// Start presenting: hide the app, record the frames, show the first (or the one a reload came back to).
// Runs at start-up for ?present, or straight away from Shift+P with no reload: inside claude.ai the page can't see
// its address, so a keypress is the only way in there.
function presentStart(shape) {
  PRESENT = shape;
  store.done = {}; store.steps = {}; store.phase = {}; sound.muted = true; // fresh, and nothing is saved from here on
  const face = new URLSearchParams(location.search).get('face') ?? 'right';
  document.documentElement.classList.add('present', `present-${shape}`, `face-${face}`);
  document.body.insertAdjacentHTML('beforeend', '<div class="pr-stage" id="prStage"><canvas id="prJelly" hidden></canvas><div class="pr-town" id="prTown" hidden></div><div class="pr-body" id="prBody"></div><div class="pr-bar"><i id="prBar"></i></div></div>');
  if (!booted) boot();
  PR.frames = prCapture();
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
}, true);

/* ---------------- panels + navigation ---------------- */''')

# Record the frames and show the first (or the one a reload came back to) once the page is ready.
# The overview's 3D town and its stepper, for presenter mode's overview frames.
rep("  const town = new Town($('#town'));", "  const town = PR.town = new Town($('#town'));")
rep("  const townGo = (i) => {", "  const townGo = PR.townGo = (i) => {")
# The 3D normally waits for a screen at least 900 wide; a presenter's 9:16 window is narrower but wants it.
rep("const roomy = () => innerWidth >= 900 && innerHeight >= 560;", "const roomy = () => !!PRESENT || (innerWidth >= 900 && innerHeight >= 560);")
# (at the very end of start-up, after the 3D has booted: the page waits for its font part-way through starting)
rep("if (roomy()) boot();", "if (roomy()) boot();\nif (PRESENT) presentStart(PRESENT);")

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
.pr-earned{display:grid;justify-items:center;gap:calc(3 * var(--u));text-align:center}
.pr-earned .pr-bean{width:calc(22 * var(--u))}
.pr-earned .pr-big{font-family:var(--display);max-width:none}
.pr-bar{position:absolute;left:0;right:0;bottom:0;height:calc(.6 * var(--u));background:#24133b14;z-index:2}
.pr-bar i{display:block;height:100%;width:0;background:var(--c, #ff4d6d);transition:width .3s}
.pr-stage[data-k=term] .pr-bar,.pr-stage[data-k=nano] .pr-bar{background:#ffffff14}
/* the last frame is the jar, full screen */
.present .jarbox{visibility:visible;z-index:75;padding:0;background:none;backdrop-filter:none}
.present .jar-card{width:100vw;height:100vh;border:0;border-radius:0;box-shadow:none;padding:calc(4 * var(--u))}
.present .jar-btns,.present .jar-foot{display:none}
.present .jar-view{border:0}''')
