// ─────────────────────────────────────────────────────────────────────────────
//  THE GAME — loop, input, player, camera, collision, glass elevator,
//  interactions, the guide, save state. Rendering happens at low resolution
//  and is integer-scaled with CSS (image-rendering: pixelated).
// ─────────────────────────────────────────────────────────────────────────────
import { R, P, text, textWidth, hexA } from './gfx.js';
import { City, SKYVIEWS } from './city.js';
import { buildHotel } from './hotel.js';
import { drawPerson, drawBot, LOOKS } from './actors.js';
import { W, H, IN_L, IN_R, ELV_X0, ELV_X1, ELV_CX, FLOORS, FEET, floorById } from './layout.js';
import { openPanel, closePanel, panelOpen, registerGame } from './panels.js';
import { door } from './kit.js';
import { THEMES } from './themes.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SAVE = 'hotel:v1';
const load = () => { try { return JSON.parse(localStorage.getItem(SAVE)) || {}; } catch { return {}; } };

export class Game {
  constructor(canvasEl, hud) {
    this.cv = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.hud = hud;
    this.city = new City();
    const built = buildHotel();
    this.art = built.art;
    this.light = built.light;
    this.modules = built.modules;
    this.t = 0;
    const s = load();
    this.flags = s.flags || {};
    this.introDone = !!s.introDone;
    if (s.sky) this.city.setMode(s.sky), (this.city.fade = 0);

    const start = floorById(s.floor) && floorById(s.floor).status === 'open' ? floorById(s.floor) : floorById('lobby');
    this.player = { floor: start.idx, x: s.x ?? 300, facing: 1, phase: 0, moving: false, inCar: false, speed: 0 };
    this.car = { floor: start.idx, y: start.y, from: start.y, to: start.y, state: 'idle', door: 1, k: 0, called: null };
    this.cam = { x: 0, y: 0 };
    this.keys = new Set();
    this.task = null; // auto-travel queue
    this.guide = { x: 640, y: 0, floor: floorById('lobby').idx, follow: !this.introDone };

    // per-floor objects & residents
    this.objects = [];
    this.npcs = [];
    for (const f of FLOORS) {
      const M = this.modules[f.id];
      if (!M) continue;
      for (const o of M.objects?.(f) || []) this.objects.push({ ...o, floor: f.idx });
      for (const n of M.npcs?.(f) || []) (n.floorIdx = f.idx), this.npcs.push(n);
    }
    for (const f of FLOORS) this.objects.push({ id: 'elevator-' + f.id, floor: f.idx, x: ELV_CX, label: 'Elevator', verb: 'Ride', panel: 'elevator' });

    registerGame(this);
    this.resize();
    addEventListener('resize', () => this.resize());
    this.bindInput();
    this.last = performance.now();
    requestAnimationFrame((n) => this.frame(n));
    if (!this.introDone) setTimeout(() => openPanel('guide', { first: true }), 700);
    this.updateHud(true);
  }

  // ── setup ──────────────────────────────────────────────────────────────────
  resize() {
    const s = Math.max(2, Math.min(8, Math.floor(Math.min(innerHeight / 250, innerWidth / 300))));
    this.scale = s;
    this.vw = Math.ceil(innerWidth / s);
    this.vh = Math.ceil(innerHeight / s);
    this.cv.width = this.vw;
    this.cv.height = this.vh;
    this.cv.style.width = this.vw * s + 'px';
    this.cv.style.height = this.vh * s + 'px';
    this.ctx.imageSmoothingEnabled = false;
    this.snapCamera();
  }

  bindInput() {
    addEventListener('keydown', (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      const k = e.key.toLowerCase();
      if (panelOpen()) {
        if (k === 'escape') closePanel();
        return;
      }
      if (['arrowleft', 'arrowright', 'a', 'd', 'shift'].includes(k)) {
        this.keys.add(k);
        this.task = null;
        e.preventDefault();
      }
      if (k === 'e' || k === 'enter' || k === ' ') {
        e.preventDefault();
        this.interact();
      }
      if (k === 'm') openPanel('map');
      if (k === '?' || k === 'h') openPanel('guide');
    });
    addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());
    // click / tap to walk (or to use the thing you clicked)
    this.cv.addEventListener('pointerdown', (e) => {
      if (panelOpen()) return;
      const wx = this.cam.x + e.clientX / this.scale;
      const wy = this.cam.y + e.clientY / this.scale;
      const f = FLOORS.find((fl) => wy <= fl.y + 4 && wy >= fl.top - 4);
      if (!f) return;
      const hit = this.objects.find((o) => o.floor === f.idx && Math.abs(o.x - wx) < 14 && this.objectVisible(o));
      this.travel(f.idx, hit ? hit.x : wx, hit || null);
    });
    // touch buttons
    for (const b of this.hud.querySelectorAll('[data-hold]')) {
      const k = b.dataset.hold;
      b.addEventListener('pointerdown', (e) => (e.preventDefault(), this.keys.add(k), (this.task = null)));
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => this.keys.delete(k));
    }
    this.hud.querySelector('[data-act="use"]')?.addEventListener('click', () => this.interact());
    this.hud.querySelector('[data-act="map"]')?.addEventListener('click', () => openPanel('map'));
    this.hud.querySelector('[data-act="guide"]')?.addEventListener('click', () => openPanel('guide'));
  }

  // ── state helpers ─────────────────────────────────────────────────────────
  save() {
    try {
      localStorage.setItem(SAVE, JSON.stringify({ flags: this.flags, introDone: this.introDone, floor: FLOORS[this.player.floor].id, x: Math.round(this.player.x), sky: this.city.mode }));
    } catch {}
  }
  setFlag(k, v = true) {
    this.flags[k] = v;
    this.save();
  }
  canStop(idx) {
    const f = FLOORS[idx];
    if (f.status === 'open') return true;
    if (f.lock === 'keycard') return !!this.flags.keycard;
    if (f.lock === 'code') return !!this.flags.penthouse;
    return false;
  }
  objectVisible(o) {
    return !o.when || o.when(this);
  }
  get floor() {
    return FLOORS[this.player.floor];
  }

  // ── elevator ──────────────────────────────────────────────────────────────
  callCar(idx) {
    const c = this.car;
    if (c.state !== 'idle' || c.floor === idx) return;
    c.called = idx;
    c.state = 'closing';
  }
  /** Ride to a floor. Player must be in the car (or will walk there). */
  ride(idx) {
    if (!this.canStop(idx)) return false;
    const p = this.player;
    if (idx === p.floor && this.car.floor === idx) return true;
    this.travel(idx, null, null, true);
    return true;
  }
  updateCar(dt) {
    const c = this.car;
    const p = this.player;
    const target = c.called;
    if (c.state === 'closing') {
      c.door = Math.max(0, c.door - dt * 3);
      if (c.door === 0) {
        if (target == null || target === c.floor) c.state = 'opening';
        else {
          c.state = 'moving';
          c.from = c.y;
          c.to = FLOORS[target].y;
          c.k = 0;
          if (p.inCar) this.flash = FLOORS[target];
        }
      }
    } else if (c.state === 'moving') {
      const dist = Math.abs(c.to - c.from);
      c.k = Math.min(1, c.k + (dt * 240) / Math.max(60, dist));
      const e = c.k < 0.5 ? 2 * c.k * c.k : 1 - (-2 * c.k + 2) ** 2 / 2;
      c.y = c.from + (c.to - c.from) * e;
      if (c.k >= 1) {
        c.floor = target;
        c.called = null;
        c.state = 'opening';
        if (p.inCar) {
          p.floor = target;
          this.updateHud(true);
        }
      }
    } else if (c.state === 'opening') {
      c.door = Math.min(1, c.door + dt * 3);
      if (c.door === 1) c.state = 'idle';
    }
  }
  carHere() {
    const c = this.car;
    return c.floor === this.player.floor && c.state === 'idle' && c.door > 0.9;
  }

  // ── travel (click-to-walk, map, elevator panel) ───────────────────────────
  travel(floorIdx, x = null, useObj = null, viaPanel = false) {
    this.task = { floor: floorIdx, x: x ?? (floorIdx === this.player.floor ? this.player.x : ELV_CX + 40), use: useObj, waitCar: false };
    if (floorIdx !== this.player.floor && !this.canStop(floorIdx)) {
      this.task = null;
      openPanel('locked', { floor: FLOORS[floorIdx] });
    }
  }
  runTask() {
    const tk = this.task;
    const p = this.player;
    if (!tk) return 0;
    if (tk.floor !== p.floor) {
      // go to the elevator, board, ride
      if (!p.inCar) {
        if (Math.abs(p.x - ELV_CX) > 2) {
          if (Math.abs(p.x - ELV_CX) < 40) this.callCar(p.floor);
          if (!this.carHere() && Math.abs(p.x - ELV_CX) < 12) return 0;
          return Math.sign(ELV_CX - p.x);
        }
        if (!this.carHere()) {
          this.callCar(p.floor);
          return 0;
        }
        p.inCar = true;
        this.car.called = tk.floor;
        this.car.state = 'closing';
        return 0;
      }
      return 0; // riding
    }
    if (p.inCar && this.car.state !== 'idle') return 0;
    if (p.inCar) p.inCar = false;
    const dx = tk.x - p.x;
    if (Math.abs(dx) < 2) {
      const use = tk.use;
      this.task = null;
      if (use) this.activate(use);
      return 0;
    }
    return Math.sign(dx);
  }

  // ── interaction ───────────────────────────────────────────────────────────
  nearest() {
    const p = this.player;
    if (p.inCar && this.car.state !== 'idle') return null;
    let best = null;
    let bd = 18;
    for (const o of this.objects) {
      if (o.floor !== p.floor || !this.objectVisible(o)) continue;
      const d = Math.abs(o.x - p.x);
      if (d < bd) (bd = d), (best = o);
    }
    if (this.guide.floor === p.floor && Math.abs(this.guide.x - p.x) < 16 && (!best || Math.abs(this.guide.x - p.x) < bd)) best = { id: 'guide', label: 'Nova, your guide', verb: 'Talk', panel: 'guide' };
    for (const n of this.npcs) {
      if (n.floorIdx !== p.floor) continue;
      const d = Math.abs(n.x - p.x);
      if (d < 12 && d < bd) (bd = d), (best = { id: n.id, label: n.name, verb: 'Talk', panel: 'npc', npc: n });
    }
    return best;
  }
  interact() {
    const o = this.nearest();
    if (o) this.activate(o);
  }
  activate(o) {
    if (o.action === 'disco') {
      this.flags.disco = !this.flags.disco;
      return;
    }
    if (o.run) return o.run(this);
    openPanel(o.panel, o);
  }

  // ── update ────────────────────────────────────────────────────────────────
  update(dt) {
    const p = this.player;
    this.t += dt;
    this.updateCar(dt);
    for (const n of this.npcs) n.update(dt);

    let dir = 0;
    if (!panelOpen()) {
      if (this.keys.has('arrowleft') || this.keys.has('a')) dir -= 1;
      if (this.keys.has('arrowright') || this.keys.has('d')) dir += 1;
    }
    if (!dir) dir = this.runTask();
    if (p.inCar && this.car.state !== 'idle') dir = 0;
    if (dir && p.inCar) p.inCar = false;

    const run = this.keys.has('shift') ? 1.8 : 1;
    const target = dir * 72 * run;
    p.speed += (target - p.speed) * Math.min(1, dt * 12);
    if (Math.abs(p.speed) < 1 && !dir) p.speed = 0;
    let nx = p.x + p.speed * dt;
    // collision: outer walls + elevator shaft gap
    nx = Math.max(IN_L + 8, Math.min(IN_R - 8, nx));
    const shaftOpen = this.carHere() || p.inCar;
    if (!shaftOpen) {
      if (p.x <= ELV_X0 - 6 && nx > ELV_X0 - 6) nx = ELV_X0 - 6;
      if (p.x >= ELV_X1 + 6 && nx < ELV_X1 + 6) nx = ELV_X1 + 6;
      // standing at the gap edge with the car elsewhere → call it
      if (Math.abs(nx - (ELV_X0 - 6)) < 1 || Math.abs(nx - (ELV_X1 + 6)) < 1) if (dir) this.callCar(p.floor);
    }
    p.moving = Math.abs(nx - p.x) > 0.01;
    if (p.moving) {
      p.facing = nx > p.x ? 1 : -1;
      p.phase += Math.abs(nx - p.x) * 0.32;
    }
    p.x = nx;

    // guide: hovers beside you until the intro is done, then returns to the desk
    const g = this.guide;
    const lobbyIdx = floorById('lobby').idx;
    const gx = g.follow && p.floor === lobbyIdx ? p.x - p.facing * 18 : 640;
    g.x += (gx - g.x) * Math.min(1, dt * 2.5);

    // camera
    this.followCamera(dt);
    // autosave occasionally
    this.saveTimer = (this.saveTimer || 0) + dt;
    if (this.saveTimer > 3) (this.saveTimer = 0), this.save();
    // HUD prompt
    const near = this.nearest();
    if (near?.id !== this.lastNear) {
      this.lastNear = near?.id;
      this.hud.querySelector('[data-prompt]').textContent = near ? `${near.verb} · ${near.label}` : '';
    }
  }

  feetY() {
    return this.player.inCar ? this.car.y - FEET : FLOORS[this.player.floor].y - FEET;
  }
  camTarget() {
    const p = this.player;
    const y = p.inCar ? this.car.y : FLOORS[p.floor].y;
    return { x: p.x - this.vw / 2, y: y - this.vh * 0.82 };
  }
  clampCam(c) {
    c.x = Math.max(0, Math.min(W - this.vw, c.x));
    c.y = Math.max(0, Math.min(H - this.vh, c.y));
    if (this.vw > W) c.x = (W - this.vw) / 2;
    return c;
  }
  followCamera(dt) {
    const t = this.clampCam(this.camTarget());
    const k = reduced ? 1 : Math.min(1, dt * 6);
    this.cam.x += (t.x - this.cam.x) * k;
    this.cam.y += (t.y - this.cam.y) * (this.player.inCar ? 1 : k);
  }
  snapCamera() {
    Object.assign(this.cam, this.clampCam(this.camTarget()));
  }

  updateHud(force) {
    const f = this.floor;
    const el = this.hud.querySelector('[data-where]');
    if (el) el.innerHTML = `<b>${f.n}</b> ${f.name}`;
    if (force) document.title = `${f.name} — Cyberverse Hotel`;
  }

  // ── render ────────────────────────────────────────────────────────────────
  frame(now) {
    requestAnimationFrame((n) => this.frame(n));
    if (document.hidden) return (this.last = now);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.render();
  }

  render() {
    const { ctx, cam, vw, vh } = this;
    const cx = Math.round(cam.x);
    const cy = Math.round(cam.y);
    ctx.clearRect(0, 0, vw, vh);
    this.city.draw(ctx, { x: cx, y: cy }, vw, vh, this.t, reduced);
    ctx.drawImage(this.art, cx, cy, vw, vh, 0, 0, vw, vh);

    ctx.save();
    ctx.translate(-cx, -cy);
    const G = { flags: this.flags, skyColor: SKYVIEWS[this.city.mode] && this.skyColor() };
    // dynamic floor details for visible floors only
    for (const f of FLOORS) {
      if (f.y < cy - 10 || f.top > cy + vh + 10) continue;
      const M = this.modules[f.id];
      M?.dyn?.(ctx, f, this.t, G);
      for (const dx of M?.doors || []) {
        const near = this.player.floor === f.idx ? Math.abs(this.player.x - dx) : 99;
        const target = near < 26 ? 1 : 0;
        const key = f.id + dx;
        this.doorOpen = this.doorOpen || {};
        this.doorOpen[key] = (this.doorOpen[key] ?? 0) + (target - (this.doorOpen[key] ?? 0)) * 0.2;
        door(ctx, f, THEMES[f.theme], dx, this.doorOpen[key]);
      }
    }
    // residents
    for (const n of this.npcs) {
      const f = FLOORS[n.floorIdx];
      if (f.y < cy || f.top > cy + vh) continue;
      n.draw(ctx, f.y - FEET);
    }
    this.drawCar(ctx);
    // guide
    const gf = FLOORS[this.guide.floor];
    drawBot(ctx, Math.round(this.guide.x), gf.y - FEET - 16 + Math.round(Math.sin(this.t * 2) * 2), this.t, '#3dffb0');
    // player
    const p = this.player;
    drawPerson(ctx, p.x, this.feetY(), LOOKS.player, p.facing, p.phase, p.moving);
    this.drawCarFront(ctx);
    // prompt above nearest object
    const near = this.nearest();
    if (near && !panelOpen()) this.drawPrompt(ctx, near);
    ctx.restore();

    // light layer (additive)
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = reduced ? 0.9 : 0.85 + Math.sin(this.t * 7) * 0.02 + Math.sin(this.t * 1.3) * 0.03;
    ctx.drawImage(this.light, cx, cy, vw, vh, 0, 0, vw, vh);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    // vignette + elevator floor flash
    if (this.flash && this.car.state === 'moving') this.drawFloorFlash(ctx, this.flash);
  }

  drawCar(ctx) {
    const c = this.car;
    const y = Math.round(c.y - 8);
    const x0 = ELV_X0 + 4;
    const w = ELV_X1 - ELV_X0 - 8;
    // cable
    R(ctx, ELV_CX, FLOORS[FLOORS.length - 1].top, 1, y - 44 - FLOORS[FLOORS.length - 1].top, '#3a3448');
    // cabin
    R(ctx, x0, y - 44, w, 44, '#1a1226');
    R(ctx, x0, y - 44, w, 3, '#d4a64e');
    R(ctx, x0, y, w, 3, '#d4a64e');
    R(ctx, x0 + 2, y - 41, w - 4, 40, '#2a1e3a');
    R(ctx, x0 + 4, y - 40, w - 8, 1, '#ffe6b0');
    R(ctx, ELV_CX - 4, y - 38, 9, 6, '#05040a');
    const f = FLOORS[c.floor];
    const dest = c.called != null ? FLOORS[c.called] : f;
    text(ctx, c.state === 'moving' ? dest.n : f.n, ELV_CX - (f.n.length > 1 ? 3 : 1), y - 37, '#ffb347');
  }
  drawCarFront(ctx) {
    // glass gates on both sides of the cabin (slide up when open)
    const c = this.car;
    const y = Math.round(c.y - 8);
    const g = Math.round(40 * (1 - c.door));
    for (const x of [ELV_X0 + 4, ELV_X1 - 6]) {
      R(ctx, x, y - g, 2, g, 'rgba(160,220,255,0.55)');
    }
    ctx.fillStyle = 'rgba(160,220,255,0.06)';
    ctx.fillRect(ELV_X0 + 4, y - 44, ELV_X1 - ELV_X0 - 8, 44);
  }

  drawPrompt(ctx, o) {
    const p = this.player;
    const label = `[E] ${o.verb} · ${o.label}`.toUpperCase();
    const w = textWidth(label) + 8;
    const x = Math.round(Math.max(this.cam.x + 2, Math.min(this.cam.x + this.vw - w - 2, (o.x ?? p.x) - w / 2)));
    const y = Math.round(this.feetY() - 54 + Math.sin(this.t * 4) * 1);
    R(ctx, x, y, w, 11, 'rgba(10,6,18,0.86)');
    R(ctx, x, y, w, 1, '#3dffb0');
    text(ctx, label, x + 4, y + 3, '#f4f0ff');
    R(ctx, x + w / 2 - 1, y + 11, 3, 2, 'rgba(10,6,18,0.86)');
  }

  drawFloorFlash(ctx, f) {
    const str = `${f.n} · ${f.name}`.toUpperCase();
    const w = textWidth(str, 2) + 16;
    const x = Math.round((this.vw - w) / 2);
    R(ctx, x, 14, w, 20, 'rgba(10,6,18,0.8)');
    R(ctx, x, 14, w, 1, '#ffb347');
    text(ctx, str, x + 8, 19, '#ffe6b0', 2);
  }

  skyColor() {
    return { city: '#ff3d9a', sunset: '#ffb347', aurora: '#3dffb0', space: '#9b8cff' }[this.city.mode];
  }
}
