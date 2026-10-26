# Writes "v<VERSION> · <fingerprint>" into a landing page, so you can tell at a glance which build you are looking at.
# The fingerprint is the start of a SHA-256 of all five built guides: change anything in any guide and it changes.
# Usage (from src/): python3 tools/stamp-version.py ../index.html [another landing page…]
import hashlib, re, sys
GUIDES = ['jellyshell', 'jellyshell2', 'jellygit', 'jellyweb', 'jellysecurity']
digest = hashlib.sha256()
for g in GUIDES:
    digest.update(open(f'../{g}/index.html', 'rb').read())
label = f"v{open('VERSION').read().strip()} · {digest.hexdigest()[:7]}"
for page in sys.argv[1:]:
    s = open(page).read()
    s, n = re.subn(r'(<p class="version"[^>]*>)[^<]*(</p>)', lambda m: m.group(1) + label + m.group(2), s)
    if n != 1: sys.exit(f'{page}: expected one <p class="version"> to stamp, found {n}')
    open(page, 'w').write(s)
print('stamped', label)
