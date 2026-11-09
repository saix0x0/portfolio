// ─────────────────────────────────────────────────────────────────────────────
//  THE LAPTOP — a terminal for the whole site. Real commands over content/*:
//  help, whoami, ls, cat, open, projects, repos, git log, skills, lamp …
//  (repos/git read GitHub live via core/github.js), plus a few
//  that exist only to be found. Tab completes, ↑/↓ walk the history.
// ─────────────────────────────────────────────────────────────────────────────
import { $, esc, href } from '../core/base.js';
import { f1Live, countdown } from '../core/f1live.js';
import { gh, USER, ago } from '../core/github.js';
import { site } from '../../../content/site.js';
import { desk } from '../../../content/desk.js';
import { projects, CATEGORIES } from '../../../content/projects.js';
import { skillGroups } from '../../../content/skills.js';

const PROMPT = '<span class="pr"><b>sai</b>@desk <i>~</i> %</span>';
const real = (s = '') => !/^TODO/.test(String(s)); // unfinished content never reaches visitors
const link = (label, to) => `<a href="${to.startsWith('#') ? to : esc(href(to))}">${esc(label)}</a>`;
const PLACES = {
  overview: '#browser/overview', github: '#browser/github', repos: '#browser/github', projects: '#browser/projects', about: '#browser/about',
  browser: '#browser', contact: '#contact', music: '#music', type: '#type', hotel: 'hotel/',
};
const FILES = { 'about.md': 'about', 'now.md': 'now', 'contact.md': 'contact', '.secrets': 'secrets' };
const started = Date.now();

// ── the little terminal painted on the laptop in the photo ──────────────────
export function miniLaptop(el, still) {
  el.innerHTML = '<div class="mini-term"><p class="mt-bar">sai@desk: zsh</p><pre data-mt></pre></div>';
  const pre = $('[data-mt]', el);
  const script = [
    ['whoami', `${site.fullName}\n${site.degree}\n@ ${site.college}`],
    ['ls ~/projects', projects.filter((p) => p.repo).slice(0, 4).map((p) => p.repo).join('\n')],
  ];
  if (still) return (pre.textContent = `% ${script[0][0]}\n${script[0][1]}\n% _`);
  // the real latest commit joins the loop once GitHub answers
  gh.repos().then(async (rs) => {
    const c = rs[0] && (await gh.commits(rs[0].name, 1))[0];
    if (c) script.splice(2, 0, [`git log -1 ${rs[0].name}`, `${c.sha} ${c.msg.slice(0, 26)}\n${ago(c.date)}`]);
  }).catch(() => {});
  let i = 0;
  let out = '';
  const type = (cmd, res, k = 0) => {
    if (!el.isConnected) return;
    pre.textContent = `${out}% ${cmd.slice(0, k)}█`;
    if (k < cmd.length) return setTimeout(() => type(cmd, res, k + 1), 60 + Math.random() * 70);
    setTimeout(() => {
      out += `% ${cmd}\n${res}\n`;
      if (out.split('\n').length > 12) out = '';
      pre.textContent = out + '% █';
      i = (i + 1) % script.length;
      setTimeout(() => type(...script[i]), 1600);
    }, 380);
  };
  setTimeout(() => type(...script[0]), 1200);
}

// ── the app ─────────────────────────────────────────────────────────────────
export function terminalApp(root, ctx) {
  root.innerHTML = `<div class="win term" data-term>
    <div class="term-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>sai@desk: zsh · the whole site, by keyboard</span><button class="leave" type="button" data-leave>Back to the desk <kbd>esc</kbd></button></div>
    <div class="term-out" data-out aria-live="polite"></div>
    <form class="term-in" data-form>${PROMPT}<input data-in autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command"></form></div>`;
  const out = $('[data-out]', root);
  const input = $('[data-in]', root);
  const hist = [];
  let hi = 0;
  let repoNames = []; // for Tab after `repo`
  gh.repos().then((rs) => (repoNames = rs.map((r) => r.name))).catch(() => {});
  const print = (html, cls = '') => {
    const p = document.createElement('div');
    p.className = `ln ${cls}`;
    p.innerHTML = html;
    out.append(p);
    out.scrollTop = out.scrollHeight;
    return p;
  };
  const table = (rows) => `<div class="tbl">${rows.map(([a, b]) => `<span>${a}</span><span>${b}</span>`).join('')}</div>`;

  const C = {
    help: () => print(table([
      ['whoami', 'who is this'], ['ls [dir]', 'what’s here (try: ls projects)'], ['cat &lt;file&gt;', 'read a file (about.md, now.md, contact.md)'],
      ['open &lt;place&gt;', 'overview, projects, github, about, contact'], ['projects', 'everything I’ve built'], ['skills', 'the toolbox'],
      ['repos', 'live: my public GitHub repos'], ['repo &lt;name&gt;', 'one repo: stats, languages, commits'], ['git log [repo]', 'latest commits, live'],
      ['lamp [colour|off|on]', 'sunset, violet, aurora, rose, ocean'], ['rgb [wave|lamp|stock]', 'keyboard lighting'],
      ['music', 'open the player'], ['neofetch', 'system info'], ['clear · history · exit', ''],
    ]) + '<p class="dim">There are a few commands that aren’t listed. You’ll find them.</p>'),
    whoami: () => print(`<b>${esc(site.fullName)}</b><br>${esc(site.degree)} · ${esc(site.college)}<br><span class="dim">${esc(site.tagline)}</span>`),
    ls: (a) => {
      if (/^proj/.test(a)) return print(projects.map((p) => link(p.id + '/', `#browser/p:${p.id}`)).join('  '));
      if (a && !a.startsWith('~') && a !== '.') return print(`ls: ${esc(a)}: No such file or directory`, 'err');
      print(`<span class="dir">projects/</span>  about.md  now.md  contact.md`);
    },
    'ls -a': () => print(`.  ..  <span class="dim">.secrets</span>  <span class="dir">projects/</span>  about.md  now.md  contact.md`),
    cat: (a) => {
      const f = FILES[a];
      if (!a) return print('cat: which file? try <b>cat about.md</b>', 'err');
      if (f === 'about') return print(`<b># ${esc(site.fullName)}</b><br>${esc(site.tagline)}<br><br>${site.bio.filter(real).map(esc).join('<br><br>')}`);
      if (f === 'now') return print(site.now.filter((n) => real(n.text)).map((n) => `<b>${esc(n.label)}</b>  ${esc(n.text)}`).join('<br>'));
      if (f === 'contact') return C.contact();
      if (f === 'secrets') return print('cat: .secrets: Permission denied. The penthouse is upstairs, and it has a keypad.', 'err');
      print(`cat: ${esc(a)}: No such file or directory`, 'err');
    },
    open: (a) => {
      const p = projects.find((x) => x.id === a);
      const to = p ? `#browser/p:${p.id}` : PLACES[a];
      if (!to) return print(`open: don’t know “${esc(a || '')}”. try: ${Object.keys(PLACES).slice(0, 8).join(', ')} …`, 'err');
      print(`opening ${esc(a)}…`, 'dim');
      setTimeout(() => (to.startsWith('#') ? ctx.go(to.slice(1)) : (location.href = href(to))), 350);
    },
    cd: (a) => (!a || a === '~' ? print('') : PLACES[a.replace(/\/$/, '')] ? C.open(a.replace(/\/$/, '')) : print(`cd: no such directory: ${esc(a)}`, 'err')),
    pwd: () => print('/home/sai/desk'),
    projects: () => print(table(projects.map((p) => [link(p.title, `#browser/p:${p.id}`), `${esc(CATEGORIES[p.category]?.label || '')} · ${esc(p.year)}${p.placeholder ? ' · <span class="todo">placeholder</span>' : ''}`]))),
    skills: () => print(table(skillGroups.filter((g) => g.skills.some(real)).map((g) => [esc(g.name), g.skills.filter(real).map(esc).join(', ')]))),
    contact: () => {
      const rows = [['email', site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : '<span class="todo">not set yet</span>'], ...site.socials.filter((s) => s.url).map((s) => [esc(s.label), `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url.replace(/^https?:\/\/(www\.)?/, ''))}</a>`])];
      print(table(rows) + `<p class="dim">or ${link('send a message', '#contact')}.</p>`);
    },
    f1: async () => {
      const p = print('connecting to timing…', 'dim');
      const d = await f1Live();
      if (!d?.last) return (p.textContent = 'timing feed didn’t answer. try again later.');
      const L = d.last;
      p.className = 'ln';
      p.innerHTML = `<b>${esc(L.name)}</b> <span class="dim">round ${L.round}/${d.rounds}</span><br>`
        + L.results.slice(0, 3).map((r) => `P${r.pos}  ${esc(r.code)}  ${esc(r.team)}`).join('<br>')
        + `<br><br><b>${esc(d.season)} standings</b><br>` + d.drivers.slice(0, 5).map((r) => `${String(r.pos).padStart(2)}  ${esc(r.code)}  ${r.pts} pts`).join('<br>')
        + (d.next ? `<br><br><b>next:</b> ${esc(d.next.name)} in ${esc(countdown(d.next.at))}` : '') + `<br>${link('open the pit wall →', '#browser/pitwall')}`;
    },
    lamp: (a) => {
      if (a === 'off' || a === 'on') return ctx.lights.power(a === 'on'), print(`lamp ${a}`);
      if (a && !ctx.lights.set(a)) return print(`lamp: colours are ${ctx.lights.state.lamps.map((l) => l.id).join(', ')}`, 'err');
      if (!a) ctx.lights.cycle();
      print(`lamp → ${esc(ctx.lights.state.lamp.name)}. look at the wall.`);
    },
    rgb: (a) => print(`keyboard rgb → ${esc(ctx.lights.rgb(a))}`),
    music: () => ctx.go('music'),
    hotel: () => (site.game ? C.open('hotel') : print('the hotel is closed for renovation. come back later.')),
    date: () => print(new Date().toString()),
    echo: (a) => print(esc(a)),
    clear: () => (out.innerHTML = ''),
    history: () => print(hist.map((h, i) => `${String(i + 1).padStart(3)}  ${esc(h)}`).join('<br>')),
    uname: () => print('DeskOS 1.0 (a photograph with ambitions)'),
    neofetch: () => {
      const s = ctx.lights.state;
      print(`<div class="neo"><pre class="art">  .------------.
  |  ▄▄▄▄▄▄▄▄  |
  |  ████████  |
  '-----┬------'
     ___|___
  [▓▓▓▓▓▓▓▓▓▓]  ◖◗</pre><div><b>sai@desk</b><br>--------<br>OS: DeskOS 1.0<br>Host: ${esc(site.college)}<br>Degree: CS + Computing &amp; Human Sciences<br>Shell: zsh (this one)<br>Lamp: ${esc(s.on ? s.lamp.name : 'off')}<br>Keyboard RGB: ${esc(s.rgb)}<br>Uptime: ${Math.max(1, Math.round((Date.now() - started) / 60000))} min on this page<br><span class="swatch"><i></i><i></i><i></i><i></i><i></i><i></i></span></div></div>`);
    },
    exit: () => ctx.leave(),
    // the unlisted ones
    sudo: (a) => print(/make me a sandwich/.test(a) ? 'okay.' : `sai is not in the sudoers file. This incident will be reported to the rubber duck. 🦆`, /sandwich/.test(a) ? '' : 'err'),
    make: (a) => print(a === 'me a sandwich' ? 'what? make it yourself.' : `make: *** No rule to make target '${esc(a || 'sense')}'.  Stop.`, 'err'),
    rm: () => print('nice try. this desk is load-bearing.', 'err'),
    vim: () => print('you are now in vim. there is no escape. (type <b>:q</b>)'),
    ':q': () => print('you escaped vim. most people never do. 🏆'),
    repos: async () => {
      const p = print('asking github…', 'dim');
      try {
        const rs = await gh.repos();
        p.className = 'ln';
        p.innerHTML = table(rs.map((r) => [link(r.name, `#browser/r:${r.name}`), `${esc(r.lang || 'n/a')}${r.stars ? ` · ★${r.stars}` : ''} · <span class="dim">${esc(ago(r.pushed))}</span>`])) + `<p class="dim">${rs.length} public repos · <b>repo &lt;name&gt;</b> for one · ${link('open the GitHub tab →', '#browser/github')}</p>`;
      } catch (e) { p.className = 'ln err'; p.innerHTML = `github: ${e.rate ? 'hourly limit reached, try later' : 'no answer'}. <a href="https://github.com/${esc(USER)}" target="_blank" rel="noopener">github.com/${esc(USER)}</a>`; }
    },
    repo: async (a) => {
      if (!a) return print('repo: which one? try <b>repos</b>', 'err');
      const p = print('asking github…', 'dim');
      try {
        const r = await gh.repo(a);
        if (!r) return (p.className = 'ln err'), (p.innerHTML = `repo: no public repo “${esc(a)}”. try <b>repos</b>`);
        const l = await gh.languages(r.name).catch(() => ({}));
        const tot = Object.values(l).reduce((s, v) => s + v, 0) || 1;
        p.className = 'ln';
        p.innerHTML = `<b>${esc(r.name)}</b>  <span class="dim">${esc(r.desc)}</span><br>`
          + table([['languages', Object.entries(l).slice(0, 4).map(([k, v]) => `${esc(k)} ${Math.round((v / tot) * 100)}%`).join(', ') || 'n/a'], ...(r.stars ? [['stars', String(r.stars)]] : []), ['last push', esc(ago(r.pushed))], ['code', `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url.replace('https://', ''))}</a>`], ...(r.home ? [['demo', `<a href="${esc(r.home)}" target="_blank" rel="noopener">${esc(r.home.replace('https://', ''))}</a>`]] : [])])
          + `<p class="dim"><b>git log ${esc(r.name)}</b> for commits · ${link('read the README →', `#browser/r:${r.name}`)}</p>`;
      } catch (e) { p.className = 'ln err'; p.textContent = `github: ${e.rate ? 'hourly limit reached, try later' : 'no answer'}`; }
    },
    git: async (a) => {
      if (a.startsWith('log')) {
        const p = print('asking github…', 'dim');
        try {
          const name = a.split(/\s+/)[1] || (await gh.repos())[0]?.name;
          const cs = await gh.commits(name, 8);
          p.className = 'ln';
          p.innerHTML = `<span class="dim">${esc(USER)}/${esc(name)}</span><br>` + cs.map((c) => `<a href="${esc(c.url)}" target="_blank" rel="noopener" class="sha">${esc(c.sha)}</a> ${esc(c.msg)} <span class="dim">(${esc(ago(c.date))})</span>`).join('<br>');
        } catch (e) { p.className = 'ln err'; p.textContent = `git log: ${e.rate ? 'github’s hourly limit reached, try later' : 'no such repo, or github didn’t answer'}`; }
        return;
      }
      if (a.startsWith('remote')) return print(`origin  https://github.com/${esc(USER)} (fetch)`);
      return C._git(a);
    },
    _git: (a) => print(a.startsWith('status') ? 'On branch life<br>Your branch is ahead of \'origin/plans\' by 3 side projects.<br>nothing to commit, working tree clean (for once)' : a.startsWith('push') ? 'rejected: the owner said no pushes without asking. good owner.' : 'git: try <b>git log</b> or <b>git status</b>'),
    hello: () => print('hello there. <span class="dim">(general kenobi)</span>'),
    coffee: () => print('HTTP 418: I’m a teapot.'),
    ping: () => print('pong'),
    42: () => print('the answer. still working on the question.'),
    duck: () => print(site.game ? '🦆 seven rubber ducks are hiding in the hotel. one per floor.' : '🦆 quack.'),
    matrix: () => print('wake up, sai…  the matrix has you.  follow the white rubber duck. 🦆'),
  };
  C.hi = C.hello;
  C.ll = C['ls -a'];
  C.nano = C.emacs = C.vim;
  C.standings = C.next = C.f1;
  C.quit = C.q = C.exit;
  C.man = () => C.help();

  const run = (raw) => {
    const line = raw.trim();
    print(`${PROMPT} ${esc(line)}`, 'cmd');
    if (!line) return;
    hist.push(line);
    hi = hist.length;
    const exact = C[line];
    if (exact) return exact('');
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = C[cmd.toLowerCase()];
    if (fn) return fn(rest.join(' '));
    print(`zsh: command not found: ${esc(cmd)} <span class="dim">· try <b>help</b></span>`, 'err');
  };

  $('[data-form]', root).addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value);
    input.value = '';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hist.length) e.preventDefault(), (hi = Math.max(0, hi - 1)), (input.value = hist[hi]);
    if (e.key === 'ArrowDown') e.preventDefault(), (hi = Math.min(hist.length, hi + 1)), (input.value = hist[hi] || '');
    if (e.key === 'Tab') {
      e.preventDefault();
      const [cmd, ...rest] = input.value.split(' ');
      const pool = cmd === 'repo' ? repoNames : rest.length ? [...Object.keys(PLACES), ...Object.keys(FILES), ...projects.map((p) => p.id)] : Object.keys(C).filter((k) => !/[^a-z]/.test(k));
      const word = rest.length ? rest.join(' ') : cmd;
      const m = pool.filter((k) => k.startsWith(word));
      if (m.length === 1) input.value = rest.length ? `${cmd} ${m[0]}` : `${m[0]} `;
      else if (m.length > 1) print(m.join('  '), 'dim');
    }
  });
  $('[data-leave]', root).addEventListener('click', ctx.leave);
  root.addEventListener('click', (e) => { if (!e.target.closest('a, button') && !getSelection().toString()) input.focus(); });
  for (const l of desk.motd) print(esc(l).replace(/`([^`]+)`/g, '<b>$1</b>'), 'dim');
  setTimeout(() => (run('whoami'), input.focus()), 250);
  return () => {};
}
