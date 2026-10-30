// ─────────────────────────────────────────────────────────────────────────────
//  LANDMARK SCENES — procedural SVG silhouettes, no image files.
//  Each scene returns 3 layers (far / mid / near) in a 1600×700 viewBox,
//  bottom-anchored and cropped to fit (xMidYMax slice), so landmarks sit near
//  x=800 to survive narrow phone screens.
//  Colours come from CSS custom properties set per scene in home.css.
//  Interactive bits carry data-egg="…" and are wired up in eggs.js.
// ─────────────────────────────────────────────────────────────────────────────
import { seeded, lerp } from './base.js';

const f = (n) => Math.round(n * 10) / 10;
const layer = (name, depth, inner) =>
  `<svg class="layer layer-${name}" data-depth="${depth}" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${inner}</svg>`;

const glowDefs = (id) =>
  `<defs><filter id="${id}" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="6"/></filter></defs>`;

// ── PARIS ───────────────────────────────────────────────────────────────────
function rooftops(rand, y0, y1, color, lit) {
  let d = 'M0,700 ';
  let chimneys = '';
  let windows = '';
  let x = -10;
  while (x < 1610) {
    const w = 46 + rand() * 70;
    const top = y0 + rand() * (y1 - y0);
    const roof = 14 + rand() * 14;
    const ins = 7 + rand() * 5;
    d += `L${f(x)},${f(top)} L${f(x + ins)},${f(top - roof)} L${f(x + w - ins)},${f(top - roof)} L${f(x + w)},${f(top)} `;
    const nc = (rand() * 3) | 0;
    for (let i = 0; i < nc; i++) {
      const cx = x + ins + 4 + rand() * (w - 2 * ins - 12);
      chimneys += `<rect x="${f(cx)}" y="${f(top - roof - 8 - rand() * 8)}" width="${f(5 + rand() * 4)}" height="16"/>`;
    }
    if (rand() < 0.5) windows += `<rect x="${f(x + w / 2 - 3)}" y="${f(top - roof + 5)}" width="6" height="8"/>`;
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < Math.floor(w / 18); c++)
        if (rand() < 0.16) windows += `<rect x="${f(x + 6 + c * 18)}" y="${f(top + 10 + r * 22)}" width="6" height="10"/>`;
    x += w;
  }
  d += 'L1610,700 Z';
  return `<g fill="${color}"><path d="${d}"/>${chimneys}</g><g fill="${lit}" class="twinkle-slow">${windows}</g>`;
}

function eiffel() {
  // Silhouette designed bottom = 640, top of antenna = 80. evenodd cuts the arches.
  const o = `M580,640 Q660,560 712,454 L702,454 L702,438 L748,438 Q762,370 776,312 L764,312 L764,302 L784,302
    Q792,200 797,124 L798,80 L802,80 L803,124 Q808,200 816,302 L836,302 L836,312 L824,312 Q838,370 852,438
    L898,438 L898,454 L888,454 Q940,560 1020,640 L900,640 C890,560 850,522 800,520 C750,522 710,560 700,640 Z
    M768,438 C775,410 790,392 800,390 C810,392 825,410 832,438 Z`;
  // lattice — thin sky-coloured strokes read as ironwork
  let lat = '';
  for (let i = 0; i < 9; i++) {
    const y = 464 + i * 20;
    const t = (y - 454) / 186;
    const xl = lerp(712, 580, t);
    const xi = lerp(700, 706, t);
    lat += `M${f(xl + 6)},${y} L${f(xi + (712 - 700) * 0.3 + 20)},${y + 18} M${f(1600 - xl - 6)},${y} L${f(1600 - xi - 24)},${y + 18} `;
  }
  for (let y = 320; y < 430; y += 18) lat += `M${f(778 + (y - 312) * 0.2)},${y} L${f(822 - (y - 312) * 0.2)},${y + 14} M${f(822 - (y - 312) * 0.2)},${y} L${f(778 + (y - 312) * 0.2)},${y + 14} `;
  for (let y = 140; y < 300; y += 22) lat += `M${f(797 - (y - 124) * 0.05)},${y} L${f(803 + (y - 124) * 0.05)},${y + 18} `;

  // sparkle points (Eiffel twinkles on the hour; here it twinkles when clicked)
  const rand = seeded(11);
  const hw = (y) => (y < 302 ? lerp(3, 16, (y - 124) / 178) : y < 438 ? lerp(24, 52, (y - 312) / 126) : lerp(98, 220, (y - 454) / 186));
  let sp = '';
  for (let i = 0; i < 110; i++) {
    const y = 130 + rand() * 500;
    const x = 800 + (rand() * 2 - 1) * hw(y) * 0.92;
    sp += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.2 + rand() * 1.4)}" style="animation-delay:${f(rand() * 1.2)}s"/>`;
  }
  return `<g class="eiffel" data-egg="tower" transform="translate(180 0)">
    <g class="beacon"><path d="M800,84 L1600,60 L1600,108 Z M800,84 L0,60 L0,108 Z" fill="url(#beam)"/></g>
    <path d="${o}" fill="var(--mid)" fill-rule="evenodd"/>
    <path d="${lat}" stroke="var(--lattice)" stroke-width="1.4" fill="none" opacity=".55"/>
    <circle cx="800" cy="82" r="3" fill="#ffd98a" class="beacon-dot"/>
    <g class="sparkles" fill="#fff6dc">${sp}</g>
  </g>`;
}

function trees(rand, from, to, yBase, color, skip) {
  let s = '';
  for (let x = from; x < to; x += 26 + rand() * 30) {
    if (skip && x > skip[0] && x < skip[1]) continue;
    const r = 24 + rand() * 22;
    const y = yBase - r * 0.6 - rand() * 12;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/><circle cx="${f(x + r * 0.6)}" cy="${f(y + 8)}" r="${f(r * 0.75)}"/>`;
  }
  return `<g fill="${color}">${s}</g>`;
}

export function paris() {
  const rand = seeded(3);
  const far = rooftops(rand, 548, 590, 'var(--far)', 'var(--far-lit)');
  const mid = `<defs><linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".0"/><stop offset=".5" stop-color="#ffe2a8" stop-opacity=".18"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></linearGradient></defs>${eiffel()}`;
  let lamps = '';
  for (let x = 90; x < 1600; x += 180) {
    lamps += `<rect x="${x - 2}" y="560" width="4" height="72"/><circle cx="${x}" cy="556" r="16" fill="#ffcf7a" opacity=".35" filter="url(#pglow)"/><circle cx="${x}" cy="556" r="5" fill="#ffd98a"/>`;
  }
  let shimmer = '';
  for (let i = 0; i < 46; i++) {
    const x = rand() * 1600;
    const y = 666 + rand() * 30;
    shimmer += `<rect x="${f(x)}" y="${f(y)}" width="${f(20 + rand() * 60)}" height="1.6" style="animation-delay:${f(rand() * 4)}s"/>`;
  }
  const near = `${glowDefs('pglow')}
    ${trees(rand, -20, 1640, 632, 'var(--near-2)', [790, 1170])}
    <path d="M780,632 Q980,618 1180,632 Z" fill="var(--near-2)"/>
    <rect x="0" y="628" width="1600" height="32" fill="var(--near)"/>
    <g fill="var(--near)">${lamps}</g>
    <rect x="0" y="658" width="1600" height="42" fill="var(--water)"/>
    <g class="shimmer" fill="var(--glint)">${shimmer}</g>`;
  return layer('far', 0.15, far) + layer('mid', 0.35, mid) + layer('near', 0.7, near);
}

// ── ROME ────────────────────────────────────────────────────────────────────
function colosseum() {
  const cx = 800;
  const R = 410;
  const base = 660;
  const tiers = [[660, 575], [575, 490], [490, 405]];
  const attic = [405, 340];
  const rand = seeded(5);
  // top contour: intact on the left, ruined/stepped on the right (like the real one)
  const top = (x) => (x <= 1000 ? 340 : Math.min(base, 340 + ((x - 1000) / 210) * 150));
  let d = `M${cx - R},${base} L${cx - R},${attic[1]} L1000,${attic[1]} `;
  for (let x = 1000; x <= cx + R; x += 14) d += `L${x},${f(top(x) + (rand() * 14 - 4))} `;
  d += `L${cx + R},${base} Z `;

  // arches: an ellipse seen side-on, so arches compress toward the edges
  const n = 17;
  let holes = '';
  let inner = '';
  tiers.forEach(([yb, yt], ti) => {
    for (let i = 0; i < n; i++) {
      const th = -1.28 + (2.56 * (i + 0.5)) / n;
      const x = cx + R * 0.97 * Math.sin(th);
      const w = 30 * Math.cos(th) + 3;
      const archTop = yt + 14;
      if (archTop - 6 < top(x)) continue;
      const bottom = yb - (ti === 0 ? 0 : 10);
      holes += `M${f(x - w / 2)},${bottom} L${f(x - w / 2)},${f(archTop + w / 2)} A${f(w / 2)},${f(w / 2)} 0 0 1 ${f(x + w / 2)},${f(archTop + w / 2)} L${f(x + w / 2)},${bottom} Z `;
    }
  });
  for (let i = 0; i < n; i += 2) {
    const th = -1.28 + (2.56 * (i + 0.5)) / n;
    const x = cx + R * 0.97 * Math.sin(th);
    const w = 14 * Math.cos(th);
    holes += `M${f(x - w / 2)},372 h${f(w)} v16 h${f(-w)} Z `;
  }
  // inner ring seen through the ruin + through the arches
  inner = `<path d="M${cx - R + 60},${base} L${cx - R + 60},420 Q${cx},396 ${cx + R - 30},430 L${cx + R - 30},${base} Z" fill="var(--mid-2)"/>`;
  let innerArches = '';
  for (let i = 0; i < 7; i++) {
    const x = 1030 + i * 24;
    innerArches += `M${x},560 L${x},${470 + i * 4} a7,7 0 0 1 14,0 L${x + 14},560 Z `;
  }
  // cornices
  let cornices = '';
  [[575, 1000], [490, 1000], [405, 1000]].forEach(([y]) => {
    const xr = Math.min(cx + R, 1000 + ((y - 340) / 150) * 210 - 4);
    cornices += `<rect x="${cx - R - 6}" y="${y - 4}" width="${f(xr - (cx - R) + 6)}" height="7"/>`;
  });
  return `<g class="colosseum" data-egg="colosseum">${inner}<path d="${innerArches}" fill="var(--sky-hole)" opacity=".5"/>
    <path d="${d} ${holes}" fill="var(--mid)" fill-rule="evenodd"/><g fill="var(--mid)">${cornices}</g></g>`;
}

function umbrellaPine(rand, x, base, h, w) {
  const topY = base - h;
  let c = `<path d="M${x},${base} C${x + 6},${base - h * 0.4} ${x - 10},${base - h * 0.7} ${x + 4},${topY + 20}" stroke="var(--near)" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 11; i++) {
    const px = x + (i / 10 - 0.5) * w;
    c += `<ellipse cx="${f(px)}" cy="${f(topY + rand() * 12)}" rx="${f(w * 0.13)}" ry="${f(18 + rand() * 12)}"/>`;
  }
  c += `<ellipse cx="${x}" cy="${topY + 18}" rx="${w / 2}" ry="16"/>`;
  return `<g fill="var(--near)">${c}</g>`;
}
const cypress = (x, base, h, w = 14) =>
  `<path d="M${x},${base} C${x - w},${base - h * 0.35} ${x - w * 0.7},${base - h * 0.8} ${x},${base - h} C${x + w * 0.7},${base - h * 0.8} ${x + w},${base - h * 0.35} ${x},${base} Z"/>`;

export function rome() {
  const rand = seeded(8);
  const far = `<path d="M0,600 C200,548 350,566 520,576 C700,588 900,546 1100,562 C1300,580 1450,548 1600,566 L1600,700 L0,700Z" fill="var(--far)"/>
    <g fill="var(--far)"><rect x="214" y="520" width="72" height="42"/><path d="M210,524 C212,462 288,462 290,524 Z"/><rect x="245" y="452" width="10" height="20"/><rect x="249" y="436" width="2" height="18"/><rect x="243" y="442" width="14" height="2"/>
    ${cypress(380, 572, 60, 8)}${cypress(400, 574, 48, 7)}${cypress(1340, 572, 64, 8)}${cypress(1362, 574, 46, 7)}</g>`;
  const mid = colosseum();
  let cols = '';
  [[96, 250], [158, 286], [220, 196]].forEach(([x, h]) => {
    cols += `<rect x="${x}" y="${655 - h}" width="26" height="${h}"/><rect x="${x - 6}" y="${655 - h - 10}" width="38" height="12"/><rect x="${x - 4}" y="648" width="34" height="10"/>`;
  });
  cols += `<rect x="84" y="${655 - 286 - 24}" width="112" height="16" transform="rotate(-3 140 360)"/>`;
  const near = `<path d="M0,700 L0,652 C300,636 600,660 900,648 C1200,638 1400,654 1600,642 L1600,700Z" fill="var(--near)"/>
    <g fill="var(--near)">${cols}${cypress(1220, 650, 170, 20)}${cypress(1262, 652, 130, 16)}</g>
    ${umbrellaPine(rand, 1440, 652, 270, 300)}${umbrellaPine(rand, 360, 655, 200, 210)}`;
  return layer('far', 0.15, far) + layer('mid', 0.35, mid) + layer('near', 0.7, near);
}

// ── RIO ─────────────────────────────────────────────────────────────────────
function house(rand, x, w, h, color) {
  const y = 700 - h;
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${h + 2}" fill="${color}"/>
    <path d="M${f(x - 6)},${f(y)} L${f(x + w + 6)},${f(y)} L${f(x + w - 10)},${f(y - 16)} L${f(x + 10)},${f(y - 16)} Z" fill="var(--roof)"/>
    <rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="6" fill="rgba(255,240,220,.18)"/>`;
  const cols = Math.max(1, Math.floor((w - 20) / 34));
  const rows = Math.max(1, Math.floor((h - 70) / 56));
  const gap = (w - cols * 18) / (cols + 1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + gap + c * (18 + gap);
      const wy = y + 22 + r * 56;
      const lit = rand() < 0.45;
      s += `<path d="M${f(wx)},${f(wy + 28)} v-20 a9,9 0 0 1 18,0 v20 Z" fill="${lit ? '#ffc96e' : 'rgba(20,10,30,.55)'}" ${lit ? 'class="flicker" style="animation-delay:' + f(rand() * 6) + 's"' : ''}/>`;
      s += `<rect x="${f(wx - 4)}" y="${f(wy + 2)}" width="3" height="26" fill="rgba(20,10,30,.5)"/><rect x="${f(wx + 19)}" y="${f(wy + 2)}" width="3" height="26" fill="rgba(20,10,30,.5)"/>`;
    }
    if (r === 0 && rand() < 0.7) s += `<rect x="${f(x + 6)}" y="${f(y + 52)}" width="${f(w - 12)}" height="3" fill="rgba(20,10,30,.6)"/>`;
  }
  s += `<path d="M${f(x + w / 2 - 12)},700 v-34 a12,12 0 0 1 24,0 v34 Z" fill="rgba(20,10,30,.7)"/>`;
  return s;
}

function palm(x, base, h, lean = 0) {
  const tx = x + lean;
  const ty = base - h;
  let s = `<path d="M${x},${base} Q${x + lean * 0.2},${base - h * 0.5} ${tx},${ty}" stroke="var(--near)" stroke-width="7" fill="none"/>`;
  [[-1, 0.2], [-0.8, -0.4], [-0.3, -0.8], [0.3, -0.8], [0.8, -0.4], [1, 0.2], [0, -1]].forEach(([dx, dy]) => {
    const ex = tx + dx * 90;
    const ey = ty + dy * 40 + 40;
    s += `<path d="M${tx},${ty} Q${f(tx + dx * 50)},${f(ty + dy * 60 - 20)} ${f(ex)},${f(ey)}" stroke="var(--near)" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  });
  return s;
}

export function rio() {
  const rand = seeded(21);
  let lights = '';
  for (let i = 0; i < 90; i++) {
    const x = rand() * 760;
    const y = 500 + rand() * 60;
    lights += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + rand() * 1.4)}" style="animation-delay:${f(rand() * 5)}s"/>`;
  }
  let glints = '';
  for (let i = 0; i < 40; i++) {
    const y = 566 + Math.pow(rand(), 1.5) * 130;
    const w = 10 + rand() * 50 * ((y - 560) / 140 + 0.3);
    glints += `<rect x="${f(990 + (rand() - 0.5) * (40 + (y - 560) * 1.4))}" y="${f(y)}" width="${f(w)}" height="2" style="animation-delay:${f(rand() * 3)}s"/>`;
  }
  const far = `<defs><linearGradient id="bay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--water-top)"/><stop offset="1" stop-color="var(--water)"/></linearGradient></defs>
    <rect x="0" y="560" width="1600" height="140" fill="url(#bay)"/>
    <g class="shimmer" fill="var(--glint)">${glints}</g>
    <path d="M0,566 L0,470 C90,440 160,400 220,350 C262,312 296,268 322,238 L345,226 L355,226 C370,244 392,282 430,330 C500,410 600,470 760,520 C820,540 860,556 900,566 Z" fill="var(--far)"/>
    <g fill="var(--far)" class="cristo" data-egg="cristo"><circle cx="350" cy="183" r="3.6"/><path d="M346,187 L354,187 L357,219 L343,219 Z"/><rect x="331" y="189" width="38" height="4.4" rx="2"/><rect x="345" y="218" width="10" height="9"/></g>
    <path d="M1080,566 C1092,436 1150,302 1240,296 C1322,292 1362,420 1384,566 Z" fill="var(--far)"/>
    <path d="M1370,566 C1398,506 1444,474 1490,480 C1540,488 1572,530 1600,552 L1600,566 Z" fill="var(--far)"/>
    <line x1="1488" y1="480" x2="1244" y2="298" stroke="var(--far)" stroke-width="1.4"/>
    <rect x="-8" y="-6" width="16" height="11" rx="2" fill="var(--far)" class="cable-car"><animateMotion dur="26s" repeatCount="indefinite" path="M1488,486 L1244,304 L1488,486" /></rect>
    <g class="favela twinkle" fill="#ffd38a">${lights}</g>`;
  const mid = `<g fill="var(--near)">${palm(560, 700, 230, -30)}${palm(1080, 700, 260, 26)}${palm(1010, 700, 170, 40)}</g>`;
  const colors = ['#a5495a', '#bf7536', '#2c7a80', '#ad8d36', '#6c468a', '#38679a', '#b5658a', '#8a4a3a'];
  let houses = '';
  let x = -14;
  while (x < 470) {
    const w = 96 + rand() * 50;
    houses += house(rand, x, w, 190 + rand() * 120, colors[(rand() * colors.length) | 0]);
    x += w + 2;
  }
  x = 1130;
  while (x < 1620) {
    const w = 96 + rand() * 50;
    houses += house(rand, x, w, 190 + rand() * 120, colors[(rand() * colors.length) | 0]);
    x += w + 2;
  }
  // festa bunting + bulbs across the street
  let flags = '';
  const strings = [[470, 420, 1130, 410, 520], [470, 470, 1130, 480, 560]];
  strings.forEach(([x1, y1, x2, y2, cy], si) => {
    flags += `<path d="M${x1},${y1} Q800,${cy} ${x2},${y2}" stroke="rgba(30,15,30,.7)" stroke-width="1.5" fill="none"/>`;
    for (let i = 1; i < 22; i++) {
      const t = i / 22;
      const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * 800 + t * t * x2;
      const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
      if (si === 0) flags += `<path d="M${f(px - 8)},${f(py)} L${f(px + 8)},${f(py)} L${f(px)},${f(py + 16)} Z" fill="${colors[i % colors.length]}" class="flag"/>`;
      else flags += `<circle cx="${f(px)}" cy="${f(py + 4)}" r="4" fill="#ffd98a" class="flicker" style="animation-delay:${f(i * 0.3)}s"/><circle cx="${f(px)}" cy="${f(py + 4)}" r="12" fill="#ffcf7a" opacity=".22"/>`;
    }
  });
  const near = `<g>${houses}</g><rect x="0" y="690" width="1600" height="10" fill="rgba(20,10,30,.8)"/>${flags}`;
  return layer('far', 0.15, far) + layer('mid', 0.4, mid) + layer('near', 0.7, near);
}

// ── NEW YORK — Manhattanhenge, sun setting at the end of a street ────────────
export function nyc() {
  const rand = seeded(42);
  const VP = [800, 432];
  const sAt = (z) => 1 - 1 / (1 + 0.3 * z); // depth units → screen fraction toward VP
  const at = (o, s) => [lerp(o[0], VP[0], s), lerp(o[1], VP[1], s)];
  const pt = (p) => `${f(p[0])},${f(p[1])}`;

  const tones = { near: '', mid: '', far: '', side: '' };
  let lit = '';
  let dark = '';
  let twinkles = '';
  let tanks = '';

  function side(origin, dir) {
    let z = 0;
    let prevH = 0;
    let i = 0;
    while (sAt(z) < 0.94) {
      const dz = 0.7 + rand() * 1.6;
      const z0 = z;
      const z1 = z + dz;
      const s0 = sAt(z0);
      const s1 = sAt(z1);
      const H = i === 0 ? 1400 : 380 + rand() * 900;
      const g0 = at(origin, s0);
      const g1 = at(origin, s1);
      const t0 = [g0[0], g0[1] - H * (1 - s0)];
      const t1 = [g1[0], g1[1] - H * (1 - s1)];
      const bucket = s0 < 0.45 ? 'near' : s0 < 0.72 ? 'mid' : 'far';
      tones[bucket] += `M${pt(g0)} L${pt(g1)} L${pt(t1)} L${pt(t0)} Z `;
      // the face of a taller building peeking over a shorter nearer one
      if (i > 0 && H > prevH) {
        const k = 1 - s0;
        const x2 = g0[0] - dir * 420 * k;
        tones.side += `M${f(g0[0])},${f(g0[1] - prevH * k)} L${f(x2)},${f(g0[1] - prevH * k)} L${f(x2)},${f(t0[1])} L${pt(t0)} Z `;
      }
      // windows
      const floors = Math.floor((H - 30) / 36);
      const ncol = Math.max(2, Math.round(dz * 3));
      for (let fl = 0; fl < floors; fl++) {
        const v0 = 20 + fl * 36;
        const v1 = v0 + 20;
        for (let c = 0; c < ncol; c++) {
          const za = z0 + ((c + 0.2) / ncol) * dz;
          const zb = z0 + ((c + 0.75) / ncol) * dz;
          const sa = sAt(za);
          const sb = sAt(zb);
          const ga = at(origin, sa);
          const gb = at(origin, sb);
          const yTop = ga[1] - v1 * (1 - sa);
          if (yTop > 720 || ga[1] - v0 * (1 - sa) < -10) continue;
          if (Math.abs(gb[0] - ga[0]) < 1.2) continue;
          const q = `M${f(ga[0])},${f(ga[1] - v0 * (1 - sa))} L${f(gb[0])},${f(gb[1] - v0 * (1 - sb))} L${f(gb[0])},${f(gb[1] - v1 * (1 - sb))} L${f(ga[0])},${f(yTop)} Z `;
          const r = rand();
          if (r < 0.3) lit += q;
          else if (r < 0.31 && twinkles.length < 6000) twinkles += `<path d="${q}" style="animation-delay:${f(rand() * 9)}s"/>`;
          else dark += q;
        }
      }
      // water tower on some mid-distance roofs
      if (s0 > 0.35 && s0 < 0.8 && rand() < 0.45) {
        const s = (s0 + s1) / 2;
        const g = at(origin, s);
        const k = 1 - s;
        const rx = g[0];
        const ry = g[1] - H * k;
        tanks += `<rect x="${f(rx - 14 * k)}" y="${f(ry - 34 * k)}" width="${f(28 * k)}" height="${f(24 * k)}" rx="${f(3 * k)}"/><path d="M${f(rx - 16 * k)},${f(ry - 34 * k)} L${f(rx)},${f(ry - 48 * k)} L${f(rx + 16 * k)},${f(ry - 34 * k)} Z"/><rect x="${f(rx - 12 * k)}" y="${f(ry - 10 * k)}" width="${f(2 * k + 0.5)}" height="${f(10 * k)}"/><rect x="${f(rx + 10 * k)}" y="${f(ry - 10 * k)}" width="${f(2 * k + 0.5)}" height="${f(10 * k)}"/>`;
      }
      prevH = H;
      z = z1 + (rand() < 0.25 ? 0.15 : 0);
      i++;
    }
  }
  side([-180, 800], 1);
  side([1780, 800], -1);

  // road, sidewalks, lane markings
  let dashes = '';
  for (let z = 0.3; z < 40; z += 1.3) {
    const a = sAt(z);
    const b = sAt(z + 0.55);
    const w0 = 6 * (1 - a);
    const w1 = 6 * (1 - b);
    const A = at([800, 800], a);
    const B = at([800, 800], b);
    dashes += `M${f(A[0] - w0)},${f(A[1])} L${f(A[0] + w0)},${f(A[1])} L${f(B[0] + w1)},${f(B[1])} L${f(B[0] - w1)},${f(B[1])} Z `;
  }
  const road = `<defs><linearGradient id="roadglow" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--road)"/><stop offset=".85" stop-color="var(--road-glow)"/></linearGradient></defs>
    <path d="M-180,800 L380,800 L${VP[0]},${VP[1]} Z" fill="var(--walk)"/><path d="M1780,800 L1220,800 L${VP[0]},${VP[1]} Z" fill="var(--walk)"/>
    <path d="M380,800 L1220,800 L${VP[0]},${VP[1]} Z" fill="url(#roadglow)"/>
    <path d="${dashes}" fill="var(--glint)" opacity=".75"/>`;

  // cabs (rear view), scaled by depth
  let cabs = '';
  [[0.22, 670], [0.5, 930], [0.68, 690], [0.8, 900]].forEach(([s, lane], i) => {
    const c = at([lane, 800], s);
    const k = 1 - s;
    const w = 130 * k;
    const h = 46 * k;
    cabs += `<g class="cab" data-egg="cab" style="--i:${i}">
      <rect x="${f(c[0] - w / 2)}" y="${f(c[1] - h - 14 * k)}" width="${f(w)}" height="${f(h)}" rx="${f(8 * k)}" fill="var(--cab)"/>
      <rect x="${f(c[0] - w * 0.32)}" y="${f(c[1] - h - 40 * k)}" width="${f(w * 0.64)}" height="${f(30 * k)}" rx="${f(8 * k)}" fill="var(--cab)"/>
      <rect x="${f(c[0] - w * 0.12)}" y="${f(c[1] - h - 48 * k)}" width="${f(w * 0.24)}" height="${f(9 * k)}" fill="#ffe7a8"/>
      <rect x="${f(c[0] - w / 2 + 6 * k)}" y="${f(c[1] - h - 4 * k)}" width="${f(18 * k)}" height="${f(9 * k)}" fill="#ff4a5a"/>
      <rect x="${f(c[0] + w / 2 - 24 * k)}" y="${f(c[1] - h - 4 * k)}" width="${f(18 * k)}" height="${f(9 * k)}" fill="#ff4a5a"/>
      <circle cx="${f(c[0] - w / 2 + 15 * k)}" cy="${f(c[1] - h)}" r="${f(18 * k)}" fill="#ff4a5a" opacity=".25"/>
      <circle cx="${f(c[0] + w / 2 - 15 * k)}" cy="${f(c[1] - h)}" r="${f(18 * k)}" fill="#ff4a5a" opacity=".25"/>
      <rect x="${f(c[0] - w / 2 + 6 * k)}" y="${f(c[1] - 16 * k)}" width="${f(20 * k)}" height="${f(16 * k)}" fill="#120a18"/>
      <rect x="${f(c[0] + w / 2 - 26 * k)}" y="${f(c[1] - 16 * k)}" width="${f(20 * k)}" height="${f(16 * k)}" fill="#120a18"/></g>`;
  });

  const far = `<path d="${tones.far}" fill="var(--far)"/>`;
  const mid = `<path d="${tones.side}" fill="var(--side)"/><path d="${tones.near}" fill="var(--near)"/><path d="${tones.mid}" fill="var(--mid)"/>
    <path d="${dark}" fill="var(--win-dark)"/><path d="${lit}" fill="var(--win-lit)"/><g class="twinkle-win" fill="var(--win-lit)">${twinkles}</g><g fill="var(--mid)">${tanks}</g>`;
  const near = `${road}${cabs}
    <g class="steam" fill="#fff"><ellipse cx="860" cy="620" rx="26" ry="12"/><ellipse cx="850" cy="620" rx="30" ry="14" style="animation-delay:1.3s"/><ellipse cx="870" cy="620" rx="22" ry="11" style="animation-delay:2.6s"/></g>
    <g fill="#0c0612"><rect x="190" y="320" width="12" height="420"/><rect x="190" y="332" width="360" height="9"/><rect x="510" y="341" width="30" height="74" rx="5"/>
    <circle cx="525" cy="356" r="7" fill="#3a1c24"/><circle cx="525" cy="378" r="7" fill="#3a1c24"/><circle cx="525" cy="400" r="7" fill="#46ff9a" class="signal"/><circle cx="525" cy="400" r="20" fill="#46ff9a" opacity=".22"/>
    <rect x="1420" y="400" width="8" height="340"/><path d="M1424,404 Q1424,380 1390,380 L1370,380" stroke="#0c0612" stroke-width="7" fill="none"/><circle cx="1366" cy="386" r="24" fill="#ffcf7a" opacity=".3"/><rect x="1352" y="380" width="26" height="9" rx="3" fill="#ffd98a"/></g>`;
  return layer('far', 0.08, far) + layer('mid', 0.14, mid) + layer('near', 0.22, near);
}

// ── ARCTIC — Lofoten-style peaks, a frozen fjord and a cabin ──────────────────
export function arctic() {
  const rand = seeded(77);
  const pts = [[0, 470]];
  let x = 0;
  let up = true;
  while (x < 1600) {
    x += 50 + rand() * 110;
    const y = up ? 250 + rand() * 170 : 420 + rand() * 90;
    pts.push([x, y]);
    up = !up;
  }
  const line = pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' L');
  const mtn = `M${line} L1600,560 L0,560 Z`;
  let snow = '';
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    if (py > 420) continue;
    const [lx, ly] = pts[i - 1];
    const [rx, ry] = pts[i + 1];
    const t = 0.28;
    const a = [lerp(px, lx, t), lerp(py, ly, t)];
    const b = [lerp(px, rx, t), lerp(py, ry, t)];
    snow += `M${f(px)},${f(py)} L${f(b[0])},${f(b[1])} L${f(lerp(px, b[0], 0.5))},${f(b[1] - 6)} L${f(px)},${f(lerp(py, b[1], 0.8))} L${f(lerp(px, a[0], 0.6))},${f(a[1] - 4)} L${f(a[0])},${f(a[1])} Z `;
  }
  let aur = '';
  for (let i = 0; i < 14; i++) {
    const ax = 100 + rand() * 1400;
    aur += `<rect x="${f(ax)}" y="566" width="${f(20 + rand() * 60)}" height="${f(40 + rand() * 90)}" style="animation-delay:${f(rand() * 6)}s"/>`;
  }
  const far = `<defs><linearGradient id="fjord" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--water-top)"/><stop offset="1" stop-color="var(--water)"/></linearGradient>
      <linearGradient id="aurref" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58ffb4" stop-opacity=".28"/><stop offset="1" stop-color="#58ffb4" stop-opacity="0"/></linearGradient>
      <clipPath id="waterclip"><rect x="0" y="560" width="1600" height="140"/></clipPath></defs>
    <rect x="0" y="560" width="1600" height="140" fill="url(#fjord)"/>
    <g clip-path="url(#waterclip)" opacity=".35"><path d="${mtn}" fill="var(--far)" transform="translate(0,1120) scale(1,-1)"/></g>
    <g class="aurora-ref" fill="url(#aurref)">${aur}</g>
    <path d="${mtn}" fill="var(--far)"/><path d="${snow}" fill="var(--snow)" opacity=".55"/>`;

  let firs = '';
  const fir = (fx, base, h) => {
    let s = `<rect x="${fx - 2}" y="${base - 10}" width="4" height="12"/>`;
    for (let k = 0; k < 4; k++) {
      const yb = base - 6 - k * h * 0.22;
      const w = h * (0.34 - k * 0.07);
      s += `<path d="M${f(fx - w)},${f(yb)} L${fx},${f(yb - h * 0.36)} L${f(fx + w)},${f(yb)} Z"/>`;
    }
    return s;
  };
  for (let i = 0; i < 26; i++) {
    const fx = rand() < 0.5 ? rand() * 300 : 1240 + rand() * 380;
    firs += fir(fx, 640 + rand() * 20, 60 + rand() * 90);
  }
  const near = `${glowDefs('aglow')}
    <path d="M0,700 L0,632 C120,618 260,640 420,646 C560,652 640,640 760,650 C900,662 1100,640 1260,630 C1400,622 1500,628 1600,620 L1600,700 Z" fill="var(--shore)"/>
    <path d="M0,634 C120,620 260,642 420,648 C560,654 640,642 760,652" stroke="var(--snow)" stroke-width="3" fill="none" opacity=".5"/>
    <g fill="var(--near)">${firs}</g>
    <g class="cabin">
      <rect x="430" y="604" width="4" height="40" fill="var(--near)"/><rect x="540" y="604" width="4" height="40" fill="var(--near)"/>
      <rect x="420" y="548" width="132" height="60" fill="#5a1a22"/>
      <path d="M410,552 L486,506 L562,552 Z" fill="var(--near)"/><path d="M410,552 L486,506 L562,552" stroke="var(--snow)" stroke-width="3" fill="none" opacity=".7"/>
      <rect x="520" y="512" width="12" height="26" fill="var(--near)"/>
      <g class="smoke" fill="#c8d6e6"><circle cx="526" cy="504" r="7"/><circle cx="526" cy="504" r="9" style="animation-delay:2s"/><circle cx="526" cy="504" r="6" style="animation-delay:4s"/></g>
      <g data-egg="cabin" class="cabin-window"><circle cx="458" cy="578" r="22" fill="#ffc46e" opacity=".35" filter="url(#aglow)"/><rect x="446" y="566" width="24" height="24" fill="#ffc96e"/>
        <path class="cat" d="M452,590 L452,580 L455,576 L457,580 L461,580 L463,576 L466,580 L466,590 Z" fill="#1a0c10"/></g>
      <rect x="506" y="566" width="24" height="24" fill="#ffc96e" opacity=".85"/>
      <rect x="456" y="566" width="2" height="24" fill="#5a1a22"/><rect x="446" y="577" width="24" height="2" fill="#5a1a22"/>
    </g>
    <g class="stargazer" data-egg="telescope" tabindex="-1"><path d="M1180,628 C1186,610 1214,610 1222,628 Z" fill="var(--near)"/>
      <circle cx="1196" cy="584" r="5" fill="var(--near)"/><path d="M1190,590 L1202,590 L1205,612 L1188,612 Z" fill="var(--near)"/><rect x="1189" y="611" width="4" height="10" fill="var(--near)"/><rect x="1199" y="611" width="4" height="10" fill="var(--near)"/>
      <path d="M1204,594 L1236,572" stroke="var(--near)" stroke-width="5" stroke-linecap="round"/><path d="M1212,602 L1218,620 M1212,602 L1206,620" stroke="var(--near)" stroke-width="2"/>
      <circle cx="1238" cy="571" r="3" fill="#9af0ff" class="lens"/></g>`;
  return layer('far', 0.12, far) + layer('mid', 0.3, '') + layer('near', 0.6, near);
}

export const SCENES = { paris, rome, rio, nyc, arctic };
