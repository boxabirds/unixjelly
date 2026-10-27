# Every guide with a 3D Backstage (Jelly Shell, Git, Web): the guide's Backstage world (Backstage in its overview.js, the
# Overview's house filmed closer, with SCENES to play) replaces the engine's flip card. Exec'd by the guide's build.py
# after use-overview.py, with these set:
#   BS_HEAD   the panel's paragraph       BS_LABEL  the canvas's description, for screen readers
#   BS_PICK   "a command", "an address"  BS_FIRST  the show Enter plays first (the others appear after it)
rep("""        <h2>Press Enter, then peek backstage</h2>
        <p>Someone types at the green screen. Then it flips around, and you see the crew inside putting the command together.</p>""",
    f"""        <h2>Backstage</h2>
        <p>{BS_HEAD} Drag to turn the house, scroll to zoom.</p>""")
region('      <div class="show-wrap">', '      <div class="show-ui">', f"""      <div class="show-wrap">
        <div class="cv box bs-house"><canvas id="bsCanvas" aria-label="{BS_LABEL}"></canvas></div>
      </div>
""")
rep('.show-wrap{flex:1;min-height:0;container-type:size;display:grid;place-items:center}', '.show-wrap{flex:1;min-height:0;display:flex}\n.bs-house{flex:1;background:#bfe6ff}')
rep('<span><b>Ready?</b> Press <kbd>Enter</kbd> on your keyboard (or click the yellow key) and watch what happens inside the computer.</span>',
    f'<span><b>Ready?</b> Press <kbd>Enter</kbd>, or pick {BS_PICK}, and follow it through the house.</span>')
region('/* ---------------- section 2: backstage show', '/* ---------------- section 3', """/* ---------------- section 2: backstage show ---------------- */
// Picking another command mid-show cuts straight to it; Backstage counts as done when a show plays to its end.
// The 3D only exists once boot() has run (a big enough window), which also builds the house if Backstage is open.
let showBusy = false, backstage = null, shows = 0, bsReady = false;
const bsStage = () => bsReady ? backstage ??= new Backstage($('#bsCanvas')) : null;
const showCap = (h) => { $('#showCap').innerHTML = `<span>${h}</span>`; fitAll($('#p-backstage')); };
async function runShow(id) {
  const n = ++shows; showBusy = true;
  if (!bsStage()) { showBusy = false; return; }
  backstage.resetView(); await backstage.play(id);
  if (n !== shows) return;
  showBusy = false; complete('backstage');
}
document.querySelectorAll('[data-show]').forEach((b) => { b.onclick = () => runShow(b.dataset.show); });

""")
rep("setTimeout(() => runShow('ls'), REDUCED ? 0 : 500)", f"setTimeout(() => runShow('{BS_FIRST}'), REDUCED ? 0 : 500)") # the Overview's last step plays the first show
rep("  if (P.id === 'recap') renderRecap();", "  if (P.id === 'recap') renderRecap();\n  if (P.id === 'backstage') bsStage();")
rep("  const town = PR.town = new Town($('#town'));", "  const town = PR.town = new Town($('#town'));\n  bsReady = true; if (PANELS[panelIdx]?.id === 'backstage') bsStage();")
rep("backstage: showBusy ? null : store.done.backstage ? $('#bsNext') : $('#enterKey')", f"""backstage: showBusy ? null : store.done.backstage ? $('#bsNext') : $('[data-show="{BS_FIRST}"]')""")
rep('#p-backstage:not([data-played]) .show-btns{display:none} /* first, just press Enter; the other shows appear afterwards */',
    f'#p-backstage:not([data-played]) .show-btns .btn:not([data-show="{BS_FIRST}"]){{display:none}} /* first, just the first show (or Enter); the others appear afterwards */')
