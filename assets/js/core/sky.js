// ─────────────────────────────────────────────────────────────────────────────
//  THE SKY ENGINE
//  One fixed <canvas> behind every page. It paints a gradient sky, sun, glow,
//  tinted clouds, stars, aurora, birds, shooting stars and fireworks, and
//  blends smoothly between named palettes as you scroll.
//
//  sky.setScenes(['paris','rome',...]); sky.setProgress(1.4)  // between rome & rio
//  sky.setPalette('arctic')                                     // single sky
//  sky.setShift(-1..1)   // afternoon ← golden hour → night
//  sky.aurora(); sky.fireworks(); sky.meteorShower();
// ─────────────────────────────────────────────────────────────────────────────
import { reducedMotion, seeded, clamp, lerp } from './base.js';

const hex = (h) => {
  h = h.replace('#', '');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mixC = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

const COLOR_KEYS = ['sunColor', 'glow', 'cloudLit', 'cloudShade', 'haze'];
const NUM_KEYS = ['sunX', 'sunY', 'sunR', 'glowAmt', 'clouds', 'stars', 'aurora', 'birds'];

const P = (o) => {
  const p = { ...o, stops: o.stops.map(hex) };
  COLOR_KEYS.forEach((k) => (p[k] = hex(o[k])));
  return p;
};

export const PALETTES = {
  paris: P({
    stops: ['#1d2858', '#5f4a8e', '#e27486', '#ffc488'],
    sunX: 0.76, sunY: 0.6, sunR: 0.05, sunColor: '#fff4d2', glow: '#ffac5a', glowAmt: 1,
    cloudLit: '#ffc0a0', cloudShade: '#6c4a86', clouds: 0.9, stars: 0.06, aurora: 0, haze: '#ffd3a0', birds: 1,
  }),
  rome: P({
    stops: ['#24163d', '#88295f', '#f0653d', '#ffbc60'],
    sunX: 0.24, sunY: 0.64, sunR: 0.06, sunColor: '#fff0c0', glow: '#ff8a3d', glowAmt: 1.15,
    cloudLit: '#ffa86c', cloudShade: '#62285a', clouds: 0.75, stars: 0.04, aurora: 0, haze: '#ffb266', birds: 1,
  }),
  rio: P({
    stops: ['#172569', '#7536a6', '#ff5888', '#ffad66'],
    sunX: 0.62, sunY: 0.69, sunR: 0.055, sunColor: '#fff2d8', glow: '#ff7888', glowAmt: 1,
    cloudLit: '#ffa0b6', cloudShade: '#53308e', clouds: 0.8, stars: 0.12, aurora: 0, haze: '#ffae88', birds: 1,
  }),
  nyc: P({
    stops: ['#0c1334', '#33387e', '#d65a7a', '#ff9e54'],
    sunX: 0.5, sunY: 0.66, sunR: 0.045, sunColor: '#fff1c8', glow: '#ff9446', glowAmt: 1.3,
    cloudLit: '#ff9e88', cloudShade: '#2c2a64', clouds: 0.45, stars: 0.22, aurora: 0, haze: '#ff9c66', birds: 0.4,
  }),
  arctic: P({
    stops: ['#01030b', '#04122e', '#0a2946', '#154556'],
    sunX: 0.5, sunY: 1.4, sunR: 0.05, sunColor: '#ffffff', glow: '#48d2bc', glowAmt: 0.22,
    cloudLit: '#36687a', cloudShade: '#061224', clouds: 0.12, stars: 1, aurora: 1, haze: '#2a6a70', birds: 0,
  }),
  // Single-sky pages
  library: P({
    stops: ['#2a1d4c', '#7a4a86', '#ee8a7a', '#ffd197'],
    sunX: 0.82, sunY: 0.78, sunR: 0.05, sunColor: '#fff4d6', glow: '#ffb46a', glowAmt: 0.9,
    cloudLit: '#ffc9a8', cloudShade: '#6e4c86', clouds: 0.7, stars: 0.04, aurora: 0, haze: '#ffd6a8', birds: 0.6,
  }),
  compass: P({
    stops: ['#101a4c', '#4b3a96', '#e96490', '#ffb070'],
    sunX: 0.18, sunY: 0.8, sunR: 0.05, sunColor: '#fff2d8', glow: '#ff8a8a', glowAmt: 0.9,
    cloudLit: '#ffa8b8', cloudShade: '#3a2f80', clouds: 0.6, stars: 0.15, aurora: 0, haze: '#ffaa88', birds: 0.5,
  }),
  lab: P({
    stops: ['#0f0828', '#4a1a78', '#1aa6a0', '#ffd46b'],
    sunX: 0.5, sunY: 0.86, sunR: 0.07, sunColor: '#fffbe6', glow: '#7cf0d0', glowAmt: 1,
    cloudLit: '#ff9ad6', cloudShade: '#2a1a66', clouds: 0.55, stars: 0.5, aurora: 0.35, haze: '#9af0d6', birds: 0,
  }),
  vault: P({
    stops: ['#010208', '#050f28', '#0b2240', '#183a52'],
    sunX: 0.5, sunY: 1.4, sunR: 0.05, sunColor: '#ffffff', glow: '#48d2bc', glowAmt: 0.15,
    cloudLit: '#2e5468', cloudShade: '#040c1c', clouds: 0.1, stars: 1, aurora: 0.6, haze: '#1f5260', birds: 0,
  }),
  observatory: P({
    stops: ['#000005', '#020620', '#0a1538', '#1a1f48'],
    sunX: 0.5, sunY: 1.5, sunR: 0.05, sunColor: '#ffffff', glow: '#7c6cff', glowAmt: 0.1,
    cloudLit: '#2a2a5a', cloudShade: '#02030c', clouds: 0, stars: 1, aurora: 0.9, haze: '#2a2a66', birds: 0,
  }),
};

const DAY = P({
  stops: ['#2f6ec4', '#6fa6e6', '#b8daf4', '#f2ead6'],
  sunX: 0.7, sunY: 0.18, sunR: 0.04, sunColor: '#ffffff', glow: '#fff6d0', glowAmt: 0.8,
  cloudLit: '#ffffff', cloudShade: '#b9c9e0', clouds: 1, stars: 0, aurora: 0, haze: '#f4f0e0', birds: 1,
});
const NIGHT = P({
  stops: ['#010208', '#060c2a', '#141a44', '#2c2350'],
  sunX: 0.5, sunY: 1.3, sunR: 0.05, sunColor: '#ffffff', glow: '#5a4a9a', glowAmt: 0.1,
  cloudLit: '#3a3a6a', cloudShade: '#04061a', clouds: 0.3, stars: 1, aurora: 0.15, haze: '#2a2a5a', birds: 0,
});

function mix(a, b, t) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const o = { stops: a.stops.map((s, i) => mixC(s, b.stops[i], t)) };
  COLOR_KEYS.forEach((k) => (o[k] = mixC(a[k], b[k], t)));
  NUM_KEYS.forEach((k) => (o[k] = lerp(a[k], b[k], t)));
  return o;
}

export class Sky {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.reduced = reducedMotion();
    this.scenes = ['paris'];
    this.target = 0; // scene progress we're heading to
    this.p = 0; // eased scene progress
    this.shift = 0;
    this.targetShift = 0;
    this.boostAurora = 0;
    this.t = 0;
    this.particles = [];
    this.meteors = [];
    this.flocks = [];
    this.nextFlock = 4;
    this.nextMeteor = 3;
    this.dirty = true;
    this.mouse = [0.5, 0.5];

    const rand = seeded(7);
    this.stars = Array.from({ length: 260 }, () => ({
      x: rand(), y: Math.pow(rand(), 1.4) * 0.78, s: rand() < 0.08 ? 2 : 1, ph: rand() * 6.28, sp: 0.6 + rand() * 2.2,
    }));
    this.clouds = Array.from({ length: 7 }, (_, i) => this.makeCloud(rand, i));
    this.buffer = document.createElement('canvas');
    this.buffer.width = 900;
    this.buffer.height = 260;
    this.bctx = this.buffer.getContext('2d');

    this.resize = this.resize.bind(this);
    addEventListener('resize', this.resize, { passive: true });
    addEventListener('pointermove', (e) => {
      this.mouse = [e.clientX / innerWidth, e.clientY / innerHeight];
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.last = performance.now();
    });
    this.resize();
    this.last = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  makeCloud(rand, i) {
    const w = 520 + rand() * 360;
    const h = 130 + rand() * 90;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const x = c.getContext('2d');
    const puffs = 44 + ((rand() * 20) | 0);
    for (let k = 0; k < puffs; k++) {
      const px = w * (0.1 + 0.8 * rand());
      const edge = 1 - Math.abs(px / w - 0.5) * 1.5;
      const r = h * (0.16 + 0.26 * rand()) * Math.max(0.3, edge);
      const py = h * 0.62 - rand() * h * 0.28 * edge;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, 'rgba(255,255,255,.32)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.beginPath();
      x.ellipse(px, py, r * 1.6, r, 0, 0, Math.PI * 2);
      x.fill();
    }
    return { img: c, x: rand(), y: 0.06 + rand() * 0.42, s: 0.55 + rand() * 0.8, v: 0.0025 + rand() * 0.006, a: 0.5 + rand() * 0.5, layer: i % 3 };
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 800 ? 1.5 : 1.25);
    const w = Math.round(innerWidth * dpr);
    const h = Math.round(innerHeight * dpr);
    if (w === this.c.width && h === this.c.height) return;
    this.dpr = dpr;
    this.c.width = w;
    this.c.height = h;
    this.dirty = true;
    if (this.scenes) this.draw(0);
  }

  // ── public API ────────────────────────────────────────────────────────────
  setScenes(names) {
    this.scenes = names.filter((n) => PALETTES[n]);
    this.dirty = true;
  }
  setPalette(name) {
    this.setScenes([name]);
    this.target = this.p = 0;
  }
  setProgress(p) {
    this.target = clamp(p, 0, this.scenes.length - 1);
    if (this.reduced) this.p = this.target;
    this.dirty = true;
  }
  setShift(v) {
    this.targetShift = clamp(v, -1, 1);
    if (this.reduced) this.shift = this.targetShift;
    this.dirty = true;
  }
  aurora(seconds = 16) {
    this.boostAurora = seconds;
    this.dirty = true;
  }
  meteorShower(n = 14) {
    for (let i = 0; i < n; i++) setTimeout(() => this.spawnMeteor(), i * 260 + Math.random() * 200);
  }
  fireworks(bursts = 7) {
    for (let i = 0; i < bursts; i++) {
      setTimeout(() => this.burst(0.15 + Math.random() * 0.7, 0.12 + Math.random() * 0.35), i * 420);
    }
  }
  /** The sun's position on screen in CSS pixels (for click hit-testing). */
  sunScreen() {
    const pal = this.pal || this.palette();
    return { x: pal.sunX * innerWidth, y: pal.sunY * innerHeight, r: Math.max(26, pal.sunR * innerHeight * 1.4) };
  }

  // ── internals ─────────────────────────────────────────────────────────────
  palette() {
    const n = this.scenes.length;
    const i = Math.min(n - 1, Math.floor(this.p));
    const j = Math.min(n - 1, i + 1);
    let pal = mix(PALETTES[this.scenes[i]], PALETTES[this.scenes[j]], this.p - i);
    if (this.shift < 0) pal = mix(pal, DAY, -this.shift * 0.92);
    else if (this.shift > 0) pal = mix(pal, NIGHT, this.shift);
    return pal;
  }

  spawnMeteor() {
    this.meteors.push({ x: 0.1 + Math.random() * 0.8, y: Math.random() * 0.35, vx: -(0.25 + Math.random() * 0.25), vy: 0.12 + Math.random() * 0.12, life: 1 });
  }

  burst(x, y) {
    const hues = [[255, 190, 110], [255, 120, 150], [140, 255, 210], [255, 240, 200], [190, 150, 255]];
    const col = hues[(Math.random() * hues.length) | 0];
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.05 + Math.random() * 0.22;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col });
    }
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    if (document.hidden) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.reduced) {
      if (!this.dirty) return;
      this.dirty = false;
      this.draw(0);
      return;
    }
    this.t += dt;
    this.p += (this.target - this.p) * Math.min(1, dt * 5);
    this.shift += (this.targetShift - this.shift) * Math.min(1, dt * 4);
    if (this.boostAurora > 0) this.boostAurora -= dt;
    this.draw(dt);
  }

  draw(dt) {
    const { ctx, c } = this;
    const W = c.width;
    const H = c.height;
    const dpr = this.dpr;
    const pal = (this.pal = this.palette());
    const t = this.t;

    // 1. sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    const pos = [0, 0.42, 0.74, 1];
    pal.stops.forEach((s, i) => g.addColorStop(pos[i], rgba(s)));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 2. stars
    if (pal.stars > 0.02) {
      ctx.fillStyle = '#fff';
      for (const s of this.stars) {
        const tw = 0.55 + 0.45 * Math.sin(t * s.sp + s.ph);
        ctx.globalAlpha = pal.stars * tw * (1 - s.y * 0.9);
        const size = s.s * dpr;
        ctx.fillRect(s.x * W, s.y * H, size, size);
      }
      ctx.globalAlpha = 1;
    }

    // 3. aurora
    const aur = Math.max(pal.aurora, this.boostAurora > 0 ? clamp(this.boostAurora / 3) : 0);
    if (aur > 0.02) this.drawAurora(aur, W, H, t);

    // 4. sun glow + disc
    const sx = pal.sunX * W + (this.mouse[0] - 0.5) * 12 * dpr;
    const sy = pal.sunY * H + (this.mouse[1] - 0.5) * 6 * dpr;
    const sr = pal.sunR * H;
    if (pal.sunY < 1.25) {
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 9);
      glow.addColorStop(0, rgba(pal.glow, 0.55 * pal.glowAmt));
      glow.addColorStop(0.35, rgba(pal.glow, 0.18 * pal.glowAmt));
      glow.addColorStop(1, rgba(pal.glow, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      const disc = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
      disc.addColorStop(0, rgba(pal.sunColor, 1));
      disc.addColorStop(0.7, rgba(mixC(pal.sunColor, pal.glow, 0.35), 1));
      disc.addColorStop(1, rgba(pal.glow, 0.9));
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. horizon haze
    const hz = ctx.createLinearGradient(0, H * 0.55, 0, H);
    hz.addColorStop(0, rgba(pal.haze, 0));
    hz.addColorStop(1, rgba(pal.haze, 0.32));
    ctx.fillStyle = hz;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);

    // 6. clouds, tinted shade→lit from top to bottom
    if (pal.clouds > 0.02) {
      const { bctx, buffer } = this;
      for (const cl of this.clouds) {
        cl.x += (cl.v * dt * (1 + cl.layer * 0.4)) / cl.s;
        if (cl.x > 1.25) cl.x = -0.45;
        const iw = cl.img.width;
        const ih = cl.img.height;
        bctx.globalCompositeOperation = 'source-over';
        bctx.clearRect(0, 0, iw, ih);
        bctx.drawImage(cl.img, 0, 0);
        bctx.globalCompositeOperation = 'source-in';
        const cg = bctx.createLinearGradient(0, 0, 0, ih);
        cg.addColorStop(0, rgba(pal.cloudShade));
        cg.addColorStop(0.55, rgba(mixC(pal.cloudShade, pal.cloudLit, 0.6)));
        cg.addColorStop(1, rgba(pal.cloudLit));
        bctx.fillStyle = cg;
        bctx.fillRect(0, 0, iw, ih);
        const scale = (W / 1500) * cl.s;
        const px = (cl.x - (this.mouse[0] - 0.5) * 0.01 * (cl.layer + 1)) * W;
        ctx.globalAlpha = pal.clouds * cl.a;
        ctx.drawImage(buffer, 0, 0, iw, ih, px - (iw * scale) / 2, cl.y * H, iw * scale, ih * scale);
      }
      ctx.globalAlpha = 1;
    }

    if (this.reduced) return;

    // 7. birds
    this.nextFlock -= dt;
    if (this.nextFlock < 0 && pal.birds > 0.3) {
      this.nextFlock = 16 + Math.random() * 18;
      const n = 4 + ((Math.random() * 5) | 0);
      const dir = Math.random() < 0.5 ? 1 : -1;
      this.flocks.push({
        x: dir > 0 ? -0.05 : 1.05, y: 0.22 + Math.random() * 0.25, v: dir * (0.035 + Math.random() * 0.02),
        birds: Array.from({ length: n }, (_, k) => ({ dx: -dir * k * 0.018 * (0.7 + Math.random() * 0.6), dy: (k % 2 ? 1 : -1) * k * 0.01, ph: Math.random() * 6 })),
      });
    }
    ctx.strokeStyle = 'rgba(25,12,30,.75)';
    ctx.lineWidth = 1.6 * dpr;
    ctx.lineCap = 'round';
    this.flocks = this.flocks.filter((f) => f.x > -0.3 && f.x < 1.3);
    for (const f of this.flocks) {
      f.x += f.v * dt;
      for (const b of f.birds) {
        const x = (f.x + b.dx) * W;
        const y = (f.y + b.dy + Math.sin(t * 0.8 + b.ph) * 0.004) * H;
        const s = 7 * dpr;
        const flap = Math.sin(t * 9 + b.ph) * s * 0.6;
        ctx.beginPath();
        ctx.moveTo(x - s, y - flap);
        ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.3, x, y);
        ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.3, x + s, y - flap);
        ctx.stroke();
      }
    }

    // 8. shooting stars
    if (pal.stars > 0.5) {
      this.nextMeteor -= dt;
      if (this.nextMeteor < 0) {
        this.nextMeteor = 4 + Math.random() * 7;
        this.spawnMeteor();
      }
    }
    ctx.globalCompositeOperation = 'lighter';
    this.meteors = this.meteors.filter((m) => m.life > 0);
    for (const m of this.meteors) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt * 1.1;
      const x = m.x * W;
      const y = m.y * H;
      const tx = x - m.vx * W * 0.18;
      const ty = y - m.vy * H * 0.18;
      const mg = ctx.createLinearGradient(x, y, tx, ty);
      mg.addColorStop(0, `rgba(255,255,255,${0.9 * m.life})`);
      mg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = mg;
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }

    // 9. fireworks
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.09 * dt;
      p.vx *= 0.985;
      p.life -= dt * 0.55;
      ctx.fillStyle = rgba(p.col, Math.max(0, p.life));
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, 1.8 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawAurora(amount, W, H, t) {
    const { ctx } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ribbons = [
      { col: [80, 255, 170], base: 0.14, amp: 0.06, len: 0.16, sp: 0.16 },
      { col: [60, 220, 210], base: 0.22, amp: 0.05, len: 0.12, sp: -0.12 },
      { col: [170, 110, 255], base: 0.08, amp: 0.04, len: 0.1, sp: 0.09 },
    ];
    const step = Math.max(4, Math.round(W / 260));
    for (const [k, r] of ribbons.entries()) {
      const grad = ctx.createLinearGradient(0, 0, 0, 1);
      grad.addColorStop(0, rgba(r.col, 0));
      grad.addColorStop(0.55, rgba(r.col, 0.5));
      grad.addColorStop(0.8, rgba(r.col, 0.85));
      grad.addColorStop(1, rgba(r.col, 0));
      ctx.fillStyle = grad;
      for (let x = 0; x < W; x += step) {
        const u = x / W;
        const y = H * (r.base + Math.sin(u * 5.2 + t * r.sp + k) * r.amp + Math.sin(u * 13.1 - t * 0.31 + k * 2) * r.amp * 0.35);
        const len = H * r.len * (0.55 + 0.45 * Math.sin(u * 9 + t * 0.6 + k * 1.7));
        const a = amount * (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(u * 17 + t * 1.1 + k), 2)) * (0.6 + 0.4 * Math.sin(u * 3 + k));
        ctx.globalAlpha = clamp(a * 0.55);
        ctx.setTransform(1, 0, 0, len, x, y);
        ctx.fillRect(0, 0, step + 1, 1);
      }
    }
    ctx.restore();
  }
}

/** Mount the sky behind the page and return it. */
export function mountSky(initial = 'paris') {
  let canvas = document.getElementById('sky');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'sky';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
  }
  const sky = new Sky(canvas);
  if (Array.isArray(initial)) sky.setScenes(initial);
  else sky.setPalette(initial);
  sky.draw(0); // paint immediately so there's never a black first frame
  window.__sky = sky; // handy from the dev console
  return sky;
}
