/* ---------------- security: users, locks and hats ---------------- */
// The shell (locks, su, chmod) is jellysh, in src/shell/jellysh.js. This file gives it the two people on this
// pretend computer, the made-up sign command, and Security Jelly's voice.
// The same people and groups as Shell Jelly 2, which comes first: everyone has a group named after them, and family
// is a shared club. So a child sees the same owners and groups in ls -l as before.
// room is a spare account with nothing worth breaking, for running strangers' programs (A room of its own).
const SEC_USERS = { root: { uid: 0, groups: ['root'] }, kid: { uid: 1000, groups: ['kid', 'sudo', 'family'] }, sib: { uid: 1001, groups: ['sib', 'family'] }, room: { uid: 1003, groups: ['room'] } };
const own = SH.own, grp = SH.grp, modeOf = SH.modeOf, can = SH.can, triplet = SH.triplet, modeStr = SH.modeStr;
// The lock in colour, so the three sets of keys stand apart (everyone-else keys glow when they let anyone in).
const modeHTML = (n) => { const m = modeOf(n); return `<span class="perm">${n.type === 'dir' ? 'd' : '-'}<b class="pu">${triplet(m, 6)}</b><b class="pg">${triplet(m, 3)}</b><b class="po${m & 0o6 ? ' open' : ''}">${triplet(m, 0)}</b></span>`; };
const inGroup = (n) => SEC_USERS[sh.user]?.groups.includes(grp(n));
/* the missions' props: a leaked list of fingerprints, the attackers' cracking list, a game server and its log, a "free coins" mod */
// HQ's pretend fingerprint machine. Real ones (hash functions, like sha256sum) make much longer fingerprints.
const fingerprintOf = (s) => { let h = 0x811c9dc5; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const COMMON = ['123456', 'password', '123456789', 'qwerty', '12345678', '111111', '1234567', 'iloveyou', 'abc123', 'password1', '123123', 'football', 'monkey', 'dragon', 'sunshine', 'princess', 'letmein', 'shadow', 'master', 'superman', 'batman', 'pokemon', 'minecraft', 'roblox', 'roblox123', 'fortnite', 'pizza', 'pizza123', 'jellybean', 'jelly123', 'chocolate', 'unicorn', 'starwars', 'hello123', 'welcome', 'admin', 'qwerty123', '000000', '654321', 'liverpool', 'chelsea', 'arsenal', 'cheese', 'banana', 'summer', 'flower', 'soccer', 'charlie', 'cookie', 'cookie123', 'pepper', 'daisy', 'lucky', 'hunter', 'ninja', 'purple', 'orange', 'abcd1234', 'trustno1', 'freedom', 'whatever', 'computer', 'internet', 'gaming', 'gamer123', 'noob123', 'hacker', 'secret', 'secret123', 'passw0rd', 'iloveyou1', 'zxcvbnm', 'asdfgh', 'raspberry', 'toor'];
const COMMON_FP = new Set(COMMON.map(fingerprintOf));
const strongPassword = (p) => p.length >= 12 && !COMMON.includes(p.toLowerCase()) && !COMMON_FP.has(fingerprintOf(p));
const PLAYERS = [['ava', 'tigerlanternbiscuit'], ['max', 'football'], ['sib', 'pizza123'], ['zed', 'dragon']];
// Last night on the game server: bots knocking every few seconds, and one getting in with the default password.
function serverLog() {
  const tries = [['root', '123456'], ['admin', 'password'], ['pi', 'raspberry'], ['root', 'root'], ['admin', '1234'], ['user', 'user'], ['test', 'test'], ['admin', '12345'], ['root', 'toor'], ['guest', 'guest'], ['root', 'password']];
  const clock = (t) => [t / 3600, t / 60 % 60, t % 60].map((v) => String(Math.floor(v)).padStart(2, '0')).join(':');
  const line = (t, u, p, bot) => `${clock(t)}  FAILED  user=${u.padEnd(6)} password=${p.padEnd(10)} from=bot-${bot}`;
  let r = 7, t = 3 * 3600 + 12 * 60 + 7;
  const rnd = () => (r = (r * 1103515245 + 12345) % 2147483648) / 2147483648;
  const lines = ['# server.log: who knocked on the jelly game server last night', line(t, 'root', '123456', 4471), line(t += 2, 'admin', 'password', 2210), line(t += 3, 'pi', 'raspberry', 7318)];
  while (t < 5 * 3600 + 41 * 60) { const [u, p] = tries[Math.floor(rnd() * tries.length)]; t += 1 + Math.floor(rnd() * 12); lines.push(line(t, u, p, 1000 + Math.floor(rnd() * 9000))); }
  return [...lines, '05:41:07  OK      user=admin  password=admin      from=bot-0932', '05:41:09  bot-0932 started using the server to send spam'].join('\n');
}
const FREE_COINS = '# FREE COINS for Jelly Games!!! 1000 coins, no catch\necho "Adding 1000 free coins..."\nrm -r ~/homework\necho "Done! Enjoy your coins :)"';
// The files the missions add to the pretend computer (seeded with the rest in build.py).
const SEC_FILES = {
  kid: {
    'leak/': {
      'players.txt': 'LEAKED from Jelly Games (a pretend game site)\nname   password fingerprint\n' + PLAYERS.map(([n, p]) => `${n.padEnd(6)} ${fingerprintOf(p)}`).join('\n'),
      'common.txt': '# The attackers\' cracking list: popular passwords, fingerprinted in advance.\n# fingerprint  password   (a real list has millions of lines)\n' + COMMON.map((p) => `${fingerprintOf(p)}  ${p}`).join('\n'),
    },
    'server/': { 'server.log': serverLog(), 'settings.txt': '# Jelly game server settings\nadmin_password=admin' },
    'Downloads/': { 'free-coins': FREE_COINS },
    'homework/': { 'essay.txt': 'My holiday, by kid. We went to the beach and a seagull stole my chips.', 'maths.txt': '7 x 8 = 56\n9 x 6 = 54\n12 x 12 = 144' },
  },
  room: { 'free-coins': FREE_COINS, 'readme.txt': 'This is the spare room. Nothing in here is worth breaking.' },
};
// Is the game server safe now? Its password must be strong (and no longer the default).
function serverSafe() {
  const p = find('/home/kid/server/settings.txt')?.content.match(/admin_password=(\S+)/)?.[1];
  return !!p && strongPassword(p);
}

const setOwner = (n, owner, group) => { n.owner = owner; n.group = group; n.children?.forEach((c) => setOwner(c, owner, group)); };
// Who owns what when the pretend computer starts, as in Shell Jelly 2. The diary is the hole: its lock gives
// everyone else the keys too, so sib gets in as "everyone else".
function secPerms() {
  setOwner(sh.root, 'root', 'root');
  find('/bin').children.forEach((c) => { c.mode = 0o755; });
  setOwner(find('/home/kid'), 'kid', 'kid'); setOwner(find('/home/sib'), 'sib', 'sib'); setOwner(find('/home/room'), 'room', 'room');
  find('/home/kid/diary.txt').mode = 0o666;
  find('/home/sib/plans.txt').mode = 0o600;
  // downloads can't run until someone gives them an x key; the spare room's copy is ready to run; homework is kid's alone
  find('/home/kid/Downloads/free-coins').mode = 0o644; find('/home/room/free-coins').mode = 0o755;
  find('/home/kid/homework').mode = 0o700; find('/home/kid/server/settings.txt').mode = 0o600;
  // sign is a made-up command, so its program is readable text: proof that anyone can write one.
  find('/bin/sign').content = '# sign: a tiny program written by Security Jelly HQ.\n# It adds your name to the end of a file.\n# The shell runs these lines one by one.\necho "  Signed: kid, ethical hacker (white hat)" >> permission-slip.txt\necho "Signed! You may now test this pretend computer."';
}
// After free-coins wipes the homework, the sandbox puts a fresh copy back so the fix can be tried.
function restoreHomework() {
  const hw = seed().children.find((n) => n.name === 'home').children.find((n) => n.name === 'kid').children.find((n) => n.name === 'homework'), kid = find('/home/kid');
  hw.parent = kid; kid.children.push(hw); setOwner(hw, 'kid', 'kid'); hw.mode = 0o700;
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
      if (c.cmd === 'ls' && c.flags.has('l') && once('perm')) c.say('(Remember the locks from Shell Jelly 2: d or -, then three sets of keys, for the owner, the group and everyone else. r = read, w = write, x = run, - = no key.)', 'tip');
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
      'su.who': 'The users on this computer are kid and sib, plus a spare account called room.',
      // a fingerprint that isn't on the list is the good outcome, not a typo
      'grep.nothing': /"[0-9a-f]{8}"/.test(text) ? '(no lines contain it: that fingerprint is not on the list)' : undefined,
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
      if (c.cmd === 'exit' && c.info.left) c.say(`(exit leaves ${c.info.left}'s shell, so you are back to being kid, with kid's keys. Look at the prompt.)`, 'mute');
      if (c.cmd === 'su' && c.info.user === 'room' && taught('isolation')) c.note(shelly('Welcome to the spare room. <b>room</b> is an account with nothing worth breaking, and no keys to your homework. Look at the prompt: you are room now.'));
      if (c.cmd === 'grep' && c.args.includes('b76b2dbb') && c.info.matches && taught('dictionary-attack')) c.note(shelly('Cracked! sib\'s password is <b>pizza123</b>. You never turned the fingerprint back: you found it on a list of popular passwords. That is a <b>dictionary attack</b>, and it works on any password that lots of people use.'));
      if (c.cmd === 'grep' && store.newFp && c.args.includes(store.newFp) && !c.info.matches && taught('dictionary-attack')) c.note(shelly('No match! The attackers\' list only holds popular passwords, and yours isn\'t one. Three random words from a list of 7,000 words make about 300 billion mixes. The guessing machine would be at it for centuries.'));
      if (c.cmd === 'grep' && c.args.includes('-c') && c.args.includes('FAILED') && taught('bots')) c.note(shelly('All those knocks in one night, while everyone was asleep. Every one of them is a bot trying a password from its list.'));
      if (c.cmd === 'grep' && c.args.includes('OK') && c.info.matches && taught('bots')) c.note(shelly('At 05:41 a bot got in with user <b>admin</b> and password <b>admin</b>. Nobody guessed anything clever: <b>admin</b> was the password the server came with, its <b>default password</b>. Every bot tries it first.'));
      // the "free coins" mod: as kid it wipes the homework; in the spare room it can't reach it
      if (c.info.ran === '/home/kid/Downloads/free-coins' && sh.user === 'kid' && !find('/home/kid/homework')) {
        c.info.wiped = true;
        c.note(shelly('Coins? No. But your <b>homework</b> folder is gone! While it printed "Adding coins", line 3 ran <b>rm -r ~/homework</b>. The program got your keys the moment you ran it.'));
        restoreHomework();
        c.say('(The sandbox put your homework back so you can try the fix. A real computer couldn\'t, unless you had a backup.)', 'tip');
      }
      if (c.info.ran === '/home/room/free-coins' && sh.user === 'room' && taught('isolation')) c.note(shelly('Same program, same trap. But in room\'s account, <b>~</b> means <b>/home/room</b>, and there is no homework there. It tried to wreck an empty room. Your homework was never in reach.'));
    },
  },
});
SH.define('sign', (c) => {
  const n = find(c.rest[0] ?? '');
  if (!n || !n.name.startsWith('permission-slip')) return c.fail('sign: what should I sign?', 'Try: sign permission-slip.txt');
  if (!store.signed) { n.content += '\n  Signed: kid, ethical hacker (white hat)'; store.signed = true; save(); }
  c.say('Signed! You may now test this pretend computer. Only this one.', 'tip'); c.info.signed = true;
  if (once('sign')) { c.note(shelly('Where did <b>sign</b> come from? Security Jelly HQ wrote it! A command is just a program, and programs live in <b>/bin</b>. Anyone can write a program and call it whatever they like. This one is only a few lines of text: peek inside with <b>cat /bin/sign</b>')); c.note(tryCmd('cat /bin/sign')); }
});
// The guessing machine's fingerprint maker. It shows what the mission needs: same in, same out; one letter changed, all changed.
SH.define('fingerprint', (c) => {
  const w = c.rest[0];
  if (!w) return c.fail('fingerprint: what should I fingerprint?', 'Try: fingerprint jelly');
  const fp = fingerprintOf(w);
  c.say(fp);
  if (!taught('hashing')) return c.say('(That program is for a later mission: The guessing machine.)', 'tip');
  const last = store.lastFp; store.lastFp = w; save();
  if (last && last !== w && last.toLowerCase() === w.toLowerCase()) return c.note(shelly(`One capital letter, and the whole fingerprint changed! That's on purpose: a fingerprint gives away nothing about the password, so you can't work backwards from it.`));
  if (store.steps.guess?.[4]) {
    if (COMMON.includes(w.toLowerCase())) return c.note(shelly(`Careful: <b>${esc(w)}</b> is on the attackers' list of popular passwords. Try three random words stuck together, like purplecactusbanjo.`));
    if (w.length < 12) return c.note(shelly(`That's only ${w.length} letters. Short passwords fall first. Try three random words stuck together, like purplecactusbanjo.`));
    c.info.strong = true; store.newFp = fp; save();
    return c.note(shelly(`${w.length} letters, and three random words are on nobody's list. Its fingerprint is <b>${fp}</b>. Now put the black hat on and check:`) + ' ' + tryCmd(`grep ${fp} leak/common.txt`));
  }
  c.note(shelly(`That jumble is the fingerprint of <b>${esc(w)}</b>. Run it again and you'll get exactly the same one, every time.`));
});
// HQ's practice bots: they knock the way last night's did, with the same lists of passwords.
SH.define('bots', (c) => {
  if (!taught('bots')) return c.say('(That program is for a later mission: Knock knock, all night.)', 'tip');
  const p = find('/home/kid/server/settings.txt')?.content.match(/admin_password=(\S+)/)?.[1] ?? '';
  const knocks = (find('/home/kid/server/server.log')?.content.match(/FAILED/g) ?? []).length;
  c.say('HQ\'s practice bots are knocking, the way last night\'s did...');
  [['4471', 'root', '123456'], ['2210', 'admin', 'password'], ['7318', 'pi', 'raspberry']].forEach(([b, u, w]) => c.say(`bot-${b}  ${u.padEnd(6)} / ${w.padEnd(10)} FAILED`));
  if (p === 'admin') { c.say('bot-0932  admin  / admin      OK      got in!'); c.say('Got in: 1'); return c.note(shelly('The default password is still there, so the bots walked straight in again. Change it in <b>server/settings.txt</b>.')); }
  if (!strongPassword(p)) { c.say(`bot-5120  admin  / ${p.padEnd(10)} OK      got in!`); c.say('Got in: 1'); return c.note(shelly(`<b>${esc(p)}</b> is short or popular, so it's on the bots' list too. Try three random words.`)); }
  c.say('bot-0932  admin  / admin      FAILED   (last night this one got in)');
  c.say(`...and ${knocks.toLocaleString('en-GB')} more knocks: all FAILED.`); c.say('Got in: 0');
  c.note(shelly('Not one bot got in. They still knock all night, but now the door holds. Real gadgets should come like this out of the box, with no default password at all: that is <b>secure by default</b>.'));
});
SH.define('help', (c) => { c.say('Security words: ' + ['ls -l', 'chmod', 'su', 'exit', 'whoami', 'id', 'sign', 'fingerprint', 'bots'].join('  ')); c.say('Shell words: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'grep', 'head', 'wc', 'clear', 'man', 'history'].join('  ')); });

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
