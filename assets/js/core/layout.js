// ─────────────────────────────────────────────────────────────────────────────
//  SHARED SHELL — top bar, mobile menu, footer, site-wide search (⌘K / "/"),
//  the 60-second version, and boot() which every page calls once.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, h, esc, href, toast, copy, revealOnScroll, glowFollow } from './base.js';
import { mountSky } from './sky.js';
import { initEggs, EGG_COMMANDS } from './eggs.js';
import { site } from '../../../content/site.js';
import { projects, CATEGORIES } from '../../../content/projects.js';
import { extracurriculars } from '../../../content/extracurriculars.js';
import { skillGroups } from '../../../content/skills.js';
import { books } from '../../../content/books.js';
import { linkGroups } from '../../../content/links.js';
import { experiments } from '../../../lab/experiments/index.js';

export const NAV = [
  { key: 'front', label: 'Home', path: '', note: 'The website' },
  { key: 'hotel', label: 'Hotel ▸', path: 'hotel/', note: 'Enter the world' },
  { key: 'home', label: 'Journey', path: 'portfolio/', note: 'Five cities' },
  { key: 'work', label: 'Work', path: 'work/', note: 'Every project' },
  { key: 'college', label: 'College', path: 'work/#college', note: 'IIIT Hyderabad' },
  { key: 'hire', label: 'Hire me', path: 'portfolio/#nyc', note: 'Skills & résumé' },
  { key: 'library', label: 'Library', path: 'library/', note: 'Books & papers' },
  { key: 'compass', label: 'Compass', path: 'compass/', note: 'Useful sites' },
  { key: 'lab', label: 'Lab', path: 'lab/', note: 'Experiments' },
  { key: 'vault', label: 'Vault', path: 'vault/', note: 'Private', cls: 'nav-lock' },
].filter((n) => n.key !== 'hotel' || site.game);

export const CHAPTERS = [
  { id: 'paris', n: '01', title: 'The beginning', city: 'Paris', about: 'Who I am' },
  { id: 'rome', n: '02', title: 'The academy', city: 'Rome', about: 'IIIT Hyderabad & college work' },
  { id: 'rio', n: '03', title: 'The carnival', city: 'Rio de Janeiro', about: 'Adventures & extracurriculars' },
  { id: 'nyc', n: '04', title: 'The workshop', city: 'New York', about: 'Skills, engineering & hiring' },
  { id: 'arctic', n: '05', title: 'The observatory', city: 'Tromsø', about: 'Library, reading & contact' },
];

const navHref = (item) => href(item.path);

function header(page) {
  const links = NAV.filter((n) => n.key !== 'hire' || true)
    .map((n) => `<a href="${navHref(n)}" class="${n.cls || ''}" ${n.key === page ? 'aria-current="page"' : ''}>${esc(n.label)}</a>`)
    .join('');
  const bar = h(`<header class="topbar">
    <a class="brand" href="${href('')}" aria-label="${esc(site.fullName)} — home"><span class="brand-sun" aria-hidden="true"></span>${esc(site.name)}</a>
    <nav class="topnav" aria-label="Main">${links}</nav>
    <div class="top-actions">
      <button class="search-btn" type="button" data-open-search aria-label="Search everything"><span class="label">Search</span><kbd>⌘K</kbd></button>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu"><span></span><span></span></button>
    </div></header>`);
  const menu = h(`<nav class="mobile-menu" id="mobile-menu" aria-label="Mobile">${NAV.map(
    (n) => `<a href="${navHref(n)}">${esc(n.label)} <small>${esc(n.note)}</small></a>`
  ).join('')}</nav>`);
  document.body.prepend(menu);
  document.body.prepend(bar);
  const btn = $('.menu-btn', bar);
  const toggle = (open) => {
    menu.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => toggle(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => e.target.closest('a') && toggle(false));
  addEventListener('keydown', (e) => e.key === 'Escape' && toggle(false));
  const onScroll = () => bar.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function footer() {
  const socials = site.socials.filter((s) => s.url).map((s) => `<a href="${esc(s.url)}" rel="me noopener" target="_blank">${esc(s.label)}</a>`).join('');
  const el = h(`<footer class="footer"><div class="wrap">
    <div class="footer-grid">
      <p class="sign">Made by hand under a thousand sunsets.</p>
      <nav aria-label="Footer">${NAV.map((n) => `<a href="${navHref(n)}">${esc(n.label)}</a>`).join('')}${socials}<button class="chip" type="button" data-open-quick>60-second version</button></nav>
    </div>
    <div class="meta"><span>© ${new Date().getFullYear()} ${esc(site.fullName)}</span><span>No trackers · no cookies · static & free</span><span class="egg-count"></span></div>
  </div></footer>`);
  const main = $('main');
  (main?.parentNode || document.body).insertBefore(el, main?.nextSibling || null);
}

// ── Search palette ──────────────────────────────────────────────────────────
function buildIndex() {
  const I = [];
  const add = (group, icon, title, sub, url, extra = '') => I.push({ group, icon, title, sub, url, hay: `${title} ${sub} ${extra}`.toLowerCase() });
  NAV.forEach((n) => add('Pages', '→', n.label, n.note, navHref(n)));
  CHAPTERS.forEach((c) => add('Journey', c.n, `${c.city} — ${c.title}`, c.about, href('portfolio/') + '#' + c.id));
  Object.entries(CATEGORIES).forEach(([k, c]) => add('Work', '▦', `${c.label} projects`, c.blurb, href('work/') + '#' + k));
  projects.forEach((p) => add('Projects', '◆', p.title, `${CATEGORIES[p.category]?.label || ''} · ${p.summary || ''}`, href('work/') + '#p/' + p.id, `${p.tech?.join(' ')} ${p.course || ''} ${p.subtitle || ''}`));
  extracurriculars.forEach((x) => add('Experiences', '✺', x.title, `${x.org} · ${x.role}`, href('portfolio/') + '#rio', x.summary));
  skillGroups.forEach((g) => g.skills.forEach((s) => add('Skills', '⚙', s, g.name, href('work/') + '?q=' + encodeURIComponent(s))));
  books.forEach((b) => add('Library', '❦', b.title, b.author, href('library/') + '#' + encodeURIComponent(b.isbn || b.title), (b.shelves || []).join(' ')));
  linkGroups.forEach((g) => g.links.forEach((l) => add('Compass', '↗', l.name, l.note || l.url, l.url, g.name)));
  experiments.forEach((x) => add('Lab', '✧', x.title, x.blurb, href('lab/') + '#' + x.id));
  add('Actions', '✉', 'Send me a message', 'Postcard form', href('portfolio/') + '#contact');
  add('Actions', '⏱', 'The 60-second version', 'Everything a recruiter needs', '#quick');
  if (site.email) add('Actions', '⧉', 'Copy my email', site.email, '#copy-email');
  if (site.hiring.resume) add('Actions', '⇩', 'Résumé', 'PDF', href(site.hiring.resume));
  return I;
}

function score(item, q) {
  if (!q) return item.group === 'Pages' || item.group === 'Journey' || item.group === 'Actions' ? 1 : 0;
  const t = item.title.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 60;
  if (t.includes(q)) return 40;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.every((w) => item.hay.includes(w))) return 20;
  return 0;
}

function searchPalette(sky) {
  const index = buildIndex();
  const dlg = h(`<dialog class="palette" aria-label="Search">
    <div class="palette-box panel">
      <div class="palette-input"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search projects, skills, books, pages…" aria-label="Search" aria-controls="palette-list" autocomplete="off" spellcheck="false"><kbd>esc</kbd></div>
      <ul class="palette-list" id="palette-list" role="listbox"></ul>
      <div class="palette-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span>Try “college”, “python”, “books”</span></div>
    </div></dialog>`);
  document.body.append(dlg);
  const input = $('input', dlg);
  const list = $('ul', dlg);
  let results = [];
  let sel = 0;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    const egg = EGG_COMMANDS[q];
    results = index.map((it) => ({ it, s: score(it, q) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 40).map((r) => r.it);
    if (egg) results.unshift({ group: '✦', icon: '✦', title: egg.title, sub: egg.sub, url: '#egg:' + q });
    sel = 0;
    if (!results.length) {
      list.innerHTML = `<li class="palette-empty">Nothing matches “${esc(input.value)}”. Try a skill, a course or a book title.</li>`;
      return;
    }
    let last = '';
    list.innerHTML = results.map((r, i) => {
      const head = r.group !== last ? `<li class="group" role="presentation">${esc((last = r.group))}</li>` : '';
      const ext = /^https?:/.test(r.url) && !r.url.startsWith(href('')) ? ' target="_blank" rel="noopener"' : '';
      return `${head}<li role="presentation"><a class="item" role="option" id="opt-${i}" href="${esc(r.url)}"${ext} aria-selected="${i === 0}"><span class="ic" aria-hidden="true">${esc(r.icon)}</span><span class="t"><b>${esc(r.title)}</b><span>${esc(r.sub || '')}</span></span></a></li>`;
    }).join('');
  };
  const move = (d) => {
    const items = $$('.item', list);
    if (!items.length) return;
    items[sel]?.setAttribute('aria-selected', 'false');
    sel = (sel + d + items.length) % items.length;
    items[sel].setAttribute('aria-selected', 'true');
    items[sel].scrollIntoView({ block: 'nearest' });
  };
  const run = (a) => {
    const u = a.getAttribute('href');
    if (u === '#quick') return dlg.close(), openQuick();
    if (u === '#copy-email') return dlg.close(), copy(site.email).then(() => toast('Email copied — ' + site.email, { icon: '⧉' }));
    if (u.startsWith('#egg:')) return dlg.close(), EGG_COMMANDS[u.slice(5)].run(sky);
    dlg.close();
    return null;
  };
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') e.preventDefault(), move(1);
    if (e.key === 'ArrowUp') e.preventDefault(), move(-1);
    if (e.key === 'Enter') {
      const a = $$('.item', list)[sel];
      if (!a) return;
      e.preventDefault();
      if (run(a) === null) a.click();
    }
  });
  list.addEventListener('click', (e) => {
    const a = e.target.closest('.item');
    if (!a) return;
    const u = a.getAttribute('href');
    if (u.startsWith('#quick') || u.startsWith('#copy') || u.startsWith('#egg:')) {
      e.preventDefault();
      run(a);
    } else dlg.close();
  });
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());
  const open = (q = '') => {
    if (dlg.open) return;
    input.value = q;
    render();
    dlg.showModal();
    input.focus();
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-search]')) open();
    if (e.target.closest('[data-open-quick]')) openQuick();
  });
  addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') e.preventDefault(), open();
    else if (e.key === '/' && !typing && !document.querySelector('[data-own-slash]')) e.preventDefault(), open();
  });
}

// ── The 60-second version ───────────────────────────────────────────────────
let quickDlg;
export function openQuick() {
  if (!quickDlg) {
    const feat = projects.filter((p) => p.featured).slice(0, 5);
    const socials = site.socials.filter((s) => s.url);
    quickDlg = h(`<dialog class="quick" aria-labelledby="quick-title"><div class="quick-box panel">
      <button class="close-x" type="button" aria-label="Close">✕</button>
      <p class="kicker"><span class="dot"></span>The 60-second version</p>
      <h2 id="quick-title">${esc(site.fullName)}</h2>
      <p class="lede">${esc(site.degree)} at ${esc(site.college)}. ${esc(site.hiring.open ? site.hiring.headline + '.' : '')}</p>
      <div class="row" style="margin-top:18px">
        <a class="btn primary" href="${href('work/')}">All projects <span class="arr">→</span></a>
        <a class="btn" href="${href('work/')}#college">College work</a>
        ${site.hiring.resume ? `<a class="btn" href="${href(site.hiring.resume)}">Résumé ⇩</a>` : ''}
        <a class="btn" href="${href('portfolio/')}#contact">Contact</a>
      </div>
      <div class="quick-grid">
        <div><h3>Featured work</h3><ul>${feat.map((p) => `<li><a href="${href('work/')}#p/${p.id}">${esc(p.title)}</a>${p.placeholder ? ' <span class="badge-placeholder">Placeholder</span>' : ''}<div class="meta">${esc(p.tech?.slice(0, 3).join(' · ') || '')}</div></li>`).join('')}</ul></div>
        <div><h3>Skills</h3><ul>${skillGroups.map((g) => `<li><b>${esc(g.name)}</b><div class="meta">${esc(g.skills.filter((s) => !s.startsWith('TODO')).join(' · ') || '—')}</div></li>`).join('')}</ul></div>
        <div><h3>Interested in</h3><ul>${site.interests.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
          ${socials.length ? `<h3 style="margin-top:22px">Elsewhere</h3><ul>${socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a></li>`).join('')}</ul>` : ''}</div>
      </div></div></dialog>`);
    document.body.append(quickDlg);
    $('.close-x', quickDlg).addEventListener('click', () => quickDlg.close());
    quickDlg.addEventListener('click', (e) => e.target === quickDlg && quickDlg.close());
  }
  quickDlg.showModal();
}

/** Every page calls this once. Returns the sky. */
export function boot({ page, sky: palette = 'paris' }) {
  document.documentElement.classList.add('js');
  const sky = mountSky(palette);
  header(page);
  footer();
  searchPalette(sky);
  initEggs(sky);
  revealOnScroll();
  glowFollow();
  if (location.hash === '#quick') openQuick();
  return sky;
}
