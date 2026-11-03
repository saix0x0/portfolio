// ─────────────────────────────────────────────────────────────────────────────
//  FLOOR G — GRAND LOBBY  (theme: lobby — plum, gold, magenta + amber neon)
//  Entrance · lounge with the Skyview window · reception & guide · directory ·
//  Portfolio kiosk · vending · mailbox · Neon Bar · staff stairs (locked)
//  Isometric: wall art is flat (paint, sheared onto the back wall); the rug and
//  the entrance in the left wall are paintIso; furniture is depth-sorted (props).
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, windowHole, sign, lamp, lightCone, neonPalm, stool, screen, R, P, text, neon, glow, mix, box, bake, sideX, top, onFace, leftOpening } from '../kit.js';
import { proj } from '../layout.js';
import { drawAndroid, drawBot, Walker, LOOKS } from '../actors.js';
import { clockIn } from '../../core/sun.js';

const T = THEMES.lobby;
const X = { entrance: 70, window0: 118, window1: 412, console: 262, desk0: 470, desk1: 676, android: 556, guide: 640, directory: 846, kiosk: 912, vending: 962, mailbox: 1008, mirror: 1038, bar0: 1060, bar1: 1330, bartender: 1200, jukebox: 1390, stairs: 1462 };

export function paint(ctx, f) {
  shell(ctx, f, T, f.x0, f.x1, { panel: 44, wainscot: 26 });
  const y = f.y - 8; // floor surface

  sign(ctx, 'ENTRANCE', f.x0 + 26, f.top + 40, T.neonC, 1);

  // ── lounge + Skyview window
  const wy = f.top + 24;
  const wh = y - 40 - wy;
  windowHole(ctx, X.window0, wy, X.window1 - X.window0, wh, T.trim, 4);
  sign(ctx, 'SKYVIEW', (X.window0 + X.window1) / 2, f.top + 13, T.neonB, 1, false);
  R(ctx, X.window0 - 6, y - 38, X.window1 - X.window0 + 12, 4, T.trimLo); // sill

  // ── reception wall: wood panel + big neon logo
  R(ctx, 448, f.top + 18, 248, y - 40 - f.top - 18, '#3a1a20');
  R(ctx, 448, f.top + 18, 248, 2, T.trim);
  R(ctx, 448, y - 42, 248, 2, T.trim);
  for (let x = 456; x < 692; x += 12) R(ctx, x, f.top + 22, 1, y - 66 - f.top, '#4a2228');
  sign(ctx, 'CYBERVERSE', 572, f.top + 34, T.neonA, 2, false);
  sign(ctx, 'H O T E L', 572, f.top + 52, T.neonB, 1, false);
  // world-clock frames (times drawn live)
  for (const [i, lbl] of ['HYD', 'NYC', 'TYO'].entries()) {
    const cx = 500 + i * 72;
    R(ctx, cx - 16, f.top + 72, 32, 15, INK);
    R(ctx, cx - 15, f.top + 73, 30, 13, '#120812');
    text(ctx, lbl, cx - 5, f.top + 90, T.trim);
  }

  for (const cx of [170, 360]) lamp(ctx, cx, f.top, T, 6);
  // ── chandeliers (holo rings)
  for (const cx of [572, 1196]) {
    R(ctx, cx, f.top + 10, 1, 20, T.trimLo);
    R(ctx, cx - 14, f.top + 30, 29, 2, T.trim);
    for (let i = -12; i <= 12; i += 6) R(ctx, cx + i, f.top + 32, 1, 5, '#ffe6b0');
  }

  // ── directory
  R(ctx, X.directory - 32, f.top + 30, 64, 92, INK);
  R(ctx, X.directory - 31, f.top + 31, 62, 90, '#120a18');
  R(ctx, X.directory - 31, f.top + 31, 62, 1, T.trim);
  text(ctx, 'DIRECTORY', X.directory - 17, f.top + 36, T.trim);
  const rows = [['PH', 'PRIVATE'], ['4', 'STUDY'], ['3', 'PAVILION'], ['2', 'GALLERY'], ['1', 'COMMS'], ['G', 'LOBBY'], ['B', '???']];
  rows.forEach(([n, name], i) => {
    text(ctx, n, X.directory - 26, f.top + 48 + i * 10, T.neonB);
    text(ctx, name, X.directory - 14, f.top + 48 + i * 10, i === 0 || i === 6 ? '#8a6a9a' : '#f0e0f0');
  });
  R(ctx, X.directory - 2, f.top + 122, 4, y - f.top - 122, T.trimLo);

  // ── Neon Bar: darker back wall, shelves of bottles, counter, stools
  R(ctx, X.bar0, f.top + 10, f.x1 - X.bar0, y - 26 - f.top - 10, '#1a0a1c');
  R(ctx, X.bar0, f.top + 10, 2, y - f.top - 36, T.trim);
  sign(ctx, 'NEON BAR', 1196, f.top + 26, T.neonA, 2);
  for (let s = 0; s < 3; s++) {
    const sy = f.top + 60 + s * 22;
    R(ctx, 1110, sy, 176, 2, T.trimLo);
    for (let bx = 1114; bx < 1282; bx += 7) {
      const c = ['#29f0ff', '#ffb347', '#a6ff6b', '#ff3d9a', '#b07cff'][(bx + s * 3) % 5];
      const bh = 8 + ((bx * 7) % 6);
      R(ctx, bx, sy - bh, 4, bh, mix(c, '#000', 0.35));
      R(ctx, bx + 1, sy - bh - 2, 2, 2, mix(c, '#000', 0.5));
      R(ctx, bx, sy - bh + 2, 1, bh - 3, c);
    }
  }
  // staff stairs door (basement)
  R(ctx, X.stairs - 12, y - 44, 24, 44, '#141018');
  R(ctx, X.stairs - 13, y - 45, 26, 2, T.trimLo);
  R(ctx, X.stairs - 10, y - 42, 20, 42, '#1e1824');
  text(ctx, 'STAFF', X.stairs - 9, y - 54, '#8a6a9a');
}

/** Drawn isometrically, after the floor and left wall. */
export function paintIso(ctx, f) {
  // entrance: revolving glass door in the left wall (the city shows through)
  const E0 = 30;
  const E1 = 74;
  leftOpening(ctx, f, E0, E1, 62);
  sideX(ctx, f, f.x0, E0 - 2, E1 + 2, 62, 66, T.trim);
  for (const z of [E0 - 2, E1]) sideX(ctx, f, f.x0, z, z + 2, 0, 62, T.trim);
  sideX(ctx, f, f.x0, (E0 + E1) / 2 - 1, (E0 + E1) / 2 + 1, 0, 62, T.trimLo);
  sideX(ctx, f, f.x0, E0, E1, 0, 62, 'rgba(160,200,255,0.10)');
  // lounge rug with a gold border
  top(ctx, f, 124, 392, 4, 48, 0, T.trim);
  top(ctx, f, 126, 390, 6, 46, 0, '#3a1440');
  for (let z = 10; z < 44; z += 8) top(ctx, f, 130, 386, z, z + 2, 0, '#461a4c');
}

export function lightsIso(l, f) {
  const at = (x, z, h) => proj(f, x, z, h);
  glow(l, ...at(X.vending, 16, 30), 30, T.neonA, 0.25);
  glow(l, ...at(X.kiosk, 32, 42), 18, T.neonC, 0.3);
  glow(l, ...at(X.console, 38, 30), 14, T.neonB, 0.3);
  glow(l, ...at(X.bar0 + 140, 32, 12), 90, T.neonC, 0.08);
  glow(l, ...at(f.x0, 52, 30), 34, '#7a5aff', 0.14);
}

export function lights(l, f) {
  const y = f.y - 8;
  for (const cx of [170, 360]) lightCone(l, cx, f.top + 24, f, T.light, 6, 60, 0.08);
  for (const cx of [572, 1196]) {
    glow(l, cx, f.top + 34, 40, T.light, 0.35);
    lightCone(l, cx, f.top + 36, f, T.light, 24, 120, 0.09);
  }
  glow(l, 572, f.top + 40, 90, T.neonA, 0.18);
  glow(l, 1196, f.top + 30, 70, T.neonA, 0.16);
  glow(l, (X.window0 + X.window1) / 2, f.top + 80, 160, '#7a5aff', 0.07);
  for (let x = 1100; x < 1300; x += 50) lightCone(l, x, f.top + 12, f, '#ff6ab4', 6, 40, 0.07);
  glow(l, f.x0 + 26, f.top + 42, 24, T.neonC, 0.25);
}

export function dyn(ctx, f, t, G) {
  // live world clocks
  const now = new Date();
  ['Asia/Kolkata', 'America/New_York', 'Asia/Tokyo'].forEach((tz, i) => text(ctx, clockIn(tz, now), 500 + i * 72 - 9, f.top + 77, T.neonB));
  // directory: blinking cursor on current floor
  if (Math.sin(t * 4) > 0) R(ctx, X.directory - 30, f.top + 48 + 5 * 10, 2, 5, T.neonA);
  if (G.flags?.disco) {
    ctx.fillStyle = `hsla(${(t * 120) % 360},100%,60%,0.08)`;
    ctx.fillRect(X.bar0, f.top, f.x1 - X.bar0, f.h);
  }
  // keycard reader on staff door
  P(ctx, X.stairs + 8, f.y - 8 - 24, G.flags?.keycard ? '#3dffb0' : '#ff3d5a');
}

// ── furniture (3D, depth-sorted) ─────────────────────────────────────────────
const SOFA = { top: '#b02a72', front: '#8a1e5a', side: '#6a1446', line: '#c84a8a' };
const ARM = { ...SOFA, top: '#c84a8a' };
const sofa3d = (c, f, x0, x1) => {
  box(c, f, x0, x1, 4, 10, 26, SOFA); // backrest
  box(c, f, x0, x1, 10, 20, 11, SOFA); // seat
  for (const ax of [x0 - 5, x1 - 1]) box(c, f, ax, ax + 6, 4, 20, 16, ARM);
};

export function props(f) {
  const at = (x, z, h = 0) => proj(f, x, z, h).map(Math.round);
  /** A baked box-ish prop: footprint + painter, optional per-frame overlay. */
  const prop = (x0, x1, z0, z1, h, paint, live, solid = true) => {
    const img = bake(f, x0, x1, z0, z1, h, paint);
    return { x0, x1, z0, z1, solid, draw: (ctx, t, G) => (img(ctx), live?.(ctx, t, G)) };
  };
  const point = (x, z, draw) => ({ x0: x, x1: x, z0: z, z1: z, solid: false, draw });
  const palm = (x, z, frond) => prop(x - 7, x + 7, z - 3, z + 3, 70, (c) => neonPalm(c, ...at(x, z), frond));

  return [
    // lounge
    palm(108, 8),
    palm(424, 8, '#ff6ab4'),
    prop(135, 216, 4, 20, 26, (c) => sofa3d(c, f, 140, 210)),
    prop(311, 378, 4, 20, 26, (c) => sofa3d(c, f, 316, 372)),
    prop(218, 246, 26, 36, 14, (c) => {
      for (const [lx, lz] of [[219, 34], [244, 34], [219, 27], [244, 27]]) box(c, f, lx, lx + 1, lz, lz + 1, 12, { top: T.trim, front: T.trim, side: T.trimLo });
      box(c, f, 218, 246, 26, 36, 14, { top: '#d8c8f0', front: '#a898c8', side: '#8878a8' }, null, 12);
      box(c, f, 229, 232, 30, 32, 19, { top: '#9ff8ff', front: '#29f0ff', side: '#1ab0c0' }, null, 14); // drink
    }),
    // Skyview console pedestal (screen is live)
    prop(256, 268, 32, 38, 36, (c) => {
      box(c, f, 256, 268, 32, 38, 22, { top: T.trim, front: '#1c0c24', side: '#140818', line: T.trim });
      onFace(c, f, 254, 38, 36, (g) => screen(g, 0, 0, 16, 10, '#2a1a34', false));
    }, (ctx, t, G) => onFace(ctx, f, 254, 38, 36, (g) => {
      R(g, 0, 0, 16, 10, '#1a0c20');
      const col = G.skyColor || T.neonB;
      R(g, 2, 2 + Math.round(Math.sin(t * 2)), 12, 2, col);
      R(g, 2, 6, Math.round(6 + Math.sin(t * 3) * 5), 2, col);
    })),
    // receptionist android, behind the desk
    point(X.android, 12, (ctx, t) => {
      const [x, y] = at(X.android, 12);
      drawAndroid(ctx, x, y - 12, t);
    }),
    // reception desk
    prop(X.desk0, X.desk1, 24, 40, 30, (c) => {
      box(c, f, X.desk0, X.desk1, 24, 40, 30, { top: '#e8d8e8', front: '#2a1018', side: '#1e0a12', line: T.trim });
      const w = X.desk1 - X.desk0;
      onFace(c, f, X.desk0, 40, 30, (g) => {
        R(g, 0, 1, w, 1, T.trim);
        R(g, 4, 8, w - 8, 2, T.neonA);
        for (let x = 14; x < w - 8; x += 30) R(g, x, 12, 2, 14, T.trimLo);
      });
      box(c, f, 496, 502, 30, 34, 34, { top: '#ffe6b0', front: T.trim, side: T.trimLo }, null, 30); // bell
    }),
    // portfolio kiosk (screen is live)
    prop(X.kiosk - 4, X.kiosk + 4, 26, 32, 52, (c) => {
      box(c, f, X.kiosk - 4, X.kiosk + 4, 26, 32, 30, { top: T.trim, front: '#1c0c24', side: '#140818' });
      top(c, f, X.kiosk - 8, X.kiosk + 8, 24, 34, 0, T.trim);
      onFace(c, f, X.kiosk - 11, 32, 50, (g) => screen(g, 0, 0, 22, 18, '#2a1a34', false));
    }, (ctx, t) => onFace(ctx, f, X.kiosk - 11, 32, 50, (g) => {
      R(g, 0, 0, 22, 18, '#140a30');
      text(g, 'PORT', 3, 3, T.neonC);
      text(g, 'FOLIO', 1, 10, T.neonC);
      R(g, 0, (t * 20) % 18, 22, 1, 'rgba(41,240,255,0.35)');
    })),
    // vending machine
    prop(X.vending - 12, X.vending + 12, 2, 16, 70, (c) => {
      box(c, f, X.vending - 12, X.vending + 12, 2, 16, 58, { top: '#5a1a40', front: '#3a0e2a', side: '#2a0820', line: T.neonA });
      onFace(c, f, X.vending - 12, 16, 58, (g) => {
        R(g, 3, 6, 14, 34, '#0a0410');
        for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) R(g, 4 + k * 5, 8 + r * 8, 3, 5, ['#29f0ff', '#ffb347', '#a6ff6b', '#ff3d9a'][(r + k) % 4]);
        R(g, 19, 14, 3, 8, '#120812');
        R(g, 3, 44, 14, 5, '#120812');
        text(g, 'POP', 7, -7, T.neonC);
      });
    }),
    // mailbox
    prop(X.mailbox - 6, X.mailbox + 6, 28, 36, 44, (c) => {
      box(c, f, X.mailbox - 6, X.mailbox + 6, 28, 36, 34, { top: '#d8407e', front: '#b02a72', side: '#8a1e5a', line: '#ff6ab4' });
      onFace(c, f, X.mailbox - 6, 36, 34, (g) => {
        R(g, 2, 8, 8, 2, INK);
        text(g, 'MAIL', -1, -8, T.neonA);
      });
    }),
    // changing-room mirror (the wardrobe: restyle your character)
    prop(X.mirror - 8, X.mirror + 8, 2, 8, 64, (c) => {
      box(c, f, X.mirror - 8, X.mirror + 8, 2, 8, 62, { top: T.trim, front: T.trimLo, side: '#6a4a2a' });
      onFace(c, f, X.mirror - 8, 8, 60, (g) => {
        R(g, 2, 2, 12, 54, '#8aa0d0');
        R(g, 3, 4, 3, 24, '#c8d8f8');
        R(g, 8, 36, 2, 10, '#c8d8f8');
      });
    }),
    // bartender bot, behind the counter
    point(X.bartender, 8, (ctx, t) => {
      const [x, y] = at(X.bartender, 8);
      drawBot(ctx, x, y - 24, t, T.neonA);
    }),
    // bar counter
    prop(X.bar0 + 20, X.bar1, 18, 32, 26, (c) => {
      box(c, f, X.bar0 + 20, X.bar1, 18, 32, 26, { top: '#4a1a3a', front: '#2a0e24', side: '#1e0a1a', line: '#6a2a5a' });
      const w = X.bar1 - X.bar0 - 20;
      onFace(c, f, X.bar0 + 20, 32, 26, (g) => {
        R(g, 0, 14, w, 2, T.neonC);
        for (let x = 10; x < w - 4; x += 26) R(g, x, 18, 12, 6, '#22081c');
      });
    }),
    // stools in front of the bar
    ...[1100, 1140, 1180, 1220, 1260, 1300].map((x) => prop(x - 4, x + 5, 38, 42, 18, (c) => stool(c, ...at(x, 40)))),
    // jukebox (lights are live)
    prop(X.jukebox - 12, X.jukebox + 12, 2, 14, 52, (c) => {
      box(c, f, X.jukebox - 12, X.jukebox + 12, 2, 14, 46, { top: '#6a2a5a', front: '#4a1a3a', side: '#3a1030' });
      box(c, f, X.jukebox - 12, X.jukebox + 12, 2, 14, 52, { top: '#8a3a7a', front: '#6a2a5a', side: '#4a1a40' }, null, 46);
      onFace(c, f, X.jukebox - 12, 14, 46, (g) => R(g, 4, 6, 16, 14, '#0a0410'));
    }, (ctx, t, G) => onFace(ctx, f, X.jukebox - 12, 14, 46, (g) => {
      const disco = G.flags?.disco;
      for (let i = 0; i < 6; i++) {
        const on = Math.sin(t * (disco ? 9 : 3) + i) > 0;
        R(g, 4 + i * 3, 6 + (i % 2) * 6, 2, 8, on ? ['#29f0ff', '#ff3d9a', '#ffb347'][i % 3] : '#2a1030');
      }
    })),
  ];
}

export function npcs(f) {
  return [
    new Walker({ id: 'guest-a', name: 'Traveller in a long scarf', look: LOOKS.guestA, floor: f.id, x: 300, z: 68, min: 130, max: 420, lines: ['It’s bigger on the inside. The hotel, I mean.', 'The Skyview window is the best seat in the place. Try the console under it.', 'Hold Shift if you’re in a hurry. Time is relative, corridors aren’t.'] }),
    new Walker({ id: 'guest-c', name: 'Night-shift courier', look: LOOKS.guestC, floor: f.id, x: 900, z: 70, min: 830, max: 1040, lines: ['Messages go up to the Communications Lounge, first floor.', 'Heard there are floors that aren’t on the directory…'] }),
    new Walker({ id: 'guest-b', name: 'Detective at the bar', look: LOOKS.guestB, floor: f.id, x: 1240, z: 72, min: 1100, max: 1420, lines: ['You’ve come from the Gallery, I perceive. No? Then go, one painting there doesn’t hang straight.', 'The Penthouse is the owner’s private floor. Everything else? Open to every guest.', 'When you have eliminated the impossible, check the basement.'] }),
  ];
}

export function objects(f) {
  return [
    { id: 'entrance', x: X.entrance, z: 52, label: 'Entrance', verb: 'Inspect', panel: 'exit' },
    { id: 'skyview', x: X.console, z: 48, label: 'Skyview console', verb: 'Use', panel: 'skyview' },
    { id: 'guide', x: X.guide, z: 62, label: 'Nova, your guide', verb: 'Talk', panel: 'guide' },
    { id: 'reception', x: X.android, z: 54, label: 'Reception', verb: 'Talk', panel: 'intro' },
    { id: 'directory', x: X.directory, z: 18, label: 'Hotel directory', verb: 'Read', panel: 'directory' },
    { id: 'kiosk', x: X.kiosk, z: 40, label: 'Portfolio mode', verb: 'Use', panel: 'portfolio' },
    { id: 'vending', x: X.vending, z: 24, label: 'Vending machine', verb: 'Use', panel: 'vending' },
    { id: 'mailbox', x: X.mailbox, z: 44, label: 'Mailbox', verb: 'Use', panel: 'contact' },
    { id: 'mirror', x: X.mirror, z: 20, label: 'Changing-room mirror', verb: 'Restyle', panel: 'wardrobe' },
    { id: 'bartender', x: X.bartender, z: 48, label: 'Bartender bot', verb: 'Talk', panel: 'bartender' },
    { id: 'jukebox', x: X.jukebox, z: 22, label: 'Jukebox', verb: 'Use', action: 'disco' },
    { id: 'stairs', x: X.stairs, z: 16, label: 'Staff stairs', verb: 'Use', panel: 'stairs' },
  ];
}

export const guideHome = X.guide;
