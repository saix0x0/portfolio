// ─────────────────────────────────────────────────────────────────────────────
//  ROOM KIT — reusable architecture & props. Floors pass their own theme T,
//  so shared shapes still wear each room's locked palette.
//  Back-wall art (shell, signs, windows…) is flat 2D: f.top … f.yb, drawn on
//  the flat canvas and sheared onto the back wall. Isometric helpers (floors,
//  side walls, boxes, interior walls) are at the bottom; see layout.js.
// ─────────────────────────────────────────────────────────────────────────────
import { R, P, dither, neon, text, textWidth, hexA, mix, cone, glow, canvas } from './gfx.js';
import { INK } from './themes.js';
import { DEPTH, KX, KY, TILT, OX, IN_L, proj, ceilY } from './layout.js';

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
  // the floor plane and left wall are isometric: the hotel builder draws them
  f.floorKind = floor;
  f.wainscot = wainscot;
}

/** Legacy 2D floor strip (unused by the 3D shell; kept for reference art). */
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

/** Where an interior wall meets the back wall (the wall itself is 3D, drawn per frame by the game). */
export function partition(ctx, f, T, x) {
  R(ctx, x + 4, f.top, 3, f.yb - f.top, hexA('#000000', 0.25));
}

export const DOOR_H = 42;
/**
 * A 3D interior wall at world x with a doorway (z gap0…gap1), as three
 * depth-sortable pieces so people can walk through it. open: 0..1
 */
export function wallPieces(f, T, x, gap0, gap1, getOpen) {
  const x0 = x - 4;
  const x1 = x + 4;
  const face = mix(T.wall, '#000000', 0.12);
  const cut = mix(T.wall, '#000000', 0.5);
  const cap = mix(T.wall, '#ffffff', 0.1);
  const clip = (sx) => ceilY(f, sx);
  /** One stretch of wall: the face we see (themed like the back wall) + its cut front. */
  const seg = (ctx, z0, z1, hBase = 0) => {
    sideX(ctx, f, x1, z0, z1, hBase, f.room, face, clip);
    if (!hBase) {
      sideX(ctx, f, x1, z0, z1, 0, 18, mix(T.wallLo, '#000000', 0.1));
      sideX(ctx, f, x1, z0, z1, 18, 20, T.trim);
    }
    sideX(ctx, f, x1, z0, z0 + 2, hBase, f.room, mix(face, '#000000', 0.3), clip);
    if (z1 === DEPTH) {
      faceZ(ctx, f, DEPTH, x0, x1, 0, f.room, cut, clip);
      faceZ(ctx, f, DEPTH, x1 - 1, x1, 0, f.room, cap, clip);
    }
  };
  return [
    { x0, x1, z0: 0, z1: gap0, draw: (ctx) => seg(ctx, 0, gap0) },
    {
      x0, x1, z0: gap0, z1: gap1, solid: false,
      draw: (ctx) => {
        seg(ctx, gap0, gap1, DOOR_H);
        // door frame + a glass panel that slides up into the lintel
        sideX(ctx, f, x1, gap0, gap1, DOOR_H - 2, DOOR_H, T.trim);
        sideX(ctx, f, x1, gap0, gap0 + 2, 0, DOOR_H, T.trim);
        sideX(ctx, f, x1, gap1 - 2, gap1, 0, DOOR_H, T.trim);
        const vis = Math.round(DOOR_H * (1 - getOpen()));
        if (vis > 1) {
          sideX(ctx, f, x1, gap0 + 2, gap1 - 2, DOOR_H - vis, DOOR_H - 2, hexA(mix(T.neonA, '#000000', 0.6), 0.75));
          sideX(ctx, f, x1, gap0 + 2, gap1 - 2, DOOR_H - vis, DOOR_H - vis + 1, T.neonA);
        }
      },
    },
    { x0, x1, z0: gap1, z1: DEPTH, draw: (ctx) => seg(ctx, gap1, DEPTH) },
  ];
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

// ── isometric helpers ─────────────────────────────────────────────────────────
// Faces are filled one screen column at a time, so edges stay pixel-crisp.

/** Fill a convex polygon [[sx, sy]…] column by column. clip(sx) → min y. */
export function quad(ctx, pts, color, clip) {
  let minx = Infinity;
  let maxx = -Infinity;
  for (const [x] of pts) (minx = Math.min(minx, x)), (maxx = Math.max(maxx, x));
  ctx.fillStyle = color;
  const n = pts.length;
  for (let x = Math.round(minx); x < Math.round(maxx); x++) {
    const cx = x + 0.5;
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % n];
      if (ax === bx || cx < Math.min(ax, bx) || cx > Math.max(ax, bx)) continue;
      const y = ay + ((by - ay) * (cx - ax)) / (bx - ax);
      lo = Math.min(lo, y);
      hi = Math.max(hi, y);
    }
    if (lo > hi) continue;
    if (clip) lo = Math.max(lo, clip(cx));
    const y0 = Math.round(lo);
    const y1 = Math.round(hi);
    if (y1 > y0) ctx.fillRect(x, y0, 1, y1 - y0);
  }
}

/** Vertical face at constant x (a side wall), depths z0..z1, heights h0..h1. */
export function sideX(ctx, f, x, z0, z1, h0, h1, color, clip) {
  quad(ctx, [proj(f, x, z0, h0), proj(f, x, z1, h0), proj(f, x, z1, h1), proj(f, x, z0, h1)], color, clip);
}
/** Vertical face at constant depth z (a front/back face), x0..x1, heights h0..h1. */
export function faceZ(ctx, f, z, x0, x1, h0, h1, color, clip) {
  quad(ctx, [proj(f, x0, z, h0), proj(f, x1, z, h0), proj(f, x1, z, h1), proj(f, x0, z, h1)], color, clip);
}
/** Horizontal face at height h. */
export function top(ctx, f, x0, x1, z0, z1, h, color, clip) {
  quad(ctx, [proj(f, x0, z0, h), proj(f, x1, z0, h), proj(f, x1, z1, h), proj(f, x0, z1, h)], color, clip);
}
/** Old name, kept for callers: a vertical plane at world x. */
export const vplane = (ctx, f, x, z0, z1, h0, h1, color) => sideX(ctx, f, x, z0, z1, h0, h1, color);

/**
 * Draw flat pixel art onto a face at constant depth z (the front of a prop,
 * a sign, a screen). fn(ctx) draws with (0, 0) = the face's top-left at
 * world (x, z, h); +x runs along the face, +y runs down.
 */
const [faceCv, faceCtx] = canvas(320, 160);
const FM = 40; // margin so art may spill above/left of the face origin
export function onFace(ctx, f, x, z, h, fn) {
  // draw flat, then shear with nearest-neighbour sampling (stays crisp)
  faceCtx.setTransform(1, 0, 0, 1, 0, 0);
  faceCtx.clearRect(0, 0, faceCv.width, faceCv.height);
  faceCtx.translate(FM, FM);
  fn(faceCtx);
  const [sx, sy] = proj(f, x, z, h);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.transform(1, TILT, 0, 1, sx, sy);
  ctx.drawImage(faceCv, -FM, -FM);
  ctx.restore();
}

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
/** Floor plane x0..x1 between depths z0..z1: isometric tiles, darker toward the back. */
export function floorPlane(ctx, f, T, x0, x1, kind = 'checker', z0 = 0, z1 = DEPTH) {
  const c = [proj(f, x0, z0), proj(f, x1, z0), proj(f, x1, z1), proj(f, x0, z1)];
  const bx0 = Math.floor(Math.min(...c.map((p) => p[0])));
  const bx1 = Math.ceil(Math.max(...c.map((p) => p[0])));
  const by0 = Math.floor(Math.min(...c.map((p) => p[1])));
  const by1 = Math.ceil(Math.max(...c.map((p) => p[1])));
  const w = bx1 - bx0;
  const h = by1 - by0;
  if (w <= 0 || h <= 0) return;
  const img = ctx.getImageData(bx0, by0, w, h);
  const d = img.data;
  const A = rgb(T.floorA);
  const B = rgb(T.floorB);
  const Hi = rgb(T.floorHi);
  for (let py = 0; py < h; py++) {
    const b = (by0 + py + 0.5 - f.yb) * 2; // x + z
    for (let px = 0; px < w; px++) {
      const a = bx0 + px + 0.5 - OX; // x − z
      const x = (a + b) / 2;
      const z = (b - a) / 2;
      if (x < x0 || x >= x1 || z < z0 || z >= z1) continue;
      const ix = Math.floor(x / 16);
      const iz = Math.floor(z / 16);
      let on;
      if (kind === 'checker') on = (ix + iz) & 1;
      else if (kind === 'planks') on = z % 8 < 1 || (x + (Math.floor(z / 8) % 3) * 21) % 64 < 1 ? 0 : 1;
      else on = (ix + iz) % 4 === 0 ? 0 : 1;
      let col = on ? A : B;
      if (z1 - z < 1.5 && z1 === DEPTH) col = Hi;
      const shade = 1 - 0.34 * (1 - z / DEPTH);
      const k = (py * w + px) * 4;
      d[k] = col[0] * shade;
      d[k + 1] = col[1] * shade;
      d[k + 2] = col[2] * shade;
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, bx0, by0);
}

/** The room's left wall (inner face) — the side you see into. */
export function leftWall(ctx, f, T, { wainscot = 22 } = {}) {
  const x = f.x0;
  const clip = (sx) => ceilY(f, sx);
  sideX(ctx, f, x, 0, DEPTH, 0, f.room, mix(T.wallLo, '#000000', 0.1), clip);
  if (wainscot) {
    sideX(ctx, f, x, 0, DEPTH, 0, wainscot, mix(T.wallLo, '#000000', 0.32));
    sideX(ctx, f, x, 0, DEPTH, wainscot, wainscot + 2, T.trim);
  }
  for (let z = 16; z < DEPTH; z += 16) sideX(ctx, f, x, z, z + 2, wainscot + 2, f.room, mix(T.wallLo, '#000000', 0.28), clip);
  sideX(ctx, f, x, 0, 2, 0, f.room, mix(T.wallLo, '#000000', 0.5), clip); // back corner
}

/** Cut a doorway into the left wall (shows the city through it). */
export function leftOpening(ctx, f, z0, z1, h) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  sideX(ctx, f, f.x0, z0, z1, 0, h, '#000');
  ctx.restore();
}

/**
 * An extruded box (props, counters, walls). Draws the top, the front (z = z1)
 * and the right side (x = x1): the faces this camera sees. hBase lifts the bottom.
 */
export function box(ctx, f, x0, x1, z0, z1, h, c, clip, hBase = 0) {
  top(ctx, f, x0, x1, z0, z1, h, c.top, clip);
  sideX(ctx, f, x1, z0, z1, hBase, h, c.side, clip);
  faceZ(ctx, f, z1, x0, x1, hBase, h, c.front, clip);
  if (c.line) faceZ(ctx, f, z1, x0, x1, h - 1, h, c.line, clip);
}

/** Pre-render a prop to a sprite so it can be depth-sorted cheaply each frame. */
export function bake(f, x0, x1, z0, z1, h, paint) {
  const pts = [proj(f, x0, z1, 0), proj(f, x1, z1, 0), proj(f, x1, z0, h), proj(f, x0, z0, h), proj(f, x0, z1, h), proj(f, x1, z0, 0)];
  const sx0 = Math.floor(Math.min(...pts.map((p) => p[0]))) - 24;
  const sy0 = Math.floor(Math.min(...pts.map((p) => p[1]))) - 48;
  const sx1 = Math.ceil(Math.max(...pts.map((p) => p[0]))) + 24;
  const sy1 = Math.ceil(Math.max(...pts.map((p) => p[1]))) + 4;
  const [cv, c] = canvas(sx1 - sx0, sy1 - sy0);
  c.translate(-sx0, -sy0);
  paint(c);
  return (ctx) => ctx.drawImage(cv, sx0, sy0);
}
