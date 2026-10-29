# Help with a mission step, in every guide: a "?" hint, and "Do it for me".
# A step can have:
#   hint: what to do, in words (HTML). The "?" next to the step shows it in the bubble, on hover or tap.
#   show(): makes the thing to use glow, when the hint opens. Each guide decides how.
#   doIt(): does the step. "Do it for me" first warns that the lesson then gives no jelly. The button only shows with
#     ?allowcheats=1 in the address: tutor studies find children click straight through to the answer (docs/research). Presenter mode
#     still uses doIt.
# A lesson finished with help still counts as finished, so the next lesson and the next course still open. It just
# gives no jelly: store.nojelly lists those lessons. Steps with no hint or doIt don't show the buttons.
# Run by shelly-patch.py, after terms-patch.py (it uses the bubble).

rep('<span class="pips" id="lPips"></span></div>', '<span class="pips" id="lPips"></span><span class="task-help"><button class="hint-btn" id="lHint" aria-label="Give me a hint" hidden>?</button><button class="doit-btn" id="lDoIt" hidden>Do it for me</button></span></div>')
rep("</style>", """/* help with a step: a "?" for a hint, and "Do it for me" */
.task-help{margin-left:auto;display:flex;gap:.5em;align-items:center}
.hint-btn{width:1.9em;height:1.9em;border-radius:50%;border:3px solid var(--ink);background:var(--lemon);font-family:var(--display);font-size:.95em;line-height:1;padding:0;cursor:help;box-shadow:0 3px 0 var(--ink)}
.hint-btn:hover,.hint-btn[aria-expanded=true]{background:#ffe58a}
.doit-btn{border:2px solid var(--ink-soft);border-radius:999px;background:#fff;color:var(--ink-soft);font-family:var(--body);font-weight:700;font-size:.62em;padding:.25em .8em;cursor:pointer}
.doit-btn:hover{color:var(--ink);border-color:var(--ink)}
.doit-pop{position:fixed;inset:0;z-index:66;display:grid;place-items:center;background:#24133b80;padding:16px}
.doit-card{background:var(--card);color:var(--ink);border:4px solid var(--ink);border-radius:22px;box-shadow:0 6px 0 var(--ink);width:min(440px,100%);padding:20px 22px;display:grid;gap:12px;text-align:center}
.doit-card h3{font-family:var(--display);font-weight:400;font-size:1.6rem;margin:0}
.doit-card p{margin:0;color:var(--ink-soft)}
.doit-card .btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.bean.helped{background:none!important;border-style:dashed}
/* a hint pointing at something: it pulses gold three times */
.hint-glow{animation:hint-glow .8s ease-in-out 3}
@keyframes hint-glow{50%{box-shadow:0 0 0 4px #ffb800,0 0 26px 10px rgba(255,184,0,.7)}}
</style>""")

# a step done for the child goes through check(), like any other step
rep("    L.steps.forEach((s, i) => { if (!st[i] && (!L.seq || st.slice(0, i).every(Boolean)) && s.ok(ev)) { st[i] = true; changed = true; } });",
    "    L.steps.forEach((s, i) => { if (!st[i] && (!L.seq || st.slice(0, i).every(Boolean)) && (ev.type === 'done for me' ? ev.lesson === L.id && ev.step === i : s.ok(ev))) { st[i] = true; changed = true; } });")

# no jelly for a lesson finished with help: not in the jar, not in the count, and the words say so
rep("const jarStore = () =>", "const jellyless = (id) => !!store.nojelly?.[id];\nconst jarStore = () =>")
rep("    if (!store.done[a.id]) { delete all[key]; continue; }", "    if (!store.done[a.id] || jellyless(a.id)) { delete all[key]; continue; }")
rep("""  const n = ALL.filter((a) => store.done[a.id]).length;
  $('#jarCount').textContent = `${n} / ${ALL.length} jellies`;""", """  const n = ALL.filter((a) => store.done[a.id]).length, jellies = ALL.filter((a) => store.done[a.id] && !jellyless(a.id)).length;
  $('#jarCount').textContent = `${jellies} / ${ALL.length} jellies`;""")
rep("""  $('#beans').innerHTML = ALL.map((a) => `<span class="bean${store.done[a.id] ? ' on' : ''}" title="${esc(a.name)}" style="${store.done[a.id] ? `background:${a.color}` : ''}"></span>`).join('');""",
    """  $('#beans').innerHTML = ALL.map((a) => `<span class="bean${store.done[a.id] ? ' on' : ''}${jellyless(a.id) ? ' helped' : ''}" title="${esc(a.name)}${jellyless(a.id) ? ' (done with help: no jelly)' : ''}" style="${store.done[a.id] ? `background:${a.color}` : ''}"></span>`).join('');""")
rep("""  else if (!sectionDone(id)) toast(`Jelly collected: ${item.word ? item.word : item.name}!`);""",
    """  else if (!sectionDone(id)) toast(jellyless(id) ? `Exercise done: ${item.word ? item.word : item.name}. No jelly this time.` : `Jelly collected: ${item.word ? item.word : item.name}!`);""")
rep("""    $('#lTask').innerHTML = i < 0 ? (G.review === L.id ? `You did every step! Take a look at what happened. When you're ready, press <b>Collect your jelly</b>.` : `You did every step. The <b>${esc(L.word)}</b> jelly is yours!`) : L.steps[i].t;""",
    """    $('#lTask').innerHTML = i < 0 ? (jellyless(L.id) ? (G.review === L.id ? `Every step is done, some with help. Take a look at what happened. When you're ready, press <b>Finish the exercise</b>.` : 'Every step is done, some with help. No jelly this time.') : G.review === L.id ? `You did every step! Take a look at what happened. When you're ready, press <b>Collect your jelly</b>.` : `You did every step. The <b>${esc(L.word)}</b> jelly is yours!`) : L.steps[i].t;""")
rep("""  nx.innerHTML = (collect ? 'Collect your jelly' :""", """  nx.innerHTML = (collect ? (jellyless(L.id) ? 'Finish the exercise' : 'Collect your jelly') :""")
rep("""  $('#lBack').hidden = p === 'meet'; paintRestart();""", """  $('#lBack').hidden = p === 'meet'; paintRestart(); paintHelp();""")
rep("""    <div class="un-earned">You earned the ${LOOK_NAMES[look(id)]} <b style="color:${item.color}">${esc(item.word ?? item.name)}</b> jelly!</div><button class="un-jar" id="unJar">See it in my jar</button>""",
    """    ${jellyless(id) ? `<div class="un-earned">Exercise done! No jelly this time.</div><button class="un-jar" id="unJar" hidden></button>` : `<div class="un-earned">You earned the ${LOOK_NAMES[look(id)]} <b style="color:${item.color}">${esc(item.word ?? item.name)}</b> jelly!</div><button class="un-jar" id="unJar">See it in my jar</button>`}""")
rep("""  flyToJar(upnext.querySelector('.un-bean'), item.color);""", """  if (!jellyless(id)) flyToJar(upnext.querySelector('.un-bean'), item.color);""")
rep("$('#resetYes').onclick = () => { store.done = {}; store.steps = {}; store.phase = {}; save();", "$('#resetYes').onclick = () => { store.done = {}; store.steps = {}; store.phase = {}; store.nojelly = {}; save();")

rep('/* ---------------- panels + navigation ---------------- */', '''/* ---------------- help with a step: a hint, and "Do it for me" ---------------- */
const curStep = () => {
  const L = LESSONS[cur]; if (!L || $('#lcard').dataset.phase !== 'mission') return null;
  const st = store.steps[L.id] ?? [], k = L.steps.findIndex((s, i) => !st[i]);
  return k < 0 ? null : { L, k, s: L.steps[k] };
};
// A terminal step names its commands in <code> (docs/new-lesson.md). Unless the step says otherwise, its hint says where
// to type them, and "Do it for me" types each one and presses Enter. Only real commands count: a <code> can be a file
// name instead. A step whose <code>s aren't all commands needs its own hint.
function stepCommands(s) {
  if ($('#term').hidden) return null;
  const lines = [...s.t.matchAll(/<code>(.*?)<\/code>/g)].map(([, c]) => { const d = document.createElement('textarea'); d.innerHTML = c.replace(/<[^>]+>/g, ''); return d.value.trim(); });
  const isCmd = (line) => { const w = line.split(/\s+/)[0]; return w && (SH.has(w) || SH.locate(w) || w.startsWith('./')); };
  return lines.length && lines.every(isCmd) ? lines : null;
}
const glowEl = (el) => { el.classList.remove('hint-glow'); void el.offsetWidth; el.classList.add('hint-glow'); };
const typeCmd = (line) => { termIn.value = line; submit(); };
function helpFor(s) {
  // a choice (Security Jelly's dilemmas): the right answer is marked good
  if (s.choices && !s.hint) return {
    hint: 'Read every answer. Pick the one a white hat would choose: it keeps people safe, and tells someone who can fix it.',
    show: () => { const c = document.querySelector('#lTask .choices'); if (c) glowEl(c); },
    doIt: () => document.querySelector(`#lTask .choice[data-j="${s.choices.findIndex((c) => c.good)}"]`)?.click(),
  };
  const lines = stepCommands(s), say = lines?.map((l) => `<code>${esc(l)}</code>`).join(', then ');
  return {
    hint: s.hint ?? (lines && `Click in the terminal, type ${say}, and press <kbd>Enter</kbd> after ${lines.length > 1 ? 'each one' : 'it'}.`),
    show: s.show ?? (lines && (() => glowEl($('#term')))),
    doIt: s.doIt ?? (lines && (() => lines.forEach(typeCmd))),
  };
}
const CHEATS = new URLSearchParams(location.search).get('allowcheats') === '1';
function paintHelp() { const c = curStep(), h = c && helpFor(c.s); $('#lHint').hidden = !h?.hint; $('#lDoIt').hidden = !CHEATS || !h?.doIt; }
BUBBLES.push({ sel: '#lHint', html: () => { const c = curStep(), h = c && helpFor(c.s); return h?.hint ? `<b>Hint</b><p>${h.hint}</p>` : ''; }, onOpen: () => { const c = curStep(); c && helpFor(c.s).show?.(); } });
document.body.insertAdjacentHTML('beforeend', `<div class="doit-pop" id="doitPop" role="dialog" aria-modal="true" aria-labelledby="doitTitle" hidden><div class="doit-card">
  <h3 id="doitTitle">I can, but you don't get a jelly!</h3><p>If I do this step for you, this exercise won't give you its jelly.</p>
  <div class="btns"><button class="btn alt" id="doitYes">No jelly for me</button><button class="btn go" id="doitNo">Let me earn my jelly</button></div></div></div>`);
// Done for the child: the step really happens (doIt), then it is ticked, even if what doIt did doesn't satisfy its check.
const DONE_MS = 700;
function doForMe() {
  const c = curStep(), doIt = c && helpFor(c.s).doIt; if (!doIt) return;
  store.nojelly = { ...store.nojelly, [c.L.id]: true }; save();
  doIt();
  setTimeout(() => { if (!(store.steps[c.L.id] ?? [])[c.k]) check({ type: 'done for me', lesson: c.L.id, step: c.k }); }, DONE_MS);
}
const closeDoIt = () => { $('#doitPop').hidden = true; $('#lDoIt').focus({ preventScroll: true }); };
$('#lDoIt').onclick = () => { if (!CHEATS) return; if (jellyless(LESSONS[cur].id)) doForMe(); else { $('#doitPop').hidden = false; $('#doitNo').focus(); } };
$('#doitYes').onclick = () => { closeDoIt(); doForMe(); };
$('#doitNo').onclick = closeDoIt;
$('#doitPop').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeDoIt(); });
addEventListener('keydown', (e) => { if (!$('#doitPop').hidden) { e.stopImmediatePropagation(); if (e.key === 'Escape') closeDoIt(); } }, true);

/* ---------------- panels + navigation ---------------- */''')
