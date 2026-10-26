/* recap data */
// What the recap shows: the whole game in one line, and for each magic word what it does, an example and a test question.
const RECAP = {
  wizard: 'Web wizard!', wizardText: 'You collected every single jelly, and your website is on the internet. Go and build something amazing.',
  chain: [
    { label: 'You', sub: 'type an address' },
    { label: 'DNS', sub: 'finds the number', via: 'look up' },
    { label: 'Internet', sub: 'carries the letter', via: 'GET /' },
    { label: 'Server', sub: 'finds the file', via: 'arrives' },
    { label: 'Browser', sub: 'builds the page', via: '200 OK' },
  ],
  line: 'Every page you have ever seen made this trip, there and back, in less than a second.',
  words: {
    html: { does: 'The text that every web page is made of.', ex: 'View source', quiz: 'What is every web page secretly made of?' },
    tags: { does: 'A tag opens a box. The same tag with a slash is its lid.', ex: '<h1>Hi!</h1>', quiz: 'Make the biggest heading say "Hi!".' },
    p: { does: 'Boxes go inside boxes. Last opened, first closed.', ex: '<p>I like <b>cheese</b></p>', quiz: 'Write a paragraph with one bold word.' },
    hr: { does: 'A tag with nothing inside closes itself with />.', ex: '<hr/>', quiz: 'Draw a line across the page.' },
    ul: { does: 'A list box, with an <li></li> box for every item.', ex: '<ul><li>pizza</li></ul>', quiz: 'Make a list with one item: pizza.' },
    a: { does: 'A link. href says where it jumps to.', ex: '<a href="about.html">About</a>', quiz: 'Link to about.html.' },
    img: { does: 'A picture. It stands alone: src says where, alt says what.', ex: '<img src="cat.png" alt="A cat"/>', quiz: 'Show cat.png, with words for when it breaks.' },
    css: { does: 'Paints the page. Styles pour down like a waterfall.', ex: 'h1 { color: tomato; }', quiz: 'Make every h1 tomato red.' },
    url: { does: 'An address: how, which computer, which file.', ex: 'https://jelly.fun/snacks/', quiz: 'Which part of a URL is a folder path?' },
    curl: { does: 'Fetches a page and shows it as plain text.', ex: 'curl https://jelly.fun', quiz: 'See the raw HTML of jelly.fun in the terminal.' },
    get: { does: 'The letter your browser sends: "give me this, please".', ex: 'curl -v https://jelly.fun', quiz: 'Show the letters going back and forth.' },
    404: { does: '200 yay, 301 over there, 404 not found, 500 server broke.', ex: '418 I\'m a teapot', quiz: 'What number means "not found"?' },
    dns: { does: 'The phonebook that turns names into numbers.', ex: 'nslookup jelly.fun', quiz: 'Find the number for jelly.fun.' },
    ping: { does: 'Sonar for computers: how long there and back?', ex: 'ping jelly.fun', quiz: 'Is jelly.fun awake? How far away is it?' },
    https: { does: 'The padlock: letters in a locked box, not postcards.', ex: 'https://', quiz: 'How can you tell nobody can snoop on a page?' },
    push: { does: 'Sends your site to GitHub Pages, live for everyone.', ex: 'git add . · commit · push', quiz: 'Your page is ready. How do you put it online?' },
    quest: { does: 'Look, fix, check, publish. All of it together.', ex: 'edit · git push', quiz: 'A site has a broken picture. What do you check first?' },
  },
};
/* end recap data */
