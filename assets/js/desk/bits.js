// ─────────────────────────────────────────────────────────────────────────────
//  SMALL THINGS ON THE DESK
//   keyboard → typeSheet     (the keyboard itself: a typing test, a synth to
//                             play, shortcuts to every room, a knob for the light)
//   #contact → contactSheet  (the message form, reached from the header)
//   speaker  → musicCard     (Spotify, plus three original synth loops)
// ─────────────────────────────────────────────────────────────────────────────
import { $, esc, href } from '../core/base.js';
import { site } from '../../../content/site.js';
import { desk } from '../../../content/desk.js';
import { music } from '../../../content/music.js';
import { RECORDS, loop, isMuted, setMuted, note, key } from '../world/sound.js';
import { LAYOUT, onKey, press } from './keys.js';

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

// ── Spotify: one embedded player for the whole visit ────────────────────────
// It loads only when the music card first opens (no Spotify requests before).
// When the card closes the player docks in the corner and keeps playing.
const SPOT = /(?:open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?|spotify:)(track|album|playlist|artist|episode|show)[/:]([A-Za-z0-9]{22})/;
export const spotEmbed = (link) => {
  const m = String(link || '').match(SPOT);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : '';
};
let spot = null;
function player() {
  if (spot) return spot;
  const el = document.createElement('div');
  el.className = 'spot';
  el.hidden = true;
  el.innerHTML = `<iframe title="Spotify player" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
    <div class="spot-bar"><span><i aria-hidden="true"></i>On the speaker</span><a href="#music">Open</a><button type="button" data-spot-x aria-label="Stop and close the player">×</button></div>`;
  document.body.append(el);
  const frame = $('iframe', el);
  spot = { el, frame, src: '' };
  $('[data-spot-x]', el).addEventListener('click', () => {
    frame.src = 'about:blank';
    spot.src = '';
    el.hidden = true;
    document.documentElement.dataset.spotify = '';
  });
  // clicking into the player (play) moves focus into the iframe: the speaker starts moving
  addEventListener('blur', () => setTimeout(() => { if (document.activeElement === frame) document.documentElement.dataset.spotify = '1'; }));
  addEventListener('message', (e) => {
    if (e.origin !== 'https://open.spotify.com' || e.data?.type !== 'playback_update') return;
    document.documentElement.dataset.spotify = e.data.payload?.isPaused ? '' : '1';
  });
  return spot;
}
function cue(src) {
  const p = player();
  if (p.src !== src) (p.frame.src = src), (p.src = src), (document.documentElement.dataset.spotify = '');
  keep('spot:src', src);
}

// ── the speaker's card: Spotify, or the record player's loops ───────────────
let stop = null;
let playing = '';
export function musicCard(root, ctx) {
  let tab = ctx.tab === 'loops' ? 'loops' : 'spotify';
  let raf = 0;
  const picks = music.picks.map((x) => ({ ...x, src: spotEmbed(x.url) })).filter((x) => x.src);
  const p = player();
  const follow = () => {
    const slot = $('[data-slot]', root);
    if (slot) {
      const r = slot.getBoundingClientRect();
      Object.assign(p.el.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    }
    raf = requestAnimationFrame(follow);
  };
  const dock = () => {
    cancelAnimationFrame(raf);
    p.el.removeAttribute('style');
    p.el.classList.add('dock');
    p.el.hidden = !p.src;
  };
  const paint = () => {
    const cur = p.src || pick('spot:src', picks[0]?.src || '');
    root.innerHTML = `<div class="pc player">${close}<p class="eyebrow">The speaker</p><h2>Now <em>playing.</em></h2>
      <div class="seg mtabs" role="group" aria-label="Source"><button type="button" data-tab="spotify" aria-pressed="${tab === 'spotify'}">Spotify</button><button type="button" data-tab="loops" aria-pressed="${tab === 'loops'}">On the record</button></div>
      ${tab === 'spotify' ? `
      <div class="picks">${picks.map((x) => `<button type="button" data-pick="${esc(x.src)}" aria-pressed="${x.src === cur}">${esc(x.label)}</button>`).join('')}</div>
      <div class="spot-slot" data-slot></div>
      <form class="spot-paste" data-paste><input name="link" placeholder="Paste any Spotify link: a song, album, playlist…" aria-label="Spotify link" autocomplete="off"><button class="btn" type="submit">Play</button></form>
      <p class="muted small" data-spot-note>${music.starters ? 'The buttons are Spotify’s own playlists for now. ' : ''}Full songs if you’re logged in to Spotify in this browser, 30-second previews if not. It keeps playing while you look around.</p>`
      : `<ol class="tracks">${RECORDS.map((r) => `<li><button type="button" data-track="${r.id}" aria-pressed="${playing === r.id}"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>${esc(r.title)}</b><small>Side ${r.side} · ${r.bpm} bpm</small></button></li>`).join('')}</ol>
      ${isMuted() ? '<p class="muted small">Sound is off. <button class="link" type="button" data-unmute>Turn it on</button></p>' : ''}
      <p class="muted small">Three loops written for this site, synthesised live in your browser. The room’s lights move with them. ${playing ? '<button class="link" type="button" data-stop>Pause</button>' : ''}</p>`}</div>`;
    cancelAnimationFrame(raf);
    if (tab === 'spotify') {
      if (cur) cue(cur);
      p.el.classList.remove('dock');
      p.el.hidden = false;
      follow();
    } else dock();
  };
  paint();
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const src = spotEmbed(new FormData(e.target).get('link'));
    if (!src) return ($('[data-spot-note]', root).textContent = 'That doesn’t look like a Spotify link. In Spotify: Share → Copy link, then paste it here.');
    cue(src);
    paint();
  });
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return ctx.leave();
    const t = e.target.closest('[data-tab]');
    if (t) return (tab = t.dataset.tab), paint();
    const pk = e.target.closest('[data-pick]');
    if (pk) return cue(pk.dataset.pick), paint();
    if (e.target.closest('[data-unmute]')) setMuted(false), paint();
    if (e.target.closest('[data-stop]')) stop?.(), (stop = null), (playing = ''), (document.documentElement.dataset.playing = ''), paint();
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
  return dock;
}

// ── the keyboard: an interface of its own ──────────────────────────────────
// The whole board is drawn below and lights up with every key you press (here
// and on the desk). Three modes: a typing test (15, 30 or 60 seconds, words
// from content/desk.js), Play (the keys are a little synth) and Shortcuts
// (one key per room). The knob changes the light; RGB and switch sound too.
// home row = white keys, the row above = the black ones (semitones from C4)
const NOTES = { KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16, Quote: 17 };
const NAMES = 'C C# D D# E F F# G G# A A# B'.split(' ');
const SHORTCUTS = { KeyA: ['About', 'wall/about'], KeyP: ['Projects', 'browser/projects'], KeyG: ['GitHub', 'browser/github'], KeyT: ['Terminal', 'terminal'], KeyM: ['Music', 'music'], KeyC: ['Contact', 'contact'], KeyB: ['Books', 'wall/books'], KeyR: ['Research', 'wall/research'], KeyW: ['Work so far', 'wall/timeline'], KeyN: ['Lately', 'wall/progress'], KeyL: ['Next light', 'lamp'], KeyO: ['Lights off/on', 'power'], Escape: ['Back', 'leave'] };
function board() {
  return LAYOUT.map((row) => `<div class="kb-row">${row.map((k) => typeof k === 'number' ? `<i style="flex:${k} ${k} 0"></i>`
    : k[0] === 'Knob' ? `<button type="button" class="k knob" data-k="Knob" style="flex:1 1 0" aria-label="Knob: turn for the next light colour"><i></i></button>`
    : `<button type="button" class="k" data-k="${k[0]}" style="flex:${k[2]} ${k[2]} 0" tabindex="-1"><span>${esc(k[1])}</span><small data-sub></small></button>`).join('')}</div>`).join('');
}
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
  let mode = pick('kb:mode', 'test');
  const HEADS = { test: 'How fast do you <em>type?</em>', play: 'Play it like <em>a synth.</em>', keys: 'Every room, <em>one key.</em>' };
  root.innerHTML = `<div class="sh tt" data-mode="${mode}">${close}
    <div class="tt-head"><div><p class="eyebrow">Keyboard · 75% with a knob</p><h2 data-head>${HEADS[mode]}</h2></div>
      <div class="tt-opts">${seg('mode', [['test', 'Typing test'], ['play', 'Play'], ['keys', 'Shortcuts']], mode)}${seg('sound', [['clicky', 'Clicky'], ['thock', 'Thock'], ['off', 'Silent']], sound)}${seg('rgb', [['wave', 'Wave'], ['lamp', 'Lamp'], ['stock', 'Stock']], ctx.lights.state.rgb)}</div></div>
    <div class="tt-test">
      <div class="tt-stats"><span><b data-wpm>0</b> wpm</span><span><b data-acc>100</b>% accuracy</span><span><b data-left>${secs}</b>s left</span>${seg('secs', [[15, '15s'], [30, '30s'], [60, '60s']], secs)}<span class="muted" data-best></span></div>
      <div class="tt-box" data-box><div class="tt-words" data-words></div><input class="tt-in" data-in autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the words shown"><p class="tt-go" data-go>Click here and start typing</p></div>
    </div>
    <p class="tt-say" data-say></p>
    <div class="board" data-board>${board()}</div>
    <p class="muted small tt-foot" data-foot></p></div>`;
  const FOOT = { test: '<kbd>Tab</kbd> restarts · <kbd>Esc</kbd> back to the desk · every key lights up here and on the desk', play: 'Home row: white keys from C. The row above: the black keys. The room’s lights follow what you play.', keys: 'Press a key, or click it. <kbd>L</kbd> and <kbd>O</kbd> work the lights; the number keys pick a colour; the knob turns it.' };
  const brd = $('[data-board]', root);
  const subs = () => brd.querySelectorAll('.k[data-k]').forEach((b) => {
    const c = b.dataset.k;
    const d = /^Digit[1-6]$/.test(c) ? ctx.lights.state.lamps[+c.slice(5) - 1]?.name : '';
    const t = mode === 'play' && c in NOTES ? NAMES[NOTES[c] % 12] : mode === 'keys' ? SHORTCUTS[c]?.[0] || d || '' : '';
    const sub = $('[data-sub]', b);
    if (sub) sub.textContent = t;
    b.classList.toggle('mapped', !!t);
  });
  const setMode = (m) => {
    mode = m;
    keep('kb:mode', m);
    $('.tt', root).dataset.mode = m;
    $('[data-head]', root).innerHTML = HEADS[m];
    $('[data-foot]', root).innerHTML = FOOT[m];
    $('[data-say]', root).textContent = m === 'play' ? 'Press A S D F G H J K L, or click the keys.' : m === 'keys' ? 'Where to?' : '';
    document.documentElement.dataset.keys = m === 'play' ? '1' : '';
    subs();
    if (m === 'test') setTimeout(() => input.focus({ preventScroll: true }), 50);
    else input.blur();
  };
  // a key does what the mode says
  const act = (code) => {
    if (mode === 'play' && code in NOTES) return isMuted() && setMuted(false), key(NOTES[code] - 5, 0.8), ($('[data-say]', root).textContent = NAMES[NOTES[code] % 12]);
    if (mode !== 'keys') return;
    const d = /^Digit[1-6]$/.test(code) && ctx.lights.state.lamps[+code.slice(5) - 1];
    if (d) return ctx.lights.set(d.id), ($('[data-say]', root).textContent = `Light: ${d.name}`), subs();
    const sc = SHORTCUTS[code];
    if (!sc) return;
    SOUNDS[sound](false);
    $('[data-say]', root).textContent = `${sc[0]} →`;
    if (sc[1] === 'lamp') return ctx.lights.cycle();
    if (sc[1] === 'power') return ctx.lights.power();
    if (sc[1] === 'leave') return ctx.leave();
    setTimeout(() => ctx.go(sc[1]), 180);
  };
  const lit = onKey((code, down) => brd.querySelector(`[data-k="${code}"]`)?.classList.toggle('down', down));
  const onDown = (e) => {
    if (mode === 'test' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.code in NOTES || SHORTCUTS[e.code] || /^Digit[1-6]$/.test(e.code)) e.preventDefault(), act(e.code);
    else if (mode === 'keys') SOUNDS[sound](e.code === 'Space');
  };
  addEventListener('keydown', onDown, true);
  brd.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    e.preventDefault();
    if (b.dataset.k === 'Knob') return turn();
    press(b.dataset.k, true);
    setTimeout(() => press(b.dataset.k, false), 140);
    if (mode === 'test') return SOUNDS[sound](b.dataset.k === 'Space'), input.focus({ preventScroll: true });
    if (!(b.dataset.k in NOTES) || mode !== 'play') SOUNDS[sound](b.dataset.k === 'Space');
    act(b.dataset.k);
  });
  // the knob: click or scroll to turn the light to its next colour
  const knob = $('.knob', brd);
  let deg = 0;
  const turn = (dir = 1) => {
    deg += 30 * dir;
    knob.style.setProperty('--deg', `${deg}deg`);
    ctx.lights.cycle();
    subs();
  };
  knob.addEventListener('wheel', (e) => { e.preventDefault(); clearTimeout(knob.t); knob.t = setTimeout(() => turn(Math.sign(e.deltaY) || 1), 60); }, { passive: false });
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
    const b = e.target.closest('[data-secs], [data-sound], [data-rgb], [data-mode]');
    if (!b) return;
    const [k, v] = Object.entries(b.dataset)[0];
    b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (k === 'secs') (secs = +v), keep('type:secs', v), reset();
    if (k === 'sound') (sound = v), keep('type:sound', v), v !== 'off' && isMuted() && setMuted(false), SOUNDS[v](false);
    if (k === 'rgb') ctx.lights.rgb(v);
    if (k === 'mode') return setMode(v);
    if (mode === 'test') input.focus({ preventScroll: true });
  });
  reset();
  setMode(mode);
  return () => {
    clearInterval(timer);
    lit();
    removeEventListener('keydown', onDown, true);
    document.documentElement.dataset.keys = '';
  };
}
