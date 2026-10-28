# Web Jelly 1: the Shell engine, with the block editor (editor.html) as the mission's workbench instead of the terminal.
# No terminal is shown anywhere. The engine's terminal and file tree stay in the page, hidden, because the engine uses them.
import json
s = open('build/jelly-shell.src.html').read()
V = 'guides/web/'
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:90], s.count(a)); s = s.replace(a, b)
def region(start, end, new, keep_end=True):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + (s[j:] if keep_end else s[j + len(end):])

# ---------- page shell ----------
rep('<title>Shell Jelly</title>', '<title>Web Jelly 1</title>')
rep('<div class="brand"><b>Shell</b> Jelly</div>', '<div class="brand"><b>Web</b> Jelly <b>1</b></div>')
rep('aria-label="Shell Jelly navigation"', 'aria-label="Web Jelly 1 navigation"')
rep('<div class="eyebrow">A wobbly guide to the command line</div>', '<div class="eyebrow">A wobbly guide to the web</div>')
rep('<h1>Boss your computer around with <em>tiny words</em>.</h1>', '<h1>Build your own <em>web pages</em>.</h1>')
rep('<p>These words were invented in 1971. They still work today on Macs, Linux, Raspberry Pis and most of the computers that run the internet. Learn them once, use them for life.</p>',
    '<p>Every web page is made of blocks. Build pages from blocks, move them around, find the tags underneath, then write the real thing: HTML. Finish with an adventure game of your own.</p>')
rep('aria-label="Wobbly 3D jelly letters spelling ls, cd and cat. Drag them to squish."', 'aria-label="Wobbly 3D jelly letters spelling web. Drag them to squish."')
rep("word: 'ls cd cat', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.4, lookY: .85", "word: 'web', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 3, frame: 1.5, lookY: .8")
rep("const KEY = 'jellyshell.v1';", "const KEY = 'jellyweb.v2';")
# no 3D tour or backstage show: this course goes straight to building
rep("""  { id: 'whole', group: 'The big picture', label: 'Overview', tag: '1', color: '#ffc61a' },
  { id: 'backstage', group: 'The big picture', label: 'Backstage', tag: '2', color: '#9b5cff' },
""", "")
rep("seen = !!store.done.whole;", "seen = true;")
rep('<button class="btn go" id="startBtn">Start the tour', '<button class="btn go" id="startBtn">Start the first lesson')
rep("$('#startBtn').onclick = () => go('whole');", "$('#startBtn').onclick = () => go(LESSONS[0].id);")

# ---------- the workbench: the block editor, or the live examples ----------
rep('<div class="term box" id="term">', '<div class="term box" id="term" hidden>')
rep('<div class="map box">', '<div class="map box" hidden>')
rep('        <!-- /tools -->', '''        <iframe class="box" id="editor" title="The block editor: your page as blocks, and the page itself"></iframe>
        <div class="web-demos" id="webDemos" hidden>
          <section><h4>Draw</h4><canvas id="demoDraw" width="480" height="360" aria-label="A drawing box"></canvas><p>The page draws as you move. <button class="btn alt small" id="demoClear">Clear</button></p></section>
          <section><h4>3D</h4><div class="demo-spin" id="demoSpin" aria-label="A 3D jelly cube: drag to spin it"><div class="demo-cube" id="demoCube"><i></i><i></i><i></i><i></i><i></i><i></i></div></div><p>Drag it to spin it round.</p></section>
          <section><h4>Sound</h4><div class="demo-drums" id="demoDrums"></div><p>Tap the jelly drums.</p></section>
        </div>
        <!-- /tools -->''')
# a change in the editor counts as starting the mission, like typing a command does
rep("if ((ev.type === 'cmd' || ev.type === 'edit') && !touched", "if ((ev.type === 'cmd' || ev.type === 'edit' || ev.type === 'blocks') && !touched")
rep("  cur = i; const L = LESSONS[i]; store.cur = L.id; save();", "  cur = i; const L = LESSONS[i]; store.cur = L.id; save();\n  webLesson(L);")
# Start over: the website goes back to how it was when this exercise's mission began (web.js keeps a copy), every
# step is unticked, and an unfinished exercise's jelly can be earned again
rep("  resetSandbox(); paintSteps(); termIn.focus({ preventScroll: true });", "  paintSteps();")
rep("  freshStart(L);\n};", "  webStartOver(L); freshStart(L);\n};")
rep("  if (p === 'mission') sandboxFor = L.id;", "  if (p === 'mission') { sandboxFor = L.id; webMission(L); }")
rep("const FRESH_SANDBOX = true;", "const FRESH_SANDBOX = false;")

# The story can have its own headline (storyTitle): the lesson's title is then for "Remember it" and the mission
rep("  $('#lcard').dataset.phase = p; paintSteps(); sound.blip();", "  $('#lcard').dataset.phase = p; $('#lTitle').textContent = p === 'meet' && L.storyTitle ? L.storyTitle : L.title; paintSteps(); sound.blip();")
rep("  $('#lcard').dataset.phase = store.done[L.id] ? 'meet' : store.phase[L.id] ?? 'meet';", "  $('#lcard').dataset.phase = store.done[L.id] ? 'meet' : store.phase[L.id] ?? 'meet';\n  if ($('#lcard').dataset.phase === 'meet' && L.storyTitle) $('#lTitle').textContent = L.storyTitle;")
# "Remember it" can have its own picture (brainVisual), beside the points
rep('<ul class="points" id="lPoints"></ul></div>', '<div class="brain-row"><ul class="points" id="lPoints"></ul><div class="lvisual" id="lBrainVisual"></div></div></div>')
rep("$('#lVisual').innerHTML = L.visual ?? '';", "$('#lVisual').innerHTML = L.visual ?? ''; $('#lBrainVisual').innerHTML = L.brainVisual ?? '';")

# ---------- lessons, recap, the editor and styles ----------
region('const isCmd = (e, c)', 'const ALL = [', open(V + 'lessons.js').read())
rep("const ALL = [{ id: 'whole', name: 'Overview', color: '#ffc61a' }, { id: 'backstage', name: 'Backstage', color: '#9b5cff' }, ...LESSONS];", "const ALL = [...LESSONS];")
region('/* recap data */', '/* end recap data */\n', open(V + 'recap.js').read(), keep_end=False)
web = open(V + 'web.js').read().replace('__EDITOR_HTML__', json.dumps(open(V + 'editor.html').read()).replace('</', '<\\/'))
rep("/* ---------------- boot ---------------- */", web + "\n/* ---------------- boot ---------------- */")
rep("</style>", open(V + 'web.css').read() + "</style>")
open('build/jelly-web.src.html', 'w').write(s)
print('ok')
