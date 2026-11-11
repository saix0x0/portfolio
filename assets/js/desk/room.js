// ─────────────────────────────────────────────────────────────────────────────
//  THE ROOM: the desk drawn in code, straight on, on a 2400×1500 stage. A dark
//  wall lit by LED strips (under the shelves and behind the desk), paintings in
//  frames, books on the right shelf, a record player on the left, the desk and
//  the back of a chair. Every light is var(--lamp), so changing the lamp
//  recolours the whole room. Positions here and in pages/desk.js's OBJ match.
// ─────────────────────────────────────────────────────────────────────────────
import { esc, seeded } from '../core/base.js';
import { clockIn } from '../core/sun.js';
import { site } from '../../../content/site.js';
import { desk } from '../../../content/desk.js';
import { projects } from '../../../content/projects.js';
import { books } from '../../../content/books.js';
import { KEYS } from './keys.js';
import { halftone } from '../front/halftone.js';

const real = (s = '') => !!s && !/^TODO/.test(String(s));
const at = (x0, y0, x1, y1, rot = 0) => `left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px${rot ? `;transform:rotate(${rot}deg)` : ''}`;
const art = (name) => site.life.find((l) => l.art.src.includes(name))?.art;

// ── a potted plant: heart-shaped leaves on curving stems ───────────────────
const LEAF = 'M0 0C-17-9-22-36 0-52C22-36 17-9 0 0Z';
function plant(seed, { w, h, stems = 7, hang = false, leaf = 1 }) {
  const r = seeded(seed);
  const cx = w / 2;
  const top = hang ? 40 : h - 90; // where the stems leave the pot
  let out = '';
  for (let s = 0; s < stems; s++) {
    const side = s % 2 ? 1 : -1;
    const len = (hang ? h * 0.55 : h * 0.62) * (0.55 + r() * 0.45);
    const bend = side * (hang ? 30 + r() * 70 : 20 + r() * 90);
    const pts = [];
    for (let i = 1; i <= 6; i++) {
      const t = i / 6;
      const x = cx + bend * t * (hang ? 1 : 1.2) + side * r() * 6;
      const y = hang ? top + len * t : top - len * t + bend * bend * 0.002 * t;
      pts.push([x, y, t]);
    }
    out += `<path class="stem" d="M${cx} ${top}${pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join('')}" />`;
    for (const [x, y, t] of pts) {
      const a = hang ? 180 + side * (30 + r() * 50) : side * (20 + r() * 50) + (r() - 0.5) * 30;
      const k = (0.55 + r() * 0.5) * leaf * (hang ? 0.8 + t * 0.2 : 1.1 - t * 0.35);
      out += `<path class="leaf l${Math.floor(r() * 3)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)}) scale(${k.toFixed(2)})" d="${LEAF}"/>`;
    }
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${out}</svg>`;
}

// ── book spines for the right shelf, from content/books.js ─────────────────
const SPINES = [['#283645', '#e9dcc4'], ['#7a2e22', '#f2dcc0'], ['#d8c7a2', '#2a1d12'], ['#1f2a24', '#d9c79e'], ['#ece3d1', '#5a2a1c'], ['#3b2b3f', '#e6d3b0'],
  ['#9b4a1f', '#fbe7cc'], ['#20242b', '#e0b36a'], ['#b8452f', '#fff0dc'], ['#e2d6bd', '#1f2a3a'], ['#435a4f', '#f0e2c4'], ['#5b4636', '#f3dcb8'], ['#131416', '#cfc6b4']];
// short spine titles where the full one won't fit
const SHORT = { 'The Interpretation of Dreams': 'Interpretation of Dreams', 'Introduction to Probability': 'Probability' };
function shelfBooks() {
  const r = seeded(11);
  let x = 0;
  const spines = books.slice(0, 13).map((b, i) => {
    const [bg, fg] = SPINES[i % SPINES.length];
    const w = Math.round(30 + r() * 12);
    const hgt = Math.round(176 + r() * 32);
    const el = `<span class="r-book" style="left:${x}px;width:${w}px;height:${hgt}px;--bg:${bg};--fg:${fg}"><b>${esc(SHORT[b.title] || b.title.split(/[:(]/)[0].trim())}</b></span>`;
    x += w + 1;
    return el;
  }).join('');
  return `${spines}<i class="r-bookend" style="left:${x + 2}px"></i>`;
}

// ── the poster: everything built so far ────────────────────────────────────
function poster() {
  const MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
  const when = (p) => {
    const m = String(p.period || '').toLowerCase().match(/([a-z]{3})[a-z]*\s+(\d{4})/);
    return m ? +m[2] * 12 + MONTHS.indexOf(m[1]) : (p.year || 0) * 12;
  };
  const built = projects.filter((p) => !p.placeholder).sort((a, b) => when(b) - when(a)).slice(0, 5);
  return `<p class="ps-k">Selected work <span>${new Date().getFullYear()}</span></p>
    <p class="ps-h">Built<br>so far</p>
    <ol>${built.map((p, i) => `<li><i>${String(i + 1).padStart(2, '0')}</i>${esc(p.title)}</li>`).join('')}</ol>
    <p class="ps-f"><span>S.S.C.</span><span>Hyderabad</span></p>`;
}

const frame = (cls, a, box) => a ? `<figure class="r-frame ${cls}" style="${box}"><span class="r-mat"><img src="../${a.src}" alt="${esc(a.alt)}" decoding="async"></span></figure>` : '';

export function room(root) {
  const NOW = site.now.filter((n) => real(n.text));
  const R = desk.research || {};
  root.innerHTML = `
  <div class="r-wall"></div>
  <div class="r-glow g-desk"></div><div class="r-glow g-left"></div><div class="r-glow g-right"></div><div class="r-glow g-bar"></div><div class="r-glow g-pulse"></div>

  <!-- left shelf: a record player, some sleeves and a trailing plant -->
  <div class="r-shelf" style="${at(150, 352, 790, 380)}"><i class="r-strip"></i></div>
  <div class="r-hang" style="left:150px;top:250px">${plant(7, { w: 150, h: 420, stems: 5, hang: true })}<i class="r-pot small"></i></div>
  <div class="r-tt" data-thing="record" style="${at(300, 268, 610, 352)}"><i class="tt-rec"><i></i></i><i class="tt-arm"></i><i class="tt-base"><i class="tt-led"></i><i class="tt-knob"></i></i></div>
  <div class="r-sleeves" style="${at(630, 186, 780, 352)}"><i class="sl1"></i><i class="sl2"></i><i class="sl3"></i></div>

  <figure class="r-frame me" data-thing="portrait" style="${at(220, 430, 532, 800)}"><span class="r-mat"><span class="me-sheet">
    <i class="me-top"><span>No. 02</span><span>IIIT-H</span></i>
    <span class="me-pic"><img src="../${desk.portrait.src || 'assets/img/portrait.jpg'}" alt=""><canvas></canvas></span>
    <b class="me-word">Curious.</b>
    <i class="me-cap">${esc(site.fullName || 'Sai Siddhanth Challa')}</i></span></span></figure>
  <div class="r-note" data-thing="lately" style="${at(600, 492, 784, 704, -2.5)}"><i class="pin"></i><b>Lately</b><span>${NOW[0] ? esc(NOW[0].text) : 'Writing this down soon.'}</span></div>
  <div class="r-switch" data-thing="switch" style="${at(64, 610, 116, 694)}"><i></i></div>

  <!-- above the monitor -->
  ${frame('wanderer', art('wanderer'), at(866, 96, 1120, 432))}
  ${frame('composition', art('composition'), at(1184, 168, 1556, 420))}
  <div class="r-name"><h1 aria-label="Sai Siddhanth Challa">Sai Siddhanth</h1><p data-wall-line></p></div>

  <!-- right: the books, the poster, a swim, a research card -->
  <div class="r-books" data-thing="books" style="left:1664px;top:140px;width:520px;height:212px">${shelfBooks()}<i class="r-bookend"></i></div>
  <div class="r-shelf" style="${at(1620, 352, 2270, 380)}"><i class="r-strip"></i></div>
  <div class="r-cact" style="left:2186px;top:192px">${plant(3, { w: 90, h: 160, stems: 4, leaf: 0.6 })}<i class="r-pot small"></i></div>
  <div class="r-poster" data-thing="poster" style="${at(1690, 430, 1962, 800)}">${poster()}</div>
  ${frame('bathers', art('bathers'), at(2010, 440, 2252, 620))}
  <div class="r-card" data-thing="research" style="${at(2044, 654, 2210, 806, 2)}"><i class="pin"></i><b>Research</b><span>${real(R.title) ? esc(R.title) : 'In progress. More soon.'}</span></div>

  <!-- the desk -->
  <div class="r-desk"><i class="d-top"></i><i class="d-edge"></i></div>
  <div class="r-under"><i class="cab l"></i><i class="cab r"></i></div>

  <div class="r-plant" style="left:90px;top:720px">${plant(21, { w: 200, h: 350, stems: 8 })}<i class="r-pot"></i></div>
  <div class="r-laptop" data-thing="laptop" style="${at(300, 786, 770, 1078)}"><i class="lid"></i><i class="base"></i></div>
  <div class="r-tray" data-thing="letters" style="${at(790, 996, 920, 1090)}"><i class="env e1"></i><i class="env e2"></i><i class="box"></i></div>

  <i class="r-bar-glow"></i>
  <div class="r-lightbar" data-thing="lightbar" style="${at(940, 628, 1460, 648)}"><i></i></div>
  <div class="r-mon" data-thing="monitor" style="${at(688, 646, 1712, 1002)}"></div>
  <div class="r-stand"><i class="neck"></i><i class="foot"></i></div>
  <div class="r-mat-pad" style="${at(860, 1070, 1560, 1140)}"></div>
  <i class="r-kb-glow" style="${at(946, 1118, 1396, 1142)}"></i>
  <div class="r-kb" data-thing="keyboard" style="${at(930, 1060, 1410, 1134)}">${keyboard()}</div>
  <div class="r-mouse" data-thing="mouse" style="${at(1452, 1092, 1506, 1122)}"></div>

  <div class="r-mug" data-thing="mug" style="${at(1570, 1032, 1662, 1106)}"><i class="steam"><i></i><i></i><i></i></i><i class="cup"></i><i class="handle"></i></div>
  <div class="r-board" data-thing="board" style="${at(1730, 886, 1912, 1072)}"></div>
  <div class="r-spk" data-thing="speaker" style="${at(1950, 846, 2262, 1072)}">${speaker()}</div>

  <div class="r-chair" data-thing="chair">${chair()}</div>
  <div class="r-dark"></div>
  <div class="r-grain"></div>`;
  const me = root.querySelector('.me');
  halftone(me.querySelector('canvas'), me.querySelector('img'), { cell: 4, ink: '#1a0b05', invert: true });
}

// ── the keyboard, key by key, on the desk in perspective ───────────────────
// CASE is its outline, TOP the area the keys fill (back-left, back-right,
// front-right, front-left, in stage px). Each key is a <polygon data-k=code>.
const CASE = [[966, 1064], [1374, 1064], [1404, 1124], [936, 1124]];
const TOP = [[978, 1068], [1362, 1068], [1390, 1119], [950, 1119]];
const lerp = (q, u, v) => {
  const t = [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u];
  const b = [q[3][0] + (q[2][0] - q[3][0]) * u, q[3][1] + (q[2][1] - q[3][1]) * u];
  return [t[0] + (b[0] - t[0]) * v, t[1] + (b[1] - t[1]) * v].map((n) => n.toFixed(1)).join(',');
};
function keyboard() {
  const pts = (q) => q.map((p) => p.join(',')).join(' ');
  const keys = KEYS.map(({ code, x, w, r }) => {
    const u0 = (x + 0.07) / 16, u1 = (x + w - 0.07) / 16, v0 = (r + 0.1) / 6, v1 = (r + 0.9) / 6;
    if (code === 'Knob') {
      const [cx, cy] = lerp(TOP, (x + 0.5) / 16, (r + 0.5) / 6).split(',');
      return `<ellipse class="kb-knob" data-k="Knob" cx="${cx}" cy="${cy}" rx="10" ry="4.5"/>`;
    }
    return `<polygon data-k="${code}" points="${lerp(TOP, u0, v0)} ${lerp(TOP, u1, v0)} ${lerp(TOP, u1, v1)} ${lerp(TOP, u0, v1)}"/>`;
  }).join('');
  return `<svg viewBox="930 1060 480 74" width="480" height="74" aria-hidden="true">
    <polygon class="kb-case" points="${pts(CASE)}"/>
    <polygon class="kb-front" points="936,1124 1404,1124 1402,1132 938,1132"/>
    <g class="kb-keys">${keys}</g></svg>`;
}

// ── the speaker: an amp-style Marshall on the right of the desk ────────────
function speaker() {
  const knobs = [158, 194, 230, 266].map((x) => `<circle class="spk-knob" cx="${x}" cy="35" r="10"/><circle class="spk-cap" cx="${x}" cy="35" r="4"/>`).join('');
  return `<svg viewBox="0 0 312 226" width="312" height="226" aria-hidden="true">
    <defs>
      <pattern id="weave" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#1b1612"/><path d="M0 2.5H5M2.5 0V5" stroke="#2b241c" stroke-width="0.9"/></pattern>
      <linearGradient id="brass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e2c27a"/><stop offset="0.5" stop-color="#b8924a"/><stop offset="1" stop-color="#8a6a30"/></linearGradient>
      <radialGradient id="cone"><stop offset="0" stop-color="#3a3027"/><stop offset="0.6" stop-color="#1f1914" stop-opacity="0.6"/><stop offset="1" stop-color="#1b1612" stop-opacity="0"/></radialGradient>
    </defs>
    <rect class="spk-body" x="0" y="0" width="312" height="220" rx="13"/>
    <rect x="6" y="6" width="300" height="208" rx="9" fill="none" stroke="#c9a35a" stroke-width="1.6" opacity="0.8"/>
    <rect x="14" y="16" width="284" height="38" rx="4" fill="url(#brass)"/>
    <rect x="30" y="27" width="10" height="17" rx="2" fill="#141210"/><rect x="31" y="28" width="8" height="8" rx="1" fill="#e9e2d2"/>
    <circle class="spk-led" cx="56" cy="35" r="3"/>
    ${knobs}
    <rect x="14" y="62" width="284" height="146" rx="4" fill="url(#weave)"/>
    <g class="spk-cones"><circle cx="90" cy="135" r="52" fill="url(#cone)"/><circle cx="222" cy="135" r="52" fill="url(#cone)"/></g>
    <text class="spk-logo" x="156" y="106" text-anchor="middle">Marshall</text>
    <rect x="22" y="218" width="30" height="8" rx="2" fill="#0a0908"/><rect x="260" y="218" width="30" height="8" rx="2" fill="#0a0908"/>
  </svg>`;
}

function chair() {
  return `<svg viewBox="0 0 900 380" width="900" height="380" aria-hidden="true">
    <defs><pattern id="mesh" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#0c0806"/><rect width="4" height="9" fill="#16100c"/></pattern></defs>
    <path class="ch-arm" d="M20 210 Q20 186 48 184 L176 182 Q196 184 196 200 L196 214 Q194 226 176 226 L48 226 Q22 226 20 210Z"/>
    <path class="ch-arm" d="M880 210 Q880 186 852 184 L724 182 Q704 184 704 200 L704 214 Q706 226 724 226 L852 226 Q878 226 880 210Z"/>
    <rect class="ch-post" x="96" y="222" width="34" height="170"/><rect class="ch-post" x="770" y="222" width="34" height="170"/>
    <path class="ch-frame" d="M190 380 L196 120 Q204 18 450 10 Q696 18 704 120 L710 380Z"/>
    <path class="ch-mesh" d="M214 380 L220 128 Q230 40 450 32 Q670 40 680 128 L686 380Z" fill="url(#mesh)"/>
    <path class="ch-rim" d="M196 120 Q204 18 450 10 Q696 18 704 120" />
  </svg>`;
}

// ── the monitor's lock screen: the date and the time over the reel's poster ─
export function lockScreen(el) {
  el.innerHTML = `<img class="ls-bg" src="../assets/video/reel.jpg" alt="">
    <div class="ls-time"><small data-ls-d></small><b data-ls-t></b></div>
    <span class="ls-open">Click to open the browser</span>`;
  const d = el.querySelector('[data-ls-d]');
  const t = el.querySelector('[data-ls-t]');
  const tick = () => {
    d.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
    t.textContent = clockIn('Asia/Kolkata').replace(/\s*[ap]m$/i, '');
  };
  tick();
  setInterval(tick, 15000);
}
