// ─────────────────────────────────────────────────────────────────────────────
//  FLOOR 2 — ART GALLERY  (theme: gallery — charcoal walls, spotlights, gold)
//  Every project is a framed exhibit, generated from content/projects.js:
//    West Hall  → featured + personal / open-source / work
//    College Wing (east) → college / hackathon / research
//    Journey corridor → extracurriculars timeline · Toolkit case → skills
//  Secret: the crooked painting "Strange Loop" swings open (key chain step 1).
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, sign, lightCone, R, P, text, glow, mix, hexA, partition } from '../kit.js';
import { rng } from '../gfx.js';
import { Walker, LOOKS } from '../actors.js';
import { register, todo, ph } from '../panels.js';
import { esc, href, hash } from '../../core/base.js';
import { projects, CATEGORIES, STATUS } from '../../../../content/projects.js';
import { extracurriculars } from '../../../../content/extracurriculars.js';
import { skillGroups } from '../../../../content/skills.js';

const T = THEMES.gallery;
const FW = 54; // frame width
const FH = 44; // frame height
const SECRET_X = 684;
const JOURNEY = [1218, 1418];
const TOOLKIT = 1452;
const doorX = [1208];

const west = projects.filter((p) => !['college', 'hackathon', 'research'].includes(p.category)).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
const east = projects.filter((p) => ['college', 'hackathon', 'research'].includes(p.category));

/** Spread exhibits across a hall; returns [{p, x}]. */
function hang(list, x0, x1, max) {
  const n = Math.min(list.length, max);
  if (!n) return [];
  const gap = (x1 - x0) / n;
  return list.slice(0, n).map((p, i) => ({ p, x: Math.round(x0 + gap * (i + 0.5)) }));
}
const WEST = hang(west, 150, 640, 6);
const EAST = hang(east, 820, 1136, 4);

const PALS = [
  ['#1d2858', '#e27486', '#ffc488'], ['#24163d', '#f0653d', '#ffbc60'], ['#0c1334', '#d65a7a', '#ff9e54'],
  ['#04122e', '#0a2946', '#3fd6a8'], ['#0f0828', '#1aa6a0', '#ffd46b'], ['#172569', '#ff5888', '#ffad66'],
];
/** A tiny procedural landscape painting, unique per project id. */
function painting(ctx, x, y, w, h, seed) {
  const hs = hash(seed);
  const r = rng(hs);
  const pal = PALS[hs % PALS.length];
  const style = (hs >> 4) % 3; // 0 skyline · 1 mountains · 2 sea
  for (let j = 0; j < h; j++) R(ctx, x, y + j, w, 1, j < h * 0.45 ? pal[0] : j < h * 0.75 ? pal[1] : pal[2]);
  if (style === 2 || pal[0] === '#04122e') for (let i = 0; i < 14; i++) P(ctx, x + r() * w, y + r() * h * 0.4, '#ffffff');
  const sx = x + 8 + Math.round(r() * (w - 16));
  const sy = y + Math.round(h * (0.3 + r() * 0.25));
  const sr = 3 + Math.round(r() * 3);
  for (let k = -sr; k <= sr; k++) R(ctx, sx - Math.round(Math.sqrt(sr * sr - k * k)), sy + k, Math.round(Math.sqrt(sr * sr - k * k)) * 2, 1, '#fff2c8');
  if (style === 0) {
    let px = x;
    while (px < x + w) {
      const bw = 3 + Math.round(r() * 7);
      const bh = Math.round(h * (0.12 + r() * 0.35));
      R(ctx, px, y + h - bh, Math.min(bw, x + w - px), bh, '#120818');
      if (r() < 0.5) P(ctx, px + 1, y + h - bh + 3, '#ffd27a');
      px += bw;
    }
  } else if (style === 1) {
    for (let i = 0; i < w; i++) {
      const m = Math.round(h * 0.55 + Math.sin(i / 6 + hs) * 5 + Math.sin(i / 2.3) * 2);
      R(ctx, x + i, y + m, 1, h - m, '#1a1030');
      if (Math.sin(i / 6 + hs) > 0.7) P(ctx, x + i, y + m, '#e8e0ff');
    }
  } else {
    R(ctx, x, y + Math.round(h * 0.68), w, h - Math.round(h * 0.68), '#120a28');
    for (let j = Math.round(h * 0.7); j < h; j += 2) R(ctx, sx - 4 + ((j * 3) % 5), y + j, 8 - ((j * 2) % 5), 1, '#ffd8a0');
  }
}

function frame(ctx, x, y, p, f) {
  const fx = x - FW / 2;
  R(ctx, fx - 3, y - 3, FW + 6, FH + 6, INK);
  R(ctx, fx - 2, y - 2, FW + 4, FH + 4, T.trim);
  R(ctx, fx - 1, y - 1, FW + 2, 1, mix(T.trim, '#fff', 0.4));
  painting(ctx, fx, y, FW, FH, p.id);
  // plaque (up to two lines)
  const py = y + FH + 8;
  const max = Math.floor((FW - 8) / 4);
  const words = p.title.toUpperCase().split(' ');
  const lines = [''];
  for (const wd of words) {
    const cur = lines[lines.length - 1];
    if ((cur + ' ' + wd).trim().length <= max) lines[lines.length - 1] = (cur + ' ' + wd).trim();
    else if (lines.length < 2) lines.push(wd.slice(0, max));
  }
  R(ctx, fx + 2, py, FW - 4, 6 + lines.length * 7, '#0e0c10');
  R(ctx, fx + 2, py, FW - 4, 1, T.trimLo);
  lines.forEach((ln, i) => text(ctx, ln, x - Math.round((ln.length * 4 - 1) / 2), py + 4 + i * 7, p.placeholder ? '#c8a050' : '#f0e6d0'));
  if (p.featured) R(ctx, fx + FW - 6, y - 6, 4, 4, T.neonB);
}

export function paint(ctx, f) {
  shell(ctx, f, T, f.x0, f.x1, { panel: 0, wainscot: 14, floor: 'planks' });
  const y = f.y - 8;
  const fy = f.top + 34;
  // track lighting rails
  R(ctx, f.x0, f.top + 14, f.x1 - f.x0, 2, '#2a2830');
  // foyer
  sign(ctx, 'ART GALLERY', 92, f.top + 30, T.neonA, 1);
  R(ctx, 72, y - 46, 40, 34, '#16141a');
  R(ctx, 72, y - 46, 40, 2, T.trim);
  text(ctx, 'EXHIBITS', 77, y - 40, T.trim);
  text(ctx, String(projects.length).padStart(2, '0'), 86, y - 30, '#f0e6d0');
  R(ctx, 90, y - 12, 4, 12, '#2a2830');
  // hall titles
  sign(ctx, 'WEST HALL', 400, f.top + 22, T.neonA, 1, false);
  sign(ctx, 'COLLEGE WING', 1010, f.top + 22, T.neonC, 1, false);
  sign(ctx, 'JOURNEY', 1318, f.top + 22, T.neonB, 1, false);
  for (const { p, x } of [...WEST, ...EAST]) frame(ctx, x, fy, p, f);
  // benches
  for (const bx of [330, 520, 980]) {
    R(ctx, bx - 22, y - 12, 44, 4, '#5a4a3a');
    R(ctx, bx - 18, y - 8, 3, 8, '#2a2420');
    R(ctx, bx + 15, y - 8, 3, 8, '#2a2420');
  }
  // college wing banner
  R(ctx, 1160, f.top + 30, 36, 70, '#1a2a4a');
  R(ctx, 1160, f.top + 30, 36, 2, T.trim);
  text(ctx, 'ACAD', 1171, f.top + 42, '#f0e6d0');
  text(ctx, 'SPACE', 1169, f.top + 50, '#f0e6d0');
  text(ctx, 'IIITH', 1169, f.top + 62, T.neonC);
  // Journey corridor: timeline wall
  partition(ctx, f, T, doorX[0]);
  const ly = f.top + 70;
  R(ctx, JOURNEY[0] + 8, ly, JOURNEY[1] - JOURNEY[0] - 16, 2, T.trimLo);
  const items = extracurriculars.slice(0, 6);
  items.forEach((x, i) => {
    const cx = JOURNEY[0] + 20 + ((JOURNEY[1] - JOURNEY[0] - 40) * (i + 0.5)) / Math.max(1, items.length);
    R(ctx, cx - 2, ly - 2, 5, 5, [T.neonA, T.neonB, T.neonC][i % 3]);
    const up = i % 2 === 0;
    R(ctx, cx, up ? ly - 18 : ly + 4, 1, 14, T.trimLo);
    R(ctx, cx - 14, up ? ly - 32 : ly + 18, 28, 14, '#16141a');
    text(ctx, String(x.year || ''), cx - 7, up ? ly - 28 : ly + 22, '#f0e6d0');
  });
  // toolkit display case
  R(ctx, TOOLKIT - 18, y - 56, 36, 56, '#16141a');
  R(ctx, TOOLKIT - 18, y - 56, 36, 2, T.trim);
  ctx.fillStyle = 'rgba(180,220,255,0.08)';
  ctx.fillRect(TOOLKIT - 16, y - 54, 32, 30);
  for (let i = 0; i < 4; i++) R(ctx, TOOLKIT - 12 + i * 7, y - 40, 4, 12, [T.neonA, T.neonB, T.neonC, '#a6ff6b'][i]);
  text(ctx, 'TOOLKIT', TOOLKIT - 13, y - 18, T.trim);
}

export function lights(l, f) {
  const fy = f.top + 34;
  for (const { x } of [...WEST, ...EAST]) {
    lightCone(l, x, f.top + 16, f, T.light, 6, 80, 0.12);
    glow(l, x, fy + FH / 2, 34, T.light, 0.14);
  }
  lightCone(l, SECRET_X, f.top + 16, f, T.light, 6, 60, 0.1);
  glow(l, 92, f.top + 32, 30, T.neonA, 0.25);
  glow(l, 1318, f.top + 70, 90, T.neonB, 0.08);
  glow(l, TOOLKIT, f.y - 40, 26, T.neonC, 0.2);
}

export function dyn(ctx, f, t, G) {
  const fy = f.top + 34;
  const open = G.flags?.secret_alcove;
  const x = SECRET_X - FW / 2;
  if (open) {
    // niche behind the swung-open painting
    R(ctx, x, fy, FW, FH, '#050408');
    R(ctx, x + 18, fy + 18, 18, 14, '#0a1a12');
    R(ctx, x + 20, fy + 20, 14, 8, Math.sin(t * 3) > 0 ? '#3dffb0' : '#1a8a5a');
    R(ctx, x + 6, fy + 34, 10, 6, '#e8dcc0');
    R(ctx, x - 6, fy - 2, 6, FH + 4, T.trim);
    R(ctx, x - 6, fy, 4, FH, mix(T.trim, '#000', 0.4));
  } else {
    // crooked: shear rows a little
    const tilt = 0.08 + Math.sin(t * 0.7) * 0.01;
    for (let j = -3; j < FH + 3; j++) {
      const off = Math.round((j - FH / 2) * tilt);
      R(ctx, x - 3 + off, fy + j, FW + 6, 1, j < -1 || j > FH ? INK : j < 0 || j >= FH ? T.trim : '#2a1a4a');
      if (j >= 0 && j < FH) for (let i = 0; i < FW; i += 6) if ((i + j) % 12 === 0) P(ctx, x + i + off, fy + j, '#ffe6b0');
    }
    text(ctx, '?', SECRET_X - 1, fy + FH / 2 - 2, '#ffe6b0');
  }
}

export function npcs(f) {
  return [
    new Walker({ id: 'critic', name: 'Curator', look: LOOKS.curator, floor: f.id, x: 330, min: 160, max: 620, speed: 10, lines: ['I always read the plaques. The details are in the case studies.', 'That painting by the elevator… is it just me, or is it crooked?'] }),
    new Walker({ id: 'student-g', name: 'Student', look: LOOKS.student, floor: f.id, x: 1000, min: 830, max: 1180, speed: 12, lines: ['The College Wing has the coursework projects. Recruiters love that wing.', 'Acad Space is getting its own floor someday.'] }),
  ];
}

export function objects(f) {
  return [
    { id: 'catalogue', x: 92, label: 'Exhibit catalogue', verb: 'Read', panel: 'catalogue' },
    ...[...WEST, ...EAST].map(({ p, x }) => ({ id: 'ex-' + p.id, x, label: p.title, verb: 'View', panel: 'exhibit', pid: p.id })),
    { id: 'strange-loop', x: SECRET_X, label: 'Crooked painting', verb: 'Inspect', panel: 'strangeloop' },
    { id: 'journey', x: (JOURNEY[0] + JOURNEY[1]) / 2, label: 'Journey wall', verb: 'Read', panel: 'journey' },
    { id: 'toolkit', x: TOOLKIT, label: 'Toolkit', verb: 'Inspect', panel: 'toolkit' },
  ];
}
export const doors = doorX;

// ── panels ───────────────────────────────────────────────────────────────────
const LINK = { code: 'Code', demo: 'Live demo', report: 'Report', video: 'Video', paper: 'Paper' };
register('exhibit', ({ pid }) => {
  const p = projects.find((x) => x.id === pid);
  if (!p) return null;
  const sec = (t, v) => (v ? `<h3>${t}</h3><p>${esc(v)}</p>` : '');
  const links = Object.entries(p.links || {}).filter(([, u]) => u);
  return `<p class="px-kicker">${esc(CATEGORIES[p.category]?.label || '')} · ${esc(p.period || p.year)} · ${esc(STATUS[p.status] || '')}</p>
    <h2 id="panel-title">${esc(p.title)}</h2>${p.subtitle ? `<p class="px-lede">${esc(p.subtitle)}</p>` : ''}${ph(p)}
    <p>${esc(p.summary || '')}</p>
    ${sec('Problem', p.problem)}${sec('What I built', p.solution)}${sec('My contribution', p.contribution)}
    ${p.highlights?.length ? `<h3>Highlights</h3><ul class="px-list">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
    <div class="px-tags" style="margin-top:12px">${(p.tech || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="px-row">${links.map(([k, u]) => `<a class="px-btn" href="${esc(u)}" target="_blank" rel="noopener">${LINK[k] || k} ↗</a>`).join('')}
      <a class="px-btn primary" href="${href('work/')}#p/${esc(p.id)}">Full case study ↗</a></div>`;
});

register('catalogue', () => `<p class="px-kicker">Art Gallery</p><h2 id="panel-title">Exhibit catalogue</h2>
  <ul class="px-floors">${projects.map((p) => `<li><button type="button" data-panel="exhibit" data-args='${JSON.stringify({ pid: p.id })}'><b>${esc(String(p.year))}</b><span>${esc(p.title)}</span><em>${esc(CATEGORIES[p.category]?.label || '')}${p.placeholder ? ' · placeholder' : ''}</em></button></li>`).join('')}</ul>
  <div class="px-row"><a class="px-btn" href="${href('work/')}">Open the full logbook ↗</a><a class="px-btn" href="${href('work/')}#college">College projects ↗</a></div>`);

register('journey', () => `<p class="px-kicker">Journey wall</p><h2 id="panel-title">Beyond the classroom</h2>
  ${extracurriculars.map((x) => `<h3>${esc(x.period || x.year)} · ${esc(x.kind)}</h3><p><b>${esc(x.title)}</b> ${x.org ? '· ' + esc(x.org) : ''} ${x.role ? '· ' + esc(x.role) : ''} ${ph(x)}</p><p>${esc(x.summary)}</p>${x.link ? `<a href="${esc(x.link)}" target="_blank" rel="noopener">More ↗</a>` : ''}`).join('')}`);

register('toolkit', () => `<p class="px-kicker">Toolkit</p><h2 id="panel-title">What I work with</h2>
  ${skillGroups.map((g) => `<h3>${esc(g.name)}</h3><div class="px-tags">${g.skills.map((s) => `<span class="tag">${todo(s)}</span>`).join('')}</div>`).join('')}
  <p class="px-note">No made-up proficiency bars, the exhibits are the proof.</p>`);

register('strangeloop', (a, g) => {
  if (!g.flags.secret_alcove) {
    g.setFlag('secret_alcove');
    return `<p class="px-kicker">Strange Loop · artist unknown</p><h2 id="panel-title">The painting swings open.</h2>
      <p>Behind it: a small niche, a humming terminal, and a folded note.</p>
      <blockquote class="px-note">“The key rests between strange loops.<br>Study, the philosophy shelf.”</blockquote>
      <p class="px-note">Secret 1 of 3 found.</p>`;
  }
  return `<p class="px-kicker">Strange Loop</p><h2 id="panel-title">The niche is still open.</h2><blockquote class="px-note">“The key rests between strange loops.<br>Study, the philosophy shelf.”</blockquote>`;
});
