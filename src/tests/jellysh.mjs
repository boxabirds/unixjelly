// The shell on its own: no browser, no page, no lessons. Each check is what real bash does.
// Run: node tests/jellysh.mjs
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const JellySh = new Function(fs.readFileSync(path.join(here, '../shell/jellysh.js'), 'utf8') + '\nreturn JellySh;')();

// A small computer: kid's home with a few files, a bin with real programs, and a second user's home.
const BIN = ['cat', 'ls', 'echo', 'grep', 'wc', 'chmod'];
function tree(spec, parent = null, name = '') {
  const dir = typeof spec === 'object';
  const n = { id: name, name, type: dir ? 'dir' : 'file', content: dir ? '' : spec, children: dir ? [] : null, parent };
  if (dir) n.children = Object.entries(spec).map(([k, v]) => tree(v, n, k.replace(/\/$/, '')));
  return n;
}
const SPEC = {
  'bin/': Object.fromEntries(BIN.map((b) => [b, '01001010 01000101 (machine code)'])),
  'home/': {
    'kid/': { 'a.txt': 'apple\nbanana\ncherry', 'b.txt': 'bean', 'c.md': '# notes', '.hidden': 'shh', 'snacks/': { 'pizza.txt': 'PIZZA', 'cookie.txt': 'COOKIE' }, 'star*.txt': 'a star in a name' },
    'sib/': { 'plans.txt': 'secret plans' },
  },
  'tmp/': {},
};
function shell(opts = {}) {
  const s = JellySh.create(opts);
  s.reset(tree(SPEC));
  return s;
}
let failures = 0, count = 0;
const plain = (r) => r.out.filter((o) => !o.c).map((o) => o.t).join('\n');
const errors = (r) => r.out.filter((o) => o.c === 'er').map((o) => o.t).join('\n');
function check(name, got, want) {
  count++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { failures++; console.log(`✗ ${name}\n    got:  ${JSON.stringify(got)}\n    want: ${JSON.stringify(want)}`); }
}

// --- wildcards ---
let s = shell();
check('* matches names, sorted, not hidden ones', plain(s.run('echo *.txt')), 'a.txt b.txt star*.txt');
check('? matches one character', plain(s.run('echo ?.md')), 'c.md');
check('[ab] matches a set', plain(s.run('echo [ab].txt')), 'a.txt b.txt');
check('[!a] excludes', plain(s.run('echo [!a].txt')), 'b.txt');
check('no match: the word is passed on as typed', plain(s.run('echo *.zip')), '*.zip');
check('wildcards inside a folder path', plain(s.run('echo snacks/*.txt')), 'snacks/cookie.txt snacks/pizza.txt');
check('a dot pattern matches hidden files', plain(s.run('echo .h*')), '.hidden');
check('quoted wildcards stay plain', plain(s.run('echo "*.txt"')), '*.txt');
check('escaped wildcards stay plain', plain(s.run('echo \\*.txt')), '*.txt');
check('a quoted * in a pattern matches a real *', plain(s.run('echo star"*".txt')), 'star*.txt');
check('~/ patterns keep the ~', plain(s.run('echo ~/snacks/p*')), '/home/kid/snacks/pizza.txt');
check('cat with a wildcard reads every match', plain(s.run('cat snacks/*')), 'COOKIE\nPIZZA');
s.run('rm snacks/*.txt');
check('rm with a wildcard', plain(s.run('ls snacks')), '');

// --- exit codes, && and || ---
s = shell();
check('success is 0', s.run('true').status, 0);
check('false is 1', s.run('false').status, 1);
check('unknown command is 127', s.run('nope').status, 127);
check('$? is the last status', plain(s.run('false; echo $?')), '1');
check('$? after success', plain(s.run('true; echo $?')), '0');
check('&& runs only after success', plain(s.run('true && echo yes')), 'yes');
check('&& skips after failure', plain(s.run('false && echo yes')), '');
check('|| runs only after failure', plain(s.run('false || echo rescue')), 'rescue');
check('|| skips after success', plain(s.run('true || echo rescue')), '');
check('chains', plain(s.run('cat nothing.txt && echo found || echo missing')), 'missing');
check('grep with no match is 1', s.run('grep zebra a.txt').status, 1);
check('grep with a match is 0', s.run('grep apple a.txt').status, 0);
check('grep on a missing file is 2', s.run('grep apple nothing.txt').status, 2);
check('ls on a missing file is 2', s.run('ls nothing').status, 2);
check('a pipeline has the status of its last command', s.run('grep zebra a.txt | wc -l').status, 0);
check('; runs both', plain(s.run('echo one; echo two')), 'one\ntwo');

// --- quoting, variables, ~ ---
s = shell();
check('single quotes keep $ as it is', plain(s.run("echo '$HOME'")), '$HOME');
check('double quotes expand variables', plain(s.run('echo "$HOME"')), '/home/kid');
check('quotes keep spaces together', s.run('echo "a  b" c').args, ['a  b', 'c']);
check('backslash keeps a space', s.run('echo a\\ b').args, ['a b']);
check('set and use a variable', plain(s.run('name=Sam; echo hi $name')), 'hi Sam');
check('${name} works too', plain(s.run('x=jelly; echo ${x}fish')), 'jellyfish');
check('an unset variable is empty', plain(s.run('echo [$nothing]')), '[]');
check('a variable just for one command', plain(s.run('greeting=hi; greeting=bye echo ok; echo $greeting')), 'ok\nhi');
check('export and unset', plain(s.run('export pet=Hammy; unset pet; echo [$pet]')), '[]');
check('echo ~', plain(s.run('echo ~')), '/home/kid');
check('# starts a comment', plain(s.run('echo yes # not this')), 'yes');
check('unclosed quote is a syntax error', s.run('echo "oops').status, 2);
check('| with nothing after is a syntax error', s.run('ls |').status, 2);

// --- pipes and redirects ---
s = shell();
check('pipe into grep', plain(s.run('cat a.txt | grep an')), 'banana');
check('pipe into wc -l', plain(s.run('cat a.txt | wc -l')), '3');
check('ls output goes down a pipe', plain(s.run('ls | wc -l')), '5');
check('three-stage pipe', plain(s.run('cat a.txt | sort | head -n 1')), 'apple');
check('tail', plain(s.run('tail -n 1 a.txt')), 'cherry');
s.run('echo first > out.txt'); s.run('echo second >> out.txt');
check('> then >>', s.find('out.txt').content, 'first\nsecond');
s.run('echo fresh > out.txt');
check('> replaces', s.find('out.txt').content, 'fresh');
check('< reads a file', plain(s.run('wc -l < a.txt')), '3');
check('errors are not written into the file', (s.run('cat nothing.txt > err.txt'), s.find('err.txt').content), '');
check('> into a missing folder fails', s.run('echo x > nowhere/x.txt').status, 1);

// --- programs, scripts and the PATH ---
s = shell();
check('/bin/ls runs ls', plain(s.run('/bin/ls snacks')), 'cookie.txt  pizza.txt');
s.run('echo "echo hello from a script" > hi.sh');
check('a script runs line by line', plain(s.run('./hi.sh')), 'hello from a script');
s.run('echo "echo you said \\$1" > say.sh');
check('scripts get $1', plain(s.run('./say.sh jelly')), 'you said jelly');
s.run('echo "nope" > broken.sh'); s.run('echo "echo still going" >> broken.sh');
const broken = s.run('./broken.sh');
check('a failed line names the script and line', errors(broken), './broken.sh: line 1: nope: command not found');
check('and the script carries on, like bash', plain(broken), 'still going');
s.run('mkdir -p ~/bin'); s.run('echo "echo from my bin" > ~/bin/mine');
check('programs in ~/bin run by name', plain(s.run('mine')), 'from my bin');
check('which finds programs', plain(s.run('which ls')), '/bin/ls');
check('which knows cd is not a program', s.run('which cd').status, 1);
check('missing ./program', s.run('./nothing').status, 127);

// --- people and locks ---
const USERS = { root: { uid: 0, groups: ['root'] }, kid: { uid: 1000, groups: ['kid', 'sudo', 'family'] }, sib: { uid: 1001, groups: ['sib', 'family'] } };
const GIDS = { root: 0, sudo: 27, kid: 1000, sib: 1001, family: 1002 };
s = shell({ users: USERS, gids: GIDS });
const own = (n, o, g) => { n.owner = o; n.group = g; n.children?.forEach((c) => own(c, o, g)); };
own(s.sh.root, 'root', 'root'); own(s.find('/home/kid'), 'kid', 'kid'); own(s.find('/home/sib'), 'sib', 'sib');
s.find('/home/sib/plans.txt').mode = 0o600;
check('new files are 644', (s.run('touch new.txt'), s.modeStr(s.find('new.txt'))), '-rw-r--r--');
check('and belong to whoever made them', [s.find('new.txt').owner, s.find('new.txt').group], ['kid', 'kid']);
check('a private file is locked', errors(s.run('cat /home/sib/plans.txt')), 'cat: /home/sib/plans.txt: Permission denied');
s.run('echo "echo locked" > run.sh');
check('no x: Permission denied, status 126', s.run('./run.sh').status, 126);
s.run('chmod u+x run.sh');
check('chmod u+x lets it run', plain(s.run('./run.sh')), 'locked');
check('chmod letters', (s.run('chmod go-r a.txt'), s.modeStr(s.find('a.txt'))), '-rw-------');
check('chmod numbers', (s.run('chmod 754 a.txt'), s.modeStr(s.find('a.txt'))), '-rwxr-xr--');
check('chmod 9 is invalid', s.run('chmod 900 a.txt').status, 1);
check('id', plain(s.run('id')), 'uid=1000(kid) gid=1000(kid) groups=1000(kid),27(sudo),1002(family)');
s.run('su sib');
check('su switches user', plain(s.run('whoami')), 'sib');
check('sib cannot change kid\'s lock', s.run('chmod 777 /home/kid/a.txt').status, 1);
check('sib is not in sudoers', s.run('sudo whoami').status, 1);
s.run('exit');
check('exit goes back', plain(s.run('whoami')), 'kid');
check('sudo runs as root', plain(s.run('sudo whoami')).split('\n').at(-1), 'root');
check('root can read anything', plain(s.run('sudo cat /home/sib/plans.txt')).split('\n').at(-1), 'secret plans');
s.run('mkdir club'); s.run('chgrp family club'); s.run('chmod g+w club');
s.run('su sib'); s.run('touch /home/kid/club/x');
check('group keys let sib write in a family folder', !!s.find('/home/kid/club/x'), true);
s.run('exit');

// --- hooks: the guide's teaching voice ---
s = shell({ hooks: { pathMiss: (p) => [`<b>explain ${p}</b>`], tip: (key, text) => key === 'rm.dir' ? 'custom tip' : text } });
const miss = s.run('cat snakcs/pizza.txt');
check('pathMiss adds the guide\'s note', miss.out.filter((o) => o.h).map((o) => o.h), ['<b>explain snakcs/pizza.txt</b>']);
check('tip hook rewords a tip', s.run('rm snacks').out.find((o) => o.c === 'tip').t, 'custom tip');
s.define('hello', (c) => c.say(`hello, ${c.args[0] ?? 'world'}`));
check('define adds a command', plain(s.run('hello jelly')), 'hello, jelly');
check('defined commands join pipes', plain(s.run('hello | wc -w')), '2');

console.log(failures ? `FAIL ${failures} of ${count} checks` : `PASS ${count} checks`);
process.exitCode = failures ? 1 : 0;
