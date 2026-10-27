/* recap data */
const RECAP = {
  wizard: 'Security wizard!', wizardText: 'You wore both hats. Now go and build things that are hard to break.',
  chain: [
    { label: 'Black hat', sub: 'finds the way in' },
    { label: 'White hat', sub: 'fixes the hole', via: 'swap hats' },
    { label: 'Black hat', sub: 'tries again, fails', via: 'test it' },
    { label: 'Report', sub: 'tell the owner', via: 'disclose' },
  ],
  line: 'Same skills, different permission. Attack only with permission, fix what you find, tell the owner.',
  words: {
    hats: { does: 'Black hat breaks in without permission. White hat (ethical hacker) has permission and reports.', ex: 'sign permission-slip.txt', quiz: 'What is the one difference between a black hat and a white hat?' },
    keys: { does: 'Least privilege: only the keys you need. chmod changes the lock.', ex: 'chmod go-rw diary.txt', quiz: 'Lock your diary so only you can read it.' },
    guess: { does: 'Sites keep a fingerprint (hash) of your password. Attackers guess with lists of popular ones: a dictionary attack.', ex: 'fingerprint purplecactusbanjo', quiz: 'Why is purplecactusbanjo safer than pizza123?' },
    knock: { does: 'Bots knock on every computer all night. Change every default password: secure by default.', ex: 'grep -c FAILED server.log', quiz: 'What password does every bot try first?' },
    room: { does: 'Isolation: run programs you don\'t trust where they can\'t reach your things.', ex: 'su room', quiz: 'A download asks for sudo. What do you do?' },
    layers: { does: 'Defence in depth: several layers, so one failure isn\'t the end.', ex: 'password · default · locks · spare room', quiz: 'Your password leaked. Which layer still protects your diary?' },
    grey: { does: 'Found a way in? Stop, don\'t peek, tell the owner.', ex: 'coordinated vulnerability disclosure', quiz: 'You can see another pupil\'s marks by accident. What now?' },
  },
};
/* end recap data */
