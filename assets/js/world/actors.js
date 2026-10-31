// ─────────────────────────────────────────────────────────────────────────────
//  ACTORS — the player, hotel residents, robots and the library cat.
//  People are drawn from parts onto a scratch canvas, then outlined in INK,
//  so every character shares one pixel style (WORLD_DESIGN.md → shared rules).
// ─────────────────────────────────────────────────────────────────────────────
import { canvas, R, P } from './gfx.js';
import { INK } from './themes.js';
import { LANE } from './layout.js';

const SW = 30;
const SH = 44;
const [scratch, sx] = canvas(SW, SH);
const [shape, shx] = canvas(SW, SH);
const [glowC, gx] = canvas(SW, SH);

// ── Cyberpunk archetypes. Every resident uses one; colours are free to vary.
// hair: undercut | mohawk | bob | slick | hood | buzz | spikes
export const LOOKS = {
  // the player — street merc: long coat, chrome left arm, cyan optic
  player: { skin: '#c68a60', hair: 'undercut', hairC: '#16101e', hairTip: '#29f0ff', coat: '#1c1a2a', coat2: '#2a2840', trim: '#ffd23a', shirt: '#0c0a14', legs: '#1a1a26', boots: '#2a2430', optic: '#29f0ff', cyberArm: true, collar: true, tail: true, belt: '#ffd23a', jaw: true },
  // street samurai — pink mohawk, katana, red jacket
  guestA: { skin: '#e0b090', hair: 'mohawk', hairC: '#ff3d9a', coat: '#7a1424', coat2: '#a81e30', trim: '#ff3d9a', shirt: '#14080c', legs: '#16121c', boots: '#0c0a10', optic: '#ff3d9a', katana: true, collar: true, tattoo: '#29f0ff' },
  // fixer — long brown coat, hat, gold implants
  guestB: { skin: '#8a5a3a', hair: 'buzz', hairC: '#120c0a', coat: '#3a2618', coat2: '#4e3420', trim: '#d4a64e', shirt: '#1e1a24', legs: '#1a1620', boots: '#120e0c', optic: '#ffb347', hat: '#14100e', tail: true, jaw: true },
  // netrunner — bodysuit, visor, neck cables
  guestC: { skin: '#f0c8a8', hair: 'bob', hairC: '#b07cff', coat: '#141a2e', coat2: '#1e2844', trim: '#b07cff', shirt: '#0a0c18', legs: '#10131f', boots: '#b07cff', visor: '#29f0ff', cables: '#29f0ff' },
  // corpo — slick hair, sharp suit, gold optic
  scientist: { skin: '#d8a078', hair: 'slick', hairC: '#2a1a12', coat: '#e8e6f0', coat2: '#f8f8ff', trim: '#29f0ff', shirt: '#14141e', legs: '#24283a', boots: '#0c0c14', optic: '#ffd23a', collar: true, tie: '#29f0ff' },
  // nomad — hood, goggles, respirator, scarf
  student: { skin: '#a87048', hair: 'hood', hairC: '#5a4a32', coat: '#6a5a3e', coat2: '#82704c', trim: '#ff7a3a', shirt: '#2a2418', legs: '#3a3226', boots: '#2a1e14', goggles: '#ff7a3a', mask: true, scarf: '#c84a2a' },
  // punk — green spikes, spiked jacket, face tattoo
  student2: { skin: '#e8b898', hair: 'spikes', hairC: '#a6ff6b', coat: '#1a1a1a', coat2: '#2a2a2a', trim: '#a6ff6b', shirt: '#3a0e2a', legs: '#2a2030', boots: '#0c0c0c', optic: '#a6ff6b', studs: true, tattoo: '#a6ff6b', cyberArm: true },
};

/**
 * Draw a cyberpunk person with feet at (x, y). ~34px tall.
 * facing: 1 = right, -1 = left. phase advances while walking. sit: seated pose.
 */
export function drawPerson(ctx, x, y, look, facing = 1, phase = 0, moving = false, sit = false, t = performance.now() / 1000) {
  shx.clearRect(0, 0, SW, SH);
  gx.clearRect(0, 0, SW, SH);
  const ox = 15;
  const oy = 42;
  const f = facing;
  const L = look;
  const sw = moving ? Math.round(Math.sin(phase) * 2.5) : 0;
  const lift = moving && Math.cos(phase) > 0.6;
  const lift2 = moving && Math.cos(phase) < -0.6;
  const bob = moving ? (Math.abs(Math.sin(phase)) > 0.5 ? -1 : 0) : Math.sin(t * 1.6) > 0.85 ? -1 : 0;
  const d = (dx, dy, w, h, c, layer = shx, nob = false) => {
    const X = f > 0 ? ox + dx : ox - dx - w;
    layer.fillStyle = c;
    layer.fillRect(X, oy + dy + (nob ? 0 : bob), w, h);
  };
  const lit = (dx, dy, w, h, c) => (d(dx, dy, w, h, c), d(dx, dy, w, h, c, gx));
  const chrome = '#b8c0d8';
  const chromeLo = '#6a7290';

  // coat tail behind legs (sways)
  if (L.tail) {
    const sway = moving ? Math.round(Math.sin(phase * 0.5 + 1) * 1) - 1 : 0;
    d(-6 + sway, -20, 4, 13, L.coat2);
    d(-6 + sway, -8, 4, 1, L.trim);
  }
  if (L.katana) {
    d(-7, -33, 1, 16, '#c8ccd8');
    d(-8, -34, 3, 3, '#3a1a10');
    d(-8, -31, 3, 1, L.trim);
  }
  // legs + boots
  if (!sit) {
    d(-4 - sw, -13, 3, 9 - (lift2 ? 1 : 0), L.legs);
    d(1 + sw, -13, 3, 9 - (lift ? 1 : 0), L.legs);
    d(-4 - sw, -5 - (lift2 ? 1 : 0), 5, 5, L.boots);
    d(1 + sw, -5 - (lift ? 1 : 0), 5, 5, L.boots);
    d(-4 - sw, -1 - (lift2 ? 1 : 0), 5, 1, '#000000');
    d(1 + sw, -1 - (lift ? 1 : 0), 5, 1, '#000000');
    if (L.cyberArm) d(1 + sw, -10, 3, 1, chromeLo); // knee plate
  } else {
    d(-4, -13, 11, 4, L.legs);
    d(4, -13, 3, 9, L.legs);
    d(4, -5, 5, 5, L.boots);
  }
  // back arm
  const arm = moving ? -sw : 0;
  d(-6 - arm, -24, 3, 11, L.coat2);
  d(-6 - arm, -14, 3, 2, L.skin);
  // torso / jacket
  d(-4, -25, 9, 13, L.coat);
  d(-4, -25, 3, 13, L.coat2);
  d(0, -24, 2, 10, L.shirt); // open jacket
  if (L.tie) d(0, -23, 1, 7, L.tie);
  if (L.belt) lit(-4, -14, 9, 1, L.belt);
  else d(-4, -14, 9, 1, L.trim);
  d(-4, -12, 9, 1, L.coat2);
  lit(4, -24, 1, 10, L.trim); // LED piping down the front edge
  if (L.studs) for (let i = 0; i < 4; i++) d(-3 + i * 2, -25, 1, 1, '#d8d8e0');
  if (L.scarf) d(-4, -26, 9, 3, L.scarf);
  if (L.cables) { d(-5, -27, 1, 6, L.cables); d(-6, -22, 1, 4, L.cables); }
  // high collar
  if (L.collar) { d(-4, -28, 3, 4, L.coat2); d(2, -27, 3, 3, L.coat2); lit(-4, -28, 1, 3, L.trim); }
  // front arm (cyber or sleeve)
  if (L.cyberArm) {
    d(1 + arm, -24, 3, 11, chrome);
    d(1 + arm, -24, 1, 11, chromeLo);
    d(1 + arm, -20, 3, 1, chromeLo);
    d(1 + arm, -16, 3, 1, chromeLo);
    lit(2 + arm, -18, 1, 1, L.optic || '#29f0ff');
    d(1 + arm, -13, 3, 2, chrome);
  } else {
    d(1 + arm, -24, 3, 11, L.coat2);
    d(1 + arm, -14, 3, 1, L.trim);
    d(1 + arm, -13, 3, 2, L.skin);
  }
  // head
  d(-3, -35, 8, 8, L.skin);
  d(4, -32, 1, 3, L.skin); // nose / profile
  if (L.jaw) d(1, -29, 4, 1, chrome);
  if (L.tattoo) d(2, -31, 1, 2, L.tattoo);
  // hair styles
  const H = L.hairC;
  switch (L.hair) {
    case 'undercut':
      d(-3, -36, 8, 3, H); d(-4, -35, 3, 5, H); d(-3, -33, 1, 3, '#3a2a2a');
      d(2, -37, 4, 2, H); lit(4, -37, 2, 1, L.hairTip || H);
      break;
    case 'mohawk':
      d(-3, -34, 8, 1, '#4a3a3a');
      lit(-2, -40, 4, 6, H); lit(-3, -38, 6, 2, H);
      break;
    case 'bob':
      d(-4, -36, 9, 3, H); d(-4, -35, 3, 7, H); d(4, -34, 1, 3, H);
      break;
    case 'slick':
      d(-3, -36, 8, 2, H); d(-4, -35, 2, 4, H); d(3, -36, 3, 1, H);
      break;
    case 'hood':
      d(-5, -37, 10, 3, H); d(-5, -35, 3, 9, H); d(4, -36, 2, 2, H);
      break;
    case 'spikes':
      lit(-3, -38, 2, 3, H); lit(0, -40, 2, 5, H); lit(3, -38, 2, 3, H); d(-3, -36, 8, 2, H);
      break;
    default: // buzz
      d(-3, -36, 8, 2, H); d(-4, -35, 2, 3, H);
  }
  if (L.hat) { d(-6, -37, 13, 1, L.hat); d(-3, -40, 8, 3, L.hat); d(-3, -38, 8, 1, L.trim); }
  // eyes: optic implant / visor / goggles
  const blink = Math.sin(t * 2.1 + (L.skin.length * 3)) > 0.985;
  if (L.visor) lit(0, -33, 6, 2, L.visor);
  else if (L.goggles) { d(0, -34, 6, 3, '#1a1410'); lit(1, -33, 2, 1, L.goggles); lit(4, -33, 1, 1, L.goggles); }
  else if (!blink) lit(2, -33, 2, 1, L.optic || '#120a14');
  if (L.mask) { d(1, -30, 5, 3, '#3a3a42'); d(2, -29, 1, 1, '#1a1a20'); d(4, -29, 1, 1, '#1a1a20'); }

  // outline the silhouette in INK
  sx.clearRect(0, 0, SW, SH);
  sx.globalCompositeOperation = 'source-over';
  for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) sx.drawImage(shape, a, b);
  sx.globalCompositeOperation = 'source-in';
  sx.fillStyle = INK;
  sx.fillRect(0, 0, SW, SH);
  sx.globalCompositeOperation = 'source-over';
  sx.drawImage(shape, 0, 0);
  const X = Math.round(x) - ox;
  const Y = Math.round(y) - oy;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(Math.round(x) - 7, Math.round(y) - 1, 15, 2);
  ctx.drawImage(scratch, X, Y);
  // neon glow pass for implants & trim
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.6;
  ctx.filter = 'blur(1.5px)';
  ctx.drawImage(glowC, X, Y);
  ctx.restore();
}

/** Android receptionist (behind the desk, only torso shows). */
export function drawAndroid(ctx, x, y, t) {
  const blink = Math.sin(t * 1.3) > 0.97;
  R(ctx, x - 6, y - 22, 12, 14, '#c8c4d8');
  R(ctx, x - 6, y - 22, 3, 14, '#e8e6f0');
  R(ctx, x - 7, y - 23, 14, 1, INK);
  R(ctx, x - 4, y - 32, 9, 9, '#e8e6f0');
  R(ctx, x - 5, y - 33, 11, 1, INK);
  R(ctx, x - 5, y - 32, 1, 9, INK);
  R(ctx, x + 5, y - 32, 1, 9, INK);
  R(ctx, x - 3, y - 29, 7, 2, blink ? '#2a1a3a' : '#ff3d9a');
  R(ctx, x - 1, y - 35, 1, 3, '#8a86a6');
  P(ctx, x - 1, y - 36, Math.sin(t * 4) > 0 ? '#ff3d9a' : '#ffb347');
  R(ctx, x - 2, y - 18, 4, 1, '#ffb347'); // bow tie
  R(ctx, x - 1, y - 19, 2, 3, '#d4a64e');
}

/** Little service robot (bartender / helper). */
export function drawBot(ctx, x, y, t, color = '#29f0ff') {
  const hover = Math.round(Math.sin(t * 2.5) * 1.5);
  R(ctx, x - 5, y - 14 + hover, 10, 9, '#3a3a5a');
  R(ctx, x - 5, y - 14 + hover, 10, 1, '#6a6a8a');
  R(ctx, x - 3, y - 12 + hover, 6, 3, '#0a0a18');
  P(ctx, x - 2, y - 11 + hover, color);
  P(ctx, x + 1, y - 11 + hover, color);
  R(ctx, x - 1, y - 17 + hover, 1, 3, '#6a6a8a');
  P(ctx, x - 1, y - 18 + hover, color);
  ctx.fillStyle = 'rgba(41,240,255,0.25)';
  ctx.fillRect(x - 3, y - 4, 6, 2);
}

/** The library cat. Asleep unless petted. */
export function drawCat(ctx, x, y, t, awake = false) {
  const c = '#e8a060';
  const d = '#b0703a';
  R(ctx, x - 6, y - 4, 11, 4, c);
  R(ctx, x - 6, y - 4, 11, 1, d);
  R(ctx, x + 3, y - 7, 5, 4, c);
  P(ctx, x + 3, y - 8, c);
  P(ctx, x + 7, y - 8, c);
  if (awake) {
    P(ctx, x + 4, y - 6, '#2a8a3a');
    P(ctx, x + 6, y - 6, '#2a8a3a');
  } else {
    P(ctx, x + 4, y - 6, INK);
    P(ctx, x + 6, y - 6, INK);
  }
  const tail = Math.round(Math.sin(t * 1.6) * 1.5);
  R(ctx, x - 9, y - 3 + tail, 3, 1, c);
  R(ctx, x - 9, y - 4 + tail, 1, 1, c);
  if (!awake && Math.sin(t * 0.8) > 0.3) {
    const zz = (t * 6) % 12;
    ctx.globalAlpha = 1 - zz / 12;
    P(ctx, x + 9, y - 10 - zz, '#ffe6b0');
    P(ctx, x + 10, y - 10 - zz, '#ffe6b0');
    ctx.globalAlpha = 1;
  }
}

/** Wandering resident with a patrol range and a few lines of dialogue. */
export class Walker {
  constructor({ id, look, floor, x, z, min, max, speed = 16, lines = [], name, sit = false }) {
    // z: the depth lane this resident patrols (clear of furniture)
    z ??= LANE - 4 + ((id.length * 5) % 11);
    Object.assign(this, { id, look, floor, x, z, min, max, speed, lines, name, sit });
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.phase = 0;
    this.pause = 0;
    this.moving = !sit;
  }
  update(dt) {
    if (this.sit || this.talking) return (this.moving = false);
    if (this.pause > 0) {
      this.pause -= dt;
      this.moving = false;
      return;
    }
    this.moving = true;
    this.x += this.dir * this.speed * dt;
    this.phase += dt * this.speed * 0.32;
    if (this.x < this.min || this.x > this.max) {
      this.x = Math.max(this.min, Math.min(this.max, this.x));
      this.dir *= -1;
      this.pause = 1 + Math.random() * 3;
    } else if (Math.random() < dt * 0.15) this.pause = 1 + Math.random() * 2.5;
  }
  /** sx, sy: projected screen position of the feet. */
  draw(ctx, sx, sy) {
    drawPerson(ctx, sx, sy, this.look, this.dir, this.phase, this.moving, this.sit);
  }
}
