// ─────────────────────────────────────────────────────────────────────────────
//  PANELS — what opens when you interact. One registry; floors add their own
//  with register(). Panels render real content from content/*.js.
// ─────────────────────────────────────────────────────────────────────────────
import { esc, href } from '../core/base.js';
import { site } from '../../../content/site.js';
import { FLOORS, floorById } from './layout.js';
import { SKYVIEWS } from './city.js';

let game = null;
let root = null;
let current = null;
const REG = {};

export const registerGame = (g) => (game = g);
export const register = (name, fn) => (REG[name] = fn);
export const panelOpen = () => !!current;
export const todo = (s = '') => (String(s).startsWith('TODO') ? `<span class="todo">${esc(s)}</span>` : esc(s));
export const ph = (x) => (x?.placeholder ? '<span class="tag warn">placeholder</span>' : '');

function ensureRoot() {
  if (root) return root;
  root = document.createElement('div');
  root.className = 'panel-layer';
  root.innerHTML = '<div class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title"><button class="px-close" type="button" aria-label="Close (Esc)">ESC ✕</button><div class="panel-body"></div></div>';
  document.body.append(root);
  root.addEventListener('click', (e) => {
    if (e.target === root || e.target.closest('.px-close')) closePanel();
    const go = e.target.closest('[data-go]');
    if (go) {
      const [fid, x] = go.dataset.go.split(':');
      closePanel();
      const f = floorById(fid);
      game.travel(f.idx, x ? +x : null);
    }
    const ride = e.target.closest('[data-ride]');
    if (ride) {
      const f = floorById(ride.dataset.ride);
      if (game.canStop(f.idx)) {
        closePanel();
        game.ride(f.idx);
      } else openPanel('locked', { floor: f });
    }
    const p = e.target.closest('[data-panel]');
    if (p) openPanel(p.dataset.panel, JSON.parse(p.dataset.args || '{}'));
  });
  return root;
}

export function openPanel(name, args = {}) {
  const fn = REG[name];
  if (!fn) return;
  const r = ensureRoot();
  const out = fn(args, game);
  if (out == null) return;
  const body = r.querySelector('.panel-body');
  body.innerHTML = '';
  if (typeof out === 'string') body.innerHTML = out;
  else body.append(out);
  r.querySelector('.panel').dataset.kind = name;
  r.classList.add('open');
  current = name;
  game.keys.clear();
  (r.querySelector('[autofocus]') || r.querySelector('.px-close')).focus({ preventScroll: true });
  REG[name].after?.(body, args, game);
}

export function closePanel() {
  if (!root || !current) return;
  const was = current;
  root.classList.remove('open');
  current = null;
  if (was === 'guide' && game && !game.introDone) {
    game.introDone = true;
    game.guide.follow = false;
    game.save();
  }
  game?.cv.focus?.();
}

const head = (kicker, title, color = '') => `<p class="px-kicker" style="${color ? `color:${color}` : ''}">${esc(kicker)}</p><h2 id="panel-title">${title}</h2>`;
const btn = (label, attrs, primary) => `<button class="px-btn${primary ? ' primary' : ''}" type="button" ${attrs}>${label}</button>`;

// ── the guide ────────────────────────────────────────────────────────────────
const HINTS = {
  lobby: 'Everything in the hotel is real: walk up to something glowing and press E. The elevator is right behind the desk.',
  comms: 'The terminal sends messages straight to the owner. The wall shows every way to reach them.',
  gallery: 'Each frame is a project. Read the plaque, then open the full case study.',
  pavilion: 'Inspect the car in the garage, study the circuits, or sit down and pick something for the big screen.',
  study: 'Every spine on these shelves is a real book. Some shelves are better read than others…',
  basement: 'You found the basement. Not many guests do.',
  penthouse: 'The owner’s private floor.',
};
register('guide', (a, g) => {
  const f = g.floor;
  if (a.first || !g.introDone) {
    return `${head('Nova · hotel guide', 'Welcome to the Cyberverse Hotel.')}
      <p>I’m Nova. This hotel is the personal world of <b>${esc(site.fullName)}</b>, and every floor holds a different part of it.</p>
      <ul class="px-list">
        <li><kbd>A</kbd><kbd>D</kbd> or <kbd>←</kbd><kbd>→</kbd> walk · <kbd>Shift</kbd> run</li>
        <li><kbd>E</kbd> interact · <kbd>M</kbd> map · <kbd>Esc</kbd> close</li>
        <li>Or just <b>click</b> anywhere to walk there.</li>
      </ul>
      <p>Looking for something specific?</p>
      <div class="px-row">
        ${btn('Projects → Gallery', 'data-go="gallery:300"', true)}
        ${btn('Books → Study', 'data-go="study:300"')}
        ${btn('F1 → Pavilion', 'data-go="pavilion:300"')}
        ${btn('Say hello → Comms', 'data-go="comms:300"')}
      </div>
      <p class="px-note">In a hurry? <a href="${href('portfolio/')}">Portfolio mode</a> has everything without the walking.</p>
      <div class="px-row">${btn('Let me explore', 'data-close autofocus', true)}</div>`;
  }
  const found = ['secret_alcove', 'keycard', 'penthouse'].filter((k) => g.flags[k]).length;
  const secret = !g.flags.secret_alcove ? 'Rumour has it one painting in the Gallery doesn’t hang straight.' : !g.flags.keycard ? 'A strange loop… somewhere on the Study’s philosophy shelf.' : !g.flags.penthouse ? 'The basement remembers a number. Ramanujan would know it.' : 'You’ve found every secret so far. More floors are coming.';
  return `${head('Nova · ' + f.name, 'Need a hand?')}
    <p>${esc(HINTS[f.id] || 'Explore!')}</p>
    <div class="px-row">${['gallery', 'study', 'pavilion', 'comms'].map((id) => btn(floorById(id).name, `data-go="${id}:300"`)).join('')}</div>
    <p class="px-note">Secrets found: ${found}/3. ${esc(secret)}</p>`;
});
REG.guide.after = (body) => body.querySelector('[data-close]')?.addEventListener('click', closePanel);

// ── lobby ────────────────────────────────────────────────────────────────────
register('intro', () => `${head('Reception', esc(site.fullName))}
  <p class="px-lede">${esc(site.tagline)}</p>
  <div class="px-cols"><div><h3>Interested in</h3><div class="px-tags">${site.interests.map((i) => `<span class="tag">${esc(i)}</span>`).join('')}</div></div>
  <div><h3>Right now</h3><ul class="px-list">${site.now.map((n) => `<li><b>${esc(n.label)}</b> ${todo(n.text)}</li>`).join('')}</ul></div></div>
  <h3>About</h3>${site.bio.map((p) => `<p>${todo(p)}</p>`).join('')}
  <div class="px-row">${btn('See projects', 'data-go="gallery:300"', true)}${btn('Get in touch', 'data-go="comms:300"')}<a class="px-btn" href="${href('portfolio/')}">Portfolio mode ↗</a></div>`);

register('directory', (a, g) => `${head('Hotel directory', 'Where to?')}
  <ul class="px-floors">${[...FLOORS].reverse().map((f) => {
    const ok = g.canStop(f.idx);
    const state = f.status === 'open' ? '' : ok ? 'unlocked' : f.lock === 'keycard' ? 'needs keycard' : 'owner only';
    return `<li><button type="button" data-ride="${f.id}" class="${ok ? '' : 'locked'}"><b>${esc(f.n)}</b><span>${esc(f.id === 'basement' && !ok ? '???' : f.name)}</span><em>${esc(state)}</em></button></li>`;
  }).join('')}</ul>`);

register('elevator', (a, g) => REG.directory(a, g).replace('Hotel directory', 'Glass elevator'));

register('locked', ({ floor }, g) => {
  if (floor.lock === 'code') return `${head('Penthouse', 'Owner only.')}<p>A keypad glows beside the elevator button.</p><div class="px-row">${btn('Use the keypad', 'data-panel="keypad"', true)}</div>`;
  if (floor.lock === 'keycard') return `${head('Elevator', 'The B button won’t light.')}<p>A small card reader blinks red under it. Somebody in this hotel must have a keycard.</p>`;
  return `${head(floor.n, floor.name)}<p>Not open yet.</p>`;
});

register('keypad', (a, g) => {
  const el = document.createElement('div');
  el.innerHTML = `${head('Penthouse keypad', 'Enter code')}
    <form class="keypad"><input inputmode="numeric" maxlength="6" autocomplete="off" aria-label="Code" autofocus><button class="px-btn primary">Enter</button></form><p class="px-note" data-msg></p>`;
  el.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (el.querySelector('input').value.trim() === '1729') {
      g.setFlag('penthouse');
      el.querySelector('[data-msg]').innerHTML = 'Access granted. The PH button lights up. ' + btn('Ride up', 'data-ride="penthouse"', true);
    } else el.querySelector('[data-msg]').textContent = 'Wrong code. The keypad sulks.';
  });
  return el;
});

register('stairs', (a, g) => g.flags.keycard
  ? `${head('Staff stairs', 'The reader turns green.')}<p>Stairs lead down into the dark.</p><div class="px-row">${btn('Go down', 'data-ride="basement"', true)}</div>`
  : `${head('Staff stairs', 'Locked.')}<p>“STAFF ONLY.” A keycard reader blinks red.</p>`);

register('skyview', (a, g) => {
  const el = document.createElement('div');
  el.innerHTML = `${head('Skyview console', 'Change the view outside.')}<p>Every window in the hotel looks out on the same sky.</p>
    <div class="px-row">${Object.entries(SKYVIEWS).map(([k, v]) => btn(v.label, `data-sky="${k}"`, g.city.mode === k)).join('')}</div>`;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sky]');
    if (!b) return;
    g.city.setMode(b.dataset.sky);
    g.save();
    el.querySelectorAll('[data-sky]').forEach((x) => x.classList.toggle('primary', x === b));
  });
  return el;
});

register('portfolio', () => `${head('Portfolio mode', 'The same work, without the walking.')}
  <p>A clean, fast version of everything in this hotel: projects, college work, skills and contact.</p>
  <div class="px-row"><a class="px-btn primary" href="${href('portfolio/')}" autofocus>Open portfolio mode ↗</a><a class="px-btn" href="${href('work/')}">All projects ↗</a><a class="px-btn" href="${href('work/')}#college">College work ↗</a></div>`);

const SNACKS = ['NEON COLA. Tastes like static.', 'ORBIT CHIPS. Each one slightly zero-g.', 'A tiny bag of syntax sugar.', 'COFFEE.EXE — warning: may cause commits.', 'Nothing. The machine is out of moonlight.'];
register('vending', () => `${head('Vending machine', 'Clunk.')}<p>You got: <b>${esc(SNACKS[(Math.random() * SNACKS.length) | 0])}</b></p>`);
register('bartender', (a, g) => `${head('Bartender bot', '“What’ll it be?”')}<p>${esc(!g.flags.secret_alcove ? 'Between you and me — one of the Gallery paintings isn’t hung straight. Always bugged me.' : 'You found the alcove? Then you already know more than most guests.')}</p>`);
register('npc', ({ npc }) => {
  npc.say = (npc.say ?? -1) + 1;
  return `${head(npc.name, '“' + esc(npc.lines[npc.say % npc.lines.length]) + '”')}`;
});
register('exit', () => `${head('Entrance', 'The city is closed tonight.')}<p>One day these doors will open onto the streets outside. For now, the hotel is the whole world.</p>`);

// ── contact (mailbox + Communications Lounge) ────────────────────────────────
register('contact', () => {
  const el = document.createElement('div');
  const ready = !!site.email;
  el.innerHTML = `${head('Communications', 'Send a message')}
    <form class="px-form" novalidate>
      <label>Your name<input name="name" required autocomplete="name"></label>
      <label>Your email<input name="email" type="email" required autocomplete="email"></label>
      <label>About<select name="topic"><option>Project inquiry</option><option>Collaboration</option><option>Opportunity</option><option>Just saying hi</option></select></label>
      <label>Message<textarea name="message" rows="5" required></textarea></label>
      <p class="px-note">${ready ? 'Sending opens your email app with the message ready.' : 'Messaging isn’t connected yet — the owner still needs to add an email in content/site.js.'}</p>
      <p class="px-err" role="status" aria-live="polite"></p>
      <button class="px-btn primary" ${ready ? '' : 'disabled'}>Send ✉</button>
    </form>`;
  el.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const err = !d.name.trim() ? 'Add your name.' : !/^\S+@\S+\.\S{2,}$/.test(d.email) ? 'Check your email address.' : d.message.trim().length < 5 ? 'Write a little more.' : '';
    el.querySelector('.px-err').textContent = err;
    if (err || !ready) return;
    location.href = `mailto:${site.email}?subject=${encodeURIComponent(`[${d.topic}] from ${d.name}`)}&body=${encodeURIComponent(`${d.message}\n\n— ${d.name} (${d.email})`)}`;
  });
  return el;
});

// ── map ──────────────────────────────────────────────────────────────────────
register('map', (a, g) => {
  const el = document.createElement('div');
  el.innerHTML = `${head('Hotel map', 'You are on ' + esc(g.floor.name))}<div class="px-map"><canvas></canvas><div class="px-map-floors"></div></div>`;
  const cv = el.querySelector('canvas');
  const scale = 0.32;
  cv.width = Math.round(g.art.width * scale);
  cv.height = Math.round(g.art.height * scale);
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = true;
  c.fillStyle = '#0b0520';
  c.fillRect(0, 0, cv.width, cv.height);
  c.drawImage(g.art, 0, 0, cv.width, cv.height);
  c.globalCompositeOperation = 'lighter';
  c.drawImage(g.light, 0, 0, cv.width, cv.height);
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#3dffb0';
  c.fillRect(g.player.x * scale - 2, (g.feetY() - 20) * scale, 4, 7);
  const list = el.querySelector('.px-map-floors');
  list.innerHTML = [...FLOORS].reverse().map((f) => {
    const ok = g.canStop(f.idx);
    const top = (f.top * scale / cv.height) * 100;
    const hgt = (f.h * scale / cv.height) * 100;
    return `<button type="button" data-ride="${f.id}" class="${ok ? '' : 'locked'} ${f.idx === g.player.floor ? 'here' : ''}" style="top:${top}%;height:${hgt}%"><b>${esc(f.n)}</b> ${esc(f.id === 'basement' && !ok ? '???' : f.name)}</button>`;
  }).join('');
  return el;
});
