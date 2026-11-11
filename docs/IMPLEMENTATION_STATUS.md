# Implementation status

_Last updated: 2026-11-11, front page: a new swimming painting, a rewritten intro, the name fits, clear ways into the desk._

## Front page: Seurat, a rewritten intro, the name fits, ways into the desk (2026-11-11)
- Owner: change the swimming & sport painting; phrase the About intro well instead of pasting their list; "Siddhanth" ran off the page; there was no obvious button or next page to the desk.
- **Painting:** Eakins' *Swimming* is replaced by Seurat's *Bathers at Asnières* (1884, National Gallery, public domain, Wikimedia Commons), `assets/art/bathers.webp`. Seurat is the painter of dots, which suits a page that prints its paintings in dots. It also hangs in the desk's right-hand frame (id `bathers`). Sorolla's beach paintings were considered and passed over (nude children in the foreground).
- **Intro** (`site.about`): rewritten from the owner's points only (CS + CHS by Research at IIIT-H, building things, philosophy, art, swimming, sport). The owner may paste their own version there.
- **Name:** "Sai Siddhanth" is 7.35em wide in Doto and the gutters leave 90vw, so 12.4vw (and the 236px cap on wide screens) overflowed. Now `clamp(50px, 11.6vw, 196px)`. On phones each letter was its own inline-block, so the line could break mid-word ("Siddh / anth"); letters are now grouped in `.wd` spans that don't break.
- **Ways into the desk:** an orange "Enter the desk →" button in the top bar ("Desk →" on phones), a second hero button "Step into the desk →" beside "See the work", and a "Next page: The desk →" block before the footer. The Contact link stays.
- Tested in the browser pane at 1920, 1440, 700 and 375 wide: the name stays inside the margins, phones read Sai / Siddhanth / Challa, no horizontal overflow at 375, the new painting loads on both pages, `npm run check` passes.

## Desk: speaker + Spotify, a working keyboard, the owner's portrait, a critter (2026-11-10)
- Owner: swap the headphones for a Marshall speaker, put a keyboard on the desk (AULA F75 black) and make it a real interface, keep the laptop terminal, add a free Spotify player they can play anything on, add their face in a framed picture like their red halftone reference, and have the orange Claude-style creature hop around.
- **Speaker** (`speaker()` in `room.js`): a black amp-style speaker with gold piping, brass control strip, knobs, an LED and a "Marshall" script wordmark. Its cones swell with `--beat`, which comes from a Web Audio analyser on the site's own sound (`level()` in `world/sound.js`), and thump while Spotify plays. Clicking it opens `#music`.
- **Spotify** (`musicCard` in `bits.js`, picks in `content/music.js`): Spotify's free embed iframe. There is no account, key or login. Visitors logged in to Spotify hear full tracks; everyone else gets 30-second previews. Four starter playlists (Spotify's own) plus "paste any Spotify link". The player is one persistent iframe: it follows the card while it's open and docks bottom right (top on phones) when the card closes, so music keeps playing while you look around. × stops it. The last pick is remembered in localStorage. `#music/loops` keeps the old record loops. This adds `open.spotify.com` as a network call (owner asked for it).
- **Keyboard** (`assets/js/desk/keys.js`): one 75%-with-knob layout shared by the room's keyboard (an SVG in perspective, RGB underglow) and the `#type` interface, so any key you press lights up on both. `#type` has three modes: **Typing test** (as before), **Play** (the home row and the row above are a piano; the room light pulses), **Shortcuts** (A About, P Projects, G GitHub, T Terminal, M Music, C Contact, B Books, R Research, W Timeline, N Lately, L next light, O lights, 1–6 colours, Esc back). The knob turns the light (click or scroll). The mode is remembered.
- **Portrait:** `assets/img/portrait.jpg` is the owner's face, cropped from a photo they supplied. It's printed as dark halftone dots on an orange sheet ("No. 02", "Curious.", their name) in a black frame. That frame replaces the Vermeer in the room (it opens About) and also sits beside the IIIT card in the front page's About. `halftone.js` gained `invert`.
- **Critter** (`assets/js/desk/critter.js`): an 11×9 pixel orange creature that hops between 14 perches (shelves, monitor, frames, speaker, laptop, desk) every few seconds; click it to make it jump. With reduced motion it stays put. If the animation clock stalls (a background tab), a timer lands it anyway.
- Fixed: the desk surface used the class `top`, which collided with the fixed header `.top` and covered every desk object. It's now `d-top` / `d-edge`.
- Tested in the browser pane at 1440×900 and 375×812: the Spotify embed loads, picks and pasted links switch it, a bad link shows a message, it docks on close and × stops it; a key press lights both keyboards; Play sets the beat; Shortcuts L and P work; the critter hops on click; the front-page portrait renders; no horizontal overflow at 375; `npm run check` passes. Not tested: actual Spotify playback with sound (needs a person to press play), Safari, real phones.
- Next: owner swaps `music.picks` for their own playlists (then sets `starters: false`); a sharper portrait photo can replace `assets/img/portrait.jpg` (same crop: face centred, roughly square).

## The desk is a room drawn in code (2026-11-10)
- Owner: didn't like the angled photo or any stock photo ("very basic"); wanted a frontal room like their reference (a dark wall with amber LED strips, floating shelves, framed posters, an ultrawide monitor, the back of a chair), but with changing lights, the frames in different places, the books on the right, something other than chess, and a less "vibecoded" UI.
- **The room** (`assets/js/desk/room.js`, a 2400×1500 stage): dark plaster wall; LED strips under two floating shelves and behind the desk; on the left a record player with sleeves, a trailing plant, the Vermeer in a matted frame, a pinned note (Lately) and a light switch; above the monitor the Friedrich and the Kandinsky, hung off-centre; the name in Doto with the tagline in Fragment Mono; on the right a shelf of book spines from `content/books.js`, a "Built so far" poster listing real projects, the Eakins and a research card; on the desk a plant, a laptop, a letter tray, an ultrawide monitor with a light bar, a keyboard with RGB underglow, a mouse, a mug, the GitHub LED board and headphones on a stand; the back of a mesh chair in the foreground. No photo: `assets/img/setup.jpg` is removed.
- **Light:** every glow, strip, mat and paper tint is `var(--lamp)`, registered with `@property` so it fades between colours. The light bar or the new dial (bottom right) cycles Amber, Warm white, Violet hour, Aurora, Rose, Deep blue; the wall switch or "On / off" under the dial turns the room dark (screens stay lit).
- **Objects** (`OBJ` in `pages/desk.js`, boxes match room.js): monitor → browser, laptop → terminal, LED board → GitHub, portrait → About, poster → timeline, note → progress, card → research, bookshelf → books, record player → music (its record spins while a loop plays), keyboard → typing test, letters → contact, headphones → sound on/off, mug → refill (steam), mouse → tour, switch → lights, each painting → a credit toast. Hover lifts the object and shows a small label; the white dots and marching outlines are gone.
- **Monitor:** a lock screen with the Hyderabad date and time; the action reel still plays behind it until the monitor is opened.
- **Chrome:** "← Front page" top left; clock, Search ⌘K, a sound toggle and an outlined "Say hello →" top right; GitHub / LinkedIn / email icons down the left; numbered sections bottom left (01 About, 02 Projects & work, 03 Timeline, 04 Contact) with "Take the tour" and "Everything in the room" (the full plain list) under them. Fonts match the front page: Doto, Fragment Mono, Newsreader (Inter stays for the apps).
- Phones: the camera shows the middle 1050px of the room (drag to look around); the wall and floor carry on above and below the stage.
- Tested in the browser pane at 1440×900 and 375×812: all hash routes open (browser, terminal, type, contact, music, every wall plaque, browser/github), light bar, dial, switch, paintings, mug, headphones and hover labels work, no horizontal overflow at 375, `npm run check` passes. Not tested in Safari or on real phones; `color-mix` and `@property` need a 2023+ browser.
- Next: owner's portrait or résumé; real research card text (`desk.research`); maybe let the owner choose which books stand on the shelf.


## Front page: black water and dot-matrix type; the game is off the site (2026-11-09)
- Owner: remove the game for now (keep its files); the front page's fonts looked "AI" and the gallery theme wasn't sticking; wanted something more niche, black, with an animated background and unique touches.
- **The game:** `site.game = false` in `content/site.js`. With it off, nothing links to `/hotel/`: the layout nav, the search palette, the desk's pill (now `hidden` in HTML) and its chair hotspot are filtered out, and the terminal's `hotel` says it's closed. `/hotel/` and `assets/js/world/` are untouched. Set `game: true` to bring every door back.
- **Look:** pure black (#050505), one accent (lifeguard orange #ff5f1f). Type: Doto (dot-matrix, variable weight) for display, Newsreader for reading, Fragment Mono for labels. Instrument Serif, Inter, the gold and the Van Gogh hero are gone from `/`.
- **The pool** (`assets/js/front/pool.js`): the whole background is a canvas dot grid running a 2D wave equation. Dots refract with the slope and light up on crests; the pointer stirs it, a click drops a stone, and it rains now and then. Reduced motion draws it still. Pauses when the tab is hidden.
- **The name:** each letter's weight follows the pointer (dots swell near it); on touch screens the letters breathe on their own. Hero shows Hyderabad time and the latest GitHub push, live.
- **About:** the four "Off the clock" paintings are printed as halftone dots on canvas (`assets/js/front/halftone.js`) and turn to colour on hover or focus. Glance numbers in Doto.
- **Projects:** a stack of cards (sticky, each sinks back as the next slides over, on wide screens with motion). Each card has the screenshot under a `user/repo` bar. Case pages keep the FLIP grow and live README.
- **GitHub:** a 100-dot waffle of language share (largest remainder), live stats, and a recent-activity list of the latest pushed repos.
- **Footer** weighs the page with the Performance API (KB, requests, load time).
- Section headings decode out of noise characters as they scroll in.
- Tested in the browser pane at 1440×900 and 375×812: every section renders, case pages open, no horizontal overflow at 375 (the name stacks on three lines on phones), `npm run check` passes, desk still works with no game links. Not tested in Safari or on real phones. Headless Chrome renders `/#section` URLs black (a headless quirk; the pane is fine).
- Next: owner's résumé PDF, real skills in `skills.js`, internship details; consider showing the desk more prominently from `/`.


## Front page: About, Off the clock, Skills, real project screenshots (2026-11-08)
- Owner: the front page felt too small and the project images too generic; wanted a part about their college, reading philosophy, building things, art, swimming and sport, plus more for people hiring.
- New `#about` section: the owner's own words (`site.about`), an IIIT Hyderabad card (`site.school`), four numbers at a glance computed from content (projects shipped, hackathon builds, internships) plus live public repos, and "Off the clock": four interests (`site.life`), each hung beside a public-domain painting with a museum label (Friedrich, Kandinsky, Vermeer, Eakins).
- New `#skills` "toolkit": every `tech` across projects, linked to the projects that use it; real `skillGroups` items not already shown are listed below. TODO items are skipped.
- Project cards and case pages now show real screenshots (`shot` in `content/projects.js`, files in `assets/img/work/`) on their colour fields. Cards are wider.
- Nav: About · Experience · Projects · Skills · GitHub · Contact. Contact gets a résumé button once `site.resume` is set (empty now).
- "This website" project text no longer says the desk is the owner's own desk.
- Found: the Hyderabad Explorer live demo (saix0x0.github.io/mapp/) is blank because `vite.config` still has `base: '/gedi/'` after the repo rename. Not fixed here (other repo).
- Tested in the browser pane at 1440×900 and 375×812: sections render, case pages show screenshots, no horizontal overflow, no failed requests.

## The desk is now a front-facing desk setup (2026-11-08)
- Owner wanted a front-facing desk like the reference site. Studied the reference: it is an empty wall plate with every object layered on as a cut-out. Shortlisted 10 straight-on Unsplash photos; the owner picked "a desk with a laptop and a monitor on it" by João Inácio (`assets/img/setup.jpg`, 2400×1800, Unsplash License, credit in `assets/img/CREDITS.md`). `study.jpg` removed.
- Stage is 2400×1800. 17 hotspots (`OBJ` in `pages/desk.js`): monitor (live screen + reel → #browser), laptop (live mini terminal → #terminal), LED board (→ #browser/github), framed print (#wall/about), index card (#wall/timeline), three sticky notes (#wall/progress, #wall/research, #wall/books), light bar (lamp colour), keyboard (#type), speaker (#music), microphone (#contact), mug (refill), webcam (toast), mouse (tour), window (lights on/off), chair (the hotel).
- The photo's YouTube LED board now shows a live GitHub repo count and Hyderabad time (`ledBoard()` in `desk/wall.js`). An index card ("Built so far") and sticky notes are drawn onto the wall and monitor bezel.
- Keyboard glow quad re-measured for the 65% board. Lamp tints re-centred on the light bar and LED strip.
- Tested in the browser pane at 1440×900 and 375×812: all routes open, keys light on the photo's keyboard, no horizontal overflow. Not tested in Safari or real phones.
- Still to come: F1 car, LEGO, PS5 minigames, posters and the portrait as overlays or apps on the monitor.

## The desk was a rendered study (2026-11-06, superseded)
- Owner rejected the code-built gallery wall ("not aesthetic enough") and asked for a good desk-setup image like the reference site, not their own desk.
- `/desk/` now uses `assets/img/study.jpg`: a 3D render of a dark, warm study by Taitopia Render, free under the Unsplash License (credit in `assets/img/CREDITS.md`). Stage is 2400×1350; no more wall extension or gallery.
- 16 hotspots on the render (`OBJ` in `pages/desk.js`): tablet (live reel, opens the browser), keyboard (typing test), radio (music), lamp (colour), photograph (#wall/about), calendar (#wall/timeline), pinned note (#wall/progress), paper (#wall/research), bookshelf (#wall/books, philosophy + human-sciences shelf, shown as "Want to read"), folders (#browser/overview), card (#contact), laptop stand (#terminal), bust (tour), coffee and poster (in place), chair (the hotel).
- `assets/js/desk/wall.js` writes onto the photo: the poster's title is now the first film in `desk.films` (Inception), and handwritten notes (Caveat) on the pinned papers and wall card. It also holds the plaques.
- The object list is collapsed behind "Everything in the room (16)". Phones open centred on the tablet.
- Tested in the browser pane at 1440×900 and 375×812: all routes open, no horizontal overflow, no failed requests. Not tested in Safari or real phones.
- Not in this render: an F1 car, a LEGO set, a console, the owner's portrait. Those need either another image or overlays.

## (superseded) The studio: a gallery wall around the desk (2026-11-05)
- Owner wants the desk back as a rich room (inspired by, not copied from, an interactive-room portfolio) and chose "build it in code" over generated images.
- `/desk/` is now a 2400×1600 studio. The real desk photo sits inside it at (400, 400) in a `.plate` (all old photo-px coordinates unchanged; `P()` in `pages/desk.js` converts boxes), with its edges masked into a code-built wall. The lamp's cone continues up the wall (`.beam`, follows `--lamp`, off with the lights).
- New `assets/js/desk/wall.js`: frames with brass picture lights. Projects timeline (from `content/projects.js`), Research (placeholder until `desk.research` is filled), About, a portrait (painted silhouette until `desk.portrait.src` points at a photo; the photo then gets an SVG oil-paint filter), Progress (from `site.now` + experience). Each opens `#wall/<id>`: the camera frames it and a plaque slides in (bottom sheet on phones). Frames are also in the plain object list.
- Posters act in place: two original minimal film posters (`desk.films`, owner to confirm the films), and an F1 start-lights reaction test (best time in localStorage).
- Tested in the browser pane at 1440×900 and 375×812 (no overflow, plaque geometry checked by script). Not tested in Safari or real phones.
- Next phases: bookshelf (philosophy + psychology, owner's real reads), LEGO set, console with minigames, F1 model car; the Mac-style desktop on the monitor with résumé; keyboard RGB recolouring the room; easter eggs; a link from `/`.

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
