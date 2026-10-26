/* ---------------- section 2: backstage show ---------------- */
const PADLOCK = `<svg viewBox="0 0 16 18" aria-hidden="true"><rect x="2" y="8" width="12" height="9" rx="2" fill="#62c934" stroke="${INK}" stroke-width="2"/><path d="M5 8V5.5a3 3 0 0 1 6 0V8" fill="none" stroke="${INK}" stroke-width="2"/></svg>`;
const SVG = {
  browsy: `<svg viewBox="0 0 110 140"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M55 16 V4"/><circle cx="55" cy="4" r="5" fill="#ff4d6d"/><rect x="12" y="16" width="86" height="58" rx="10" fill="#fff"/><path d="M12 32 H98" /><circle cx="24" cy="24" r="3" fill="#ff5f57" stroke="none"/><circle cx="34" cy="24" r="3" fill="#febc2e" stroke="none"/><circle cx="44" cy="24" r="3" fill="#28c840" stroke="none"/><circle cx="40" cy="52" r="7" fill="${INK}"/><circle cx="70" cy="52" r="7" fill="${INK}"/><path d="M46 64 q9 6 18 0" fill="none" stroke-linecap="round"/><rect x="18" y="74" width="74" height="44" rx="12" fill="#3a5bff"/><text x="55" y="104" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="700" font-size="22" fill="#fff" stroke="none">www</text><path d="M36 118 V134 M74 118 V134" stroke-linecap="round"/></g></svg>`,
  owl: `<svg viewBox="0 0 150 140"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M30 34 L36 6 L52 26 Z M90 34 L84 6 L68 26 Z" fill="#8a5a2e"/><ellipse cx="60" cy="74" rx="46" ry="58" fill="#a8743f"/><ellipse cx="60" cy="92" rx="30" ry="34" fill="#f1d7a8"/><circle cx="42" cy="50" r="15" fill="#fff"/><circle cx="78" cy="50" r="15" fill="#fff"/><circle cx="44" cy="52" r="6" fill="${INK}"/><circle cx="80" cy="52" r="6" fill="${INK}"/><path d="M54 64 L60 76 L66 64 Z" fill="#ffb000"/><g class="book"><path d="M70 96 L108 86 L146 96 L146 132 L108 122 L70 132 Z" fill="#fff"/><path d="M108 86 V122"/><path d="M80 102 h20 M80 110 h18 M116 100 h20 M116 108 h22" stroke-width="3"/></g></g></svg>`,
  router: `<svg viewBox="0 0 140 110"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M34 52 L24 6 M106 52 L116 6"/><rect x="8" y="50" width="124" height="44" rx="12" fill="#2b2d42"/><path d="M24 104 v-10 M116 104 v-10"/></g><g class="leds">${[34, 54, 74, 94].map((x) => `<circle cx="${x}" cy="72" r="6" fill="#4dff8b"/>`).join('')}</g></svg>`,
  server: `<svg viewBox="0 0 170 190"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="10" y="10" width="150" height="172" rx="12" fill="#3a4055"/>${[0, 1, 2, 3].map((k) => `<rect x="24" y="${50 + k * 32}" width="122" height="24" rx="5" fill="#5a6280"/><circle class="led" cx="132" cy="${62 + k * 32}" r="5" fill="#4dff8b"/>`).join('')}<rect x="40" y="16" width="90" height="30" rx="8" fill="#e9ecf5"/><circle cx="68" cy="31" r="6" fill="${INK}"/><circle cx="102" cy="31" r="6" fill="${INK}"/></g></svg>`,
  teapot: `<svg viewBox="0 0 170 150"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M30 70 q-30 0 -24 30 q6 18 30 16" fill="none"/><path d="M138 82 q30 -20 28 -50 l-18 6 q0 22 -14 30" fill="#ff8a2b"/><ellipse cx="86" cy="96" rx="58" ry="46" fill="#ff8a2b"/><path d="M50 56 q36 -24 72 0z" fill="#ffc61a"/><circle cx="86" cy="36" r="9" fill="#ffc61a"/><circle cx="70" cy="92" r="7" fill="${INK}"/><circle cx="104" cy="92" r="7" fill="${INK}"/><path d="M76 110 q10 8 20 0" fill="none" stroke-linecap="round"/></g></svg>`,
};
$('#aBrowsy').innerHTML = SVG.browsy + '<div class="bubble" id="bBrowsy" style="left:-30%;bottom:104%;top:auto;max-width:none;width:240%"></div>';
$('#aOwl').innerHTML = SVG.owl; $('#aRouter').innerHTML = SVG.router;
const SHOWS = {
  page: {
    url: 'gerbil.zone', parts: ['https://', 'gerbil.zone', '/'], host: 'gerbil.zone', ip: '203.0.113.7', path: '/', server: 'server',
    serve: 'GET /? Home page, coming right up!', code: '200 OK', ok: true,
    back: 'Every page you have ever visited made that trip: look up the number, send the letter, get the HTML, build the page.',
  },
  nope: {
    url: 'gerbil.zone/nope', parts: ['https://', 'gerbil.zone', '/nope'], host: 'gerbil.zone', ip: '203.0.113.7', path: '/nope', server: 'server',
    serve: 'GET /nope? Let me look... nope. Not here!', code: '404 Not Found', ok: false,
    page: '<div class="pf-msg">404<br><small>Not Found</small></div>',
    back: 'The trip worked perfectly. The page just was not there, so the server sent back 404 instead of a page.',
  },
  teapot: {
    url: 'teapot.jelly/coffee', parts: ['https://', 'teapot.jelly', '/coffee'], host: 'teapot.jelly', ip: '198.51.100.18', path: '/coffee', server: 'teapot',
    serve: 'COFFEE?! I am a TEAPOT!', code: '418 I\'m a teapot', ok: false,
    page: '<div class="pf-msg">418<br><small>I\'m a teapot</small></div>',
    back: 'Status 418 is real. It started as an April Fools\' joke in 1998, and programmers loved it too much to delete it.',
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
// Move an element by animating only the position properties it is given. The new position is set first and
// the animation plays from the old one, so nothing depends on a lingering fill once it ends.
const moveEl = (el, to, ms = 1100, mid) => {
  const from = Object.fromEntries(Object.keys(to).map((k) => [k, el.style[k]]));
  Object.assign(el.style, to);
  return el.animate(mid ? [from, { ...mid, offset: .5 }, to] : [from, to], { duration: REDUCED ? ms * .35 : ms, easing: 'ease-in-out' }).finished.catch(() => {});
};
const popIn = (el) => el.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.25)', opacity: 1 }, { transform: 'none' }], { duration: 500, easing: 'ease-out' });
const miniScreen = (url, page) => `<div class="mini-bar"><span class="mini-lock">${PADLOCK}</span><span id="typed">${esc(url)}</span>${page === undefined ? '<span class="cursor"></span>' : ''}</div><div class="mini-page">${page ?? ''}</div>`;
function setBackstage(s) {
  Object.assign($('#aBrowsy').style, { left: '30%', bottom: '4%' });
  Object.assign($('#env').style, { opacity: 0, left: '40%', bottom: '30%' });
  $('#env').className = 'envelope';
  $('#aServer').innerHTML = SVG[s.server] + '<div class="bubble" id="bServer" style="right:20%;bottom:100%;top:auto;max-width:none;width:120%"></div>';
  $('#serverSign').textContent = s.server === 'teapot' ? 'THE SERVER (A TEAPOT)' : 'THE SERVER';
  $('#pfBar').textContent = ''; $('#pfBody').innerHTML = ''; $('#pfBody').style.background = '#fff';
}
async function runShow(id) {
  if (showBusy) return; showBusy = true;
  const controls = [...document.querySelectorAll('[data-show]'), $('#enterKey')];
  controls.forEach((b) => { b.disabled = true; });
  const s = SHOWS[id], card = $('#showCard'), crt = $('#crt'), tiles = $('#tiles'), br = $('#aBrowsy'), env = $('#env');
  $('#back').getAnimations({ subtree: true }).forEach((a) => a.cancel());
  card.classList.remove('flipped'); tiles.innerHTML = ''; setBackstage(s);
  if (!showZoomed && !REDUCED) { showZoomed = true; await card.animate([{ transform: 'scale(2.3) translateY(10%)', filter: 'blur(3px)' }, { transform: 'none', filter: 'none' }], { duration: 1100, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished; }
  showCap('<b>Front.</b> Someone types an address into the browser...');
  crt.innerHTML = miniScreen('');
  for (const ch of s.url) {
    $('#typed').textContent += ch; sound.boing(1400, .03, .03);
    const key = $('#krows').querySelector(`[data-k="${ch}"]`); key?.classList.add('lit');
    await sleep(75); key?.classList.remove('lit');
  }
  await sleep(350);
  const ek = $('#enterKey'); ek.classList.add('hit'); sound.boing(220, .2, .12); await sleep(220); ek.classList.remove('hit');
  showCap('<b>Enter!</b> Now let\'s flip the browser around and peek backstage.');
  await sleep(900); card.classList.add('flipped'); await sleep(1000);
  // 1. the address is split into parts
  showCap('<b>Browsy the browser</b> splits the address: <b>https://</b> is how to talk, <b>' + s.host + '</b> is which computer, <b>' + s.path + '</b> is which file.');
  const els = s.parts.map((w, i) => { const t = document.createElement('div'); t.className = 'tile' + (i === 1 ? ' prog' : ''); t.textContent = w; tiles.append(t); return t; });
  for (const t of els) { t.animate([{ transform: 'translate(10%,-300%)', opacity: 0 }, { transform: 'translate(0,15%)', opacity: 1, offset: .7 }, { transform: 'none' }], { duration: 650, easing: 'ease-in', fill: 'backwards' }); sound.blip(); await sleep(260); }
  $('#pfBar').textContent = s.url;
  await say($('#bBrowsy'), `${s.host}? Where is that?`, 1700);
  // 2. the phonebook
  showCap(`<b>The DNS owl</b> keeps the internet's phonebook. Computers only understand numbers, so Browsy asks for ${s.host}'s number.`);
  await moveEl(br, { left: '44%', bottom: '30%' }, 1100, { left: '38%', bottom: '40%' });
  await say($('#bBrowsy'), `Owl! What is the number for ${s.host}?`, 1800);
  $('#aOwl').querySelector('.book').animate([{ transform: 'none' }, { transform: 'rotate(-8deg) translateY(-6px)' }, { transform: 'none' }], { duration: 400, iterations: 3 });
  await say($('#bOwl'), `Hoo! ${s.host} is ${s.ip}.`, 1900);
  // 3. the letter goes out through the router and across the internet
  showCap(`Browsy writes a polite letter: <b>GET ${s.path}</b>, which means "please give me ${s.path === '/' ? 'your home page' : s.path}". It goes into the <b>router</b>, out across the internet.`);
  env.textContent = `GET ${s.path}`; env.style.opacity = 1; popIn(env);
  await moveEl(br, { left: '30%', bottom: '4%' }, 900);
  await moveEl(env, { left: '47%', bottom: '18%' }, 900, { left: '44%', bottom: '34%' });
  $('#aRouter').querySelector('.leds').animate([{ opacity: 1 }, { opacity: .2 }, { opacity: 1 }], { duration: 160, iterations: 6 }); sound.boing(900, .15, .06);
  await moveEl(env, { left: '73%', bottom: '44%' }, 1300, { left: '62%', bottom: '14%' });
  // 4. the server answers
  showCap(s.server === 'teapot' ? '<b>The server</b> at teapot.jelly reads the letter. Oh dear. It is a teapot.' : `<b>The server</b> reads the letter and looks in its folders for ${s.path === '/' ? 'index.html' : s.path}.`);
  await say($('#bServer'), s.serve, 2200);
  env.textContent = s.code; env.classList.add(s.ok ? 'ok' : 'bad'); sound.boing(s.ok ? 700 : 240, .25, .1);
  showCap(`The reply starts with a number: <b>${s.code}</b>${s.ok ? ', which means "here you go!", plus the HTML of the page.' : '. No page this time.'}`);
  await sleep(1300);
  await moveEl(env, { left: '33%', bottom: '28%' }, 1700, { left: '58%', bottom: '10%' });
  env.style.opacity = 0;
  // 5. the browser builds the page
  if (s.ok) {
    showCap('<b>Browsy reads the HTML</b> and builds the page, box by box: a heading, a picture, a paragraph...');
    await say($('#bBrowsy'), '200 OK! Building time!', 1300);
    for (const cls of ['pf-h', 'pf-img', 'pf-p', 'pf-p', 'pf-p short']) { const b = document.createElement('div'); b.className = cls; $('#pfBody').append(b); popIn(b); sound.boing(500 + Math.random() * 300, .12, .06); await sleep(380); }
    showCap('...then the <b>CSS</b> paints it. Splash!');
    $('#pfBody').style.background = '#d4eeff'; $('#pfBody').animate([{ filter: 'brightness(1.6)' }, { filter: 'none' }], { duration: 500 }); sound.boing(1100, .2, .1);
    await sleep(1100);
  } else {
    $('#pfBody').innerHTML = s.page; popIn($('#pfBody').firstElementChild);
    await say($('#bBrowsy'), s.server === 'teapot' ? 'A teapot?! Fine, I will show that.' : 'No page? I will show the 404 then.', 1900);
  }
  showCap(`<b>Back to the front.</b> ${s.back}`);
  await sleep(1400);
  card.classList.remove('flipped'); await sleep(900);
  crt.innerHTML = miniScreen(s.url, s.ok ? '<div class="pf-h"></div><div class="pf-img"></div><div class="pf-p"></div><div class="pf-p short"></div>' : s.page);
  if (s.ok) crt.querySelector('.mini-page').style.background = '#d4eeff';
  sound.ding();
  complete('backstage');
  showBusy = false;
  controls.forEach((b) => { b.disabled = false; });
}
document.querySelectorAll('[data-show]').forEach((b) => { b.onclick = () => runShow(b.dataset.show); });
$('#crt').innerHTML = miniScreen('');
$('#krows').innerHTML = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm./'].map((r) => `<div class="krow">${[...r].map((c) => `<span class="key" data-k="${c}">${esc(c)}</span>`).join('')}</div>`).join('') + '<div class="krow"><span class="key space" data-k="space"></span></div>';
$('#enterKey').onclick = () => runShow('page');
