// ─────────────────────────────────────────────────────────────────────────────
//  EDIT (/edit/, the door in the front page's top bar): the owner signs in
//  with a password, changes the site's words, and presses Finalise, which
//  commits content/live.js through the GitHub API. The push redeploys.
//
//  How the password works, and why the public repo doesn't help anyone:
//  · Publishing needs a GitHub token that can write to this repo. GitHub
//    checks it; nothing on this page can get around that.
//  · Set up once: the owner pastes the token and picks a password. The token
//    is encrypted in the browser (AES-256-GCM, key from the password through
//    PBKDF2-SHA256 with 1,000,000 rounds) and only that ciphertext is saved,
//    as edit/lock.json. The password is never stored or sent anywhere.
//  · Sign in: the password decrypts the token in this browser. Without the
//    password, lock.json is noise; its only weakness is a guessable password,
//    so setup asks for a long one.
//  The token stays in session storage (or local storage with "stay signed
//  in") and is never in the repo. Drafts autosave in this browser.
// ─────────────────────────────────────────────────────────────────────────────
import { $, esc } from '../core/base.js';
import { COUNTER, KEY } from '../core/visits.js';
import { site } from '../../../content/site.js';
import { live as shipped } from '../../../content/live.js';
import { books, STATUSES } from '../../../content/books.js';

const REPO = `${site.github}/portfolio`;
const FILE = 'content/live.js';
const LOCK = 'edit/lock.json';
const API = 'https://api.github.com';
const MARK = 'export const live = ';
const ROUNDS = 1_000_000;
const MIN = 12; // shortest password setup accepts
// commits from here are signed with GitHub's no-reply address, never a real email
const WHO = { name: site.fullName, email: '214982224+saix0x0@users.noreply.github.com' };
const NEW_TOKEN = 'https://github.com/settings/personal-access-tokens/new';

const clone = (o) => JSON.parse(JSON.stringify(o));
const get = (k) => { try { return sessionStorage.getItem(k) ?? localStorage.getItem(k); } catch { return null; } };
const put = (k, v, keep) => { try { (keep ? localStorage : sessionStorage).setItem(k, v); } catch {} };
const drop = (k) => { try { sessionStorage.removeItem(k); localStorage.removeItem(k); } catch {} };

let token = get('edit:token') || '';
let login = '';
let lock = null;      // the encrypted token from edit/lock.json, if set up
let head = '';        // live.js's comment header, kept as it is
let sha = '';         // the version on GitHub this draft starts from
let base = clone(shipped);
let draft = clone(shipped);

// ── bytes and crypto ────────────────────────────────────────────────────────
const b64 = (u8) => { let s = ''; for (const n of u8) s += String.fromCharCode(n); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s.replace(/\s/g, '')), (c) => c.charCodeAt(0));
const utf8 = (s) => new TextEncoder().encode(s);
async function keyFrom(password, salt, rounds) {
  const raw = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: rounds }, raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function seal(secret, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFrom(password, salt, ROUNDS), utf8(secret)));
  return { v: 1, kdf: 'PBKDF2-SHA256', rounds: ROUNDS, cipher: 'AES-256-GCM', salt: b64(salt), iv: b64(iv), data: b64(data) };
}
async function unseal(l, password) {
  const k = await keyFrom(password, unb64(l.salt), l.rounds);
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(l.iv) }, k, unb64(l.data)));
}

// ── GitHub ──────────────────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const r = await fetch(API + path, { ...opts, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.message || r.statusText), { status: r.status });
  return body;
}
const text = (file) => new TextDecoder().decode(unb64(file.content));
async function save(path, content, message, prevSha) {
  return api(`/repos/${REPO}/contents/${path}`, { method: 'PUT', body: JSON.stringify({ message, content: b64(utf8(content)), ...(prevSha ? { sha: prevSha } : {}), committer: WHO, author: WHO }) });
}
function parse(t) {
  const i = t.indexOf(MARK);
  if (i < 0) throw new Error(`${FILE} doesn’t look like the editor’s file`);
  return { head: t.slice(0, i), data: JSON.parse(t.slice(i + MARK.length).trim().replace(/;$/, '')) };
}
const serialise = () => `${head}${MARK}${JSON.stringify(draft, null, 2)};\n`;

// the lock: the deployed copy, or GitHub's newest (right after setup)
async function readLock() {
  for (const u of ['lock.json', `https://raw.githubusercontent.com/${REPO}/main/${LOCK}`]) {
    try {
      const r = await fetch(u, { cache: 'no-store' });
      if (r.ok) return await r.json();
    } catch {}
  }
  return null;
}

// with a token in hand: check it, then load the newest words from GitHub
async function open() {
  const [me, repo] = await Promise.all([api('/user'), api(`/repos/${REPO}`)]);
  if (repo.permissions && !repo.permissions.push) throw Object.assign(new Error('read-only'), { status: 403 });
  const file = await api(`/repos/${REPO}/contents/${FILE}?ref=${repo.default_branch}`);
  ({ head, data: base } = parse(text(file)));
  sha = file.sha;
  login = me.login;
  const saved = JSON.parse(get('edit:draft') || 'null');
  draft = saved && (saved.sha === sha || !saved.sha) ? saved.data : clone(base);
}
const why = (e) => e.status === 401 ? 'GitHub turned the token down. It may have expired: set up again with a new one.'
  : e.status === 403 || e.status === 404 ? `That token can’t write to ${REPO}. It needs access to that repository with Contents: Read and write.`
  : e.name === 'OperationError' ? 'That’s not the password.'
  : `Something went wrong (${esc(e.message)}).`;

// ── screens ─────────────────────────────────────────────────────────────────
function show(signedIn) {
  $('[data-gate]').hidden = signedIn;
  $('[data-form]').hidden = !signedIn;
  $('[data-bar]').hidden = !signedIn;
  $('[data-who]').innerHTML = signedIn ? `@${esc(login)} · <button type="button" data-out>Sign out</button>` : '';
  if (signedIn) paintForm();
  else paintGate();
}
function paintGate(msg = '') {
  const note = msg ? `<p class="ed-err" role="alert">${msg}</p>` : '';
  $('[data-gate]').innerHTML = lock
    ? `<form class="ed-card ed-gate" data-signin><h2>Sign in</h2>
        <label class="ed-f"><span>Password</span><input type="password" name="pw" autocomplete="current-password" required autofocus></label>
        <label class="ed-check"><input type="checkbox" name="keep"> Stay signed in on this device</label>
        ${note}<button class="ed-go" type="submit">Sign in</button>
        <p class="ed-dim">Forgot it? <button type="button" class="ed-link" data-reset>Set up again</button> with a new GitHub token.</p></form>`
    : `<form class="ed-card ed-gate" data-setup><h2>Set up sign-in · once</h2>
        <p>After this, the door and your password are all you need, on any device.</p>
        <ol><li>Open <a href="${NEW_TOKEN}" target="_blank" rel="noopener">GitHub → new fine-grained token</a>. Name it “site editor”.</li>
          <li>Repository access: <b>Only select repositories → portfolio</b>.</li>
          <li>Permissions → Repository → <b>Contents: Read and write</b>. Nothing else.</li>
          <li>Generate, copy, paste it here.</li></ol>
        <label class="ed-f"><span>GitHub token</span><input type="password" name="tok" placeholder="github_pat_…" autocomplete="off" spellcheck="false" required></label>
        <label class="ed-f"><span>Choose a password</span><input type="password" name="pw" autocomplete="new-password" minlength="${MIN}" required><small>At least ${MIN} characters. Four random words work well. It can’t be recovered, but you can always set up again.</small></label>
        <label class="ed-f"><span>Password again</span><input type="password" name="pw2" autocomplete="new-password" required></label>
        ${note}<button class="ed-go" type="submit">Save and sign in</button>
        <p class="ed-dim">Only the encrypted token is saved, in the repo as <code>${LOCK}</code>. Without your password it can’t be read.</p></form>`;
}
async function busy(form, label, fn) {
  const b = form.querySelector('[type=submit]');
  const was = b.textContent;
  b.disabled = true;
  b.textContent = label;
  try { await fn(); } finally { b.disabled = false; b.textContent = was; }
}

// ── the form ────────────────────────────────────────────────────────────────
const at = (path) => path.split('.').reduce((o, k) => o?.[k], draft);
function set(path, v) {
  const ks = path.split('.');
  let o = draft;
  ks.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
  o[ks.at(-1)] = v;
}
const field = (path, label, { area = false, hint = '' } = {}) => `<label class="ed-f"><span>${esc(label)}</span>${area
  ? `<textarea data-p="${path}" rows="3">${esc(at(path) ?? '')}</textarea>`
  : `<input data-p="${path}" value="${esc(at(path) ?? '')}">`}${hint ? `<small>${esc(hint)}</small>` : ''}</label>`;
const rows = (key, cols, blank) => `<div class="ed-list">${(draft[key] || []).map((r, i) => `<div class="ed-item">${cols.map(([k, l, wide]) => `<label class="ed-f${wide ? ' wide' : ''}"><span>${esc(l)}</span><input data-p="${key}.${i}.${k}" value="${esc(r[k] ?? '')}"></label>`).join('')}
  <button type="button" class="ed-x" data-del="${key}.${i}" aria-label="Remove">×</button></div>`).join('')}
  <button type="button" class="ed-ghost" data-add="${key}" data-blank='${esc(JSON.stringify(blank))}'>+ Add</button></div>`;

function paintForm() {
  const id = (b) => b.isbn || b.title;
  $('[data-form]').innerHTML = `
  <section class="ed-card"><h2>Visits</h2><p class="ed-count"><b data-visits>…</b> visits so far</p>
    <p class="ed-dim">Just a number: one per browser session. Nothing about visitors is recorded.</p>
    <label class="ed-check"><input type="checkbox" data-skipme ${get('visits:skip') === '1' ? 'checked' : ''}> Don’t count my own visits from this browser</label></section>
  <section class="ed-card"><h2>Front page</h2>
    ${field('hero', 'Line under your name', { area: true })}
    ${field('about', 'About', { area: true })}</section>
  <section class="ed-card"><h2>The desk</h2>
    ${field('desk.wallLine', 'Line under your name on the wall')}
    ${field('tagline', 'About (the portrait on the desk)', { area: true })}
    <h3>Research card</h3>
    ${field('desk.research.title', 'Title', { hint: 'Empty keeps the card as “In progress. More soon.”' })}
    ${field('desk.research.lab', 'Lab or advisor')}
    ${field('desk.research.question', 'The question, in one line', { area: true })}
    ${field('desk.research.status', 'Status')}</section>
  <section class="ed-card"><h2>Experience</h2><p class="ed-dim">The first one is pinned to the note on the desk.</p>
    ${rows('experience', [['role', 'Role'], ['org', 'Organisation'], ['period', 'When'], ['kind', 'Kind'], ['note', 'One line', true]], { role: '', org: '', kind: '', period: '', note: '' })}</section>
  <section class="ed-card"><h2>Current focus</h2><p class="ed-dim">Shown with Experience on the desk. Lines starting with TODO stay hidden.</p>
    ${rows('now', [['label', 'Label'], ['text', 'What', true]], { label: '', text: '' })}</section>
  <section class="ed-card"><h2>What I think about</h2>
    <label class="ed-f"><span>One per line</span><textarea data-lines="interests" rows="6">${esc((draft.interests || []).join('\n'))}</textarea></label></section>
  <section class="ed-card"><h2>Library</h2><p class="ed-dim">Mark what you’re reading and what you’ve finished.</p>
    <div class="ed-books">${books.map((b) => `<label class="ed-book"><span><b>${esc(b.title)}</b><small>${esc(b.author)}</small></span>
      <select data-book="${esc(id(b))}">${Object.entries(STATUSES).map(([k, v]) => `<option value="${k}" ${(draft.books?.[id(b)] || b.status) === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`).join('')}</div></section>
  <section class="ed-card"><h2>Sign-in</h2>
    <form data-repw class="ed-row"><input type="password" name="pw" autocomplete="new-password" minlength="${MIN}" placeholder="New password (${MIN}+ characters)" aria-label="New password" required><button class="ed-ghost" type="submit">Change password</button></form></section>`;
  fetch(`${COUNTER}/get/${KEY}`).then((r) => (r.ok ? r.json() : { value: 0 })).then((j) => ($('[data-visits]').textContent = (j.value || 0).toLocaleString())).catch(() => ($('[data-visits]').textContent = '—'));
  count();
}

// ── changes ─────────────────────────────────────────────────────────────────
function count() {
  const n = Object.keys({ ...base, ...draft }).filter((k) => JSON.stringify(base[k]) !== JSON.stringify(draft[k])).length;
  $('[data-count]').textContent = n ? `${n} section${n > 1 ? 's' : ''} changed` : 'No changes';
  $('[data-bar]').classList.toggle('dirty', n > 0);
  $('[data-final]').disabled = !n;
  if (n) put('edit:draft', JSON.stringify({ sha, data: draft }), true);
  else drop('edit:draft');
}
function status(html, kind) {
  let el = $('.ed-status');
  if (!el) (el = document.createElement('p')), $('[data-bar]').before(el);
  el.className = `ed-status ${kind}`;
  el.innerHTML = html;
}
async function finalise() {
  const btn = $('[data-final]');
  btn.disabled = true;
  btn.textContent = 'Publishing…';
  const note = $('[data-msg]').value.trim();
  try {
    const res = await save(FILE, serialise(), `Edit from the site${note ? `: ${note}` : ''}`, sha);
    sha = res.content.sha;
    base = clone(draft);
    drop('edit:draft');
    $('[data-msg]').value = '';
    status(`Published. The live site updates in about a minute. <a href="https://github.com/${REPO}/actions" target="_blank" rel="noopener">Watch it deploy ↗</a>`, 'ok');
  } catch (e) {
    status(e.status === 409 || e.status === 422 ? 'The site was changed somewhere else since you opened this. Your draft is saved: reload, then Finalise again.' : `Not published. ${why(e)}`, 'err');
  }
  btn.innerHTML = 'Finalise &amp; publish';
  count();
}
async function writeLock(password, message) {
  let prev = '';
  try { prev = (await api(`/repos/${REPO}/contents/${LOCK}`)).sha; } catch {}
  lock = await seal(token, password);
  await save(LOCK, `${JSON.stringify(lock, null, 2)}\n`, message, prev);
}

// ── events ──────────────────────────────────────────────────────────────────
document.addEventListener('submit', async (e) => {
  const f = e.target;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  if (f.matches('[data-signin]')) {
    await busy(f, 'Unlocking…', async () => {
      try {
        token = await unseal(lock, v.pw);
        await open();
        put('edit:token', token, !!v.keep);
        show(true);
      } catch (err) { token = ''; paintGate(why(err)); }
    });
  } else if (f.matches('[data-setup]')) {
    if (v.pw.length < MIN) return paintGate(`The password needs at least ${MIN} characters.`);
    if (v.pw !== v.pw2) return paintGate('The two passwords don’t match.');
    await busy(f, 'Saving…', async () => {
      try {
        token = v.tok.trim();
        await open();
        await writeLock(v.pw, 'Editor: set up sign-in (encrypted token)');
        put('edit:token', token, false);
        show(true);
        status('Sign-in is set up. Next time: the door, then your password.', 'ok');
      } catch (err) { token = ''; paintGate(why(err)); }
    });
  } else if (f.matches('[data-repw]')) {
    if (v.pw.length < MIN) return status(`The password needs at least ${MIN} characters.`, 'err');
    try {
      await writeLock(v.pw, 'Editor: change password');
      f.reset();
      status('Password changed.', 'ok');
    } catch (err) { status(why(err), 'err'); }
  }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.p) set(t.dataset.p, t.value);
  else if (t.dataset.lines) draft[t.dataset.lines] = t.value.split('\n').map((s) => s.trim()).filter(Boolean);
  else return;
  count();
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.book) (draft.books ??= {})[t.dataset.book] = t.value, count();
  if (t.matches('[data-skipme]')) t.checked ? put('visits:skip', '1', true) : drop('visits:skip');
});
document.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t || t.type === 'submit') return;
  if (t.dataset.add) (draft[t.dataset.add] ??= []).push(JSON.parse(t.dataset.blank)), paintForm();
  else if (t.dataset.del) {
    const [k, i] = t.dataset.del.split('.');
    draft[k].splice(+i, 1);
    paintForm();
  } else if (t.matches('[data-out]')) {
    drop('edit:token');
    token = login = '';
    show(false);
  } else if (t.matches('[data-reset]')) {
    lock = null;
    paintGate();
  } else if (t.matches('[data-discard]')) {
    draft = clone(base);
    paintForm();
  } else if (t.matches('[data-final]')) finalise();
});

// ── start: signed in already on this device? otherwise the gate ─────────────
lock = await readLock();
if (token) {
  try { await open(); show(true); } catch { drop('edit:token'); token = ''; show(false); }
} else show(false);
