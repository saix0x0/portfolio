// ─────────────────────────────────────────────────────────────────────────────
//  ROOM KIT — reusable architecture & props. Floors pass their own theme T,
//  so shared shapes still wear each room's locked palette.
//  Convention: f.y = walk line, f.top = ceiling, floor band = f.y-8 … f.y
// ─────────────────────────────────────────────────────────────────────────────
import { R, P, dither, neon, text, textWidth, hexA, mix, cone, glow } from './gfx.js';
import { INK } from './themes.js';

/** Back wall + wainscot + ceiling + floor band for x0..x1. */
export function shell(ctx, f, T, x0, x1, { panel = 40, wainscot = 22, floor = 'checker' } = {}) {
  const w = x1 - x0;
  R(ctx, x0, f.top, w, f.h, T.wall);
  if (panel) for (let x = x0 + panel; x < x1; x += panel) R(ctx, x, f.top + 10, 2, f.h - 10 - wainscot - 8, T.wall2);
  // crown + ceiling
  R(ctx, x0, f.top, w, 7, T.ceil);
  R(ctx, x0, f.top + 7, w, 1, T.trimLo);
  R(ctx, x0, f.top + 8, w, 2, T.trim);
  // wainscot
  if (wainscot) {
    const wy = f.y - 8 - wainscot;
    R(ctx, x0, wy, w, wainscot, T.wallLo);
    R(ctx, x0, wy, w, 2, T.trim);
    R(ctx, x0, wy + 2, w, 1, T.trimLo);
    for (let x = x0 + 10; x < x1; x += 20) R(ctx, x, wy + 7, 8, wainscot - 11, mix(T.wallLo, T.wall, 0.35));
  }
  floorBand(ctx, f, T, x0, x1, floor);
}

export function floorBand(ctx, f, T, x0, x1, kind = 'checker') {
  const y = f.y - 8;
  for (let x = x0; x < x1; x += 8)
    for (let j = 0; j < 2; j++) {
      const a = kind === 'checker' ? ((x / 8 + j) & 1) : kind === 'planks' ? ((x / 8) % 3 === 0 ? 1 : 0) : 0;
      R(ctx, x, y + j * 4, 8, 4, a ? T.floorA : T.floorB);
    }
  R(ctx, x0, y, x1 - x0, 1, T.floorHi);
  if (kind === 'planks') for (let x = x0; x < x1; x += 24) R(ctx, x, y + 1, 1, 7, T.floorB);
}

/** Cut-through interior wall with a doorway (opening 34 px tall). */
export function partition(ctx, f, T, x) {
  const lintel = f.y - 8 - 42;
  R(ctx, x - 4, f.top, 8, lintel - f.top, mix(T.wall, '#000000', 0.45));
  R(ctx, x - 4, f.top, 1, lintel - f.top, T.trimLo);
  R(ctx, x + 3, f.top, 1, lintel - f.top, T.trimLo);
  R(ctx, x - 5, lintel, 10, 3, T.trim);
  // door track
  R(ctx, x - 5, f.y - 8, 10, 1, T.trimLo);
}

/** A sliding door panel (drawn every frame). open: 0..1 */
export function door(ctx, f, T, x, open, color) {
  const h = 42;
  const lintel = f.y - 8 - h;
  const visible = Math.round(h * (1 - open));
  if (visible <= 0) return;
  R(ctx, x - 3, lintel + 3, 6, visible - 3, color || mix(T.wall2, '#000000', 0.2));
  R(ctx, x - 3, lintel + 3, 1, visible - 3, T.trimLo);
  R(ctx, x - 1, lintel + 3 + Math.min(visible - 4, 14), 2, 3, T.neonA);
}

/** Window hole showing the Skyview. */
export function windowHole(ctx, x, y, w, h, frame, cols = 3) {
  ctx.clearRect(x, y, w, h);
  R(ctx, x - 3, y - 3, w + 6, 3, frame);
  R(ctx, x - 3, y + h, w + 6, 4, frame);
  R(ctx, x - 3, y, 3, h, frame);
  R(ctx, x + w, y, 3, h, frame);
  for (let i = 1; i < cols; i++) R(ctx, x + Math.round((w * i) / cols) - 1, y, 2, h, frame);
  ctx.fillStyle = 'rgba(140,180,255,0.05)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 4; i < w; i += 29) for (let j = 0; j < 14 && j < h; j++) ctx.fillRect(x + i + j, y + h - 16 - j + 2, 1, 1);
}

/** Centered neon sign, optional backing plate. */
export function sign(ctx, str, cx, y, color, scale = 1, plate = true) {
  const w = textWidth(str, scale);
  const x = Math.round(cx - w / 2);
  if (plate) {
    R(ctx, x - 4, y - 3, w + 8, 5 * scale + 6, '#0a0612');
    R(ctx, x - 4, y - 3, w + 8, 1, hexA(color, 0.6));
  }
  neon(ctx, str, x, y, color, scale, 4 + scale * 2);
}

/** Pendant / ceiling lamp; returns the light anchor. */
export function lamp(ctx, x, top, T, drop = 10) {
  R(ctx, x, top + 10, 1, drop, T.trimLo);
  R(ctx, x - 5, top + 10 + drop, 11, 3, T.trim);
  R(ctx, x - 3, top + 13 + drop, 7, 2, T.light);
  return [x, top + 15 + drop];
}

export function lightCone(lctx, x, y, f, color, wTop = 10, wBot = 70, a = 0.16) {
  cone(lctx, x, y, wTop, wBot, f.y - 8 - y, color, a);
}

/** Potted neon palm (lobby signature). */
export function neonPalm(ctx, x, y, frond = '#ff3d9a', trunk = '#5a2a4a') {
  R(ctx, x - 7, y - 12, 14, 12, '#2a1030');
  R(ctx, x - 7, y - 12, 14, 2, '#d4a64e');
  for (let i = 0; i < 46; i += 3) R(ctx, x - 1 + Math.round(Math.sin(i / 9) * 2), y - 14 - i, 3, 3, i % 6 ? trunk : mix(trunk, '#000', 0.3));
  const top = y - 62;
  const leaves = [[-1, 0.2], [-0.8, -0.5], [-0.3, -0.9], [0.3, -0.9], [0.8, -0.5], [1, 0.2], [0.55, 0.6], [-0.55, 0.6]];
  for (const [dx, dy] of leaves) {
    for (let k = 0; k < 18; k++) {
      const t = k / 18;
      const px = x + dx * 26 * t;
      const py = top + dy * 14 * t + 18 * t * t;
      R(ctx, px, py, 2, 2, frond);
      if (k % 3 === 0) R(ctx, px + (dx > 0 ? -1 : 1), py + 2, 1, 2, mix(frond, '#ffffff', 0.25));
    }
  }
}

export function plant(ctx, x, y, leaf = '#3a8a4a', pot = '#5a3a2a') {
  R(ctx, x - 5, y - 9, 10, 9, pot);
  R(ctx, x - 6, y - 10, 12, 2, mix(pot, '#ffffff', 0.15));
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.35;
    for (let k = 0; k < 9; k++) P(ctx, x + Math.cos(a) * k * 1.4, y - 11 + Math.sin(a) * k * 1.6, k > 6 ? mix(leaf, '#a6ff6b', 0.3) : leaf);
  }
}

/** Monitor / screen bezel. Returns inner rect [x,y,w,h]. */
export function screen(ctx, x, y, w, h, bezel = '#1a1a26', stand = true) {
  R(ctx, x - 2, y - 2, w + 4, h + 4, INK);
  R(ctx, x - 1, y - 1, w + 2, h + 2, bezel);
  R(ctx, x, y, w, h, '#05060c');
  if (stand) {
    R(ctx, x + w / 2 - 1, y + h + 2, 3, 4, bezel);
    R(ctx, x + w / 2 - 5, y + h + 6, 11, 1, bezel);
  }
  return [x, y, w, h];
}

/** Sofa (seat height ~10). */
export function sofa(ctx, x, y, w, c, cHi) {
  R(ctx, x, y - 26, w, 12, c);
  R(ctx, x, y - 26, w, 2, cHi);
  R(ctx, x - 4, y - 18, 6, 14, cHi);
  R(ctx, x + w - 2, y - 18, 6, 14, cHi);
  R(ctx, x, y - 14, w, 8, cHi);
  R(ctx, x, y - 8, w, 2, mix(c, '#000', 0.4));
  R(ctx, x, y - 6, 2, 4, INK);
  R(ctx, x + w - 2, y - 6, 2, 4, INK);
  for (let i = x + w / 3; i < x + w - 4; i += w / 3) R(ctx, i, y - 25, 1, 10, mix(c, '#000', 0.3));
}

export function table(ctx, x, y, w, top, leg) {
  R(ctx, x, y - 16, w, 2, top);
  R(ctx, x + 2, y - 14, 2, 10, leg);
  R(ctx, x + w - 4, y - 14, 2, 10, leg);
}

export function stool(ctx, x, y, seat = '#ff3d9a', leg = '#8a86a6') {
  R(ctx, x - 4, y - 18, 9, 3, seat);
  R(ctx, x, y - 15, 1, 10, leg);
  R(ctx, x - 3, y - 6, 7, 1, leg);
}

export { glow, neon, text, textWidth, dither, R, P, mix, hexA };
