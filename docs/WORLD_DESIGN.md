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
| Perspective | 3D dollhouse cross-section (oblique projection, see **Projection** below). Floor slabs are 10 px. Rooms show back wall, a visible floor plane, the left side wall and 3D furniture; the front wall is cut away |
| Outline | 1 px dark outline (`#0d0716`) on characters and key props |
| Type | In-world signs use the 3×5 pixel font (`pixelfont.js`). UI panels use Silkscreen (headings) and JetBrains Mono (body) |
| Exterior | Night city, magenta–violet sky, ringed planet, rain, flying cars, visible through windows and around the building |
| Controls | WASD or arrow keys walk (W/S = depth) · E interact · M map · Esc close · click/tap to walk · 4-way touch pad on phones |
| Interaction | Approach an object, see the `[E] VERB · NAME` prompt, get a panel with real content. Nothing decorative pretends to be interactive |

### Projection (3D rooms, since 2026-10-31)
Every floor is a shallow box seen from the front-right and above. World `(x, z, height)` → screen `(x − z·0.5, f.yb + z·0.5 − height)`, where `z` is depth from the back wall (0) to the cut-away front (`DEPTH` = 80). Constants live in `layout.js`.
- **Back-wall art keeps its 2D coordinates** (`f.top … f.yb`, with `f.y = f.yb + 8` as before). Wall content never moves when a room becomes 3D.
- **Floor plane** (`kit.floorPlane`) is tiled in perspective and darkens toward the back. The **left wall** (`kit.leftWall`) is the visible side; the right wall's cut edge hides the last 40 px, so `IN_R` sits 40 px past the old edge.
- **Furniture** is a floor module's `props(f)`: items `{x0, x1, z0, z1, solid?, draw}` built with `kit.box` (top, front, right faces) and pre-rendered with `kit.bake`. The game depth-sorts props and people every frame. A person is drawn after a prop when they are in front of it (`z ≥ z1`) or to its right (`x ≥ x1`).
- **Interior walls** come from a module's `doors` and are 3D (`kit.wallPieces`): a doorway at z 34–66 with a glass door that slides up as you approach.
- **Walking** is on the floor plane, between z 8 and 76. `LANE` (z 54) must stay clear of furniture on every floor, because auto-walk detours through it.
- **Glass elevator**: the shaft is a box against the back wall (z 0–34). You walk *in front of* it and step in through its front. The `front` canvas re-draws floor and slab strips over the car so it passes behind them.
- Objects take an approach depth `z` (default 20). Interaction range is ±18 in x and ±30 in depth.

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
- 2026-10-31: **3D rooms.** The whole hotel switched to the oblique dollhouse projection (floor planes, left walls, 3D partitions, a 3D elevator shaft, a roof deck). The Lobby is fully converted: sofas, table, Skyview console, reception desk (the android stands behind it), kiosk, vending machine, mailbox, bar counter, stools and jukebox are depth-sorted 3D props. A lounge rug was added, and the entrance moved to the left side wall. Back-wall art and every object, NPC and panel are unchanged. Other floors keep their furniture painted against the back wall until converted.
- 2026-10-30: World created with the floor plan above (Lobby, Comms, Gallery, Pavilion, Study open; Basement + Penthouse locked).
