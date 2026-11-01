// ─────────────────────────────────────────────────────────────────────────────
//  THE DESK → the front page (/). The photo is your real desk
//  (assets/img/desk.jpg, with both screens blurred so nothing private ships).
//  Every object on it opens something. Edit the words here; positions of the
//  objects live in assets/js/pages/desk.js (they are tied to the photo).
//
//  Rule of this site: never publish a claim that isn't true. Anything marked
//  TODO is waiting for your real words (gear models, editor, etc.).
// ─────────────────────────────────────────────────────────────────────────────

export const desk = {
  // Under your name on the wall
  wallLine: 'Computer Science + Computing & Human Sciences · IIIT Hyderabad',
  hint: 'Everything on the desk does something. Try the lamp.',
  hintTouch: 'Drag to look around. Tap anything.',

  // The mouse → "Uses": what's on the desk. Only the things in the photo.
  uses: [
    { thing: 'Monitor', model: 'TODO — model', note: 'The browser lives here: projects, academy, the pit wall.' },
    { thing: 'MacBook', model: 'TODO — model', note: 'The terminal side of the desk.' },
    { thing: 'Mechanical keyboard', model: 'TODO — model & switches', note: 'RGB on. Obviously.' },
    { thing: 'Vertical mouse', model: 'TODO — model', note: 'Wrists are not replaceable parts.' },
    { thing: 'AirPods', model: '', note: 'Whatever is playing right now.' },
    { thing: 'Sunset lamp', model: '', note: 'The reason the wall is orange.' },
  ],
  software: [
    { thing: 'Chrome', note: 'On the big screen' },
    { thing: 'Claude Code', note: 'On the laptop' },
    { thing: 'TODO — your editor', note: '' },
    { thing: 'TODO — your terminal / shell', note: '' },
  ],

  // The book on the right of the desk
  onDesk: { title: 'Clear Thinking', author: 'Shane Parrish', isbn: '9780593086117' },

  // The water bottle
  bottle: [
    'Hydration check passed. Back to work.',
    'Water: the original performance-enhancing drug.',
    'Box, box. Pit for fluids.',
    'Achievement unlocked: drank water like a functioning adult.',
    'The compiler doesn’t care, but your kidneys do.',
    'Staying hydrated is just caching for humans.',
    'Okay, that’s plenty. You’ll be up all night.',
  ],

  // The laptop terminal's greeting
  motd: [
    'Last login: tonight, at this desk',
    'Type `help` to see what this machine can do. Tab completes, ↑ remembers.',
  ],
};
