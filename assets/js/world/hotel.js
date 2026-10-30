// ─────────────────────────────────────────────────────────────────────────────
//  HOTEL BUILDER — assembles the building: exterior shell, slabs, glass
//  elevator shaft, roof, ground, and every floor module, into two
//  pre-rendered canvases (art + additive light). Floors register here.
// ─────────────────────────────────────────────────────────────────────────────
import { canvas, R, P, text, glow, mix } from './gfx.js';
import { THEMES, INK } from './themes.js';
import { sign } from './kit.js';
import { W, H, OUT_L, IN_L, IN_R, OUT_R, ELV_X0, ELV_X1, SLAB, FLOORS, GROUND, TOP } from './layout.js';
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

  // ground (cross-section of earth around the basement)
  R(a, 0, GROUND + SLAB, W, H - GROUND - SLAB, '#0c0810');
  for (let y = GROUND + SLAB + 6; y < H; y += 9) for (let x = (y * 7) % 23; x < W; x += 23) R(a, x, y, 3, 2, '#160f1c');
  R(a, 0, GROUND, W, SLAB, '#2a2030'); // sidewalk / ground slab
  R(a, 0, GROUND, W, 1, '#4a3a58');

  // exterior facade
  R(a, OUT_L, TOP, IN_L - OUT_L, GROUND - TOP, FACADE);
  R(a, IN_R, TOP, OUT_R - IN_R, GROUND - TOP, FACADE);
  for (const x of [OUT_L + 3, OUT_R - 5]) R(a, x, TOP, 2, GROUND - TOP, '#29f0ff');
  for (const x of [OUT_L + 3, OUT_R - 5]) glowStrip(l, x, TOP, GROUND - TOP);

  for (const f of FLOORS) {
    const T = THEMES[f.theme] || THEMES.construction;
    // slab under this floor
    R(a, OUT_L, f.y, OUT_R - OUT_L, SLAB, '#1a1220');
    R(a, OUT_L, f.y, OUT_R - OUT_L, 1, mix(T.floorHi, '#000', 0.2));
    R(a, OUT_L, f.y + SLAB - 2, OUT_R - OUT_L, 2, '#0c0810');
    for (let x = OUT_L + 20; x < OUT_R; x += 60) P(a, x, f.y + 5, '#2e2438');
    // facade: floor plaque + small windows
    text(a, f.n, OUT_L + 6, f.top + 6, '#8a7aa6');
    text(a, f.n, OUT_R - 14, f.top + 6, '#8a7aa6');
    if (f.id !== 'basement') for (let wy = f.top + 20; wy < f.y - 30; wy += 30) {
      a.clearRect(OUT_L + 7, wy, 6, 14);
      a.clearRect(IN_R + 7, wy, 6, 14);
    }

    const M = MODULES[f.id];
    if (M) {
      M.paint(a, f);
      M.lights?.(l, f);
    } else paintSealed(a, l, f, T);
  }
  // basement walls are concrete, not facade
  const B = FLOORS[0];
  R(a, OUT_L, B.top - SLAB, IN_L - OUT_L, B.h + SLAB, '#1a1620');
  R(a, IN_R, B.top - SLAB, OUT_R - IN_R, B.h + SLAB, '#1a1620');

  paintShaft(a, l);
  paintRoof(a, l);
  return { art, light, modules: MODULES };
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
  R(a, f.x0, f.y - 8, f.x1 - f.x0, 8, T.floorB);
  const locked = f.status === 'locked';
  for (const cx of [380, 1150]) sign(a, locked ? 'LOCKED' : f.name.toUpperCase(), cx, f.top + f.h / 2 - 4, locked ? '#ff3d5a' : T.neonB, 1);
}

function paintShaft(a, l) {
  const top = FLOORS[FLOORS.length - 1].top;
  const bot = FLOORS[0].y;
  // glass tube: clear, then dark tinted interior with rails & cables
  R(a, ELV_X0, top, ELV_X1 - ELV_X0, bot - top, '#07050d');
  for (let y = top; y < bot; y += 4) R(a, ELV_X0 + 2, y, 1, 2, '#1e1a2e');
  for (let y = top; y < bot; y += 4) R(a, ELV_X1 - 3, y, 1, 2, '#1e1a2e');
  R(a, ELV_X0 + 20, top, 1, bot - top, '#2a2638');
  R(a, ELV_X1 - 21, top, 1, bot - top, '#2a2638');
  // frame posts (gold-ish) per floor + floor label
  for (const f of FLOORS) {
    const T = THEMES[f.theme] || THEMES.construction;
    R(a, ELV_X0 - 4, f.top + 8, 4, f.h - 8, T.trim);
    R(a, ELV_X1, f.top + 8, 4, f.h - 8, T.trim);
    R(a, ELV_X0 - 4, f.top + 8, ELV_X1 - ELV_X0 + 8, 3, T.trim);
    R(a, ELV_X0 - 4, f.y - 8, 4, 8, INK);
    R(a, ELV_X1, f.y - 8, 4, 8, INK);
    // call panel
    R(a, ELV_X1 + 8, f.y - 34, 6, 10, '#1a1420');
    P(a, ELV_X1 + 10, f.y - 31, T.neonB);
    P(a, ELV_X1 + 10, f.y - 28, T.neonB);
  }
  // glass sheen
  a.fillStyle = 'rgba(160,200,255,0.05)';
  a.fillRect(ELV_X0, top, ELV_X1 - ELV_X0, bot - top);
  // machine room on the roof
  R(a, ELV_X0 - 6, TOP - 26, ELV_X1 - ELV_X0 + 12, 26, '#1a1028');
  R(a, ELV_X0 - 6, TOP - 26, ELV_X1 - ELV_X0 + 12, 2, '#3a2a5a');
}

function paintRoof(a, l) {
  const y = TOP;
  R(a, OUT_L - 4, y - 6, OUT_R - OUT_L + 8, 6, '#1e1430');
  R(a, OUT_L - 4, y - 6, OUT_R - OUT_L + 8, 1, '#4a3a6a');
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
