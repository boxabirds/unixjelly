# The course map, from curriculum.json: which course comes before which.
# Every guide gets: a "Course map" in its side menu, a "Comes after" line on its welcome screen,
# and the next course to try on its final card and its "What I've learnt" page.
# Progress crosses courses through one storage key, 'jelly.courses', so the map can tick off other courses
# when the guides share a website (the repo). Hosted one per page, each guide only knows its own progress.
# Run by shelly-patch.py, after the other engine patches.
import json, sys
sys.path.insert(0, 'tools')
from curriculum import load
COURSES = [{k: c[k] for k in ('id', 'title', 'store', 'needs', 'step', 'href', 'away', 'folder')} for c in load()]

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
const nextCourseCard = () => { const nx = nextCourses(); return nx.length ? `<div class="un-label">Next course</div><div class="un-next">${nx.map(courseLink).join('')}</div>` : ''; };
function paintCourses(done, total) {
  const all = courseStore();
  all[COURSE.id] = { done, total };
  try { localStorage.setItem('jelly.courses', JSON.stringify(all)); } catch {}
  $('#courseList').innerHTML = COURSES.map((c) => {
    const p = all[c.id], here = c === COURSE, fin = finishedCourse(c.id, all);
    const note = here ? `you are here · ${done} / ${total}` : fin ? '✓ finished' : !c.folder ? 'coming later' : p?.done ? `${p.done} / ${p.total} jellies` : c.needs.length ? `after ${c.needs.map((n) => course(n).title).join(' and ')}` : 'the first course';
    return `<li class="co${here ? ' here' : ''}${fin ? ' fin' : ''}${c.folder ? '' : ' later'}"><span class="co-step">${c.step}</span><span class="co-name">${here ? esc(c.title) : courseLink(c)}<small>${esc(note)}</small></span></li>`;
  }).join('');
  const nx = nextCourses();
  $('#rcNext').innerHTML = nx.length ? `Next course: ${nx.map(courseLink).join(' or ')}` : 'That\\'s every course so far. More are on the way!';
}
$('#startBtn').insertAdjacentHTML('beforebegin', `<p class="needs">${COURSE.needs.length
  ? `Comes after ${COURSE.needs.map((n) => courseLink(course(n)) + (finishedCourse(n) ? ' ✓' : '')).join(' and ')}. The course map in the menu shows the order.`
  : 'The very first course. You don\\'t need any other course before this one.'}</p>`);

/* ---------------- panels + navigation ---------------- */''')
