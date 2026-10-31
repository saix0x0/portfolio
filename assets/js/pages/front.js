// ─────────────────────────────────────────────────────────────────────────────
//  FRONT PAGE — renders every section from content/*.js, then runs the motion:
//  the opening construction lines, split-text reveals, one scroll loop that
//  feeds --p (0..1) to each chapter, the pinned project rail, the live Pit
//  Wall, a live window into the hotel, and the pixel dissolve into it.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, href, hash, seeded, clamp, reducedMotion, canHover } from '../core/base.js';
import { skyArt } from '../core/art.js';
import { f1Live, countdown, teamColour } from '../core/f1live.js';
import { clockIn } from '../core/sun.js';
import { site } from '../../../content/site.js';
import { projects, coursework, CATEGORIES, STATUS } from '../../../content/projects.js';
import { extracurriculars } from '../../../content/extracurriculars.js';
import { books } from '../../../content/books.js';
import { drawPerson, LOOKS, playerLook } from '../world/actors.js';

const RM = reducedMotion();
const todo = (s = '') => (String(s).startsWith('TODO') ? `<span class="todo">${esc(s)}</span>` : esc(s));
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

// ── golden construction geometry (shared by the intro and the backgrounds) ──
const PHI = 1.618034;
function construction(svg, w, h, { frame = false, draw = false } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const add = (tag, attrs, delay = 0) => {
    const el = document.createElementNS(ns, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    svg.append(el);
    if (draw) {
      const len = el.getTotalLength ? Math.ceil(el.getTotalLength()) : 2000;
      el.classList.add('draw');
      el.style.setProperty('--len', len);
      el.style.setProperty('--dl', delay + 's');
    }
    return el;
  };
  // golden rectangle, subdivided into squares, with the spiral through them
  let x = 0, y = 0, W = w, H = h;
  const cx = w / 2;
  const cy = h / 2;
  add('rect', { x: 0.5, y: 0.5, width: w - 1, height: h - 1 });
  let dir = 0;
  let path = '';
  for (let i = 0; i < 9; i++) {
    const s = Math.min(W, H);
    let sx = x, sy = y, ax, ay, bx, by;
    if (dir === 0) { sx = x; sy = y; add('line', { x1: x + s, y1: y, x2: x + s, y2: y + H }, i * 0.12); ax = x; ay = y + s; bx = x + s; by = y; x += s; W -= s; }
    else if (dir === 1) { sx = x + W - s; sy = y; add('line', { x1: x, y1: y + s, x2: x + W, y2: y + s }, i * 0.12); ax = x + W - s; ay = y; bx = x + W; by = y + s; y += s; H -= s; }
    else if (dir === 2) { sx = x + W - s; sy = y + H - s; add('line', { x1: x + W - s, y1: y, x2: x + W - s, y2: y + H }, i * 0.12); ax = x + W; ay = y + H - s; bx = x + W - s; by = y + H; W -= s; }
    else { sx = x; sy = y + H - s; add('line', { x1: x, y1: y + H - s, x2: x + W, y2: y + H - s }, i * 0.12); ax = x + s; ay = y + H; bx = x; by = y + H - s; H -= s; }
    path += `${i ? 'L' : 'M'}${ax},${ay} A${s},${s} 0 0 1 ${bx},${by} `;
    dir = (dir + 1) % 4;
    void sx; void sy;
  }
  add('path', { d: path }, 0.4);
  // compass circles and diagonals
  for (const r of [h / 2, h / 2 / PHI, h / 2 / PHI / PHI]) add('circle', { cx, cy, r }, 0.6);
  add('line', { x1: 0, y1: 0, x2: w, y2: h }, 0.8);
  add('line', { x1: w, y1: 0, x2: 0, y2: h }, 0.8);
  for (let k = 1; k < 8; k++) add('line', { x1: cx, y1: cy, x2: cx + Math.cos((k * Math.PI) / 4) * w, y2: cy + Math.sin((k * Math.PI) / 4) * w }, 1);
  if (frame) {
    const fw = h * 0.55;
    const fh = h * 0.72;
    const f = add('rect', { x: cx - fw / 2, y: cy - fh / 2, width: fw, height: fh }, 0.9);
    f.classList.add('frame');
  }
}

// ── opening ─────────────────────────────────────────────────────────────────
function intro() {
  const el = $('[data-intro]');
  let seen = false;
  try { seen = sessionStorage.getItem('front:intro') === '1'; } catch {}
  if (RM || seen || location.hash) return el.classList.add('gone');
  try { sessionStorage.setItem('front:intro', '1'); } catch {}
  const svg = $('.construct', el);
  construction(svg, 1618, 1000, { frame: true, draw: true });
  el.classList.add('run');
  document.documentElement.style.overflow = 'hidden';
  const done = () => {
    if (el.classList.contains('out')) return;
    el.classList.add('out');
    document.documentElement.style.overflow = '';
    setTimeout(() => el.classList.add('gone'), 900);
    $$('.hero [data-split]').forEach((s) => s.classList.add('in'));
  };
  setTimeout(done, 3200);
  el.addEventListener('click', done);
  addEventListener('wheel', done, { once: true, passive: true });
  addEventListener('keydown', done, { once: true });
  addEventListener('touchstart', done, { once: true, passive: true });
}

// ── split text into masked words ────────────────────────────────────────────
function splitWords(root) {
  let i = 0;
  const walk = (node) => {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(part);
          const w = document.createElement('span');
          w.className = 'w';
          w.innerHTML = `<i style="--i:${i++}">${esc(part)}</i>`;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    }
  };
  walk(root);
}

// ── render content ──────────────────────────────────────────────────────────
function render() {
  $('[data-kicker]').innerHTML = `${esc(site.college)} · ${esc(site.degree)}`;
  $('[data-tagline]').textContent = site.tagline;
  $('[data-marquee]').innerHTML = [...site.interests, ...site.interests].map((i) => `<span>${esc(i)}</span>`).join('');

  // II · about — the tagline becomes the statement, its last clause highlighted
  const tag = site.tagline;
  const cut = tag.search(/—|–| - /);
  $('[data-statement]').innerHTML = cut > 0 ? `${esc(tag.slice(0, cut))}<span class="hl">${esc(tag.slice(cut))}</span>` : esc(tag);
  $('[data-bio]').innerHTML = site.bio.map((p) => `<p>${todo(p)}</p>`).join('');
  $('[data-facts]').innerHTML = site.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${todo(v)}</dd></div>`).join('');
  $('[data-now]').innerHTML = site.now.map((n) => `<li><b>${esc(n.label)}</b><span>${todo(n.text)}</span></li>`).join('');

  // III · work rail
  const list = [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.year - a.year);
  $('[data-work-count]').textContent = `${String(list.length).padStart(2, '0')} projects · scroll sideways`;
  $('[data-track]').innerHTML = list.map((p, i) => {
    const [first, ...rest] = p.title.split(' ');
    return `<a class="pcard" href="${href('work/')}#p/${esc(p.id)}" style="--r:${((hash(p.id) % 5) - 2) * 0.6}">
      <span class="art">${p.image ? `<img src="${esc(href(p.image))}" alt="" loading="lazy">` : skyArt(p.id, { w: 480, h: 360 })}<span class="num">${String(i + 1).padStart(2, '0')} / ${esc(CATEGORIES[p.category]?.label || '')}</span>${p.placeholder ? '<span class="badge">Placeholder</span>' : ''}</span>
      <h3>${esc(first)} ${rest.length ? `<em>${esc(rest.join(' '))}</em>` : ''}</h3>
      <p>${esc(p.summary || '')}</p>
      <span class="meta">${[STATUS[p.status], p.period, ...(p.tech || []).slice(0, 3)].filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('')}</span>
    </a>`;
  }).join('') + `<a class="pcard end" href="${href('work/')}"><span class="kicker">The logbook</span><b>Every project, searchable.</b><span class="link-arrow">Open the logbook <span aria-hidden="true">→</span></span></a>`;

  // IV · academy ledger
  $('[data-college-lede]').textContent = `${site.degree} at ${site.college}. Course projects, research and things built against the clock.`;
  const acad = projects.filter((p) => ['college', 'research', 'hackathon'].includes(p.category));
  $('[data-ledger]').innerHTML = acad.map((p, i) => `<li><a href="${href('work/')}#p/${esc(p.id)}" data-art="${esc(p.id)}">
    <span class="n">${String(i + 1).padStart(2, '0')}</span>
    <span><b>${esc(p.title)}</b>${p.placeholder ? '<span class="ph">placeholder</span>' : ''}</span>
    <span class="c">${esc(p.course && !p.course.startsWith('TODO') ? p.course : CATEGORIES[p.category].label)}</span>
    <span class="y">${esc(p.year)}</span></a></li>`).join('');
  $('[data-coursework]').innerHTML = coursework.map((c) => `<span>${esc(c.name)}</span>`).join('');

  // V · off-screen
  $('[data-extras]').innerHTML = extracurriculars.map((x) => `<li><b>${esc(x.title)}${x.placeholder ? '<span class="ph">placeholder</span>' : ''}</b><span>${esc([x.role, x.org, x.period].filter(Boolean).join(' · '))}</span></li>`).join('');
  $('[data-covers]').innerHTML = books.slice(0, 6).map((b, i) => `<img src="https://covers.openlibrary.org/b/isbn/${esc(b.isbn)}-M.jpg" alt="${esc(b.title)}" title="${esc(b.title)}" loading="lazy" style="--r:${(i - 2.5) * 4}deg" onerror="this.replaceWith(Object.assign(document.createElement('span'),{title:this.title,style:this.getAttribute('style')}))">`).join('');

  // VII · contact
  const h = site.hiring;
  $('[data-hire]').innerHTML = `<h3>${todo(h.headline)}</h3><ul>${h.lookingFor.map((l) => `<li>${todo(l)}</li>`).join('')}</ul>
    <div class="row">${h.resume ? `<a class="btn ink mag" href="${href(h.resume)}" download>Résumé <span aria-hidden="true">⇩</span></a>` : ''}<a class="btn line mag" href="${href('work/')}">All projects</a></div>`;
  const reach = [['Email', site.email ? `mailto:${site.email}` : '', site.email], ...site.socials.map((s) => [s.label, s.url, s.url.replace(/^https?:\/\/(www\.)?/, '')])];
  $('[data-reach]').innerHTML = `<ul class="reach-list">${reach.map(([n, u, v]) => (u ? `<li><a href="${esc(u)}" ${u.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(n)} <em>${esc(v)} ↗</em></a></li>` : `<li><span>${esc(n)} <em>not set yet</em></span></li>`)).join('')}</ul>`;
  if (site.email) $('[data-say]').href = `mailto:${site.email}`;
  $('[data-foot-name]').textContent = site.fullName;
  $('[data-year]').textContent = `© ${new Date().getFullYear()}`;
}

// ── torn paper edges: a different jagged tear for every parchment section ──
function tears() {
  $$('.paper').forEach((el, k) => {
    const r = seeded(hash(el.id) + k);
    const edge = (flip) => {
      const pts = [];
      let y = 50;
      for (let x = 0; x <= 100; x += 0.8 + r() * 1.6) {
        y = Math.max(18, Math.min(82, y + (r() - 0.5) * 22));
        pts.push(`${x.toFixed(2)}% ${(flip ? 100 - y : y).toFixed(1)}%`);
      }
      pts.push(`100% ${flip ? 100 - y : y}%`);
      return flip ? `polygon(0 0, 100% 0, ${pts.reverse().join(', ')})` : `polygon(0 100%, ${pts.join(', ')}, 100% 100%)`;
    };
    el.style.setProperty('--tear-top', edge(false));
    el.style.setProperty('--tear-bot', edge(true));
  });
}

// ── chapter index ───────────────────────────────────────────────────────────
function chapterIndex() {
  const nav = $('[data-index]');
  const secs = $$('[data-chapter]');
  nav.innerHTML = secs.map((s) => `<a href="#${s.id}"><span>${esc(s.dataset.title)}</span><span>${s.dataset.chapter}</span></a>`).join('');
  const links = $$('a', nav);
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const i = secs.indexOf(e.target);
    links.forEach((l, k) => l.classList.toggle('on', k === i));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => io.observe(s));
}

// ── reveals ─────────────────────────────────────────────────────────────────
function reveals() {
  $$('[data-split]').forEach(splitWords);
  $$('.about-grid > *, .ledger li, .card, .hotel-copy > *, .contact-grid > *, .chips, .row').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--d', (i % 4) * 90 + 'ms');
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add('in'), io.unobserve(e.target);
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('[data-split], .reveal, .statement, .say, .pitwall').forEach((el) => {
    if (el.closest('.hero') && $('[data-intro]:not(.gone)')) return; // the intro reveals the hero
    io.observe(el);
  });
}

// ── one scroll loop → --p on every chapter, the work rail, the top bar ──────
function scrollMotion() {
  const bar = $('[data-bar]');
  const hero = $('.hero');
  const plates = $$('[data-plate]');
  const about = $('.about');
  const hotel = $('.hotel');
  const rail = $('[data-rail]');
  const track = $('[data-track]');
  const papers = $$('.paper');
  let lastY = scrollY;
  let railW = 0;
  const sizeRail = () => {
    const wide = matchMedia('(min-width: 961px)').matches && !RM;
    railW = wide ? Math.max(0, track.scrollWidth - innerWidth) : 0;
    rail.style.height = wide ? `${innerHeight + railW}px` : '';
  };
  sizeRail();
  addEventListener('resize', sizeRail);
  const prog = (el, mode = 'through') => {
    const r = el.getBoundingClientRect();
    return mode === 'pin' ? clamp(-r.top / Math.max(1, r.height - innerHeight)) : clamp((innerHeight - r.top) / (innerHeight + r.height));
  };
  const tick = () => {
    const y = scrollY;
    bar.classList.toggle('scrolled', y > 40);
    // ink-on-paper when the bar sits over a parchment chapter
    bar.classList.toggle('on-paper', papers.some((p) => { const r = p.getBoundingClientRect(); return r.top < 34 && r.bottom > 34; }));
    bar.classList.toggle('hide', y > lastY + 4 && y > innerHeight * 0.8);
    if (y < lastY - 4) bar.classList.remove('hide');
    lastY = y;
    hero.style.setProperty('--p', clamp(y / innerHeight).toFixed(4));
    for (const pl of plates) pl.style.setProperty('--p', prog(pl, 'pin').toFixed(4));
    about.style.setProperty('--p', prog(about).toFixed(4));
    hotel.style.setProperty('--p', prog(hotel).toFixed(4));
    if (railW) track.style.transform = `translate3d(${(-prog(rail, 'pin') * railW).toFixed(1)}px,0,0)`;
  };
  // driven by scroll events (no idle loop); one frame of batching per event burst
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => ((queued = false), tick()));
    setTimeout(() => queued && ((queued = false), tick()), 80); // hidden tabs pause rAF
  };
  if (!RM) {
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    tick();
  } else for (const pl of plates) pl.style.setProperty('--p', 1);
}

// ── hero sky: stars, four-point sparkles, a sunset glow on the horizon ──────
function heroSky() {
  const cv = $('.hero .sky');
  const c = cv.getContext('2d');
  const r = seeded(7);
  const stars = Array.from({ length: 260 }, () => ({ x: r(), y: r() ** 1.4, s: r() < 0.08 ? 2 : 1, tw: r() * 6.28, d: 0.2 + r() * 0.8 }));
  const sparks = Array.from({ length: 9 }, () => ({ x: r(), y: r() * 0.8, k: 6 + r() * 14, tw: r() * 6.28 }));
  let w = 0, h = 0, mx = 0, my = 0, run = true;
  const size = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);
  addEventListener('pointermove', (e) => ((mx = e.clientX / innerWidth - 0.5), (my = e.clientY / innerHeight - 0.5)), { passive: true });
  new IntersectionObserver(([e]) => (run = e.isIntersecting)).observe(cv);
  const frame = (t) => {
    requestAnimationFrame(frame);
    if (!run && !RM) return;
    t /= 1000;
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#07060d');
    g.addColorStop(0.55, '#110c24');
    g.addColorStop(0.85, '#3a1638');
    g.addColorStop(1, '#8a3a3a');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    const sun = c.createRadialGradient(w * 0.72, h * 1.08, 0, w * 0.72, h * 1.08, h * 0.7);
    sun.addColorStop(0, 'rgba(255,170,90,0.55)');
    sun.addColorStop(0.4, 'rgba(255,90,138,0.18)');
    sun.addColorStop(1, 'rgba(138,106,255,0)');
    c.fillStyle = sun;
    c.fillRect(0, 0, w, h);
    for (const s of stars) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 + s.tw)) * (1 - s.y * 0.7);
      c.fillStyle = `rgba(255,246,230,${RM ? 0.7 : a})`;
      c.fillRect(s.x * w - mx * 20 * s.d, s.y * h * 0.9 - my * 14 * s.d, s.s, s.s);
    }
    for (const s of sparks) {
      const k = s.k * (0.6 + 0.4 * Math.sin(t * 1.1 + s.tw));
      const x = s.x * w - mx * 34;
      const y = s.y * h - my * 24;
      c.fillStyle = 'rgba(255,240,210,0.9)';
      c.beginPath();
      c.moveTo(x, y - k); c.quadraticCurveTo(x, y, x + k * 0.35, y);
      c.quadraticCurveTo(x, y, x, y + k); c.quadraticCurveTo(x, y, x - k * 0.35, y);
      c.quadraticCurveTo(x, y, x, y - k);
      c.fill();
      c.fillRect(x - k * 0.6, y - 0.5, k * 1.2, 1);
    }
    if (RM) run = false;
  };
  requestAnimationFrame(frame);
  construction($('.hero-geo'), 1000, 618, { draw: !RM });
  $('.hero-geo').setAttribute('viewBox', '0 0 1000 618');
  construction($('.about .geo-bg'), 1000, 618);
  $('.about .geo-bg').setAttribute('viewBox', '0 0 1000 618');
}

// ── the pixel buddy: you, waving from the hero (click for hints) ────────────
function buddy() {
  const fig = $('.buddy');
  const cv = $('canvas', fig);
  cv.width = 60;
  cv.height = 60;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  let look = LOOKS.player;
  try { look = playerLook(JSON.parse(localStorage.getItem('hotel:v1'))?.flags?.look); } catch {}
  const LINES = [
    'Psst. There’s a whole hotel behind this page. ▸',
    'I’m the pixel version. Same taste in music, less sleep.',
    'The penthouse is private. Everything else is open to explore.',
    'Seven rubber ducks are hiding in the hotel. Just saying.',
    'The pit wall in there is live. Real standings, this season.',
  ];
  let n = 0;
  const bubble = $('[data-bubble]');
  const say = () => {
    bubble.hidden = false;
    bubble.textContent = LINES[n++ % LINES.length];
    clearTimeout(say.t);
    say.t = setTimeout(() => (bubble.hidden = true), 4200);
  };
  fig.addEventListener('click', say);
  setTimeout(say, RM ? 600 : 3400);
  // the hotel-pill avatar uses the same sprite
  const mini = document.createElement('canvas');
  mini.width = 20;
  mini.height = 26;
  drawPerson(mini.getContext('2d'), 10, 25, look, 1, 0, false, false, 0);
  $$('.px-avatar').forEach((s) => (s.style.backgroundImage = `url(${mini.toDataURL()})`));
  // tiny orbiting pixel things
  const items = [
    (x, y) => { c.fillStyle = '#ffd23a'; c.fillRect(x - 3, y - 2, 6, 4); c.fillRect(x + 1, y - 5, 3, 3); c.fillStyle = '#ff8a3a'; c.fillRect(x + 4, y - 4, 2, 1); }, // duck
    (x, y) => { c.fillStyle = '#ff8000'; c.fillRect(x - 3, y - 3, 6, 5); c.fillStyle = '#141418'; c.fillRect(x - 1, y - 2, 4, 2); }, // helmet
    (x, y) => { c.fillStyle = '#3a7ad8'; c.fillRect(x - 3, y - 4, 5, 7); c.fillStyle = '#f0e8d8'; c.fillRect(x + 2, y - 4, 1, 7); }, // book
    (x, y) => { c.fillStyle = '#f4f0e8'; c.fillRect(x - 2, y - 2, 4, 4); c.fillStyle = '#6a3a1a'; c.fillRect(x - 2, y - 2, 4, 1); c.fillStyle = '#f4f0e8'; c.fillRect(x + 2, y - 1, 1, 2); }, // coffee
  ];
  let px = 0, py = 0;
  addEventListener('pointermove', (e) => {
    px = (e.clientX / innerWidth - 0.5) * 2;
    py = (e.clientY / innerHeight - 0.5) * 2;
    fig.style.setProperty('--bx', (px * -10).toFixed(1));
    fig.style.setProperty('--by', (py * -8).toFixed(1));
  }, { passive: true });
  const frame = (t) => {
    t /= 1000;
    c.clearRect(0, 0, 60, 60);
    // an isometric tile to stand on
    c.fillStyle = '#2a2048';
    for (let i = 0; i < 9; i++) c.fillRect(30 - 18 + i * 2, 49 - i, 36 - i * 4 > 0 ? 36 - i * 4 : 0, 1);
    for (let i = 0; i < 9; i++) c.fillRect(30 - 18 + i * 2, 49 + i, 36 - i * 4 > 0 ? 36 - i * 4 : 0, 1);
    c.fillStyle = '#3dffb0';
    c.fillRect(12, 49, 1, 1); c.fillRect(47, 49, 1, 1);
    items.forEach((draw, i) => {
      const a = t * 0.6 + (i * Math.PI) / 2;
      const x = 30 + Math.cos(a) * 22;
      const y = 30 + Math.sin(a) * 7 - 8;
      if (Math.sin(a) < 0) draw(Math.round(x), Math.round(y));
    });
    drawPerson(c, 30, 50, look, px < -0.2 ? -1 : 1, 0, false, false, t, false, { wave: Math.sin(t * 0.9) > 0.55 });
    items.forEach((draw, i) => {
      const a = t * 0.6 + (i * Math.PI) / 2;
      if (Math.sin(a) >= 0) draw(Math.round(30 + Math.cos(a) * 22), Math.round(30 + Math.sin(a) * 7 - 8));
    });
    if (!RM) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ── academy: preview art follows the cursor over the ledger ─────────────────
function hoverArt() {
  if (!canHover()) return;
  const box = $('[data-hover-art]');
  let x = 0, y = 0, tx = 0, ty = 0, on = false;
  $('[data-ledger]').addEventListener('pointerover', (e) => {
    const a = e.target.closest('[data-art]');
    if (!a) return;
    box.innerHTML = skyArt(a.dataset.art, { w: 280, h: 210 });
    box.classList.add('on');
    on = true;
  });
  $('[data-ledger]').addEventListener('pointerleave', () => (box.classList.remove('on'), (on = false)));
  addEventListener('pointermove', (e) => ((tx = e.clientX + 170), (ty = e.clientY)), { passive: true });
  const loop = () => {
    x += (tx - x) * 0.15;
    y += (ty - y) * 0.15;
    if (on) box.style.left = x + 'px', (box.style.top = y + 'px');
    requestAnimationFrame(loop);
  };
  loop();
}

// ── V · the live pit wall ───────────────────────────────────────────────────
function pitWall() {
  const card = $('[data-pitwall]');
  const body = $('.pw-body', card);
  f1Live().then((d) => {
    if (!d || !d.last) {
      body.innerHTML = '<p class="muted">The live timing feed didn’t answer. It will try again next visit.</p>';
      return;
    }
    const L = d.last;
    const P = L.results;
    const pod = (i, cls) => (P[i] ? `<div class="${cls}"><b>${esc(P[i].code)}</b><small>${esc(P[i].team)}</small><i>${i + 1}</i></div>` : '<div></div>');
    body.innerHTML = `<p class="pw-race">${esc(L.name)}</p>
      <p class="pw-where">Round ${L.round}/${d.rounds} · ${esc(L.place)} · ${esc(new Date(L.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }))}</p>
      <div class="podium">${pod(1, 'p2')}${pod(0, 'p1')}${pod(2, 'p3')}</div>
      <p class="kicker">${esc(d.season)} drivers’ championship</p>
      <ol class="pw-table">${d.drivers.slice(0, 5).map((r) => `<li><span class="pos">${r.pos}</span><span class="tbar" style="background:${teamColour(r.team)}"></span><span class="code">${esc(r.code)}</span><span>${esc(r.name)}</span><span class="pts">${r.pts}</span></li>`).join('')}</ol>
      ${d.next ? `<div class="pw-next"><small>Next race</small><b>${esc(d.next.name)}</b><span class="cd" data-cd>${esc(countdown(d.next.at))}</span><span>${esc(d.next.place)} · ${esc(new Date(d.next.at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</span></div>` : ''}
      <p class="pw-foot"><span>Live · Jolpica F1 API</span><a href="${href('hotel/')}#pavilion" data-enter-hotel>Full timing in the hotel’s Pavilion ▸</a></p>`;
    if (d.next) setInterval(() => ($('[data-cd]', card).textContent = countdown(d.next.at)), 30000);
  });
}

// ── VI · a live window into the hotel (built only when it comes near) ───────
function hotelWindow() {
  const win = $('[data-hotel-window]');
  const cv = $('canvas', win);
  const chips = $('[data-hotel-floors]');
  let started = false;
  let visible = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !started) (started = true), start();
  }, { rootMargin: '600px 0px' }).observe(win);
  async function start() {
    const [{ buildHotel }, { City }, L] = await Promise.all([import('../world/hotel.js'), import('../world/city.js'), import('../world/layout.js')]);
    const built = buildHotel();
    const city = new City();
    city.setMode('sunset');
    city.fade = 0;
    const vw = 520;
    const vh = 390;
    cv.width = vw;
    cv.height = vh;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    const floors = L.FLOORS.filter((f) => f.status === 'open' || f.id === 'penthouse');
    chips.innerHTML = [...L.FLOORS].reverse().map((f) => `<span data-f="${f.id}" class="${f.id === 'penthouse' ? 'priv' : ''}">${esc(f.n)}</span>`).join('');
    const G = { flags: {}, skyColor: '#ffb347' };
    let k = 0;
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (!visible) return;
      const t = now / 1000;
      // drift slowly from floor to floor, sliding along each one
      k = RM ? 0 : t / 7;
      const i = Math.floor(k) % floors.length;
      const f = floors[i];
      const slide = (k % 1);
      const wx = 160 + slide * 1100;
      const [sx, sy] = L.proj(f, wx, 48);
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
      $$('span', chips).forEach((s) => s.classList.toggle('on', s.dataset.f === f.id));
    };
    requestAnimationFrame(draw);
  }
}

// ── clock ───────────────────────────────────────────────────────────────────
function clock() {
  const el = $('[data-clock]');
  const tick = () => (el.textContent = `${site.college} · ${clockIn('Asia/Kolkata')} IST`);
  tick();
  setInterval(tick, 15000);
}

// ── cursor + magnetic buttons ───────────────────────────────────────────────
function cursor() {
  if (!canHover() || RM) return;
  const cur = $('.cursor');
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('pointermove', (e) => ((tx = e.clientX), (ty = e.clientY)), { passive: true });
  const loop = () => {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    cur.style.transform = `translate(${x}px,${y}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('pointerover', (e) => cur.classList.toggle('big', !!e.target.closest('a, button, .buddy')));
  for (const b of $$('.mag')) {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px');
      b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px');
    });
    b.addEventListener('pointerleave', () => (b.style.setProperty('--mx', '0px'), b.style.setProperty('--my', '0px')));
  }
}

// ── into the hotel: a pixel dissolve, then go ───────────────────────────────
function hotelDoor() {
  const px = $('[data-pixelate]');
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-enter-hotel]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || RM) return;
    e.preventDefault();
    const cols = Math.ceil(innerWidth / 48);
    const rows = Math.ceil(innerHeight / 48);
    px.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const r = seeded(Date.now() % 1000);
    px.innerHTML = Array.from({ length: cols * rows }, () => `<i style="--d:${Math.round(r() * 420)}ms"></i>`).join('');
    requestAnimationFrame(() => px.classList.add('go'));
    setTimeout(() => (location.href = a.href), 720);
  });
  addEventListener('pageshow', () => (px.classList.remove('go'), (px.innerHTML = ''))); // back button
}

render();
tears();
intro();
chapterIndex();
reveals();
scrollMotion();
heroSky();
buddy();
hoverArt();
pitWall();
hotelWindow();
clock();
cursor();
hotelDoor();
