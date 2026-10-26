/* ---------------- the pretend git, and a pretend GitHub ---------------- */
// Each repository has the three places git keeps: the folder (real files), the stage (index) and the album (commits).
// GitHub lives "far away" and is shared by every repository that points at it.
const GH_USER = 'kid', GH_URL = 'https://github.com/kid/my-game.git';
const GIT = { user: {}, repos: new Map(), github: {}, signedIn: false, pushes: 0, addTips: 0 };
const GIT_WORDS = ['add', 'clone', 'commit', 'config', 'diff', 'init', 'log', 'pull', 'push', 'remote', 'restore', 'status'];
const sha = () => [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 7);
const repoOf = (n = sh.cwd) => { for (let x = n; x; x = x.parent) if (GIT.repos.has(x.id)) return GIT.repos.get(x.id); return null; };
const relTo = (repo, node) => pathOf(node).slice(pathOf(repo.dir).length + 1);
const headTree = (repo) => repo.commits.at(-1)?.tree ?? new Map();
const absOf = (spec) => {
  const parts = spec.startsWith('/') ? [] : (spec.startsWith('~') ? pathOf(sh.home) : pathOf(sh.cwd)).split('/').filter(Boolean);
  for (const s of spec.replace(/^~/, '').split('/')) { if (!s || s === '.') continue; if (s === '..') parts.pop(); else parts.push(s); }
  return '/' + parts.join('/');
};
const relOf = (repo, spec) => { const a = absOf(spec), r = pathOf(repo.dir); return a === r ? '' : a.startsWith(r + '/') ? a.slice(r.length + 1) : null; };
const parseUrl = (url) => { const m = url.match(/^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/); return m ? { user: m[1], repo: m[2] } : null; };
const ghRepo = (repo) => repo?.remote?.user === GH_USER ? GIT.github[repo.remote.repo] : null;
function sync(repo) {
  const gh = ghRepo(repo); if (!gh) return null;
  let c = 0; while (c < repo.commits.length && c < gh.commits.length && repo.commits[c].id === gh.commits[c].id) c++;
  return { ahead: repo.commits.length - c, behind: gh.commits.length - c };
}
function workFiles(repo) {
  const m = new Map();
  const walk = (n, pre) => n.children.forEach((c) => { if (c.name === '.git') return; if (c.type === 'dir') walk(c, `${pre}${c.name}/`); else m.set(pre + c.name, c.content); });
  walk(repo.dir, ''); return m;
}
function ignored(repo, path) {
  const gi = repo.dir.children.find((c) => c.name === '.gitignore' && c.type === 'file');
  if (!gi) return false;
  const base = path.split('/').at(-1);
  return gi.content.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .some((p) => p === path || p === base || (p.endsWith('/') && path.startsWith(p)) || (p.startsWith('*') && base.endsWith(p.slice(1))));
}
function gitStatus(repo) {
  const W = workFiles(repo), I = repo.index, H = headTree(repo), st = { staged: [], unstaged: [], untracked: [], ignored: [] };
  for (const p of [...new Set([...I.keys(), ...H.keys()])].sort()) {
    if (I.has(p) && !H.has(p)) st.staged.push({ p, k: 'new file' });
    else if (!I.has(p)) st.staged.push({ p, k: 'deleted' });
    else if (I.get(p) !== H.get(p)) st.staged.push({ p, k: 'modified' });
  }
  for (const [p, c] of [...I].sort()) { if (!W.has(p)) st.unstaged.push({ p, k: 'deleted' }); else if (W.get(p) !== c) st.unstaged.push({ p, k: 'modified' }); }
  for (const p of [...W.keys()].sort()) if (!I.has(p)) (ignored(repo, p) ? st.ignored : st.untracked).push(p);
  st.clean = !st.staged.length && !st.unstaged.length && !st.untracked.length;
  return st;
}
const lines = (s) => s === '' ? [] : s.split('\n');
function lineDiff(a, b) {
  const A = lines(a), B = lines(b), L = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < A.length && j < B.length) { if (A[i] === B[j]) { out.push([' ', A[i++]]); j++; } else if (L[i + 1][j] >= L[i][j + 1]) out.push(['-', A[i++]]); else out.push(['+', B[j++]]); }
  while (i < A.length) out.push(['-', A[i++]]);
  while (j < B.length) out.push(['+', B[j++]]);
  return out;
}
function treeChanges(a, b) {
  const r = { files: 0, ins: 0, del: 0, created: [] };
  for (const p of new Set([...a.keys(), ...b.keys()])) {
    if (a.get(p) === b.get(p)) continue;
    r.files++; if (!a.has(p)) r.created.push(p);
    for (const [m] of lineDiff(a.get(p) ?? '', b.get(p) ?? '')) { if (m === '+') r.ins++; if (m === '-') r.del++; }
  }
  return r;
}
const newNode = (name, type, parent, content = '') => ({ id: 'n' + nid++, name, type, content, children: type === 'dir' ? [] : null, parent });
function writeFile(dir, rel, content) {
  const parts = rel.split('/'); let d = dir;
  for (const seg of parts.slice(0, -1)) { let n = d.children.find((c) => c.name === seg); if (!n) { n = newNode(seg, 'dir', d); d.children.push(n); sortKids(d); } d = n; }
  const f = d.children.find((c) => c.name === parts.at(-1));
  if (f) f.content = content; else { d.children.push(newNode(parts.at(-1), 'file', d, content)); sortKids(d); }
}
function removeFile(dir, rel) { const f = find(rel, dir); if (f?.type === 'file') f.parent.children.splice(f.parent.children.indexOf(f), 1); }
function initRepo(dir) {
  const g = newNode('.git', 'dir', dir);
  g.children = [newNode('HEAD', 'file', g, 'ref: refs/heads/main'), newNode('config', 'file', g, '[core]\n\trepositoryformatversion = 0'), newNode('objects', 'dir', g), newNode('refs', 'dir', g)];
  dir.children.push(g); sortKids(dir);
  GIT.repos.set(dir.id, { dir, index: new Map(), commits: [], remote: null, upstream: false });
}
const makeCommit = (repo, msg) => { const c = { id: sha(), msg, tree: new Map(repo.index), author: GIT.user.name, email: GIT.user.email, date: new Date() }; repo.commits.push(c); return c; };
const editDistance = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };

function gitRun(args, say, failRun, info, out) {
  const sub = args[0], rest = args.slice(1), pos = rest.filter((a) => !a.startsWith('-')), repo = repoOf();
  let failed = false;
  const fail = (...a) => { failed = true; failRun(...a); };
  const html = (h, t = '') => out.push({ h, t });
  const need = () => { if (repo) return true; info.notRepo = true; fail('fatal: not a git repository (or any of the parent directories): .git', 'You are not inside a repository. cd into your project (cd ~/my-game), or run git init to make this folder one.'); return false; };
  info.sub = sub;
  switch (sub) {
    case undefined: case 'help': case '--help':
      say('usage: git <word> [options]'); say(''); say('The everyday words:', 'mute');
      [['status', 'what is going on?'], ['add', 'put files on the stage'], ['commit', 'take a photo of the stage'], ['log', 'look through the album'], ['diff', 'spot the difference'], ['restore', 'the oops button'], ['init', 'start a new repository'], ['config', 'tell git who you are'], ['remote', 'connect to GitHub'], ['push', 'send photos up to GitHub'], ['pull', 'bring new photos down'], ['clone', 'copy a whole album from GitHub']]
        .forEach(([w, d]) => html(`   <span class="ok">${w.padEnd(9)}</span><span class="mute">${d}</span>`, w));
      break;
    case '--version': case 'version': say('git version 2.47.0'); break;
    case 'config': {
      const kv = rest.filter((a) => a !== '--global' && a !== '--local');
      if (kv[0] === '--list' || kv[0] === '-l') {
        info.configRead = true;
        Object.entries(GIT.user).forEach(([k, v]) => say(`user.${k}=${v}`)); say('init.defaultbranch=main');
        if (!GIT.user.name) say('(No name yet. Try: git config --global user.name "Your Name")', 'tip');
        break;
      }
      const key = kv[0], k = key?.replace(/^user\./, '');
      if (!key) { fail('usage: git config [--global] <name> [<value>]', 'Like: git config --global user.name "Sam"'); break; }
      if (kv.length === 1) { info.configRead = true; if (GIT.user[k] && key.startsWith('user.')) say(GIT.user[k]); else say('(Not set yet.)', 'mute'); break; }
      const val = kv.slice(1).join(' ');
      if (key !== 'user.name' && key !== 'user.email') { say(`(Saved ${key}. This guide only needs user.name and user.email.)`, 'mute'); break; }
      GIT.user[k] = val; info.configSet = key;
      if (k === 'email' && !val.includes('@')) say("That doesn't look like an email (there's no @). Use the email from your GitHub account.", 'tip');
      else say(`(Saved. git will sign your photos with ${k === 'name' ? `the name ${val}` : `the email ${val}`}.)`, 'mute');
      break;
    }
    case 'init': {
      if (GIT.repos.has(sh.cwd.id)) { say(`Reinitialized existing Git repository in ${pathOf(sh.cwd)}/.git/`); info.init = true; break; }
      if (repo) { fail(`You are already inside a repository (${pretty(repo.dir)}).`, 'No need to init again: one repository per project.'); break; }
      initRepo(sh.cwd); info.init = true;
      say(`Initialized empty Git repository in ${pathOf(sh.cwd)}/.git/`);
      say('(A hidden .git folder appeared. That is your photo album. Try ls -a to see it.)', 'tip');
      if (sh.cwd === sh.home) say('Heads up: you turned your whole home folder into a repository. Usually you do this inside a project folder, like my-game.', 'tip');
      break;
    }
    case 'status': {
      if (!need()) break;
      const st = gitStatus(repo), sy = repo.upstream ? sync(repo) : null; info.status = st;
      say('On branch main');
      if (sy) {
        const n = (x) => `${x} commit${x > 1 ? 's' : ''}`;
        if (sy.ahead && sy.behind) say("Your branch and 'origin/main' have diverged.");
        else if (sy.ahead) { say(`Your branch is ahead of 'origin/main' by ${n(sy.ahead)}.`); say('  (use "git push" to publish your local commits)', 'mute'); }
        else if (sy.behind) { say(`Your branch is behind 'origin/main' by ${n(sy.behind)}, and can be fast-forwarded.`); say('  (use "git pull" to update your local branch)', 'mute'); }
        else say("Your branch is up to date with 'origin/main'.");
      }
      if (!repo.commits.length) { say(''); say('No commits yet'); }
      const block = (title, hint, items, cls) => { if (!items.length) return; say(''); say(title); say(hint, 'mute'); items.forEach((x) => say(`        ${x.k ? (x.k + ':').padEnd(12) : ''}${x.p ?? x}`, cls)); };
      block('Changes to be committed:', '  (use "git restore --staged <file>..." to unstage)', st.staged, 'ok');
      block('Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)', st.unstaged, 'er');
      block('Untracked files:', '  (use "git add <file>..." to include in what will be committed)', st.untracked, 'er');
      say('');
      if (st.clean) say(repo.commits.length ? 'nothing to commit, working tree clean' : 'nothing to commit (create/copy files and use "git add" to track)');
      else if (!st.staged.length) say(st.unstaged.length ? 'no changes added to commit (use "git add" and/or "git commit -a")' : 'nothing added to commit but untracked files present (use "git add" to track)');
      const bits = [st.staged.length && `${st.staged.length} on the stage, ready for a photo`, st.unstaged.length && `${st.unstaged.length} changed but not on the stage`, st.untracked.length && `${st.untracked.length} new file${st.untracked.length > 1 ? 's' : ''} git is not watching yet`].filter(Boolean);
      say(`In kid-speak: ${bits.length ? bits.join(', ') + '.' : 'everything is saved in a photo. Nothing to do!'}${sy?.ahead ? ` Your album has ${sy.ahead} photo${sy.ahead > 1 ? 's' : ''} GitHub does not have yet.` : ''}`, 'tip');
      break;
    }
    case 'add': {
      if (!need()) break;
      const all = rest.some((a) => a === '.' || a === '-A' || a === '--all'), specs = all ? ['.'] : pos, W = workFiles(repo), added = [];
      if (!specs.length) { fail('Nothing specified, nothing added.', 'Tell git which file: git add game.py. Or everything: git add .'); break; }
      for (const spec of specs) {
        const rel = relOf(repo, spec);
        if (rel === null) { fail(`fatal: '${spec}' is outside repository at '${pathOf(repo.dir)}'`); continue; }
        const under = (p) => rel === '' || p === rel || p.startsWith(rel + '/');
        const hits = [...new Set([...W.keys(), ...repo.index.keys()])].filter(under);
        if (!hits.length) { fail(`fatal: pathspec '${spec}' did not match any files`, 'Check the spelling with ls. Capitals matter!'); continue; }
        if (W.has(rel) && !repo.index.has(rel) && ignored(repo, rel)) { fail(`The following paths are ignored by one of your .gitignore files:\n${rel}`, 'That file is on the bouncer list (.gitignore), so git keeps it out. Good!'); continue; }
        for (const p of hits) {
          if (!W.has(p)) { repo.index.delete(p); added.push(p); continue; }
          if (!repo.index.has(p) && ignored(repo, p)) continue;
          if (repo.index.get(p) !== W.get(p)) added.push(p);
          repo.index.set(p, W.get(p));
        }
      }
      info.added = added; info.addAll = all;
      if (!failed && GIT.addTips++ < 2) say('(git add stays quiet when it works. Type git status to see the stage go green.)', 'mute');
      break;
    }
    case 'commit': {
      if (!need()) break;
      const mIdx = rest.findIndex((a) => /^-[a-z]*m$/.test(a)), msg = mIdx >= 0 ? rest[mIdx + 1] : undefined, auto = rest.some((a) => /^-[a-z]*a[a-z]*$/.test(a));
      if (mIdx < 0) { fail('(git tried to open a text editor called Vim so you could type a message.)', 'People have been getting stuck in Vim since 1991. Skip that: always add -m "your message", like git commit -m "first version"'); break; }
      if (!msg) { fail("error: switch `m' requires a value", 'Put your message in quotes after -m: git commit -m "add lasers"'); break; }
      if (!GIT.user.name || !GIT.user.email) { fail('Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config --global user.email "you@example.com"\n  git config --global user.name "Your Name"', 'git signs every photo with your name. Do the config lesson first!'); break; }
      if (auto) { const W = workFiles(repo); for (const { p, k } of gitStatus(repo).unstaged) k === 'deleted' ? repo.index.delete(p) : repo.index.set(p, W.get(p)); }
      const st = gitStatus(repo);
      if (!st.staged.length) { fail(st.clean ? 'nothing to commit, working tree clean' : 'no changes added to commit (use "git add" and/or "git commit -a")', st.clean ? 'Everything is already in a photo.' : 'The stage is empty! Use git add first, so git knows what goes in the photo.'); break; }
      const before = headTree(repo), c = makeCommit(repo, msg), ch = treeChanges(before, c.tree);
      info.commit = c; info.commits = repo.commits.length;
      html(`[main${repo.commits.length === 1 ? ' (root-commit)' : ''} <span class="hash">${c.id}</span>] ${esc(msg)}`, `[main ${c.id}] ${msg}`);
      say(` ${ch.files} file${ch.files === 1 ? '' : 's'} changed, ${ch.ins} insertion${ch.ins === 1 ? '' : 's'}(+), ${ch.del} deletion${ch.del === 1 ? '' : 's'}(-)`);
      ch.created.forEach((p) => say(` create mode 100644 ${p}`));
      say(`Snap! Photo ${c.id} is in your album.${repo.remote ? ' GitHub does not have it yet: that needs git push.' : ''}`, 'tip');
      if (msg.trim().length < 4 || /^(stuff|update|updates|asdf|fix|changes|wip|test|done|things)$/i.test(msg.trim())) say(`Hmm, "${msg}" won't help future-you much. Next time say what changed, like "add a jump button".`, 'tip');
      break;
    }
    case 'log': {
      if (!need()) break;
      if (!repo.commits.length) { fail("fatal: your current branch 'main' does not have any commits yet", 'The album is empty. Take a photo first: git add . then git commit -m "first version"'); break; }
      const one = rest.includes('--oneline'), remoteTip = repo.upstream && ghRepo(repo)?.commits.at(-1)?.id;
      info.log = { oneline: one };
      [...repo.commits].reverse().forEach((c, i) => {
        const refs = [i === 0 && '<span class="ok">HEAD -&gt; main</span>', c.id === remoteTip && '<span class="er">origin/main</span>'].filter(Boolean);
        const r = refs.length ? ` <span class="hash">(</span>${refs.join('<span class="hash">, </span>')}<span class="hash">)</span>` : '';
        if (one) { html(`<span class="hash">${c.id}</span>${r} ${esc(c.msg)}`, c.msg); return; }
        html(`<span class="hash">commit ${c.id}</span>${r}`, c.id); say(`Author: ${c.author} <${c.email}>`); say(`Date:   ${c.date.toString().slice(0, 24)}`); say(''); say(`    ${c.msg}`); say('');
      });
      if (!one) say('Tip: git log --oneline shows one short line per photo. On a real computer press q to leave a long log.', 'tip');
      break;
    }
    case 'diff': {
      if (!need()) break;
      const staged = rest.includes('--staged') || rest.includes('--cached');
      const A = staged ? headTree(repo) : repo.index, B = staged ? repo.index : workFiles(repo);
      const paths = [...new Set([...A.keys(), ...(staged ? B.keys() : [])])].filter((p) => A.get(p) !== B.get(p)).sort();
      info.diff = paths.length;
      for (const p of paths) {
        html(`<b>diff --git a/${esc(p)} b/${esc(p)}</b>`, '');
        say(`--- ${A.has(p) ? 'a/' + p : '/dev/null'}`, 'mute'); say(`+++ ${B.has(p) ? 'b/' + p : '/dev/null'}`, 'mute');
        for (const [m, l] of lineDiff(A.get(p) ?? '', B.get(p) ?? '')) say(`${m}${l}`, m === '+' ? 'ok' : m === '-' ? 'er' : 'mute');
      }
      if (!paths.length) say(staged ? '(Nothing on the stage is different from the last photo.)' : '(No differences: your files match the stage. git diff --staged compares the stage with the last photo.)', 'mute');
      else say('(Green lines with + are new. Red lines with - are gone.)', 'tip');
      break;
    }
    case 'restore': {
      if (!need()) break;
      const staged = rest.includes('--staged') || rest.includes('-S'), H = headTree(repo);
      if (!pos.length) { fail('fatal: you must specify path(s) to restore', 'Which file? Like: git restore game.py'); break; }
      info.restored = []; info.restoreStaged = staged;
      for (const spec of pos) {
        const rel = relOf(repo, spec);
        if (rel === null || (!repo.index.has(rel) && !H.has(rel))) { fail(`error: pathspec '${spec}' did not match any file(s) known to git`, 'git can only restore files it has seen on the stage or in a photo.'); continue; }
        if (staged) { if (H.has(rel)) repo.index.set(rel, H.get(rel)); else repo.index.delete(rel); }
        else if (repo.index.has(rel)) writeFile(repo.dir, rel, repo.index.get(rel));
        info.restored.push(rel);
      }
      if (info.restored.length) say(staged ? `(${info.restored.join(', ')} stepped off the stage. The file itself did not change.)` : `Poof! ${info.restored.join(', ')} is back to how it was. (The changes you threw away are gone for good.)`, 'tip');
      break;
    }
    case 'remote': {
      if (!need()) break;
      const [act, name, url] = pos;
      if (!act) {
        info.remoteList = rest.includes('-v');
        if (!repo.remote) { say('(No remotes yet. Connect GitHub with git remote add origin <address>.)', 'mute'); break; }
        if (info.remoteList) { say(`${repo.remote.name}\t${repo.remote.url} (fetch)`); say(`${repo.remote.name}\t${repo.remote.url} (push)`); } else say(repo.remote.name);
        break;
      }
      if (act === 'add') {
        if (!name || !url) { fail('usage: git remote add <name> <url>', `Like: git remote add origin ${GH_URL}`); break; }
        if (repo.remote) { fail(`error: remote ${repo.remote.name} already exists.`, 'To change the address: git remote set-url origin <new address>'); break; }
        const u = parseUrl(url); repo.remote = { name, url, ...u }; info.remoteAdd = true;
        say(u ? `(Saved. "${name}" now means ${url})` : 'Hmm, that does not look like a GitHub address. It should look like ' + GH_URL, u ? 'mute' : 'tip');
        break;
      }
      if (act === 'set-url' && repo.remote && name && url) { Object.assign(repo.remote, { url, user: undefined, repo: undefined }, parseUrl(url) ?? {}); say(`(Updated. "${name}" now means ${url})`, 'mute'); break; }
      if ((act === 'remove' || act === 'rm') && repo.remote) { repo.remote = null; repo.upstream = false; say('(Removed.)', 'mute'); break; }
      fail(`error: unknown subcommand: ${act}`);
      break;
    }
    case 'push': {
      if (!need()) break;
      const up = rest.includes('-u') || rest.includes('--set-upstream'), [rname, branch] = pos;
      if (!repo.remote) { fail('fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using\n\n    git remote add <name> <url>', 'git does not know where GitHub is yet. That is the remote lesson.'); break; }
      if (rname && rname !== repo.remote.name) { fail(`fatal: '${rname}' does not appear to be a git repository`, `Your nickname for GitHub is ${repo.remote.name}.`); break; }
      if (!rname && !repo.upstream) { fail('fatal: The current branch main has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin main', 'The first push needs directions: git push -u origin main. After that, plain git push works.'); break; }
      if (branch && branch !== 'main') { fail(`error: src refspec ${branch} does not match any`, branch === 'master' ? 'Your branch is called main, not master. Try: git push -u origin main' : 'Your branch is called main.'); break; }
      if (!repo.commits.length) { fail('error: src refspec main does not match any', 'Nothing to push yet: take a photo first with git commit.'); break; }
      if (!GIT.signedIn) {
        say('(GitHub asks who you are. On a real computer a browser window pops up so you can sign in, or git asks for your username and a token.)', 'tip');
        say('(Never type your normal GitHub password there: GitHub stopped accepting passwords for git in 2021. Pretend you signed in as kid. ✓)', 'tip');
        GIT.signedIn = true;
      }
      const gh = ghRepo(repo);
      if (!gh) { fail(`remote: Repository not found.\nfatal: repository '${repo.remote.url}' not found`, 'Make the repository on GitHub first (the Create repository button in the git map), and check the address is spelled exactly right.'); break; }
      const sy = sync(repo);
      if (sy.behind) {
        say(`To ${repo.remote.url}`); say(' ! [rejected]        main -> main (fetch first)', 'er');
        fail(`error: failed to push some refs to '${repo.remote.url}'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. Integrate the remote changes (e.g. 'git pull ...')\nhint: before pushing again.`, 'GitHub has photos you do not have. Do git pull first, then push.');
        break;
      }
      if (up) repo.upstream = true;
      if (!sy.ahead) { say('Everything up-to-date'); info.push = { count: 0 }; break; }
      const old = gh.commits.at(-1)?.id, objs = sy.ahead * 3;
      gh.commits = [...repo.commits];
      say(`Enumerating objects: ${objs}, done.`); say(`Writing objects: 100% (${objs}/${objs}), done.`); say(`To ${repo.remote.url}`);
      say(old ? `   ${old}..${repo.commits.at(-1).id}  main -> main` : ' * [new branch]      main -> main');
      if (up) say("branch 'main' set up to track 'origin/main'.");
      GIT.pushes++; info.push = { count: sy.ahead, n: GIT.pushes };
      say(`Whoosh! ${sy.ahead} photo${sy.ahead > 1 ? 's' : ''} flew up to GitHub. Your code is safe in the cloud.`, 'tip');
      break;
    }
    case 'pull': {
      if (!need()) break;
      if (!repo.remote) { fail('fatal: No remote repository specified.', 'Connect GitHub first: git remote add origin <address>'); break; }
      if (!pos.length && !repo.upstream) { fail('There is no tracking information for the current branch.', 'Try: git pull origin main (or push once with -u first).'); break; }
      const gh = ghRepo(repo);
      if (!gh) { fail(`remote: Repository not found.\nfatal: repository '${repo.remote.url}' not found`); break; }
      const sy = sync(repo);
      if (!sy.behind) { say('Already up to date.'); info.pull = { count: 0 }; break; }
      if (sy.ahead) { fail('hint: You have divergent branches and need to specify how to reconcile them.\nfatal: Need to specify how to reconcile divergent branches.', 'Your computer and GitHub both have new photos. Joining them is called merging: a level-two skill! For now, press Start over.'); break; }
      const oldT = headTree(repo), newT = gh.commits.at(-1).tree, W = workFiles(repo);
      const touched = [...new Set([...oldT.keys(), ...newT.keys()])].filter((p) => oldT.get(p) !== newT.get(p));
      const clash = touched.filter((p) => W.get(p) !== repo.index.get(p) || repo.index.get(p) !== oldT.get(p));
      if (clash.length) { fail(`error: Your local changes to the following files would be overwritten by merge:\n\t${clash.join('\n\t')}\nPlease commit your changes or stash them before you merge.\nAborting`, 'Save your own changes first (git add + git commit), or throw them away with git restore.'); break; }
      const from = repo.commits.at(-1)?.id, count = gh.commits.length - repo.commits.length, ch = treeChanges(oldT, newT);
      for (const p of touched) { if (newT.has(p)) { writeFile(repo.dir, p, newT.get(p)); repo.index.set(p, newT.get(p)); } else { removeFile(repo.dir, p); repo.index.delete(p); } }
      repo.commits = [...gh.commits];
      say(`Updating ${from ?? '0000000'}..${repo.commits.at(-1).id}`); say('Fast-forward');
      touched.forEach((p) => { const d = lineDiff(oldT.get(p) ?? '', newT.get(p) ?? ''), ins = d.filter(([m]) => m === '+').length, del = d.filter(([m]) => m === '-').length; say(` ${p} | ${ins + del} ${'+'.repeat(ins)}${'-'.repeat(del)}`); });
      say(` ${ch.files} file${ch.files === 1 ? '' : 's'} changed, ${ch.ins} insertion${ch.ins === 1 ? '' : 's'}(+), ${ch.del} deletion${ch.del === 1 ? '' : 's'}(-)`);
      info.pull = { count };
      say(`Ta-da! ${count} new photo${count > 1 ? 's' : ''} came down from GitHub, and your files were updated.`, 'tip');
      break;
    }
    case 'clone': {
      const [url, dirName] = pos;
      if (!url) { fail('fatal: You must specify a repository to clone.', `Like: git clone ${GH_URL}`); break; }
      if (repo) { fail(`You are inside a repository (${pretty(repo.dir)}).`, 'cd ~ first: clone into a normal folder, not inside another repository.'); break; }
      const u = parseUrl(url), name = dirName ?? u?.repo ?? url.split('/').at(-1).replace(/\.git$/, ''), gh = u?.user === GH_USER ? GIT.github[u.repo] : null;
      say(`Cloning into '${name}'...`);
      if (!gh) { fail(`remote: Repository not found.\nfatal: repository '${url}' not found`, 'Check the address. You can copy it from the git map.'); break; }
      if (sh.cwd.children.some((c) => c.name === name)) { fail(`fatal: destination path '${name}' already exists and is not an empty directory.`, `Give the copy another name: git clone ${url} ${name}-copy`); break; }
      const dir = newNode(name, 'dir', sh.cwd); sh.cwd.children.push(dir); sortKids(sh.cwd);
      initRepo(dir);
      const r = GIT.repos.get(dir.id);
      r.commits = [...gh.commits]; r.index = new Map(headTree(r)); r.remote = { name: 'origin', url, ...u }; r.upstream = true;
      for (const [p, c] of headTree(r)) writeFile(dir, p, c);
      const n = gh.commits.length * 3;
      if (!gh.commits.length) say('warning: You appear to have cloned an empty repository.');
      else { say(`remote: Enumerating objects: ${n}, done.`); say(`Receiving objects: 100% (${n}/${n}), done.`); }
      info.clone = name;
      say(`(The whole album, files and all, is now in ${name}. Pretend this folder is on your other computer!)`, 'tip');
      break;
    }
    case 'branch': say('* main', 'ok'); say('(Branches are like parallel universes for your code. That is a level-two adventure.)', 'tip'); break;
    case 'checkout': case 'switch': case 'merge': case 'rebase': case 'stash': case 'reset': case 'fetch':
      say(`git ${sub} is a real git word for later adventures. This guide sticks to the everyday ones. Type git to see them.`, 'tip'); break;
    default: {
      const near = GIT_WORDS.find((w) => editDistance(w, sub) <= 2);
      fail(`git: '${sub}' is not a git command. See 'git --help'.${near ? `\n\nThe most similar command is\n        ${near}` : ''}`);
    }
  }
}

/* a pretend github.com: the buttons in the git map stand in for clicking around the website */
function ghCreate() {
  if (GIT.github['my-game']) return;
  GIT.github['my-game'] = { commits: [] };
  print('<span class="mute">(On github.com you pressed New, typed my-game, and pressed Create repository. GitHub gives you its address:)</span>');
  print(`<span class="tip">${GH_URL}</span>`);
  scrollDown(); renderMap(); sound.ding(); check({ type: 'gh-create' });
}
function ghEdit() {
  const gh = GIT.github['my-game']; if (!gh?.commits.length) return;
  const tree = new Map(gh.commits.at(-1).tree);
  tree.set('README.md', `${tree.get('README.md') ?? ''}\nEdited on GitHub by future you!`);
  gh.commits.push({ id: sha(), msg: 'Update README.md', tree, author: GIT.user.name ?? 'Kid', email: GIT.user.email ?? '', date: new Date() });
  print('<span class="mute">(Meanwhile on github.com, someone edited README.md and saved it. GitHub now has a photo your computer does not. Try git pull.)</span>');
  scrollDown(); renderMap(); sound.ding(); check({ type: 'gh-edit' });
}

/* lessons can start from a ready-made sandbox, so jumping ahead never leaves a kid stuck */
const LEVELS = ['a fresh computer', 'my-game is a repository', 'my-game has its first photo', 'GitHub is connected', 'the photos are already on GitHub'];
function stateLevel() {
  const d = find('/home/kid/my-game'), r = d && GIT.repos.get(d.id);
  if (!r) return 0; if (!r.commits.length) return 1;
  const gh = ghRepo(r); if (!gh) return 2;
  return gh.commits.length ? 4 : 3;
}
function fixture(level) {
  resetFS();
  Object.assign(GIT, { repos: new Map(), github: {}, signedIn: false, pushes: 0 });
  if (level < 1) return;
  const dir = find('/home/kid/my-game'); initRepo(dir); sh.cwd = dir;
  const r = GIT.repos.get(dir.id);
  if (level < 2) return;
  GIT.user.name ??= 'Kid'; GIT.user.email ??= 'kid@users.noreply.github.com';
  for (const [p, c] of workFiles(r)) r.index.set(p, c);
  makeCommit(r, 'first version');
  if (level < 3) return;
  GIT.github['my-game'] = { commits: [] }; r.remote = { name: 'origin', url: GH_URL, user: GH_USER, repo: 'my-game' };
  if (level < 4) return;
  GIT.github['my-game'].commits = [...r.commits]; r.upstream = true; GIT.signedIn = true;
}

/* the git map: the four places, live, as the kid types */
const mapEl = $('#map');
function renderMap() {
  const before = new Set([...mapEl.querySelectorAll('[data-k]')].map((e) => e.dataset.k));
  const here = repoOf(), repo = here ?? GIT.repos.get(find('/home/kid/my-game')?.id), gh = GIT.github['my-game'];
  const zone = (cls, title, inner) => `<section class="zone z-${cls}"><h6>${title}</h6>${inner}</section>`;
  const row = (k, name, tag, tcls) => `<div class="grow" data-k="${esc(k)}"><span class="nm">${esc(name)}</span>${tag ? `<span class="tag ${tcls}">${tag}</span>` : ''}</div>`;
  const flow = (h) => `<div class="flow">${h}</div>`;
  let h = `<div class="gm-where">You are in <code>${esc(pretty(sh.cwd))}</code> ${here ? '<b class="yes">repository ✓</b>' : '<b class="no">not a repository</b>'}</div>`;
  if (!repo) {
    const files = sh.cwd.children.filter((c) => !c.name.startsWith('.'));
    h += zone('folder', 'Your folder', files.map((c) => row('f:' + c.name, c.name + (c.type === 'dir' ? '/' : ''), '', '')).join('') || '<div class="empty">(empty)</div>')
      + `<div class="note">git is not watching any folder yet. <code>cd my-game</code>, then <code>git init</code>.</div>`;
  } else {
    const st = gitStatus(repo), W = workFiles(repo), stagedSet = new Set(st.staged.map((x) => x.p)), un = new Map(st.unstaged.map((x) => [x.p, x.k]));
    const paths = [...new Set([...W.keys(), ...repo.index.keys()])].sort();
    const tagFor = (p) => st.ignored.includes(p) ? ['ignored', 't-ign'] : st.untracked.includes(p) ? ['not watched', 't-new'] : un.get(p) === 'deleted' ? ['deleted', 't-del'] : un.has(p) ? ['changed', 't-mod'] : stagedSet.has(p) ? ['on stage', 't-stage'] : ['saved ✓', 't-ok'];
    if (!here) h += `<div class="note">Showing <code>${esc(pretty(repo.dir))}</code>.</div>`;
    h += zone('folder', `Your folder <small>${esc(pretty(repo.dir))}</small>`, paths.map((p) => { const [t, c] = tagFor(p); return row('f:' + p, p, t, c); }).join('') || '<div class="empty">(empty)</div>');
    h += flow('<b>git add</b> ↓');
    h += zone('stage', 'The stage', st.staged.map((x) => row('s:' + x.p, x.p, x.k, 't-stage')).join('') || '<div class="empty">(empty: nothing waiting for a photo)</div>');
    h += flow('<b>git commit</b> ↓');
    const cs = [...repo.commits].reverse();
    h += zone('album', 'Photo album <small>.git</small>', cs.slice(0, 4).map((c, i) => `<div class="grow" data-k="c:${c.id}"><span class="sha">${c.id}</span><span class="nm">${esc(c.msg)}</span>${i === 0 ? '<span class="tag t-head">HEAD</span>' : ''}</div>`).join('')
      + (cs.length > 4 ? `<div class="empty">+ ${cs.length - 4} older</div>` : '') || '<div class="empty">(no photos yet)</div>');
    h += flow('<b>git push</b> ↓ &nbsp; ↑ <b>git pull</b>');
    const sy = sync(repo);
    const cloud = !gh ? '<div class="empty">No repository on GitHub yet.</div><button data-gh="create">Create repository “my-game”</button>'
      : `<div class="url">github.com/kid/my-game</div>${repo.remote ? '' : '<button data-gh="remote">Type the remote command for me</button>'}`
        + [...gh.commits].reverse().slice(0, 3).map((c) => `<div class="grow" data-k="g:${c.id}"><span class="sha">${c.id}</span><span class="nm">${esc(c.msg)}</span></div>`).join('')
        + (!gh.commits.length ? '<div class="empty">(empty: nothing pushed yet)</div>' : '')
        + (sy ? `<div class="sync">${sy.ahead && sy.behind ? 'Both sides have new photos' : sy.ahead ? `${sy.ahead} photo${sy.ahead > 1 ? 's' : ''} to push` : sy.behind ? `${sy.behind} new on GitHub: git pull` : gh.commits.length ? 'In sync ✓' : ''}</div>` : '')
        + (gh.commits.length ? '<button data-gh="edit" class="alt">Edit README on GitHub</button>' : '');
    h += zone('cloud', 'GitHub <small>in the cloud</small>', cloud);
  }
  mapEl.innerHTML = `<div class="gm">${h}</div>`;
  if (before.size && !REDUCED) mapEl.querySelectorAll('[data-k]').forEach((el) => { if (!before.has(el.dataset.k)) el.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1 }, { transform: 'none' }], { duration: 500, easing: 'ease-out' }); });
  if (PANELS?.[panelIdx]?.lesson) requestAnimationFrame(() => fitAll($('#p-lesson')));
}
mapEl.addEventListener('click', (e) => {
  const a = e.target.closest('[data-gh]')?.dataset.gh;
  if (a === 'create') ghCreate();
  if (a === 'edit') ghEdit();
  if (a === 'remote') { termIn.value = `git remote add origin ${GH_URL}`; termIn.focus({ preventScroll: true }); sound.blip(); }
});

