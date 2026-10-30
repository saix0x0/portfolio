// ─────────────────────────────────────────────────────────────────────────────
//  HOTEL GEOMETRY — the physical dimensions of the world (art pixels).
//  See docs/WORLD_MAP.md for the diagram. Floor modules draw inside these.
// ─────────────────────────────────────────────────────────────────────────────
export const W = 1536; // world width
export const OUT_L = 28; // building outer edge (left)
export const IN_L = 46; // interior starts
export const IN_R = 1490; // interior ends
export const OUT_R = 1508; // building outer edge (right)
export const ELV_X0 = 736; // glass elevator shaft
export const ELV_X1 = 800;
export const ELV_CX = 768;
export const SLAB = 10; // floor slab thickness
export const SKY = 240; // open sky above the roof
export const BEDROCK = 34; // ground below the basement
export const FEET = 3; // feet sit this far above a floor's walk line

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

const total = FLOOR_DEFS.reduce((s, f) => s + f.h + SLAB, 0);
export const H = SKY + total + BEDROCK;

/** Resolved geometry: y = walk line, top = ceiling. Built from the bottom up. */
export const FLOORS = (() => {
  let y = H - BEDROCK - SLAB;
  return FLOOR_DEFS.map((d, i) => {
    const f = { ...d, idx: i, y, top: y - d.h, x0: IN_L, x1: IN_R };
    y = f.top - SLAB;
    return f;
  });
})();
export const floorById = (id) => FLOORS.find((f) => f.id === id);
export const LOBBY = floorById('lobby');
export const GROUND = LOBBY.y; // street level = lobby walk line
export const TOP = FLOORS[FLOORS.length - 1].top - SLAB; // roof surface
