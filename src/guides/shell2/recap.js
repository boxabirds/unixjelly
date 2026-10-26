/* recap data */
const RECAP = {
  wizard: 'Shell boss!', wizardText: 'You wrote your own commands, read every lock and borrowed the boss\'s power. Now you know who\'s in charge.',
  chain: [
    { label: 'You', sub: 'type a command' },
    { label: 'Shell', sub: 'finds the program on the PATH', via: 'Enter' },
    { label: 'The lock', sub: 'owner? group? everyone else?', via: 'whose keys?' },
    { label: 'Kernel', sub: 'does it, or says Permission denied', via: 'r · w · x' },
  ],
  line: 'Every file has an owner, a group and a lock. The kernel checks your keys every single time.',
  words: {
    whoami: { does: 'Prints which account you are using. The prompt says it too: who@computer:where$', ex: 'whoami', quiz: 'Who is the computer treating you as right now?' },
    redirect: { does: '> sends a command\'s words into a file. >> adds to the end.', ex: 'echo hi > note.txt', quiz: 'Write "hello" into a new file called hi.txt.' },
    nano: { does: 'A little text editor in the terminal. Ctrl+O saves, Ctrl+X exits.', ex: 'nano note.txt', quiz: 'Change one word in note.txt, without starting it again.' },
    which: { does: 'Every command is a program file. which says where it lives.', ex: 'which ls', quiz: 'Where does the cat program live?' },
    dotslash: { does: 'A script is a file of commands. ./ runs the one in this folder.', ex: './hello', quiz: 'Run the program called game in this folder.' },
    lsl: { does: 'Shows every lock: owner, group and everyone else. r read, w write, x run.', ex: 'ls -l', quiz: 'How can you see who owns a file and who has which keys?' },
    chmod: { does: 'Changes a lock. Who (u g o a), + or -, which keys.', ex: 'chmod u+x hello', quiz: 'Let yourself run the file called game.' },
    path: { does: 'The PATH is where the shell looks for programs. Put yours in ~/bin to use it anywhere.', ex: 'echo $PATH', quiz: 'Where does the shell look for commands?' },
    groups: { does: 'id shows your groups. A group shares the middle set of keys.', ex: 'chgrp family comics', quiz: 'Give the comics folder to the family group.' },
    su: { does: 'Become another user, with their keys. exit comes back.', ex: 'su sib', quiz: 'How could you check what sib can see?' },
    sudo: { does: 'One command as root, the boss user. Only the sudo group may. Think first!', ex: 'sudo whoami', quiz: 'Root has two meanings. What are they?' },
    grep: { does: 'Prints every line with a word in it. -i ignores capitals.', ex: 'grep cookie diary.txt', quiz: 'Find every line about pizza in menu.txt.' },
    pipe: { does: 'Pours one command\'s words into the next one.', ex: 'grep cookie kitchen.log | wc -l', quiz: 'Count the lines in kitchen.log that mention sib.' },
    binary: { does: 'r = 4, w = 2, x = 1. Add them for each set: 644, 755, 600.', ex: 'chmod 600 note.txt', quiz: 'What does 7 mean? Why is there no 9?' },
    quest: { does: 'Build it, lock it, test it as someone else.', ex: 'su sib', quiz: 'You locked something. How do you check the lock really works?' },
  },
};
/* end recap data */
