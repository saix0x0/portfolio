// ─────────────────────────────────────────────────────────────────────────────
//  COMMAND PALETTE — ⌘K / Ctrl K (or the Search button) on the front page and
//  the desk. One box that reaches everything: pages, projects, repos (live),
//  profiles, "copy my email", and on the desk the lights and the music.
//  palette({ desk: bool, extra: [{ t, k, run }] }) wires it up once per page.
// ─────────────────────────────────────────────────────────────────────────────
import { esc, href, copy } from './base.js';
import { gh } from './github.js';
import { site } from '../../../content/site.js';
import { projects } from '../../../content/projects.js';

const CSS = `
.pal{position:fixed;inset:0;z-index:300;display:grid;place-items:start center;padding:12vh 16px 16px;background:rgba(6,3,2,.55);backdrop-filter:blur(6px);opacity:0;transition:opacity .18s}
.pal.open{opacity:1}
.pal-box{width:min(620px,100%);border-radius:16px;background:#160e0b;border:1px solid rgba(243,230,214,.14);box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden;transform:translateY(-8px) scale(.985);transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.pal.open .pal-box{transform:none}
.pal-in{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid rgba(243,230,214,.1)}
.pal-in span{color:#a8968a}
.pal-in input{flex:1;min-width:0;background:none;border:0;outline:0;color:#f3e6d6;font:400 17px 'Inter',system-ui,sans-serif}
.pal-in kbd,.pal-foot kbd{font:500 11px 'JetBrains Mono',monospace;padding:2px 6px;border:1px solid rgba(243,230,214,.14);border-radius:5px;color:#a8968a}
.pal-list{list-style:none;margin:0;padding:6px;max-height:min(52vh,420px);overflow-y:auto}
.pal-list li{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;color:#f3e6d6;font:400 15px 'Inter',system-ui,sans-serif}
.pal-list li[aria-selected=true]{background:rgba(255,178,107,.12)}
.pal-list li i{flex:none;width:26px;height:26px;border-radius:7px;display:grid;place-items:center;font-style:normal;font-size:13px;background:rgba(243,230,214,.06);color:#ffb26b}
.pal-list li b{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pal-list li small{font:400 11px 'JetBrains Mono',monospace;color:#6e5f56;text-transform:uppercase;letter-spacing:.08em;flex:none}
.pal-list .none{color:#a8968a;cursor:default}
.pal-head{padding:10px 12px 4px;font:500 10px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#6e5f56}
.pal-foot{display:flex;gap:16px;padding:10px 18px;border-top:1px solid rgba(243,230,214,.08);font:400 12px 'Inter',sans-serif;color:#6e5f56}
@media (prefers-reduced-motion:reduce){.pal,.pal-box{transition:none}}`;

let el = null;
let items = [];
let sel = 0;
let shown = [];

export function palette({ desk = false, extra = [] } = {}) {
  const to = (r) => () => (desk ? (location.hash = r) : (location.href = href(`desk/#${r}`)));
  const open = (u) => () => window.open(u, '_blank', 'noopener');
  const li = site.socials.find((s) => /linkedin/i.test(s.label) && s.url)?.url;
  items = [
    { t: 'Overview', k: 'Page', g: '→', run: to('browser/overview'), x: 'start summary recruiter' },
    { t: 'Projects', k: 'Page', g: '◩', run: to('browser/projects') },
    { t: 'GitHub repositories', k: 'Page', g: '⌥', run: to('browser/github'), x: 'code repos' },
    { t: 'About', k: 'Page', g: '☺', run: to('browser/about'), x: 'skills education bio' },
    { t: 'Send a message', k: 'Contact', g: '✉', run: to('contact'), x: 'contact hire email reach' },
    ...(site.email ? [{ t: `Copy email · ${site.email}`, k: 'Contact', g: '⧉', x: 'mail', run: async () => notify((await copy(site.email)) ? 'Email copied' : site.email) }] : []),
    ...(li ? [{ t: 'LinkedIn', k: 'Profile', g: 'in', run: open(li) }] : []),
    { t: 'GitHub profile', k: 'Profile', g: '⌥', run: open(`https://github.com/${site.github}`) },
    ...(site.hiring.resume ? [{ t: 'Download résumé', k: 'File', g: '⇩', run: () => (location.href = href(site.hiring.resume)), x: 'cv resume pdf' }] : []),
    { t: 'Terminal', k: 'Desk', g: '>_', run: to('terminal'), x: 'laptop shell command line' },
    ...(desk ? [] : [{ t: 'Enter the desk', k: 'Desk', g: '▣', run: () => (location.href = href('desk/')) }]),
    { t: 'Enter game', k: 'Game', g: '▸', run: () => (location.href = href('hotel/')), x: 'hotel pixel play' },
    ...projects.map((p) => ({ t: p.title, k: 'Project', g: '◆', run: to(`browser/p:${p.id}`), x: `${p.subtitle || ''} ${(p.tech || []).join(' ')} ${p.repo || ''}` })),
    ...extra,
  ];
  // repos arrive when GitHub answers (usually from cache)
  gh.repos().then((rs) => {
    for (const r of rs) if (!projects.some((p) => p.repo === r.name)) items.push({ t: r.name, k: 'Repo', g: '⌥', run: to(`browser/r:${r.name}`), x: `${r.desc} ${r.lang}` });
  }).catch(() => {});
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') e.preventDefault(), el ? close() : show();
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-palette]')) e.preventDefault(), show(); });
}

function notify(msg) {
  const t = document.querySelector('[data-toast]');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2200);
}

function show() {
  if (el) return;
  if (!document.getElementById('pal-css')) document.head.insertAdjacentHTML('beforeend', `<style id="pal-css">${CSS}</style>`);
  el = document.createElement('div');
  el.className = 'pal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Search and jump');
  el.innerHTML = `<div class="pal-box"><label class="pal-in"><span aria-hidden="true">⌕</span><input placeholder="Search projects, repos, pages, actions…" aria-label="Search" role="combobox" aria-expanded="true" aria-controls="pal-list" autocomplete="off" spellcheck="false"><kbd>esc</kbd></label>
    <ul class="pal-list" id="pal-list" role="listbox"></ul><div class="pal-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>⌘K</kbd> toggle</span></div></div>`;
  document.body.append(el);
  const input = el.querySelector('input');
  const list = el.querySelector('ul');
  const last = document.activeElement;
  const paint = () => {
    const q = input.value.trim().toLowerCase();
    shown = q
      ? items.map((i) => {
          const t = i.t.toLowerCase();
          const s = t.startsWith(q) ? 4 : t.split(/\W+/).some((w) => w.startsWith(q)) ? 3 : t.includes(q) ? 2 : `${i.k} ${i.x || ''}`.toLowerCase().includes(q) ? 1 : 0;
          return [s, i];
        }).filter(([s]) => s).sort((a, b) => b[0] - a[0]).map(([, i]) => i).slice(0, 9)
      : items.filter((i) => i.k !== 'Repo').slice(0, 9);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = (q ? '' : '<li class="pal-head" role="presentation">Jump to</li>') + (shown.length
      ? shown.map((i, n) => `<li role="option" data-n="${n}" aria-selected="${n === sel}"><i aria-hidden="true">${esc(i.g)}</i><b>${esc(i.t)}</b><small>${esc(i.k)}</small></li>`).join('')
      : `<li class="none">Nothing matches “${esc(q)}”.</li>`);
    list.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' });
  };
  const run = (i) => { if (!i) return; close(); i.run(); };
  input.addEventListener('input', () => ((sel = 0), paint()));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') e.preventDefault(), (sel = (sel + 1) % Math.max(1, shown.length)), paint();
    if (e.key === 'ArrowUp') e.preventDefault(), (sel = (sel - 1 + shown.length) % Math.max(1, shown.length)), paint();
    if (e.key === 'Enter') e.preventDefault(), run(shown[sel]);
    if (e.key === 'Escape') e.preventDefault(), e.stopPropagation(), close();
  });
  list.addEventListener('mousemove', (e) => { const o = e.target.closest('[data-n]'); if (o && +o.dataset.n !== sel) (sel = +o.dataset.n), paint(); });
  list.addEventListener('click', (e) => { const o = e.target.closest('[data-n]'); if (o) run(shown[+o.dataset.n]); });
  el.addEventListener('mousedown', (e) => { if (e.target === el) close(); });
  el.close = () => last?.focus?.({ preventScroll: true });
  sel = 0;
  paint();
  requestAnimationFrame(() => el.classList.add('open'));
  input.focus();
}

function close() {
  if (!el) return;
  const e = el;
  el = null;
  e.close();
  e.classList.remove('open');
  setTimeout(() => e.remove(), 180);
}
