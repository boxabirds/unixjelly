# Turns the v10 engine into the focused one: the nav slides away during the tutorial, every lesson runs one
# phase at a time (story, brain-burner, mission), Enter always presses the one big button, and text is bigger.
s = open('engine/shell.html').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:90], s.count(a)); s = s.replace(a, b)
def region(start, end, new, keep_end=True):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + (s[j:] if keep_end else s[j + len(end):])

# ---------- CSS ----------
rep(".ph p{color:var(--ink-soft);max-width:60ch;font-size:clamp(.88rem,.7rem + .45vh,1.02rem);flex:1;min-width:280px}",
    ".ph p{color:var(--ink-soft);max-width:60ch;font-size:clamp(1rem,.8rem + .5vh,1.2rem);flex:1;min-width:280px}")
rep(".town-ui{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:center;padding:12px 16px;border-top:4px solid var(--ink);background:var(--card);height:clamp(92px,15vh,128px)}",
    ".town-ui{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:center;padding:12px 18px;border-top:4px solid var(--ink);background:var(--card);height:clamp(110px,19vh,170px)}")
rep(".cap{display:grid;gap:2px;min-width:0;height:100%;overflow:hidden;align-content:center;font-size:calc(1rem * var(--fit,1))}",
    ".cap{display:grid;gap:4px;min-width:0;height:100%;overflow:hidden;align-content:center;font-size:calc(clamp(1.05rem,.75rem + 1vh,1.35rem) * var(--fit,1))}")
rep(".show-cap{background:var(--card);border:3px solid var(--ink);border-radius:18px;padding:10px 16px;height:clamp(64px,11vh,104px);overflow:hidden;display:flex;align-items:center;font-size:calc(1rem * var(--fit,1))}",
    ".show-cap{background:var(--card);border:3px solid var(--ink);border-radius:18px;padding:10px 18px;height:clamp(76px,14vh,130px);overflow:hidden;display:flex;align-items:center;font-size:calc(clamp(1.05rem,.75rem + 1vh,1.35rem) * var(--fit,1))}")
rep(".show-btns .btn{font-size:.92rem;padding:5px 12px;text-align:left}",
    ".show-btns .btn{font-size:.92rem;padding:5px 12px;text-align:left}\n#p-backstage:not([data-played]) .show-btns{display:none} /* first, just press Enter; the other shows appear afterwards */\n.show-btns .btn.go{font-size:1.1rem;text-align:center}")
region("/* a magic word: jelly + mission on top, explanation + terminal below, file tree down the side */", ".term{grid-area:term;", """/* a magic word, one thing at a time: the story, then the brain-burner, then the mission. The jelly stays top left. */
.lesson{flex:1;min-height:0;display:grid;grid-template-columns:var(--jw) minmax(0,1fr);grid-template-rows:var(--top) minmax(0,1fr) auto;grid-template-areas:"jelly head" "body body" "foot foot";gap:var(--gap);--top:clamp(130px,21vh,210px);--jw:clamp(200px,24vw,340px)}
.ljelly{grid-area:jelly;position:relative;background:#fff4d6}
.ljelly .stands{position:absolute;left:12px;top:10px;max-width:calc(100% - 24px);font-family:var(--mono);font-size:.8rem;background:var(--ink);color:#fff;padding:2px 10px;border-radius:999px;pointer-events:none;z-index:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lhead{grid-area:head;display:flex;flex-direction:column;justify-content:center;gap:.4em;min-width:0;overflow:hidden;font-size:calc(1rem * var(--fit,1))}
.lhead .num{font-family:var(--mono);font-size:.85em;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}
.lhead h3{font-size:clamp(2.1rem,1rem + 3.6vh,3.6rem)}
.task{display:none;background:#fffbea;border:4px solid var(--ink);border-radius:22px;box-shadow:0 5px 0 var(--ink);padding:.55em 1em .65em;gap:.3em;min-height:0}
.lesson[data-phase=mission] .lhead h3{display:none}
.lesson[data-phase=mission]{--top:clamp(100px,17vh,180px)}
.lesson[data-phase=mission] .task{display:grid}
.task-top{display:flex;align-items:center;gap:.7em;font-family:var(--display);font-size:1.05em}
.pips{display:flex;gap:.35em}
.pip{width:1.7em;height:1.7em;border:3px solid var(--ink);border-radius:50%;display:grid;place-items:center;font-family:var(--body);font-weight:800;font-size:.72em;background:#fff;transition:transform .2s}
.pip.ok{background:var(--lime)}
.pip.cur{background:var(--lemon);transform:scale(1.2)}
.task-t{font-size:clamp(1.15rem,.7rem + 1.4vh,1.65rem);font-weight:600;line-height:1.35}
.task-t code{white-space:normal;overflow-wrap:anywhere}
.task-yay{font-family:var(--display);color:#2e8a1a;font-size:1.25em;display:inline-block;animation:yay .5s cubic-bezier(.3,1.6,.5,1)}
@keyframes yay{from{transform:scale(.4)}}
.lbody{grid-area:body;min-height:0;display:grid}
.lstory,.lbrain,.ltools{display:none;min-height:0}
.lesson[data-phase=meet] .lstory{display:grid}
.lesson[data-phase=brain] .lbrain{display:flex}
.lesson[data-phase=mission] .ltools{display:grid}
.lstory{grid-auto-flow:column;align-items:center;justify-content:center;gap:clamp(16px,3vw,40px);overflow:hidden;font-size:calc(clamp(1.25rem,.6rem + 2.4vh,2.1rem) * var(--fit,1))}
.why{background:#fff;border:4px solid var(--ink);border-radius:26px;box-shadow:0 6px 0 var(--ink);padding:.9em 1.2em;line-height:1.5;max-width:36ch}
.lvisual:empty{display:none}
.lbrain{flex-direction:column;justify-content:center;align-items:center;gap:.7em;text-align:center;overflow:hidden;font-size:calc(clamp(1.1rem,.7rem + 1.4vh,1.6rem) * var(--fit,1))}
.mnem-label{font-family:var(--mono);font-size:.7em;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)}
.mnem{font-family:var(--display);font-size:2.3em;line-height:1.05;color:var(--c,var(--berry));text-wrap:balance;-webkit-text-stroke:2px var(--ink);paint-order:stroke fill;text-shadow:0 4px 0 var(--ink);max-width:20ch}
.points{margin:.4em 0 0;padding:0;list-style:none;display:grid;gap:.55em;text-align:left;max-width:46ch}
.points li{display:grid;grid-template-columns:1.1em minmax(0,1fr);gap:.6em}
.points li::before{content:"";width:.7em;height:.95em;border-radius:50%/42%;background:var(--c,var(--berry));border:2px solid var(--ink);margin-top:.28em;transform:rotate(-14deg)}
.lstory code,.lbrain code{white-space:normal;overflow-wrap:anywhere}
.ltools{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);grid-template-areas:"term map";gap:var(--gap)}
.lfoot{grid-area:foot;display:flex;align-items:center;gap:12px}
.lfoot .btn{font-size:1.15rem;padding:8px 18px}
.lfoot .btn.small{font-size:.9rem;padding:5px 12px}
#lNext{margin-left:auto}
.phases{position:absolute;left:50%;transform:translateX(-50%)}
@media (max-width:1150px){.phases{position:static;transform:none;margin:0 auto}.phases li{font-size:.8rem;padding:2px 10px}.lfoot .btn{font-size:1rem;padding:6px 14px}}
.lfoot{position:relative;min-height:52px}
.phases{display:flex;gap:8px;list-style:none;margin:0 auto;padding:0;counter-reset:ph}
.phases li{counter-increment:ph;font-family:var(--display);font-size:.95rem;padding:3px 14px;border:3px solid #24133b44;border-radius:999px;color:var(--ink-soft);cursor:pointer;white-space:nowrap}
.phases li::before{content:counter(ph) ". "}
.phases li.on{border-color:var(--ink);background:var(--c);color:var(--ink)}
.ent{display:inline-block;font-family:var(--body);font-weight:700;font-size:.6em;border:2px solid currentColor;border-radius:6px;padding:0 .4em;margin-left:.6em;vertical-align:.18em;opacity:.75;line-height:1.4}
""")
rep(".term-body{flex:1;min-height:0;overflow-y:auto;padding:10px 14px;font-family:var(--mono);font-size:clamp(13px,.55rem + .6vh,15px);line-height:1.45;cursor:text}",
    ".term-body{flex:1;min-height:0;overflow-y:auto;padding:10px 14px;font-family:var(--mono);font-size:clamp(14px,.6rem + .75vh,18px);line-height:1.45;cursor:text}")
rep("#termIn{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#fff;font:inherit;font-size:16px;caret-color:var(--phos);padding:0}",
    "#termIn{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#fff;font:inherit;caret-color:var(--phos);padding:0}\n#termIn::placeholder{color:#7fb092}")
rep(".map-head{display:grid;gap:2px;padding:8px 12px;border-bottom:3px solid var(--ink);font-family:var(--display);font-size:1.05rem}",
    ".map-head{display:grid;gap:2px;padding:8px 12px;border-bottom:3px solid var(--ink);font-family:var(--display);font-size:1.15rem}")
rep(".map-list{position:relative;flex:1;min-height:0;overflow:hidden;padding:8px 8px 10px;font-size:calc(.86rem * var(--fit,1))}",
    ".map-list{position:relative;flex:1;min-height:0;overflow:auto;padding:8px 8px 10px;font-size:calc(.95rem * var(--fit,1));scrollbar-width:thin} /* on very small screens a long tree may scroll */")
region("/* the guide: numbered areas, a moving spotlight, a jelly-bean coach, and \"next up\" */", ".upnext{", """/* the end of a section: a jelly flies into the jar, then a clear "next up" */
.guide{position:absolute;inset:0;pointer-events:none;z-index:30}
""")
region(".up-pill{position:absolute;", ".flyer{", "")
rep(".ni.up-next::after{", ".un-card .ent{font-size:.55em}\n.ni.up-next::after{")
rep(".toast{position:fixed;left:calc(50% + var(--nav) / 2);", ".toast{position:fixed;left:calc(50% + var(--nav) / 2);transition:left .45s,transform .45s cubic-bezier(.3,1.6,.5,1)!important;")
rep("</style>", """/* tutorial sections get the whole window: the nav slides away and waits behind a small tab on the left */
.app{display:block;position:relative;height:100%}
.side{position:absolute;left:0;top:0;bottom:0;width:var(--nav);z-index:45;transition:transform .45s cubic-bezier(.3,1,.4,1),box-shadow .3s}
.stage{position:absolute;top:0;right:0;bottom:0;left:var(--nav);transition:left .45s cubic-bezier(.3,1,.4,1)}
.app.focus .stage{left:0}
.app.focus .side{transform:translateX(-100%)}
.app.focus.peek .side{transform:none;box-shadow:16px 0 48px #24133b99}
.app.focus .panel{padding-left:max(var(--pad),34px)}
.app.focus ~ .toast{left:50%}
.nav-handle{position:absolute;left:0;top:50%;z-index:44;display:grid;justify-items:center;gap:8px;padding:14px 7px 14px 5px;background:var(--ink);color:#fff;border:0;border-radius:0 16px 16px 0;font-family:var(--display);font-size:.85rem;line-height:1;transform:translate(-110%,-50%);transition:transform .35s;box-shadow:3px 0 0 #ffffff55}
.app.focus .nav-handle{transform:translate(0,-50%)}
.nav-handle .hb{font-size:1.2rem}
.nav-handle .hc{writing-mode:vertical-rl;letter-spacing:.04em}
.nav-handle .bean-svg{width:20px;height:auto}
.jar{grid-template-columns:auto auto;justify-content:space-between;align-items:center}
.beans{grid-column:1/-1}
.home-link{display:inline-flex;align-items:center;gap:6px;width:max-content;padding:2px 6px;font-weight:700;font-size:.82rem;color:var(--lemon);text-decoration:none;border-radius:8px}
.home-link:hover{text-decoration:underline}
.gate .home-link{color:var(--blue);font-size:1rem}
.gate .gate-slides{font-size:1.1rem;padding:12px 22px}
@media (prefers-reduced-motion:reduce){.side,.stage,.nav-handle{transition:none}}
/* small windows: the recap packs its cards tighter */
@media (max-height:700px),(max-width:1150px){
  .rc-grid{grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px}
  .rc-stop{min-width:80px}.rc-via{min-width:30px}.rc-via small,.rc-stop small{display:none}
  .rc-stop b{font-size:.95rem}
  .rc-card .d{display:none}
}
</style>""")

# ---------- HTML ----------
# a way back to the page that lists all three guides (the repo copies point it at ../)
# Where "← All the guides" goes. In the repo every guide sits in a folder next to the landing page.
# Set JELLY_HOME to an absolute link to build copies that are hosted somewhere else.
import os
HOME = f'href="{os.environ["JELLY_HOME"]}" target="_blank" rel="noopener"' if os.environ.get('JELLY_HOME') else 'href="../"'
rep('<div class="jar-count" id="jarCount">0 / 15 jellies</div></div>', f'<div class="jar-count" id="jarCount">0 / 15 jellies</div><a class="home-link" {HOME}>← All guides</a></div>')
rep('    <div class="gate-credit">', f'    <p><a class="home-link" {HOME}>← All the guides</a></p>\n    <div class="gate-credit">')
rep('      <div class="stepper"><button class="btn alt" id="navPrev">Back</button><button class="btn go" id="navNext">Next</button></div>\n', '')
rep('  </aside>\n', '  </aside>\n  <button class="nav-handle" id="navHandle" aria-label="Show every section"><span class="hb">☰</span><span class="hc" id="handleCount"></span></button>\n')
rep('<button class="btn go" id="startBtn">Start the tour</button>', '<button class="btn go" id="startBtn">Start the tour<span class="ent">Enter ↵</span></button>')
rep('Enter<small>press me</small></button>', 'Enter<small>or press Enter</small></button>')
rep('<span><b>Ready.</b> Press the yellow Enter key, or pick a command on the right, and watch what happens inside the computer.</span>',
    '<span><b>Ready?</b> Press <kbd>Enter</kbd> on your keyboard (or click the yellow key) and watch what happens inside the computer.</span>')
rep('''          <button class="btn" data-show="mv">Play <code>mv hamster.txt sir-fluffington.txt</code></button>
        </div>''', '''          <button class="btn" data-show="mv">Play <code>mv hamster.txt sir-fluffington.txt</code></button>
          <button class="btn go" id="bsNext">Next<span class="ent">Enter ↵</span></button>
        </div>''')
region('      <div class="lesson" id="lcard">', '        <div class="term box" id="term">', '''      <div class="lesson" id="lcard" data-phase="meet">
        <div class="ljelly box"><canvas id="lessonJelly" aria-label="The current command as squishy jelly letters" style="position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none"></canvas><span class="stands" id="lStands"></span></div>
        <div class="lhead" data-fit>
          <div class="num" id="lNum"></div>
          <h3 id="lTitle"></h3>
          <div class="task" aria-live="polite"><div class="task-top"><span id="lTaskN"></span><span class="pips" id="lPips"></span></div><div class="task-t" id="lTask"></div></div>
        </div>
        <div class="lbody">
        <div class="lstory" data-fit><p class="why" id="lWhy"></p><div class="lvisual" id="lVisual"></div></div>
        <div class="lbrain" data-fit><div class="mnem-label">Burn this into your brain</div><div class="mnem" id="lMnem"></div><ul class="points" id="lPoints"></ul></div>
        <div class="ltools">
''')
rep('''          <div class="map-list" id="map" data-fit></div>
        </div>
      </div>
    </section>''', '''          <div class="map-list" id="map" data-fit></div>
        </div>
        <!-- /tools -->
        </div>
        </div>
        <div class="lfoot">
          <button class="btn alt" id="lBack">← Back</button>
          <button class="btn alt small" id="lRestart" title="Untick this mission and give the sandbox a fresh start">Start over</button>
          <ol class="phases" id="lPhases"><li data-p="meet">The story</li><li data-p="brain">Remember it</li><li data-p="mission">Mission</li></ol>
          <button class="btn go" id="lNext">Next</button>
        </div>
      </div>
    </section>''')
rep('''      <div class="ring" id="gRing"></div>
      <div id="gBadges"></div>
      <div class="coach" id="coach" role="dialog" aria-label="Guide" hidden></div>
      <button class="tips-btn" id="tipsBtn" hidden>Show me the way</button>
      <button class="up-pill" id="upPill" hidden></button>
''', '')
rep('<input id="termIn" aria-label="Type a command"', '<input id="termIn" placeholder="type here, then press Enter ↵" aria-label="Type a command"')

# ---------- JS: panels ----------
rep("""  if (P.lesson) showLesson(LESSONS.indexOf(P.lesson));""", """  $('.app').classList.toggle('focus', !['welcome', 'recap'].includes(P.id)); $('.app').classList.remove('peek');
  if (store.done.backstage) $('#p-backstage').dataset.played = '1';
  if (P.lesson) showLesson(LESSONS.indexOf(P.lesson));""")
rep("""  $('#navPrev').disabled = i === 0; $('#navNext').disabled = i === PANELS.length - 1;
  if (!REDUCED && from >= 0) el.animate([{ opacity: 0, transform: `translateY(${i >= from ? 28 : -28}px)` }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.then(() => placeGuide(), () => {});
  requestAnimationFrame(() => { fitAll(el); guideStart(P, el); });""", """  if (!REDUCED && from >= 0) el.animate([{ opacity: 0, transform: `translateY(${i >= from ? 28 : -28}px)` }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
  G.card = false; renderGuide();
  // Start every section with the big button ready, so the very next Enter carries on.
  requestAnimationFrame(() => { fitAll(el); const b = primaryButton(); if (b) b.focus({ preventScroll: true }); else document.activeElement?.blur(); });""")
rep("""$('#navPrev').onclick = () => step(-1);
$('#navNext').onclick = () => step(1);
""", """// The nav waits behind a tab during the tutorial. Click the tab to peek; click anywhere else to tuck it away.
$('#navHandle').onclick = () => $('.app').classList.toggle('peek');
$('.stage').addEventListener('pointerdown', () => $('.app').classList.remove('peek'));
$('.stage').addEventListener('transitionend', (e) => { if (e.target === e.currentTarget) fitNow(); });
// Enter always means "carry on": it presses the one big button on the screen. Typing boxes keep Enter for themselves.
function primaryButton() {
  if (G.card) return $('#unGo');
  const P = PANELS[panelIdx];
  const b = P.lesson ? $('#lNext') : { welcome: $('#startBtn'), whole: $('#townNext'), backstage: showBusy ? null : store.done.backstage ? $('#bsNext') : $('#enterKey') }[P.id];
  return b && !b.hidden && !b.disabled && b.offsetParent ? b : null;
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $('.app').classList.remove('peek');
  if (e.key !== 'Enter' || e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
  if (e.target.closest?.('input,textarea,select,button,a,[contenteditable]') && e.target.offsetParent) return; // a hidden box has lost its turn
  const b = primaryButton();
  if (b) { e.preventDefault(); b.click(); }
  else if (PANELS[panelIdx]?.lesson && $('#lcard').dataset.phase === 'mission') { e.preventDefault(); termIn.focus({ preventScroll: true }); }
});
""")
rep("""  $('#jarCount').textContent = `${n} / ${ALL.length} jellies`;""", """  $('#jarCount').textContent = `${n} / ${ALL.length} jellies`; $('#handleCount').textContent = `${n} / ${ALL.length}`;""")

# ---------- JS: one magic word, one phase at a time ----------
region("/* ---------------- one magic word ---------------- */", "$('#lRestart').onclick = () => {", """/* ---------------- one magic word, one thing at a time ---------------- */
// Three phases: the story, the brain-burner, then the mission, one step at a time. The jelly stays put throughout.
const ENTER = '<span class="ent">Enter ↵</span>';
store.phase ??= {};
let taskTimer, onTask = () => {}; // a guide can swap tools when a mission step needs a different one
// Start over only shows once there is something to undo: a step done, or anything typed in this mission.
let touched = false;
const paintRestart = () => { $('#lRestart').hidden = $('#lcard').dataset.phase !== 'mission' || !(touched || (store.steps[LESSONS[cur].id] ?? []).some(Boolean)); };
// A fresh start should be obvious: back to step 1, the mission card jumps, the jelly hops, and the terminal says so.
function freshStart(L) {
  touched = false; paintSteps();
  print('<span class="tip">Fresh start! Back to step 1.</span>'); scrollDown();
  document.querySelector('.task').animate([{ transform: 'scale(.92) rotate(-1deg)' }, { transform: 'scale(1.04)' }, { transform: 'none' }], { duration: 500, easing: 'ease-out' });
  lessonStage?.hopAll(1); toast(`Fresh start on ${L.word.replace(/!$/, "")}! Back to step 1.`); sound.boing(360, .35, .12);
}
function setPhase(p) {
  const L = LESSONS[cur]; store.phase[L.id] = p; save();
  $('#lcard').dataset.phase = p; paintSteps(); sound.blip();
  requestAnimationFrame(() => { fitAll($('#p-lesson')); if (p === 'mission') termIn.focus({ preventScroll: true }); else $('#lNext').focus({ preventScroll: true }); });
}
function paintSteps(celebrate = false) {
  const L = LESSONS[cur], st = store.steps[L.id] ?? [], i = L.steps.findIndex((s, k) => !st[k]), p = $('#lcard').dataset.phase;
  $('#lPips').innerHTML = L.steps.map((s, k) => `<span class="pip${st[k] ? ' ok' : ''}${k === i ? ' cur' : ''}">${st[k] ? '✓' : k + 1}</span>`).join('');
  const show = () => {
    $('#lTaskN').textContent = i < 0 ? 'Mission complete!' : `Step ${i + 1} of ${L.steps.length}`;
    $('#lTask').innerHTML = i < 0 ? `You did every step. The <b>${esc(L.word)}</b> jelly is yours!` : L.steps[i].t;
    if (i >= 0 && p === 'mission') onTask(L, L.steps[i]);
    if (PANELS[panelIdx]?.lesson) fitAll($('#p-lesson'));
  };
  clearTimeout(taskTimer);
  if (celebrate && p === 'mission' && !REDUCED) { $('#lTaskN').textContent = ''; $('#lTask').innerHTML = '<span class="task-yay">✓ Nice one!</span>'; lessonStage?.hopAll(.7); taskTimer = setTimeout(show, 1100); }
  else show();
  const done = !!store.done[L.id], last = cur === LESSONS.length - 1, nx = $('#lNext');
  nx.hidden = p === 'mission' && (!done || last);
  nx.innerHTML = (p === 'meet' ? 'Next' : p === 'brain' ? 'Start the mission' : 'Next word') + ENTER;
  nx.classList.toggle('pulse', p === 'mission');
  $('#lBack').hidden = p === 'meet'; paintRestart();
  document.querySelectorAll('#lPhases li').forEach((li) => li.classList.toggle('on', li.dataset.p === p));
}
function showLesson(i) {
  cur = i; const L = LESSONS[i]; store.cur = L.id; save();
  touched = false;
  $('#lcard').style.setProperty('--c', L.color);
  $('#lNum').textContent = `Magic word ${i + 1} of ${LESSONS.length}`;
  $('#lStands').textContent = L.stands; $('#lTitle').textContent = L.title; $('#lWhy').innerHTML = L.why; $('#lMnem').textContent = L.mnem;
  $('#lVisual').innerHTML = L.visual ?? '';
  $('#lPoints').innerHTML = L.points.map((p) => `<li><span>${p}</span></li>`).join('');
  $('#lcard').dataset.phase = store.done[L.id] ? 'meet' : store.phase[L.id] ?? 'meet';
  paintSteps();
  if (lessonStage && lessonStage.word !== L.word) { lessonStage.opts.colorOffset = Math.max(0, JELLY.indexOf(L.color)); lessonStage.setWord(L.word); }
}
$('#lNext').onclick = () => { const p = $('#lcard').dataset.phase; if (p === 'meet') setPhase('brain'); else if (p === 'brain') setPhase('mission'); else step(1); };
$('#lBack').onclick = () => setPhase($('#lcard').dataset.phase === 'mission' ? 'brain' : 'meet');
$('#lPhases').onclick = (e) => { const li = e.target.closest('[data-p]'); if (li) setPhase(li.dataset.p); };
// Start over: untick this mission's steps and give the sandbox a fresh start. Jellies already earned stay in the jar.
""")
rep("    if (changed) { save(); if (L === LESSONS[cur]) paintSteps();", "    if (changed) { save(); if (L === LESSONS[cur]) paintSteps(true);")
rep("$('#resetYes').onclick = () => { store.done = {}; store.steps = {}; store.tour = {}; store.tipsOff = false; save();", "$('#resetYes').onclick = () => { store.done = {}; store.steps = {}; store.phase = {}; save();")

# ---------- JS: the guide shrinks to "you earned a jelly, next up is..." ----------
region("/* ---------------- the guide: numbered areas, a moving spotlight, and \"next up\" ---------------- */", "/* the end of a section: jelly into the jar, then a clear \"next up\" */", """/* ---------------- the end of a section: jelly into the jar, then a clear "next up" ---------------- */
const bean = (color, cls = '') => `<svg class="bean-svg ${cls}" viewBox="0 0 60 70" aria-hidden="true"><path d="M30 4c18 0 26 14 24 32-2 20-12 30-25 30S5 56 6 38C7 18 12 4 30 4z" fill="${color}" stroke="${INK}" stroke-width="4"/><ellipse cx="18" cy="15" rx="5" ry="3" fill="#fff" opacity=".55"/><ellipse cx="22" cy="29" rx="7" ry="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/><ellipse cx="38" cy="29" rx="7" ry="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/><g class="pp"><circle cx="22" cy="31" r="3.6" fill="${INK}"/><circle cx="38" cy="31" r="3.6" fill="${INK}"/></g><path d="M22 45q8 7 16 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></svg>`;
const upnext = $('#upnext'), G = { card: false };
function renderGuide() { upnext.hidden = !G.card; }
""", keep_end=False)
rep("""  G.card = true; G.tour = false; store.tour[id] = 'done'; save();""", """  G.card = true;""")
rep("""<div class="un-btns"><button class="btn go un-go" id="unGo">Go to ${esc(n.lesson ? n.tag : n.label)} →</button>""", """<div class="un-btns"><button class="btn go un-go" id="unGo">Go to ${esc(n.lesson ? n.tag : n.label)} →${ENTER}</button>""")
rep("""<div class="un-btns"><button class="btn go un-go" id="unGo">See what I’ve learnt →</button>""", """<div class="un-btns"><button class="btn go un-go" id="unGo">See what I’ve learnt →${ENTER}</button>""")
rep("""  flyToJar(upnext.querySelector('.un-bean'), item.color);
  return true;""", """  flyToJar(upnext.querySelector('.un-bean'), item.color);
  $('#unGo').focus({ preventScroll: true });
  return true;""")
rep("""  const last = [...document.querySelectorAll('.bean.on')].at(-1), jar = last?.offsetParent ? last : $('#jarCount');""",
    """  const app = $('.app'), tucked = app.classList.contains('focus') && !app.classList.contains('peek');
  const last = [...document.querySelectorAll('.bean.on')].at(-1), jar = tucked ? $('#navHandle') : last?.offsetParent ? last : $('#jarCount');""")
rep("upPill.onclick = () => go(nextUp().id);\n", "")
rep("$('#unStay').onclick = () => { G.card = false; renderGuide(); };", "$('#unStay').onclick = () => { G.card = false; renderGuide(); primaryButton()?.focus({ preventScroll: true }); };")

# ---------- JS: overview and backstage buttons say Enter too ----------
rep("""    $('#townNext').textContent = s.cta ? 'Zoom in on the screen' : 'Next';
    $('#townNext').classList.toggle('go', !!s.cta);""", """    $('#townNext').innerHTML = (s.cta ? 'Zoom in on the screen' : 'Next') + ENTER;
    $('#townNext').classList.add('go');""")
rep("$('#startBtn').onclick = () => go('whole');", "$('#startBtn').onclick = () => go('whole');\n$('#bsNext').onclick = () => go(nextUp().id);")
rep("  store.done[id] = true; save(); paintProgress();", "  store.done[id] = true; save(); paintProgress();\n  if (id === 'backstage') $('#p-backstage').dataset.played = '1';")
rep("function check(ev) {\n", "function check(ev) {\n  if ((ev.type === 'cmd' || ev.type === 'edit') && !touched && PANELS[panelIdx]?.lesson) { touched = true; paintRestart(); }\n")
rep("  toast(`Fresh start on ${L.word}!`); sound.boing(360, .35, .12);\n", "  freshStart(L);\n")
exec(open('engine/shelly-patch.py').read())
open('build/jelly-shell.src.html', 'w').write(s)
print('ok')
