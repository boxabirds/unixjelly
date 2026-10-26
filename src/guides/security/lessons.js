const isCmd = (e, c) => e.type === 'cmd' && e.cmd === c;
const chose = (k) => (e) => e.type === 'choice' && e.k === k;
// Each mission step says which hat you wear: black (think like the attacker) or white (fix it).
// In the sandbox both are allowed: Jelly Security HQ signed your permission slip, so you are a red team, not a criminal.
const LESSONS = [
  { id: 'hats', word: 'hats', name: 'Pick your hat', stands: 'Ethical hacking', color: '#ff4d6d', tool: 'term', seq: true, onlyHere: true,
    visual: `<table class="terms"><thead><tr><th>You will hear</th><th>Grown-ups now say</th></tr></thead><tbody>
      <tr><td><b class="hat-chip black">black hat</b></td><td>malicious hacker, attacker, criminal</td></tr>
      <tr><td><b class="hat-chip white">white hat</b></td><td>ethical hacker, security researcher, penetration tester ("pentester": paid to break in, with permission)</td></tr>
      <tr><td><b class="hat-chip grey">grey hat</b></td><td>hacking without permission "to help". Still against the law.</td></tr>
      <tr><td><b>red team</b> / <b>blue team</b></td><td>attackers who are <i>allowed</i>, and the defenders</td></tr></tbody></table>`,
    title: 'Same skills, different permission', why: 'In old cowboy films, the baddie wore a black hat and the hero wore a white one. Computer people borrowed the idea. A <b>black hat</b> breaks into things without permission. A <b>white hat</b> uses exactly the same skills, but only with the owner\'s permission, and tells them what they found so it gets fixed. The skills are the same. The <b>permission</b> is the difference.',
    mnem: 'Same skills. Different permission.',
    points: ['In this guide you wear both hats. The black hat helps you think like an attacker. The white hat fixes the hole.', 'Jelly Security HQ has signed your permission slip for this pretend computer. That makes you a <b>red team</b>: attackers who are allowed.', 'Outside the sandbox, getting into anything without permission is against the law. In the UK it is the <b>Computer Misuse Act</b>. Most countries have a law like it.'],
    steps: [
      { t: 'Read your permission slip: <code>cat permission-slip.txt</code>', ok: (e) => isCmd(e, 'cat') && e.info.hits?.some((h) => h.endsWith('permission-slip.txt')) },
      { t: 'Sign it with the little program HQ made for you: <code>sign permission-slip.txt</code>', ok: (e) => isCmd(e, 'sign') && e.ok },
      { t: 'Ask the computer which account you are using: <code>whoami</code>', ok: (e) => isCmd(e, 'whoami') && store.signed },
    ] },
  { id: 'keys', word: 'chmod', name: 'Keys you don\'t need', stands: 'Least privilege', color: '#9b5cff', tool: 'term', seq: true, onlyHere: true,
    visual: `<div class="permviz"><p class="tv-note">Your diary, as <code>ls -l</code> shows it:</p><div class="lsl"><span class="pv t">-</span><span class="pv u">rw-</span><span class="pv g">rw-</span><span class="pv o">rw-</span><span class="pv n">kid</span><span class="pv n">family</span><span class="pv n">diary.txt</span>
      <small>file</small><small>owner's keys</small><small>family's keys</small><small>everyone else's keys</small><small>owner</small><small>group</small><small>name</small></div><p class="tv-note"><b>r</b> read · <b>w</b> write · <b>x</b> run · <b>-</b> no key</p></div>`,
    title: 'Only the keys you need', why: 'Look at your diary in the picture. Every file has a lock with three sets of keys: one for its <b>owner</b> (you, kid), one for its <b>group</b> (the family: you and your sibling), and one for <b>everyone else</b>. All three sets say <b>rw-</b>: read and write. So the diary\'s lock hands keys to everybody. Security engineers have a rule for this, called <b>least privilege</b>: give each person only the keys they really need. Nobody needs to read your diary except you.',
    mnem: 'Only the keys you need. No spare keys.',
    points: ['<code>ls -l</code> (l for long) shows every file\'s lock. <code>su sib</code> lets you be your sibling for a bit, and <code>exit</code> brings you back.', '<code>chmod</code> changes the lock. Say who, then <b>-</b> to take keys away or <b>+</b> to give them, then which keys. <code>chmod go-rw diary.txt</code>: <b>g</b>roup and <b>o</b>thers lose <b>r</b> and <b>w</b>.', 'Who: <b>u</b> = owner (it stands for user), <b>g</b> = group, <b>o</b> = others (everyone else). Only a file\'s owner can change its lock.'],
    steps: [
      { hat: 'black', t: 'You are the attacker now. Look at the locks on the files: <code>ls -l</code>. Who has keys to the diary?', ok: (e) => isCmd(e, 'ls') && e.args.some((a) => /^-\w*l/.test(a)) },
      { hat: 'black', t: 'Become your little sibling: <code>su sib</code>', ok: (e) => isCmd(e, 'su') && e.ok && sh.user === 'sib' },
      { hat: 'black', t: 'As sib, read the diary: <code>cat diary.txt</code>. Can you get in?', ok: (e) => isCmd(e, 'cat') && sh.user === 'sib' && e.info.hits?.some((h) => h.endsWith('/kid/diary.txt')) },
      { hat: 'white', t: 'Swap hats. Go back to being you: <code>exit</code>', ok: (e) => isCmd(e, 'exit') && sh.user === 'kid' },
      { hat: 'white', t: 'Take the keys away from the group and everyone else: <code>chmod go-rw diary.txt</code>', ok: (e) => isCmd(e, 'chmod') && e.ok && !(modeOf(find('/home/kid/diary.txt')) & 0o077) },
      { hat: 'black', t: 'Black hat back on. Try the attack again: <code>su sib</code>, then <code>cat diary.txt</code>', ok: (e) => isCmd(e, 'cat') && sh.user === 'sib' && e.info.denied },
    ] },
  { id: 'grey', word: 'grey', name: 'The grey zone', stands: 'Doing the right thing', color: '#ffc61a', tool: 'term', seq: true, onlyHere: true,
    visual: `<div class="permviz"><div class="tz-eq">Found a way in <b>≠</b> allowed in</div><p class="tv-note">Stop. Don't peek. Tell the owner.</p></div>`,
    title: 'What would a white hat do?', why: 'Sometimes you stumble on a way in without even trying. A <b>grey hat</b> goes through anyway, even if they mean well. That is still breaking in, and still against the law. A white hat stops, doesn\'t look around, and tells the owner the right way. Nobody here is in trouble: these are choices to practise.',
    mnem: 'Stop. Don\'t peek. Tell the owner.',
    points: ['Finding a way in is not permission to use it.', 'Report it the right way: the website\'s "report a problem" page, or a grown-up you trust. Many websites also keep a file called <code>security.txt</code> that says who to tell. Security people call this <b>coordinated vulnerability disclosure</b>. You will also hear its older name, <b>responsible disclosure</b>.', 'Anyone asking for your password, or offering to knock someone offline, is wearing a black hat. Say no and tell someone.'],
    steps: [
      { t: 'You change the number at the end of the school website\'s address, and suddenly you can see <b>another pupil\'s marks</b>. What do you do?', ok: chose(0), choices: [
        { c: 'Look at everyone\'s marks', say: 'That\'s a black-hat move. Looking where you have no permission is unauthorised access, even when the door was left open. Pick again.' },
        { c: 'Screenshot it to show my friends', say: 'Sharing it hurts real people, and it\'s still unauthorised access. Pick again.' },
        { c: 'Close it, and tell a teacher what happened', good: true, say: 'White hat! You stopped, didn\'t look around, and told the owner. That\'s <b>coordinated vulnerability disclosure</b> (older name: responsible disclosure), and it gets the hole fixed for everyone.' },
      ] },
      { t: 'Someone in a game chat offers to <b>knock your rival offline</b> for £5. What do you do?', ok: chose(1), choices: [
        { c: 'Pay them. It\'s only a game', say: 'Knocking someone offline means flooding them with so many fake messages that the real ones can\'t get through. It\'s called a <b>DDoS</b> attack, and the people who sell it are called "booters". Paying for one is against the law too, and they\'ll probably just keep your money. Pick again.' },
        { c: 'Ask how it works, just to see', say: 'Curiosity is great, but this person is a black hat. Don\'t get pulled in. Pick again.' },
        { c: 'Say no, block them, and tell a grown-up', good: true, say: 'Exactly. Saying no to a black hat is a white-hat move.' },
      ] },
      { t: 'Your friend leaves their game <b>logged in</b> at your house. What do you do?', ok: chose(2), choices: [
        { c: 'Spend their coins as a joke', say: 'Using someone else\'s account without permission is unauthorised access, even as a joke. Pick again.' },
        { c: 'Remember their password for later', say: 'Knowing a password isn\'t permission to use it. Pick again.' },
        { c: 'Log them out and tell them', good: true, say: 'Kind, and white hat. You protected their account.' },
      ] },
      { t: 'A website says it will give you <b>free coins</b> if you type in your game login. What do you do?', ok: chose(3), choices: [
        { c: 'Type it in. Free coins!', say: 'That\'s <b>phishing</b>: a black hat collecting logins. Real games never ask for your password on another website. Pick again.' },
        { c: 'Type in a friend\'s login instead', say: 'That hands your friend\'s account to a black hat. Pick again.' },
        { c: 'Close it, and warn my friends', good: true, say: 'Spot on. You just stopped a black-hat trick, for you and your friends.' },
      ] },
    ] },
];
