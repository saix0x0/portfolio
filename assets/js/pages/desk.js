// ─────────────────────────────────────────────────────────────────────────────
//  THE DESK — the front page. A photo of the real desk (1600×1200 "stage"),
//  scaled to cover the window, with live screens and lights layered on top and
//  a hotspot per object. Every object has a URL (#browser, #terminal, …) so
//  each destination is linkable; the lamp, switch and bottle act in place.
//
//  Coordinates below are photo pixels. If the photo changes, re-measure them.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, seeded, clamp, reducedMotion, canHover } from '../core/base.js';
import { clockIn } from '../core/sun.js';
import { desk } from '../../../content/desk.js';
import { drawPerson, LOOKS, playerLook } from '../world/actors.js';
import { isMuted, setMuted, note, hz } from '../world/sound.js';
import { browserApp, miniMonitor } from '../desk/browser.js';
import { terminalApp, miniLaptop } from '../desk/terminal.js';
import { contactSheet, usesCard, musicCard, readingCard } from '../desk/bits.js';

const RM = reducedMotion();
const W = 1600;
const H = 1200;

// ── the objects on the desk ─────────────────────────────────────────────────
// poly: the outline in photo px · tag: where the label sits · zoom: the box the
// camera flies to · route: the URL hash it opens · act: an in-place action
const OBJ = [
  { id: 'monitor', label: 'Monitor', what: 'Projects, academics & live F1', route: 'browser', tag: [768, 344], zoom: [438, 350, 1099, 723],
    polys: [[[438, 350], [1099, 350], [1097, 722], [441, 723]]] },
  { id: 'laptop', label: 'MacBook', what: 'A terminal for the whole site', route: 'terminal', tag: [190, 404], zoom: [0, 414, 374, 662],
    polys: [[[0, 420], [360, 408], [380, 642], [404, 772], [0, 792]]] },
  { id: 'keyboard', label: 'Keyboard', what: 'Type to me · contact', route: 'contact', tag: [566, 842], zoom: [250, 820, 890, 1010],
    polys: [[[338, 850], [812, 846], [858, 997], [282, 999]]] },
  { id: 'mouse', label: 'Mouse', what: 'Uses · the setup', route: 'uses', tag: [1000, 828],
    polys: [[[940, 848], [1010, 832], [1072, 898], [1080, 988], [926, 992]]] },
  { id: 'airpods', label: 'AirPods', what: 'Now playing', route: 'music', tag: [1256, 918],
    polys: [[[1205, 932], [1292, 924], [1310, 986], [1214, 1000]]] },
  { id: 'book', label: 'The book', what: 'What I’m reading', route: 'reading', tag: [1430, 856],
    polys: [[[1248, 880], [1436, 860], [1600, 926], [1600, 1082], [1446, 1072]]] },
  { id: 'bottle', label: 'Bottle', what: 'Hydrate', act: 'bottle', tag: [1484, 512],
    polys: [[[1428, 526], [1540, 526], [1546, 940], [1420, 940]]] },
  { id: 'lamp', label: 'Sunset lamp', what: 'Change the light', act: 'lamp', tag: [1396, 462],
    polys: [[[1352, 476], [1446, 476], [1440, 724], [1362, 724]], [[1230, 0], [1600, 0], [1600, 330], [1420, 470], [1372, 470]]] },
  { id: 'switch', label: 'Switches', what: 'Lights on / off', act: 'switch', tag: [1206, 388],
    polys: [[[1104, 396], [1310, 392], [1312, 472], [1104, 474]]] },
];
const ROUTES = new Set(OBJ.map((o) => o.route).filter(Boolean));

// screen quads (TL, TR, BR, BL) for the live overlays
const QUADS = {
  monitor: { w: 1320, h: 744, q: [[438, 350], [1099, 350], [1097, 722], [441, 723]] },
  laptop: { w: 720, h: 470, q: [[-6, 424], [356, 414], [373, 636], [-6, 662]] },
};
const KB = [[338, 852], [812, 848], [856, 995], [282, 998]]; // keyboard top face

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
  const cx = clamp(770 + pan, hw, W - hw);
  const cy = clamp(126 + hh, hh, H - hh); // keep the name on the wall in frame
  return { s, x: vw / 2 - cx * s, y: vh / 2 - cy * s };
}
// fly the camera so box [x0,y0,x1,y1] fills `area` of the window
function zoomView([x0, y0, x1, y1], area = { top: 0, h: 1, fill: 1 }) {
  const vw = innerWidth;
  const vh = innerHeight * area.h;
  const s = Math.min(vw / (x1 - x0), vh / (y1 - y0)) * area.fill;
  return { s, x: vw / 2 - ((x0 + x1) / 2) * s, y: innerHeight * area.top + vh / 2 - ((y0 + y1) / 2) * s };
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
  $('[data-objects]').innerHTML = `<p class="objects-h">On the desk</p><ol>${OBJ.map((o, i) => `<li><a ${o.route ? `href="#${o.route}"` : `href="#" role="button" data-act="${o.act}"`} data-obj="${o.id}"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(o.label)}</b><span class="w">${esc(o.what)}</span></a></li>`).join('')}</ol>`;
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
}

// ── toast ───────────────────────────────────────────────────────────────────
export function toast(msg) {
  const t = $('[data-toast]');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('on'), 2600);
}

// ── routing: #browser[/tab] · #terminal · #contact · #uses · #music · #reading
const app = $('[data-app]');
const sheet = $('[data-sheet]');
const pop = $('[data-pop]');
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
  for (const el of [app, sheet, pop]) {
    el.classList.remove('open');
    el.hidden = true;
    el.innerHTML = '';
  }
  document.body.classList.remove('in-app', 'in-sheet');
}
function route(hash) {
  const [name, sub] = hash.split('/');
  if (name === current && name === 'browser' && cleanup?.tab) return cleanup.tab(sub);
  closeAll();
  current = ROUTES.has(name) ? name : '';
  const o = OBJ.find((x) => x.route === current);
  document.documentElement.dataset.route = current;
  if (!o) return apply(deskView());
  document.body.classList.add('touched');
  click();
  const ctx = { leave, go, toast, lights };
  if (name === 'browser' || name === 'terminal') {
    apply(zoomView(o.zoom, { top: 0, h: 1, fill: 1.02 }));
    flyTimer = setTimeout(() => {
      app.hidden = false;
      document.body.classList.add('in-app');
      cleanup = name === 'browser' ? browserApp(app, { ...ctx, tab: sub }) : terminalApp(app, ctx);
      requestAnimationFrame(() => app.classList.add('open'));
    }, RM ? 0 : 760);
  } else if (name === 'contact') {
    apply(zoomView(o.zoom, { top: 0.02, h: narrow() ? 0.34 : 0.42, fill: 0.96 }));
    sheet.hidden = false;
    document.body.classList.add('in-sheet');
    cleanup = contactSheet(sheet, ctx);
    requestAnimationFrame(() => sheet.classList.add('open'));
  } else {
    apply(deskView());
    pop.hidden = false;
    pop.dataset.at = o.id;
    cleanup = { uses: usesCard, music: musicCard, reading: readingCard }[name](pop, ctx);
    requestAnimationFrame(() => pop.classList.add('open'));
  }
}

// ── in-place acts ───────────────────────────────────────────────────────────
let sips = 0;
function act(name, at) {
  document.body.classList.add('touched');
  if (name === 'lamp') lights.cycle();
  if (name === 'switch') lights.power(), toast(light.on ? 'Lights on' : 'Lights off. Screens only.');
  if (name === 'bottle') {
    const day = new Date().toDateString();
    const st = JSON.parse(saved('desk:water', '{}'));
    sips = st.day === day ? st.n + 1 : 1;
    save('desk:water', JSON.stringify({ day, n: sips }));
    toast(`${desk.bottle[(sips - 1) % desk.bottle.length]}  ·  sips today: ${sips}`);
    ripple(at);
    note(hz(19), { dur: 0.08, type: 'sine', vol: 0.1, slide: 1.6 });
  }
}
function ripple([x, y]) {
  const r = document.createElement('i');
  r.className = 'ripple';
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  stage.append(r);
  setTimeout(() => r.remove(), 900);
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
    pan = clamp(down.pan - dx / view.s, -800, 800);
    apply(deskView(), false);
  });
  addEventListener('pointerup', () => (down = null));
  room.addEventListener('click', (e) => { if (dragged) e.preventDefault(), e.stopPropagation(), (dragged = false); }, true);
  // normalise pan to what deskView actually allows, so dragging back feels right
  const settle = () => {
    const s = view.s;
    const hw = innerWidth / 2 / s;
    pan = clamp(770 + pan, hw, W - hw) - 770;
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
hotspots();
screens();
paintLight();
keyGlow();
lookAround();
parallax();
boot();
chrome();
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]');
  if (!a) return;
  e.preventDefault();
  const o = OBJ.find((x) => x.act === a.dataset.act);
  act(a.dataset.act, o.tag);
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current) leave();
});
addEventListener('hashchange', () => route(location.hash.slice(1)));
addEventListener('resize', () => {
  if (!current) apply(deskView(), false);
  else if (current === 'contact') apply(zoomView(OBJ[2].zoom, { top: 0.02, h: narrow() ? 0.34 : 0.42, fill: 0.96 }), false);
});
document.documentElement.classList.toggle('touch', !canHover());
apply(deskView(), false);
route(location.hash.slice(1));
requestAnimationFrame(() => document.body.classList.add('ready'));
