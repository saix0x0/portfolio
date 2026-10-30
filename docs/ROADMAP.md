# Roadmap

## Critical (before sharing the link)
1. Replace placeholders in `content/` (bio, projects, experiences, skills, email, socials, résumé).
2. Re-seal both private rooms with your own passphrases, then delete `private/PASSPHRASES.local.txt`. Back up `private/`.
3. Push to GitHub and enable Pages (Settings → Pages → GitHub Actions).
4. Optional: set up Web3Forms for real email delivery, then send yourself a test message.

## Visual
- Project screenshots and covers (`image`, `screenshots`), optimised WebP, lazy-loaded.
- An Open Graph share image (`assets/og.png`, 1200×630) rendered from the Paris scene.
- Per-chapter typography accents (e.g. Roman numerals as giant background type in Rome).
- A richer NYC skyline beyond the street, with an Empire State silhouette far behind the sun.
- A "night" variant of each city for when the sun is set.

## Features
- A world-map overlay (stylised SVG globe with five glowing markers and content counts) as an alternative chapter nav.
- An optional guided tour mode ("Take the 90-second tour") with skip and exit.
- Optional ambient sound per city, off by default, with a visible toggle and licensed or original audio only.
- A "Now" page with dated updates (a living log).
- An RSS/JSON feed for the logbook.
- Library: papers, courses and articles as first-class `type`s with their own filter.

## Experiments (Lab ideas)
- A sky that uses the visitor's real local sunset time.
- A generative "postcard from your city" download.
- An interactive project-architecture diagram component for case studies.

## Deployment / hardening
- If multi-device private editing is ever needed, put `/vault/` and `/observatory/` behind Cloudflare Access (free tier). See ARCHITECTURE.md.
- Add a link-rot checker for external links (books, Compass) as a monthly GitHub Action.
