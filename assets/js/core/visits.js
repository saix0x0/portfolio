// ─────────────────────────────────────────────────────────────────────────────
//  VISITS: one number, nothing else. Each new browser session adds 1 to a
//  counter on Abacus (abacus.jasoncameron.dev, free, no account, no cookies).
//  Nothing about the visitor is sent or kept: no page, no referrer, no
//  screen. The total shows in the editor (/edit/).
//  Skipped on localhost and on the owner's own browsers (the editor's switch).
// ─────────────────────────────────────────────────────────────────────────────
export const COUNTER = 'https://abacus.jasoncameron.dev';
export const KEY = 'saix0x0-portfolio/visits';

let skip = false;
try {
  skip = localStorage.getItem('visits:skip') === '1' || sessionStorage.getItem('visits:counted') === '1';
  sessionStorage.setItem('visits:counted', '1');
} catch {}
const local = /^(localhost|127\.|\[::1\]|.*\.localhost$)/.test(location.hostname);
if (!skip && !local) fetch(`${COUNTER}/hit/${KEY}`, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' }).catch(() => {});
