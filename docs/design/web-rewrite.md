# Web Jelly rewrite: pedagogical assessment and plan

Status: **proposed, waiting for the owner's agreement.** Nothing here is built yet.

Why: the owner's review found that Web Jelly breaks the teaching rules from its first lesson. Terms are used without a plain-English definition. HTTP is two lines of text. Steps don't say where to act. The terminal shows when it isn't needed. And two thirds of the padlock lesson is about old http-only sites. The rules this plan follows are in `docs/pedagogy.md`, "The rules on one screen".

## 1. The current course: what is on screen, and where it is taught

Web Jelly needs Shell, Shell 2 and Git (`src/curriculum.json`). "Overview" means the optional 3D tour on the welcome screen; a child who skips it never sees what it says.

| Shown | First used | Where it is defined | Gap |
|---|---|---|---|
| browser | lesson 1 ("the browser on the right") | Overview only | **yes**: not in any lesson |
| web page, website | lesson 1 | nowhere | **yes** |
| jelly.fun | lesson 1 ("what jelly.fun is really made of") | nowhere: never said it is a pretend site, shown on the right | **yes** |
| the editor | lesson 2 | nowhere (Shell 2 taught `nano`, a different editor) | **yes** |
| an address, `https://…` | lesson 1 (address bar); lesson 6 (`href="https://jelly.fun"`) | lesson 9, "Read an address" | **yes**: used up to 8 lessons early |
| `https://` "is how to talk" | lesson 9 | nowhere: "how to talk" is never explained | **yes** |
| server | lesson 9 ("the server lists the folder") | Overview only | **yes** |
| HTTP | lesson 11 | lesson 11: "the rules for writing these letters", no process shown | **yes**: named, not taught (rules 15, 19) |
| request, reply, headers | lesson 11 | lesson 11, in one sentence each | weak |
| 3xx "go over there", 301 | lessons 12 and 15 | nowhere | **yes** |
| domain (DNS = Domain Name System) | lesson 13 | nowhere | **yes** |
| router, the internet | Overview | Overview only | yes, if a lesson relies on them |
| `curl`, `-I`, `-v` | lessons 10 and 11 | lessons 10 and 11 | none in order; **yes** when a child jumps to lesson 15 |
| "Not secure", "the warning" | lesson 15 | the screen says "Not secure"; the step says "the warning" | **yes** (rule 17) |
| terminal, `cat`, `ls`, `cd`, paths, Ctrl+C | lessons 1, 14, 17 | Shell Jelly | no underline or way back (rule 16) |
| repository, `git status` / `add` / `commit` / `push` | lesson 16 | Git Jelly | no underline or way back (rule 16) |
| the terminal itself | every lesson | Shell Jelly | shown in browser-only lessons too (rule 18) |

Also: Web Jelly has no `teaches` lists, so `tests/prereqs.mjs` can't check it. That is why none of this was caught.

## 2. Gaps against the other new rules

- **Rule 17, where to act.** "On jelly.fun", "Click the warning", "Visit an old site", "Watch the server send you round" (which is really "type this curl command in the terminal"). Every step needs rewriting to name its place, and the place needs highlighting.
- **Rule 18, only the tools needed.** The workbench always shows the editor and terminal tabs.
- **Rule 19, processes shown moving.** HTTP, DNS and publishing are all processes. Only the optional Overview shows one moving.
- **Rule 20, what children meet.** The padlock lesson spends two of three steps on http-only sites and redirects.

## 3. The owner's brief for Web module 1 (2026-10-28)

This replaces the earlier proposal. How pages are served (addresses, HTTP, status codes, curl, DNS, ping, the padlock, publishing) is **not** part of Web module 1.

Outcome: **the child understands that a web page is made from a hierarchy of tags**, and has fun changing pages.

1. **Blocks, not text.** A powerful but limited block editor: the page in one panel, a very clear hierarchy of blocks in the other. Not a free-form text editor. The child adds pieces: a heading, a paragraph, a list, bold and italic. Simple inline styling.
2. **Move blocks around the hierarchy.** Encourage moving blocks up, down, into and out of other blocks, and watch the page change at the same time. Every block is linked one to one with its piece of the page.
3. **More blocks:** lists, tables, links, then forms. HTML 1.0 level, with basic styling.
4. **Only then, reveal the blocks as balanced tags:** an opening tag and its closing tag. Tags that stand alone (`<br/>`, `<hr/>`) are not covered; they are rare now.
5. **The whole web is made of these pages.** Pages can show almost anything now: 2D graphics, 3D, sound, video, camera and microphone. Show examples, with links to explore. Concepts only: not a reference manual.
6. **Edit the HTML directly**, carefully matching balanced tags.
7. **Finish by making a simple, fun interactive game** using everything learnt.

## 4. What gets built

- **Dotted-underline terms (rule 16).** One shared list of terms (plain-English sentence, example, course and lesson that teaches it). Lesson text marks a term, and the guide draws the underline and the bubble. Built in the shared engine, so every guide can use it.
- **Tool visibility (rule 18).** Each step says which tool it uses. Only that tool is shown and highlighted.
- **Step places (rule 17).** Each step names its place, and the guide highlights it.
- **The HTTP animation (rule 19).** See decision 2.
- **Tests.** `teaches` for every Web lesson, detectors in `src/tests/concepts.json`, and a check that every earlier-course term in Web Jelly's own words is underlined.

## 5. Decisions for the owner

Answered by the owner on 2026-10-28:

- **The HTTP animation** (for whichever course serves pages): reuse the 3D Overview/Backstage world, stepped with Next.
- **Old http-only sites:** drop them entirely.
- **Dotted-underline bubbles:** all five guides now, not just Web Jelly.
- **Course order:** superseded by the brief in section 3.
- **The final game:** a choose-your-own-adventure made of linked pages. No JavaScript (Think Jelly 1 teaches that).
- **Forms:** taught in module 1. Pressing Send shows a card, "This is what the website would receive: name = Sam", and says a later course makes a real website answer.
- **Single tags:** drop `<br/>` and `<hr/>`. Keep `<img/>`, and `<input/>` for forms, introduced as "a block with nothing inside" when the tags are revealed.
- **Serving and publishing** (addresses, HTTP, status codes, curl, DNS, ping, the padlock, `git push` to GitHub Pages) move to a new **Web module 2**, which needs module 1 and Git. Security Jelly 2 then needs Web module 2. Still to decide: whether module 1 needs Shell Jelly or nothing.
- **Block editor prototype:** `src/tools/blocks/prototype.html`, approved by the owner on 2026-10-28. Three views of the same page: **Blocks** (friendly names), **Tags** (the blocks labelled with their opening and closing tags) and **HTML** (the real text, editable and breakable). The page always shows what a real browser makes of the HTML. Mistakes are noted on their own line, 0.5 s after typing stops. While the HTML is broken, Blocks and Tags show the browser's guess, read-only. The selection is a gold glow on both sides, and each panel scrolls to it. Lighter lines and smaller type than the guides.
- **More blocks** (2026-10-28): tables (table, row, cell), links (with where each goes), pictures (three built-in ones, and words for people who can't see them), and forms (text boxes with a name, and buttons). Pictures and text boxes are single tags: `<img .../>` and `<input .../>`. A link can't go inside another link. Pressing Send shows "What the website would receive" (`name = Sam`), or explains that a text box with no name sends nothing, and says no website is listening yet.
- **Pages** (2026-10-28): a website bar with one tab per page, **+ New page**, rename (✎) and delete (a second click confirms; no pop-up dialogs). `index.html` can't be renamed or deleted: it's the page people see first. Page names are made tidy: small letters, numbers and dashes, ending in `.html`. **Edit / Visit** on the page panel: in Visit, links open your other pages, **← Back** returns, nothing is selected, a link to a missing page says so, and a link to a real website explains that links in here only go to your own pages. Renaming a page doesn't fix links to it, as on a real website. A link's "Goes to" box suggests the page names.
- **Look and feel** (owner's requests): no drag handles (any part of a block picks it up; dragging out of a Words box picks it up); no side bars or borders on unselected blocks (a block is its tint, its name in its colour); hover is a half-strength outline that fades in after 0.2 s; a refused drag shows its reason under the dragged block, and where it was dropped.
