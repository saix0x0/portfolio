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
  degree: 'Computer Science + Computing and Human Sciences',

  // One sentence. Shown under your name in Paris.
  tagline: 'I study Computer Science and Computing & Human Sciences at IIIT Hyderabad — and I like building things that sit between machines and people.',

  // Shown in the Paris "About" column. TODO: rewrite in your own voice.
  bio: [
    'TODO — two or three sentences about who you are and what pulls you toward both engineering and the human sciences.',
    'TODO — what you do when you are not at a keyboard, and what you hope to build.',
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
    { label: 'Studying', text: 'TODO — this semester’s courses' },
    { label: 'Reading', text: 'TODO — see the Library' },
  ],

  facts: [
    ['Studying', 'CS + CHD, IIIT Hyderabad'],
    ['Based in', 'Hyderabad, India'], // TODO: confirm
    ['Off-screen', 'Chasing sunsets'],
  ],

  // Contact. The postcard form on the home page uses this.
  email: '', // TODO: your email. While empty, the form shows a clear "not configured" message.
  contact: {
    // 'mailto'    → opens the visitor's own mail app, pre-filled. Zero setup, always works.
    // 'web3forms' → real delivery to your inbox. Free tier (250 msgs/month at time of writing).
    //               Get an access key at https://web3forms.com with just your email; paste below.
    //               The key is designed to be public (it can only send to *your* inbox).
    provider: 'mailto',
    web3formsKey: '',
  },

  socials: [
    // Empty url → hidden. TODO
    { label: 'GitHub', url: '' },
    { label: 'LinkedIn', url: '' },
    { label: 'X', url: '' },
  ],

  hiring: {
    open: true,
    headline: 'Open to internships, research and interesting problems', // TODO: confirm
    lookingFor: ['TODO — e.g. software engineering internships', 'TODO — e.g. AI / agents research', 'TODO — e.g. hackathon teams'],
    note: '',
    resume: '', // e.g. 'assets/resume.pdf' — put the file there and set the path. Empty hides the button.
  },
};
