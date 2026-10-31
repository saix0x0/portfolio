// ─────────────────────────────────────────────────────────────────────────────
//  THE GAME — loop, input, player, camera, collision, glass elevator,
//  interactions, the guide, save state. Rendering happens at low resolution
//  and is integer-scaled with CSS (image-rendering: pixelated).
//  3D: everyone has (x, z) on their floor; layout.js has the projection.
//  Per frame, each visible floor's props, walls and people are depth-sorted.
// ─────────────────────────────────────────────────────────────────────────────
import { R, P, text, textWidth, hexA } from './gfx.js';
import { City, SKYVIEWS } from './city.js';
import { buildHotel } from './hotel.js';
import { drawPerson, drawBot, LOOKS } from './actors.js';
import { IW, IH, IN_L, IN_R, ELV_X0, ELV_X1, ELV_CX, FLOORS, floorById, WALL, TILT, OX, FD, Z_MIN, Z_MAX, LANE, SHAFT_Z, GAP0, GAP1, DEPTH, SLAB, proj, unproj, ceilY } from './layout.js';
import { openPanel, closePanel, panelOpen, registerGame } from './panels.js';
import { wallPieces, sideX, faceZ, top, onFace } from './kit.js';
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
    this.front = built.front;
    this.modules = built.modules;
    this.t = 0;
    const s = load();
    this.flags = s.flags || {};
    this.introDone = !!s.introDone;
    if (s.sky) this.city.setMode(s.sky), (this.city.fade = 0);

    const start = floorById(s.floor) && floorById(s.floor).status === 'open' ? floorById(s.floor) : floorById('lobby');
    this.player = { floor: start.idx, x: s.x ?? 300, z: s.z ?? LANE, facing: 1, phase: 0, moving: false, inCar: false, vx: 0, vz: 0 };
    this.car = { floor: start.idx, y: start.yb, from: start.yb, to: start.yb, state: 'idle', door: 1, k: 0, called: null };
    this.cam = { x: 0, y: 0 };
    this.keys = new Set();
    this.task = null; // auto-travel queue
    this.guide = { x: 640, z: LANE, floor: floorById('lobby').idx, follow: !this.introDone };

    // per-floor objects, residents and 3D scenery (props + interior walls)
    this.objects = [];
    this.npcs = [];
    this.scenes = FLOORS.map(() => []);
    this.doorOpen = {};
    for (const f of FLOORS) {
      const M = this.modules[f.id];
      if (!M) continue;
      for (const o of M.objects?.(f) || []) this.objects.push({ z: 20, ...o, floor: f.idx });
      for (const n of M.npcs?.(f) || []) (n.floorIdx = f.idx), this.npcs.push(n);
      const sc = this.scenes[f.idx];
      for (const it of M.props?.(f) || []) sc.push(it);
      for (const dx of M.doors || []) {
        const key = f.id + dx;
        this.doorOpen[key] = 0;
        sc.push(...wallPieces(f, THEMES[f.theme], dx, GAP0, GAP1, () => this.doorOpen[key]));
      }
      sc.sort((a, b) => a.z1 - b.z1 || a.x0 - b.x0);
    }
    for (const f of FLOORS) this.objects.push({ id: 'elevator-' + f.id, floor: f.idx, x: ELV_CX, z: SHAFT_Z + 8, label: 'Elevator', verb: 'Ride', panel: 'elevator' });
    if (this.blocked(this.player.floor, this.player.x, this.player.z)) this.player.z = LANE;

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
    const s = Math.max(2, Math.min(8, Math.floor(Math.min(innerHeight / 320, innerWidth / 400))));
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
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's', 'shift'].includes(k)) {
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
      const sx = this.cam.x + e.clientX / this.scale;
      const sy = this.cam.y + e.clientY / this.scale;
      // project the click onto a floor plane; failing that, onto a back wall (→ walk up to it)
      let f = null;
      let wx = 0;
      let z = 20;
      for (const fl of FLOORS) {
        const [x, zz] = unproj(fl, sx, sy);
        if (x >= IN_L - 8 && x <= IN_R + 8 && zz >= -2 && zz <= DEPTH + 2) {
          (f = fl), (wx = x), (z = Math.max(Z_MIN, Math.min(Z_MAX, zz)));
          break;
        }
      }
      if (!f) {
        wx = sx - OX;
        f = FLOORS.find((fl) => sy >= ceilY(fl, sx) && sy <= fl.yb + wx * TILT);
        if (!f) return;
      }
      const hit = this.objects.find((o) => o.floor === f.idx && Math.abs(o.x - wx) < 14 && this.objectVisible(o));
      this.travel(f.idx, hit ? hit.x : wx, hit || null, false, hit ? hit.z : z);
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
      const p = this.player;
      localStorage.setItem(SAVE, JSON.stringify({ flags: this.flags, introDone: this.introDone, floor: FLOORS[p.floor].id, x: Math.round(p.x), z: Math.round(p.inCar ? SHAFT_Z + 8 : p.z), sky: this.city.mode }));
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
          c.to = FLOORS[target].yb;
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

  // ── collision ─────────────────────────────────────────────────────────────
  /** Is (x, z) on floor idx blocked for a walker? (walls, props, the shaft) */
  blocked(idx, x, z) {
    if (x < IN_L + 6 || x > IN_R - 6) return true;
    const p = this.player;
    const inShaft = x > ELV_X0 - 14 && x < ELV_X1 + 4 && z < SHAFT_Z + 3;
    if (inShaft) {
      const open = (this.car.floor === idx && this.car.state === 'idle' && this.car.door > 0.9) || p.inCar;
      if (!open || Math.abs(x - ELV_CX) > 14 || z < 8) return true;
      return false;
    }
    if (z < Z_MIN || z > Z_MAX) return true;
    for (const s of this.scenes[idx]) {
      if (s.solid === false) continue;
      if (x > s.x0 - 5 && x < s.x1 + 5 && z > s.z0 - 2 && z < s.z1 + 2) return true;
    }
    return false;
  }
  clearRun(idx, x0, x1, z) {
    const d = Math.sign(x1 - x0);
    for (let x = x0; d * (x1 - x) > 0; x += d * 4) if (this.blocked(idx, x, z)) return false;
    return true;
  }
  /** The nearest free depth at x (for targets that land inside furniture). */
  freeZ(idx, x, z) {
    for (let dz = 0; dz < DEPTH; dz += 2) for (const zz of [z + dz, z - dz]) if (!this.blocked(idx, x, zz)) return zz;
    return LANE;
  }

  // ── travel (click-to-walk, map, elevator panel) ───────────────────────────
  travel(floorIdx, x = null, useObj = null, viaPanel = false, z = null) {
    const here = floorIdx === this.player.floor;
    const tx = x ?? (here ? this.player.x : ELV_CX);
    const tz = z ?? (here && x == null ? this.player.z : x == null ? SHAFT_Z + 12 : LANE);
    this.task = { floor: floorIdx, x: tx, z: this.freeZ(floorIdx, tx, tz), use: useObj, stuck: 0 };
    if (!here && !this.canStop(floorIdx)) {
      this.task = null;
      openPanel('locked', { floor: FLOORS[floorIdx] });
    }
  }
  /** Steer toward (x, z), detouring through the open LANE when furniture is in the way. */
  steer(x, z) {
    const p = this.player;
    const dx = x - p.x;
    const dz = z - p.z;
    if (Math.abs(dx) < 2 && Math.abs(dz) < 2) return null;
    if (Math.abs(dx) > 4 && !this.clearRun(p.floor, p.x, x, p.z) && Math.abs(p.z - LANE) > 2) return { mx: 0, mz: Math.sign(LANE - p.z) };
    return { mx: Math.abs(dx) >= 2 ? Math.sign(dx) : 0, mz: Math.abs(dz) >= 2 ? Math.sign(dz) : 0 };
  }
  runTask() {
    const tk = this.task;
    const p = this.player;
    const c = this.car;
    if (!tk) return null;
    const idle = { mx: 0, mz: 0 };
    if (tk.floor !== p.floor) {
      // walk to the shaft, call the car, step in, ride
      if (!p.inCar) {
        const atDoor = Math.abs(p.x - ELV_CX) < 3 && Math.abs(p.z - (SHAFT_Z + 6)) < 4;
        if (Math.abs(p.x - ELV_CX) < 60) this.callCar(p.floor);
        if (!atDoor && !tk.boarding) return this.steer(ELV_CX, SHAFT_Z + 6) || idle;
        if (!this.carHere()) return this.callCar(p.floor), idle;
        tk.boarding = true; // step in (don't re-aim at the door)
        return { mx: Math.abs(ELV_CX - p.x) > 1 ? Math.sign(ELV_CX - p.x) : 0, mz: -1 };
      }
      if (c.state === 'idle' && c.floor === p.floor) {
        if (p.z > 18) return { mx: Math.sign(ELV_CX - p.x) * (Math.abs(ELV_CX - p.x) > 2), mz: -1 };
        c.called = tk.floor;
        c.state = 'closing';
      }
      return idle; // riding
    }
    if (p.inCar && c.state !== 'idle') return idle;
    const m = this.steer(tk.x, tk.z);
    if (!m || tk.stuck > 0.6) {
      const use = tk.use;
      this.task = null;
      if (use && (!m || Math.abs(use.x - p.x) < 24)) this.activate(use);
      return idle;
    }
    return m;
  }

  // ── interaction ───────────────────────────────────────────────────────────
  nearest() {
    const p = this.player;
    if (p.inCar && this.car.state !== 'idle') return null;
    let best = null;
    let bd = 22;
    const score = (x, z, rx, rz) => {
      const dx = Math.abs(x - p.x);
      const dz = Math.abs(z - p.z);
      return dx < rx && dz < rz ? dx + dz * 0.3 : 99;
    };
    for (const o of this.objects) {
      if (o.floor !== p.floor || !this.objectVisible(o)) continue;
      const d = score(o.x, o.z, 18, 30);
      if (d < bd) (bd = d), (best = o);
    }
    const g = this.guide;
    if (g.floor === p.floor && score(g.x, g.z, 16, 16) < bd) (bd = score(g.x, g.z, 16, 16)), (best = { id: 'guide', x: g.x, z: g.z, label: 'Nova, your guide', verb: 'Talk', panel: 'guide' });
    for (const n of this.npcs) {
      if (n.floorIdx !== p.floor) continue;
      const d = score(n.x, n.z, 12, 14);
      if (d < bd) (bd = d), (best = { id: n.id, x: n.x, z: n.z, label: n.name, verb: 'Talk', panel: 'npc', npc: n });
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

    let mx = 0;
    let mz = 0;
    if (!panelOpen()) {
      const k = this.keys;
      if (k.has('arrowleft') || k.has('a')) mx -= 1;
      if (k.has('arrowright') || k.has('d')) mx += 1;
      if (k.has('arrowup') || k.has('w')) mz -= 1;
      if (k.has('arrowdown') || k.has('s')) mz += 1;
    }
    if (!mx && !mz) ({ mx, mz } = this.runTask() || { mx: 0, mz: 0 });
    if (p.inCar && this.car.state !== 'idle') mx = mz = 0;

    const run = this.keys.has('shift') ? 1.8 : 1;
    const ease = Math.min(1, dt * 12);
    p.vx += (mx * 72 * run - p.vx) * ease;
    p.vz += (mz * 46 * run - p.vz) * ease;
    if (Math.abs(p.vx) < 1 && !mx) p.vx = 0;
    if (Math.abs(p.vz) < 1 && !mz) p.vz = 0;
    const ox = p.x;
    const oz = p.z;
    // move each axis on its own so people slide along furniture
    const nx = p.x + p.vx * dt;
    if (!this.blocked(p.floor, nx, p.z)) p.x = nx;
    else {
      p.vx = 0;
      // pushing into the shaft with the car elsewhere → call it
      if (Math.abs(p.x - ELV_CX) < 50 && p.z < SHAFT_Z + 10) this.callCar(p.floor);
    }
    const nz = p.z + p.vz * dt;
    if (!this.blocked(p.floor, p.x, nz)) p.z = nz;
    else {
      p.vz = 0;
      if (mz < 0 && Math.abs(p.x - ELV_CX) < 16 && p.z < SHAFT_Z + 10) this.callCar(p.floor);
    }
    p.inCar = p.z < SHAFT_Z && Math.abs(p.x - ELV_CX) < 20;
    const moved = Math.hypot(p.x - ox, p.z - oz);
    p.moving = moved > 0.01;
    if (p.moving) {
      if (Math.abs(p.x - ox) > 0.01) p.facing = p.x > ox ? 1 : -1;
      p.phase += moved * 0.32;
    }
    if (this.task) this.task.stuck = (mx || mz) && !p.moving ? this.task.stuck + dt : 0;

    // guide: hovers beside you until the intro is done, then returns to the desk
    const g = this.guide;
    const lobbyIdx = floorById('lobby').idx;
    const follow = g.follow && p.floor === lobbyIdx && !p.inCar;
    const gx = follow ? p.x - p.facing * 18 : 640;
    const gz = follow ? Math.max(Z_MIN, p.z - 6) : LANE;
    g.x += (gx - g.x) * Math.min(1, dt * 2.5);
    g.z += (gz - g.z) * Math.min(1, dt * 2.5);

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

  /** Screen position of the player's feet. */
  /** The floor-like frame the player stands in (the moving car while riding). */
  base() {
    const p = this.player;
    return p.inCar ? { yb: this.car.y } : FLOORS[p.floor];
  }
  feetX() {
    return Math.round(proj(this.base(), this.player.x, this.player.z)[0]);
  }
  feetY() {
    return Math.round(proj(this.base(), this.player.x, this.player.z)[1]);
  }
  camTarget() {
    // the room rises up-right of the player: keep them a little left of and below centre
    const tall = this.vh > this.vw;
    return { x: this.feetX() - this.vw * 0.45, y: this.feetY() - this.vh * (tall ? 0.6 : 0.66) };
  }
  clampCam(c) {
    c.x = Math.max(0, Math.min(IW - this.vw, c.x));
    c.y = Math.max(0, Math.min(IH - this.vh, c.y));
    if (this.vw > IW) c.x = (IW - this.vw) / 2;
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
    const p = this.player;
    // a floor is a diagonal band: check it against the camera's left and right edges
    const visible = FLOORS.filter((f) => {
      const wx0 = cx - OX;
      const wx1 = cx + vw - OX + DEPTH;
      return f.yb + FD + SLAB + wx1 * TILT >= cy - 8 && f.top - FD + wx0 * TILT <= cy + vh + 8;
    });
    // back-wall animation for visible floors (flat art, sheared onto the wall)
    ctx.save();
    ctx.transform(...WALL);
    for (const f of visible) this.modules[f.id]?.dyn?.(ctx, f, this.t, G);
    ctx.restore();
    // the elevator car, then everything in front of the shaft
    this.drawCar(ctx);
    ctx.drawImage(this.front, cx, cy, vw, vh, cx, cy, vw, vh);
    // each floor: props, walls and people, back to front
    for (const f of visible) this.drawScene(ctx, f, G);
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

  /** Depth-sort one floor's scenery and people, then draw them (clipped to the room). */
  drawScene(ctx, f, G) {
    const p = this.player;
    // doors open when the player is close
    for (const dx of this.modules[f.id]?.doors || []) {
      const key = f.id + dx;
      const target = p.floor === f.idx && Math.abs(p.x - dx) < 26 ? 1 : 0;
      this.doorOpen[key] += (target - this.doorOpen[key]) * 0.2;
    }
    const people = [];
    const at = (x, z) => proj(f, x, z).map(Math.round);
    for (const n of this.npcs) if (n.floorIdx === f.idx) people.push({ x: n.x, z: n.z, draw: () => n.draw(ctx, ...at(n.x, n.z)) });
    const g = this.guide;
    if (g.floor === f.idx) people.push({ x: g.x, z: g.z, draw: () => {
      const [gx, gy] = at(g.x, g.z);
      drawBot(ctx, gx, gy - 16 + Math.round(Math.sin(this.t * 2) * 2), this.t, '#3dffb0');
    } });
    if (p.floor === f.idx && !p.inCar) people.push({ x: p.x, z: p.z, draw: () => drawPerson(ctx, this.feetX(), this.feetY(), LOOKS.player, p.facing, p.phase, p.moving) });
    people.sort((a, b) => a.z - b.z);
    // a person goes after every piece of scenery they stand in front of
    const items = this.scenes[f.idx];
    const slots = items.map(() => []);
    const tail = [];
    for (const a of people) {
      let at = -1;
      items.forEach((s, i) => {
        if (a.z >= s.z1 - 1 || a.x - 3 >= s.x1) at = i;
      });
      (at < 0 ? tail : slots[at]).push(a);
    }
    ctx.save();
    ctx.beginPath();
    // everything above the room's ceiling edge is hidden by the floor above
    const L = this.cam.x - 4;
    const Rr = this.cam.x + this.vw + 4;
    ctx.moveTo(L, ceilY(f, L));
    ctx.lineTo(Rr, ceilY(f, Rr));
    ctx.lineTo(Rr, this.cam.y + this.vh + 4);
    ctx.lineTo(L, this.cam.y + this.vh + 4);
    ctx.closePath();
    ctx.clip();
    for (const a of tail) a.draw();
    items.forEach((s, i) => {
      s.draw(ctx, this.t, G);
      for (const a of slots[i]) a.draw();
    });
    ctx.restore();
  }

  /** The cabin: back wall, floor and left wall inside the shaft; glass gates on its front. */
  drawCar(ctx) {
    const c = this.car;
    const p = this.player;
    const cf = { yb: Math.round(c.y) };
    const topF = FLOORS[FLOORS.length - 1];
    const x0 = ELV_X0 + 4;
    const x1 = ELV_X1 - 4;
    const z0 = 4;
    const z1 = SHAFT_Z - 2;
    const h = 46;
    // cable
    const [kx, ky] = proj(cf, ELV_CX, 16, h);
    const ktop = ceilY(topF, kx);
    if (ky > ktop) R(ctx, Math.round(kx), Math.round(ktop), 1, Math.round(ky - ktop), '#3a3448');
    // back wall with the floor indicator
    faceZ(ctx, cf, z0, x0, x1, 0, h, '#2a1e3a');
    faceZ(ctx, cf, z0, x0, x1, h - 3, h, '#d4a64e');
    const f = FLOORS[c.floor];
    const dest = c.called != null ? FLOORS[c.called] : f;
    onFace(ctx, cf, ELV_CX - 6, z0, h - 6, (g) => {
      R(g, 0, 0, 12, 7, '#05040a');
      text(g, c.state === 'moving' ? dest.n : f.n, f.n.length > 1 ? 2 : 4, 1, '#ffb347');
    });
    // left wall + floor
    sideX(ctx, cf, x0, z0, z1, 0, h, '#1a1226');
    top(ctx, cf, x0, x1, z0, z1, 0, '#32243f');
    for (let z = z0 + 6; z < z1; z += 6) top(ctx, cf, x0, x1, z, z + 1, 0, '#3a2a4a');
    faceZ(ctx, cf, z1, x0, x1, -2, 0, '#d4a64e');
    // rider
    if (p.inCar) drawPerson(ctx, this.feetX(), this.feetY(), LOOKS.player, p.facing, p.phase, p.moving);
    // cabin roof + glass gates (slide up when open)
    faceZ(ctx, cf, z1, x0, x1, h - 2, h, '#d4a64e');
    const gate = Math.round(42 * (1 - c.door));
    if (gate > 0) {
      faceZ(ctx, cf, z1, x0, x1, 0, gate, 'rgba(160,220,255,0.35)');
      faceZ(ctx, cf, z1, x0, x1, gate - 1, gate, '#bfe8ff');
    }
    sideX(ctx, cf, x1, z0, z1, 0, h, 'rgba(160,220,255,0.12)');
  }

  drawPrompt(ctx, o) {
    const p = this.player;
    const label = `[E] ${o.verb} · ${o.label}`.toUpperCase();
    const w = textWidth(label) + 8;
    const ax = o.x != null ? proj(FLOORS[p.floor], o.x, o.z ?? p.z)[0] : this.feetX();
    const x = Math.round(Math.max(this.cam.x + 2, Math.min(this.cam.x + this.vw - w - 2, ax - w / 2)));
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
