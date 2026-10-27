# Jelly Shell: the engine page, plus what only Jelly Shell has.
# The Overview is a computer cut open like a doll's house (overview.js), and Backstage is the same house up close.
s = open('build/jelly-shell.src.html').read()
V = 'guides/shell/'
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:90], s.count(a)); s = s.replace(a, b)
def region(start, end, new, keep_end=True):
    global s
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + (s[j:] if keep_end else s[j + len(end):])

exec(open('engine/use-overview.py').read())
rep("<p>Follow one command, <code>ls</code>, all the way down to the disk and back up. Press Next. Drag to spin it, scroll to zoom, double-click to straighten up.</p>",
    "<p>Follow one command, <code>ls</code>, from your fingers down to the disk and back. Press Next. Drag to turn the house, scroll to zoom, double-click to straighten up.</p>")
rep('aria-label="A 3D cartoon of a computer cut into layers: you and the terminal, the shell, the kernel, the hardware and the file tree."',
    'aria-label="A 3D cartoon house, cut open like a doll\'s house: you and the terminal at the top, Shelly the shell below, King Kernel on the ground floor, the disk in the cellar, and the file tree growing underground as roots. A little lift carries your command between the floors."')
# Backstage: the Overview's house up close (engine/use-backstage.py).
BS_HEAD = 'The same house, up close. Pick a command and follow it: Shelly snips it into words, the program comes out of the /bin cupboard, asks King Kernel, and carries the answer back up.'
BS_LABEL = 'The cut-open house from the Overview. The command you pick is typed at the top and rides the lift down to Shelly the shell, who splits it into the program and its arguments. The program steps out of the /bin cupboard as a character, asks King Kernel for permission, visits the file tree in the roots, and carries the answer back up to the screen.'
BS_PICK, BS_FIRST = 'a command', 'ls'
exec(open('engine/use-backstage.py').read())
open('build/jelly-shell1.src.html', 'w').write(s)
print('ok')
