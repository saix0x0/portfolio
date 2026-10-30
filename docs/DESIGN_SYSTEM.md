# Design system

**Direction:** a cinematic editorial travelogue. Huge soft serif headlines set against live skies, small mono metadata like boarding passes, and minimal chrome. Panels appear only where dense content needs a reading surface. Each chapter gets one signature layout (hero, ledger, mosaic, workshop, arched doors), so the page never turns into a wall of identical cards.

## Typography
| Role | Face | Notes |
|---|---|---|
| Display (h1–h3, titles, numbers) | **Fraunces** variable, weight 400, `SOFT 50` | Italic with `WONK 1` for the emphasised word (*academy.*, *workshop.*) |
| Body | **Inter** 400/500/600 | 1rem–1.1rem fluid, line-height 1.6 |
| Metadata, kickers, labels | **JetBrains Mono** 400/500 | Uppercase, letter-spacing 0.12–0.16em |

Fluid scale tokens `--step--1` … `--step-5` in `base.css` (hero name tops out around 10.5rem). Display letter-spacing is −0.02 to −0.035em.

## Colour
Ink is warm white `--ink #fff7ee`, with 78% and 56% tints. Accents: `--gold #ffc477` (primary highlight, focus ring), `--rose #ff7d97`, `--aurora #6ff5c4` (the private rooms and Arctic), `--violet #b59bff` (constellation). Readability over bright skies comes from text-shadow on display type, panels at about 62–72% opacity with blur, and a dark scrim on inner pages. Every scene's silhouettes use per-scene CSS variables (`home.css` → `.scene-art[data-scene=…]`).

## Chapters
| # | City | Time of day | Purpose | Signature layout | Interactive detail |
|---|---|---|---|---|---|
| 01 | Paris | Golden hour, violet → peach | Who I am | Giant two-line name, sun scrubber, About + "Right now" panel | Eiffel beacon sweep; click the tower to make it sparkle |
| 02 | Rome | Deep orange dusk | The academy (IIIT, college work) | Roman-numeral **ledger** list linking to case studies, coursework chips | Ruined Colosseum with sky through the arches |
| 03 | Rio | Magenta tropical dusk | Experiences | **Selarón-tile mosaic** cards | Festa bunting, cable car on Sugarloaf, Cristo Redentor |
| 04 | New York | Blue hour, Manhattanhenge | Skills & hiring | Two-panel **workshop** (skills linked to projects + hiring) and showcase | Perspective street, sun at the vanishing point; click a cab |
| 05 | Tromsø | Polar night | Library, links, contact | **Arched doors**, postcard contact form | Aurora + reflection, cabin with a cat, stargazer with telescope |
| — | Lab / Observatory | Surreal teal-gold / deep violet night | Experiments / hidden room | Experiment tiles; lock ring | — |

## Motion
- **Purposeful only:** a letter-by-letter rise of the name, a 1s reveal on scroll, chapter crossfades tied to scroll, and slow ambient loops (clouds, shimmer, window twinkles, beacon, smoke, aurora).
- Easing is `--ease: cubic-bezier(.16,1,.3,1)`.
- `prefers-reduced-motion` stops every CSS animation and transition, renders the sky statically, and skips parallax.

## Components
`.btn` (+`.primary`, `.small`), `.chip`, `.pill[aria-pressed]` (filters), `.panel`, `.glow` (cursor light), `.badge-placeholder` (yellow hazard stripes for not-yet-real content), `.field`, `.search`, `.kicker`, `.meta`, dialogs (search palette, 60-second view, case study, book view, lab stage).

## Responsive
- Nav collapses to a full-screen menu below 1080px.
- Flight-path rail hides below 760px, and the city clock centres at the bottom.
- Scene art is 72vh on desktop, 58vh below 700px, 52vh on portrait. Focal points stay within x≈570–1030 of the 1600 viewBox.
- No horizontal overflow at 375px (verified).

## Easter eggs (spoilers)
None of them gate content. The footer shows "✦ n/10 secrets found".
1. Click the **sun** three times and it sets (night mode). Do it again to restore it.
2. Click the **Eiffel Tower** and it sparkles.
3. Click the **Colosseum** for a fact.
4. Click **Cristo Redentor** for fireworks.
5. Click a **taxi** and it drives into the sunset.
6. Click the **cabin window** and a cat appears.
7. Click the **stargazer** for a meteor shower and a link to the Observatory.
8. Type **"aurora"** anywhere, or search it, and the aurora appears on any page.
9. The **Konami code** sets off fireworks.
10. Visit all five cities to complete the **passport**.
Hidden search commands: `fireworks`, `meteors`, `observatory`, `sunset`. There's also a greeting in the dev console.
