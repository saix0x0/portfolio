// ─────────────────────────────────────────────────────────────────────────────
//  FRONT PAGE (/): the night gallery.
//  · the portal: scrolling zooms the framed Van Gogh until you are inside it,
//    and a line is read out word by word over the canvas
//  · the corridor: projects hang as colour fields after Rothko and the
//    vertical scroll walks you past them sideways
//  · a case: a project's colour field grows out of its card into a full page
//    with the live README (#p/<id> is its URL; Back closes it)
//  · about: who and where, the numbers at a glance, and four things off the
//    clock, each hung beside a painting
//  · the toolkit: every tool, linked to the projects that use it
//  · the room's light takes its colour from the painting on screen
//  `html.pin` (wide screen, motion allowed) turns the pinned scenes on.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, href, reducedMotion, canHover, copy, clamp } from '../core/base.js';
import { gh, ago, langColour, cleanReadme } from '../core/github.js';
import { palette } from '../core/palette.js';
import { site } from '../../../content/site.js';
import { projects, CATEGORIES, STATUS } from '../../../content/projects.js';
import { skillGroups } from '../../../content/skills.js';

const RM = reducedMotion();
const ROOT = document.documentElement;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clip = (s, n) => (s.length > n ? `${s.slice(0, s.lastIndexOf(' ', n))}…` : s);

// projects with a repo first (featured first), then the rest; the corridor hangs four
const ALL = projects.filter((p) => !p.placeholder).sort((a, b) => (b.repo ? 2 : 0) + (b.featured ? 1 : 0) - ((a.repo ? 2 : 0) + (a.featured ? 1 : 0)));
const HUNG = ALL.filter((p) => p.repo).slice(0, 4);

// each project's colour field: a ground and two soft rectangles, and its
// screenshot hung on that ground when it has one
const FIELDS = {
  'med-assistant': ['#2a0b10', '#a3341f', '#e0803e'],
  greeniq: ['#0b1d16', '#245f45', '#b9a25a'],
  'chess-learning-bot': ['#100f26', '#33348e', '#c89a3e'],
  mapp: ['#24110a', '#bf561c', '#ebb86c'],
  'this-website': ['#0c0d22', '#5e1834', '#c9a45a'],
};
const SPARE = [['#141418', '#4a4f6a', '#9aa3c4'], ['#1c0f1f', '#6b2d5c', '#d08c7a']];
const fieldOf = (p, i) => FIELDS[p.id] || SPARE[i % SPARE.length];
const field = (p, i, cls = '') => {
  const [base, a, b] = fieldOf(p, i);
  const s = p.shot;
  const img = s ? `<img src="${esc(href(s.src))}" width="${s.w}" height="${s.h}" alt="" loading="lazy" decoding="async">` : '';
  return `<span class="field ${cls}${s ? ' shot' : ''}" style="--base:${base};--a:${a};--b:${b}" aria-hidden="true"><i></i><i></i>${img}</span>`;
};
const status = (p) => `<span class="st${p.status === 'in-progress' ? ' wip' : ''}"><i></i>${esc(STATUS[p.status] || '')}</span>`;
const no = (i) => `No. ${String(i + 1).padStart(2, '0')}`;

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
  $('[data-year]').textContent = new Date().getFullYear();
  if (site.resume) Object.assign($('[data-resume]'), { href: href(site.resume), hidden: false });
  $('[data-copy]').addEventListener('click', async () => {
    const ok = await copy(site.email);
    $('[data-copied]').textContent = ok ? 'Copied' : 'Copy';
    toast(ok ? 'Copied. Looking forward to your message.' : site.email);
    setTimeout(() => ($('[data-copied]').textContent = 'Copy'), 2000);
  });
}

// ── about: who and where, at a glance, off the clock ────────────────────────
function about() {
  $('[data-about]').textContent = site.about;
  const sc = site.school;
  const a = $('[data-school]');
  a.href = sc.url;
  a.innerHTML = `<span class="kicker">Studying at</span><b>${esc(sc.name)}</b><span class="sc-full">${esc(sc.full)}</span>
    <span class="sc-d">${esc(site.degree)}<br>${esc(sc.year)} · ${esc(sc.place)}</span><i aria-hidden="true">↗</i>`;
  const real = projects.filter((p) => !p.placeholder);
  const interns = (site.experience || []).filter((x) => /intern/i.test(`${x.kind} ${x.role}`)).length;
  const glance = [
    [real.filter((p) => p.status === 'shipped').length, 'Projects shipped'],
    [real.filter((p) => p.category === 'hackathon').length, 'Hackathon builds'],
    [interns, interns === 1 ? 'Internship' : 'Internships'],
    ['…', 'Public repos on GitHub', 'repos'],
  ];
  $('[data-glance]').innerHTML = glance.map(([v, l, id]) => `<div><dt>${esc(l)}</dt><dd${id ? ` data-g="${id}"` : ''}>${esc(String(v))}</dd></div>`).join('');
  $('[data-life]').innerHTML = site.life.map((x, i) => `<li class="piece" style="--k:${i}">
    <figure class="room-art"><div class="unveil"><div class="gilt"><div class="mat"><img src="${esc(href(x.art.src))}" width="${x.art.w}" height="${x.art.h}" loading="lazy" decoding="async" alt="${esc(`${x.art.name} by ${x.art.by}. ${x.art.alt}`)}"></div></div></div>
      <figcaption class="label"><b>${esc(x.art.by)}</b><span><i>${esc(x.art.name)}</i>, ${esc(x.art.year)}</span><small>${esc(x.art.where)}</small></figcaption></figure>
    <div class="rv"><p class="kicker">${esc(x.k)}</p><h3>${esc(x.title)}</h3><p>${esc(x.line)}</p>${x.link ? `<a class="more" href="${esc(x.link[0].startsWith('#') ? x.link[0] : href(x.link[0]))}">${esc(x.link[1])} →</a>` : ''}</div></li>`).join('');
}

// ── the toolkit: every tool in a project, linked to it; then the rest ───────
function kit() {
  const uses = new Map();
  for (const p of ALL) for (const t of p.tech || []) uses.set(t, [...(uses.get(t) || []), p]);
  const rows = [...uses].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  $('[data-used]').innerHTML = rows.map(([t, ps]) => `<li><b>${esc(t)}</b><span>${ps.map((p) => `<a href="#p/${esc(p.id)}" data-open="${esc(p.id)}">${esc(p.title)}</a>`).join('')}</span></li>`).join('');
  const groups = skillGroups.map((g) => [g.name, g.skills.filter((x) => !/^TODO/.test(x) && !uses.has(x))]).filter(([, l]) => l.length);
  $('[data-also]').innerHTML = groups.length ? `<p class="kicker">Also in the toolkit</p>${groups.map(([n, l]) => `<div><span>${esc(n)}</span><ul class="chips">${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}` : '';
}

function experience() {
  const list = site.experience || [];
  if (!list.length) return $('#experience').remove();
  $('[data-exp]').innerHTML = list.map((x) => `<li class="rv"><span class="when">${esc(x.period)}</span>
    <div><b>${esc(x.role)}</b><span class="org">${esc(x.org)}${x.kind ? ` · ${esc(x.kind)}` : ''}</span><p>${esc(x.note || '')}</p></div></li>`).join('');
}

// ── the corridor ────────────────────────────────────────────────────────────
function corridor() {
  const cards = HUNG.map((p, i) => `<li class="work rv" style="--k:${i}"><a href="#p/${esc(p.id)}" data-open="${esc(p.id)}">
    ${field(p, i)}
    <span class="wmeta"><span>${no(i)} · ${esc(p.period || p.year || '')}</span>${status(p)}</span>
    <b>${esc(p.title)}</b><span class="sub">${esc(p.subtitle || CATEGORIES[p.category]?.label || '')}</span>
    <p>${esc(clip(p.summary || '', 150))}</p>
    <span class="open">Open the project <i aria-hidden="true">→</i></span></a></li>`).join('');
  const end = `<li class="track-end rv"><a href="https://github.com/${esc(site.github)}" target="_blank" rel="noopener">Everything else, <em>on GitHub</em> ↗</a><small>github.com/${esc(site.github)}</small></li>`;
  $('[data-track]').insertAdjacentHTML('beforeend', cards + end);
}

// ── a case: one project, opened ─────────────────────────────────────────────
let caseEl = null;
let caseFrom = null; // the card's colour field the case grew out of
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
  <div class="case-hero">${field(p, i)}
    <div class="case-title"><span class="wmeta fx" style="--k:0"><span>${no(i)}</span>${status(p)}</span><h2 class="fx" style="--k:1">${esc(p.title)}</h2><p class="fx" style="--k:2">${esc(p.subtitle || '')}</p></div></div>
  <div class="case-body">
    <div class="case-main">
      <p class="case-sum fx" style="--k:${k++}">${esc(p.summary || '')}</p>
      ${p.shot ? `<figure class="case-shot fx" style="--k:${k++}"><img src="${esc(href(p.shot.src))}" width="${p.shot.w}" height="${p.shot.h}" alt="${esc(p.shot.alt)}"></figure>` : ''}
      ${p.highlights?.length ? `<div ${fx()}><h3>Highlights</h3><ul class="case-hl">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>` : ''}
      ${p.problem ? `<div ${fx()}><h3>The problem</h3><p>${esc(p.problem)}</p></div>` : ''}
      ${p.solution ? `<div ${fx()}><h3>The approach</h3><p>${esc(p.solution)}</p></div>` : ''}
    </div>
    <div ${fx()}>
      <dl class="case-meta">${meta.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}<div data-live hidden></div></dl>
      <div class="case-links">
        ${L.demo ? `<a class="go small" href="${esc(L.demo)}" target="_blank" rel="noopener"><span>Try it live</span><b aria-hidden="true">↗</b></a>` : ''}
        ${L.code ? `<a class="out" href="${esc(L.code)}" target="_blank" rel="noopener">Source on GitHub ↗</a>` : ''}
      </div>
    </div>
  </div>
  ${p.repo ? `<section class="case-readme fx" style="--k:${k++}" aria-label="README"><h3>From the README</h3><div class="prose" data-readme><p class="muted">Reading the README from GitHub…</p></div></section>` : ''}
  <a class="case-next" href="#p/${esc(next.id)}" data-open="${esc(next.id)}"><span><small>Next project</small><b>${esc(next.title)}</b></span>${field(next, ALL.indexOf(next))}</a>`;
}

// FLIP: start the case's colour field exactly over `r`, then let it grow into place
function grow(f, r, back = false) {
  const b = f.getBoundingClientRect();
  const to = `translate(${r.left - b.left}px, ${r.top - b.top}px) scale(${r.width / b.width}, ${r.height / b.height})`;
  f.style.transition = 'none';
  f.style.transform = back ? '' : to;
  f.getBoundingClientRect();
  f.style.transition = 'transform 0.95s cubic-bezier(0.7, 0, 0.2, 1)';
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
  else el.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 0 : 450, fill: 'forwards' });
  setTimeout(() => {
    el.remove();
    if (src) src.style.visibility = '';
    ROOT.classList.remove('locked');
    src?.closest('a')?.focus({ preventScroll: true });
  }, RM ? 0 : seen ? 950 : 460);
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
  try {
    const [prof, repos] = await Promise.all([gh.profile(), gh.repos()]);
    const langs = new Set(repos.map((r) => r.lang).filter(Boolean)).size;
    $('[data-g="repos"]').textContent = prof.repos;
    box.innerHTML = `<div><dt>Public repos</dt><dd>${prof.repos}</dd></div>
      <div><dt>Languages</dt><dd data-nlang>${langs}</dd></div>
      <div><dt>Since</dt><dd>${esc(new Date(prof.since).getFullYear())}</dd></div>`;
    gh.languageTotals().then((pairs) => {
      if (!pairs.length) return;
      $('[data-nlang]').textContent = pairs.length;
      circles(pairs.slice(0, 8));
    }).catch(() => {});
  } catch {
    $('[data-g="repos"]').closest('div').remove();
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

// ── words that rise out of a mask ───────────────────────────────────────────
function split(el, cls = 'w') {
  let k = 0;
  const out = [];
  const walk = (node, tag) => {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === 1) { walk(n, n.tagName.toLowerCase()); continue; }
      for (const part of n.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (!part.trim()) { out.push(' '); continue; }
        const w = tag ? `<${tag}>${esc(part)}</${tag}>` : esc(part);
        out.push(cls === 'w' ? `<span class="w"><span style="--k:${k++}">${w}</span></span>` : `<span class="${cls}">${w}</span>`);
      }
    }
  };
  el.setAttribute('aria-label', el.textContent.trim());
  walk(el, '');
  el.innerHTML = out.join('');
  return $$(`.${cls}`, el);
}

// ── motion ──────────────────────────────────────────────────────────────────
function motion() {
  const wide = matchMedia('(min-width: 900px)');
  const portal = $('[data-portal]');
  const art = $('[data-art]');
  const img = $('.dim', art);
  const txt = $('[data-herotxt]');
  const label = $('[data-label]');
  const veil = $('[data-veil]');
  const passage = $('[data-passage]');
  const hint = $('[data-hint]');
  const qws = split($('[data-words]'), 'qw');
  const corr = $('[data-corridor]');
  const track = $('[data-track]');
  const cbar = $('[data-corrprog]');
  const bar = $('.bar');
  const prog = $('[data-prog]');
  const links = $$('.bar-m a');
  const rooms = links.map((l) => $(l.getAttribute('href')));
  const tones = $$('[data-tone]');
  let pin = false;
  let geo = null; // measured once per resize
  let lastX = 0;
  let sk = 0;
  let raf = 0;

  const measure = () => {
    pin = !RM && wide.matches;
    ROOT.classList.toggle('pin', pin);
    art.style.transform = '';
    track.style.transform = '';
    corr.style.height = '';
    if (!pin) { geo = null; [txt, label, veil, passage, hint, art].forEach((x) => x.removeAttribute('style')); return; }
    const s = $('.stage', portal).getBoundingClientRect();
    const a = art.getBoundingClientRect();
    const m = img.getBoundingClientRect();
    const cx = m.left + m.width / 2 - s.left;
    const cy = m.top + m.height / 2 - s.top;
    art.style.transformOrigin = `${m.left + m.width / 2 - a.left}px ${m.top + m.height / 2 - a.top}px`;
    const travel = track.scrollWidth - innerWidth;
    corr.style.height = `${Math.max(0, travel) + innerHeight}px`;
    geo = { dx: innerWidth / 2 - cx, dy: innerHeight / 2 - cy, s: Math.max(innerWidth / m.width, innerHeight / m.height) * 1.04, travel };
  };

  const frame = () => {
    raf = 0;
    const y = scrollY;
    const H = ROOT.scrollHeight - innerHeight;
    bar.classList.toggle('scrolled', y > 40);
    prog.style.setProperty('--p', (y / Math.max(1, H)).toFixed(4));
    const mid = innerHeight * 0.45;
    links.forEach((l, i) => { const r = rooms[i]?.getBoundingClientRect(); l.classList.toggle('on', !!r && r.top < mid && r.bottom > mid); });
    const now = tones.find((t) => { const r = t.getBoundingClientRect(); return r.top < mid && r.bottom > mid; });
    if (now) ROOT.style.setProperty('--tone', now.dataset.tone);
    if (!geo) return;

    // the portal: 0 → 1 over its pinned length
    const pr = portal.getBoundingClientRect();
    const t = clamp(-pr.top / (pr.height - innerHeight));
    const e = ease(clamp(t / 0.55));
    const out = clamp((t - 0.9) / 0.1);
    art.style.transform = `translate3d(${(geo.dx * e).toFixed(1)}px, ${(geo.dy * e).toFixed(1)}px, 0) scale(${(1 + (geo.s - 1) * e).toFixed(4)})`;
    art.style.setProperty('--lit', clamp(t / 0.4).toFixed(3));
    art.style.opacity = (1 - out * 0.75).toFixed(3);
    txt.style.opacity = (1 - clamp(t / 0.28)).toFixed(3);
    txt.style.transform = `translate3d(0, ${(-90 * ease(clamp(t / 0.4))).toFixed(1)}px, 0)`;
    txt.style.visibility = t > 0.3 ? 'hidden' : '';
    label.style.opacity = (1 - clamp(t / 0.12)).toFixed(3);
    hint.style.opacity = (1 - clamp(t / 0.06)).toFixed(3);
    veil.style.opacity = (clamp((t - 0.42) / 0.25) * (1 - out)).toFixed(3);
    passage.style.opacity = (clamp((t - 0.5) / 0.08) * (1 - out)).toFixed(3);
    passage.style.transform = `translate3d(0, ${(-40 * out).toFixed(1)}px, 0)`;
    qws.forEach((w, i) => {
      const v = clamp((t - 0.52 - i * 0.045) / 0.08);
      w.style.opacity = (0.08 + 0.92 * v).toFixed(3);
      w.style.filter = v < 1 ? `blur(${((1 - v) * 8).toFixed(1)}px)` : '';
    });

    // the corridor: vertical scroll → sideways walk, with a lean that follows your speed
    const cr = corr.getBoundingClientRect();
    const c = clamp(-cr.top / Math.max(1, cr.height - innerHeight));
    const x = -c * geo.travel;
    sk += (clamp((x - lastX) * 0.06, -6, 6) - sk) * 0.2;
    lastX = x;
    track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    track.style.setProperty('--sk', `${sk.toFixed(2)}deg`);
    cbar.style.setProperty('--c', c.toFixed(4));
    if (Math.abs(sk) > 0.02) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { measure(); kick(); });
  wide.addEventListener('change', () => { measure(); kick(); });
  document.fonts?.ready.then(() => { measure(); kick(); });
  measure();
  frame();

  // the torch on the hero painting
  if (!RM && canHover()) {
    portal.addEventListener('pointermove', (e) => {
      const r = $('.lit', art).getBoundingClientRect();
      art.style.setProperty('--sx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      art.style.setProperty('--sy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    });
  }

  if (!RM && canHover()) {
    // a soft gold light trails the pointer, a little larger over anything clickable
    const glow = $('[data-glow]');
    let gx = innerWidth / 2;
    let gy = innerHeight / 3;
    let tx = gx;
    let ty = gy;
    let g = 0;
    const step = () => {
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
      g = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(step) : 0;
    };
    addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add('on');
      glow.classList.toggle('big', !!e.target.closest?.('a, button'));
      if (!g) g = requestAnimationFrame(step);
    }, { passive: true });
    ROOT.addEventListener('pointerleave', () => glow.classList.remove('on'));

    // gold buttons lean toward the pointer
    for (const m of $$('[data-magnet]')) {
      m.addEventListener('pointermove', (e) => {
        const r = m.getBoundingClientRect();
        m.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px`);
        m.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`);
      });
      m.addEventListener('pointerleave', () => { m.style.setProperty('--mx', '0px'); m.style.setProperty('--my', '0px'); });
    }
  }

  // reveals: headings rise word by word, paintings are unveiled, the rest fades up
  $$('[data-split]').forEach((h) => { split(h); h.classList.add('split'); });
  const els = $$('.rv, .split, .room-art');
  if (RM || !('IntersectionObserver' in window)) return els.forEach((x) => x.classList.add('in'));
  const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && (en.target.classList.add('in'), io.unobserve(en.target))), { rootMargin: '0px 0px -10% 0px' });
  els.forEach((x) => io.observe(x));
}

words();
about();
kit();
experience();
corridor();
motion();
routes();
github();
palette();
