// ─────────────────────────────────────────────────────────────────────────────
//  GITHUB — live, keyless reads of the public GitHub API (CORS-open).
//  Unauthenticated visitors get 60 requests an hour, so every response is
//  cached in localStorage and reused; when GitHub says "rate limited" the
//  last good copy is served instead. The username comes from content/site.js.
// ─────────────────────────────────────────────────────────────────────────────
import { site } from '../../../content/site.js';

export const USER = site.github;
const API = 'https://api.github.com';
const HOUR = 3600e3;
const inflight = new Map();

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function write(key, d) {
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); } catch {} // full storage just means no cache
}

/** GET a GitHub API path, cached for `ttl` ms. Resolves to data, or rejects with { rate } / Error. */
function get(path, { ttl = HOUR, accept = 'application/vnd.github+json', text = false } = {}) {
  const key = `gh:v1:${path}`;
  const hit = read(key);
  if (hit && Date.now() - hit.t < ttl) return Promise.resolve(hit.d);
  if (inflight.has(key)) return inflight.get(key);
  const p = fetch(API + path, { headers: { Accept: accept } })
    .then(async (r) => {
      if (r.ok) {
        const d = text ? await r.text() : await r.json();
        write(key, d);
        return d;
      }
      if (hit) return hit.d; // stale beats nothing
      if (r.status === 403 || r.status === 429) throw Object.assign(new Error('rate limited'), { rate: true, reset: +r.headers.get('x-ratelimit-reset') * 1000 || 0 });
      throw new Error(`GitHub ${r.status}`);
    })
    .catch((e) => {
      if (hit) return hit.d;
      throw e;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

const slim = (r) => ({
  name: r.name, desc: r.description || '', lang: r.language || '', stars: r.stargazers_count, forks: r.forks_count,
  topics: r.topics || [], home: r.homepage || '', url: r.html_url, pushed: r.pushed_at, created: r.created_at, branch: r.default_branch, fork: r.fork, archived: r.archived,
});

export const gh = {
  profile: () => get(`/users/${USER}`).then((u) => ({ login: u.login, name: u.name, bio: u.bio, avatar: u.avatar_url, url: u.html_url, repos: u.public_repos, followers: u.followers, following: u.following, since: u.created_at })),
  repos: () => get(`/users/${USER}/repos?per_page=100&sort=pushed`).then((list) => list.filter((r) => !r.fork).map(slim)),
  repo: (name) => gh.repos().then((l) => l.find((r) => r.name.toLowerCase() === String(name).toLowerCase()) || null),
  languages: (name) => get(`/repos/${USER}/${name}/languages`, { ttl: 6 * HOUR }),
  commits: (name, n = 8) => get(`/repos/${USER}/${name}/commits?per_page=${n}`).then((l) => l.map((c) => ({ sha: c.sha.slice(0, 7), msg: c.commit.message.split('\n')[0], date: c.commit.author?.date, url: c.html_url }))),
  readme: (name) => get(`/repos/${USER}/${name}/readme`, { ttl: 6 * HOUR, accept: 'application/vnd.github.html', text: true }),
  events: () => get(`/users/${USER}/events/public?per_page=100`).then((l) => l.map((e) => ({ type: e.type, repo: e.repo.name, at: e.created_at }))),
  /** bytes of code per language across every (non-fork) repo */
  async languageTotals() {
    const repos = await gh.repos();
    const all = await Promise.all(repos.map((r) => gh.languages(r.name).catch(() => ({}))));
    const sum = {};
    for (const l of all) for (const [k, v] of Object.entries(l)) sum[k] = (sum[k] || 0) + v;
    return Object.entries(sum).sort((a, b) => b[1] - a[1]);
  },
};

// GitHub's own language colours (subset)
export const LANG_COLOURS = {
  Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', C: '#555555', 'C++': '#f34b7d',
  Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', 'Jupyter Notebook': '#DA5B0B', Dockerfile: '#384d54', SQL: '#e38c00', Kotlin: '#A97BFF', Swift: '#F05138', Procfile: '#3B2F63',
};
export const langColour = (l) => LANG_COLOURS[l] || '#8b8178';

export function ago(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  const units = [[31536000, 'year'], [2592000, 'month'], [604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
  for (const [n, u] of units) if (s >= n) { const k = Math.floor(s / n); return `${k} ${u}${k > 1 ? 's' : ''} ago`; }
  return 'just now';
}

// ── README HTML: GitHub renders it; we still allow-list every tag and
//    attribute, and point relative links/images back at the repo ───────────
const TAGS = new Set('a abbr b blockquote br code dd del details div dl dt em h1 h2 h3 h4 h5 h6 hr i img kbd li ol p picture pre q s samp section small source span strong sub summary sup table tbody td tfoot th thead tr tt u ul'.split(' '));
const ATTRS = new Set(['href', 'src', 'srcset', 'alt', 'title', 'width', 'height', 'align', 'colspan', 'rowspan', 'open', 'media']);

export function cleanReadme(html, repo, branch = 'main') {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const raw = `https://raw.githubusercontent.com/${USER}/${repo}/${branch}/`;
  const blob = `https://github.com/${USER}/${repo}/blob/${branch}/`;
  const abs = (u, base) => {
    if (!u || /^(javascript|data|vbscript):/i.test(u.trim())) return '';
    if (/^https?:\/\//i.test(u) || u.startsWith('#') || u.startsWith('mailto:')) return u;
    if (u.startsWith('/')) return `https://github.com${u}`;
    return base + u.replace(/^\.\//, '');
  };
  const walk = (el) => {
    for (const c of [...el.children]) {
      const tag = c.tagName.toLowerCase();
      if (!TAGS.has(tag)) {
        if (['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math', 'template'].includes(tag)) c.remove();
        else walk(c), c.replaceWith(...c.childNodes); // clean the children, then unwrap
        continue;
      }
      if (tag === 'a' && c.classList.contains('anchor')) { c.remove(); continue; } // heading permalink icons
      for (const a of [...c.attributes]) if (!ATTRS.has(a.name)) c.removeAttribute(a.name);
      if (c.hasAttribute('src')) c.setAttribute('src', abs(c.getAttribute('src'), raw)), c.setAttribute('loading', 'lazy');
      if (c.hasAttribute('srcset')) c.removeAttribute('srcset');
      if (tag === 'a') {
        const h = abs(c.getAttribute('href'), blob);
        if (!h || h.startsWith('#')) c.removeAttribute('href');
        else c.setAttribute('href', h), c.setAttribute('target', '_blank'), c.setAttribute('rel', 'noopener nofollow');
      }
      walk(c);
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
}
