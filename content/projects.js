// ─────────────────────────────────────────────────────────────────────────────
//  EVERYTHING YOU'VE BUILT → the Logbook (/work/) and the Rome + New York scenes.
//  Full schema: docs/CONTENT_SCHEMA.md
//
//  Direct links that always work:
//    /work/#college            college projects only
//    /work/#p/<id>             one project's case study
//    /work/?q=python           search
//    /college/                 shortcut → /work/#college
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

export const STATUS = { shipped: 'Shipped', 'in-progress': 'In progress', archived: 'Archived', idea: 'Idea' };

export const projects = [
  {
    id: 'this-website',
    title: 'This website',
    subtitle: 'A portfolio you travel through',
    category: 'personal',
    status: 'in-progress',
    year: 2026,
    period: 'Oct 2026 — ongoing',
    featured: true,
    role: 'Design & engineering',
    tech: ['JavaScript', 'Canvas', 'SVG', 'CSS', 'Web Crypto'],
    summary: 'A zero-dependency portfolio with a procedural sky engine, hand-drawn landmark silhouettes, encrypted private rooms and a handful of secrets.',
    problem: 'Portfolios all look the same, and most of them stop being updated after a month.',
    solution: 'A static site with no build step and no paid services, so it can stay online for free indefinitely — and a world worth coming back to.',
    contribution: 'Everything: art direction, the sky renderer, landmark generators, content system and the encryption tooling.',
    highlights: [
      'One canvas renders every sky and blends between cities as you scroll',
      'Live local time and today’s real sunset time for each city',
      'Private sections encrypted with AES-256-GCM before they ever reach GitHub',
    ],
    links: { code: '', demo: '' },
  },
  // ── From GitHub (github.com/saix0x0). Summaries are from each repo's own
  //    description / README. `repo` makes the site pull live stats, languages,
  //    recent commits and the README straight from GitHub.
  {
    id: 'med-assistant',
    repo: 'med-assistant',
    title: 'Med Assistant',
    subtitle: 'Sarvam Campus ’26 × IIIT Hyderabad build-along',
    category: 'hackathon',
    status: 'shipped',
    year: 2026,
    period: 'Oct 2026',
    featured: true,
    tech: ['Python', 'FastAPI', 'JavaScript', 'Sarvam AI'],
    summary: 'Voice-first prescription reader that checks a medicine strip against the prescription, in Telugu, Hindi and English. Built on Sarvam AI.',
    highlights: [
      'Reads a handwritten prescription and speaks the schedule back in the user’s language',
      'Checks whether the medicine strip in hand is actually on that prescription',
    ],
    links: { code: 'https://github.com/saix0x0/med-assistant' },
  },
  {
    id: 'greeniq',
    repo: 'greeniq',
    title: 'GreenIQ',
    subtitle: 'Lloyds Megathon X · Problem Statement 2',
    category: 'hackathon',
    status: 'shipped',
    year: 2026,
    period: 'Oct 2026',
    featured: true,
    tech: ['Python', 'FastAPI', 'Machine learning'],
    summary: 'Green Home Score & retrofit recommendation engine — a deterministic energy/carbon/value model with a grounded-AI explanation layer.',
    highlights: [
      'Scores a home’s energy efficiency and recommends the retrofits that matter',
      'Estimates energy, carbon and value impact; the AI layer explains every number but never invents one',
    ],
    links: { code: 'https://github.com/saix0x0/greeniq' },
  },
  {
    id: 'chess-learning-bot',
    repo: 'chess-learning-bot',
    title: 'Pawn Coach',
    subtitle: 'A chess learning bot',
    category: 'personal',
    status: 'shipped',
    year: 2026,
    period: 'Sep 2026',
    featured: true,
    tech: ['JavaScript', 'HTML', 'PWA'],
    summary: 'A pocket chess coach that runs 100% offline — play a bot, get live coaching, puzzles from your own mistakes, an opening book, and a behaviour report. Single HTML file, no API calls.',
    highlights: [
      'Stops you before a blunder and asks a question instead of giving the move',
      'Adapts its strength and steers toward your own weak spots',
    ],
    links: { code: 'https://github.com/saix0x0/chess-learning-bot', demo: 'https://saix0x0.github.io/chess-learning-bot/' },
  },
  {
    id: 'mapp',
    repo: 'mapp',
    title: 'GEDI · Hyderabad Explorer',
    subtitle: 'Explore Hyderabad like a video game',
    category: 'personal',
    status: 'shipped',
    year: 2026,
    period: 'Jul 2026',
    tech: ['TypeScript', 'React', 'Vite', 'MapLibre GL'],
    summary: 'Explore Hyderabad like a video game. Built for IIITH freshers — scan the QR, pick a quest, go touch grass.',
    highlights: ['Open source on a $0 stack: Vite, React, TypeScript, MapLibre GL, CARTO tiles, GitHub Pages', 'Places live in one JSON file, so adding one needs no code changes'],
    links: { code: 'https://github.com/saix0x0/mapp', demo: 'https://saix0x0.github.io/mapp/' },
  },
  {
    id: 'iss-tic-tac-toe',
    repo: 'ISS-project-tic-tac-toe',
    title: 'Tic-Tac-Toe',
    subtitle: 'ISS course project',
    category: 'college',
    course: 'ISS',
    status: 'shipped',
    year: 2026,
    period: 'May 2026',
    tech: ['Python', 'MySQL', 'MongoDB'],
    summary: 'A course project with players, Elo ratings and online status in MySQL, and images in MongoDB. The README has the setup and schemas.',
    links: { code: 'https://github.com/saix0x0/ISS-project-tic-tac-toe' },
  },
];

// Courses for the Rome "coursework" strip. TODO: fill in your real courses.
export const coursework = [
  { code: 'TODO', name: 'Data & Applications' },
  { code: 'TODO', name: 'Algorithm Analysis & Design' },
  { code: 'TODO', name: 'Add your courses' },
];
