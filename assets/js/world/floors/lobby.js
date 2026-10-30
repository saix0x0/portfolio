// ─────────────────────────────────────────────────────────────────────────────
//  FLOOR G — GRAND LOBBY  (theme: lobby — plum, gold, magenta + amber neon)
//  Entrance · lounge with the Skyview window · reception & guide · directory ·
//  Portfolio kiosk · vending · mailbox · Neon Bar · staff stairs (locked)
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, windowHole, sign, lamp, lightCone, neonPalm, sofa, table, stool, screen, R, P, text, neon, glow, mix } from '../kit.js';
import { drawAndroid, drawBot, Walker, LOOKS } from '../actors.js';
import { clockIn } from '../../core/sun.js';

const T = THEMES.lobby;
const X = { entrance: 70, window0: 118, window1: 412, console: 262, desk0: 470, desk1: 676, android: 556, guide: 640, directory: 846, kiosk: 912, vending: 962, mailbox: 1008, bar0: 1060, bar1: 1330, bartender: 1200, jukebox: 1390, stairs: 1462 };

export function paint(ctx, f) {
  shell(ctx, f, T, f.x0, f.x1, { panel: 44, wainscot: 26 });
  const y = f.y - 8; // floor surface

  // ── entrance: revolving glass door in the facade
  ctx.clearRect(f.x0, y - 62, 44, 62);
  R(ctx, f.x0, y - 66, 46, 4, T.trim);
  R(ctx, f.x0 + 20, y - 62, 3, 62, T.trim);
  R(ctx, f.x0 + 8, y - 62, 2, 62, T.trimLo);
  R(ctx, f.x0 + 34, y - 62, 2, 62, T.trimLo);
  ctx.fillStyle = 'rgba(160,200,255,0.08)';
  ctx.fillRect(f.x0, y - 62, 44, 62);
  sign(ctx, 'ENTRANCE', f.x0 + 24, y - 78, T.neonC, 1);

  // ── lounge + Skyview window
  const wy = f.top + 24;
  const wh = y - 40 - wy;
  windowHole(ctx, X.window0, wy, X.window1 - X.window0, wh, T.trim, 4);
  sign(ctx, 'SKYVIEW', (X.window0 + X.window1) / 2, f.top + 13, T.neonB, 1, false);
  R(ctx, X.window0 - 6, y - 38, X.window1 - X.window0 + 12, 4, T.trimLo); // sill
  neonPalm(ctx, 108, y);
  neonPalm(ctx, 424, y, '#ff6ab4');
  sofa(ctx, 140, y, 70, '#8a1e5a', '#b02a72');
  table(ctx, 218, y, 28, '#d8c8f0', T.trim);
  R(ctx, 228, y - 20, 3, 4, '#29f0ff'); // drink
  sofa(ctx, 316, y, 56, '#8a1e5a', '#b02a72');
  // Skyview console pedestal
  R(ctx, X.console - 6, y - 22, 12, 22, '#1c0c24');
  R(ctx, X.console - 7, y - 24, 14, 3, T.trim);
  screen(ctx, X.console - 8, y - 38, 16, 10, '#2a1a34', false);

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
  // desk
  R(ctx, X.desk0, y - 30, X.desk1 - X.desk0, 30, '#2a1018');
  R(ctx, X.desk0 - 4, y - 33, X.desk1 - X.desk0 + 8, 4, '#e8d8e8'); // marble top
  R(ctx, X.desk0 - 4, y - 29, X.desk1 - X.desk0 + 8, 1, T.trim);
  R(ctx, X.desk0 + 4, y - 22, X.desk1 - X.desk0 - 8, 2, T.neonA);
  for (let x = X.desk0 + 14; x < X.desk1 - 8; x += 30) R(ctx, x, y - 18, 2, 14, T.trimLo);
  R(ctx, 498, y - 37, 6, 4, T.trim); // bell
  P(ctx, 501, y - 38, T.trim);

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

  // ── portfolio kiosk
  R(ctx, X.kiosk - 4, y - 30, 8, 30, '#1c0c24');
  R(ctx, X.kiosk - 8, y - 2, 16, 2, T.trim);
  screen(ctx, X.kiosk - 11, y - 50, 22, 18, '#2a1a34', false);

  // ── vending machine
  R(ctx, X.vending - 12, y - 58, 24, 58, '#3a0e2a');
  R(ctx, X.vending - 12, y - 58, 24, 2, T.neonA);
  R(ctx, X.vending - 9, y - 52, 14, 34, '#0a0410');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) R(ctx, X.vending - 8 + c * 5, y - 50 + r * 8, 3, 5, ['#29f0ff', '#ffb347', '#a6ff6b', '#ff3d9a'][(r + c) % 4]);
  R(ctx, X.vending + 7, y - 44, 3, 8, '#120812');
  R(ctx, X.vending - 9, y - 14, 14, 5, '#120812');
  text(ctx, 'POP', X.vending - 5, y - 64, T.neonC);

  // ── mailbox
  R(ctx, X.mailbox - 6, y - 34, 12, 34, '#b02a72');
  R(ctx, X.mailbox - 7, y - 37, 14, 4, '#d8407e');
  R(ctx, X.mailbox - 4, y - 26, 8, 2, INK);
  text(ctx, 'MAIL', X.mailbox - 7, y - 44, T.neonA);

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
  R(ctx, X.bar0 + 20, y - 26, X.bar1 - X.bar0 - 20, 26, '#2a0e24');
  R(ctx, X.bar0 + 16, y - 29, X.bar1 - X.bar0 - 12, 4, '#4a1a3a');
  R(ctx, X.bar0 + 20, y - 12, X.bar1 - X.bar0 - 20, 2, T.neonC);
  for (let x = X.bar0 + 40; x < X.bar1; x += 40) stool(ctx, x, y);
  // jukebox
  R(ctx, X.jukebox - 12, y - 46, 24, 46, '#4a1a3a');
  R(ctx, X.jukebox - 12, y - 52, 24, 8, '#6a2a5a');
  R(ctx, X.jukebox - 8, y - 40, 16, 14, '#0a0410');
  // staff stairs door (basement)
  R(ctx, X.stairs - 12, y - 44, 24, 44, '#141018');
  R(ctx, X.stairs - 13, y - 45, 26, 2, T.trimLo);
  R(ctx, X.stairs - 10, y - 42, 20, 42, '#1e1824');
  text(ctx, 'STAFF', X.stairs - 9, y - 54, '#8a6a9a');
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
  glow(l, X.vending, y - 30, 30, T.neonA, 0.25);
  glow(l, X.kiosk, y - 42, 18, T.neonC, 0.3);
  glow(l, X.console, y - 34, 14, T.neonB, 0.3);
  for (let x = 1100; x < 1300; x += 50) lightCone(l, x, f.top + 12, f, '#ff6ab4', 6, 40, 0.07);
  glow(l, X.entrance, y - 80, 24, T.neonC, 0.25);
}

export function dyn(ctx, f, t, G) {
  const y = f.y - 8;
  // receptionist behind the desk (only shows above the counter)
  drawAndroid(ctx, X.android, y - 33, t);
  // live world clocks
  const now = new Date();
  ['Asia/Kolkata', 'America/New_York', 'Asia/Tokyo'].forEach((tz, i) => text(ctx, clockIn(tz, now), 500 + i * 72 - 9, f.top + 77, T.neonB));
  // directory: blinking cursor on current floor
  if (Math.sin(t * 4) > 0) R(ctx, X.directory - 30, f.top + 48 + 5 * 10, 2, 5, T.neonA);
  // kiosk screen
  R(ctx, X.kiosk - 11, y - 50, 22, 18, '#140a30');
  text(ctx, 'PORT', X.kiosk - 8, y - 47, T.neonC);
  text(ctx, 'FOLIO', X.kiosk - 10, y - 40, T.neonC);
  R(ctx, X.kiosk - 11, y - 50 + ((t * 20) % 18), 22, 1, 'rgba(41,240,255,0.35)');
  // skyview console
  R(ctx, X.console - 8, y - 38, 16, 10, '#1a0c20');
  const c = G.skyColor || T.neonB;
  R(ctx, X.console - 6, y - 36 + Math.round(Math.sin(t * 2)), 12, 2, c);
  R(ctx, X.console - 6, y - 32, Math.round(6 + Math.sin(t * 3) * 5), 2, c);
  // bartender bot + jukebox lights
  drawBot(ctx, X.bartender, y - 29, t, T.neonA);
  const disco = G.flags?.disco;
  for (let i = 0; i < 6; i++) {
    const on = Math.sin(t * (disco ? 9 : 3) + i) > 0;
    R(ctx, X.jukebox - 8 + i * 3, y - 38 + (i % 2) * 6, 2, 8, on ? ['#29f0ff', '#ff3d9a', '#ffb347'][i % 3] : '#2a1030');
  }
  if (disco) {
    ctx.fillStyle = `hsla(${(t * 120) % 360},100%,60%,0.08)`;
    ctx.fillRect(X.bar0, f.top, f.x1 - X.bar0, f.h);
  }
  // keycard reader on staff door
  P(ctx, X.stairs + 8, y - 24, G.flags?.keycard ? '#3dffb0' : '#ff3d5a');
}

export function npcs(f) {
  return [
    new Walker({ id: 'guest-a', name: 'Hotel guest', look: LOOKS.guestA, floor: f.id, x: 300, min: 130, max: 420, lines: ['The Skyview window is the best seat in the hotel. Try the console under it.', 'I come here for the sunsets. Even the fake ones.'] }),
    new Walker({ id: 'guest-c', name: 'Night-shift courier', look: LOOKS.guestC, floor: f.id, x: 900, min: 830, max: 1040, lines: ['Messages go up to the Communications Lounge — first floor.', 'Heard there are floors that aren’t on the directory…'] }),
    new Walker({ id: 'guest-b', name: 'Regular at the bar', look: LOOKS.guestB, floor: f.id, x: 1240, min: 1100, max: 1420, lines: ['The bartender says the Gallery has a painting that doesn’t hang straight.', 'Penthouse? Owner only. Keypad by the elevator, they say.'] }),
  ];
}

export function objects(f) {
  return [
    { id: 'entrance', x: X.entrance, label: 'Entrance', verb: 'Inspect', panel: 'exit' },
    { id: 'skyview', x: X.console, label: 'Skyview console', verb: 'Use', panel: 'skyview' },
    { id: 'guide', x: X.guide, label: 'Nova, your guide', verb: 'Talk', panel: 'guide' },
    { id: 'reception', x: X.android, label: 'Reception', verb: 'Talk', panel: 'intro' },
    { id: 'directory', x: X.directory, label: 'Hotel directory', verb: 'Read', panel: 'directory' },
    { id: 'kiosk', x: X.kiosk, label: 'Portfolio mode', verb: 'Use', panel: 'portfolio' },
    { id: 'vending', x: X.vending, label: 'Vending machine', verb: 'Use', panel: 'vending' },
    { id: 'mailbox', x: X.mailbox, label: 'Mailbox', verb: 'Use', panel: 'contact' },
    { id: 'bartender', x: X.bartender, label: 'Bartender bot', verb: 'Talk', panel: 'bartender' },
    { id: 'jukebox', x: X.jukebox, label: 'Jukebox', verb: 'Use', action: 'disco' },
    { id: 'stairs', x: X.stairs, label: 'Staff stairs', verb: 'Use', panel: 'stairs' },
  ];
}

export const guideHome = X.guide;
