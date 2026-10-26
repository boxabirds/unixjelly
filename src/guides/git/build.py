import re
s = open('build/jelly-shell.src.html').read()
V = 'guides/git/'
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a)); s = s.replace(a, b)
def region(start, end, new, keep_end=True):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + (s[j:] if keep_end else s[j + len(end):])

# ---------- page shell ----------
rep('<title>Jelly Shell</title>', '<title>Jelly Git</title>')
rep('<div class="brand">Jelly <b>Shell</b></div>', '<div class="brand">Jelly <b>Git</b></div>')
rep('<span class="more"> Letters in Titan One', '<span class="more"> A companion to <a href="https://claude.ai/artifact/QKpnE1d1poehF9u2UX1wsW" target="_blank" rel="noopener">Jelly Shell</a>. Letters in Titan One')
rep('<div class="eyebrow">A wobbly guide to the command line</div>', '<div class="eyebrow">A wobbly guide to git and GitHub</div>')
rep('<h1>Boss your computer around with <em>tiny words</em>.</h1>', '<h1>Never lose your <em>code</em> again.</h1>')
rep('<p>These words were invented in 1971. They still work today on Macs, Linux, Raspberry Pis and most of the computers that run the internet. Learn them once, use them for life.</p>',
    '<p>git is a time machine for your code: it takes snapshots you can always go back to. GitHub keeps copies safe in the cloud. Invented in 2005, used by almost every programmer on the planet. Best after Jelly Shell.</p>')
rep('aria-label="Wobbly 3D jelly letters spelling ls, cd and cat. Drag them to squish."', 'aria-label="Wobbly 3D jelly letters spelling git. Drag them to squish."')
rep('<p>Follow one command, <code>ls</code>, all the way down to the disk and back up. Press Next. Drag to spin it, scroll to zoom, double-click to straighten up.</p>',
    '<p>Follow one change to <code>game.py</code> from your folder all the way up to GitHub. Press Next. Drag to spin it, scroll to zoom, double-click to straighten up.</p>')
rep('aria-label="A 3D cartoon of a computer cut into layers: you and the terminal, the shell, the kernel, the hardware and the file tree."',
    'aria-label="A 3D cartoon of git\'s four stops: your folder, the stage, the photo album, and GitHub in the cloud."')
rep('<p>Someone types at the green screen. Then it flips around, and you see the crew inside putting the command together.</p>',
    '<p>Someone types a git command at the green screen. Then it flips around, and you see the git crew at work.</p>')
rep('aria-label="Press Enter to watch ls happen"', 'aria-label="Press Enter to watch git add happen"')
region('<div class="face back" id="back">', '          </div>\n        </div>\n      </div>\n      <div class="show-ui">', '''<div class="face back" id="back">
              <span class="face-tag">Backstage</span>
              <div class="tube"></div>
              <div class="tiles" id="tiles"></div>
              <div class="actor" id="aShelly" style="left:2%;bottom:4%;width:17%"></div>
              <div class="sign" style="left:4%;bottom:2%">THE SHELL</div>
              <div class="actor" id="aCab" style="left:21%;bottom:6%;width:11%"></div>
              <div class="sign" style="left:22.5%;bottom:2%">/bin</div>
              <div class="actor" id="aDesk" style="left:34%;bottom:3%;width:19%"></div>
              <div class="sign" style="left:36%;bottom:2%">YOUR FOLDER</div>
              <div class="actor" id="aStage" style="left:56%;bottom:3%;width:22%"></div>
              <div class="sign" style="left:61%;bottom:2%">THE STAGE</div>
              <div class="album" id="album"></div>
              <div class="sign" style="left:36%;top:3%">PHOTO ALBUM (.git)</div>
              <div id="aCloud" style="right:2%;top:3%;width:22%"><div class="cphotos" id="cloudPhotos"></div></div>
              <div class="pfile" id="fGame">game.py</div>
              <div class="pfile" id="fReadme">README.md</div>
              <div class="actor" id="aProg" style="left:22%;bottom:3%;width:9%;opacity:0;z-index:4"></div>
              <div class="actor" id="aPigeon" style="left:66%;top:20%;width:8%;opacity:0;z-index:4"></div>
              <div class="flash" id="flash"></div>
              <div class="bubble" id="bShelly" style="left:4%;top:20%"></div>
              <div class="bubble" id="bCloud" style="right:5%;top:36%"></div>
            </div>
''')
rep('<span><b>Ready?</b> Press <kbd>Enter</kbd> on your keyboard (or click the yellow key) and watch what happens inside the computer.</span>',
    '<span><b>Ready?</b> Press <kbd>Enter</kbd> on your keyboard (or click the yellow key) and watch the git crew at work.</span>')
rep('''          <button class="btn" data-show="ls">Play <code>ls</code></button>
          <button class="btn" data-show="cat">Play <code>cat secret-diary.txt</code></button>
          <button class="btn" data-show="mv">Play <code>mv hamster.txt sir-fluffington.txt</code></button>''',
'''          <button class="btn" data-show="add">Play <code>git add game.py</code></button>
          <button class="btn" data-show="commit">Play <code>git commit -m "add lasers"</code></button>
          <button class="btn" data-show="push">Play <code>git push</code></button>''')
rep('<div class="map-head">The file tree <small>Tap a folder to type its <code>cd</code></small></div>', '<div class="map-head">The git map <small>Watch your code travel</small></div>')
rep('</style>', open(V + 'git.css').read() + '</style>')

# ---------- script ----------
rep("const KEY = 'jellyshell.v1';", "const KEY = 'jellygit.v1';")
region('  build() {', '  drawScreen(lines) {', open(V + 'town.js').read())
region('  pt(name) {', '  fly(names, text, dur = 1.6) {', '''  pt(name) {
    const Y = this.Y, P = {
      file: [1.45, Y.desk + 1.5, .3], deskT: [2.9, Y.desk + .8, 0], stageT: [2.9, Y.stage + .8, 0], stage: [0, Y.stage + 1.2, .5],
      albumT: [2.9, Y.album + .8, 0], album: [.5, Y.album + 1.5, .5], cloudT: [2.9, Y.cloud + .2, 0], cloud: [0, Y.cloud + 1, .7], laptop: [-1.75, Y.desk + 1, .8],
    };
    return new THREE.Vector3(...P[name]);
  }
''')
i = s.index('    this.platters.forEach'); j = s.index('\n', s.index("Object.entries(this.treeNodes)", i))
s = s[:i] + '''    this.files.forEach((f, i) => { f.position.y = f.userData.y + (this.step === 1 && i === 0 ? Math.abs(Math.sin(t * 6)) * .14 : 0); });
    this.kid.position.y = .2 + (this.step === 1 ? Math.abs(Math.sin(t * 12)) * .05 : 0);
    const fl = Math.max(0, 1 - (t - (this.flashT ?? -9)) * 2.2); // camera flash after the commit lands
    this.flashBall.visible = fl > 0; this.flashBall.scale.setScalar(.05 + fl * 1.6); this.flashBall.material.opacity = fl * .9;
    this.spot.material.opacity = .14 + (this.step === 2 || this.step === 3 ? .16 : 0) + Math.sin(t * 3) * .03;''' + s[j:]
region('const TOWN_STEPS = [', '\n];\n', '''const TOWN_STEPS = [
  { who: 'The whole game', text: 'Your code makes a trip with four stops: your folder, the stage, the photo album, and GitHub in the cloud. Press Next to follow one change all the way up.', cam: [3, 3, 21], look: [2, .6, 0] },
  { who: 'Your folder', text: 'This is your computer and your project folder. You just changed game.py: you added lasers! git notices the change, but nothing is saved yet.', cam: [3.4, -2.2, 7.4], look: [.6, -3.6, 0], screen: ['~/my-game$ _', '(you added lasers', ' to game.py)'] },
  { who: 'The stage', text: 'git add game.py puts the file on the stage. Only files on the stage will be in the next photo. Everything else stays out of it.', cam: [3.6, 1.4, 7], look: [.4, 0, 0], fly: [['file', 'deskT', 'stageT', 'stage'], 'game.py'], screen: ['$ git add game.py', '$ _'] },
  { who: 'The photo album', text: 'git commit -m "add lasers" takes a photo of everything on the stage. Flash! The photo is pinned in the album, a hidden folder called .git. That version is now saved forever, on your computer.', cam: [3.6, 5, 7], look: [.3, 3.7, 0], fly: [['stage', 'stageT', 'albumT', 'album'], 'snap!'], screen: ['$ git commit -m', '  "add lasers"', '[main e4f5a6b]', '$ _'] },
  { who: 'GitHub, in the cloud', text: 'git push sends your new photos up to GitHub. Now a copy lives far away, safe even if your computer falls in the bath.', cam: [3.4, 8.6, 7], look: [.3, 7.1, 0], fly: [['album', 'albumT', 'cloudT', 'cloud'], 'push'], screen: ['$ git push', ' main -> main', '$ _'] },
  { who: 'Any computer, anywhere', text: 'On a different computer, git clone copies the whole album down. Later, git pull fetches anything new. Your code follows you everywhere.', cam: [5, 1, 18], look: [.5, .6, 0], fly: [['cloud', 'cloudT', 'albumT', 'stageT', 'deskT', 'laptop'], 'pull', 2.6] },
  { who: 'That is the whole game', text: 'Change, git add, git commit, git push. Remember it as Cats Always Chase Pigeons. Now let\\'s zoom in and watch the crew do it.', cam: [3, 3, 21], look: [2, .6, 0], cta: true },
];
''', keep_end=False)
show = open(V + 'show.js').read().replace("querySelector(`[data-k=\"${ch === ' ' ? 'space' : ch}\"]`)", "querySelector(`[data-k=\"${ch === ' ' ? 'space' : CSS.escape(ch)}\"]`)")
assert 'CSS.escape' in show
region('/* ---------------- section 2: backstage show ---------------- */', '/* ---------------- section 3: the pretend computer ---------------- */', show)
rep("const BIN = ['cat', 'clear', 'cp', 'echo', 'ls', 'man', 'mkdir', 'mv', 'pwd', 'rm', 'touch'];", "const BIN = ['cat', 'clear', 'cp', 'echo', 'git', 'ls', 'man', 'mkdir', 'mv', 'pwd', 'rm', 'touch'];")
region('  const spec = {', '  const make = (name, content, parent) => {', '''  const spec = {
    'bin/': Object.fromEntries(BIN.map((n) => [n, '01001010 01000101 01001100 01001100 01011001\\n(This is a program. It is written in computer language, so it looks like gibberish to us.)'])),
    'home/': {
      'kid/': {
        'notes.txt': 'Game ideas:\\n- a jump button\\n- a robot dog\\n- lasers!!!',
        'my-game/': {
          'game.py': '# Robot Rescue\\nprint("Welcome to Robot Rescue!")\\nlives = 3',
          'README.md': '# Robot Rescue\\nA game where you rescue robots. Made by me!',
          'levels/': { 'level1.txt': '##########\\n#R    *  #\\n##########' },
        },
      },
    },
    'tmp/': {},
  };
''')
rep("const MAN = {\n", "const MAN = {\n  git: ['git - a time machine for your code', 'git <word> [options]', 'Takes photos (commits) of your project so you can go back in time, and sends them to GitHub. Type git on its own to see the everyday words.', 'git status'],\n")
rep("    case 'help': say('Words I know: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history', 'whoami', 'date'].join('  '));",
    "    case 'git': gitRun(args, say, fail, info, out); break;\n    case 'help': say('Words I know: ' + ['git', 'pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history'].join('  ')); say('For git words, type git on its own.', 'tip');")
rep("  return { out, ok, info, cmd, args, toks };\n}\n", """  if (redirect && ok && redirect.path) {
    // tell the lessons when a file inside a repository was written, and whether git already knew it
    const node = find(redirect.path), r = node && repoOf(node.parent), rel = r && relTo(r, node);
    if (node) info.wrote = { name: node.name, mode: redirect.mode, inRepo: !!r, tracked: !!r && (r.index.has(rel) || headTree(r).has(rel)), content: node.content };
  }
  return { out, ok, info, cmd, args, toks };
}
""")
rep("    if (lessonStage && lessonStage.word.replace(/ /g, '') === (r.toks.join('')).slice(0, lessonStage.word.replace(/ /g, '').length) && r.ok) lessonStage.hopAll(.8);",
    "    if (lessonStage && r.ok && r.toks.join(' ').includes(lessonStage.word)) lessonStage.hopAll(.8);")
rep("  if (first) options = [...BIN, 'cd', 'help', 'history', 'whoami'].filter((c) => c.startsWith(cur)).map((c) => ({ name: c, dir: false }));",
    "  if (first) options = [...BIN, 'cd', 'help', 'history', 'whoami'].filter((c) => c.startsWith(cur)).map((c) => ({ name: c, dir: false }));\n  else if (before.trim() === 'git') options = GIT_WORDS.filter((c) => c.startsWith(cur)).map((c) => ({ name: c, dir: false }));")
rep("function resetSandbox() { resetFS(); sh.catMode = false; termIn.value = ''; termOut.innerHTML = ''; welcome(); paintPrompt(); renderMap(); }",
    "function resetSandbox(level = LESSONS[cur]?.need ?? 0) { fixture(level); sh.catMode = false; termIn.value = ''; termOut.innerHTML = ''; welcome(); if (level) print(`<span class=\"tip\">(Ready for this lesson: ${LEVELS[level]}.)</span>`); paintPrompt(); renderMap(); }")
rep("$('#sbReset').onclick = resetSandbox;", "$('#sbReset').onclick = () => resetSandbox();")
i = s.index('function welcome() {'); j = s.index('\n}\n', i)
s = s[:i] + """function welcome() {
  print('<span class="tip">Welcome to the git sandbox! A pretend computer with a pretend GitHub, so nothing here can break.</span>');
  print('<span class="mute">Your project lives in the folder my-game. Type git on its own to see git\\'s words, or help for the shell ones.</span>');""" + s[j:]
region('/* file tree map with FLIP animations */', '/* ---------------- lessons + progress ---------------- */', open(V + 'git.js').read())
region('const isCmd = (e, c)', 'const ALL = [', open(V + 'lessons.js').read())
rep("  cur = i; const L = LESSONS[i]; store.cur = L.id; save();", "  cur = i; const L = LESSONS[i]; store.cur = L.id; save();\n  if (stateLevel() < L.need) resetSandbox(L.need); // jumped ahead: set the sandbox up so this lesson can be done")
rep("word: 'ls cd cat', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.4, lookY: .85", "word: 'git', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 2, frame: 1.5, lookY: .8")
rep("""    if (s.fly) { town.fly(s.fly[0], s.fly[1], s.fly[2]); sound.boing(500, .3, .08); town.onLand = () => { if (s.screen) town.drawScreen(s.screen); sound.blip(); }; }
    else { town.curve = null; town.packet.visible = town.packetLabel.visible = false; }
    if (i === 0) town.drawScreen(['kid@jelly:~$ _']);""", """    town.setState(i, !s.fly);
    town.drawScreen(s.screen ?? ['~/my-game$ _']);
    if (s.fly) { town.fly(s.fly[0], s.fly[1], s.fly[2]); sound.boing(500, .3, .08); town.onLand = () => { town.setState(i, true); sound.blip(); }; }
    else { town.curve = null; town.packet.visible = town.packetLabel.visible = false; }""")
region('/* recap data */', '/* end recap data */\n', open(V + 'recap.js').read(), keep_end=False)
open('build/jelly-git.src.html', 'w').write(s)
print('ok')
