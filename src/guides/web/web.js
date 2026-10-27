/* ---------------- the pretend internet ---------------- */
// The browser bar's lock, for secure pages.
const PADLOCK = `<svg viewBox="0 0 16 18" aria-hidden="true"><rect x="2" y="8" width="12" height="9" rx="2" fill="#62c934" stroke="${INK}" stroke-width="2"/><path d="M5 8V5.5a3 3 0 0 1 6 0V8" fill="none" stroke="${INK}" stroke-width="2"/></svg>`;
// The commands this guide adds to the shell (src/shell/jellysh.js).
SH.define('curl', (c) => curlRun(c.args, c.say, c.fail, c.info));
['nslookup', 'dig', 'host'].forEach((name) => SH.define(name, (c) => lookupRun(c.rest, c.say, c.fail, c.info)));
SH.define('ping', (c) => pingRun(c.args, c.say, c.fail, c.info));
['open', 'xdg-open'].forEach((name) => SH.define(name, (c) => openRun(c.rest, c.fail, c.info)));
SH.define('git', (c) => webGit(c.args, c.say, c.fail, c.info));
SH.define('wget', (c) => c.fail('wget: command not found', 'wget is curl\'s cousin. Here we use curl.', 127));
SH.define('help', (c) => { c.say('Web words: ' + ['curl', 'ping', 'nslookup', 'open', 'git'].join('  ')); c.say('Shell words: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history'].join('  ')); });
// Every website in this guide lives in this file. Nothing here ever touches the real internet.
const ART = {
  gerbil: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" fill="#d4eeff"/><g stroke="#24133b" stroke-width="4" stroke-linejoin="round"><path d="M30 96 q-26 -4 -22 -30" fill="none" stroke-linecap="round"/><ellipse cx="78" cy="78" rx="48" ry="30" fill="#e3b27a"/><circle cx="112" cy="58" r="24" fill="#e3b27a"/><ellipse cx="104" cy="34" rx="9" ry="12" fill="#ffc9b5"/><circle cx="120" cy="54" r="5" fill="#24133b"/><circle cx="135" cy="64" r="4" fill="#ff4d6d"/><path d="M60 104 v8 M92 104 v8" stroke-linecap="round"/></g><path d="M138 66 l14 -4 M138 68 l14 4" stroke="#24133b" stroke-width="2"/></svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" fill="#24133b"/><g fill="#fff"><circle cx="20" cy="20" r="2"/><circle cx="140" cy="30" r="2"/><circle cx="120" cy="96" r="2"/><circle cx="30" cy="90" r="2"/></g><g stroke="#24133b" stroke-width="4" stroke-linejoin="round"><path d="M80 10 q22 22 18 66 h-36 q-4 -44 18 -66z" fill="#e9ecf5"/><circle cx="80" cy="44" r="9" fill="#7aa8ff"/><path d="M62 70 l-14 18 h16z M98 70 l14 18 h-16z" fill="#ff4d6d"/><path d="M70 78 q10 30 20 0z" fill="#ffc61a"/></g></svg>`,
};
const artURL = (k) => 'data:image/svg+xml,' + encodeURIComponent(ART[k] ?? '');
const pageCSS = (bg, accent) => `<style>\n  body { font-family: Verdana, sans-serif; background: ${bg}; color: #24133b; margin: 0; padding: 16px 20px; line-height: 1.5; }\n  h1 { color: ${accent}; }\n  a { color: #3a5bff; }\n</style>`;
const pg = (title, bg, accent, body) => `<!DOCTYPE html>\n<html>\n<head>\n<title>${title}</title>\n${pageCSS(bg, accent)}\n</head>\n<body>\n${body}\n</body>\n</html>`;
const NET = {
  'jelly.fun': { ip: '203.0.113.42', https: true, ms: 23, pages: {
    '/': pg('Jelly Fun', '#fff0f5', '#ff4d6d', `<h1>Welcome to Jelly Fun!</h1>\n<p>The wobbliest website on the pretend internet.</p>\n<ul>\n  <li><a href="/snacks/">The snack cupboard</a></li>\n  <li><a href="https://gerbil.zone">Visit Gerald the Gerbil</a></li>\n  <li><a href="https://teapot.jelly">Talk to a teapot</a></li>\n  <li><a href="http://info.cern.ch">The very first website</a></li>\n</ul>\n<p><small>Psst: try a page that does not exist, like /unicorns</small></p>`),
    '/snacks/': pg('Index of /snacks/', '#ffffff', '#24133b', `<h1>Index of /snacks/</h1>\n<ul>\n  <li><a href="../">Parent folder</a></li>\n  <li><a href="broccoli.html">broccoli.html</a></li>\n  <li><a href="cookie.html">cookie.html</a></li>\n  <li><a href="pizza.html">pizza.html</a></li>\n</ul>\n<p><small>A server shows a folder like this when there is no index.html inside. It is ls, for the web!</small></p>`),
    '/snacks/cookie.html': pg('Cookie', '#fff4d6', '#ff8a2b', '<h1>COOKIE</h1>\n<p>Chocolate chips. 47 of them. I counted.</p>\n<p><a href="/">Home</a></p>'),
    '/snacks/pizza.html': pg('Pizza', '#ffe9e0', '#e0233f', '<h1>PIZZA</h1>\n<p>Cheese, tomato, more cheese.</p>\n<p><a href="/">Home</a></p>'),
    '/snacks/broccoli.html': pg('Broccoli', '#e2f7d6', '#2e8a1a', '<h1>I am broccoli.</h1>\n<p>You will eat me. Mwahaha.</p>\n<p><a href="/">Run away</a></p>'),
    '/broken': { status: 500, body: pg('Oops', '#ffe1e7', '#e0233f', '<h1>500 Internal Server Error</h1>\n<p>The server tripped over its own shoelaces. This one is NOT your fault.</p>') },
  }, notFound: pg('Not found', '#eadcff', '#9b5cff', '<h1>404: This jelly has wobbled away</h1>\n<p>There is no page here. Check the spelling, or go back <a href="/">home</a>.</p>') },
  'gerbil.zone': { ip: '203.0.113.7', https: true, ms: 41, pages: {
    '/': pg('Gerald the Gerbil', '#d4eeff', '#3a5bff', '<h1>Gerald\'s Zone</h1>\n<img src="gerbil.png" alt="Gerald the gerbil"/>\n<p>Hello! I am Gerald. I live in a cave and I like seeds.</p>'),
    '/gerbil.png': { type: 'image/png', art: 'gerbil' },
  } },
  'teapot.jelly': { ip: '198.51.100.18', https: true, ms: 12, pages: {
    '/': pg('A teapot', '#fff4d6', '#ff8a2b', '<h1>I am a little teapot</h1>\n<p>Short and stout. Ask me for <a href="/tea">/tea</a>.</p>\n<p>Do NOT ask me for <a href="/coffee">/coffee</a>.</p>'),
    '/tea': pg('Tea', '#e2f7d6', '#2e8a1a', '<h1>Here is your tea</h1>\n<p>Careful, it is hot.</p>'),
    '/coffee': { status: 418, body: pg('418', '#ffe1e7', '#e0233f', '<h1>418 I\'m a teapot</h1>\n<p>I cannot make coffee. I am a TEAPOT. This error is real: it was invented as an April Fools\' joke in 1998, and it stuck.</p>') },
  } },
  'info.cern.ch': { ip: '192.0.2.1', https: false, ms: 88, pages: {
    '/': '<html>\n<head>\n<title>The World Wide Web project</title>\n</head>\n<body>\n<h1>World Wide Web</h1>\n<p>The WorldWideWeb (W3) is a wide-area hypermedia information retrieval initiative aiming to give universal access to a large universe of documents.</p>\n<hr/>\n<p><i>(A pretend copy of the very first website, made by Tim Berners-Lee at CERN in 1991. No colours, no pictures, just words and links. Everything started here.)</i></p>\n</body>\n</html>',
  } },
  'old.jelly': { ip: '203.0.113.99', https: false, ms: 140, pages: {
    '/': pg('Grandpa Jelly', '#ffff66', '#0000ff', '<h1>Grandpa Jelly\'s Home Page</h1>\n<p>Made in 1999! UNDER CONSTRUCTION!!!</p>\n<p>This site has no padlock, so your letters travel as postcards.</p>'),
  } },
  'moon.base': { ip: '198.51.100.200', https: true, ms: 2563, pages: {
    '/': pg('Moon Base', '#24133b', '#ffc61a', '<h1 style="color:#ffc61a">Moon Base Alpha</h1>\n<p style="color:#fff">Status: all fine. Cheese reserves: plenty. Your page took over two seconds because the Moon is very far away.</p>'),
  } },
  'github.com': { ip: '192.0.2.140', https: true, ms: 9, pages: {
    '/': pg('GitHub', '#f6f8fa', '#24133b', '<h1>GitHub (pretend)</h1>\n<p>Where the world keeps its code.</p>\n<p>Your repositories: <a href="https://github.com/kid/kid.github.io">kid/kid.github.io</a></p>'),
    '/kid/kid.github.io': pg('kid/kid.github.io', '#f6f8fa', '#24133b', '<h1>kid / kid.github.io</h1>\n<p>A repository named <b>kid.github.io</b> turns into a website at <a href="https://kid.github.io">https://kid.github.io</a> every time you push.</p>'),
  } },
  'kid.github.io': { ip: '192.0.2.153', https: true, ms: 9, pages: () => ghPages('kid.github.io') },
  'gerald.github.io': { ip: '192.0.2.153', https: true, ms: 9, pages: () => ghPages('gerald.github.io') },
};
const IPS = Object.fromEntries(Object.entries(NET).filter(([h]) => !h.endsWith('.github.io')).map(([h, s]) => [s.ip, h]));
const STATUS = { 200: 'OK', 301: 'Moved Permanently', 404: 'Not Found', 418: 'I\'m a teapot', 500: 'Internal Server Error' };
const typeOf = (path) => /\.png$/i.test(path) ? 'image/png' : /\.css$/i.test(path) ? 'text/css' : /\.txt$/i.test(path) ? 'text/plain' : 'text/html';
const ghNotFound = pg('Site not found', '#ffffff', '#24133b', '<h1>404</h1>\n<p><b>There isn\'t a GitHub Pages site here.</b></p>\n<p>If you meant to make one, push your website to the repository first.</p>');
// A GitHub Pages site is whatever was last pushed to its repository.
function ghPages(host) {
  const tree = WEB.pages[host]; if (!tree) return null;
  return Object.fromEntries(Object.entries(tree).flatMap(([k, v]) => {
    const page = /\.png$/i.test(k) ? { type: 'image/png', art: v.replace(/^PNG:/, '') } : v;
    return k === 'index.html' ? [['/', page], ['/index.html', page]] : [['/' + k, page]];
  }));
}

// Ask the pretend internet for a URL, exactly once (no redirects followed here).
function fetchURL(raw) {
  let u; try { u = new URL(raw); } catch { return { error: 'bad', url: raw }; }
  if (u.protocol === 'file:') return fetchFile(u);
  if (!/^https?:$/.test(u.protocol)) return { error: 'bad', url: raw };
  const host = u.hostname, byIP = IPS[host], site = NET[byIP ?? host], secure = u.protocol === 'https:';
  const res = { url: u.href, host, path: u.pathname, secure, ip: byIP ? host : site?.ip, ms: site?.ms ?? 60, site: byIP ?? host };
  if (!site) return { ...res, error: 'dns' };
  if (secure && (byIP || !site.https)) return { ...res, error: 'tls' };
  if (!secure && site.https && !byIP) return { ...res, status: 301, location: `https://${host}${u.pathname}`, type: 'text/html', body: pg('Moved', '#fff', '#24133b', `<h1>301 Moved Permanently</h1>\n<p>Please use the padlock door: <a href="https://${host}${u.pathname}">https://${host}${u.pathname}</a></p>`) };
  const pages = typeof site.pages === 'function' ? site.pages() : site.pages;
  if (!pages) return { ...res, status: 404, type: 'text/html', body: ghNotFound };
  const p = pages[u.pathname];
  if (p === undefined && pages[u.pathname + '/'] !== undefined) return { ...res, status: 301, location: `${u.protocol}//${host}${u.pathname}/`, type: 'text/html', body: '' };
  const r = p === undefined ? { status: 404, body: site.notFound ?? (host.endsWith('.github.io') ? ghNotFound : pg('Not found', '#fff', '#24133b', '<h1>404 Not Found</h1>')) } : typeof p === 'string' ? { status: 200, body: p } : { status: 200, ...p };
  return { ...res, status: r.status, type: r.type ?? 'text/html', body: r.body ?? '', art: r.art };
}
function fetchFile(u) {
  const path = decodeURIComponent(u.pathname), n = find(path), res = { url: u.href, file: path, path, secure: true, local: true };
  if (!n) return { ...res, error: 'file' };
  if (n.type === 'dir') return { ...res, status: 200, type: 'text/html', body: pg(`Index of ${path}`, '#fff', '#24133b', `<h1>Index of ${esc(path)}/</h1>\n<ul>\n  <li><a href="../">Parent folder</a></li>\n${n.children.filter((c) => !c.name.startsWith('.')).map((c) => `  <li><a href="${esc(c.name)}${c.type === 'dir' ? '/' : ''}">${esc(c.name)}${c.type === 'dir' ? '/' : ''}</a></li>`).join('\n')}\n</ul>`) };
  const type = typeOf(path);
  return { ...res, status: 200, type, body: n.content, art: type === 'image/png' ? n.content.replace(/^PNG:/, '') : null };
}
// What the address bar does with what you type: add https:// for you, like a real browser.
function normalize(s) {
  s = s.trim(); if (!s) return null;
  if (/^[a-z]+:/i.test(s)) return s;
  if (s.startsWith('/') || s.startsWith('~')) return 'file://' + (s.startsWith('~') ? pathOf(sh.home) + s.slice(1) : s);
  const host = s.split(/[/?#]/)[0];
  if (/^[\d.]+$/.test(host)) return 'http://' + s;
  if (!host.includes('.')) return null;
  return (NET[host] && !NET[host].https ? 'http://' : 'https://') + s;
}
const fileURL = (n) => 'file://' + pathOf(n);
// Resolve a link or picture address written inside a file, the same way the browser will.
function fsResolve(fromPath, href) {
  if (!href) return null;
  try { const u = new URL(href, 'file://' + fromPath); return u.protocol === 'file:' ? find(decodeURIComponent(u.pathname)) : null; } catch { return null; }
}

/* ---------------- the browser ---------------- */
const BW = { url: '', res: null, hist: [], view: 'page', token: 0 };
const bwFrame = $('#bwFrame'), bwUrl = $('#bwUrl'), bwLock = $('#bwLock'), bwPop = $('#bwPop'), bwJourney = $('#bwJourney');
function navigate(raw, via = 'bar') {
  const url = normalize(raw);
  if (!url) return showError({ url: raw, error: 'search' }, via);
  let res = fetchURL(url), hops = 0;
  while (res.status === 301 && res.location && hops++ < 3) res = fetchURL(res.location);
  if (BW.url && !['back', 'reload', 'auto'].includes(via) && BW.url !== res.url) BW.hist.push(BW.url);
  BW.url = res.url ?? url; bwUrl.value = BW.url; bwPop.hidden = true;
  const token = ++BW.token, quiet = via === 'reload' || via === 'auto';
  const done = () => {
    if (token !== BW.token) return;
    BW.res = res; paintBrowser();
    if (!quiet) check({ type: 'visit', via, url: BW.url, host: res.host, path: res.path, status: res.status, error: res.error, file: res.file, secure: res.secure });
  };
  if (res.local) { journeyLocal(res); done(); } else journey(res, quiet).then(done);
}
function showError(res, via) { BW.res = res; paintBrowser(); if (via !== 'auto') check({ type: 'visit', via, url: res.url, error: res.error }); }
const reload = () => { if (BW.url) navigate(BW.url, 'reload'); };

// The trip a request takes, shown as stops that light up one after another.
function journey(res, instant = false) {
  const stops = [['you', 'You'], ['dns', res.error === 'dns' ? 'DNS: no such name!' : `DNS ${res.ip}`], ['srv', res.site ?? res.host]];
  bwJourney.innerHTML = stops.map(([k, t]) => `<span class="jy" data-s="${k}">${esc(t)}</span>`).join('<i>→</i>') + '<span class="jy-code"></span>';
  // Hold on to this trip's own stops: a newer request may redraw the strip while this one is still travelling.
  const el = Object.fromEntries([...bwJourney.querySelectorAll('[data-s]')].map((n) => [n.dataset.s, n])), code = bwJourney.querySelector('.jy-code');
  const light = (k, bad) => el[k].classList.add(bad ? 'bad' : 'on');
  const wait = (ms) => instant ? null : new Promise((r) => setTimeout(r, REDUCED ? 0 : ms));
  const blip = () => { if (!instant) sound.blip(); };
  return (async () => {
    light('you'); blip(); await wait(220);
    if (res.error === 'dns') { light('dns', true); if (!instant) sound.boing(160, .2, .06); return; }
    light('dns'); blip(); await wait(220 + Math.min(res.ms, 2600) / 2);
    if (res.error === 'tls') { light('srv', true); if (!instant) sound.boing(160, .2, .06); return; }
    light('srv'); blip(); await wait(140 + Math.min(res.ms, 2600) / 2);
    code.innerHTML = `<b>${res.status}</b> <span>${esc(STATUS[res.status] ?? '')}</span>`; code.dataset.k = String(res.status)[0];
    if (!instant) sound.boing(res.status === 200 ? 700 : 260, .18, .07);
  })();
}
function journeyLocal(res) {
  bwJourney.innerHTML = res.local ? `<span class="jy on">A file on your computer</span><span class="jy-note">No internet trip needed</span>` : '';
}
function paintBrowser() {
  const r = BW.res ?? {};
  bwUrl.value = BW.url;
  bwLock.className = 'bw-lock ' + (r.local ? 'file' : r.error ? 'warn' : r.secure ? 'ok' : 'warn');
  bwLock.innerHTML = r.local ? 'File' : r.error ? '!' : r.secure ? PADLOCK : 'Not secure';
  $('#bwBack').disabled = !BW.hist.length;
  document.querySelectorAll('.bw-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.view === BW.view));
  bwFrame.hidden = BW.view !== 'page'; $('#bwSource').hidden = BW.view !== 'source'; $('#bwBoxes').hidden = BW.view !== 'boxes';
  const html = pageHTML(r);
  if (BW.view === 'page') { bwFrame.dataset.url = BW.url; bwFrame.srcdoc = buildDoc(html, r); }
  if (BW.view === 'source') $('#bwSource').innerHTML = r.type === 'image/png' ? '<span class="hc">(This is a picture. Computers store pictures as numbers, so there is no text to show.)</span>' : r.body !== undefined && !r.error ? (r.type === 'text/css' ? hlCSS(r.body) : hlHTML(r.body)) : '<span class="hc">(Nothing came back, so there is no source to see.)</span>';
  if (BW.view === 'boxes') paintBoxes(r.local && r.file === ED.path ? edText.value : html);
}
// The page the browser shows: the site's HTML, a picture, or one of the browser's own error pages.
function pageHTML(r) {
  const err = (title, text) => `<!DOCTYPE html><html><head><style>body{font-family:Verdana,sans-serif;color:#24133b;padding:22px;background:#f4f1f8}h1{font-size:1.3em}</style></head><body><h1>${title}</h1><p>${text}</p></body></html>`;
  if (r.error === 'dns') return err('Hmm. We can\'t find that site.', `The phonebook (DNS) has no number for <b>${esc(r.host)}</b>. Check the spelling.`);
  if (r.error === 'tls') return err('This site has no padlock door', `<b>${esc(r.host)}</b> cannot make a secure (https) connection. Try <b>http://</b> instead.`);
  if (r.error === 'file') return err('Your file couldn\'t be found', `There is no file at <b>${esc(r.file)}</b>. It may have been moved or deleted.`);
  if (r.error === 'search') return err('This pretend browser has no search engine', 'Type a full address with a dot in it, like <b>jelly.fun</b>.');
  if (r.error) return err('That address does not look right', 'Try something like <b>https://jelly.fun</b>.');
  if (!BW.url) return err('A brand-new browser', 'Type an address in the bar above.');
  if (r.type === 'image/png') return `<!DOCTYPE html><html><body style="margin:0;background:#2a2a2a;display:grid;place-items:center;min-height:100vh"><img src="${r.url}"/></body></html>`;
  if (r.type !== 'text/html') return `<!DOCTYPE html><html><body><pre style="white-space:pre-wrap">${esc(r.body)}</pre></body></html>`;
  return r.body;
}
// Turn a page into something safe to show: no scripts, nothing fetched from the real internet,
// and every picture swapped for its pretend-internet copy (or a broken picture, like a real browser).
function buildDoc(html, r) {
  const doc = new DOMParser().parseFromString(html, 'text/html'), base = r.url || 'about:blank';
  const clean = (css) => css.replace(/@import[^;]*;?/gi, '').replace(/url\s*\([^)]*\)/gi, 'none');
  doc.querySelectorAll('script,noscript,iframe,frame,frameset,object,embed,base,meta,audio,video,source,track,portal').forEach((e) => e.remove());
  doc.querySelectorAll('link').forEach((l) => {
    if (!/stylesheet/i.test(l.rel)) return l.remove();
    const res = resolveRes(l.getAttribute('href'), base), st = doc.createElement('style');
    st.textContent = res?.type === 'text/css' && !res.error ? clean(res.body) : ''; l.replaceWith(st);
  });
  for (const el of doc.querySelectorAll('*')) for (const a of [...el.attributes]) {
    if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value) || a.name === 'srcset' || a.name === 'background') el.removeAttribute(a.name);
    else if (a.name === 'style') el.setAttribute('style', clean(a.value));
  }
  doc.querySelectorAll('style').forEach((s) => { s.textContent = clean(s.textContent); });
  doc.querySelectorAll('img,input[type=image]').forEach((img) => {
    const res = resolveRes(img.getAttribute('src'), base);
    img.setAttribute('src', res?.art && !res.error && res.status === 200 ? artURL(res.art) : 'data:,');
  });
  return '<!DOCTYPE html>' + doc.documentElement.outerHTML;
}
const resolveRes = (href, base) => { if (!href) return null; try { return fetchURL(new URL(href, base).href); } catch { return null; } };
bwFrame.addEventListener('load', () => {
  const d = bwFrame.contentDocument; if (!d || bwFrame.dataset.url !== BW.url) return;
  d.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]'); if (!a) return;
    e.preventDefault();
    const href = a.getAttribute('href'); if (href.startsWith('#')) return;
    try { navigate(new URL(href, BW.url).href, 'link'); } catch { navigate(href, 'link'); }
  });
  if (BW.res?.local) check({ type: 'render', file: BW.res.file, doc: d, win: bwFrame.contentWindow });
});
bwUrl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); navigate(bwUrl.value, 'bar'); bwUrl.blur(); } });
bwUrl.addEventListener('focus', () => requestAnimationFrame(() => bwUrl.select()));
$('#bwBack').onclick = () => { const u = BW.hist.pop(); if (u) navigate(u, 'back'); };
document.querySelector('.bw-tabs').addEventListener('click', (e) => {
  const v = e.target.closest('[data-view]')?.dataset.view; if (!v) return;
  BW.view = v; paintBrowser(); sound.blip();
  check({ type: v, url: BW.url, host: BW.res?.host });
});
bwLock.onclick = () => {
  const r = BW.res ?? {};
  if (!bwPop.hidden) { bwPop.hidden = true; return; }
  bwPop.innerHTML = (r.local ? `<b>A file on your computer.</b> It never travelled across the internet, so there was nothing to lock.`
    : r.error ? `<b>Something went wrong.</b> Read the page below to see what.`
    : r.secure ? `${PADLOCK}<b>Connection is secure.</b> Your letters to ${esc(r.host)} travel in a locked box. Only the real ${esc(r.host)} has the key, and its ID card was checked by the Jelly Certificate Authority.`
    : `<b>Not secure.</b> This site uses plain <b>http</b>, so your letters travel like postcards: anyone carrying them could read them. Never type a password here.`) + '<button class="bw-pop-x" aria-label="Close">×</button>';
  bwPop.hidden = false; sound.blip();
  check({ type: 'lock', secure: !!r.secure && !r.local && !r.error, host: r.host });
};
bwPop.addEventListener('click', (e) => { if (e.target.closest('.bw-pop-x')) bwPop.hidden = true; });

/* ---------------- the tag checker ---------------- */
// The tidy rules, the same everywhere in this guide (this is the XHTML way of writing HTML):
// every box gets a lid, the last box opened is the first one closed, and standalone tags close themselves with />.
// Browsers forgive messy HTML and guess; this checker does not, so mistakes show up instead of being hidden.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
function tidy(text) {
  const errs = [], root = { tag: '', kids: [], closed: true }, stack = [root], crossed = [];
  const lineAt = (i) => text.slice(0, i).split('\n').length;
  for (const m of text.matchAll(/<!--[\s\S]*?(?:-->|$)|<![^>]*>|<(\/?)([a-zA-Z][\w-]*)([^<>]*?)(\/?)>|<|[^<]+/g)) {
    const [t, close, name, attrs, slash] = m, line = lineAt(m.index), top = stack.at(-1), err = (type, msg, tag) => errs.push({ type, line, msg, tag });
    if (t.startsWith('<!')) continue;
    if (t === '<') { err('lt', 'A < on its own starts a tag. Did you forget its > ?'); continue; }
    if (!name) { if (t.trim()) top.kids.push({ text: t.trim().replace(/\s+/g, ' ') }); continue; }
    const tag = name.toLowerCase();
    if (name !== tag) err('case', `Tags are written in lowercase: <${tag}>, not <${name}>.`, tag);
    if (/=\s*[^\s"']/.test(attrs)) err('quote', 'Every value needs "quotes" around it, like href="about.html".', tag);
    if (close) {
      if (VOID.has(tag)) { err('voidlid', `<${tag}/> closes itself, so it never gets a </${tag}> lid. Delete the </${tag}>.`, tag); continue; }
      const at = stack.findLastIndex((b) => b.tag === tag);
      if (at < 1) {
        const c = crossed.indexOf(tag); // the late lid of a crossed pair was already reported
        if (c >= 0) crossed.splice(c, 1); else err('stray', `</${tag}> is a lid with no box: there is no <${tag}> open here.`, tag);
        continue;
      }
      // A box still open inside this one: crossed lids if its own lid comes next, otherwise a forgotten lid.
      const inner = stack.slice(at + 1), next = text.slice(m.index + t.length).match(/<\/([a-zA-Z][\w-]*)/)?.[1]?.toLowerCase();
      inner.forEach((b) => {
        if (b === inner.at(-1) && next === b.tag) { err('cross', `The lids are crossed! <${b.tag}> was opened last, so its lid goes first: </${b.tag}></${tag}>.`, b.tag); crossed.push(b.tag); }
        else errs.push({ type: 'nolid', line: b.line, tag: b.tag, msg: `<${b.tag}> has no lid. Add </${b.tag}> after the words inside it.` });
      });
      stack.splice(at).forEach((b, k) => { b.closed = k === 0; });
      continue;
    }
    if (VOID.has(tag)) { if (!slash) err('voidslash', `<${tag}> stands alone, so it closes itself with a slash: <${tag}/>`, tag); top.kids.push({ tag, line, void: true }); continue; }
    if (slash) { err('selfclose', `Only standalone tags close themselves. Write <${tag}></${tag}>.`, tag); top.kids.push({ tag, line, kids: [], closed: true }); continue; }
    const box = { tag, line, kids: [] }; top.kids.push(box); stack.push(box);
  }
  stack.slice(1).forEach((b) => errs.push({ type: 'nolid', line: b.line, tag: b.tag, msg: `<${b.tag}> has no lid. Add </${b.tag}> after the words inside it.` }));
  errs.sort((a, b) => a.line - b.line);
  return { ok: !errs.length, errs, root };
}
// The page drawn as boxes inside boxes. A box with no lid is drawn open at the bottom.
const INLINE = new Set(['a', 'b', 'i', 'em', 'strong', 'span', 'code', 'small', 'img', 'br']);
function paintBoxes(html) {
  const t = tidy(html), find_ = (n, tag) => n.tag === tag ? n : n.kids?.map((k) => find_(k, tag)).find(Boolean);
  const top = find_(t.root, 'body') ?? t.root;
  const draw = (n, d) => {
    if (n.text !== undefined) return `<span class="bx-text">${esc(n.text.length > 44 ? n.text.slice(0, 43) + '…' : n.text)}</span>`;
    if (n.void) return `<span class="bx-void">&lt;${n.tag}/&gt;</span>`;
    if (n.tag === 'style' || n.tag === 'script') return `<span class="bx-void">&lt;${n.tag}&gt;…&lt;/${n.tag}&gt;</span>`;
    return `<div class="bx${INLINE.has(n.tag) ? ' inl' : ''}${n.closed ? '' : ' nolid'}" style="--h:${[210, 140, 45, 270, 180, 100][d % 6]}"><span class="bx-tag">&lt;${n.tag}&gt;</span><div class="bx-in">${n.kids.map((k) => draw(k, d + 1)).join('')}</div><span class="bx-tag bx-lid">${n.closed ? `&lt;/${n.tag}&gt;` : 'no lid!'}</span></div>`;
  };
  $('#bwBoxes').innerHTML = `<p class="tree-note">Every pair of tags is a box. Boxes go inside boxes.${t.ok ? '' : ' <b>Red boxes have a problem.</b>'}</p>${top === t.root ? t.root.kids.map((k) => draw(k, 0)).join('') : draw(top, 0)}`;
}

/* ---------------- syntax colours ---------------- */
function hlHTML(s) {
  let inStyle = false;
  return s.replace(/<!--[\s\S]*?(?:-->|$)|<\/?[a-zA-Z][^<>]*>?|[^<]+|</g, (t) => {
    if (t.startsWith('<!--')) return `<span class="hc">${esc(t)}</span>`;
    const m = t.match(/^(<\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?>)?$/);
    if (!m) return inStyle ? hlCSS(t) : esc(t);
    inStyle = m[1] === '<' && m[2].toLowerCase() === 'style';
    return `<span class="ht">${esc(m[1] + m[2])}</span>${m[3].replace(/(\s+)|([^\s=]+)(\s*=\s*)?("[^"]*"?|'[^']*'?|[^\s>]+)?/g, (x, ws, name, eq, val) => ws ?? `<span class="ha">${esc(name)}</span>${eq ? esc(eq) : ''}${val ? `<span class="hs">${esc(val)}</span>` : ''}`)}${m[4] ? `<span class="ht">${esc(m[4])}</span>` : ''}`;
  });
}
const hlCSS = (s) => s.replace(/\/\*[\s\S]*?(?:\*\/|$)|([^{}]*)(\{)|([\w-]+)(\s*:)|[\s\S]/g, (t, sel, br, prop, colon) =>
  t.startsWith('/*') ? `<span class="hc">${esc(t)}</span>` : br ? `<span class="hsel">${esc(sel)}</span>{` : prop ? `<span class="ha">${esc(prop)}</span>${colon}` : esc(t));

/* ---------------- the editor ---------------- */
const ED = { project: '', path: '' }, WB = { tool: 'term' };
const edText = $('#edText'), edHl = $('#edHl'), edGut = $('#edGut'), edCheck = $('#edCheck');
const projectFiles = () => (find(ED.project)?.children ?? []).filter((c) => c.type === 'file' && /\.(html|css)$/i.test(c.name));
function edOpen(path) {
  const n = find(path); ED.path = n?.type === 'file' ? path : '';
  edText.value = n?.type === 'file' ? n.content : ''; edText.disabled = !ED.path; paintHl(); renderWork();
  if (ED.path && /\.html$/i.test(ED.path)) navigate(fileURL(n), 'auto');
}
// Colours, line numbers, and the checker's verdict under the editor (lines with a problem get a red number).
function paintHl() {
  const css = /\.css$/i.test(ED.path), t = css || !ED.path ? null : tidy(edText.value), bad = new Set(t?.errs.map((e) => e.line));
  edHl.innerHTML = (css ? hlCSS(edText.value) : hlHTML(edText.value)) + '\n ';
  edGut.innerHTML = edText.value.split('\n').map((x, i) => `<span${bad.has(i + 1) ? ' class="bad"' : ''}>${i + 1}</span>`).join('');
  edHl.scrollTop = edGut.scrollTop = edText.scrollTop; edHl.scrollLeft = edText.scrollLeft;
  edCheck.className = 'ed-check' + (t ? (t.ok ? ' ok' : ' bad') : '');
  edCheck.innerHTML = !t ? 'CSS file' : t.ok ? '✓ Every box has its lid' : `✗ Line ${t.errs[0].line}: ${esc(t.errs[0].msg)}${t.errs.length > 1 ? ` <small>(+${t.errs.length - 1} more)</small>` : ''}`;
}
function renderWork() {
  ED.project ||= pathOf(sh.home) + '/site';
  const files = projectFiles();
  if (ED.path && !find(ED.path)) ED.path = '';
  if (!ED.path && files.length) return edOpen(pathOf(files.find((f) => f.name === 'index.html') ?? files[0]));
  $('#edFiles').innerHTML = `<span class="ed-dir">${esc(pretty(find(ED.project) ?? sh.home))}/</span>` + files.map((f) => `<button class="ed-file${pathOf(f) === ED.path ? ' on' : ''}" data-path="${esc(pathOf(f))}">${esc(f.name)}</button>`).join('');
  const work = $('#term'); work.dataset.tool = WB.tool;
  document.querySelectorAll('.wtab').forEach((b) => b.classList.toggle('on', b.dataset.tool === WB.tool));
}
$('#edFiles').addEventListener('click', (e) => { const b = e.target.closest('[data-path]'); if (b) { edOpen(b.dataset.path); sound.blip(); } });
let edTimer;
edText.addEventListener('input', () => {
  const n = find(ED.path); if (!n) return;
  n.content = edText.value; paintHl(); saveWeb();
  // Live preview: show this file, or refresh the page that uses this stylesheet.
  if (/\.html$/i.test(ED.path)) { if (BW.url === fileURL(n)) reload(); else navigate(fileURL(n), 'auto'); }
  else if (BW.res?.local) reload();
  clearTimeout(edTimer);
  edTimer = setTimeout(() => check({ type: 'edit', path: ED.path, text: edText.value, doc: new DOMParser().parseFromString(edText.value, 'text/html'), tidy: tidy(edText.value) }), 260);
  if (BW.view === 'boxes') paintBoxes(edText.value);
});
edText.addEventListener('scroll', () => { edHl.scrollTop = edGut.scrollTop = edText.scrollTop; edHl.scrollLeft = edText.scrollLeft; });
edText.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); typeIn('  '); }
  if (e.ctrlKey && e.key.toLowerCase() === 'd') e.preventDefault(); // not the bookmark dialog
});
// Insert text where the cursor is, keeping the browser's own undo working.
function typeIn(t) { edText.focus({ preventScroll: true }); if (!document.execCommand('insertText', false, t)) { edText.setRangeText(t, edText.selectionStart, edText.selectionEnd, 'end'); edText.dispatchEvent(new Event('input')); } }
document.querySelector('.ed-keys').addEventListener('click', (e) => { const b = e.target.closest('[data-ins]'); if (b) typeIn(b.dataset.ins); });
document.querySelectorAll('.wtab').forEach((b) => b.addEventListener('click', () => {
  WB.tool = b.dataset.tool; renderWork(); sound.blip();
  (WB.tool === 'edit' ? edText : termIn).focus({ preventScroll: true });
}));
// Each lesson opens the right project, tool and page.
// A mission step can ask for a different tool: the workbench switches to it.
function webTask(L, step) {
  const t = step.tool ?? L.tool ?? 'edit';
  if (WB.tool === t) return;
  WB.tool = t; renderWork();
  requestAnimationFrame(() => (t === 'edit' ? edText : termIn).focus({ preventScroll: true }));
}
function webLesson(L) {
  onTask = webTask;
  ED.project = pathOf(sh.home) + '/' + (L.project ?? 'site'); WB.tool = L.tool ?? 'edit';
  if (!ED.path.startsWith(ED.project + '/')) ED.path = '';
  renderWork();
  if (L.home) navigate(L.home, 'auto');
  else if (ED.path) navigate(fileURL(find(ED.path)), 'auto');
}

/* ---------------- shell words for the web ---------------- */
function curlRun(args, say, fail, info) {
  const flags = new Set(args.filter((a) => /^-[a-zA-Z]+$/.test(a)).flatMap((a) => [...a.slice(1)]));
  const oi = args.indexOf('-o'), outFile = oi >= 0 ? args[oi + 1] : null;
  const url = args.find((a, i) => !a.startsWith('-') && (oi < 0 || i !== oi + 1));
  if (!url) return fail('curl: no URL specified!', 'Try: curl https://jelly.fun');
  let res = fetchURL(/^[a-z]+:\/\//i.test(url) ? url : 'http://' + url), hops = 0;
  while (flags.has('L') && res.status === 301 && res.location && hops++ < 3) res = fetchURL(res.location);
  info.curl = { host: res.host, path: res.path, status: res.status, type: res.type, head: flags.has('I'), verbose: flags.has('v'), error: res.error };
  if (!res.local) journey(res);
  if (res.error === 'dns') return fail(`curl: (6) Could not resolve host: ${res.host}`, 'The phonebook (DNS) has never heard of that name. Check the spelling.');
  if (res.error === 'tls') return fail(`curl: (35) SSL connect error`, `${res.host} has no padlock door. Try http:// instead of https://`);
  if (res.error === 'file') return fail(`curl: (37) Couldn't open file ${res.file}`);
  if (res.error) return fail('curl: (3) URL using bad/illegal format or missing URL');
  const head = [`HTTP/1.1 ${res.status} ${STATUS[res.status] ?? ''}`, `Content-Type: ${res.type}`, `Content-Length: ${res.art ? 2048 : res.body.length}`, `Server: ${res.host?.endsWith('github.io') ? 'GitHub.com' : 'jelly-server'}`, ...(res.location ? [`Location: ${res.location}`] : [])];
  if (flags.has('v') && !res.local) {
    say(`* Looking up ${res.host} in the phonebook... ${res.ip}`, 'mute'); say(`* Connected to ${res.host} (${res.ip}) port ${res.secure ? 443 : 80}`, 'mute');
    if (res.secure) say('* Padlock on: everything below travels in a locked box', 'mute');
    [`${flags.has('I') ? 'HEAD' : 'GET'} ${res.path} HTTP/1.1`, `Host: ${res.host}`, 'User-Agent: curl/8.4.0', 'Accept: */*'].forEach((l) => say('> ' + l, 'req')); say('>', 'req');
    head.forEach((l) => say('< ' + l, 'res')); say('<', 'res');
  } else if (flags.has('I')) head.forEach((l) => say(l, 'res'));
  if (!flags.has('I')) {
    if (outFile) { const f = writeFS(outFile, res.art ? 'PNG:' + res.art : res.body); if (!f) return fail(`curl: (23) Failed writing to ${outFile}`); say(`(Saved ${res.art ? 'the picture' : 'the page'} into ${outFile})`, 'mute'); info.saved = pathOf(f); }
    else if (res.art) say('Warning: Binary output can mess up your terminal. (It is a picture: as text, it looks like gibberish.)', 'tip');
    else res.body.split('\n').forEach((l) => say(l));
  }
  if (res.status === 301 && !flags.has('L')) say('The server said "moved, go over there" (301). Add -L to follow it, or use https://', 'tip');
}
function writeFS(path, content) {
  const ex = find(path); if (ex?.type === 'file') { ex.content = content; return ex; }
  if (ex) return null;
  const [dp, name] = splitPath(path), d = find(dp);
  if (!d || d.type !== 'dir') return null;
  const f = { id: 'n' + nid++, name, type: 'file', content, children: null, parent: d }; d.children.push(f); sortKids(d); return f;
}
const hostOf = (s) => (s ?? '').replace(/^[a-z]+:\/\//i, '').split(/[/:?#]/)[0];
function lookupRun(rest, say, fail, info) {
  const host = hostOf(rest[0]); info.host = host;
  if (!host) return fail('Which name should I look up?', 'Try: nslookup jelly.fun');
  say('Server:   jelly-dns (the internet\'s phonebook)', 'mute'); say('');
  if (!NET[host]) return fail(`** server can't find ${host}: NXDOMAIN`, 'NXDOMAIN means "no such name in the phonebook". Check the spelling.');
  say(`Name:     ${host}`); say(`Address:  ${NET[host].ip}`, 'res'); info.ip = NET[host].ip;
}
function pingRun(args, say, fail, info) {
  const ci = args.indexOf('-c'), count = ci >= 0 ? Number(args[ci + 1]) || 4 : 0, host = hostOf(args.find((a, i) => !a.startsWith('-') && (ci < 0 || i !== ci + 1)));
  info.host = host;
  if (!host) return fail('ping: usage error: Destination address required', 'Try: ping jelly.fun');
  const ip = IPS[host] ? host : NET[host]?.ip;
  if (!ip) return fail(`ping: cannot resolve ${host}: Unknown host`, 'The phonebook (DNS) has no number for that name.');
  say(`PING ${host} (${ip}): 56 data bytes`);
  if (!count) say('(It keeps pinging, like sonar. Press Ctrl+C to stop it.)', 'tip');
  const ms = NET[IPS[host] ?? host].ms * 2 + (host === 'moon.base' ? 0 : 6);
  const p = sh.ping = { host, ip, n: 0, timer: 0 };
  const tick = () => {
    if (sh.ping !== p) return;
    print(`<span>64 bytes from ${ip}: icmp_seq=${p.n} ttl=57 time=${(ms * (.92 + Math.random() * .16)).toFixed(1)} ms</span>`); p.n++;
    sound.boing(1250, .1, .05); scrollDown();
    if (count && p.n >= count) { stopPing(); return; }
    p.timer = setTimeout(tick, Math.max(1000, ms));
  };
  p.timer = setTimeout(tick, Math.min(ms, 3000));
}
function stopPing() {
  const p = sh.ping; if (!p) return false;
  clearTimeout(p.timer); sh.ping = null;
  print(`<span class="mute">--- ${esc(p.host)} ping statistics ---</span>`);
  print(`<span class="mute">${p.n} packets transmitted, ${p.n} packets received, 0.0% packet loss</span>`);
  paintPrompt(); scrollDown();
  return true;
}
function openRun(rest, fail, info) {
  const t = rest[0];
  if (!t) return fail('open: what should I open?', 'Try: open site/index.html  or  open https://jelly.fun');
  if (/^[a-z]+:\/\//i.test(t) || (!find(t) && hostOf(t).includes('.') && !/\.html?$/i.test(t))) { info.opened = t; navigate(t, 'open'); return; }
  const n = find(t);
  if (!n) return fail(`The file ${t} does not exist.`, 'Check the name with ls.');
  info.opened = pathOf(n); navigate(fileURL(n), 'open');
}

/* ---------------- a tiny git, just enough to publish ---------------- */
// Two repositories: your website, and Gerald's. A push copies the latest photo onto GitHub Pages.
const WEB = { repos: {}, pages: {} };
const repoAt = (n = sh.cwd) => { for (let x = n; x; x = x.parent) if (WEB.repos[pathOf(x)]) return WEB.repos[pathOf(x)]; return null; };
function workTree(dirPath) {
  const out = {}, d = find(dirPath);
  const walk = (n, pre) => n.children.forEach((c) => { if (c.name.startsWith('.')) return; c.type === 'dir' ? walk(c, pre + c.name + '/') : (out[pre + c.name] = c.content); });
  if (d?.type === 'dir') walk(d, '');
  return out;
}
const sameTree = (a, b) => { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every((k) => a[k] === b[k]); };
function webGit(args, say, fail, info) {
  const [sub, ...rest] = args; info.sub = sub;
  if (!sub) { say('usage: git <word>'); say('Words for publishing a website: status  add  commit  push  log  remote', 'tip'); return; }
  const repo = repoAt();
  if (['status', 'add', 'commit', 'push', 'log', 'remote'].includes(sub) && !repo) return fail('fatal: not a git repository (or any of the parent directories): .git', 'Walk into your website folder first: cd ~/site');
  if (repo) info.repo = repo.host;
  const head = repo?.commits.at(-1)?.tree ?? {}, work = repo ? workTree(repo.dir) : {};
  switch (sub) {
    case 'status': {
      const idx = repo.index, staged = [...new Set([...Object.keys(idx), ...Object.keys(head)])].filter((k) => idx[k] !== head[k]);
      const unstaged = Object.keys(idx).filter((k) => work[k] !== idx[k]), untracked = Object.keys(work).filter((k) => !(k in idx));
      info.status = { staged, unstaged, untracked };
      say('On branch main');
      const ahead = repo.commits.length - 1 - repo.commits.findIndex((c) => c.id === repo.pushed);
      if (repo.pushed && ahead > 0) say(`Your branch is ahead of 'origin/main' by ${ahead} commit${ahead > 1 ? 's' : ''}.`, 'tip');
      if (staged.length) { say('Changes to be committed:'); staged.forEach((k) => say(`        ${!(k in head) ? 'new file' : !(k in idx) ? 'deleted' : 'modified'}:   ${k}`, 'ok')); }
      if (unstaged.length) { say('Changes not staged for commit:'); unstaged.forEach((k) => say(`        ${k in work ? 'modified' : 'deleted'}:   ${k}`, 'er')); }
      if (untracked.length) { say('Untracked files:'); untracked.forEach((k) => say(`        ${k}`, 'er')); }
      if (!staged.length && !unstaged.length && !untracked.length) say('nothing to commit, working tree clean');
      else if (!staged.length) say('(use "git add ." to put everything on the stage)', 'tip');
      break;
    }
    case 'add': {
      if (!rest.length) return fail('Nothing specified, nothing added.', 'Try: git add .');
      for (const p of rest) {
        if (p === '.' || p === '-A' || p === '--all') { repo.index = { ...work }; info.added = Object.keys(work); continue; }
        const n = find(p), rel = n && pathOf(n).startsWith(repo.dir + '/') ? pathOf(n).slice(repo.dir.length + 1) : null;
        if (!rel && !(p in repo.index)) return fail(`fatal: pathspec '${p}' did not match any files`);
        if (n?.type === 'dir') Object.keys(work).filter((k) => k.startsWith(rel + '/')).forEach((k) => { repo.index[k] = work[k]; });
        else if (n) repo.index[rel] = n.content; else delete repo.index[p];
        info.added = [p];
      }
      break;
    }
    case 'commit': {
      const mi = rest.indexOf('-m'), msg = mi >= 0 ? rest[mi + 1] : null;
      if (mi < 0) return fail('Oops: no message!', 'Always add a message with -m, like: git commit -m "my website"');
      if (!msg) return fail('error: switch `m\' requires a value');
      if (sameTree(repo.index, head)) return fail('nothing to commit, working tree clean', 'Changed something? Put it on the stage first with git add .');
      const changed = [...new Set([...Object.keys(repo.index), ...Object.keys(head)])].filter((k) => repo.index[k] !== head[k]).length;
      const c = { id: sha(), msg, tree: { ...repo.index } }; repo.commits.push(c); info.commit = c.id;
      say(`[main ${c.id}] ${msg}`); say(` ${changed} file${changed > 1 ? 's' : ''} changed`);
      break;
    }
    case 'push': {
      const last = repo.commits.at(-1), from = repo.pushed;
      if (from === last.id) { say('Everything up-to-date'); say('Nothing new to send. Did you commit your changes?', 'tip'); break; }
      repo.pushed = last.id; WEB.pages[repo.host] = { ...last.tree }; info.pushed = repo.host;
      say(`To ${repo.remote}`); say(`   ${from ?? '0000000'}..${last.id}  main -> main`, 'ok');
      say(`Live in a moment at https://${repo.host}`, 'tip');
      break;
    }
    case 'log': [...repo.commits].reverse().forEach((c) => say(`${c.id} ${c.msg}${c.id === repo.pushed ? '   (this one is on GitHub)' : ''}`, 'hash')); break;
    case 'remote': say(`origin  ${repo.remote} (fetch)`); say(`origin  ${repo.remote} (push)`); break;
    default: fail(`git: '${sub}' is not a word we need here.`, 'For publishing a website: status, add, commit, push, log.');
  }
}
const sha = () => [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 7);
function webSeed() {
  const home = pathOf(sh.home), site = workTree(home + '/site');
  WEB.repos = { [home + '/site']: { dir: home + '/site', host: 'kid.github.io', remote: 'https://github.com/kid/kid.github.io.git', commits: [{ id: 'a1b2c3d', msg: 'first version', tree: site }], index: { ...site }, pushed: null } };
  WEB.pages = {};
  seedGerald();
}
// Gerald's broken website is already on GitHub, waiting for you to fix it.
function seedGerald() {
  const dir = pathOf(sh.home) + '/gerald', tree = workTree(dir);
  WEB.repos[dir] = { dir, host: 'gerald.github.io', remote: 'https://github.com/gerald/gerald.github.io.git', commits: [{ id: '9e8d7c6', msg: 'my amazing website', tree }], index: { ...tree }, pushed: '9e8d7c6' };
  WEB.pages['gerald.github.io'] = { ...tree };
}
function resetGerald() {
  const fresh = find('home/kid/gerald', seed()), old = find('gerald', sh.home);
  if (old) sh.home.children.splice(sh.home.children.indexOf(old), 1);
  if (old && within(sh.cwd, old)) sh.cwd = sh.home;
  fresh.parent = sh.home; sh.home.children.push(fresh); sortKids(sh.home);
  seedGerald(); ED.path = '';
}

/* ---------------- saving the sandbox ---------------- */
// Your website survives a reload: the pretend computer is saved in this browser.
const serial = (n) => n.type === 'dir' ? { n: n.name, k: n.children.map(serial) } : { n: n.name, c: n.content };
const unserial = (o, parent) => { const n = { id: 'n' + nid++, name: o.n, type: o.k ? 'dir' : 'file', content: o.k ? '' : o.c, children: null, parent }; if (o.k) n.children = o.k.map((c) => unserial(c, n)); return n; };
let saveTimer;
function saveWeb() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { store.web = { fs: serial(sh.root), repos: WEB.repos, pages: WEB.pages, cwd: pathOf(sh.cwd) }; save(); }, 400); }
function loadFS() {
  const w = store.web; if (!w?.fs || !w.repos) return null;
  WEB.repos = w.repos; WEB.pages = w.pages ?? {};
  return unserial(w.fs, null);
}
function webReset() {
  if (sh.ping) { clearTimeout(sh.ping.timer); sh.ping = null; }
  BW.hist = []; ED.path = ''; renderWork(); saveWeb();
  const L = PANELS[panelIdx]?.lesson; if (L) webLesson(L);
}

// After every command: refresh the editor's file list, keep the page in the browser up to date, and save.
function renderMap() {
  if (ED.path && find(ED.path)?.type === 'file' && document.activeElement !== edText) { const c = find(ED.path).content; if (c !== edText.value) { edText.value = c; paintHl(); } }
  renderWork(); saveWeb();
  if (BW.res?.local) reload();
}
