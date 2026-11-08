// ─────────────────────────────────────────────────────────────────────────────
//  THE DESK at /desk/. A desk setup at night, shot straight on (2400×1800 "stage"),
//  scaled to cover the window, with live screens and lights layered on top and
//  a hotspot per object. Every object has a URL (#browser, #terminal, …) so
//  each destination is linkable; the lamp and switch act in place.
//
//  Coordinates below are photo pixels. If the photo changes, re-measure them.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, seeded, clamp, reducedMotion, canHover } from '../core/base.js';
import { clockIn } from '../core/sun.js';
import { desk } from '../../../content/desk.js';
import { drawPerson, LOOKS, playerLook } from '../world/actors.js';
import { isMuted, setMuted, note } from '../world/sound.js';
import { browserApp, miniMonitor } from '../desk/browser.js';
import { terminalApp, miniLaptop } from '../desk/terminal.js';
import { contactSheet, typeSheet, musicCard } from '../desk/bits.js';
import { palette } from '../core/palette.js';
import { notes, ledBoard, plaque, PLAQUES } from '../desk/wall.js';

const RM = reducedMotion();
const W = 2400;
const H = 1800;
const cx0 = () => (narrow() ? 1640 : 1250); // where the camera looks: the desk (phones: the monitor)
const CY = 820;

// ── the objects on the desk ─────────────────────────────────────────────────
// poly: the outline in photo px · tag: where the label sits · zoom: the box the
// camera flies to · route: the URL hash it opens · act: an in-place action
const OBJ = [
  { id: 'monitor', label: 'Monitor', what: 'Projects & GitHub', route: 'browser', tag: [1640, 560], zoom: [1230, 330, 2060, 980],
    polys: [[[1255, 378], [2050, 345], [2020, 968], [1248, 825]]] },
  { id: 'laptop', label: 'Laptop', what: 'The terminal', route: 'terminal', tag: [1035, 600], zoom: [800, 520, 1270, 1080],
    polys: [[[852, 550], [1225, 572], [1215, 835], [1200, 1060], [760, 1030], [845, 810]]] },
  { id: 'board', label: 'LED board', what: 'Live from GitHub', route: 'browser/github', tag: [496, 470],
    polys: [[[355, 462], [635, 470], [635, 730], [362, 753]]] },
  { id: 'frame', label: 'Framed print', what: 'About me', route: 'wall/about', tag: [470, 210],
    polys: [[[288, 0], [650, 0], [655, 405], [300, 385]]] },
  { id: 'card', label: 'Index card', what: 'Projects timeline', route: 'wall/timeline', tag: [875, 290],
    polys: [[[726, 291], [1016, 283], [1022, 508], [734, 516]]] },
  { id: 'lately', label: 'Sticky note', what: 'Progress', route: 'wall/progress', tag: [1905, 770],
    polys: [[[1838, 768], [1988, 778], [1978, 918], [1828, 908]]] },
  { id: 'research', label: 'Sticky note', what: 'Research', route: 'wall/research', tag: [2212, 430],
    polys: [[[2124, 438], [2294, 428], [2302, 588], [2132, 598]]] },
  { id: 'reading', label: 'Sticky note', what: 'Philosophy & psychology', route: 'wall/books', tag: [2245, 650],
    polys: [[[2166, 646], [2336, 654], [2328, 814], [2158, 806]]] },
  { id: 'lightbar', label: 'Light bar', what: 'Change the light', act: 'lamp', tag: [1610, 300],
    polys: [[[1290, 300], [1930, 290], [1932, 362], [1292, 372]]] },
  { id: 'keyboard', label: 'Keyboard', what: 'Typing test', route: 'type', tag: [1200, 1190], zoom: [880, 1120, 1520, 1480],
    polys: [[[928, 1215], [1060, 1155], [1455, 1310], [1460, 1375], [1305, 1445], [930, 1250]]] },
  { id: 'speaker', label: 'Speaker', what: 'Music', route: 'music', tag: [1452, 1020],
    polys: [[[1395, 1050], [1450, 1020], [1505, 1050], [1510, 1150], [1450, 1185], [1400, 1160]]] },
  { id: 'mic', label: 'Microphone', what: 'Say hello', route: 'contact', tag: [440, 870],
    polys: [[[378, 880], [450, 865], [504, 880], [505, 1080], [470, 1200], [400, 1200], [380, 1080]]] },
  { id: 'mug', label: 'Mug', what: 'Refill', act: 'coffee', tag: [1960, 1130],
    polys: [[[1854, 1135], [2000, 1128], [2080, 1200], [2050, 1300], [2000, 1341], [1870, 1335]]] },
  { id: 'webcam', label: 'Webcam', what: 'Say cheese', act: 'cam', tag: [1545, 1035],
    polys: [[[1505, 1040], [1585, 1036], [1592, 1190], [1502, 1190]]] },
  { id: 'mouse', label: 'Mouse', what: 'Take the tour', act: 'tour', tag: [1530, 1365],
    polys: [[[1420, 1440], [1450, 1385], [1530, 1365], [1610, 1380], [1640, 1430], [1610, 1500], [1530, 1515], [1440, 1490]]] },
  { id: 'window', label: 'Window', what: 'Lights on or off', act: 'switch', tag: [38, 300],
    polys: [[[0, 0], [75, 0], [75, 585], [0, 600]]] },
  { id: 'chair', label: 'Chair', what: 'Sit down: play the game', act: 'hotel', tag: [190, 1100],
    polys: [[[0, 895], [80, 890], [150, 1000], [210, 1200], [260, 1450], [300, 1800], [0, 1800]]] },
];
const byId = (id) => OBJ.find((o) => o.id === id);
const ROUTES = new Set([...OBJ.map((o) => o.route).filter(Boolean), 'contact', 'wall']);

// screen quads (TL, TR, BR, BL) for the live overlays
const QUADS = {
  monitor: { w: 1440, h: 900, q: [[1278, 402], [2005, 382], [1980, 922], [1270, 802]] },
  laptop: { w: 1280, h: 800, q: [[865, 568], [1213, 592], [1203, 820], [857, 797]] },
  board: { w: 640, h: 640, q: [[372, 477], [622, 482], [621, 720], [370, 742]] },
};
const KB = [[1045, 1158], [1420, 1295], [1375, 1362], [958, 1222]]; // keyboard top face (back-left, back-right, front-right, front-left)

// ── stage transform ─────────────────────────────────────────────────────────
const room = $('[data-room]');
const stage = $('[data-stage]');
let view = { s: 1, x: 0, y: 0 };
let pan = 0; // phones: horizontal look-around, in photo px
const narrow = () => innerWidth / innerHeight < 1.05;

function deskView() {
  const vw = innerWidth;
  const vh = innerHeight;
  const s = narrow() ? vh / H : Math.max(vw / W, vh / H);
  const hw = vw / 2 / s;
  const hh = vh / 2 / s;
  const cx = clamp(cx0() + pan, hw, W - hw);
  const cy = clamp(CY, hh, H - hh);
  return { s, x: vw / 2 - cx * s, y: vh / 2 - cy * s };
}
// fly the camera so stage box [x0,y0,x1,y1] fills `area` of the window
function zoomView([x0, y0, x1, y1], area = { top: 0, h: 1, fill: 1 }) {
  const { left = 0, w = 1 } = area;
  const vw = innerWidth * w;
  const vh = innerHeight * area.h;
  const s = Math.min(vw / (x1 - x0), vh / (y1 - y0)) * area.fill;
  return { s, x: innerWidth * left + vw / 2 - ((x0 + x1) / 2) * s, y: innerHeight * area.top + vh / 2 - ((y0 + y1) / 2) * s };
}
function apply(v, animate = true) {
  view = v;
  stage.classList.toggle('glide', animate && !RM);
  stage.style.transform = `translate3d(${v.x.toFixed(1)}px,${v.y.toFixed(1)}px,0) scale(${v.s.toFixed(4)})`;
  stage.style.setProperty('--inv', (1 / v.s).toFixed(4));
  document.documentElement.classList.toggle('narrow', narrow());
}

// projective map: an element of size w×h onto quad q (photo px)
function quadMatrix(w, h, q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const k = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].map((n) => +n.toFixed(6)).join(',')})`;
}
const bilerp = (q, u, v) => {
  const top = [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u];
  const bot = [q[3][0] + (q[2][0] - q[3][0]) * u, q[3][1] + (q[2][1] - q[3][1]) * u];
  return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
};

// ── hotspots, labels and the plain list ─────────────────────────────────────
function hotspots() {
  const pts = (p) => p.map((xy) => xy.join(',')).join(' ');
  $('[data-hots]').innerHTML = OBJ.map((o) => {
    const target = o.route ? `href="#${o.route}"` : `href="#" role="button" data-act="${o.act}"`;
    return `<a ${target} data-obj="${o.id}" aria-label="${esc(o.label)}: ${esc(o.what)}">${o.polys.map((p) => `<polygon points="${pts(p)}"/>`).join('')}</a>`;
  }).join('');
  $('[data-tags]').innerHTML = OBJ.map((o, i) => `<span class="dot" style="left:${o.tag[0]}px;top:${o.tag[1] + 26}px;--i:${i}"></span><span class="tag" data-tag="${o.id}" style="left:${o.tag[0]}px;top:${o.tag[1]}px"><b>${esc(o.label)}</b><small>${esc(o.what)}</small></span>`).join('');
  $('[data-objects]').innerHTML = `<button class="tour-btn" type="button" data-tour><span aria-hidden="true">▶</span> Take the 20-second tour</button><details${innerWidth > 1100 && innerHeight > 1000 ? ' open' : ''}><summary class="objects-h">Everything in the room (${OBJ.length})</summary><ol>${OBJ.map((o, i) => `<li><a ${o.route ? `href="#${o.route}"` : `href="#" role="button" data-act="${o.act}"`} data-obj="${o.id}"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(o.label)}</b><span class="w">${esc(o.what)}</span></a></li>`).join('')}</ol></details>`;
  const show = (id) => {
    $$('[data-tag]').forEach((t) => t.classList.toggle('on', t.dataset.tag === id));
    $$('[data-hots] [data-obj]').forEach((a) => a.classList.toggle('lit', a.dataset.obj === id));
  };
  document.addEventListener('pointerover', (e) => {
    const a = e.target.closest('[data-obj]');
    show(a ? a.dataset.obj : null);
    stage.classList.toggle('hovering', !!a?.closest('[data-hots]'));
  });
  document.addEventListener('focusin', (e) => show(e.target.closest?.('[data-obj]')?.dataset.obj));
  $('[data-wall-line]').textContent = desk.wallLine;
  $('[data-hint]').textContent = canHover() ? desk.hint : desk.hintTouch;
}

// ── lighting: the lamp (colours), the switch (on/off), keyboard RGB ─────────
const LAMPS = [
  { id: 'sunset', name: 'Sunset', c: '' },
  { id: 'violet', name: 'Violet hour', c: '#8f5bff' },
  { id: 'aurora', name: 'Aurora', c: '#21f0a8' },
  { id: 'rose', name: 'Rose', c: '#ff3d86' },
  { id: 'ocean', name: 'Deep blue', c: '#3d7bff' },
];
const RGB = ['wave', 'lamp', 'stock'];
const saved = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const light = { lamp: +saved('desk:lamp', 0) % LAMPS.length, on: saved('desk:on', '1') === '1', rgb: saved('desk:rgb', 'wave') };

function paintLight() {
  const L = LAMPS[light.lamp];
  const root = document.documentElement;
  root.style.setProperty('--lamp', L.c || '#ff7a2a');
  root.dataset.lamp = L.id;
  root.dataset.light = light.on ? 'on' : 'off';
  root.dataset.rgb = light.rgb;
  save('desk:lamp', light.lamp);
  save('desk:on', light.on ? '1' : '0');
  save('desk:rgb', light.rgb);
}
const click = () => (note(1800, { dur: 0.02, type: 'square', vol: 0.05 }), note(900, { dur: 0.03, type: 'square', vol: 0.04, at: 0.03 }));
export const lights = {
  get state() { return { lamp: LAMPS[light.lamp], on: light.on, rgb: light.rgb, lamps: LAMPS, rgbs: RGB }; },
  cycle() { if (!light.on) light.on = true; else light.lamp = (light.lamp + 1) % LAMPS.length; paintLight(); click(); toast(light.on ? `Lamp: ${LAMPS[light.lamp].name}` : 'Lamp off'); },
  set(id) { const i = LAMPS.findIndex((l) => l.id === id); if (i < 0) return false; light.lamp = i; light.on = true; paintLight(); return true; },
  power(on = !light.on) { light.on = on; paintLight(); click(); },
  rgb(mode) { light.rgb = RGB.includes(mode) ? mode : RGB[(RGB.indexOf(light.rgb) + 1) % RGB.length]; paintLight(); return light.rgb; },
};

// keys light up on the photo's keyboard as you type (rough 75% layout map)
const ROWS = [
  [0.08, 0.5, ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'], 1.08],
  [0.26, 0.5, '`1234567890-='.split(''), 1],
  [0.44, 2, 'qwertyuiop[]\\'.split(''), 1],
  [0.62, 2.25, "asdfghjkl;'".split(''), 1],
  [0.79, 2.75, 'zxcvbnm,./'.split(''), 1],
];
const SPECIAL = { ' ': [6.9, 0.94], Backspace: [14, 0.26], Enter: [13.9, 0.62], Shift: [1, 0.79], Tab: [0.7, 0.44], ArrowUp: [14.5, 0.8], ArrowDown: [14.5, 0.95], ArrowLeft: [13.5, 0.95], ArrowRight: [15.5, 0.95] };
function keyPos(key) {
  const k = key.length === 1 ? key.toLowerCase() : key;
  if (SPECIAL[k]) return SPECIAL[k];
  for (const [v, start, keys, step] of ROWS) {
    const i = keys.indexOf(k);
    if (i >= 0) return [start + i * step, v];
  }
  return null;
}
function keyGlow() {
  const box = $('[data-keys]');
  addEventListener('keydown', (e) => {
    const p = keyPos(e.key);
    if (!p) return;
    const [x, y] = bilerp(KB, (p[0] + 0.5) / 16, p[1]);
    const g = document.createElement('i');
    g.style.left = x + 'px';
    g.style.top = y + 'px';
    box.append(g);
    setTimeout(() => g.remove(), 700);
  });
}

// ── live screens on the photo ───────────────────────────────────────────────
function screens() {
  for (const [id, { w, h, q }] of Object.entries(QUADS)) {
    const el = $(`[data-screen="${id}"]`);
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.transform = quadMatrix(w, h, q);
  }
  miniMonitor($('[data-screen="monitor"]'));
  miniLaptop($('[data-screen="laptop"]'), RM);
  ledBoard($('[data-screen="board"]'));
  reel($('[data-screen="monitor"]'));
}

// ── the monitor plays an action reel until you click it ─────────────────────
// One 28-second, 1.5 MB clip (content/desk.js credits each shot). It loads
// after the photo, pauses when the tab is hidden, and is gone for the rest
// of the visit once the monitor has been opened.
let stopReel = () => {};
function reel(screen) {
  let seen = false;
  try { seen = sessionStorage.getItem('desk:reel') === 'seen'; } catch {}
  if (seen || RM || navigator.connection?.saveData) return;
  const wrap = document.createElement('div');
  wrap.className = 'reel';
  wrap.innerHTML = `<video muted loop playsinline preload="none" poster="../assets/video/reel.jpg"></video>
    <span class="reel-live"><i></i>Now showing</span><span class="reel-cap" data-cap></span><span class="reel-open">Click to open the browser</span>`;
  screen.append(wrap);
  const v = $('video', wrap);
  const cap = $('[data-cap]', wrap);
  let shown = -1;
  v.addEventListener('timeupdate', () => {
    const i = desk.reel.findLastIndex((c) => v.currentTime >= c.at);
    if (i === shown || i < 0) return;
    shown = i;
    const c = desk.reel[i];
    cap.innerHTML = `<b>${esc(c.what)}</b><small>${esc(c.who)} · ${esc(c.lic)}</small>`;
    cap.classList.remove('in');
    requestAnimationFrame(() => cap.classList.add('in'));
  });
  const start = () => { v.src = '../assets/video/reel.mp4'; v.play().catch(() => {}); };
  if (document.readyState === 'complete') setTimeout(start, 300);
  else addEventListener('load', () => setTimeout(start, 300), { once: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? v.pause() : wrap.isConnected && v.play().catch(() => {})));
  stopReel = () => {
    try { sessionStorage.setItem('desk:reel', 'seen'); } catch {}
    v.pause();
    wrap.classList.add('off');
    setTimeout(() => wrap.remove(), 600);
    stopReel = () => {};
  };
}

// ── toast ───────────────────────────────────────────────────────────────────
export function toast(msg) {
  const t = $('[data-toast]');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('on'), 2600);
}

// ── routing: #browser[/tab] · #terminal · #type · #contact · #music
const app = $('[data-app]');
const sheet = $('[data-sheet]');
const pop = $('[data-pop]');
const plq = $('[data-plaque]');
let frame = null;
// a frame fills the left of the window, its plaque the right (phones: top and bottom)
function frameView() {
  const [x0, y0, x1, y1] = bbox(frame, 0);
  const box = [x0 - 40, y0 - 60, x1 + 40, y1 + 60];
  return narrow() ? zoomView(box, { top: 0.03, h: 0.4, fill: 0.92 }) : zoomView(box, { left: 0.04, w: 0.52, top: 0.08, h: 0.84, fill: 0.86 });
}
let current = '';
let cleanup = null;
let flyTimer = 0;

export const go = (r) => (location.hash = r);
// back to the desk: a new history entry, so Back reopens what you just left
export function leave() {
  history.pushState(null, '', location.pathname + location.search);
  route('');
}
function closeAll() {
  cleanup?.();
  cleanup = null;
  clearTimeout(flyTimer);
  for (const el of [app, sheet, pop, plq]) {
    el.classList.remove('open');
    el.hidden = true;
    el.innerHTML = '';
  }
  document.body.classList.remove('in-app', 'in-sheet', 'in-plaque');
}
function route(hash) {
  const [name, sub] = hash.split('/');
  if (name === current && name === 'browser' && cleanup?.tab) return cleanup.tab(sub);
  closeAll();
  current = ROUTES.has(name) ? name : '';
  if (current === 'wall') {
    frame = PLAQUES.includes(sub) && OBJ.find((o) => o.route === `wall/${sub}`);
    if (!frame) return (current = ''), apply(deskView());
    document.documentElement.dataset.route = current;
    document.body.classList.add('touched', 'in-plaque');
    click();
    apply(frameView());
    cleanup = plaque(plq, sub, { leave, go, toast, lights });
    return;
  }
  const o = current === 'contact' ? byId('keyboard') : OBJ.find((x) => x.route === current || x.route?.startsWith(`${current}/`));
  document.documentElement.dataset.route = current;
  if (!o) return apply(deskView());
  document.body.classList.add('touched');
  click();
  const ctx = { leave, go, toast, lights };
  if (name === 'browser') stopReel();
  if (name === 'browser' || name === 'terminal') {
    apply(zoomView(o.zoom, { top: 0, h: 1, fill: 1.02 }));
    flyTimer = setTimeout(() => {
      app.hidden = false;
      document.body.classList.add('in-app');
      cleanup = name === 'browser' ? browserApp(app, { ...ctx, tab: sub }) : terminalApp(app, ctx);
      requestAnimationFrame(() => app.classList.add('open'));
    }, RM ? 0 : 760);
  } else if (name === 'contact' || name === 'type') {
    apply(zoomView(o.zoom, { top: 0.02, h: narrow() ? 0.34 : 0.42, fill: 0.96 }));
    sheet.hidden = false;
    document.body.classList.add('in-sheet');
    cleanup = (name === 'type' ? typeSheet : contactSheet)(sheet, ctx);
    requestAnimationFrame(() => sheet.classList.add('open'));
  } else {
    apply(deskView());
    pop.hidden = false;
    pop.dataset.at = o.id;
    cleanup = musicCard(pop, ctx);
    requestAnimationFrame(() => pop.classList.add('open'));
  }
}

// ── in-place acts ───────────────────────────────────────────────────────────
let cups = 0;
function act(name) {
  document.body.classList.add('touched');
  if (name === 'lamp') lights.cycle();
  if (name === 'switch') lights.power(), toast(light.on ? 'Lights on' : 'Lights off');
  if (name === 'cam') click(), toast('Smile. (It isn’t on. Nothing here is recorded.)');
  if (name === 'coffee') click(), toast(++cups === 1 ? 'Refilled. That’s one.' : cups < 4 ? `That’s ${cups} cups.` : `${cups} cups. Maybe some water?`);
  if (name === 'tour') tour();
  if (name === 'hotel') location.href = '../hotel/';
}

// the box around an object (its zoom box, or its outline plus a margin)
function bbox(o, pad = 120) {
  if (o.zoom && pad) return o.zoom;
  const p = o.polys[0];
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad];
}

// ── the guided tour: the camera visits each object with a caption ──────────
const TOUR = [
  ['monitor', 'A working browser. Every project with its live README, and all my GitHub repositories.'],
  ['board', 'Counts my public repositories, live from GitHub. The clock is Hyderabad time.'],
  ['laptop', 'A real terminal. Try help, ls or cat about.md.'],
  ['card', 'Every project I’ve built, by month.'],
  ['lately', 'What I’m doing lately. The notes on the right are research and reading.'],
  ['keyboard', 'A typing test. Every key clicks and lights up. Beat your best.'],
  ['speaker', 'Three original loops, synthesised live in your browser.'],
  ['lightbar', 'Click the light bar to change the colour of the whole room.'],
];
let touring = null;
function tour() {
  if (touring) return;
  if (current) leave();
  const box = document.createElement('div');
  box.className = 'tour';
  box.setAttribute('role', 'status');
  document.body.append(box);
  document.body.classList.add('touring', 'touched');
  let i = -1;
  let timer = 0;
  const lit = (id) => $$('[data-hots] [data-obj], [data-tag]').forEach((a) => a.classList.toggle(a.matches('[data-tag]') ? 'on' : 'lit', (a.dataset.obj || a.dataset.tag) === id));
  const step = () => {
    clearTimeout(timer);
    i++;
    if (i >= TOUR.length) return end(true);
    const [id, text] = TOUR[i];
    const o = byId(id);
    apply(zoomView(bbox(o), { top: 0.04, h: 0.7, fill: 0.92 }));
    lit(id);
    if (id === 'lightbar') setTimeout(() => touring && lights.cycle(), 1200);
    box.innerHTML = `<span class="tour-n">${i + 1} / ${TOUR.length}</span><p><b>${esc(o.label)}.</b> ${esc(text)}</p>
      <span class="tour-b"><button type="button" data-tour-end>End tour</button><button type="button" class="next" data-tour-next>${i === TOUR.length - 1 ? 'Finish' : 'Next'} →</button></span>`;
    box.classList.remove('in');
    requestAnimationFrame(() => box.classList.add('in'));
    timer = setTimeout(step, RM ? 6000 : 4600);
  };
  const end = (done) => {
    clearTimeout(timer);
    touring = null;
    lit(null);
    box.remove();
    document.body.classList.remove('touring');
    removeEventListener('keydown', key, true);
    if (!current) apply(deskView());
    if (done) toast('That’s the desk. Click anything, or press ⌘K to search.');
  };
  const key = (e) => {
    if (e.key === 'Escape') e.stopPropagation(), end();
    if (e.key === 'ArrowRight' || e.key === ' ') e.preventDefault(), step();
  };
  addEventListener('keydown', key, true);
  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-tour-next]')) step();
    if (e.target.closest('[data-tour-end]')) end();
  });
  touring = { end };
  click();
  step();
}

// ── phones: drag to look around the desk ────────────────────────────────────
function lookAround() {
  let down = null;
  let dragged = false;
  room.addEventListener('pointerdown', (e) => {
    if (current || !narrow()) return;
    down = { x: e.clientX, pan };
    dragged = false;
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 8) dragged = true;
    if (!dragged) return;
    pan = clamp(down.pan - dx / view.s, -W / 2, W / 2);
    apply(deskView(), false);
  });
  addEventListener('pointerup', () => (down = null));
  room.addEventListener('click', (e) => { if (dragged) e.preventDefault(), e.stopPropagation(), (dragged = false); }, true);
  // normalise pan to what deskView actually allows, so dragging back feels right
  const settle = () => {
    const s = view.s;
    const hw = innerWidth / 2 / s;
    pan = clamp(cx0() + pan, hw, W - hw) - cx0();
  };
  addEventListener('pointerup', settle);
}

// ── desktop: a little parallax as the pointer moves ─────────────────────────
function parallax() {
  if (!canHover() || RM) return;
  addEventListener('pointermove', (e) => {
    if (current) return;
    const px = (e.clientX / innerWidth - 0.5) * -14;
    const py = (e.clientY / innerHeight - 0.5) * -10;
    room.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) scale(1.012)`;
  }, { passive: true });
}

// ── boot: the room is dark, the switch clicks, the lamp comes on ────────────
function boot() {
  const el = $('[data-boot]');
  let seen = false;
  try { seen = sessionStorage.getItem('desk:boot') === '1'; } catch {}
  if (RM || seen || location.hash) return el.remove();
  try { sessionStorage.setItem('desk:boot', '1'); } catch {}
  document.documentElement.dataset.booting = '1';
  el.classList.add('run');
  setTimeout(() => delete document.documentElement.dataset.booting, 900);
  setTimeout(() => el.remove(), 2200);
}

// ── chrome: clock, mute, the hotel door ─────────────────────────────────────
function chrome() {
  const c = $('[data-clock]');
  const tick = () => (c.textContent = `Hyderabad · ${clockIn('Asia/Kolkata')}`);
  tick();
  setInterval(tick, 15000);
  const m = $('[data-mute]');
  const paint = () => ((m.textContent = isMuted() ? 'Sound off' : 'Sound on'), m.setAttribute('aria-pressed', String(!isMuted())));
  m.addEventListener('click', () => (setMuted(!isMuted()), paint(), click()));
  paint();
  // the pixel-you avatar in the hotel pill
  let look = LOOKS.player;
  try { look = playerLook(JSON.parse(localStorage.getItem('hotel:v1'))?.flags?.look); } catch {}
  const mini = document.createElement('canvas');
  mini.width = 20;
  mini.height = 26;
  drawPerson(mini.getContext('2d'), 10, 25, look, 1, 0, false, false, 0);
  $$('.px-avatar').forEach((s) => (s.style.backgroundImage = `url(${mini.toDataURL()})`));
  // into the hotel: a pixel dissolve, then go
  const px = $('[data-pixelate]');
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-enter-hotel]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || RM) return;
    e.preventDefault();
    const cols = Math.ceil(innerWidth / 44);
    const rows = Math.ceil(innerHeight / 44);
    px.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const r = seeded(Date.now() % 1000);
    px.innerHTML = Array.from({ length: cols * rows }, () => `<i style="--d:${Math.round(r() * 420)}ms"></i>`).join('');
    requestAnimationFrame(() => px.classList.add('go'));
    setTimeout(() => (location.href = a.href), 720);
  });
  addEventListener('pageshow', () => (px.classList.remove('go'), (px.innerHTML = '')));
}

// ── wire it up ──────────────────────────────────────────────────────────────
notes($('[data-notes]'));
hotspots();
screens();
paintLight();
keyGlow();
lookAround();
parallax();
boot();
chrome();
palette({
  desk: true,
  extra: [
    { t: 'Lights on or off', k: 'Desk', g: '◐', run: () => act('switch'), x: 'lamp dark' },
    ...LAMPS.map((l) => ({ t: `Lamp colour: ${l.name}`, k: 'Desk', g: '●', run: () => lights.set(l.id), x: 'light colour color' })),
    { t: 'Music', k: 'Desk', g: '♪', run: () => go('music'), x: 'radio play sound' },
    { t: 'Take the tour', k: 'Desk', g: '▶', run: () => tour(), x: 'guide walkthrough demo' },
    { t: 'Front page', k: 'Page', g: '⌂', run: () => (location.href = '../'), x: 'home start' },
  ],
});
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-tour]')) return e.preventDefault(), tour();
  if (touring && e.target.closest('[data-obj]')) touring.end();
  const a = e.target.closest('[data-act]');
  if (!a) return;
  e.preventDefault();
  act(a.dataset.act);
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current) leave();
});
addEventListener('hashchange', () => (touring?.end(), route(location.hash.slice(1))));
addEventListener('resize', () => {
  if (!current) apply(deskView(), false);
  else if (current === 'contact' || current === 'type') apply(zoomView(byId('keyboard').zoom, { top: 0.02, h: narrow() ? 0.34 : 0.42, fill: 0.96 }), false);
  else if (current === 'wall') apply(frameView(), false);
});
document.documentElement.classList.toggle('touch', !canHover());
apply(deskView(), false);
route(location.hash.slice(1));
requestAnimationFrame(() => document.body.classList.add('ready'));
