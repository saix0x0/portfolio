// LIBRARY — shelves, search, status filter, book view. #<isbn> opens a book.
import { $, $$, esc, hash, revealOnScroll } from '../core/base.js';
import { boot } from '../core/layout.js';
import { books, SHELVES, STATUSES } from '../../../content/books.js';

boot({ page: 'library', sky: 'library' });

const state = { status: 'all', q: '' };
const TYPE = { book: 'Book', paper: 'Paper', course: 'Course', article: 'Article', video: 'Video' };
const idOf = (b) => b.isbn || b.title;

function cover(b, size = 'M') {
  const h = hash(b.title);
  const hue = h % 360;
  const fake = `<span class="fake-cover" style="background:linear-gradient(160deg,hsl(${hue} 45% 32%),hsl(${(hue + 40) % 360} 50% 18%))"><b>${esc(b.title)}</b><span>${esc(b.author)}</span></span>`;
  if (!b.isbn) return fake;
  // ?default=false makes Open Library 404 instead of returning a blank image, so the fallback shows.
  return `${fake}<img src="https://covers.openlibrary.org/b/isbn/${esc(b.isbn)}-${size}.jpg?default=false" alt="" loading="lazy" onerror="this.remove()" style="position:relative">`;
}

const matches = (b) =>
  (state.status === 'all' || b.status === state.status || (state.status === 'free' && b.free)) &&
  (!state.q || [b.title, b.author, b.note, ...(b.shelves || []).map((s) => SHELVES[s])].join(' ').toLowerCase().includes(state.q.toLowerCase()));

function render() {
  const counts = { all: books.length, free: books.filter((b) => b.free).length };
  books.forEach((b) => (counts[b.status] = (counts[b.status] || 0) + 1));
  const keys = ['all', ...Object.keys(STATUSES).filter((k) => counts[k]), 'free'];
  $('[data-status]').innerHTML = keys.map((k) => `<button class="pill" data-st="${k}" aria-pressed="${state.status === k}">${k === 'all' ? 'Everything' : k === 'free' ? 'Free online' : esc(STATUSES[k])} <span class="n">${counts[k]}</span></button>`).join('');
  $('[data-stats]').innerHTML = `<span><b>${books.length}</b> on the shelves</span><span><b>${counts.free}</b> free to read</span><span><b>${counts.reading || 0}</b> reading now</span>`;

  const list = books.filter(matches);
  const shelves = Object.keys(SHELVES).filter((s) => s !== 'free');
  const html = shelves.map((s) => {
    const items = list.filter((b) => (b.shelves || []).includes(s));
    if (!items.length) return '';
    return `<section class="shelf reveal" aria-labelledby="sh-${s}"><div class="shelf-head"><h2 id="sh-${s}">${esc(SHELVES[s])}</h2><span class="meta">${items.length}</span></div>
      <div class="books">${items.map((b) => `<button class="book" type="button" data-book="${esc(idOf(b))}" aria-label="${esc(b.title)} by ${esc(b.author)}">
        <span class="cover">${cover(b)}${b.free ? '<span class="free-tag">FREE</span>' : ''}</span><span class="t">${esc(b.title)}</span></button>`).join('')}</div><div class="shelf-board"></div></section>`;
  }).join('');
  $('[data-shelves]').innerHTML = html || `<div class="empty panel"><p>No books match “${esc(state.q)}”.</p></div>`;
  revealOnScroll($('[data-shelves]'));
}

const dlg = $('dialog.bookview');
function openBook(id) {
  const b = books.find((x) => idOf(x) === id);
  if (!b) return;
  const search = encodeURIComponent(`${b.title} ${b.author}`);
  $('[data-book]').innerHTML = `<button class="close-x" type="button" aria-label="Close">✕</button>
    <div class="cover">${cover(b, 'L')}</div>
    <div><p class="kicker"><span class="dot"></span>${esc(TYPE[b.type || 'book'])} · ${esc(STATUSES[b.status] || '')}</p>
      <h2 id="book-title">${esc(b.title)}</h2><p class="lede" style="font-size:1.05rem">${esc(b.author)}${b.year ? ` · ${b.year < 1000 ? 'c. ' + b.year : b.year}` : ''}</p>
      ${b.note ? `<p>${esc(b.note)}</p>` : ''}
      <div class="chips" style="margin:14px 0">${(b.shelves || []).map((s) => `<span class="chip">${esc(SHELVES[s])}</span>`).join('')}</div>
      <div class="row">
        ${b.free ? `<a class="btn primary" href="${esc(b.free)}" target="_blank" rel="noopener">Read free ↗</a>` : ''}
        ${b.url ? `<a class="btn" href="${esc(b.url)}" target="_blank" rel="noopener">Source ↗</a>` : ''}
        ${b.isbn ? `<a class="btn small" href="https://openlibrary.org/isbn/${esc(b.isbn)}" target="_blank" rel="noopener">Open Library ↗</a>` : `<a class="btn small" href="https://openlibrary.org/search?q=${search}" target="_blank" rel="noopener">Find on Open Library ↗</a>`}
        <a class="btn small" href="https://www.goodreads.com/search?q=${search}" target="_blank" rel="noopener">Goodreads ↗</a>
      </div></div>`;
  $('.close-x', dlg).onclick = () => dlg.close();
  history.replaceState(null, '', '#' + encodeURIComponent(id));
  if (!dlg.open) dlg.showModal();
}
dlg.addEventListener('close', () => history.replaceState(null, '', location.pathname));
dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-book]');
  if (b && !b.closest('dialog')) return openBook(b.dataset.book);
  const st = e.target.closest('[data-st]');
  if (st) (state.status = st.dataset.st), render();
  if (e.target.closest('[data-random]')) {
    const pool = books.filter(matches);
    if (pool.length) openBook(idOf(pool[(Math.random() * pool.length) | 0]));
  }
});
$('[data-q]').addEventListener('input', (e) => ((state.q = e.target.value.trim()), render()));
addEventListener('keydown', (e) => {
  if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) e.preventDefault(), $('[data-q]').focus();
});

render();
if (location.hash) openBook(decodeURIComponent(location.hash.slice(1)));
