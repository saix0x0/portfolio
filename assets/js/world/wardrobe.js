// ─────────────────────────────────────────────────────────────────────────────
//  WARDROBE — restyle your character (skin, hair, outfit, extras). The look is
//  saved with the rest of your hotel progress (this browser only). Opened from
//  the Lobby's changing-room mirror and the Penthouse wardrobe.
// ─────────────────────────────────────────────────────────────────────────────
import { drawPerson, playerLook, SKINS, HAIRS, HAIR_COLOURS, TOP_COLOURS, EXTRAS } from './actors.js';
import { esc } from '../core/base.js';
import { blip, chime } from '../core/sound.js';

const TOPS = ['hoodie', 'jacket', 'tee', 'coat', 'racesuit', 'suit'];
const pick = (a) => a[(Math.random() * a.length) | 0];

export function wardrobePanel(g) {
  const el = document.createElement('div');
  let look = { ...(g.flags.look || {}) };
  const cur = () => playerLook(look);
  const row = (key, label, values, swatch) => `<div class="wr-row"><span>${label}</span><div>${values.map((v) => `<button type="button" data-k="${key}" data-v="${esc(v)}" class="${swatch ? 'sw' : 'px-btn'}" ${swatch ? `style="background:${v}" aria-label="${label} ${v}"` : ''}>${swatch ? '' : esc(v)}</button>`).join('')}</div></div>`;
  el.innerHTML = `<p class="px-kicker">Wardrobe mirror</p><h2 id="panel-title">Looking good.</h2>
    <div class="wr"><canvas width="96" height="60" aria-label="Your character"></canvas>
    <div class="wr-opts">
      ${row('skin', 'Skin', SKINS, true)}
      ${row('hair', 'Hair', HAIRS)}
      ${row('hairC', 'Colour', HAIR_COLOURS, true)}
      ${row('top', 'Outfit', TOPS)}
      ${row('topC', 'Colour', TOP_COLOURS, true)}
      ${row('extra', 'Extra', EXTRAS)}
    </div></div>
    <div class="px-row"><button class="px-btn primary" type="button" data-save autofocus>Wear it</button><button class="px-btn" type="button" data-rand>Surprise me</button><button class="px-btn" type="button" data-reset>Original</button></div>`;
  const cv = el.querySelector('canvas');
  const c = cv.getContext('2d');
  let raf = 0;
  const paint = (t) => {
    if (!el.closest('.panel-layer.open')) return; // stop once the panel closes
    c.clearRect(0, 0, 96, 60);
    c.fillStyle = '#1a1230';
    c.fillRect(0, 50, 96, 10);
    const L = cur();
    const tt = t / 1000;
    drawPerson(c, 18, 54, L, 1, 0, false, false, tt, false, { wave: Math.sin(tt * 0.8) > 0.6 });
    drawPerson(c, 48, 54, L, -1, tt * 6, true, false, tt, false);
    drawPerson(c, 78, 54, L, 1, 0, false, false, tt, true);
    raf = requestAnimationFrame(paint);
  };
  raf = requestAnimationFrame(paint);
  const mark = () => el.querySelectorAll('[data-k]').forEach((b) => b.classList.toggle('on', String(cur()[b.dataset.k] ?? look[b.dataset.k]) === b.dataset.v || (b.dataset.k === 'extra' && (look.extra || 'headphones') === b.dataset.v)));
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (b) (look[b.dataset.k] = b.dataset.v), blip(), mark();
    if (e.target.closest('[data-rand]')) {
      look = { skin: pick(SKINS), hair: pick(HAIRS), hairC: pick(HAIR_COLOURS), top: pick(TOPS), topC: pick(TOP_COLOURS), extra: pick(EXTRAS) };
      blip();
      mark();
    }
    if (e.target.closest('[data-reset]')) (look = {}), mark();
    if (e.target.closest('[data-save]')) {
      g.setFlag('look', look);
      chime();
      el.querySelector('#panel-title').textContent = 'Fresh fit. Saved.';
    }
  });
  mark();
  return el;
}
