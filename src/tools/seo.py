# What search engines, link previews and phones read: each page's title, description, preview card, course data
# (JSON-LD) and icons (rendered by tools/make-icons.mjs into src/icons; tools/landing.py copies them into the site).
# Also fills each guide's small-screen page (the gate) with the course's lessons and the problem each one solves.
# That page is what a phone sees, and search engines read pages as a phone does, so it is also what gets indexed.
# Run from src/ on a built guide, before it is wrapped as a full page: python3 tools/seo.py <folder> build/<name>.html
# tools/landing.py uses head() for the landing page.
import base64, html, json, re, sys
sys.path.insert(0, 'tools')
from curriculum import load, lessons

e = html.escape
SITE_NAME = 'Unix Jelly'
REPO = 'https://github.com/boxabirds/unixjelly'

def site():
    return json.load(open('curriculum.json'))['site']

# The tab icon (under 1 KB) goes in as data, so it works from a file and on claude.ai too. The home-screen icons and
# the preview picture are files on the site, fetched only when a phone or a link preview asks for them.
FAVICON = 'data:image/png;base64,' + base64.b64encode(open('icons/icon-32.png', 'rb').read()).decode()

# The <head> tags for one page. url is absolute, or None when curriculum.json has no site address yet.
def head(title, description, url, data):
    tags = [f'<meta name="description" content="{e(description)}">',
            f'<link rel="icon" type="image/png" sizes="32x32" href="{FAVICON}">',
            '<meta name="theme-color" content="#bfe6ff">',
            f'<meta property="og:type" content="website">',
            f'<meta property="og:site_name" content="{SITE_NAME}">',
            f'<meta property="og:title" content="{e(title)}">',
            f'<meta property="og:description" content="{e(description)}">',
            f'<meta name="twitter:card" content="{"summary_large_image" if site() else "summary"}">']
    if url: tags += [f'<link rel="canonical" href="{e(url)}">', f'<meta property="og:url" content="{e(url)}">']
    if site(): tags += [f'<link rel="icon" type="image/png" sizes="192x192" href="{site()}icons/icon-192.png">',
                        f'<link rel="apple-touch-icon" href="{site()}icons/icon-180.png">',
                        f'<meta property="og:image" content="{site()}icons/og.jpg">',
                        '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
                        '<meta property="og:image:alt" content="The Unix Jelly house: a computer cut open like a doll\'s house">']
    # </ can't appear inside a script element, so it is escaped in the JSON
    tags.append('<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + '</script>')
    return '\n'.join(tags)

def course_data(c, ls, by, url):
    return {
        '@context': 'https://schema.org', '@type': 'Course', 'name': c['title'], 'description': c['about'], **({'url': url} if url else {}),
        'provider': {'@type': 'Organization', 'name': SITE_NAME, 'sameAs': REPO},
        'inLanguage': 'en', 'isAccessibleForFree': True, 'educationalLevel': 'Beginner',
        'audience': {'@type': 'EducationalAudience', 'audienceType': 'Curious kids, about 9 to 14, and beginners of any age'},
        'coursePrerequisites': [by[n]['title'] for n in c['needs']] or 'None',
        'offers': {'@type': 'Offer', 'category': 'Free', 'price': 0, 'priceCurrency': 'USD'},
        'hasCourseInstance': {'@type': 'CourseInstance', 'courseMode': 'Online'},
        'syllabusSections': [{'@type': 'Syllabus', 'name': f'{L["word"]}: {L["title"]}', 'description': L['problem']} for L in ls],
    }

def guide(folder, path):
    courses = load(); by = {c['id']: c for c in courses}
    c = next(c for c in courses if c['folder'] == folder)
    ls = lessons()[c['id']]
    url = site() and site() + folder + '/'
    title = f'{c["title"]}: {c["tagline"]}'
    page = open(path).read()
    page = re.sub(r'<title>[^<]*</title>', lambda m: f'<title>{e(title)}</title>\n' + head(title, c['about'], url, course_data(c, ls, by, url)), page, count=1)
    page = re.sub(r'(<div class="gate-card">.*?<h1>)[^<]*(</h1>)', lambda m: m[1] + e(c['title']) + m[2], page, count=1, flags=re.S)
    page = page.replace('<!-- gate: about (tools/seo.py) -->', f'<p class="gate-tag">{e(c["blurb"])}</p>', 1)
    items = ''.join(f'<li><code>{e(L["word"])}</code><span>{e(L["problem"])}</span></li>' for L in ls)
    page = page.replace('<!-- gate: lessons (tools/seo.py) -->', f'<section class="gate-lessons" aria-labelledby="gateLessons"><h2 id="gateLessons">What you will learn: {len(ls)} lessons</h2><ol>{items}</ol></section>', 1)
    open(path, 'w').write(page)

if __name__ == '__main__':
    guide(sys.argv[1], sys.argv[2])
