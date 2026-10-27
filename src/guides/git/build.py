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
rep('<title>Shell Jelly</title>', '<title>Git Jelly</title>')
rep('<div class="brand"><b>Shell</b> Jelly</div>', '<div class="brand"><b>Git</b> Jelly</div>')
rep('<span class="more"> Letters in Titan One', '<span class="more"> A companion to <a href="https://claude.ai/artifact/QKpnE1d1poehF9u2UX1wsW" target="_blank" rel="noopener">Shell Jelly</a>. Letters in Titan One')
rep('<div class="eyebrow">A wobbly guide to the command line</div>', '<div class="eyebrow">A wobbly guide to git and GitHub</div>')
rep('<h1>Boss your computer around with <em>tiny words</em>.</h1>', '<h1>Never lose your <em>code</em> again.</h1>')
rep('<p>These words were invented in 1971. They still work today on Macs, Linux, Raspberry Pis and most of the computers that run the internet. Learn them once, use them for life.</p>',
    '<p>git is a time machine for your code: it takes snapshots you can always go back to. GitHub keeps copies safe in the cloud. Invented in 2005, used by almost every programmer on the planet.</p>')
rep('aria-label="Wobbly 3D jelly letters spelling ls, cd and cat. Drag them to squish."', 'aria-label="Wobbly 3D jelly letters spelling git. Drag them to squish."')
rep('<p>Follow one command, <code>ls</code>, all the way down to the disk and back up. Press Next. Drag to spin it, scroll to zoom, double-click to straighten up.</p>',
    '<p>Follow one change to <code>game.py</code> from your folder all the way up to GitHub. Press Next. Drag to turn the house, scroll to zoom, double-click to straighten up.</p>')
rep('aria-label="A 3D cartoon of a computer cut into layers: you and the terminal, the shell, the kernel, the hardware and the file tree."',
    'aria-label="A 3D cartoon house, cut open like a doll\'s house: your folder on the ground floor, the stage above it, the photo album at the top, and GitHub in a see-through cloud at the top of a lift tower. A friend\'s house next door gets a copy too."')
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
exec(open('engine/use-overview.py').read())
# Backstage: the house up close (engine/use-backstage.py, Backstage in overview.js)
BS_HEAD = 'The same house, up close. Pick a git command and follow it: a git robot carries game.py onto the stage, takes the photo, and sends a pigeon up to GitHub.'
BS_LABEL = 'The cut-open house from the Overview. A git robot carries game.py from your folder up to the stage, photographs it with a flash and pins the photo in the album, then a jelly pigeon flies a copy up to GitHub in the cloud.'
BS_PICK, BS_FIRST = 'a git command', 'add'
exec(open('engine/use-backstage.py').read())
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
exec(open('engine/use-demos.py').read())
rep("  cur = i; const L = LESSONS[i]; store.cur = L.id; save();", "  cur = i; const L = LESSONS[i]; store.cur = L.id; save();\n  if (stateLevel() < L.need) resetSandbox(L.need); // jumped ahead: set the sandbox up so this lesson can be done")
rep("word: 'ls cd cat', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.4, lookY: .85", "word: 'git', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 2, frame: 1.5, lookY: .8")
region('/* recap data */', '/* end recap data */\n', open(V + 'recap.js').read(), keep_end=False)
# Git's lessons build on each other (the project and its history; jumping ahead builds the state a lesson needs), so its sandbox carries on between lessons.
rep("const FRESH_SANDBOX = true;", "const FRESH_SANDBOX = false;")
open('build/jelly-git.src.html', 'w').write(s)
print('ok')
