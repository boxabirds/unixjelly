/* recap data */
const RECAP = {
  wizard: 'Page builder!', wizardText: 'You built web pages from blocks, moved them around, saw the tags underneath, and wrote the HTML yourself. Then you made a whole adventure.',
  chain: [
    { label: 'Blocks', sub: 'heading, paragraph, list…' },
    { label: 'Inside', sub: 'small boxes go in big boxes', via: 'drag' },
    { label: 'Tags', sub: '<p> opens, </p> is the lid', via: 'underneath' },
    { label: 'Browser', sub: 'reads the HTML and shows the page', via: 'HTML' },
  ],
  line: 'Every web page is boxes inside boxes, written as tags. The browser reads them and shows the page.',
  words: {
    page: { does: 'A web page is made of blocks: a heading is a title, a paragraph is a few sentences.', ex: 'Heading, Paragraph', quiz: 'What is a heading for?' },
    bold: { does: 'Blocks go inside blocks. Bold and italic go inside words, like a paragraph.', ex: '<p>I like <b>lime</b></p>', quiz: 'Where does a bold word go?' },
    move: { does: 'Drag any block to move it, and everything inside it. Red tells you why it can\'t go there.', ex: '↑ ↓ ← →', quiz: 'Can a heading go inside a paragraph?' },
    list: { does: 'A list holds list items, one per thing.', ex: '<ul><li>lime</li></ul>', quiz: 'What goes inside a list?' },
    colour: { does: 'A colour pours down into the blocks inside. A block\'s own colour wins.', ex: 'style="color: tomato"', quiz: 'A paragraph is tomato. What colour is the bold word inside it?' },
    table: { does: 'A table holds rows; a row holds cells.', ex: '<table><tr><td>lime</td></tr></table>', quiz: 'What goes inside a row?' },
    picture: { does: 'A picture finds its file by name. Alt words say what it shows.', ex: '<img src="gerbil.svg" alt="Gerald"/>', quiz: 'Why does every picture need alt words?' },
    link: { does: 'A website is pages joined by links. index.html is the page people see first.', ex: '<a href="cave.html">Go in</a>', quiz: 'What does a link say?' },
    form: { does: 'A form asks questions. Each answer is sent with its text box\'s name.', ex: '<input name="jelly"/>', quiz: 'What happens to a text box with no name?' },
    tags: { does: 'Every block is an opening tag and a closing tag, its lid. A picture is one tag on its own.', ex: '<p> … </p>', quiz: 'What does the slash in </p> mean?' },
    wow: { does: 'The whole web is pages. Pages can draw, show 3D and play sound.', ex: 'draw · 3D · sound', quiz: 'What must a page do before it uses your camera?' },
    html: { does: 'HTML is the language of web pages: doctype, head (with the title), body.', ex: '<!DOCTYPE html>', quiz: 'Where does the title show?' },
    lids: { does: 'The browser never refuses broken HTML: it guesses.', ex: '<h1>no lid…', quiz: 'What happens when a heading has no lid?' },
    space: { does: 'Any run of spaces and new lines shows as one space.', ex: 'My     jelly', quiz: 'How do you make a new line on the page?' },
    quest: { does: 'A website of pages, pictures and links: your own adventure.', ex: 'index.html → cave.html', quiz: 'How do you check none of your links is broken?' },
  },
};
/* end recap data */
