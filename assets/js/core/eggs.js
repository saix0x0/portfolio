// ─────────────────────────────────────────────────────────────────────────────
//  EASTER EGGS — a few small rewards for curiosity. None of them gate content.
//  Full list (spoilers!) in docs/DESIGN_SYSTEM.md → "Easter eggs".
// ─────────────────────────────────────────────────────────────────────────────
import { $, store, toast, href, reducedMotion } from './base.js';

export const EGGS = {
  sun: 'You can set the sun',
  tower: 'The tower sparkles on the hour — or when asked',
  colosseum: 'Rome wasn’t built in a day',
  cristo: 'Obrigado!',
  cab: 'Taxi!',
  cabin: 'Someone lives here',
  telescope: 'Someone is watching the stars',
  aurora: 'You summoned the aurora',
  konami: '↑↑↓↓←→←→BA',
  passport: 'Every sunset, collected',
};

export function foundEgg(id, msg) {
  const found = store.get('eggs', []);
  const fresh = !found.includes(id);
  if (fresh) store.set('eggs', [...found, id]);
  const n = store.get('eggs', []).length;
  toast(`${msg}${fresh ? ` <span class="meta">· secret ${n}/${Object.keys(EGGS).length}</span>` : ''}`, { icon: '✦', html: true });
  updateCount();
}

function updateCount() {
  const el = $('.egg-count');
  const n = store.get('eggs', []).length;
  if (el) el.textContent = n ? `✦ ${n}/${Object.keys(EGGS).length} secrets found` : '';
}

// Typed into the search palette.
export const EGG_COMMANDS = {
  aurora: { title: 'Summon the aurora', sub: 'Works anywhere', run: (sky) => (sky.aurora(), foundEgg('aurora', 'The sky lights up green.')) },
  fireworks: { title: 'Fireworks', sub: 'For no particular reason', run: (sky) => sky.fireworks() },
  meteors: { title: 'Meteor shower', sub: 'Make a wish', run: (sky) => sky.meteorShower() },
  observatory: { title: 'The observatory', sub: 'Private — needs a passphrase', run: () => (location.href = href('observatory/')) },
  sunset: { title: 'Back to golden hour', sub: 'Reset the sun', run: (sky) => sky.setShift(0) },
};

export function initEggs(sky) {
  updateCount();

  // Click the sun a few times and it sets.
  let sunClicks = 0;
  let sunTimer;
  document.addEventListener('click', (e) => {
    if (e.target.closest('a,button,input,textarea,select,label,dialog,.panel,[data-egg]')) return;
    const s = sky.sunScreen();
    if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > s.r * 1.6) return;
    sunClicks++;
    clearTimeout(sunTimer);
    sunTimer = setTimeout(() => (sunClicks = 0), 2500);
    if (sunClicks === 3) {
      sunClicks = 0;
      const night = sky.targetShift < 0.5;
      sky.setShift(night ? 1 : 0);
      const r = document.querySelector('.sun-scrub input');
      if (r) r.value = night ? 100 : 0;
      foundEgg('sun', night ? 'You set the sun. Click it again… if you can find it.' : 'Golden hour, restored.');
    }
  });

  // Scene objects
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-egg]');
    if (!el) return;
    const id = el.dataset.egg;
    if (id === 'tower') {
      el.classList.remove('sparkling');
      void el.getBoundingClientRect();
      el.classList.add('sparkling');
      setTimeout(() => el.classList.remove('sparkling'), 5200);
      foundEgg('tower', 'The Eiffel Tower sparkles for five minutes every hour after dark. You get five seconds.');
    } else if (id === 'colosseum') {
      foundEgg('colosseum', 'Rome wasn’t built in a day — the Colosseum took about eight years. Degrees take four.');
    } else if (id === 'cristo') {
      sky.fireworks(4);
      foundEgg('cristo', 'Obrigado! Cristo Redentor stands 30 m tall on Corcovado.');
    } else if (id === 'cab') {
      if (el.classList.contains('driving')) return;
      el.classList.add('driving');
      setTimeout(() => el.classList.remove('driving'), 4200);
      foundEgg('cab', 'Taxi! Manhattanhenge: twice a year the sunset lines up with the street grid.');
    } else if (id === 'cabin') {
      el.classList.toggle('cat-out');
      foundEgg('cabin', 'A cat keeps watch over the fjord.');
    } else if (id === 'telescope') {
      sky.meteorShower(8);
      foundEgg('telescope', `Someone is watching the stars. <a href="${href('observatory/')}">Look through the telescope →</a>`);
    }
  });

  // Konami code anywhere → fireworks
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  let typed = '';
  addEventListener('keydown', (e) => {
    pos = e.key === seq[pos] || e.key.toLowerCase() === seq[pos] ? pos + 1 : e.key === seq[0] ? 1 : 0;
    if (pos === seq.length) {
      pos = 0;
      sky.fireworks(9);
      foundEgg('konami', 'Old habits. Enjoy the fireworks.');
    }
    // typing "aurora" anywhere (outside inputs)
    if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return;
    typed = (typed + (e.key.length === 1 ? e.key.toLowerCase() : '')).slice(-6);
    if (typed === 'aurora') EGG_COMMANDS.aurora.run(sky);
  });

  if (!reducedMotion()) {
    console.log(
      '%c☀  Hello, curious one.',
      'font: 600 16px Georgia, serif; color: #ffb35c; text-shadow: 0 0 12px #ff7d97'
    );
    console.log('%cThis site is hand-made, no frameworks. Try typing “aurora”, the Konami code, or clicking the sun three times.\nThe sky engine is on window.__sky — try __sky.fireworks()', 'color:#c9b8e8');
  }
}
