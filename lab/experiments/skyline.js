// Skyline generator — a new procedural city every click; download as SVG.
import { seeded } from '../../assets/js/core/base.js';

export function mount(root) {
  root.innerHTML = `<div style="position:absolute;inset:0;display:grid;grid-template-rows:1fr auto">
    <div data-art style="overflow:hidden"></div>
    <div class="row" style="padding:14px 20px;border-top:1px solid var(--line)"><button class="btn small" data-new>New city</button><button class="btn small" data-dl>Download SVG</button><span class="meta" data-seed></span></div></div>`;
  let svg = '';
  const make = (seed) => {
    const r = seeded(seed);
    const W = 1600, H = 800;
    const hue = (r() * 360) | 0;
    let b = '', w = '';
    for (let layer = 0; layer < 3; layer++) {
      let x = -20;
      const shade = 20 + layer * 6;
      while (x < W) {
        const bw = 30 + r() * 90;
        const bh = (120 + r() * 320) * (1 - layer * 0.22);
        const y = H - bh;
        b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="hsl(${hue + 200} 35% ${shade - layer * 7}%)"/>`;
        if (r() < 0.2) b += `<path d="M${x + bw / 2 - 3},${y} L${x + bw / 2},${y - 30 - r() * 40} L${x + bw / 2 + 3},${y} Z" fill="hsl(${hue + 200} 35% ${shade - layer * 7}%)"/>`;
        if (layer === 2) for (let yy = y + 12; yy < H - 10; yy += 18) for (let xx = x + 6; xx < x + bw - 8; xx += 12) if (r() < 0.25) w += `<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="5" height="8" fill="#ffd38a" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
        x += bw + r() * 6;
      }
    }
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" width="100%" height="100%">
      <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue + 220} 50% 12%)"/><stop offset=".6" stop-color="hsl(${hue} 70% 55%)"/><stop offset="1" stop-color="hsl(${hue + 30} 90% 72%)"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#s)"/><circle cx="${400 + r() * 800}" cy="${520 + r() * 120}" r="70" fill="#fff4d6" opacity=".9"/>${b}${w}</svg>`;
    root.querySelector('[data-art]').innerHTML = svg;
    root.querySelector('[data-seed]').textContent = `city #${seed}`;
  };
  root.querySelector('[data-new]').onclick = () => make((Math.random() * 1e6) | 0);
  root.querySelector('[data-dl]').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    a.download = 'skyline.svg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  make(2026);
}
