// ─────────────────────────────────────────────────────────────────────────────
//  FLOOR 1 — COMMUNICATIONS LOUNGE  (theme: comms — teal, cyan, coral)
//  Message terminal (contact form) · pneumatic mail tubes · channel wall
//  (socials) · lounge with the dish outside · opportunities desk (hiring)
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, sign, windowHole, lightCone, partition, screen, sofa, plant, R, P, text, glow } from '../kit.js';
import { Walker, LOOKS } from '../actors.js';
import { register, todo } from '../panels.js';
import { esc, href } from '../../core/base.js';
import { site } from '../../../../content/site.js';

const T = THEMES.comms;
const X = { terminal: 210, tubes: 360, wall0: 448, wall1: 712, window0: 880, window1: 1290, desk: 1400 };
const doorX = [424];

export function paint(ctx, f) {
  shell(ctx, f, T, f.x0, f.x1, { panel: 32, wainscot: 18 });
  const y = f.y - 8;
  sign(ctx, 'COMMS', 120, f.top + 24, T.neonA, 2);
  // big message terminal
  R(ctx, X.terminal - 50, y - 30, 100, 30, '#0c1a1e');
  R(ctx, X.terminal - 52, y - 33, 104, 4, T.trim);
  for (let k = 0; k < 10; k++) R(ctx, X.terminal - 40 + k * 8, y - 28, 6, 3, '#1e3a40');
  screen(ctx, X.terminal - 42, f.top + 30, 84, 46, '#16343a', false);
  R(ctx, X.terminal - 2, f.top + 78, 4, y - 33 - f.top - 78, '#16343a');
  // pneumatic tubes
  for (const tx of [X.tubes, X.tubes + 14]) {
    R(ctx, tx, f.top + 10, 8, y - 18 - f.top - 10, 'rgba(160,240,255,0.10)');
    R(ctx, tx, f.top + 10, 1, y - 18 - f.top - 10, '#2ab3a6');
    R(ctx, tx + 7, f.top + 10, 1, y - 18 - f.top - 10, '#2ab3a6');
    R(ctx, tx - 2, y - 20, 12, 6, T.trim);
  }
  partition(ctx, f, T, doorX[0]);
  // channel wall
  R(ctx, X.wall0, f.top + 18, X.wall1 - X.wall0, 72, INK);
  R(ctx, X.wall0 + 2, f.top + 20, X.wall1 - X.wall0 - 4, 68, '#061014');
  sign(ctx, 'CHANNELS', (X.wall0 + X.wall1) / 2, f.top + 96, T.neonA, 1, false);
  // lounge + window with the dish outside
  windowHole(ctx, X.window0, f.top + 22, X.window1 - X.window0, y - 44 - f.top - 22, T.trim, 4);
  R(ctx, X.window0 - 6, y - 40, X.window1 - X.window0 + 12, 4, T.trimLo);
  sofa(ctx, 920, y, 70, '#b04a3e', '#d0604e');
  sofa(ctx, 1160, y, 70, '#b04a3e', '#d0604e');
  R(ctx, 1040, y - 16, 40, 2, '#c0f0f0');
  R(ctx, 1044, y - 14, 2, 10, T.trimLo);
  R(ctx, 1074, y - 14, 2, 10, T.trimLo);
  plant(ctx, 860, y);
  plant(ctx, 1320, y, '#2a8a6a');
  // opportunities desk
  R(ctx, X.desk - 30, y - 24, 60, 24, '#10262c');
  R(ctx, X.desk - 32, y - 27, 64, 3, T.trim);
  screen(ctx, X.desk - 12, y - 44, 24, 14, '#16343a');
  sign(ctx, 'HIRING', X.desk, f.top + 30, T.neonC, 1);
}

export function lights(l, f) {
  glow(l, X.terminal, f.top + 52, 70, T.neonA, 0.16);
  glow(l, (X.wall0 + X.wall1) / 2, f.top + 54, 90, T.neonA, 0.1);
  for (const cx of [1000, 1200]) lightCone(l, cx, f.top + 12, f, T.light, 8, 70, 0.07);
  glow(l, X.desk, f.y - 40, 26, T.neonC, 0.2);
  glow(l, 120, f.top + 28, 40, T.neonA, 0.2);
}

export function dyn(ctx, f, t) {
  const y = f.y - 8;
  // terminal screen
  const sx = X.terminal - 42;
  const sy = f.top + 30;
  R(ctx, sx, sy, 84, 46, '#041418');
  text(ctx, 'SEND A', sx + 8, sy + 8, T.neonA);
  text(ctx, 'MESSAGE', sx + 8, sy + 16, T.neonA);
  for (let i = 0; i < 3; i++) R(ctx, sx + 8, sy + 28 + i * 5, 40 + ((Math.sin(t + i) * 0.5 + 0.5) * 24) | 0, 2, '#16646a');
  if (Math.sin(t * 4) > 0) R(ctx, sx + 38, sy + 16, 3, 5, T.neonA);
  // mail capsules zipping up the tubes
  for (const [k, tx] of [[0, X.tubes], [1, X.tubes + 14]]) {
    const span = y - 22 - (f.top + 12);
    const cy = y - 22 - (((t * 60 + k * 40) % span));
    R(ctx, tx + 2, cy, 4, 7, k ? T.neonB : '#e8f0f0');
  }
  // channel wall icons
  const ch = [['@', 'EMAIL', !!site.email], ...site.socials.map((s) => [s.label[0], s.label.toUpperCase().slice(0, 8), !!s.url])];
  ch.slice(0, 4).forEach(([icon, label, on], i) => {
    const cx = X.wall0 + 18 + i * 64;
    const cy = f.top + 30;
    R(ctx, cx, cy, 40, 40, on ? '#0c2a30' : '#0a1418');
    R(ctx, cx, cy, 40, 1, on ? T.neonA : '#1e3a40');
    text(ctx, icon, cx + 14, cy + 10, on ? T.neonA : '#2a4a50', 3);
    text(ctx, label, cx + 20 - Math.round((label.length * 4 - 1) / 2), cy + 32, on ? '#d8f8f8' : '#3a5a60');
  });
  // desk screen
  R(ctx, X.desk - 12, y - 44, 24, 14, '#041418');
  text(ctx, site.hiring.open ? 'OPEN' : 'BUSY', X.desk - 7, y - 40, site.hiring.open ? '#a6ff6b' : T.neonB);
}

export function npcs(f) {
  return [new Walker({ id: 'operator', name: 'Switchboard operator', look: LOOKS.guestB, floor: f.id, x: 1100, min: 900, max: 1300, speed: 10, lines: ['Every message from that terminal goes straight to the owner.', 'Looking to hire? The desk by the window has the details.'] })];
}

export function objects() {
  return [
    { id: 'terminal', x: X.terminal, label: 'Message terminal', verb: 'Use', panel: 'contact' },
    { id: 'channels', x: (X.wall0 + X.wall1) / 2, label: 'Channel wall', verb: 'Read', panel: 'channels' },
    { id: 'hiring', x: X.desk, label: 'Opportunities desk', verb: 'Read', panel: 'hiring' },
  ];
}
export const doors = doorX;

register('channels', () => {
  const rows = [['Email', site.email ? `mailto:${site.email}` : '', site.email], ...site.socials.map((s) => [s.label, s.url, s.url])];
  return `<p class="px-kicker">Channel wall</p><h2 id="panel-title">Ways to reach me</h2>
    <ul class="px-floors">${rows.map(([n, u, v]) => `<li>${u ? `<a class="chan" href="${esc(u)}" target="_blank" rel="noopener"><b>${esc(n)}</b><span>${esc(v)}</span><em>open ↗</em></a>` : `<button type="button" class="locked"><b>${esc(n)}</b><span>not set yet</span><em>content/site.js</em></button>`}</li>`).join('')}</ul>
    <div class="px-row"><button class="px-btn primary" type="button" data-panel="contact">Write a message</button></div>`;
});
register('hiring', () => {
  const h = site.hiring;
  return `<p class="px-kicker">Opportunities desk · ${h.open ? 'open' : 'not looking'}</p><h2 id="panel-title">${todo(h.headline)}</h2>
    <ul class="px-list">${h.lookingFor.map((l) => `<li>${todo(l)}</li>`).join('')}</ul>${h.note ? `<p>${esc(h.note)}</p>` : ''}
    <div class="px-row">${h.resume ? `<a class="px-btn primary" href="${href(h.resume)}" download>Résumé ⇩</a>` : '<span class="px-note">Résumé: add a PDF path in content/site.js</span>'}
    <button class="px-btn" type="button" data-panel="contact">Get in touch</button><a class="px-btn" href="${href('portfolio/')}#nyc">Skills & projects ↗</a></div>`;
});
