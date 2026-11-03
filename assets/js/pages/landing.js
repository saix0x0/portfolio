// ─────────────────────────────────────────────────────────────────────────────
//  FRONT PAGE (/) — the door to the desk. Renders the tagline, selected work
//  and live GitHub numbers from content/ + core/github.js, and turns
//  "Enter the desk" into one continuous zoom: the framed photo grows to fill
//  the window and the desk (/desk/) picks up from the same image.
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

// ── selected work: featured projects, open-source first ─────────────────────
function cards() {
  const list = projects.filter((p) => p.featured && !p.placeholder && p.repo).slice(0, 3);
  $('[data-cards]').innerHTML = list.map((p) => `<a class="card rv" href="${esc(desk(`browser/p:${p.id}`))}">
    <span class="k">${esc(p.subtitle || CATEGORIES[p.category]?.label || '')}</span>
    <b>${esc(p.title)}</b><p>${esc(clip(p.summary || '', 170))}</p>
    <span class="t">${(p.tech || []).slice(0, 4).map((t) => `<i>${esc(t)}</i>`).join('')}</span>
    <span class="more">Read more →</span></a>`).join('');
}

// ── live GitHub numbers ─────────────────────────────────────────────────────
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
      <div><dt>Last push</dt><dd>${esc(last ? ago(last.pushed) : '—')}<small>${esc(last?.name || '')}</small></dd></div>
      <div><dt>On GitHub since</dt><dd>${esc(new Date(prof.since).getFullYear())}</dd></div>
      <div class="langs"><dt>Code by language</dt><div data-langs><p class="muted">Counting…</p></div></div>`;
    gh.languageTotals().then((pairs) => {
      const total = pairs.reduce((s, [, v]) => s + v, 0);
      if (pairs.length) $('[data-nlang]').textContent = pairs.length;
      const top = pairs.slice(0, 6);
      $('[data-langs]').innerHTML = total ? `<div class="bar-l" role="img" aria-label="${esc(top.map(([l, v]) => `${l} ${Math.round((v / total) * 100)}%`).join(', '))}">${top.map(([l, v]) => `<i style="flex:${v};background:${langColour(l)}"></i>`).join('')}</div>
        <ul class="key">${top.map(([l, v]) => `<li><i style="background:${langColour(l)}"></i>${esc(l)} <span>${((v / total) * 100).toFixed(1)}%</span></li>`).join('')}</ul>` : '';
    }).catch(() => ($('[data-langs]').innerHTML = '<p class="muted">Language breakdown is on <a href="https://github.com/saix0x0" target="_blank" rel="noopener">GitHub</a>.</p>'));
  } catch {
    box.innerHTML = `<p class="muted">GitHub is busy right now. Everything is at <a href="https://github.com/${esc(site.github)}" target="_blank" rel="noopener">github.com/${esc(site.github)}</a>.</p>`;
  }
}

// ── the zoom into the desk ──────────────────────────────────────────────────
function enter(e) {
  const a = e?.target.closest?.('[data-enter]');
  if (e && (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button)) return;
  e?.preventDefault();
  const url = desk();
  try { sessionStorage.setItem('desk:boot', '1'); } catch {} // the zoom replaces the desk's own intro
  if (RM) return void (location.href = url);
  const img = $('[data-photo]');
  const r = img.getBoundingClientRect();
  const z = img.cloneNode();
  z.className = 'zoomer';
  Object.assign(z.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  document.body.append(z);
  document.body.classList.add('leaving');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    z.classList.add('full');
    Object.assign(z.style, { left: '0px', top: '0px', width: '100vw', height: '100vh' });
  }));
  setTimeout(() => (location.href = url), 780);
}
addEventListener('pageshow', () => { $$('.zoomer').forEach((z) => z.remove()); document.body.classList.remove('leaving'); });

// ── small motion: tilt the photo, spotlight the cards, reveal on scroll ─────
function motion() {
  if (!RM && canHover()) {
    const f = $('[data-tilt]');
    f.parentElement.addEventListener('pointermove', (e) => {
      const r = f.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      f.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
      f.style.setProperty('--rx', `${(0.5 - y) * 5}deg`);
      f.style.setProperty('--gx', `${x * 100}%`);
      f.style.setProperty('--gy', `${y * 100}%`);
    });
    f.parentElement.addEventListener('pointerleave', () => (f.style.setProperty('--rx', '0deg'), f.style.setProperty('--ry', '0deg')));
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest?.('.card');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
  const els = $$('.rv, .sec-h, .gh, .reach > *');
  if (RM || !('IntersectionObserver' in window)) return els.forEach((x) => x.classList.add('in'));
  els.forEach((x) => x.classList.add('rv'));
  const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && (en.target.classList.add('in'), io.unobserve(en.target))), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((x) => io.observe(x));
}

words();
cards();
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
