# Writes the landing page from landing.html, curriculum.json and problems.json: the everyday problems the courses fix,
# the courses in order as a grid, then every lesson with the problem it solves. Once curriculum.json has the site's
# address, also writes robots.txt and sitemap.xml beside the page.
# Usage (from src/): python3 tools/landing.py ../index.html
# With JELLY_LINKS set (see tools/curriculum.py), the cards link to copies hosted somewhere else.
import html, json, os, shutil, sys
sys.path.insert(0, 'tools')
from curriculum import load, lessons
from seo import head, site, SITE_NAME, REPO

courses = load()
by = {c['id']: c for c in courses}
learn = lessons()
e = html.escape
SITE = site()
href = lambda c: c['href'] if c['away'] else c['folder'] + '/'
link = lambda c: f' href="{e(href(c))}"' + (' target="_blank" rel="noopener"' if c['away'] else '')
shared = lambda c: sum(1 for o in courses if o['step'] == c['step']) > 1

def card(c):
    built = bool(c['href'])
    tag = 'a' if built else 'div'
    flag = 'Start here' if not c['needs'] else c.get('badge') or ('' if built else 'Coming later')
    after = f'After {" and ".join(by[n]["title"] for n in c["needs"])}' if c['needs'] else 'The first course'
    step = f'Step {c["step"]}' + (' · either order' if shared(c) else '')
    return f'''    <li><{tag} class="card{'' if built else ' later'}"{link(c) if built else ''} style="--bg:{c['colour']}">
      {f'<span class="start{"" if flag == "Start here" else " tag"}">{e(flag)}</span>' if flag else ''}
      <div class="card-top"><span class="step">{step}</span><span class="cmd">{e(c['cmd'])}</span></div>
      <h2>{e(c['title'])}</h2>
      <p>{e(c['blurb'])}</p>
      <div class="foot"><span class="after">{e(after)}</span>{f'<span class="chip" data-progress="{c["id"]}" hidden></span><span class="btn">{e(c["button"])}</span>' if built else ''}</div>
    </{tag}></li>'''

def fix(c):
    return f'      <li style="--bg:{c["colour"]}"><p>{e(c["pain"])}</p><a{link(c)}>{e(c["title"])} →</a></li>'

def course_lessons(c):
    items = '\n'.join(f'        <li><code>{e(L["word"])}</code><span>{e(L["problem"])}</span></li>' for L in learn[c['id']])
    return f'''    <section class="learn-course" style="--bg:{c['colour']}" aria-labelledby="learn-{c['id']}">
      <h3 id="learn-{c['id']}"><a{link(c)}>{e(c['title'])}</a></h3>
      <p class="learn-tag">{e(c['tagline'][:1].upper() + c['tagline'][1:])} · {len(learn[c['id']])} lessons</p>
      <ol>
{items}
      </ol>
    </section>'''

built = [c for c in courses if c['href']]
body = f'''<section class="fixes" aria-labelledby="fixesH">
    <h2 id="fixesH">Sound familiar?</h2>
    <ul class="fix-grid">
{chr(10).join(fix(c) for c in built if c.get('pain'))}
    </ul>
    <p class="why">Apps hide how computers really work. That's fine, until it isn't. These guides are one place for the basics nobody teaches you: the command line, files and permissions, saving your work with git, how the web works, and how attackers think. They come in order, and every idea is taught before it's used. Free and open source, and they run in your browser: no install, no account, and nothing on your real computer can break. Made for curious kids, about 9 to 14, and grown-ups who never got taught.</p>
  </section>

  <section class="courses" aria-labelledby="coursesH">
    <h2 id="coursesH" class="section-h">The courses, in order</h2>
    <ol class="path">
{chr(10).join(card(c) for c in courses)}
    </ol>
    <p class="why">New to the terminal? Follow the steps in order. Courses on the same step can be done in either order. Every course saves your progress in this browser, so you can stop and come back.</p>
  </section>

  <section class="learn" aria-labelledby="learnH">
    <h2 id="learnH" class="section-h">Every lesson solves a real problem</h2>
    <div class="learn-grid">
{chr(10).join(course_lessons(c) for c in built)}
    </div>
  </section>'''

title = f'{SITE_NAME}: the command line, git, the web and security, for curious kids'
description = 'Free, interactive guides to the computer basics nobody teaches: the command line, permissions, git, how the web works and security. In your browser.'
data = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': SITE_NAME, 'description': description,
        'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'url': (SITE + href(c)) if SITE and not c['away'] else href(c),
                             'item': {'@type': 'Course', 'name': c['title'], 'description': c['about'], 'provider': {'@type': 'Organization', 'name': SITE_NAME, 'sameAs': REPO}}}
                            for i, c in enumerate(built)]}
page = open('landing.html').read()
page = page.replace('<title>Jelly Unix</title>', f'<title>{e(title)}</title>\n' + head(title, description, SITE, data), 1)
page = page.replace('<!-- courses: written by tools/landing.py from curriculum.json -->', body, 1)
assert body in page and description in page, 'landing.html: a marker is missing'
for out in sys.argv[1:]:
    open(out, 'w').write(page)
    print('wrote', out)
    here = os.path.dirname(os.path.abspath(out))
    # the home-screen icons and the link-preview picture, which pages link to on the site
    shutil.copytree('icons', os.path.join(here, 'icons'), dirs_exist_ok=True)
    if SITE:
        urls = [SITE] + [SITE + c['folder'] + '/' for c in built if not c['away']]
        open(os.path.join(here, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{e(u)}</loc></url>\n' for u in urls) + '</urlset>\n')
        open(os.path.join(here, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n')
