// ─────────────────────────────────────────────────────────────────────────────
//  SMALL THINGS ON THE DESK
//   keyboard → typeSheet     (a typing test; every key clicks and lights up)
//   #contact → contactSheet  (the message form, reached from the header)
//   AirPods  → musicCard     (three original synth loops)
// ─────────────────────────────────────────────────────────────────────────────
import { $, esc, href } from '../core/base.js';
import { site } from '../../../content/site.js';
import { desk } from '../../../content/desk.js';
import { RECORDS, loop, isMuted, setMuted, note } from '../world/sound.js';

const close = '<button class="x" type="button" data-close aria-label="Back to the desk">×</button>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── contact: reach out (each key you press lights up on the photo) ─────────
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

// ── keyboard: a typing test ─────────────────────────────────────────────────
// Timed runs of 15, 30 or 60 seconds. The words come from content/desk.js.
// Every key clicks (pick the switch sound) and lights up on the photo, and
// the keyboard's RGB can be changed from here.
const SOUNDS = {
  clicky: (sp) => (note(sp ? 2100 : 2600 + Math.random() * 500, { dur: 0.018, type: 'square', vol: 0.05 }), note(sp ? 700 : 1300, { dur: 0.03, type: 'square', vol: 0.035, at: 0.012 })),
  thock: (sp) => note(sp ? 95 : 130 + Math.random() * 40, { dur: 0.06, type: 'triangle', vol: 0.32, slide: 0.6 }),
  off: () => {},
};
const pick = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const keep = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
export function typeSheet(root, ctx) {
  let secs = +pick('type:secs', 30);
  let sound = pick('type:sound', 'clicky');
  let words = [];
  let wi = 0;
  let typed = '';
  let done = [];
  let t0 = 0;
  let timer = 0;
  let keys = 0;
  let good = 0;
  let over = false;
  const best = () => +pick(`type:best:${secs}`, 0);
  const seg = (name, opts, cur) => `<span class="seg" role="group" aria-label="${name}">${opts.map(([v, l]) => `<button type="button" data-${name}="${v}" aria-pressed="${String(v) === String(cur)}">${l}</button>`).join('')}</span>`;
  root.innerHTML = `<div class="sh tt">${close}
    <div class="tt-head"><div><p class="eyebrow">Keyboard</p><h2>How fast do you <em>type?</em></h2></div>
      <div class="tt-opts">${seg('secs', [[15, '15s'], [30, '30s'], [60, '60s']], secs)}${seg('sound', [['clicky', 'Clicky'], ['thock', 'Thock'], ['off', 'Silent']], sound)}${seg('rgb', [['wave', 'Wave'], ['lamp', 'Lamp'], ['stock', 'Stock']], ctx.lights.state.rgb)}</div></div>
    <div class="tt-stats"><span><b data-wpm>0</b> wpm</span><span><b data-acc>100</b>% accuracy</span><span><b data-left>${secs}</b>s left</span><span class="muted" data-best></span></div>
    <div class="tt-box" data-box><div class="tt-words" data-words></div><input class="tt-in" data-in autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the words shown"><p class="tt-go" data-go>Click here and start typing</p></div>
    <p class="muted small tt-foot"><kbd>Tab</kbd> restarts · <kbd>Esc</kbd> back to the desk · your keys light up on the photo above</p></div>`;
  const $$q = (q) => $(q, root);
  const box = $$q('[data-box]');
  const input = $$q('[data-in]');
  const paintBest = () => ($$q('[data-best]').textContent = best() ? `Your best at ${secs}s: ${best()} wpm` : '');
  const deal = () => {
    const pool = desk.typing;
    words = Array.from({ length: 80 }, () => pool[Math.floor(Math.random() * pool.length)]);
  };
  const render = () => {
    const html = words.slice(0, wi + 40).map((w, i) => {
      if (i < wi) return `<span class="w ${done[i] === w ? 'ok' : 'bad'}">${esc(w)}</span>`;
      if (i > wi) return `<span class="w">${esc(w)}</span>`;
      const chars = [...w].map((c, j) => `<i class="${j < typed.length ? (typed[j] === c ? 'ok' : 'bad') : ''}${j === typed.length ? ' caret' : ''}">${esc(c)}</i>`).join('');
      const extra = typed.length > w.length ? `<i class="bad x">${esc(typed.slice(w.length))}</i>` : '';
      return `<span class="w cur">${chars}${extra}${typed.length >= w.length ? '<i class="caret end"></i>' : ''}</span>`;
    }).join(' ');
    const el = $$q('[data-words]');
    el.innerHTML = html;
    const cur = $('.cur', el);
    if (cur) el.scrollTop = Math.max(0, cur.offsetTop - el.offsetTop - 44);
  };
  const correctChars = () => done.reduce((s, w, i) => s + (w === words[i] ? w.length + 1 : 0), 0);
  const stats = () => {
    const min = t0 ? Math.max((Math.min(Date.now() - t0, secs * 1000)) / 60000, 1 / 60) : 0;
    $$q('[data-wpm]').textContent = min ? Math.round(correctChars() / 5 / min) : 0;
    $$q('[data-acc]').textContent = keys ? Math.round((good / keys) * 100) : 100;
    $$q('[data-left]').textContent = t0 ? Math.max(0, Math.ceil(secs - (Date.now() - t0) / 1000)) : secs;
  };
  const finish = () => {
    clearInterval(timer);
    over = true;
    input.blur();
    const wpm = Math.round(correctChars() / 5 / (secs / 60));
    const acc = keys ? Math.round((good / keys) * 100) : 100;
    const pb = wpm > best();
    if (pb) keep(`type:best:${secs}`, wpm);
    box.classList.add('over');
    $$q('[data-go]').innerHTML = `<b>${wpm} wpm</b><span>${acc}% accuracy${pb ? ' · <span class="pb">new personal best</span>' : ''}</span><button class="btn" type="button" data-again>Go again</button>`;
    paintBest();
  };
  const reset = () => {
    clearInterval(timer);
    deal();
    wi = 0; typed = ''; done = []; t0 = 0; keys = 0; good = 0; over = false;
    input.value = '';
    box.classList.remove('over', 'live');
    $$q('[data-go]').textContent = 'Click here and start typing';
    render();
    stats();
    paintBest();
  };
  input.addEventListener('input', () => {
    if (over) return (input.value = '');
    const v = input.value;
    if (!t0 && v.trim()) {
      t0 = Date.now();
      box.classList.add('live');
      timer = setInterval(() => { stats(); if (Date.now() - t0 >= secs * 1000) finish(); }, 200);
    }
    // phones and pastes can deliver several characters (and spaces) at once
    const parts = v.split(' ');
    const last = parts.pop();
    for (const part of parts) {
      SOUNDS[sound](true);
      if (!part) continue;
      done[wi] = part;
      keys++;
      if (part === words[wi]) good++;
      wi++;
    }
    if (parts.length) typed = '';
    const w = words[wi];
    for (let j = typed.length; j < last.length; j++) {
      keys++;
      if (last[j] === w[j]) good++;
    }
    if (!parts.length) SOUNDS[sound](false);
    typed = last;
    if (input.value !== last) input.value = last;
    render();
    stats();
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Tab') e.preventDefault(), reset(), input.focus(); });
  box.addEventListener('click', () => { if (!over) input.focus({ preventScroll: true }); });
  input.addEventListener('focus', () => box.classList.add('focus'));
  input.addEventListener('blur', () => box.classList.remove('focus'));
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return ctx.leave();
    if (e.target.closest('[data-again]')) return e.stopPropagation(), reset(), input.focus();
    const b = e.target.closest('[data-secs], [data-sound], [data-rgb]');
    if (!b) return;
    const [k, v] = Object.entries(b.dataset)[0];
    b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (k === 'secs') (secs = +v), keep('type:secs', v), reset();
    if (k === 'sound') (sound = v), keep('type:sound', v), v !== 'off' && isMuted() && setMuted(false), SOUNDS[v](false);
    if (k === 'rgb') ctx.lights.rgb(v);
    input.focus({ preventScroll: true });
  });
  reset();
  setTimeout(() => input.focus({ preventScroll: true }), 500);
  return () => clearInterval(timer);
}
