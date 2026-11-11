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

  // The front page's first screen, under the name (the degree is in About)
  hero: 'Curious about artificial intelligence, algorithms, and why humans do the things they do.',

  // The front page's About section: the owner's own points (2026-11-08), rephrased
  // 2026-11-11. Paste your own version here any time.
  about: 'I’m a sophomore at IIIT Hyderabad, studying Computer Science alongside Computing & Human Sciences by Research, so my days run between writing code and asking why people do what they do. Building things is what I love most. Away from the screen, it’s philosophy, art, the pool, and a lot of sport.',
  school: { name: 'IIIT Hyderabad', full: 'International Institute of Information Technology, Hyderabad', url: 'https://www.iiit.ac.in/', year: 'Sophomore', place: 'Hyderabad, India' },

  // Off the clock: what the owner does away from the desk, each hung beside a
  // public-domain painting (Wikimedia Commons). Words from the owner, 2026-11-08.
  life: [
    { k: 'Reading', title: 'Philosophy', line: 'I love reading philosophy.', link: ['library/', 'The reading list'],
      art: { src: 'assets/art/wanderer.webp', w: 820, h: 1050, by: 'Caspar David Friedrich', name: 'Wanderer above the Sea of Fog', year: 'c. 1818', where: 'Hamburger Kunsthalle', alt: 'A man in a dark coat stands on a rocky peak, his back to us, looking out over a sea of fog.' } },
    { k: 'Making', title: 'Building things', line: 'I love building things: apps, tools, games, this site.', link: ['#work', 'See what I’ve built'],
      art: { src: 'assets/art/composition.webp', w: 1100, h: 732, by: 'Wassily Kandinsky', name: 'Composition VII', year: '1913', where: 'Tretyakov Gallery, Moscow', alt: 'An explosion of colour and line: hundreds of shapes crowd and overlap across the canvas.' } },
    { k: 'Looking', title: 'Art', line: 'I’m very into art. It’s why the paintings on this page are printed in dots.', link: null,
      art: { src: 'assets/art/pearl.webp', w: 820, h: 972, by: 'Johannes Vermeer', name: 'Girl with a Pearl Earring', year: 'c. 1665', where: 'Mauritshuis, The Hague', alt: 'A girl in a blue and yellow turban looks over her shoulder, a pearl earring catching the light.' } },
    { k: 'Moving', title: 'Swimming & sport', line: 'I swim, and I play a lot of sport.', link: null,
      art: { src: 'assets/art/bathers.webp', w: 820, h: 545, by: 'Georges Seurat', name: 'Bathers at Asnières', year: '1884', where: 'The National Gallery, London', alt: 'Young men rest on a sunny riverbank while boys stand in the water, factory chimneys hazy on the far bank.' } },
  ],

  // The pixel-art hotel at /hotel/. Off the site for now (owner, 2026-11-09): its
  // files stay, but nothing links to it. Set true to bring every door back.
  game: false,

  // A link to your résumé PDF (e.g. 'assets/resume.pdf'). Empty → the button is hidden. TODO
  resume: '',

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
