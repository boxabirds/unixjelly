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
rep('<h1>Jelly Shell needs a bigger screen</h1>', '<h1>Jelly Web needs a bigger screen</h1>')
rep('<span class="more"> Letters in Titan One', f'<span class="more"> The third guide, after <a href="{SHELL_URL}" target="_blank" rel="noopener">Jelly Shell</a> and <a href="{GIT_URL}" target="_blank" rel="noopener">Jelly Git</a>. Letters in Titan One')
rep('<div class="eyebrow">A wobbly guide to the command line</div>', '<div class="eyebrow">A wobbly guide to the web</div>')
rep('<h1>Boss your computer around with <em>tiny words</em>.</h1>', '<h1>Make a <em>web page</em>, then send it round the world.</h1>')
rep('<p>These words were invented in 1971. They still work today on Macs, Linux, Raspberry Pis and most of the computers that run the internet. Learn them once, use them for life.</p>',
    '<p>Every web page is a text file that crosses the planet in less than a second. Find out how, write your own page, and put it on the internet for real. Best after Jelly Shell and Jelly Git.</p>')
rep('aria-label="Wobbly 3D jelly letters spelling ls, cd and cat. Drag them to squish."', 'aria-label="Wobbly 3D jelly letters spelling web. Drag them to squish."')
rep('<p>Follow one command, <code>ls</code>, all the way down to the disk and back up. Press Next. Drag to spin it, scroll to zoom, double-click to straighten up.</p>',
    '<p>Follow one web page, <code>gerbil.zone</code>, from your screen to a server far away and back. Press Next. Drag to spin it, scroll to zoom, double-click to straighten up.</p>')
rep('aria-label="A 3D cartoon of a computer cut into layers: you and the terminal, the shell, the kernel, the hardware and the file tree."',
    'aria-label="A 3D cartoon of the trip a web page takes: your computer, your router, the DNS phonebook, the internet under the sea, and the server."')
rep('<p>Someone types at the green screen. Then it flips around, and you see the crew inside putting the command together.</p>',
    '<p>Someone types an address into the browser. Then it flips around, and you see the crew that fetches and builds the page.</p>')
rep('<span class="face-tag">Front: the green screen</span>', '<span class="face-tag">Front: the browser</span>')
rep('<div class="crt-brand">JELLY-TERM 3000</div>', '<div class="crt-brand">JELLY-SCREEN 3000</div>')
rep('aria-label="Press Enter to watch ls happen"', 'aria-label="Press Enter to watch gerbil.zone load"')
region('<div class="face back" id="back">', '          </div>\n        </div>\n      </div>\n      <div class="show-ui">', '''<div class="face back" id="back">
              <span class="face-tag">Backstage</span>
              <div class="tiles" id="tiles"></div>
              <div class="pageframe"><div class="pf-bar" id="pfBar"></div><div class="pf-body" id="pfBody"></div></div>
              <div class="sign" style="left:5%;bottom:2%">THE BROWSER WINDOW</div>
              <div class="actor" id="aOwl" style="left:44%;top:13%;width:15%"></div>
              <div class="sign" style="left:44%;top:3%">DNS PHONEBOOK</div>
              <div class="actor" id="aRouter" style="left:46%;bottom:5%;width:12%"></div>
              <div class="sign" style="left:47.5%;bottom:2%">ROUTER</div>
              <div class="cable"></div>
              <div class="actor" id="aServer" style="left:73%;bottom:6%;width:22%"></div>
              <div class="sign" id="serverSign" style="left:73%;bottom:2%">THE SERVER</div>
              <div class="actor" id="aBrowsy" style="left:30%;bottom:4%;width:11%;z-index:4"></div>
              <div class="envelope" id="env"></div>
              <div class="bubble" id="bOwl" style="left:60%;top:12%"></div>
            </div>
''')
rep('<span><b>Ready?</b> Press <kbd>Enter</kbd> on your keyboard (or click the yellow key) and watch what happens inside the computer.</span>',
    '<span><b>Ready?</b> Press <kbd>Enter</kbd> on your keyboard (or click the yellow key) and watch the crew fetch a web page.</span>')
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
region('  build() {', '  pt(name) {', open(V + 'town.js').read())
region('  pt(name) {', '  fly(names, text, dur = 1.6) {', '''  pt(name) {
    const Y = this.Y, P = {
      kbd: [.3, Y.desk + 1.2, .45], scr: [.3, Y.desk + 1.7, .2], deskT: [2.9, Y.desk + .8, 0], routerT: [2.9, Y.router + .8, 0], dnsT: [5.3, Y.router + .8, 0], dns: [6.4, Y.router + 1.5, .6],
      seaT: [2.9, Y.sea + .6, 0], sea: [.4, Y.sea + .55, 1], serverT: [2.9, Y.server + .8, 0], server: [.8, Y.server + 1.7, .7],
    };
    return new THREE.Vector3(...P[name]);
  }
''')
i = s.index('    this.platters.forEach'); j = s.index('\n', s.index("Object.entries(this.treeNodes)", i))
s = s[:i] + '''    this.leds.forEach((m, k) => { m.visible = Math.sin(t * (this.step === 3 ? 22 : 6) + k * 1.7) > -.2; });
    this.racks.forEach((m, k) => { m.material.color.set(Math.sin(t * (this.step === 4 ? 18 : 4) + k * 2.3) > 0 ? '#4dff8b' : '#1f6b3a'); });
    this.owl.rotation.y = Math.sin(t * 1.2) * .3 + (this.step === 2 ? Math.sin(t * 9) * .15 : 0);
    this.owl.position.y = .2 + (this.step === 2 ? Math.abs(Math.sin(t * 6)) * .15 : 0);
    this.bookPage.rotation.z = this.step === 2 ? Math.sin(t * 5) * .5 - .25 : 0;
    const a = t * .6; this.fin.position.set(Math.cos(a) * 1.55, .45, Math.sin(a) * 1.1); this.fin.rotation.y = -a;
    this.kid.position.y = .2 + (this.step === 1 ? Math.abs(Math.sin(t * 12)) * .05 : 0);''' + s[j:]
region('const TOWN_STEPS = [', '\n];\n', '''const TOWN_STEPS = [
  { who: 'The whole game', text: 'Loading one web page is a trip with five stops: your computer, your router, the DNS phonebook, the internet, and a server far away. Press Next to follow one page all the way there and back.', cam: [3.5, 3, 23], look: [3, .6, 0] },
  { who: 'Your computer', text: 'You type gerbil.zone into the browser and press Enter. The browser is a program that fetches pages and draws them. But it has a problem: it has no idea where gerbil.zone is.', cam: [3.8, -1.6, 9.2], look: [.6, -3.7, 0], fly: [['kbd', 'scr'], 'gerbil.zone'] },
  { who: 'The DNS phonebook', text: 'Computers only understand numbers. So your computer asks the DNS phonebook: "What is the number for gerbil.zone?" The owl looks it up: 203.0.113.7. Now it knows where to send the letter.', cam: [6.5, 1.4, 9.5], look: [4.6, -.6, 0], fly: [['scr', 'deskT', 'routerT', 'dnsT', 'dns'], 'gerbil.zone = ?', 2.2] },
  { who: 'Your router and the internet', text: 'The browser writes a polite letter: GET /, which means "your home page, please". Your router sends it out across the internet, through cables that run along the bottom of the sea. A shark was once filmed biting one!', cam: [3.6, 3.8, 9], look: [.8, 1.2, 0], fly: [['dns', 'dnsT', 'routerT', 'seaT', 'sea'], 'GET /', 2.2] },
  { who: 'The server', text: 'The letter arrives at the server: a computer in a giant building that never sleeps. It reads the letter, finds index.html in a folder (just like cat), and writes back.', cam: [3.6, 8.6, 7], look: [.3, 7.1, 0], fly: [['sea', 'seaT', 'serverT', 'server'], 'GET /'] },
  { who: 'All the way back', text: 'The reply rides back: 200 OK, plus the HTML. Under the sea, through your router, onto your screen. Your browser reads the HTML and builds the page, box by box. All in less than a second.', cam: [3.8, -1.6, 9.2], look: [.6, -3.7, 0], fly: [['server', 'serverT', 'seaT', 'routerT', 'deskT', 'scr'], '200 OK', 2.8] },
  { who: 'That is the whole game', text: 'Type an address, look up the number, send a GET, the server replies, the browser builds. Every page you have ever seen made this trip. Now let\\'s zoom in and watch the crew do it.', cam: [3.5, 3, 23], look: [3, .6, 0], cta: true },
];
''', keep_end=False)
region('/* ---------------- section 2: backstage show ---------------- */', '/* ---------------- section 3: the pretend computer ---------------- */', open(V + 'show.js').read())
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
rep("function resetFS() {\n  sh.root = seed(); sh.home = find('/home/kid'); sh.cwd = sh.home; sh.userDirs.clear(); sh.showHidden = false;\n}",
    "function resetFS(fresh = true) {\n  const saved = !fresh && loadFS();\n  sh.root = saved || seed(); sh.home = find('/home/kid'); sh.cwd = (saved && find(store.web.cwd)) || sh.home; sh.userDirs.clear(); sh.showHidden = false;\n  if (!saved) webSeed();\n}")
rep("const MAN = {\n", """const MAN = {
  curl: ['curl - see URL: fetch a web page as text', 'curl [-I] [-v] [-L] address', 'Asks a server for a page and prints what comes back. -I shows only the envelope (headers). -v shows the letters going both ways. -L follows "moved" replies.', 'curl https://jelly.fun'],
  ping: ['ping - sonar for computers', 'ping [-c count] name', 'Sends tiny messages to a computer and times how long each echo takes to come back. Ctrl+C stops it.', 'ping jelly.fun'],
  nslookup: ['nslookup - look a name up in the phonebook (DNS)', 'nslookup name', 'Turns a name like jelly.fun into the number computers use to find it.', 'nslookup jelly.fun'],
  open: ['open - open something in the browser', 'open file-or-address', 'Shows a file or a web address in the browser on the right.', 'open site/index.html'],
  git: ['git - a time machine for your code', 'git <word>', 'Here we only need the publishing words: status, add, commit, push.', 'git status'],
""")
rep("    case 'help': say('Words I know: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history', 'whoami', 'date'].join('  '));",
    """    case 'curl': curlRun(args, say, fail, info); break;
    case 'nslookup': case 'dig': case 'host': lookupRun(rest, say, fail, info); break;
    case 'ping': pingRun(args, say, fail, info); break;
    case 'open': case 'xdg-open': openRun(rest, fail, info); break;
    case 'git': webGit(args, say, fail, info); break;
    case 'wget': fail('wget: command not found', 'wget is curl\\'s cousin. Here we use curl.'); break;
    case 'help': say('Web words: ' + ['curl', 'ping', 'nslookup', 'open', 'git'].join('  ')); say('Shell words: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history'].join('  '));""")
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
rep("  cur = i; const L = LESSONS[i]; store.cur = L.id; save();", "  cur = i; const L = LESSONS[i]; store.cur = L.id; save();\n  webLesson(L);")
# Start over unticks the mission. Only Gerald's mission puts files back, so your own website is never wiped by accident.
rep("  resetSandbox(); paintSteps(); termIn.focus({ preventScroll: true });",
    "  if (L.project === 'gerald') { resetGerald(); } else { stopPing(); sh.cwd = sh.home; termOut.innerHTML = ''; welcome(); paintPrompt(); }\n  renderMap(); webLesson(L); paintSteps();")
rep("word: 'ls cd cat', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.4, lookY: .85", "word: 'web', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 3, frame: 1.5, lookY: .8")
rep("""    if (s.fly) { town.fly(s.fly[0], s.fly[1], s.fly[2]); sound.boing(500, .3, .08); town.onLand = () => { if (s.screen) town.drawScreen(s.screen); sound.blip(); }; }
    else { town.curve = null; town.packet.visible = town.packetLabel.visible = false; }
    if (i === 0) town.drawScreen(['kid@jelly:~$ _']);""", """    town.setState(i, !s.fly);
    if (s.fly) { town.fly(s.fly[0], s.fly[1], s.fly[2]); sound.boing(500, .3, .08); town.onLand = () => { town.setState(i, true); sound.blip(); }; }
    else { town.curve = null; town.packet.visible = town.packetLabel.visible = false; }""")
rep("if (TOWN_STEPS[town.step].cta) { go('backstage'); setTimeout(() => runShow('ls'), REDUCED ? 0 : 500); return; }", "if (TOWN_STEPS[town.step].cta) { go('backstage'); setTimeout(() => runShow('page'), REDUCED ? 0 : 500); return; }")
rep("else if (PANELS[panelIdx]?.lesson && $('#lcard').dataset.phase === 'mission') { e.preventDefault(); termIn.focus({ preventScroll: true }); }", "else if (PANELS[panelIdx]?.lesson && $('#lcard').dataset.phase === 'mission') { e.preventDefault(); (WB.tool === 'edit' ? edText : termIn).focus({ preventScroll: true }); }")
rep("resetFS(); welcome(); paintPrompt(); renderMap(); paintProgress();", "resetFS(false); welcome(); paintPrompt(); renderMap(); paintProgress();")
region('/* recap data */', '/* end recap data */\n', open(V + 'recap.js').read(), keep_end=False)
open('build/jelly-web.src.html', 'w').write(s)
print('ok')
