// ─────────────────────────────────────────────────────────────────────────────
//  THE DESK → the front page (/). The photo is your real desk
//  (assets/img/desk.jpg, with both screens blurred so nothing private ships).
//  Every object on it opens something. Edit the words here; positions of the
//  objects live in assets/js/pages/desk.js (they are tied to the photo).
//
//  Rule of this site: never publish a claim that isn't true.
// ─────────────────────────────────────────────────────────────────────────────

export const desk = {
  // Under your name on the wall
  wallLine: 'Computer Science + Computing & Human Sciences · IIIT Hyderabad',
  hint: 'Click anything on the desk to explore.',
  hintTouch: 'Drag to look around. Tap any object.',

  // The book on the right of the desk
  onDesk: { title: 'Clear Thinking', author: 'Shane Parrish', isbn: '9780593086117' },

  // The laptop terminal's greeting
  motd: [
    'Type `help` to see what this machine can do. Tab completes, ↑ remembers.',
  ],
};
