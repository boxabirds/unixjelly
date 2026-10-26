/* ---------------- jellysh: a small Unix shell, made for teaching ---------------- */
// Self-contained: no page, no lessons, no storage. Give it a file tree and it runs command lines the way
// bash would, with kinder messages. A guide adds its own commands with define() and its teaching voice
// (Shelly) with hooks. Runs in a browser or in Node. API and the differences from bash: src/shell/README.md.
const JellySh = (() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const pathOf = (n) => { const parts = []; for (let x = n; x && x.parent; x = x.parent) parts.unshift(x.name); return '/' + parts.join('/'); };
  const splitPath = (path) => { const i = path.replace(/\/+$/, '').lastIndexOf('/'); return i < 0 ? ['.', path] : [path.slice(0, i) || '/', path.slice(i + 1)]; };
  const sortKids = (d) => d.children.sort((a, b) => a.name.localeCompare(b.name));
  const within = (n, anc) => { for (let x = n; x; x = x.parent) if (x === anc) return true; return false; };
  const fixParents = (n) => { n.children?.forEach((c) => { c.parent = n; fixParents(c); }); return n; };
  const SHIFT = { owner: 6, group: 3, others: 0 };
  const triplet = (m, s) => ['r', 'w', 'x'].map((c, i) => (m >> s) & (4 >> i) ? c : '-').join('');
  // Words a program prints count as its output (they can go down a pipe or into a file). Errors, tips and Shelly's notes don't.
  const isOutput = (o) => !o.c && (o.h === undefined || o.t !== '');
  class SyntaxErr extends Error {}

  // Split a line into words and operators. Quotes keep words together; a backslash keeps one character as it is.
  // Each word remembers which parts were quoted, because quoted parts are never treated as wildcards.
  function lex(line) {
    const toks = []; let w = null, i = 0;
    const push = () => { if (w) toks.push(w); w = null; };
    const seg = (text, q) => { (w ??= { segs: [] }).segs.push({ text, q }); };
    while (i < line.length) {
      const ch = line[i], two = line.slice(i, i + 2);
      if (/\s/.test(ch)) { push(); i++; continue; }
      if (ch === '#' && !w) break; // a comment runs to the end of the line
      if (['&&', '||', '>>'].includes(two)) { push(); toks.push({ op: two }); i += 2; continue; }
      if ('|;<>&'.includes(ch)) { push(); toks.push({ op: ch }); i++; continue; }
      if (ch === "'") {
        const j = line.indexOf("'", i + 1);
        if (j < 0) throw new SyntaxErr("unexpected end of line while looking for the matching '");
        seg(line.slice(i + 1, j), 's'); i = j + 1; continue;
      }
      if (ch === '"') {
        // inside double quotes $ still works, but an escaped character (\$, \") is kept exactly as it is
        let j = i + 1, t = '';
        while (j < line.length && line[j] !== '"') {
          if (line[j] === '\\' && '"\\$`'.includes(line[j + 1] ?? '')) { if (t) seg(t, 'd'); t = ''; seg(line[j + 1], 's'); j += 2; } else t += line[j++];
        }
        if (j >= line.length) throw new SyntaxErr('unexpected end of line while looking for the matching "');
        seg(t, 'd'); i = j + 1; continue;
      }
      if (ch === '\\') { seg(line[i + 1] ?? '', 's'); i += 2; continue; }
      let j = i; while (j < line.length && !/[\s'"\\|;<>&]/.test(line[j])) j++;
      seg(line.slice(i, j), 'n'); i = j;
    }
    push();
    return toks;
  }
  // Commands joined by ; && || , each one a pipeline of simple commands joined by |.
  function parse(toks) {
    const list = [], bad = (t) => { throw new SyntaxErr(`syntax error near unexpected token '${t}'`); };
    let pipe = [], cmd = { words: [], redirs: [] }, join = null;
    const endCmd = (op) => { if (!cmd.words.length && !cmd.redirs.length) bad(op); pipe.push(cmd); cmd = { words: [], redirs: [] }; };
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      if (!t.op) { cmd.words.push(t); continue; }
      if (t.op === '>' || t.op === '>>' || t.op === '<') { const to = toks[k + 1]; if (!to || to.op) bad(to?.op ?? 'newline'); cmd.redirs.push({ op: t.op, word: to }); k++; continue; }
      if (t.op === '&') throw new SyntaxErr('& (running in the background) is not something this shell can do');
      if (t.op === '|') { endCmd('|'); continue; }
      endCmd(t.op); list.push({ pipe, join }); pipe = []; join = t.op;
    }
    if (cmd.words.length || cmd.redirs.length) pipe.push(cmd);
    else if (pipe.length || (join && join !== ';')) bad(join && !pipe.length ? join : '|');
    if (pipe.length) list.push({ pipe, join });
    return list;
  }

  function create(opts = {}) {
    const o = {
      home: '/home/kid', user: 'kid', host: 'jelly', path: '/bin:~/bin', manual: {}, users: null, gids: {}, builtins: ['cd', 'exit', 'help', 'history', 'export', 'unset'],
      newId: (() => { let k = 0; return () => 'j' + k++; })(), hooks: {},
    };
    const sh = { root: null, home: null, cwd: null, user: 'kid', hist: [], hi: 0, catMode: false, userDirs: new Set(), showHidden: false, vars: {}, status: 0, su: [], sudoAsked: false, depth: 0, args: [] };
    const commands = new Map();
    const hook = (name, ...a) => o.hooks[name]?.(...a);
    // A tip is the shell's kind explanation after a real error. A guide can reword any tip (or hide it) with the tip hook.
    const tip = (key, text) => (o.hooks.tip ? o.hooks.tip(key, text) : text);

    /* the file tree */
    function find(path, from = sh.cwd) {
      if (path === undefined) return from;
      let n = path.startsWith('/') ? sh.root : path.startsWith('~') ? sh.home : from;
      const rest = path.startsWith('~') ? path.slice(1) : path;
      for (const part of rest.split('/')) {
        if (!part || part === '.') continue;
        if (part === '..') { n = n.parent || n; continue; }
        if (n.type !== 'dir') return null;
        n = n.children.find((c) => c.name === part);
        if (!n) return null;
      }
      return n;
    }
    const pretty = (n) => { const p = pathOf(n), h = pathOf(sh.home); return p === h ? '~' : p.startsWith(h + '/') ? '~' + p.slice(h.length) : p; };
    const clone = (n, parent) => ({ ...n, id: o.newId(), parent, children: n.children ? n.children.map((c) => clone(c, null)) : null });
    const node = (name, type, parent, content = '') => {
      const n = { id: o.newId(), name, type, content: type === 'dir' ? '' : content, children: type === 'dir' ? [] : null, parent };
      parent.children.push(n); sortKids(parent); return n;
    };
    const allNodes = (n = sh.root, out = []) => { out.push(n); n.children?.forEach((c) => allNodes(c, out)); return out; };

    /* people, groups and locks: only when the guide gives the shell some users */
    const own = (n) => n.owner ?? (o.users ? 'root' : sh.user), grp = (n) => n.group ?? (o.users ? 'root' : sh.user);
    const modeOf = (n) => n.mode ?? (n.type === 'dir' ? 0o755 : 0o644);
    const groupsOf = (u) => o.users?.[u]?.groups ?? [u];
    const keySet = (n, u = sh.user) => own(n) === u ? 'owner' : groupsOf(u).includes(grp(n)) ? 'group' : 'others';
    const can = (n, bit, u = sh.user) => !o.users || u === 'root' || !!((modeOf(n) >> SHIFT[keySet(n, u)]) & bit);
    const modeStr = (n) => {
      const m = modeOf(n), s = (n.type === 'dir' ? 'd' : '-') + [6, 3, 0].map((k) => triplet(m, k)).join('');
      return m & 0o1000 ? s.slice(0, -1) + (m & 1 ? 't' : 'T') : s;
    };
    // Anything made by a command belongs to whoever made it, in their own group.
    function claimNew(n = sh.root) {
      if (!o.users || !n) return;
      if (!n.owner) { n.owner = sh.user; n.group = groupsOf(sh.user)[0]; }
      n.children?.forEach((c) => claimNew(c));
    }
    const unclaim = (n) => { delete n.owner; delete n.group; n.children?.forEach(unclaim); return n; };

    /* finding programs */
    const pathDirs = () => (sh.vars.PATH ?? '').split(':').filter(Boolean).map((d) => d.replace(/^~/, pathOf(sh.home)));
    function locate(cmd) {
      if (cmd.includes('/')) return find(cmd);
      for (const d of pathDirs()) { const n = find(`${d}/${cmd}`); if (n?.type === 'file') return n; }
      return null;
    }
    const isMachineCode = (n) => /^[01]{8} /.test(n.content);

    /* expanding words: $variables, then wildcards */
    function expandVars(text) {
      return text.replace(/\$(\?|#|[0-9]|[A-Za-z_]\w*|\{[A-Za-z_]\w*\})/g, (_, v) => {
        v = v.replace(/^\{|\}$/g, '');
        if (v === '?') return String(sh.status);
        if (v === '#') return String(sh.args.length);
        if (/^\d$/.test(v)) return v === '0' ? (sh.script ?? 'jellysh') : sh.args[v - 1] ?? '';
        return sh.vars[v] ?? '';
      });
    }
    const globChars = /[*?[]/;
    // One word can become many: a wildcard matches file names, like bash. Quoted wildcards stay plain characters.
    function expandWord(word) {
      let literal = '', pattern = '', wild = false;
      for (const s of word.segs) {
        const t = s.q === 's' ? s.text : expandVars(s.text);
        literal += t;
        if (s.q === 'n' && globChars.test(t)) { wild = true; pattern += t; } else pattern += t.replace(/[*?[\]\\]/g, '\\$&');
      }
      if (!wild) return [literal];
      const hits = glob(pattern);
      return hits.length ? hits : [literal]; // no match: bash passes the word on as typed
    }
    function globToRe(seg) {
      let re = '';
      for (let i = 0; i < seg.length; i++) {
        const ch = seg[i];
        if (ch === '\\') { re += (seg[++i] ?? '').replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'); continue; }
        if (ch === '*') re += '[^/]*';
        else if (ch === '?') re += '[^/]';
        else if (ch === '[') {
          const j = seg.indexOf(']', i + 2);
          if (j < 0) { re += '\\['; continue; }
          re += '[' + seg.slice(i + 1, j).replace(/^!/, '^').replace(/\\/g, '\\\\') + ']'; i = j;
        } else re += ch.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
      }
      return new RegExp('^' + re + '$');
    }
    function glob(pattern) {
      const top = pattern.startsWith('/'), home = pattern.startsWith('~/') || pattern === '~';
      const segs = (home ? pattern.slice(2) : pattern).split('/').filter((s, k) => s || k === 0 && !top);
      let found = [{ n: top ? sh.root : home ? sh.home : sh.cwd, p: top ? '' : home ? '~' : null }];
      for (const seg of segs.filter(Boolean)) {
        const next = [];
        for (const f of found) {
          if (f.n.type !== 'dir') continue;
          const join = (name) => f.p === null ? name : `${f.p}/${name}`;
          if (!/(^|[^\\])[*?[]/.test(seg)) { if (seg === '.' || seg === '..') { next.push({ n: seg === '.' ? f.n : f.n.parent ?? f.n, p: join(seg) }); continue; } const lit = seg.replace(/\\(.)/g, '$1'), c = f.n.children.find((x) => x.name === lit); if (c) next.push({ n: c, p: join(lit) }); continue; }
          const re = globToRe(seg);
          f.n.children.filter((c) => re.test(c.name) && (!c.name.startsWith('.') || seg.startsWith('.'))).forEach((c) => next.push({ n: c, p: join(c.name) }));
        }
        found = next;
      }
      return found.map((f) => f.p).filter((p) => p !== null).sort();
    }

    /* running */
    function context(argv, stdin, line) {
      const out = [], info = {}, [cmd, ...args] = argv;
      const c = {
        cmd, args, toks: argv, line, stdin, out, info, status: 0, shell: api,
        flags: new Set(args.filter((a) => /^-[a-z]+$/i.test(a)).flatMap((a) => [...a.slice(1)])),
        rest: args.filter((a) => !/^-[a-z]+$/i.test(a)),
        say: (t, cls = '') => out.push({ t, c: cls }),
        note: (h) => out.push({ h, t: '' }),
        fail: (t, tipText, code = 1) => { c.status = code; if (t) out.push({ t, c: 'er' }); if (tipText) out.push({ t: tipText, c: 'tip' }); },
      };
      c.why = (p) => (hook('pathMiss', p, line) ?? []).forEach((h) => c.note(h));
      return c;
    }
    // Runs one command with its words already expanded. Programs on the PATH run too.
    function exec(argv, stdin, line, redirs = [], piped = false) {
      const c = context(argv, stdin, line);
      c.piped = piped || redirs.some((r) => r.op !== '<');
      if (c.cmd === undefined) return c;
      for (const r of redirs.filter((r) => r.op === '<')) {
        const n = find(r.path);
        if (!n || n.type === 'dir') { c.fail(`bash: ${r.path}: ${n ? 'Is a directory' : 'No such file or directory'}`); return c; }
        if (!can(n, 4)) { c.fail(`bash: ${r.path}: Permission denied`, hook('denied', c, { op: 'read', node: n, tip: `Reading ${n.name} needs its r key.` })); return c; }
        c.stdin = n.content;
      }
      if (c.args.includes('--help') && o.manual[c.cmd]) {
        c.info.helpFlag = true; const m = o.manual[c.cmd]; c.say(`Usage: ${m[1]}`); c.say(m[2], 'mute');
        return c;
      }
      hook('before', c);
      const fn = commands.get(c.cmd), prog = fn ? null : locate(c.cmd);
      if (fn) fn(c);
      else if (prog) runProgram(c, prog);
      else if (c.cmd.includes('/')) { c.fail(`bash: ${c.cmd}: No such file or directory`, null, 127); c.why(c.cmd); }
      else { c.status = 127; if (!hook('notFound', c)) c.fail(`${c.cmd}: command not found`, null, 127); }
      claimNew();
      hook('after', c);
      return c;
    }
    function runProgram(c, n) {
      if (n.type === 'dir') return c.fail(`bash: ${c.cmd}: Is a directory`, null, 126);
      if (!can(n, 1)) { c.info.denied = true; c.fail(`bash: ${c.cmd}: Permission denied`, null, 126); hook('denied', c, { op: 'exec', node: n }); return; }
      const name = n.name;
      if (isMachineCode(n)) { // a real program in /bin: run the command of the same name
        const fn = commands.get(name); if (!fn) return c.fail(`bash: ${c.cmd}: cannot execute binary file`, null, 126);
        const inner = context([name, ...c.args], c.stdin, c.line); fn(inner);
        c.out.push(...inner.out); Object.assign(c.info, inner.info, { ran: pathOf(n) }); c.status = inner.status; return;
      }
      if (!can(n, 4)) { c.info.denied = true; c.fail(`bash: ${c.cmd}: Permission denied`, tip('exec.read', 'This program is a script: the shell has to read it to run it, so you need the r key too.'), 126); return; }
      if (sh.depth > 3) return c.fail(`${c.cmd}: too many programs running programs`, tip('exec.loop', 'Your program keeps starting itself. Ctrl+C!'));
      c.info.ran = pathOf(n);
      // A script is a list of commands. The shell runs them one line at a time, with $1, $2… set to its words.
      const saved = { args: sh.args, script: sh.script };
      sh.depth++; sh.args = c.args; sh.script = c.cmd;
      try {
        for (const [k, raw] of n.content.split('\n').entries()) {
          const l = raw.trim(); if (!l || l.startsWith('#')) continue;
          const r = runLine(l);
          // inside a program only its own output shows; errors name the program and the line, as bash does
          c.out.push(...r.out.filter((x) => isOutput(x) || x.c === 'er').filter((x) => x.h === undefined || x.t).map((x) => x.c === 'er' ? { ...x, t: `${c.cmd}: line ${k + 1}: ${x.t}` } : x));
          c.status = r.status;
          // like bash, a script carries on after a failed line; the first unknown command gets explained
          if ((r.status === 127 || r.syntax) && !c.info.lineFailed) { c.info.lineFailed = k + 1; hook('scriptFailed', c, { line: l, number: k + 1, node: n }); }
        }
      } finally { sh.depth--; sh.args = saved.args; sh.script = saved.script; }
    }
    // Writes a command's output into a file for > and >>.
    function redirectOut(c, r) {
      const text = c.out.filter(isOutput).map((x) => x.t).join('\n');
      c.out.splice(0, c.out.length, ...c.out.filter((x) => !isOutput(x)));
      const existing = find(r.path), [dp, name] = splitPath(r.path), d = existing ? existing.parent : find(dp);
      c.info.wrote = { name: existing?.name ?? name, mode: r.op };
      if (existing?.type === 'dir') return c.fail(`bash: ${r.path}: Is a directory`);
      if (existing && !can(existing, 2)) { c.fail(`bash: ${r.path}: Permission denied`, hook('denied', c, { op: 'write', node: existing, tip: `Writing needs the w key, and your set of keys for ${existing.name} has none.` })); return; }
      if (!existing && (!d || d.type !== 'dir')) return c.fail(`bash: ${r.path}: No such file or directory`);
      if (!existing && !can(d, 2)) { c.fail(`bash: ${r.path}: Permission denied`, hook('denied', c, { op: 'create', node: d, tip: `Making a new file in ${pretty(d)} needs a w key for that folder.` })); return; }
      const f = existing ?? node(name, 'file', d);
      f.content = r.op === '>>' && f.content ? f.content + '\n' + text : text;
      claimNew();
      hook('afterWrite', c, f, r.op);
    }
    function runSimple(cmd, stdin, line, toPipe = false) {
      const words = cmd.words.slice(), assigns = [];
      while (words.length && words[0].segs[0]?.q === 'n' && /^[A-Za-z_]\w*=/.test(words[0].segs[0].text)) {
        const w = words.shift(), [first, ...more] = w.segs, eq = first.text.indexOf('=');
        assigns.push([first.text.slice(0, eq), expandWord({ segs: [{ text: first.text.slice(eq + 1), q: 'n' }, ...more] }).join(' ')]);
      }
      const argv = words.flatMap(expandWord), redirs = cmd.redirs.map((r) => ({ op: r.op, path: expandWord(r.word)[0] }));
      if (!argv.length) { assigns.forEach(([k, v]) => { sh.vars[k] = v; }); return context([], stdin, line); }
      const saved = assigns.map(([k]) => [k, sh.vars[k]]);
      assigns.forEach(([k, v]) => { sh.vars[k] = v; });
      const c = exec(argv, stdin, line, redirs, toPipe);
      saved.forEach(([k, v]) => { if (v === undefined) delete sh.vars[k]; else sh.vars[k] = v; });
      for (const r of redirs.filter((r) => r.op !== '<')) redirectOut(c, r);
      return c;
    }
    // Runs a whole line: pipelines joined by ; && ||. Returns what the guide needs to show and to check.
    function runLine(line) {
      let list;
      try { list = parse(lex(line)); } catch (e) {
        if (!(e instanceof SyntaxErr)) throw e;
        sh.status = 2;
        return { out: [{ t: `bash: ${e.message}`, c: 'er' }, ...[tip('syntax', /\|/.test(line) ? '| needs a command on both sides. Like: grep cookie kitchen.log | wc -l' : /[<>]\s*$/.test(line) ? '> needs a file name after it.' : null)].filter(Boolean).map((t) => ({ t, c: 'tip' }))], ok: false, status: 2, info: {}, cmd: undefined, args: [], toks: [], line, user: sh.user, syntax: true };
      }
      const shown = []; let last = null;
      for (const { pipe, join } of list) {
        if ((join === '&&' && sh.status !== 0) || (join === '||' && sh.status === 0)) continue;
        let stdin, c;
        for (const [k, cmd] of pipe.entries()) {
          c = runSimple(cmd, k ? stdin : undefined, line, k < pipe.length - 1);
          if (k < pipe.length - 1) { stdin = c.out.filter(isOutput).map((x) => x.t).join('\n'); shown.push(...c.out.filter((x) => !isOutput(x))); }
        }
        shown.push(...c.out);
        if (pipe.length > 1) c.info.pipe = pipe.map((p) => expandWord(p.words[0] ?? { segs: [] })[0]);
        sh.status = c.status;
        last = c;
      }
      return { out: shown, ok: sh.status === 0, status: sh.status, info: last?.info ?? {}, cmd: last?.cmd, args: last?.args ?? [], toks: last?.toks ?? [], line, user: sh.user };
    }

    /* reading text: from files, or from whatever comes down the pipe */
    function textIn(c, paths) {
      if (!paths.length) return c.stdin === undefined ? (c.fail(`${c.cmd}: which file?`, tip('text.which', `Give it a file, like: ${c.cmd} diary.txt. Or pipe something into it with |`), 2), null) : [{ label: '', text: c.stdin }];
      const got = [];
      for (const p of paths) {
        const n = find(p);
        if (!n) { c.fail(`${c.cmd}: ${p}: No such file or directory`, null, 2); c.why(p); continue; }
        if (n.type === 'dir') { c.fail(`${c.cmd}: ${p}: Is a directory`, null, 2); continue; }
        if (!can(n, 4)) { c.info.denied = true; c.fail(`${c.cmd}: ${p}: Permission denied`, hook('denied', c, { op: 'read', node: n, tip: `You have no r (read) key for ${n.name}.` }), 2); continue; }
        got.push({ label: p, text: n.content });
      }
      return got;
    }

    /* the commands every Unix computer has */
    const define = (name, fn) => { commands.set(name, fn); };
    define('true', () => {});
    define('false', (c) => { c.status = 1; });
    define('pwd', (c) => c.say(pathOf(sh.cwd)));
    define('echo', (c) => {
      const n = c.args[0] === '-n';
      c.say((n ? c.args.slice(1) : c.args).map((a) => a === '~' ? pathOf(sh.home) : a.startsWith('~/') ? pathOf(sh.home) + a.slice(1) : a).join(' '));
    });
    define('ls', (c) => {
      c.info.all = c.flags.has('a');
      const targets = c.rest.length ? c.rest : ['.'], long = c.flags.has('l');
      targets.forEach((p, i) => {
        const n = find(p);
        if (!n) { c.fail(`ls: cannot access '${p}': No such file or directory`, null, 2); return c.why(p); }
        if (n.type === 'file') return long ? c.out.push({ h: longRow(n, n.name), t: n.name }) : c.say(p);
        if (!can(n, 4)) { c.fail(`ls: cannot open directory '${p}': Permission denied`, hook('denied', c, { op: 'list', node: n, tip: `Listing a folder needs its r key. You are ${sh.user}, and your set of keys for it has no r.` }), 2); return; }
        c.info.target = pathOf(n); if (n !== sh.cwd) c.info.peek = true;
        if (targets.length > 1) c.say(`${p}:`, 'mute');
        const kids = [...n.children].filter((x) => c.info.all || !x.name.startsWith('.')).sort((a, b) => a.name.localeCompare(b.name));
        if (c.info.all) sh.showHidden = true;
        const names = (c.info.all ? [{ name: '.', type: 'dir', self: n }, { name: '..', type: 'dir', self: n.parent ?? n }] : []).concat(kids);
        if (long) names.forEach((x) => c.out.push({ h: longRow(x.self ?? x, x.name), t: x.name }));
        else if (names.length && c.piped) names.forEach((x) => c.say(x.name));
        else if (names.length) c.out.push({ h: names.map((x) => x.type === 'dir' ? `<span class="dir">${esc(x.name)}</span>` : esc(x.name)).join('  '), t: names.map((x) => x.name).join('  ') });
        if (!names.length) c.say(tip('ls.empty', '(empty folder: nothing in here yet)'), 'mute');
        if (i < targets.length - 1) c.say('');
      });
    });
    function longRow(n, label) {
      const size = String(n.type === 'dir' ? 4096 : (n.content || '').length).padStart(5), name = n.type === 'dir' ? `<span class="dir">${esc(label)}</span>` : esc(label);
      if (!o.users) return `<span class="mute">${modeStr(n)} ${esc(own(n))} ${esc(grp(n))} ${size} Oct 18</span> ${name}`;
      return `${hook('modeHTML', n) ?? esc(modeStr(n))} <span class="mute">${esc(own(n)).padEnd(4)} ${esc(grp(n)).padEnd(6)} ${size} Oct 18</span> ${name}`;
    }
    define('cd', (c) => {
      const target = c.rest[0] === '-' ? sh.vars.OLDPWD ?? '.' : c.rest[0] ?? '~', n = find(target);
      if (!n) { c.fail(`cd: ${target}: No such file or directory`); c.why(target); }
      else if (n.type !== 'dir') c.fail(`cd: ${target}: Not a directory`, tip('cd.file', `Tip: ${target} is a file. You can't walk into a file, but you can read it with cat.`));
      else if (!can(n, 1)) { c.info.denied = true; c.fail(`cd: ${target}: Permission denied`); hook('denied', c, { op: 'enter', node: n }); }
      else if (n === sh.cwd && target !== '.') c.say(tip('cd.same', `(You are already in ${pretty(n)}.)`), 'mute');
      else { sh.vars.OLDPWD = pathOf(sh.cwd); sh.cwd = n; sh.vars.PWD = pathOf(n); c.say(tip('cd.moved', `(You are now in ${pretty(n)}${n === sh.home ? ', your home' : n === sh.root ? ', the very top' : ''}.)`), 'mute'); }
    });
    define('cat', (c) => {
      if (!c.rest.length && c.stdin !== undefined) { c.stdin.split('\n').forEach((l) => c.say(l)); return; }
      if (!c.rest.length) { sh.catMode = true; c.say(tip('cat.wait', '(cat is waiting for you to type. Everything you type, it repeats. Press Ctrl+D when you are done, or Ctrl+C to escape!)'), 'tip'); return; }
      c.info.hits = [];
      for (const p of c.rest) {
        const n = find(p);
        if (!n) { c.fail(`cat: ${p}: No such file or directory`); c.why(p); }
        else if (n.type === 'dir') c.fail(`cat: ${p}: Is a directory`, tip('cat.dir', 'Tip: cat reads files. To look inside a folder, use ls.'));
        else if (!can(n, 4)) { c.info.denied = true; c.fail(`cat: ${p}: Permission denied`); hook('denied', c, { op: 'read', node: n }); }
        else { c.info.hits.push(pathOf(n)); n.content.split('\n').forEach((l) => c.say(l)); }
      }
    });
    define('mkdir', (c) => {
      if (!c.rest.length) return c.fail('mkdir: missing operand', tip('mkdir.none', 'Tip: tell it a name, like mkdir fort'));
      c.info.created = [];
      for (const p of c.rest) {
        if (find(p)) { c.fail(`mkdir: cannot create directory '${p}': File exists`); continue; }
        const parts = p.replace(/\/+$/, '').split('/');
        let n = p.startsWith('/') ? sh.root : p.startsWith('~') ? sh.home : sh.cwd;
        for (const [i, part] of parts.entries()) {
          if (!part || part === '.' || part === '~') continue;
          if (part === '..') { n = n.parent || n; continue; }
          let next = n.children.find((x) => x.name === part);
          if (!next) {
            if (i < parts.length - 1 && !c.flags.has('p')) { c.fail(`mkdir: cannot create directory '${p}': No such file or directory`, tip('mkdir.p', 'Tip: add -p to build all the folders on the way.')); n = null; break; }
            if (!can(n, 2)) { c.fail(`mkdir: cannot create directory '${p}': Permission denied`, hook('denied', c, { op: 'create', node: n, tip: `Making something inside ${pretty(n)} needs a w key for that folder, and ${sh.user} doesn't have one.` })); n = null; break; }
            next = node(part, 'dir', n); sh.userDirs.add(next.id);
          }
          if (next.type !== 'dir') { c.fail(`mkdir: '${part}' is a file`); n = null; break; }
          n = next;
        }
        if (n) c.info.created.push(pathOf(n));
      }
    });
    define('touch', (c) => {
      if (!c.rest.length) return c.fail('touch: missing file operand', tip('touch.none', 'Tip: touch flag.txt'));
      c.info.created = [];
      for (const p of c.rest) {
        if (find(p)) continue;
        const [dp, name] = splitPath(p), d = find(dp);
        if (!d || d.type !== 'dir') { c.fail(`touch: cannot touch '${p}': No such file or directory`); continue; }
        if (!can(d, 2)) { c.fail(`touch: cannot touch '${p}': Permission denied`, hook('denied', c, { op: 'create', node: d, tip: `Making a file inside ${pretty(d)} needs a w key for that folder, and ${sh.user} doesn't have one.` })); continue; }
        c.info.created.push(pathOf(node(name, 'file', d)));
      }
    });
    const copyMove = (c) => {
      const cmd = c.cmd;
      if (c.rest.length < 2) return c.fail(`${cmd}: missing destination`, tip(`${cmd}.none`, `Tip: ${cmd} needs two things: where it IS, then where it GOES. Like ${cmd} snacks/pizza.txt fort`));
      const dst = c.rest.at(-1), srcs = c.rest.slice(0, -1), dn = find(dst);
      for (const sp of srcs) {
        const s = find(sp);
        if (!s) { c.fail(`${cmd}: cannot stat '${sp}': No such file or directory`); c.why(sp); continue; }
        if (cmd === 'cp' && s.type === 'dir' && !c.flags.has('r')) { c.fail(`cp: -r not specified; omitting directory '${sp}'`, tip('cp.r', 'Tip: to copy a folder and everything inside, use cp -r')); continue; }
        const into = dn && dn.type === 'dir', [pp, newName] = into ? [null, s.name] : splitPath(dst), parent = into ? dn : find(pp);
        if (!parent || parent.type !== 'dir') { c.fail(`${cmd}: cannot ${cmd === 'cp' ? 'create' : 'move to'} '${dst}': No such file or directory`); continue; }
        if (cmd === 'mv' && s.type === 'dir' && within(parent, s)) { c.fail(`mv: cannot move '${sp}' into itself`, tip('mv.self', 'Nice try! A folder cannot fit inside itself. That would be like a box inside the same box.')); continue; }
        if (s === sh.root || s === sh.home) { c.fail(`${cmd}: let's not move that one. It holds everything!`); continue; }
        if (cmd === 'cp' && !can(s, 4)) { c.info.denied = true; c.fail(`cp: cannot open '${sp}' for reading: Permission denied`, hook('denied', c, { op: 'read', node: s, tip: `Copying needs the r key for ${s.name}.` })); continue; }
        if (!can(parent, 2) || (cmd === 'mv' && !can(s.parent, 2))) { c.fail(`${cmd}: cannot ${cmd === 'cp' ? 'create' : 'move'} '${sp}': Permission denied`, hook('denied', c, { op: 'create', node: parent, tip: `That needs a w key on the folder${cmd === 'mv' ? 's it moves between' : ' it goes into'}.` })); continue; }
        const from = s.parent, clash = parent.children.find((x) => x.name === newName);
        if (clash === s) continue;
        if (clash) parent.children.splice(parent.children.indexOf(clash), 1);
        if (cmd === 'cp') { const k = unclaim(fixParents(clone(s, parent))); k.name = newName; parent.children.push(k); }
        else { s.parent.children.splice(s.parent.children.indexOf(s), 1); s.name = newName; s.parent = parent; parent.children.push(s); }
        sortKids(parent);
        c.info.intoDir = into; c.info.kind = into ? 'into' : from === parent ? 'rename' : 'elsewhere';
      }
    };
    define('cp', copyMove); define('mv', copyMove);
    define('rm', (c) => {
      if (!c.rest.length) return c.fail('rm: missing operand');
      c.info.removed = [];
      for (const p of c.rest) {
        const n = find(p);
        if (!n) { c.fail(`rm: cannot remove '${p}': No such file or directory`); c.why(p); continue; }
        if (n === sh.root) { c.fail('WHOA. That would delete the ENTIRE computer.', tip('rm.root', 'The jelly police have stopped you. On a real computer, never type that.')); continue; }
        if (n.type === 'dir' && !c.flags.has('r')) { c.info.dirError = true; c.fail(`rm: cannot remove '${p}': Is a directory`, tip('rm.dir', 'rm refuses to delete folders unless you add -r. That is rm being careful for once.')); continue; }
        if (within(sh.cwd, n)) { c.fail(`rm: you are standing inside '${p}'!`, tip('rm.inside', 'Step out first with cd .. so you do not fall in.')); continue; }
        if (!can(n.parent, 2)) { c.fail(`rm: cannot remove '${p}': Permission denied`, hook('denied', c, { op: 'delete', node: n.parent, tip: `Deleting needs a w key on the folder ${pretty(n.parent)}, and ${sh.user} doesn't have one.` })); continue; }
        c.info.removed.push(pathOf(n)); n.parent.children.splice(n.parent.children.indexOf(n), 1);
      }
      if (c.info.removed.length) c.say(tip('rm.gone', `(${c.info.removed.length === 1 ? 'gone' : 'all gone'}. Forever. There is no recycle bin.)`), 'mute');
    });
    define('history', (c) => sh.hist.forEach((h, i) => c.say(`${String(i + 1).padStart(4)}  ${h}`)));
    define('whoami', (c) => c.say(sh.user));
    define('hostname', (c) => c.say(o.host));
    define('date', (c) => c.say(new Date().toString().slice(0, 24)));
    define('export', (c) => c.args.forEach((a) => { const m = a.match(/^([A-Za-z_]\w*)=(.*)$/); if (m) sh.vars[m[1]] = m[2]; }));
    define('unset', (c) => c.args.forEach((a) => { delete sh.vars[a]; }));
    define('which', (c) => {
      if (!c.rest.length) return c.fail('which: what should I look for?', tip('which.none', 'Like: which ls'));
      for (const w of c.rest) {
        const n = o.builtins.includes(w) ? null : locate(w);
        if (n) { c.say(pathOf(n)); continue; }
        c.fail(`which: no ${w} in (${pathDirs().join(':')})`, o.builtins.includes(w) ? tip('which.builtin', `${w} isn't a program in a folder at all. It is built into the shell itself. It has to be: cd changes where the shell is standing, and a separate program can't move the shell.`) : null);
      }
    });
    define('grep', (c) => {
      const words = c.args.filter((a) => !/^-[a-z]+$/i.test(a)), pat = words[0], f = c.flags;
      if (pat === undefined) return c.fail('grep: what should I search for?', tip('grep.none', 'Like: grep cookie diary.txt'), 2);
      const srcs = textIn(c, words.slice(1)); if (!srcs) return;
      const norm = (s) => f.has('i') ? s.toLowerCase() : s;
      c.info.matches = 0;
      for (const s of srcs) {
        const hits = s.text.split('\n').map((l, i) => [l, i + 1]).filter(([l]) => norm(l).includes(norm(pat)) !== f.has('v'));
        c.info.matches += hits.length;
        if (f.has('c')) { c.say((srcs.length > 1 ? s.label + ':' : '') + hits.length); continue; }
        hits.forEach(([l, i]) => c.say((srcs.length > 1 ? s.label + ':' : '') + (f.has('n') ? i + ':' : '') + l));
      }
      if (c.status) return;
      if (!c.info.matches) { c.status = 1; if (!f.has('c')) { const t = tip('grep.nothing', `(no lines contain "${pat}"${f.has('i') ? '' : '. grep cares about capitals: add -i to ignore them'})`); if (t) c.say(t, 'mute'); } }
    });
    define('wc', (c) => {
      const srcs = textIn(c, c.rest); if (!srcs) return;
      for (const s of srcs) {
        const t = s.text, n = { l: t ? t.split('\n').length : 0, w: t.split(/\s+/).filter(Boolean).length, c: t.length };
        c.say((c.flags.size ? ['l', 'w', 'c'].filter((k) => c.flags.has(k)) : ['l', 'w', 'c']).map((k) => n[k]).join(' ') + (s.label ? ' ' + s.label : ''));
      }
    });
    define('sort', (c) => { const srcs = textIn(c, c.rest); if (srcs) srcs.flatMap((x) => x.text.split('\n')).sort((a, b) => a.localeCompare(b)).forEach((l) => c.say(l)); });
    const headTail = (c) => {
      const at = c.args.indexOf('-n'), k = at >= 0 ? Number(c.args[at + 1]) || 10 : 10, paths = c.args.filter((a, i) => a !== '-n' && i !== at + 1 || at < 0 && a !== '-n');
      const srcs = textIn(c, at >= 0 ? paths : c.rest); if (srcs) srcs.forEach((x) => (c.cmd === 'head' ? x.text.split('\n').slice(0, k) : x.text.split('\n').slice(-k)).forEach((l) => c.say(l)));
    };
    define('head', headTail); define('tail', headTail);

    /* users, groups and locks */
    define('chmod', (c) => {
      const [spec, ...files] = c.rest;
      if (!spec || !files.length) return c.fail('chmod: missing operand', tip('chmod.usage', 'Say who, then + or -, then which keys. Like: chmod u+x hello'));
      for (const p of files) {
        const n = find(p);
        if (!n) { c.fail(`chmod: cannot access '${p}': No such file or directory`); continue; }
        if (own(n) !== sh.user && sh.user !== 'root') { c.fail(`chmod: changing permissions of '${p}': Operation not permitted`, tip('chmod.owner', `Only the owner (${own(n)}) can change this lock. You are ${sh.user}.`)); continue; }
        let m = modeOf(n);
        if (/^\d+$/.test(spec)) {
          if (!/^[0-7]{3,4}$/.test(spec)) { c.info.badNumber = true; c.fail(`chmod: invalid mode: '${spec}'`, /[89]/.test(spec) ? tip('chmod.digits', 'No digit can be bigger than 7. Each digit is three on/off switches (r = 4, w = 2, x = 1), and three switches add up to 7 at most.') : tip('chmod.count', 'The number way needs exactly three digits: owner, group, everyone else. Like 644.')); continue; }
          m = (m & ~0o7777) | parseInt(spec, 8);
          const t = tip('chmod.number', null); if (t) c.say(t, 'tip');
        } else {
          for (const part of spec.split(',')) {
            const s = part.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
            if (!s) { c.fail(`chmod: invalid mode: '${spec}'`, tip('chmod.letters', 'Say who (u = owner, g = group, o = others, a = all), then + to give or - to take away, then which keys (r, w, x). Like: chmod go-w hello')); m = null; break; }
            const bits = [...s[3]].reduce((b, ch) => b | { r: 4, w: 2, x: 1 }[ch], 0);
            for (const w of new Set((s[1] || 'a').replace('a', 'ugo'))) {
              const k = { u: 6, g: 3, o: 0 }[w];
              m = s[2] === '+' ? m | (bits << k) : s[2] === '-' ? m & ~(bits << k) : (m & ~(7 << k)) | (bits << k);
            }
          }
          if (m === null) continue;
        }
        c.info.was = modeOf(n); n.mode = m; c.info.mode = m; c.info.file = pathOf(n);
      }
    });
    define('chgrp', (c) => {
      const [g, ...files] = c.rest;
      if (!g || !files.length) return c.fail('chgrp: missing operand', tip('chgrp.usage', 'Say the group, then the file. Like: chgrp family comics'));
      if (o.gids[g] === undefined) return c.fail(`chgrp: invalid group: '${g}'`, tip('chgrp.group', `The groups on this computer are: ${Object.keys(o.gids).join(', ')}.`));
      for (const p of files) {
        const n = find(p);
        if (!n) { c.fail(`chgrp: cannot access '${p}': No such file or directory`); continue; }
        if (sh.user !== 'root' && (own(n) !== sh.user || !groupsOf(sh.user).includes(g))) { c.fail(`chgrp: changing group of '${p}': Operation not permitted`, own(n) !== sh.user ? tip('chgrp.owner', `Only the owner (${own(n)}) can do that.`) : tip('chgrp.member', `You can only give things to a group you are in. You are in: ${groupsOf(sh.user).join(', ')}.`)); continue; }
        n.group = g; c.info.group = g; c.info.file = pathOf(n);
      }
    });
    define('id', (c) => {
      const u = c.rest[0] ?? sh.user;
      if (o.users && !o.users[u]) return c.fail(`id: '${u}': no such user`);
      const gs = groupsOf(u), uid = o.users?.[u]?.uid ?? 1000, gid = (g) => o.gids[g] ?? uid;
      c.say(`uid=${uid}(${u}) gid=${gid(gs[0])}(${gs[0]}) groups=${gs.map((g) => `${gid(g)}(${g})`).join(',')}`);
    });
    define('groups', (c) => {
      const u = c.rest[0] ?? sh.user;
      if (o.users && !o.users[u]) return c.fail(`groups: '${u}': no such user`);
      c.say((c.rest[0] ? u + ' : ' : '') + groupsOf(u).join(' '));
    });
    define('su', (c) => {
      const u = c.rest[0] ?? 'root';
      if (!o.users || u === 'root') return c.fail('su: Authentication failure', tip('su.root', 'Nobody is told root\'s password, not even grown-ups who look after the computer. They use sudo instead, one command at a time.'));
      if (!o.users[u]) return c.fail(`su: user ${u} does not exist`, tip('su.who', `The people on this computer are ${Object.keys(o.users).filter((x) => x !== 'root').join(' and ')}.`));
      sh.su.push({ user: sh.user, home: sh.home });
      sh.user = u; sh.home = find(`/home/${u}`) ?? sh.home; sh.vars.USER = u; sh.vars.HOME = pathOf(sh.home); c.info.user = u;
    });
    define('exit', (c) => {
      if (!sh.su.length) { const t = tip('exit.top', 'There is no exit. Only more learning.'); if (t) c.say(t, 'tip'); const r = tip('exit.real', '(On a real computer, exit closes the terminal window.)'); if (r) c.say(r, 'mute'); return; }
      const b = sh.su.pop(); c.info.left = sh.user; sh.user = b.user; sh.home = b.home; sh.vars.USER = b.user; sh.vars.HOME = pathOf(b.home);
    });
    define('sudo', (c) => {
      if (!c.args.length) return c.fail('usage: sudo command', tip('sudo.usage', 'Put the command you want to run as root after it. Like: sudo whoami'));
      if (!groupsOf(sh.user).includes('sudo')) return c.fail(`${sh.user} is not in the sudoers file. This incident will be reported.`, tip('sudo.no', `Only people in the sudo group may use sudo. ${sh.user} isn't. (Check with: id)`));
      if (c.args[0] === 'su' || c.args[0] === 'sudo') return c.fail('Let\'s not do that.', tip('sudo.stay', 'Staying root is how accidents happen. Use sudo for one command at a time.'));
      if (!sh.sudoAsked) { sh.sudoAsked = true; c.say(`[sudo] password for ${sh.user}: ●●●●●●`, 'mute'); const t = tip('sudo.password', '(sudo asks for YOUR password, not root\'s. That proves it really is you at the keyboard. The sandbox typed it for you.)'); if (t) c.say(t, 'tip'); }
      const was = sh.user; sh.user = 'root';
      const inner = exec(c.args, c.stdin, c.line);
      claimNew(); sh.user = was;
      c.out.push(...inner.out); c.info.sudo = true; c.info.inner = inner; c.status = inner.status;
    });

    function reset(root) {
      sh.root = root; sh.home = find(o.home) ?? root; sh.cwd = sh.home; sh.user = o.user; sh.su = []; sh.status = 0; sh.userDirs.clear(); sh.showHidden = false; sh.sudoAsked = false; sh.catMode = false;
      sh.vars = { HOME: pathOf(sh.home), USER: o.user, PATH: o.path.replace(/~/g, pathOf(sh.home)), PWD: pathOf(sh.cwd) };
    }
    const configure = (more) => { const hooks = { ...o.hooks, ...(more.hooks ?? {}) }; Object.assign(o, more, { hooks }); return api; };
    const api = {
      sh, run: runLine, exec, define, configure, reset, has: (name) => commands.has(name), names: () => [...commands.keys()], get hooks() { return o.hooks; }, get users() { return o.users; },
      find, pathOf, pretty, splitPath, sortKids, within, clone, fixParents, node, allNodes, locate, pathDirs, glob,
      own, grp, modeOf, keySet, can, triplet, modeStr, claimNew, unclaim, SHIFT, isOutput,
    };
    configure(opts);
    return api;
  }
  return { create, lex, parse };
})();
if (typeof module !== 'undefined') module.exports = JellySh;
