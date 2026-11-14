// ─────────────────────────────────────────────────────────────────────────────
//  EVERYTHING YOU'VE BUILT → the Logbook (/work/) and the Rome + New York scenes.
//  Full schema: docs/CONTENT_SCHEMA.md
//
//  Direct links that always work:
//    /work/#college            college projects only
//    /work/#p/<id>             one project's case study
//    /work/?q=python           search
//
//  `shot` is a real screenshot of the project (from its repo or live demo),
//  shown on the front page. Without one, the card is a colour field.
//
//  `placeholder: true` shows a visible "Placeholder" badge on the site so a
//  draft is never mistaken for a real claim. Delete the flag once it's real.
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = {
  college: { label: 'College', blurb: 'Course projects, assignments & coursework at IIIT Hyderabad' },
  research: { label: 'Research', blurb: 'Lab work, papers, experiments' },
  hackathon: { label: 'Hackathons', blurb: 'Built against the clock' },
  personal: { label: 'Personal', blurb: 'Things I built because I wanted them to exist' },
  'open-source': { label: 'Open source', blurb: 'Contributions to other people’s code' },
  work: { label: 'Work', blurb: 'Internships & jobs' },
};

export const STATUS = { shipped: 'Finished', 'in-progress': 'Work in progress', archived: 'Archived', idea: 'Idea' };

export const projects = [
  {
    id: 'this-website',
    title: 'This website',
    subtitle: 'A portfolio that keeps itself current',
    category: 'personal',
    status: 'in-progress',
    year: 2026,
    period: 'Oct 2026 to present',
    featured: true,
    role: 'Design & engineering',
    tech: ['JavaScript', 'CSS', 'Canvas', 'GitHub API', 'Web Crypto'],
    summary: 'Portfolios go stale. This one reads projects, repos and commits live from GitHub, and opens into a desk where every object works. No dependencies, no build step.',
    problem: 'Portfolios all look the same, and most of them go stale a month after launch.',
    solution: 'Plain ES modules and CSS with no build step. Live HTML screens are projected onto a desk photo’s monitor, laptop and LED board with a homography (CSS matrix3d), and projects, repos, commits and READMEs are read live from the GitHub API, so the site updates itself.',
    contribution: 'Everything: design, the projection and lighting overlays, the GitHub data layer and the content system.',
    highlights: [
      'Live screens mapped onto the photo with a 4-point homography',
      'Repos, languages, commits and READMEs pulled live from GitHub, cached and sanitized client-side',
      'A 2D wave simulation on a canvas dot grid as the front page’s background, and paintings re-printed as halftone dots',
    ],
    links: { code: '', demo: '' },
  },
  // ── From GitHub (github.com/saix0x0). Summaries are from each repo's own
  //    description / README. `repo` makes the site pull live stats, languages,
  //    recent commits and the README straight from GitHub.
  {
    id: 'med-assistant',
    repo: 'med-assistant',
    shot: { src: 'assets/img/work/med-assistant.webp', w: 1400, h: 858, alt: 'Med Assistant in patient mode, set to Telugu: a prescription has been read and the four medicines and their schedule are spelled out in Telugu.' },
    title: 'Med Assistant',
    subtitle: 'Reading prescriptions aloud in Telugu, Hindi and English · Sarvam Campus ’26 build-along',
    category: 'hackathon',
    status: 'shipped',
    year: 2026,
    period: 'Oct 2026',
    featured: true,
    tech: ['Python', 'FastAPI', 'JavaScript', 'Sarvam AI'],
    summary: 'Reads a handwritten prescription, speaks the schedule back in Telugu, Hindi or English, and checks the strip in hand is the right medicine. Voice-first, on Sarvam AI.',
    highlights: [
      'Reads a handwritten prescription and speaks the schedule back in the user’s language',
      'Checks whether the medicine strip in hand is actually on that prescription',
    ],
    links: { code: 'https://github.com/saix0x0/med-assistant' },
  },
  {
    id: 'greeniq',
    repo: 'greeniq',
    shot: { src: 'assets/img/work/greeniq.webp', w: 800, h: 500, alt: 'The GreenIQ overview for one home: a Green Home Score of 35, energy and carbon figures, and the recommended next step, loft insulation.' },
    title: 'GreenIQ',
    subtitle: 'Scoring a home’s energy use and the retrofits worth doing · Lloyds Megathon X',
    category: 'hackathon',
    status: 'shipped',
    year: 2026,
    period: 'Oct 2026',
    featured: true,
    tech: ['Python', 'FastAPI', 'Machine learning'],
    summary: 'Scores a home and ranks the retrofits worth doing. A deterministic energy, carbon and value model does the maths; an AI layer explains each number without inventing any.',
    highlights: [
      'Scores a home’s energy efficiency and recommends the retrofits that matter',
      'Estimates energy, carbon and value impact; the AI layer explains every number but never invents one',
    ],
    links: { code: 'https://github.com/saix0x0/greeniq' },
  },
  {
    id: 'chess-learning-bot',
    repo: 'chess-learning-bot',
    shot: { src: 'assets/img/work/chess-learning-bot.webp', w: 1400, h: 875, alt: 'Pawn Coach: a chessboard beside the coaching panel, which names the opening and suggests the next idea.' },
    title: 'Pawn Coach',
    subtitle: 'A chess coach that adapts to how you play',
    category: 'personal',
    status: 'in-progress',
    year: 2026,
    period: 'Sep 2026',
    featured: true,
    tech: ['JavaScript', 'HTML', 'PWA'],
    summary: 'Engines give the best move, not why you missed it. Pawn Coach learns how you play, steers games to your weak spots and builds puzzles from your mistakes. Runs offline.',
    highlights: [
      'Stops you before a blunder and asks a question instead of giving the move',
      'Adapts its strength and steers toward your own weak spots',
    ],
    links: { code: 'https://github.com/saix0x0/chess-learning-bot', demo: 'https://saix0x0.github.io/chess-learning-bot/' },
  },
  {
    id: 'mapp',
    repo: 'mapp',
    shot: { src: 'assets/img/work/mapp.webp', w: 1400, h: 719, alt: 'Hyderabad Explorer: neon quest markers spread across a dark map of Hyderabad, from Kondapur to the Old City.' },
    title: 'Hyderabad Explorer',
    subtitle: 'A city guide for IIIT Hyderabad freshers, played as quests',
    category: 'personal',
    status: 'shipped',
    year: 2026,
    period: 'Jul 2026',
    tech: ['TypeScript', 'React', 'Vite', 'MapLibre GL'],
    summary: 'Turns Hyderabad into quests on a map for freshers new to the city: scan the QR code, pick one, head out. Places live in one JSON file, so adding one needs no code.',
    highlights: ['Open source on a $0 stack: Vite, React, TypeScript, MapLibre GL, CARTO tiles, GitHub Pages', 'Places live in one JSON file, so adding one needs no code changes'],
    links: { code: 'https://github.com/saix0x0/mapp', demo: 'https://saix0x0.github.io/mapp/' },
  },
  {
    id: 'iss-tic-tac-toe',
    repo: 'ISS-project-tic-tac-toe',
    title: 'Tic-Tac-Toe',
    subtitle: 'Players, Elo ratings and storage across two databases · ISS course project',
    category: 'college',
    course: 'ISS',
    status: 'shipped',
    year: 2026,
    period: 'May 2026',
    tech: ['Python', 'MySQL', 'MongoDB'],
    summary: 'A course project on data design: players, Elo ratings and online status in MySQL, images in MongoDB. The README has the setup and schemas.',
    links: { code: 'https://github.com/saix0x0/ISS-project-tic-tac-toe' },
  },
];

// Courses for the Rome "coursework" strip. TODO: fill in your real courses.
export const coursework = [
  { code: 'TODO', name: 'Data & Applications' },
  { code: 'TODO', name: 'Algorithm Analysis & Design' },
  { code: 'TODO', name: 'Add your courses' },
];
