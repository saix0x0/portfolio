// HOME — the five-chapter journey.
import { $, $$, h, esc, href, clamp, smooth, store, reducedMotion, revealOnScroll, canHover } from '../core/base.js';
import { boot, CHAPTERS } from '../core/layout.js';
import { SCENES } from '../core/scenes.js';
import { sunTimes, clockIn } from '../core/sun.js';
import { skyArt } from '../core/art.js';
import { mountContact } from '../core/contact.js';
import { foundEgg } from '../core/eggs.js';
import { site } from '../../../content/site.js';
import { projects, CATEGORIES, STATUS, coursework } from '../../../content/projects.js';
import { extracurriculars } from '../../../content/extracurriculars.js';
import { skillGroups, learningNow } from '../../../content/skills.js';
import { books } from '../../../content/books.js';

const ids = CHAPTERS.map((c) => c.id);
const sky = boot({ page: 'home', sky: ids });
const ph = (x) => (x.placeholder ? ' <span class="badge-placeholder">Placeholder</span>' : '');
const todo = (s = '') => (s.startsWith('TODO') ? `<span class="todo">${esc(s)}</span>` : esc(s));

// ── Content ─────────────────────────────────────────────────────────────────
function fillContent() {
  // Paris
  const words = site.fullName.split(' ');
  const last = words.pop();
  let k = 0;
  const chars = (s, cls = '') => `<span class="${cls}">${[...s].map((c) => `<span class="ch" style="animation-delay:${(k++ * 0.045 + 0.2).toFixed(2)}s">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</span>`;
  $('[data-name]').innerHTML = `<span class="line">${chars(words.join(' '))}</span><span class="line">${chars(last, 'italic')}</span>`;
  $('[data-name]').setAttribute('aria-label', site.fullName);
  $('[data-tagline]').textContent = site.tagline;
  $('[data-bio]').innerHTML = site.bio.map((p) => `<p>${todo(p)}</p>`).join('');
  $('[data-facts]').innerHTML = site.facts.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('');
  $('[data-now]').innerHTML = site.now.map((n) => `<li><span>${esc(n.label)}</span><div>${todo(n.text)}</div></li>`).join('');
  $('[data-interests]').innerHTML = site.interests.map((i) => `<span class="chip">${esc(i)}</span>`).join('');

  // Rome — the academy
  $('[data-college]').textContent = site.college;
  const academic = projects.filter((p) => ['college', 'research', 'hackathon'].includes(p.category));
  $('[data-college-list]').innerHTML = academic.length
    ? academic.map((p) => `<li><a href="${href('work/')}#p/${p.id}">
        <span><b>${esc(p.title)}</b><span class="sub">${esc(CATEGORIES[p.category].label)} · ${esc(p.course || p.subtitle || '')}</span>${ph(p)}</span>
        <span class="chips tags">${(p.tech || []).slice(0, 3).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</span>
        <span class="go" aria-hidden="true">→</span></a></li>`).join('')
    : `<li class="empty">Projects coming soon — add them in content/projects.js.</li>`;
  $('[data-coursework]').innerHTML = coursework.map((c) => `<span class="chip">${c.code && c.code !== 'TODO' ? esc(c.code) + ' · ' : ''}${esc(c.name)}</span>`).join('');

  // Rio — carnival tiles
  const hues = [12, 330, 186, 42, 268, 150];
  $('[data-extras]').innerHTML = extracurriculars.map((x, i) => `<article class="tile reveal" style="--h:${hues[i % hues.length]}">
      <span class="meta">${esc(x.period)} · ${esc(x.kind)}</span><h4>${esc(x.title)}</h4>
      <p>${esc([x.role, x.org].filter(Boolean).join(' · '))}</p><p>${esc(x.summary)}</p>${ph(x)}
      ${x.link ? `<a class="chip" href="${esc(x.link)}" target="_blank" rel="noopener" style="margin-top:auto;align-self:flex-start">More ↗</a>` : ''}</article>`).join('');

  // NYC — skills + hiring + showcase
  const techCount = {};
  projects.forEach((p) => (p.tech || []).forEach((t) => (techCount[t.toLowerCase()] = (techCount[t.toLowerCase()] || 0) + 1)));
  $('[data-skills]').innerHTML = `<p class="kicker">What I work with</p>` + skillGroups.map((g) => `<div class="skill-group"><h4>${esc(g.name)}</h4><div class="skill-list">${g.skills.map((s) => {
    if (s.startsWith('TODO')) return `<span class="skill todo">${esc(s)}</span>`;
    const n = techCount[s.toLowerCase()];
    return n ? `<a class="skill" href="${href('work/')}?q=${encodeURIComponent(s)}" title="Used in ${n} project${n > 1 ? 's' : ''}">${esc(s)}<sup class="meta"> ${n}</sup></a>` : `<span class="skill">${esc(s)}</span>`;
  }).join('')}</div></div>`).join('') + (learningNow.length ? `<p class="meta" style="margin-top:14px">Currently learning: ${learningNow.map((l) => todo(l)).join(' · ')}</p>` : '');

  const hi = site.hiring;
  const socials = site.socials.filter((s) => s.url);
  $('[data-hire]').innerHTML = `<span class="status">${hi.open ? 'Available' : 'Not looking right now'}</span>
    <h4>${todo(hi.headline)}</h4><ul>${hi.lookingFor.map((l) => `<li>${todo(l)}</li>`).join('')}</ul>${hi.note ? `<p>${esc(hi.note)}</p>` : ''}
    <div class="row">${hi.resume ? `<a class="btn primary" href="${href(hi.resume)}" download>Résumé ⇩</a>` : `<span class="meta">Résumé: add a PDF path in content/site.js</span>`}
      <a class="btn" href="#contact">Get in touch</a></div>
    ${socials.length ? `<div class="row" style="margin-top:12px">${socials.map((s) => `<a class="chip" href="${esc(s.url)}" target="_blank" rel="noopener me">${esc(s.label)} ↗</a>`).join('')}</div>` : ''}`;

  const featured = projects.filter((p) => p.featured);
  $('[data-featured]').innerHTML = featured.map((p) => `<a class="show reveal glow" href="${href('work/')}#p/${p.id}">
      <span class="art">${p.image ? `<img src="${esc(href(p.image))}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : skyArt(p.id)}</span>
      <span class="body"><span class="meta">${esc(CATEGORIES[p.category]?.label)} · ${esc(STATUS[p.status] || '')} · ${esc(String(p.year))}</span><b>${esc(p.title)}</b><p>${esc(p.summary)}</p>${ph(p)}
      <span class="chips">${(p.tech || []).slice(0, 4).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</span></span></a>`).join('')
    + `<a class="show reveal" href="${href('work/')}" style="justify-content:center;align-items:center;min-height:200px"><b>The full logbook →</b><span class="meta">${projects.length} entries</span></a>`;

  // Arctic — covers + contact
  $('[data-covers]').innerHTML = books.slice(0, 5).map((b, i) => `<img src="https://covers.openlibrary.org/b/isbn/${b.isbn}-S.jpg" alt="" loading="lazy" style="--r:${(i - 2) * 5}deg" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'fake'}))">`).join('');
  mountContact($('[data-contact]'));
}

// ── Landscapes + scroll-driven journey ──────────────────────────────────────
const world = $('.world');
world.innerHTML = ids.map((id) => `<div class="scene-art" data-scene="${id}">${SCENES[id]()}</div>`).join('');
const arts = $$('.scene-art', world);
const artLayers = arts.map((a) => $$('.layer', a).map((l) => [l, +l.dataset.depth]));
const sections = ids.map((id) => document.getElementById(id));
const reduced = reducedMotion();
let mouse = [0, 0];
if (canHover()) addEventListener('pointermove', (e) => (mouse = [e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5]), { passive: true });

let progress = 0;
let local = 0;
function measure() {
  const y = scrollY + innerHeight * 0.55;
  let i = 0;
  while (i < sections.length - 1 && sections[i + 1].offsetTop <= y) i++;
  const s = sections[i];
  const frac = clamp((y - s.offsetTop) / s.offsetHeight);
  local = frac;
  progress = i + (i < sections.length - 1 ? smooth(clamp((frac - 0.7) / 0.3)) : 0);
}

function paint() {
  arts.forEach((art, i) => {
    const d = progress - i;
    const ad = Math.abs(d);
    const vis = ad < 1;
    art.style.visibility = vis ? 'visible' : 'hidden';
    art.classList.toggle('active', ad < 0.5);
    if (!vis) return;
    art.style.opacity = clamp(1 - ad * 1.6);
    art.style.transform = `translate3d(0, ${(ad * 40).toFixed(2)}%, 0)`;
    if (reduced) return;
    artLayers[i].forEach(([l, depth]) => {
      l.style.transform = `translate3d(${(-mouse[0] * depth * 26).toFixed(1)}px, ${((local - 0.5) * depth * -30 + mouse[1] * depth * -8).toFixed(1)}px, 0)`;
    });
  });
  sky.setProgress(progress);
}

// ── Flight path + city clock + passport ─────────────────────────────────────
const flight = $('[data-flight]');
flight.innerHTML = CHAPTERS.map((c) => `<li><a href="#${c.id}" data-to="${c.id}"><span class="lbl">${c.n} · ${esc(c.city)}</span><span class="pin"></span></a></li>`).join('') + '<span class="plane-ic" aria-hidden="true">✈</span>';
const pins = $$('a', flight);
const planeIc = $('.plane-ic', flight);
let stamps = new Set(store.get('stamps', []));
let current = -1;

function updateNav() {
  const i = Math.round(progress);
  if (planeIc && pins[0]) {
    const a = pins[0].offsetTop;
    const b = pins[pins.length - 1].offsetTop;
    planeIc.style.transform = `translateY(${(a + ((b - a) * progress) / (pins.length - 1)).toFixed(1)}px) rotate(90deg)`;
  }
  if (i === current) return;
  current = i;
  pins.forEach((p, k) => (k === i ? p.setAttribute('aria-current', 'step') : p.removeAttribute('aria-current')));
  if (!stamps.has(ids[i])) {
    stamps.add(ids[i]);
    store.set('stamps', [...stamps]);
    if (stamps.size === ids.length) foundEgg('passport', 'Passport complete — you’ve seen every sunset on this site.');
  }
  pins.forEach((p, k) => p.classList.toggle('stamped', stamps.has(ids[k])));
  renderClock();
}

function renderClock() {
  const c = CHAPTERS[Math.max(0, current)];
  const s = sections[Math.max(0, current)].dataset;
  const now = new Date();
  const t = sunTimes(now, +s.lat, +s.lon);
  let sun = '';
  if (t.polar === 'night') sun = 'Polar night — no sunrise today';
  else if (t.polar === 'day') sun = 'Midnight sun — no sunset today';
  else {
    const mins = Math.round((t.sunset - now) / 60000);
    sun = `Sunset ${clockIn(s.tz, t.sunset)}` + (mins > 0 && mins < 60 ? ` · golden hour now` : mins > 0 && mins < 600 ? ` · in ${Math.floor(mins / 60)}h ${mins % 60}m` : '');
  }
  $('[data-clock]').innerHTML = `<b>${esc(c.city)}</b> · ${clockIn(s.tz, now)} local<br>${esc(sun)}<br><span class="stamps-row">Passport ${'●'.repeat(stamps.size)}${'○'.repeat(ids.length - stamps.size)}</span>`;
}

// chapter kickers get live local time
function renderKickers() {
  sections.forEach((s, i) => {
    const el = $('[data-chapter-meta]', s);
    if (el) el.textContent = `Chapter ${CHAPTERS[i].n} · ${CHAPTERS[i].city} · ${clockIn(s.dataset.tz)}`;
  });
}

// ── Sun scrubber ────────────────────────────────────────────────────────────
$('.sun-scrub input').addEventListener('input', (e) => sky.setShift(e.target.value / 100));

// ── Go ──────────────────────────────────────────────────────────────────────
fillContent();
revealOnScroll();
let ticking = false;
const frame = () => {
  measure();
  paint();
  updateNav();
  ticking = false;
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
addEventListener('resize', frame, { passive: true });
if (!reduced && canHover()) {
  const loop = () => { paint(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
frame();
renderKickers();
setInterval(() => { renderKickers(); renderClock(); }, 30000);
