# WORLD_DESIGN.md — the Cyberverse Hotel (source of truth)

> **Read this before changing anything in `assets/js/world/`.** Room identities are permanent. Adding content (a project, a book, an experience) must never change how a room looks. It only fills existing slots and interaction patterns. A redesign needs the owner's explicit request and an entry in the changelog at the bottom.

## The world
**CYBERVERSE** is a towering cyberpunk hotel floating over a rain-soaked neon city under a ringed planet. You see it in **side-view cross-section**, like a dollhouse with the front wall removed (inspired by Floor796's continuous explorable world, though not a copy of its art). Visitors control a character, walk the floors, ride a glass elevator, open doors, talk to residents and use objects that hold real portfolio content.

It is **not** a floor plan, a room selector, a dashboard or a website with a game background.

### Shared across every floor (never vary these)
| Rule | Value |
|---|---|
| Rendering | Canvas 2D at low internal resolution, integer-scaled, `image-rendering: pixelated`. No smoothing, no blur except the neon glow pass |
| Pixel scale | 1 world unit = 1 art pixel. Characters ≈ 26 px tall. Standard storey = 128 px (lobby 176, library 144) |
| Perspective | Pure side view. Floor slabs are 10 px. Rooms show back wall, floor, ceiling and furniture |
| Outline | 1 px dark outline (`#0d0716`) on characters and key props |
| Type | In-world signs use the 3×5 pixel font (`pixelfont.js`). UI panels use Silkscreen (headings) and JetBrains Mono (body) |
| Exterior | Night city, magenta–violet sky, ringed planet, rain, flying cars, visible through windows and around the building |
| Controls | A/D or ←/→ walk · E interact · M map · Esc close · click/tap to walk |
| Interaction | Approach an object, see the `[E] VERB · NAME` prompt, get a panel with real content. Nothing decorative pretends to be interactive |

### Floor bible (permanent identities)
| Floor | ID | Name | Purpose | Palette & light | Signature props | Status |
|---|---|---|---|---|---|---|
| PH | `penthouse` | **Penthouse** | Owner's workspace | Midnight, silver, champagne · soft pendants | Wall-to-wall windows, twin-monitor workstation, piano, plants | Locked: keypad code |
| 4 | `study` | **The Study** | Books, reading, websites, interests | Dark wood, amber, cream, muted green · banker's lamps | Shelves whose spines are the real books (one unit per subject + a green "free" shelf), rolling ladder, reading desk, sleeping cat, window nook, exploring chalkboard, card-catalogue terminal | Open |
| 3 | `pavilion` | **Racing Pavilion & Cinema** | F1 + media | Asphalt grey, racing red, kerb stripes, timing green | Garage (display F1 car, tyre stacks, tool cart), Track Room wall map, Pit Wall timing screens, Hall of Champions helmets, cinema with a screen that plays the chosen channel | Open |
| 2 | `gallery` | **Art Gallery** | Every project as an exhibit | Charcoal walls, gold frames, warm spotlights | West Hall (featured/personal), College Wing (college/hackathon/research), Journey timeline wall, Toolkit case, the crooked painting | Open |
| 1 | `comms` | **Communications Lounge** | Contact, channels, hiring | Teal, cyan, coral sofas | Message terminal, pneumatic mail tubes, channel wall, lounge window, opportunities desk | Open |
| G | `lobby` | **Grand Lobby** | Spawn, guide, navigation | Plum, gold, magenta + amber neon | Revolving entrance, Skyview window + console, neon palms, reception (android + live world clocks), Nova the guide, directory, Portfolio kiosk, vending, mailbox, Neon Bar + jukebox, staff stairs | Open |
| B | `basement` | **Mystery Basement** | Hidden history, secrets | Deep blue brick, emergency green, violet | Pipes, blueprint wall, crates, floating artifact, glitching terminal, archive door | Locked: keycard |
| — | — | *Future:* Laboratory, Acad Space, Observatory, Arcade & Music Lounge, Sky Lounge (roof), hotel exterior | Not built yet. Define each floor's row here before building it | | | Roadmap |

### The key chain (simple local unlocks, deliberately not security)
1. **Gallery:** inspect the crooked painting by the elevator. It swings open and the note points to the Study's philosophy shelf.
2. **Study:** pull the glowing book (*Gödel, Escher, Bach*). The keycard drops out and B unlocks (elevator + lobby staff stairs).
3. **Basement:** the old terminal shows **1729**.
4. **Penthouse keypad:** enter 1729 and PH unlocks.
Progress is saved in `localStorage` (`hotel:v1`). The guide's hints follow the chain.

### Skyview
The lobby console switches the world outside between **Cyberpunk City · Golden Sunset · Polar Aurora · Deep Space** (`city.js → SKYVIEWS`). Every window shows the same sky.

## Changelog
- 2026-10-30: World created with the floor plan above (Lobby, Comms, Gallery, Pavilion, Study open; Basement + Penthouse locked).
