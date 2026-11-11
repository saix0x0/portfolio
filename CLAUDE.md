# CLAUDE.md — instructions for any session continuing this project

## CRITICAL: PRESERVE THE WORLD
The front page `/` (`index.html`, `pages/landing.js`) leads into the desk at `/desk/`: a room drawn in code with clickable objects (`desk/index.html`, `pages/desk.js`, `assets/js/desk/`, words in `content/desk.js`). The playable isometric pixel-art hotel lives at `/hotel/` (`assets/js/world/`). It is **not linked** from the site (`site.game: false`) and is `noindex`; keep its files. Before touching it, read `docs/WORLD_DESIGN.md`. Never redesign a floor just to add content, never make floors look alike, and never swap themed rooms for cards or dashboards. Content goes in `content/*.js`, and the rooms render it through their existing slots.
**Scope for now (owner's call):** local only. No auth, no deployment, no backends or live APIs, no pushes unless asked. Locked floors use simple local unlocks on purpose.
Portfolio Mode (the older scrolling site) lives at `/portfolio/` plus `/work/`, `/library/` etc.


## What this is
The personal portfolio of **Sai Siddhanth Challa** (IIIT Hyderabad, CS + Computing & Human Sciences). It's a scroll journey through five sunset cities, plus pages for work, library, links, lab and two encrypted private rooms. Central principle: **a beautiful world that is also a serious, fast, professional portfolio.** Neither side gets sacrificed.

## Before you change anything
0. If `notes/HANDOFF.md` exists locally (git-ignored, owner-only), read it for the full history and the owner's preferences.
1. Read `docs/IMPLEMENTATION_STATUS.md` (current truth) and `docs/ROADMAP.md` (next tasks).
2. Run `git status`. Don't discard uncommitted work.
3. Run `npm run dev` and look at the page in a browser before and after your change.

## Hard rules
- **Zero dependencies, zero build step.** Plain ES modules and CSS. Don't add npm packages, frameworks or bundlers without the owner's explicit OK (see the decision log in ARCHITECTURE.md). External scripts are not allowed. Google Fonts, the Open Library / DuckDuckGo image APIs, Jolpica F1, the public GitHub API (`core/github.js`) and the Spotify embed iframe on the desk's speaker (`open.spotify.com`, owner-requested) are the only network calls besides the optional Web3Forms POST.
- **Never invent facts** about the owner: projects, awards, skills, metrics, jobs. Use `placeholder: true` or `TODO` and let the owner fill them in.
- **Never read, print, commit or move `private/`.** It holds plaintext and starter passphrases. Only `*/sealed.json` is public. `npm run check` fails if private text leaks into a public file.
- Don't describe the private rooms as "secure login". They are client-side encryption, and passphrase strength is the security (ARCHITECTURE.md → Private rooms).
- Every important destination needs a plain link and a URL. Easter eggs are bonuses and never the only way to reach content.
- Respect `prefers-reduced-motion`. Keep mobile working, with no horizontal overflow at 375px.

## Commands
- `npm run dev`: static server on :4173 (mirrors GitHub Pages: folder → index.html, missing → 404.html)
- `npm run check`: privacy, link/import resolution and content checks. **Run before every commit.**
- `npm run seal <vault|observatory>`: re-encrypt a private room after editing `private/<room>.md`

## Map
- `content/*.js`: all editable content (site, projects, extracurriculars, skills, books, links)
- `assets/js/core/`: shared engine. `layout.js` (nav, footer, search, 60-second view, `boot()`), `sky.js` (canvas sky), `scenes.js` (landmark SVGs), `eggs.js`, `contact.js`, `vault.js`, `sun.js`, `art.js`, `base.js`
- `assets/js/pages/<page>.js`: one entry module per page
- `assets/css/base.css` (design system), `home.css`, `pages.css`
- `lab/experiments/`: self-contained experiments plus the `index.js` registry
- `scripts/`: dev server, seal, check (Node, no deps)

## Conventions
- Each page's HTML is a thin shell. JS renders from `content/`. Use `esc()` for every interpolated string.
- Use `href('path/')` from `base.js` for internal links so the site works under a sub-path (GitHub project pages).
- CSS classes are global, so check for collisions before naming (e.g. `.gate`/`.lock` once broke the Compass).
- Scene art lives in a 1600×700 viewBox, bottom-anchored with `slice` cropping. Keep focal points within x≈570–1030 so they survive phone widths.
- Match the existing style: small modules, comment headers, no classes unless stateful.

## After a change
Run `npm run check`, test in the browser at desktop and 375px, then update `docs/IMPLEMENTATION_STATUS.md` (what changed, what you tested, next task) and commit with a clear message.
