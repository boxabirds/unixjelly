# Writes the "under the hood" pages: the real guide engine with an explainer on top, so what you see is the code that
# runs in the guides. One so far: under-the-hood/reshuffle.html, how the jelly letters tidy themselves up
# (tools/under-the-hood/reshuffle.js, rules in docs/design/letter-reshuffle.md).
# Run from src/ after the guides are built (build.sh does it): python3 tools/under-the-hood.py
import json, os, sys
sys.path.insert(0, 'tools')
from seo import head, site, SITE_NAME, REPO

page = open('../jellyshell/index.html').read()
title = 'Under the hood: how the jelly letters tidy up'
description = 'Knock the jelly letters over and they hop home in order. See how, step by step, with the real jellies and the real code: waiting for calm, lanes, an invisible hand, and where it gets stuck.'
url = site() and site() + 'under-the-hood/reshuffle.html'
data = {'@context': 'https://schema.org', '@type': 'TechArticle', 'headline': title, 'description': description, **({'url': url} if url else {}),
        'publisher': {'@type': 'Organization', 'name': SITE_NAME, 'sameAs': REPO}, 'inLanguage': 'en'}
# Shell Jelly's own title, description, preview card and course data are one block: swap in this page's
start = page.index('<title>'); end = page.index('</script>', page.index('application/ld+json', start)) + len('</script>')
page = page[:start] + f'<title>{title}</title>\n' + head(title, description, url, data) + page[end:]
at = page.rindex('</script>')
# the way back to the landing page: next door on the site, or JELLY_HOME for copies hosted somewhere else (tools/curriculum.py)
page = page[:at] + open('tools/under-the-hood/reshuffle.js').read().replace('href="../"', f'href="{os.environ.get("JELLY_HOME", "../")}"') + page[at:]
os.makedirs('../under-the-hood', exist_ok=True)
open('../under-the-hood/reshuffle.html', 'w').write(page)
print('built under-the-hood/reshuffle.html')
