# Reads curriculum.json (the course map) for the build: checks it, works out each course's step, and decides where links go.
# Used by engine/courses-patch.py (the map inside every guide), tools/landing.py (the landing page) and tools/seo.py.
import json, os, subprocess

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

# What each built course teaches, for the course map's "what's in it?" cards: its one-line summary, and every word
# from its "What I've learnt" page as [example, what it does]. Read from the course's own recap data (src/<recap>).
def recaps():
    out = {}
    for c in load():
        if not c.get('recap'): continue
        src = open(c['recap']).read()
        i = src.index('/* recap data */'); j = src.index('/* end recap data */', i)
        r = json.loads(subprocess.run(['node', '-e', "const s = require('fs').readFileSync(0, 'utf8'); console.log(JSON.stringify(new Function(s + '; return RECAP')()))"],
                                      input=src[i:j], capture_output=True, text=True, check=True).stdout)
        out[c['id']] = {'line': r['line'], 'words': [[w['ex'], w['does']] for w in r['words'].values()]}
    return out

# Every built course's lessons, in order, each with the problem it solves (from problems.json), for the landing page
# and search engines. Fails the build if a lesson has no problem line, or a line names a lesson that doesn't exist.
def lessons():
    problems = json.load(open('problems.json'))
    out = {}
    for c in load():
        if not c.get('lessons'): continue
        ls = json.loads(subprocess.run(['node', 'tools/lessons.cjs', c['lessons']], capture_output=True, text=True, check=True).stdout)
        lines = problems.get(c['id'], {})
        missing, extra = [L['id'] for L in ls if L['id'] not in lines], [i for i in lines if i not in {L['id'] for L in ls}]
        assert not missing and not extra, f'problems.json, {c["id"]}: no line for {missing}, no lesson for {extra}'
        out[c['id']] = [{**L, 'problem': lines[L['id']]} for L in ls]
    return out
