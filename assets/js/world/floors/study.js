// ─────────────────────────────────────────────────────────────────────────────
//  FLOOR 4 — THE STUDY  (theme: study — dark wood, amber, cream, muted green)
//  Floor-to-ceiling shelves, one unit per SHELVES subject; spines = real books
//  from content/books.js. Reading desk + cat, window nook, exploring board,
//  card-catalogue terminal (content/links.js). Secret: the strange-loop book.
// ─────────────────────────────────────────────────────────────────────────────
import { THEMES, INK } from '../themes.js';
import { shell, sign, windowHole, lamp, lightCone, screen, R, P, text, glow, mix } from '../kit.js';
import { drawCat, Walker, LOOKS } from '../actors.js';
import { register, ph } from '../panels.js';
import { esc, hash } from '../../core/base.js';
import { books, SHELVES, STATUSES } from '../../../../content/books.js';
import { linkGroups } from '../../../../content/links.js';
import { site } from '../../../../content/site.js';
import { learningNow } from '../../../../content/skills.js';

const T = THEMES.study;
const UNITS = [
  ['cs', 60], ['ai', 152], ['human', 244], ['econ', 336],
  ['history', 822], ['philosophy', 914], ['free', 1006],
].map(([id, x]) => ({ id, x, w: 86, books: books.filter((b) => (id === 'free' ? b.free : (b.shelves || []).includes(id))) }));
const SECRET = books.find((b) => /gödel|godel/i.test(b.title));
const X = { desk: 520, cat: 536, lamp: 498, chair: 610, window0: 1108, window1: 1290, nookChair: 1200, board: 1340, catalogue: 1440 };
let secretPos = null;

function spineColor(b) {
  const h = hash(b.title) % 360;
  return `hsl(${h} 45% 38%)`;
}

function shelfUnit(ctx, f, U) {
  const top = f.top + 16;
  const bottom = f.y - 8;
  const { x, w } = U;
  R(ctx, x - 3, top - 4, w + 6, bottom - top + 4, T.woodLo);
  R(ctx, x - 3, top - 4, w + 6, 3, T.woodHi);
  R(ctx, x, top, w, bottom - top, '#1a0e08');
  const rows = 5;
  const rh = Math.floor((bottom - top - 6) / rows);
  let k = 0;
  for (let r = 0; r < rows; r++) {
    const sy = top + r * rh;
    R(ctx, x, sy + rh - 2, w, 2, T.wood);
    let bx = x + 2;
    while (bx < x + w - 3) {
      const real = U.books[k];
      const bw = real ? 4 : 2 + ((bx * 7 + r) % 3);
      const bh = rh - 5 - ((bx * 13 + r * 5) % 5);
      const c = real ? spineColor(real) : mix(T.wood, ['#3a2030', '#20303a', '#2a3a20', '#3a3020'][(bx + r) % 4], 0.5);
      R(ctx, bx, sy + rh - 2 - bh, bw, bh, c);
      if (real) {
        R(ctx, bx, sy + rh - 2 - bh, bw, 1, mix(c, '#fff', 0.35));
        R(ctx, bx + 1, sy + rh - 2 - bh + 4, bw - 2, 1, '#e8c878');
        if (real === SECRET) secretPos = { x: bx + bw / 2, y: sy + rh - 2 - bh, w: bw, h: bh };
        k++;
      }
      bx += bw + (real ? 1 : 0);
      if (!real && k >= U.books.length && r > 2 && (bx * 3) % 17 === 0) bx += 6; // gaps
    }
  }
  // label plate
  R(ctx, x + w / 2 - 22, bottom - 4, 44, 6, '#120a06');
  const label = (U.id === 'free' ? 'FREE' : SHELVES[U.id] || U.id).toUpperCase().slice(0, 10);
  text(ctx, label, Math.round(x + w / 2 - (label.length * 4 - 1) / 2), bottom - 3, T.trim);
}

export function paint(ctx, f) {
  shell(ctx, f, T, f.x0, f.x1, { panel: 0, wainscot: 0, floor: 'planks' });
  const y = f.y - 8;
  for (const U of UNITS) shelfUnit(ctx, f, U);
  // rolling ladder
  for (let i = 0; i < 70; i += 6) R(ctx, 410 + i * 0.12, f.top + 30 + i, 14, 1, T.woodHi);
  R(ctx, 410, f.top + 26, 2, 76, T.woodHi);
  R(ctx, 424, f.top + 26, 2, 76, T.woodHi);
  R(ctx, 404, f.top + 20, 30, 2, '#8a6a3a'); // rail
  sign(ctx, 'THE STUDY', 580, f.top + 26, T.neonA, 2, false);
  // reading desk + lamp
  R(ctx, X.desk - 40, y - 22, 80, 4, T.woodHi);
  R(ctx, X.desk - 36, y - 18, 3, 18, T.wood);
  R(ctx, X.desk + 33, y - 18, 3, 18, T.wood);
  R(ctx, X.lamp - 1, y - 32, 2, 10, '#b08a4a');
  R(ctx, X.lamp - 7, y - 36, 14, 5, '#2a6a3a');
  R(ctx, X.lamp - 6, y - 31, 12, 1, '#ffe6b0');
  R(ctx, X.desk + 6, y - 26, 12, 4, '#e8dcc0'); // open book
  R(ctx, X.desk + 12, y - 26, 1, 4, '#a89878');
  // armchair
  R(ctx, X.chair - 12, y - 30, 24, 14, '#5a2a1a');
  R(ctx, X.chair - 16, y - 20, 6, 16, '#6a3420');
  R(ctx, X.chair + 10, y - 20, 6, 16, '#6a3420');
  R(ctx, X.chair - 12, y - 16, 24, 8, '#6a3420');
  R(ctx, X.chair - 10, y - 8, 2, 8, INK);
  R(ctx, X.chair + 8, y - 8, 2, 8, INK);
  // window nook
  windowHole(ctx, X.window0, f.top + 26, X.window1 - X.window0, y - 50 - f.top - 26, T.woodHi, 3);
  R(ctx, X.window0 - 8, y - 46, X.window1 - X.window0 + 16, 5, T.wood);
  R(ctx, X.nookChair - 14, y - 26, 28, 12, '#2a4a3a');
  R(ctx, X.nookChair - 16, y - 14, 32, 8, '#3a5a4a');
  R(ctx, X.nookChair - 12, y - 6, 2, 6, INK);
  R(ctx, X.nookChair + 10, y - 6, 2, 6, INK);
  // exploring board (chalk)
  R(ctx, X.board - 26, f.top + 30, 52, 44, T.woodHi);
  R(ctx, X.board - 24, f.top + 32, 48, 40, '#1e3a2a');
  text(ctx, 'EXPLORING', X.board - 18, f.top + 36, '#e8f0e0');
  ['P(A|B)', 'E[X]', 'GDP', 'LOGIC'].forEach((s, i) => text(ctx, s, X.board - 20 + (i % 2) * 22, f.top + 48 + Math.floor(i / 2) * 10, '#b8d8c0'));
  // card catalogue terminal
  R(ctx, X.catalogue - 18, y - 30, 36, 30, T.wood);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    R(ctx, X.catalogue - 16 + c * 8, y - 28 + r * 9, 7, 7, T.woodHi);
    P(ctx, X.catalogue - 13 + c * 8, y - 25 + r * 9, '#d8b878');
  }
  screen(ctx, X.catalogue - 12, y - 50, 24, 14, '#2a1a10', false);
}

export function lights(l, f) {
  const y = f.y - 8;
  glow(l, X.lamp, y - 30, 40, T.light, 0.4);
  lightCone(l, X.lamp, y - 31, f, '#ffe6b0', 8, 50, 0.18);
  for (const cx of [200, 960, 1360]) lightCone(l, cx, f.top + 12, f, T.light, 10, 90, 0.07);
  glow(l, 1050, f.top + 60, 60, T.neonB, 0.12);
  glow(l, X.catalogue, y - 44, 18, T.neonB, 0.25);
  glow(l, 580, f.top + 30, 70, T.neonA, 0.14);
}

export function dyn(ctx, f, t, G) {
  const y = f.y - 8;
  drawCat(ctx, X.cat, y - 22, t, !!G.flags?.cat);
  // catalogue screen
  R(ctx, X.catalogue - 12, y - 50, 24, 14, '#0a1a10');
  text(ctx, 'WWW', X.catalogue - 5, y - 47, T.neonB);
  if (Math.sin(t * 4) > 0) R(ctx, X.catalogue + 7, y - 47, 2, 5, T.neonB);
  // floating holo-books above the reading area
  for (let i = 0; i < 4; i++) {
    const bx = 470 + i * 34 + Math.round(Math.sin(t * 0.6 + i) * 4);
    const by = f.top + 56 + Math.round(Math.sin(t * 0.9 + i * 2) * 5);
    ctx.globalAlpha = 0.55;
    R(ctx, bx, by, 10, 7, '#7dd8a0');
    R(ctx, bx + 5, by, 1, 7, '#1a3a2a');
    ctx.globalAlpha = 1;
  }
  // the secret book glows until taken
  if (secretPos && !G.flags?.keycard) {
    const a = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.globalAlpha = a;
    R(ctx, secretPos.x - 3, secretPos.y - 1, secretPos.w + 2, secretPos.h + 2, '#b07cff');
    ctx.globalAlpha = 1;
  }
}

export function npcs(f) {
  return [new Walker({ id: 'reader', name: 'Quiet reader', look: LOOKS.student2, floor: f.id, x: 1200, min: 1120, max: 1290, speed: 8, lines: ['Shh. Every spine here is a real book, open a shelf to see them.', 'The green shelf is all free to read online.'] })];
}

export function objects(f) {
  const objs = UNITS.map((U) => ({ id: 'shelf-' + U.id, x: U.x + U.w / 2, label: (U.id === 'free' ? 'Free to read' : SHELVES[U.id]) + ' shelf', verb: 'Browse', panel: 'shelf', shelf: U.id }));
  objs.push({ id: 'desk', x: X.desk - 10, label: 'Reading desk', verb: 'Read', panel: 'reading' });
  objs.push({ id: 'cat', x: X.cat + 4, label: 'Library cat', verb: 'Pet', panel: 'cat' });
  objs.push({ id: 'board', x: X.board, label: 'Exploring board', verb: 'Read', panel: 'exploring' });
  objs.push({ id: 'catalogue', x: X.catalogue, label: 'Card catalogue', verb: 'Use', panel: 'links' });
  if (SECRET) objs.push({ id: 'strange-book', x: secretPos ? Math.round(secretPos.x) : UNITS.find((u) => u.id === 'philosophy').x + 20, label: 'A glowing book', verb: 'Pull', panel: 'keycard', when: (g) => !g.flags.keycard });
  return objs;
}

// ── panels ───────────────────────────────────────────────────────────────────
const cover = (b) => (b.isbn ? `<img class="cover" src="https://covers.openlibrary.org/b/isbn/${esc(b.isbn)}-S.jpg?default=false" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'cover none'}))">` : '<span class="cover none"></span>');
const bookRow = (b) => `<li class="book-row">${cover(b)}<div><b>${esc(b.title)}</b><span>${esc(b.author)} · ${esc(STATUSES[b.status] || '')}</span>${b.note ? `<p>${esc(b.note)}</p>` : ''}
  <div class="px-row tight">${b.free ? `<a class="px-btn primary" href="${esc(b.free)}" target="_blank" rel="noopener">Read free ↗</a>` : ''}${b.isbn ? `<a class="px-btn" href="https://openlibrary.org/isbn/${esc(b.isbn)}" target="_blank" rel="noopener">Open Library ↗</a>` : ''}</div></div></li>`;

register('shelf', ({ shelf }) => {
  const list = books.filter((b) => (shelf === 'free' ? b.free : (b.shelves || []).includes(shelf)));
  return `<p class="px-kicker">The Study · ${list.length} books</p><h2 id="panel-title">${esc(shelf === 'free' ? 'Free to read online' : SHELVES[shelf])}</h2><ul class="book-list">${list.map(bookRow).join('')}</ul>`;
});
register('reading', () => {
  const now = books.filter((b) => b.status === 'reading');
  const next = books.filter((b) => b.status === 'next').slice(0, 4);
  return `<p class="px-kicker">Reading desk</p><h2 id="panel-title">On the desk</h2>
    <h3>Reading now</h3>${now.length ? `<ul class="book-list">${now.map(bookRow).join('')}</ul>` : '<p class="px-note">Nothing open right now. (Set a book’s status to “reading” in content/books.js.)</p>'}
    <h3>Up next</h3><ul class="book-list">${next.map(bookRow).join('')}</ul>`;
});
register('cat', (a, g) => {
  g.setFlag('cat', !g.flags.cat);
  return `<p class="px-kicker">Library cat</p><h2 id="panel-title">${g.flags.cat ? 'Purrrr. ♥' : 'Back to sleep.'}</h2><p>${g.flags.cat ? 'The cat opens one eye, decides you are acceptable, and purrs.' : 'The cat curls up again.'}</p>`;
});
register('exploring', () => `<p class="px-kicker">Exploring board</p><h2 id="panel-title">What I’m thinking about</h2>
  <div class="px-tags">${site.interests.map((i) => `<span class="tag">${esc(i)}</span>`).join('')}</div>
  <h3>Learning now</h3><p>${learningNow.map((x) => esc(x)).join(' · ')}</p>
  <p class="px-note">The Observatory floor will hold maths, economics and philosophy in depth, it’s still being built.</p>`);
register('links', () => `<p class="px-kicker">Card catalogue</p><h2 id="panel-title">Websites I live on</h2>
  ${linkGroups.map((g) => `<h3>${esc(g.name)}</h3><ul class="px-list">${g.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.name)}</a> <span class="px-note">${esc(l.note || '')}</span></li>`).join('')}</ul>`).join('')}`);
register('keycard', (a, g) => {
  g.setFlag('keycard');
  return `<p class="px-kicker">${esc(SECRET?.title || 'A book')}</p><h2 id="panel-title">A keycard falls out.</h2>
    <p>Tucked between the pages about strange loops: a matte-black card stamped <b>B · STAFF</b>.</p>
    <p class="px-note">Secret 2 of 3. The elevator’s B button now works, so do the staff stairs in the lobby.</p>
    <div class="px-row"><button class="px-btn primary" type="button" data-ride="basement">Ride down to B</button></div>`;
});
