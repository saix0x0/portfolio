// ─────────────────────────────────────────────────────────────────────────────
//  FLOOR 3 — RACING PAVILION & CINEMA  (theme: pavilion — asphalt, racing red,
//  kerb stripes, timing-screen green)
//  Garage (car + tyres) · Track Room · Pit Wall · Hall of Champions · Cinema
//  Data: content/f1.js (static). The cinema screen plays the chosen channel.
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, sign, lamp, lightCone, partition, screen, R, P, text, glow, mix } from '../kit.js';
import { Walker, LOOKS } from '../actors.js';
import { register } from '../panels.js';
import { esc } from '../../core/base.js';
import { iconicCars, circuits, champions, tyres } from '../../../../content/f1.js';

const T = THEMES.pavilion;
const X = { car: 190, tyres: 74, map0: 430, map1: 700, pit0: 818, pit1: 960, hall0: 972, hall1: 1094, cinema0: 1126, screen0: 1176, screen1: 1460, terminal: 1146 };
const doorX = [404, 1110];
const CHANNELS = { race: 'Grand Prix replay', warp: 'Deep space warp', eq: 'Music visualiser', lofi: 'Rooftop sunset' };

/** Side-view F1 car, nose to the right. (x = rear axle-ish, y = ground) */
export function f1car(ctx, x, y, body = '#e8343a', accent = '#f0f0f0') {
  // floor + sidepod
  R(ctx, x, y - 9, 92, 3, '#141418');
  R(ctx, x + 18, y - 15, 50, 7, body);
  R(ctx, x + 18, y - 15, 50, 1, mix(body, '#fff', 0.35));
  // engine cover + shark fin
  R(ctx, x + 10, y - 20, 34, 6, body);
  R(ctx, x + 8, y - 24, 22, 4, body);
  R(ctx, x + 8, y - 24, 22, 1, accent);
  // cockpit + halo + helmet
  R(ctx, x + 44, y - 18, 16, 4, '#141418');
  R(ctx, x + 47, y - 22, 6, 5, '#ffd23a');
  R(ctx, x + 44, y - 23, 16, 1, '#2a2a30');
  R(ctx, x + 59, y - 23, 1, 5, '#2a2a30');
  // nose + front wing
  R(ctx, x + 60, y - 15, 30, 4, body);
  R(ctx, x + 88, y - 13, 10, 3, body);
  R(ctx, x + 84, y - 9, 16, 2, accent);
  R(ctx, x + 98, y - 11, 2, 4, '#141418');
  // rear wing
  R(ctx, x - 4, y - 30, 3, 20, '#141418');
  R(ctx, x - 8, y - 32, 14, 4, body);
  R(ctx, x - 8, y - 28, 14, 2, accent);
  // number + text
  text(ctx, '7', x + 28, y - 14, accent);
  // wheels
  for (const wx of [x + 12, x + 76]) {
    R(ctx, wx - 7, y - 14, 14, 14, '#0c0c10');
    R(ctx, wx - 8, y - 12, 16, 10, '#0c0c10');
    R(ctx, wx - 3, y - 10, 6, 6, '#3a3a44');
    R(ctx, wx - 1, y - 8, 2, 2, '#8a8a96');
    R(ctx, wx - 7, y - 13, 14, 1, '#ffd23a');
  }
}

function helmet(ctx, x, y, c) {
  R(ctx, x - 6, y - 10, 12, 10, c);
  R(ctx, x - 7, y - 8, 14, 7, c);
  R(ctx, x - 2, y - 7, 8, 3, '#141418');
  R(ctx, x - 6, y - 10, 12, 1, mix(c, '#fff', 0.4));
}

export function paint(ctx, f) {
  shell(ctx, f, T, f.x0, f.x1, { panel: 0, wainscot: 12, floor: 'checker' });
  const y = f.y - 8;
  // kerb stripe along the wainscot
  for (let x = f.x0; x < f.x1; x += 8) R(ctx, x, y - 22, 8, 2, (x / 8) % 2 ? '#e8343a' : '#f0f0f0');
  // ── garage
  R(ctx, 60, f.top + 20, 330, 60, '#16171c');
  for (let j = 0; j < 56; j += 4) R(ctx, 60, f.top + 22 + j, 330, 1, '#22242a'); // shutter
  sign(ctx, 'THE GARAGE', 225, f.top + 30, T.neonA, 1);
  R(ctx, 110, y - 4, 170, 4, '#3a3c44');
  R(ctx, 110, y - 4, 170, 1, T.neonB);
  f1car(ctx, X.car - 40, y - 4);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const tx = 64 + j * 13;
    const ty = y - 8 - i * 9;
    R(ctx, tx, ty, 12, 9, '#0c0c10');
    R(ctx, tx, ty + 4, 12, 1, tyres[(i + j) % 3].color);
  }
  R(ctx, 312, y - 26, 30, 22, '#8a1a20'); // tool cart
  for (let k = 0; k < 3; k++) R(ctx, 314, y - 24 + k * 7, 26, 1, '#5a1014');
  R(ctx, 316, y - 4, 3, 4, INK);
  R(ctx, 335, y - 4, 3, 4, INK);
  partition(ctx, f, T, doorX[0]);
  // ── track room: wall display
  R(ctx, X.map0, f.top + 20, X.map1 - X.map0, 70, INK);
  R(ctx, X.map0 + 2, f.top + 22, X.map1 - X.map0 - 4, 66, '#0a0c10');
  sign(ctx, 'TRACK ROOM', (X.map0 + X.map1) / 2, f.top + 98, T.neonC, 1, false);
  // three stylised circuit outlines
  const loops = [
    [[0, 10], [20, 0], [40, 2], [46, 14], [30, 22], [36, 34], [12, 36], [4, 24]],
    [[0, 20], [10, 4], [34, 0], [48, 10], [40, 26], [52, 34], [20, 38], [6, 32]],
    [[2, 8], [26, 2], [44, 8], [36, 20], [48, 30], [26, 36], [14, 26], [0, 30]],
  ];
  loops.forEach((pts, k) => {
    const ox = X.map0 + 14 + k * 88;
    const oy = f.top + 36;
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
      for (let s = 0; s <= n; s++) R(ctx, ox + ax + ((bx - ax) * s) / n, oy + ay + ((by - ay) * s) / n, 2, 2, '#6a6c78');
    }
    text(ctx, circuits[k].country.slice(0, 7).toUpperCase(), ox + 4, oy + 44, '#a8aab8');
  });
  // bench
  R(ctx, 520, y - 12, 80, 4, '#3a3c44');
  R(ctx, 524, y - 8, 3, 8, INK);
  R(ctx, 593, y - 8, 3, 8, INK);
  // ── pit wall gantry
  R(ctx, X.pit0, y - 40, X.pit1 - X.pit0, 6, '#2a2c34');
  R(ctx, X.pit0 + 4, y - 34, 3, 34, '#2a2c34');
  R(ctx, X.pit1 - 7, y - 34, 3, 34, '#2a2c34');
  for (let i = 0; i < 4; i++) screen(ctx, X.pit0 + 8 + i * 34, y - 68, 28, 20, '#2a2c34', false);
  sign(ctx, 'PIT WALL', (X.pit0 + X.pit1) / 2, f.top + 24, T.neonC, 1);
  // ── hall of champions
  sign(ctx, 'CHAMPIONS', (X.hall0 + X.hall1) / 2, f.top + 24, T.neonB, 1);
  champions.slice(0, 5).forEach((c, i) => {
    const hx = X.hall0 + 12 + i * 24;
    R(ctx, hx - 8, y - 30, 16, 30, '#22242a');
    R(ctx, hx - 9, y - 32, 18, 3, '#c8a040');
    helmet(ctx, hx, y - 33, c.helmet);
    text(ctx, String(c.titles), hx - 1, y - 24, '#ffd23a');
  });
  partition(ctx, f, T, doorX[1]);
  // ── cinema
  R(ctx, X.cinema0, f.top + 10, f.x1 - X.cinema0, f.h - 18, '#0c0a10');
  R(ctx, X.screen0 - 4, f.top + 18, X.screen1 - X.screen0 + 8, 70, '#2a0a10');
  R(ctx, X.screen0 - 8, f.top + 14, 8, 80, '#6a1018'); // curtains
  R(ctx, X.screen1, f.top + 14, 8, 80, '#6a1018');
  sign(ctx, 'CINEMA', (X.screen0 + X.screen1) / 2, f.top + 98, T.neonA, 1, false);
  for (let r = 0; r < 2; r++) for (let sx = X.screen0 + 20; sx < X.screen1 - 10; sx += 18) {
    const sy = y - r * 10;
    R(ctx, sx, sy - 14, 12, 9, '#8a1a20');
    R(ctx, sx, sy - 16, 12, 2, '#a82a30');
    R(ctx, sx + 2, sy - 5, 2, 5, INK);
  }
  // media terminal
  R(ctx, X.terminal - 6, y - 26, 12, 26, '#22242a');
  screen(ctx, X.terminal - 10, y - 44, 20, 14, '#2a2c34', false);
}

export function lights(l, f) {
  for (const cx of [130, 250, 360]) lightCone(l, cx, f.top + 12, f, T.light, 10, 80, 0.1);
  glow(l, 225, f.top + 32, 50, T.neonA, 0.15);
  glow(l, (X.map0 + X.map1) / 2, f.top + 55, 90, T.neonC, 0.08);
  glow(l, (X.pit0 + X.pit1) / 2, f.y - 58, 60, T.neonC, 0.14);
  for (let i = 0; i < 5; i++) lightCone(l, X.hall0 + 12 + i * 24, f.top + 12, f, '#ffe6b0', 4, 26, 0.12);
  glow(l, (X.screen0 + X.screen1) / 2, f.top + 54, 150, '#6a8aff', 0.1);
}

export function dyn(ctx, f, t, G) {
  const y = f.y - 8;
  // circuit dots racing round
  const loops = 3;
  for (let k = 0; k < loops; k++) {
    const ox = X.map0 + 14 + k * 88;
    const a = t * (0.8 + k * 0.2);
    P(ctx, ox + 24 + Math.cos(a) * 18, f.top + 54 + Math.sin(a) * 14, '#ff2a3a');
  }
  // pit wall timing screens (sample data)
  for (let i = 0; i < 4; i++) {
    const sx = X.pit0 + 8 + i * 34;
    const sy = y - 68;
    R(ctx, sx, sy, 28, 20, '#04100a');
    for (let r = 0; r < 3; r++) {
      const v = Math.floor((t * 3 + i * 7 + r * 3) % 9);
      R(ctx, sx + 2, sy + 3 + r * 6, 6 + v * 2, 3, r === 0 && i === 1 ? '#b07cff' : '#3dff9a');
    }
  }
  // terminal
  R(ctx, X.terminal - 10, y - 44, 20, 14, '#0a0612');
  text(ctx, 'PLAY', X.terminal - 7, y - 40, T.neonA);
  // cinema screen
  const ch = G.flags?.channel || 'race';
  const x0 = X.screen0;
  const w = X.screen1 - X.screen0;
  const sy = f.top + 18;
  const h = 70;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, sy, w, h);
  ctx.clip();
  if (ch === 'race') {
    R(ctx, x0, sy, w, h, '#4a7ad8');
    R(ctx, x0, sy + 30, w, 12, '#2a6a2a');
    for (let i = 0; i < w; i += 6) R(ctx, x0 + ((i - t * 30) % w + w) % w, sy + 32, 4, 6, i % 12 ? '#3a3c44' : '#5a5c64'); // stands
    R(ctx, x0, sy + 42, w, 22, '#3a3c44');
    for (let i = 0; i < w; i += 16) R(ctx, x0 + ((i - t * 200) % w + w) % w, sy + 52, 8, 1, '#f0f0f0');
    for (let i = 0; i < w; i += 8) R(ctx, x0 + ((i - t * 200) % w + w) % w, sy + 64, 8, 2, (i / 8) % 2 ? '#e8343a' : '#f0f0f0');
    const cars = [['#e8343a', 0], ['#3a7ad8', 26], ['#ffd23a', 50]];
    for (const [c, off] of cars) {
      const cx = x0 + ((t * 18 + off * 4 + Math.sin(t + off) * 8) % (w + 120)) - 60;
      ctx.save();
      ctx.translate(cx, sy + 60);
      ctx.scale(0.5, 0.5);
      f1car(ctx, 0, 0, c);
      ctx.restore();
    }
  } else if (ch === 'warp') {
    R(ctx, x0, sy, w, h, '#02020a');
    for (let i = 0; i < 60; i++) {
      const a = i * 2.4;
      const d = ((t * 40 + i * 13) % 140);
      const px = x0 + w / 2 + Math.cos(a) * d;
      const py = sy + h / 2 + Math.sin(a) * d * 0.5;
      R(ctx, px, py, d > 70 ? 2 : 1, 1, '#ffffff');
    }
  } else if (ch === 'eq') {
    R(ctx, x0, sy, w, h, '#0a0614');
    for (let i = 0; i < w; i += 8) {
      const bh = Math.round((Math.sin(t * 6 + i * 0.3) * 0.5 + 0.5) * (Math.sin(t * 2.3 + i * 0.07) * 0.5 + 0.5) * (h - 10)) + 4;
      for (let j = 0; j < bh; j += 3) R(ctx, x0 + i + 1, sy + h - 4 - j, 6, 2, mix('#3dff9a', '#ff3d9a', j / h));
    }
  } else {
    for (let j = 0; j < h; j++) R(ctx, x0, sy + j, w, 1, mix('#2a1a4a', '#ff8a4a', j / h));
    for (let k = -10; k <= 10; k++) R(ctx, x0 + w / 2 - Math.round(Math.sqrt(100 - k * k)), sy + 44 + k, Math.round(Math.sqrt(100 - k * k)) * 2, 1, '#fff2b0');
    let px = x0;
    let s = 7;
    while (px < x0 + w) {
      s = (s * 9301 + 49297) % 233280;
      const bw = 8 + (s % 14);
      const bh = 10 + (s % 22);
      R(ctx, px, sy + h - bh, bw, bh, '#1a0a20');
      px += bw;
    }
  }
  ctx.restore();
  // projector beam
  ctx.fillStyle = 'rgba(200,220,255,0.04)';
  ctx.beginPath();
  ctx.moveTo(f.x1 - 20, f.top + 14);
  ctx.lineTo(X.screen1, sy + 6);
  ctx.lineTo(X.screen1, sy + h - 6);
  ctx.fill();
}

export function npcs(f) {
  return [
    new Walker({ id: 'mechanic', name: 'Pit mechanic', look: LOOKS.guestA, floor: f.id, x: 300, min: 110, max: 380, speed: 14, lines: ['Tyres stacked by compound: red soft, yellow medium, white hard.', 'Inspect the car — the museum card has the legends.'] }),
    new Walker({ id: 'fan', name: 'F1 fan', look: LOOKS.student, floor: f.id, x: 1000, min: 830, max: 1090, speed: 12, lines: ['Seven titles each. Hamilton and Schumacher. Still can’t pick.', 'Live timing’s coming to the Pit Wall someday.'] }),
  ];
}

export function objects(f) {
  return [
    { id: 'car', x: X.car, label: 'Display car', verb: 'Inspect', panel: 'cars' },
    { id: 'tyres', x: X.tyres + 10, label: 'Tyre stack', verb: 'Inspect', panel: 'tyres' },
    { id: 'tracks', x: (X.map0 + X.map1) / 2, label: 'Track Room', verb: 'Study', panel: 'circuits' },
    { id: 'pitwall', x: (X.pit0 + X.pit1) / 2, label: 'Pit Wall', verb: 'Read', panel: 'pitwall' },
    { id: 'champions', x: (X.hall0 + X.hall1) / 2, label: 'Hall of Champions', verb: 'View', panel: 'champions' },
    { id: 'cinema', x: X.terminal, label: 'Cinema terminal', verb: 'Use', panel: 'cinema' },
  ];
}
export const doors = doorX;

// ── panels ───────────────────────────────────────────────────────────────────
register('cars', () => `<p class="px-kicker">The Garage · car museum</p><h2 id="panel-title">Iconic cars</h2>
  ${iconicCars.map((c) => `<h3>${esc(c.year)} · ${esc(c.name)}</h3><p><b>${esc(c.drivers)}</b> — ${esc(c.fact)}</p>`).join('')}`);
register('tyres', () => `<p class="px-kicker">The Garage</p><h2 id="panel-title">Tyre compounds</h2>
  <ul class="px-list">${tyres.map((t) => `<li><span class="swatch" style="background:${t.color}"></span><b>${esc(t.name)}</b> — ${esc(t.note)}</li>`).join('')}</ul>`);
register('circuits', () => `<p class="px-kicker">Track Room</p><h2 id="panel-title">Circuits</h2>
  <ul class="px-floors">${circuits.map((c) => `<li><button type="button"><b>${esc(String(c.since))}</b><span>${esc(c.name)} · ${esc(c.country)}</span><em>${c.km} km · ${c.laps} laps</em></button></li>`).join('')}</ul>
  <p class="px-note">Year = first Formula One World Championship race held there.</p>`);
register('pitwall', () => `<p class="px-kicker">Pit Wall</p><h2 id="panel-title">Race weekend, decoded</h2>
  <ul class="px-list"><li><b>Practice</b> — teams test set-ups.</li><li><b>Qualifying</b> — Q1, Q2, Q3 decide the grid.</li><li><b>Race</b> — points for the top 10: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1.</li></ul>
  <p class="px-note">The screens show sample timing. Live standings will come later.</p>`);
register('champions', () => `<p class="px-kicker">Hall of Champions</p><h2 id="panel-title">Most drivers’ titles</h2>
  <ul class="px-floors">${champions.map((c) => `<li><button type="button"><b>${c.titles}×</b><span>${esc(c.name)}</span><em>${esc(c.years)}</em></button></li>`).join('')}</ul>
  <p class="px-note">Through the 2024 season.</p>`);
register('cinema', (a, g) => {
  const el = document.createElement('div');
  el.innerHTML = `<p class="px-kicker">Cinema</p><h2 id="panel-title">Now showing</h2><p>Pick a channel — it plays on the big screen.</p>
    <div class="px-row">${Object.entries(CHANNELS).map(([k, v]) => `<button class="px-btn${(g.flags.channel || 'race') === k ? ' primary' : ''}" type="button" data-ch="${k}">${esc(v)}</button>`).join('')}</div>`;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ch]');
    if (!b) return;
    g.setFlag('channel', b.dataset.ch);
    el.querySelectorAll('[data-ch]').forEach((x) => x.classList.toggle('primary', x === b));
  });
  return el;
});
