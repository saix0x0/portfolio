// ─────────────────────────────────────────────────────────────────────────────
//  SOUND — tiny Web Audio synth. No audio files: every sound is generated.
//  Silent until the first user gesture (browser rule); muted state persists.
// ─────────────────────────────────────────────────────────────────────────────
let ac = null;
let master = null;
let meter = null;
let bins = null;
let muted = (() => { try { return localStorage.getItem('hotel:mute') === '1'; } catch { return false; } })();

function ctx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ac.destination);
    meter = ac.createAnalyser();
    meter.fftSize = 256;
    bins = new Uint8Array(meter.fftSize);
    master.connect(meter);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

export const isMuted = () => muted;
export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('hotel:mute', m ? '1' : '0'); } catch {}
  if (master) master.gain.value = m ? 0 : 0.5;
}

/** How loud the synth is right now, 0–1 (for lights that move with the music). */
export function level() {
  if (!meter) return 0;
  meter.getByteTimeDomainData(bins);
  let peak = 0;
  for (const b of bins) peak = Math.max(peak, Math.abs(b - 128));
  return peak / 128;
}

export const hz = (semi) => 440 * 2 ** ((semi - 9) / 12); // semitones from C4

/** One note. type: sine | square | triangle | sawtooth. */
export function note(freq, { dur = 0.25, type = 'triangle', vol = 0.25, at = 0, slide = 0 } = {}) {
  const a = ctx();
  if (!a || muted) return;
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** A soft piano-ish tone: two detuned partials. */
export function key(semi, dur = 0.9) {
  const f = hz(semi);
  note(f, { dur, type: 'triangle', vol: 0.28 });
  note(f * 2, { dur: dur * 0.5, type: 'sine', vol: 0.06 });
}

export const quack = () => (note(520, { dur: 0.09, type: 'square', vol: 0.12, slide: 0.6 }), note(470, { dur: 0.12, type: 'square', vol: 0.1, at: 0.1, slide: 0.55 }));
export const chime = () => [0, 4, 7, 12].forEach((s, i) => note(hz(12 + s), { dur: 0.35, vol: 0.12, at: i * 0.07 }));
export const blip = () => note(880, { dur: 0.05, type: 'square', vol: 0.05 });

/** Loop a little chiptune (array of [semitone|null, beats]) until stop() is called. */
export function loop(seq, bpm = 112, bass = null) {
  let alive = true;
  let timer;
  const beat = 60 / bpm;
  const play = () => {
    if (!alive) return;
    let at = 0;
    for (const [s, b] of seq) {
      if (s != null) note(hz(s), { dur: b * beat * 0.9, type: 'square', vol: 0.06, at });
      at += b * beat;
    }
    if (bass) {
      let bt = 0;
      for (const [s, b] of bass) {
        if (s != null) note(hz(s), { dur: b * beat * 0.95, type: 'triangle', vol: 0.14, at: bt });
        bt += b * beat;
      }
    }
    timer = setTimeout(play, at * 1000);
  };
  play();
  return () => ((alive = false), clearTimeout(timer));
}

// Original loops for the record player (written for this site).
export const RECORDS = [
  { id: 'sunset', title: 'Sunset Over the Elevator', side: 'A', bpm: 96,
    seq: [[12, 1], [16, 1], [19, 1], [16, 1], [14, 1], [17, 1], [21, 1], [17, 1], [12, 1], [16, 1], [19, 1], [24, 1], [23, 2], [19, 2]],
    bass: [[0, 4], [5, 4], [0, 4], [7, 4]] },
  { id: 'pitlane', title: 'Pit Lane Shuffle', side: 'B', bpm: 132,
    seq: [[19, 0.5], [19, 0.5], [22, 1], [19, 0.5], [17, 0.5], [15, 1], [14, 1], [15, 0.5], [17, 0.5], [19, 2], [null, 1], [22, 1], [24, 1], [22, 1], [19, 1], [17, 2], [null, 1]],
    bass: [[3, 2], [3, 2], [5, 2], [5, 2], [7, 2], [7, 2], [5, 2], [2, 2]] },
  { id: 'nightshift', title: 'Night Shift at Reception', side: 'C', bpm: 84,
    seq: [[9, 1.5], [12, 0.5], [16, 2], [14, 1], [12, 1], [11, 2], [null, 1], [9, 1], [7, 1.5], [9, 0.5], [12, 2], [11, 2]],
    bass: [[-3, 4], [2, 4], [-5, 4], [4, 4]] },
];
