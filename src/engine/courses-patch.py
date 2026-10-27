# The course map, from curriculum.json: which course comes before which.
# Every guide gets: a "Course map" in its side menu, a "Comes after" line on its welcome screen,
# and the next course to try on its final card and its "What I've learnt" page.
# Progress crosses courses through one storage key, 'jelly.courses', so the map can tick off other courses
# when the guides share a website (the repo). Hosted one per page, each guide only knows its own progress.
# Run by shelly-patch.py, after the other engine patches.
import json, sys
sys.path.insert(0, 'tools')
from curriculum import load, recaps
COURSES = [{k: c.get(k) for k in ('id', 'title', 'store', 'needs', 'step', 'href', 'away', 'folder', 'blurb')} for c in load()]

rep('    <nav class="nav" id="nav"></nav>', '''    <details class="courses" id="courses"><summary>Course map</summary><ol class="co-list" id="courseList"></ol></details>
    <nav class="nav" id="nav"></nav>''')
rep('<p id="rcCount"></p>', '<p id="rcCount"></p><p class="rc-next" id="rcNext"></p>')
rep('.side-foot{display:grid;gap:8px}', '''.side-foot{display:grid;gap:8px}
/* the course map in the side menu */
.courses{padding:0 6px;font-size:.85rem}
.courses summary{cursor:pointer;font-weight:700;color:var(--lemon);width:max-content}
.co-list{list-style:none;margin:8px 0 2px;padding:0;display:grid;gap:6px}
.co{display:flex;gap:8px;align-items:flex-start}
.co-step{flex:none;width:1.6em;height:1.6em;border-radius:50%;display:grid;place-items:center;background:#ffffff26;font-family:var(--display);font-size:.78rem}
.co.here .co-step{background:var(--lemon);color:var(--ink)}
.co.fin .co-step{background:var(--lime);color:var(--ink)}
.co.later{opacity:.6}
.co-name{display:grid;line-height:1.25}
.co-name a{color:#fff}
.co.here .co-name{font-weight:700}
.co-name small{color:#ffffffa8;font-size:.76rem}
.hero-side .needs{font-size:.88em}
.needs a,.rc-next a{color:var(--blue);font-weight:700}
.un-next{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.co{align-items:center}
.co-name{flex:1;min-width:0}
.co-info{flex:none;width:1.5em;height:1.5em;border-radius:50%;border:2px solid #ffffff80;background:none;color:#fff;font-family:var(--display);font-size:.78rem;line-height:1;padding:0}
.co-info:hover{background:#ffffff26}
.co-pop{position:fixed;inset:0;z-index:65;display:grid;place-items:center;background:#24133b80;padding:16px}
.co-card{position:relative;background:var(--card);color:var(--ink);border:4px solid var(--ink);border-radius:22px;box-shadow:0 6px 0 var(--ink);width:min(560px,100%);max-height:86vh;overflow:auto;padding:20px 22px;display:grid;gap:10px}
.co-card h3{font-family:var(--display);font-weight:400;font-size:1.7rem;margin:0}
.co-k{font-family:var(--mono);font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}
.co-line{margin:0;font-weight:600}
.co-words{list-style:none;margin:0;padding:0;display:grid;gap:7px}
.co-words li{display:grid;grid-template-columns:minmax(0,11em) minmax(0,1fr);gap:10px;align-items:baseline;font-size:.92rem}
.co-words code{justify-self:start;white-space:normal;overflow-wrap:anywhere}
.co-x{position:absolute;top:10px;right:12px;border:0;background:none;font-size:1.6rem;line-height:1;color:var(--ink)}
.co-go a{color:var(--blue);font-weight:700}
.un-next a{font-family:var(--display);font-size:1.1rem;color:var(--ink);text-decoration:none;background:var(--lemon);border:3px solid var(--ink);border-radius:14px;padding:6px 14px;box-shadow:0 4px 0 var(--ink)}''')
rep("  $('#jarCount').textContent = `${n} / ${ALL.length} jellies`;", "  $('#jarCount').textContent = `${n} / ${ALL.length} jellies`; paintCourses(n, ALL.length);")
rep('<div class="un-name">${esc(RECAP.wizardText)}</div>', '<div class="un-name">${esc(RECAP.wizardText)}</div>${nextCourseCard()}')
rep('/* ---------------- panels + navigation ---------------- */', '''/* ---------------- the course map (src/curriculum.json) ---------------- */
const COURSES = ''' + json.dumps(COURSES, ensure_ascii=False) + ''', COURSE = COURSES.find((c) => c.store === KEY);
const course = (id) => COURSES.find((c) => c.id === id);
const courseStore = () => { try { return JSON.parse(localStorage.getItem('jelly.courses')) || {}; } catch { return {}; } };
const finishedCourse = (id, all = courseStore()) => !!all[id] && all[id].done >= all[id].total;
const courseLink = (c) => c.href ? `<a href="${c.href}"${c.away ? ' target="_blank" rel="noopener"' : ''}>${esc(c.title)}</a>` : esc(c.title);
// Every course this one rests on, all the way down.
const before = (c) => c.needs.flatMap((n) => [n, ...before(course(n))]);
// What to try after this course: built courses not finished yet whose needs are met. Finishing this course means its own needs were met too.
function nextCourses() {
  const all = courseStore(), met = new Set([COURSE.id, ...before(COURSE)]);
  return COURSES.filter((c) => c !== COURSE && c.folder && !finishedCourse(c.id, all) && c.needs.every((n) => met.has(n) || finishedCourse(n, all))).slice(0, 2);
}
// "What's in it?": a card for any course on the map, with its summary and every word it teaches.
const RECAPS = ''' + json.dumps(recaps(), ensure_ascii=False) + ''';
function courseCard(id) {
  const c = course(id), r = RECAPS[id], here = c === COURSE, all = courseStore();
  const status = here ? 'You are here' : finishedCourse(id, all) ? 'Finished ✓' : !c.folder ? 'Coming later' : c.needs.length ? `Comes after ${c.needs.map((n) => course(n).title).join(' and ')}` : 'The first course';
  $('#coPop').innerHTML = `<div class="co-card" role="document"><button class="co-x" aria-label="Close">×</button>
    <div class="co-k">Step ${c.step} · ${esc(status)}</div><h3 id="coPopTitle">${esc(c.title)}</h3>
    <p class="co-line">${esc(r?.line ?? c.blurb ?? '')}</p>
    ${r ? `<ul class="co-words">${r.words.map(([ex, does]) => `<li><code>${esc(ex)}</code><span>${esc(does)}</span></li>`).join('')}</ul>` : ''}
    <div class="co-go">${here ? '' : c.folder ? `Open ${courseLink(c)}` : ''}</div></div>`;
  $('#coPop').hidden = false; $('#coPop .co-x').focus();
}
const nextCourseCard = () => { const nx = nextCourses(); return nx.length ? `<div class="un-label">Next course</div><div class="un-next">${nx.map(courseLink).join('')}</div>` : ''; };
function paintCourses(done, total) {
  const all = courseStore();
  all[COURSE.id] = { done, total };
  try { localStorage.setItem('jelly.courses', JSON.stringify(all)); } catch {}
  $('#courseList').innerHTML = COURSES.map((c) => {
    const p = all[c.id], here = c === COURSE, fin = finishedCourse(c.id, all);
    const note = here ? `you are here · ${done} / ${total}` : fin ? '✓ finished' : !c.folder ? 'coming later' : p?.done ? `${p.done} / ${p.total} jellies` : c.needs.length ? `after ${c.needs.map((n) => course(n).title).join(' and ')}` : 'the first course';
    return `<li class="co${here ? ' here' : ''}${fin ? ' fin' : ''}${c.folder ? '' : ' later'}"><span class="co-step">${c.step}</span><span class="co-name">${here ? esc(c.title) : courseLink(c)}<small>${esc(note)}</small></span><button class="co-info" data-co="${c.id}" aria-label="What's in ${esc(c.title)}?">?</button></li>`;
  }).join('');
  const nx = nextCourses();
  $('#rcNext').innerHTML = nx.length ? `Next course: ${nx.map(courseLink).join(' or ')}` : 'That\\'s every course so far. More are on the way!';
}
document.body.insertAdjacentHTML('beforeend', '<div class="co-pop" id="coPop" role="dialog" aria-modal="true" aria-labelledby="coPopTitle" hidden></div>');
$('#courseList').addEventListener('click', (e) => { const b = e.target.closest('.co-info'); if (b) courseCard(b.dataset.co); });
$('#coPop').addEventListener('click', (e) => { if (e.target === e.currentTarget || e.target.closest('.co-x')) $('#coPop').hidden = true; });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#coPop').hidden) { e.stopImmediatePropagation(); $('#coPop').hidden = true; } }, true);
$('#startBtn').insertAdjacentHTML('beforebegin', `<p class="needs">${COURSE.needs.length
  ? `Comes after ${COURSE.needs.map((n) => courseLink(course(n)) + (finishedCourse(n) ? ' ✓' : '')).join(' and ')}. The course map in the menu shows the order.`
  : 'The very first course. You don\\'t need any other course before this one.'}</p>`);

/* ---------------- panels + navigation ---------------- */''')
