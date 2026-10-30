// ─────────────────────────────────────────────────────────────────────────────
//  SKYVIEW — everything outside the hotel. Drawn first each frame; the hotel's
//  windows are holes that show it. Four switchable environments (lobby console):
//    city · sunset · aurora · space
//  Layers are pre-rendered per mode on first use, so switching is cheap.
// ─────────────────────────────────────────────────────────────────────────────
import { R, P, text, canvas, rng, hexA, mix } from './gfx.js';
import { H, GROUND } from './layout.js';

const LW = 1200;
const NEON = ['#ff3d9a', '#29f0ff', '#ffb347', '#a6ff6b', '#b07cff'];
const SIGNS = ['HOTEL', 'RAMEN', 'BAR', '24H', 'NOODLE', 'CYBER', 'SUSHI', 'TECH', 'OPEN', 'NEON', 'DATA', 'CAFE'];

export const SKYVIEWS = {
  city: { label: 'Cyberpunk City', sky: ['#0b0520', '#160a34', '#2a0f4a', '#4a1258', '#7a1a62', '#b02a66'], rain: true, cars: true, planet: true, haze: '#ff3d9a' },
  sunset: { label: 'Golden Sunset', sky: ['#24164a', '#4a2266', '#8a2e6a', '#d8485a', '#ff8a4a', '#ffc070'], sun: true, cars: true, haze: '#ff9a5a' },
  aurora: { label: 'Polar Aurora', sky: ['#01040e', '#03102a', '#06203a', '#0a3048', '#11415a', '#1a5466'], aurora: true, mountains: true, stars: 1, haze: '#3dffb0' },
  space: { label: 'Deep Space', sky: ['#000004', '#02020c', '#050414', '#09061e', '#0d0828', '#120a30'], space: true, stars: 1.6, planet: true, haze: '#7c5cff' },
};

function towers(seed, o) {
  const [c, x] = canvas(LW, H);
  const r = rng(seed);
  let px = -10;
  while (px < LW) {
    const w = Math.round(o.minW + r() * (o.maxW - o.minW));
    const h = Math.round(o.minH + r() * (o.maxH - o.minH));
    const top = GROUND - h;
    const shade = mix(o.body, '#000000', r() * 0.35);
    R(x, px, top, w, h + 60, shade);
    R(x, px, top, 1, h + 60, mix(shade, '#ff6ab4', 0.35));
    R(x, px, top, w, 1, mix(shade, '#ff6ab4', 0.35));
    if (r() < 0.5) R(x, px + 4, top - 8, w - 8, 8, shade);
    if (r() < 0.3) R(x, px + w / 2 - 2, top - 30, 4, 22, shade);
    for (let wy = top + 6; wy < GROUND - 4; wy += 5)
      for (let wx = px + 3; wx < px + w - 3; wx += 4) if (r() < o.litP) P(x, wx, wy, r() < 0.15 && o.signs ? NEON[(r() * 5) | 0] : o.lit);
    if (o.signs && r() < 0.55) {
      const word = SIGNS[(r() * SIGNS.length) | 0];
      const col = NEON[(r() * NEON.length) | 0];
      const sx = px + (r() < 0.5 ? 2 : w - 7);
      const sy = top + 20 + r() * Math.max(10, h - 120);
      R(x, sx - 1, sy - 2, 6, word.length * 6 + 3, '#0a0412');
      x.save();
      x.shadowColor = col;
      x.shadowBlur = 5;
      [...word].forEach((ch, i) => text(x, ch, sx, sy + i * 6, col));
      x.restore();
    }
    if (o.signs && r() < 0.18 && w > 50) {
      const col = NEON[(r() * 5) | 0];
      const by = top + 30 + r() * 80;
      R(x, px + 6, by, w - 12, 22, hexA(col, 0.25));
      R(x, px + 6, by, w - 12, 1, col);
      R(x, px + 6, by + 21, w - 12, 1, col);
      x.save();
      x.shadowColor = col;
      x.shadowBlur = 6;
      text(x, SIGNS[(r() * SIGNS.length) | 0], px + 10, by + 8, col);
      x.restore();
    }
    if (o.antennas && r() < 0.4) {
      R(x, px + w / 2, top - 46, 1, 46, shade);
      P(x, px + w / 2, top - 47, '#ff3d5a');
    }
    px += w + Math.round(r() * o.gap);
  }
  return c;
}

function mountains(seed, body, snow, minH, maxH) {
  const [c, x] = canvas(LW, H);
  const r = rng(seed);
  const pts = [];
  for (let px = 0, up = true; px <= LW + 80; up = !up) {
    pts.push([px, GROUND - (up ? minH + r() * (maxH - minH) : minH * 0.4 + r() * minH * 0.4)]);
    px += 40 + r() * 70;
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    for (let px = Math.floor(x0); px < x1; px++) {
      const t = (px - x0) / (x1 - x0);
      const y = Math.round(y0 + (y1 - y0) * t);
      R(x, px, y, 1, H - y, body);
      const peak = Math.min(y0, y1);
      if (y < peak + 18 && y < GROUND - minH * 0.7) R(x, px, y, 1, Math.max(1, peak + 18 - y) * 0.6, snow);
    }
  }
  return c;
}

export class City {
  constructor() {
    const r = rng(99);
    this.mode = 'city';
    this.fade = 0;
    this.cache = {};
    this.stars = Array.from({ length: 320 }, () => ({ x: r() * LW, y: r() * GROUND * 0.85, b: r(), s: r() * 6 }));
    this.cars = Array.from({ length: 14 }, (_, i) => ({ lane: GROUND - 120 - ((i * 97) % 900), x: r() * 2000, v: (r() < 0.5 ? -1 : 1) * (30 + r() * 50), col: NEON[i % 5], f: 0.35 + r() * 0.3 }));
    this.drops = Array.from({ length: 140 }, () => ({ x: r(), y: r(), l: 4 + r() * 6, v: 0.8 + r() * 0.6 }));
    const [pc, px] = canvas(240, 140);
    this.drawPlanet(px, 120, 70, 34);
    this.planetImg = pc;
  }

  setMode(mode) {
    if (!SKYVIEWS[mode] || mode === this.mode) return;
    this.mode = mode;
    this.fade = 1;
  }

  layers() {
    const m = this.mode;
    if (this.cache[m]) return this.cache[m];
    let L;
    if (m === 'city') L = [
      [towers(3, { minW: 26, maxW: 70, minH: 260, maxH: 760, body: '#3a1a5e', lit: '#8a4ab0', litP: 0.2, antennas: true, gap: 6 }), 0.25],
      [towers(7, { minW: 40, maxW: 110, minH: 160, maxH: 560, body: '#1c0f34', lit: '#ffc27a', litP: 0.16, signs: true, antennas: true, gap: 26 }), 0.5],
    ];
    else if (m === 'sunset') L = [
      [towers(3, { minW: 26, maxW: 70, minH: 220, maxH: 620, body: '#6a2a5a', lit: '#ffd08a', litP: 0.05, antennas: true, gap: 6 }), 0.25],
      [towers(7, { minW: 40, maxW: 110, minH: 140, maxH: 480, body: '#3a1438', lit: '#ffc27a', litP: 0.06, antennas: true, gap: 26 }), 0.5],
    ];
    else if (m === 'aurora') L = [
      [mountains(5, '#0c2236', '#9ac4dc', 300, 620), 0.2],
      [mountains(11, '#06121e', '#6a8fa6', 160, 360), 0.45],
    ];
    else L = [];
    return (this.cache[m] = L);
  }

  draw(ctx, cam, vw, vh, t, reduced) {
    const V = SKYVIEWS[this.mode];
    // sky bands anchored to the horizon (ground level), brightest at the bottom
    const n = V.sky.length;
    const horizon = GROUND - cam.y;
    const bandH = 64;
    R(ctx, 0, 0, vw, vh, V.sky[0]);
    for (let i = 1; i < n; i++) {
      const y0 = Math.round(horizon - (n - i) * bandH);
      if (y0 < vh) R(ctx, 0, Math.max(0, y0), vw, vh - Math.max(0, y0), V.sky[i]);
    }
    // stars
    const starAmt = V.stars ?? (this.mode === 'city' ? 0.6 : 0);
    if (starAmt) for (const s of this.stars) {
      const x = ((s.x - cam.x * 0.05) % LW + LW) % LW;
      const y = s.y - cam.y * 0.5;
      if (y < 0 || y > vh || x > vw) continue;
      const tw = reduced ? 1 : 0.6 + 0.4 * Math.sin(t * (1 + s.s) + s.s * 7);
      ctx.globalAlpha = Math.min(1, (0.25 + s.b * 0.75) * tw * starAmt);
      P(ctx, x, y, '#ffffff');
    }
    ctx.globalAlpha = 1;
    if (V.space) this.drawSpace(ctx, cam, vw, vh, t);
    if (V.planet && !V.space) ctx.drawImage(this.planetImg, Math.round(vw * 0.72 - cam.x * 0.03) - 120, Math.round(GROUND * 0.22 - cam.y * 0.45) - 70);
    if (V.sun) this.drawSun(ctx, Math.round(vw * 0.62 - cam.x * 0.04), Math.round(GROUND - 260 - cam.y));
    if (V.aurora) this.drawAurora(ctx, cam, vw, t, reduced);

    const L = this.layers();
    if (L[0]) this.layer(ctx, L[0][0], cam, L[0][1], vw);
    if (V.cars && !reduced) this.drawCars(ctx, cam, vh);
    if (L[1]) this.layer(ctx, L[1][0], cam, L[1][1], vw);

    const hz = ctx.createLinearGradient(0, GROUND - 260 - cam.y, 0, GROUND - cam.y);
    hz.addColorStop(0, hexA(V.haze, 0));
    hz.addColorStop(1, hexA(V.haze, 0.18));
    ctx.fillStyle = hz;
    ctx.fillRect(0, 0, vw, vh);

    if (V.rain && !reduced) {
      ctx.fillStyle = 'rgba(180,200,255,0.22)';
      for (const d of this.drops) {
        d.y += d.v * 0.012;
        if (d.y > 1) d.y -= 1;
        ctx.fillRect(Math.round(d.x * vw - d.y * 18), Math.round(d.y * vh), 1, d.l);
      }
    }
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fade})`;
      ctx.fillRect(0, 0, vw, vh);
      this.fade = Math.max(0, this.fade - 0.04);
    }
  }

  layer(ctx, img, cam, f, vw) {
    const off = -((cam.x * f) % LW + LW) % LW;
    for (let x = off; x < vw; x += LW) ctx.drawImage(img, Math.round(x), -Math.round(cam.y));
  }

  drawCars(ctx, cam, vh) {
    for (const c of this.cars) {
      c.x += c.v / 60;
      if (c.x > 2400) c.x = -200;
      if (c.x < -200) c.x = 2400;
      const sx = Math.round(c.x - cam.x * c.f) % 2000;
      const sy = Math.round(c.lane - cam.y);
      if (sy < -4 || sy > vh + 4) continue;
      R(ctx, sx, sy, 7, 2, '#1a1030');
      R(ctx, sx + 2, sy - 1, 3, 1, '#2a1a48');
      P(ctx, c.v > 0 ? sx + 7 : sx - 1, sy, '#fff6c8');
      P(ctx, c.v > 0 ? sx - 1 : sx + 7, sy + 1, c.col);
    }
  }

  drawSun(ctx, x, y) {
    const g = ctx.createRadialGradient(x, y, 10, x, y, 160);
    g.addColorStop(0, 'rgba(255,210,140,0.55)');
    g.addColorStop(1, 'rgba(255,140,90,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 160, y - 160, 320, 320);
    const r = 26;
    for (let j = -r; j <= r; j++) {
      if (j > 6 && j % 4 === 0) continue; // retro sun stripes
      const w = Math.round(Math.sqrt(r * r - j * j));
      R(ctx, x - w, y + j, w * 2, 1, mix('#fff2b0', '#ff7a4a', (j + r) / (2 * r)));
    }
  }

  drawAurora(ctx, cam, vw, t, reduced) {
    const T = reduced ? 0 : t;
    for (const [k, col, base] of [[0, '#3dffb0', 0.16], [1, '#29f0ff', 0.24], [2, '#9b5cff', 0.1]]) {
      for (let x = 0; x < vw; x += 2) {
        const u = (x + cam.x * 0.1) / 300;
        const y = Math.round(GROUND * base - cam.y * 0.5 + Math.sin(u * 2 + T * 0.3 + k) * 26 + Math.sin(u * 5.3 - T * 0.5) * 8);
        const len = 30 + Math.round((0.5 + 0.5 * Math.sin(u * 3 + T * 0.8 + k * 2)) * 50);
        const a = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(u * 7 + T * 1.3 + k));
        for (let j = 0; j < len; j += 2) {
          ctx.fillStyle = hexA(col, a * (1 - j / len));
          ctx.fillRect(x, y + j, 2, 2);
        }
      }
    }
  }

  drawSpace(ctx, cam, vw, vh, t) {
    // nebula
    const nx = vw * 0.3 - cam.x * 0.04;
    const ny = GROUND * 0.35 - cam.y * 0.45;
    for (const [dx, dy, r, c] of [[0, 0, 140, '#7c5cff'], [90, 40, 110, '#ff3d9a'], [-60, 70, 90, '#29f0ff']]) {
      const g = ctx.createRadialGradient(nx + dx, ny + dy, 0, nx + dx, ny + dy, r);
      g.addColorStop(0, hexA(c, 0.14));
      g.addColorStop(1, hexA(c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(nx + dx - r, ny + dy - r, r * 2, r * 2);
    }
    // close giant planet
    ctx.save();
    ctx.translate(Math.round(vw * 0.75 - cam.x * 0.03), Math.round(GROUND * 0.55 - cam.y * 0.4));
    ctx.scale(2, 2);
    ctx.drawImage(this.planetImg, -120, -70);
    ctx.restore();
    // orbital station drifting
    const sx = Math.round(((t * 4) % (vw + 200)) - 100);
    const sy = Math.round(GROUND * 0.2 - cam.y * 0.45);
    R(ctx, sx - 14, sy, 28, 3, '#8a86a6');
    R(ctx, sx - 2, sy - 6, 4, 15, '#a8a4c6');
    R(ctx, sx - 22, sy - 3, 6, 9, '#3a4a8a');
    R(ctx, sx + 16, sy - 3, 6, 9, '#3a4a8a');
    P(ctx, sx, sy - 7, Math.sin(t * 3) > 0 ? '#ff3d5a' : '#ffffff');
  }

  drawPlanet(ctx, x, y, r) {
    const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.4);
    g.addColorStop(0, 'rgba(255,143,184,0.25)');
    g.addColorStop(1, 'rgba(255,143,184,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    this.ring(ctx, x, y, r, true);
    for (let j = -r; j <= r; j++) {
      const w = Math.round(Math.sqrt(r * r - j * j));
      const band = ['#ff9cc2', '#ff86b4', '#f070a4', '#d85a94', '#ff9cc2', '#e8689c'][Math.floor((j + r) / 10) % 6];
      R(ctx, x - w, y + j, w * 2, 1, band);
      R(ctx, x + w - Math.round(w * 0.45), y + j, Math.round(w * 0.45), 1, mix(band, '#2a0f4a', 0.45));
    }
    this.ring(ctx, x, y, r, false);
  }

  ring(ctx, x, y, r, back) {
    for (let a = 0; a < Math.PI * 2; a += 0.01) {
      if (Math.sin(a) > 0 === back) continue;
      for (const k of [1.55, 1.7, 1.85]) {
        const px = x + Math.cos(a) * r * k;
        const py = y + Math.sin(a) * r * k * 0.22;
        if (!back && Math.hypot(px - x, py - y) < r && py < y) continue;
        P(ctx, px, py, k === 1.7 ? '#ffd2e6' : '#ffb0d0');
      }
    }
  }
}
