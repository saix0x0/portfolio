// ─────────────────────────────────────────────────────────────────────────────
//  THE DESK at /desk/. A room drawn in code, straight on (a 2400×1500 "stage",
//  assets/js/desk/room.js), scaled to cover the window, with live screens on
//  it and a hotspot per object. Every object has a URL (#browser, #terminal, …)
//  so each destination is linkable; the lamp and the switch act in place.
//
//  Boxes below are stage pixels and match the positions in room.js.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, seeded, clamp, reducedMotion, canHover } from '../core/base.js';
import { clockIn } from '../core/sun.js';
import { desk } from '../../../content/desk.js';
import { site } from '../../../content/site.js';
import { isMuted, setMuted, note, level } from '../core/sound.js';
import { browserApp } from '../desk/browser.js';
import { terminalApp, miniLaptop } from '../desk/terminal.js';
import { contactSheet, typeSheet, musicCard } from '../desk/bits.js';
import { palette } from '../core/palette.js';
import '../core/visits.js';
import { ledBoard, plaque, PLAQUES } from '../desk/wall.js';
import { room as drawRoom, lockScreen } from '../desk/room.js';
import { onKey } from '../desk/keys.js';
import { critter } from '../desk/critter.js';

const RM = reducedMotion();
const W = 2400;
const H = 1500;
const CX = 1200; // where the camera looks: the monitor
const CY = 740;

// ── the objects in the room ─────────────────────────────────────────────────
// box: [x0, y0, x1, y1] in stage px · zoom: the box the camera flies to ·
// route: the URL hash it opens · act: an in-place action
const OBJ = [
  { id: 'monitor', label: 'Monitor', what: 'Projects & GitHub', route: 'browser', box: [688, 646, 1712, 1002], zoom: [680, 600, 1720, 1012] },
  { id: 'laptop', label: 'Laptop', what: 'The terminal', route: 'terminal', box: [300, 786, 770, 1078], zoom: [260, 740, 810, 1100] },
  { id: 'board', label: 'LED board', what: 'Live from GitHub', route: 'browser/github', box: [1730, 886, 1912, 1072] },
  { id: 'portrait', label: 'Portrait', what: 'About me', route: 'wall/about', box: [220, 430, 532, 800] },
  { id: 'poster', label: 'Poster', what: 'Projects timeline', route: 'wall/timeline', box: [1690, 430, 1962, 800] },
  { id: 'lately', label: 'Note', what: 'Experience', route: 'wall/progress', box: [600, 492, 784, 704] },
  { id: 'research', label: 'Index card', what: 'Research', route: 'wall/research', box: [2044, 654, 2210, 806] },
  { id: 'books', label: 'Bookshelf', what: 'Reading & philosophy', route: 'wall/books', box: [1664, 140, 2184, 352] },
  { id: 'speaker', label: 'Speaker', what: 'Spotify & music', route: 'music', box: [1950, 846, 2262, 1072] },
  { id: 'record', label: 'Record player', what: 'Original loops', route: 'music/loops', box: [300, 268, 610, 352] },
  { id: 'lightbar', label: 'Light bar', what: 'Change the light', act: 'lamp', box: [940, 622, 1460, 650] },
  { id: 'keyboard', label: 'Keyboard', what: 'Typing test', route: 'type', box: [930, 1060, 1410, 1134], zoom: [870, 990, 1470, 1150] },
  { id: 'letters', label: 'Letters', what: 'Write to me', route: 'contact', box: [790, 996, 920, 1090] },
  { id: 'mug', label: 'Mug', what: 'Refill', act: 'coffee', box: [1570, 1032, 1662, 1106] },
  { id: 'mouse', label: 'Mouse', what: 'Take the tour', act: 'tour', box: [1452, 1092, 1506, 1122] },
  { id: 'switch', label: 'Light switch', what: 'Lights on or off', act: 'switch', box: [56, 600, 124, 704] },
  { id: 'wanderer', label: 'Painting', what: 'Wanderer above the Sea of Fog', act: 'art', box: [866, 96, 1120, 432] },
  { id: 'composition', label: 'Painting', what: 'Composition VII', act: 'art', box: [1184, 168, 1556, 420] },
  { id: 'bathers', label: 'Painting', what: 'Bathers at Asnières', act: 'art', box: [2010, 440, 2252, 620] },
  { id: 'chair', label: 'Chair', what: 'Sit down: play the game', act: 'hotel', box: [750, 1150, 1650, 1500] },
].filter((o) => o.act !== 'hotel' || site.game); // the chair is the hotel's door
for (const o of OBJ) {
  const [x0, y0, x1, y1] = o.box;
  o.polys = [[[x0, y0], [x1, y0], [x1, y1], [x0, y1]]];
  o.tag = [(x0 + x1) / 2, y0];
}
const byId = (id) => OBJ.find((o) => o.id === id);
const ROUTES = new Set([...OBJ.map((o) => o.route).filter(Boolean), 'contact', 'wall']);

// screen quads (TL, TR, BR, BL) for the live overlays
const QUADS = {
  monitor: { w: 1440, h: 470, q: [[702, 660], [1698, 660], [1698, 988], [702, 988]] },
  laptop: { w: 640, h: 379, q: [[324, 802], [746, 802], [746, 1052], [324, 1052]] },
  board: { w: 640, h: 640, q: [[1742, 898], [1900, 898], [1900, 1056], [1742, 1056]] },
};

// ── stage transform ─────────────────────────────────────────────────────────
const room = $('[data-room]');
const stage = $('[data-stage]');
let view = { s: 1, x: 0, y: 0 };
let pan = 0; // phones: horizontal look-around, in photo px
const narrow = () => innerWidth / innerHeight < 1.05;

function deskView() {
  const vw = innerWidth;
  const vh = innerHeight;
  // phones see the middle 1050px and drag to look around; the wall and floor
  // carry on past the stage's edges, so a short room still fills the window
  const s = narrow() ? Math.max(vw / 1050, (vh / H) * 0.6) : Math.max(vw / W, vh / H);
  const hw = vw / 2 / s;
  const hh = vh / 2 / s;
  const cx = W * s <= vw ? W / 2 : clamp(CX + pan, hw, W - hw);
  const cy = H * s <= vh ? H / 2 : clamp(CY, hh, H - hh);
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
// Until the first frame is painted every move is instant: gliding from the
// stage's unset transform made the room slide in from the wrong place on load.
let settled = false;
function apply(v, animate = true) {
  view = v;
  stage.classList.toggle('glide', animate && settled && !RM);
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
// ── the hover light: one soft glow laid over the object. (A filter on the
// object itself made big things like the speaker flicker or flash black.) ──
const haloEl = document.createElement('i');
haloEl.className = 'halo';
stage.insertBefore(haloEl, $('[data-hots]'));
function halo(id) {
  const o = id && byId(id);
  haloEl.classList.toggle('on', !!o);
  if (!o) return;
  const [x0, y0, x1, y1] = o.box;
  Object.assign(haloEl.style, { left: `${x0}px`, top: `${y0}px`, width: `${x1 - x0}px`, height: `${y1 - y0}px` });
}

// ── hotspots, labels and the plain list ─────────────────────────────────────
function hotspots() {
  const pts = (p) => p.map((xy) => xy.join(',')).join(' ');
  $('[data-hots]').innerHTML = OBJ.map((o) => {
    const target = o.route ? `href="#${o.route}"` : `href="#" role="button" data-act="${o.act}"`;
    return `<a ${target} data-obj="${o.id}" aria-label="${esc(o.label)}: ${esc(o.what)}">${o.polys.map((p) => `<polygon points="${pts(p)}"/>`).join('')}</a>`;
  }).join('');
  $('[data-tags]').innerHTML = OBJ.map((o) => `<span class="tag" data-tag="${o.id}" style="left:${o.tag[0]}px;top:${o.tag[1]}px"><b>${esc(o.label)}</b><small>${esc(o.what)}</small></span>`).join('');
  $('[data-objects]').innerHTML = `<details><summary><b>Everything in the room</b><em>All</em> <span>${OBJ.length}</span></summary><ol>${OBJ.map((o, i) => `<li><a ${o.route ? `href="#${o.route}"` : `href="#" role="button" data-act="${o.act}"`} data-obj="${o.id}"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(o.label)}</b><span class="w">${esc(o.what)}</span></a></li>`).join('')}</ol></details>`;
  const show = (id) => {
    $$('[data-tag]').forEach((t) => t.classList.toggle('on', t.dataset.tag === id));
    halo(id);
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
  { id: 'sunset', name: 'Amber', c: '#ff7a2a' },
  { id: 'warm', name: 'Warm white', c: '#ffc98a' },
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
  root.style.setProperty('--lamp', L.c);
  root.dataset.lamp = L.id;
  root.style.setProperty('--turn', `${light.lamp * 30}deg`);
  root.dataset.light = light.on ? 'on' : 'off';
  root.dataset.rgb = light.rgb;
  const d = $('[data-dial-name]');
  if (d) d.textContent = light.on ? L.name : 'Off';
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

// keys light up on the room's keyboard as you type, and the room keeps the beat
function keyGlow() {
  const svg = $('.r-kb svg');
  onKey((code, down) => svg.querySelector(`[data-k="${code}"]`)?.classList.toggle('down', down));
}
function beat() {
  if (RM) return;
  const root = document.documentElement;
  let v = 0;
  let shown = '';
  const tick = () => {
    const on = root.dataset.playing === '1' || root.dataset.keys === '1';
    v = on ? Math.max(level() * 2.2, v * 0.86) : v * 0.9;
    const out = v < 0.01 ? '0' : Math.min(1, v).toFixed(2);
    if (out !== shown) root.style.setProperty('--beat', (shown = out)); // only restyle when it changes
    requestAnimationFrame(tick);
  };
  tick();
}

// ── live screens on the photo ───────────────────────────────────────────────
function screens() {
  for (const [id, { w, h, q }] of Object.entries(QUADS)) {
    const el = $(`[data-screen="${id}"]`);
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.transform = quadMatrix(w, h, q);
  }
  lockScreen($('[data-screen="monitor"]'));
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
// the keyboard interface needs most of the window, so the camera gets less
const sheetArea = (name) => ({ top: 0.02, h: name === 'type' ? (narrow() ? 0.2 : 0.22) : narrow() ? 0.34 : 0.42, fill: 0.96 });
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
  document.body.classList.remove('in-app', 'in-sheet', 'in-plaque', 'in-pop');
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
    apply(zoomView(o.zoom, sheetArea(name)));
    sheet.hidden = false;
    document.body.classList.add('in-sheet');
    cleanup = (name === 'type' ? typeSheet : contactSheet)(sheet, ctx);
    requestAnimationFrame(() => sheet.classList.add('open'));
  } else {
    apply(deskView());
    pop.hidden = false;
    pop.dataset.at = o.id;
    document.body.classList.add('in-pop');
    cleanup = musicCard(pop, { ...ctx, tab: sub });
    requestAnimationFrame(() => pop.classList.add('open'));
  }
}

// ── in-place acts ───────────────────────────────────────────────────────────
let cups = 0;
function act(name, id) {
  document.body.classList.add('touched');
  if (name === 'art') {
    const a = site.life.find((l) => l.art.src.includes(id))?.art;
    if (a) click(), toast(`${a.name} · ${a.by}, ${a.year} · public domain`);
  }
  if (name === 'sound') setMuted(!isMuted()), paintMute(), click(), toast(isMuted() ? 'Sound off' : 'Sound on');
  if (name === 'lamp') lights.cycle();
  if (name === 'switch') lights.power(), toast(light.on ? 'Lights on' : 'Lights off');
  if (name === 'cam') click(), toast('Smile. (It isn’t on. Nothing here is recorded.)');
  if (name === 'coffee') $('.r-mug').classList.add('hot'), clearTimeout(act.steam), (act.steam = setTimeout(() => $('.r-mug').classList.remove('hot'), 7000));
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
  ['laptop', 'A real terminal. Try help, ls or cat about.md.'],
  ['poster', 'Every project I’ve built, by month.'],
  ['books', 'My library. The card below it is research.'],
  ['board', 'Counts my public repositories, live from GitHub. The clock is Hyderabad time.'],
  ['keyboard', 'A typing test. Every key clicks and lights up. Beat your best.'],
  ['speaker', 'Spotify on the speaker: pick a playlist or paste any link. It keeps playing while you look around.'],
  ['record', 'Three original loops, synthesised live in your browser. The lights move with them.'],
  ['lightbar', 'Click the light bar, or the dial in the corner, to change the colour of the whole room.'],
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
  const lit = (id) => ($$('[data-tag]').forEach((a) => a.classList.toggle('on', a.dataset.tag === id)), halo(id));
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
    pan = clamp(CX + pan, hw, W - hw) - CX;
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

function paintMute() {
  const m = $('[data-mute]');
  m.setAttribute('aria-pressed', String(!isMuted()));
  m.setAttribute('aria-label', isMuted() ? 'Sound is off. Turn it on' : 'Sound is on. Turn it off');
}

// ── chrome: clock, mute, the light dial, the hotel door ─────────────────────────────────────
function chrome() {
  // the hotel's door in the top bar, only while the game is on (site.game)
  if (site.game) $('[data-palette]').parentElement.insertAdjacentHTML('beforeend', '<a class="hotel-pill" href="../hotel/" data-enter-hotel><span class="px-avatar" aria-hidden="true"></span>Enter game <span aria-hidden="true">▸</span></a>');
  const c = $('[data-clock]');
  const tick = () => (c.textContent = clockIn('Asia/Kolkata'));
  tick();
  setInterval(tick, 15000);
  $('[data-mute]').addEventListener('click', () => (setMuted(!isMuted()), paintMute(), click()));
  paintMute();
  // the dial in the corner: turn it for the next colour, the button under it is the switch
  $('[data-dial]').addEventListener('click', () => lights.cycle());
  $('[data-power]').addEventListener('click', () => (lights.power(), toast(light.on ? 'Lights on' : 'Lights off')));
  // the pixel-you avatar in the hotel pill (the game's code loads only when it's on)
  if (site.game) import('../world/actors.js').then(({ drawPerson, LOOKS, playerLook }) => {
    let look = LOOKS.player;
    try { look = playerLook(JSON.parse(localStorage.getItem('hotel:v1'))?.flags?.look); } catch {}
    const mini = document.createElement('canvas');
    mini.width = 20;
    mini.height = 26;
    drawPerson(mini.getContext('2d'), 10, 25, look, 1, 0, false, false, 0);
    $$('.px-avatar').forEach((s) => (s.style.backgroundImage = `url(${mini.toDataURL()})`));
  });
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
drawRoom($('[data-set]'));
hotspots();
screens();
paintLight();
keyGlow();
beat();
critter(stage, { reduced: RM, toast });
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
  act(a.dataset.act, a.dataset.obj);
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current) leave();
});
addEventListener('hashchange', () => (touring?.end(), route(location.hash.slice(1))));
addEventListener('resize', () => {
  if (!current) apply(deskView(), false);
  else if (current === 'contact' || current === 'type') apply(zoomView(byId('keyboard').zoom, sheetArea(current)), false);
  else if (current === 'wall') apply(frameView(), false);
});
document.documentElement.classList.toggle('touch', !canHover());
apply(deskView(), false);
route(location.hash.slice(1));
requestAnimationFrame(() => {
  document.body.classList.add('ready');
  settled = true;
});
