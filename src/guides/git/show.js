/* ---------------- section 2: backstage show ---------------- */
const SVG = {
  shelly: `<svg viewBox="0 0 200 150"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M40 118 L20 140 M60 122 L50 146 M140 122 L150 146 M160 118 L180 140" fill="none" stroke-linecap="round"/><circle cx="118" cy="62" r="46" fill="#b18cff"/><path d="M118 62 m-30 0 a30 30 0 1 1 30 30 a20 20 0 1 1 -20 -20 a10 10 0 1 1 10 10" fill="none"/><ellipse cx="96" cy="108" rx="70" ry="30" fill="#ff5a4e"/><path d="M70 88 L64 52 M100 86 L104 50" fill="none"/><circle cx="64" cy="46" r="13" fill="#fff"/><circle cx="104" cy="44" r="13" fill="#fff"/><circle cx="67" cy="47" r="5" fill="${INK}"/><circle cx="107" cy="45" r="5" fill="${INK}"/><path d="M28 98 q-24 -18 -6 -36 q14 10 6 18 q12 -2 10 14z" fill="#ff5a4e"/><path d="M166 98 q24 -18 6 -36 q-14 10 -6 18 q-12 -2 -10 14z" fill="#ff5a4e"/><path d="M80 116 q16 12 32 0" fill="none" stroke-linecap="round"/></g></svg>`,
  cabinet: `<svg viewBox="0 0 120 190"><g stroke="${INK}" stroke-width="5"><rect x="6" y="6" width="108" height="178" rx="10" fill="#c58a55"/>${['cat', 'cp', 'git', 'ls', 'mv', 'rm'].map((n, i) => `<g class="drawer" data-n="${n}"><rect x="16" y="${16 + i * 28}" width="88" height="22" rx="5" fill="#ffe2b8"/><text x="60" y="${32 + i * 28}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="14" font-weight="700" fill="${INK}" stroke="none">${n}</text></g>`).join('')}</g></svg>`,
  desk: `<svg viewBox="0 0 200 120"><g stroke="${INK}" stroke-width="5" stroke-linecap="round"><rect x="8" y="40" width="184" height="18" rx="5" fill="#a86b3c"/><path d="M24 58 v56 M176 58 v56"/></g></svg>`,
  stage: `<svg viewBox="0 0 200 140"><path d="M100 22 L58 110 H142z" fill="#fff59a" opacity=".4"/><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="8" y="8" width="184" height="20" rx="6" fill="#e0233f"/><path d="M12 28 q12 40 0 80 h30 q-14-40 0-80z" fill="#e0233f"/><path d="M188 28 q-12 40 0 80 h-30 q14-40 0-80z" fill="#e0233f"/><rect x="6" y="108" width="188" height="26" rx="6" fill="#c58a55"/></g></svg>`,
  cloud: `<svg viewBox="0 0 200 130"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M42 112 a30 30 0 0 1 -2-60 a40 40 0 0 1 72-24 a36 36 0 0 1 58 26 a30 30 0 0 1 -2 58z" fill="#fff"/><rect x="74" y="58" width="52" height="42" rx="4" fill="#dcefff"/><path d="M66 60 L100 36 L134 60z" fill="#3a5bff"/></g></svg>`,
  gitbot: `<svg viewBox="0 0 112 130"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M50 18 V4"/><circle cx="50" cy="4" r="5" fill="#ff4d6d"/><rect x="18" y="18" width="64" height="44" rx="12" fill="#e9ecf5"/><circle cx="38" cy="40" r="7" fill="${INK}"/><circle cx="62" cy="40" r="7" fill="${INK}"/><rect x="14" y="62" width="72" height="44" rx="12" fill="#ff8a2b"/><text x="50" y="92" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="22" fill="${INK}" stroke="none">git</text><path d="M32 106 V124 M68 106 V124" stroke-linecap="round"/><rect x="74" y="48" width="34" height="26" rx="5" fill="#2b2d42"/><circle cx="91" cy="61" r="7" fill="#9fd9ff"/></g></svg>`,
  pigeon: `<svg viewBox="0 0 120 90"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M18 58 q30 -50 72 -20 q20 10 18 25 q-30 20 -70 10z" fill="#b9c3d8"/><path d="M38 48 q20 -34 48 -12" fill="#8e9ab5"/><circle cx="94" cy="38" r="14" fill="#b9c3d8"/><circle cx="98" cy="35" r="4" fill="${INK}"/><path d="M107 40 l11 4 l-11 4z" fill="#ffb000"/><path d="M50 72 v12 M66 72 v12" stroke-linecap="round"/></g></svg>`,
};
$('#aShelly').innerHTML = SVG.shelly; $('#aCab').innerHTML = SVG.cabinet; $('#aDesk').innerHTML = SVG.desk; $('#aStage').innerHTML = SVG.stage;
$('#aCloud').insertAdjacentHTML('afterbegin', SVG.cloud);
const photoHTML = (id, msg, color) => `<div class="photo" style="--pc:${color}"><i></i>${id}<small>${esc(msg)}</small></div>`;
const SHOWS = {
  add: {
    line: 'git add game.py', words: ['git', 'add', 'game.py'],
    shell: 'Three words. The program is <b>git</b>. The second word, <b>add</b>, says what git should do. The last word, <b>game.py</b>, says which file.',
    hi: 'git here! Time to set the stage.', out: [],
    back: 'git add only moves the file onto the stage. Nothing is saved yet. And notice the screen says nothing: no news is good news.',
  },
  commit: {
    line: 'git commit -m "add lasers"', words: ['git', 'commit', '-m', '"add lasers"'],
    shell: 'The program is <b>git</b>, the job is <b>commit</b>, and <b>-m "add lasers"</b> is the message to write on the photo.',
    hi: 'Camera ready! Everybody on stage, smile!', out: ['[main e4f5a6b] add lasers', ' 1 file changed, 1 insertion(+)'],
    back: 'git took a photo of everything on the stage and pinned it in the album as e4f5a6b. That version of game.py is saved forever.',
  },
  push: {
    line: 'git push', words: ['git', 'push'],
    shell: 'Just two words. git already knows where GitHub is, because we told it once with <b>git remote</b>.',
    hi: 'New photos for GitHub? Pigeon time!', out: ['To https://github.com/kid/my-game.git', '   a1b2c3d..e4f5a6b  main -> main'],
    back: 'The pigeon carried a copy of the new photo up to GitHub. Now the code is safe even if your computer gets eaten by a dog.',
  },
};
let showBusy = false, showZoomed = false;
const showCap = (h) => { $('#showCap').innerHTML = `<span>${h}</span>`; fitAll($('#p-backstage')); };
const say = async (el, text, ms = 1700) => {
  el.textContent = text;
  el.animate([{ opacity: 0, transform: 'scale(.6) translateY(10px)' }, { opacity: 1, transform: 'scale(1.06)' }, { opacity: 1, transform: 'none' }], { duration: 280, fill: 'forwards' });
  sound.blip(); await sleep(ms);
  el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
};
const crtPrompt = '<span class="dim">kid@jelly:~/my-game$</span> ';
// Move an element by animating only the position properties it is given. The new position is set first and
// the animation plays from the old one, so nothing depends on a lingering fill once it ends.
const moveEl = (el, to, ms = 1100, mid) => {
  const from = Object.fromEntries(Object.keys(to).map((k) => [k, el.style[k]]));
  Object.assign(el.style, to);
  return el.animate(mid ? [from, { ...mid, offset: .5 }, to] : [from, to], { duration: REDUCED ? ms * .35 : ms, easing: 'ease-in-out' }).finished.catch(() => {});
};
const popIn = (el) => el.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.25)', opacity: 1 }, { transform: 'none' }], { duration: 500, easing: 'ease-out' });
function setBackstage(id) {
  Object.assign($('#aProg').style, { opacity: 0, left: '22%', bottom: '3%' });
  Object.assign($('#aPigeon').style, { opacity: 0, left: '66%', top: '20%' });
  Object.assign($('#fGame').style, id === 'commit' ? { left: '64%', bottom: '10%', opacity: 1 } : { left: '37%', bottom: '14%', opacity: 1 });
  Object.assign($('#fReadme').style, { left: '45%', bottom: '14%' });
  $('#album').innerHTML = photoHTML('a1b2c3d', 'first version', '#62c934') + (id === 'push' ? photoHTML('e4f5a6b', 'add lasers', '#ffc61a') : '');
  $('#cloudPhotos').innerHTML = photoHTML('a1b2c3d', 'first version', '#62c934');
}
const ACT = {
  async add() {
    const prog = $('#aProg'), f = $('#fGame');
    showCap('<b>git add:</b> git walks over to your folder and finds <b>game.py</b>.');
    await moveEl(prog, { left: '36%' });
    await say($('#bProgIn'), 'You! game.py! You are going on stage.', 1600);
    showCap('<b>git add:</b> git carries game.py onto <b>the stage</b>. It waits there for the photo.');
    await Promise.all([moveEl(prog, { left: '56%' }, 1300), moveEl(f, { left: '64%', bottom: '10%' }, 1300, { left: '50%', bottom: '30%' })]);
    await say($('#bProgIn'), 'Stand there and look nice. Photo later!', 1800);
  },
  async commit() {
    const prog = $('#aProg'), f = $('#fGame');
    showCap('<b>git commit:</b> git grabs its camera and points it at the stage.');
    await moveEl(prog, { left: '50%' });
    await say($('#bProgIn'), 'Everybody on stage, say cheese!', 1500);
    $('#flash').animate([{ opacity: 0 }, { opacity: .95 }, { opacity: 0 }], { duration: 450 }); sound.boing(1500, .12, .12);
    $('#album').insertAdjacentHTML('beforeend', photoHTML('e4f5a6b', 'add lasers', '#ffc61a')); popIn($('#album').lastElementChild);
    showCap('<b>SNAP!</b> A photo of the stage goes into the album with the ID <b>e4f5a6b</b> and your message.');
    await sleep(1600);
    showCap('game.py hops back into your folder. The photo keeps its own copy, forever.');
    await moveEl(f, { left: '37%', bottom: '14%' }, 900, { left: '50%', bottom: '28%' });
    await say($('#bProgIn'), 'Saved! But only on this computer, until you push.', 2100);
  },
  async push() {
    const prog = $('#aProg'), pg = $('#aPigeon');
    showCap('<b>git push:</b> git calls a carrier pigeon to take the new photos up to GitHub.');
    await moveEl(prog, { left: '44%' });
    await say($('#bProgIn'), 'Pigeon! Special delivery!', 1400);
    pg.innerHTML = SVG.pigeon + `<div class="carry">${photoHTML('e4f5a6b', 'add lasers', '#ffc61a')}</div>`;
    pg.style.opacity = 1; popIn(pg); sound.boing(900, .2, .08);
    await moveEl(pg, { left: '72%', top: '12%' }, 1500, { left: '69%', top: '0%' }); // perch beside the cloud, clear of GitHub's speech bubble
    showCap('<b>GitHub</b> checks who is knocking. Only you are allowed to put photos in your repository.');
    await say($('#bCloud'), 'Who goes there? Show me your token!', 1900);
    await say($('#bProgIn'), 'Token! Signed in as kid.', 1500);
    pg.querySelector('.carry')?.remove();
    $('#cloudPhotos').insertAdjacentHTML('beforeend', photoHTML('e4f5a6b', 'add lasers', '#ffc61a')); popIn($('#cloudPhotos').lastElementChild);
    await say($('#bCloud'), 'Welcome! Photo saved on GitHub.', 1800);
    await moveEl(pg, { left: '104%', top: '-10%' }, 900); pg.style.opacity = 0;
  },
};
async function runShow(id) {
  if (showBusy) return; showBusy = true;
  const controls = [...document.querySelectorAll('[data-show]'), $('#enterKey')];
  controls.forEach((b) => { b.disabled = true; });
  const s = SHOWS[id], card = $('#showCard'), crt = $('#crt'), tiles = $('#tiles'), prog = $('#aProg'), cab = $('#aCab');
  $('#back').getAnimations({ subtree: true }).forEach((a) => a.cancel());
  card.classList.remove('flipped'); tiles.innerHTML = ''; setBackstage(id);
  cab.querySelectorAll('.drawer rect').forEach((r) => r.setAttribute('fill', '#ffe2b8'));
  if (!showZoomed && !REDUCED) { showZoomed = true; await card.animate([{ transform: 'scale(2.3) translateY(10%)', filter: 'blur(3px)' }, { transform: 'none', filter: 'none' }], { duration: 1100, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished; }
  showCap('<b>Front.</b> Someone types at the green screen...');
  crt.innerHTML = crtPrompt + '<span id="typed"></span><span class="cursor"></span>';
  for (const ch of s.line) {
    $('#typed').textContent += ch; sound.boing(1400, .03, .03);
    const key = $('#krows').querySelector(`[data-k="${ch === ' ' ? 'space' : ch}"]`); key?.classList.add('lit');
    await sleep(75); key?.classList.remove('lit');
  }
  await sleep(350);
  const ek = $('#enterKey'); ek.classList.add('hit'); sound.boing(220, .2, .12); await sleep(220); ek.classList.remove('hit');
  showCap('<b>Enter!</b> Now let\'s flip the screen around and peek backstage.');
  await sleep(900); card.classList.add('flipped'); await sleep(1000);
  showCap('<b>Backstage.</b> Your letters whoosh down the tube to Shelly, the shell.');
  const els = s.words.map((w, i) => { const t = document.createElement('div'); t.className = 'tile' + (i === 0 ? ' prog' : ''); t.textContent = w; tiles.append(t); return t; });
  for (const t of els) { t.animate([{ transform: 'translate(10%,-400%)', opacity: 0 }, { transform: 'translate(0,15%)', opacity: 1, offset: .7 }, { transform: 'none' }], { duration: 650, easing: 'ease-in', fill: 'backwards' }); sound.blip(); await sleep(260); }
  await sleep(500);
  showCap(`<b>Shelly the shell:</b> ${s.shell}`);
  await say($('#bShelly'), 'Snip! Spaces split words.', 2600);
  showCap('Shelly looks for a program called <b>git</b> in the <b>/bin</b> cabinet.');
  const tb = els[0].getBoundingClientRect(), cb = cab.getBoundingClientRect();
  await els[0].animate([{ transform: 'none' }, { transform: `translate(${cb.left + cb.width / 2 - tb.left - tb.width / 2}px,${cb.top + cb.height * .45 - tb.top}px) scale(.6)`, opacity: .2 }], { duration: 800, easing: 'ease-in-out', fill: 'forwards' }).finished;
  cab.querySelector('.drawer[data-n="git"] rect')?.setAttribute('fill', '#62c934'); sound.boing(600, .25, .1);
  prog.innerHTML = SVG.gitbot + '<div class="bubble" id="bProgIn" style="left:-40%;bottom:105%;top:auto;max-width:none;width:260%"></div>';
  prog.style.opacity = 1;
  await prog.animate([{ transform: 'scale(0) translateY(60%)' }, { transform: 'scale(1.25)' }, { transform: 'scale(.92)' }, { transform: 'none' }], { duration: 650, easing: 'ease-out' }).finished;
  await say($('#bProgIn'), s.hi, 1700);
  await ACT[id]();
  showCap(`<b>Back to the front.</b> ${s.back}`);
  await sleep(1200);
  card.classList.remove('flipped'); await sleep(900);
  crt.innerHTML = crtPrompt + esc(s.line) + '<br>' + s.out.map((l) => esc(l) + '<br>').join('') + crtPrompt + '<span class="cursor"></span>';
  sound.ding();
  complete('backstage');
  showBusy = false;
  controls.forEach((b) => { b.disabled = false; });
}
document.querySelectorAll('[data-show]').forEach((b) => { b.onclick = () => runShow(b.dataset.show); });
$('#crt').innerHTML = crtPrompt + '<span class="cursor"></span>';
$('#krows').innerHTML = ['qwertyuiop-', 'asdfghjkl"', 'zxcvbnm.'].map((r) => `<div class="krow">${[...r].map((c) => `<span class="key" data-k="${c === '"' ? '&quot;' : c}">${esc(c)}</span>`).join('')}</div>`).join('') + '<div class="krow"><span class="key space" data-k="space"></span></div>';
$('#enterKey').onclick = () => runShow('add');

