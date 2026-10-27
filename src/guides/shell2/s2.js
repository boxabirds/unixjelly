/* ---------------- Shell Jelly 2: people, locks, programs and pipes ---------------- */
// The shell itself (locks, su, sudo, scripts, the PATH, pipes) is jellysh, in src/shell/jellysh.js.
// This file gives it the people on this computer and Shell Jelly 2's teaching voice.
// Three accounts, like a real computer: root (the boss), kid (you) and sib (your little sibling).
// Everyone also has a group named after them. kid is in sudo, so kid may borrow root's power.
const USERS = {
  root: { uid: 0, groups: ['root'] },
  kid: { uid: 1000, groups: ['kid', 'sudo', 'family'] },
  sib: { uid: 1001, groups: ['sib', 'family'] },
};
const GIDS = { root: 0, sudo: 27, kid: 1000, sib: 1001, family: 1002 };
const BUILTIN = ['cd', 'exit', 'help', 'history'];
const own = SH.own, grp = SH.grp, modeOf = SH.modeOf, keySet = SH.keySet, can = SH.can, triplet = SH.triplet, modeStr = SH.modeStr, claimNew = SH.claimNew, SHIFT = SH.SHIFT;
const run1 = (line) => SH.run(line);
// The lock in colour. The set of keys that applies to whoever is typing is underlined.
const modeHTML = (n) => {
  const s = modeStr(n), mine = keySet(n);
  return `<span class="perm">${s[0]}<b class="pu${mine === 'owner' ? ' mine' : ''}">${s.slice(1, 4)}</b><b class="pg${mine === 'group' ? ' mine' : ''}">${s.slice(4, 7)}</b><b class="po${mine === 'others' ? ' mine' : ''}">${s.slice(7)}</b></span>`;
};
const setName = { owner: 'the owner\'s set (the first three letters)', group: 'the group\'s set (the middle three letters)', others: 'everyone else\'s set (the last three letters)' };
const whoYouAre = (n) => ({ owner: 'the owner', group: `in the <b>${esc(grp(n))}</b> group`, others: 'not the owner and not in its group, so you count as <b>everyone else</b>' })[keySet(n)];
// Before "Read the locks", a refusal is explained without keys, owners or r/w/x: that lesson is where they're taught.
const NOT_YET = 'The computer said no. The lesson "Read the locks" explains why.';
const lockTip = (tip) => taught('locks') ? tip : NOT_YET;
const once = (k) => !store.seen?.[k] && ((store.seen ??= {})[k] = true, save(), true);

function s2Perms() {
  const set = (n, o, g) => { n.owner = o; n.group = g; n.children?.forEach((c) => set(c, o, g)); };
  set(sh.root, 'root', 'root');
  find('/bin').children.forEach((c) => { c.mode = 0o755; });
  set(find('/home/kid'), 'kid', 'kid'); set(find('/home/sib'), 'sib', 'sib');
  find('/home/kid/diary.txt').mode = 0o600; find('/home/sib/plans.txt').mode = 0o600;
  find('/tmp').mode = 0o1777; find('/tmp/chest.txt').mode = 0o600;
}

// Shell Jelly 2's voice, on top of Shell Jelly's (which explains paths and typos).
const base = SH.hooks;
SH.configure({
  users: USERS, gids: GIDS,
  hooks: {
    modeHTML,
    before: (c) => {
      base.before?.(c);
      if (c.cmd === 'ls' && c.flags.has('l') && once('lsl')) c.say('(How to read each line: the first letter is d for a folder or - for a file. The next nine letters are the lock: three sets of keys, for the owner, the group and everyone else. r = read, w = write, x = run, - = no key. The set that works for you is underlined. Then: the owner, the group, the size and the date.)', 'tip');
    },
    // A lock said no. With a ready-made tip: show it, or NOT_YET before the locks are taught. Otherwise Shelly explains.
    denied: (c, { op, node, tip }) => {
      if (tip) return lockTip(tip);
      if (op === 'exec') return c.note(shelly(taught('locks')
        ? `To <b>run</b> a file you need its <b>x</b> key (x is for eXecute, which means run). You are ${whoYouAre(node)}, and ${setName[keySet(node)]} has no x.${taught('chmod') ? '' : ' The next lesson shows how to change that.'}`
        : 'The computer refused to run it. Why? That is the cliffhanger: don\'t try to fix it yet! The next lesson explains.'));
      if (!taught('locks')) return c.say(NOT_YET, 'tip');
      if (op === 'enter') return c.note(shelly(`Going <b>into</b> a folder needs its <b>x</b> key. You are ${whoYouAre(node)}, and ${setName[keySet(node)]} for ${esc(node.name)} is ${modeHTML(node)}: no x.`));
      c.note(shelly(`The lock on ${esc(node.name)} is ${modeHTML(node)}. It belongs to ${esc(own(node))}. You are <b>${sh.user}</b>, ${whoYouAre(node)}. So you get ${setName[keySet(node)]}, and it has no <b>r</b> key. No entry!`));
    },
    tip: (key, text) => {
      if (key === 'chmod.number') return !store.done.binary && LESSONS[cur]?.id !== 'binary' && once('chmodNumber') ? '(The number way is a shortcut that needs binary. The optional lesson "101" explains it. The letter way says the same thing in words: chmod u+x hello)' : null;
      if (key === 'su.root') return 'Nobody is told root\'s password, not even grown-ups who look after the computer. They use sudo instead, one command at a time. (That\'s lesson sudo.)';
      if (/^(chmod|chgrp|exec)\./.test(key)) return lockTip(text);
      return base.tip ? base.tip(key, text) : text;
    },
    after: (c) => {
      base.after?.(c);
      if (c.cmd === 'su' && c.info.user) {
        c.say(`Password: (the sandbox skips it. On a real computer you would need ${c.info.user}'s password, and you should only ever use your own.)`, 'mute');
        if (once('su')) c.say(`(su means switch user. Now everything you type happens as ${c.info.user}${taught('locks') ? `, with ${c.info.user}'s keys` : ''}. Look at the prompt. ~ means ${c.info.user}'s home now, so where you are standing shows as a full path.)`, 'tip');
      }
      if (c.cmd === 'exit' && c.info.left) c.say(`(exit: you are ${sh.user} again${taught('locks') ? `, with ${sh.user}'s keys` : ''}.)`, 'mute');
      if (c.cmd === 'id' && !c.status && once('id')) c.say('(uid is the user number: computers prefer numbers to names. gid is your own group. groups lists every club you are in.)', 'tip');
      if (c.cmd === 'chmod' && c.info.file && taught('locks')) { const n = find(c.info.file); c.note(`<span class="mute">(the lock on ${esc(n.name)}: ${modeHTML({ ...n, mode: c.info.was })} → ${modeHTML(n)})</span>`); }
      if (c.info.ran && !c.info.ran.startsWith('/bin/') && !c.info.lineFailed && once('ran')) c.note(shelly('Your program ran! The shell read it one line at a time and did each command. That is all a script is.'));
    },
    scriptFailed: (c, { line, number, node }) => c.note(shelly(`Your program <b>did</b> run! But line ${number} of it says <b>${esc(line)}</b>, and that isn't a command the shell can do. Every line of a program has to be a command, like <b>echo Hello!</b> Fix it with <b>nano ${esc(node.name)}</b>.`)),
    // A file of that name is right here, but the shell only runs programs from the folders on its PATH.
    notFound: (c) => {
      const here = sh.cwd.children.find((x) => x.name === c.cmd && x.type === 'file');
      if (!here) return base.notFound(c);
      c.fail(`${c.cmd}: command not found`, null, 127);
      c.note(shelly(`There is a file called <b>${esc(c.cmd)}</b> right here, but the shell only looks for programs in the folders on its list (${SH.pathDirs().join(' and ')}). To run one from this folder, say where it is: <b>./${esc(c.cmd)}</b>`));
      c.note(tryCmd('./' + c.cmd));
      return true;
    },
  },
});
SH.define('help', (c) => { c.say('New words: ' + ['whoami', 'hostname', '>', '>>', 'nano', 'which', './', 'ls -l', 'chmod', 'echo $PATH', 'id', 'groups', 'chgrp', 'su', 'exit', 'sudo', 'grep', 'wc', 'sort', 'head', '|'].join('  ')); c.say('Shell Jelly words: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history'].join('  ')); });
SH.define('nano', (c) => nanoOpen(c.rest[0], c.fail, c.info));

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

/* file tree: programs get a ▶ tag once scripts are taught. Once the locks are taught, a row shows a padlock for each
   key YOU are missing: an eye (can't read it), a pencil (can't change it) and, for folders, a door (can't go in).
   A file with no x key gets no padlock, because most files aren't programs. */
const keysOn = () => taught('locks');
const myKeys = (n) => sh.user === 'root' ? 'rwx' : triplet(modeOf(n), SHIFT[keySet(n)]);
const SHACKLE = '<path d="M3.5 7.5V5.5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="#24133b" stroke-width="1.8"/><rect x="1.5" y="7.5" width="11" height="8" rx="2" fill="#ff4d6d" stroke="#24133b" stroke-width="1.6"/>';
const PADLOCK = {
  r: ['can\'t read it', '<path d="M14 10.5Q19.5 4.5 25 10.5Q19.5 16.5 14 10.5Z" fill="#fff" stroke="#24133b" stroke-width="1.5"/><circle cx="19.5" cy="10.5" r="2" fill="#24133b"/>'],
  w: ['can\'t change it', '<path d="M15 15.5l.6-3.4 7.2-7.2 2.8 2.8-7.2 7.2z" fill="#ffc61a" stroke="#24133b" stroke-width="1.4" stroke-linejoin="round"/><path d="M15 15.5l.6-3.4 2.8 2.8z" fill="#24133b"/>'],
  x: ['can\'t go in', '<rect x="15" y="3.5" width="9" height="12" rx="1" fill="#b98a5e" stroke="#24133b" stroke-width="1.5"/><circle cx="21.6" cy="10" r="1" fill="#24133b"/>'],
};
const padlock = (k, who) => `<svg viewBox="0 0 26 17" class="lock-ico" role="img" aria-label="${who} ${PADLOCK[k][0]}"><title>${who} ${PADLOCK[k][0]}</title>${SHACKLE}${PADLOCK[k][1]}</svg>`;
const mapTags = (n) => (taught('scripts') && n.type === 'file' && modeOf(n) & 0o111 && !(n.parent && pathOf(n.parent) === '/bin') ? '<i class="mtag run">▶ program</i>' : '')
  + (keysOn() && n !== sh.root ? [...myKeys(n)].map((c, i) => c === '-' && (i < 2 || n.type === 'dir') ? padlock('rwx'[i], sh.user) : '').join('') : '');
$('.map-head').insertAdjacentHTML('beforeend', `<small class="keys-legend" id="keysLegend" hidden>Padlocks show what <b>you</b> can't do: ${padlock('r', 'you')} read · ${padlock('w', 'you')} change · ${padlock('x', 'you')} go in</small>`);

/* nano: a small text editor inside the terminal window. ^ means the Ctrl key. */
const NANO = { open: false };
$('#termBody').insertAdjacentHTML('afterend', `<div class="nano" id="nano" hidden><div class="nano-top"><span>GNU nano</span><b id="nanoName"></b><span id="nanoMod"></span></div><textarea id="nanoText" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Text editor"></textarea><div class="nano-msg" id="nanoMsg"></div><div class="nano-keys"><button data-n="save"><b>^O</b> Save</button><button data-n="exit"><b>^X</b> Exit</button><span><b>^</b> means the <kbd>Ctrl</kbd> key</span></div></div>`);
const nanoText = $('#nanoText');
function nanoOpen(path, fail, info) {
  if (!path) return fail('nano: which file?', 'Like: nano note.txt');
  const n = find(path);
  if (n?.type === 'dir') return fail(`nano: ${path}: Is a directory`, 'nano edits files. To look inside a folder, use ls.');
  if (n && !can(n, 4)) { info.denied = true; return fail(`nano: ${path}: Permission denied`, lockTip(`Opening a file needs its r key, and ${sh.user} has none for ${n.name}.`)); }
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
