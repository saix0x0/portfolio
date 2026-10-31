// ─────────────────────────────────────────────────────────────────────────────
//  FLOOR 3 — RACING PAVILION & CINEMA  (theme: pavilion — asphalt, racing red,
//  kerb stripes, timing-screen green)
//  Garage (car + tyres) · Track Room · Pit Wall · Hall of Champions · Cinema
//  Data: content/f1.js (history) + core/f1live.js (this season, live from the
//  Jolpica API). The Pit Wall screens show real standings; the start gantry
//  in the garage is a reaction-time game. The cinema plays the chosen channel.
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, sign, lamp, lightCone, partition, screen, R, P, text, glow, mix } from '../kit.js';
import { Walker, LOOKS } from '../actors.js';
import { register } from '../panels.js';
import { esc } from '../../core/base.js';
import { iconicCars, circuits, champions, tyres } from '../../../../content/f1.js';
import { f1Live, countdown, teamColour } from '../../core/f1live.js';

let LIVE = null; // filled once the API answers; screens show "LOADING" until then
f1Live().then((d) => (LIVE = d));

const T = THEMES.pavilion;
const X = { lights: 334, car: 190, tyres: 74, map0: 430, map1: 700, pit0: 818, pit1: 960, hall0: 972, hall1: 1094, cinema0: 1126, screen0: 1176, screen1: 1460, terminal: 1146 };
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
  // start-light gantry (reaction game)
  R(ctx, X.lights - 34, f.top + 40, 68, 16, '#141418');
  R(ctx, X.lights - 34, f.top + 40, 68, 1, '#3a3c44');
  R(ctx, X.lights - 2, f.top + 30, 4, 10, '#2a2c34');
  text(ctx, 'LIGHTS OUT', X.lights - 19, f.top + 60, '#a8aab8');
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
  // start gantry: idles through a lights-out sequence every few seconds
  const seq = (t % 7) / 0.6;
  for (let i = 0; i < 5; i++) {
    const on = seq > i + 1 && seq < 7.5;
    R(ctx, X.lights - 30 + i * 13, f.top + 43, 9, 10, '#0a0a0c');
    R(ctx, X.lights - 28 + i * 13, f.top + 45, 5, 6, on ? '#ff2a3a' : '#2a0a0e');
  }
  // pit wall: four live timing screens (this season, from the API)
  const scr = (i) => [X.pit0 + 8 + i * 34, y - 68];
  for (let i = 0; i < 4; i++) R(ctx, ...scr(i), 28, 20, '#04100a');
  if (!LIVE) {
    for (let i = 0; i < 4; i++) if (Math.sin(t * 3 + i) > 0) text(ctx, '...', scr(i)[0] + 8, scr(i)[1] + 8, '#3dff9a');
  } else {
    // 1: championship top 3
    LIVE.drivers.slice(0, 3).forEach((d, r) => {
      const [sx, sy] = scr(0);
      R(ctx, sx + 1, sy + 2 + r * 6, 1, 5, teamColour(d.team));
      text(ctx, d.code, sx + 3, sy + 2 + r * 6, r ? '#3dff9a' : '#ffd23a');
    });
    // 2: points of the top 3
    LIVE.drivers.slice(0, 3).forEach((d, r) => text(ctx, String(d.pts), scr(1)[0] + 3, scr(1)[1] + 2 + r * 6, '#3dff9a'));
    // 3: last winner
    const w = LIVE.last?.results[0];
    if (w) { text(ctx, 'WIN', scr(2)[0] + 3, scr(2)[1] + 3, '#b07cff'); text(ctx, w.code, scr(2)[0] + 3, scr(2)[1] + 11, '#f4f0ff'); }
    // 4: next race countdown
    const [nx, ny] = scr(3);
    text(ctx, 'NEXT', nx + 3, ny + 3, '#ffd23a');
    text(ctx, LIVE.next ? countdown(LIVE.next.at).split(' ')[0].toUpperCase() : 'FIN', nx + 3, ny + 11, '#3dff9a');
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
    new Walker({ id: 'mechanic', name: 'Pit mechanic', look: LOOKS.mechanic, floor: f.id, x: 300, min: 110, max: 380, speed: 14, lines: ['Box, box! …sorry, habit.', 'The Pit Wall is live now — real standings from this season.', 'Fancy your reflexes? The start lights by the garage time you to the millisecond.'] }),
    new Walker({ id: 'fan', name: 'F1 fan', look: { skin: '#e2b08a', hair: 'long', hairC: '#8a5a2e', top: 'tee', topC: '#e8002d', legs: '#2a3a5a', shoes: '#f0f0f4', sole: '#e8002d', acc: ['cap'], accC: '#e8002d' }, floor: f.id, x: 1000, min: 830, max: 1090, speed: 12, lines: ['Lights out and away we go!', 'Seven titles each. Hamilton and Schumacher. Still can’t pick.', 'Check the Pit Wall — it knows when the next race is.'] }),
  ];
}

export function objects(f) {
  return [
    { id: 'lights', x: X.lights, label: 'Start lights', verb: 'Race', panel: 'lightsout' },
    { id: 'car', x: X.car, label: 'Display car', verb: 'Inspect', panel: 'cars' },
    { id: 'tyres', x: X.tyres + 10, label: 'Tyre stack', verb: 'Inspect', panel: 'tyres' },
    { id: 'tracks', x: (X.map0 + X.map1) / 2, label: 'Track Room', verb: 'Study', panel: 'circuits' },
    { id: 'pitwall', x: (X.pit0 + X.pit1) / 2, label: 'Pit Wall · live', verb: 'Read', panel: 'pitwall' },
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
register('pitwall', () => {
  const el = document.createElement('div');
  const draw = (d) => {
    if (!d) {
      el.innerHTML = `<p class="px-kicker">Pit Wall</p><h2 id="panel-title">No signal.</h2><p>The live feed didn’t answer (offline, or the API is resting). The screens will retry next visit.</p>
        <ul class="px-list"><li><b>Qualifying</b> — Q1, Q2, Q3 decide the grid.</li><li><b>Race</b> — points for the top 10: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1.</li></ul>`;
      return;
    }
    const row = (pos, code, name, team, val) => `<li><span class="f1-pos">${pos}</span><span class="f1-bar" style="background:${teamColour(team)}"></span><b>${esc(code)}</b><span>${esc(name)}</span><em>${esc(val)}</em></li>`;
    const L = d.last;
    const mins = Math.round((Date.now() - d.fetched) / 60000);
    el.innerHTML = `<p class="px-kicker">Pit Wall · live · ${esc(d.season)} season</p><h2 id="panel-title">${L ? esc(L.name) : 'Season ' + esc(d.season)}</h2>
      ${L ? `<p class="px-note">Round ${L.round} of ${d.rounds} · ${esc(L.circuit)} · ${esc(L.place)} · ${esc(new Date(L.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }))}</p>
      <div class="f1-podium">${[1, 0, 2].map((i) => L.results[i] ? `<div class="p${i + 1}"><b>${esc(L.results[i].code)}</b><span>${esc(L.results[i].team)}</span><i>${i + 1}</i></div>` : '').join('')}</div>
      <h3>Race result</h3><ol class="f1-table">${L.results.map((r) => row(r.pos, r.code, r.name + (r.fastest ? ' ⏱' : ''), r.team, r.time)).join('')}</ol>` : ''}
      ${d.next ? `<div class="f1-next"><span>NEXT</span><b>${esc(d.next.name)}</b><em data-cd>${esc(countdown(d.next.at))}</em><small>${esc(d.next.place)} · ${esc(new Date(d.next.at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))} your time</small></div>` : '<p>The season is over. See you at the next lights out.</p>'}
      <div class="px-cols"><div><h3>Drivers</h3><ol class="f1-table">${d.drivers.map((r) => row(r.pos, r.code, r.name, r.team, r.pts + ' pts')).join('')}</ol></div>
      <div><h3>Constructors</h3><ol class="f1-table">${d.teams.map((r) => row(r.pos, r.name.slice(0, 3).toUpperCase(), r.name, r.name, r.pts + ' pts')).join('')}</ol></div></div>
      <p class="px-note">Live data from the free Jolpica F1 API · refreshed ${mins < 1 ? 'just now' : mins + ' min ago'}.</p>`;
  };
  el.innerHTML = '<p class="px-kicker">Pit Wall</p><h2 id="panel-title">Connecting to timing…</h2>';
  f1Live().then(draw);
  return el;
});

// ── Lights out: a reaction-time game on the garage's start gantry
register('lightsout', (a, g) => {
  const el = document.createElement('div');
  el.innerHTML = `<p class="px-kicker">The Garage · start gantry</p><h2 id="panel-title">Lights out.</h2>
    <p>Five red lights come on one by one. When they all go out — go. Click, tap or press Space.</p>
    <button class="lights" type="button" autofocus aria-label="Start lights. Press to start, then press again when the lights go out.">${'<i></i>'.repeat(5)}</button>
    <p class="lights-msg" aria-live="polite">Press to line up on the grid.</p>
    <p class="px-note">Your best: <b data-best>${g.flags.reaction ? g.flags.reaction + ' ms' : '—'}</b> · F1 drivers average around 200 ms.</p>`;
  const btn = el.querySelector('.lights');
  const lamps = [...btn.querySelectorAll('i')];
  const msg = el.querySelector('.lights-msg');
  let state = 'idle';
  let timers = [];
  let outAt = 0;
  const clear = () => (timers.forEach(clearTimeout), (timers = []));
  const verdict = (ms) => ms < 150 ? 'Are you sure you’re not a robot?' : ms < 200 ? 'Pole-position reflexes.' : ms < 260 ? 'Solid launch. Points finish.' : ms < 350 ? 'Bogged down a little. Midfield.' : 'Stalled on the grid. Again?';
  const press = () => {
    if (state === 'idle' || state === 'done') {
      clear();
      state = 'arming';
      lamps.forEach((l) => l.classList.remove('on'));
      msg.textContent = 'Eyes on the lights…';
      lamps.forEach((l, i) => timers.push(setTimeout(() => l.classList.add('on'), 700 + i * 900)));
      timers.push(setTimeout(() => {
        lamps.forEach((l) => l.classList.remove('on'));
        state = 'go';
        outAt = performance.now();
      }, 700 + 4 * 900 + 400 + Math.random() * 2600));
    } else if (state === 'arming') {
      clear();
      state = 'done';
      lamps.forEach((l) => l.classList.add('jump'));
      setTimeout(() => lamps.forEach((l) => l.classList.remove('jump', 'on')), 600);
      msg.textContent = 'JUMP START! Drive-through penalty. Press to try again.';
    } else if (state === 'go') {
      const ms = Math.round(performance.now() - outAt);
      state = 'done';
      const best = !g.flags.reaction || ms < g.flags.reaction;
      if (best) g.setFlag('reaction', ms), (el.querySelector('[data-best]').textContent = ms + ' ms');
      msg.innerHTML = `<b>${ms} ms</b> — ${esc(verdict(ms))}${best ? ' <span class="tag">new best</span>' : ''} Press to go again.`;
    }
  };
  btn.addEventListener('pointerdown', (e) => (e.preventDefault(), press()));
  btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.preventDefault(), press(); });
  return el;
});
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
