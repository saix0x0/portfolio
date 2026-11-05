# Implementation status

_Last updated: 2026-11-03, front page + desk at /desk/._

## The night gallery front page (2026-11-05)
- Owner asked for a more aesthetic front page with unusual transitions, no section labels or live status line, and no desk.
- `/` now: a curtain intro (once per visit); a pinned scroll that zooms the framed Van Gogh until you are inside it, then reads "Exploring broadly, building obsessively." word by word; Experience; a sideways-scrolling corridor of projects drawn as Rothko-style colour fields; GitHub (Kandinsky circles); contact (Monet). The ambient light changes colour per section.
- Each project opens in place as a full-screen page (`#p/<id>`) that grows out of its card, with highlights, details and the live README. Back/Esc/× close it; "Next project" chains through them.
- The desk is no longer linked from `/` (nav, buttons, Enter key, prefetch all removed). `/desk/` itself is untouched and still works at its URL. The ⌘K palette on `/` now jumps to sections and opens projects in place.
- Pinned scenes only run at ≥900px with motion allowed (`html.pin`); phones and reduced motion get a plain column.
- Tested in the browser pane at 1440×900 and 375×812: zoom, quote, corridor, open/next/close/Back, GitHub, contact, no horizontal overflow. Not tested on real phones or Safari.

## Front page polish (2026-11-03)
- Header always visible: SC mark, "Sai Siddhanth Challa, IIITH", section links (Experience, Projects, GitHub, The desk, Contact; a second row on narrow screens) and a gold scroll-progress line.
- Removed the Room I to IV labels and the exhibition guide; section labels are now Catalogue, Live from GitHub, Featured piece, Correspondence. "Selected work" is "Selected projects".
- Projects: GEDI renamed Hyderabad Explorer, Pawn Coach renamed Self-Learning Chess Bot (work in progress, learns your behaviour); the rest show as Finished.
- Small touches: a soft gold glow follows the pointer, a time-of-day greeting (or "Welcome back"), a friendlier copy-email toast, a low-effort note under the desk button, and a "Thank you for walking through" signature at the end.
- Fixed a 15px horizontal overflow at 375px (the hero spotlight was wider than the painting).

## The exhibition front page, monitor reel and typing test (2026-11-03)
- `/` rebuilt as a dark royal gallery (`index.html`, `landing.css`, `landing.js`): four rooms, each paired with a public-domain painting in a gilt frame with a museum label (`assets/art/*.webp`, ~730 KB total, lazy below the fold). Hero: Van Gogh lit by a cursor "torch". Room I catalogue of projects, Room II live GitHub with a Kandinsky-style circle chart of languages, Room III the desk photo hung as the final piece (reel + terminal over its blurred screens), Room IV contact.
- Into the desk: the framed photo zooms to fill the window; the buttons open the desk through an iris from the click point.
- Fonts: Instrument Serif (display, accents) + Helvetica Neue (UI/body, Inter as fallback) on the front page, desk and search palette. Royal navy/gold tokens on the desk chrome.
- Desk monitor plays `assets/video/reel.mp4` (28 s, 1.5 MB, CC clips from Wikimedia Commons, credits in `assets/video/CREDITS.md` and on screen) until the monitor is opened; skipped with reduced motion or Save-Data.
- Keyboard is now a typing test (`#type`, `typeSheet` in `desk/bits.js`): 15/30/60 s, WPM, accuracy, personal best, Clicky/Thock/Silent switch sounds, keyboard RGB modes. Contact stays at `#contact` (header button).
- Removed the book and light switch hotspots and the Projects chip. Em dashes removed from visible text.
- Tested: desktop 800×600 and 375px (no overflow), typing test end to end, reel stops on opening the monitor, iris transition. Not tested: real phones, Safari.

## Front page and a lighter, sharper desk (2026-11-03)
- **`/` is a new front page** (`index.html`, `assets/css/landing.css`, `assets/js/pages/landing.js`). It shows the name, the tagline, a live line (Hyderabad time and the last GitHub push), **Enter the desk** (the primary action, also the Enter key) and **Enter game** (→ `/hotel/`). The framed desk photo has CSS-only stand-ins for the blurred screens, tilts with the pointer, and shows hover pins. Below the hero: Selected work (featured projects that have a repo), On GitHub (live stats and a language bar) and Let’s talk (copy-email button and a link to the message form). It loads only base/sun/github/palette and content; about 63 KB uncompressed plus the 128 KB photo.
- **The desk moved to `/desk/`** (`desk/index.html`). "Enter the desk" zooms the framed photo to fill the window, then navigates; it sets `sessionStorage desk:boot` so the desk skips its own intro. The redirect stubs now point at the desk: `/projects/` and `/college/` → `#browser/projects`, `/hire/` → `#contact`. The 404 page is reworded and restyled.
- **Command palette** (`assets/js/core/palette.js`; ⌘K / Ctrl K, or the Search chip). It covers pages, projects, live repos, copy email, LinkedIn, GitHub, the terminal and Enter game. On the desk it also covers lamp colours, lights, music, the tour and the front page. Its CSS is injected on first open.
- **Guided tour on the desk** ("Take the 20-second tour", or from the palette). The camera visits the monitor, laptop, keyboard, AirPods and lamp, with captions; it auto-advances, → or Space moves on, and Esc ends it.
- "Enter the hotel" is renamed **Enter game**. The desk has an SC home mark that returns to `/`. Both pages share one Google Fonts URL (cached between them), and the dead pit-wall, academy and hotel-window CSS is removed.
- Verified: front page at 800×600 and 375×812 (no overflow); palette search → Enter opened `desk/#browser/p:greeniq`; zoom into the desk; tour steps 1–3 with captions. Not verified: the tour on a phone, and the real-time smoothness of the zoom in a visible browser.


## Recruiter pass (2026-11-02)
The owner asked for a front page that impresses someone hiring: only relevant content, professional names, easy access to email, LinkedIn and GitHub.
- Browser tabs are now **Overview** (was "Start here"; `#browser/start` still works), **Projects**, **GitHub** and **About**. Removed from the desk: the Academy, Pit wall and Hotel tabs, the Library/Lab/Compass tiles and their search entries, and the logbook links. Those pages still exist at their URLs.
- Desk objects: the mouse ("uses") and the bottle are gone. Labels are plain: Monitor (Projects & GitHub), Laptop (Terminal), Keyboard (Contact), AirPods (Music), Book (Currently reading), Lamp, Light switch.
- Header: Projects, GitHub, LinkedIn and a solid Contact chip. On phones only LinkedIn, Contact and the hotel pill show.
- Contact sheet: "Reach out to me", then a message box and Email, GitHub and LinkedIn links. The form sends through **formsubmit.co** (`site.contact.provider = 'formsubmit'`, no key). The **first** message triggers an "Activate form" email to siddhanthchalla@gmail.com; until that link is clicked, nothing is delivered. A honeypot field catches bots; on failure the form shows the email address.
- `site.email` and the LinkedIn URL (taken from the owner's own GitHub social links) are set. The "This website" project is rewritten for the desk.
- Unfinished content (`TODO…`) is never rendered in the desk browser or the terminal; empty sections hide.
- Verified: desktop and 375×812 (no overflow); form validation messages; no TODO text on About. **Not verified:** a real form submission (deliberately not sent, since the owner must activate it).


## Live GitHub + real projects (2026-11-01)
`content/projects.js` now holds the owner's five public repos (med-assistant, greeniq, chess-learning-bot "Pawn Coach", mapp "GEDI", ISS tic-tac-toe) plus "This website"; each has a `repo` field. Summaries and highlights come from each repo's own description and README. `site.github = 'saix0x0'`; the GitHub social link is set. Data layer `assets/js/core/github.js` (keyless GitHub REST, localStorage cache 1 h for lists and 6 h for languages/READMEs, serves a stale copy when rate-limited, allow-list README sanitizer). The pages are in `assets/js/desk/github.js`.
| Feature | How it was verified |
|---|---|
| `#browser/start`, "Start here": the 60-second version (tagline, contact and GitHub buttons, best work with open-source first, language mix, recent activity, site map) | Screenshot at 800×600 |
| `#browser/github`: profile, stats, language bar by bytes across repos, filterable repo list (text + language), recent activity (runs of pushes collapsed) | Screenshots at desktop and 375×812, no overflow |
| `#browser/r:<repo>`: description, topics, code/demo/project-story buttons, stats, languages, latest commits, the README rendered in place with images and links rewritten to the repo | med-assistant: README sanitized (0 class/id/style/script left), relative screenshots load from raw.githubusercontent |
| Project pages with a `repo` show a "Live from GitHub" panel; the README opens on demand | greeniq |
| Terminal: `repos`, `repo <name>` (Tab completes repo names), `git log [repo]`, `git remote`, `open github`/`open start` | Ran by keyboard |
| Search includes repos; the new tab has Start here and GitHub tiles; the laptop in the photo types the latest real commit | Scripted |
| Rate limit (60 req/h per visitor IP): stale cache is served; without a cache every panel says the limit is used up and links to GitHub, and the GitHub tab lists the repos from `content/projects.js` | Hit the real limit during testing; commits/README panels showed the message |
| Not yet verified | Commits panel with fresh data (the limit was used up during testing); the fallback repo list path itself |


## Front page `/`: the desk (new, replaces the scrolling front page)
The owner's real desk photo (`assets/img/desk.jpg`, both screens blurred in the file so nothing private ships) with live overlays and a hotspot per object. Code: `index.html`, `assets/js/pages/desk.js`, `assets/js/desk/{browser,terminal,bits}.js`, `assets/css/desk.css`; words in `content/desk.js`.
| Feature | How it was verified |
|---|---|
| Stage scales to cover the window; name on the wall above the monitor; pulsing dots until first interaction | Screenshots at 1440×900 and 375×812 |
| Live screens projected onto the photo (matrix3d): monitor new-tab page with the Colosseum wallpaper, laptop terminal typing | Screenshots |
| Lamp: click cycles sunset / violet / aurora / rose / blue (recolours the wall glow); switchboard turns the lamp off; saved per browser | Screenshots of aurora and lights-off |
| Keyboard + mouse RGB wave (wave / match lamp / stock); keys light up on the photo as you type | Scripted keydowns; screenshot |
| Monitor → camera flies in → browser app: new tab with search, Projects (+ project pages), Academy, About, live Pit wall, live Hotel window | Every tab opened; search for "coll"; pit wall showed the live US GP result |
| Laptop → terminal: help, whoami, ls, cat, open, projects, skills, f1, lamp, rgb, neofetch, hidden jokes, tab completion, history | Ran 7 commands by script; `lamp violet` recoloured the room |
| Keyboard → contact sheet; mouse → uses card; AirPods → synth player (AirPods glow while playing); book → reading card; bottle → sips counter | Each opened and screenshotted |
| URLs: `#browser[/tab]`, `#browser/p:<id>`, `#terminal`, `#contact`, `#uses`, `#music`, `#reading`; Esc returns to the desk; plain list of objects bottom-left | Scripted |
| Phone 375 px: drag to look around (drag never triggers a click), chip list, bottom sheets, no horizontal overflow | Emulated 375×812 |
| Not yet verified | Real-time feel of the camera flights in a visible browser; reduced motion in an emulator (CSS + JS paths exist) |

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
**Activate the contact form** (send one test message, click the FormSubmit email), then fill in the bio and add a résumé PDF (`site.hiring.resume`). Projects come from GitHub. Optional: project screenshots via each project's `image`. Then publish the repo and enable GitHub Pages.
After that, see ROADMAP.md (top item: per-project images/screenshots).
