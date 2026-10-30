// Scratchpad — notes saved only in this browser (localStorage). Not synced,
// not private from anyone using this browser. For real private notes, use the Vault.
import { store } from '../../assets/js/core/base.js';

export function mount(root) {
  root.innerHTML = `<div style="max-width:780px;margin:0 auto;padding:clamp(20px,5vw,56px);display:grid;gap:12px">
    <p class="meta">Saved in this browser only · <span data-saved>—</span></p>
    <textarea class="field" data-pad rows="20" style="font:1.1rem/1.7 var(--display);min-height:60vh" placeholder="Half-ideas go here…"></textarea>
    <div class="row"><button class="btn small" data-dl>Download as .md</button></div></div>`;
  const pad = root.querySelector('[data-pad]');
  pad.value = store.get('notebook', '');
  let t;
  pad.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      store.set('notebook', pad.value);
      root.querySelector('[data-saved]').textContent = 'saved ' + new Date().toLocaleTimeString();
    }, 400);
  });
  root.querySelector('[data-dl]').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([pad.value], { type: 'text/markdown' }));
    a.download = 'scratchpad.md';
    a.click();
  };
  pad.focus();
  return () => store.set('notebook', pad.value);
}
