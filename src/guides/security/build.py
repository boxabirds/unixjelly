# Jelly Security (prototype): the Shell engine with real file locks, users, and a black hat / white hat swap.
s = open('build/jelly-shell.src.html').read()
V = 'guides/security/'
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:90], s.count(a)); s = s.replace(a, b)
def region(start, end, new, keep_end=True):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + (s[j:] if keep_end else s[j + len(end):])

# ---------- page shell ----------
rep('<title>Jelly Shell</title>', '<title>Jelly Security</title>')
rep('<div class="brand">Jelly <b>Shell</b></div>', '<div class="brand">Jelly <b>Security</b></div>')
rep('aria-label="Jelly Shell navigation"', 'aria-label="Jelly Security navigation"')
rep('<h1>Jelly Shell needs a bigger screen</h1>', '<h1>Jelly Security needs a bigger screen</h1>')
rep('<div class="eyebrow">A wobbly guide to the command line</div>', '<div class="eyebrow">A wobbly guide to security · prototype</div>')
rep('<h1>Boss your computer around with <em>tiny words</em>.</h1>', '<h1>Think like a <em>hacker</em>. Build like a defender.</h1>')
rep('<p>These words were invented in 1971. They still work today on Macs, Linux, Raspberry Pis and most of the computers that run the internet. Learn them once, use them for life.</p>',
    '<p>Security people wear two hats: one to find the way in, one to lock it. Learn both, safely, on a pretend computer. Best after Jelly Shell, Jelly Shell 2 and Jelly Web: it uses their commands and adds the hats. This prototype has the first 3 missions.</p>')
rep('aria-label="Wobbly 3D jelly letters spelling ls, cd and cat. Drag them to squish."', 'aria-label="Wobbly 3D jelly letters spelling hats. Drag them to squish."')
rep("word: 'ls cd cat', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.4, lookY: .85", "word: 'hats', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.5, lookY: .8")
rep("const KEY = 'jellyshell.v1';", "const KEY = 'jellysecurity.v1';")
# the prototype goes straight to the missions: no 3D tour or backstage show yet
rep("""  { id: 'whole', group: 'The big picture', label: 'The whole game', tag: '1', color: '#ffc61a' },
  { id: 'backstage', group: 'The big picture', label: 'Backstage', tag: '2', color: '#9b5cff' },
""", "")
rep("group: 'The magic words'", "group: 'Missions'")
# no tour here, so the recap shows the big-picture chain straight away
rep("seen = !!store.done.whole;", "seen = true;")
rep('<button class="btn go" id="startBtn">Start the tour', '<button class="btn go" id="startBtn">Start the first mission')
rep("$('#startBtn').onclick = () => go('whole');", "$('#startBtn').onclick = () => go(LESSONS[0].id);")
rep("`Magic word ${i + 1} of ${LESSONS.length}`", "`Mission ${i + 1} of ${LESSONS.length}`")
rep("p === 'brain' ? 'Start the mission' : 'Next word'", "p === 'brain' ? 'Start the mission' : 'Next mission'")

# ---------- the pretend computer: two users, locks on every file ----------
rep("const BIN = ['cat', 'clear', 'cp', 'echo', 'ls', 'man', 'mkdir', 'mv', 'pwd', 'rm', 'touch'];", "const BIN = ['cat', 'chmod', 'clear', 'cp', 'echo', 'id', 'ls', 'man', 'mkdir', 'mv', 'pwd', 'rm', 'sign', 'su', 'touch'];")
region("    'home/': {\n      'kid/': {\n        'secret-diary.txt'", "  const make = (name, content, parent) => {", """    'home/': {
      'kid/': {
        'permission-slip.txt': 'JELLY SECURITY HQ: PERMISSION SLIP\\n\\nThe holder of this slip may test the pretend systems in this sandbox:\\n  - every file and folder on this pretend computer\\n  - every website ending in .test\\n    (.test is a pretend ending kept for testing:\\n     no real website can use it)\\nlooking for security holes, and must report what they find to Jelly Security HQ.\\n\\nNot allowed: real websites, real accounts, real people.\\n\\n  Signed: Jelly Security HQ',
        'diary.txt': 'Dear diary,\\nToday I found out every file has a lock. Mine does not seem to have one. Uh oh.\\nAlso: I still have not found out who ate my cookies.',
        'secret-recipe.txt': 'JELLY BEAN RECIPE (TOP SECRET)\\n1. Sugar\\n2. More sugar\\n3. A wobble',
        'photos/': { 'beach.txt': '(a picture of the beach)' },
      },
      'sib/': { 'comic.txt': 'KAPOW! Captain Wobble saves the day.', 'plans.txt': 'Plan: read kid\\'s diary. Find out about the cookies. Mwahaha.' },
    },
    'tmp/': {},
  };
""")
rep("function resetFS() {\n  SH.reset(seed());\n}", "function resetFS() {\n  SH.reset(seed());\n  secPerms();\n}")
rep("const promptText = () => `kid@jelly:${pretty(sh.cwd)}$`;", "const promptText = () => `${sh.user}@jelly:${pretty(sh.cwd)}$`;")
rep("$('#termTitle').textContent = `kid@jelly: ${pretty(sh.cwd)}`;", "$('#termTitle').textContent = `${sh.user}@jelly: ${pretty(sh.cwd)}`;")
# Locks, su, chmod and the rest live in the shell module (src/shell/jellysh.js); sec.js gives it this guide's people and voice.
rep("const MAN = {\n", """const MAN = {
  chmod: ['chmod - change mode (change the lock on a file)', 'chmod who+keys file   or   chmod who-keys file', 'Changes who has which keys. Who: u = owner (user), g = group, o = others (everyone else). Then + to give keys or - to take them away. Then the keys: r, w, x. Only the owner can do it.', 'chmod go-rw diary.txt'],
  su: ['su - switch user', 'su name', 'Become another user. On a real computer it asks for their password. exit goes back.', 'su sib'],
  whoami: ['whoami - who am I?', 'whoami', 'Prints the name of the account you are using right now.', 'whoami'],
  sign: ['sign - sign a permission slip', 'sign file', 'A tiny program written by Jelly Security HQ. It adds your name to the end of the slip. Real computers do not have it: someone made it up, like anyone can.', 'sign permission-slip.txt'],
""")
rep("  print('<span class=\"tip\">Welcome to the sandbox! This is a pretend computer, so nothing you do here can break anything.</span>');",
    "  print('<span class=\"tip\">Welcome to the security sandbox! A pretend computer with two users, kid (you) and sib (your little sibling). Break things only here.</span>');")

# ---------- missions, hats and recap ----------
region('const isCmd = (e, c)', 'const ALL = [', open(V + 'lessons.js').read())
rep("const ALL = [{ id: 'whole', name: 'The whole game', color: '#ffc61a' }, { id: 'backstage', name: 'Backstage', color: '#9b5cff' }, ...LESSONS];", "const ALL = [...LESSONS];")
region('/* recap data */', '/* end recap data */\n', """/* recap data */
const RECAP = {
  wizard: 'Security wizard!', wizardText: 'You wore both hats. Now go and build things that are hard to break.',
  chain: [
    { label: 'Black hat', sub: 'finds the way in' },
    { label: 'White hat', sub: 'fixes the hole', via: 'swap hats' },
    { label: 'Black hat', sub: 'tries again, fails', via: 'test it' },
    { label: 'Report', sub: 'tell the owner', via: 'disclose' },
  ],
  line: 'Same skills, different permission. Attack only with permission, fix what you find, tell the owner.',
  words: {
    hats: { does: 'Black hat breaks in without permission. White hat (ethical hacker) has permission and reports.', ex: 'sign permission-slip.txt', quiz: 'What is the one difference between a black hat and a white hat?' },
    keys: { does: 'Least privilege: only the keys you need. chmod changes the lock.', ex: 'chmod go-rw diary.txt', quiz: 'Lock your diary so only you can read it.' },
    grey: { does: 'Found a way in? Stop, don\\'t peek, tell the owner.', ex: 'coordinated vulnerability disclosure', quiz: 'You can see another pupil\\'s marks by accident. What now?' },
  },
};
/* end recap data */
""", keep_end=False)
rep("/* ---------------- boot ---------------- */", open(V + 'sec.js').read() + "\n/* ---------------- boot ---------------- */")
rep("</style>", open(V + 'sec.css').read() + "</style>")
open('build/jelly-security.src.html', 'w').write(s)
print('ok')
