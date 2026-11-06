// ─────────────────────────────────────────────────────────────────────────────
//  THE STUDY'S OWN THINGS. Words written onto the photo (the poster's title,
//  notes on the pinned papers, the card on the wall) and the plaques that
//  slide in when you open the wall's things (#wall/<id>). Boxes are photo px
//  of assets/img/study.jpg (2400×1350).
// ─────────────────────────────────────────────────────────────────────────────
import { $, esc, href } from '../core/base.js';
import { site } from '../../../content/site.js';
import { desk } from '../../../content/desk.js';
import { projects, STATUS } from '../../../content/projects.js';
import { books, STATUSES } from '../../../content/books.js';

const real = (s = '') => !!s && !/^TODO/.test(String(s));
const MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
const when = (p) => {
  const m = String(p.period || '').toLowerCase().match(/([a-z]{3})[a-z]*\s+(\d{4})/);
  return m ? +m[2] * 12 + MONTHS.indexOf(m[1]) : (p.year || 0) * 12;
};
const BUILT = projects.filter((p) => !p.placeholder).sort((a, b) => when(b) - when(a));
const NOW = site.now.filter((n) => real(n.text));
const R = desk.research || {};
const hasResearch = real(R.title);
const SHELF = books.filter((b) => b.shelves?.some((s) => s === 'philosophy' || s === 'human'));
const film = desk.films[0];

// ── written onto the photo ──────────────────────────────────────────────────
const at = ([x, y, w, h], rot = 0) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px${rot ? `;transform:rotate(${rot}deg)` : ''}`;
export function notes(root) {
  const exp = site.experience[0];
  root.innerHTML = `
    <div class="n-poster" style="${at([1026, 370, 278, 94])}"><b>${esc(film.title)}</b></div>
    <div class="n-hand" style="${at([1404, 372, 214, 196], -1.2)}"><b>Lately</b>${NOW.slice(0, 1).map((n) => `<span>${esc(n.text)}</span>`).join('')}${exp ? `<span>${esc(exp.role)}, ${esc(exp.org)}</span>` : ''}</div>
    <div class="n-hand" style="${at([1722, 380, 226, 190], 1.4)}"><b>Research</b><span>${hasResearch ? esc(R.title) : 'in progress…'}</span></div>
    <div class="n-hand small" style="${at([2030, 418, 200, 60], -2)}"><b>Say hello →</b></div>`;
}

// ── the plaques ─────────────────────────────────────────────────────────────
const close = '<button class="x" type="button" data-close aria-label="Back to the desk">×</button>';
const linkedin = site.socials.find((s) => /linkedin/i.test(s.label))?.url;
const P = {
  about: () => `<p class="pq-k">About</p><h2>${esc(site.fullName)}</h2>
    <p>${esc(site.tagline)}</p>
    <dl class="pq-facts">${site.facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    <p class="pq-sub">What I think about</p><ul class="pq-chips">${site.interests.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    <blockquote>${esc(site.epigraph.text)} <span>${esc(site.epigraph.gloss)}</span></blockquote>
    <p class="pq-links"><a href="#browser/about">The longer version →</a>${linkedin ? ` <a href="${esc(linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ''}</p>`,
  timeline: () => `<p class="pq-k">Projects</p><h2>Things I’ve <em>built.</em></h2>
    <ol class="pq-tl">${BUILT.map((p) => `<li><span class="pq-when">${esc(p.period || String(p.year))}</span><a href="${esc(href(`#p/${p.id}`))}"><b>${esc(p.title)}</b><small>${esc(p.subtitle || '')}</small></a><span class="pq-st">${esc(STATUS[p.status] || '')}</span></li>`).join('')}</ol>
    <p class="pq-links"><a href="#browser/projects">Open them on the tablet →</a></p>`,
  progress: () => `<p class="pq-k">Progress</p><h2>What I’m doing <em>lately.</em></h2>
    <ul class="pq-now">${NOW.map((n) => `<li><span>${esc(n.label)}</span>${esc(n.text)}</li>`).join('')}</ul>
    <p class="pq-sub">Experience</p><ul class="pq-now">${site.experience.map((x) => `<li><span>${esc(x.period)}</span>${esc(x.role)}, ${esc(x.org)}. ${esc(x.note)}</li>`).join('')}</ul>`,
  research: () => hasResearch
    ? `<p class="pq-k">Research</p><h2>${esc(R.title)}</h2>${R.lab ? `<p class="pq-sub">${esc(R.lab)}</p>` : ''}${R.question ? `<p>${esc(R.question)}</p>` : ''}${R.status ? `<p class="pq-st">${esc(R.status)}</p>` : ''}`
    : `<p class="pq-k">Research</p><h2>This page is waiting for its <em>paper.</em></h2><p class="muted">I study Computing &amp; Human Sciences by Research. The research goes here once there’s something worth pinning up.</p>`,
  books: () => `<p class="pq-k">The shelf</p><h2>Philosophy &amp; <em>psychology.</em></h2>
    <ul class="pq-books">${SHELF.map((b) => `<li><b>${esc(b.title)}</b><span>${esc(b.author)} · ${esc(STATUSES[b.status] || '')}</span></li>`).join('')}</ul>
    <p class="pq-links"><a href="${esc(href('library/'))}">The whole library →</a></p>`,
};
export const PLAQUES = Object.keys(P);

export function plaque(el, id, c) {
  if (!P[id]) return null;
  el.innerHTML = `${close}<div class="pq">${P[id]()}</div>`;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('open'));
  $('[data-close]', el).addEventListener('click', () => c.leave());
  $('[data-close]', el).focus({ preventScroll: true });
  return () => {};
}

export const poster = () => `${film.title} (${film.year}). ${film.line}`;
