// ─────────────────────────────────────────────────────────────────────────────
//  THE GALLERY WALL above the desk. Frames (#wall/<id>, each opens a plaque
//  beside it) and posters that do something in place: the Inception top
//  spins, the lighthouse turns, the F1 poster is a start-lights reaction test.
//  Boxes are stage px ([x, y, w, h]); the photo sits at (400, 400).
// ─────────────────────────────────────────────────────────────────────────────
import { $, esc, href } from '../core/base.js';
import { site } from '../../../content/site.js';
import { desk } from '../../../content/desk.js';
import { projects, STATUS } from '../../../content/projects.js';

const real = (s = '') => !!s && !/^TODO/.test(String(s));
const MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
const when = (p) => {
  const m = String(p.period || '').toLowerCase().match(/([a-z]{3})[a-z]*\s+(\d{4})/);
  return m ? +m[2] * 12 + MONTHS.indexOf(m[1]) : (p.year || 0) * 12;
};
const month = (p) => (String(p.period || '').match(/^[A-Za-z]{3}/)?.[0] || String(p.year || ''));
const BUILT = projects.filter((p) => !p.placeholder).sort((a, b) => when(b) - when(a));
const NOW = site.now.filter((n) => real(n.text));
const R = desk.research || {};
const hasResearch = real(R.title);

// ── the frames ──────────────────────────────────────────────────────────────
export const FRAMES = [
  { id: 'timeline', label: 'Projects', what: 'A timeline of what I’ve built', box: [130, 175, 470, 310], kind: 'poster ink' },
  { id: 'research', label: 'Research', what: hasResearch ? R.title : 'Coming soon', box: [170, 570, 230, 270], kind: 'wood' },
  { id: 'about', label: 'About', what: 'Who I am', box: [700, 220, 260, 240], kind: 'gilt small' },
  { id: 'portrait', label: 'Portrait', what: desk.portrait.title, box: [1080, 150, 250, 310], kind: 'gilt' },
  { id: 'progress', label: 'Progress', what: 'What I’m doing lately', box: [1430, 210, 230, 245], kind: 'brass' },
];
// posters act in place (easter eggs, so they don't need a URL)
const FILMS = desk.films.slice(0, 2).map((f, i) => ({ ...f, id: `film${i}`, box: i ? [2010, 185, 180, 270] : [1730, 170, 190, 285] }));
const F1 = { id: 'f1', box: [2030, 500, 290, 190] };

const at = ([x, y, w, h]) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
const light = '<i class="pl" aria-hidden="true"></i>';

function face(id) {
  if (id === 'timeline') {
    return `<div class="tl"><p class="tl-h">Things I’ve <em>built.</em></p><ol>${BUILT.slice(0, 6).map((p) => `<li data-s="${esc(p.status)}"><span>${esc(month(p))}</span><b>${esc(p.title)}</b></li>`).join('')}</ol><p class="tl-f">${BUILT.length} projects · ${esc(String(Math.min(...BUILT.map((p) => p.year || 9999))))} to now</p></div>`;
  }
  if (id === 'research') {
    return hasResearch
      ? `<div class="paper"><small>Research</small><b>${esc(R.title)}</b><span>${esc(R.lab)}</span><i></i><i></i><i></i><i class="s"></i></div>`
      : `<div class="paper blank"><small>Research</small><b>In progress</b><i></i><i></i><i></i><i class="s"></i><i></i><i class="s"></i></div>`;
  }
  if (id === 'about') {
    return `<div class="card-about"><small>About</small><b>Sophomore,<br>IIIT Hyderabad</b><span>CS + Computing &amp; Human Sciences</span><em>${esc(site.epigraph.text)}</em></div>`;
  }
  if (id === 'portrait') {
    const P = desk.portrait;
    return `<div class="oil"><svg class="sil" viewBox="0 0 100 124" aria-hidden="true"><defs><radialGradient id="sky" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#3a4fb0"/><stop offset=".6" stop-color="#1a2160"/><stop offset="1" stop-color="#0b0d2a"/></radialGradient><linearGradient id="rim" x1="0" x2="1"><stop offset="0" stop-color="#e9b85c" stop-opacity=".9"/><stop offset=".3" stop-color="#0d0a12" stop-opacity="0"/></linearGradient></defs>
      <rect width="100" height="124" fill="url(#sky)"/>${[18, 30, 42, 54].map((r, i) => `<circle cx="72" cy="26" r="${r}" fill="none" stroke="#7d93e8" stroke-opacity="${0.18 - i * 0.03}" stroke-width="3" stroke-dasharray="${6 + i * 2} ${5 + i}"/>`).join('')}<circle cx="72" cy="26" r="7" fill="#f3d27a"/><circle cx="72" cy="26" r="12" fill="#f3d27a" opacity=".2"/>
      <path d="M14 124c2-24 14-34 36-36-11-5-16-15-15-28 1-14 9-22 16-22s16 8 16 22c1 13-4 23-15 28 22 2 34 12 36 36Z" fill="#0d0a12"/><path d="M14 124c2-24 14-34 36-36-11-5-16-15-15-28 1-14 9-22 16-22" fill="none" stroke="url(#rim)" stroke-width="2"/></svg>
      ${P.src ? `<img src="${esc(href(P.src))}" alt="" loading="lazy" onload="this.parentNode.classList.add('has')" onerror="this.remove()">` : ''}</div>`;
  }
  if (id === 'progress') {
    const exp = site.experience[0];
    return `<div class="now"><small>Lately</small><ul>${NOW.slice(0, 2).map((n) => `<li><span>${esc(n.label)}</span>${esc(n.text)}</li>`).join('')}${exp ? `<li><span>Last summer</span>${esc(exp.role)}, ${esc(exp.org)}</li>` : ''}</ul></div>`;
  }
  return '';
}

const MOTIF = {
  top: '<svg class="motif m-top" viewBox="0 0 60 90" aria-hidden="true"><g class="spin"><path d="M30 6v10" stroke="#d9c7a4" stroke-width="3" stroke-linecap="round"/><path d="M8 34c0-8 10-14 22-14s22 6 22 14c0 10-14 26-22 42C22 60 8 44 8 34Z" fill="#b9a27a"/><path d="M8 34c6 5 38 5 44 0" fill="none" stroke="#6e5b3e" stroke-width="2"/></g><ellipse cx="30" cy="84" rx="14" ry="2.5" fill="#000" opacity=".45"/></svg>',
  lighthouse: '<svg class="motif lh" viewBox="0 0 60 90" aria-hidden="true"><path class="ray" d="M30 22 L-60 0 L-60 44Z M30 22 L120 0 L120 44Z" fill="#f3e2b0" opacity=".22"/><path d="M24 30h12l4 52H20Z" fill="#d8d2c4"/><path d="M22 46h16M21 62h18" stroke="#8a2f2a" stroke-width="5"/><rect x="25" y="20" width="10" height="10" fill="#f6e7a8"/><path d="M23 20l7-8 7 8Z" fill="#2a2a30"/><path d="M0 84q15-5 30 0t30 0v6H0Z" fill="#1d2a3a"/></svg>',
};

export function gallery(root) {
  root.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="oil" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045 0.09" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/>
      <feComponentTransfer><feFuncR type="discrete" tableValues="0 .18 .34 .5 .66 .82 1"/><feFuncG type="discrete" tableValues="0 .18 .34 .5 .66 .82 1"/><feFuncB type="discrete" tableValues="0 .18 .34 .5 .66 .82 1"/></feComponentTransfer></filter></svg>
    ${FRAMES.map((f) => `<a class="fr ${f.kind}" href="#wall/${f.id}" data-frame="${f.id}" style="${at(f.box)}" aria-label="${esc(f.label)}: ${esc(f.what)}">${light}<span class="face">${face(f.id)}</span><span class="fr-tag"><b>${esc(f.label)}</b><small>${esc(f.what)}</small></span></a>`).join('')}
    <p class="museum" style="left:${FRAMES[3].box[0] - 80}px;top:${FRAMES[3].box[1] + FRAMES[3].box[3] + 18}px;width:${FRAMES[3].box[2] + 160}px"><b>${esc(site.fullName)}</b> <i>${esc(desk.portrait.title)}</i>, ${esc(String(desk.portrait.year))} · ${esc(desk.portrait.medium)}</p>
    ${FILMS.map((f) => `<button class="fr poster film" type="button" data-poster="${f.id}" data-motif="${esc(f.motif)}" style="${at(f.box)}" aria-label="${esc(f.title)} (${f.year}) poster">${light}<span class="face"><span class="film-art">${MOTIF[f.motif] || ''}</span><b>${esc(f.title)}</b><small>${esc(String(f.year))}</small></span></button>`).join('')}
    <button class="fr poster f1" type="button" data-poster="f1" style="${at(F1.box)}" aria-label="Lights out: a start-lights reaction test">${light}<span class="face"><span class="lights">${'<i><b></b><b></b></i>'.repeat(5)}</span><b class="f1-t" data-f1>Lights out</b><small data-f1s>Click to start</small></span></button>`;
  root.addEventListener('click', (e) => {
    const p = e.target.closest('[data-poster]');
    if (!p) return;
    if (p.dataset.poster === 'f1') return startLights(p);
    film(p);
  });
}

// ── posters ─────────────────────────────────────────────────────────────────
function film(p) {
  const f = FILMS.find((x) => x.id === p.dataset.poster);
  p.classList.remove('play');
  void p.offsetWidth;
  p.classList.add('play');
  clearTimeout(p.t);
  p.t = setTimeout(() => p.classList.remove('play'), 7000);
  ctx.toast?.(`${f.title} (${f.year}). ${f.line}`);
}

// the F1 poster: five lights come on, go out at random, click as fast as you can
let race = null;
const best = () => { try { return +localStorage.getItem('desk:f1') || 0; } catch { return 0; } };
function startLights(p) {
  const t = $('[data-f1]', p);
  const s = $('[data-f1s]', p);
  const pods = [...p.querySelectorAll('.lights i')];
  if (race?.out) {
    const ms = Math.round(performance.now() - race.out);
    race = null;
    const b = best();
    if (!b || ms < b) try { localStorage.setItem('desk:f1', ms); } catch {}
    t.textContent = `${ms} ms`;
    s.textContent = !b || ms < b ? 'New best. Click to go again' : `Best ${b} ms. Click to go again`;
    return ctx.toast?.(ms < 200 ? `${ms} ms. Faster than most grid starts.` : `${ms} ms off the line.`);
  }
  if (race) {
    race.timers.forEach(clearTimeout);
    race = null;
    pods.forEach((i) => i.classList.remove('on'));
    t.textContent = 'Jump start';
    s.textContent = 'Wait for the lights to go out';
    return;
  }
  race = { timers: [] };
  t.textContent = 'Wait for it…';
  s.textContent = 'Click when they go out';
  pods.forEach((i, k) => race.timers.push(setTimeout(() => i.classList.add('on'), 600 + k * 900)));
  race.timers.push(setTimeout(() => {
    pods.forEach((i) => i.classList.remove('on'));
    race.out = performance.now();
    t.textContent = 'Go!';
  }, 600 + 4 * 900 + 400 + Math.random() * 2400));
}

// ── the plaques: what each frame opens ──────────────────────────────────────
const close = '<button class="x" type="button" data-close aria-label="Back to the desk">×</button>';
const P = {
  portrait: () => `<p class="pq-k">${esc(desk.portrait.title)}, ${esc(String(desk.portrait.year))}</p><h2>${esc(site.fullName)}</h2>
    <p>${esc(site.tagline)}</p>
    <dl class="pq-facts">${site.facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    <p class="pq-links"><a href="#browser/about">The longer version →</a> <a href="${esc(site.socials.find((s) => /linkedin/i.test(s.label))?.url || '#')}" target="_blank" rel="noopener">LinkedIn ↗</a></p>`,
  about: () => `<p class="pq-k">About</p><h2>${site.bio.map(esc).join(' ')}</h2>
    <p>${esc(site.tagline)}</p>
    <p class="pq-sub">What I think about</p><ul class="pq-chips">${site.interests.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    <blockquote>${esc(site.epigraph.text)} <span>${esc(site.epigraph.gloss)}</span></blockquote>`,
  timeline: () => `<p class="pq-k">Projects</p><h2>Things I’ve <em>built.</em></h2>
    <ol class="pq-tl">${BUILT.map((p) => `<li><span class="pq-when">${esc(p.period || String(p.year))}</span><a href="${esc(href(`#p/${p.id}`))}"><b>${esc(p.title)}</b><small>${esc(p.subtitle || '')}</small></a><span class="pq-st" data-s="${esc(p.status)}">${esc(STATUS[p.status] || '')}</span></li>`).join('')}</ol>
    <p class="pq-links"><a href="#browser/projects">Open them on the monitor →</a></p>`,
  research: () => hasResearch
    ? `<p class="pq-k">Research</p><h2>${esc(R.title)}</h2>${R.lab ? `<p class="pq-sub">${esc(R.lab)}</p>` : ''}${R.question ? `<p>${esc(R.question)}</p>` : ''}${R.status ? `<p class="pq-st">${esc(R.status)}</p>` : ''}`
    : `<p class="pq-k">Research</p><h2>This frame is waiting for its <em>paper.</em></h2><p class="muted">I study Computing &amp; Human Sciences by Research. The research itself goes here once there’s something worth framing.</p>`,
  progress: () => `<p class="pq-k">Progress</p><h2>What I’m doing <em>lately.</em></h2>
    <ul class="pq-now">${NOW.map((n) => `<li><span>${esc(n.label)}</span>${esc(n.text)}</li>`).join('')}</ul>
    <p class="pq-sub">Experience</p><ul class="pq-now">${site.experience.map((x) => `<li><span>${esc(x.period)}</span>${esc(x.role)}, ${esc(x.org)}. ${esc(x.note)}</li>`).join('')}</ul>`,
};

let ctx = {};
export function plaque(el, id, c) {
  ctx = c;
  const f = FRAMES.find((x) => x.id === id);
  if (!f) return null;
  el.innerHTML = `${close}<div class="pq">${P[id]()}</div>`;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('open'));
  $('[data-close]', el).addEventListener('click', () => c.leave());
  $('[data-close]', el).focus({ preventScroll: true });
  return () => {};
}
export const setCtx = (c) => (ctx = c);
