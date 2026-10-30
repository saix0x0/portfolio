// ─────────────────────────────────────────────────────────────────────────────
//  CONTACT POSTCARD
//  Honest about delivery: it says exactly what will happen before you press send.
//   • provider 'web3forms' + key  → POSTs to Web3Forms, which emails you.
//   • otherwise                   → opens the visitor's own mail app (mailto:).
//   • no email configured at all  → the form explains it isn't set up yet.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, h, esc, toast, copy, reducedMotion } from './base.js';
import { site } from '../../../content/site.js';

const STAMPS = [
  { id: 'paris', label: 'Paris', bg: 'linear-gradient(#1d2858,#e27486 60%,#ffc488)' },
  { id: 'rome', label: 'Roma', bg: 'linear-gradient(#24163d,#f0653d 60%,#ffbc60)' },
  { id: 'rio', label: 'Rio', bg: 'linear-gradient(#172569,#ff5888 60%,#ffad66)' },
  { id: 'nyc', label: 'NYC', bg: 'linear-gradient(#0c1334,#d65a7a 60%,#ff9e54)' },
  { id: 'arctic', label: 'Tromsø', bg: 'linear-gradient(#04122e,#0a2946 55%,#3fd6a8)' },
];
const TOPICS = ['Hiring', 'Collaboration', 'Research', 'Just saying hi'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function mountContact(root) {
  const { provider, web3formsKey } = site.contact;
  const live = provider === 'web3forms' && web3formsKey;
  const configured = live || site.email;
  const note = live
    ? 'Your message goes straight to my inbox. I’ll reply to the email you give.'
    : site.email
      ? 'Pressing send opens your own email app with this message ready to go.'
      : 'This form isn’t connected yet — the site owner still needs to add an email in content/site.js.';
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const form = h(`<form class="postcard" novalidate>
    <div class="left">
      <label>From<input name="name" autocomplete="name" required placeholder="Your name"><span class="err" data-err="name"></span></label>
      <label>Reply to<input name="email" type="email" autocomplete="email" required placeholder="you@somewhere.com"><span class="err" data-err="email"></span></label>
      <fieldset class="topics"><legend>About</legend>${TOPICS.map((t, i) => `<label><input type="radio" name="topic" value="${esc(t)}" ${i === 0 ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}</fieldset>
      <label>Message<textarea name="message" rows="5" required placeholder="Write something under the northern lights…"></textarea><span class="err" data-err="message"></span></label>
      <input type="text" name="botcheck" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
    </div>
    <div class="right">
      <div class="stamps" role="group" aria-label="Choose a stamp">${STAMPS.map((s, i) => `<button type="button" class="stamp" data-stamp="${s.id}" aria-pressed="${i === 4}" aria-label="${s.label} stamp"><i style="background:${s.bg}">${s.label}</i></button>`).join('')}</div>
      <div class="postmark" aria-hidden="true">POSTED<br>${esc(today.toUpperCase())}<br>VIA THE SKY</div>
      <div class="address"><span>${esc(site.fullName)}</span><span>Somewhere under a sunset</span><span>${esc(site.college)}</span></div>
      <p class="form-note">${esc(note)}</p>
      <div class="status-msg" role="status" aria-live="polite" hidden></div>
      <div class="row">
        <button class="btn send" type="submit" ${configured ? '' : 'disabled'}>Send postcard ✈</button>
        ${site.email ? `<button class="btn small" type="button" data-copy style="color:#2b1d14;border-color:rgba(120,80,40,.4);background:transparent">Copy email</button>` : ''}
      </div>
    </div></form>`);
  root.append(form);

  let stamp = 'arctic';
  $$('.stamp', form).forEach((b) =>
    b.addEventListener('click', () => {
      $$('.stamp', form).forEach((x) => x.setAttribute('aria-pressed', x === b));
      stamp = b.dataset.stamp;
    })
  );
  $('[data-copy]', form)?.addEventListener('click', async () => toast((await copy(site.email)) ? `Copied ${site.email}` : site.email, { icon: '⧉' }));

  const status = $('.status-msg', form);
  const say = (msg, ok) => {
    status.hidden = false;
    status.className = 'status-msg ' + (ok ? 'ok' : 'bad');
    status.innerHTML = msg;
  };

  const validate = () => {
    const d = Object.fromEntries(new FormData(form));
    const errs = {
      name: d.name.trim() ? '' : 'Please add your name.',
      email: !d.email.trim() ? 'I’ll need an email to reply to.' : EMAIL_RE.test(d.email.trim()) ? '' : 'That email doesn’t look quite right.',
      message: d.message.trim().length >= 5 ? '' : 'Write at least a few words.',
    };
    for (const [k, v] of Object.entries(errs)) {
      $(`[data-err="${k}"]`, form).textContent = v;
      form.elements[k].setAttribute('aria-invalid', v ? 'true' : 'false');
    }
    const first = Object.keys(errs).find((k) => errs[k]);
    if (first) form.elements[first].focus();
    return first ? null : d;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = validate();
    if (!d || d.botcheck) return;
    const subject = `[${d.topic}] Postcard from ${d.name.trim()}`;
    const btn = $('.send', form);

    if (!live) {
      const body = `${d.message.trim()}\n\n— ${d.name.trim()} (${d.email.trim()})\nStamp: ${stamp}`;
      location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      say(`Your mail app should have opened with the postcard ready — press send there. Nothing opened? Email <b>${esc(site.email)}</b> directly.`, true);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: web3formsKey, subject, from_name: d.name, name: d.name, email: d.email, message: d.message, topic: d.topic, stamp, botcheck: '' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || res.statusText);
      if (!reducedMotion()) {
        const r = form.getBoundingClientRect();
        const plane = h(`<div class="plane" style="left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px" aria-hidden="true">✈</div>`);
        document.body.append(plane);
        setTimeout(() => plane.remove(), 2300);
      }
      form.reset();
      say(`Postcard delivered. I’ll write back to <b>${esc(d.email)}</b>.`, true);
      toast('Postcard sent ✈', { icon: '✉' });
    } catch (err) {
      say(`It didn’t go through (${esc(err.message || 'network error')}). ${site.email ? `You can email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> instead.` : 'Please try again later.'}`, false);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send postcard ✈';
    }
  });
}
