// LAB — lists experiments and runs each in an isolated full-screen stage.
// #<id> opens an experiment directly.
import { $, esc, revealOnScroll } from '../core/base.js';
import { boot } from '../core/layout.js';
import { experiments } from '../../../lab/experiments/index.js';

const sky = boot({ page: 'lab', sky: 'lab' });
const LABEL = { live: 'Live', wip: 'Work in progress', idea: 'Just an idea' };

$('[data-exps]').innerHTML = experiments.map((x) => `<button class="exp reveal" type="button" data-exp="${esc(x.id)}" style="--h:${x.hue ?? 200}">
  <span class="meta">#${esc(x.id)}</span><b>${esc(x.title)}</b><span style="color:var(--ink-2)">${esc(x.blurb)}</span>
  <span class="status chip">${esc(LABEL[x.status] || x.status)}</span></button>`).join('') +
  `<div class="exp" style="cursor:default;--h:60;border-style:dashed"><span class="meta">#next</span><b>Your next idea</b><span style="color:var(--ink-2)">Copy <code>lab/experiments/_template.js</code>, register it in <code>index.js</code>, and it appears here.</span></div>`;
revealOnScroll();

const dlg = $('dialog.stage');
let cleanup = null;
async function open(id) {
  const x = experiments.find((e) => e.id === id);
  if (!x) return;
  const root = $('[data-stage]');
  root.innerHTML = '<p class="meta" style="padding:24px">Loading…</p>';
  $('[data-stage-title]').textContent = x.title;
  history.replaceState(null, '', '#' + id);
  dlg.showModal();
  try {
    const mod = await import(new URL('../../../lab/experiments/' + x.module.replace('./', ''), import.meta.url));
    root.innerHTML = '';
    cleanup = (await mod.mount(root, { sky })) || null;
  } catch (err) {
    console.error(err);
    root.innerHTML = `<div class="empty"><p>This experiment crashed — which is allowed in a lab.</p><pre class="meta">${esc(err.message)}</pre></div>`;
  }
}
function close() {
  try { cleanup?.(); } catch {}
  cleanup = null;
  $('[data-stage]').innerHTML = '';
  history.replaceState(null, '', location.pathname);
  sky.setPalette('lab');
}
$('.close-x', dlg).addEventListener('click', () => dlg.close());
dlg.addEventListener('close', close);
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-exp]');
  if (b) open(b.dataset.exp);
});
if (location.hash) open(location.hash.slice(1));
