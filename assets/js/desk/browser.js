// ─────────────────────────────────────────────────────────────────────────────
//  THE MONITOR — a browser. Its new-tab wallpaper is the Colosseum at sunset
//  (the real monitor's wallpaper, redrawn in code). Tabs: overview, projects,
//  GitHub (live) and about. Every tab has a URL: #browser/<tab>; a project
//  opens at #browser/p:<id> and a repo at #browser/r:<name>. Live tabs: github.js.
//  Unfinished (TODO) content is never shown here.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, href } from '../core/base.js';
import { skyArt } from '../core/art.js';
import { rome } from '../core/scenes.js';
import { site } from '../../../content/site.js';
import { projects, CATEGORIES, STATUS } from '../../../content/projects.js';
import { skillGroups } from '../../../content/skills.js';
import { gh } from '../core/github.js';
import { githubPage, fillGithub, repoPage, fillRepo, liveRepo, overviewPage, fillOverview } from './github.js';

const real = (s = '') => !!s && !/^TODO/.test(String(s));
const TABS = [
  { id: 'home', label: 'New tab' },
  { id: 'overview', label: 'Overview', kw: 'start recruiter summary resume cv hire achievements' },
  { id: 'projects', label: 'Projects', kw: 'work portfolio built hackathons case studies' },
  { id: 'github', label: 'GitHub', kw: 'code repos repositories commits source open source' },
  { id: 'about', label: 'About', kw: 'bio me skills education iiit' },
];
const linkedin = site.socials.find((s) => /linkedin/i.test(s.label) && s.url)?.url;
// [target, label, glyph]: '#…' stays on the desk, 'http…' opens a new tab
const TILES = [
  ['#browser/overview', 'Overview', '→'], ['#browser/projects', 'Projects', '◩'], ['#browser/github', 'GitHub', '⌥'], ['#browser/about', 'About', '☺'],
  ...(linkedin ? [[linkedin, 'LinkedIn', 'in']] : []), ['#contact', 'Contact', '✉'],
];

// ── the wallpaper ───────────────────────────────────────────────────────────
const wallpaper = () => `<div class="rome-wall" aria-hidden="true"><i class="sun"></i>${rome()}</div>`;

const searchBox = (big) => `<form class="omni-search${big ? ' big' : ''}" role="search" data-search>
  <span aria-hidden="true">⌕</span><input data-q type="search" autocomplete="off" placeholder="Search projects, repos, skills…" aria-label="Search the site"><kbd>/</kbd></form>`;

// mini version painted on the monitor in the photo (not interactive)
export function miniMonitor(el) {
  el.innerHTML = `<div class="mini-chrome"><i></i><i></i><i></i><span>sai://home</span></div>
    <div class="mini-nt">${wallpaper()}<div class="mini-mid"><b>Siddhanth</b><span class="mini-q">Search projects, repos, skills…</span>
    <div class="mini-tiles">${TILES.slice(0, 6).map(([, l, g]) => `<span><i>${esc(g)}</i>${esc(l)}</span>`).join('')}</div></div></div>`;
}

// ── search index ────────────────────────────────────────────────────────────
function index() {
  const out = [];
  for (const t of TABS.slice(1)) out.push({ t: t.label, k: 'Tab', go: `browser/${t.id}`, x: t.kw });
  for (const p of projects) out.push({ t: p.title, s: p.summary, k: CATEGORIES[p.category]?.label || 'Project', go: `browser/p:${p.id}`, x: (p.tech || []).join(' ') });
  for (const g of skillGroups) for (const s of g.skills) if (real(s)) out.push({ t: s, k: g.name, go: 'browser/about' });
  out.push({ t: 'Contact', s: site.email, k: 'Page', go: 'contact', x: 'email message hire reach' });
  for (const s of site.socials) if (s.url) out.push({ t: s.label, k: 'Profile', url: s.url });
  return out;
}
function search(form, ctx) {
  const idx = index();
  // public repos join the index once GitHub answers (cached, so usually instant)
  gh.repos().then((rs) => {
    for (const r of rs) if (!projects.some((p) => p.repo === r.name)) idx.push({ t: r.name, s: r.desc, k: 'Repo', go: `browser/r:${r.name}`, x: `${r.lang} ${r.topics.join(' ')}` });
    for (const i of idx) if (i.k !== 'Repo' && i.go?.startsWith('browser/p:')) { const p = projects.find((x) => `browser/p:${x.id}` === i.go); if (p?.repo) i.x += ` ${p.repo}`; }
  }).catch(() => {});
  const input = $('[data-q]', form);
  const list = document.createElement('ul');
  list.className = 'omni-res';
  form.after(list);
  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) return (list.innerHTML = '');
    const hits = idx.map((i) => {
      const t = i.t.toLowerCase();
      const score = t.startsWith(q) ? 3 : t.includes(q) ? 2 : `${i.s || ''} ${i.x || ''}`.toLowerCase().includes(q) ? 1 : 0;
      return [score, i];
    }).filter(([s]) => s).sort((a, b) => b[0] - a[0]).slice(0, 7);
    list.innerHTML = hits.length
      ? hits.map(([, i]) => `<li><a href="${i.url ? esc(i.url) : `#${esc(i.go)}`}"${i.url?.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><b>${esc(i.t)}</b><span>${esc(i.k)}</span></a></li>`).join('')
      : `<li class="none">No results for “${esc(q)}”. Try “python”, “hackathon” or a repo name.</li>`;
  };
  input.addEventListener('input', run);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const a = $('a', list);
    if (a) a.click();
  });
  void ctx;
}

// ── pages ───────────────────────────────────────────────────────────────────
function home() {
  return `<div class="nt">${wallpaper()}
    <div class="nt-mid">
      <h2 class="nt-word">Siddhanth</h2>
      ${searchBox(true)}
      <nav class="nt-tiles" aria-label="Shortcuts">${TILES.map(([u, l, g]) => `<a href="${esc(u)}"${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><i>${esc(g)}</i><span>${esc(l)}</span></a>`).join('')}</nav>
    </div>
    <p class="nt-credit">Wallpaper: the Colosseum at sunset, drawn in code</p></div>`;
}

const card = (p, i) => `<a class="pj" href="#browser/p:${esc(p.id)}" style="--i:${i}">
  <span class="pj-art">${p.image ? `<img src="${esc(href(p.image))}" alt="" loading="lazy">` : skyArt(p.id, { w: 480, h: 300 })}</span>
  <span class="pj-k">${esc(CATEGORIES[p.category]?.label || '')} · ${esc(p.year)}</span>
  <b>${esc(p.title)}</b><span class="pj-s">${esc(p.summary || '')}</span>
  <span class="pj-t">${(p.tech || []).slice(0, 4).map((t) => `<i>${esc(t)}</i>`).join('')}</span></a>`;

function projectsPage(filter = 'all') {
  const cats = ['all', ...Object.keys(CATEGORIES).filter((c) => projects.some((p) => p.category === c))];
  const list = [...projects].filter((p) => filter === 'all' || p.category === filter).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.year - a.year);
  return `<div class="pg"><header class="pg-h"><p class="eyebrow">sai://projects</p><h2>Things I’ve <em>built.</em></h2>
    <p class="lede">Hackathon builds, personal projects and coursework. Open one for the full story, the code and its README.</p>
    <div class="filters" role="group" aria-label="Filter">${cats.map((c) => `<button type="button" data-filter="${c}" aria-pressed="${c === filter}">${esc(c === 'all' ? 'All' : CATEGORIES[c].label)}</button>`).join('')}</div></header>
    <div class="pj-grid">${list.map(card).join('')}</div></div>`;
}

function projectPage(id) {
  const p = projects.find((x) => x.id === id);
  if (!p) return projectsPage();
  const sec = (h, v) => (real(v) ? `<section><h3>${esc(h)}</h3><p>${esc(v)}</p></section>` : '');
  const links = Object.entries(p.links || {}).filter(([, u]) => u);
  return `<article class="pg pj-page"><a class="back" href="#browser/projects">← All projects</a>
    <div class="pj-hero">${p.image ? `<img src="${esc(href(p.image))}" alt="">` : skyArt(p.id, { w: 1200, h: 420 })}</div>
    <p class="eyebrow">${esc(CATEGORIES[p.category]?.label || '')} · ${esc(p.period || p.year)} · ${esc(STATUS[p.status] || '')}</p>
    <h2>${esc(p.title)}</h2>${real(p.subtitle) ? `<p class="lede">${esc(p.subtitle)}</p>` : ''}
    ${real(p.summary) ? `<p class="big">${esc(p.summary)}</p>` : ''}
    <div class="pj-cols">${sec('The problem', p.problem)}${sec('What I built', p.solution)}${sec('My part', p.contribution)}</div>
    ${p.highlights?.length ? `<section><h3>Highlights</h3><ul>${p.highlights.filter(real).map((h) => `<li>${esc(h)}</li>`).join('')}</ul></section>` : ''}
    <p class="pj-t">${(p.tech || []).map((t) => `<i>${esc(t)}</i>`).join('')}</p>
    ${links.length ? `<p class="row">${links.map(([k, u]) => `<a class="btn" href="${esc(u)}" target="_blank" rel="noopener">${esc({ code: 'Code', demo: 'Live demo' }[k] || k)} ↗</a>`).join('')}</p>` : ''}
    ${p.repo ? `<section class="live" data-live="${esc(p.repo)}"></section>` : ''}</article>`;
}

function aboutPage() {
  const bio = site.bio.filter(real);
  const now = site.now.filter((n) => real(n.text));
  const groups = skillGroups.map((g) => ({ ...g, skills: g.skills.filter(real) })).filter((g) => g.skills.length);
  const reach = [['Email', site.email && `mailto:${site.email}`], ...site.socials.map((s) => [s.label, s.url])].filter(([, u]) => u);
  return `<div class="pg about"><header class="pg-h"><p class="eyebrow">sai://about</p><h2>${esc(site.fullName.split(' ').slice(0, -1).join(' '))} <em>${esc(site.fullName.split(' ').slice(-1)[0])}</em></h2>
    ${site.epigraph ? `<p class="epi">“${esc(site.epigraph.text)}” <span>${esc(site.epigraph.gloss)}</span></p>` : ''}
    <p class="big">${esc(site.tagline)}</p>
    <p class="row">${reach.map(([l, u]) => `<a class="btn ghost" href="${esc(u)}"${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(l)} ↗</a>`).join('')}</p></header>
    <div class="ab-grid"><div>${bio.map((b) => `<p>${esc(b)}</p>`).join('')}
      <dl class="facts">${site.facts.filter(([, v]) => real(v)).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
      ${now.length ? `<aside class="now"><h3><i class="pulse"></i>Currently</h3><ul>${now.map((n) => `<li><b>${esc(n.label)}</b>${esc(n.text)}</li>`).join('')}</ul></aside>` : ''}</div>
    <section class="ac-block"><h3>Skills</h3><div class="skills">${groups.map((g) => `<div><b>${esc(g.name)}</b>${g.skills.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`).join('')}</div></section>
    <section class="ac-block"><h3>Interests</h3><div class="chips">${site.interests.map((i) => `<span>${esc(i)}</span>`).join('')}</div></section></div>`;
}

// ── the app ─────────────────────────────────────────────────────────────────
export function browserApp(root, ctx) {
  root.innerHTML = `<div class="win browser">
    <div class="tabs" role="tablist">${TABS.map((t) => `<a role="tab" href="#browser/${t.id}" data-tab="${t.id}">${esc(t.label)}</a>`).join('')}
      <button class="leave" type="button" data-leave>Back to the desk <kbd>esc</kbd></button></div>
    <div class="omni"><span class="nav-btns" aria-hidden="true">‹ › ↻</span><span class="addr" data-addr></span></div>
    <div class="view" data-view tabindex="-1"></div></div>`;
  const view = $('[data-view]', root);
  const show = (sub = 'home') => {
    const [id, arg] = sub.split(':');
    const tab = id === 'p' ? 'projects' : id === 'r' ? 'github' : id === 'start' ? 'overview' : TABS.some((t) => t.id === id) ? id : 'home';
    $$('[data-tab]', root).forEach((a) => a.setAttribute('aria-selected', String(a.dataset.tab === tab)));
    $('[data-addr]', root).innerHTML = `<i>☀</i>sai://${esc(id === 'p' ? `projects/${arg}` : id === 'r' ? `github/${arg}` : tab)}`;
    view.innerHTML = id === 'p' ? projectPage(arg) : id === 'r' ? repoPage(arg) : { home, overview: overviewPage, projects: projectsPage, github: githubPage, about: aboutPage }[tab]();
    view.scrollTop = 0;
    view.classList.remove('in');
    requestAnimationFrame(() => view.classList.add('in'));
    const form = $('[data-search]', view);
    if (form) search(form, ctx);
    if (id === 'p') liveRepo(view);
    if (id === 'r') fillRepo(view);
    else if (tab === 'github') fillGithub(view);
    if (tab === 'overview') fillOverview(view);
  };
  view.addEventListener('click', (e) => {
    const f = e.target.closest('[data-filter]');
    if (f) {
      view.innerHTML = projectsPage(f.dataset.filter);
      view.classList.add('in');
    }
  });
  $('[data-leave]', root).addEventListener('click', ctx.leave);
  const onKey = (e) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      const q = $('[data-q]', view);
      if (q) e.preventDefault(), q.focus();
    }
  };
  addEventListener('keydown', onKey);
  show(ctx.tab);
  const done = () => removeEventListener('keydown', onKey);
  done.tab = show;
  return done;
}
