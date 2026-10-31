// ─────────────────────────────────────────────────────────────────────────────
//  HOTEL BUILDER — assembles the building in two passes:
//   1. FLAT: every floor's back-wall art (2D, as floor modules paint it) plus
//      the roof billboard, on a flat canvas (and a flat light canvas).
//   2. ISO: the flat art is sheared onto the back walls, then floors, side
//      walls, slabs, the outer walls, the glass shaft and the roof deck are
//      drawn isometrically. Output: art + additive light + the "front" layer
//      the game draws over the elevator car. Floors register here.
// ─────────────────────────────────────────────────────────────────────────────
import { canvas, R, P, text, glow, mix } from './gfx.js';
import { THEMES } from './themes.js';
import { sign, floorPlane, leftWall, sideX, faceZ, top, box, onFace } from './kit.js';
import { W, H, IW, IH, WALL, OUT_L, IN_L, IN_R, OUT_R, ELV_X0, ELV_X1, SLAB, BEDROCK, FLOORS, TOP, ROOF, DEPTH, SHAFT_Z, ceilY } from './layout.js';
import * as lobby from './floors/lobby.js';
import * as gallery from './floors/gallery.js';
import * as study from './floors/study.js';
import * as pavilion from './floors/pavilion.js';
import * as comms from './floors/comms.js';
import { basement } from './floors/private.js';
import * as penthouse from './floors/penthouse.js';

// floor id → module { paint, lights, paintIso?, lightsIso?, dyn, npcs, objects, props?, doors? }
const MODULES = { basement, lobby, comms, gallery, pavilion, study, penthouse };

const FACADE = '#140a1e';
const FACADE_HI = '#22122e';

export function buildHotel() {
  // ── pass 1: flat back-wall art
  const [flat, a] = canvas(W, H);
  const [flatL, l] = canvas(W, H);
  for (const f of FLOORS) {
    const T = THEMES[f.theme] || THEMES.construction;
    const M = MODULES[f.id];
    if (M) {
      M.paint(a, f);
      M.lights?.(l, f);
    } else paintSealed(a, f, T);
  }
  paintRoofFlat(a, l);

  // ── pass 2: isometric
  const [art, i] = canvas(IW, IH);
  const [light, il] = canvas(IW, IH);
  const [front, fr] = canvas(IW, IH); // drawn over the elevator car each frame
  for (const [dst, src] of [[i, flat], [il, flatL]]) {
    dst.save();
    dst.setTransform(...WALL);
    dst.drawImage(src, 0, 0);
    dst.restore();
  }
  foundation(i);
  for (const f of FLOORS) {
    const T = THEMES[f.theme] || THEMES.construction;
    floorPlane(i, f, T, IN_L, IN_R, f.floorKind || 'plain');
    leftWall(i, f, T, { wainscot: f.wainscot ?? 22 });
    MODULES[f.id]?.paintIso?.(i, f);
    MODULES[f.id]?.lightsIso?.(il, f);
    paintEnvelope(i, il, f, T);
  }
  for (const f of FLOORS) paintShaft(i, f, THEMES[f.theme] || THEMES.construction);
  for (const f of FLOORS) for (const c of [i, fr]) paintShaftFront(c, f, THEMES[f.theme] || THEMES.construction);
  paintRoofIso(i);
  return { art, light, front, modules: MODULES };
}

/** Slab under the floor, the cut outer walls and the open right end. */
function paintEnvelope(i, il, f, T) {
  const below = f.id === 'basement';
  const cutC = below ? '#262030' : FACADE_HI;
  // slab: its cut front + right end
  faceZ(i, f, DEPTH, OUT_L, OUT_R, -SLAB, 0, '#1a1220');
  faceZ(i, f, DEPTH, OUT_L, OUT_R, -1, 0, mix(T.floorHi, '#000', 0.1));
  faceZ(i, f, DEPTH, OUT_L, OUT_R, -SLAB, -SLAB + 2, '#0c0810');
  sideX(i, f, OUT_R, 0, DEPTH, -SLAB, 0, '#120a18');
  top(i, f, IN_R, OUT_R, 0, DEPTH, 0, '#2a2030');
  // left outer wall, cut at the front
  faceZ(i, f, DEPTH, OUT_L, IN_L, 0, f.room, cutC);
  faceZ(i, f, DEPTH, IN_L - 1, IN_L, 0, f.room, mix(T.trim, '#000', 0.4));
  if (!below) {
    faceZ(i, f, DEPTH, OUT_L + 4, OUT_L + 6, -SLAB, f.room, '#29f0ff');
    faceZ(il, f, DEPTH, OUT_L, OUT_L + 10, -SLAB, f.room, 'rgba(41,240,255,0.14)');
  }
  onFace(i, f, OUT_L, DEPTH, f.room, (c) => text(c, f.n, 7, 8, '#8a7aa6'));
}

function foundation(i) {
  const B = FLOORS[0];
  const G = FLOORS.find((f) => f.id === 'lobby');
  // the street outside the entrance, and the earth under it and under the hotel
  top(i, G, OUT_L - 900, OUT_L, -40, DEPTH, 0, '#1e1626');
  for (let x = OUT_L - 900; x < OUT_L; x += 24) top(i, G, x, x + 1, -40, DEPTH, 0, '#2a2034');
  faceZ(i, G, DEPTH, OUT_L - 900, OUT_L, -SLAB, 0, '#2a2030');
  faceZ(i, G, DEPTH, OUT_L - 900, OUT_L, -1200, -SLAB, '#0c0810');
  faceZ(i, B, DEPTH, OUT_L, OUT_R, -SLAB - 1200, -SLAB, '#0c0810');
  faceZ(i, B, DEPTH, OUT_L, OUT_R, -SLAB - BEDROCK, -SLAB, '#0c0810');
  sideX(i, B, OUT_R, 0, DEPTH, -SLAB - BEDROCK, -SLAB, '#08060c');
  for (let x = OUT_L + 8; x < OUT_R; x += 23) faceZ(i, B, DEPTH, x, x + 3, -SLAB - 20 - (x % 9), -SLAB - 18 - (x % 9), '#160f1c');
}

/** Floors that aren't built yet: a closed, dimmed hall (temporary). */
function paintSealed(a, f, T) {
  R(a, f.x0, f.top, f.x1 - f.x0, f.h, T.wallLo);
  for (let x = f.x0; x < f.x1; x += 6) R(a, x, f.top, 3, f.h, mix(T.wallLo, '#000', 0.3));
  f.floorKind = 'plain';
  const locked = f.status === 'locked';
  for (const cx of [380, 1150]) sign(a, locked ? 'LOCKED' : f.name.toUpperCase(), cx, f.top + f.h / 2 - 4, locked ? '#ff3d5a' : T.neonB, 1);
}

/** The glass elevator shaft, per floor: a dark box against the back wall (z 0…SHAFT_Z). */
function paintShaft(i, f, T) {
  const clip = (sx) => ceilY(f, sx);
  top(i, f, ELV_X0, ELV_X1, 0, SHAFT_Z, 0, '#05040a');
  faceZ(i, f, 0, ELV_X0, ELV_X1, 0, f.room, '#0b0814', clip);
  for (const x of [ELV_X0 + 2, ELV_X1 - 3, ELV_X0 + 20, ELV_X1 - 21]) faceZ(i, f, 0, x, x + 1, 0, f.room, '#2a2638', clip);
  sideX(i, f, ELV_X0, 0, SHAFT_Z, 0, f.room, '#0e0a18', clip);
  sideX(i, f, ELV_X1, 0, SHAFT_Z, 0, f.room, 'rgba(160,200,255,0.10)', clip);
}

/** Per floor: the floor and slab in front of the shaft, its glass front and gold posts. */
function paintShaftFront(c, f, T) {
  const clip = (sx) => ceilY(f, sx);
  floorPlane(c, f, T, ELV_X0 - 4, ELV_X1 + DEPTH, f.floorKind || 'plain', SHAFT_Z + 2, DEPTH);
  faceZ(c, f, DEPTH, ELV_X0 - 4, ELV_X1 + DEPTH, -SLAB, 0, '#1a1220');
  faceZ(c, f, DEPTH, ELV_X0 - 4, ELV_X1 + DEPTH, -1, 0, mix(T.floorHi, '#000', 0.1));
  top(c, f, ELV_X0, ELV_X1, SHAFT_Z, SHAFT_Z + 2, 0, T.trim); // threshold
  faceZ(c, f, SHAFT_Z, ELV_X0, ELV_X1, 0, f.room, 'rgba(160,220,255,0.06)', clip);
  for (const x of [ELV_X0 - 4, ELV_X1]) box(c, f, x, x + 4, SHAFT_Z - 4, SHAFT_Z, f.room, { top: T.trim, front: T.trim, side: mix(T.trim, '#000', 0.3) }, clip);
  faceZ(c, f, SHAFT_Z, ELV_X0, ELV_X1, 48, 51, T.trim, clip);
  // call panel
  faceZ(c, f, SHAFT_Z, ELV_X1 + 8, ELV_X1 + 14, 20, 30, '#1a1420');
  faceZ(c, f, SHAFT_Z, ELV_X1 + 10, ELV_X1 + 11, 26, 27, T.neonB);
  faceZ(c, f, SHAFT_Z, ELV_X1 + 10, ELV_X1 + 11, 23, 24, T.neonB);
}

function paintRoofFlat(a, l) {
  const y = TOP;
  R(a, OUT_L, y - 6, OUT_R - OUT_L, 6, '#1e1430'); // back parapet
  R(a, OUT_L, y - 6, OUT_R - OUT_L, 1, '#4a3a6a');
  // billboard
  const bx0 = 300;
  const bx1 = 640;
  for (const px of [bx0 + 30, bx1 - 30]) R(a, px, y - 46, 3, 40, '#2a2040');
  R(a, bx0, y - 92, bx1 - bx0, 48, '#0c0616');
  R(a, bx0, y - 92, bx1 - bx0, 2, '#ff3d9a');
  R(a, bx0, y - 46, bx1 - bx0, 2, '#ff3d9a');
  sign(a, 'CYBERVERSE', (bx0 + bx1) / 2, y - 80, '#ff3d9a', 4, false);
  glow(l, (bx0 + bx1) / 2, y - 68, 200, '#ff3d9a', 0.22);
  // antenna + beacon
  R(a, 1300, y - 120, 2, 114, '#3a2a5a');
  for (let k = 0; k < 110; k += 10) R(a, 1296, y - 10 - k, 10, 1, '#2a2040');
  // water tank
  R(a, 1040, y - 40, 40, 30, '#2a1a3a');
  R(a, 1036, y - 44, 48, 6, '#3a2a4a');
  for (const px of [1044, 1074]) R(a, px, y - 10, 2, 4, '#2a1a3a');
}

function paintRoofIso(i) {
  const RT = { floorA: '#241a34', floorB: '#1e1430', floorHi: '#4a3a6a' };
  floorPlane(i, ROOF, RT, OUT_L, OUT_R, 'plain');
  faceZ(i, ROOF, DEPTH, OUT_L, OUT_R, -SLAB, 0, '#1e1430');
  faceZ(i, ROOF, DEPTH, OUT_L, OUT_R, -1, 0, '#4a3a6a');
  sideX(i, ROOF, OUT_R, 0, DEPTH, -SLAB, 0, '#140c20');
  // front parapet rail + elevator machine room
  faceZ(i, ROOF, DEPTH - 2, OUT_L, OUT_R, 0, 6, 'rgba(74,58,106,0.5)');
  box(i, ROOF, ELV_X0 - 6, ELV_X1 + 6, 0, SHAFT_Z + 4, 26, { top: '#3a2a5a', front: '#1a1028', side: '#140c20', line: '#4a3a6a' });
}

export { MODULES };
