// Draw a constellation — click to add stars, they join in order. Saved locally.
import { store } from '../../assets/js/core/base.js';

export function mount(root, { sky }) {
  sky.setPalette('observatory');
  const saved = store.get('constellations', []);
  root.innerHTML = `<div style="position:absolute;inset:0;display:grid;grid-template-rows:1fr auto">
    <svg data-c style="width:100%;height:100%;cursor:crosshair;display:block" aria-label="Drawing area"></svg>
    <div class="row" style="padding:14px 20px;border-top:1px solid var(--line);background:rgba(5,3,14,.8)">
      <input class="field" data-name placeholder="Name your constellation" style="max-width:280px">
      <button class="btn small" data-save>Save</button><button class="btn small" data-clear>Clear</button>
      <span class="meta" data-list></span></div></div>`;
  const svg = root.querySelector('[data-c]');
  let pts = [];
  const draw = () => {
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
    svg.innerHTML = `<path d="${path}" stroke="rgba(181,155,255,.6)" stroke-width="1.2" fill="none" stroke-dasharray="4 4"/>` +
      pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="#fff" opacity=".12"/><circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#fff"/>`).join('');
  };
  const list = () => (root.querySelector('[data-list]').textContent = saved.length ? 'Saved: ' + saved.map((s) => s.name).join(' · ') : 'Nothing saved yet');
  svg.addEventListener('click', (e) => {
    const r = svg.getBoundingClientRect();
    pts.push([Math.round(e.clientX - r.left), Math.round(e.clientY - r.top)]);
    draw();
  });
  root.querySelector('[data-clear]').onclick = () => ((pts = []), draw());
  root.querySelector('[data-save]').onclick = () => {
    if (!pts.length) return;
    saved.push({ name: root.querySelector('[data-name]').value || `Untitled ${saved.length + 1}`, pts });
    store.set('constellations', saved);
    sky.meteorShower(4);
    list();
  };
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-list]') && saved.length) ((pts = saved[saved.length - 1].pts), draw());
  });
  list();
}
