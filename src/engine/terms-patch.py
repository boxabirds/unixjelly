# The bubble, and words from earlier courses (docs/pedagogy.md, rule 16): lesson text marks them <span class="known">program</span>.
# They get a dotted underline. Hovering or tapping one opens a bubble: what it means, an example, and a link to the
# lesson that taught it. The words come from src/terms.json, so every guide explains a term the same way.
# Run by shelly-patch.py, after courses-patch.py (it uses course()).
TERMS = json.load(open('terms.json'))
TERMS.pop('_about')

rep("</style>", """/* a word from an earlier course, and its bubble */
.known{text-decoration:underline dotted 2px;text-underline-offset:.22em;cursor:help;border-radius:4px}
.known:hover,.known:focus-visible,.known[aria-expanded=true]{background:#ffe58a80;outline:0}
.kn-pop{position:fixed;z-index:70;width:min(320px,calc(100vw - 32px));background:var(--card);color:var(--ink);border:3px solid var(--ink);border-radius:16px;box-shadow:0 4px 0 var(--ink);padding:10px 14px 12px;display:grid;gap:6px;font-size:.95rem;line-height:1.4;opacity:0;transform:translateY(4px);transition:opacity .2s,transform .2s;pointer-events:none}
.kn-pop.on{opacity:1;transform:none;pointer-events:auto}
.kn-pop b{font-family:var(--display);font-weight:400;font-size:1.15rem}
.kn-pop p{margin:0}
.kn-pop .kn-ex{font-family:var(--mono);font-size:.85rem;background:#fffbea;border-radius:8px;padding:4px 8px;overflow-wrap:anywhere}
.kn-pop a{color:var(--blue);font-weight:700;font-size:.88rem}
</style>""")

rep('/* ---------------- panels + navigation ---------------- */', '''/* ---------------- words from earlier courses (src/terms.json) ---------------- */
const TERMS = ''' + json.dumps(TERMS, ensure_ascii=False) + ''';
// One bubble for every small explanation: a word from an earlier course, the mission's hint. BUBBLES says, for each kind
// of thing that has one, what it says (html) and anything else to do when it opens (onOpen), like making something glow.
const BUBBLES = [];
const bubble = (() => {
  const OPEN_MS = 200, CLOSE_MS = 250, GAP = 8, EDGE = 16; // hover waits a moment, so the bubble doesn't flicker
  const pop = document.createElement('div'); pop.className = 'kn-pop'; pop.id = 'knPop'; pop.setAttribute('role', 'tooltip');
  document.body.append(pop);
  let word = null, pinned = false, timer;
  const kindOf = (el) => el && BUBBLES.find((b) => el.matches(b.sel));
  const owner = (t) => { for (const b of BUBBLES) { const el = t.closest?.(b.sel); if (el) return el; } return null; };
  function place() {
    const r = word.getBoundingClientRect(), h = pop.offsetHeight, w = pop.offsetWidth;
    const below = r.bottom + GAP + h <= innerHeight - EDGE;
    pop.style.top = `${below ? r.bottom + GAP : Math.max(EDGE, r.top - GAP - h)}px`;
    pop.style.left = `${Math.min(Math.max(EDGE, r.left + r.width / 2 - w / 2), innerWidth - EDGE - w)}px`;
  }
  function open(el, pin) {
    const k = kindOf(el), html = k?.html(el); if (!html) return;
    clearTimeout(timer);
    if (word && word !== el) word.setAttribute('aria-expanded', 'false');
    word = el; pinned = pin; el.setAttribute('aria-expanded', 'true');
    pop.innerHTML = html; place(); pop.classList.add('on'); k.onOpen?.(el);
  }
  function close() { clearTimeout(timer); pop.classList.remove('on'); word?.setAttribute('aria-expanded', 'false'); word = null; pinned = false; }
  const later = (f, ms) => { clearTimeout(timer); timer = setTimeout(f, ms); };
  addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = owner(e.target);
    if (el) { if (el !== word) later(() => open(el, false), OPEN_MS); else clearTimeout(timer); }
    else if (e.target.closest?.('.kn-pop')) clearTimeout(timer);
    else if (word && !pinned) later(close, CLOSE_MS);
    else if (!word) clearTimeout(timer);
  });
  addEventListener('click', (e) => {
    const el = owner(e.target);
    if (el) { e.preventDefault(); if (el === word && pinned) close(); else open(el, true); }
    else if (word && !e.target.closest('.kn-pop')) close();
  });
  addEventListener('focusin', (e) => { const el = owner(e.target); if (el && el !== word && e.target.matches(':focus-visible')) open(el, false); });
  addEventListener('keydown', (e) => {
    if (!word) return;
    const el = owner(e.target);
    if (e.key === 'Escape') { e.stopImmediatePropagation(); close(); }
    else if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopImmediatePropagation(); open(el, true); }
  }, true);
  addEventListener('scroll', () => word && close(), true);
  addEventListener('resize', () => word && close());
  return { open, close };
})();
// Words from earlier courses: the bubble says what the word means, with an example and the lesson that taught it.
BUBBLES.push({ sel: '.known', html: (el) => {
  const t = TERMS[(el.dataset.term || el.textContent).trim().toLowerCase()]; if (!t) return '';
  const c = course(t.course), link = c?.href && c !== COURSE
    ? `<a href="${c.href}#${t.lesson}" target="_blank" rel="noopener">Learnt in ${esc(c.title)}: ${esc(t.name)} →</a>` : '';
  return `<b>${esc(el.textContent.trim())}</b><p>${esc(t.says)}</p><div class="kn-ex">${esc(t.ex)}</div>${link}`;
} });
// every marked word can be reached with Tab, and says it has a bubble
new MutationObserver(() => document.querySelectorAll('.known:not([tabindex])').forEach((el) => {
  el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-expanded', 'false'); el.setAttribute('aria-describedby', 'knPop');
})).observe(document.body, { childList: true, subtree: true });

/* ---------------- panels + navigation ---------------- */''')
