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
  {
    id: 'college-project-1',
    placeholder: true,
    title: 'Your first college project',
    subtitle: 'Course name · semester',
    category: 'college',
    course: 'TODO course name',
    status: 'shipped',
    year: 2026,
    period: 'Monsoon 2026',
    featured: true,
    role: 'TODO — what you did',
    team: 'TODO — solo / team of 3',
    tech: ['Python'],
    summary: 'Replace this with one sentence on what you built.',
    problem: 'What problem did the project tackle?',
    solution: 'What did you build, and how does it work?',
    contribution: 'Which parts were yours?',
    highlights: ['A specific, verifiable detail', 'Another one'],
    links: { code: '', report: '' },
  },
  {
    id: 'college-project-2',
    placeholder: true,
    title: 'Another course project',
    subtitle: 'Course name · semester',
    category: 'college',
    course: 'TODO course name',
    status: 'shipped',
    year: 2025,
    period: 'Spring 2025',
    tech: ['C++'],
    summary: 'Replace me.',
    links: { code: '' },
  },
  {
    id: 'research-1',
    placeholder: true,
    title: 'A research direction',
    subtitle: 'Lab / advisor',
    category: 'research',
    status: 'in-progress',
    year: 2026,
    period: '2026',
    tech: ['Python'],
    summary: 'Replace me — AI agents? Computational social science? Something that combines CS with the human sciences.',
    links: { paper: '' },
  },
  {
    id: 'hackathon-1',
    placeholder: true,
    title: 'A hackathon build',
    subtitle: 'Event name · year',
    category: 'hackathon',
    status: 'shipped',
    year: 2025,
    period: '2025',
    featured: true,
    tech: ['JavaScript'],
    summary: 'Replace me.',
    links: { code: '', video: '' },
  },
];

// Courses for the Rome "coursework" strip. TODO: fill in your real courses.
export const coursework = [
  { code: 'TODO', name: 'Data & Applications' },
  { code: 'TODO', name: 'Algorithm Analysis & Design' },
  { code: 'TODO', name: 'Add your courses' },
];
