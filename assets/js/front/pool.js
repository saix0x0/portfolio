// ─────────────────────────────────────────────────────────────────────────────
//  THE POOL: the front page's background. A grid of dots on black is the
//  surface of still water. A 2D wave equation runs on the grid; each dot is
//  pushed by the slope under it (refraction) and lit by the height (crests).
//  The pointer stirs it, a click drops a stone, and now and then it rains.
//  Reduced motion: the dots are drawn once and the water stays still.
// ─────────────────────────────────────────────────────────────────────────────
const LEVELS = 9; // brightness buckets, so a frame is nine fills, not thousands
const INK = [236, 234, 228];
const HOT = [255, 95, 31]; // lifeguard orange, for the highest crests only

export function pool(canvas, { still = false } = {}) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, S = 16, cols = 0, rows = 0, dpr = 1;
  let cur, prev, raf = 0, last = 0, rain = 0;
  let px = -1, py = -1;
  const fills = Array.from({ length: LEVELS }, (_, i) => {
    const t = i / (LEVELS - 1);
    const c = i === LEVELS - 1 ? HOT : INK;
    return `rgba(${c[0]},${c[1]},${c[2]},${(0.07 + t * 0.6).toFixed(3)})`;
  });

  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth;
    H = innerHeight;
    S = W < 700 ? 18 : 16;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    cols = Math.ceil(W / S) + 2;
    rows = Math.ceil(H / S) + 2;
    cur = new Float32Array(cols * rows);
    prev = new Float32Array(cols * rows);
    draw();
  }

  // a disturbance of strength `a` and radius `r` cells at screen point x, y
  function drop(x, y, a = 1, r = 2) {
    const cx = Math.round(x / S) + 1;
    const cy = Math.round(y / S) + 1;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      const X = cx + i, Y = cy + j;
      if (X < 1 || Y < 1 || X >= cols - 1 || Y >= rows - 1) continue;
      const d = Math.hypot(i, j) / r;
      if (d <= 1) cur[Y * cols + X] += a * (0.5 + 0.5 * Math.cos(Math.PI * d));
    }
  }

  // the next state is written over the one before last, then the two swap
  function step() {
    for (let y = 1; y < rows - 1; y++) {
      const o = y * cols;
      for (let x = 1; x < cols - 1; x++) {
        const i = o + x;
        prev[i] = ((cur[i - 1] + cur[i + 1] + cur[i - cols] + cur[i + cols]) * 0.5 - prev[i]) * 0.962;
      }
    }
    [prev, cur] = [cur, prev];
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const paths = fills.map(() => new Path2D());
    const vx = W / 2, vy = H * 0.42, vr = Math.hypot(W, H) * 0.62;
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const i = y * cols + x;
        const h = cur[i];
        const gx = cur[i + 1] - cur[i - 1];
        const gy = cur[i + cols] - cur[i - cols];
        const X = (x - 1) * S + gx * 9;
        const Y = (y - 1) * S + gy * 9;
        // the edges of the pool sit a little darker than its middle
        const v = 1 - Math.min(1, Math.hypot(X - vx, Y - vy) / vr) * 0.55;
        const e = h * 0.9 + Math.abs(gx) + Math.abs(gy);
        const lit = Math.max(0, Math.min(1, e * 1.1));
        const lvl = e > 3.2 ? LEVELS - 1 : Math.min(LEVELS - 2, Math.round((v * 0.42 + lit * 0.8) * (LEVELS - 2)));
        const r = 0.7 + lit * 1.5;
        paths[lvl].rect(X - r, Y - r, r * 2, r * 2);
      }
    }
    paths.forEach((p, i) => { ctx.fillStyle = fills[i]; ctx.fill(p); });
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (t - last < 15) return; // ~60 steps a second, however fast the screen
    last = t;
    if (t > rain) {
      drop(Math.random() * W, Math.random() * H, 0.6 + Math.random() * 0.6, 2);
      rain = t + 900 + Math.random() * 1800;
    }
    step();
    draw();
  }

  addEventListener('resize', () => { const w = innerWidth; if (Math.abs(w - W) > 2 || Math.abs(innerHeight - H) > 120) size(); });
  size();
  if (still) return { drop: () => {} };

  addEventListener('pointermove', (e) => {
    if (px >= 0) {
      const sp = Math.min(40, Math.hypot(e.clientX - px, e.clientY - py));
      if (sp > 1) drop(e.clientX, e.clientY, sp * 0.02, 1);
    }
    px = e.clientX;
    py = e.clientY;
  }, { passive: true });
  addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button, input, [data-open]')) return;
    drop(e.clientX, e.clientY, 3, 3);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(frame);
  });
  raf = requestAnimationFrame(frame);
  return { drop };
}
