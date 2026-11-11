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
| `/vault/` · `/observatory/` | Two client-side encrypted rooms (see below) |
| <kbd>⌘K</kbd> or <kbd>/</kbd> | Search everything, on any page |

`/hotel/`, a playable pixel-art hotel, is in the repo but unlisted (`site.game: false` in `content/site.js`).

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

## Deploy

`.github/workflows/pages.yml` runs the checks and publishes to GitHub Pages on every push to `main`. It copies only public files: no `docs/`, `scripts/`, `private/` or Markdown. Turn it on once under **Settings → Pages → Source: GitHub Actions**. Any static host works too, with no build command.

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
