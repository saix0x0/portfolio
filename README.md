# Sai Siddhanth Challa · portfolio

The personal site of Sai Siddhanth Challa, a student at IIIT Hyderabad (Computer Science + Computing & Human Sciences).

It opens on black water and dot-matrix type, then leads into **the desk**: a room drawn entirely in code, where every object is a door. The monitor holds the projects, the laptop is a working terminal, the speaker plays Spotify, the keyboard types, and the lamp changes the light.

It's plain HTML, CSS and JavaScript modules. There are **no dependencies, no build step and no paid services.**

## Run it

```bash
npm run dev        # → http://localhost:4173  (Node 18+, nothing to install)
npm run check      # privacy, link and content checks; run before every commit
```

## Pages

| URL | What |
|---|---|
| `/` | Front page: intro, paintings printed in dots, projects, skills, GitHub, contact |
| `/desk/` | The desk. Every object has its own URL (`/desk/#browser`, `#terminal`, `#music`, `#type`, `#wall/about` …) |
| `/work/` | Every project, with filters, search and case studies (`/work/#p/<id>`, `/work/#college`) |
| `/library/` | The bookshelf, with covers and free legal reading links |
| `/compass/` | A departures board of useful websites |
| `/lab/` | Small sandboxed experiments |
| `/portfolio/` | The earlier site: a scroll through five sunset cities |
| <kbd>⌘K</kbd> or <kbd>/</kbd> | Search everything, on any page |

Two parts are in the repo but switched off and not deployed for now: `/hotel/`, a playable pixel-art hotel (`site.game`), and the encrypted rooms `/vault/` and `/observatory/` (`site.rooms`).

## Structure

```
index.html, desk/, work/, library/ …   one thin HTML shell per page
content/        all words and lists: site, projects, books, music, desk …
assets/css/     base.css (design system) plus one stylesheet per page
assets/js/core/     shared engine: layout, search, sky, contact, vault …
assets/js/pages/    one entry module per page
assets/js/desk/     the desk: the room, keyboard, speaker, terminal, critter
assets/js/front/    the front page: water, halftone paintings
assets/js/world/    the hotel game
lab/experiments/    self-contained experiments + registry
scripts/        dev server, checks, sealing (Node, no dependencies)
docs/           architecture, design system, content schema, status, roadmap
```

To change the content, edit [`content/`](content/). [docs/CONTENT_SCHEMA.md](docs/CONTENT_SCHEMA.md) describes every field.

## Editing from the site

`/edit/` is an editor for the words that change most: the intro, About, experience, current focus, the desk's research card, which books are read, and the visit counter's code. **Finalise** commits `content/live.js` through the GitHub API, which redeploys the site. Anyone can open the page, but publishing needs a GitHub token with write access to this repo. GitHub checks the token; it lives only in the owner's browser and is never stored in the repo.

## Deploy

`scripts/stage.mjs` copies what the public site needs into `_site/`. `.github/workflows/pages.yml` runs the checks, stages the site and publishes it to GitHub Pages on every push to `main`. `vercel.json` does the same on Vercel: import the repo with no other settings.

## Encrypted rooms

`/vault/` and `/observatory/` are **encrypted with AES-256-GCM** using a key derived from a passphrase (PBKDF2-SHA256, 600k iterations). Only the sealed JSON is in the repo; the plaintext lives in a git-ignored `private/` folder. This is encryption, not a login: anyone can download the sealed file and try passphrases offline, so the passphrase is the whole of the security. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#private-rooms).

## Credits

- **Paintings:** public domain, from Wikimedia Commons ([assets/img/CREDITS.md](assets/img/CREDITS.md)).
- **Fonts:** Doto, Newsreader, Inter, Fragment Mono, Fraunces, JetBrains Mono and Silkscreen, all under the SIL Open Font License, via Google Fonts.
- **Data:** book covers come from the Open Library Covers API, and live repositories from the public GitHub API.
- **Drawing:** the rooms, skies and landmarks are drawn in code.

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): structure, data flow and decisions
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md): type, colour, motion and easter eggs
- [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md): what works, what's tested and what's next
- [CLAUDE.md](CLAUDE.md): working rules for AI coding sessions on this repo

© Sai Siddhanth Challa. All rights reserved, unless a file says otherwise.
