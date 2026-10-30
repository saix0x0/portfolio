// ─────────────────────────────────────────────────────────────────────────────
//  PIXEL GFX — tiny drawing kit used by every floor painter.
//  All coordinates are art pixels. Keep shapes on integer pixels.
// ─────────────────────────────────────────────────────────────────────────────

// 3×5 bitmap font (uppercase, digits, punctuation). Rows separated by |. Advance = 4px.
const ROWS = {
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##', D: '##.|#.#|#.#|#.#|##.',
  E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..', G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#',
  I: '###|.#.|.#.|.#.|###', J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#.#|###|###|#.#|#.#', N: '##.|#.#|#.#|#.#|#.#', O: '.#.|#.#|#.#|#.#|.#.', P: '##.|#.#|##.|#..|#..',
  Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#', S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.',
  U: '#.#|#.#|#.#|#.#|###', V: '#.#|#.#|#.#|#.#|.#.', W: '#.#|#.#|###|###|#.#', X: '#.#|#.#|.#.|#.#|#.#',
  Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '##.|..#|.#.|#..|###', 3: '##.|..#|.#.|..#|##.',
  4: '#.#|#.#|###|..#|..#', 5: '###|#..|##.|..#|##.', 6: '.##|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.',
  8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|##.',
  '-': '...|...|###|...|...', '.': '...|...|...|...|.#.', '!': '.#.|.#.|.#.|...|.#.', '?': '##.|..#|.#.|...|.#.',
  ':': '...|.#.|...|.#.|...', '/': '..#|..#|.#.|#..|#..', '>': '#..|.#.|..#|.#.|#..', '<': '..#|.#.|#..|.#.|..#',
  '[': '##.|#..|#..|#..|##.', ']': '.##|..#|..#|..#|.##', "'": '.#.|.#.|...|...|...', '&': '.#.|#.#|.#.|#.#|.##',
  '+': '...|.#.|###|.#.|...', '^': '.#.|#.#|...|...|...', ' ': '...|...|...|...|...', '·': '...|...|.#.|...|...',
  '*': '#.#|.#.|#.#|...|...', '#': '#.#|###|#.#|###|#.#', '%': '#.#|..#|.#.|#..|#.#', '(': '.#.|#..|#..|#..|.#.',
  ')': '.#.|..#|..#|..#|.#.', ',': '...|...|...|.#.|#..', '=': '...|###|...|###|...', '♥': '#.#|###|###|.#.|...',
};
const G = {};
for (const k in ROWS) G[k] = ROWS[k].replace(/\|/g, '');

/** Draw pixel text. Returns width in px. */
export function text(ctx, str, x, y, color, scale = 1) {
  ctx.fillStyle = color;
  str = String(str).toUpperCase();
  let cx = x;
  for (const ch of str) {
    const g = G[ch] || G['?'];
    for (let i = 0; i < 15; i++) if (g[i] === '#') ctx.fillRect(cx + (i % 3) * scale, y + ((i / 3) | 0) * scale, scale, scale);
    cx += 4 * scale;
  }
  return cx - x - scale;
}
export const textWidth = (str, scale = 1) => String(str).length * 4 * scale - scale;

/** Neon text: soft glow pass + crisp core. */
export function neon(ctx, str, x, y, color, scale = 1, glow = 6, core = '#fff') {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  text(ctx, str, x, y, color, scale);
  ctx.shadowBlur = glow * 0.5;
  text(ctx, str, x, y, color, scale);
  ctx.restore();
  if (core) {
    ctx.globalAlpha = 0.55;
    text(ctx, str, x, y, core, scale);
    ctx.globalAlpha = 1;
  }
}

export function R(ctx, x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
export const P = (ctx, x, y, c) => R(ctx, x, y, 1, 1, c);

/** Stepped vertical gradient (pixel-art banding). */
export function bands(ctx, x, y, w, h, colors) {
  const n = colors.length;
  for (let i = 0; i < n; i++) {
    const y0 = y + Math.round((h * i) / n);
    const y1 = y + Math.round((h * (i + 1)) / n);
    R(ctx, x, y0, w, y1 - y0, colors[i]);
  }
}

/** Ordered dither: density 0.5 = checker, 0.25 = sparse grid, 0.125 = very sparse. */
export function dither(ctx, x, y, w, h, c, density = 0.5) {
  ctx.fillStyle = c;
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const on = density >= 0.5 ? (i + j) % 2 === 0 : density >= 0.25 ? i % 2 === 0 && j % 2 === 0 : (i + (j % 4 === 0 ? 0 : 2)) % 4 === 0 && j % 2 === 0;
      if (on) ctx.fillRect(x + i, y + j, 1, 1);
    }
}

/** Soft additive light pool (drawn on the light layer). */
export function glow(ctx, x, y, r, color, a = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, a));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Ceiling light cone: trapezoid fading downward, in 4px bands. */
export function cone(ctx, x, top, wTop, wBot, h, color, a = 0.18) {
  for (let i = 0; i < h; i += 2) {
    const t = i / h;
    const w = wTop + (wBot - wTop) * t;
    ctx.fillStyle = hexA(color, a * (1 - t) ** 1.4);
    ctx.fillRect(Math.round(x - w / 2), top + i, Math.round(w), 2);
  }
}

export function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Mix two hex colours. */
export function mix(a, b, t) {
  const A = parseInt(a.slice(1), 16);
  const B = parseInt(b.slice(1), 16);
  const c = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t);
  return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1);
}

/** Deterministic RNG (mulberry32). */
export function rng(seed = 1) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

/** Window frame with mullions; interior must already be cleared (a hole). */
export function windowFrame(ctx, x, y, w, h, frame, cols = 3) {
  R(ctx, x - 2, y - 2, w + 4, 2, frame);
  R(ctx, x - 2, y + h, w + 4, 3, frame);
  R(ctx, x - 2, y, 2, h, frame);
  R(ctx, x + w, y, 2, h, frame);
  for (let i = 1; i < cols; i++) R(ctx, x + Math.round((w * i) / cols) - 1, y, 2, h, frame);
  // glass tint + reflections
  ctx.fillStyle = 'rgba(120,180,255,0.06)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let i = 0; i < w; i += 23) for (let j = 0; j < 10; j++) ctx.fillRect(x + i + j, y + h - 12 - j, 1, 1);
}
