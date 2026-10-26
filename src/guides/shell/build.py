# Jelly Shell: the engine page, plus what only Jelly Shell has.
# The Overview is a computer cut open like a doll's house (overview.js). Git and Web still build their own tours on
# the engine's older Town, so the swap happens here rather than in the engine.
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
# Backstage's King Kernel matches the Overview's: a jelly gumdrop with a crown and a face, not a screen.
rep("""  king: `<svg viewBox="0 0 160 190"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="18" y="96" width="124" height="86" rx="14" fill="#e0233f"/><rect x="30" y="84" width="100" height="90" rx="12" fill="#ffc61a"/><rect x="38" y="30" width="84" height="62" rx="12" fill="#ffe27a"/><rect x="48" y="42" width="64" height="34" rx="8" fill="#1b0f2e"/><circle cx="66" cy="59" r="6" fill="#4dff8b"/><circle cx="94" cy="59" r="6" fill="#4dff8b"/><path d="M40 30 L46 4 L62 22 L80 0 L98 22 L114 4 L120 30 Z" fill="#ffb000"/><circle cx="80" cy="128" r="12" fill="#fff"/></g></svg>`,""", """  king: `<svg viewBox="0 0 160 190"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M14 184 Q16 110 44 92 L116 92 Q144 110 146 184 Z" fill="#e0233f"/><path d="M26 184 Q22 118 44 84 Q62 56 80 56 Q98 56 116 84 Q138 118 134 184 Z" fill="#ffc61a"/><ellipse cx="54" cy="104" rx="7" ry="15" fill="#fff" fill-opacity=".55" stroke="none"/><circle cx="64" cy="112" r="12" fill="#fff"/><circle cx="96" cy="112" r="12" fill="#fff"/><circle cx="66" cy="114" r="5" fill="${INK}" stroke="none"/><circle cx="98" cy="114" r="5" fill="${INK}" stroke="none"/><path d="M80 134 Q68 128 54 140 M80 134 Q92 128 106 140" fill="none" stroke="#8a5a33" stroke-width="8"/><path d="M52 60 L56 26 L69 44 L80 20 L91 44 L104 26 L108 60 Z" fill="#ffb000"/><circle cx="80" cy="50" r="5" fill="#3a5bff"/></g></svg>`,""")
open('build/jelly-shell1.src.html', 'w').write(s)
print('ok')
