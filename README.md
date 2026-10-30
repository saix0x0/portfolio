# Sai Siddhanth Challa — a portfolio you travel through

A personal website that is three things at once:

1. **A serious portfolio.** Projects, college work at IIIT Hyderabad, skills, hiring info and contact, each reachable in one click or one URL.
2. **A world.** You scroll from golden-hour Paris to Rome, Rio, New York and the Arctic. The sky, sun, clouds, stars and aurora are painted live, and each city has hand-built landmark silhouettes.
3. **A personal workspace.** A library, a links dashboard, a lab for experiments, and two encrypted private rooms.

It has **no dependencies, no build step and no paid services.** It's plain HTML, CSS and JavaScript modules, served as static files.

## Run it

```bash
npm run dev        # → http://localhost:4173  (Node 18+, nothing to install)
npm run check      # integrity checks: privacy, links, content
npm run seal vault # encrypt private/vault.md → vault/sealed.json
```

## Where things are

| URL | What |
|---|---|
| `/` | The journey: 01 Paris (about), 02 Rome (college), 03 Rio (experiences), 04 New York (skills & hiring), 05 Tromsø (library & contact) |
| `/work/` | The logbook: every project, with filters, search, timeline and constellation views |
| `/work/#college` · `/college/` | College projects only. Send this to anyone who asks "what have you built at college?" |
| `/work/#p/<id>` | One project's case study |
| `/library/` | Books with covers, free-to-read links and search |
| `/compass/` | Departures board of useful websites. Set it as your browser homepage |
| `/lab/` · `/lab/#<id>` | Experiments, each sandboxed |
| `/vault/` | Encrypted private room |
| `/observatory/` | Hidden encrypted room (reached via the telescope in the Arctic scene) |
| <kbd>⌘K</kbd> or <kbd>/</kbd> | Search everything, on any page |

## Edit your content

Everything you'd change lives in [`content/`](content/). **Search for `TODO`** and replace the placeholders. Entries marked `placeholder: true` show a visible "Placeholder" badge until you remove the flag. See [docs/CONTENT_SCHEMA.md](docs/CONTENT_SCHEMA.md).

## Deploy (free)

**GitHub Pages:** push to `main` on a public repo, then go to **Settings → Pages → Source: GitHub Actions**. The included workflow runs `npm run check` and publishes. A custom domain is optional and is the only thing that costs money.
Cloudflare Pages and Netlify also work. Point them at the repo root with no build command.

## Contact form

Out of the box the form uses `mailto:`, which opens the visitor's own mail app. For real delivery to your inbox, get a free [Web3Forms](https://web3forms.com) key (no account, just your email; the free tier is 250 messages a month at the time of writing) and set `contact.provider: 'web3forms'` in `content/site.js`. Until `email` is set, the form says plainly that it isn't connected.

## Private rooms: what they do and don't protect

The vault and observatory are **encrypted with AES-256-GCM** using a key derived from your passphrase (PBKDF2-SHA256, 600k iterations). The plaintext lives only in the git-ignored `private/` folder. Pages download ciphertext and decrypt in the browser.

This is encryption, not server-side authentication. Anyone can download the sealed file and try passphrases offline, so **the passphrase is the security.** Use five or more random words, and never store passwords, bank details or ID numbers there. Full details are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#private-rooms).

## Docs

- [CLAUDE.md](CLAUDE.md): read first if you're an AI session continuing this work
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): structure, data flow, decisions
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md): type, colour, scenes, motion, easter eggs
- [docs/CONTENT_SCHEMA.md](docs/CONTENT_SCHEMA.md): how to add projects, books, links, experiments
- [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md): what works, what's tested, what's next
- [docs/ROADMAP.md](docs/ROADMAP.md)

## Credits

Every landscape is procedural SVG and canvas, drawn in code, so there are no image licences to track. Fonts: Fraunces, Inter and JetBrains Mono (SIL Open Font License, via Google Fonts). Book covers: Open Library Covers API. Favicons in the Compass: DuckDuckGo icon service.
