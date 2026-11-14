// ─────────────────────────────────────────────────────────────────────────────
//  VISITS: counts a page view with GoatCounter (goatcounter.com, free, no
//  cookies) once a site code is set in content/live.js → analytics.goatcounter.
//  No script from anyone else: one image request per page. Skipped on
//  localhost, when the browser asks not to be tracked, and on the owner's own
//  browsers (the switch at /edit/).
// ─────────────────────────────────────────────────────────────────────────────
import { site } from '../../../content/site.js';

const code = site.analytics?.goatcounter || '';
let mine = false;
try { mine = localStorage.getItem('visits:skip') === '1'; } catch {}
const local = /^(localhost|127\.|\[::1\]|.*\.localhost$)/.test(location.hostname);

if (/^[a-z0-9-]+$/.test(code) && !mine && !local && navigator.doNotTrack !== '1') {
  const q = new URLSearchParams({
    p: location.pathname,
    t: document.title,
    r: document.referrer,
    s: `${screen.width},${screen.height},${devicePixelRatio || 1}`,
    rnd: Math.random().toString(36).slice(2),
  });
  new Image().src = `https://${code}.goatcounter.com/count?${q}`;
}
