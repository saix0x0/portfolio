// COMPASS — departures board of links. Built for daily use as a homepage.
import { $, $$, esc, store, h } from '../core/base.js';
import { boot } from '../core/layout.js';
import { linkGroups } from '../../../content/links.js';

boot({ page: 'compass', sky: 'compass' });

const domain = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
let mine = store.get('my-links', []);
let sel = 0;

function groups() {
  const all = linkGroups.map((g) => ({ ...g, links: g.links.map((l) => ({ ...l })) }));
  if (mine.length) all.unshift({ name: 'Mine (this browser)', gate: '★', links: mine.map((l, i) => ({ ...l, mine: i })) });
  return all;
}

function render() {
  const q = $('[data-q]').value.trim().toLowerCase();
  let n = 0;
  const html = groups().map((g) => {
    const items = g.links.filter((l) => !q || `${l.name} ${l.note || ''} ${l.url} ${g.name}`.toLowerCase().includes(q));
    if (!items.length) return '';
    return `<section class="dep-group"><h2><span>${esc(g.name)}</span><span>Gate ${esc(g.gate || '—')}</span></h2>${items.map((l) => {
      const i = n++;
      return `<a class="dep-row" data-i="${i}" href="${esc(l.url)}" target="_blank" rel="noopener">
        <img src="https://icons.duckduckgo.com/ip3/${esc(domain(l.url))}.ico" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'fav',textContent:'${esc(l.name[0] || '?')}'}))">
        <b>${esc(l.name)}</b><span class="note">${esc(l.note || domain(l.url))}</span>
        ${l.mine != null ? `<button class="rm" data-rm="${l.mine}" aria-label="Remove ${esc(l.name)}">✕</button>` : `<span class="gate">${esc(domain(l.url))}</span>`}</a>`;
    }).join('')}</section>`;
  }).join('');
  $('[data-groups]').innerHTML = html || '<p class="meta" style="padding:20px">No departures to there. Try another word.</p>';
  sel = 0;
  mark();
}
function mark() {
  const rows = $$('.dep-row');
  rows.forEach((r, i) => r.classList.toggle('sel', i === sel && !!$('[data-q]').value));
}

// split-flap title
function flap(word) {
  const el = $('[data-flap]');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  el.innerHTML = [...word].map(() => '<span> </span>').join('');
  $$('span', el).forEach((s, i) => {
    let k = 0;
    const target = word[i];
    const t = setInterval(() => {
      s.textContent = k > 6 + i ? target : chars[(Math.random() * 26) | 0];
      s.classList.remove('flip'); void s.offsetWidth; s.classList.add('flip');
      if (k++ > 6 + i) clearInterval(t);
    }, 70);
  });
}

const input = $('[data-q]');
input.addEventListener('input', render);
input.addEventListener('keydown', (e) => {
  const rows = $$('.dep-row');
  if (e.key === 'ArrowDown') e.preventDefault(), (sel = Math.min(rows.length - 1, sel + 1)), mark(), rows[sel]?.scrollIntoView({ block: 'nearest' });
  if (e.key === 'ArrowUp') e.preventDefault(), (sel = Math.max(0, sel - 1)), mark(), rows[sel]?.scrollIntoView({ block: 'nearest' });
  if (e.key === 'Enter' && rows[sel]) window.open(rows[sel].href, '_blank', 'noopener');
});
addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) e.preventDefault(), input.focus();
});
document.addEventListener('click', (e) => {
  const rm = e.target.closest('[data-rm]');
  if (!rm) return;
  e.preventDefault();
  mine.splice(+rm.dataset.rm, 1);
  store.set('my-links', mine);
  render();
});
$('[data-add]').addEventListener('submit', (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  if (!/^https?:\/\//.test(d.url)) return;
  mine.push({ name: d.name.trim(), url: d.url.trim(), note: d.note.trim() });
  store.set('my-links', mine);
  e.target.reset();
  render();
});

const tick = () => ($('[data-clock]').textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
tick();
setInterval(tick, 15000);
flap('DEPARTURES');
render();
if (matchMedia('(hover: hover)').matches) input.focus({ preventScroll: true });
