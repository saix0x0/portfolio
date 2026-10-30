// ─────────────────────────────────────────────────────────────────────────────
//  THE COMPASS — websites you use all the time, as a "departures board".
//  Set /compass/ as your browser homepage. Press / to search, Enter to open.
//  Public page: don't put anything private here (use the Vault for that).
//  TODO: swap these starter links for your own.
// ─────────────────────────────────────────────────────────────────────────────

export const linkGroups = [
  {
    name: 'Daily',
    gate: 'A1',
    links: [
      { name: 'Gmail', url: 'https://mail.google.com', note: 'Inbox' },
      { name: 'Google Calendar', url: 'https://calendar.google.com', note: 'Today' },
      { name: 'Claude', url: 'https://claude.ai', note: 'Think out loud' },
      { name: 'YouTube', url: 'https://youtube.com', note: 'Lectures & sunsets' },
    ],
  },
  {
    name: 'Build',
    gate: 'B2',
    links: [
      { name: 'GitHub', url: 'https://github.com', note: 'Code' },
      { name: 'MDN', url: 'https://developer.mozilla.org', note: 'Web docs' },
      { name: 'Can I use', url: 'https://caniuse.com', note: 'Browser support' },
      { name: 'Excalidraw', url: 'https://excalidraw.com', note: 'Sketch ideas' },
      { name: 'regex101', url: 'https://regex101.com', note: 'Regex tester' },
    ],
  },
  {
    name: 'Practice',
    gate: 'C3',
    links: [
      { name: 'Codeforces', url: 'https://codeforces.com', note: 'Contests' },
      { name: 'LeetCode', url: 'https://leetcode.com', note: 'Interview prep' },
      { name: 'Project Euler', url: 'https://projecteuler.net', note: 'Math + code' },
      { name: 'Advent of Code', url: 'https://adventofcode.com', note: 'December fun' },
    ],
  },
  {
    name: 'Learn',
    gate: 'D4',
    links: [
      { name: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu', note: 'Free courses' },
      { name: 'arXiv', url: 'https://arxiv.org', note: 'Papers' },
      { name: 'Open Library', url: 'https://openlibrary.org', note: 'Borrow books' },
      { name: 'Project Gutenberg', url: 'https://www.gutenberg.org', note: 'Free classics' },
    ],
  },
  {
    name: 'Skies',
    gate: 'E5',
    links: [
      { name: 'Windy', url: 'https://www.windy.com', note: 'Will tonight’s sunset be good?' },
      { name: 'Aurora forecast', url: 'https://www.swpc.noaa.gov/products/aurora-30-minute-forecast', note: 'NOAA, 30-min' },
      { name: 'Time and Date', url: 'https://www.timeanddate.com/sun/', note: 'Sunset times anywhere' },
      { name: 'Google Earth', url: 'https://earth.google.com/web/', note: 'Get lost' },
    ],
  },
];
