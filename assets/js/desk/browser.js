// ─────────────────────────────────────────────────────────────────────────────
//  THE MONITOR — a browser. Its new-tab wallpaper is the Colosseum at sunset
//  (the real monitor's wallpaper, redrawn in code). Tabs: start here, projects,
//  GitHub (live), academy, about, the live pit wall and a window into the
//  hotel. Every tab has a URL: #browser/<tab>; a project opens at
//  #browser/p:<id> and a repo at #browser/r:<name>. Live GitHub tabs: github.js.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, href, reducedMotion } from '../core/base.js';
import { skyArt } from '../core/art.js';
import { rome } from '../core/scenes.js';
import { f1Live, countdown, teamColour } from '../core/f1live.js';
import { site } from '../../../content/site.js';
import { projects, coursework, CATEGORIES, STATUS } from '../../../content/projects.js';
import { extracurriculars } from '../../../content/extracurriculars.js';
import { skillGroups, learningNow } from '../../../content/skills.js';
import { books } from '../../../content/books.js';
import { gh } from '../core/github.js';
import { githubPage, fillGithub, repoPage, fillRepo, liveRepo, startPage, fillStart } from './github.js';

const RM = reducedMotion();
const todo = (s = '') => (/^TODO/.test(String(s)) ? `<span class="todo">${esc(s)}</span>` : esc(s));
const TABS = [
  { id: 'home', label: 'New tab' },
  { id: 'start', label: 'Start here', kw: 'recruiter overview summary resume cv hire 60 seconds tour' },
  { id: 'projects', label: 'Projects', kw: 'work portfolio built case studies' },
  { id: 'github', label: 'GitHub · live', kw: 'code repos repositories commits source open source' },
  { id: 'academy', label: 'Academy', kw: 'college iiit courses coursework research hackathons clubs' },
  { id: 'about', label: 'About', kw: 'bio me skills interests now' },
  { id: 'pitwall', label: 'Pit wall · live', kw: 'f1 formula 1 racing standings results race' },
  { id: 'hotel', label: 'The hotel', kw: 'game pixel play world ducks' },
];
const TILES = [
  ['start', 'Start here', '→'], ['github', 'GitHub', '⌥'], ['projects', 'Projects', '◩'], ['academy', 'Academy', '◎'], ['about', 'About', '☺'], ['pitwall', 'Pit wall', 'F1'],
  ['hotel', 'Hotel', '▦'], ['library/', 'Library', '❦'], ['lab/', 'Lab', '⚗'], ['compass/', 'Compass', '✣'],
];

// ── the wallpaper ───────────────────────────────────────────────────────────
const wallpaper = () => `<div class="rome-wall" aria-hidden="true"><i class="sun"></i>${rome()}</div>`;

const searchBox = (big) => `<form class="omni-search${big ? ' big' : ''}" role="search" data-search>
  <span aria-hidden="true">⌕</span><input data-q type="search" autocomplete="off" placeholder="Search projects, repos, courses, books…" aria-label="Search the site"><kbd>/</kbd></form>`;

// mini version painted on the monitor in the photo (not interactive)
export function miniMonitor(el) {
  el.innerHTML = `<div class="mini-chrome"><i></i><i></i><i></i><span>sai://home</span></div>
    <div class="mini-nt">${wallpaper()}<div class="mini-mid"><b>Siddhanth</b><span class="mini-q">Search projects, courses, books…</span>
    <div class="mini-tiles">${TILES.slice(0, 6).map(([, l, g]) => `<span><i>${esc(g)}</i>${esc(l)}</span>`).join('')}</div></div></div>`;
}

// ── search index ────────────────────────────────────────────────────────────
function index() {
  const out = [];
  for (const t of TABS.slice(1)) out.push({ t: t.label, k: 'Tab', go: `browser/${t.id}`, x: t.kw });
  for (const p of projects) out.push({ t: p.title, s: p.summary, k: CATEGORIES[p.category]?.label || 'Project', go: `browser/p:${p.id}`, x: (p.tech || []).join(' ') });
  for (const c of coursework) out.push({ t: c.name, k: 'Course', go: 'browser/academy' });
  for (const g of skillGroups) for (const s of g.skills) if (!/^TODO/.test(s)) out.push({ t: s, k: g.name, go: 'browser/about' });
  for (const b of books) out.push({ t: b.title, s: b.author, k: 'Book', url: href(`library/#${b.isbn}`) });
  for (const [u, l] of [['work/', 'The logbook (every project)'], ['library/', 'Library'], ['lab/', 'Lab'], ['compass/', 'Compass'], ['portfolio/', 'The sunset journey'], ['hotel/', 'The pixel hotel'], ['vault/', 'The vault']]) out.push({ t: l, k: 'Page', url: href(u) });
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
      ? hits.map(([, i]) => `<li><a href="${i.url ? esc(i.url) : `#${esc(i.go)}`}"><b>${esc(i.t)}</b><span>${esc(i.k)}</span></a></li>`).join('')
      : `<li class="none">No results for “${esc(q)}”. Try “college”, “F1” or a book.</li>`;
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
      <nav class="nt-tiles" aria-label="Shortcuts">${TILES.map(([id, l, g]) => `<a href="${id.endsWith('/') ? esc(href(id)) : `#browser/${id}`}" ${id === 'hotel' ? '' : ''}><i>${esc(g)}</i><span>${esc(l)}</span></a>`).join('')}</nav>
    </div>
    <p class="nt-credit">Wallpaper: the Colosseum at sunset, drawn in code</p></div>`;
}

const card = (p, i) => `<a class="pj" href="#browser/p:${esc(p.id)}" style="--i:${i}">
  <span class="pj-art">${p.image ? `<img src="${esc(href(p.image))}" alt="" loading="lazy">` : skyArt(p.id, { w: 480, h: 300 })}${p.placeholder ? '<span class="ph">placeholder</span>' : ''}</span>
  <span class="pj-k">${esc(CATEGORIES[p.category]?.label || '')} · ${esc(p.year)}</span>
  <b>${esc(p.title)}</b><span class="pj-s">${esc(p.summary || '')}</span>
  <span class="pj-t">${(p.tech || []).slice(0, 4).map((t) => `<i>${esc(t)}</i>`).join('')}</span></a>`;

function projectsPage(filter = 'all') {
  const cats = ['all', ...Object.keys(CATEGORIES).filter((c) => projects.some((p) => p.category === c))];
  const list = [...projects].filter((p) => filter === 'all' || p.category === filter).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.year - a.year);
  return `<div class="pg"><header class="pg-h"><p class="eyebrow">sai://projects</p><h2>Things I’ve <em>built.</em></h2>
    <p class="lede">${projects.length} projects so far. Click one for the whole story, or open the <a href="${esc(href('work/'))}">full logbook ↗</a>.</p>
    <div class="filters" role="group" aria-label="Filter">${cats.map((c) => `<button type="button" data-filter="${c}" aria-pressed="${c === filter}">${esc(c === 'all' ? 'All' : CATEGORIES[c].label)}</button>`).join('')}</div></header>
    <div class="pj-grid">${list.map(card).join('')}</div></div>`;
}

function projectPage(id) {
  const p = projects.find((x) => x.id === id);
  if (!p) return projectsPage();
  const sec = (h, v) => (v ? `<section><h3>${esc(h)}</h3><p>${todo(v)}</p></section>` : '');
  const links = Object.entries(p.links || {}).filter(([, u]) => u);
  return `<article class="pg pj-page"><a class="back" href="#browser/projects">← All projects</a>
    <div class="pj-hero">${p.image ? `<img src="${esc(href(p.image))}" alt="">` : skyArt(p.id, { w: 1200, h: 420 })}</div>
    <p class="eyebrow">${esc(CATEGORIES[p.category]?.label || '')} · ${esc(p.period || p.year)} · ${esc(STATUS[p.status] || '')}${p.placeholder ? ' · <span class="todo">placeholder</span>' : ''}</p>
    <h2>${esc(p.title)}</h2>${p.subtitle ? `<p class="lede">${todo(p.subtitle)}</p>` : ''}
    <p class="big">${todo(p.summary)}</p>
    <div class="pj-cols">${sec('The problem', p.problem)}${sec('What I built', p.solution)}${sec('My part', p.contribution)}</div>
    ${p.highlights?.length ? `<section><h3>Highlights</h3><ul>${p.highlights.map((h) => `<li>${todo(h)}</li>`).join('')}</ul></section>` : ''}
    <p class="pj-t">${(p.tech || []).map((t) => `<i>${esc(t)}</i>`).join('')}</p>
    <p class="row">${links.map(([k, u]) => `<a class="btn" href="${esc(u)}" target="_blank" rel="noopener">${esc(k)} ↗</a>`).join('')}<a class="btn ghost" href="${esc(href('work/'))}#p/${esc(p.id)}">Case study in the logbook ↗</a></p>
    ${p.repo ? `<section class="live" data-live="${esc(p.repo)}"></section>` : ''}</article>`;
}

function academyPage() {
  const acad = projects.filter((p) => ['college', 'research', 'hackathon'].includes(p.category));
  return `<div class="pg"><header class="pg-h"><p class="eyebrow">sai://academy</p><h2>The <em>academy.</em></h2>
    <p class="lede">${esc(site.degree)} at ${esc(site.college)}.</p></header>
    <section class="ac-block"><h3>Coursework</h3><div class="chips">${coursework.map((c) => `<span>${esc(c.name)}${c.code && c.code !== 'TODO' ? ` <small>${esc(c.code)}</small>` : ''}</span>`).join('')}</div></section>
    <section class="ac-block"><h3>Course projects, research & hackathons</h3><ol class="ledger">${acad.map((p, i) => `<li><a href="#browser/p:${esc(p.id)}"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(p.title)}${p.placeholder ? ' <span class="todo">placeholder</span>' : ''}</b><span>${esc(p.course && !/^TODO/.test(p.course) ? p.course : CATEGORIES[p.category].label)}</span><span class="y">${esc(p.year)}</span></a></li>`).join('')}</ol></section>
    <section class="ac-block"><h3>Clubs, events & everything around the classes</h3><ul class="extras">${extracurriculars.map((x) => `<li><b>${esc(x.title)}${x.placeholder ? ' <span class="todo">placeholder</span>' : ''}</b><span>${esc([x.role, x.org, x.period].filter(Boolean).join(' · '))}</span><p>${esc(x.summary || '')}</p></li>`).join('')}</ul></section></div>`;
}

function aboutPage() {
  return `<div class="pg about"><header class="pg-h"><p class="eyebrow">sai://about</p><h2>${esc(site.fullName.split(' ').slice(0, -1).join(' '))} <em>${esc(site.fullName.split(' ').slice(-1)[0])}</em></h2>
    <p class="big">${esc(site.tagline)}</p></header>
    <div class="ab-grid"><div>${site.bio.map((b) => `<p>${todo(b)}</p>`).join('')}
      <dl class="facts">${site.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${todo(v)}</dd></div>`).join('')}</dl></div>
      <aside class="now"><h3><i class="pulse"></i>Right now</h3><ul>${site.now.map((n) => `<li><b>${esc(n.label)}</b>${todo(n.text)}</li>`).join('')}</ul></aside></div>
    <section class="ac-block"><h3>Interests</h3><div class="chips">${site.interests.map((i) => `<span>${esc(i)}</span>`).join('')}</div></section>
    <section class="ac-block"><h3>Toolbox</h3><div class="skills">${skillGroups.map((g) => `<div><b>${esc(g.name)}</b>${g.skills.map((s) => `<span>${todo(s)}</span>`).join('')}</div>`).join('')}</div>
    <p class="muted">Currently learning: ${learningNow.map(todo).join(', ')}</p></section></div>`;
}

function pitwallPage() {
  return `<div class="pg pit"><header class="pg-h"><p class="eyebrow">sai://pitwall · live timing</p><h2>Pit <em>wall.</em></h2>
    <p class="lede">The latest race, the championship and the countdown to the next lights out. Live from the Jolpica F1 API.</p></header><div data-pit><p class="muted">Connecting to timing…</p></div></div>`;
}
function fillPit(root) {
  const box = $('[data-pit]', root);
  if (!box) return;
  f1Live().then((d) => {
    if (!box.isConnected) return;
    if (!d || !d.last) return (box.innerHTML = '<p class="muted">The timing feed didn’t answer. Try again later, or see the Pavilion in the hotel.</p>');
    const L = d.last;
    const P = L.results;
    const pod = (i, cls) => (P[i] ? `<div class="${cls}"><b>${esc(P[i].code)}</b><small>${esc(P[i].team)}</small><i style="--team:${teamColour(P[i].team)}">${i + 1}</i></div>` : '<div></div>');
    const table = (rows, team) => `<ol class="pw-table">${rows.slice(0, 10).map((r) => `<li><span class="pos">${r.pos}</span><span class="tbar" style="background:${teamColour(team ? r.name : r.team)}"></span>${team ? '' : `<span class="code">${esc(r.code)}</span>`}<span>${esc(r.name)}</span><span class="pts">${r.pts}</span></li>`).join('')}</ol>`;
    box.innerHTML = `<div class="pw-grid">
      <section class="pw-last"><p class="eyebrow">Round ${L.round}/${d.rounds} · ${esc(L.place)} · ${esc(new Date(L.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }))}</p>
        <h3>${esc(L.name)}</h3><div class="podium">${pod(1, 'p2')}${pod(0, 'p1')}${pod(2, 'p3')}</div>
        <ol class="pw-table res">${P.slice(0, 10).map((r) => `<li><span class="pos">${r.pos}</span><span class="tbar" style="background:${teamColour(r.team)}"></span><span class="code">${esc(r.code)}</span><span>${esc(r.name)}</span><span class="pts">${esc(r.time || '')}</span></li>`).join('')}</ol></section>
      <section>${d.next ? `<div class="pw-next"><small>Next race</small><b>${esc(d.next.name)}</b><span class="cd" data-cd>${esc(countdown(d.next.at))}</span><span>${esc(d.next.place)} · ${esc(new Date(d.next.at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</span></div>` : ''}
        <h3 class="sm">${esc(d.season)} drivers</h3>${table(d.drivers)}
        <h3 class="sm">Constructors</h3>${table(d.teams, true)}</section></div>
      <p class="muted small">Live · Jolpica F1 API · refreshed every 20 minutes · <a href="${esc(href('hotel/'))}#pavilion" data-enter-hotel>full pit wall and a reaction game in the hotel ▸</a></p>`;
    if (d.next) {
      const t = setInterval(() => (box.isConnected ? ($('[data-cd]', box).textContent = countdown(d.next.at)) : clearInterval(t)), 30000);
    }
  });
}

function hotelPage() {
  return `<div class="pg hotelpg"><header class="pg-h"><p class="eyebrow">sai://hotel</p><h2>There’s a whole <em>world</em> behind this desk.</h2>
    <p class="lede">A playable, isometric pixel hotel. Every floor is open to explore: projects hang in the gallery, books fill the study, the pit wall shows live F1. The penthouse is private. Seven rubber ducks are hiding somewhere.</p>
    <p class="row"><a class="btn pixel" href="${esc(href('hotel/'))}" data-enter-hotel>Enter the hotel ▸</a></p></header>
    <div class="hotel-window"><canvas aria-label="A live view of the pixel hotel"></canvas><div class="hotel-floors" data-floors></div></div></div>`;
}
async function fillHotel(root) {
  const cv = $('.hotel-window canvas', root);
  if (!cv) return;
  const [{ buildHotel }, { City }, L] = await Promise.all([import('../world/hotel.js'), import('../world/city.js'), import('../world/layout.js')]);
  if (!cv.isConnected) return;
  const built = buildHotel();
  const city = new City();
  city.setMode('sunset');
  city.fade = 0;
  const vw = 560;
  const vh = 360;
  cv.width = vw;
  cv.height = vh;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  const floors = L.FLOORS.filter((f) => f.status === 'open' || f.id === 'penthouse');
  const chips = $('[data-floors]', root);
  chips.innerHTML = [...L.FLOORS].reverse().map((f) => `<a href="${esc(href('hotel/'))}#${f.id}" data-f="${f.id}" data-enter-hotel class="${f.id === 'penthouse' ? 'priv' : ''}" title="${esc(f.name)}">${esc(f.n)}</a>`).join('');
  const G = { flags: {}, skyColor: '#ffb347' };
  const draw = (now) => {
    if (!cv.isConnected) return;
    requestAnimationFrame(draw);
    const t = now / 1000;
    const k = RM ? 0 : t / 7;
    const f = floors[Math.floor(k) % floors.length];
    const [sx, sy] = L.proj(f, 160 + (k % 1) * 1100, 48);
    const cam = { x: Math.round(Math.max(0, Math.min(L.IW - vw, sx - vw * 0.5))), y: Math.round(Math.max(0, Math.min(L.IH - vh, sy - vh * 0.55))) };
    city.draw(c, cam, vw, vh, t, RM);
    c.drawImage(built.art, cam.x, cam.y, vw, vh, 0, 0, vw, vh);
    c.save();
    c.translate(-cam.x, -cam.y);
    c.transform(...L.WALL);
    for (const fl of L.FLOORS) built.modules[fl.id]?.dyn?.(c, fl, t, G);
    c.restore();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = 0.85;
    c.drawImage(built.light, cam.x, cam.y, vw, vh, 0, 0, vw, vh);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    $$('a', chips).forEach((s) => s.classList.toggle('on', s.dataset.f === f.id));
  };
  requestAnimationFrame(draw);
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
    const tab = id === 'p' ? 'projects' : id === 'r' ? 'github' : TABS.some((t) => t.id === id) ? id : 'home';
    $$('[data-tab]', root).forEach((a) => a.setAttribute('aria-selected', String(a.dataset.tab === tab)));
    $('[data-addr]', root).innerHTML = `<i>☀</i>sai://${esc(id === 'p' ? `projects/${arg}` : id === 'r' ? `github/${arg}` : tab)}`;
    view.innerHTML = id === 'p' ? projectPage(arg) : id === 'r' ? repoPage(arg) : { home, start: startPage, projects: projectsPage, github: githubPage, academy: academyPage, about: aboutPage, pitwall: pitwallPage, hotel: hotelPage }[tab]();
    view.scrollTop = 0;
    view.classList.remove('in');
    requestAnimationFrame(() => view.classList.add('in'));
    const form = $('[data-search]', view);
    if (form) search(form, ctx);
    if (id === 'p') liveRepo(view);
    if (id === 'r') fillRepo(view);
    else if (tab === 'github') fillGithub(view);
    if (tab === 'start') fillStart(view);
    if (tab === 'pitwall') fillPit(view);
    if (tab === 'hotel') fillHotel(view);
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
