# Source for the Jelly guides

```
build.sh          builds every guide into its folder at the top of the repo, then stamps the version on the landing page
VERSION           the version number shown on the landing page (bump it for a release)
shell/            jellysh: the shell every guide uses, as one self-contained module (see shell/README.md)
engine/           Jelly Shell's page and the patches every guide inherits
guides/<name>/    each other guide: build.py, lessons.js, its own engine code and CSS
fonts/            the jelly-letter font subsets, and the script that makes them
tools/            small build helpers
tests/            browser tests: every mission, every screen size, the jelly letters
```

- Build: `./build.sh`
- Test: `npm install`, then `CHROMIUM=/path/to/chromium npm test`

How it all fits together: [../docs/architecture.md](../docs/architecture.md).
Adding a lesson: [../docs/new-lesson.md](../docs/new-lesson.md).
