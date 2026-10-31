// ─────────────────────────────────────────────────────────────────────────────
//  ACTORS — the player, hotel residents, robots and the library cat.
//  People are chibi-proportioned (big head, readable face) and drawn in
//  isometric 3/4 view: a FRONT view (walking toward the camera) and a BACK
//  view (walking away), each mirrored for left/right, so four directions.
//  Parts go onto a scratch canvas, then the silhouette is outlined in INK,
//  so every character shares one pixel style (WORLD_DESIGN.md → shared rules).
// ─────────────────────────────────────────────────────────────────────────────
import { canvas, R, P } from './gfx.js';
import { INK } from './themes.js';
import { LANE } from './layout.js';

const SW = 40;
const SH = 54;
const OXp = 20; // feet centre on the scratch canvas
const OYp = 51;
const [scratch, sx] = canvas(SW, SH);
const [shape, shx] = canvas(SW, SH);
const [glowC, gx] = canvas(SW, SH);

const shade = (hex, k) => {
  // k < 0 darkens, k > 0 lightens
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('');
};

// ── Wardrobe. Anything here can be mixed; LOOKS below are the cast.
export const SKINS = ['#f3d0b0', '#e2b08a', '#c68a60', '#a46a44', '#7a4a30', '#563424'];
export const HAIRS = ['short', 'messy', 'curly', 'long', 'bun', 'buzz', 'mohawk', 'bald'];
export const HAIR_COLOURS = ['#16101e', '#4a2e1c', '#8a5a2e', '#d8b060', '#e8e4f0', '#ff5aa8', '#4ad8ff', '#8a5aff'];
export const TOP_COLOURS = ['#6a4aff', '#ff5a6a', '#2ac0a0', '#f0b23a', '#2a2c3a', '#e8e6f0', '#3a7ad8', '#ff8a3a'];
export const EXTRAS = ['headphones', 'cap', 'glasses', 'scarf', 'none'];

// top: hoodie | jacket | tee | coat | suit | labcoat | robe | racesuit | spacesuit | overalls | dress
// acc: list of extras (headphones, backpack, glasses, roundglasses, cap, deerstalker, scarf, striped,
//      visor, beard, helmet, tie, apron, hood, bow)
export const LOOKS = {
  // the player — you. Hoodie, headphones, backpack, sneakers. Restyle at the wardrobe mirror.
  player: { skin: '#c68a60', hair: 'messy', hairC: '#16101e', top: 'hoodie', topC: '#6a4aff', legs: '#2a3a5a', shoes: '#f0f0f4', sole: '#ff5a6a', acc: ['headphones', 'backpack'], accC: '#3dffb0' },
  // a guest who might have travelled here in a blue box: long coat, very long striped scarf
  guestA: { skin: '#e2b08a', hair: 'curly', hairC: '#4a2e1c', top: 'coat', topC: '#7a5234', inner: '#c8b89a', legs: '#4a3a2a', shoes: '#2a1e14', acc: ['striped'] },
  // a consulting detective: deerstalker, cape coat, pipe-free since 2019
  guestB: { skin: '#f3d0b0', hair: 'short', hairC: '#2a1a12', top: 'coat', topC: '#6a6050', inner: '#2a2a30', legs: '#3a3632', shoes: '#1a1410', acc: ['deerstalker'] },
  // night courier: visor, cropped jacket, neon trims
  guestC: { skin: '#a46a44', hair: 'bun', hairC: '#ff5aa8', top: 'jacket', topC: '#1c1a2a', inner: '#ff5aa8', legs: '#16141e', shoes: '#ff5aa8', sole: '#16141e', acc: ['visor'], accC: '#29f0ff' },
  // the mad-scientist type: lab coat, wild white hair, goggles on the brain
  scientist: { skin: '#f3d0b0', hair: 'curly', hairC: '#e8e4f0', top: 'labcoat', topC: '#eef0f6', inner: '#3a6ad8', legs: '#3a3a4a', shoes: '#1a1a20', acc: ['tie'], accC: '#e8343a' },
  // a student of the hidden castle school: round glasses, robe, red-gold scarf
  student: { skin: '#e2b08a', hair: 'messy', hairC: '#16101e', top: 'robe', topC: '#1e1a26', legs: '#1e1a26', shoes: '#14121a', acc: ['roundglasses', 'scarf'], accC: '#a81e30', accC2: '#e8b830' },
  // the quiet reader: cardigan, bun, glasses
  student2: { skin: '#563424', hair: 'long', hairC: '#16101e', top: 'jacket', topC: '#c86a4a', inner: '#f0e6d0', legs: '#2a3a5a', shoes: '#4a2e1c', acc: ['glasses'] },
  // pit crew: papaya race suit, cap
  mechanic: { skin: '#c68a60', hair: 'short', hairC: '#2a1a12', top: 'racesuit', topC: '#ff8000', inner: '#1a1a20', legs: '#ff8000', shoes: '#1a1a20', acc: ['cap'], accC: '#1a1a20' },
  // astronaut on shore leave
  astronaut: { skin: '#e2b08a', hair: 'short', hairC: '#4a2e1c', top: 'spacesuit', topC: '#eef0f6', inner: '#e8343a', legs: '#e0e2ea', shoes: '#c8cad4', acc: ['helmet'] },
  // a wandering knight of a galaxy far away: hooded robe
  monk: { skin: '#e2b08a', hair: 'short', hairC: '#8a5a2e', top: 'robe', topC: '#8a6a44', inner: '#d8c8a8', legs: '#6a5034', shoes: '#3a2a1a', acc: ['beard', 'hood'] },
  // the barista
  barista: { skin: '#7a4a30', hair: 'buzz', hairC: '#16101e', top: 'tee', topC: '#2ac0a0', legs: '#2a2c3a', shoes: '#f0f0f4', sole: '#2ac0a0', acc: ['apron', 'beard'], accC: '#3a2a1a' },
  // gallery curator in a sharp suit
  curator: { skin: '#a46a44', hair: 'long', hairC: '#16101e', top: 'suit', topC: '#2a2c3a', inner: '#f0f0f4', legs: '#2a2c3a', shoes: '#14121a', acc: ['bow'], accC: '#ffd23a' },
};

/** The player's look, restyled at the wardrobe (persisted by the game). */
export function playerLook(custom = {}) {
  const L = { ...LOOKS.player, ...custom };
  if (custom.extra) L.acc = ['backpack', ...(custom.extra === 'none' ? [] : [custom.extra])];
  return L;
}

/**
 * Draw a person with feet at (x, y). ~40px tall.
 * facing: 1 = toward screen-right, -1 = left.  back: walking away from the camera.
 * phase advances while walking. sit: seated. o: { wave, talk, boost }
 */
export function drawPerson(ctx, x, y, look, facing = 1, phase = 0, moving = false, sit = false, t = performance.now() / 1000, back = false, o = {}) {
  shx.clearRect(0, 0, SW, SH);
  gx.clearRect(0, 0, SW, SH);
  const L = look;
  const f = facing;
  const acc = new Set(L.acc || []);
  const skin = L.skin;
  const skinLo = shade(skin, -0.18);
  const C = L.topC;
  const Cd = shade(C, -0.28);
  const Cl = shade(C, 0.22);
  const H = L.hairC;
  const Hd = shade(H, -0.3);
  const Hl = shade(H, 0.28);
  const s = Math.sin(phase);
  const step = moving ? (s > 0.35 ? 1 : s < -0.35 ? -1 : 0) : 0;
  const bob = moving ? (Math.abs(s) > 0.6 ? -1 : 0) : Math.sin(t * 1.7) > 0.6 ? -1 : 0; // walk bob / breathing
  const d = (dx, dy, w, h, c, layer = shx, still = false) => {
    const X = f > 0 ? OXp + dx : OXp - dx - w;
    layer.fillStyle = c;
    layer.fillRect(X, OYp + dy + (still ? 0 : bob), w, h);
  };
  const lit = (dx, dy, w, h, c) => (d(dx, dy, w, h, c), d(dx, dy, w, h, c, gx));
  const long = ['coat', 'labcoat', 'robe'].includes(L.top);
  const legsC = L.legs;
  const shoes = L.shoes;

  // ── behind everything: long scarf tail, backpack (front view), robe hem
  if (!back && acc.has('backpack')) { d(-8, -24, 3, 9, shade(L.accC || '#3dffb0', -0.35)); d(-8, -24, 3, 1, L.accC || '#3dffb0'); }
  if (acc.has('striped')) {
    const sway = moving ? step : 0;
    for (let i = 0; i < 9; i++) d(-6 + (back ? 1 : 0) + (i > 4 ? sway : 0), -24 + i * 2, 2, 2, ['#c84a2a', '#e8b830', '#6a8a3a', '#8a4a8a', '#e8e0c8'][i % 5]);
  }

  // ── legs + shoes
  if (!sit) {
    // far leg first; the lifted foot rises a pixel and strides forward
    for (const [lx, far] of [[-3, true], [1, false]]) {
      const lift = far ? step < 0 : step > 0;
      const ly = lift ? -1 : 0;
      const st = moving ? (far ? -step : step) : 0;
      d(lx + st, -12, 3, 9 + ly, far ? shade(legsC, -0.18) : legsC, shx, true);
      d(lx + st - (far ? 1 : 0), -3 + ly, 4, 3, shoes, shx, true);
      if (L.sole) d(lx + st - (far ? 1 : 0), -1 + ly, 4, 1, L.sole, shx, true);
    }
  } else {
    d(-3, -12, 9, 4, legsC);
    d(4, -9, 3, 7, legsC);
    d(4, -3, 4, 3, shoes);
  }

  // ── far arm (behind torso)
  const swing = moving ? step : 0;
  if (!back) {
    d(-7, -23 - swing, 2, 8, Cd);
    d(-7, -15 - swing, 2, 2, skinLo);
  } else {
    d(5, -23 + swing, 2, 8, Cd);
    d(5, -15 + swing, 2, 2, skinLo);
  }

  // ── torso
  const tw = 10;
  const tl = -5;
  if (L.top === 'dress') {
    d(tl, -24, tw, 6, C); d(tl - 1, -18, tw + 2, 4, C); d(tl - 2, -14, tw + 4, 5, C); d(tl - 2, -10, tw + 4, 1, Cd);
  } else {
    d(tl, -24, tw, 13, C);
    d(back ? tl + tw - 3 : tl, -24, 3, 13, Cd); // shaded side
    d(back ? tl : tl + tw - 1, -24, 1, 12, Cl); // rim light
  }
  if (long) {
    const sway = moving ? step : 0;
    d(tl, -11, tw, L.top === 'robe' ? 9 : 6, C);
    d(back ? tl + tw - 3 : tl, -11, 3, L.top === 'robe' ? 9 : 6, Cd);
    d(tl + (sway > 0 ? 1 : 0), L.top === 'robe' ? -3 : -6, tw - 1, 1, Cd);
  }
  if (!back) {
    switch (L.top) {
      case 'hoodie':
        d(tl + 1, -25, tw - 2, 2, Cd); // hood rim
        d(-2, -16, 6, 3, Cd); d(-1, -16, 4, 1, C); // pocket
        d(0, -23, 1, 3, '#f4f0ff'); d(2, -23, 1, 2, '#f4f0ff'); // drawstrings
        break;
      case 'jacket': case 'coat': case 'labcoat':
        d(-1, -24, 4, L.top === 'jacket' ? 12 : 13, L.inner || '#f0f0f4');
        d(-1, -24, 1, 4, Cl); d(2, -24, 1, 4, Cd); // lapels
        if (L.top !== 'jacket') d(3, -18, 2, 1, Cd); // pocket flap
        break;
      case 'suit':
        d(-1, -24, 4, 8, L.inner || '#f0f0f4'); d(-1, -24, 1, 5, Cd); d(2, -24, 1, 5, Cd);
        d(3, -21, 1, 1, '#f0f0f4');
        break;
      case 'tee':
        d(-1, -24, 4, 1, shade(C, -0.4));
        break;
      case 'racesuit':
        d(-5, -18, tw, 2, L.inner || '#1a1a20'); d(1, -23, 2, 2, '#f0f0f4');
        break;
      case 'spacesuit':
        d(-2, -21, 5, 4, '#c8cad4'); lit(-1, -20, 1, 1, L.inner || '#e8343a'); lit(1, -20, 1, 1, '#3dffb0');
        break;
      case 'robe':
        d(-1, -24, 3, 14, L.inner || shade(C, -0.4));
        break;
      case 'overalls':
        d(-3, -20, 7, 9, legsC); d(-3, -24, 1, 4, legsC); d(3, -24, 1, 4, legsC);
        break;
    }
  } else if (L.top === 'hoodie') {
    d(tl + 1, -25, tw - 2, 4, Cd); d(tl + 2, -22, tw - 4, 1, shade(C, -0.4)); // hood lying flat
  }
  if (acc.has('tie')) d(0, -23, 2, 7, L.accC || '#e8343a');
  if (acc.has('bow')) { d(-1, -24, 4, 2, L.accC || '#ffd23a'); d(0, -24, 2, 2, shade(L.accC || '#ffd23a', -0.3)); }
  if (acc.has('apron') && !back) { d(-4, -21, 8, 10, L.accC || '#3a2a1a'); d(-4, -21, 8, 1, shade(L.accC || '#3a2a1a', 0.3)); }
  if (acc.has('backpack')) {
    const B = L.accC || '#3dffb0';
    if (back) { d(-4, -23, 8, 9, shade(B, -0.25)); d(-4, -23, 8, 2, B); d(-3, -18, 6, 3, shade(B, -0.45)); d(-1, -19, 2, 1, '#f4f0ff'); }
    else d(3, -24, 1, 6, shade(B, -0.35)); // strap
  }
  if (acc.has('scarf')) {
    const A = L.accC || '#a81e30';
    const B = L.accC2 || '#e8b830';
    for (let i = 0; i < 5; i++) d(tl + i * 2, -25, 2, 2, i % 2 ? B : A);
    if (!back) for (let i = 0; i < 4; i++) d(-3, -23 + i * 2, 2, 2, i % 2 ? B : A);
  }

  // ── near arm (in front of torso) — or waving
  const sleeve = L.top === 'tee' ? 4 : 8;
  if (o.wave && !back) {
    const w = Math.sin(t * 9) > 0 ? 1 : 0;
    d(5, -27, 2, 4, C); d(6, -31, 2, 4, C); d(6 + w, -34, 2, 3, skin);
  } else if (!back) {
    d(5, -23 + swing, 2, sleeve, Cl);
    d(5, -23 + swing, 1, sleeve, C);
    if (sleeve < 8) d(5, -19 + swing, 2, 4, skin);
    d(5, -15 + swing, 2, 2, skin);
  } else {
    d(-7, -23 - swing, 2, sleeve, C);
    if (sleeve < 8) d(-7, -19 - swing, 2, 4, skinLo);
    d(-7, -15 - swing, 2, 2, skinLo);
  }
  if (L.top === 'spacesuit') { d(5, -16 + swing, 2, 1, '#c8cad4'); }

  // ── head (12 × 11), neck
  d(-1, -26, 3, 2, skinLo);
  d(-4, -37, 9, 11, skin); // rounded corners
  d(-5, -36, 11, 9, skin);
  d(-4, -27, 9, 1, skinLo); // jaw shadow
  if (!back) {
    d(-4, -31, 1, 2, skinLo); // ear
    // eyes: blink, look around while idle
    const blink = Math.sin(t * 2.3 + skin.length * 7 + (L.hairC.charCodeAt(2) || 0)) > 0.975;
    const look = !moving && Math.sin(t * 0.7 + skin.charCodeAt(3)) > 0.8 ? -1 : 0;
    const eye = L.eye || '#1a1020';
    if (acc.has('visor')) lit(-1, -32, 7, 2, L.accC || '#29f0ff');
    else if (blink) { d(0 + look, -31, 2, 1, eye); d(3 + look, -31, 2, 1, eye); }
    else {
      d(0 + look, -32, 2, 2, eye); d(3 + look, -32, 2, 2, eye);
      d(0 + look, -32, 1, 1, '#ffffff'); d(3 + look, -32, 1, 1, '#ffffff');
    }
    if (acc.has('glasses')) { d(-1, -33, 7, 1, '#1a1020'); d(-1, -33, 1, 3, '#1a1020'); d(2, -33, 1, 2, '#1a1020'); d(5, -33, 1, 3, '#1a1020'); }
    if (acc.has('roundglasses')) { for (const ex of [-1, 3]) { d(ex, -33, 3, 1, '#c8a040'); d(ex, -30, 3, 1, '#c8a040'); d(ex, -32, 1, 2, '#c8a040'); d(ex + 2, -32, 1, 2, '#c8a040'); } }
    // mouth: small smile, opens while talking
    const talk = o.talk && Math.sin(t * 14) > 0;
    d(2, -28, 2, talk ? 2 : 1, talk ? '#5a1a20' : shade(skin, -0.4));
    d(5, -29, 1, 1, shade(skin, -0.08)); // cheek
    if (acc.has('beard')) { d(-4, -29, 10, 3, H); d(-2, -27, 7, 1, H); d(2, -28, 2, 1, shade(skin, -0.4)); }
  }

  // ── hair
  const hairFront = () => {
    switch (L.hair) {
      case 'short':
        d(-5, -38, 11, 4, H); d(-6, -37, 2, 6, H); d(1, -34, 4, 1, H); d(-5, -38, 6, 1, Hl); break;
      case 'messy':
        d(-5, -38, 11, 4, H); d(-6, -37, 2, 7, H); d(-4, -39, 2, 1, H); d(0, -40, 2, 2, H); d(3, -39, 2, 1, H);
        d(1, -34, 2, 1, H); d(4, -34, 2, 2, H); d(-2, -38, 4, 1, Hl); break;
      case 'curly':
        d(-6, -39, 13, 5, H); d(-7, -37, 3, 8, H); d(6, -37, 1, 4, H); d(-7, -31, 2, 2, H);
        for (const [a, b] of [[-5, -39], [-1, -40], [3, -39], [-6, -35], [5, -36]]) d(a, b, 2, 1, Hl);
        d(1, -34, 1, 1, H); d(4, -34, 1, 1, H); break;
      case 'long':
        d(-5, -38, 11, 4, H); d(-6, -37, 3, 15, H); d(5, -36, 1, 9, H); d(1, -34, 4, 1, H); d(-3, -38, 5, 1, Hl); break;
      case 'bun':
        d(-5, -38, 11, 4, H); d(-6, -37, 2, 6, H); d(-4, -42, 4, 4, H); d(-3, -42, 2, 1, Hl); d(1, -34, 3, 1, H); break;
      case 'buzz':
        d(-5, -38, 11, 2, H); d(-6, -37, 1, 4, H); break;
      case 'mohawk':
        d(-5, -37, 11, 1, Hd); d(-2, -42, 4, 5, H); d(-1, -42, 2, 1, Hl); break;
      default: break; // bald
    }
  };
  const hairBack = () => {
    // seen from behind: hair covers the head
    switch (L.hair) {
      case 'bald': d(-3, -37, 5, 1, shade(skin, 0.2)); break;
      case 'buzz': d(-5, -38, 11, 8, H); break;
      case 'mohawk': d(-5, -37, 11, 6, Hd); d(-1, -42, 4, 11, H); break;
      case 'long': d(-6, -38, 13, 17, H); d(-2, -38, 5, 1, Hl); break;
      case 'curly': d(-7, -39, 15, 11, H); for (const [a, b] of [[-5, -39], [0, -40], [4, -38], [-6, -33], [3, -32]]) d(a, b, 2, 1, Hl); break;
      case 'bun': d(-5, -38, 11, 10, H); d(-2, -42, 4, 4, H); d(-1, -42, 2, 1, Hl); break;
      default: d(-6, -38, 12, 10, H); d(-2, -38, 5, 1, Hl); if (L.hair === 'messy') { d(-4, -40, 2, 2, H); d(1, -40, 2, 2, H); }
    }
  };
  if (acc.has('hood')) { d(-6, -39, 13, 13, C); d(-6, -39, 13, 1, Cl); if (!back) d(-3, -34, 8, 8, skin), d(-3, -35, 8, 1, Cd); }
  else if (acc.has('helmet')) {} // drawn after (glass bubble)
  else back ? hairBack() : hairFront();

  // ── headwear
  if (acc.has('headphones')) {
    const A = L.accC || '#3dffb0';
    d(-5, -40, 11, 1, '#2a2c3a'); d(-6, -39, 1, 3, '#2a2c3a'); d(5, -39, 1, 2, '#2a2c3a');
    if (!back) { d(-6, -33, 3, 4, '#2a2c3a'); lit(-5, -32, 1, 2, A); }
    else { d(4, -33, 3, 4, '#2a2c3a'); lit(5, -32, 1, 2, A); }
  }
  if (acc.has('cap')) {
    const A = L.accC || '#1a1a20';
    d(-5, -40, 11, 4, A); d(-5, -40, 11, 1, shade(A, 0.3));
    if (!back) d(3, -36, 5, 1, shade(A, -0.3)); else d(-7, -37, 4, 1, shade(A, -0.3));
  }
  if (acc.has('deerstalker')) { d(-6, -41, 13, 5, '#8a7a5a'); d(-6, -41, 13, 1, '#a89a78'); for (let i = -5; i < 7; i += 3) d(i, -39, 1, 1, '#6a5a3a'); d(5, -36, 3, 1, '#6a5a3a'); d(-8, -36, 3, 1, '#6a5a3a'); }
  if (acc.has('helmet')) {
    shx.globalAlpha = 1;
    d(-5, -38, 11, 4, H);
    d(-7, -41, 15, 1, '#c8cad4'); d(-8, -40, 1, 13, '#c8cad4'); d(8, -40, 1, 13, '#c8cad4'); d(-7, -28, 15, 1, '#c8cad4');
    lit(4, -39, 2, 1, '#ffffff');
  }

  // ── outline the silhouette in INK, then composite
  sx.clearRect(0, 0, SW, SH);
  sx.globalCompositeOperation = 'source-over';
  for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) sx.drawImage(shape, a, b);
  sx.globalCompositeOperation = 'source-in';
  sx.fillStyle = INK;
  sx.fillRect(0, 0, SW, SH);
  sx.globalCompositeOperation = 'source-over';
  sx.drawImage(shape, 0, 0);
  const X = Math.round(x) - OXp;
  const Y = Math.round(y) - OYp;
  // contact shadow (an iso ellipse)
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(Math.round(x) - 6, Math.round(y) - 1, 13, 2);
  ctx.fillRect(Math.round(x) - 4, Math.round(y) + 1, 9, 1);
  if (o.boost) {
    // afterimages
    ctx.save();
    ctx.globalAlpha = 0.18;
    for (const k of [1, 2]) ctx.drawImage(scratch, X - o.boost[0] * k * 5, Y - o.boost[1] * k * 5);
    ctx.restore();
  }
  ctx.drawImage(scratch, X, Y);
  // neon glow pass for implants & LEDs
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.6;
  ctx.filter = 'blur(1.5px)';
  ctx.drawImage(glowC, X, Y);
  ctx.restore();
}

/** Which way a walker faces for a step of (dx, dz) in world space → [facing, back]. */
export function viewFor(dx, dz, prev = [1, false]) {
  if (Math.abs(dx) < 0.001 && Math.abs(dz) < 0.001) return prev;
  // +x → screen down-right (toward camera); +z → down-left (toward camera)
  if (Math.abs(dx) >= Math.abs(dz)) return dx > 0 ? [1, false] : [-1, true];
  return dz > 0 ? [-1, false] : [1, true];
}

/** Android receptionist (behind the desk, only torso shows). */
export function drawAndroid(ctx, x, y, t) {
  const blink = Math.sin(t * 1.3) > 0.97;
  R(ctx, x - 6, y - 22, 12, 14, '#c8c4d8');
  R(ctx, x - 6, y - 22, 3, 14, '#e8e6f0');
  R(ctx, x - 7, y - 23, 14, 1, INK);
  R(ctx, x - 4, y - 32, 9, 9, '#e8e6f0');
  R(ctx, x - 5, y - 33, 11, 1, INK);
  R(ctx, x - 5, y - 32, 1, 9, INK);
  R(ctx, x + 5, y - 32, 1, 9, INK);
  R(ctx, x - 3, y - 29, 7, 2, blink ? '#2a1a3a' : '#ff3d9a');
  R(ctx, x - 1, y - 35, 1, 3, '#8a86a6');
  P(ctx, x - 1, y - 36, Math.sin(t * 4) > 0 ? '#ff3d9a' : '#ffb347');
  R(ctx, x - 2, y - 18, 4, 1, '#ffb347'); // bow tie
  R(ctx, x - 1, y - 19, 2, 3, '#d4a64e');
}

/** Little service robot (bartender / helper). */
export function drawBot(ctx, x, y, t, color = '#29f0ff') {
  const hover = Math.round(Math.sin(t * 2.5) * 1.5);
  R(ctx, x - 5, y - 14 + hover, 10, 9, '#3a3a5a');
  R(ctx, x - 5, y - 14 + hover, 10, 1, '#6a6a8a');
  R(ctx, x - 3, y - 12 + hover, 6, 3, '#0a0a18');
  P(ctx, x - 2, y - 11 + hover, color);
  P(ctx, x + 1, y - 11 + hover, color);
  R(ctx, x - 1, y - 17 + hover, 1, 3, '#6a6a8a');
  P(ctx, x - 1, y - 18 + hover, color);
  ctx.fillStyle = 'rgba(41,240,255,0.25)';
  ctx.fillRect(x - 3, y - 4, 6, 2);
}

/** The library cat. Asleep unless petted. */
export function drawCat(ctx, x, y, t, awake = false) {
  const c = '#e8a060';
  const d = '#b0703a';
  R(ctx, x - 6, y - 4, 11, 4, c);
  R(ctx, x - 6, y - 4, 11, 1, d);
  R(ctx, x + 3, y - 7, 5, 4, c);
  P(ctx, x + 3, y - 8, c);
  P(ctx, x + 7, y - 8, c);
  if (awake) {
    P(ctx, x + 4, y - 6, '#2a8a3a');
    P(ctx, x + 6, y - 6, '#2a8a3a');
  } else {
    P(ctx, x + 4, y - 6, INK);
    P(ctx, x + 6, y - 6, INK);
  }
  const tail = Math.round(Math.sin(t * 1.6) * 1.5);
  R(ctx, x - 9, y - 3 + tail, 3, 1, c);
  R(ctx, x - 9, y - 4 + tail, 1, 1, c);
  if (!awake && Math.sin(t * 0.8) > 0.3) {
    const zz = (t * 6) % 12;
    ctx.globalAlpha = 1 - zz / 12;
    P(ctx, x + 9, y - 10 - zz, '#ffe6b0');
    P(ctx, x + 10, y - 10 - zz, '#ffe6b0');
    ctx.globalAlpha = 1;
  }
}

/** Wandering resident with a patrol range and a few lines of dialogue. */
export class Walker {
  constructor({ id, look, floor, x, z, min, max, speed = 16, lines = [], name, sit = false }) {
    // z: the depth lane this resident patrols (clear of furniture)
    z ??= LANE - 4 + ((id.length * 5) % 11);
    Object.assign(this, { id, look, floor, x, z, min, max, speed, lines, name, sit });
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.phase = 0;
    this.pause = 0;
    this.moving = !sit;
  }
  update(dt) {
    if (this.sit || this.talking) return (this.moving = false);
    if (this.pause > 0) {
      this.pause -= dt;
      this.moving = false;
      return;
    }
    this.moving = true;
    this.x += this.dir * this.speed * dt;
    this.phase += dt * this.speed * 0.32;
    if (this.x < this.min || this.x > this.max) {
      this.x = Math.max(this.min, Math.min(this.max, this.x));
      this.dir *= -1;
      this.pause = 1 + Math.random() * 3;
    } else if (Math.random() < dt * 0.15) this.pause = 1 + Math.random() * 2.5;
  }
  /** sx, sy: projected screen position of the feet. */
  draw(ctx, sx, sy) {
    // walking +x comes toward the camera (front view); −x walks away (back view)
    const [facing, back] = this.facingTo ?? viewFor(this.dir, 0);
    drawPerson(ctx, sx, sy, this.look, facing, this.phase, this.moving, this.sit, performance.now() / 1000, back, { talk: this.talking });
  }
}
