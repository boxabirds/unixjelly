/* ---------------- security: users, locks and hats ---------------- */
// Every file has an owner, a group and a lock (its mode). Three sets of keys: owner, group, everyone else.
const GROUPS = { kid: ['family'], sib: ['family'] };
const own = (n) => n.owner ?? sh.user, grp = (n) => n.group ?? 'family';
const modeOf = (n) => n.mode ?? (n.type === 'dir' ? 0o755 : 0o644);
function can(n, bit) {
  const u = sh.user, shift = own(n) === u ? 6 : GROUPS[u]?.includes(grp(n)) ? 3 : 0;
  return !!((modeOf(n) >> shift) & bit);
}
const triplet = (m, s) => ['r', 'w', 'x'].map((c, i) => (m >> s) & (4 >> i) ? c : '-').join('');
const modeStr = (n) => (n.type === 'dir' ? 'd' : '-') + [6, 3, 0].map((s) => triplet(modeOf(n), s)).join('');
// The same string, coloured so the three sets of keys stand apart (everyone-else keys glow when they let anyone in).
const modeHTML = (n) => { const m = modeOf(n); return `<span class="perm">${n.type === 'dir' ? 'd' : '-'}<b class="pu">${triplet(m, 6)}</b><b class="pg">${triplet(m, 3)}</b><b class="po${m & 0o6 ? ' open' : ''}">${triplet(m, 0)}</b></span>`; };
// Who owns what when the pretend computer starts. The diary is the hole: its lock gives everyone the keys.
function secPerms() {
  const set = (n, owner, group) => { n.owner = owner; n.group = group; n.children?.forEach((c) => set(c, owner, group)); };
  set(sh.root, 'root', 'root');
  set(find('/home/kid'), 'kid', 'family'); set(find('/home/sib'), 'sib', 'family');
  find('/home/kid/diary.txt').mode = 0o666;
  find('/home/sib/plans.txt').mode = 0o600;
  // sign is a made-up command, so its program is readable text: proof that anyone can write one.
  find('/bin/sign').content = '# sign: a tiny program written by Jelly Security HQ.\n# It adds your name to the end of a file.\n# The shell runs these lines one by one.\necho "  Signed: kid, ethical hacker (white hat)" >> permission-slip.txt\necho "Signed! You may now test this pretend computer."';
  sh.user = 'kid';
}
// Explain a new idea the first time it turns up, not every time.
const once = (k) => !store.seen?.[k] && ((store.seen ??= {})[k] = true, save(), true);
function chmodRun(rest, say, fail, info, out) {
  const [spec, ...files] = rest;
  if (!spec || !files.length) return fail('chmod: missing operand', 'Try: chmod 600 diary.txt');
  for (const p of files) {
    const n = find(p);
    if (!n) { fail(`chmod: cannot access '${p}': No such file or directory`); continue; }
    if (own(n) !== sh.user) { fail(`chmod: changing permissions of '${p}': Operation not permitted`, `Only the owner (${own(n)}) can change this lock. You are ${sh.user}.`); continue; }
    let m = modeOf(n);
    if (/^\d+$/.test(spec) && !/^[0-7]{3}$/.test(spec)) { fail(`chmod: invalid mode: '${spec}'`, 'The number way is three digits, one for each set of keys, and no digit can be bigger than 7. Each digit is really three on/off switches (r, w, x) in binary, and three switches can only count up to 7. Use the letters instead: chmod go-rw diary.txt'); continue; }
    if (/^[0-7]{3}$/.test(spec)) { m = parseInt(spec, 8); say('(The number way is a shortcut that needs binary: each digit is three on/off switches, r = 4, w = 2, x = 1. The letter way says the same thing in words: chmod go-rw diary.txt)', 'tip'); }
    else {
      const s = spec.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
      if (!s) { fail(`chmod: invalid mode: '${spec}'`, 'Say who (u = owner, g = group, o = others), then + or -, then which keys (r, w, x). Like: chmod go-rw diary.txt'); continue; }
      const who = (s[1] || 'a').replace('a', 'ugo'), bits = [...s[3]].reduce((b, c) => b | { r: 4, w: 2, x: 1 }[c], 0);
      for (const w of new Set(who)) {
        const sh_ = { u: 6, g: 3, o: 0 }[w], mask = 7 << sh_;
        m = s[2] === '+' ? m | (bits << sh_) : s[2] === '-' ? m & ~(bits << sh_) : (m & ~mask) | (bits << sh_);
      }
    }
    const was = modeHTML(n);
    n.mode = m; info.mode = m; info.file = pathOf(n);
    out.push({ h: `<span class="mute">(lock on ${esc(n.name)}: ${was} → ${modeHTML(n)})</span>`, t: "" });
    say(`(${n.name} is now ${modeStr(n)}: ${!(m & 0o077) ? `only ${own(n)} has any keys` : m & 0o006 ? 'everyone still has keys' : 'the family has keys, strangers don\'t'}.)`, 'mute');
  }
}
function suRun(rest, say, fail, info) {
  const u = rest[0];
  if (!u || u === 'root') return fail('su: Authentication failure', 'root is the boss user of the whole computer, and being root is not part of this mission. Yes, root again! It is also the name of the very top folder, /. Same word, two meanings. Try: su sib');
  if (!GROUPS[u]) return fail(`su: user ${u} does not exist`, 'The users on this computer are kid and sib.');
  if (u === sh.user) return say(`(You are already ${u}.)`, 'mute');
  sh.user = u; info.user = u;
  say(`(su means switch user. You are now ${u}, so you only have ${u}'s keys. Look at the prompt: it says ${u}@jelly. Type exit to go back.)`, 'mute');
  say('(On a real computer, su asks for that person\'s password. The sandbox skips it so you can practise.)', 'tip');
}

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
