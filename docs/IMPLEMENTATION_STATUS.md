# Implementation status

_Last updated: 2026-10-31, 3D rooms (World Mode)._

## World Mode — 3D rooms (branch `world/3d-rooms`)
| Feature | How it was verified |
|---|---|
| Oblique 3D projection for every floor (floor plane, left wall, slab edges, roof deck) | Whole-building overview screenshot, no console errors |
| Lobby furniture as depth-sorted 3D props; entrance in the left wall | Screenshots of the lounge, desk/elevator and bar areas |
| Walking in depth (WASD/arrows), sliding collision against furniture | Scripted: walking into the sofa stops at its front edge |
| Glass elevator boarded from the front; car hidden behind slabs mid-ride | Scripted G → 2 → G rides; mid-ride screenshot |
| 3D partition walls with sliding glass doors | Scripted walk through the Gallery doorway; screenshot |
| Auto-walk to every object on every floor (46 objects, incl. both locked floors) | Scripted travel loop, 0 failures |
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
