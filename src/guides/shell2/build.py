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
rep('<h1>Jelly Shell needs a bigger screen</h1>', '<h1>Jelly Shell 2 needs a bigger screen</h1>')
rep('<div class="eyebrow">A wobbly guide to the command line</div>', '<div class="eyebrow">A wobbly guide to the command line · part 2</div>')
rep('<h1>Boss your computer around with <em>tiny words</em>.</h1>', '<h1>Who\'s in <em>charge</em> here?</h1>')
rep('<p>These words were invented in 1971. They still work today on Macs, Linux, Raspberry Pis and most of the computers that run the internet. Learn them once, use them for life.</p>',
    '<p>Users, locks and keys. Write your own commands. Borrow the boss\'s power. Search files and join commands with pipes. Best after Jelly Shell: this guide uses everything from it.</p>')
rep('aria-label="Wobbly 3D jelly letters spelling ls, cd and cat. Drag them to squish."', 'aria-label="Wobbly 3D jelly letters spelling sudo. Drag them to squish."')
rep("word: 'ls cd cat', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 0, frame: 1.4, lookY: .85", "word: 'sudo', size: .07, bg: '#d4eeff', floor: '#bfe3ff', colorOffset: 2, frame: 1.5, lookY: .8")
rep("const KEY = 'jellyshell.v1';", "const KEY = 'jellyshell2.v1';")
# no 3D tour or backstage show: part 1 already did the big picture
rep("""  { id: 'whole', group: 'The big picture', label: 'The whole game', tag: '1', color: '#ffc61a' },
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
rep("function resetFS() {\n  sh.root = seed(); sh.home = find('/home/kid'); sh.cwd = sh.home; sh.userDirs.clear(); sh.showHidden = false;\n}",
    "function resetFS() {\n  sh.root = seed(); sh.home = find('/home/kid'); sh.cwd = sh.home; sh.userDirs.clear(); sh.showHidden = false;\n  s2Perms();\n}")
rep("const promptText = () => `kid@jelly:${pretty(sh.cwd)}$`;", "const promptText = () => `${sh.user}@jelly:${pretty(sh.cwd)}$`;")
rep("$('#termTitle').textContent = `kid@jelly: ${pretty(sh.cwd)}`;", "$('#termTitle').textContent = `${sh.user}@jelly: ${pretty(sh.cwd)}`;")
rep("  print('<span class=\"tip\">Welcome to the sandbox! This is a pretend computer, so nothing you do here can break anything.</span>');",
    "  print('<span class=\"tip\">Welcome back to the sandbox! This pretend computer has two people on it: kid (that\\'s you) and sib, your little sibling. Nothing you do here can break anything.</span>');")

# ---------- run1: one command (run, in s2.js, handles pipes and programs) ----------
rep("function run(line) {\n  const out = [], info = {}", "function run1(line, stdin) {\n  const out = [], info = {}")
rep("  const fail = (t, tip) => { ok = false; say(t, 'er'); if (tip) say(tip, 'tip'); };", "  const fail = (t, tip) => { ok = false; if (t) say(t, 'er'); if (tip) say(tip, 'tip'); };")
# ls: reading a folder needs r; -l shows the real locks
rep("        if (n.type === 'file') return say(n.name);",
    "        if (n.type === 'file') return flags.has('l') ? out.push({ h: `${modeHTML(n)} <span class=\"mute\">${own(n).padEnd(4)} ${grp(n).padEnd(6)} ${String(n.content.length).padStart(5)} Oct 18</span> ${esc(n.name)}`, t: n.name }) : say(n.name);\n        if (!can(n, 4)) { fail(`ls: cannot open directory '${p}': Permission denied`, `Listing a folder needs its r key. You are ${sh.user}, and your set of keys for it has no r.`); return; }")
rep("        if (flags.has('l')) names.forEach((c) => out.push({ h: `<span class=\"mute\">${c.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'} kid kid ${String(c.type === 'dir' ? 4096 : (c.content || '').length).padStart(5)} Oct 18</span> ${c.type === 'dir' ? `<span class=\"dir\">${esc(c.name)}</span>` : esc(c.name)}`, t: c.name }));",
    """        if (flags.has('l') && once('lsl')) say('(How to read each line: the first letter is d for a folder or - for a file. The next nine letters are the lock: three sets of keys, for the owner, the group and everyone else. r = read, w = write, x = run, - = no key. The set that works for you is underlined. Then: the owner, the group, the size and the date.)', 'tip');
        if (flags.has('l')) names.forEach((c) => { const m = c.id ? c : c.name === '.' ? n : n.parent ?? n; out.push({ h: `${modeHTML(m)} <span class="mute">${own(m).padEnd(4)} ${grp(m).padEnd(6)} ${String(c.type === 'dir' ? 4096 : (c.content || '').length).padStart(5)} Oct 18</span> ${c.type === 'dir' ? `<span class="dir">${esc(c.name)}</span>` : esc(c.name)}${c.type === 'file' && modeOf(c) & 0o111 ? '<span class="exe">*</span>' : ''}`, t: c.name }); });""")
# cd: going into a folder needs x
rep("      else if (n === sh.cwd && target !== '.') say(`(You are already in ${pretty(n)}.)`, 'mute');",
    "      else if (!can(n, 1)) { fail(`cd: ${target}: Permission denied`); out.push({ h: shelly(`Going <b>into</b> a folder needs its <b>x</b> key. You are ${whoYouAre(n)}, and ${setName[keySet(n)]} for ${esc(n.name)} is ${modeHTML(n)}: no x.`), t: '' }); }\n      else if (n === sh.cwd && target !== '.') say(`(You are already in ${pretty(n)}.)`, 'mute');")
# cat: reading needs r. Piped words come in too.
rep("      if (!rest.length) { sh.catMode = true;", "      if (!rest.length && stdin !== undefined) { stdin.split('\\n').forEach((l) => say(l)); break; }\n      if (!rest.length) { sh.catMode = true;")
rep("        else { info.hits.push(pathOf(n)); n.content.split('\\n').forEach((l) => say(l)); }",
    """        else if (!can(n, 4)) { info.denied = true; fail(`cat: ${p}: Permission denied`); out.push({ h: shelly(`The lock on ${esc(n.name)} is ${modeHTML(n)}. It belongs to ${esc(own(n))}. You are <b>${sh.user}</b>, ${whoYouAre(n)}. So you get ${setName[keySet(n)]}, and it has no <b>r</b> key. No entry!`), t: '' }); }
        else { info.hits.push(pathOf(n)); n.content.split('\\n').forEach((l) => say(l)); }""")
# making things needs a w key on the folder they go in
rep("            next = { id: 'n' + nid++, name: part, type: 'dir', content: '', children: [], parent: n };",
    "            if (!can(n, 2)) { fail(`mkdir: cannot create directory '${p}': Permission denied`, `Making something inside ${pretty(n)} needs a w key for that folder, and ${sh.user} doesn't have one.`); n = null; break; }\n            next = { id: 'n' + nid++, name: part, type: 'dir', content: '', children: [], parent: n };")
rep("        const f = { id: 'n' + nid++, name, type: 'file', content: '', children: null, parent: d };",
    "        if (!can(d, 2)) { fail(`touch: cannot touch '${p}': Permission denied`, `Making a file inside ${pretty(d)} needs a w key for that folder, and ${sh.user} doesn't have one.`); continue; }\n        const f = { id: 'n' + nid++, name, type: 'file', content: '', children: null, parent: d };")
rep("        const from = s.parent, clash = parent.children.find((c) => c.name === newName);",
    "        if (!can(parent, 2) || (cmd === 'mv' && !can(s.parent, 2))) { fail(`${cmd}: cannot ${cmd === 'cp' ? 'create' : 'move'} '${sp}': Permission denied`, `That needs a w key on the folder${cmd === 'mv' ? 's it moves between' : ' it goes into'}.`); continue; }\n        const from = s.parent, clash = parent.children.find((c) => c.name === newName);")
rep("        if (cmd === 'cp') { const c = fixParents(clone(s, parent)); c.name = newName; parent.children.push(c); }",
    "        if (cmd === 'cp') { const c = unclaim(fixParents(clone(s, parent))); c.name = newName; parent.children.push(c); }")
rep("        info.removed.push(pathOf(n)); n.parent.children.splice(n.parent.children.indexOf(n), 1);",
    "        if (!can(n.parent, 2)) { fail(`rm: cannot remove '${p}': Permission denied`, `Deleting needs a w key on the folder ${pretty(n.parent)}, and ${sh.user} doesn't have one.`); continue; }\n        info.removed.push(pathOf(n)); n.parent.children.splice(n.parent.children.indexOf(n), 1);")
# the new commands
rep("    case 'help': say('Words I know: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history', 'whoami', 'date'].join('  ')); say('There might be a few secret ones too...', 'tip'); break;",
    """    case 'help': say('New words: ' + ['whoami', 'hostname', '>', '>>', 'nano', 'which', './', 'ls -l', 'chmod', 'echo $PATH', 'id', 'groups', 'chgrp', 'su', 'exit', 'sudo', 'grep', 'wc', 'sort', 'head', '|'].join('  ')); say('Jelly Shell words: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history'].join('  ')); break;
    case 'id': {
      const u = rest[0] ?? sh.user;
      if (!USERS[u]) { fail(`id: '${u}': no such user`); break; }
      say(`uid=${USERS[u].uid}(${u}) gid=${GIDS[USERS[u].groups[0]]}(${USERS[u].groups[0]}) groups=${USERS[u].groups.map((g) => `${GIDS[g]}(${g})`).join(',')}`);
      if (once('id')) say('(uid is the user number: computers prefer numbers to names. gid is your own group. groups lists every club you are in.)', 'tip');
      break;
    }
    case 'groups': { const u = rest[0] ?? sh.user; if (!USERS[u]) { fail(`groups: '${u}': no such user`); break; } say((rest[0] ? u + ' : ' : '') + USERS[u].groups.join(' ')); break; }
    case 'chmod': chmodRun(rest, say, fail, info, out); break;
    case 'chgrp': chgrpRun(rest, fail, info); break;
    case 'su': suRun(rest, say, fail, info); break;
    case 'which': whichRun(rest, say, fail); break;
    case 'nano': nanoOpen(rest[0], fail, info); break;
    case 'grep': grepRun(args, flags, stdin, say, fail, info); break;
    case 'wc': wcRun(rest, flags, stdin, say, fail); break;
    case 'sort': { const srcs = textIn(rest, stdin, 'sort', fail); if (srcs) srcs.flatMap((x) => x.text.split('\\n')).sort((a, b) => a.localeCompare(b)).forEach((l) => say(l)); break; }
    case 'head': { const k = Number(args[args.indexOf('-n') + 1]) || 10, srcs = textIn(rest.filter((a) => a !== String(k)), stdin, 'head', fail); if (srcs) srcs.forEach((x) => x.text.split('\\n').slice(0, k).forEach((l) => say(l))); break; }""")
rep("    case 'whoami': say('kid'); break;", "    case 'whoami': say(sh.user); break;")
rep("""    case 'sudo': fail('kid is not in the sudoers file. This incident will be reported.', 'sudo means "super-user do". Only the computer\\'s boss account is allowed. (We told your mum.)'); break;
    case 'exit': say('There is no exit. Only more learning.', 'tip');""",
    """    case 'sudo': sudoRun(rest, line, say, fail, info, out); break;
    case 'exit': if (sh.su.length) { const b = sh.su.pop(); sh.user = b.user; sh.home = b.home; say(`(exit: you are ${sh.user} again, with ${sh.user}'s keys.)`, 'mute'); break; } say('There is no exit. Only more learning.', 'tip');""")
# anything else might be a program: a path like ./hello, or a name on the PATH
rep("""    default: {
      if (BIN.includes(cmd.toLowerCase())""", """    default: {
      const prog = locate(cmd);
      if (prog) { runProgram(prog, cmd, rest, say, fail, info, out); break; }
      if (cmd.includes('/')) { fail(`bash: ${cmd}: No such file or directory`); why(cmd); break; }
      const here = sh.cwd.children.find((c) => c.name === cmd && c.type === 'file');
      if (here) { fail(`${cmd}: command not found`); out.push({ h: shelly(`There is a file called <b>${esc(cmd)}</b> right here, but the shell only looks for programs in the folders on its list (${pathDirs().join(' and ')}). To run one from this folder, say where it is: <b>./${esc(cmd)}</b>`), t: '' }); out.push({ h: tryCmd('./' + cmd), t: '' }); break; }
      if (BIN.includes(cmd.toLowerCase())""")
rep("        const words = [...BIN, 'cd', 'help', 'history', 'whoami'], near", "        const words = [...BIN, ...BUILTIN], near")
# writing into a file needs w: on the file, or on its folder for a new one
rep("""      const existing = find(redirect.path);
      if (existing?.type === 'dir') fail(`${redirect.path}: Is a directory`);
      else if (existing) existing.content""", """      const existing = find(redirect.path), [rdp, rname] = splitPath(redirect.path), rd = existing ? existing.parent : find(rdp);
      info.wrote = { name: existing?.name ?? rname, mode: redirect.mode };
      if (existing?.type === 'dir') fail(`${redirect.path}: Is a directory`);
      else if (existing && !can(existing, 2)) fail(`${redirect.path}: Permission denied`, `Writing needs the w key, and your set of keys for ${existing.name} has none.`);
      else if (!existing && rd?.type === 'dir' && !can(rd, 2)) fail(`${redirect.path}: Permission denied`, `Making a new file in ${pretty(rd)} needs a w key for that folder.`);
      else if (existing) existing.content""")
rep("  return { out, ok, info, cmd, args, toks };\n}\n\n/* terminal UI */", "  return { out, ok, info, cmd, args, toks };\n}\n\n/* terminal UI */")
# Tab: a first word with a slash in it is a path, like ./hello
rep("  if (first) options = [...BIN, 'cd', 'help', 'history', 'whoami'].filter", "  if (first && !cur.includes('/')) options = [...new Set([...BIN, ...BUILTIN, ...(find(pathOf(sh.home) + '/bin')?.children ?? []).map((c) => c.name)])].filter")
# file tree: a ▶ for programs and a padlock where your keys don't work
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
rep("const ALL = [{ id: 'whole', name: 'The whole game', color: '#ffc61a' }, { id: 'backstage', name: 'Backstage', color: '#9b5cff' }, ...LESSONS];", "const ALL = [...LESSONS];")
region('/* recap data */', '/* end recap data */\n', open(V + 'recap.js').read(), keep_end=False)
rep("/* ---------------- boot ---------------- */", open(V + 's2.js').read() + "\n/* ---------------- boot ---------------- */")
rep("</style>", open(V + 's2.css').read() + "</style>")
open('build/jelly-shell2.src.html', 'w').write(s)
print('ok')
