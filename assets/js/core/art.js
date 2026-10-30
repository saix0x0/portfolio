// Procedural "postcard sky" artwork for anything without a screenshot.
// Same id → same picture, every time.
import { seeded, hash } from './base.js';

const SKIES = [
  ['#1d2858', '#e27486', '#ffc488'],
  ['#24163d', '#f0653d', '#ffbc60'],
  ['#172569', '#ff5888', '#ffad66'],
  ['#0c1334', '#d65a7a', '#ff9e54'],
  ['#04122e', '#0a2946', '#3fd6a8'],
  ['#2a1d4c', '#ee8a7a', '#ffd197'],
  ['#0f0828', '#1aa6a0', '#ffd46b'],
];

export function skyArt(id, { w = 400, h = 200 } = {}) {
  const r = seeded(hash(id));
  const pal = SKIES[hash(id) % SKIES.length];
  const night = pal[2] === '#3fd6a8';
  const sx = 0.15 + r() * 0.7;
  const sy = 0.45 + r() * 0.3;
  let ridge = `M0,${h}`;
  for (let x = 0; x <= w; x += 20) ridge += ` L${x},${(h * (0.72 + r() * 0.12)).toFixed(1)}`;
  ridge += ` L${w},${h} Z`;
  let blocks = '';
  for (let x = 0; x < w; ) {
    const bw = 10 + r() * 26;
    const bh = h * (0.08 + r() * 0.22);
    blocks += `<rect x="${x.toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}"/>`;
    x += bw + 1;
  }
  const uid = 'g' + hash(id).toString(36);
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" width="100%" height="100%">
    <defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset=".65" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[2]}"/></linearGradient>
    <radialGradient id="${uid}s"><stop offset="0" stop-color="#fff6da"/><stop offset=".25" stop-color="#ffd39a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb46a" stop-opacity="0"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#${uid})"/>
    ${night ? '' : `<circle cx="${(sx * w).toFixed(1)}" cy="${(sy * h).toFixed(1)}" r="${h * 0.42}" fill="url(#${uid}s)"/>`}
    <path d="${ridge}" fill="rgba(30,12,40,.55)"/><g fill="rgba(14,6,22,.92)">${blocks}</g></svg>`;
}
