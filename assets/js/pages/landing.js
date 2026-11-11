// ─────────────────────────────────────────────────────────────────────────────
//  FRONT PAGE (/): black water and dot-matrix type.
//  · the pool: the whole background is a field of dots that ripples like
//    water under the pointer (front/pool.js)
//  · the name: set in a dot font whose dots swell near the pointer
//  · about: who and where, the numbers at a glance, and four things off the
//    clock, each beside a painting printed in dots (front/halftone.js)
//  · projects: cards that stack as you scroll; each opens into a case page
//    with the live README (#p/<id> is its URL; Back closes it)
//  · the toolkit, live GitHub (a hundred-dot waffle of languages and the
//    latest pushes), contact, and a footer that weighs the page it's on
//  `html.pin` (wide screen, motion allowed) turns on the stacking cards.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, href, reducedMotion, canHover, copy, clamp } from '../core/base.js';
import { gh, ago, langColour, cleanReadme } from '../core/github.js';
import { clockIn } from '../core/sun.js';
import { palette } from '../core/palette.js';
import { pool } from '../front/pool.js';
import { halftone } from '../front/halftone.js';
import { site } from '../../../content/site.js';
import { projects, CATEGORIES, STATUS } from '../../../content/projects.js';
import { skillGroups } from '../../../content/skills.js';

const RM = reducedMotion();
const ROOT = document.documentElement;
const clip = (s, n) => (s.length > n ? `${s.slice(0, s.lastIndexOf(' ', n))}…` : s);

// projects with a repo first (featured first), then the rest; the stack shows four
const ALL = projects.filter((p) => !p.placeholder).sort((a, b) => (b.repo ? 2 : 0) + (b.featured ? 1 : 0) - ((a.repo ? 2 : 0) + (a.featured ? 1 : 0)));
const HUNG = ALL.filter((p) => p.repo).slice(0, 4);

// each project's own glow behind its screenshot
const GLOW = { 'med-assistant': '#c2442a', greeniq: '#2f8a5f', 'chess-learning-bot': '#4a4fc4', mapp: '#d9661f', 'this-website': '#ff5f1f' };
const glowOf = (p) => GLOW[p.id] || '#8a8a8a';
const initials = (t) => t.split(/\s+/).map((w) => w[0]).join('').slice(0, 3);
const field = (p, cls = '') => {
  const s = p.shot;
  const inner = s ? `<img src="${esc(href(s.src))}" width="${s.w}" height="${s.h}" alt="" loading="lazy" decoding="async">` : `<b>${esc(initials(p.title))}</b>`;
  return `<span class="field ${cls}${s ? ' shot' : ''}" style="--g:${glowOf(p)}" aria-hidden="true">${inner}</span>`;
};
const status = (p) => `<span class="st${p.status === 'in-progress' ? ' wip' : ''}"><i></i>${esc(STATUS[p.status] || '')}</span>`;
const no = (i) => String(i + 1).padStart(2, '0');

function toast(msg) {
  const t = $('[data-toast]');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('on'), 2400);
}

// ── words from content/ ─────────────────────────────────────────────────────
function words() {
  $('[data-tagline]').textContent = site.tagline;
  $('[data-email]').textContent = site.email;
  $('[data-mailto]').href = `mailto:${site.email}`;
  $$('[data-year]').forEach((y) => (y.textContent = new Date().getFullYear()));
  if (site.resume) Object.assign($('[data-resume]'), { href: href(site.resume), hidden: false });
  $('[data-copy]').addEventListener('click', async () => {
    const ok = await copy(site.email);
    $('[data-copied]').textContent = ok ? 'Copied' : 'Copy';
    toast(ok ? 'Copied. Looking forward to your message.' : site.email);
    setTimeout(() => ($('[data-copied]').textContent = 'Copy'), 2000);
  });
}

// ── the front: the clock, and a name whose dots swell near the pointer ──────
function hero() {
  const c = $('[data-clock]');
  const tick = () => (c.textContent = `${clockIn('Asia/Kolkata')} IST`);
  tick();
  setInterval(tick, 15000);

  const name = $('[data-name]');
  let k = 0;
  for (const ln of $$('.ln', name)) {
    ln.setAttribute('aria-hidden', 'true');
    // each word kept whole, so a narrow screen breaks between words, never inside one
    ln.innerHTML = ln.textContent.split(' ').map((w) => `<span class="wd">${[...w].map((ch) => `<span class="ch" style="--i:${k++}">${esc(ch)}</span>`).join('')}</span>`).join(' ');
  }
  if (RM || !canHover()) return;
  const chs = $$('.ch', name);
  let raf = 0, x = 0, y = 0;
  const paint = () => {
    raf = 0;
    for (const ch of chs) {
      const r = ch.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
      ch.style.fontWeight = Math.round(260 + 640 * Math.exp(-((d / 210) ** 2)));
    }
  };
  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!raf && name.getBoundingClientRect().bottom > 0) raf = requestAnimationFrame(paint);
  }, { passive: true });
  name.classList.add('live');
}

// ── about: who and where, at a glance, off the clock ────────────────────────
function about() {
  $('[data-about]').textContent = site.about;
  const sc = site.school;
  const a = $('[data-school]');
  a.href = sc.url;
  a.innerHTML = `<span class="kick">Studying at</span><b>${esc(sc.name)}</b><span class="sc-full">${esc(sc.full)}</span>
    <span class="sc-d">${esc(site.degree)}</span><span class="sc-y">${esc(sc.year)} · ${esc(sc.place)}</span><i aria-hidden="true">↗</i>`;
  const real = projects.filter((p) => !p.placeholder);
  const interns = (site.experience || []).filter((x) => /intern/i.test(`${x.kind} ${x.role}`)).length;
  const glance = [
    [real.filter((p) => p.status === 'shipped').length, 'Projects shipped'],
    [real.filter((p) => p.category === 'hackathon').length, 'Hackathon builds'],
    [interns, interns === 1 ? 'Internship' : 'Internships'],
    ['··', 'Public repos on GitHub', 'repos'],
  ];
  $('[data-glance]').innerHTML = glance.map(([v, l, id]) => `<div><dt>${esc(l)}</dt><dd${id ? ` data-g="${id}"` : ''}>${esc(String(v).padStart(2, '0'))}</dd></div>`).join('');
  $('[data-life]').innerHTML = site.life.map((x, i) => `<li class="piece rv" style="--k:${i}">
    <figure class="print" tabindex="0"><div class="plate">
      <img src="${esc(href(x.art.src))}" width="${x.art.w}" height="${x.art.h}" loading="lazy" decoding="async" alt="${esc(`${x.art.name} by ${x.art.by}. ${x.art.alt}`)}"><canvas aria-hidden="true"></canvas></div>
      <figcaption><b>${esc(x.art.by)}</b>, <i>${esc(x.art.name)}</i>, ${esc(x.art.year)}</figcaption></figure>
    <p class="kick">${no(i)} · ${esc(x.k)}</p><h3>${esc(x.title)}</h3><p>${esc(x.line)}</p>${x.link ? `<a class="more" href="${esc(x.link[0].startsWith('#') ? x.link[0] : href(x.link[0]))}">${esc(x.link[1])} →</a>` : ''}</li>`).join('');
  $$('.print').forEach((f) => halftone($('canvas', f), $('img', f), { cell: innerWidth < 700 ? 6 : 7 }));
  const me = $('[data-me]');
  if (me) halftone($('canvas', me), $('img', me), { cell: 5, ink: '#1a0b05', invert: true });
}

// ── the toolkit: every tool in a project, linked to it; then the rest ───────
function kit() {
  const uses = new Map();
  for (const p of ALL) for (const t of p.tech || []) uses.set(t, [...(uses.get(t) || []), p]);
  const rows = [...uses].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  $('[data-used]').innerHTML = rows.map(([t, ps]) => `<li><b>${esc(t)}</b><span class="n">×${ps.length}</span><span>${ps.map((p) => `<a href="#p/${esc(p.id)}" data-open="${esc(p.id)}">${esc(p.title)}</a>`).join('')}</span></li>`).join('');
  const groups = skillGroups.map((g) => [g.name, g.skills.filter((x) => !/^TODO/.test(x) && !uses.has(x))]).filter(([, l]) => l.length);
  $('[data-also]').innerHTML = groups.length ? `<p class="kick">Also in the toolkit</p>${groups.map(([n, l]) => `<div><span>${esc(n)}</span><ul class="chips">${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}` : '';
}

function experience() {
  const list = site.experience || [];
  if (!list.length) return $('#experience').remove();
  $('[data-exp]').innerHTML = list.map((x) => `<li class="rv"><span class="when">${esc(x.period)}</span>
    <div><b>${esc(x.role)}</b><span class="org">${esc(x.org)}${x.kind ? ` · ${esc(x.kind)}` : ''}</span><p>${esc(x.note || '')}</p></div></li>`).join('');
}

// ── the stack of projects ───────────────────────────────────────────────────
function stack() {
  const cards = HUNG.map((p, i) => `<li class="work" style="--k:${i}"><a href="#p/${esc(p.id)}" data-open="${esc(p.id)}">
    <span class="w-txt">
      <span class="wmeta"><span>${no(i)} / ${no(HUNG.length - 1)}</span><span>${esc(p.period || p.year || '')}</span>${status(p)}</span>
      <b class="w-t">${esc(p.title)}</b><span class="sub">${esc(p.subtitle || CATEGORIES[p.category]?.label || '')}</span>
      <span class="w-p">${esc(clip(p.summary || '', 170))}</span>
      <span class="chips">${(p.tech || []).slice(0, 5).map((t) => `<i>${esc(t)}</i>`).join('')}</span>
      <span class="open">Open the project <i aria-hidden="true">→</i></span>
    </span>
    <span class="w-shot"><span class="w-bar" aria-hidden="true">${esc(site.github)}/${esc(p.repo)}</span>${field(p)}</span></a></li>`).join('');
  const end = `<li class="track-end"><a href="https://github.com/${esc(site.github)}" target="_blank" rel="noopener">Everything else is <em>on GitHub</em> ↗</a><small>github.com/${esc(site.github)}</small></li>`;
  $('[data-track]').innerHTML = cards + end;
}

// ── a case: one project, opened ─────────────────────────────────────────────
let caseEl = null;
let caseFrom = null; // the card's screenshot the case grew out of
let pushed = false; // opened by a click here, so Back is the way out
let pending = null;

function caseHTML(p) {
  const i = ALL.indexOf(p);
  const next = ALL[(i + 1) % ALL.length];
  const L = p.links || {};
  let k = 0;
  const fx = () => `class="fx" style="--k:${k++}"`;
  const meta = [
    ['When', esc(p.period || p.year || '')],
    ['Kind', esc(CATEGORIES[p.category]?.label || '')],
    p.role && ['Role', esc(p.role)],
    p.course && ['Course', esc(p.course)],
    ['Built with', `<span class="chips">${(p.tech || []).map((t) => `<i>${esc(t)}</i>`).join('')}</span>`],
  ].filter(Boolean);
  return `<button class="case-x" type="button" data-close aria-label="Close and go back">×</button>
  <div class="case-hero">
    <div class="case-title"><span class="wmeta fx" style="--k:0"><span>${no(i)}</span>${status(p)}</span><h2 class="fx" style="--k:1">${esc(p.title)}</h2><p class="fx" style="--k:2">${esc(p.subtitle || '')}</p></div>
    ${field(p)}</div>
  <div class="case-body">
    <div class="case-main">
      <p class="case-sum fx" style="--k:${k++}">${esc(p.summary || '')}</p>
      ${p.shot ? `<p class="sr">Screenshot: ${esc(p.shot.alt)}</p>` : ''}
      ${p.highlights?.length ? `<div ${fx()}><h3>Highlights</h3><ul class="case-hl">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>` : ''}
      ${p.problem ? `<div ${fx()}><h3>The problem</h3><p>${esc(p.problem)}</p></div>` : ''}
      ${p.solution ? `<div ${fx()}><h3>The approach</h3><p>${esc(p.solution)}</p></div>` : ''}
    </div>
    <div ${fx()}>
      <dl class="case-meta">${meta.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}<div data-live hidden></div></dl>
      <div class="case-links">
        ${L.demo ? `<a class="go" href="${esc(L.demo)}" target="_blank" rel="noopener"><span>Try it live</span><b aria-hidden="true">↗</b></a>` : ''}
        ${L.code ? `<a class="out" href="${esc(L.code)}" target="_blank" rel="noopener">Source on GitHub ↗</a>` : ''}
      </div>
    </div>
  </div>
  ${p.repo ? `<section class="case-readme fx" style="--k:${k++}" aria-label="README"><h3>From the README</h3><div class="prose" data-readme><p class="muted">Reading the README from GitHub…</p></div></section>` : ''}
  <a class="case-next" href="#p/${esc(next.id)}" data-open="${esc(next.id)}"><span><small>Next project</small><b>${esc(next.title)}</b></span><i aria-hidden="true">→</i></a>`;
}

// FLIP: start the case's screenshot exactly over `r`, then let it grow into place
function grow(f, r, back = false) {
  const b = f.getBoundingClientRect();
  const to = `translate(${r.left - b.left}px, ${r.top - b.top}px) scale(${r.width / b.width}, ${r.height / b.height})`;
  f.style.transition = 'none';
  f.style.transform = back ? '' : to;
  f.getBoundingClientRect();
  f.style.transition = 'transform 0.85s cubic-bezier(0.7, 0, 0.2, 1)';
  f.style.transform = back ? to : '';
}

function openCase(id, from) {
  const p = ALL.find((x) => x.id === id);
  if (!p) return;
  const src = from?.querySelector('.field');
  const r = src?.getBoundingClientRect();
  if (caseFrom) caseFrom.style.visibility = '';
  caseFrom = src && from.closest('.work') ? src : $(`.work [data-open="${CSS.escape(id)}"] .field`);
  if (!caseEl) {
    caseEl = document.createElement('div');
    caseEl.className = 'case';
    caseEl.setAttribute('role', 'dialog');
    caseEl.setAttribute('aria-modal', 'true');
    document.body.append(caseEl);
    ROOT.classList.add('locked');
  }
  caseEl.classList.remove('on', 'off');
  caseEl.setAttribute('aria-label', p.title);
  caseEl.innerHTML = caseHTML(p);
  caseEl.scrollTop = 0;
  if (r && !RM) grow($('.case-hero .field', caseEl), r);
  if (caseFrom && src === caseFrom) caseFrom.style.visibility = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => caseEl?.classList.add('on')));
  $('[data-close]', caseEl).focus({ preventScroll: true });
  live(p, caseEl);
}

function closeCase() {
  if (!caseEl) return;
  const el = caseEl;
  const src = caseFrom;
  caseEl = caseFrom = null;
  el.classList.remove('on');
  el.classList.add('off');
  const r = src?.getBoundingClientRect();
  const seen = r && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  if (seen && !RM) el.scrollTop = 0, grow($('.case-hero .field', el), r, true);
  else el.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 0 : 400, fill: 'forwards' });
  setTimeout(() => {
    el.remove();
    if (src) src.style.visibility = '';
    ROOT.classList.remove('locked');
    src?.closest('a')?.focus({ preventScroll: true });
  }, RM ? 0 : seen ? 850 : 410);
}

function leaveCase() {
  if (pushed) return history.back();
  history.replaceState(null, '', location.pathname + location.search);
  closeCase();
}

// the README and repo facts, live from GitHub
async function live(p, el) {
  if (!p.repo) return;
  try {
    const r = await gh.repo(p.repo);
    if (!r || el !== caseEl) return;
    const box = $('[data-live]', el);
    box.innerHTML = `<dt>On GitHub</dt><dd>${r.stars ? `${r.stars} ★ · ` : ''}${esc(r.lang || '')}${r.lang ? ' · ' : ''}updated ${esc(ago(r.pushed))}</dd>`;
    box.hidden = false;
    const html = await gh.readme(p.repo);
    if (el !== caseEl) return;
    $('[data-readme]', el).innerHTML = cleanReadme(html, p.repo, r.branch);
  } catch {
    const box = $('[data-readme]', el);
    if (box) box.innerHTML = `<p class="muted">GitHub is busy right now. The README is at <a href="https://github.com/${esc(site.github)}/${esc(p.repo)}" target="_blank" rel="noopener">github.com/${esc(site.github)}/${esc(p.repo)}</a>.</p>`;
  }
}

function routes() {
  const fromHash = () => decodeURIComponent(location.hash.match(/^#p\/(.+)$/)?.[1] || '');
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-open]');
    if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.button) {
      e.preventDefault();
      if (caseEl) {
        history.replaceState(history.state, '', `#p/${a.dataset.open}`);
        return openCase(a.dataset.open, a);
      }
      pending = a;
      pushed = true;
      location.hash = `p/${a.dataset.open}`;
      return;
    }
    if (e.target.closest('[data-close]')) leaveCase();
  });
  addEventListener('hashchange', () => {
    const id = fromHash();
    if (id) openCase(id, pending);
    else if (caseEl) closeCase(), (pushed = false);
    pending = null;
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && caseEl && !$('.pal')) leaveCase(); });
  const id = fromHash();
  if (id) openCase(id);
}

// ── live GitHub ─────────────────────────────────────────────────────────────
async function github() {
  const box = $('[data-gh]');
  const feed = $('[data-feed]');
  try {
    const [prof, repos] = await Promise.all([gh.profile(), gh.repos()]);
    const langs = new Set(repos.map((r) => r.lang).filter(Boolean)).size;
    $('[data-g="repos"]').textContent = String(prof.repos).padStart(2, '0');
    if (repos[0]) $('[data-push]').innerHTML = `<a href="${esc(repos[0].url)}" target="_blank" rel="noopener">${esc(repos[0].name)}</a>, ${esc(ago(repos[0].pushed))}`;
    box.innerHTML = `<div><dt>Public repos</dt><dd>${prof.repos}</dd></div>
      <div><dt>Languages</dt><dd data-nlang>${langs}</dd></div>
      <div><dt>On GitHub since</dt><dd>${esc(new Date(prof.since).getFullYear())}</dd></div>`;
    feed.innerHTML = repos.slice(0, 6).map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener"><b>${esc(r.name)}</b><span>${esc(clip(r.desc || r.lang || '', 80))}</span></a><small>${r.lang ? `<i style="background:${langColour(r.lang)}"></i>${esc(r.lang)} · ` : ''}${esc(ago(r.pushed))}</small></li>`).join('');
    gh.languageTotals().then((pairs) => {
      if (!pairs.length) return;
      $('[data-nlang]').textContent = pairs.length;
      waffle(pairs);
    }).catch(() => {});
  } catch {
    $('[data-g="repos"]')?.closest('div').remove();
    $('[data-push]')?.closest('li').remove();
    box.innerHTML = `<p class="muted">GitHub is busy right now. Everything is at <a href="https://github.com/${esc(site.github)}" target="_blank" rel="noopener">github.com/${esc(site.github)}</a>.</p>`;
    feed.innerHTML = '';
  }
}

// a hundred dots, one per percent of code, shared out by largest remainder
function waffle(pairs) {
  const total = pairs.reduce((s, [, v]) => s + v, 0);
  const top = pairs.slice(0, 7);
  const rest = total - top.reduce((s, [, v]) => s + v, 0);
  const rows = rest > 0 ? [...top, ['Other', rest]] : top;
  const raw = rows.map(([l, v]) => ({ l, v, n: (v / total) * 100 }));
  raw.forEach((r) => (r.k = Math.floor(r.n)));
  let left = 100 - raw.reduce((s, r) => s + r.k, 0);
  [...raw].sort((a, b) => (b.n - b.k) - (a.n - a.k)).forEach((r) => { if (left > 0) r.k++, left--; });
  const colour = (l) => (l === 'Other' ? '#5a5a5a' : langColour(l));
  const dots = raw.flatMap((r) => Array(r.k).fill(colour(r.l)));
  $('[data-waffle]').innerHTML = dots.map((c, i) => `<i style="--c:${c};--k:${i}"></i>`).join('');
  $('[data-key]').innerHTML = raw.filter((r) => r.k).map((r) => `<li><i style="background:${colour(r.l)}"></i>${esc(r.l)}<span>${r.n.toFixed(1)}%</span></li>`).join('');
}

// ── headings that decode out of noise as they arrive ────────────────────────
const NOISE = '.:+*=#%';
function decode(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  if (RM) return;
  const at = [...text].map(() => Math.random() * 0.75);
  const t0 = performance.now();
  const go = (t) => {
    const p = (t - t0) / 700;
    el.textContent = [...text].map((c, i) => (c === ' ' || p > at[i] + 0.25 ? c : p > at[i] ? NOISE[(Math.random() * NOISE.length) | 0] : ' ')).join('');
    if (p < 1) requestAnimationFrame(go);
    else el.textContent = text;
  };
  requestAnimationFrame(go);
}

// ── motion ──────────────────────────────────────────────────────────────────
function motion() {
  const wide = matchMedia('(min-width: 900px)');
  const bar = $('.bar');
  const prog = $('[data-prog]');
  const links = $$('.bar-m a');
  const rooms = links.map((l) => $(l.getAttribute('href')));
  const cards = $$('.work');
  let pin = false;
  let raf = 0;
  const measure = () => {
    pin = !RM && wide.matches;
    ROOT.classList.toggle('pin', pin);
    if (!pin) cards.forEach((c) => c.style.removeProperty('--p'));
  };
  const frame = () => {
    raf = 0;
    const y = scrollY;
    const H = ROOT.scrollHeight - innerHeight;
    bar.classList.toggle('scrolled', y > 40);
    prog.style.setProperty('--p', (y / Math.max(1, H)).toFixed(4));
    const mid = innerHeight * 0.45;
    links.forEach((l, i) => { const r = rooms[i]?.getBoundingClientRect(); l.classList.toggle('on', !!r && r.top < mid && r.bottom > mid); });
    if (!pin) return;
    // a card sinks back as the next one slides over it
    cards.forEach((c, i) => {
      const n = cards[i + 1];
      if (!n) return;
      const a = c.getBoundingClientRect();
      const b = n.getBoundingClientRect();
      c.style.setProperty('--p', clamp((a.bottom - b.top) / a.height).toFixed(3));
    });
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { measure(); kick(); });
  wide.addEventListener('change', () => { measure(); kick(); });
  measure();
  frame();

  const els = $$('.rv, [data-decode], .work, .waffle');
  if (RM || !('IntersectionObserver' in window)) return els.forEach((x) => (x.classList.add('in'), x.matches('[data-decode]') && decode(x)));
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    if (en.target.matches('[data-decode]')) decode(en.target);
    io.unobserve(en.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  els.forEach((x) => io.observe(x));
}

// ── the footer weighs the page it's on ──────────────────────────────────────
function weigh() {
  addEventListener('load', () => setTimeout(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    if (!nav) return;
    const size = (e) => e.transferSize || e.encodedBodySize || 0;
    const kb = Math.round([nav, ...res].reduce((s, e) => s + size(e), 0) / 1024);
    const s = (nav.loadEventStart / 1000).toFixed(2);
    if (kb > 0) $('[data-weight]').textContent = `This page: ${kb} KB in ${res.length + 1} requests, loaded in ${s} s. Hand-written HTML, CSS and JavaScript. No frameworks, no build step.`;
  }, 300), { once: true });
}

pool($('[data-pool]'), { still: RM });
words();
hero();
about();
kit();
experience();
stack();
motion();
routes();
github();
weigh();
palette({ extra: [
  { t: 'About', k: 'Section', g: '01', run: () => (location.hash = 'about'), x: 'college iiit philosophy art swimming sport' },
  { t: 'Skills', k: 'Section', g: '04', run: () => (location.hash = 'skills'), x: 'toolkit tech stack' },
  { t: 'The desk', k: 'Page', g: '→', run: () => (location.href = href('desk/')), x: 'room terminal browser typing' },
] });
