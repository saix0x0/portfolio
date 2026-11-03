// ─────────────────────────────────────────────────────────────────────────────
//  FRONT PAGE (/): the exhibition. Renders the catalogue (projects), the live
//  GitHub room (numbers plus a Kandinsky-style circle of languages) and the
//  ways into the desk: the framed desk photo zooms to fill the window, and the
//  buttons open the desk through an iris from wherever you clicked.
//  Deliberately light: no world/ or desk/ modules are loaded here.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, href, reducedMotion, canHover, copy } from '../core/base.js';
import { clockIn } from '../core/sun.js';
import { gh, ago, langColour } from '../core/github.js';
import { palette } from '../core/palette.js';
import { site } from '../../../content/site.js';
import { projects, CATEGORIES } from '../../../content/projects.js';

const RM = reducedMotion();
const desk = (r = '') => href(`desk/${r ? `#${r}` : ''}`);
const clip = (s, n) => (s.length > n ? `${s.slice(0, s.lastIndexOf(' ', n))}…` : s);

function toast(msg) {
  const t = $('[data-toast]');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('on'), 2200);
}

// ── words from content/ ─────────────────────────────────────────────────────
function words() {
  $('[data-tagline]').textContent = site.tagline;
  $('[data-email]').textContent = site.email;
  $('[data-year]').textContent = new Date().getFullYear();
  const tick = () => ($('[data-clock]').textContent = `Hyderabad, ${clockIn('Asia/Kolkata')}`);
  tick();
  setInterval(tick, 20000);
  $('[data-copy]').addEventListener('click', async () => {
    const ok = await copy(site.email);
    $('[data-copied]').textContent = ok ? 'Copied' : 'Copy';
    toast(ok ? 'Email copied to your clipboard' : site.email);
    setTimeout(() => ($('[data-copied]').textContent = 'Copy'), 2000);
  });
}

// ── Room I: the catalogue (projects with a repo, featured first) ────────────
function catalogue() {
  const list = projects.filter((p) => !p.placeholder && p.repo).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 4);
  $('[data-cards]').innerHTML = list.map((p, i) => `<li class="rv"><a href="${esc(desk(`browser/p:${p.id}`))}">
    <span class="no">No. ${String(i + 1).padStart(2, '0')}</span><b>${esc(p.title)}</b><span class="yr">${esc(p.period || p.year || '')}</span>
    <span class="sub">${esc(p.subtitle || CATEGORIES[p.category]?.label || '')}</span>
    <p>${esc(clip(p.summary || '', 180))}</p>
    <span class="t">${(p.tech || []).slice(0, 4).map((t) => `<i>${esc(t)}</i>`).join('')}</span></a></li>`).join('');
}

// ── Room II: live GitHub ────────────────────────────────────────────────────
async function github() {
  const box = $('[data-gh]');
  try {
    const [prof, repos] = await Promise.all([gh.profile(), gh.repos()]);
    const last = repos[0];
    if (last) {
      const s = $('[data-push]');
      s.innerHTML = `Last push ${esc(ago(last.pushed))} to <a href="${esc(desk(`browser/r:${last.name}`))}">${esc(last.name)}</a>`;
      s.hidden = false;
    }
    const langs = new Set(repos.map((r) => r.lang).filter(Boolean)).size;
    box.innerHTML = `<div><dt>Public repos</dt><dd>${prof.repos}</dd></div>
      <div><dt>Languages</dt><dd data-nlang>${langs}</dd></div>
      <div><dt>Since</dt><dd>${esc(new Date(prof.since).getFullYear())}</dd></div>`;
    gh.languageTotals().then((pairs) => {
      if (!pairs.length) return;
      $('[data-nlang]').textContent = pairs.length;
      circles(pairs.slice(0, 8));
    }).catch(() => {});
  } catch {
    box.innerHTML = `<p class="muted">GitHub is busy right now. Everything is at <a href="https://github.com/${esc(site.github)}" target="_blank" rel="noopener">github.com/${esc(site.github)}</a>.</p>`;
  }
}

// After Kandinsky's Several Circles: one circle per language, area by bytes,
// packed greedily on a spiral so nothing overlaps.
function circles(pairs) {
  const total = pairs.reduce((s, [, v]) => s + v, 0);
  const W = 800;
  const H = 450;
  const k = Math.sqrt((W * H * 0.2) / Math.PI / total);
  const placed = [];
  for (const [l, v] of pairs) {
    const r = Math.max(10, Math.sqrt(v) * k);
    let x = W * 0.5;
    let y = H * 0.48;
    for (let t = 0; t < 2000; t++) {
      const a = t * 0.35;
      const d = t * 0.9;
      x = W * 0.5 + Math.cos(a) * d * 1.5;
      y = H * 0.48 + Math.sin(a) * d * 0.85;
      if (x - r < 8 || x + r > W - 8 || y - r < 8 || y + r > H - 8) continue;
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y) > p.r + r + 6)) break;
    }
    placed.push({ l, v, r, x, y, c: langColour(l) });
  }
  const dots = Array.from({ length: 14 }, (_, i) => [(i * 137.5) % W, ((i * 89) % H), 2 + (i % 4)]);
  $('[data-circles]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(placed.map((p) => `${p.l} ${Math.round((p.v / total) * 100)}%`).join(', '))}">
    ${dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#efe8d6" opacity=".25"/>`).join('')}
    ${placed.map((p, i) => `<circle class="halo" cx="${p.x}" cy="${p.y}" r="${p.r + 8}" stroke="${p.c}" style="animation-delay:${i * 90}ms"/><circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${p.c}" fill-opacity=".82" style="animation-delay:${i * 90}ms"/>`).join('')}
  </svg>`;
  $('[data-key]').innerHTML = placed.map((p) => `<li><i style="background:${p.c}"></i>${esc(p.l)}<span>${((p.v / total) * 100).toFixed(1)}%</span></li>`).join('');
}

// ── into the desk ───────────────────────────────────────────────────────────
// From the framed photo: the photo itself grows to fill the window.
// From a button: the desk opens through an iris centred on the click.
function enter(e) {
  const a = e?.target.closest?.('[data-enter]');
  if (e && (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button)) return;
  e?.preventDefault();
  const url = desk();
  try { sessionStorage.setItem('desk:boot', '1'); } catch {} // the zoom replaces the desk's own intro
  if (RM) return void (location.href = url);
  const z = document.createElement('img');
  z.src = href('assets/img/desk.jpg');
  z.alt = '';
  document.body.classList.add('leaving');
  const photo = $('[data-photo]');
  const r = photo.getBoundingClientRect();
  const onScreen = r.bottom > 0 && r.top < innerHeight;
  if (a?.dataset.from === 'frame' || (!a && onScreen)) {
    z.className = 'zoomer';
    Object.assign(z.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    document.body.append(z);
    requestAnimationFrame(() => requestAnimationFrame(() => Object.assign(z.style, { left: '0px', top: '0px', width: '100vw', height: '100vh' })));
  } else {
    const b = (a || $('.hero .go')).getBoundingClientRect();
    z.className = 'zoomer iris';
    z.style.setProperty('--cx', `${b.left + b.width / 2}px`);
    z.style.setProperty('--cy', `${b.top + b.height / 2}px`);
    document.body.append(z);
    requestAnimationFrame(() => requestAnimationFrame(() => z.classList.add('full')));
  }
  setTimeout(() => (location.href = url), 860);
}
addEventListener('pageshow', () => { $$('.zoomer').forEach((z) => z.remove()); document.body.classList.remove('leaving'); });

// ── motion: the spotlight, the bar, parallax, reveals ───────────────────────
function motion() {
  const bar = $('.bar');
  const storm = $('[data-par]');
  const links = $$('.bar-m a');
  const rooms = links.map((l) => $(l.getAttribute('href')));
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    bar.classList.toggle('scrolled', scrollY > 40);
    if (storm && !RM) {
      const r = storm.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) storm.style.transform = `translate3d(0, ${((r.top + r.height / 2 - innerHeight / 2) * -0.12).toFixed(1)}px, 0)`;
    }
    const mid = innerHeight * 0.4;
    links.forEach((l, i) => { const r = rooms[i]?.getBoundingClientRect(); l.classList.toggle('on', !!r && r.top < mid && r.bottom > mid); });
  };
  addEventListener('scroll', () => { if (!ticking) (ticking = true), requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();

  // a torch in a dark gallery: the painting is lit where the pointer is
  const art = $('[data-spot]');
  if (!RM && canHover()) {
    art.closest('.hero').addEventListener('pointermove', (e) => {
      const r = art.querySelector('.lit').getBoundingClientRect();
      art.style.setProperty('--sx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      art.style.setProperty('--sy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    });
  }

  // the reel on the framed desk's monitor plays only while it is on screen
  const reel = $('[data-reel]');
  if (reel && !RM && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => (en.isIntersecting ? reel.play().catch(() => {}) : reel.pause()), { threshold: 0.2 }).observe(reel);
  }

  const els = $$('.rv, .room-art, .room-txt > *, .guide li');
  if (RM || !('IntersectionObserver' in window)) return els.forEach((x) => x.classList.add('in'));
  els.forEach((x) => x.classList.add('rv'));
  const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && (en.target.classList.add('in'), io.unobserve(en.target))), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((x) => io.observe(x));
}

words();
catalogue();
motion();
github();
palette();
document.addEventListener('click', enter);
addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.metaKey || e.ctrlKey || document.querySelector('.pal')) return;
  const t = document.activeElement;
  if (t && t !== document.body && t.matches('a, button, input, textarea, select')) return;
  enter();
});
