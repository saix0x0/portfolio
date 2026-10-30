// ─────────────────────────────────────────────────────────────────────────────
//  LOCKED FLOORS — simple local unlocks, not security (owner's choice).
//  B  MYSTERY BASEMENT (theme: basement) — keycard from the Study.
//  PH PENTHOUSE        (theme: penthouse) — code 1729, clue in the basement.
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, sign, windowHole, lightCone, screen, plant, R, P, text, glow, mix } from '../kit.js';
import { register } from '../panels.js';
import { href } from '../../core/base.js';

// ── B · Mystery Basement ─────────────────────────────────────────────────────
const TB = THEMES.basement;
export const basement = {
  paint(ctx, f) {
    shell(ctx, f, TB, f.x0, f.x1, { panel: 0, wainscot: 0, floor: 'checker' });
    const y = f.y - 8;
    // brick texture
    for (let by = f.top + 12; by < y - 4; by += 6) for (let bx = f.x0 + ((by / 6) % 2) * 8; bx < f.x1; bx += 16) R(ctx, bx, by, 15, 5, mix(TB.wall, '#1a1e30', ((bx * by) % 7) / 14));
    // pipes along the ceiling
    for (const py of [f.top + 12, f.top + 18]) R(ctx, f.x0, py, f.x1 - f.x0, 3, '#2a3040');
    for (let x = f.x0 + 40; x < f.x1; x += 120) R(ctx, x, f.top + 10, 4, 14, '#3a4258');
    sign(ctx, 'NO GUESTS BEYOND', 200, f.top + 34, TB.neonC, 1);
    // blueprint wall (the hotel's hidden history)
    R(ctx, 360, f.top + 30, 130, 60, '#0a1a3a');
    R(ctx, 360, f.top + 30, 130, 1, '#4a6ab0');
    for (let i = 0; i < 6; i++) R(ctx, 370 + i * 18, f.top + 40, 12, 40, 'rgba(120,160,255,0.15)');
    text(ctx, 'HOTEL BLUEPRINT', 368, f.top + 84, '#8aa8e8');
    // crates
    for (const [cx, n] of [[560, 3], [620, 2], [1240, 2]]) for (let k = 0; k < n; k++) {
      R(ctx, cx, y - 14 - k * 14, 20, 14, '#3a2a1a');
      R(ctx, cx, y - 14 - k * 14, 20, 1, '#5a4228');
      R(ctx, cx + 9, y - 14 - k * 14, 2, 14, '#2a1a10');
    }
    // secret terminal
    R(ctx, 940, y - 28, 50, 28, '#10141e');
    screen(ctx, 946, y - 50, 38, 20, '#1a2030', false);
    // archive door
    R(ctx, 1380, y - 50, 40, 50, '#1a1e2e');
    R(ctx, 1384, y - 46, 32, 46, '#262c40');
    for (let a = 0; a < 6.28; a += 0.5) P(ctx, 1400 + Math.cos(a) * 9, y - 26 + Math.sin(a) * 9, '#6a7aa0');
    text(ctx, 'ARCHIVE', 1386, y - 58, TB.neonB);
  },
  lights(l, f) {
    for (const x of [200, 700, 1100]) lightCone(l, x, f.top + 22, f, TB.light, 4, 50, 0.08);
    glow(l, 965, f.y - 40, 40, TB.neonA, 0.2);
    glow(l, 1400, f.y - 30, 40, TB.neonB, 0.12);
  },
  dyn(ctx, f, t) {
    const y = f.y - 8;
    R(ctx, 946, y - 50, 38, 20, '#021008');
    const glitch = Math.sin(t * 13) > 0.92;
    text(ctx, glitch ? '17#9' : '1729', 956, y - 44, glitch ? TB.neonC : TB.neonA);
    // floating artifact
    const ax = 760;
    const ay = y - 36 + Math.round(Math.sin(t * 1.5) * 3);
    const s = Math.round(4 + Math.sin(t * 2) * 2);
    R(ctx, ax - s, ay - 4, s * 2, 8, TB.neonB);
    R(ctx, ax - 4, ay - s, 8, s * 2, mix(TB.neonB, '#fff', 0.3));
    // flicker bulb
    if (Math.sin(t * 7) > -0.6) R(ctx, 700, f.top + 22, 3, 3, '#e8ffe8');
  },
  objects() {
    return [
      { id: 'blueprint', x: 425, label: 'Hotel blueprint', verb: 'Read', panel: 'blueprint' },
      { id: 'artifact', x: 760, label: 'Floating artifact', verb: 'Inspect', panel: 'artifact' },
      { id: 'b-terminal', x: 965, label: 'Old terminal', verb: 'Use', panel: 'bterminal' },
      { id: 'archive', x: 1400, label: 'Archive door', verb: 'Open', panel: 'archive' },
    ];
  },
};

register('blueprint', () => `<p class="px-kicker">Mystery Basement</p><h2 id="panel-title">The hotel blueprint</h2>
  <p>The original plans show floors nobody has built yet: a Laboratory, Acad Space, an Observatory, an Arcade, a Sky Lounge on the roof — and doors leading <i>out</i> of the hotel entirely.</p>
  <p class="px-note">Every one of them is on the roadmap.</p>`);
register('artifact', () => `<p class="px-kicker">Floating artifact</p><h2 id="panel-title">It hums in 4/4.</h2><p>Nobody remembers who left it here. It rotates slightly faster when you think about unfinished projects.</p>`);
register('bterminal', (a, g) => `<p class="px-kicker">Old terminal</p><h2 id="panel-title">1729</h2>
  <p>The screen shows one number. A sticky note underneath: <i>“the smallest number expressible as the sum of two cubes in two different ways — upstairs it opens the top.”</i></p>
  <p class="px-note">Secret 3 of 3 is upstairs: take the elevator and try the Penthouse keypad.</p>`);
register('archive', () => `<p class="px-kicker">Archive door</p><h2 id="panel-title">The archive</h2>
  <p>The archive is a separate sealed room on the site.</p>
  <div class="px-row"><a class="px-btn primary" href="${href('observatory/')}">Enter the archive ↗</a></div>`);

// ── PH · Penthouse ───────────────────────────────────────────────────────────
const TP = THEMES.penthouse;
export const penthouse = {
  paint(ctx, f) {
    shell(ctx, f, TP, f.x0, f.x1, { panel: 56, wainscot: 14, floor: 'planks' });
    const y = f.y - 8;
    windowHole(ctx, 120, f.top + 18, 560, y - 34 - f.top - 18, TP.trim, 7);
    windowHole(ctx, 860, f.top + 18, 520, y - 34 - f.top - 18, TP.trim, 6);
    sign(ctx, 'PENTHOUSE', 400, f.top + 30, TP.neonB, 1, false);
    // workstation desk
    R(ctx, 280, y - 24, 120, 4, '#c8c8e0');
    R(ctx, 284, y - 20, 3, 20, TP.trimLo);
    R(ctx, 393, y - 20, 3, 20, TP.trimLo);
    for (const sx of [296, 336]) screen(ctx, sx, y - 50, 34, 20, '#2a2a40');
    // lounge chair, plants, piano
    R(ctx, 980, y - 26, 30, 12, '#3a3a5a');
    R(ctx, 976, y - 14, 38, 8, '#4a4a6a');
    plant(ctx, 940, y, '#4a9a6a', '#3a3a5a');
    plant(ctx, 1360, y, '#4a9a6a', '#3a3a5a');
    R(ctx, 1140, y - 26, 70, 18, '#101018');
    R(ctx, 1140, y - 30, 70, 4, '#1a1a26');
    for (let k = 0; k < 14; k++) R(ctx, 1144 + k * 5, y - 12, 3, 3, k % 3 ? '#e8e8f0' : '#101018');
    R(ctx, 1146, y - 8, 3, 8, INK);
    R(ctx, 1201, y - 8, 3, 8, INK);
  },
  lights(l, f) {
    glow(l, 330, f.y - 40, 50, TP.neonC, 0.18);
    for (const x of [500, 1100]) lightCone(l, x, f.top + 12, f, TP.light, 8, 80, 0.07);
  },
  dyn(ctx, f, t) {
    const y = f.y - 8;
    for (const [i, sx] of [296, 336].entries()) {
      R(ctx, sx, y - 50, 34, 20, '#0a0a18');
      for (let r = 0; r < 4; r++) R(ctx, sx + 3, y - 47 + r * 4, 10 + ((Math.sin(t * 1.3 + r + i * 3) * 0.5 + 0.5) * 18) | 0, 2, i ? '#9b8cff' : '#ffd8a8');
    }
  },
  objects() {
    return [
      { id: 'workstation', x: 340, label: 'Owner workstation', verb: 'Use', panel: 'workstation' },
      { id: 'piano', x: 1175, label: 'Piano', verb: 'Play', panel: 'piano' },
    ];
  },
};
register('workstation', () => `<p class="px-kicker">Penthouse</p><h2 id="panel-title">The owner’s desk</h2>
  <p>Private notes, ideas and the scratchpad live here.</p>
  <div class="px-row"><a class="px-btn primary" href="${href('vault/')}">Private notes (vault) ↗</a><a class="px-btn" href="${href('lab/')}#notebook">Scratchpad ↗</a><a class="px-btn" href="${href('compass/')}">My links ↗</a></div>`);
register('piano', () => `<p class="px-kicker">Penthouse</p><h2 id="panel-title">♪ ♫ ♪</h2><p>You play three notes. The city outside seems to slow down for a second.</p>`);
