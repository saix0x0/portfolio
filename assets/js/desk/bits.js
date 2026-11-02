// ─────────────────────────────────────────────────────────────────────────────
//  SMALL THINGS ON THE DESK
//   keyboard → contactSheet  (type, and the keys light up on the photo)
//   AirPods  → musicCard     (three original synth loops)
//   book     → readingCard   (what I'm reading)
// ─────────────────────────────────────────────────────────────────────────────
import { $, esc, href } from '../core/base.js';
import { site } from '../../../content/site.js';
import { desk } from '../../../content/desk.js';
import { RECORDS, loop, isMuted, setMuted } from '../world/sound.js';

const close = '<button class="x" type="button" data-close aria-label="Back to the desk">×</button>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── keyboard: reach out (each key you press lights up on the photo) ─────────
export function contactSheet(root, ctx) {
  const { provider, web3formsKey } = site.contact;
  const via = provider === 'web3forms' && web3formsKey ? 'web3forms' : provider === 'formsubmit' && site.email ? 'formsubmit' : site.email ? 'mailto' : '';
  const reach = [['Email', site.email ? `mailto:${site.email}` : '', site.email], ...site.socials.filter((s) => s.url).map((s) => { const v = s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); return [s.label, s.url, v.length > 26 ? 'View profile' : v]; })];
  root.innerHTML = `<div class="sh">${close}
    <div class="sh-main"><p class="eyebrow">Contact</p>
      <h2>Reach out <em>to me.</em></h2>
      <form data-form novalidate>
        <textarea name="message" rows="4" placeholder="Your message" aria-label="Message" required></textarea>
        <div class="two"><input name="name" autocomplete="name" placeholder="Your name" aria-label="Your name"><input name="email" type="email" autocomplete="email" placeholder="Your email" aria-label="Your email"></div>
        <input name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="send"><button class="btn" type="submit" ${via ? '' : 'disabled'}>Send message</button><span class="muted small" data-note>${via === 'mailto' ? 'Opens your email app with this ready to send.' : ''}</span></div>
      </form></div>
    <aside class="sh-side">
      <h3>Or directly</h3>
      <ul class="reach">${reach.filter(([, u]) => u).map(([n, u, v]) => `<li><a href="${esc(u)}" ${u.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><b>${esc(n)}</b><span>${esc(v)} ↗</span></a></li>`).join('')}</ul>
      ${site.hiring.resume ? `<a class="btn ghost" href="${esc(href(site.hiring.resume))}" download>Résumé ⇩</a>` : ''}
    </aside></div>`;
  const form = $('[data-form]', root);
  const msg = $('textarea', form);
  const btn = $('[type=submit]', form);
  setTimeout(() => msg.focus({ preventScroll: true }), 500);
  $('[data-close]', root).addEventListener('click', ctx.leave);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const say = (t) => ($('[data-note]', root).innerHTML = t);
    if (d._honey) return; // bots fill hidden fields
    if (!d.message.trim()) return say('Write a message first.'), msg.focus();
    if (!EMAIL_RE.test(d.email)) return say('Add your email so I can reply.'), $('[name=email]', form).focus();
    const subject = `Portfolio message from ${d.name || d.email}`;
    if (via === 'mailto') return (location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${d.message}\n\n${d.name} (${d.email})`)}`);
    say('Sending…');
    btn.disabled = true;
    const fail = `Couldn’t send. Please email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> directly.`;
    try {
      const r = via === 'web3forms'
        ? await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: web3formsKey, subject, name: d.name, email: d.email, message: d.message }) })
        : await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(site.email)}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: d.name, email: d.email, message: d.message, _subject: subject, _replyto: d.email, _template: 'table', _captcha: 'false' }) });
      const j = await r.json().catch(() => ({}));
      if (String(j.success) === 'true') return form.reset(), say('Sent. I’ll get back to you soon.');
      say(fail);
    } catch { say(fail); }
    btn.disabled = false;
  });
  return () => {};
}

// ── AirPods: now playing (keeps playing after the card closes) ──────────────
let stop = null;
let playing = '';
export function musicCard(root, ctx) {
  const paint = () => {
    root.innerHTML = `<div class="pc player">${close}<p class="eyebrow">AirPods</p><h2>Now <em>playing.</em></h2>
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

// ── the book: what I'm reading ──────────────────────────────────────────────
export function readingCard(root, ctx) {
  const b = desk.onDesk;
  root.innerHTML = `<div class="pc reading">${close}<p class="eyebrow">Currently reading</p>
    <div class="ondesk"><span class="cover" aria-hidden="true"><b>${esc(b.title)}</b><i>${esc(b.author)}</i><img src="https://covers.openlibrary.org/b/isbn/${esc(b.isbn)}-M.jpg?default=false" alt="" loading="lazy" onload="this.naturalWidth > 10 && this.classList.add('ok')" onerror="this.remove()"></span>
      <div><h2>${esc(b.title)}</h2><p>${esc(b.author)}</p></div></div></div>`;
  $('[data-close]', root).addEventListener('click', ctx.leave);
  return () => {};
}
