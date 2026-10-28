# Run from base-patch.py (shares s, rep and region). A friendlier shell: Shelly explains path mistakes, / and ~ get
# a lesson each, and a jelly hunt turns navigation into a game where the caught jellies fill the jelly box.

# ---------- Shelly explains ----------
rep("function run(line) {\n", r"""/* Shelly explains: a real shell just says "No such file". This one shows how it followed the path and what probably went wrong. */
const typoDist = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
const allNodes = (n = sh.root, out = []) => { out.push(n); n.children?.forEach((c) => allNodes(c, out)); return out; };
const shelly = (h) => `<span class="shelly">Shelly:</span> ${h}`;
const tryCmd = (cmd) => `<span class="try-label">Try:</span> <button class="try" data-cmd="${esc(cmd)}">${esc(cmd)}</button> <span class="mute">(click it, then press Enter)</span>`;
function explainPath(p, line) {
  if (p.includes('\\')) return [shelly('Folder names are joined with a forward slash <b>/</b>, not a backslash \\.'), tryCmd(line.replace(p, p.replace(/\\/g, '/')))];
  const home = p.startsWith('~'), top = p.startsWith('/'), segs = (home ? p.slice(1) : p).split('/').filter((x) => x && x !== '.');
  let n = top ? sh.root : home ? sh.home : sh.cwd, miss = -1;
  const trail = [top ? '<b>/</b> <span class="mute">(the very top)</span>' : home ? '<b>~</b> <span class="mute">(home)</span>' : `<b>${esc(pretty(sh.cwd))}</b> <span class="mute">(where you are)</span>`];
  for (const [i, part] of segs.entries()) {
    if (part === '..') { n = n.parent || n; trail.push('<span class="ok">up ..</span>'); continue; }
    const next = n.type === 'dir' ? n.children.find((c) => c.name === part) : null;
    if (!next) { miss = i; trail.push(`<span class="er">${esc(part)} ✗</span>`); break; }
    n = next; trail.push(`<span class="ok">${esc(part)} ✓</span>`);
  }
  if (miss < 0) return [];
  const part = segs[miss], prefix = (top ? '/' : home ? '~/' : '') + segs.slice(0, miss).join('/'), join = (name) => (prefix && !prefix.endsWith('/') ? prefix + '/' : prefix) + [name, ...segs.slice(miss + 1)].filter(Boolean).join('/');
  const out = [shelly(`I followed your path: ${trail.join(' → ')}`)];
  const kids = n.type === 'dir' ? n.children : [], where = n === sh.cwd ? 'in here' : n === sh.root ? 'at the very top (/)' : n === sh.home ? 'at home (~)' : `in ${esc(pretty(n))}`;
  const near = kids.find((c) => c.name.toLowerCase() === part.toLowerCase()) ?? kids.find((c) => c.name.replace(/\.\w+$/, '') === part) ?? kids.find((c) => typoDist(c.name, part) <= 2);
  const elsewhere = allNodes().find((x) => x.name === part && x !== sh.root);
  if (n.type !== 'dir') out.push(shelly(`<b>${esc(n.name)}</b> is a file, not a folder, so there is nothing inside it to go into.`));
  else if (n.name === part) {
    out.push(shelly(`You are already inside <b>${esc(part)}</b>! The path ${miss ? 'had' : 'started'} there, so saying <b>${esc(part)}</b> again looks for a ${esc(part)} folder <i>inside</i> ${esc(part)}, and there isn't one.`));
    const fixed = join(''); out.push(tryCmd(fixed ? line.replace(p, fixed) : line.replace(p, '').trim()));
  } else if (near) {
    out.push(shelly(near.name.toLowerCase() === part.toLowerCase() ? `Capitals matter! It is <b>${esc(near.name)}</b>, not ${esc(part)}.` : near.name.startsWith(part + '.') ? `Nearly! The full name has an ending: <b>${esc(near.name)}</b>.` : `There is no <b>${esc(part)}</b> ${where}. Did you mean <b>${esc(near.name)}</b>?`));
    out.push(tryCmd(line.replace(p, join(near.name))));
  } else if (elsewhere) {
    const at = pretty(elsewhere);
    out.push(shelly(`There is no <b>${esc(part)}</b> ${where}. There is one at <b>${esc(at)}</b>.${top && at.startsWith('~') ? ' A <b>/</b> at the start means the very top of the computer, but your things live at home: start with <b>~</b> instead.' : ' Paths starting with <b>~</b> work from anywhere.'}`));
    out.push(tryCmd(line.replace(p, at + (segs.length > miss + 1 ? '/' + segs.slice(miss + 1).join('/') : ''))));
  } else {
    out.push(shelly(`There is no <b>${esc(part)}</b> ${where}. Look around first:`));
    out.push(tryCmd(n === sh.cwd ? 'ls' : `ls ${pretty(n)}`));
  }
  return out;
}
// A caught jelly bounces out of its folder on the tree and into the jelly box.
function flyBean(from, to, color) {
  if (REDUCED || !from?.width || !to) return;
  const b = to.getBoundingClientRect(), fly = document.createElement('div'); fly.className = 'flyer'; fly.innerHTML = bean(color);
  Object.assign(fly.style, { left: `${from.left}px`, top: `${from.top}px` }); document.body.append(fly);
  const dx = b.left + b.width / 2 - from.left - 20, dy = b.top + b.height / 2 - from.top - 24;
  fly.animate([{ transform: 'translate(0,0) scale(.6)' }, { transform: `translate(${dx * .5}px,${dy * .5 - 140}px) scale(1.6) rotate(-220deg)`, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(.8) rotate(-420deg)` }], { duration: 1000, easing: 'cubic-bezier(.4,0,.3,1)' })
    .finished.then(() => { fly.remove(); to.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06) rotate(-1deg)' }, { transform: 'scale(1)' }], { duration: 380 }); sound.boing(700, .25, .1); });
}
// One-time explanations the first time a path starts with ~ or /.
function firstPathTips(args, say) {
  store.seen ??= {};
  for (const a of args) {
    if (a.startsWith('~') && !store.seen.home) { store.seen.home = true; save(); say('(~ is a shortcut for your home folder, /home/kid. It works from anywhere.)', 'tip'); }
    if (a.startsWith('/') && !store.seen.root) { store.seen.root = true; save(); say('(A / at the very start means: begin at the top of the computer. A / between two names means: go inside.)', 'tip'); }
  }
}
function run(line) {
""")
rep("  const fail = (t, tip) => { ok = false; say(t, 'er'); if (tip) say(tip, 'tip'); };\n",
    "  const fail = (t, tip) => { ok = false; say(t, 'er'); if (tip) say(tip, 'tip'); };\n  const why = (p) => explainPath(p, line).forEach((h) => out.push({ h, t: '' }));\n")
rep("        if (!n) return fail(`ls: cannot access '${p}': No such file or directory`);", "        if (!n) { fail(`ls: cannot access '${p}': No such file or directory`); return why(p); }")
rep("      if (!n) fail(`cd: ${target}: No such file or directory`, 'Tip: type ls to see which folders are here. Capitals and spelling must match exactly.');",
    "      if (!n) { fail(`cd: ${target}: No such file or directory`); why(target); }")
rep("      else sh.cwd = n;\n", "      else if (n === sh.cwd && target !== '.') say(`(You are already in ${pretty(n)}.)`, 'mute');\n      else { sh.cwd = n; say(`(You are now in ${pretty(n)}${n === sh.home ? ', your home' : n === sh.root ? ', the very top' : ''}.)`, 'mute'); }\n")
rep("        if (!n) fail(`cat: ${p}: No such file or directory`);", "        if (!n) { fail(`cat: ${p}: No such file or directory`); why(p); }")
rep("        if (!s) { fail(`${cmd}: cannot stat '${sp}': No such file or directory`); continue; }", "        if (!s) { fail(`${cmd}: cannot stat '${sp}': No such file or directory`); why(sp); continue; }")
rep("        if (!n) { fail(`rm: cannot remove '${p}': No such file or directory`); continue; }", "        if (!n) { fail(`rm: cannot remove '${p}': No such file or directory`); why(p); continue; }")
rep("      else fail(`${cmd}: command not found`, 'Type help to see the words I know.');",
    """      else {
        const words = [...BIN, 'cd', 'help', 'history', 'whoami'], near = words.find((w) => typoDist(w, cmd.toLowerCase()) <= (cmd.length > 3 ? 2 : 1));
        fail(`${cmd}: command not found`);
        if (near) { out.push({ h: shelly(`I don't know <b>${esc(cmd)}</b>. Did you mean <b>${near}</b>?`), t: '' }); out.push({ h: tryCmd(line.replace(cmd, near)), t: '' }); }
        else say('Type help to see the words I know.', 'tip');
      }""")
rep("  switch (cmd) {\n    case undefined: break;", "  if (['cd', 'ls', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'touch'].includes(cmd)) firstPathTips(rest, say);\n  switch (cmd) {\n    case undefined: break;")
rep("termBody.addEventListener('click', () => { if (!getSelection().toString()) termIn.focus({ preventScroll: true }); });",
    "termBody.addEventListener('click', (e) => {\n  const t = e.target.closest('.try'); if (t) { termIn.value = t.dataset.cmd; sound.blip(); }\n  if (!getSelection().toString()) termIn.focus({ preventScroll: true });\n});")

# ---------- the file tree labels / and ~, shows where a hunted jelly hides, and YOU are a jelly ----------
rep("""    rows.push(`<div class="mrow ${n.type}${here ? ' here' : ''}${hidden ? ' hid' : ''}" data-id="${n.id}" data-path="${esc(pretty(n))}" style="--d:${d}">${ICON[n.type]}<span>${n === sh.root ? '/' : esc(n.name)}</span>${here ? '<b class="here-tag">YOU ARE HERE</b>' : ''}</div>`);""",
    """    rows.push(`<div class="mrow ${n.type}${here ? ' here' : ''}${hidden ? ' hid' : ''}${pathOf(n) === spot ? ' spot' : ''}" data-id="${n.id}" data-path="${esc(pretty(n))}" style="--d:${d}">${ICON[n.type]}<span>${n === sh.root ? '/' : esc(n.name)}</span>${n === sh.root ? '<i class="mtag">the very top</i>' : n === sh.home ? '<i class="mtag">~ home</i>' : ''}${pathOf(n) === spot ? `<i class="jelly-spot">${bean(spotColor)}</i>` : ''}${here ? `<b class="here-tag">${bean('#ffc61a')}YOU ARE HERE</b>` : ''}</div>`);""")
rep("""  const rows = [];
  const walk = (n, d) => {""", """  const rows = [], spot = huntSpot(), spotColor = PANELS[panelIdx]?.lesson?.color ?? '#ff4d6d';
  const walk = (n, d) => {""")
rep("/* file tree map with FLIP animations */\n", """/* file tree map with FLIP animations */
// During the jelly hunt, the folder where the next jelly hides glows on the tree.
function huntSpot() {
  const L = PANELS[panelIdx]?.lesson; if (!L?.hunt || $('#lcard').dataset.phase !== 'mission') return null;
  const st = store.steps[L.id] ?? [], i = L.hunt.findIndex((h, k) => !st[k]);
  return i < 0 ? null : L.hunt[i][1];
}
""")

# ---------- the jelly box joins in: a lesson can change the jelly word and cheer as steps tick ----------
rep("""  if (celebrate && p === 'mission' && !REDUCED) {""", """  const w = L.stageWord ? L.stageWord(st) : L.word;
  if (lessonStage && lessonStage.word !== w) { lessonStage.opts.colorOffset = Math.max(0, JELLY.indexOf(L.color)); lessonStage.setWord(w); }
  const caught = celebrate && L.hunt ? document.querySelector('.jelly-spot')?.getBoundingClientRect() : null;
  if (L.hunt && PANELS[panelIdx]?.lesson === L) renderMap();
  if (celebrate && L.cheer) { print(L.cheer(st)); scrollDown(); confetti(L.color); }
  if (caught) flyBean(caught, $('.ljelly'), L.color);
  if (celebrate && p === 'mission' && !REDUCED) {""")
rep("""  if (lessonStage && lessonStage.word !== L.word) { lessonStage.opts.colorOffset = Math.max(0, JELLY.indexOf(L.color)); lessonStage.setWord(L.word); }
}""", "}")
rep("lessonStage = new JellyStage($('#lessonJelly'), { word: LESSONS[cur].word,", "lessonStage = new JellyStage($('#lessonJelly'), { word: LESSONS[cur].stageWord?.(store.steps[LESSONS[cur].id] ?? []) ?? LESSONS[cur].word,")
# missions can be limited to their own page (onlyHere) and ticked in order (seq), as in the other guides
rep("""  for (const L of LESSONS) {
    const st = store.steps[L.id] ??= L.steps.map(() => false);
    let changed = false;
    L.steps.forEach((s, i) => { if (!st[i] && s.ok(ev)) { st[i] = true; changed = true; } });""", """  for (const L of LESSONS) {
    if (L.onlyHere && !(PANELS[panelIdx]?.lesson === L)) continue;
    const st = store.steps[L.id] ??= L.steps.map(() => false);
    let changed = false;
    L.steps.forEach((s, i) => { if (!st[i] && (!L.seq || st.slice(0, i).every(Boolean)) && s.ok(ev)) { st[i] = true; changed = true; } });""")

# ---------- lessons: / and ~ get one each, then a hunt ----------
TREE = """<div class="treeviz"><div class="tz-row"><span class="tz tz-root">/<small>the very top</small></span></div><div class="tz-row"><span class="tz">bin</span><span class="tz">home</span><span class="tz">tmp</span></div><div class="tz-row"><span class="tz tz-home">kid<small>~ home</small></span><span class="tz">dark</span></div><div class="tz-row"><span class="tz">toys</span><span class="tz">snacks</span><span class="tz">pets</span></div></div>"""
region("  { id: 'paths', word: '~ / ..', name: 'Addresses',", "  { id: 'cat', word: 'cat',", f"""  {{ id: 'root', word: '/', name: 'The very top', stands: 'The root', color: '#ff4d6d', seq: true, onlyHere: true, visual: `{TREE}`,
    title: 'A slash has two jobs', why: 'Every folder lives inside one giant folder at the very top, called the <b>root</b>. Its name is just a slash: <code>/</code>. So a slash at the <b>start</b> of a path means "begin at the very top". A slash <b>between</b> two names means "go inside": <code>tmp/dark</code> is dark, inside tmp.',
    mnem: 'Slash first: start at the top. Slash between: go inside.',
    points: ['<code>cd /</code> takes you to the very top.', '<code>/tmp/dark</code> starts at the top, so it works from anywhere. That is an <b>absolute</b> path.', '<code>dark/cave</code> starts from where you are. That is a <b>relative</b> path.'],
    steps: [
      {{ t: 'Jump to the very top: <code>cd /</code>', ok: (e) => isCmd(e, 'cd') && e.cwd === '/' }},
      {{ t: 'Look around up there: <code>ls</code>. Can you see home?', ok: (e) => isCmd(e, 'ls') && e.cwd === '/' && !e.args.length }},
      {{ t: 'Jump straight into the dark cave in one go: <code>cd /tmp/dark/cave</code>', ok: (e) => isCmd(e, 'cd') && e.cwd === '/tmp/dark/cave' && e.args[0]?.startsWith('/') }},
    ] }},
  {{ id: 'home', word: '~', name: 'Home, sweet home', stands: 'Tilde: your home folder', color: '#9b5cff', seq: true, onlyHere: true,
    visual: `<div class="treeviz"><div class="tz-eq"><code>~</code> means <code>/home/kid</code></div><div class="tz-eq"><code>~/snacks</code> means <code>/home/kid/snacks</code></div></div>`,
    title: 'The squiggle means home', why: 'The squiggle <code>~</code> is called a tilde. Think of it as a hammock, where you relax at home. It is a shortcut for your home folder, <code>/home/kid</code>, and it works from anywhere. Your prompt shows it too: <code>kid@jelly:~$</code> means "you are at home".',
    mnem: '~ is HOME. ~/ means: start at home.',
    points: ['<code>cd ~</code> takes you home from anywhere. So does plain <code>cd</code>.', '<code>~/snacks</code> means: start at home, then go into snacks.', 'Once you are <b>inside</b> a folder, you don\\'t say its name again. In snacks, the pizza is just <code>pizza.txt</code>.'],
    steps: [
      {{ t: 'Zip home with the squiggle: <code>cd ~</code>', ok: (e) => isCmd(e, 'cd') && e.args[0]?.startsWith('~') && e.cwd === '/home/kid' }},
      {{ t: 'Jump into your snacks with a home path: <code>cd ~/snacks</code>', ok: (e) => isCmd(e, 'cd') && e.args[0]?.startsWith('~') && e.cwd === '/home/kid/snacks' }},
      {{ t: 'You are inside snacks now, so just say the file: <code>cat pizza.txt</code>', ok: (e) => isCmd(e, 'cat') && e.cwd === '/home/kid/snacks' && e.info.hits?.includes('/home/kid/snacks/pizza.txt') }},
      {{ t: 'Read the robot from right here, with a home path: <code>cat ~/toys/robot.txt</code>', ok: (e) => isCmd(e, 'cat') && e.ok && e.args.some((a) => a.startsWith('~')) }},
    ] }},
  {{ id: 'hunt', word: 'hunt', name: 'Jelly hunt', stands: 'A navigation game', color: '#ffc61a', seq: true, onlyHere: true,
    hunt: [['j', '/home/kid/toys'], ['e', '/home/kid/toys/box'], ['l', '/tmp/dark'], ['l', '/home/kid/pets'], ['y', '/home/kid/snacks']],
    stageWord: (st) => 'jelly'.slice(0, st.filter(Boolean).length) || '?',
    cheer: (st) => `<span class="tip">You caught the <b>${{'jelly'[st.filter(Boolean).length - 1]}}</b> jelly! It jumped into the jelly box.</span>`,
    title: 'The great jelly hunt', why: 'Five jelly letters have escaped and are hiding all over the computer! The glowing jelly on the file tree shows where the next one is hiding. Work out the path, walk there with <code>cd</code>, and catch it. Catch all five to spell a secret word.',
    mnem: 'Look at the tree. Plan the path. cd there.',
    points: ['<code>cd ..</code> climbs up one folder.', '<code>~/</code> starts at home. <code>/</code> at the start starts at the very top.', 'Lost? <code>pwd</code> tells you where you are.'],
    steps: [
      {{ t: 'The first jelly is hiding in your <b>toys</b>. Walk in there!', hint: 'Your toys are a folder in your home. Walk in with <code>cd</code> and the folder\\'s name. The glowing jelly on the file tree shows where.', show: () => {{ const j = document.querySelector('.jelly-spot'); if (j) glowEl(j); glowEl($('#term')); }}, doIt: () => typeCmd('cd /home/kid/toys'), ok: (e) => isCmd(e, 'cd') && e.cwd === '/home/kid/toys' }},
      {{ t: 'The next one is in a <b>box</b>, inside toys. You are in toys already, so it is one step in.', hint: 'The box is a folder inside toys. One <code>cd</code>, and the folder\\'s name. The glowing jelly on the file tree shows where.', show: () => {{ const j = document.querySelector('.jelly-spot'); if (j) glowEl(j); glowEl($('#term')); }}, doIt: () => typeCmd('cd /home/kid/toys/box'), ok: (e) => isCmd(e, 'cd') && e.cwd === '/home/kid/toys/box' }},
      {{ t: 'One is somewhere <b>dark</b>, in <code>/tmp</code>. Start at the very top with <code>/</code>.', hint: 'Start the path at the very top: <code>cd /tmp/</code>, then the dark folder\\'s name. The glowing jelly on the file tree shows where.', show: () => {{ const j = document.querySelector('.jelly-spot'); if (j) glowEl(j); glowEl($('#term')); }}, doIt: () => typeCmd('cd /tmp/dark'), ok: (e) => isCmd(e, 'cd') && e.cwd === '/tmp/dark' }},
      {{ t: 'One is with the hamster in <b>pets</b>, at home. Use <code>~</code> to get there in one jump.', hint: '<code>~</code> means your home. Pets are in your home: <code>cd ~/</code>, then the folder\\'s name. The glowing jelly on the file tree shows where.', show: () => {{ const j = document.querySelector('.jelly-spot'); if (j) glowEl(j); glowEl($('#term')); }}, doIt: () => typeCmd('cd /home/kid/pets'), ok: (e) => isCmd(e, 'cd') && e.cwd === '/home/kid/pets' }},
      {{ t: 'The last one is in the <b>snacks</b>. Can you get there in one command, all by yourself?', hint: 'Snacks are in your home, next to pets and toys. <code>~/</code> gets you home in one jump. The glowing jelly on the file tree shows where.', show: () => {{ const j = document.querySelector('.jelly-spot'); if (j) glowEl(j); glowEl($('#term')); }}, doIt: () => typeCmd('cd /home/kid/snacks'), ok: (e) => isCmd(e, 'cd') && e.cwd === '/home/kid/snacks' }},
    ] }},
""")
rep("    paths: { does: '/ is the root, ~ is home, .. is the parent folder.', ex: 'cd ~', quiz: 'Get home from anywhere, fast.' },",
    """    root: { does: '/ at the start: begin at the very top. / between names: go inside.', ex: 'cd /tmp/dark', quiz: 'Jump to the dark folder from anywhere.' },
    home: { does: '~ means your home folder. ~/snacks works from anywhere.', ex: 'cd ~/snacks', quiz: 'Get to your snacks in one jump, from anywhere.' },
    hunt: { does: 'Read the tree, plan the path, cd there.', ex: 'cd ~/toys/box', quiz: 'From the very top, get into the box in your toys.' },""")

# ---------- styles ----------
rep("</style>", """/* Shelly's explanations and Try buttons in the terminal */
.term-body .shelly{color:#d7b8ff;font-weight:700}
.term-body .ok{color:#7dff9b}
.term-body .try-label{color:var(--lemon)}
.term-body .try{font:inherit;background:var(--lemon);color:var(--ink);border:2px solid var(--ink);border-radius:8px;padding:0 .5em;font-weight:700}
.term-body .try:hover{background:#fff}
/* the tree labels / and ~, and the glowing spot where a hunted jelly hides */
.mtag{font-family:var(--body);font-style:normal;font-weight:700;font-size:.75em;background:#24133b14;border-radius:999px;padding:0 .5em;margin-left:2px;color:var(--ink-soft)}
.mrow.spot{background-color:#ffc61a55;box-shadow:inset 0 0 0 2px var(--ink)}
.jelly-spot .bean-svg{width:1.3em;height:auto;display:block;animation:bob 1s ease-in-out infinite}
.here-tag{display:inline-flex;align-items:center;gap:.25em}
.here-tag .bean-svg{width:1em;height:auto}
/* little pictures for / and ~ */
.treeviz{display:grid;gap:.5em;justify-items:center;font-size:.9em}
.tz-row{display:flex;gap:.6em}
.tz{font-family:var(--mono);font-weight:700;background:#fff;border:3px solid var(--ink);border-radius:12px;padding:.15em .6em;display:grid;justify-items:center;line-height:1.1}
.tz small{font-family:var(--body);font-size:.6em;color:var(--ink-soft)}
.tz-root{background:var(--berry);color:#fff;font-size:1.4em}.tz-root small{color:#fff}
.tz-home{background:var(--grape);color:#fff}.tz-home small{color:#fff}
.tz-eq{font-size:1.2em;background:#fff;border:3px solid var(--ink);border-radius:14px;padding:.3em .8em}
.tz-eq code{font-weight:700}
</style>""")

# ---------- tester feedback, round 2 (applies to every guide) ----------
# Tall, thin letters (the i especially) tipped over on landing and after every hop.
rep("    for (let i = 0; i < N; i++) this.inv[i] = 1 / this.mass[i];",
    """    // Tall, thin letters (like i and l) tip over easily. A heavier bottom keeps them standing, like a weighted toy.
    const slim = dx / box.max.y;
    if (slim < .7) for (let i = 0; i < N; i++) if (rest[i * 3 + 1] < oy + dy * .3) this.mass[i] *= 1 + 25 * (.7 - slim);
    // Letters with a tail (g, j, p, q, y) stand on its rounded tip, so they roll over too. Same cure: a heavy bottom.
    else if ('gjpqy'.includes(ch)) for (let i = 0; i < N; i++) if (rest[i * 3 + 1] < oy + dy * .3) this.mass[i] *= 6;
    for (let i = 0; i < N; i++) this.inv[i] = 1 / this.mass[i];""")
rep("    const spin = (Math.random() - .5) * 6 * power;", "    const spin = (Math.random() - .5) * 6 * power * Math.min(1, this.width / this.height);")
# Programmers' fonts join some symbols into one picture (>> looked like >, ../ like ./). Show every character as typed.
rep("</style>", "html,input,textarea,button{font-variant-ligatures:none;font-feature-settings:\"liga\" 0,\"calt\" 0}\n</style>", 1)
# Phones and Macs swap in curly quotes, … and dashes, which no shell understands. Typed text stays plain.
rep("  if (e.key === 'Enter') { e.preventDefault(); submit(); }",
    "  if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); const was = termIn.value; submit(); requestAnimationFrame(() => { if (was && termIn.value === was) termIn.value = ''; }); } // some on-screen keyboards type the last word again after Enter")
rep("termBody.addEventListener('click', (e) => {", """termIn.addEventListener('input', () => {
  const v = termIn.value, plain = v.replace(/[\\u201C\\u201D\\u201E\\u2033]/g, '"').replace(/[\\u2018\\u2019\\u2032]/g, "'").replace(/\\u2026/g, '...').replace(/\\u2014/g, '--').replace(/\\u2013/g, '-').replace(/\\u00A0/g, ' ');
  if (plain !== v) { const at = termIn.selectionStart + plain.length - v.length; termIn.value = plain; termIn.setSelectionRange(at, at); }
});
termBody.addEventListener('click', (e) => {""")
# Shelly turns up in the terminal; say who she is the first time.
rep("const shelly = (h) => `<span class=\"shelly\">Shelly:</span> ${h}`;",
    "const shelly = (h) => `${store.seen?.shelly || ((store.seen ??= {}).shelly = true, save(), false) ? '' : '<span class=\"tip\">(Meet Shelly! She is the shell: the program that reads what you type and gets it done. We drew her as a hermit crab, because crabs live in shells. When something goes wrong, she explains.)</span><br/>'}<span class=\"shelly\">Shelly:</span> ${h}`;")
# Say what the prompt is before relying on the word.
rep("""'The <code>$</code> at the end of the prompt means: "Ready, boss."'""",
    """'The line where you type starts with <code>kid@jelly:~$</code>. That is the <b>prompt</b>: the shell\\'s way of saying "your turn". The <code>$</code> means "Ready, boss." (Chatbots use the word prompt for what <i>you</i> type to them. Here, the prompt is what the shell shows <i>you</i>.)'""")

# ---------- tester feedback, round 3 (every guide) ----------
# 1. Finishing a mission no longer jumps straight to the "you earned a jelly" card, which hid the last step's output.
#    The task card says the mission is done, the output stays on screen, and the big button collects the jelly.
rep("  if (!sectionDone(id)) toast(`Jelly collected: ${item.word ? item.word : item.name}!`);",
    "  const reviewing = PANELS[panelIdx]?.lesson?.id === id && $('#lcard').dataset.phase === 'mission';\n  if (reviewing) G.review = id; // look at what happened first, then press the button to collect\n  else if (!sectionDone(id)) toast(`Jelly collected: ${item.word ? item.word : item.name}!`);")
rep("    $('#lTask').innerHTML = i < 0 ? `You did every step. The <b>${esc(L.word)}</b> jelly is yours!` : L.steps[i].t;",
    "    $('#lTask').innerHTML = i < 0 ? (G.review === L.id ? `You did every step! Take a look at what happened. When you're ready, press <b>Collect your jelly</b>.` : `You did every step. The <b>${esc(L.word)}</b> jelly is yours!`) : L.steps[i].t;")
rep("  nx.hidden = p === 'mission' && (!done || last);\n  nx.innerHTML = (p === 'meet' ? 'Next' : p === 'brain' ? 'Start the mission' : 'Next word') + ENTER;",
    "  const collect = p === 'mission' && G.review === L.id;\n  nx.hidden = p === 'mission' && (!done || last) && !collect;\n  nx.innerHTML = (collect ? 'Collect your jelly' : p === 'meet' ? 'Next' : p === 'brain' ? 'Start the mission' : 'Next word') + ENTER;")
rep("$('#lNext').onclick = () => { const p = $('#lcard').dataset.phase; if (p === 'meet') setPhase('brain'); else if (p === 'brain') setPhase('mission'); else step(1); };",
    "$('#lNext').onclick = () => {\n  const p = $('#lcard').dataset.phase, L = LESSONS[cur];\n  if (p === 'mission' && G.review === L.id) { G.review = null; paintSteps(); sectionDone(L.id); return; }\n  if (p === 'meet') setPhase('brain'); else if (p === 'brain') setPhase('mission'); else step(1);\n};")
# Once the review starts, Enter means "collect": move focus from the terminal to the button.
rep("  if (LESSONS[cur]?.id === id) { paintSteps(); lessonStage?.hopAll(1.2); }",
    "  if (LESSONS[cur]?.id === id) { paintSteps(); lessonStage?.hopAll(1.2); }\n  if (G.review === id) setTimeout(() => $('#lNext').focus({ preventScroll: true }), REDUCED ? 0 : 1200);")
# Leaving the lesson drops the review; the jelly is already counted.
rep("  G.card = false; renderGuide();\n  // Start every section", "  G.card = false; G.review = null; renderGuide();\n  // Start every section")
# 2. Arrow keys follow the screen you are on: → does what Enter does (the big button), ← does what Back does.
#    They never skip ahead to another lesson mid-way through this one.
rep("""  if (e.key === 'PageDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  if (e.key === 'PageUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }""",
    """  const fwd = e.key === 'PageDown' || e.key === 'ArrowRight', back = e.key === 'PageUp' || e.key === 'ArrowLeft';
  if (!fwd && !back) return;
  e.preventDefault();
  if (G.card) return (fwd ? $('#unGo') : $('#unStay'))?.click();
  if (!PANELS[panelIdx]?.lesson) return fwd ? (primaryButton() ?? { click: () => step(1) }).click() : step(-1);
  if (back) { if (!$('#lBack').hidden) $('#lBack').click(); return; }
  const b = primaryButton();
  if (b) b.click(); else toast('Finish the mission first, or press ← to go back.');""")
# 3. Prerequisites as data. A lesson lists the concepts it `teaches` (and any it deliberately `previews`).
#    Engine and guide code ask taught(concept) before showing anything that depends on one, and tests/prereqs.mjs
#    checks every screen for concepts shown before their lesson. See docs/pedagogy.md, rule 1.
rep('<a class="ni" href="#${p.id}" data-id="${p.id}"', '<a class="ni" href="#${p.id}" data-id="${p.id}" data-teaches="${(p.lesson?.teaches ?? []).join(\' \')}" data-previews="${(p.lesson?.previews ?? []).join(\' \')}"')
rep("function complete(id) {", """// Has this child been taught this concept yet? Yes once they've finished the lesson that teaches it, or while they're in it.
// Concepts this guide doesn't teach come from an earlier guide, so they count as taught.
function taught(concept) {
  const k = LESSONS.findIndex((L) => L.teaches?.includes(concept));
  return k < 0 || !!store.done[LESSONS[k].id] || (!!PANELS[panelIdx]?.lesson && cur === k);
}
function complete(id) {""")

# The shell itself moves into its own module (src/shell/jellysh.js).
exec(open('engine/use-jellysh.py').read())
# The course map: which course comes before which (curriculum.json).
exec(open('engine/courses-patch.py').read())
exec(open('engine/terms-patch.py').read())
# The jelly jar: every lesson's jelly, collected across courses.
exec(open('engine/jar-patch.py').read())
exec(open('engine/help-patch.py').read())
# Shell Jelly's demo scripts, for presenter mode.
exec(open('engine/demos-shell.py').read())
# Presenter mode, for recording videos.
exec(open('engine/present-patch.py').read())

# The file tree animates what changed by comparing the rows before and after. Rows that are still fading out after
# being removed ("ghosts") must not count as rows that were there before, or every quick redraw (a sandbox reset,
# presenter mode recording a course) turns them into new ghosts, and the tree grows slower with every redraw.
rep("for (const el of mapEl.querySelectorAll('.mrow')) before.set(el.dataset.id", "for (const el of mapEl.querySelectorAll('.mrow:not(.ghost)')) before.set(el.dataset.id")

# Every lesson's mission starts on a fresh sandbox, so one lesson's leftovers (the folder you ended up in, files you
# made or removed) never break the next lesson. A mission already under way keeps its sandbox, so coming back to it
# doesn't wipe your work. Guides whose lessons deliberately build on each other (Git's history, Web's website) opt
# out by setting FRESH_SANDBOX to false.
rep("function setPhase(p) {\n  const L = LESSONS[cur]; store.phase[L.id] = p; save();", """let sandboxFor = null; const FRESH_SANDBOX = true;
function setPhase(p) {
  const L = LESSONS[cur]; store.phase[L.id] = p; save();
  if (p === 'mission' && FRESH_SANDBOX && sandboxFor !== L.id && !(store.steps[L.id] ?? []).some(Boolean)) resetSandbox();
  if (p === 'mission') sandboxFor = L.id;""")

# Backstage: what the kernel brings back from the disk used to be a tiny blank sheet that flew off and vanished, so
# nobody could tell what it was. It is now a card showing what the program carries back (the names for ls, the
# diary's lines for cat), and it travels back with the program until the program delivers it.
rep(".paper{position:absolute;width:5%;aspect-ratio:3/4;background:#fff;border:3px solid var(--ink);border-radius:4px;opacity:0;z-index:2;background-image:repeating-linear-gradient(#0000 0 18%,#24133b44 18% 24%);background-clip:content-box;padding:12% 14%}",
    ".paper{position:absolute;width:24%;background:#fff;border:3px solid var(--ink);border-radius:10px;box-shadow:0 4px 0 var(--ink);opacity:0;z-index:3;padding:.35em .6em .45em;font-family:var(--mono);font-size:clamp(.55rem,.25rem + .75vw,.9rem);line-height:1.3;color:var(--ink)}\n.paper b{display:block;font-family:var(--display);font-weight:400;color:var(--berry);font-size:.95em}")
rep("    burp: 'Done! The hamster did not even notice.', out: [],", "    burp: 'Done! The hamster did not even notice.', out: [], carry: ['Done', 'hamster.txt is now', 'sir-fluffington.txt'],")
rep("""  paper.style.opacity = 1; sound.boing(800, .3, .08);
  await paper.animate([{ left: '86%', bottom: '20%', transform: 'rotate(0)' }, { left: '70%', bottom: '70%', transform: 'rotate(200deg)', offset: .5 }, { left: '57%', bottom: '40%', transform: 'rotate(360deg)' }], { duration: 1000, easing: 'ease-in-out', fill: 'forwards' }).finished;
  paper.style.opacity = 0;""", """  const [got, ...lines] = s.carry ?? ['From the disk', ...s.out];
  paper.innerHTML = `<b>${esc(got)}</b>${lines.map(esc).join('<br>')}`; paper.style.opacity = 1; sound.boing(800, .3, .08);
  await paper.animate([{ left: '78%', bottom: '20%', transform: 'scale(.2) rotate(0)' }, { left: '64%', bottom: '74%', transform: 'scale(1) rotate(200deg)', offset: .5 }, { left: '48%', bottom: '60%', transform: 'rotate(360deg)' }], { duration: 1100, easing: 'ease-in-out', fill: 'forwards' }).finished;""")
rep("""  prog.style.left = '14%'; await prog.animate([{ left: '54%' }, { left: '14%' }], { duration: 1300, easing: 'ease-in-out' }).finished;""",
    """  prog.style.left = '14%'; paper.animate([{ left: '48%' }, { left: '8%' }], { duration: 1300, easing: 'ease-in-out', fill: 'forwards' });
  await prog.animate([{ left: '54%' }, { left: '14%' }], { duration: 1300, easing: 'ease-in-out' }).finished;
  paper.getAnimations().forEach((a) => a.cancel()); paper.style.opacity = 0;""")

# Text is shrunk to fit its box when a panel opens or the window resizes. A box can still change size afterwards
# (the side menu sliding in or out while a panel settles), and its text then overflowed until the next resize.
# Now any box that changes size is fitted again. Fitting changes the font size, not the box, so it can't loop.
rep("""function fitAll(root) {
  for (const el of root.querySelectorAll('[data-fit]')) {
    let f = 1; el.style.setProperty('--fit', '1');
    while (el.scrollHeight > el.clientHeight + 1 && f > .56) { f -= .04; el.style.setProperty('--fit', f.toFixed(2)); }
  }
}""", """function fitAll(root) { root.querySelectorAll('[data-fit]').forEach(fitOne); }
function fitOne(el) {
  let f = 1; el.style.setProperty('--fit', '1');
  while (el.scrollHeight > el.clientHeight + 1 && f > .56) { f -= .04; el.style.setProperty('--fit', f.toFixed(2)); }
}
const fitSizes = new WeakMap();
const fitWatch = new ResizeObserver((entries) => entries.forEach(({ target, contentRect: r }) => {
  const size = `${Math.round(r.width)}x${Math.round(r.height)}`;
  if (fitSizes.get(target) !== size) { fitSizes.set(target, size); fitOne(target); }
}));
document.querySelectorAll('[data-fit]').forEach((el) => fitWatch.observe(el));""")
# The fonts come from Google Fonts and can arrive after a panel was fitted with a stand-in font. The same words take
# more room in the real font, so fit the open panel again when a font finishes loading (the others fit when shown).
rep("let fitTimer;\naddEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitNow, 120); });",
    "let fitTimer;\naddEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitNow, 120); });\ndocument.fonts?.addEventListener('loadingdone', () => fitNow());")
