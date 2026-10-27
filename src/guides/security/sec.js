/* ---------------- security: users, locks and hats ---------------- */
// The shell (locks, su, chmod) is jellysh, in src/shell/jellysh.js. This file gives it the two people on this
// pretend computer, the made-up sign command, and Jelly Security's voice.
// The same people and groups as Jelly Shell 2, which comes first: everyone has a group named after them, and family
// is a shared club. So a child sees the same owners and groups in ls -l as before.
const SEC_USERS = { root: { uid: 0, groups: ['root'] }, kid: { uid: 1000, groups: ['kid', 'sudo', 'family'] }, sib: { uid: 1001, groups: ['sib', 'family'] } };
const own = SH.own, grp = SH.grp, modeOf = SH.modeOf, can = SH.can, triplet = SH.triplet, modeStr = SH.modeStr;
// The lock in colour, so the three sets of keys stand apart (everyone-else keys glow when they let anyone in).
const modeHTML = (n) => { const m = modeOf(n); return `<span class="perm">${n.type === 'dir' ? 'd' : '-'}<b class="pu">${triplet(m, 6)}</b><b class="pg">${triplet(m, 3)}</b><b class="po${m & 0o6 ? ' open' : ''}">${triplet(m, 0)}</b></span>`; };
const inGroup = (n) => SEC_USERS[sh.user]?.groups.includes(grp(n));
// Who owns what when the pretend computer starts, as in Jelly Shell 2. The diary is the hole: its lock gives
// everyone else the keys too, so sib gets in as "everyone else".
function secPerms() {
  const set = (n, owner, group) => { n.owner = owner; n.group = group; n.children?.forEach((c) => set(c, owner, group)); };
  set(sh.root, 'root', 'root');
  find('/bin').children.forEach((c) => { c.mode = 0o755; });
  set(find('/home/kid'), 'kid', 'kid'); set(find('/home/sib'), 'sib', 'sib');
  find('/home/kid/diary.txt').mode = 0o666;
  find('/home/sib/plans.txt').mode = 0o600;
  // sign is a made-up command, so its program is readable text: proof that anyone can write one.
  find('/bin/sign').content = '# sign: a tiny program written by Jelly Security HQ.\n# It adds your name to the end of a file.\n# The shell runs these lines one by one.\necho "  Signed: kid, ethical hacker (white hat)" >> permission-slip.txt\necho "Signed! You may now test this pretend computer."';
}
// Explain a new idea the first time it turns up, not every time.
const once = (k) => !store.seen?.[k] && ((store.seen ??= {})[k] = true, save(), true);

const base = SH.hooks;
SH.configure({
  users: SEC_USERS, gids: { root: 0, sudo: 27, kid: 1000, sib: 1001, family: 1002 },
  hooks: {
    modeHTML,
    before: (c) => {
      base.before?.(c);
      if (c.cmd === 'ls' && c.flags.has('l') && once('perm')) c.say('(Remember the locks from Jelly Shell 2: d or -, then three sets of keys, for the owner, the group and everyone else. r = read, w = write, x = run, - = no key.)', 'tip');
    },
    denied: (c, { op, node, tip }) => {
      if (tip) return op === 'write' ? `You are ${sh.user}, and that set of keys has no w (write) key.` : tip;
      if (op === 'read') c.note(`<span class="shelly">Shelly:</span> The lock on ${esc(node.name)} is ${modeHTML(node)}, owned by ${own(node)}. You are <b>${sh.user}</b>, ${own(node) === sh.user ? 'the owner' : inGroup(node) ? `in the ${grp(node)} group` : 'everyone else'}, and that set has no <b>r</b> key. No entry!`);
    },
    tip: (key, text) => ({
      'chmod.usage': 'Try: chmod go-rw diary.txt',
      'chmod.digits': 'The number way is three digits, one for each set of keys, and no digit can be bigger than 7. Each digit is really three on/off switches (r, w, x) in binary, and three switches can only count up to 7. Use the letters instead: chmod go-rw diary.txt',
      'chmod.count': 'The number way is three digits, one for each set of keys, and no digit can be bigger than 7. Use the letters instead: chmod go-rw diary.txt',
      'chmod.number': '(The number way is a shortcut that needs binary: each digit is three on/off switches, r = 4, w = 2, x = 1. The letter way says the same thing in words: chmod go-rw diary.txt)',
      'chmod.letters': 'Say who (u = owner, g = group, o = others), then + or -, then which keys (r, w, x). Like: chmod go-rw diary.txt',
      'su.root': 'root is the boss user of the whole computer, and being root is not part of this mission. Yes, root again! It is also the name of the very top folder, /. Same word, two meanings. Try: su sib',
      'su.who': 'The users on this computer are kid and sib.',
    })[key] ?? (base.tip ? base.tip(key, text) : text),
    after: (c) => {
      base.after?.(c);
      if (c.cmd === 'cat' && c.info.hits?.length) for (const p of c.info.hits) {
        const n = find(p);
        if (own(n) !== sh.user && SEC_USERS[own(n)] && own(n) !== 'root') c.note(shelly(`You got in! ${esc(n.name)} belongs to ${own(n)}, but you are <b>${sh.user}</b>, ${inGroup(n) ? `in the <b>${grp(n)}</b> group, so you get the middle set of keys in ${modeHTML(n)}. That set has an <b>r</b> key` : 'everyone else, so you get the last set of keys, and it has an <b>r</b> key'}.`));
      }
      if (c.cmd === 'whoami') {
        if (once('whoami')) c.note(shelly('<b>whoami</b> asks: which <b>account</b> am I using? One computer can have lots of users, each with their own home folder. Your prompt says it too: the bit before the <b>@</b> is you.'));
        c.say(sh.user === 'kid' ? (store.signed ? '(An ethical hacker, white hat, with a signed permission slip.)' : '(No permission slip signed yet.)') : '(You borrowed sib\'s account. Type exit to go back to being kid.)', 'tip');
      }
      if (c.cmd === 'id' && !c.status) c.say('(uid is your user number. groups are the clubs you belong to. If a file belongs to one of your groups, you get its middle set of keys.)', 'tip');
      if (c.cmd === 'chmod' && c.info.file) {
        const n = find(c.info.file), m = modeOf(n);
        c.note(`<span class="mute">(lock on ${esc(n.name)}: ${modeHTML({ ...n, mode: c.info.was })} → ${modeHTML(n)})</span>`);
        c.say(`(${n.name} is now ${modeStr(n)}: ${!(m & 0o077) ? `only ${own(n)} has any keys` : m & 0o006 ? 'everyone else still has keys' : 'the group has keys, everyone else doesn\'t'}.)`, 'mute');
      }
      if (c.cmd === 'su' && c.info.user) {
        c.say(`(su means switch user. You are now ${c.info.user}, so you only have ${c.info.user}'s keys. Look at the prompt: it says ${c.info.user}@jelly. Type exit to go back.)`, 'mute');
        c.say('(On a real computer, su asks for that person\'s password. The sandbox skips it so you can practise.)', 'tip');
      }
      if (c.cmd === 'exit' && c.info.left) c.say('(exit leaves sib\'s shell, so you are back to being kid, with kid\'s keys. Look at the prompt.)', 'mute');
    },
  },
});
SH.define('sign', (c) => {
  const n = find(c.rest[0] ?? '');
  if (!n || !n.name.startsWith('permission-slip')) return c.fail('sign: what should I sign?', 'Try: sign permission-slip.txt');
  if (!store.signed) { n.content += '\n  Signed: kid, ethical hacker (white hat)'; store.signed = true; save(); }
  c.say('Signed! You may now test this pretend computer. Only this one.', 'tip'); c.info.signed = true;
  if (once('sign')) { c.note(shelly('Where did <b>sign</b> come from? Jelly Security HQ wrote it! A command is just a program, and programs live in <b>/bin</b>. Anyone can write a program and call it whatever they like. This one is only a few lines of text: peek inside with <b>cat /bin/sign</b>')); c.note(tryCmd('cat /bin/sign')); }
});
SH.define('help', (c) => { c.say('Security words: ' + ['ls -l', 'chmod', 'su', 'exit', 'whoami', 'id', 'sign'].join('  ')); c.say('Shell words: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history'].join('  ')); });

/* the hats: each mission step says which hat you are wearing */
const HATS = {
  black: { name: 'Black hat', now: 'attacker · red team', fill: '#24133b', band: '#ffc61a' },
  white: { name: 'White hat', now: 'defender · blue team', fill: '#ffffff', band: '#ff4d6d' },
};
const hatSVG = (h) => `<svg viewBox="0 0 64 40" class="hat-svg" aria-hidden="true"><path d="M5 31 q27 11 54 0 q-4 -5 -13 -6 l-3 -19 q-12 -7 -24 0 l-3 19 q-9 1 -11 6z" fill="${h.fill}" stroke="#24133b" stroke-width="3" stroke-linejoin="round"/><path d="M18 21 q14 5 28 0" fill="none" stroke="${h.band}" stroke-width="4" stroke-linecap="round"/></svg>`;
$('.ljelly').insertAdjacentHTML('beforeend', '<div class="lj-hat" id="ljHat"></div>');
let lastHat = null;
onTask = (L, step) => {
  const h = HATS[step.hat];
  document.querySelector('.task').dataset.hat = step.hat ?? '';
  $('#ljHat').innerHTML = h ? hatSVG(h) : '';
  if (h) $('#lTaskN').insertAdjacentHTML('afterbegin', `<span class="hat-badge">${hatSVG(h)}${h.name} <small>${h.now}</small></span>`);
  if (h && lastHat && lastHat !== step.hat) { $('#ljHat').animate([{ transform: 'translateY(-60px) rotate(-30deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.3,1.6,.5,1)' }); toast(`Swap hats: ${h.name}!`); sound.boing(step.hat === 'black' ? 240 : 760, .3, .1); }
  lastHat = step.hat ?? lastHat;
  $('#lcard').classList.toggle('choosing', !!step.choices);
  if (step.choices) $('#lTask').insertAdjacentHTML('beforeend', `<div class="choices">${step.choices.map((c, j) => `<button class="choice" data-j="${j}">${c.c}</button>`).join('')}</div>`);
};
// A dilemma: every choice gets an answer. The white-hat choice moves the mission on; the others explain why not.
$('#lTask').addEventListener('click', (e) => {
  const b = e.target.closest('.choice'); if (!b) return;
  const L = LESSONS[cur], st = store.steps[L.id] ?? [], i = L.steps.findIndex((s, k) => !st[k]), c = L.steps[i]?.choices?.[b.dataset.j];
  if (!c) return;
  b.classList.add(c.good ? 'good' : 'bad');
  print(`<span class="${c.good ? 'ok' : 'er'}">${c.good ? '✓' : '✗'} ${esc(b.textContent)}</span>`);
  print(`<span class="shelly">Shelly:</span> ${c.say}`); scrollDown();
  if (c.good) check({ type: 'choice', k: i }); else sound.boing(160, .2, .06);
});
