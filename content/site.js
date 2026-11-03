// ─────────────────────────────────────────────────────────────────────────────
//  YOUR SITE. Edit this file first — every page reads from it.
//  Anything marked TODO is a placeholder waiting for your real words.
//  Rule of this site: never publish a claim that isn't true.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: 'Siddhanth', // short name for nav + hero
  fullName: 'Sai Siddhanth Challa',
  role: 'Engineer across disciplines',
  college: 'IIIT Hyderabad',
  degree: 'Computer Science and Computing & Human Sciences by Research',

  // One sentence. Shown under your name in Paris.
  tagline: 'Sophomore at IIIT Hyderabad, studying Computer Science and Computing & Human Sciences by Research. Curious about artificial intelligence, algorithms, and understanding why humans do the things they do.',

  // From the LinkedIn About section (shown on the desk's About page)
  epigraph: { text: 'Cogito, ergo sum.', gloss: 'I think, therefore I am.' },

  // Shown in the Paris "About" column. TODO: rewrite in your own voice.
  bio: [
    'Exploring broadly, building obsessively.',
  ],

  interests: [
    'AI & machine learning',
    'Agentic systems',
    'Software engineering',
    'Human sciences',
    'Economics',
    'History',
    'Philosophy',
    'Research',
    'Building products',
  ],

  // The "Now" list — what you're exploring at the moment. Update often.
  now: [
    { label: 'Exploring', text: 'AI agents and agentic systems' },
    { label: 'Studying', text: 'TODO: this semester’s courses' },
    { label: 'Reading', text: 'TODO: see the Library' },
  ],

  // Shown in the front page's Experience section (newest first)
  experience: [
    { role: 'Summer Intern', org: 'IBaseIT', kind: 'Internship', period: 'May 2026 to Jul 2026', note: 'Applied AI/ML with hands-on experience across real-world use cases.' },
  ],

  facts: [
    ['Year', 'Sophomore'],
    ['Studying', 'Computer Science and Computing & Human Sciences by Research'],
    ['University', 'IIIT Hyderabad'],
    ['Based in', 'Hyderabad, Telangana, India'],
  ],

  // Contact. The postcard form on the home page uses this.
  email: 'siddhanthchalla@gmail.com',
  contact: {
    // 'formsubmit' → the desk's message box emails you via formsubmit.co. No key or
    //                account: the very first message sends you an "Activate form" email;
    //                click it once and every message after lands in your inbox.
    // 'mailto'    → opens the visitor's own mail app, pre-filled. Zero setup, always works.
    // 'web3forms' → real delivery to your inbox. Free tier (250 msgs/month at time of writing).
    //               Get an access key at https://web3forms.com with just your email; paste below.
    //               The key is designed to be public (it can only send to *your* inbox).
    provider: 'formsubmit',
    web3formsKey: '',
  },

  // Your GitHub username: the desk's browser, terminal and project pages read
  // your public repos, languages, commits and READMEs live from GitHub.
  github: 'saix0x0',

  socials: [
    // Empty url → hidden. TODO
    { label: 'GitHub', url: 'https://github.com/saix0x0' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/sai-siddhanth-challa-1b63a4377/' },
    { label: 'X', url: '' },
  ],

  hiring: {
    open: true,
    headline: 'Open to internships, research and interesting problems', // TODO: confirm
    lookingFor: ['TODO: e.g. software engineering internships', 'TODO: e.g. AI / agents research', 'TODO: e.g. hackathon teams'],
    note: '',
    resume: '', // e.g. 'assets/resume.pdf'. Put the file there and set the path. Empty hides the button.
  },
};
