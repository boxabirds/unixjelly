const isCmd = (e, c) => e.type === 'cmd' && e.cmd === c;
const chose = (k) => (e) => e.type === 'choice' && e.k === k;
// Each mission step says which hat you wear: black (think like the attacker) or white (fix it).
// In the sandbox both are allowed: Security Jelly HQ signed your permission slip, so you are a red team, not a criminal.
const LESSONS = [
  { id: 'hats', teaches: ['hats', 'permission'], word: 'hats', name: 'Pick your hat', stands: 'Ethical hacking', color: '#ff4d6d', tool: 'term', seq: true, onlyHere: true,
    visual: `<table class="terms"><thead><tr><th>You will hear</th><th>Grown-ups now say</th></tr></thead><tbody>
      <tr><td><b class="hat-chip black">black hat</b></td><td>malicious hacker, attacker, criminal</td></tr>
      <tr><td><b class="hat-chip white">white hat</b></td><td>ethical hacker, security researcher, penetration tester ("pentester": paid to break in, with permission)</td></tr>
      <tr><td><b class="hat-chip grey">grey hat</b></td><td>hacking without permission "to help". Still against the law.</td></tr>
      <tr><td><b>red team</b> / <b>blue team</b></td><td>attackers who are <i>allowed</i>, and the defenders</td></tr></tbody></table>`,
    title: 'Same skills, different permission', why: 'In old cowboy films, the baddie wore a black hat and the hero wore a white one. Computer people borrowed the idea. A <b>black hat</b> breaks into things without permission. A <b>white hat</b> uses exactly the same skills, but only with the owner\'s permission, and tells them what they found so it gets fixed. The skills are the same. The <b>permission</b> is the difference.',
    mnem: 'Same skills. Different permission.',
    points: ['In this guide you wear both hats. The black hat helps you think like an attacker. The white hat fixes the hole.', 'Security Jelly HQ has signed your permission slip for this pretend computer. That makes you a <b>red team</b>: attackers who are allowed.', 'Outside the sandbox, getting into anything without permission is against the law. In the UK it is the <b>Computer Misuse Act</b>. Most countries have a law like it.'],
    steps: [
      { t: 'Read your permission slip: <code>cat permission-slip.txt</code>', ok: (e) => isCmd(e, 'cat') && e.info.hits?.some((h) => h.endsWith('permission-slip.txt')) },
      { t: 'Sign it with the little program HQ made for you: <code>sign permission-slip.txt</code>', ok: (e) => isCmd(e, 'sign') && e.ok },
      { t: 'Ask the computer which account you are using: <code>whoami</code>', ok: (e) => isCmd(e, 'whoami') && store.signed },
    ] },
  { id: 'keys', teaches: ['least-privilege'], word: 'chmod', name: 'Keys you don\'t need', stands: 'Least privilege', color: '#9b5cff', tool: 'term', seq: true, onlyHere: true,
    visual: `<div class="permviz"><p class="tv-note">The lock on your diary, as <code>ls -l</code> shows it:</p><div class="lsl"><span class="pv t">-</span><span class="pv u">rw-</span><span class="pv g">rw-</span><span class="pv o">rw-</span><span class="pv n">kid</span><span class="pv n">kid</span><span class="pv n">diary.txt</span>
      <small>file</small><small>owner's keys</small><small>group's keys</small><small>everyone else's keys</small><small>owner</small><small>group</small><small>name</small></div><p class="tv-note"><b>r</b> read · <b>w</b> write · <b>x</b> run · <b>-</b> no key</p></div>`,
    title: 'Only the keys you need', why: 'Remember the locks from Shell Jelly 2? Every file has three sets of keys: for its <b>owner</b> (you, kid), its <b>group</b> (kid: just you) and <b>everyone else</b>. Look at the lock on your diary, <code>diary.txt</code>. All three sets say <b>rw-</b>: read and write. So your sibling, who counts as everyone else, has keys too. Security engineers have a rule for this, called <b>least privilege</b>: give each person only the keys they really need. Nobody needs to read your diary except you.',
    mnem: 'Only the keys you need. No spare keys.',
    points: ['From Shell Jelly 2: <code>ls -l</code> shows every file\'s lock, <code>su sib</code> lets you be your sibling for a bit, and <code>exit</code> brings you back.', 'Also from Shell Jelly 2: <code>chmod</code> changes a lock. <code>chmod go-rw diary.txt</code> means the <b>g</b>roup and <b>o</b>thers lose <b>r</b> and <b>w</b>.', 'Least privilege is the new idea: every key you hand out is a way in. Give out only the ones that are needed.'],
    steps: [
      { hat: 'black', t: 'You are the attacker now. Look at the locks on the files: <code>ls -l</code>. Who has keys to the diary?', ok: (e) => isCmd(e, 'ls') && e.args.some((a) => /^-\w*l/.test(a)) },
      { hat: 'black', t: 'Become your little sibling: <code>su sib</code>', ok: (e) => isCmd(e, 'su') && e.ok && sh.user === 'sib' },
      { hat: 'black', t: 'As sib, read the diary: <code>cat diary.txt</code>. Can you get in?', ok: (e) => isCmd(e, 'cat') && sh.user === 'sib' && e.info.hits?.some((h) => h.endsWith('/kid/diary.txt')) },
      { hat: 'white', t: 'Swap hats. Go back to being you: <code>exit</code>', ok: (e) => isCmd(e, 'exit') && sh.user === 'kid' },
      { hat: 'white', t: 'Take the keys away from the group and everyone else: <code>chmod go-rw diary.txt</code>', ok: (e) => isCmd(e, 'chmod') && e.ok && !(modeOf(find('/home/kid/diary.txt')) & 0o077) },
      { hat: 'black', t: 'Black hat back on. Try the attack again: <code>su sib</code>, then <code>cat diary.txt</code>', ok: (e) => isCmd(e, 'cat') && sh.user === 'sib' && e.info.denied },
    ] },
  { id: 'guess', teaches: ['hashing', 'dictionary-attack'], word: 'guess', name: 'The guessing machine', stands: 'Strong passwords', color: '#3a5bff', tool: 'term', seq: true, onlyHere: true,
    visual: `<div class="fpviz"><span class="pv n">pizza123</span><span class="fp-go">→</span><span class="fp-machine">fingerprint<br/>machine</span><span class="fp-go">→</span><span class="pv n fp">b76b2dbb</span><p class="tv-note">Easy one way. <b>No way back.</b></p></div>`,
    title: 'Fingerprints and guessing machines', why: 'A pretend game site, Jelly Games, has been broken into, and its list of players has leaked. The good news: the site never kept anyone\'s password. It kept a <b>fingerprint</b> of each one, a jumble of letters made from the password. The same password always makes the same fingerprint, but you can\'t turn a fingerprint back into a password. Grown-ups call it a <b>hash</b>. So how do attackers get in? They don\'t turn it back. They <b>guess</b>.',
    mnem: 'Three random words. A different password for every site.',
    points: ['Security Jelly HQ made you a fingerprint machine called <code>fingerprint</code>. Real computers have ones like it, with much longer fingerprints.', 'Attackers fingerprint thousands of popular passwords in advance, then look for a match. That is a <b>dictionary attack</b>, and a short or popular password falls in seconds.', 'Three random words stuck together, like <b>purplecactusbanjo</b>, are long and on nobody\'s list. And give every site its own password, so one leak opens only one door.'],
    steps: [
      { hat: 'black', t: 'You are the attacker. Look at the leaked list: <code>cat leak/players.txt</code>', ok: (e) => isCmd(e, 'cat') && e.info.hits?.some((h) => h.endsWith('/leak/players.txt')) },
      { hat: 'black', t: 'Try the fingerprint machine: <code>fingerprint jelly</code>', ok: (e) => isCmd(e, 'fingerprint') && e.args[0] === 'jelly' },
      { hat: 'black', t: 'Change one letter and try again: <code>fingerprint Jelly</code>. Is the fingerprint a bit different, or totally different?', ok: (e) => isCmd(e, 'fingerprint') && e.args[0] === 'Jelly' },
      { hat: 'black', t: 'Attackers keep a list of popular passwords, fingerprinted in advance. Peek at the top of it: <code>head leak/common.txt</code>', ok: (e) => isCmd(e, 'head') && e.ok && e.args.some((a) => a.endsWith('common.txt')) },
      { hat: 'black', t: 'sib\'s fingerprint is <b>b76b2dbb</b>. Look for it in the list: <code>grep b76b2dbb leak/common.txt</code>', ok: (e) => isCmd(e, 'grep') && e.args.includes('b76b2dbb') && e.info.matches > 0 },
      { hat: 'white', t: 'Swap hats. Make sib a strong new password from three random words, and fingerprint it. Like: <code>fingerprint purplecactusbanjo</code>', ok: (e) => isCmd(e, 'fingerprint') && e.info.strong },
      { hat: 'black', t: 'Black hat back on. Look for the new fingerprint in the list: <code>grep</code>, then the fingerprint, then <code>leak/common.txt</code>', ok: (e) => isCmd(e, 'grep') && store.newFp && e.args.includes(store.newFp) && e.info.matches === 0 },
    ] },
  { id: 'knock', teaches: ['bots', 'secure-default'], word: 'bots', name: 'Knock knock, all night', stands: 'Secure by default', color: '#62c934', tool: 'term', seq: true, onlyHere: true,
    visual: `<pre class="logviz">03:12:07  FAILED  user=root   password=123456
03:12:09  FAILED  user=admin  password=password
03:12:12  FAILED  user=pi     password=raspberry
<b>05:41:07  OK      user=admin  password=admin</b></pre><p class="tv-note">One night on a little game server. Nobody was awake.</p>`,
    title: 'The knockers never sleep', why: 'Your family runs a little game server: a computer on the internet where friends can play. Who knocks on its door at 3 in the morning? Not people. <b>Bots</b>: programs that try the same few passwords on every computer they can find, all day and all night. They aren\'t after you. They try everyone. A new computer on the internet gets its first knock within minutes. The server keeps a <b>log</b>, a diary of everything that happened, and the log tells the story.',
    mnem: 'Bots never sleep. Change every default password.',
    points: ['A <b>log</b> is a computer\'s diary. <code>grep</code> from Shell Jelly 2 finds the lines that matter: <code>-c</code> counts them.', 'A <b>default password</b> is the one a thing comes with, like <b>admin</b>. Every bot tries it first.', '<b>Secure by default</b> means safe straight out of the box, before anyone changes a setting. Since 2024, UK law bans new smart gadgets from all sharing one default password.'],
    steps: [
      { hat: 'black', t: 'Think like a bot. Read the start of last night\'s log: <code>head server/server.log</code>', ok: (e) => isCmd(e, 'head') && e.ok && e.args.some((a) => a.endsWith('server.log')) },
      { hat: 'black', t: 'How many knocks failed in one night? <code>grep -c FAILED server/server.log</code>', ok: (e) => isCmd(e, 'grep') && e.args.some((a) => /^-\w*c/.test(a)) && e.args.includes('FAILED') },
      { hat: 'black', t: 'Did any bot get in? <code>grep OK server/server.log</code>', ok: (e) => isCmd(e, 'grep') && e.args.includes('OK') && e.info.matches > 0 },
      { hat: 'black', t: 'admin and admin! Look at the server\'s settings: <code>cat server/settings.txt</code>', ok: (e) => isCmd(e, 'cat') && e.info.hits?.some((h) => h.endsWith('/server/settings.txt')) },
      { hat: 'white', t: 'Swap hats. Give the server a strong password of its own: <code>echo admin_password=purplecactusbanjo > server/settings.txt</code> (or your own three random words)', ok: (e) => isCmd(e, 'echo') && serverSafe() },
      { hat: 'black', t: 'Black hat back on. Send last night\'s bots again with HQ\'s practice bots: <code>bots</code>', ok: (e) => isCmd(e, 'bots') && serverSafe() },
    ] },
  { id: 'room', teaches: ['isolation'], word: 'room', name: 'A room of its own', stands: 'Isolation', color: '#ff8a2b', tool: 'term', seq: true, onlyHere: true,
    visual: `<div class="roomviz"><div class="rv-room"><b>kid's room</b><span>homework</span><span>diary</span></div><div class="rv-room spare"><b>the spare room</b><span class="mute">nothing worth breaking</span><span class="rv-mod">free-coins</span></div></div><p class="tv-note">Run strangers' programs where they can't reach your things.</p>`,
    title: 'Free coins! (Not really)', why: 'Someone in a game chat shares a program called <b>free-coins</b>. It promises 1000 coins. It also hides one extra line that deletes your homework. Programs like this are the most common way bad software gets onto children\'s computers: cheats, mods and "free" things. Today you are the one who wrote it, and then the one who runs it. Then you fix it the way security people do: run it in a <b>room of its own</b>, where it can\'t reach anything you care about.',
    mnem: 'Read it first. Run strangers in the spare room.',
    points: ['A program can do anything you can do. When you run it, it gets your keys.', '<b>Isolation</b>, also called <b>sandboxing</b>: run things you don\'t trust somewhere with no keys to your stuff. Here that\'s a spare account called <b>room</b>, which you can visit with <code>su room</code>. Phones and web browsers do this for every app.', 'If a download asks for <code>sudo</code>, the boss user\'s powers, that is a big red flag. Say no, and ask a grown-up.'],
    steps: [
      { hat: 'black', t: 'You wrote the "free coins" program. Look inside it: <code>cat Downloads/free-coins</code>. Which line is the trap?', ok: (e) => isCmd(e, 'cat') && e.info.hits?.some((h) => h.endsWith('/Downloads/free-coins')) },
      { hat: 'black', t: 'Now be the player who doesn\'t read it. Downloads can\'t run until they get an x key: <code>chmod u+x Downloads/free-coins</code>', ok: (e) => isCmd(e, 'chmod') && e.ok && find('/home/kid/Downloads/free-coins') && modeOf(find('/home/kid/Downloads/free-coins')) & 0o100 },
      { hat: 'black', t: 'Run it: <code>./Downloads/free-coins</code>. Did you get coins?', ok: (e) => e.type === 'cmd' && !!e.info.wiped },
      { hat: 'white', t: 'Swap hats. Go into the spare room, where nothing is worth breaking: <code>su room</code>', ok: (e) => isCmd(e, 'su') && e.ok && sh.user === 'room' },
      { hat: 'black', t: 'The room has its own copy of free-coins. Run it there: <code>~/free-coins</code>', ok: (e) => e.type === 'cmd' && e.info.ran === '/home/room/free-coins' && sh.user === 'room' },
      { hat: 'white', t: 'Come back and check on your homework: <code>exit</code>, then <code>ls homework</code>', ok: (e) => isCmd(e, 'ls') && sh.user === 'kid' && e.ok && e.args.some((a) => /homework\/?$/.test(a)) },
    ] },
  { id: 'layers', teaches: ['defence-in-depth'], word: 'layers', name: 'Castle layers', stands: 'Defence in depth', color: '#9b5cff', tool: 'term', seq: true, onlyHere: true,
    visual: `<div class="castle"><div class="cl">strong passwords<div class="cl">no default passwords<div class="cl">locks on files<div class="cl">a spare room<div class="cl-keep">your stuff</div></div></div></div></div></div><p class="tv-note">If one layer fails, the next one still holds.</p>`,
    title: 'One wall is never enough', why: 'Castles didn\'t have one wall. They had a moat, then a wall, then guards, then a locked tower, so that one mistake didn\'t lose the whole castle. Security engineers build the same way. Every layer you met in this course is one ring of the castle: a strong password, no default passwords, locks on your files, and a spare room for strangers\' programs. The name for this is <b>defence in depth</b>. Now test your castle: something has gone wrong in each story. Which layer still holds?',
    mnem: 'Lots of good walls beat one perfect wall.',
    points: ['Nothing is perfect. Every layer will fail one day.', '<b>Defence in depth</b>: put several layers between an attacker and your things, so one failure isn\'t the end.', 'When something goes wrong, ask: which layer failed, and which layer saved me?'],
    steps: [
      { t: 'A bot guessed sib\'s password, <b>pizza123</b>, and got in as sib. Is your diary safe?', ok: chose(0), choices: [
        { c: 'No, it\'s all over', say: 'Not if you built layers! Getting past one wall doesn\'t open every door. Pick again.' },
        { c: 'Yes: sib has no keys to it', good: true, say: 'Exactly. The password layer failed, and the lock layer held. That\'s least privilege, from Keys you don\'t need.' },
        { c: 'Yes, bots get bored', say: 'Bots never get bored. They\'re programs: they knock all night. Pick again.' },
      ] },
      { t: 'Oops! You ran a "free coins" program without reading it, but in the <b>spare room</b>. What did it get?', ok: chose(1), choices: [
        { c: 'Nothing: the room can\'t reach my things', good: true, say: 'Right. Reading it first failed, and the spare room held.' },
        { c: 'All my homework', say: 'Not from the spare room: it can only reach the room\'s own empty folders. Pick again.' },
        { c: 'My password', say: 'The room doesn\'t have your password: it\'s a different account. Pick again.' },
      ] },
      { t: 'Jelly Games leaks its fingerprints again. Who is safe?', ok: chose(2), choices: [
        { c: 'Nobody: fingerprints can be reversed', say: 'They can\'t: fingerprints only go one way. Attackers can only guess. Pick again.' },
        { c: 'Only people who never play', say: 'Playing is fine! It\'s the password that matters. Pick again.' },
        { c: 'Players with three-random-word passwords', good: true, say: 'Yes. Their passwords are on nobody\'s list. The site\'s wall fell, and the strong password held.' },
      ] },
      { t: 'You get to build one thing for your castle. Which is better?', ok: chose(3), choices: [
        { c: 'One perfect wall', say: 'There\'s no such thing as a perfect wall. When it fails, there\'s nothing behind it. Pick again.' },
        { c: 'Several good layers', good: true, say: '<b>Defence in depth!</b> When one layer fails, the next one still holds.' },
        { c: 'A secret wall', say: 'Secrets leak. Hiding isn\'t locking. Pick again.' },
      ] },
    ] },
  { id: 'grey', teaches: ['disclosure', 'grey-zone'], word: 'grey', name: 'The grey zone', stands: 'Doing the right thing', color: '#ffc61a', tool: 'term', seq: true, onlyHere: true,
    visual: `<div class="permviz"><div class="tz-eq">Found a way in <b>≠</b> allowed in</div><p class="tv-note">Stop. Don't peek. Tell the owner.</p></div>`,
    title: 'What would a white hat do?', why: 'Sometimes you stumble on a way in without even trying. A <b>grey hat</b> goes through anyway, even if they mean well. That is still breaking in, and still against the law. A white hat stops, doesn\'t look around, and tells the owner the right way. Nobody here is in trouble: these are choices to practise.',
    mnem: 'Stop. Don\'t peek. Tell the owner.',
    points: ['Finding a way in is not permission to use it.', 'Report it the right way: the website\'s "report a problem" page, or a grown-up you trust. Many websites also keep a file called <code>security.txt</code> that says who to tell. Security people call this <b>coordinated vulnerability disclosure</b>. You will also hear its older name, <b>responsible disclosure</b>.', 'Anyone asking for your password, or offering to knock someone offline, is wearing a black hat. Say no and tell someone.'],
    steps: [
      { t: 'You change your marks page from <span class="addr">school.test/marks/10<b>42</b></span> to <span class="addr">…/10<b>43</b></span>, and see <b>another pupil\'s marks</b>! What do you do?', ok: chose(0), choices: [
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
