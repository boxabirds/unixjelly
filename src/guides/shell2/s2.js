/* ---------------- Jelly Shell 2: users, locks, programs and pipes ---------------- */
// Three accounts, like a real computer: root (the boss), kid (you) and sib (your little sibling).
// Everyone also has a group named after them. kid is in sudo, so kid may borrow root's power.
const USERS = {
  root: { uid: 0, groups: ['root'] },
  kid: { uid: 1000, groups: ['kid', 'sudo', 'family'] },
  sib: { uid: 1001, groups: ['sib', 'family'] },
};
const GIDS = { root: 0, sudo: 27, kid: 1000, sib: 1001, family: 1002 };
const BUILTIN = ['cd', 'exit', 'help', 'history'];
const own = (n) => n.owner ?? 'root', grp = (n) => n.group ?? 'root';
const modeOf = (n) => n.mode ?? (n.type === 'dir' ? 0o755 : 0o644);
// Which of the three sets of keys a user gets for this file.
const keySet = (n, u = sh.user) => own(n) === u ? 'owner' : USERS[u].groups.includes(grp(n)) ? 'group' : 'others';
const SHIFT = { owner: 6, group: 3, others: 0 };
const can = (n, bit, u = sh.user) => u === 'root' || !!((modeOf(n) >> SHIFT[keySet(n, u)]) & bit);
const triplet = (m, s) => ['r', 'w', 'x'].map((c, i) => (m >> s) & (4 >> i) ? c : '-').join('');
const modeStr = (n) => {
  const m = modeOf(n), s = (n.type === 'dir' ? 'd' : '-') + [6, 3, 0].map((k) => triplet(m, k)).join('');
  return m & 0o1000 ? s.slice(0, -1) + (m & 1 ? 't' : 'T') : s;
};
// The same string in colour. The set of keys that applies to whoever is typing is underlined.
const modeHTML = (n) => {
  const s = modeStr(n), mine = keySet(n);
  return `<span class="perm">${s[0]}<b class="pu${mine === 'owner' ? ' mine' : ''}">${s.slice(1, 4)}</b><b class="pg${mine === 'group' ? ' mine' : ''}">${s.slice(4, 7)}</b><b class="po${mine === 'others' ? ' mine' : ''}">${s.slice(7)}</b></span>`;
};
const setName = { owner: 'the owner\'s set (the first three letters)', group: 'the group\'s set (the middle three letters)', others: 'everyone else\'s set (the last three letters)' };
const whoYouAre = (n) => ({ owner: 'the owner', group: `in the <b>${esc(grp(n))}</b> group`, others: 'not the owner and not in its group, so you count as <b>everyone else</b>' })[keySet(n)];
const once = (k) => !store.seen?.[k] && ((store.seen ??= {})[k] = true, save(), true);

function s2Perms() {
  const set = (n, o, g) => { n.owner = o; n.group = g; n.children?.forEach((c) => set(c, o, g)); };
  set(sh.root, 'root', 'root');
  find('/bin').children.forEach((c) => { c.mode = 0o755; });
  set(find('/home/kid'), 'kid', 'kid'); set(find('/home/sib'), 'sib', 'sib');
  find('/home/kid/diary.txt').mode = 0o600; find('/home/sib/plans.txt').mode = 0o600;
  find('/tmp').mode = 0o1777; find('/tmp/chest.txt').mode = 0o600;
  sh.user = 'kid'; sh.su = []; sh.home = find('/home/kid'); sh.sudoAsked = false;
}
// Anything made during a command belongs to whoever made it, in their own group.
function claimNew(n = sh.root) {
  if (!n.owner) { n.owner = sh.user; n.group = USERS[sh.user].groups[0]; }
  n.children?.forEach((c) => claimNew(c));
}
const unclaim = (n) => { delete n.owner; delete n.group; n.children?.forEach(unclaim); return n; };
const pathDirs = () => ['/bin', pathOf(sh.home) + '/bin'];
// Where the shell finds a command: a path like ./hello, or a name it looks up in each PATH folder in turn.
function locate(cmd) {
  if (cmd.includes('/')) return find(cmd);
  for (const d of pathDirs()) { const n = find(`${d}/${cmd}`); if (n?.type === 'file') return n; }
  return null;
}
const isMachineCode = (n) => n.content.startsWith('0100');

/* the commands that need users and locks */
function chmodRun(rest, say, fail, info, out) {
  const [spec, ...files] = rest;
  if (!spec || !files.length) return fail('chmod: missing operand', 'Say who, then + or -, then which keys. Like: chmod u+x hello');
  for (const p of files) {
    const n = find(p);
    if (!n) { fail(`chmod: cannot access '${p}': No such file or directory`); continue; }
    if (own(n) !== sh.user && sh.user !== 'root') { fail(`chmod: changing permissions of '${p}': Operation not permitted`, `Only the owner (${own(n)}) can change this lock. You are ${sh.user}.`); continue; }
    let m = modeOf(n);
    if (/^\d+$/.test(spec)) {
      if (!/^[0-7]{3}$/.test(spec)) { info.badNumber = true; fail(`chmod: invalid mode: '${spec}'`, /[89]/.test(spec) ? 'No digit can be bigger than 7. Each digit is three on/off switches (r = 4, w = 2, x = 1), and three switches add up to 7 at most.' : 'The number way needs exactly three digits: owner, group, everyone else. Like 644.'); continue; }
      m = (m & ~0o777) | parseInt(spec, 8);
      if (!store.done.binary && LESSONS[cur]?.id !== 'binary' && once('chmodNumber')) say('(The number way is a shortcut that needs binary. The optional lesson "101" explains it. The letter way says the same thing in words: chmod u+x hello)', 'tip');
    } else {
      for (const part of spec.split(',')) {
        const s = part.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
        if (!s) { fail(`chmod: invalid mode: '${spec}'`, 'Say who (u = owner, g = group, o = others, a = all), then + to give or - to take away, then which keys (r, w, x). Like: chmod go-w hello'); m = null; break; }
        const bits = [...s[3]].reduce((b, c) => b | { r: 4, w: 2, x: 1 }[c], 0);
        for (const w of new Set((s[1] || 'a').replace('a', 'ugo'))) {
          const k = { u: 6, g: 3, o: 0 }[w];
          m = s[2] === '+' ? m | (bits << k) : s[2] === '-' ? m & ~(bits << k) : (m & ~(7 << k)) | (bits << k);
        }
      }
      if (m === null) continue;
    }
    const was = modeHTML(n);
    n.mode = m; info.mode = m; info.file = pathOf(n);
    out.push({ h: `<span class="mute">(the lock on ${esc(n.name)}: ${was} → ${modeHTML(n)})</span>`, t: '' });
  }
}
function chgrpRun(rest, fail, info) {
  const [g, ...files] = rest;
  if (!g || !files.length) return fail('chgrp: missing operand', 'Say the group, then the file. Like: chgrp family comics');
  if (GIDS[g] === undefined) return fail(`chgrp: invalid group: '${g}'`, `The groups on this computer are: ${Object.keys(GIDS).join(', ')}.`);
  for (const p of files) {
    const n = find(p);
    if (!n) { fail(`chgrp: cannot access '${p}': No such file or directory`); continue; }
    if (sh.user !== 'root' && (own(n) !== sh.user || !USERS[sh.user].groups.includes(g))) { fail(`chgrp: changing group of '${p}': Operation not permitted`, own(n) !== sh.user ? `Only the owner (${own(n)}) can do that.` : `You can only give things to a group you are in. You are in: ${USERS[sh.user].groups.join(', ')}.`); continue; }
    n.group = g; info.group = g; info.file = pathOf(n);
  }
}
function suRun(rest, say, fail, info) {
  const u = rest[0] ?? 'root';
  if (u === 'root') return fail('su: Authentication failure', 'Nobody is told root\'s password, not even grown-ups who look after the computer. They use sudo instead, one command at a time. (That\'s lesson sudo.)');
  if (!USERS[u]) return fail(`su: user ${u} does not exist`, 'The people on this computer are kid and sib.');
  sh.su.push({ user: sh.user, home: sh.home });
  sh.user = u; sh.home = find(`/home/${u}`); info.user = u;
  say(`Password: (the sandbox skips it. On a real computer you would need ${u}'s password, and you should only ever use your own.)`, 'mute');
  if (once('su')) say(`(su means switch user. Now everything you type happens as ${u}, with ${u}'s keys. Look at the prompt. ~ means ${u}'s home now, so where you are standing shows as a full path.)`, 'tip');
}
function sudoRun(rest, line, say, fail, info, out) {
  if (!rest.length) return fail('usage: sudo command', 'Put the command you want to run as root after it. Like: sudo whoami');
  if (!USERS[sh.user].groups.includes('sudo')) return fail(`${sh.user} is not in the sudoers file. This incident will be reported.`, `Only people in the sudo group may use sudo. ${sh.user} isn't. (Check with: id)`);
  if (rest[0] === 'su' || rest[0] === 'sudo') return fail('Let\'s not do that.', 'Staying root is how accidents happen. Use sudo for one command at a time.');
  if (!sh.sudoAsked) { sh.sudoAsked = true; say(`[sudo] password for ${sh.user}: ●●●●●●`, 'mute'); say(`(sudo asks for YOUR password, not root's. That proves it really is you at the keyboard. The sandbox typed it for you.)`, 'tip'); }
  const was = sh.user; sh.user = 'root';
  const r = run1(line.replace(/^\s*sudo\s+/, ''));
  claimNew(); sh.user = was;
  out.push(...r.out); info.sudo = true; info.inner = r;
  if (!r.ok) fail(null);
}
function whichRun(rest, say, fail) {
  if (!rest.length) return fail('which: what should I look for?', 'Like: which ls');
  for (const c of rest) {
    const n = BUILTIN.includes(c) ? null : locate(c);
    if (n) { say(pathOf(n)); continue; }
    fail(`which: no ${c} in (${pathDirs().join(':')})`, BUILTIN.includes(c) ? `${c} isn't a program in a folder at all. It is built into the shell itself. It has to be: cd changes where the shell is standing, and a separate program can't move the shell.` : null);
  }
}
// grep, wc, sort and head read files, or whatever comes down the pipe.
function textIn(rest, stdin, name, fail) {
  if (!rest.length) return stdin === undefined ? (fail(`${name}: which file?`, `Give it a file, like: ${name} diary.txt. Or pipe something into it with |`), null) : [{ label: '', text: stdin }];
  return rest.map((p) => {
    const n = find(p);
    if (!n) return fail(`${name}: ${p}: No such file or directory`), null;
    if (n.type === 'dir') return fail(`${name}: ${p}: Is a directory`), null;
    if (!can(n, 4)) return fail(`${name}: ${p}: Permission denied`, `You have no r (read) key for ${n.name}.`), null;
    return { label: p, text: n.content };
  }).filter(Boolean);
}
function grepRun(args, flags, stdin, say, fail, info) {
  const words = args.filter((a) => !/^-[a-z]+$/i.test(a)), pat = words[0];
  if (pat === undefined) return fail('grep: what should I search for?', 'Like: grep cookie diary.txt');
  const srcs = textIn(words.slice(1), stdin, 'grep', fail); if (!srcs) return;
  const norm = (s) => flags.has('i') ? s.toLowerCase() : s;
  info.matches = 0;
  for (const s of srcs) {
    const hits = s.text.split('\n').map((l, i) => [l, i + 1]).filter(([l]) => norm(l).includes(norm(pat)) !== flags.has('v'));
    info.matches += hits.length;
    if (flags.has('c')) { say((srcs.length > 1 ? s.label + ':' : '') + hits.length); continue; }
    hits.forEach(([l, i]) => say((srcs.length > 1 ? s.label + ':' : '') + (flags.has('n') ? i + ':' : '') + l));
  }
  if (!info.matches && !flags.has('c')) say(`(no lines contain "${pat}"${flags.has('i') ? '' : '. grep cares about capitals: add -i to ignore them'})`, 'mute');
}
function wcRun(rest, flags, stdin, say, fail) {
  const srcs = textIn(rest, stdin, 'wc', fail); if (!srcs) return;
  for (const s of srcs) {
    const t = s.text, n = { l: t ? t.split('\n').length : 0, w: t.split(/\s+/).filter(Boolean).length, c: t.length };
    const cols = flags.size ? ['l', 'w', 'c'].filter((k) => flags.has(k)) : ['l', 'w', 'c'];
    say(cols.map((k) => n[k]).join(' ') + (s.label ? ' ' + s.label : ''));
  }
}
// Run a program file: a script is just commands, one per line, run in order.
function runProgram(n, cmd, args, say, fail, info, out) {
  if (n.type === 'dir') return fail(`bash: ${cmd}: Is a directory`);
  if (!can(n, 1)) {
    info.denied = true; fail(`bash: ${cmd}: Permission denied`);
    out.push({ h: shelly(`To <b>run</b> a file you need its <b>x</b> key (x is for eXecute, which means run). You are ${whoYouAre(n)}, and ${setName[keySet(n)]} has no x.${store.done.chmod ? '' : ' That is the cliffhanger: don\'t try to fix it yet! The next lesson shows the keys, and the one after shows how to change them.'}`), t: '' });
    return;
  }
  if (n.parent && pathOf(n.parent) === '/bin' && isMachineCode(n)) { const r = run1([n.name, ...args].join(' ')); out.push(...r.out); if (!r.ok) fail(null); info.ran = pathOf(n); return; }
  if (!can(n, 4)) { info.denied = true; return fail(`bash: ${cmd}: Permission denied`, 'This program is a script: the shell has to read it to run it, so you need the r key too.'); }
  if ((sh.depth ?? 0) > 3) return fail(`${cmd}: too many programs running programs`, 'Your program keeps starting itself. Ctrl+C!');
  info.ran = pathOf(n);
  sh.depth = (sh.depth ?? 0) + 1;
  for (const [k, raw] of n.content.split('\n').entries()) {
    const l = raw.trim(); if (!l || l.startsWith('#')) continue;
    const r = run(l.replace(/\$(\d)/g, (_, d) => args[d - 1] ?? ''));
    // inside a program, only its own output shows; errors name the program and line, as bash does
    out.push(...r.out.filter((o) => !o.c || o.c === 'er').filter((o) => o.h === undefined && (o.t || !o.c)).map((o) => o.c === 'er' ? { ...o, t: `${cmd}: line ${k + 1}: ${o.t}` } : o));
    if (!r.ok) {
      fail(null); info.lineFailed = k + 1;
      out.push({ h: shelly(`Your program <b>did</b> run! But line ${k + 1} of it says <b>${esc(l)}</b>, and that isn't a command the shell can do. Every line of a program has to be a command, like <b>echo Hello!</b> Fix it with <b>nano ${esc(n.name)}</b>.`), t: '' });
      break;
    }
  }
  sh.depth--;
  if (!info.lineFailed && once('ran')) out.push({ h: shelly('Your program ran! The shell read it one line at a time and did each command. That is all a script is.'), t: '' });
}

/* pipes: the words on the left of | go in one end, and come out of the command on the right */
function splitTop(line, sep) {
  const parts = []; let cur = '', q = '';
  for (const ch of line) {
    if (q) { if (ch === q) q = ''; cur += ch; continue; }
    if (ch === '"' || ch === '\'') { q = ch; cur += ch; continue; }
    if (ch === sep) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  return [...parts, cur];
}
function run(raw) {
  const line = raw.replace(/\$(PATH|HOME|USER)\b/g, (_, v) => ({ PATH: pathDirs().join(':'), HOME: pathOf(sh.home), USER: sh.user })[v]);
  const seqs = splitTop(line, ';').map((s) => s.trim()).filter(Boolean);
  if (seqs.length > 1) {
    const rs = seqs.map((s) => run(s)), last = rs.at(-1);
    return { ...last, out: rs.flatMap((r) => r.out), ok: rs.every((r) => r.ok), line: raw, user: sh.user };
  }
  const segs = splitTop(line, '|').map((s) => s.trim());
  if (segs.length > 1 && segs.some((s) => !s)) {
    const r = run1(''); r.ok = false; r.out.push({ t: 'syntax error: | needs a command on both sides', c: 'er' }, { t: 'Like: grep cookie kitchen.log | wc -l', c: 'tip' });
    return { ...r, line: raw, user: sh.user };
  }
  let stdin, r, side = [];
  for (const [i, s] of segs.entries()) {
    const toks = s.split(/\s+/);
    r = toks[0] === 'cat' && toks.length === 1 && i > 0 ? { out: stdin.split('\n').map((t) => ({ t, c: '' })), ok: true, info: {}, cmd: 'cat', args: [], toks } : run1(s, i > 0 ? stdin : undefined);
    claimNew();
    if (i < segs.length - 1) {
      // only plain output flows down the pipe; errors and Shelly's tips stay on the screen
      stdin = r.out.filter((o) => !o.c && o.h === undefined).map((o) => o.t).join('\n');
      side.push(...r.out.filter((o) => o.c || o.h !== undefined));
    }
  }
  if (segs.length > 1) r = { ...r, out: [...side, ...r.out], info: { ...r.info, pipe: segs.map((s) => s.split(/\s+/)[0]) } };
  return { ...r, line: raw, user: sh.user };
}
// Missions build on each other. If an earlier one's file is missing (say, after Start over), put it back.
function ensure(path, make, note) {
  if (find(path)) return;
  const was = sh.user; sh.user = 'kid'; make(); claimNew(); sh.user = was;
  print(`<span class="tip">(${note})</span>`);
}
const HELLO = 'echo Hello from my program!';
function backToKid() {
  if (!sh.su.length) return;
  sh.user = 'kid'; sh.home = find('/home/kid'); sh.su = [];
  print('<span class="tip">(You are kid again. Missions start as you.)</span>');
}

/* file tree: programs get a ▶ tag. Once ls -l has been taught, every row also shows YOUR keys for it. */
const keysOn = () => !!store.done.lsl || cur >= LESSONS.findIndex((l) => l.id === 'lsl');
const myKeys = (n) => sh.user === 'root' ? 'rwx' : triplet(modeOf(n), SHIFT[keySet(n)]);
const mapTags = (n) => (n.type === 'file' && modeOf(n) & 0o111 && !(n.parent && pathOf(n.parent) === '/bin') ? '<i class="mtag run">▶ program</i>' : '')
  + (keysOn() && n !== sh.root ? `<i class="mtag keys" title="${sh.user}'s keys for this">${[...myKeys(n)].map((c) => `<b class="${c === '-' ? 'no' : ''}">${c}</b>`).join('')}</i>` : '');
$('.map-head').insertAdjacentHTML('beforeend', '<small class="keys-legend" id="keysLegend" hidden>Letters = <b>your</b> keys: <b>r</b> read · <b>w</b> write · <b>x</b> run or go in</small>');

/* nano: a small text editor inside the terminal window. ^ means the Ctrl key. */
const NANO = { open: false };
$('#termBody').insertAdjacentHTML('afterend', `<div class="nano" id="nano" hidden><div class="nano-top"><span>GNU nano</span><b id="nanoName"></b><span id="nanoMod"></span></div><textarea id="nanoText" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Text editor"></textarea><div class="nano-msg" id="nanoMsg"></div><div class="nano-keys"><button data-n="save"><b>^O</b> Save</button><button data-n="exit"><b>^X</b> Exit</button><span><b>^</b> means the <kbd>Ctrl</kbd> key</span></div></div>`);
const nanoText = $('#nanoText');
function nanoOpen(path, fail, info) {
  if (!path) return fail('nano: which file?', 'Like: nano note.txt');
  const n = find(path);
  if (n?.type === 'dir') return fail(`nano: ${path}: Is a directory`, 'nano edits files. To look inside a folder, use ls.');
  if (n && !can(n, 4)) { info.denied = true; return fail(`nano: ${path}: Permission denied`, `Opening a file needs its r key, and ${sh.user} has none for ${n.name}.`); }
  const [dp, name] = splitPath(path), d = n ? n.parent : find(dp);
  if (!d || d.type !== 'dir') return fail(`nano: ${path}: No such file or directory`, 'nano can start a new file, but the folder it goes in has to exist already.');
  Object.assign(NANO, { open: true, node: n, dir: d, name: n?.name ?? name, start: n?.content ?? '', saved: n?.content ?? '', asking: false });
  info.nano = { path: n ? pathOf(n) : `${pathOf(d) === '/' ? '' : pathOf(d)}/${name}`, isNew: !n };
  setTimeout(() => {
    $('#term').classList.add('editing'); $('#nano').hidden = false;
    $('#nanoName').textContent = NANO.name + (n ? '' : '  (New File)');
    nanoText.value = NANO.saved; nanoMark(); nanoMsg(n ? '' : 'A new file. Type away!');
    nanoText.focus({ preventScroll: true }); nanoText.setSelectionRange(0, 0);
  }, 0);
}
const nanoMsg = (h) => { $('#nanoMsg').innerHTML = h; };
const nanoMark = () => { $('#nanoMod').textContent = nanoText.value !== NANO.saved ? 'Modified' : ''; };
function nanoSave() {
  const n = NANO.node, target = n ?? NANO.dir;
  if (!can(target, 2)) { nanoMsg(`[ Error writing ${esc(NANO.name)}: Permission denied ]`); sound.boing(160, .2, .06); return false; }
  const text = nanoText.value.replace(/\n$/, '');
  if (n) n.content = text;
  else { NANO.node = { id: 'n' + nid++, name: NANO.name, type: 'file', content: text, children: null, parent: NANO.dir }; NANO.dir.children.push(NANO.node); sortKids(NANO.dir); claimNew(); }
  NANO.saved = nanoText.value; nanoMark(); renderMap();
  const lines = text ? text.split('\n').length : 0;
  nanoMsg(`[ Wrote ${lines} line${lines === 1 ? '' : 's'} ]`); sound.blip();
  check({ type: 'nano', saved: pathOf(NANO.node), changed: text !== NANO.start, content: text });
  return true;
}
function nanoClose() {
  NANO.open = false; NANO.asking = false;
  $('#nano').hidden = true; $('#term').classList.remove('editing');
  const path = NANO.node ? pathOf(NANO.node) : null;
  LESSONS[cur]?.afterNano?.(NANO.node);
  paintPrompt(); renderMap(); scrollDown(); termIn.focus({ preventScroll: true });
  check({ type: 'nano', exit: true, path });
}
function nanoExit() {
  if (nanoText.value === NANO.saved) return nanoClose();
  NANO.asking = true;
  nanoMsg('Save the changes? <button data-n="yes"><b>Y</b> Yes</button> <button data-n="no"><b>N</b> No</button> <button data-n="cancel"><b>^C</b> Cancel</button>');
}
function nanoAnswer(a) {
  if (a === 'yes') { if (nanoSave()) nanoClose(); return; }
  if (a === 'no') return nanoClose();
  NANO.asking = false; nanoMsg(''); nanoText.focus({ preventScroll: true });
}
nanoText.addEventListener('input', nanoMark);
nanoText.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (NANO.asking) {
    e.preventDefault();
    if (k === 'y') nanoAnswer('yes'); else if (k === 'n') nanoAnswer('no'); else if (k === 'escape' || (e.ctrlKey && k === 'c')) nanoAnswer('cancel');
    return;
  }
  if (!e.ctrlKey || e.metaKey) return;
  if (k === 'o' || k === 's') { e.preventDefault(); nanoSave(); }
  else if (k === 'x') { e.preventDefault(); nanoExit(); }
  else if (k === 'c') { e.preventDefault(); nanoMsg('(To leave nano, press Ctrl+X.)'); }
  else if (k === 'd') e.preventDefault();
});
$('#nano').addEventListener('click', (e) => {
  const b = e.target.closest('[data-n]'); if (!b) return;
  const a = b.dataset.n;
  if (a === 'save') { nanoSave(); nanoText.focus({ preventScroll: true }); } else if (a === 'exit') nanoExit(); else nanoAnswer(a);
});
