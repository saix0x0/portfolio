# Architecture

## Shape
A static multi-page site. Each page is a thin HTML shell that loads one ES module from `assets/js/pages/`. That module calls `boot()` from `core/layout.js`, which mounts the sky canvas, nav, footer, search palette and easter eggs, then renders the page from `content/*.js`.

```
index.html ─▶ pages/home.js ─┬▶ core/layout.js ─▶ sky.js, eggs.js, content/*
work/       ─▶ pages/work.js ┤   (nav, footer, ⌘K search, 60-second view)
library/    ─▶ pages/library.js
compass/    ─▶ pages/compass.js
lab/        ─▶ pages/lab.js ──▶ lab/experiments/*.js  (dynamic import, sandboxed)
vault/      ─▶ pages/vault.js ─┐
observatory/ ▶ pages/observatory.js ─┴▶ core/vault.js ─▶ fetch */sealed.json → WebCrypto decrypt
college/ projects/ hire/ books/  → tiny redirect pages (short, shareable URLs)
```

## Routes & deep links
| URL | Result |
|---|---|
| `/` | Professional front page (`#about`, `#work`, `#academy`, `#offscreen`, `#hotel`, `#contact`) |
| `/hotel/`, `/hotel/#<floor>` | The pixel hotel, optionally starting on an open floor |
| `/portfolio/#paris` … `#arctic` | The older sunset journey |
| `/#quick` (any page) | Opens the 60-second version |
| `/work/#<category>` | Filter: `college`, `research`, `hackathon`, `personal`, `open-source`, `work`, `experience` |
| `/work/#p/<id>` | Case study dialog. Prev/next, copy link |
| `/work/?q=<text>&view=timeline\|sky` | Search, alternate view |
| `/library/#<isbn>` | Opens a book |
| `/lab/#<id>` | Opens an experiment |

On the Work page the URL is the source of truth: state is written back with `history.replaceState`, so every view is shareable.

## The home journey
- `.world` is a fixed layer holding the five `.scene-art` landscapes (from `core/scenes.js`). Content scrolls over it.
- Scroll position becomes a continuous `progress` from 0 to 4. A chapter holds until 70% of the way through, then eases into the next. Outgoing and incoming art sink and fade, which makes the "in flight" moment.
- The same `progress` drives `sky.setProgress()`, so the canvas sky blends palettes in step with the landscapes.
- The flight-path rail, city clock (live local time plus today's real sunset via `core/sun.js`) and passport stamps all read the same progress.

## Sky engine (`core/sky.js`)
One `<canvas>`, a DPR capped at 1.25–1.5, and one rAF loop that pauses when the tab is hidden. It draws a 4-stop gradient, stars, aurora ribbons (scaled-gradient columns, cheap), sun glow and disc, horizon haze, 7 pre-rendered cloud sprites tinted per frame via `source-in`, birds, meteors and fireworks. Palettes are named objects (`PALETTES`), and `setShift(-1..1)` mixes toward day or night. With reduced motion it renders only when something changes.

## Content
`content/*.js` are plain ES modules that export arrays and objects. JS over JSON was chosen so files can carry comments explaining every field. The schema is in CONTENT_SCHEMA.md.

## Private rooms
| | |
|---|---|
| Plaintext | `private/vault.md`, `private/observatory.md`. **Git-ignored**, never published |
| Sealing | `npm run seal <room>`: PBKDF2-SHA256 (600k iterations, random 16-byte salt) → AES-256-GCM (random 12-byte IV) → `<room>/sealed.json` |
| Opening | The page fetches the ciphertext, derives the key from the typed passphrase in the browser, and decrypts. GCM authentication rejects wrong passphrases. Nothing is sent anywhere |
| "Stay unlocked" | Stores the derived key (not the passphrase) in `sessionStorage` for that tab only |
| Hidden route | `/observatory/` is unlinked and `noindex`. That's obscurity for fun, not security |
| Verified | `npm run check` scans every public file for any line of `private/*` and fails on a match |

**Threat model, honestly:** this protects content from anyone without the passphrase, assuming the passphrase is strong. It does **not** give you accounts, revocation, rate limiting or server-side secrecy, because the ciphertext is public and can be attacked offline. With a 5-random-word passphrase (~50+ bits) and 600k PBKDF2 iterations, offline guessing is impractical. With a short password it is not. Treat it like an encrypted notebook, not a bank vault, and keep passwords in a password manager.

**If you ever need real authentication** (multi-device editing, revocable access): put the private rooms behind Cloudflare Access (Zero Trust free tier, email one-time codes) on Cloudflare Pages, or move them to a backend such as Supabase with row-level security. Both need accounts and configuration, so they were deliberately not set up.

## Contact delivery
`core/contact.js` validates the form, adds a honeypot field, and then either POSTs to Web3Forms (when configured; the access key is designed to be public) or builds a `mailto:` link. With no email configured, the send button is disabled and the form says why. It never claims a message was sent unless Web3Forms returned success.

## Performance
- No images in the landscapes, since they're generated SVG. Total JS+CSS is about 150 KB unminified, and the only external weight is fonts and book covers (lazy-loaded).
- Scene layers are cached, and the parallax loop only runs on hover-capable devices.
- Canvas DPR is capped, and clouds are pre-rendered sprites.

## Decision log
| Decision | Why |
|---|---|
| Vanilla ES modules, no React/Vite | The site should run free for years with no upgrades: no `node_modules`, no build to break, deployable anywhere by copying files. The UI is mostly rendering data, so a framework adds little. Revisit if pages start needing complex shared state. |
| Procedural SVG/canvas instead of photos | No licensing, no CDN rot, ~0 bytes of imagery, art that reacts (sky blend, parallax, clickable landmarks), and every scene shares one visual language. |
| Multi-page over SPA | Real URLs, no router, works with JS-light crawlers. Back/forward just work. |
| Client-side encryption for private rooms | It's the only zero-cost, zero-account option that keeps content genuinely unreadable in a public repo. Limits are documented above. |
| `mailto:` default, Web3Forms optional | Works with zero setup, and real delivery is one key away with no backend to run. |
| Content as JS modules | Comments inline, and importable by both the browser and Node (`check.mjs`). |
| Live F1 from Jolpica (`core/f1live.js`), client-side | The owner asked for the latest race results. Public, keyless, CORS-open; cached 20 min in `localStorage`; every view falls back gracefully when offline. No backend. |
| Front page first, hotel at `/hotel/` (2026-10-31) | The owner wants recruiters to land on a fast professional page, with the game one click away. |
