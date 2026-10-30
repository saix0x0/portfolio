// Small shared helpers. Everything in the site imports from here.

// Site root, resolved from this file's location so the site works at a domain
// root *or* under a sub-path (e.g. https://user.github.io/portfolio/).
export const BASE = new URL('../../../', import.meta.url);
export const href = (p = '') => new URL(p, BASE).href;

export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const canHover = () => matchMedia('(hover: hover)').matches;

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

/** Build a DOM element from an HTML string. */
export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** Deterministic PRNG (mulberry32) so procedural art looks the same every visit. */
export function seeded(seed = 1) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable small hash of a string (for colours derived from titles etc). */
export function hash(str = '') {
  let x = 2166136261;
  for (let i = 0; i < str.length; i++) x = Math.imul(x ^ str.charCodeAt(i), 16777619);
  return x >>> 0;
}

export const slug = (s = '') =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-');

/** localStorage that never throws (private mode, blocked storage…). */
export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('sky:' + key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('sky:' + key, JSON.stringify(value));
    } catch {}
  },
};

let toastWrap;
/** Little message bubble in the corner. */
export function toast(message, { icon = '✦', ms = 4200, html = false } = {}) {
  if (!toastWrap) {
    toastWrap = h('<div class="toasts" role="status" aria-live="polite"></div>');
    document.body.append(toastWrap);
  }
  const el = h(`<div class="toast"><span class="toast-icon" aria-hidden="true">${esc(icon)}</span><span class="toast-msg"></span></div>`);
  el.querySelector('.toast-msg')[html ? 'innerHTML' : 'textContent'] = message;
  toastWrap.append(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => {
    el.classList.remove('in');
    setTimeout(() => el.remove(), 500);
  }, ms);
}

export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Fade/slide elements with .reveal in as they enter the viewport. */
export function revealOnScroll(root = document) {
  const els = $$('.reveal:not(.in)', root);
  if (!('IntersectionObserver' in window) || reducedMotion()) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  els.forEach((el, i) => {
    if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${(i % 6) * 60}ms`);
    io.observe(el);
  });
}

/** Cards that catch the light where the cursor is. */
export function glowFollow(root = document) {
  if (!canHover()) return;
  root.addEventListener('pointermove', (e) => {
    const card = e.target.closest?.('.glow');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}
