import re
s = open('build/jelly-shell.src.html').read()
V = 'guides/web/'
SHELL_URL = 'https://claude.ai/artifact/QKpnE1d1poehF9u2UX1wsW'
GIT_URL = 'https://claude.ai/artifact/FNCb8eUqjBgFrCNvkBfxSr'
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)
def region(start, end, new, keep_end=True):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + (s[j:] if keep_end else s[j + len(end):])

# ---------- page shell ----------
rep('<title>Jelly Shell</title>', '<title>Jelly Web</title>')
rep('<div class="brand">Jelly <b>Shell</b></div>', '<div class="brand">Jelly <b>Web</b></div>')
rep('aria-label="Jelly Shell navigation"', 'aria-label="Jelly Web navigation"')
rep('<span class="more"> Letters in Titan One', f'<span class="more"> The third guide, after <a href="{SHELL_URL}" target="_blank" rel="noopener">Jelly Shell</a> and <a href="{GIT_URL}" target="_blank" rel="noopener">Jelly Git</a>. Letters in Titan One')
rep('<div class="eyebrow">A wobbly guide to the command line</div>', '<div class="eyebrow">A wobbly guide to the web</div>')
rep('<h1>Boss your computer around with <em>tiny words</em>.</h1>', '<h1>Make a <em>web page</em>, then send it round the world.</h1>')
rep('<p>These words were invented in 1971. They still work today on Macs, Linux, Raspberry Pis and most of the computers that run the internet. Learn them once, use them for life.</p>',
    '<p>Every web page is a text file that crosses the planet in less than a second. Find out how, write your own page, and put it on the internet for real.</p>')
rep('aria-label="Wobbly 3D jelly letters spelling ls, cd and cat. Drag them to squish."', 'aria-label="Wobbly 3D jelly letters spelling web. Drag them to squish."')
rep('<p>Follow one command, <code>ls</code>, all the way down to the disk and back up. Press Next. Drag to spin it, scroll to zoom, double-click to straighten up.</p>',
    '<p>Follow one web page, <code>gerbil.zone</code>, from your screen to a server far away and back. Press Next. Drag to turn the world, scroll to zoom, double-click to straighten up.</p>')
rep('aria-label="A 3D cartoon of a computer cut into layers: you and the terminal, the shell, the kernel, the hardware and the file tree."',
    'aria-label="A 3D cartoon world: your house with your computer upstairs and the router downstairs, the DNS owl in a treehouse next door, the internet cable along the bottom of a cut-open sea, and the server in a building on the far shore."')
rep('''          <button class="btn" data-show="ls">Play <code>ls</code></button>
          <button class="btn" data-show="cat">Play <code>cat secret-diary.txt</code></button>
          <button class="btn" data-show="mv">Play <code>mv hamster.txt sir-fluffington.txt</code></button>''',
'''          <button class="btn" data-show="page">Play <code>gerbil.zone</code></button>
          <button class="btn" data-show="nope">Play <code>gerbil.zone/nope</code></button>
          <button class="btn" data-show="teapot">Play <code>teapot.jelly/coffee</code></button>''')
# the lesson: a workbench (editor + terminal) and a browser instead of the file tree
region('        <div class="term box" id="term">', '        <!-- /tools -->', '''        <div class="term box work" id="term" data-tool="term">
          <div class="term-top"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="wtabs" role="tablist" aria-label="Tools"><button class="wtab" data-tool="edit">Editor</button><button class="wtab" data-tool="term">Terminal</button></div><span id="termTitle">kid@jelly: ~</span><button id="sbReset" title="Put the whole pretend computer back the way it started">Reset sandbox</button></div>
          <div class="tool-edit" id="toolEdit">
            <div class="ed-files" id="edFiles"></div>
            <div class="ed-wrap"><div class="ed-gutter" id="edGut" aria-hidden="true"></div><div class="ed-area"><pre class="ed-hl" id="edHl" aria-hidden="true"></pre><textarea id="edText" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="HTML editor"></textarea></div></div>
            <div class="ed-check" id="edCheck" aria-live="polite"></div>
            <div class="ed-keys" aria-label="Helper keys"><button data-ins="&lt;">&lt;</button><button data-ins="&gt;">&gt;</button><button data-ins="&lt;/">&lt;/</button><button data-ins="=">=</button><button data-ins='"'>"</button><button data-ins="{ }">{ }</button><small>Saved as you type</small></div>
          </div>
          <div class="term-body" id="termBody"><div id="termOut"></div><div class="inline" id="termLine"><span class="p" id="termPrompt"></span><input id="termIn" placeholder="type here, then press Enter ↵" aria-label="Type a command" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go"></div></div>
          <div class="keys term-keys" aria-label="Helper keys"><button data-k="tab">Tab</button><button data-k="up">↑</button><button data-k="down">↓</button><button data-k="ctrlc">Ctrl+C</button><button data-k="ins" data-v="~">~</button><button data-k="ins" data-v="/">/</button><button data-k="ins" data-v="..">..</button><button data-k="ins" data-v="https://">https://</button><button data-k="enter">Enter</button></div>
        </div>
        <div class="map box browser" id="browser">
          <div class="bw-top"><button class="bw-nav" id="bwBack" aria-label="Back" disabled>←</button><button class="bw-lock" id="bwLock" aria-label="Site information"></button><input id="bwUrl" aria-label="Address bar" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" enterkeyhint="go"></div>
          <div class="bw-journey" id="bwJourney" aria-live="polite"></div>
          <div class="bw-view"><iframe id="bwFrame" sandbox="allow-same-origin" title="The web page"></iframe><pre class="bw-source" id="bwSource" hidden></pre><div class="bw-boxes" id="bwBoxes" hidden></div><div class="bw-pop" id="bwPop" role="dialog" hidden></div></div>
          <div class="bw-tabs"><button data-view="page">Page</button><button data-view="source">View source</button><button data-view="boxes">Boxes</button></div>
        </div>
''')
rep('</style>', open(V + 'web.css').read() + '</style>', 1)
rep('<a class="ni" href="#${p.id}" data-id="${p.id}" data-teaches=', '<a class="ni" href="#${p.id}" data-id="${p.id}" title="${esc(p.label)}" data-teaches=')

# ---------- script ----------
rep("const KEY = 'jellyshell.v1';", "const KEY = 'jellyweb.v1';")
exec(open('engine/use-overview.py').read())
# Backstage: the world up close (engine/use-backstage.py, Backstage in overview.js)
BS_HEAD = 'The same world, up close. Pick an address and follow it: Browsy splits it, the DNS owl looks up the number, the letter crosses the sea, and the server answers.'
BS_LABEL = 'The cut-open world from the Overview. Browsy the browser splits the address you pick into its parts, the DNS owl looks up the number, the letter crosses the internet cable under the sea to the server, and the reply comes back: a page, a 404, or a teapot saying 418.'
BS_PICK, BS_FIRST = 'an address', 'page'
exec(open('engine/use-backstage.py').read())
rep("const BIN = ['cat', 'clear', 'cp', 'echo', 'ls', 'man', 'mkdir', 'mv', 'pwd', 'rm', 'touch'];", "const BIN = ['cat', 'clear', 'cp', 'curl', 'echo', 'git', 'ls', 'man', 'mkdir', 'mv', 'nslookup', 'open', 'ping', 'pwd', 'rm', 'touch'];")
INDEX = '<!DOCTYPE html>\\n<html>\\n  <head>\\n    <title>My page</title>\\n  </head>\\n  <body>\\n    <h1>Hello, world!</h1>\\n    <p>This is my very own web page.</p>\\n  </body>\\n</html>\\n'
ABOUT = '<!DOCTYPE html>\\n<html>\\n  <head>\\n    <title>About me</title>\\n  </head>\\n  <body>\\n    <h1>About me</h1>\\n    <p>I am learning HTML. It is going great.</p>\\n    <p><a href="index.html">Back home</a></p>\\n  </body>\\n</html>\\n'
GERALD = '<!DOCTYPE html>\\n<html>\\n  <head>\\n    <title>Gerald\\\'s Homepage</title>\\n  </head>\\n  <body>\\n    <h1>Welcome to Gerald\\\'s Homepage\\n    <p>I am Gerald. I am a gerbil. I like seeds, caves and websites.</p>\\n    <img src="gerbal.png" alt="A photo of me"/>\\n    <p>Read <a href="abuot.html">all about me</a>.</p>\\n  </body>\\n</html>\\n'
GABOUT = '<!DOCTYPE html>\\n<html>\\n  <head>\\n    <title>About Gerald</title>\\n  </head>\\n  <body>\\n    <h1>All about Gerald</h1>\\n    <p>Favourite food: sunflower seeds. Favourite place: a dark cave. Favourite person: you, for fixing my website.</p>\\n    <p><a href="index.html">Home</a></p>\\n  </body>\\n</html>\\n'
region('  const spec = {', '  const make = (name, content, parent) => {', f'''  const spec = {{
    'bin/': Object.fromEntries(BIN.map((n) => [n, '01001010 01000101 01001100 01001100 01011001\\n(This is a program. It is written in computer language, so it looks like gibberish to us.)'])),
    'home/': {{
      'kid/': {{
        'notes.txt': 'Website ideas:\\n- a page about my gerbil\\n- a page about pizza\\n- a secret page (shh)',
        'site/': {{ 'index.html': '{INDEX}', 'about.html': '{ABOUT}', 'images/': {{ 'gerbil.png': 'PNG:gerbil', 'rocket.png': 'PNG:rocket' }} }},
        'gerald/': {{ 'index.html': '{GERALD}', 'about.html': '{GABOUT}', 'gerbil.png': 'PNG:gerbil' }},
      }},
    }},
    'tmp/': {{}},
  }};
''')
rep("function resetFS() {\n  SH.reset(seed());\n}",
    "function resetFS(fresh = true) {\n  const saved = !fresh && loadFS();\n  SH.reset(saved || seed());\n  if (saved) sh.cwd = find(store.web.cwd) || sh.home;\n  if (!saved) webSeed();\n}")
rep("const MAN = {\n", """const MAN = {
  curl: ['curl - see URL: fetch a web page as text', 'curl [-I] [-v] [-L] address', 'Asks a server for a page and prints what comes back. -I shows only the envelope (headers). -v shows the letters going both ways. -L follows "moved" replies.', 'curl https://jelly.fun'],
  ping: ['ping - sonar for computers', 'ping [-c count] name', 'Sends tiny messages to a computer and times how long each echo takes to come back. Ctrl+C stops it.', 'ping jelly.fun'],
  nslookup: ['nslookup - look a name up in the phonebook (DNS)', 'nslookup name', 'Turns a name like jelly.fun into the number computers use to find it.', 'nslookup jelly.fun'],
  open: ['open - open something in the browser', 'open file-or-address', 'Shows a file or a web address in the browser on the right.', 'open site/index.html'],
  git: ['git - a time machine for your code', 'git <word>', 'Here we only need the publishing words: status, add, commit, push.', 'git status'],
""")
# terminal: ping keeps running until Ctrl+C; the line typed goes along with each event
rep("const paintPrompt = () => { termPrompt.textContent = sh.catMode ? '' : promptText();", "const paintPrompt = () => { termPrompt.textContent = sh.catMode || sh.ping ? '' : promptText();")
rep("  const line = termIn.value; termIn.value = '';\n", "  const line = termIn.value; termIn.value = '';\n  if (sh.ping) return; // ping is still talking; Ctrl+C stops it\n")
rep("    check({ type: 'cmd', ...r, cwd: pathOf(sh.cwd) });\n  }\n}", "    check({ type: 'cmd', ...r, line, cwd: pathOf(sh.cwd) });\n  }\n}")
rep("    if (lessonStage && lessonStage.word.replace(/ /g, '') === (r.toks.join('')).slice(0, lessonStage.word.replace(/ /g, '').length) && r.ok) lessonStage.hopAll(.8);",
    "    if (lessonStage && r.ok && r.toks.join(' ').toLowerCase().includes(lessonStage.word.toLowerCase())) lessonStage.hopAll(.8);")
rep("function ctrlC() {\n", "function ctrlC() {\n  if (sh.ping) { print('<span class=\"er\">^C</span>'); stopPing(); check({ type: 'ctrlc', ping: true }); return; }\n")
rep("addEventListener('keydown', (e) => { if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'd' && !$('#p-lesson').hidden) {", "addEventListener('keydown', (e) => { if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'd' && !$('#p-lesson').hidden && e.target !== edText && e.target !== bwUrl) {")
rep("function resetSandbox() { resetFS(); sh.catMode = false; termIn.value = ''; termOut.innerHTML = ''; welcome(); paintPrompt(); renderMap(); }\n$('#sbReset').onclick = resetSandbox;",
    """function resetSandbox() { resetFS(); webReset(); sh.catMode = false; termIn.value = ''; termOut.innerHTML = ''; welcome(); paintPrompt(); renderMap(); }
// Your website lives in the sandbox, so wiping it asks twice.
let sbArmed = 0;
$('#sbReset').onclick = () => {
  const b = $('#sbReset');
  if (!sbArmed) { b.textContent = 'Wipe my website too?'; b.classList.add('armed'); sbArmed = setTimeout(() => { sbArmed = 0; b.textContent = 'Reset sandbox'; b.classList.remove('armed'); }, 3500); return; }
  clearTimeout(sbArmed); sbArmed = 0; b.textContent = 'Reset sandbox'; b.classList.remove('armed');
  resetSandbox(); toast('Sandbox reset. A fresh computer!');
};""")
i = s.index('function welcome() {'); j = s.index('\n}\n', i)
s = s[:i] + """function welcome() {
  print('<span class="tip">Welcome to the web sandbox! A pretend computer on a pretend internet, so nothing here can break.</span>');
  print('<span class="mute">Your website is in the folder site. Type help to see the words I know.</span>');""" + s[j:]
region('/* file tree map with FLIP animations */', '/* ---------------- lessons + progress ---------------- */', open(V + 'web.js').read())
region('const isCmd = (e, c)', 'const ALL = [', open(V + 'lessons.js').read())
exec(open('engine/use-demos.py').read())
rep("  cur = i; const L = LESSONS[i]; store.cur = L.id; save();", "  cur = i; const L = LESSONS[i]; store.cur = L.id; save();\n  webLesson(L);")
# Start over unticks the mission. Only Gerald's mission puts files back, so your own website is never wiped by accident.
rep("  resetSandbox(); paintSteps(); termIn.focus({ preventScroll: true });",
    "  if (L.project === 'gerald') { resetGerald(); } else { stopPing(); sh.cwd = sh.home; termOut.innerHTML = ''; welcome(); paintPrompt(); }\n  renderMap(); webLesson(L); paintSteps();")
rep("word: 'ls cd cat', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.4, lookY: .85", "word: 'web', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 3, frame: 1.5, lookY: .8")
rep("else if (PANELS[panelIdx]?.lesson && $('#lcard').dataset.phase === 'mission') { e.preventDefault(); termIn.focus({ preventScroll: true }); }", "else if (PANELS[panelIdx]?.lesson && $('#lcard').dataset.phase === 'mission') { e.preventDefault(); (WB.tool === 'edit' ? edText : termIn).focus({ preventScroll: true }); }")
rep("resetFS(); welcome(); paintPrompt(); renderMap(); paintProgress();", "resetFS(false); welcome(); paintPrompt(); renderMap(); paintProgress();")
region('/* recap data */', '/* end recap data */\n', open(V + 'recap.js').read(), keep_end=False)
# Web's lessons build on each other (the website you make), so its sandbox carries on between lessons.
rep("const FRESH_SANDBOX = true;", "const FRESH_SANDBOX = false;")
open('build/jelly-web.src.html', 'w').write(s)
print('ok')
