/* recap data */
// What the recap shows: the whole game in one line, and for each magic word what it does, an example and a test question.
const RECAP = {
  wizard: 'Git wizard!', wizardText: 'You collected every single jelly. Your code will never be lost again.',
  chain: [
    { label: 'Your folder', sub: 'you change files' },
    { label: 'The stage', sub: 'waiting for the photo', via: 'git add' },
    { label: 'Photo album', sub: '.git keeps every version', via: 'git commit' },
    { label: 'GitHub', sub: 'a safe copy in the cloud', via: 'git push' },
  ],
  line: 'Cats Always Chase Pigeons: Change, Add, Commit, Push. And git pull brings it all back down.',
  words: {
    git: { does: 'git is the camera. GitHub keeps the album safe.', ex: 'git --version', quiz: 'Is git installed on this computer?' },
    config: { does: 'Signs your photos with your name and email.', ex: 'git config --global user.name "Sam"', quiz: 'Tell git who you are.' },
    init: { does: 'Turns a folder into a repository by adding .git.', ex: 'git init', quiz: 'Start tracking a brand-new project.' },
    status: { does: 'Says what changed and what is on the stage.', ex: 'git status', quiz: 'You are confused. What is going on?' },
    add: { does: 'Puts files on the stage, ready for the photo.', ex: 'git add .', quiz: 'Get every change ready for the next photo.' },
    commit: { does: 'Takes a photo of the stage, with a message.', ex: 'git commit -m "add lasers"', quiz: 'Save this version forever, with a note.' },
    log: { does: 'Shows the album: every photo, newest first.', ex: 'git log --oneline', quiz: 'See every save you have ever made.' },
    diff: { does: 'Spots the difference: + lines new, - lines gone.', ex: 'git diff', quiz: 'What exactly did you change?' },
    restore: { does: 'The oops button: back to the saved version.', ex: 'git restore game.py', quiz: 'You broke game.py. Undo it!' },
    remote: { does: 'Saves GitHub\'s address under the nickname origin.', ex: 'git remote add origin <address>', quiz: 'Tell git where your GitHub copy lives.' },
    push: { does: 'Sends your photos up to GitHub.', ex: 'git push', quiz: 'Back up your saves to the cloud.' },
    pull: { does: 'clone copies it all down. pull fetches new photos.', ex: 'git pull', quiz: 'Get the newest code from GitHub.' },
    ignore: { does: '.gitignore keeps secrets and junk out of git.', ex: 'echo "secrets.txt" > .gitignore', quiz: 'Make sure your password file never reaches GitHub.' },
    quest: { does: 'Change, add, commit, push: the daily loop.', ex: 'git add . · git commit -m "…" · git push', quiz: 'You finished for the day. Save it all to GitHub!' },
  },
};
/* end recap data */
