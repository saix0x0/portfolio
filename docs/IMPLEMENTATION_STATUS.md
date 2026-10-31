# Implementation status

_Last updated: 2026-10-31, front page + hotel upgrade._

## Front page `/` (new) and hotel at `/hotel/`
The professional site now opens first (`index.html`, `assets/js/pages/front.js`, `assets/css/front.css`). The hotel moved to `/hotel/`, and the old journey is still at `/portfolio/`.
| Feature | How it was verified |
|---|---|
| Opening construction-line intro (once per session, skipped on any input) | Screenshots |
| Hero: starfield canvas, golden-ratio geometry, split-word name, pixel buddy with speech bubble | Desktop 1440×900 and 375×812 screenshots |
| About statement with highlight sweep; torn-paper edges between dark and parchment chapters | Screenshots |
| Work: giant sticky plate word, then a pinned horizontal rail (desktop ≥961 px) or a swipe rail (phone) | Scripted scroll + screenshots at both sizes |
| Academy ledger with hover art; Off-screen live Pit Wall card (Jolpica); shelf; doors | Screenshots; live data showed the 2026 US GP result and Mexico City countdown |
| Hotel window: a live, slowly panning render of the real hotel | Screenshots at both sizes |
| Contact "Say hello." stroke-fill, reach list (shows "not set yet" until `site.email`/socials are filled) | Screenshots |
| Header flips to ink when over a parchment chapter | Scripted scroll check (`on-paper` class) |
| Phone 375 px: no horizontal overflow on `/` or `/hotel/` | Emulated 375×812, `scrollWidth === innerWidth` |
| Not yet verified | Real-time scroll feel and the pixel-dissolve into the hotel in a visible browser (the test pane is hidden, so rAF, scroll events and IntersectionObserver are throttled); reduced motion toggled in an emulator |

## Hotel upgrade (same branch)
| Feature | How it was verified |
|---|---|
| New character sprites (rounded heads, blinking, four iso facings, talking), wardrobe (Lobby mirror + Penthouse) | Sprite sheet screenshot; wardrobe saved and reloaded |
| Boost: Shift / ⚡ button / automatic on long click-walks, with dust and afterimages | Scripted; real-time feel not checked |
| Penthouse rebuilt as the owner's private floor: notes desk (sticky notes, idea jar, to-do, lines, doodles, scratchpad), curio shelf, records (synth loops), telescope, piano, bed (nap cycles the sky), workstation | Screenshots and panel clicks |
| Live F1 on the Pavilion Pit Wall (podium, results, standings, next race) + "lights out" reaction game | Live data loaded; reaction game played |
| 7 rubber ducks (one per floor), sound with mute toggle, toasts | Scripted collection |
| Auto-walk to every object on every floor (69 objects) | Scripted travel loop, 0 failures |

## World Mode — isometric 3D (branch `world/3d-rooms`)
| Feature | How it was verified |
|---|---|
| Isometric camera for the whole building (sheared wall art, iso floors, left walls, slabs, roof, street) | Overview screenshots at 1:1, no console errors |
| Lobby furniture as depth-sorted 3D props; entrance in the left wall | Screenshots of the lounge, desk/elevator and bar areas |
| Walking in depth (WASD/arrows), sliding collision against furniture | Scripted: walking into the sofa stops at its front edge |
| Glass elevator boarded from the front; car hidden behind slabs mid-ride | Scripted G → 2 → G rides; mid-ride screenshot |
| 3D partition walls with sliding glass doors | Scripted walk through the Gallery doorway; screenshot |
| Auto-walk to every object on every floor (47 objects, incl. both locked floors) | Scripted travel loop, 0 failures |
| Phone (375 px): 4-way touch pad, no horizontal overflow, camera lifted above the pad | Emulated 375×812 |
| Not yet verified | Real-time feel in a visible browser (the test pane throttles animation), and keyboard feel of W/S depth movement |


## Works and was tested in a browser
| Feature | How it was verified |
|---|---|
| Home journey: 5 chapters, scene crossfades, sky palette blending | Scrolled through each chapter at 800×600 and 1280×800 and inspected screenshots |
| Paris hero, sun scrubber, About, "Right now" | Visual |
| Rome ledger → case-study links | Visual; links resolve (`npm run check`) |
| Rio mosaic, NYC skills/hiring/showcase, Arctic doors | Visual |
| Contact postcard validation | Empty submit → 3 errors; bad email → error; send disabled + explained while `email` is empty |
| ⌘K search across pages, projects, skills, books, links, lab | Searched "college" → College page, College projects, college entries, Rome chapter; "aurora" → egg command |
| Work: `/college/` redirect → `/work/#college` filter | Loaded URL, 2 college entries shown, pill pressed |
| Work: case study via `#p/<id>`, constellation view | Opened dialog via hash; constellation renders with shared-tech lines |
| Library: shelves, real Open Library covers, filters | 21 cover images loaded |
| Compass: filter "code" → 5 matching rows | JS check |
| Lab: `#skyline` deep link opens stage and renders | JS check + screenshot |
| Vault: wrong passphrase rejected, right one decrypts into 6 cards | Tested with a throwaway test-only fixture (deleted afterwards) + a Node round-trip on the real sealed file |
| Mobile 375px: no horizontal overflow, hero + postcard layout | Emulated 375×812 |
| `npm run check` | Passes: no private text in public files, ~96 local links/imports resolve, content valid |

## Built but not exercised end-to-end
- **Web3Forms delivery.** The code path exists but is untested: it needs your key, and messages can't be sent without your approval.
- **GitHub Pages workflow.** Written, never run (no repo pushed yet).
- **Easter eggs.** Wired up and logic reviewed. Clicking each one in a visible browser hasn't been done (the test pane was hidden, which also throttles animations).
- **Reduced-motion mode.** CSS and JS paths exist, but were not toggled in an emulator.

## Placeholders waiting on the owner
Search the repo for `TODO`. The main ones: `site.bio`, `site.email`, socials, hiring "looking for", résumé PDF, 4 placeholder projects, 3 placeholder experiences, the AI/ML skill entries, coursework. Book statuses all start as "Want to read", and the notes are neutral descriptions to rewrite in your own voice.

## Known issues
- The hidden-tab rAF throttle in the agent's test browser makes mid-transition screenshots look stale. This is not a site bug, but keep it in mind when verifying with tools.
- Skills show small superscript counts (projects that use the skill), and with placeholder projects these counts are sample data.
- Very wide or ultra-short viewports crop the top of the scene art (by design, `slice`).
- `aurora` typed while focus is on a button still counts. That's harmless.

## Next recommended task
**Fill in real content**: bio, 3–5 real projects (start with college ones for `/college/`), email, socials and résumé. Then publish the repo and enable GitHub Pages.
After that, see ROADMAP.md (top item: per-project images/screenshots).
