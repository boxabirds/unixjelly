const isCmd = (e, c) => e.type === 'cmd' && e.cmd === c;
const edits = (e, file) => e.type === 'edit' && e.path.endsWith('/' + file);
const lids = (t, tag) => [(t.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length, (t.match(new RegExp(`</${tag}\\s*>`, 'gi')) || []).length];
const lidOpen = (t, tag) => { const [o, c] = lids(t, tag); return o > c; };
const lidShut = (t, tag) => { const [o, c] = lids(t, tag); return o > 0 && o === c; };
// The tag checker's verdict on what was just typed: tidy means every rule is kept. errType looks for one kind of mistake.
const tidyOK = (e) => e.tidy?.ok;
const errType = (e, type, tag) => e.tidy?.errs.some((x) => x.type === type && (!tag || x.tag === tag));
const siteNow = () => { const t = find('~/site/index.html')?.content ?? ''; return { t, tidy: tidy(t), doc: new DOMParser().parseFromString(t, 'text/html') }; };
// Did a request (from the browser or from curl) come back with this status?
const statusOf = (e) => e.type === 'visit' ? e.status : isCmd(e, 'curl') ? e.info.curl?.status : undefined;
const visited = (e, host, path) => e.type === 'visit' && !e.error && e.host === host && (!path || e.path === path);
const pics = (e) => [...e.doc.querySelectorAll('img')];
const picOK = (e, img) => /^PNG:/.test(fsResolve(e.path, img.getAttribute('src'))?.content ?? '');
const colourOf = (e, sel, prop) => { const el = e.doc.querySelector(sel); return el ? e.win.getComputedStyle(el)[prop] : null; };
const inRepo = (e, host) => e.type === 'cmd' && e.cmd === 'git' && e.ok && e.info.repo === host;
// Gerald's site, judged the same way whether it is in the editor or already on GitHub.
function geraldFixed(html, has) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return { lid: lidShut(html, 'h1') && tidy(html).ok, pic: [...doc.querySelectorAll('img')].every((i) => has(i.getAttribute('src'), true)), link: [...doc.querySelectorAll('a[href]')].every((a) => /^https?:/.test(a.getAttribute('href')) || has(a.getAttribute('href'))) };
}
const geraldNow = (e) => geraldFixed(e.text, (h, pic) => { const n = fsResolve(e.path, h); return pic ? /^PNG:/.test(n?.content ?? '') : n?.type === 'file'; });
// Little pictures for the story phase: a tag pulled apart, boxes inside boxes, a tag that stands alone.
const viz = {
  tag: (open, inside, close, labels) => `<div class="tagviz"><div class="tv-row"><code class="tv-open">${open}</code><span class="tv-in">${inside}</span><code class="tv-close">${close}</code></div><div class="tv-labels">${labels.map((l) => `<span>${l}</span>`).join('')}</div></div>`,
  nest: `<div class="tagviz"><div class="tv-box tv-b1"><code>&lt;p&gt;</code> I like <div class="tv-box tv-b2"><code>&lt;b&gt;</code> cheese <code>&lt;/b&gt;</code></div> <code>&lt;/p&gt;</code></div><p class="tv-note">The &lt;b&gt; box is inside the &lt;p&gt; box,<br/>so its lid goes on first.</p></div>`,
  alone: (tag, note) => `<div class="tagviz"><code class="tv-big">${tag}</code><p class="tv-note">${note}</p></div>`,
};
// project: which folder the editor opens. tool: which tab of the workbench starts open (a step can ask for another).
// home: the page the browser starts on. Every mission only counts on its own page (onlyHere), and steps tick in order (seq).
const LESSONS = [
  { id: 'html', word: 'html', name: 'Peek behind a page', stands: 'HyperText Markup Language', color: '#ff4d6d', tool: 'term', home: 'https://jelly.fun', onlyHere: true, seq: true,
    title: 'Every page is a text file in disguise', why: 'Long ago, editors scribbled notes on writers\' pages with a red pen: "make this BIG", "new paragraph here". Those notes were called <b>markup</b>. HTML is the same idea: little notes called <b>tags</b> that tell the browser how to show your words.',
    mnem: 'A web page is just text wearing a costume.',
    points: ['HTML = HyperText Markup Language. <b>Hyper</b> means "beyond": text that can jump to other pages.', 'Every website, even the giant ones, is built from HTML.', 'Your browser reads the text and turns it into the page you see.'],
    steps: [
      { t: 'In the browser on the right, press <b>View source</b>. That is what jelly.fun is really made of.', ok: (e) => e.type === 'source' },
      { t: 'Your own page is a file too. Read it in the terminal: <code>cat site/index.html</code>', ok: (e) => isCmd(e, 'cat') && e.info.hits?.some((h) => h.endsWith('/site/index.html')) },
      { t: 'Now show it as a page: <code>open site/index.html</code>', ok: (e) => e.type === 'visit' && e.via === 'open' && e.file?.endsWith('/site/index.html') },
    ] },
  { id: 'tags', word: '</>', name: 'Boxes with lids', stands: 'Opening tag, closing tag', color: '#ff8a2b', onlyHere: true, seq: true,
    visual: viz.tag('&lt;h1&gt;', 'Hello!', '&lt;/h1&gt;', ['<b>Opening tag</b><br/>opens the box', '<b>The inside</b><br/>your words', '<b>Closing tag</b><br/>the lid: the <b>/</b> means "stop"']),
    title: 'Tags are boxes with lids', why: 'A tag is a word in angle brackets, like <code>&lt;h1&gt;</code>. It opens a box. Everything after it goes in the box, until the lid: the same tag with a slash, <code>&lt;/h1&gt;</code>. <b>h1</b> means "heading number 1", the biggest, loudest heading on the page.',
    mnem: 'Open the box. Fill it. Put the lid on.',
    points: ['<b>Rule 1:</b> every box gets a lid. <code>&lt;h1&gt;</code> always needs a <code>&lt;/h1&gt;</code>.', 'The lid is the same word with a slash in front: <code>&lt;/h1&gt;</code>.', 'Forget a lid and the browser has to guess where the box ends. It often guesses wrong.', 'The checker under the editor watches every lid for you.'],
    steps: [
      { t: 'In the editor, find the <code>&lt;h1&gt;</code> box. Change the words <b>inside</b> it to your name.', ok: (e) => edits(e, 'index.html') && tidyOK(e) && !!e.doc.querySelector('h1') && !/^hello,? world!?$/i.test(e.doc.querySelector('h1').textContent.trim()) },
      { t: 'Take the lid off: delete <code>&lt;/h1&gt;</code>. Watch the page go HUGE, and the checker turn red.', ok: (e) => edits(e, 'index.html') && lidOpen(e.text, 'h1') },
      { t: 'Put the lid back on: type <code>&lt;/h1&gt;</code> straight after your name. The checker goes green.', ok: (e) => edits(e, 'index.html') && lidShut(e.text, 'h1') && tidyOK(e) },
    ] },
  { id: 'p', word: '<p>', name: 'Boxes in boxes', stands: 'Paragraph', color: '#62c934', onlyHere: true, seq: true, visual: viz.nest,
    title: 'Boxes inside boxes', why: 'Boxes can go inside other boxes, like a toy inside a box inside a bigger box. <code>&lt;p&gt;</code> is a paragraph box, and <code>&lt;b&gt;</code> makes words bold. Put a <code>&lt;b&gt;</code> box inside a <code>&lt;p&gt;</code> box, and the inside box must be closed before the outside one.',
    mnem: 'Last opened, first closed.',
    points: ['<b>Rule 2:</b> close the inside box first. <code>&lt;p&gt;&lt;b&gt;hi&lt;/b&gt;&lt;/p&gt;</code> is right.', '<code>&lt;p&gt;&lt;b&gt;hi&lt;/p&gt;&lt;/b&gt;</code> is wrong: the lids are crossed.', 'Your whole page is boxes inside boxes: <code>&lt;body&gt;</code> holds everything you see.'],
    steps: [
      { t: 'Under your heading, add a new paragraph box: <code>&lt;p&gt;I like cheese.&lt;/p&gt;</code>', ok: (e) => edits(e, 'index.html') && tidyOK(e) && e.doc.querySelectorAll('body p').length >= 2 },
      { t: 'Put a box inside it: make <b>cheese</b> bold with <code>&lt;b&gt;cheese&lt;/b&gt;</code>', ok: (e) => edits(e, 'index.html') && tidyOK(e) && !!e.doc.querySelector('p b') },
      { t: 'Cross the lids on purpose: make the end <code>&lt;/p&gt;&lt;/b&gt;</code>. What does the checker say?', ok: (e) => edits(e, 'index.html') && errType(e, 'cross') },
      { t: 'Fix it: last opened, first closed. <code>&lt;/b&gt;&lt;/p&gt;</code>', ok: (e) => edits(e, 'index.html') && tidyOK(e) && !!e.doc.querySelector('p b') },
    ] },
  { id: 'hr', word: '<hr/>', name: 'Tags that stand alone', stands: 'Horizontal Rule', color: '#3a5bff', onlyHere: true, seq: true,
    visual: viz.alone('&lt;hr/&gt;', 'One tag, nothing inside.<br/>The slash at the end closes it straight away.'),
    title: 'Tags that stand alone', why: 'Some tags never have anything inside them. <code>&lt;hr/&gt;</code> draws a line across the page ("horizontal rule": a rule is a ruler line). There is nothing to put in the box, so it opens and closes in one go: the slash goes at the <b>end</b>.',
    mnem: 'Nothing inside? Close it with />.',
    points: ['<b>Rule 3:</b> a tag that stands alone closes itself: <code>&lt;hr/&gt;</code>.', '<code>&lt;br/&gt;</code> is another one: it breaks a line, like pressing Enter.', 'Slash at the front: a lid. Slash at the end: a tag that closes itself.'],
    steps: [
      { t: 'Draw a line across your page: add <code>&lt;hr/&gt;</code> under your heading.', ok: (e) => edits(e, 'index.html') && tidyOK(e) && /<hr\s*\/>/.test(e.text) },
      { t: 'Break a line in a paragraph: put <code>&lt;br/&gt;</code> in the middle of one.', ok: (e) => edits(e, 'index.html') && tidyOK(e) && !!e.doc.querySelector('p br') },
      { t: 'Try it without its slash: change it to <code>&lt;hr&gt;</code>. The checker spots it!', ok: (e) => edits(e, 'index.html') && errType(e, 'voidslash', 'hr') },
      { t: 'Put the slash back: <code>&lt;hr/&gt;</code>. Green again!', ok: (e) => edits(e, 'index.html') && tidyOK(e) && /<hr\s*\/>/.test(e.text) },
    ] },
  { id: 'ul', word: '<ul>', name: 'Lists', stands: 'Unordered List', color: '#9b5cff', onlyHere: true, seq: true,
    visual: `<div class="tagviz"><pre class="tv-code">&lt;ul&gt;
  &lt;li&gt;pizza&lt;/li&gt;
  &lt;li&gt;cheese&lt;/li&gt;
&lt;/ul&gt;</pre><p class="tv-note">A list box, with an item box<br/>for each thing. Every box has a lid.</p></div>`,
    title: 'Make a list', why: 'A list is a box full of smaller boxes. <code>&lt;ul&gt;</code> is the list ("unordered list": the bullet-point kind). Each thing in it goes in its own <code>&lt;li&gt;</code> box ("list item"), and each <code>&lt;li&gt;</code> gets its own lid.',
    mnem: 'One big box, one small box per item.',
    points: ['Every item: <code>&lt;li&gt;</code> … <code>&lt;/li&gt;</code>. No lid, no item.', 'Want numbers instead of bullets? Use <code>&lt;ol&gt;</code>: an ordered list.', 'Spaces at the start of a line do not change the page. They just make your boxes easier to see.'],
    steps: [
      { t: 'Under your paragraphs, start a list box: <code>&lt;ul&gt;&lt;/ul&gt;</code>', ok: (e) => edits(e, 'index.html') && tidyOK(e) && !!e.doc.querySelector('ul') },
      { t: 'Put one item inside, with its lid: <code>&lt;li&gt;pizza&lt;/li&gt;</code>', ok: (e) => edits(e, 'index.html') && tidyOK(e) && e.doc.querySelectorAll('ul li').length >= 1 },
      { t: 'Add two more items. Every one gets its own lid.', ok: (e) => edits(e, 'index.html') && tidyOK(e) && e.doc.querySelectorAll('ul li').length >= 3 },
      { t: 'In the browser, press <b>Boxes</b>. Find your list box with its three item boxes.', ok: (e) => e.type === 'boxes' && siteNow().tidy.ok && siteNow().doc.querySelectorAll('ul li').length >= 3 },
    ] },
  { id: 'a', word: '<a>', name: 'Links', stands: 'Anchor', color: '#3a5bff', onlyHere: true, seq: true,
    visual: viz.tag('&lt;a <span class="tv-attr">href</span>=<span class="tv-val">"https://jelly.fun"</span>&gt;', 'Jelly Fun', '&lt;/a&gt;', ['<b>An attribute</b><br/>extra info, inside the opening tag', '<b>The words</b><br/>what you click', '<b>The lid</b>']),
    title: 'Links make it a web', why: '"a" is for <b>anchor</b>, like a ship\'s anchor that hooks onto another place. The opening tag carries extra information called an <b>attribute</b>: <code>href</code> ("hypertext reference") says where to jump. Billions of pages linking to each other look like a giant spider web. That is why it is called the World Wide Web.',
    mnem: 'a hooks on, href says where.',
    points: ['Attributes go inside the opening tag: <code>name="value"</code>, always with quotes.', 'A link to a file in the same folder is just its name: <code>href="about.html"</code>.', 'The lid stays plain: <code>&lt;/a&gt;</code>, no attributes.'],
    steps: [
      { t: 'Add a link: <code>&lt;a href="https://jelly.fun"&gt;Jelly Fun&lt;/a&gt;</code>', ok: (e) => edits(e, 'index.html') && tidyOK(e) && [...e.doc.querySelectorAll('a[href]')].some((a) => /^https?:\/\//.test(a.getAttribute('href'))) },
      { t: 'Click your link in the browser.', ok: (e) => e.type === 'visit' && e.via === 'link' && !!e.host },
      { t: 'Press ← to come back. Link to your other page with <code>href="about.html"</code>, then click it.', ok: (e) => e.type === 'visit' && e.via === 'link' && e.file?.endsWith('/about.html') },
    ] },
  { id: 'img', word: '<img/>', name: 'Pictures', stands: 'IMaGe', color: '#ff4d6d', onlyHere: true, seq: true,
    visual: viz.alone('&lt;img <span class="tv-attr">src</span>=<span class="tv-val">"images/gerbil.png"</span> <span class="tv-attr">alt</span>=<span class="tv-val">"Gerald"</span>/&gt;', 'A picture has nothing inside it,<br/>so it stands alone and closes itself.'),
    title: 'Pictures stand alone too', why: 'A picture has no words inside it, so <code>&lt;img/&gt;</code> stands alone, just like <code>&lt;hr/&gt;</code>. Its attributes do the work. <code>src</code> means "source": where the picture is. It is a path, exactly like a <code>cd</code> path: <code>images/gerbil.png</code> means "go into images, take gerbil.png".',
    mnem: 'img stands alone. src says where.',
    points: ['<code>alt</code> is what to say instead of the picture. Screen readers read it out loud for people who cannot see the screen.', 'One wrong letter in src and the picture breaks. Computers never guess.', 'Remember the slash at the end: <code>/&gt;</code>'],
    steps: [
      { t: 'Add a picture: <code>&lt;img src="images/gerbil.png" alt="Gerald"/&gt;</code>', ok: (e) => edits(e, 'index.html') && tidyOK(e) && pics(e).some((i) => picOK(e, i)) },
      { t: 'Make a typo in the path, like <code>gerbal.png</code>. The picture breaks and the alt words show instead.', ok: (e) => edits(e, 'index.html') && pics(e).some((i) => !picOK(e, i)) },
      { t: 'Fix the path. Every picture works, and every one has alt words.', ok: (e) => edits(e, 'index.html') && tidyOK(e) && pics(e).length > 0 && pics(e).every((i) => picOK(e, i) && i.getAttribute('alt')?.trim()) },
    ] },
  { id: 'css', word: 'css', name: 'A splash of style', stands: 'Cascading Style Sheets', color: '#ffc61a', onlyHere: true, seq: true,
    title: 'Paint it with CSS', why: 'HTML says what things are. CSS says how they look. CSS goes in a <code>&lt;style&gt;</code> box at the top of your page. <b>Cascading</b> means "pouring down like a waterfall": give the <code>body</code> a colour and it pours down into every box inside it.',
    mnem: 'HTML is the bones. CSS is the paint.',
    points: ['Put CSS inside <code>&lt;style&gt;</code>…<code>&lt;/style&gt;</code> in the <code>&lt;head&gt;</code>.', 'A rule is: who, then curly brackets, then what to change: <code>h1 { color: hotpink; }</code>', 'There are 140 colour names. Try <code>papayawhip</code>, <code>tomato</code> or <code>lime</code>.'],
    steps: [
      { t: 'In the head, add <code>&lt;style&gt; h1 { color: hotpink; } &lt;/style&gt;</code>', ok: (e) => e.type === 'render' && e.file.endsWith('/site/index.html') && !['rgb(0, 0, 0)', null].includes(colourOf(e, 'h1', 'color')) },
      { t: 'Colour the whole page: <code>body { background: lightyellow; }</code>', ok: (e) => e.type === 'render' && e.file.endsWith('/site/index.html') && !['rgba(0, 0, 0, 0)', null].includes(colourOf(e, 'body', 'backgroundColor')) },
      { t: 'Watch it cascade: add <code>color: purple;</code> to the body rule. Every paragraph changes!', ok: (e) => e.type === 'render' && e.file.endsWith('/site/index.html') && !['rgb(0, 0, 0)', null].includes(colourOf(e, 'body', 'color')) && colourOf(e, 'p', 'color') === colourOf(e, 'body', 'color') },
    ] },
  { id: 'url', word: 'url', name: 'Read an address', stands: 'Uniform Resource Locator', color: '#ff4d6d', tool: 'term', home: 'https://jelly.fun', onlyHere: true, seq: true,
    title: 'A web address is a path', why: 'Look at <code>https://jelly.fun/snacks/cookie.html</code>. <b>https://</b> is how to talk. <b>jelly.fun</b> is which computer. <b>/snacks/cookie.html</b> is which file, in which folder. That last part is a path on someone else\'s computer, just like the paths in Jelly Shell.',
    mnem: 'How, which computer, which file.',
    points: ['URL = Uniform Resource Locator. A fancy name for "address".', 'Folders end with a slash: <code>/snacks/</code>.', 'You can change any part of an address yourself. Go on, it will not break anything.'],
    steps: [
      { t: 'Click the address bar, type <code>jelly.fun/snacks/cookie.html</code> and press Enter.', ok: (e) => visited(e, 'jelly.fun', '/snacks/cookie.html') && e.via === 'bar' },
      { t: 'Change just the end of the address to get the pizza instead.', ok: (e) => visited(e, 'jelly.fun', '/snacks/pizza.html') && e.via === 'bar' },
      { t: 'Delete the file name so it ends in <code>/snacks/</code>. The server lists the folder, like <code>ls</code>!', ok: (e) => visited(e, 'jelly.fun', '/snacks/') && e.via === 'bar' },
    ] },
  { id: 'curl', word: 'curl', name: 'Pages as text', stands: 'See URL', color: '#62c934', tool: 'term', home: 'https://jelly.fun', onlyHere: true, seq: true,
    title: 'curl: see the URL', why: 'Say it out loud: curl, "see URL". It fetches a page and shows you the raw text, with no browser in the way. This proves it: a web page really is just text sent across the internet.',
    mnem: 'curl = see URL.',
    points: ['<code>curl https://jelly.fun</code> prints the HTML the server sends.', 'The browser gets exactly the same text. It just draws it nicely.', 'Add <code>&gt; page.html</code> to save it into a file instead.'],
    steps: [
      { t: 'Fetch a page: <code>curl https://jelly.fun</code>', ok: (e) => isCmd(e, 'curl') && e.info.curl?.host === 'jelly.fun' && e.info.curl.status === 200 },
      { t: 'Fetch the cookie: <code>curl https://jelly.fun/snacks/cookie.html</code>', ok: (e) => isCmd(e, 'curl') && e.info.curl?.path === '/snacks/cookie.html' && e.info.curl.status === 200 },
      { t: 'Save it: <code>curl https://jelly.fun &gt; jelly.html</code>', ok: (e) => isCmd(e, 'curl') && e.ok && (/>/.test(e.line ?? '') || !!e.info.saved) },
      { t: 'Open your saved copy: <code>open jelly.html</code>', ok: (e) => e.type === 'visit' && e.via === 'open' && /\.html$/.test(e.file ?? '') && /Jelly Fun/.test(find(e.file)?.content ?? '') },
    ] },
  { id: 'get', word: 'GET', name: 'A polite letter', stands: 'HTTP: HyperText Transfer Protocol', color: '#3a5bff', tool: 'term', home: 'https://jelly.fun', onlyHere: true, seq: true,
    title: 'Every page starts with a letter', why: 'Your browser writes the server a letter: <code>GET /index.html</code>, which means "please give me index.html". The server writes back: <code>200 OK</code>, here it is. The rules for writing these letters are called <b>HTTP</b>. A protocol is just a set of manners.',
    mnem: 'GET means "give me, please".',
    points: ['Lines starting with <code>&gt;</code> are the letter you send. Lines with <code>&lt;</code> are the reply.', 'The lines at the top are <b>headers</b>: the writing on the envelope.', '<code>Content-Type</code> says what is inside: a page, a picture, a stylesheet…'],
    steps: [
      { t: 'Read the letters: <code>curl -v https://jelly.fun</code>', ok: (e) => isCmd(e, 'curl') && e.info.curl?.verbose && e.info.curl.status === 200 },
      { t: 'Just the envelope, no letter: <code>curl -I https://jelly.fun</code>', ok: (e) => isCmd(e, 'curl') && e.info.curl?.head && !e.info.curl.verbose && e.info.curl.status === 200 },
      { t: 'Ask for a picture and spot its Content-Type: <code>curl -I https://gerbil.zone/gerbil.png</code>', ok: (e) => isCmd(e, 'curl') && e.info.curl?.head && e.info.curl.type === 'image/png' },
    ] },
  { id: '404', word: '404', name: 'Status codes', stands: 'Not Found', color: '#ff8a2b', tool: 'term', home: 'https://jelly.fun', onlyHere: true, seq: true,
    title: 'Every reply has a number', why: 'The first thing a server says is a number. 200 means "here you go!" 404 means "I looked everywhere, it\'s not here". 500 means the server itself broke. And 418 means "I\'m a teapot". That one started as an April Fools\' joke in 1998, and it is still real today.',
    mnem: '200 yay! 404 where? 500 oh no!',
    points: ['2xx: it worked. 3xx: go over there. 4xx: your mistake. 5xx: the server\'s mistake.', 'People say 404 is named after room 404 at CERN. That is a legend: it is really "4 = your mistake, 04 = not found".', 'Some websites make funny 404 pages. Try jelly.fun\'s!'],
    steps: [
      { t: 'Ask for a page that is not there, like <code>jelly.fun/unicorns</code> (browser or curl).', ok: (e) => statusOf(e) === 404 },
      { t: 'Order coffee from a teapot: <code>curl https://teapot.jelly/coffee</code>', ok: (e) => statusOf(e) === 418 },
      { t: 'Find the server having a bad day: <code>jelly.fun/broken</code>', ok: (e) => statusOf(e) === 500 },
    ] },
  { id: 'dns', word: 'dns', name: 'The phonebook', stands: 'Domain Name System', color: '#9b5cff', tool: 'term', home: 'https://jelly.fun', onlyHere: true, seq: true,
    title: 'The internet\'s phonebook', why: 'Computers do not understand names like jelly.fun. They only understand numbers, called IP addresses. DNS is a giant phonebook that turns a name into a number. Your computer looks it up every time, before it can send a single letter.',
    mnem: 'Names for people, numbers for computers.',
    points: ['<code>nslookup</code> means "name server, look up!"', 'An IP address is four numbers with dots, like <code>203.0.113.42</code>.', 'The numbers here are pretend. Real ones work the same way.'],
    steps: [
      { t: 'Look up a number: <code>nslookup jelly.fun</code>', ok: (e) => isCmd(e, 'nslookup') && e.ok && e.info.host === 'jelly.fun' },
      { t: 'Now Gerald\'s: <code>nslookup gerbil.zone</code>', ok: (e) => isCmd(e, 'nslookup') && e.ok && e.info.host === 'gerbil.zone' },
      { t: 'Skip the phonebook: type jelly.fun\'s number <code>203.0.113.42</code> into the address bar.', ok: (e) => e.type === 'visit' && e.host === '203.0.113.42' && e.status === 200 },
    ] },
  { id: 'ping', word: 'ping', name: 'Sonar', stands: 'the sound sonar makes', color: '#62c934', tool: 'term', home: 'https://moon.base', onlyHere: true, seq: true,
    title: 'Ping! Is anybody there?', why: 'Submarines find things with sonar: they send out a "ping!" sound and listen for the echo. The ping command does the same. It sends a tiny message to a computer and times how long the echo takes to come back.',
    mnem: 'Ping! ... pong. How far away are you?',
    points: ['The time is there and back, in milliseconds (thousandths of a second).', 'Ping never stops by itself. <kbd>Ctrl</kbd>+<kbd>C</kbd> stops it, just like in Jelly Shell.', '<code>ping -c 4 jelly.fun</code> sends exactly four, then stops.'],
    steps: [
      { t: 'Send some pings: <code>ping jelly.fun</code>', ok: (e) => isCmd(e, 'ping') && e.ok && e.info.host === 'jelly.fun' },
      { t: 'Stop it with <kbd>Ctrl</kbd>+<kbd>C</kbd>.', ok: (e) => e.type === 'ctrlc' && e.ping },
      { t: 'Ping the Moon: <code>ping moon.base</code>. Count the seconds! (Ctrl+C to stop.)', ok: (e) => isCmd(e, 'ping') && e.ok && e.info.host === 'moon.base' },
    ] },
  { id: 'https', word: 'https', name: 'The padlock', stands: 'HTTP + Secure', color: '#ffc61a', tool: 'term', home: 'https://jelly.fun', onlyHere: true, seq: true,
    title: 'Postcards and locked boxes', why: 'Plain http is like sending a postcard: everyone who carries it can read it. https puts your letter in a locked box that only the real website can open. The S stands for Secure, and the padlock in the address bar tells you it is on.',
    mnem: 'No S? Postcard. With S? Locked box.',
    points: ['The padlock means nobody can snoop on the way. It does not mean the site is nice!', 'Never type a password on a page that says "Not secure".', 'Most sites send http visitors straight round to the https door.'],
    steps: [
      { t: 'On jelly.fun, click the padlock next to the address.', ok: (e) => e.type === 'lock' && e.secure },
      { t: 'Visit an old site with no padlock: <code>old.jelly</code>. Click the warning.', ok: (e) => e.type === 'lock' && !e.secure && e.host === 'old.jelly' },
      { t: 'Watch the server send you round: <code>curl -I http://jelly.fun</code>', ok: (e) => isCmd(e, 'curl') && e.info.curl?.status === 301 },
    ] },
  { id: 'push', word: 'push', name: 'Go live!', stands: 'git push to GitHub Pages', color: '#3a5bff', tool: 'term', home: 'https://kid.github.io', onlyHere: true, seq: true,
    title: 'Put your page on the internet', why: 'Your site folder is already a git repository (remember Jelly Git?). It is called <b>kid.github.io</b>, and GitHub has a trick: a repository with that name becomes a real website. Every time you push, GitHub Pages puts the new version live.',
    mnem: 'add, commit, push: hello, world!',
    points: ['A repository named <code>yourname.github.io</code> becomes a website automatically. For other names, switch it on in Settings → Pages.', 'On real GitHub it can take a minute to appear.', 'Anyone in the world can visit. Never put secrets on your website.'],
    steps: [
      { t: 'Check your site: <code>cd ~/site</code>, then <code>git status</code>', ok: (e) => inRepo(e, 'kid.github.io') && e.info.sub === 'status' },
      { t: 'Stage and snap: <code>git add .</code> then <code>git commit -m "my website"</code>', ok: (e) => inRepo(e, 'kid.github.io') && !!e.info.commit },
      { t: 'Send it: <code>git push</code>', ok: (e) => inRepo(e, 'kid.github.io') && e.info.pushed === 'kid.github.io' },
      { t: 'Visit <code>kid.github.io</code>. You are on the internet!', ok: (e) => visited(e, 'kid.github.io') && e.status === 200 },
    ] },
  { id: 'quest', word: 'go!', name: 'Gerald\'s website', stands: 'Final mission', color: '#ff4d6d', project: 'gerald', onlyHere: true,
    title: 'Rescue Gerald\'s website', why: 'Gerald the Gerbil made a website, and it is a mess. His heading swallowed the whole page, his picture is broken and his link goes nowhere. Gerald gave you the keys to his repository. You know the magic words.',
    mnem: 'Fix it, check it, push it.',
    points: ['Look at the page, then at the HTML. What does not match?', 'Use <code>ls</code> in the terminal to check the real file names.', 'When it looks right: <code>cd ~/gerald</code>, then add, commit and push.'],
    steps: [
      { t: 'Put the lid back on Gerald\'s heading. The checker under the editor shows you where.', ok: (e) => edits(e, 'gerald/index.html') && geraldNow(e).lid },
      { t: 'Fix the broken picture.', ok: (e) => edits(e, 'gerald/index.html') && geraldNow(e).pic && e.doc.querySelector('img') },
      { t: 'Fix the link to the About page.', ok: (e) => edits(e, 'gerald/index.html') && geraldNow(e).link && e.doc.querySelector('a[href]') },
      { t: 'Push it, then check <code>gerald.github.io</code>.', ok: (e) => visited(e, 'gerald.github.io') && e.status === 200 && Object.values(geraldFixed(WEB.pages['gerald.github.io']?.['index.html'] ?? '', (h, pic) => { const k = (h ?? '').replace(/^\.\//, ''); return pic ? /^PNG:/.test(WEB.pages['gerald.github.io'][k] ?? '') : k in WEB.pages['gerald.github.io']; })).every(Boolean) },
    ] },
];
