# After Web Jelly: the server, storage, then SQL

**Status: discussion.** Nothing here is built. Background research: `../research/web-part-2-databases-and-dynamic-pages.md`.

## The proposal

Three courses after Web Jelly. Each one starts from a problem the last one left behind.

```
Web Jelly  →  Server Jelly  →  Storage Jelly  →  SQL Jelly
              pages made        keeping things     when questions
              to order          (JSON)             cross records
```

1. **Server Jelly.** Two panels: **your browser** and **the server**, with every request and reply drawn as a letter going between them. A route answers `GET /guestbook` with HTML. htmx swaps part of the page. `curl` in the shell talks to the same server. The guestbook lives in the server's memory, so it ends with a problem: **restart the server and every message is gone.**
2. **Storage Jelly.** Keep data after a restart. JSON first: values, lists, objects, nesting. Save to a file, load it back. A key-value store (get and put by key). Browser storage too: the jelly jar itself is JSON in your browser, and you can look at it. It ends with three problems:
   - the same fact is copied into many records and goes out of date;
   - a question across records ("which owners have cats older than 5?") means writing a loop;
   - nothing stops a misspelt field (`nmae`) being saved.
3. **SQL Jelly.** Tables with fixed columns, `SELECT … WHERE`, `ORDER BY`, joins, keys, indexes ("checked 100,000 rows" against "checked 1 row") and SQL injection, which pays off Security. It's framed as a tool for when questions cross records, not as "NoSQL is wrong". Plenty of systems are fine without it.

## Your three points

### 1. A panel for "the server"

Agreed. The research's worry was a server the child can't see, so they think "the browser did it". A server panel that is visibly a different machine, with letters going between the two, fixes that. It doesn't matter that both panels run in one page, for the same reason the pretend shell doesn't need a real computer.

### 2. Storage before SQL

Agreed, and it's the stronger teaching order: each course creates the need for the next. The cost is that **JSON is new syntax**: `{ }`, `[ ]`, `:`, commas, quotes around keys. Under rule zero, each symbol needs its own step. Children who know JavaScript objects (like your tester) will fly through it.

### 3. JavaScript, htmx 4 and WebContainers

**Don't write a JavaScript course.** Agreed: it's huge and good ones exist. Instead, let a course declare an **outside prerequisite**: "Server Jelly needs some JavaScript: variables, `if`, functions, lists and objects, for example from *JavaScript for Kids* or Scratch". The course's welcome screen says so. `curriculum.json` can carry these, like its other `needs`.

Two cautions:

- ***JavaScript for Kids* came out in 2014, before modern JavaScript.** It uses `var` and `function`, not `let`, `const`, arrow functions or template strings. Server code should either stick to that style, or the course teaches the modern pieces it uses in one short bridge lesson.
- **Scratch alone doesn't give the text syntax.** Scratch children understand program flow, but not braces and semicolons. Be explicit about which outside course counts.

**htmx 4: yes.** It needs no JavaScript from the child. One caution: in late 2026, htmx 4.0.0 is still on npm's `next` tag, and most tutorials describe 2.x. So pin the exact version, and teach only the attributes that work the same in both: `hx-get`, `hx-post`, `hx-target`, `hx-swap` and `hx-trigger`.

**WebContainers: not for the core course.** I recommend a pretend server that runs the child's **real JavaScript** instead.

WebContainers run real Node in the browser, but:
- **They need special headers.** The page must be cross-origin isolated (`Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers) and served over HTTPS ([WebContainers quickstart](https://webcontainers.io/guides/quickstart)).
  - **Opened from disk:** a file you double-click can't send headers.
  - **claude.ai:** the artifact host decides the headers, not us.
  - **GitHub Pages:** it can't set custom headers. There are service-worker workarounds, but I haven't tested them.
- **Production use in a commercial, for-profit setting needs a licence;** prototypes don't ([WebContainers enterprise](https://webcontainers.io/enterprise)). A free educational site is probably fine, but that needs checking with StackBlitz.
- **They break the series' main promise:** one HTML file that works anywhere, with nothing to install and nothing to sign up for.

**The alternative.** The child writes handlers in real JavaScript, in an Express-shaped style:

```js
app.get('/guestbook', function (req, res) {
  res.send('<ul>' + messages.map(function (m) { return '<li>' + m + '</li>'; }).join('') + '</ul>');
});
```

They run in a Web Worker inside the page. The page draws the letters between the browser and the server panels. It works from disk, on GitHub Pages and on claude.ai, starts instantly, and the same code runs on real Express later with almost no changes.

WebContainers could still be an optional final lesson in the repo copy: "now run it on a real Node server".

## Questions to settle

1. **The three-course chain:** Server → Storage → SQL? **Agreed.**
2. **The outside prerequisite:** may Server Jelly require some JavaScript from outside, declared on its welcome screen? If yes, in which style: `var` and `function` like *JavaScript for Kids*, or modern JavaScript with a bridge lesson?
3. **The server runtime:** a pretend Express in a Web Worker, or WebContainers?
