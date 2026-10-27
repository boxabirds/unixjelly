# The engine's shell becomes jellysh (src/shell/jellysh.js), a self-contained module.
# This file swaps the old hand-written run() for the module, keeps the names the guides already use
# (sh, find, pathOf, pretty, …) pointing at it, and plugs Shell Jelly's teaching voice in through hooks.
# Run by shelly-patch.py, after every other engine patch.

region('/* ---------------- section 3: the pretend computer ---------------- */\n', 'let nid = 0;',
       '/* ---------------- section 3: the pretend computer ---------------- */\n' + open('shell/jellysh.js').read().replace("if (typeof module !== 'undefined') module.exports = JellySh;\n", '') + '\n')

rep("const sh = { root: null, home: null, cwd: null, hist: [], hi: 0, catMode: false, userDirs: new Set(), showHidden: false };",
    """// The shell itself. Guides add commands with SH.define() and their teaching voice with SH.configure({ hooks }).
const SH = JellySh.create({ newId: () => 'n' + nid++ }), sh = SH.sh;""")
rep("""function resetFS() {
  sh.root = seed(); sh.home = find('/home/kid'); sh.cwd = sh.home; sh.userDirs.clear(); sh.showHidden = false;
}""", """function resetFS() {
  SH.reset(seed());
}""")
region("  SH.reset(seed());\n}\nfunction find(path, from = sh.cwd) {", "\nconst MAN = {", """  SH.reset(seed());
}
const find = SH.find, pathOf = SH.pathOf, pretty = SH.pretty, splitPath = SH.splitPath, sortKids = SH.sortKids, within = SH.within, clone = SH.clone, fixParents = SH.fixParents;
""")

# run(): the old switch statement is gone. What stays here is only what is about this guide: its voice and its extras.
i = s.index('function run(line) {'); j = s.index('\n}\n', i) + 3
s = s[:i] + r"""// Shell Jelly's voice: Shelly explains paths that don't exist, and helps with typos and words from other computers.
SH.configure({
  manual: MAN,
  hooks: {
    pathMiss: (p, line) => explainPath(p, line),
    before: (c) => { if (['cd', 'ls', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'touch'].includes(c.cmd)) firstPathTips(c.rest, c.say); },
    notFound: (c) => {
      const cmd = c.cmd, lower = cmd.toLowerCase();
      if (BIN.includes(lower) || lower === 'cd') c.fail(`${cmd}: command not found`, `The shell is super picky about capitals. Try lowercase: ${lower}`, 127);
      else if (cmd === 'cd..') c.fail('cd..: command not found', 'Put a space between them: cd ..', 127);
      else if (cmd === 'dir') c.fail('dir: command not found', 'dir is a Windows word. Here we say ls.', 127);
      else if (cmd === 'cls') c.fail('cls: command not found', 'cls is a Windows word. Here we say clear.', 127);
      else if (/^(hi|hello|hey)$/i.test(cmd)) c.fail(`${cmd}: command not found`, 'The shell is a program, not a person. To make it say hello, type: echo hello', 127);
      else if (cmd === 'please') c.say('Aww, polite! The shell does not need please, but King Kernel appreciates it.', 'tip');
      else {
        const words = [...BIN, 'cd', 'help', 'history', 'whoami'], near = words.find((w) => typoDist(w, lower) <= (cmd.length > 3 ? 2 : 1));
        c.fail(`${cmd}: command not found`, null, 127);
        if (near) { c.note(shelly(`I don't know <b>${esc(cmd)}</b>. Did you mean <b>${near}</b>?`)); c.note(tryCmd(c.line.replace(cmd, near))); }
        else c.say('Type help to see the words I know.', 'tip');
      }
      return true;
    },
    tip: (key, text) => key === 'sudo.no' && !SH.users ? 'sudo means "super-user do". Only the computer\'s boss account is allowed. (We told your mum.)' : text,
  },
});
// Commands that belong to this guide rather than to a Unix computer.
SH.define('clear', (c) => { c.info.clear = true; });
SH.define('man', (c) => {
  const m = MAN[c.rest[0]];
  if (!c.rest[0]) return c.fail('What manual page do you want?', 'Try: man ls');
  if (!m) return c.fail(`No manual entry for ${c.rest[0]}`);
  c.note('<span class="wiz">The Grumpy Wizard opens his enormous book. *cough*</span>');
  c.say(`${c.rest[0].toUpperCase()}(1)`, 'mute'); c.say('NAME', 'dir'); c.say('    ' + m[0]); c.say('SYNOPSIS', 'dir'); c.say('    ' + m[1]); c.say('DESCRIPTION', 'dir'); c.say('    ' + m[2]); c.say('EXAMPLE', 'dir'); c.say('    ' + m[3]);
  c.say('(On a real computer, press q to quit the manual.)', 'tip');
});
SH.define('help', (c) => { c.say('Words I know: ' + ['pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'clear', 'man', 'history', 'whoami', 'date'].join('  ')); c.say('There might be a few secret ones too...', 'tip'); });
SH.define('sl', (c) => { c.note(`<div class="train">${esc(String.raw`      ====        ________
  _D _|  |_______/        \__I_I_____
   |(_)---  |   H\________/ |   |
   /     |  |   H  |  |     |   |
  |      |  |   H  |__-----------
  | ________|___H__/__|_____/[][]~\_
  |/ |   |-----------I_____I [][] []
  __/ =| o |=-~~\  /~~\  /~~\  /~~\
   |/-=|___|=    ||    ||    ||    |
    \_/      \O=====O=====O=====O_/`)}</div>`); c.say('You typed sl instead of ls. Choo choo! The train of typos.', 'tip'); });
SH.define('cowsay', (c) => { const m = c.args.join(' ') || 'moo'; c.say(String.raw` ${'_'.repeat(m.length + 2)}
< ${m} >
 ${'-'.repeat(m.length + 2)}
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||`); });
const run = (line) => SH.run(line);
""" + s[j:]
