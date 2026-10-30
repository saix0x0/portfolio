// ─────────────────────────────────────────────────────────────────────────────
//  SEALED ROOMS (Vault + Observatory)
//
//  What this is: the page downloads an ENCRYPTED file (AES-256-GCM, key derived
//  from your passphrase with PBKDF2-SHA256, 600k iterations). Decryption happens
//  in your browser. The plaintext and the passphrase are never in the repo, never
//  in the JS, and never sent anywhere.
//
//  What this is not: server-side authentication. Anyone can download the
//  encrypted file and try passphrases offline, so protection = passphrase
//  strength. Use a long passphrase (5+ random words). Never store passwords,
//  bank details or ID numbers here. See docs/ARCHITECTURE.md → "Private rooms".
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, h, esc, href } from './base.js';

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toB64 = (u8) => btoa(String.fromCharCode(...new Uint8Array(u8)));

async function deriveKey(pass, payload, extractable) {
  const mat = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iter, hash: 'SHA-256' }, mat, { name: 'AES-GCM', length: 256 }, extractable, ['decrypt']);
}
async function decrypt(key, payload) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, key, b64(payload.ct));
  return new TextDecoder().decode(pt);
}

// ── tiny, safe markdown (escapes first; only http(s)/mailto/relative links) ─
function inline(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => (/^(https?:|mailto:|\/|\.|#)/.test(u.replace(/&amp;/g, '&')) ? `<a href="${u}" target="_blank" rel="noopener">${t}</a>` : t))
    .replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
}
export function markdown(src) {
  const lines = esc(src).split('\n');
  let out = '';
  let list = null;
  let code = null;
  let para = [];
  const flush = () => {
    if (para.length) out += `<p>${inline(para.join(' '))}</p>`;
    para = [];
    if (list) out += `</${list}>`;
    list = null;
  };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (code !== null) {
      if (l.startsWith('```')) { out += `<pre><code>${code}</code></pre>`; code = null; } else code += raw + '\n';
      continue;
    }
    if (l.startsWith('```')) { flush(); code = ''; continue; }
    let m;
    if (!l.trim()) { flush(); continue; }
    if ((m = l.match(/^(#{1,4})\s+(.*)/))) { flush(); const n = Math.min(4, m[1].length + 1); out += `<h${n}>${inline(m[2])}</h${n}>`; continue; }
    if (/^(-{3,}|\*{3,})$/.test(l)) { flush(); out += '<hr>'; continue; }
    if ((m = l.match(/^&gt;\s?(.*)/))) { flush(); out += `<blockquote>${inline(m[1])}</blockquote>`; continue; }
    if ((m = l.match(/^\s*(?:[-*]|(\d+)\.)\s+(.*)/))) {
      const type = m[1] ? 'ol' : 'ul';
      if (para.length) { out += `<p>${inline(para.join(' '))}</p>`; para = []; }
      if (list !== type) { if (list) out += `</${list}>`; out += `<${type}>`; list = type; }
      const item = m[2].replace(/^\[( |x)\]\s*/, (_, x) => (x === 'x' ? '☑ ' : '☐ '));
      out += `<li>${inline(item)}</li>`;
      continue;
    }
    if (list) { out += `</${list}>`; list = null; }
    para.push(l.trim());
  }
  flush();
  return out;
}

const LOCK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#6ff5c4" stroke-width="1.4" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4" fill="#6ff5c4"/></svg>`;

/** Mount a sealed room into `root`. */
export async function mountVault(root, { file, title, prompt, sky }) {
  const SKEY = 'room:' + file;
  let payload;
  try {
    const res = await fetch(href(file), { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    payload = await res.json();
  } catch {
    root.innerHTML = `<div class="room-gate"><div class="room-lock"><div class="lock-ring">${LOCK_SVG}</div><h1 style="font-size:var(--step-3)">${esc(title)}</h1><p class="vault-note">This room hasn’t been sealed yet. Run <code>npm run seal</code> (see README).</p></div></div>`;
    return;
  }

  const gate = h(`<div class="room-gate"><div class="room-lock">
      <div class="lock-ring">${LOCK_SVG}</div>
      <h1 style="font-size:var(--step-3)">${esc(title)}</h1>
      <p class="lede" style="margin:0 auto">${esc(prompt)}</p>
      <form>
        <label class="sr-only" for="pass">Passphrase</label>
        <input class="field" id="pass" type="password" autocomplete="current-password" placeholder="passphrase" required>
        <label class="meta" style="display:flex;gap:8px;justify-content:center;align-items:center"><input type="checkbox" data-remember> Stay unlocked until I close this tab</label>
        <button class="btn primary" type="submit" style="justify-self:center">Unlock</button>
        <p class="meta" data-msg role="status" aria-live="polite"></p>
      </form>
      <p class="vault-note">Encrypted with AES-256. Unlocking happens entirely in your browser — nothing is sent anywhere.</p>
    </div></div>`);

  const open = (text) => {
    const sections = text.split(/^(?=## )/m).filter((s) => s.trim());
    const intro = sections[0] && !sections[0].startsWith('## ') ? sections.shift() : '';
    root.innerHTML = '';
    const view = h(`<div>
      <header class="page-head"><p class="kicker"><span class="dot"></span>${esc(title)} · unlocked</p>${intro ? `<div class="lede">${markdown(intro)}</div>` : ''}</header>
      <div class="vault-tools"><label class="search"><span class="sr-only">Search</span><input class="field" type="search" placeholder="Search this room…" data-own-slash></label>
        <div class="row"><span class="meta">${sections.length} sections</span><button class="btn small" type="button" data-lock>Lock ⟲</button></div></div>
      <div class="vault-grid">${sections.map((s) => `<section class="vault-card panel">${markdown(s)}</section>`).join('')}</div></div>`);
    root.append(view);
    $('input', view).addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      $$('.vault-card', view).forEach((c) => c.classList.toggle('hide', !!q && !c.textContent.toLowerCase().includes(q)));
    });
    $('[data-lock]', view).addEventListener('click', () => {
      sessionStorage.removeItem(SKEY);
      root.innerHTML = '';
      root.append(gate);
      $('input', gate).value = '';
      $('input', gate).focus();
    });
    sky?.aurora(6);
  };

  // remembered for this tab?
  try {
    const saved = JSON.parse(sessionStorage.getItem(SKEY) || 'null');
    if (saved && saved.salt === payload.salt) {
      const key = await crypto.subtle.importKey('raw', b64(saved.k), 'AES-GCM', false, ['decrypt']);
      return open(await decrypt(key, payload));
    }
  } catch {}

  root.append(gate);
  const form = $('form', gate);
  const msg = $('[data-msg]', gate);
  const lock = $(".room-lock", gate);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = $('#pass', gate).value;
    msg.textContent = 'Turning the key…';
    const remember = $('[data-remember]', gate).checked;
    try {
      const key = await deriveKey(pass, payload, remember);
      const text = await decrypt(key, payload);
      if (remember) {
        try { sessionStorage.setItem(SKEY, JSON.stringify({ salt: payload.salt, k: toB64(await crypto.subtle.exportKey('raw', key)) })); } catch {}
      }
      lock.classList.add('opening');
      setTimeout(() => open(text), 600);
    } catch {
      msg.textContent = 'That isn’t it.';
      lock.classList.remove('shake');
      void lock.offsetWidth;
      lock.classList.add('shake');
    }
  });
  $('#pass', gate).focus();
}
