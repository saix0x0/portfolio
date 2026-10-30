// ─────────────────────────────────────────────────────────────────────────────
//  THE LAB — registry of experiments. To add one:
//    1. copy _template.js → my-idea.js
//    2. add an entry below
//  Each experiment is lazy-loaded and isolated: if one throws, the Lab shows
//  an error card and the rest of the site is untouched.
//  status: 'live' | 'wip' | 'idea'
// ─────────────────────────────────────────────────────────────────────────────

export const experiments = [
  { id: 'sunset-mixer', title: 'Sunset mixer', blurb: 'Mix your own sky and copy it as CSS.', status: 'live', module: './sunset-mixer.js', hue: 24 },
  { id: 'constellations', title: 'Draw a constellation', blurb: 'Click to place stars. Name it. It stays in your browser.', status: 'live', module: './constellations.js', hue: 250 },
  { id: 'skyline', title: 'Skyline generator', blurb: 'An endless procedural city at dusk. Download it as SVG.', status: 'live', module: './skyline.js', hue: 330 },
  { id: 'notebook', title: 'Scratchpad', blurb: 'A notebook that lives in this browser only. For half-ideas.', status: 'live', module: './notebook.js', hue: 160 },
];
