// ─────────────────────────────────────────────────────────────────────────────
//  HOTEL GEOMETRY — the physical dimensions of the world (art pixels).
//  See docs/WORLD_DESIGN.md → Projection. Floor modules draw inside these.
//
//  Every floor is a shallow 3D box seen from the front-right and above
//  (oblique "dollhouse" projection, front wall cut away):
//    world (x, z, height) → screen (x − z·KX, f.yb + z·KY − height)
//  z = depth from the back wall (0) to the cut-away front edge (DEPTH).
//  Back-wall art keeps the old 2D coordinates: f.top … f.yb (= f.y − 8).
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
export const DEPTH = 80; // room depth, back wall → front edge
export const KX = 0.5; // screen x shift per unit of depth (front goes left)
export const KY = 0.5; // screen y shift per unit of depth (front goes down)
export const DX = DEPTH * KX; // 40
export const DY = DEPTH * KY; // 40
export const Z_MIN = 8; // closest a walker gets to the back wall
export const Z_MAX = DEPTH - 4; // closest to the cut-away front
export const LANE = 54; // default walking depth (clear of wall-side furniture)
export const SHAFT_Z = 34; // the elevator shaft's glass front
export const GAP0 = 34; // doorway in a partition wall: z range
export const GAP1 = 66;
/** World → screen on floor f. */
export const proj = (f, x, z, ht = 0) => [x - z * KX, f.yb + z * KY - ht];

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
const total = FLOOR_DEFS.reduce((s, f) => s + SLAB + DY + f.h - 8, 0);
export const H = SKY + SLAB + DY + total + BEDROCK;

/**
 * Resolved geometry, built from the bottom up:
 *   top   = top of the visible back wall (the slab above hides the rest)
 *   yb    = back-wall base = back edge of the floor plane (= y − 8)
 *   y     = the old 2D walk line; back-wall art is still drawn relative to it
 *   front = front edge of the floor plane (yb + DY); the slab sits below it
 *   room  = true room height (back wall from yb up, partly hidden)
 */
export const FLOORS = (() => {
  let front = H - BEDROCK - SLAB;
  return FLOOR_DEFS.map((d, i) => {
    const yb = front - DY;
    const f = { ...d, idx: i, front, yb, y: yb + 8, top: yb + 8 - d.h, x0: IN_L, x1: IN_R };
    f.room = f.yb - f.top + DY;
    front = f.top - SLAB;
    return f;
  });
})();
export const floorById = (id) => FLOORS.find((f) => f.id === id);
export const LOBBY = floorById('lobby');
export const GROUND = LOBBY.front; // street level = lobby floor's front edge
export const ROOF_FRONT = FLOORS[FLOORS.length - 1].top - SLAB; // roof slab front edge
export const TOP = ROOF_FRONT - DY; // roof surface, back edge (roof props stand here)
