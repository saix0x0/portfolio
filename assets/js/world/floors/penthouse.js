// ─────────────────────────────────────────────────────────────────────────────
//  FLOOR PH — THE PENTHOUSE  (theme: penthouse — midnight, silver, champagne)
//  The owner's own floor. Every other floor is open to every guest; this one
//  is personal: it is where the owner lives and thinks.
//  Notes desk (the notebook: content/notes.js) · shelf of curios · record
//  player · lounge · workstation · telescope · piano (playable) · bed ·
//  wardrobe mirror. Locked with a simple local code (not security).
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, sign, windowHole, lightCone, plant, R, P, text, glow, mix, box, bake, top, onFace, sideX } from '../kit.js';
import { proj } from '../layout.js';
import { register, todo } from '../panels.js';
import { esc, href } from '../../core/base.js';
import { site } from '../../../../content/site.js';
import { notebook } from '../../../../content/notes.js';
import { key, loop, RECORDS, blip } from '../../core/sound.js';
import { wardrobePanel } from '../wardrobe.js';

const T = THEMES.penthouse;
const X = { cork0: 70, cork1: 196, shelf0: 214, shelf1: 336, win0: 356, win1: 714, desk: 124, records: 252, sofa0: 400, sofa1: 588, ws0: 826, ws1: 962, scope: 1050, piano0: 1126, piano1: 1214, bed0: 1290, bed1: 1424, robe: 1474 };
const NOTE_C = { yellow: '#ffe27a', pink: '#ff9ac8', mint: '#8affc8', blue: '#8ac8ff', lilac: '#c8a8ff', orange: '#ffb87a' };

export function paint(ctx, f) {
  shell(ctx, f, T, f.x0, f.x1, { panel: 0, wainscot: 14, floor: 'planks' });
  const y = f.y - 8;
  // ── corkboard of sticky notes over the desk
  R(ctx, X.cork0, f.top + 22, X.cork1 - X.cork0, 52, '#6a4a2a');
  R(ctx, X.cork0 + 2, f.top + 24, X.cork1 - X.cork0 - 4, 48, '#b88a5a');
  for (let i = 0; i < 40; i++) P(ctx, X.cork0 + 4 + ((i * 37) % 118), f.top + 26 + ((i * 23) % 44), '#a07a4a');
  const pins = Object.values(NOTE_C);
  notebook.tabs[0].notes.forEach((n, i) => {
    const nx = X.cork0 + 8 + (i % 4) * 29 + (i > 3 ? 14 : 0);
    const ny = f.top + 28 + (i > 3 ? 22 : 0) + (i % 2) * 3;
    R(ctx, nx, ny, 18, 16, NOTE_C[n.color] || pins[i % pins.length]);
    R(ctx, nx, ny + 15, 18, 1, mix(NOTE_C[n.color] || '#ffe27a', '#000', 0.25));
    for (let l = 0; l < 3; l++) R(ctx, nx + 3, ny + 5 + l * 3, 8 + ((i + l) % 3) * 2, 1, 'rgba(40,30,60,0.55)');
    P(ctx, nx + 8, ny + 1, '#e8343a');
  });
  // a polaroid and a string of fairy lights
  R(ctx, X.cork1 - 30, f.top + 50, 16, 19, '#f4f0e8');
  R(ctx, X.cork1 - 28, f.top + 52, 12, 11, '#ff8a4a');
  R(ctx, X.cork1 - 28, f.top + 58, 12, 5, '#2a1a4a');
  text(ctx, 'NOTES TO SELF', X.cork0 + 10, f.top + 14, T.neonB);
  // ── shelf of curios
  for (const sy of [f.top + 44, f.top + 74]) {
    R(ctx, X.shelf0, sy, X.shelf1 - X.shelf0, 3, T.trim);
    R(ctx, X.shelf0, sy + 3, X.shelf1 - X.shelf0, 1, T.trimLo);
  }
  // upper shelf: a tiny time machine car, a laser-sword hilt, a folded towel marked 42
  R(ctx, 222, f.top + 36, 26, 6, '#b8bcc8'); R(ctx, 228, f.top + 33, 12, 3, '#9aa0b0'); R(ctx, 224, f.top + 42, 4, 2, INK); R(ctx, 242, f.top + 42, 4, 2, INK);
  R(ctx, 244, f.top + 38, 4, 2, '#29f0ff');
  R(ctx, 262, f.top + 34, 3, 10, '#c8c8d0'); R(ctx, 261, f.top + 38, 5, 2, '#2a2a30');
  R(ctx, 280, f.top + 36, 18, 8, '#e8d8a8'); R(ctx, 280, f.top + 39, 18, 1, '#c8b888'); text(ctx, '42', 284, f.top + 37, '#6a5a3a');
  R(ctx, 306, f.top + 30, 8, 14, '#d4a64e'); R(ctx, 304, f.top + 30, 12, 3, '#e8c86a'); R(ctx, 308, f.top + 26, 4, 4, '#e8c86a'); // trophy
  // lower shelf: a gold ring, a cube puzzle, a tiny F1 helmet, the golden-duck plinth
  R(ctx, 222, f.top + 70, 6, 4, '#ffd23a'); R(ctx, 224, f.top + 71, 2, 2, T.wall);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R(ctx, 240 + i * 3, f.top + 65 + j * 3, 3, 3, ['#e8343a', '#3a7ad8', '#ffd23a', '#3dbb4a', '#f0f0f0', '#ff8a3a'][(i + j * 2) % 6]);
  R(ctx, 262, f.top + 66, 12, 8, '#ff8000'); R(ctx, 266, f.top + 68, 8, 3, '#141418');
  R(ctx, 300, f.top + 66, 22, 8, '#2a2a40'); R(ctx, 300, f.top + 66, 22, 1, T.trim);
  // ── big windows onto the city
  windowHole(ctx, X.win0, f.top + 16, X.win1 - X.win0, y - 30 - f.top - 16, T.trim, 6);
  R(ctx, X.win0 - 4, y - 30, X.win1 - X.win0 + 8, 3, T.trimLo);
  // ── private residence sign over the workstation
  sign(ctx, 'PENTHOUSE', (X.ws0 + X.ws1) / 2, f.top + 22, T.neonB, 1, false);
  text(ctx, `PRIVATE RESIDENCE OF ${site.name}`.toUpperCase(), X.ws0 - 4, f.top + 36, T.trimLo);
  // pin board of the hotel's floors (a blueprint)
  R(ctx, X.ws0 + 10, f.top + 46, 116, 34, '#0a1a3a');
  for (let i = 0; i < 6; i++) R(ctx, X.ws0 + 18, f.top + 50 + i * 5, 100, 1, 'rgba(140,180,255,0.35)');
  R(ctx, X.ws0 + 18, f.top + 50, 1, 25, 'rgba(140,180,255,0.35)');
  R(ctx, X.ws0 + 117, f.top + 50, 1, 25, 'rgba(140,180,255,0.35)');
  // tall telescope window
  windowHole(ctx, X.scope - 30, f.top + 14, 64, y - 30 - f.top - 14, T.trim, 2);
  // poster over the piano: a pixel sunset
  R(ctx, X.piano0 + 4, f.top + 22, 80, 46, INK);
  for (let j = 0; j < 42; j++) R(ctx, X.piano0 + 6, f.top + 24 + j, 76, 1, mix('#2a1a4a', '#ff8a4a', j / 42));
  for (let k = -9; k <= 9; k++) R(ctx, X.piano0 + 44 - Math.round(Math.sqrt(81 - k * k)), f.top + 54 + k, Math.round(Math.sqrt(81 - k * k)) * 2, 1, k > 3 ? '#ffd8a8' : '#fff2b0');
  R(ctx, X.piano0 + 6, f.top + 60, 76, 6, '#1a0a20');
  // headboard + a neon "do not disturb"
  R(ctx, X.bed0 + 6, y - 46, X.bed1 - X.bed0 - 12, 34, '#2a2440');
  for (let x = X.bed0 + 12; x < X.bed1 - 10; x += 14) R(ctx, x, y - 42, 10, 26, '#342e50');
  sign(ctx, 'DO NOT DISTURB', (X.bed0 + X.bed1) / 2, f.top + 24, '#ff6ab4', 1, false);
  // full-length mirror frame on the wardrobe wall
  R(ctx, X.robe + 30, f.top + 30, 22, y - 20 - f.top - 30, T.trim);
}

export function lights(l, f) {
  glow(l, (X.cork0 + X.cork1) / 2, f.top + 46, 60, T.light, 0.12);
  for (const x of [X.desk, 560, 900, 1170, 1360]) lightCone(l, x, f.top + 12, f, T.light, 8, 70, 0.07);
  glow(l, (X.ws0 + X.ws1) / 2, f.top + 24, 60, T.neonB, 0.16);
  glow(l, (X.bed0 + X.bed1) / 2, f.top + 26, 60, '#ff6ab4', 0.16);
}

export function paintIso(ctx, f) {
  // lounge rug + bedside rug
  top(ctx, f, X.sofa0 - 16, X.sofa1 + 30, 22, 74, 0, '#c8b8a0');
  top(ctx, f, X.sofa0 - 14, X.sofa1 + 28, 24, 72, 0, '#2a2648');
  for (let z = 30; z < 68; z += 10) top(ctx, f, X.sofa0 - 8, X.sofa1 + 22, z, z + 1, 0, '#3a3460');
  top(ctx, f, X.bed0 - 10, X.bed0 + 50, 52, 70, 0, '#5a3a5a');
}

export function lightsIso(l, f) {
  const at = (x, z, h) => proj(f, x, z, h);
  glow(l, ...at(X.desk + 20, 12, 40), 26, '#ffe6a0', 0.3); // desk lamp
  glow(l, ...at(X.ws0 + 60, 10, 40), 40, '#9b8cff', 0.18); // monitors
  glow(l, ...at(X.records, 8, 24), 16, '#ffd8a8', 0.2);
}

// ── furniture (3D, depth-sorted) ─────────────────────────────────────────────
export function props(f) {
  const at = (x, z, h = 0) => proj(f, x, z, h).map(Math.round);
  const prop = (x0, x1, z0, z1, h, paint, live, solid = true) => {
    const img = bake(f, x0, x1, z0, z1, h, paint);
    return { x0, x1, z0, z1, solid, draw: (ctx, t, G) => (img(ctx), live?.(ctx, t, G)) };
  };
  const WOOD = { top: '#8a6a4a', front: '#5a4030', side: '#4a3424', line: '#a88a6a' };
  const DARK = { top: '#3a3a5a', front: '#22223a', side: '#1a1a2e', line: '#5a5a7a' };
  const SOFA = { top: '#d8c8b0', front: '#a8987e', side: '#8a7a64', line: '#e8dcc8' };

  return [
    // notes desk: laptop (live), lamp, mug, a stack of notebooks
    prop(X.desk - 46, X.desk + 46, 6, 24, 40, (c) => {
      for (const lx of [X.desk - 44, X.desk + 42]) box(c, f, lx, lx + 2, 20, 22, 22, WOOD);
      box(c, f, X.desk - 46, X.desk + 46, 6, 24, 24, WOOD, null, 21);
      box(c, f, X.desk - 30, X.desk - 10, 10, 20, 26, DARK, null, 24); // laptop base
      sideX(c, f, X.desk - 30, 10, 20, 24, 38, '#2a2a40'); // lid (seen edge-on, angled)
      box(c, f, X.desk + 14, X.desk + 18, 10, 14, 34, { top: '#3a3a4a', front: '#2a2a3a', side: '#1a1a2a' }, null, 24); // lamp pole
      box(c, f, X.desk + 10, X.desk + 24, 8, 16, 38, { top: '#ffe6a0', front: '#d4a64e', side: '#a8823a' }, null, 34); // lamp head
      box(c, f, X.desk + 30, X.desk + 34, 16, 20, 29, { top: '#3a2a1a', front: '#f4f0e8', side: '#d8d0c0' }, null, 24); // mug
      for (let k = 0; k < 3; k++) box(c, f, X.desk - 4, X.desk + 8, 12, 20, 25 + k * 2, { top: ['#e8343a', '#3a7ad8', '#ffd23a'][k], front: mix(['#e8343a', '#3a7ad8', '#ffd23a'][k], '#000', 0.3), side: '#f0e8d8' }, null, 24 + k * 2);
    }, (ctx, t) => {
      // laptop screen: a cursor blinking in a note
      const [sx, sy] = at(X.desk - 30, 15, 37);
      R(ctx, sx - 4, sy, 3, 9, '#0a0a18');
      if (Math.sin(t * 4) > 0) R(ctx, sx - 3, sy + 2 + ((t * 0.5) | 0) % 5, 1, 2, '#ffe6a0');
    }),
    // desk chair
    prop(X.desk - 8, X.desk + 8, 30, 40, 22, (c) => {
      box(c, f, X.desk - 2, X.desk + 2, 34, 36, 10, DARK);
      box(c, f, X.desk - 8, X.desk + 8, 30, 40, 12, { top: '#6a4aff', front: '#4a2acc', side: '#3a1aa0' }, null, 10);
      box(c, f, X.desk - 8, X.desk + 8, 38, 40, 24, { top: '#6a4aff', front: '#4a2acc', side: '#3a1aa0' }, null, 12);
    }),
    // record player cabinet + crate of vinyl
    prop(X.records - 24, X.records + 24, 4, 16, 22, (c) => {
      box(c, f, X.records - 24, X.records + 24, 4, 16, 20, WOOD);
      onFace(c, f, X.records - 24, 16, 20, (g) => { R(g, 3, 4, 20, 12, '#4a3424'); R(g, 25, 4, 20, 12, '#4a3424'); R(g, 12, 9, 2, 2, T.trim); R(g, 34, 9, 2, 2, T.trim); });
      box(c, f, X.records - 16, X.records + 10, 6, 14, 22, { top: '#1a1a20', front: '#2a2a30', side: '#141418' }, null, 20);
    }, (ctx, t, G) => {
      const [cx, cy] = at(X.records - 3, 10, 22);
      R(ctx, cx - 6, cy - 2, 12, 5, '#0a0a0c');
      const spin = G.flags?.record ? t * 8 : 0;
      R(ctx, cx - 1 + Math.round(Math.cos(spin) * 3), cy, 2, 1, '#e8343a');
      R(ctx, cx + 6, cy - 4, 1, 4, '#c8c8d0');
    }),
    prop(X.records + 30, X.records + 46, 6, 16, 12, (c) => {
      box(c, f, X.records + 30, X.records + 46, 6, 16, 10, WOOD);
      for (let k = 0; k < 5; k++) sideX(c, f, X.records + 32 + k * 3, 8, 14, 8, 15, ['#e8343a', '#29f0ff', '#ffd23a', '#9b8cff', '#f0f0f0'][k]);
    }),
    // lounge: long sofa, side section, coffee table with a cube and a game controller
    prop(X.sofa0, X.sofa1, 6, 24, 26, (c) => {
      box(c, f, X.sofa0, X.sofa1, 6, 13, 26, SOFA);
      box(c, f, X.sofa0, X.sofa1, 13, 24, 11, SOFA);
      for (let x = X.sofa0 + 8; x < X.sofa1 - 20; x += 46) box(c, f, x, x + 18, 13, 17, 20, { top: ['#ff8a4a', '#6a4aff', '#3dffb0', '#ff6ab4'][((x - X.sofa0) / 46) | 0], front: '#00000033', side: '#00000022' }, null, 11); // cushions
    }),
    prop(X.sofa1, X.sofa1 + 24, 6, 50, 26, (c) => {
      box(c, f, X.sofa1 + 14, X.sofa1 + 24, 6, 50, 26, SOFA);
      box(c, f, X.sofa1, X.sofa1 + 14, 6, 50, 11, SOFA);
    }),
    prop(X.sofa0 + 50, X.sofa0 + 130, 38, 52, 14, (c) => {
      box(c, f, X.sofa0 + 50, X.sofa0 + 130, 38, 52, 12, { top: '#c8c8e0', front: '#6a6a88', side: '#4a4a66', line: '#e8e8ff' });
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) box(c, f, X.sofa0 + 70 + i * 3, X.sofa0 + 73 + i * 3, 42 + j * 3, 45 + j * 3, 15 + (i + j) % 2, { top: ['#e8343a', '#ffd23a', '#3a7ad8', '#3dbb4a'][i * 2 + j], front: '#8a8a8a', side: '#6a6a6a' }, null, 12);
      box(c, f, X.sofa0 + 96, X.sofa0 + 110, 42, 48, 14, { top: '#2a2a3a', front: '#1a1a2a', side: '#141420' }, null, 12); // controller
    }),
    // floor lamp + plants
    prop(X.win1 - 10, X.win1 + 2, 10, 18, 60, (c) => {
      box(c, f, X.win1 - 8, X.win1, 12, 16, 2, DARK);
      box(c, f, X.win1 - 5, X.win1 - 3, 13, 15, 50, DARK);
      box(c, f, X.win1 - 10, X.win1 + 2, 10, 18, 60, { top: '#ffe6c8', front: '#e8c89a', side: '#c8a87a' }, null, 50);
    }),
    prop(X.sofa0 - 26, X.sofa0 - 12, 6, 16, 40, (c) => plant(c, ...at(X.sofa0 - 19, 11), '#4a9a6a', '#3a3a5a')),
    // workstation: long desk, two monitors (live), chair, a rubber-duck on the desk
    prop(X.ws0, X.ws1, 6, 24, 46, (c) => {
      for (const lx of [X.ws0 + 2, X.ws1 - 4]) box(c, f, lx, lx + 2, 6, 24, 24, DARK);
      box(c, f, X.ws0, X.ws1, 6, 24, 26, { top: '#e8e8f4', front: '#a8a8c0', side: '#8888a0', line: '#ffffff' }, null, 23);
      for (const mx of [X.ws0 + 28, X.ws0 + 78]) {
        box(c, f, mx + 14, mx + 18, 9, 11, 32, DARK, null, 26);
        box(c, f, mx, mx + 32, 8, 10, 52, DARK, null, 32);
      }
      box(c, f, X.ws0 + 46, X.ws0 + 90, 15, 21, 27, { top: '#2a2a3a', front: '#1a1a2a', side: '#141420' }, null, 26); // keyboard
      box(c, f, X.ws1 - 22, X.ws1 - 16, 14, 18, 30, { top: '#ffd23a', front: '#e8b830', side: '#c89820' }, null, 26); // duck
      box(c, f, X.ws1 - 18, X.ws1 - 15, 15, 17, 33, { top: '#ffd23a', front: '#e8b830', side: '#c89820' }, null, 30);
    }, (ctx, t) => {
      for (const [k, mx] of [[0, X.ws0 + 28], [1, X.ws0 + 78]].values()) onFace(ctx, f, mx + 1, 10, 51, (g) => {
        R(g, 0, 0, 30, 17, '#0a0a18');
        for (let r = 0; r < 4; r++) R(g, 3, 3 + r * 3, 6 + (((Math.sin(t * 1.3 + r + k * 3) * 0.5 + 0.5) * 18) | 0), 1, k ? '#9b8cff' : '#ffd8a8');
      });
    }),
    prop(X.ws0 + 60, X.ws0 + 78, 30, 40, 26, (c) => {
      box(c, f, X.ws0 + 66, X.ws0 + 70, 33, 37, 10, DARK);
      box(c, f, X.ws0 + 60, X.ws0 + 78, 30, 40, 13, { top: '#e8343a', front: '#a81e30', side: '#801424' }, null, 10);
      box(c, f, X.ws0 + 60, X.ws0 + 78, 37, 40, 28, { top: '#e8343a', front: '#a81e30', side: '#801424' }, null, 13);
    }),
    // telescope on a tripod, pointed at the window
    prop(X.scope - 8, X.scope + 8, 18, 30, 44, (c) => {
      for (const [lx, lz] of [[X.scope - 7, 28], [X.scope + 6, 28], [X.scope, 19]]) box(c, f, lx, lx + 1, lz, lz + 1, 26, { top: '#c8c8d0', front: '#8a8a96', side: '#6a6a76' });
      for (let k = 0; k < 6; k++) box(c, f, X.scope - 6 + k * 3, X.scope - 1 + k * 3, 21 - k, 26 - k, 34 + k * 2, { top: '#e8e0ff', front: '#b8b0d8', side: '#9890b8' }, null, 28 + k * 2);
    }),
    // upright piano
    prop(X.piano0, X.piano1, 4, 20, 34, (c) => {
      box(c, f, X.piano0, X.piano1, 4, 12, 34, { top: '#1a1a24', front: '#101018', side: '#0a0a10', line: '#3a3a4a' });
      box(c, f, X.piano0, X.piano1, 12, 20, 18, { top: '#1a1a24', front: '#101018', side: '#0a0a10' });
      const w = X.piano1 - X.piano0;
      top(c, f, X.piano0 + 3, X.piano1 - 3, 13, 17, 18, '#f0f0f4');
      for (let x = X.piano0 + 5; x < X.piano1 - 4; x += 4) if ((x / 4) % 7 !== 2 && (x / 4) % 7 !== 6) top(c, f, x, x + 2, 13, 15, 18.5, '#101018');
      onFace(c, f, X.piano0, 12, 34, (g) => { R(g, 4, 2, w - 8, 1, '#d4a64e'); R(g, w / 2 - 8, 6, 16, 6, '#f4f0e8'); });
    }),
    prop(X.piano0 + 26, X.piano0 + 62, 28, 36, 12, (c) => box(c, f, X.piano0 + 26, X.piano0 + 62, 28, 36, 12, { top: '#2a2a3a', front: '#1a1a2a', side: '#141420', line: '#5a5a7a' })),
    // the bed (unmade, obviously) + nightstand with a book
    prop(X.bed0, X.bed1, 6, 52, 18, (c) => {
      box(c, f, X.bed0, X.bed1, 6, 52, 10, { top: '#2a2440', front: '#1e1a30', side: '#16122a' });
      box(c, f, X.bed0 + 2, X.bed1 - 2, 6, 50, 15, { top: '#e8e4f4', front: '#c8c4d8', side: '#a8a4b8' }, null, 10);
      box(c, f, X.bed0 + 10, X.bed0 + 50, 8, 18, 19, { top: '#ffffff', front: '#e0e0ec', side: '#c8c8d8' }, null, 15); // pillow
      box(c, f, X.bed0 + 60, X.bed0 + 100, 8, 18, 19, { top: '#ffffff', front: '#e0e0ec', side: '#c8c8d8' }, null, 15);
      box(c, f, X.bed0 + 4, X.bed1 - 4, 22, 50, 17, { top: '#6a4aff', front: '#4a2acc', side: '#3a1aa0' }, null, 15); // duvet
      for (let z = 26; z < 48; z += 7) top(c, f, X.bed0 + 14 + (z % 3) * 9, X.bed1 - 30 + (z % 2) * 12, z, z + 1, 17.2, '#5a3ae8'); // wrinkles
    }),
    prop(X.bed1 + 4, X.bed1 + 20, 6, 18, 20, (c) => {
      box(c, f, X.bed1 + 4, X.bed1 + 20, 6, 18, 16, WOOD);
      box(c, f, X.bed1 + 7, X.bed1 + 17, 9, 15, 18, { top: '#3a7ad8', front: '#f0e8d8', side: '#2a5aa8' }, null, 16);
    }),
    // sneakers left on the floor
    prop(X.bed0 + 60, X.bed0 + 74, 62, 70, 4, (c) => {
      box(c, f, X.bed0 + 60, X.bed0 + 66, 62, 66, 3, { top: '#f0f0f4', front: '#ff5a6a', side: '#d8d8e0' });
      box(c, f, X.bed0 + 67, X.bed0 + 73, 65, 69, 3, { top: '#f0f0f4', front: '#ff5a6a', side: '#d8d8e0' });
    }, null, false),
    // wardrobe with a full-length mirror
    prop(X.robe - 20, X.robe + 20, 2, 16, 76, (c) => {
      box(c, f, X.robe - 20, X.robe + 20, 2, 16, 74, WOOD);
      onFace(c, f, X.robe - 20, 16, 74, (g) => {
        R(g, 3, 4, 16, 66, '#4a3424'); R(g, 21, 4, 16, 66, '#9ab0d8'); R(g, 23, 6, 3, 30, '#c8d8f0'); R(g, 17, 34, 2, 6, T.trim);
      });
    }),
  ];
}

export function dyn(ctx, f, t, G) {
  // fairy lights along the corkboard
  for (let i = 0; i < 14; i++) {
    const on = Math.sin(t * 2 + i * 1.7) > -0.2;
    P(ctx, X.cork0 + 4 + i * 9, f.top + 21 + (i % 2), on ? ['#ffe27a', '#ff9ac8', '#8affc8'][i % 3] : '#3a2a20');
  }
  // the golden duck appears on its plinth once every duck is found
  if (G.flags?.goldenDuck) {
    const b = Math.round(Math.sin(t * 2) * 1);
    R(ctx, 306, f.top + 58 + b, 10, 7, '#ffd23a'); R(ctx, 312, f.top + 55 + b, 5, 5, '#ffd23a'); R(ctx, 317, f.top + 57 + b, 3, 2, '#ff8a3a'); P(ctx, 314, f.top + 56 + b, INK);
  }
  // the blueprint's floors light up one by one
  for (let i = 0; i < 6; i++) if (((t * 1.2) | 0) % 6 === i) R(ctx, X.ws0 + 19, f.top + 51 + i * 5, 98, 4, 'rgba(140,180,255,0.25)');
  // shooting star past the telescope window
  const s = (t * 0.4) % 6;
  if (s < 1) R(ctx, X.scope - 24 + s * 50, f.top + 22 + s * 14, 3, 1, '#ffffff');
}

export function objects() {
  return [
    { id: 'notes', x: X.desk, z: 34, label: 'Notes to self', verb: 'Open', panel: 'notes' },
    { id: 'curios', x: (X.shelf0 + X.shelf1) / 2 + 10, z: 26, label: 'Shelf of curios', verb: 'Look', panel: 'curios' },
    { id: 'records', x: X.records, z: 24, label: 'Record player', verb: 'Play', panel: 'records' },
    { id: 'workstation', x: (X.ws0 + X.ws1) / 2, z: 46, label: 'Owner’s workstation', verb: 'Use', panel: 'workstation' },
    { id: 'telescope', x: X.scope, z: 38, label: 'Telescope', verb: 'Look', panel: 'telescope' },
    { id: 'piano', x: (X.piano0 + X.piano1) / 2, z: 42, label: 'Piano', verb: 'Play', panel: 'piano' },
    { id: 'bed', x: X.bed0 + 70, z: 60, label: 'Bed', verb: 'Nap', panel: 'nap' },
    { id: 'wardrobe', x: X.robe, z: 26, label: 'Wardrobe mirror', verb: 'Restyle', panel: 'wardrobe' },
  ];
}

// ── panels ───────────────────────────────────────────────────────────────────
const LS = 'hotel:notes:';
const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(LS + k)) ?? d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch {} };

function doodle(kind) {
  // little pixel drawings for the doodle pages (SVG, crisp)
  const px = {
    hotel: ['....#####....', '...#.....#...', '...#.#.#.#...', '...#.....#...', '...#.#.#.#...', '...#.....#...', '...#.#.#.#...', '...#..#..#...', '#############'],
    cat: ['.#...#.......', '.##.##.......', '.#####.......', '.#.#.#.......', '.#####.....#.', '..###......#.', '.#######..#..', '.#########...', '.##.##.##....'],
    car: ['.............', '......##.....', '.##..####....', '.############', '#############', '.##.......##.', '.##.......##.'],
    duck: ['...###......', '..#####.....', '..##.###....', '..######...', '...####....', '.#########..', '###########.', '.#########..', '..#######...'],
  }[kind];
  const w = px[0].length;
  return `<svg viewBox="0 0 ${w} ${px.length}" shape-rendering="crispEdges" aria-hidden="true">${px.map((row, y) => [...row].map((c, x) => (c === '#' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : '')).join('')).join('')}</svg>`;
}

register('notes', (a, g) => {
  const el = document.createElement('div');
  el.className = 'nb';
  const tabs = notebook.tabs;
  el.innerHTML = `<div class="nb-head"><p class="px-kicker">Penthouse · the owner’s desk</p><h2 id="panel-title" class="nb-title">${esc(notebook.title)}</h2></div>
    <div class="nb-tabs" role="tablist">${tabs.map((tb, i) => `<button type="button" role="tab" data-tab="${tb.id}" aria-selected="${i === 0}">${esc(tb.label)}</button>`).join('')}</div>
    <div class="nb-page" role="tabpanel"></div>
    <p class="px-note nb-foot">Anything truly private lives in the <a href="${href('vault/')}">encrypted vault ↗</a>, not on this desk.</p>`;
  const page = el.querySelector('.nb-page');
  const show = (id) => {
    const tb = tabs.find((x) => x.id === id);
    el.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === id));
    blip();
    let html = tb.intro ? `<p class="nb-intro">${esc(tb.intro)}</p>` : '';
    if (tb.notes) html += `<div class="nb-board">${tb.notes.map((n) => `<article class="sticky ${esc(n.color)}" style="--tilt:${n.tilt || 0}deg"><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></article>`).join('')}</div>`;
    if (tb.jar) html += `<div class="nb-jar"><button type="button" class="jar" data-shake aria-label="Shake the idea jar"><span></span></button><blockquote class="hand" data-idea>Tap the jar.</blockquote></div>`;
    if (tb.todo) {
      const done = lsGet('todo', {});
      html += `<ul class="nb-todo">${tb.todo.map((t, i) => `<li><label><input type="checkbox" data-todo="${i}" ${done[i] ? 'checked' : ''}><span class="hand">${esc(t)}</span></label></li>`).join('')}</ul>`;
    }
    if (tb.lines) html += `<ul class="nb-lines">${tb.lines.map((l) => `<li><q class="hand">${esc(l.q)}</q><span>,  ${esc(l.a)}</span></li>`).join('')}</ul>`;
    if (tb.doodles) html += `<div class="nb-doodles">${tb.doodles.map((d, i) => `<figure class="polaroid" style="--tilt:${[-3, 2, -1, 3][i % 4]}deg">${doodle(d)}<figcaption class="hand">${esc({ hotel: 'the hotel, v0', cat: 'the library cat (asleep)', car: 'car #7', duck: 'debugging partner' }[d] || d)}</figcaption></figure>`).join('')}</div>`;
    if (tb.scratch) html += `<label class="nb-scratch"><span class="px-note">Scratchpad · saved in this browser only, never uploaded.</span><textarea class="hand" rows="10" placeholder="Dear diary, today the elevator…" data-scratch>${esc(lsGet('scratch', ''))}</textarea></label>`;
    page.innerHTML = html;
  };
  el.addEventListener('click', (e) => {
    const tb = e.target.closest('[data-tab]');
    if (tb) show(tb.dataset.tab);
    if (e.target.closest('[data-shake]')) {
      const jar = tabs.find((x) => x.jar).jar;
      const q = el.querySelector('[data-idea]');
      const btn = el.querySelector('.jar');
      btn.classList.remove('shake');
      void btn.offsetWidth;
      btn.classList.add('shake');
      q.textContent = jar[(Math.random() * jar.length) | 0];
      key(19, 0.3);
    }
  });
  el.addEventListener('change', (e) => {
    const c = e.target.closest('[data-todo]');
    if (!c) return;
    const done = lsGet('todo', {});
    done[c.dataset.todo] = c.checked;
    lsSet('todo', done);
    if (c.checked) key(24, 0.25);
  });
  el.addEventListener('input', (e) => e.target.matches('[data-scratch]') && lsSet('scratch', e.target.value));
  show(tabs[0].id);
  return el;
});

register('curios', (a, g) => `<p class="px-kicker">Penthouse · shelf of curios</p><h2 id="panel-title">Things that don’t need a reason.</h2>
  <ul class="px-list">
    <li><b>A tiny silver time-machine car.</b> It needs 1.21 gigawatts. The hotel runs on vibes.</li>
    <li><b>A laser-sword hilt.</b> Blue. Obviously.</li>
    <li><b>A folded towel embroidered “42”.</b> Every hitchhiker knows why.</li>
    <li><b>A gold ring.</b> Not that one. Probably.</li>
    <li><b>A cube puzzle,</b> permanently two moves from solved.</li>
    <li><b>A tiny papaya helmet.</b></li>
    <li><b>An empty plinth</b> ${g.flags.goldenDuck ? ',  now home to the <b>golden duck</b>. You found every duck in the hotel. Legend.' : `,  the label says “for the golden duck”. Ducks found so far: <b>${(g.flags.ducks || []).length}</b>. Rumour says they hide on every floor.`}</li>
  </ul>`);

register('records', (a, g) => {
  const el = document.createElement('div');
  el.innerHTML = `<p class="px-kicker">Penthouse · record player</p><h2 id="panel-title">Pick a record.</h2>
    <p>Three originals, pressed in 8-bit. They keep playing while you walk around.</p>
    <ul class="px-floors">${RECORDS.map((r) => `<li><button type="button" data-rec="${r.id}" class="${g.flags.record === r.id ? 'here' : ''}"><b>${r.side}</b><span>${esc(r.title)}</span><em>${g.flags.record === r.id ? '▶ playing' : 'play'}</em></button></li>`).join('')}</ul>
    <div class="px-row"><button class="px-btn" type="button" data-rec="">■ Stop</button></div>`;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rec]');
    if (!b) return;
    g.playRecord(b.dataset.rec || null);
    el.querySelectorAll('[data-rec] em').forEach((x) => (x.textContent = x.closest('[data-rec]').dataset.rec === g.flags.record ? '▶ playing' : 'play'));
  });
  return el;
});

register('telescope', () => {
  const sights = [
    'Saturn, rings and all. It looks fake. It isn’t.',
    'A satellite blinking past. Somebody’s Wi-Fi.',
    'The Moon. You can see the Sea of Tranquility. Very tranquil.',
    'Orion’s belt. Three stars, one very old story.',
    'A rooftop across the city where someone is also looking through a telescope. You wave.',
    'Nothing but stars. That’s the point.',
  ];
  return `<p class="px-kicker">Penthouse · telescope</p><h2 id="panel-title">You look through the eyepiece…</h2><p class="px-lede">${esc(sights[(Math.random() * sights.length) | 0])}</p><p class="px-note">Look again for something else.</p>`;
});

// a playable piano: click the keys or use the keyboard (A S D F G H J K, W E T Y U for sharps)
register('piano', () => {
  const el = document.createElement('div');
  const whites = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
  const wk = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
  const blacks = { 1: 'w', 3: 'e', 6: 't', 8: 'y', 10: 'u', 13: 'o', 15: 'p' };
  el.innerHTML = `<p class="px-kicker">Penthouse · piano</p><h2 id="panel-title">Play something.</h2>
    <div class="piano" tabindex="0" autofocus aria-label="Piano. Keys A to semicolon play white keys, W E T Y U O P play black keys.">
      ${whites.map((s, i) => `<button type="button" class="w" data-semi="${s}"><kbd>${wk[i].toUpperCase()}</kbd></button>`).join('')}
      ${Object.entries(blacks).map(([s, k]) => `<button type="button" class="b" data-semi="${s}" style="--i:${whites.indexOf(+s - 1)}"><kbd>${k.toUpperCase()}</kbd></button>`).join('')}
    </div>
    <p class="px-note">Try: <b>G G H G K J</b> … you know the rest.</p>`;
  const hit = (s) => {
    key(+s + 0);
    const b = el.querySelector(`[data-semi="${s}"]`);
    b?.classList.add('down');
    setTimeout(() => b?.classList.remove('down'), 140);
  };
  el.addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-semi]'); if (b) e.preventDefault(), hit(b.dataset.semi); });
  const map = Object.fromEntries([...wk.map((k, i) => [k, whites[i]]), ...Object.entries(blacks).map(([s, k]) => [k, +s])]);
  el.addEventListener('keydown', (e) => { if (e.repeat) return; const s = map[e.key.toLowerCase()]; if (s != null) e.preventDefault(), hit(s); });
  return el;
});

register('nap', (a, g) => {
  const el = document.createElement('div');
  el.innerHTML = `<p class="px-kicker">Penthouse · bed</p><h2 id="panel-title">Take a power nap?</h2><p>Twenty minutes. The city keeps going without you.</p>
    <div class="px-row"><button class="px-btn primary" type="button" data-nap autofocus>Zzz…</button></div>`;
  el.querySelector('[data-nap]').addEventListener('click', () => g.nap());
  return el;
});

register('workstation', () => `<p class="px-kicker">Penthouse · the owner’s desk</p><h2 id="panel-title">Where the work happens.</h2>
  <p>Private notes, half-ideas and the scratchpad live here.</p>
  <div class="px-row"><a class="px-btn primary" href="${href('vault/')}">Private notes (vault) ↗</a><a class="px-btn" href="${href('lab/')}#notebook">Scratchpad ↗</a><a class="px-btn" href="${href('compass/')}">My links ↗</a></div>
  <h3>Right now</h3><ul class="px-list">${site.now.map((n) => `<li><b>${esc(n.label)}</b> ${todo(n.text)}</li>`).join('')}</ul>`);

register('wardrobe', (a, g) => wardrobePanel(g));
