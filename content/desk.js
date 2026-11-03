// ─────────────────────────────────────────────────────────────────────────────
//  THE DESK at /desk/. The photo is your real desk (assets/img/desk.jpg, with
//  both screens blurred so nothing private ships). Every object on it opens
//  something. Edit the words here; positions of the objects live in
//  assets/js/pages/desk.js (they are tied to the photo).
//
//  Rule of this site: never publish a claim that isn't true.
// ─────────────────────────────────────────────────────────────────────────────

export const desk = {
  // Under your name on the wall
  wallLine: 'CS + Computing & Human Sciences · IIIT Hyderabad',
  hint: 'Click anything on the desk.',
  hintTouch: 'Drag to look around. Tap anything.',

  // The laptop terminal's greeting
  motd: [
    'Type `help` to see what this machine can do. Tab completes, ↑ remembers.',
  ],

  // The monitor's action reel (assets/video/reel.mp4). `at` is the second each
  // shot starts. All clips are from Wikimedia Commons under the licence shown;
  // the full credits with links are in assets/video/CREDITS.md.
  reel: [
    { at: 0, what: 'Cork 720, freestyle skiing', who: 'Steven Hager', lic: 'CC BY 3.0' },
    { at: 5.4, what: 'Rally, from a chase drone', who: 'MindTheGapFPV', lic: 'CC BY 3.0' },
    { at: 10.4, what: 'Freestyle motocross, Moscow', who: 'Zelio007', lic: 'CC BY-SA 4.0' },
    { at: 14.6, what: 'Downhill mountain biking', who: 'Mountain Biking TV', lic: 'CC BY 3.0' },
    { at: 19.6, what: 'Drag bike, onboard', who: 'Clemens Walleit / Auge=mit', lic: 'CC BY-SA 4.0' },
    { at: 24.1, what: 'Rally, Southern Ohio Forest Rally', who: 'HAV0Xunderscore', lic: 'CC0' },
  ],

  // The keyboard's typing test draws from these
  typing: (
    'the be of and a to in he have it that for they with as not on she at by this we you do but from or which one would all will there say who make when can more if no man out other so what time up go about than into could state only new year some take come these know see use get like then first any work now may such give over think most even find day also after way many must look before great back through long where much should well people down own just because good each those feel seem how high too place little world very still nation hand old life tell write become here show house both between need mean call develop under last right move thing general school never same another begin while number part turn real leave might want point form off child few small since against ask late home interest large person end open public follow during present without again hold govern around possible head consider word program problem however lead system set order eye plan run keep face fact group play stand increase early course change help line'
  ).split(' '),
};
