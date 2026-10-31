// ─────────────────────────────────────────────────────────────────────────────
//  LIVE F1 — the current season from the free Jolpica API (the Ergast
//  successor; public, no key, CORS-open). Client-side only, cached for 20
//  minutes in localStorage so a visit costs at most four small requests.
//  Every caller must cope with `null` (offline, rate-limited, API down).
// ─────────────────────────────────────────────────────────────────────────────
const API = 'https://api.jolpi.ca/ergast/f1/current';
const KEY = 'f1:live:v1';
const TTL = 20 * 60 * 1000;

const get = (path) => fetch(`${API}/${path}.json`).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
const when = (r) => new Date(`${r.date}T${r.time || '12:00:00Z'}`);
const driver = (d) => ({ code: d.code || d.familyName.slice(0, 3).toUpperCase(), name: `${d.givenName} ${d.familyName}`, number: d.permanentNumber || '' });

function shape([last, drivers, teams, sched]) {
  const race = last.MRData.RaceTable.Races[0];
  const dl = drivers.MRData.StandingsTable.StandingsLists[0];
  const tl = teams.MRData.StandingsTable.StandingsLists[0];
  const races = sched.MRData.RaceTable.Races;
  const now = Date.now();
  const next = races.find((r) => when(r).getTime() > now - 2 * 3600e3) || null;
  return {
    season: sched.MRData.RaceTable.season,
    rounds: races.length,
    last: race && {
      name: race.raceName,
      round: +race.round,
      date: race.date,
      circuit: race.Circuit.circuitName,
      place: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
      results: race.Results.slice(0, 10).map((r) => ({ pos: +r.position, ...driver(r.Driver), team: r.Constructor.name, time: r.Time?.time || r.status, pts: +r.points, fastest: r.FastestLap?.rank === '1' })),
    },
    drivers: (dl?.DriverStandings || []).slice(0, 10).map((s) => ({ pos: +s.position, ...driver(s.Driver), team: s.Constructors[0]?.name || '', pts: +s.points, wins: +s.wins })),
    teams: (tl?.ConstructorStandings || []).slice(0, 10).map((s) => ({ pos: +s.position, name: s.Constructor.name, pts: +s.points, wins: +s.wins })),
    next: next && { name: next.raceName, round: +next.round, at: when(next).toISOString(), circuit: next.Circuit.circuitName, place: `${next.Circuit.Location.locality}, ${next.Circuit.Location.country}` },
  };
}

let pending = null;
/** Resolve to the live snapshot ({ season, last, drivers, teams, next, fetched }) or null. */
export function f1Live() {
  if (pending) return pending;
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (cached && Date.now() - cached.fetched < TTL) return (pending = Promise.resolve(cached));
  pending = Promise.all(['last/results', 'driverStandings', 'constructorStandings', 'races'].map(get))
    .then((all) => {
      const data = { ...shape(all), fetched: Date.now() };
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
      return data;
    })
    .catch(() => cached || null); // stale beats nothing
  return pending;
}

/** "3d 4h", "5h 12m", "12m" until an ISO time. */
export function countdown(iso) {
  let s = Math.max(0, (new Date(iso) - Date.now()) / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s %= 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

/** Team colours for the pixel art (falls back to grey). */
export const TEAM_COLOURS = {
  Mercedes: '#27f4d2', Ferrari: '#e8002d', McLaren: '#ff8000', 'Red Bull': '#3671c6', 'Aston Martin': '#229971', Alpine: '#ff87bc',
  Williams: '#64c4ff', 'RB F1 Team': '#6692ff', 'Racing Bulls': '#6692ff', Haas: '#b6babd', 'Haas F1 Team': '#b6babd', Sauber: '#52e252', Audi: '#bb0a30', Cadillac: '#c8c8c8',
};
export const teamColour = (name = '') => TEAM_COLOURS[name] || TEAM_COLOURS[Object.keys(TEAM_COLOURS).find((k) => name.includes(k))] || '#9aa0b0';
