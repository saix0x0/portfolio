// WORK — the logbook. URL is the source of truth:
//   #college | #research | … | #all       category filter
//   #p/<id>                               open a case study
//   ?q=python                             search
//   ?view=timeline|sky                    alternate views
import { $, $$, esc, href, revealOnScroll, hash, seeded } from '../core/base.js';
import { boot } from '../core/layout.js';
import { skyArt } from '../core/art.js';
import { projects, CATEGORIES, STATUS } from '../../../content/projects.js';
import { extracurriculars } from '../../../content/extracurriculars.js';

boot({ page: 'work', sky: 'nyc' });

// Experiences join the logbook as their own category.
const CATS = { ...CATEGORIES, experience: { label: 'Experiences', blurb: 'Clubs, events, debates and adventures' } };
const entries = [
  ...projects,
  ...extracurriculars.map((x) => ({ ...x, category: 'experience', subtitle: [x.role, x.org].filter(Boolean).join(' · '), tech: x.tags || [], links: x.link ? { more: x.link } : {} })),
].sort((a, b) => (b.year || 0) - (a.year || 0));

const LINK_LABEL = { code: 'Code', demo: 'Live demo', report: 'Report', video: 'Video', paper: 'Paper', more: 'More' };
const state = { cat: 'all', q: '', view: 'grid' };
const ph = (x) => (x.placeholder ? '<span class="badge-placeholder">Placeholder</span>' : '');
const realLinks = (p) => Object.entries(p.links || {}).filter(([, u]) => u);

function readURL() {
  const u = new URL(location.href);
  state.q = u.searchParams.get('q') || '';
  state.view = u.searchParams.get('view') || 'grid';
  const hsh = decodeURIComponent(location.hash.slice(1));
  if (hsh.startsWith('p/')) return hsh.slice(2);
  state.cat = CATS[hsh] ? hsh : 'all';
  return null;
}
function writeURL(projectId) {
  const u = new URL(location.href);
  state.q ? u.searchParams.set('q', state.q) : u.searchParams.delete('q');
  state.view !== 'grid' ? u.searchParams.set('view', state.view) : u.searchParams.delete('view');
  u.hash = projectId ? 'p/' + projectId : state.cat === 'all' ? '' : state.cat;
  history.replaceState(null, '', u);
}

const matches = (p) => {
  if (state.cat !== 'all' && p.category !== state.cat) return false;
  if (!state.q) return true;
  const hay = [p.title, p.subtitle, p.summary, p.course, p.role, p.org, ...(p.tech || [])].join(' ').toLowerCase();
  return state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
};

function renderFilters() {
  const counts = { all: entries.length };
  entries.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
  const keys = ['all', ...Object.keys(CATS).filter((k) => counts[k])];
  $('[data-filters]').innerHTML = keys.map((k) => `<button class="pill" data-cat="${k}" aria-pressed="${state.cat === k}">${k === 'all' ? 'All' : esc(CATS[k].label)} <span class="n">${counts[k]}</span></button>`).join('');
  $('[data-blurb]').textContent = state.cat === 'all' ? '' : CATS[state.cat].blurb;
  $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === state.view));
  const real = projects.filter((p) => !p.placeholder);
  const tech = new Set(real.flatMap((p) => p.tech || []));
  $('[data-stats]').innerHTML = `<span><b>${real.length}</b> projects</span><span><b>${projects.filter((p) => p.category === 'college').length}</b> college</span><span><b>${tech.size}</b> technologies</span><span><b>${extracurriculars.length}</b> experiences</span>`;
}

function card(p) {
  return `<a class="entry reveal glow" href="#p/${esc(p.id)}" data-open="${esc(p.id)}">
    <span class="entry-art">${p.image ? `<img src="${esc(href(p.image))}" alt="" loading="lazy">` : skyArt(p.id)}</span>
    <span class="entry-body">
      <span class="meta">${esc(CATS[p.category]?.label || '')} · ${esc(p.period || String(p.year || ''))}${p.status ? ' · ' + esc(STATUS[p.status] || p.status) : ''}</span>
      <b>${esc(p.title)}</b>
      ${p.subtitle ? `<span class="entry-sub">${esc(p.subtitle)}</span>` : ''}
      <span class="entry-sum">${esc(p.summary || '')}</span>
      <span class="chips">${ph(p)}${(p.tech || []).slice(0, 5).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</span>
    </span></a>`;
}

function renderTimeline(list) {
  const years = [...new Set(list.map((p) => p.year))].sort((a, b) => b - a);
  return `<div class="timeline">${years.map((y) => `<section class="year"><h2 class="year-n">${y}</h2><div class="year-items">${list.filter((p) => p.year === y).map((p) => `
    <a class="t-item reveal" href="#p/${esc(p.id)}" data-open="${esc(p.id)}"><span class="meta">${esc(CATS[p.category]?.label)} · ${esc(p.period || '')}</span><b>${esc(p.title)}</b><span class="entry-sum">${esc(p.summary || '')}</span>${ph(p)}</a>`).join('')}</div></section>`).join('')}</div>`;
}

// Stars = entries; lines = shared technologies (real relationships, not random)
function renderSky(list) {
  const W = 1000;
  const H = 560;
  // x = time, y = category lane, then a few rounds of repulsion so labels don't collide
  const years = list.map((p) => p.year || 0);
  const y0 = Math.min(...years);
  const y1 = Math.max(...years);
  const lanes = [...new Set(list.map((p) => p.category))];
  const pos = list.map((p) => {
    const r = seeded(hash(p.id));
    const tx = y1 === y0 ? 0.5 : ((p.year || y0) - y0) / (y1 - y0);
    return { p, x: 110 + tx * (W - 220) + (r() - 0.5) * 90, y: 80 + ((lanes.indexOf(p.category) + 0.5) / lanes.length) * (H - 160) + (r() - 0.5) * 40 };
  });
  for (let it = 0; it < 80; it++)
    for (const a of pos)
      for (const b of pos) {
        if (a === b) continue;
        const dx = (a.x - b.x) / 170;
        const dy = (a.y - b.y) / 60;
        const d = Math.hypot(dx, dy);
        if (d < 1 && d > 0) { a.x += (dx / d) * 4; a.y += (dy / d) * 2; }
      }
  pos.forEach((q) => { q.x = Math.max(90, Math.min(W - 90, q.x)); q.y = Math.max(40, Math.min(H - 50, q.y)); });
  let lines = '';
  for (let i = 0; i < pos.length; i++)
    for (let j = i + 1; j < pos.length; j++) {
      const shared = (pos[i].p.tech || []).filter((t) => (pos[j].p.tech || []).includes(t));
      if (shared.length) lines += `<line x1="${pos[i].x}" y1="${pos[i].y}" x2="${pos[j].x}" y2="${pos[j].y}" stroke-width="${Math.min(3, shared.length)}"><title>Shared: ${esc(shared.join(', '))}</title></line>`;
    }
  const colors = { college: '#ffc477', research: '#b59bff', hackathon: '#ff7d97', personal: '#6ff5c4', 'open-source': '#8fd0ff', work: '#fff', experience: '#ffd9a8' };
  const stars = pos.map(({ p, x, y }) => `<a href="#p/${esc(p.id)}" data-open="${esc(p.id)}" class="star"><circle cx="${x}" cy="${y}" r="16" fill="${colors[p.category]}" opacity=".15"/><circle cx="${x}" cy="${y}" r="${p.featured ? 6 : 4}" fill="${colors[p.category]}"/><text x="${x}" y="${y + 26}" text-anchor="middle">${esc(p.title)}</text></a>`).join('');
  return `<figure class="constellation panel"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Constellation of projects, connected by shared technologies"><g class="links">${lines}</g>${stars}</svg>
    <figcaption class="meta">Each star is an entry. Lines join entries that share a technology — hover a line to see which. Colour = category.</figcaption></figure>`;
}

function render() {
  renderFilters();
  const list = entries.filter(matches);
  const out = $('[data-results]');
  if (!list.length) {
    out.innerHTML = `<div class="empty panel"><h2 class="display" style="font-size:var(--step-2)">Nothing here yet.</h2><p>No entries match${state.q ? ` “${esc(state.q)}”` : ''}${state.cat !== 'all' ? ` in ${esc(CATS[state.cat].label)}` : ''}.</p><button class="btn" data-reset>Show everything</button></div>`;
  } else if (state.view === 'timeline') out.innerHTML = renderTimeline(list);
  else if (state.view === 'sky') out.innerHTML = renderSky(list);
  else out.innerHTML = `<div class="entries">${list.map(card).join('')}</div>`;
  revealOnScroll(out);
}

// ── Case study ──────────────────────────────────────────────────────────────
const dlg = $('dialog.case');
function openCase(id) {
  const p = entries.find((e) => e.id === id);
  if (!p) return;
  const sec = (title, body) => (body ? `<section><h3>${title}</h3>${body}</section>` : '');
  const links = realLinks(p);
  $('[data-case]').innerHTML = `
    <button class="close-x" type="button" aria-label="Close">✕</button>
    <header class="case-hero">${p.image ? `<img src="${esc(href(p.image))}" alt="">` : skyArt(p.id, { w: 1200, h: 420 })}
      <div class="case-title"><p class="kicker"><span class="dot"></span>${esc(CATS[p.category]?.label)} · ${esc(p.period || String(p.year))}${p.status ? ' · ' + esc(STATUS[p.status] || '') : ''}</p>
      <h2 id="case-title">${esc(p.title)}</h2>${p.subtitle ? `<p class="lede">${esc(p.subtitle)}</p>` : ''}${ph(p)}</div></header>
    <div class="case-body">
      <aside class="case-facts">
        ${p.role ? `<div><span class="meta">Role</span><p>${esc(p.role)}</p></div>` : ''}
        ${p.team ? `<div><span class="meta">Team</span><p>${esc(p.team)}</p></div>` : ''}
        ${p.course ? `<div><span class="meta">Course</span><p>${esc(p.course)}</p></div>` : ''}
        ${p.tech?.length ? `<div><span class="meta">Stack</span><div class="chips">${p.tech.map((t) => `<a class="chip" href="?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div></div>` : ''}
        <div class="row">${links.length ? links.map(([k, u]) => `<a class="btn small" href="${esc(u)}" target="_blank" rel="noopener">${LINK_LABEL[k] || k} ↗</a>`).join('') : '<span class="meta">Links coming soon</span>'}</div>
        <button class="btn small" type="button" data-share>Copy link to this project</button>
      </aside>
      <div class="case-text">
        <p class="case-sum">${esc(p.summary || '')}</p>
        ${sec('The problem', p.problem && `<p>${esc(p.problem)}</p>`)}
        ${sec('What I built', p.solution && `<p>${esc(p.solution)}</p>`)}
        ${sec('My contribution', p.contribution && `<p>${esc(p.contribution)}</p>`)}
        ${sec('Architecture', p.architecture && `<p>${esc(p.architecture)}</p>`)}
        ${sec('Highlights', p.highlights?.length && `<ul>${p.highlights.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`)}
        ${sec('Challenges', p.challenges && `<p>${esc(p.challenges)}</p>`)}
        ${sec('Outcome', p.outcome && `<p>${esc(p.outcome)}</p>`)}
        ${(p.screenshots || []).map((s) => `<img class="shot" src="${esc(href(s.src || s))}" alt="${esc(s.alt || '')}" loading="lazy">`).join('')}
      </div>
    </div>
    <nav class="case-nav">${neighbours(p)}</nav>`;
  $('.close-x', dlg).onclick = () => dlg.close();
  $('[data-share]', dlg).onclick = async (e) => {
    try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Link copied ✓'; } catch { e.target.textContent = location.href; }
  };
  writeURL(p.id);
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
  document.title = `${p.title} — Logbook`;
}
function neighbours(p) {
  const list = entries.filter(matches);
  const i = list.indexOf(p);
  const prev = list[i - 1];
  const next = list[i + 1];
  return `${prev ? `<a href="#p/${esc(prev.id)}" data-open="${esc(prev.id)}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a href="#p/${esc(next.id)}" data-open="${esc(next.id)}">${esc(next.title)} →</a>` : ''}`;
}
dlg.addEventListener('close', () => { writeURL(null); document.title = 'Logbook — Sai Siddhanth Challa'; });
dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());

// ── Events ──────────────────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  if (open) { e.preventDefault(); openCase(open.dataset.open); return; }
  const cat = e.target.closest('[data-cat]');
  if (cat) { state.cat = cat.dataset.cat; writeURL(); render(); return; }
  const v = e.target.closest('[data-view]');
  if (v) { state.view = v.dataset.view; writeURL(); render(); return; }
  if (e.target.closest('[data-reset]')) { state.cat = 'all'; state.q = ''; $('[data-q]').value = ''; writeURL(); render(); }
});
$('[data-q]').addEventListener('input', (e) => { state.q = e.target.value.trim(); writeURL(); render(); });
addEventListener('keydown', (e) => {
  if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('[data-q]').focus(); }
});
addEventListener('hashchange', () => { const id = readURL(); render(); if (id) openCase(id); else if (dlg.open) dlg.close(); });

const initial = readURL();
$('[data-q]').value = state.q;
render();
if (initial) openCase(initial);
