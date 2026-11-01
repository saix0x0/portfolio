// ─────────────────────────────────────────────────────────────────────────────
//  SMALL THINGS ON THE DESK
//   keyboard → contactSheet  (type, and the keys light up on the photo)
//   mouse    → usesCard      (the setup)
//   AirPods  → musicCard     (three original synth loops)
//   book     → readingCard   (what's on the desk + the shelf)
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, href } from '../core/base.js';
import { site } from '../../../content/site.js';
import { desk } from '../../../content/desk.js';
import { books, STATUSES } from '../../../content/books.js';
import { RECORDS, loop, isMuted, setMuted } from '../world/sound.js';

const todo = (s = '') => (/^TODO/.test(String(s)) ? `<span class="todo">${esc(s)}</span>` : esc(s));
const close = '<button class="x" type="button" data-close aria-label="Back to the desk">×</button>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── keyboard: type to me ────────────────────────────────────────────────────
export function contactSheet(root, ctx) {
  const { provider, web3formsKey } = site.contact;
  const live = provider === 'web3forms' && web3formsKey;
  const ready = live || site.email;
  const note = live ? 'Goes straight to my inbox.' : site.email ? 'Opens your email app with this ready to send.' : 'Not connected yet: the owner still needs to add an email.';
  const h = site.hiring;
  const reach = [['Email', site.email ? `mailto:${site.email}` : '', site.email], ...site.socials.map((s) => [s.label, s.url, s.url.replace(/^https?:\/\/(www\.)?/, '')])];
  root.innerHTML = `<div class="sh">${close}
    <div class="sh-main"><p class="eyebrow">The keyboard · type to me</p>
      <h2>Say <em>hello.</em></h2><p class="muted">Every key you press lights up on the keyboard above.</p>
      <form data-form novalidate>
        <textarea name="message" rows="3" placeholder="Start typing…" aria-label="Message" required></textarea>
        <div class="two"><input name="name" autocomplete="name" placeholder="Your name" aria-label="Your name"><input name="email" type="email" autocomplete="email" placeholder="Reply to (your email)" aria-label="Your email"></div>
        <div class="send"><button class="btn" type="submit" ${ready ? '' : 'disabled'}>Send ✈</button><span class="muted small" data-note>${esc(note)}</span></div>
      </form></div>
    <aside class="sh-side">
      <h3>${todo(h.headline)}</h3><ul class="looking">${h.lookingFor.map((l) => `<li>${todo(l)}</li>`).join('')}</ul>
      ${h.resume ? `<a class="btn ghost" href="${esc(href(h.resume))}" download>Résumé ⇩</a>` : ''}
      <ul class="reach">${reach.map(([n, u, v]) => (u ? `<li><a href="${esc(u)}" ${u.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><b>${esc(n)}</b><span>${esc(v)} ↗</span></a></li>` : `<li><b>${esc(n)}</b><span class="todo">not set yet</span></li>`)).join('')}</ul>
      <div class="rgb-pick" role="group" aria-label="Keyboard lighting"><span>Keyboard light</span>${ctx.lights.state.rgbs.map((m) => `<button type="button" data-rgb="${m}" aria-pressed="${m === ctx.lights.state.rgb}">${{ wave: 'Wave', lamp: 'Match lamp', stock: 'Stock' }[m]}</button>`).join('')}</div>
    </aside></div>`;
  const form = $('[data-form]', root);
  const msg = $('textarea', form);
  setTimeout(() => msg.focus({ preventScroll: true }), 500);
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) ctx.leave();
    const b = e.target.closest('[data-rgb]');
    if (b) ctx.lights.rgb(b.dataset.rgb), $$('[data-rgb]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const say = (t) => ($('[data-note]', root).textContent = t);
    if (!d.message.trim()) return say('Type something first.'), msg.focus();
    if (!EMAIL_RE.test(d.email)) return say('I’ll need an email to reply to.'), $('[name=email]', form).focus();
    if (live) {
      say('Sending…');
      try {
        const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: web3formsKey, subject: `Hello from ${d.name || 'the desk'}`, ...d }) });
        say((await r.json()).success ? 'Sent. I’ll write back.' : 'That didn’t go through. Try email instead.');
      } catch { say('No connection. Try again in a bit.'); }
    } else if (site.email) {
      location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Hello from ${d.name || 'your desk'}`)}&body=${encodeURIComponent(`${d.message}\n\n— ${d.name} (${d.email})`)}`;
    }
  });
  return () => {};
}

// ── mouse: uses ─────────────────────────────────────────────────────────────
export function usesCard(root, ctx) {
  root.innerHTML = `<div class="pc">${close}<p class="eyebrow">The mouse · uses</p><h2>The <em>setup.</em></h2>
    <ul class="uses">${desk.uses.map((u) => `<li><b>${esc(u.thing)}</b>${u.model ? `<span>${todo(u.model)}</span>` : ''}<p>${esc(u.note)}</p></li>`).join('')}</ul>
    <h3>On the screens</h3><ul class="uses sw">${desk.software.map((u) => `<li><b>${todo(u.thing)}</b>${u.note ? `<p>${esc(u.note)}</p>` : ''}</li>`).join('')}</ul></div>`;
  $('[data-close]', root).addEventListener('click', ctx.leave);
  return () => {};
}

// ── AirPods: now playing (keeps playing after the card closes) ──────────────
let stop = null;
let playing = '';
export function musicCard(root, ctx) {
  const paint = () => {
    root.innerHTML = `<div class="pc player">${close}<p class="eyebrow">AirPods · connected</p><h2>Now <em>playing.</em></h2>
      <ol class="tracks">${RECORDS.map((r) => `<li><button type="button" data-track="${r.id}" aria-pressed="${playing === r.id}"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>${esc(r.title)}</b><small>Side ${r.side} · ${r.bpm} bpm</small></button></li>`).join('')}</ol>
      ${isMuted() ? '<p class="muted small">Sound is off. <button class="link" type="button" data-unmute>Turn it on</button></p>' : ''}
      <p class="muted small">Three loops written for this site, synthesised live in your browser. ${playing ? '<button class="link" type="button" data-stop>Pause</button>' : ''}</p></div>`;
  };
  paint();
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return ctx.leave();
    if (e.target.closest('[data-unmute]')) setMuted(false), paint();
    if (e.target.closest('[data-stop]')) stop?.(), (stop = null), (playing = ''), paint();
    const b = e.target.closest('[data-track]');
    if (!b) return;
    stop?.();
    if (playing === b.dataset.track) (stop = null), (playing = '');
    else {
      const r = RECORDS.find((x) => x.id === b.dataset.track);
      if (isMuted()) setMuted(false);
      stop = loop(r.seq, r.bpm, r.bass);
      playing = r.id;
    }
    document.documentElement.dataset.playing = playing ? '1' : '';
    paint();
  });
  return () => {};
}

// ── the book: what's on the desk, and the shelf ─────────────────────────────
export function readingCard(root, ctx) {
  const b = desk.onDesk;
  const shelf = [...books].sort((x, y) => (x.status === 'reading' ? -1 : 0) - (y.status === 'reading' ? -1 : 0)).slice(0, 4);
  root.innerHTML = `<div class="pc reading">${close}<p class="eyebrow">The book · on the desk right now</p>
    <div class="ondesk"><span class="cover" aria-hidden="true"><b>${esc(b.title)}</b><i>${esc(b.author)}</i><img src="https://covers.openlibrary.org/b/isbn/${esc(b.isbn)}-M.jpg?default=false" alt="" loading="lazy" onload="this.naturalWidth > 10 && this.classList.add('ok')" onerror="this.remove()"></span>
      <div><h2>${esc(b.title)}</h2><p>${esc(b.author)}</p></div></div>
    <h3>Also on the shelf</h3><ul class="shelf">${shelf.map((x) => `<li><a href="${esc(href('library/'))}#${esc(x.isbn)}"><b>${esc(x.title)}</b><span>${esc(x.author)} · ${esc(STATUSES[x.status] || '')}</span></a></li>`).join('')}</ul>
    <a class="btn ghost" href="${esc(href('library/'))}">The whole library (${books.length}) →</a></div>`;
  $('[data-close]', root).addEventListener('click', ctx.leave);
  return () => {};
}
