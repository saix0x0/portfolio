// ─────────────────────────────────────────────────────────────────────────────
//  HOTEL BUILDER — assembles the building: exterior shell, slabs, glass
//  elevator shaft, roof, ground, and every floor module, into two
//  pre-rendered canvases (art + additive light). Floors register here.
// ─────────────────────────────────────────────────────────────────────────────
import { canvas, R, P, text, glow, mix } from './gfx.js';
import { THEMES, INK } from './themes.js';
import { sign, floorPlane, vplane, box } from './kit.js';
import { W, H, OUT_L, IN_L, IN_R, OUT_R, ELV_X0, ELV_X1, SLAB, FLOORS, GROUND, TOP, ROOF_FRONT, DEPTH, DX, DY, KX, KY, SHAFT_Z } from './layout.js';
import * as lobby from './floors/lobby.js';
import * as gallery from './floors/gallery.js';
import * as study from './floors/study.js';
import * as pavilion from './floors/pavilion.js';
import * as comms from './floors/comms.js';
import { basement, penthouse } from './floors/private.js';

// floor id → module { paint, lights, dyn, npcs, objects }
const MODULES = { basement, lobby, comms, gallery, pavilion, study, penthouse };

const FACADE = '#140a1e';
const FACADE_HI = '#22122e';

export function buildHotel() {
  const [art, a] = canvas(W, H);
  const [light, l] = canvas(W, H);
  const [front, fr] = canvas(W, H); // drawn over the elevator car each frame

  // ground (cross-section of earth around the basement) + street
  R(a, 0, GROUND + SLAB, W, H - GROUND - SLAB, '#0c0810');
  for (let y = GROUND + SLAB + 6; y < H; y += 9) for (let x = (y * 7) % 23; x < W; x += 23) R(a, x, y, 3, 2, '#160f1c');

  for (const f of FLOORS) {
    const T = THEMES[f.theme] || THEMES.construction;
    const M = MODULES[f.id];
    if (M) {
      M.paint(a, f);
      M.lights?.(l, f);
    } else paintSealed(a, l, f, T);
    paintEnvelope(a, l, f, T);
  }

  paintShaft(a);
  for (const f of FLOORS) for (const c of [a, fr]) paintShaftFront(c, f, THEMES[f.theme] || THEMES.construction);
  paintRoof(a, l);
  return { art, light, front, modules: MODULES };
}

/** Slab under the floor, the cut-away outer walls and the right-hand facade. */
function paintEnvelope(a, l, f, T) {
  const below = f.id === 'basement';
  const wallC = below ? '#1a1620' : FACADE;
  const cutC = below ? '#262030' : FACADE_HI;
  // slab front (the cut edge of the floor) — runs the full width
  slabBand(a, f.front, T);
  // left outer wall, cut at the front
  R(a, OUT_L - DX, f.top, IN_L - OUT_L, f.front - f.top, cutC);
  R(a, IN_L - DX - 1, f.top, 1, f.front - f.top, mix(T.trim, '#000', 0.4));
  // right outer wall: cut face + the outside of the building
  vplane(a, f, OUT_R, 0, DEPTH, -SLAB, f.room, wallC);
  R(a, IN_R - DX, f.top, OUT_R - IN_R, f.front - f.top, cutC);
  R(a, IN_R - DX, f.top, 1, f.front - f.top, mix(T.trim, '#000', 0.4));
  if (!below) {
    for (const x of [OUT_L - DX + 4, OUT_R - DX - 6]) R(a, x, f.top, 2, f.front + SLAB - f.top, '#29f0ff');
    for (const x of [OUT_L - DX + 4, OUT_R - DX - 6]) glowStrip(l, x, f.top, f.front + SLAB - f.top);
    // little windows on the outside face
    for (let z = 10; z < DEPTH - 6; z += 16) for (let h = 30; h < f.room - 30; h += 34) vplane(a, f, OUT_R, z, z + 8, h, h + 14, '#ffb347');
  }
  text(a, f.n, OUT_L - DX + 7, f.top + 6, '#8a7aa6');
  text(a, f.n, IN_R - DX + 7, f.top + 6, '#8a7aa6');
}

function slabBand(a, y, T) {
  R(a, OUT_L - DX, y, OUT_R - OUT_L, SLAB, '#1a1220');
  R(a, OUT_L - DX, y, OUT_R - OUT_L, 1, mix(T.floorHi, '#000', 0.1));
  R(a, OUT_L - DX, y + SLAB - 2, OUT_R - OUT_L, 2, '#0c0810');
  for (let x = OUT_L; x < OUT_R; x += 60) P(a, x, y + 5, '#2e2438');
}

function glowStrip(l, x, y, h) {
  const g = l.createLinearGradient(x - 8, 0, x + 10, 0);
  g.addColorStop(0, 'rgba(41,240,255,0)');
  g.addColorStop(0.5, 'rgba(41,240,255,0.18)');
  g.addColorStop(1, 'rgba(41,240,255,0)');
  l.fillStyle = g;
  l.fillRect(x - 8, y, 18, h);
}

/** Floors that aren't built yet: a closed, dimmed hall (temporary). */
function paintSealed(a, l, f, T) {
  R(a, f.x0, f.top, f.x1 - f.x0, f.h, T.wallLo);
  for (let x = f.x0; x < f.x1; x += 6) R(a, x, f.top, 3, f.h, mix(T.wallLo, '#000', 0.3));
  floorPlane(a, f, T, f.x0, f.x1, 'plain');
  const locked = f.status === 'locked';
  for (const cx of [380, 1150]) sign(a, locked ? 'LOCKED' : f.name.toUpperCase(), cx, f.top + f.h / 2 - 4, locked ? '#ff3d5a' : T.neonB, 1);
}

/** The glass elevator shaft: a tall box against the back wall (z 0…SHAFT_Z). */
function paintShaft(a) {
  const topF = FLOORS[FLOORS.length - 1];
  const bot = FLOORS[0];
  const w = ELV_X1 - ELV_X0;
  for (let z = 0; z <= SHAFT_Z; z += 2) {
    const x = Math.round(ELV_X0 - z * KX);
    const y0 = Math.max(topF.top, topF.yb - topF.room + z * KY);
    const y1 = bot.yb + z * KY;
    R(a, x, y0, w, y1 - y0, z === 0 ? '#0b0814' : '#07050d');
  }
  const y0 = topF.top;
  const y1 = bot.yb;
  // back rails & cable runs
  for (let y = y0; y < y1; y += 4) R(a, ELV_X0 + 2, y, 1, 2, '#1e1a2e');
  for (let y = y0; y < y1; y += 4) R(a, ELV_X1 - 3, y, 1, 2, '#1e1a2e');
  R(a, ELV_X0 + 20, y0, 1, y1 - y0, '#2a2638');
  R(a, ELV_X1 - 21, y0, 1, y1 - y0, '#2a2638');
  // right glass side
  for (let z = 0; z < SHAFT_Z; z += 2) {
    a.fillStyle = 'rgba(160,200,255,0.07)';
    a.fillRect(Math.round(ELV_X1 - z * KX), y0, 1, y1 - y0 + z * KY);
  }
  // machine room on the roof
  const roof = { yb: TOP };
  box(a, roof, ELV_X0 - 6, ELV_X1 + 6, 0, SHAFT_Z + 4, 26, { top: '#3a2a5a', front: '#1a1028', side: '#140c20', line: '#4a3a6a' });
}

/** Per floor: the floor and slab in front of the shaft, the glass front and its posts. */
function paintShaftFront(c, f, T) {
  floorPlane(c, f, T, ELV_X0 - 2, ELV_X1 + DX + 6, f.floorKind || 'plain', SHAFT_Z + 2, DEPTH);
  // threshold
  R(c, Math.round(ELV_X0 - (SHAFT_Z + 2) * KX), f.yb + (SHAFT_Z + 2) * KY, ELV_X1 - ELV_X0, 1, T.trim);
  const sx0 = Math.round(ELV_X0 - SHAFT_Z * KX);
  const sx1 = Math.round(ELV_X1 - SHAFT_Z * KX);
  const base = f.yb + SHAFT_Z * KY;
  c.fillStyle = 'rgba(160,220,255,0.05)';
  c.fillRect(sx0, f.top, sx1 - sx0, base - f.top);
  // gold frame posts + header
  R(c, sx0 - 4, f.top, 4, base - f.top, T.trim);
  R(c, sx1, f.top, 4, base - f.top, T.trim);
  R(c, sx0 - 4, f.top, 1, base - f.top, mix(T.trim, '#fff', 0.3));
  R(c, sx0 - 4, base - 50, sx1 - sx0 + 8, 3, T.trim);
  // call panel
  R(c, sx1 + 8, base - 30, 6, 10, '#1a1420');
  P(c, sx1 + 10, base - 27, T.neonB);
  P(c, sx1 + 10, base - 24, T.neonB);
  // the slab in front, over the whole shaft column
  c.save();
  c.beginPath();
  c.rect(sx0 - 8, f.front, sx1 - sx0 + DX + 20, SLAB);
  c.clip();
  slabBand(c, f.front, T);
  c.restore();
}

function paintRoof(a, l) {
  const y = TOP;
  // roof deck (seen from above) + its cut edge + parapet
  const roof = { yb: TOP };
  const RT = { floorA: '#241a34', floorB: '#1e1430', floorHi: '#4a3a6a' };
  floorPlane(a, roof, RT, OUT_L, OUT_R, 'plain');
  R(a, OUT_L - DX, ROOF_FRONT, OUT_R - OUT_L, SLAB, '#1e1430');
  R(a, OUT_L - DX, ROOF_FRONT, OUT_R - OUT_L, 1, '#4a3a6a');
  R(a, OUT_L, y - 6, OUT_R - OUT_L, 6, '#1e1430');
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

export { MODULES };
