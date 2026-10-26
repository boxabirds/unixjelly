# Writes the landing page from landing.html and curriculum.json: one row per step, the courses on that step side by side.
# Usage (from src/): python3 tools/landing.py ../index.html
# With JELLY_LINKS set (see tools/curriculum.py), the cards link to copies hosted somewhere else.
import html, sys
sys.path.insert(0, 'tools')
from curriculum import load

courses = load()
by = {c['id']: c for c in courses}
e = html.escape

def card(c):
    built = bool(c['href'])
    tag = 'a' if built else 'div'
    link = (f' href="{e(c["href"] if c["away"] else c["folder"] + "/")}"' + (' target="_blank" rel="noopener"' if c['away'] else '')) if built else ''
    flag = 'Start here' if not c['needs'] else c.get('badge') or ('' if built else 'Coming later')
    after = f'After {" and ".join(by[n]["title"] for n in c["needs"])}' if c['needs'] else 'The first course'
    return f'''      <{tag} class="card{'' if built else ' later'}"{link} style="--bg:{c['colour']}" aria-label="Step {c['step']}: {e(c['title'])}">
        {f'<span class="start{"" if flag == "Start here" else " tag"}">{e(flag)}</span>' if flag else ''}
        <div class="cmd">{e(c['cmd'])}</div>
        <h2>{e(c['title'])}</h2>
        <p>{e(c['blurb'])}</p>
        <div class="foot"><span class="after">{e(after)}</span>{f'<span class="chip" data-progress="{c["id"]}" hidden></span><span class="btn">{e(c["button"])}</span>' if built else ''}</div>
      </{tag}>'''

steps = sorted({c['step'] for c in courses})
rows = []
for n in steps:
    here = [c for c in courses if c['step'] == n]
    label = f'Step {n}' + (' · do these in either order' if len(here) > 1 else '')
    rows.append(f'''    <li class="stage"><div class="stage-n">{label}</div><div class="stage-cards">
{chr(10).join(card(c) for c in here)}
    </div></li>''')
page = open('landing.html').read().replace('<!-- courses: written by tools/landing.py from curriculum.json -->', f'''<ol class="path">
{chr(10).join(rows)}
  </ol>
  <p class="why">New to the terminal? Follow the steps from the top. Courses on the same step can be done in either order. Every course saves your progress in this browser, so you can stop and come back.</p>''')
for out in sys.argv[1:]:
    open(out, 'w').write(page)
    print('wrote', out)
