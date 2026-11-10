// ─────────────────────────────────────────────────────────────────────────────
//  THE CRITTER: a little orange pixel creature that lives in the room. Every
//  few seconds it hops to another perch (a shelf, the monitor, the speaker…).
//  Click it and it jumps somewhere new. It bobs along when music plays.
//  Reduced motion: it sits on the monitor and stays there.
// ─────────────────────────────────────────────────────────────────────────────
import { note } from '../world/sound.js';

// where it can stand: [x, y] of the surface under its feet, in stage px
const PERCHES = [
  [250, 352], [690, 186], [1330, 646], [770, 646], [1630, 646], [1300, 168], [990, 96],
  [2140, 352], [1820, 430], [1820, 886], [2100, 846], [540, 790], [1700, 1100], [880, 996],
];
const W = 66; // drawn size in stage px (11 × 9 pixels of 6)
const H = 54;

// 11×9 pixel sprite: o = body, e = eye, . = empty
const SPRITE = [
  '..ooooooo..',
  '..ooooooo..',
  '..oeoooeo..',
  '..oeoooeo..',
  'ooooooooooo',
  'ooooooooooo',
  '..ooooooo..',
  '..o.o.o.o..',
  '..o.o.o.o..',
];
function svg() {
  let r = '';
  SPRITE.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === 'o') r += `<rect x="${x}" y="${y}" width="1.04" height="1.04" fill="#d97757"/>`;
    if (c === 'e') r += `<rect class="cr-eye" x="${x}" y="${y}" width="1.04" height="1.04" fill="#1a0f0a"/>`;
  }));
  return `<svg viewBox="0 0 11 9" width="${W}" height="${H}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}

export function critter(stage, { reduced = false, toast = () => {} } = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'critter';
  el.setAttribute('aria-label', 'A little orange creature. Click it to make it jump');
  el.innerHTML = `<span class="cr-body">${svg()}</span><i class="cr-shadow"></i>`;
  stage.append(el);
  let at = 2;
  let facing = 1;
  let busy = false;
  let timer = 0;
  const place = ([x, y]) => (el.style.transform = `translate(${x - W / 2}px, ${y - H}px)`);
  place(PERCHES[at]);
  el.style.setProperty('--face', facing);

  function hop(to) {
    if (busy || to === at) return;
    busy = true;
    const [x0, y0] = PERCHES[at];
    const [x1, y1] = PERCHES[to];
    facing = x1 < x0 ? -1 : 1;
    el.style.setProperty('--face', facing);
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const lift = 120 + dist * 0.25 + Math.max(0, y0 - y1) * 0.6; // jump higher to reach higher
    const frames = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t - lift * 4 * t * (1 - t);
      frames.push({ transform: `translate(${(x - W / 2).toFixed(1)}px, ${(y - H).toFixed(1)}px)` });
    }
    el.classList.add('jump');
    note(520, { dur: 0.08, type: 'square', vol: 0.03, slide: 1.8 });
    const ms = 520 + dist * 0.45;
    const anim = el.animate(frames, { duration: ms, easing: 'linear' });
    // if the animation clock stalls (a background tab), land anyway
    const stall = setTimeout(() => anim.finish(), ms + 600);
    anim.finished.then(() => {
      clearTimeout(stall);
      at = to;
      place(PERCHES[at]);
      el.classList.remove('jump');
      el.classList.add('land');
      setTimeout(() => el.classList.remove('land'), 220);
      busy = false;
    });
  }
  const next = () => {
    let to = at;
    while (to === at) to = Math.floor(Math.random() * PERCHES.length);
    return to;
  };
  const wander = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (!document.hidden) hop(next()); wander(); }, 3500 + Math.random() * 4500);
  };
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (reduced) return toast('Hello. (It doesn’t jump while reduced motion is on.)');
    hop(next());
    wander();
  });
  if (!reduced) wander();
}
