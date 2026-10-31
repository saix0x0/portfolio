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
| Perspective | Isometric (2:1) cross-section of the whole building, see **Projection** below. Floor slabs are 10 px. Rooms show the back wall, floor, left side wall and 3D furniture; front and right walls are cut away |
| Outline | 1 px dark outline (`#0d0716`) on characters and key props |
| Type | In-world signs use the 3×5 pixel font (`pixelfont.js`). UI panels use Silkscreen (headings) and JetBrains Mono (body) |
| Exterior | Night city, magenta–violet sky, ringed planet, rain, flying cars, visible through windows and around the building |
| Controls | WASD or arrow keys walk (W/S = depth) · E interact · M map · Esc close · click/tap to walk · 4-way touch pad on phones |
| Interaction | Approach an object, see the `[E] VERB · NAME` prompt, get a panel with real content. Nothing decorative pretends to be interactive |

### Projection: isometric camera (since 2026-10-31)
A true 2:1 isometric camera, like Floor796. The building runs diagonally across the screen and every floor is a 3D box seen from the front-right and above, with its front and right walls cut away. World `(x, z, height)` → screen `(x − z + OX, f.yb + x/2 + z/2 − height)`, where `x` runs along the building and `z` is depth from the back wall (0) to the cut front (`DEPTH` = 96). Constants and `proj`/`unproj`/`ceilY` live in `layout.js`.
- **Back-wall art is still painted flat** (`paint`, in the old 2D coordinates `f.top … f.yb`) onto a flat canvas. The builder shears it onto the back walls (`WALL` transform), and the game shears `dyn()` the same way each frame. Wall content never moves.
- **Isometric layers** are drawn by `hotel.js` and `kit.js`: floor planes (`floorPlane`, iso tiles), the left wall (`leftWall`), slabs and outer walls, the glass shaft, and the roof deck. A module may add `paintIso(ctx, f)` / `lightsIso(l, f)` for things on the floor or side wall (e.g. the Lobby rug and entrance).
- **Furniture** is a module's `props(f)`: items `{x0, x1, z0, z1, solid?, draw}` built from `kit.box` (top, front, right faces), with flat decals on faces via `kit.onFace`, pre-rendered with `kit.bake`. Props and people are depth-sorted each frame: a person is drawn after a prop when they're in front of it (`z ≥ z1`) or to its right (`x ≥ x1`).
- **Interior walls** come from `doors` and are 3D (`kit.wallPieces`), with a doorway at z 40–80 and a sliding glass door.
- **Walking** happens on the floor plane, z 8–90. `LANE` (z 64) must stay clear of furniture on every floor, because auto-walk detours through it.
- **Glass elevator**: the shaft is a box against the back wall (z 0–36), entered from its front. The `front` canvas redraws floor and slab strips over the car.
- Each floor's plane covers `FD` = 96 px of screen height per column, so storeys stack by `SLAB + FD + h − 8`. Everything above `ceilY(f, sx)` is hidden by the floor above.

### Floor bible (permanent identities)
| Floor | ID | Name | Purpose | Palette & light | Signature props | Status |
|---|---|---|---|---|---|---|
| PH | `penthouse` | **The Penthouse** | The owner's private residence: the only floor written in the owner's voice. Every other floor is open to all | Midnight, silver, champagne · soft pendants + fairy lights | Notes desk (notebook from `content/notes.js`), corkboard, curio shelf of pop-culture nods, record cabinet, telescope, piano, bed, wardrobe, twin-monitor workstation | Locked: keypad code (`floors/penthouse.js`) |
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
- 2026-10-31 (evening): **Hotel moves to `/hotel/`; the professional front page is `/`.** New sprites and a wardrobe; boost (Shift / ⚡); the Penthouse rebuilt in 3D as the owner's private floor with a notebook of notes-to-self; live F1 (Jolpica) on the Pit Wall plus a lights-out reaction game; seven rubber ducks; synth sound with a mute toggle. Floors, the key chain and every existing object are unchanged.
- 2026-10-31 (later): **Isometric camera.** The owner said the oblique view still looked like a 2D game. The whole hotel now uses a true isometric projection: the building runs diagonally, floors stack as 3D boxes, and wall art is sheared onto the walls. A street and earth were added outside the entrance. All floors, objects, NPCs and the key chain are unchanged.
- 2026-10-31: **3D rooms.** The whole hotel switched to the oblique dollhouse projection (floor planes, left walls, 3D partitions, a 3D elevator shaft, a roof deck). The Lobby is fully converted: sofas, table, Skyview console, reception desk (the android stands behind it), kiosk, vending machine, mailbox, bar counter, stools and jukebox are depth-sorted 3D props. A lounge rug was added, and the entrance moved to the left side wall. Back-wall art and every object, NPC and panel are unchanged. Other floors keep their furniture painted against the back wall until converted.
- 2026-10-30: World created with the floor plan above (Lobby, Comms, Gallery, Pavilion, Study open; Basement + Penthouse locked).
