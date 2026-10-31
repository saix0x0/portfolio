// ─────────────────────────────────────────────────────────────────────────────
//  HOTEL GEOMETRY — the physical dimensions of the world (art pixels).
//  See docs/WORLD_DESIGN.md → Projection. Floor modules draw inside these.
//
//  ISOMETRIC (2:1) camera. Every floor is a 3D box seen from the front-right
//  and above, with the front and right walls cut away (Floor796-style):
//    world (x, z, height) → screen (x − z + OX, f.yb + x/2 + z/2 − height)
//  x runs along the building (down-right on screen); z = depth from the back
//  wall (0) to the cut-away front (DEPTH), running down-left.
//  Back-wall art is still painted in flat 2D coordinates (f.top … f.yb, with
//  f.y = f.yb + 8) on a "flat" canvas, then sheared onto the back wall with
//  WALL = [1, TILT, 0, 1, OX, 0]. Flat (x, y) → screen (x + OX, y + x·TILT).
// ─────────────────────────────────────────────────────────────────────────────
export const W = 1548; // world width
export const OUT_L = 40; // building outer edge (left; its front cut lands at x = 0)
export const IN_L = 58; // interior starts
export const IN_R = 1530; // interior ends (the right wall's cut hides the last DX px)
export const OUT_R = 1548; // building outer edge (right)
export const ELV_X0 = 736; // glass elevator shaft
export const ELV_X1 = 800;
export const ELV_CX = 768;
export const SLAB = 10; // floor slab thickness
export const SKY = 240; // open sky above the roof
export const BEDROCK = 34; // ground below the basement
export const FEET = 3; // (legacy) feet offset used by 2D-era art helpers

// ── projection
export const DEPTH = 96; // room depth, back wall → front edge
export const TILT = 0.5; // screen y per unit of x (the building runs diagonally)
export const KX = 1; // screen x shift per unit of depth (front goes left)
export const KY = 0.5; // screen y shift per unit of depth (front goes down)
export const DX = DEPTH * KX; // 96
export const DY = DEPTH * KY; // 48
export const FD = DEPTH * (TILT + KY); // 96: a floor plane's screen height in one column
export const OX = DX; // screen x offset so the front-left corner stays on canvas
export const Z_MIN = 8; // closest a walker gets to the back wall
export const Z_MAX = DEPTH - 6; // closest to the cut-away front
export const LANE = 64; // default walking depth (clear of wall-side furniture)
export const SHAFT_Z = 36; // the elevator shaft's glass front
export const GAP0 = 40; // doorway in a partition wall: z range
export const GAP1 = 80;
export const WALL = [1, TILT, 0, 1, OX, 0]; // flat back-wall art → screen
/** World → screen on floor f (any object with .yb works, e.g. the roof). */
export const proj = (f, x, z, ht = 0) => [x - z * KX + OX, f.yb + x * TILT + z * KY - ht];
/** Screen → world on the floor plane of f (inverse of proj at height 0). */
export const unproj = (f, sx, sy) => {
  const a = sx - OX; // = x − z
  const b = (sy - f.yb) * 2; // = x + z   (TILT = KY = 0.5)
  return [(a + b) / 2, (b - a) / 2];
};
/** Screen y of the room's visible ceiling edge at screen column sx (the slab above hides the rest). */
export const ceilY = (f, sx) => f.top + TILT * (sx - OX);

// bottom → top. h = clear interior height. status: open | locked | construction | soon
export const FLOOR_DEFS = [
  { id: 'basement', n: 'B', name: 'Mystery Basement', h: 112, status: 'locked', lock: 'keycard', theme: 'basement' },
  { id: 'lobby', n: 'G', name: 'Grand Lobby', h: 176, status: 'open', theme: 'lobby' },
  { id: 'comms', n: '1', name: 'Communications Lounge', h: 128, status: 'open', theme: 'comms' },
  { id: 'gallery', n: '2', name: 'Art Gallery', h: 144, status: 'open', theme: 'gallery' },
  { id: 'pavilion', n: '3', name: 'Racing Pavilion & Cinema', h: 144, status: 'open', theme: 'pavilion' },
  { id: 'study', n: '4', name: 'The Study', h: 144, status: 'open', theme: 'study' },
  { id: 'penthouse', n: 'PH', name: 'Penthouse', h: 128, status: 'locked', lock: 'code', theme: 'penthouse' },
];

// per storey on screen: slab + floor plane + visible back wall (h includes the old 8px floor band)
const total = FLOOR_DEFS.reduce((s, f) => s + SLAB + FD + f.h - 8, 0);
export const H = SKY + SLAB + FD + total + BEDROCK; // flat (2D art) height
export const IW = W + OX + 8; // iso canvas size
export const IH = H + Math.ceil(W * TILT) + 8;

/**
 * Resolved geometry, built from the bottom up:
 *   top   = top of the visible back wall (the slab above hides the rest)
 *   yb    = back-wall base = back edge of the floor plane (= y − 8)
 *   y     = the old 2D walk line; back-wall art is still drawn relative to it
 *   front = yb + FD: in any screen column, where the floor plane's front edge is
 *           relative to its back edge (both also shift by x·TILT)
 *   room  = true room height (back wall from yb up, partly hidden)
 */
export const FLOORS = (() => {
  let front = H - BEDROCK - SLAB;
  return FLOOR_DEFS.map((d, i) => {
    const yb = front - FD;
    const f = { ...d, idx: i, front, yb, y: yb + 8, top: yb + 8 - d.h, x0: IN_L, x1: IN_R };
    f.room = f.yb - f.top + FD; // true height: the ceiling's front edge lines up with f.top on the back wall
    front = f.top - SLAB;
    return f;
  });
})();
export const floorById = (id) => FLOORS.find((f) => f.id === id);
export const LOBBY = floorById('lobby');
export const GROUND = LOBBY.front; // street level = lobby floor's front edge
export const ROOF = { yb: 0 }; // filled below
export const ROOF_FRONT = FLOORS[FLOORS.length - 1].top - SLAB; // roof slab front edge
export const TOP = ROOF_FRONT - FD; // roof surface, back edge (roof props stand here)
ROOF.yb = TOP;
