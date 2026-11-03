// ─────────────────────────────────────────────────────────────────────────────
//  THE BROWSER'S LIVE TABS — everything here is read from GitHub at view time
//  (core/github.js caches it), so new repos and commits show up on their own.
//   #browser/overview   the one-minute version: who, featured work, languages, links
//   #browser/github     profile, language mix, activity, every public repo
//   #browser/r:<repo>   one repo: stats, languages, commits, rendered README
//  Project pages call liveRepo() to add the same live panel under the story.
// ─────────────────────────────────────────────────────────────────────────────
import { $, $$, esc, href } from '../core/base.js';
import { gh, USER, ago, langColour, cleanReadme } from '../core/github.js';
import { site } from '../../../content/site.js';
import { projects, CATEGORIES } from '../../../content/projects.js';

const ghUrl = `https://github.com/${USER}`;
const byRepo = (name) => projects.find((p) => p.repo && p.repo.toLowerCase() === String(name).toLowerCase());
const offline = (what) => `<p class="muted gh-off">GitHub didn’t answer (${esc(what)}). Everything is still on <a href="${esc(ghUrl)}" target="_blank" rel="noopener">github.com/${esc(USER)} ↗</a>.</p>`;
// GitHub said no and nothing is cached: list the repos we know from content/projects.js
const fallback = (e) => `${offline(why(e))}<ul class="repos">${projects.filter((p) => p.repo).map((p) => `<li><a href="https://github.com/${esc(USER)}/${esc(p.repo)}" target="_blank" rel="noopener"><b>${esc(p.repo)} ↗</b><span class="rr-d">${esc(p.summary || '')}</span><span class="rr-m">${(p.tech || []).slice(0, 3).map(esc).join(' · ')}</span></a></li>`).join('')}</ul>`;
const why = (e) => (e?.rate ? 'hourly limit reached, try again later' : 'offline?');
const date = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** stacked language bar + legend from [[lang, bytes], …] */
export function langBar(pairs, max = 6) {
  const total = pairs.reduce((s, [, v]) => s + v, 0);
  if (!total) return '';
  const top = pairs.slice(0, max);
  const rest = total - top.reduce((s, [, v]) => s + v, 0);
  if (rest > 0) top.push(['Other', rest]);
  const pct = (v) => ((v / total) * 100).toFixed(1);
  return `<div class="lang-bar" role="img" aria-label="${esc(top.map(([l, v]) => `${l} ${pct(v)}%`).join(', '))}">${top.map(([l, v]) => `<i style="flex:${v};background:${langColour(l)}"></i>`).join('')}</div>
    <ul class="lang-key">${top.map(([l, v]) => `<li><i style="background:${langColour(l)}"></i>${esc(l)} <span>${pct(v)}%</span></li>`).join('')}</ul>`;
}

const repoRow = (r) => {
  const p = byRepo(r.name);
  return `<li><a href="#browser/r:${esc(r.name)}" data-lang="${esc(r.lang)}" data-name="${esc(`${r.name} ${r.desc} ${r.topics.join(' ')}`.toLowerCase())}">
    <b>${esc(r.name)}${p?.featured ? ' <span class="star-f">featured</span>' : ''}</b>
    <span class="rr-d">${esc(r.desc || p?.summary || 'No description yet')}</span>
    <span class="rr-m">${r.lang ? `<i class="dot" style="background:${langColour(r.lang)}"></i>${esc(r.lang)}` : ''}${r.stars ? `<span>★ ${r.stars}</span>` : ''}${r.home ? '<span>live demo</span>' : ''}<span>updated ${esc(ago(r.pushed))}</span></span></a></li>`;
};

// ── the GitHub tab ──────────────────────────────────────────────────────────
export const githubPage = () => `<div class="pg ghp"><header class="pg-h"><p class="eyebrow">sai://github</p><h2>Code on <em>GitHub.</em></h2>
  <p class="lede">Every public repository, live from GitHub. Open one to read its README and latest commits here.</p></header>
  <div data-gh><p class="muted">Fetching github.com/${esc(USER)}…</p></div></div>`;

export async function fillGithub(root) {
  const box = $('[data-gh]', root);
  if (!box) return;
  let prof, repos;
  try { [prof, repos] = await Promise.all([gh.profile(), gh.repos()]); } catch (e) { return box.isConnected && (box.innerHTML = fallback(e)); }
  if (!box.isConnected) return;
  const langs = [...new Set(repos.map((r) => r.lang).filter(Boolean))];
  box.innerHTML = `<div class="gh-top">
      <a class="gh-prof" href="${esc(prof.url)}" target="_blank" rel="noopener"><img src="${esc(prof.avatar)}&s=160" alt="" width="72" height="72"><span><b>${esc(prof.name || prof.login)}</b><small>@${esc(prof.login)}</small>${prof.bio ? `<em>${esc(prof.bio)}</em>` : ''}</span></a>
      <dl class="gh-stats"><div><dt>Public repos</dt><dd>${prof.repos}</dd></div>${(() => { const st = repos.reduce((s, r) => s + r.stars, 0); return st ? `<div><dt>Stars earned</dt><dd>${st}</dd></div>` : `<div><dt>Languages</dt><dd>${langs.length}</dd></div>`; })()}<div><dt>Last push</dt><dd>${esc(repos[0] ? ago(repos[0].pushed) : 'n/a')}</dd></div><div><dt>On GitHub since</dt><dd>${esc(new Date(prof.since).getFullYear())}</dd></div></dl>
    </div>
    <section class="ac-block"><h3>Languages, by bytes of code</h3><div data-langs><p class="muted small">Counting…</p></div></section>
    <div class="gh-cols">
      <section class="ac-block"><h3>Repositories</h3>
        <div class="gh-find"><input type="search" data-rq placeholder="Filter repos…" aria-label="Filter repositories"><div class="filters" role="group" aria-label="Language">${['All', ...langs].map((l, i) => `<button type="button" data-rl="${esc(i ? l : '')}" aria-pressed="${!i}">${esc(l)}</button>`).join('')}</div></div>
        <ul class="repos" data-repos>${repos.map(repoRow).join('')}</ul></section>
      <aside class="ac-block"><h3>Recent activity</h3><ul class="feed" data-feed><li class="muted small">Loading…</li></ul></aside>
    </div>
    <p class="row"><a class="btn" href="${esc(prof.url)}" target="_blank" rel="noopener">Open github.com/${esc(USER)} ↗</a></p>`;

  // filters
  let lang = '';
  const filt = () => {
    const q = $('[data-rq]', box).value.trim().toLowerCase();
    $$('[data-repos] a', box).forEach((a) => (a.parentElement.hidden = (lang && a.dataset.lang !== lang) || (q && !a.dataset.name.includes(q))));
  };
  $('[data-rq]', box).addEventListener('input', filt);
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rl]');
    if (!b) return;
    lang = b.dataset.rl;
    $$('[data-rl]', box).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    filt();
  });

  gh.languageTotals().then((pairs) => { const el = $('[data-langs]', box); if (el) el.innerHTML = langBar(pairs, 7) || '<p class="muted small">No code yet.</p>'; }).catch(() => { const el = $('[data-langs]', box); if (el) el.innerHTML = '<p class="muted small">Language counts are resting (GitHub’s hourly limit).</p>'; });
  gh.events().then((ev) => {
    const el = $('[data-feed]', box);
    if (!el) return;
    el.innerHTML = feed(ev, 9) || '<li class="muted small">Quiet lately.</li>';
  }).catch(() => { const el = $('[data-feed]', box); if (el) el.innerHTML = '<li class="muted small">Activity unavailable right now.</li>'; });
}

// collapse the public event stream into "pushed to X ×4 · 3 days ago" lines
const VERB = { PushEvent: 'Pushed to', CreateEvent: 'Created', WatchEvent: 'Starred', ForkEvent: 'Forked', PullRequestEvent: 'Opened a PR on', IssuesEvent: 'Opened an issue on', ReleaseEvent: 'Released', PublicEvent: 'Open-sourced' };
function feed(ev, n) {
  const out = [];
  for (const e of ev) {
    if (!VERB[e.type]) continue;
    const last = out[out.length - 1];
    if (last && last.type === e.type && last.repo === e.repo) { last.n++; continue; } // a run of pushes is one line
    out.push({ ...e, n: 1 });
  }
  return out.slice(0, n).map((e) => {
    const own = e.repo.startsWith(`${USER}/`);
    const short = own ? e.repo.slice(USER.length + 1) : e.repo;
    const r = own ? `<a href="#browser/r:${esc(short)}">${esc(short)}</a>` : esc(e.repo);
    return `<li><b>${esc(VERB[e.type])}</b> ${r}${e.type === 'PushEvent' && e.n > 1 ? ` <span class="muted">×${e.n}</span>` : ''}<small>${esc(ago(e.at))}</small></li>`;
  }).join('');
}

// ── one repo ────────────────────────────────────────────────────────────────
export const repoPage = (name) => `<article class="pg rp"><a class="back" href="#browser/github">← All repositories</a>
  <p class="eyebrow">github.com/${esc(USER)}/${esc(name)}</p><h2>${esc(name)}</h2><div data-repo="${esc(name)}"><p class="muted">Opening the repo…</p></div></article>`;

export async function fillRepo(root) {
  const box = $('[data-repo]', root);
  if (!box) return;
  const name = box.dataset.repo;
  let r;
  try { r = await gh.repo(name); } catch (e) { return box.isConnected && (box.innerHTML = offline(why(e))); }
  if (!box.isConnected) return;
  if (!r) return (box.innerHTML = `<p class="muted">No public repo called “${esc(name)}”. <a href="#browser/github">See them all</a>.</p>`);
  const p = byRepo(r.name);
  box.innerHTML = `<p class="big">${esc(r.desc || p?.summary || 'No description yet.')}</p>
    ${r.topics.length ? `<p class="pj-t">${r.topics.map((t) => `<i>${esc(t)}</i>`).join('')}</p>` : ''}
    <p class="row"><a class="btn" href="${esc(r.url)}" target="_blank" rel="noopener">Code on GitHub ↗</a>${r.home ? `<a class="btn ghost" href="${esc(r.home)}" target="_blank" rel="noopener">Live demo ↗</a>` : ''}${p ? `<a class="btn ghost" href="#browser/p:${esc(p.id)}">The project story →</a>` : ''}</p>
    ${panel(r, true)}`;
  hydrate(box, r);
}

// stats + languages + commits + README for a repo (shared with project pages)
const panel = (r, full) => `<div class="live-repo">
  <dl class="gh-stats sm">${r.stars ? `<div><dt>Stars</dt><dd>${r.stars}</dd></div>` : ''}${r.forks ? `<div><dt>Forks</dt><dd>${r.forks}</dd></div>` : ''}<div><dt>Main language</dt><dd>${esc(r.lang || 'n/a')}</dd></div><div><dt>Created</dt><dd>${esc(date(r.created))}</dd></div><div><dt>Last push</dt><dd>${esc(ago(r.pushed))}</dd></div></dl>
  <div class="lr-cols"><section><h3>Languages</h3><div data-lr-langs><p class="muted small">…</p></div></section>
  <section><h3>Latest commits</h3><ol class="commits" data-lr-commits><li class="muted small">…</li></ol></section></div>
  ${full ? '<section class="readme-wrap"><h3>README</h3><div class="readme" data-lr-readme><p class="muted small">Rendering README…</p></div></section>' : `<details class="readme-wrap" data-lr-more><summary>Read the README here</summary><div class="readme" data-lr-readme></div></details>`}
</div>`;

function hydrate(box, r) {
  const put = (sel, html) => { const el = $(sel, box); if (el) el.innerHTML = html; };
  const rest = (e) => `<p class="muted small">${e?.rate ? 'GitHub’s hourly limit for visitors is used up. Back soon.' : 'Unavailable right now.'}</p>`;
  gh.languages(r.name).then((l) => put('[data-lr-langs]', langBar(Object.entries(l).sort((a, b) => b[1] - a[1])) || '<p class="muted small">No code detected.</p>')).catch((e) => put('[data-lr-langs]', rest(e)));
  gh.commits(r.name, 6).then((cs) => put('[data-lr-commits]', cs.map((c) => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener"><code>${esc(c.sha)}</code><span>${esc(c.msg)}</span><small>${esc(ago(c.date))}</small></a></li>`).join(''))).catch((e) => put('[data-lr-commits]', `<li>${rest(e)}<a class="small" href="${esc(r.url)}/commits" target="_blank" rel="noopener">See commits on GitHub ↗</a></li>`));
  const readme = () => gh.readme(r.name).then((h) => put('[data-lr-readme]', cleanReadme(h, r.name, r.branch))).catch((e) => put('[data-lr-readme]', `<p class="muted small">${e.rate ? 'GitHub’s hourly limit for visitors is used up.' : 'No README here.'} <a href="${esc(r.url)}" target="_blank" rel="noopener">Read it on GitHub ↗</a></p>`));
  const more = $('[data-lr-more]', box);
  if (more) more.addEventListener('toggle', () => more.open && !more.dataset.done && ((more.dataset.done = '1'), put('[data-lr-readme]', '<p class="muted small">Rendering README…</p>'), readme()));
  else readme();
}

/** project page: append the live GitHub panel when the project has a repo */
export async function liveRepo(root) {
  const box = $('[data-live]', root);
  if (!box) return;
  try {
    const r = await gh.repo(box.dataset.live);
    if (!box.isConnected || !r) return box.isConnected && (box.innerHTML = '');
    box.innerHTML = `<h3 class="lr-h"><i class="pulse"></i>Live from GitHub · <a href="#browser/r:${esc(r.name)}">${esc(r.name)}</a></h3>${panel(r, false)}`;
    hydrate(box, r);
  } catch (e) { if (box.isConnected) box.innerHTML = offline(why(e)); }
}

// ── overview: the one-minute version ────────────────────────────────────────
export function overviewPage() {
  const feat = projects.filter((p) => p.featured && !p.placeholder).sort((a, b) => !!b.repo - !!a.repo).slice(0, 4); // open-source first
  const links = [...(site.email ? [['Email', `mailto:${site.email}`]] : []), ...site.socials.filter((s) => s.url).map((s) => [s.label, s.url])];
  return `<div class="pg start"><header class="pg-h"><p class="eyebrow">sai://overview</p>
    <h2>Hi, I’m <em>${esc(site.name)}.</em></h2><p class="big">${esc(site.tagline)}</p>
    <p class="row"><a class="btn" href="#contact">Contact me</a>${site.hiring.resume ? `<a class="btn ghost" href="${esc(href(site.hiring.resume))}" download>Résumé ⇩</a>` : ''}${links.map(([l, u]) => `<a class="btn ghost" href="${esc(u)}"${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(l)} ↗</a>`).join('')}</p></header>
    <section class="ac-block"><h3>Featured projects</h3><ol class="ledger">${feat.map((p, i) => `<li><a href="#browser/p:${esc(p.id)}"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(p.title)}</b><span>${esc(p.subtitle || CATEGORIES[p.category]?.label || '')}</span><span class="y">${esc(p.year)}</span></a></li>`).join('')}</ol>
      <p class="muted small"><a href="#browser/projects">All projects →</a> · <a href="#browser/github">All repositories →</a></p></section>
    <div class="gh-cols"><section class="ac-block"><h3>Languages</h3><div data-start-langs><p class="muted small">Loading from GitHub…</p></div></section>
      <section class="ac-block"><h3>Recent activity</h3><ul class="feed" data-start-feed><li class="muted small">Loading…</li></ul></section></div>
    <section class="ac-block"><h3>Explore</h3><ul class="start-map">
      <li><a href="#browser/projects"><b>Projects</b><span>Hackathon builds and personal work, with code and demos</span></a></li>
      <li><a href="#browser/github"><b>GitHub</b><span>Every repo, README and recent commit</span></a></li>
      <li><a href="#browser/about"><b>About</b><span>Education, skills and interests</span></a></li>
      <li><a href="#terminal"><b>Terminal</b><span>The same site by keyboard: try <code>repos</code></span></a></li>
      <li><a href="#contact"><b>Contact</b><span>Send me a message</span></a></li>
    </ul></section></div>`;
}

export function fillOverview(root) {
  const L = $('[data-start-langs]', root);
  const F = $('[data-start-feed]', root);
  if (!L) return;
  gh.languageTotals().then((p) => L.isConnected && (L.innerHTML = langBar(p, 5) || '')).catch(() => (L.innerHTML = `<p class="muted small"><a href="#browser/github">See the GitHub tab</a>.</p>`));
  gh.events().then((ev) => F.isConnected && (F.innerHTML = feed(ev, 5) || '<li class="muted small">Quiet lately.</li>')).catch(() => (F.innerHTML = `<li class="muted small"><a href="${esc(ghUrl)}" target="_blank" rel="noopener">See activity on GitHub ↗</a></li>`));
}
