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
rep("function resetFS() {\n  sh.root = seed(); sh.home = find('/home/kid'); sh.cwd = sh.home; sh.userDirs.clear(); sh.showHidden = false;\n}",
    "function resetFS() {\n  sh.root = seed(); sh.home = find('/home/kid'); sh.cwd = sh.home; sh.userDirs.clear(); sh.showHidden = false;\n  secPerms();\n}")
rep("const promptText = () => `kid@jelly:${pretty(sh.cwd)}$`;", "const promptText = () => `${sh.user}@jelly:${pretty(sh.cwd)}$`;")
rep("$('#termTitle').textContent = `kid@jelly: ${pretty(sh.cwd)}`;", "$('#termTitle').textContent = `${sh.user}@jelly: ${pretty(sh.cwd)}`;")
# ls -l shows the real locks; cat, writing and rm respect them
rep("${c.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'} kid kid ${String(c.type === 'dir' ? 4096 : (c.content || '').length).padStart(5)} Oct 18</span> ${c.type === 'dir' ? `<span class=\"dir\">${esc(c.name)}</span>` : esc(c.name)}`",
    "</span>${c.id ? modeHTML(c) : modeHTML({ type: 'dir', mode: 0o755 })} <span class=\"mute\">${(c.id ? own(c) : '').padEnd(4)} ${(c.id ? grp(c) : '').padEnd(6)} ${String(c.type === 'dir' ? 4096 : (c.content || '').length).padStart(5)} Oct 18</span> ${c.type === 'dir' ? `<span class=\"dir\">${esc(c.name)}</span>` : esc(c.name)}`")
rep("""        if (flags.has('l')) names.forEach((c) =>""", """        if (flags.has('l') && !store.seen?.perm) { (store.seen ??= {}).perm = true; save(); say('(How to read a line: the first letter is d for a folder or - for a file. The next nine letters are the lock: three sets of keys, for the owner, the group and everyone else. r = read, w = write, x = run (on a folder: go inside), - = no key. Then come the owner, the group, the size, the date and the name.)', 'tip'); }
        if (flags.has('l')) names.forEach((c) =>""")
rep("        else { info.hits.push(pathOf(n)); n.content.split('\\n').forEach((l) => say(l)); }",
    """        else if (!can(n, 4)) { info.denied = true; fail(`cat: ${p}: Permission denied`); out.push({ h: `<span class="shelly">Shelly:</span> The lock on ${esc(n.name)} is ${modeHTML(n)}, owned by ${own(n)}. You are <b>${sh.user}</b>, ${own(n) === sh.user ? 'the owner' : GROUPS[sh.user]?.includes(grp(n)) ? `in the ${grp(n)} group` : 'everyone else'}, and that set has no <b>r</b> key. No entry!`, t: '' }); }
        else { info.hits.push(pathOf(n)); n.content.split('\\n').forEach((l) => say(l)); if (own(n) !== sh.user && GROUPS[own(n)]) out.push({ h: shelly(`You got in! ${esc(n.name)} belongs to ${own(n)}, but you are <b>${sh.user}</b>, ${GROUPS[sh.user]?.includes(grp(n)) ? `in the <b>${grp(n)}</b> group, so you get the middle set of keys in ${modeHTML(n)}. That set has an <b>r</b> key` : 'everyone else, so you get the last set of keys, and it has an <b>r</b> key'}.`), t: '' }); }""")
rep("      else if (existing) existing.content = redirect.mode === '>>' && existing.content ? existing.content + '\\n' + text : text;",
    "      else if (existing && !can(existing, 2)) fail(`${redirect.path}: Permission denied`, `You are ${sh.user}, and that set of keys has no w (write) key.`);\n      else if (existing) existing.content = redirect.mode === '>>' && existing.content ? existing.content + '\\n' + text : text;")
rep("        info.removed.push(pathOf(n)); n.parent.children.splice(n.parent.children.indexOf(n), 1);",
    "        if (!can(n.parent, 2)) { fail(`rm: cannot remove '${p}': Permission denied`, `Deleting needs a w key on the folder ${pretty(n.parent)}, and ${sh.user} doesn't have one.`); continue; }\n        info.removed.push(pathOf(n)); n.parent.children.splice(n.parent.children.indexOf(n), 1);")
rep("    case 'whoami': say('kid'); break;", """    case 'whoami': say(sh.user); if (once('whoami')) out.push({ h: shelly('<b>whoami</b> asks: which <b>account</b> am I using? One computer can have lots of users, each with their own home folder. Your prompt says it too: the bit before the <b>@</b> is you.'), t: '' }); if (sh.user === 'kid') say(store.signed ? '(An ethical hacker, white hat, with a signed permission slip.)' : '(No permission slip signed yet.)', 'tip'); else say('(You borrowed sib\\'s account. Type exit to go back to being kid.)', 'tip'); break;
    case 'id': say(`uid=${sh.user} groups=${GROUPS[sh.user].join(',')}`); say('(uid is your user name. groups are the clubs you belong to. If a file belongs to one of your groups, you get its middle set of keys.)', 'tip'); break;
    case 'chmod': chmodRun(rest, say, fail, info, out); break;
    case 'su': suRun(rest, say, fail, info); break;
    case 'sign': {
      const n = find(rest[0] ?? '');
      if (!n || !n.name.startsWith('permission-slip')) { fail('sign: what should I sign?', 'Try: sign permission-slip.txt'); break; }
      if (!store.signed) { n.content += '\\n  Signed: kid, ethical hacker (white hat)'; store.signed = true; save(); }
      say('Signed! You may now test this pretend computer. Only this one.', 'tip'); info.signed = true;
      if (once('sign')) { out.push({ h: shelly('Where did <b>sign</b> come from? Jelly Security HQ wrote it! A command is just a program, and programs live in <b>/bin</b>. Anyone can write a program and call it whatever they like. This one is only a few lines of text: peek inside with <b>cat /bin/sign</b>'), t: '' }); out.push({ h: tryCmd('cat /bin/sign'), t: '' }); }
      break;
    }""")
rep("    case 'exit': say('There is no exit. Only more learning.', 'tip');", "    case 'exit': if (sh.user !== 'kid') { sh.user = 'kid'; say('(exit leaves sib\\'s shell, so you are back to being kid, with kid\\'s keys. Look at the prompt.)', 'mute'); break; } say('There is no exit. Only more learning.', 'tip');")
rep("    case 'help': say('Words I know: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history', 'whoami', 'date'].join('  '));",
    "    case 'help': say('Security words: ' + ['ls -l', 'chmod', 'su', 'exit', 'whoami', 'id', 'sign'].join('  ')); say('Shell words: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history'].join('  '));")
rep("const MAN = {\n", """const MAN = {
  chmod: ['chmod - change mode (change the lock on a file)', 'chmod who+keys file   or   chmod who-keys file', 'Changes who has which keys. Who: u = owner (user), g = group, o = others (everyone else). Then + to give keys or - to take them away. Then the keys: r, w, x. Only the owner can do it.', 'chmod go-rw diary.txt'],
  su: ['su - switch user', 'su name', 'Become another user. On a real computer it asks for their password. exit goes back.', 'su sib'],
  whoami: ['whoami - who am I?', 'whoami', 'Prints the name of the account you are using right now.', 'whoami'],
  sign: ['sign - sign a permission slip', 'sign file', 'A tiny program written by Jelly Security HQ. It adds your name to the end of the slip. Real computers do not have it: someone made it up, like anyone can.', 'sign permission-slip.txt'],
""")
rep("  return { out, ok, info, cmd, args, toks };\n}\n", "  claimNew();\n  return { out, ok, info, cmd, args, toks };\n}\n// Files made during a command belong to whoever made them.\nfunction claimNew(n = sh.root) { if (!n.owner) { n.owner = sh.user; n.group = 'family'; } n.children?.forEach(claimNew); }\n")
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
