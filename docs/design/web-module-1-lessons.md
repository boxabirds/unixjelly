# Web Jelly 1: lesson design

Status: **signed off by the owner, 2026-10-28.** The brief and decisions are in `web-rewrite.md`. The editor these lessons use is `src/tools/blocks/prototype.html`.

**The outcome:** the child understands that a web page is made from a hierarchy of tags, and has fun changing pages.

**How the course runs:** every lesson has the usual three phases (story, remember it, mission). The missions happen in the block editor, which replaces the terminal and file tree. There is **no terminal anywhere in this course**. Shelly is the shell's voice, so she doesn't appear. The steps and the editor's own messages do the explaining.

## 1. The course at a glance

| # | Lesson | One idea | Editor parts shown (rule 18) |
|---|---|---|---|
| | **Part 1: blocks** | | |
| 1 | What's in a web page? | A page is made of blocks: a heading, paragraphs | the page; Blocks view; Heading, Paragraph, Words |
| 2 | Boxes inside boxes | Blocks go inside other blocks: bold and italic inside a paragraph | + Bold, Italic |
| 3 | Move it around | Dragging blocks changes the page; some places are not allowed, and the editor says why | moving (drag, arrows) |
| 4 | Lists | A list holds list items | + List, List item |
| 5 | A splash of colour | A block's colour pours down into the blocks inside it | + colour dots |
| | **Part 2: more blocks** | | |
| 6 | Tables | A table holds rows; a row holds cells | + Table, Row, Cell |
| 7 | Pictures | A picture shows a picture file by its name, with words for people who can't see it | + Picture |
| 8 | Links make a website | A website is pages joined by links | + Link; the website bar; Edit / Visit |
| 9 | Forms | Text boxes with names, and a button that sends the answers | + Form, Text box, Button |
| | **Part 3: tags** | | |
| 10 | Every block is a tag | A block is an opening tag and a closing tag; a picture is one tag on its own | + Tags view |
| 11 | Pages can do almost anything | The whole web is made of pages like these, and they can draw, move in 3D and play sound | live examples, links out |
| | **Part 4: HTML** | | |
| 12 | Write it yourself: HTML | The real text of a page: doctype, head and title, body | + HTML view; the page's title |
| 13 | When a lid goes missing | The browser never refuses broken HTML: it guesses | the checker, the browser's guess |
| 14 | Spaces and new lines | The browser shows any run of spaces and new lines as one space | the spaces note |
| | **Final mission** | | |
| 15 | The Jelly adventure | Make a choose-your-own-adventure: pages, links, pictures and a table | everything |

Owner's brief, mapped: blocks first (1–5); moving blocks around the hierarchy (3, then in every mission); lists, tables, links and forms (4, 6–9); tags revealed only after that (10); "the web is made of these pages, and they can show almost anything" (11); editing the HTML directly, with balanced tags (12–14); and a fun game at the end (15).

## 2. Pedagogical assessment (rule zero)

### 2a. Everything the course shows, and where it is taught

| Shown | Plain-English definition the lesson gives | Taught in |
|---|---|---|
| web page | One page of words, pictures and links that you look at in a browser | 1 |
| browser | The program you use to look at web pages, like Chrome, Safari or Edge | 1 |
| block | One piece of a page: a heading, a paragraph, some words | 1 |
| HTML, a block's HTML name | Web pages are written in a language called HTML. Each block has an HTML name, shown small after its own name: `h1` for a heading, `p` for a paragraph | 1 (the short definition), then each block's lesson names its own: `b` `i` 2, `ul` `li` 4, `table` `tr` `td` 6, `img` 7, `a` 8, `form` `input` `button` 9 |
| heading | A title for a part of the page, in big letters | 1 |
| paragraph | A few sentences about one thing | 1 |
| inside (hierarchy) | A block can hold other blocks, like boxes inside boxes | 2 |
| bold, italic | Words made thicker, or slanted, to stand out | 2 |
| list, list item | A list of things; each thing is a list item | 4 |
| colour, style | How a block looks. A colour given to a block pours down into the blocks inside it, unless they have their own | 5 |
| table, row, cell | A grid: rows go across, and each row is split into cells | 6 |
| picture, picture file, alt words | A picture shows a picture file by its file name. Alt words say what the picture shows, for people who can't see it | 7 |
| website, link, page name, `index.html` | A website is a group of pages. A link takes you to another page. Each page is a file with a name ending in `.html`. `index.html` is the page people see first | 8 |
| form, text box, button, a text box's name | A form asks questions. You type answers in text boxes. The button sends them, each with its text box's name | 9 |
| tag, opening tag, closing tag (lid), single tag | Each block is written as a tag: `<p>` opens the box and `</p>` closes it, like a lid. A block with nothing inside is one tag that closes itself: `<img/>` | 10 |
| attribute | Extra information inside an opening tag: `href="cave.html"`, written as name = "value" | 10 |
| `style="color: tomato"` | The colour from lesson 5, written as an attribute | 10 |
| 2D drawing, 3D, sound and video, camera and microphone | What web pages can do: draw, show 3D worlds, play sound and video, and (only if you say yes) use a camera or microphone | 11 |
| HyperText Markup Language | What the letters of HTML stand for. **Markup** means notes about how to show the words; **hypertext** means text with links | 12 |
| `<!DOCTYPE html>`, `<html>`, `<head>`, `<title>`, `<body>` | The outside of every page. The doctype says "this is a modern web page". The head holds facts about the page, like its title, shown on the browser tab. The body holds what you see | 12 |
| the browser's guess | When the HTML has a mistake, the browser still shows something: its best guess | 13 |
| spaces and new lines | The browser shows any run of spaces and new lines as one space, so HTML can be laid out neatly | 14 |

### 2b. Terms from earlier courses (rule 16: dotted underline and bubble)

| Term | Where it is taught | Used in |
|---|---|---|
| file, file name | Shell Jelly | 7, 8, 12 |
| program | Shell Jelly (Backstage) and Shell Jelly 2 | 1 ("a browser is a program") |

This assumes Web Jelly 1 **needs Shell Jelly** (decision D1).

### 2c. Nothing is shown before it is taught

The editor shows only what has been taught. These rules are part of the design:

| What | Shown from |
|---|---|
| The Blocks view | lesson 1 |
| Each block's HTML name, small after its name (not on the page block: `body` is lesson 12's) | from the lesson that teaches the block |
| The Tags view | lesson 10 (`taught('tags')`) |
| The HTML view, and the page's title | lesson 12 (`taught('html')`) |
| Each "+" button, the colour dots, moving | the lesson that teaches it (section 1) |
| The website bar, and Edit / Visit | lesson 8 |
| Tag words (`<p>`, `</p>`, "lid") in messages | lesson 10. Before that, the help panels and drag messages use block names only: "A list item only goes inside a list" |

The course also keeps to these limits:
- **No outside addresses.** Links go only between the child's own pages. Addresses of real websites (`https://…`) are taught in Web Jelly 2. A link to an outside address gets a plain explanation, not a visit.
- **No camera or microphone.** Lesson 11 describes them and teaches the safety rule; the guide never switches them on.
- **No code in lesson 11.** It names what pages can do and shows it working. None of the code behind the examples is on screen.
- **No "CSS".** Lesson 5 says "colour" and "style". Lesson 10 shows the `style` attribute.
- **No terminal, server or addresses** anywhere in the course.

## 3. The lessons

Each lesson lists its jelly word, the story (the picture and the gist of the words), the three things to remember, and the mission. Every step is checked by what is on the page, not by which buttons were pressed (rule 5).

### 1. What's in a web page? (`page`)
- **Story.** Picture: a web page pulled apart into its blocks, a heading on top and paragraphs underneath, each block a soft coloured box. "Every web page you've ever seen, even the giant ones, is made of blocks. A browser is the program that shows them to you. Let's take one apart."
- **Remember.** A page is made of blocks. · A heading is a title in big letters; a paragraph is a few sentences about one thing. · Click anything on the page to find its block. · Web pages are written in a language called HTML. In HTML, a heading is `h1` and a paragraph is `p`; each block shows its HTML name, small.
- **Mission.** (1) Click the heading on the page; its block lights up. (2) Change the heading's words to your name. (3) Add a paragraph about your favourite jelly.
- **Checks.** The heading's words differ from the starting words; there are at least two paragraphs with words in them.

### 2. Boxes inside boxes (`<b>`)
- **Story.** Picture: a paragraph box with a smaller bold box inside it. "Blocks can go inside other blocks, like a toy in a box in a bigger box. To make one word stand out, put it in a bold block inside the paragraph."
- **Remember.** A block can hold other blocks. · Bold makes words thicker; italic makes them slant. · The block you put them in decides where they go on the page. · In HTML, bold is `b` and italic is `i`.
- **Mission.** (1) Make one word in your paragraph bold. (2) Make another word italic. (3) Put an italic block inside the bold one: bold and slanted at once.
- **Checks.** The page has a `b` inside a `p`, an `i` inside a `p`, and an `i` inside a `b`.

### 3. Move it around (`move`)
- **Story.** Picture: a block being carried, with a green line where it will land. "Pick up any block and move it. The page changes as you go. Some moves aren't allowed, like a heading inside a list, and the editor tells you why."
- **Remember.** Drag a block, or use the arrows: ↑ ↓ move it, ← out of its box, → into the box above. · Green means it can go there; red says why not. · Moving a box moves everything inside it.
- **Mission.** (1) Move your paragraph above the heading, then back again. (2) Try putting the heading inside the paragraph. Read why it can't go there. (3) Move a bold word out of its paragraph and into another one.
- **Checks.** Order changed and restored; a refused move happened (the editor reports it); a bold block now sits in a different paragraph.
- **Likely mistake:** dragging inside a Words box selects text instead. The story picture shows grabbing the block's name.

### 4. Lists (`<ul>`)
- **Story.** Picture: a shopping list next to the same list as blocks. "A list block holds list items, one per thing. List items only go in a list, so if you ask for one anywhere else, the editor offers to make the list too."
- **Remember.** A list holds list items. · A list item holds words, bold, italic and more. · Each item gets a dot on the page. · In HTML, a list is `ul` and a list item is `li`.
- **Mission.** (1) Make a list of three jelly flavours. (2) Move the last one to the top. (3) Add a list item while the heading is selected, and use the help to put it in your list.
- **Checks.** A `ul` with at least three `li`; the first item's words changed position; a fourth item exists.

### 5. A splash of colour (`color`)
- **Story.** Picture: colour pouring from a paragraph into the bold block inside it. "Give a block a colour and the colour pours down into every block inside it, unless one of them has its own colour."
- **Remember.** Pick a block, then a colour dot. · Colour pours down into the blocks inside. · A block's own colour beats the colour it gets from outside.
- **Mission.** (1) Colour the heading. (2) Colour a paragraph, and watch its bold word change too. (3) Give that bold word its own colour.
- **Checks.** The heading has a colour; a paragraph has a colour and its bold child shows it; the bold child then has a different colour.
- **Note:** colours are the browser's own named colours (tomato, hotpink …). No stylesheet is involved, so the page looks the same in any browser.

### 6. Tables (`<table>`)
- **Story.** Picture: a grid with a row lit up, then a cell. "A table is a grid. It holds rows, which go across, and each row holds cells. A browser draws no lines round the cells unless you ask, so a table can also just line things up."
- **Remember.** A table holds rows; a row holds cells. · Every row should have the same number of cells. · Ask for a cell anywhere, and the editor offers to build the row and the table. · In HTML, a table is `table`, a row is `tr` and a cell is `td`.
- **Mission.** (1) Make a table of jellies and their colours, three rows long. (2) Add a row at the top with the words "Jelly" and "Colour", and make them bold.
- **Checks.** A table with at least three rows of two cells; a row containing bold words.

### 7. Pictures (`<img/>`)
- **Story.** Picture: a picture block pointing at a picture file by name. "A picture block shows a picture file. It finds the file by its name, so one wrong letter and the picture breaks. Alt words say what the picture shows, for people who can't see it: screen readers read them out loud."
- **Remember.** A picture finds its file by its file name. · Every picture needs alt words. · A picture has nothing inside it. · In HTML, a picture is `img`, short for image.
- **Mission.** (1) Add the gerbil picture. (2) Write alt words for it. (3) Give it a wrong file name (in the picture's settings), see it break and the alt words appear, then fix it.
- **Checks.** A picture with a known file and alt words; a broken picture appeared; all pictures work again.
- **The picture's settings** have the three picture buttons and a file name box, so a child can make (and fix) a typo.

### 8. Links make a website (`<a>`)
- **Story.** Picture: three pages joined by arrows. "A website is a group of pages. Each page is a file whose name ends in `.html`. The page people see first is called `index.html`. Links join the pages: click one and you go to another page. Billions of pages joined by links look like a giant spider web, which is why it's called the World Wide Web."
- **Remember.** A link says which page it goes to. · Visit uses the pages like a real website; Edit is for changing them. · Change a page's name, and links to the old name break. · In HTML, a link is `a`.
- **Mission.** (1) Make a new page called `jellies.html`. (2) On `index.html`, add a link to it. (3) Press Visit and follow your link, then press Back. (4) Make a link to a page that doesn't exist, visit it, and read what happens.
- **Checks.** A page named `jellies.html`; a link with that name on `index.html`; a visit to it, then back; a visit to a missing page.

### 9. Forms (`<form>`)
- **Story.** Picture: a form with two text boxes, each with a name tag, and a button. "A form asks questions. You type answers in text boxes, and the button sends them. Each answer is sent with its text box's name, so the website knows which answer is which."
- **Remember.** A form holds text boxes and a button. · Every text box needs a name, or its answer isn't sent. · Here, nothing is really sent; a later course makes a website answer. · In HTML, a text box is `input`; a form and a button keep their names: `form`, `button`.
- **Mission.** (1) Make a form that asks for a name and a favourite jelly. (2) Fill it in and press the button: see what would be sent. (3) Remove a text box's name and send again.
- **Checks.** A form with two named text boxes; a send showing both names; a send where one wasn't sent.

### 10. Every block is a tag (`< >`)
- **Story.** Picture: the paragraph block from lesson 2, turning into `<p>` on top and `</p>` underneath. "You already know every block's HTML name. Underneath, every block is written as a tag: its name in angle brackets. The opening tag opens the box. The closing tag, with a slash, is its lid. A block with nothing inside, like a picture, is one tag that closes itself, with the slash at the end."
- **Remember.** `<p>` opens a box; `</p>` is its lid. · Close the inside box first: `<p><b>hi</b></p>`. · A picture or text box is one tag: `<img/>`, `<input/>`.
- **Points also cover attributes:** extra information inside the opening tag, like `href="jellies.html"` or `style="color: tomato"`.
- **Mission.** (1) Switch to Tags. Find the opening and closing tags of your list. (2) Find a single tag on your page. (3) Move a bold block in the Tags view and watch its tags move with it. (4) Find the attribute that says where a link goes.
- **Checks.** The Tags view was opened; the child clicked a `ul` block, then a picture or text box, moved a block, and selected a link.

### 11. Pages can do almost anything (`wow`)
- **Story.** Picture: a page with a 2D drawing, a 3D jelly, and a speaker. "Every website, from games to videos, is made of pages like yours: blocks of HTML. On top, the browser can draw pictures, show 3D worlds, play sound and video, and, only if you say yes, use a camera or microphone."
- **Remember.** The whole web is pages made of tags. · Pages can draw, show 3D, and play sound. · A page must ask before it uses your camera or microphone: say no, unless a grown-up says yes.
- **Mission.** Try three small live examples inside the lesson: (1) draw with the mouse; (2) spin a 3D jelly; (3) play a sound. Then a short list of links to explore further.
- **Checks.** Each example was used.
- **The live examples are built into the guide.** They never ask for the camera or microphone.
- **Links out:** the owner picks and checks them (decision D3).

### 12. Write it yourself: HTML (`html`)
- **Story.** Picture: the HTML view with the doctype, head and body labelled. "HTML is the language web pages are written in. Every page starts the same way: the doctype says 'this is a modern web page', the head holds facts about the page, like its title on the browser tab, and the body holds everything you see."
- **Remember.** Doctype first, then `<html>`, with `<head>` and `<body>` inside. · The title goes in the head and shows on the browser tab. · Everything you've built is in the body.
- **Mission.** (1) Open the HTML view and find your heading. (2) Change the page's title, and watch the browser tab change. (3) Type a new paragraph straight into the HTML. (4) Switch back to Blocks and find it.
- **Checks.** The title changed; a new `p` was added through the HTML view; the Blocks view was opened afterwards.

### 13. When a lid goes missing (`</>`)
- **Story.** Picture: a heading with no lid, swallowing the page. "A browser never refuses broken HTML. It guesses what you meant, and the guess is often wrong. The checker shows each mistake on its line."
- **Remember.** A missing lid makes the box go on and on. · Crossed lids: close the inside box first. · The Blocks view shows the browser's guess until you fix it.
- **Mission.** (1) Delete the heading's closing tag. Watch the page, and read the checker. (2) Look at the Blocks view: see the browser's guess. (3) Fix it. (4) Cross two lids on purpose, then fix them.
- **Checks.** A missing `</h1>` happened, then was fixed; crossed lids happened, then were fixed; the Blocks view was seen while broken.

### 14. Spaces and new lines (`␣`)
- **Story.** Picture: the HTML with lots of spaces and new lines, next to the page showing one space each time. "In HTML, any run of spaces and new lines shows as a single space. That's on purpose: it lets you lay HTML out neatly, on many lines, without changing the page. To start a new line on the page, start a new block."
- **Remember.** Many spaces show as one space. · A new line in HTML shows as a space, too. · A new paragraph needs a new `<p>`.
- **Mission.** (1) Put five spaces between two words in the HTML. What does the page show? (2) Put each word of a heading on its own line. (3) Make the page show two separate lines, the right way: two paragraphs.
- **Checks.** A text with a run of spaces; a heading with new lines in it; two paragraphs where there was one.
- **Jelly word:** `␣` (the "space" sign) needs checking against the font subset. If it can't be added, use `space`.

### 15. The Jelly adventure (`go!`)
- **Story.** "Make a choose-your-own-adventure. Each page is a place: a cave, a castle, a jelly lake. Each page has a picture, a few words, and links for the choices."
- **Mission.** (1) At least three pages besides `index.html`. (2) Every page has a heading, a paragraph and a picture with alt words. (3) Every page has at least one link, and none is broken. (4) One page has a table: what you've collected so far. (5) Play it from the start in Visit.
- **Checks.** Four or more pages; each has `h1`, `p`, and an `img` with `alt`; every link goes to an existing page; a `table` somewhere; a visit that went through at least three pages.

## 4. Decisions

- **D1. Needs.** Web Jelly 1 needs **Shell Jelly** only: it teaches files and file names, which lessons 7 and 8 use. It doesn't need Git. Web Jelly 2 needs Web Jelly 1 and Git.
- **D2. Names.** **Web Jelly 1** (this course) and **Web Jelly 2** (serving and publishing), in `curriculum.json`.
- **D3. Links out in lesson 11.** Chosen and checked by the owner. Until then, lesson 11 has its live examples and no links out.
- **D4. Lesson 11's examples** are built into the guide (drawing, 3D jelly, sound). The lesson doesn't send children to other sites.
- **D5. Length.** 15 lessons.
- **D6. HTML names from the start.** Every block shows its HTML name, small, from the lesson that teaches it, so the editor never hides what the HTML is. Lesson 1 says what HTML is; lesson 10 adds the brackets and lids; lesson 12 the whole page.
