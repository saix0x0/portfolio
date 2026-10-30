// Sunset mixer — four colour stops + a sun. Copy the result as CSS.
const PRESETS = {
  Paris: ['#1d2858', '#5f4a8e', '#e27486', '#ffc488'],
  Roma: ['#24163d', '#88295f', '#f0653d', '#ffbc60'],
  Rio: ['#172569', '#7536a6', '#ff5888', '#ffad66'],
  Aurora: ['#01030b', '#04122e', '#0a2946', '#3fd6a8'],
  Mars: ['#2a0e0a', '#7a2a12', '#c8662a', '#f4b47a'],
};

export function mount(root) {
  let stops = [...PRESETS.Paris];
  let sun = 70;
  root.innerHTML = `<div style="display:grid;grid-template-columns:minmax(0,1fr) 320px;min-height:100%">
    <div data-view style="position:relative;min-height:60vh;overflow:hidden"><div data-sun style="position:absolute;width:120px;height:120px;border-radius:50%;left:calc(50% - 60px);background:radial-gradient(circle,#fff6da,#ffd39a 45%,rgba(255,180,100,0) 70%)"></div>
      <svg viewBox="0 0 1600 200" preserveAspectRatio="none" style="position:absolute;bottom:0;width:100%;height:22%"><path d="M0,200 L0,120 L120,120 L120,80 L200,80 L200,130 L340,130 L340,60 L380,40 L420,60 L420,140 L600,140 L600,100 L760,100 L800,20 L840,100 L1000,100 L1000,130 L1200,130 L1200,70 L1300,70 L1300,140 L1600,140 L1600,200Z" fill="#120818"/></svg></div>
    <div style="padding:24px;display:grid;gap:16px;align-content:start;border-left:1px solid var(--line)">
      <div class="pills" data-presets>${Object.keys(PRESETS).map((p) => `<button class="pill" data-p="${p}">${p}</button>`).join('')}</div>
      ${[0, 1, 2, 3].map((i) => `<label class="meta" style="display:flex;justify-content:space-between;align-items:center">Stop ${i + 1}<input type="color" data-i="${i}"></label>`).join('')}
      <label class="meta">Sun height<input type="range" min="10" max="110" data-sunr style="width:100%"></label>
      <textarea class="field" rows="5" readonly data-css style="font:0.75rem var(--mono)"></textarea>
      <button class="btn small" type="button" data-copy>Copy CSS</button>
    </div></div>`;
  const view = root.querySelector('[data-view]');
  const css = root.querySelector('[data-css]');
  const paint = () => {
    const g = `linear-gradient(180deg, ${stops[0]} 0%, ${stops[1]} 42%, ${stops[2]} 74%, ${stops[3]} 100%)`;
    view.style.background = g;
    root.querySelector('[data-sun]').style.top = `calc(${sun}% - 60px)`;
    root.querySelectorAll('[data-i]').forEach((el) => (el.value = stops[el.dataset.i]));
    root.querySelector('[data-sunr]').value = sun;
    css.value = `background: ${g};`;
  };
  root.addEventListener('input', (e) => {
    if (e.target.dataset.i) stops[e.target.dataset.i] = e.target.value;
    if (e.target.dataset.sunr != null) sun = +e.target.value;
    paint();
  });
  root.addEventListener('click', (e) => {
    const p = e.target.closest('[data-p]');
    if (p) (stops = [...PRESETS[p.dataset.p]]), paint();
    if (e.target.closest('[data-copy]')) navigator.clipboard?.writeText(css.value).then(() => (e.target.textContent = 'Copied ✓'));
  });
  if (innerWidth < 700) root.firstElementChild.style.gridTemplateColumns = '1fr';
  paint();
}
