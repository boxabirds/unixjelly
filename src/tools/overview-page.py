# A guide's Overview on a page of its own, for trying out changes without the rest of the guide.
# Run from src/: python3 tools/overview-page.py [shell|git|web|backstage] [out.html]   (default: shell, build/overview-<guide>.html)
# backstage is Jelly Shell's Backstage, which uses the same house as its Overview.
import sys
guide = sys.argv[1] if len(sys.argv) > 1 else 'shell'
font = {'shell': 'titan.json', 'git': 'titan.json', 'web': 'titan-web.json', 'backstage': 'titan.json'}[guide]
page = open('guides/shell/backstage-page.html' if guide == 'backstage' else 'guides/shell/overview-page.html').read()
page = page.replace('/*OVERVIEW*/', open('engine/overview-kit.js').read() + '\n' + open(f"guides/{'shell' if guide == 'backstage' else guide}/overview.js").read()).replace('/*FONT_JSON*/', open('fonts/' + font).read())
out = sys.argv[2] if len(sys.argv) > 2 else f'build/overview-{guide}.html'
open(out, 'w').write(page)
print('wrote', out)
