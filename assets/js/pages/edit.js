// ─────────────────────────────────────────────────────────────────────────────
//  EDIT (/edit/): the owner changes the site's words here and presses
//  Finalise, which commits content/live.js through the GitHub API. The push
//  redeploys the site (GitHub Pages, and Vercel if connected).
//
//  Who can publish: anyone can open this page, but a commit needs a GitHub
//  token with write access to the repo, and GitHub checks that, not this page.
//  The token is typed in by the owner and stays in their browser (session or
//  local storage). It is never in the repo. The draft autosaves in this
//  browser until it is published or discarded.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc } from '../core/base.js';
import { site } from '../../../content/site.js';
import { live as shipped } from '../../../content/live.js';
import { books, STATUSES } from '../../../content/books.js';

const REPO = `${site.github}/portfolio`;
const FILE = 'content/live.js';
const API = 'https://api.github.com';
const MARK = 'export const live = ';
// commits from here are signed with GitHub's no-reply address, never a real email
const WHO = { name: site.fullName, email: '214982224+saix0x0@users.noreply.github.com' };
const NEW_TOKEN = 'https://github.com/settings/personal-access-tokens/new';

const clone = (o) => JSON.parse(JSON.stringify(o));
const get = (k) => { try { return sessionStorage.getItem(k) ?? localStorage.getItem(k); } catch { return null; } };
const put = (k, v, keep) => { try { (keep ? localStorage : sessionStorage).setItem(k, v); } catch {} };
const drop = (k) => { try { sessionStorage.removeItem(k); localStorage.removeItem(k); } catch {} };

let token = get('edit:token') || '';
let login = '';
let head = '';        // the file's comment header, kept as it is
let sha = '';         // the version on GitHub this draft starts from
let base = clone(shipped);
let draft = clone(shipped);

// ── GitHub ──────────────────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const r = await fetch(API + path, { ...opts, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.message || r.statusText), { status: r.status });
  return body;
}
const fromB64 = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
const toB64 = (s) => { let out = ''; for (const n of new TextEncoder().encode(s)) out += String.fromCharCode(n); return btoa(out); };
function parse(text) {
  const i = text.indexOf(MARK);
  if (i < 0) throw new Error(`${FILE} doesn’t look like the editor’s file`);
  return { head: text.slice(0, i), data: JSON.parse(text.slice(i + MARK.length).trim().replace(/;$/, '')) };
}
const serialise = () => `${head}${MARK}${JSON.stringify(draft, null, 2)};\n`;

async function connect() {
  const box = $('[data-connect]');
  box.querySelector('[data-state]').textContent = 'Checking with GitHub…';
  try {
    const [me, repo] = await Promise.all([api('/user'), api(`/repos/${REPO}`)]);
    if (repo.permissions && !repo.permissions.push) throw Object.assign(new Error('read-only'), { status: 403 });
    const file = await api(`/repos/${REPO}/contents/${FILE}?ref=${repo.default_branch}`);
    ({ head } = parse(fromB64(file.content)));
    base = parse(fromB64(file.content)).data;
    sha = file.sha;
    login = me.login;
    const saved = JSON.parse(get('edit:draft') || 'null');
    draft = saved && (saved.sha === sha || !saved.sha) ? saved.data : clone(base);
    paintConnect();
    paintForm();
  } catch (e) {
    const why = e.status === 401 ? 'GitHub didn’t accept that token.'
      : e.status === 403 || e.status === 404 ? `That token can’t write to ${REPO}. Give it access to that repository with Contents: Read and write.`
      : `Couldn’t reach GitHub (${esc(e.message)}).`;
    box.querySelector('[data-state]').innerHTML = `<span class="ed-err">${why}</span>`;
  }
}

async function finalise() {
  const btn = $('[data-final]');
  if (!login) return $('[data-token]')?.focus();
  btn.disabled = true;
  btn.textContent = 'Publishing…';
  const note = $('[data-msg]').value.trim();
  try {
    const res = await api(`/repos/${REPO}/contents/${FILE}`, {
      method: 'PUT',
      body: JSON.stringify({ message: `Edit from the site${note ? `: ${note}` : ''}`, content: toB64(serialise()), sha, committer: WHO, author: WHO }),
    });
    sha = res.content.sha;
    base = clone(draft);
    drop('edit:draft');
    $('[data-msg]').value = '';
    status(`Published. The live site updates in about a minute. <a href="https://github.com/${REPO}/actions" target="_blank" rel="noopener">Watch it deploy ↗</a>`, 'ok');
  } catch (e) {
    status(e.status === 409 || e.status === 422
      ? 'The site was changed somewhere else since you opened this. Your draft is saved: reload the page, then Finalise again.'
      : e.status === 403 ? 'This token can read but not publish. Give it Contents: Read and write.'
      : `Not published: ${esc(e.message)}`, 'err');
  }
  btn.disabled = false;
  btn.innerHTML = 'Finalise &amp; publish';
  count();
}

// ── the connect card ────────────────────────────────────────────────────────
function paintConnect() {
  $('[data-who]').textContent = login ? `@${login}` : 'Not connected';
  $('[data-connect]').innerHTML = login
    ? `<h2>Connected</h2><p data-state>Publishing to <b>${esc(REPO)}</b> as <b>@${esc(login)}</b>.</p>
       <label class="ed-check"><input type="checkbox" data-skipme ${get('visits:skip') === '1' ? 'checked' : ''}> Don’t count my own visits from this browser</label>
       <p><button type="button" class="ed-ghost" data-out>Disconnect this browser</button></p>`
    : `<h2>Connect to publish</h2>
       <p>Paste a GitHub token that can write to <b>${esc(REPO)}</b>. It stays in this browser and is never saved in the repo.</p>
       <details><summary>How to make one (two minutes)</summary><ol>
         <li>Open <a href="${NEW_TOKEN}" target="_blank" rel="noopener">GitHub → Fine-grained token</a>.</li>
         <li>Repository access: <b>Only select repositories</b> → <b>portfolio</b>.</li>
         <li>Permissions → Repository → <b>Contents: Read and write</b>. Nothing else.</li>
         <li>Generate, copy, paste below.</li></ol></details>
       <div class="ed-row"><input type="password" data-token placeholder="github_pat_…" aria-label="GitHub token" spellcheck="false">
       <button type="button" class="ed-go" data-connect-go>Connect</button></div>
       <label class="ed-check"><input type="checkbox" data-keep> Remember on this browser</label>
       <p data-state class="ed-dim">You can edit without connecting; Finalise asks for the token.</p>`;
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
const rows = (key, cols, blank) => `<div class="ed-list" data-list="${key}">${(draft[key] || []).map((r, i) => `<div class="ed-item">${cols.map(([k, l, wide]) => `<label class="ed-f${wide ? ' wide' : ''}"><span>${esc(l)}</span><input data-p="${key}.${i}.${k}" value="${esc(r[k] ?? '')}"></label>`).join('')}
  <button type="button" class="ed-x" data-del="${key}.${i}" aria-label="Remove">×</button></div>`).join('')}
  <button type="button" class="ed-ghost" data-add="${key}" data-blank='${esc(JSON.stringify(blank))}'>+ Add</button></div>`;

function paintForm() {
  const id = (b) => b.isbn || b.title;
  $('[data-form]').innerHTML = `
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
  <section class="ed-card"><h2>Visits</h2>
    ${field('analytics.goatcounter', 'GoatCounter site code', { hint: 'Sign up free at goatcounter.com, pick a code (e.g. saisiddhanth), paste it here. Empty turns counting off.' })}
    ${draft.analytics?.goatcounter ? `<p><a href="https://${esc(draft.analytics.goatcounter)}.goatcounter.com" target="_blank" rel="noopener">Open your visitor dashboard ↗</a></p>` : ''}</section>`;
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
  if (!el) (el = document.createElement('p')), (el.className = 'ed-status'), $('[data-bar]').before(el);
  el.className = `ed-status ${kind}`;
  el.innerHTML = html;
}

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
  if (!t) return;
  if (t.dataset.add) (draft[t.dataset.add] ??= []).push(JSON.parse(t.dataset.blank)), paintForm();
  else if (t.dataset.del) {
    const [k, i] = t.dataset.del.split('.');
    draft[k].splice(+i, 1);
    paintForm();
  } else if (t.matches('[data-connect-go]')) {
    token = $('[data-token]').value.trim();
    if (!token) return;
    put('edit:token', token, $('[data-keep]').checked);
    connect();
  } else if (t.matches('[data-out]')) {
    drop('edit:token');
    token = login = '';
    paintConnect();
  } else if (t.matches('[data-discard]')) {
    draft = clone(base);
    paintForm();
  } else if (t.matches('[data-final]')) finalise();
});

const saved = JSON.parse(get('edit:draft') || 'null');
if (saved) draft = saved.data;
paintConnect();
paintForm();
if (token) connect();
