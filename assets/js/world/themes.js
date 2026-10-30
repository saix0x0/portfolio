// ─────────────────────────────────────────────────────────────────────────────
//  ROOM THEMES — LOCKED. Mirrors the floor bible in docs/WORLD_DESIGN.md.
//  Content never changes these. Change only on an explicit redesign request,
//  and log it in WORLD_DESIGN.md → Changelog.
// ─────────────────────────────────────────────────────────────────────────────
export const INK = '#0d0716'; // universal outline / deepest shadow

export const THEMES = {
  lobby: { // luxurious: plum, gold, magenta + amber neon
    wall: '#2b1236', wall2: '#371846', wallLo: '#1f0c29', trim: '#d4a64e', trimLo: '#8a6428',
    floorA: '#3a2140', floorB: '#2a1630', floorHi: '#5a3a64', ceil: '#180a20',
    neonA: '#ff3d9a', neonB: '#ffb347', neonC: '#29f0ff', light: '#ffcf8a',
  },
  comms: { // signal room: teal, cyan, warm sofa coral
    wall: '#0e2026', wall2: '#132a32', wallLo: '#09171c', trim: '#2ab3a6', trimLo: '#16645c',
    floorA: '#16262c', floorB: '#101c21', floorHi: '#2a4a50', ceil: '#071114',
    neonA: '#29f0ff', neonB: '#ff7a6b', neonC: '#a6ff6b', light: '#9af6ff',
  },
  gallery: { // white-cube at night: charcoal walls, gallery spot lights, gold plaques
    wall: '#1d1b22', wall2: '#24222b', wallLo: '#141318', trim: '#cbb27a', trimLo: '#6e5e3c',
    floorA: '#2e2a26', floorB: '#26231f', floorHi: '#48423a', ceil: '#0e0d11',
    neonA: '#ffe2a8', neonB: '#ff3d9a', neonC: '#7fd8ff', light: '#fff2d0',
  },
  pavilion: { // pit-lane: asphalt grey, racing red, kerb stripes, timing-screen green
    wall: '#1b1d24', wall2: '#22252e', wallLo: '#121419', trim: '#e8343a', trimLo: '#7a1a1e',
    floorA: '#2a2c33', floorB: '#22242a', floorHi: '#44464f', ceil: '#0c0d11',
    neonA: '#ff2a3a', neonB: '#ffd23a', neonC: '#3dff9a', light: '#f0f4ff',
  },
  study: { // dark wood, amber, cream, muted green
    wall: '#2a160e', wall2: '#331c12', wallLo: '#1e0f09', trim: '#c9933e', trimLo: '#7a5420',
    floorA: '#3a2216', floorB: '#2e1a10', floorHi: '#5a3824', ceil: '#140a06',
    neonA: '#ffb347', neonB: '#7dd8a0', neonC: '#ffe6b0', light: '#ffc878',
    wood: '#4a2a18', woodHi: '#6a3e22', woodLo: '#2a160c',
  },
  construction: {
    wall: '#15131c', wall2: '#1a1824', wallLo: '#0f0d15', trim: '#3a3648', trimLo: '#24212e',
    floorA: '#22202a', floorB: '#1a1820', floorHi: '#34303e', ceil: '#0c0b10',
    neonA: '#ffcc33', neonB: '#ff6a3d', neonC: '#8a86a6', light: '#ffd27a',
  },
  basement: { // hidden history: deep blue, muted purple, emergency green
    wall: '#0b0d18', wall2: '#10131f', wallLo: '#06070d', trim: '#2a3a5a', trimLo: '#161f33',
    floorA: '#12141c', floorB: '#0c0d14', floorHi: '#1e2433', ceil: '#05060a',
    neonA: '#3dffb0', neonB: '#9b5cff', neonC: '#ff3d5a', light: '#3dffb0',
  },
  penthouse: { // private suite: midnight, silver, champagne
    wall: '#151626', wall2: '#1b1c30', wallLo: '#0e0f1a', trim: '#c8c8e0', trimLo: '#6a6a88',
    floorA: '#22223a', floorB: '#1a1a2e', floorHi: '#3a3a5a', ceil: '#0a0a14',
    neonA: '#e8e0ff', neonB: '#ffd8a8', neonC: '#9b8cff', light: '#ffe6c8',
  },
  roof: {
    wall: '#140c22', wall2: '#1a1030', wallLo: '#0c0716', trim: '#3a2a5a', trimLo: '#241a3a',
    floorA: '#1e1830', floorB: '#161226', floorHi: '#2e2648', ceil: '#0c0716',
    neonA: '#ff3d9a', neonB: '#29f0ff', neonC: '#ffb347', light: '#ff3d9a',
  },
};

// Exterior / city palette (shared by every window)
export const CITY = {
  sky: ['#0b0520', '#160a34', '#2a0f4a', '#4a1258', '#7a1a62', '#b02a66'],
  far: '#1e0d3a', farLit: '#5a2a8a', mid: '#140a26', midLit: '#ff3d9a', near: '#0b0616',
  neon: ['#ff3d9a', '#29f0ff', '#ffb347', '#a6ff6b', '#b07cff'],
  rain: 'rgba(180,200,255,0.22)', planet: '#ff8fb8', ring: '#ffd2e6',
};
