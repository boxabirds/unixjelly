# Jelly Shell 2: the Shell engine with users, groups, file locks, programs you write yourself, sudo, grep and pipes.
s = open('build/jelly-shell.src.html').read()
V = 'guides/shell2/'
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:90], s.count(a)); s = s.replace(a, b)
def region(start, end, new, keep_end=True):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + (s[j:] if keep_end else s[j + len(end):])

# ---------- page shell ----------
rep('<title>Jelly Shell</title>', '<title>Jelly Shell 2</title>')
rep('<div class="brand">Jelly <b>Shell</b></div>', '<div class="brand">Jelly <b>Shell 2</b></div>')
rep('aria-label="Jelly Shell navigation"', 'aria-label="Jelly Shell 2 navigation"')
rep('<div class="eyebrow">A wobbly guide to the command line</div>', '<div class="eyebrow">A wobbly guide to the command line · part 2</div>')
rep('<h1>Boss your computer around with <em>tiny words</em>.</h1>', '<h1>Who\'s in <em>charge</em> here?</h1>')
rep('<p>These words were invented in 1971. They still work today on Macs, Linux, Raspberry Pis and most of the computers that run the internet. Learn them once, use them for life.</p>',
    '<p>Users, locks and keys. Write your own commands. Borrow the boss\'s power. Search files and join commands with pipes.</p>')
rep('aria-label="Wobbly 3D jelly letters spelling ls, cd and cat. Drag them to squish."', 'aria-label="Wobbly 3D jelly letters spelling sudo. Drag them to squish."')
rep("word: 'ls cd cat', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.4, lookY: .85", "word: 'sudo', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 2, frame: 1.5, lookY: .8")
rep("const KEY = 'jellyshell.v1';", "const KEY = 'jellyshell2.v1';")
# no 3D tour or backstage show: part 1 already did the big picture
rep("""  { id: 'whole', group: 'The big picture', label: 'Overview', tag: '1', color: '#ffc61a' },
  { id: 'backstage', group: 'The big picture', label: 'Backstage', tag: '2', color: '#9b5cff' },
""", "")
# no tour here, so the recap shows the big-picture chain straight away
rep("seen = !!store.done.whole;", "seen = true;")
rep('<button class="btn go" id="startBtn">Start the tour', '<button class="btn go" id="startBtn">Start the first lesson')
rep("$('#startBtn').onclick = () => go('whole');", "$('#startBtn').onclick = () => go(LESSONS[0].id);")

# ---------- the pretend computer ----------
rep("const BIN = ['cat', 'clear', 'cp', 'echo', 'ls', 'man', 'mkdir', 'mv', 'pwd', 'rm', 'touch'];",
    "const BIN = ['cat', 'chgrp', 'chmod', 'clear', 'cp', 'echo', 'grep', 'groups', 'head', 'hostname', 'id', 'ls', 'man', 'mkdir', 'mv', 'nano', 'pwd', 'rm', 'sort', 'su', 'sudo', 'touch', 'wc', 'which', 'whoami'];")
region("    'home/': {\n      'kid/': {\n        'secret-diary.txt'", "  const make = (name, content, parent) => {", """    'home/': {
      'kid/': {
        'diary.txt': 'Dear diary,\\nSomeone keeps eating my cookies.\\nI counted them: 12 cookies on Monday. Now there are 9.\\nI will find out who.\\nP.S. sib, if you are reading this: STOP.',
        'story.txt': 'Once upon a time, there was a gerbil called Gerald.\\nGerald lived in a cave in /tmp, where it was very dark.\\nOne day, a kid typed cd /tmp/dark/cave and found him.\\n"Hello," said the kid. "Want to come home?"\\nGerald thought about it. Then he nodded.\\nSo the kid typed mv, and Gerald was home at last.\\nThe end.',
        'kitchen.log': '07:58 kid opened the fridge\\n08:02 dad made toast\\n10:15 sib opened the jar\\n10:16 sib ate a cookie\\n12:30 kid made a jelly sandwich\\n13:05 mum counted the cookies: 11 left\\n15:40 sib opened the jar\\n15:41 sib ate a cookie\\n16:00 kid ate a cookie (just one!)\\n17:20 the cat sat on the toaster\\n19:29 sib opened the jar\\n19:30 sib ate a cookie\\n21:00 everyone went to bed',
      },
      'sib/': { 'comic.txt': 'KAPOW! Captain Wobble saves the day.', 'plans.txt': 'PLAN: eat more cookies.\\nDo NOT get caught by kid.\\nDo NOT write this down. (oops)' },
    },
    'tmp/': { 'chest.txt': 'TREASURE!\\nYou opened the chest with root\\'s power.\\nRoot can open everything. That is why only a few people get sudo,\\nand why they think before they use it.' },
  };
""")
rep("function resetFS() {\n  SH.reset(seed());\n}", "function resetFS() {\n  SH.reset(seed());\n  s2Perms();\n}")
rep("const promptText = () => `kid@jelly:${pretty(sh.cwd)}$`;", "const promptText = () => `${sh.user}@jelly:${pretty(sh.cwd)}$`;")
rep("$('#termTitle').textContent = `kid@jelly: ${pretty(sh.cwd)}`;", "$('#termTitle').textContent = `${sh.user}@jelly: ${pretty(sh.cwd)}`;")
rep("  print('<span class=\"tip\">Welcome to the sandbox! This is a pretend computer, so nothing you do here can break anything.</span>');",
    "  print('<span class=\"tip\">Welcome back to the sandbox! This pretend computer has two people on it: kid (that\\'s you) and sib, your little sibling. Nothing you do here can break anything.</span>');")

# ---------- the shell ----------
# Locks, su, sudo, scripts, the PATH and pipes all live in the shell module (src/shell/jellysh.js).
# s2.js gives it this computer's people and Jelly Shell 2's teaching voice; nothing here edits the shell.

# Tab: a first word with a slash in it is a path, like ./hello
rep("  if (first) options = [...BIN, 'cd', 'help', 'history', 'whoami'].filter", "  if (first && !cur.includes('/')) options = [...new Set([...BIN, ...BUILTIN, ...(find(pathOf(sh.home) + '/bin')?.children ?? []).map((c) => c.name)])].filter")
# file tree: a ▶ for programs, and your keys once they've been taught
rep("${pathOf(n) === spot ? `<i class=\"jelly-spot\">${bean(spotColor)}</i>` : ''}${here ?", "${mapTags(n)}${pathOf(n) === spot ? `<i class=\"jelly-spot\">${bean(spotColor)}</i>` : ''}${here ?")
rep("const MAN = {\n", """const MAN = {
  whoami: ['whoami - who am I?', 'whoami', 'Prints the name of the account you are using right now.', 'whoami'],
  hostname: ['hostname - what is this computer called?', 'hostname', 'Prints the computer\\'s own name.', 'hostname'],
  nano: ['nano - a small text editor', 'nano file', 'Opens a file to change it, or starts a new one. Ctrl+O saves, Ctrl+X exits. The ^ in the menu at the bottom means the Ctrl key.', 'nano note.txt'],
  which: ['which - where is that program?', 'which command', 'Looks through the folders on the PATH and prints where the program file is.', 'which ls'],
  chmod: ['chmod - change mode (change the lock)', 'chmod who+keys file   or   chmod who-keys file', 'Who: u = owner (user), g = group, o = others, a = all. + gives keys, - takes them away. Keys: r read, w write, x run. Only the owner can do it.', 'chmod u+x hello'],
  chgrp: ['chgrp - change group', 'chgrp group file', 'Gives a file to a group. You must own it and be in that group.', 'chgrp family comics'],
  id: ['id - your ID card', 'id [user]', 'Prints a user\\'s number, own group and all their groups.', 'id sib'],
  groups: ['groups - which clubs am I in?', 'groups [user]', 'Prints just the groups.', 'groups'],
  su: ['su - switch user', 'su user', 'Become another user until you type exit. Asks for their password on a real computer.', 'su sib'],
  sudo: ['sudo - superuser do', 'sudo command', 'Runs one command as root, the boss user. Only people in the sudo group may. Asks for your own password.', 'sudo whoami'],
  grep: ['grep - find lines with a word in them', 'grep [-i] [-c] [-n] [-v] word [file...]', 'Prints every line that contains the word. -i ignores capitals, -c counts, -n numbers the lines, -v prints the lines WITHOUT the word.', 'grep cookie diary.txt'],
  wc: ['wc - word count', 'wc [-l] [-w] [-c] [file]', 'Counts lines, words and characters. -l counts only lines.', 'wc -l kitchen.log'],
  sort: ['sort - put lines in order', 'sort [file]', 'Prints the lines in alphabetical order.', 'sort kitchen.log'],
  head: ['head - the first few lines', 'head [-n number] [file]', 'Prints the first 10 lines, or as many as you ask for.', 'head -n 3 kitchen.log'],
""")
# missions that build on earlier ones put back anything missing, and always start as kid
rep("  $('#lcard').dataset.phase = p; paintSteps(); sound.blip();", "  $('#lcard').dataset.phase = p; if (p === 'mission') { if (!L.keepUser) backToKid(); L.setup?.(); paintPrompt(); renderMap(); } paintSteps(); sound.blip();")
rep("  resetSandbox(); paintSteps(); termIn.focus({ preventScroll: true });", "  resetSandbox(); L.setup?.(); paintPrompt(); renderMap(); paintSteps(); termIn.focus({ preventScroll: true });")

# nano owns Ctrl+D while it is open; the file tree's key legend shows once ls -l has been taught
rep("addEventListener('keydown', (e) => { if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'd' && !$('#p-lesson').hidden) {", "addEventListener('keydown', (e) => { if (e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'd' && !$('#p-lesson').hidden && !NANO.open) {")
rep("  mapEl.innerHTML = rows.join('');", "  mapEl.innerHTML = rows.join(''); $('#keysLegend').hidden = !keysOn();")

# ---------- lessons, recap, engine and styles ----------
region('const isCmd = (e, c)', 'const ALL = [', open(V + 'lessons.js').read())
exec(open('engine/use-demos.py').read())
rep("const ALL = [{ id: 'whole', name: 'Overview', color: '#ffc61a' }, { id: 'backstage', name: 'Backstage', color: '#9b5cff' }, ...LESSONS];", "const ALL = [...LESSONS];")
region('/* recap data */', '/* end recap data */\n', open(V + 'recap.js').read(), keep_end=False)
rep("/* ---------------- boot ---------------- */", open(V + 's2.js').read() + "\n/* ---------------- boot ---------------- */")
rep("</style>", open(V + 's2.css').read() + "</style>")
open('build/jelly-shell2.src.html', 'w').write(s)
print('ok')
