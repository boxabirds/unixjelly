# Reads curriculum.json (the course map) for the build: checks it, works out each course's step, and decides where links go.
# Used by engine/courses-patch.py (the map inside every guide) and tools/landing.py (the landing page).
import json, os

def load():
    courses = json.load(open('curriculum.json'))['courses']
    ids = [c['id'] for c in courses]
    by = {c['id']: c for c in courses}
    assert len(set(ids)) == len(ids), 'curriculum.json: two courses share an id'
    stores = [c['store'] for c in courses if c['store']]
    assert len(set(stores)) == len(stores), 'curriculum.json: two courses share a store key'
    for c in courses:
        for n in c['needs']:
            assert n in by, f'curriculum.json: {c["id"]} needs {n}, which is not a course'
            assert ids.index(n) < ids.index(c['id']), f'curriculum.json: list {n} before {c["id"]}, which needs it'
        assert c['folder'] or not c['store'], f'curriculum.json: {c["id"]} has a store but no folder'
    # A course's step is one more than the step of the latest course it needs. Courses on the same step can be done in either order.
    for c in courses:
        c['step'] = 1 + max((by[n]['step'] for n in c['needs']), default=0)
    # Where each course lives. JELLY_LINKS (JSON: {"git": "https://…", …}) is for copies hosted somewhere else.
    links = json.loads(os.environ.get('JELLY_LINKS') or '{}')
    for c in courses:
        c['href'] = links.get(c['id']) or (f'../{c["folder"]}/' if c['folder'] else None)
        c['away'] = c['id'] in links
    return courses
