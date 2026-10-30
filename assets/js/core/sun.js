// Today's sunrise/sunset for any latitude/longitude — standard solar-position
// equations (same approach as NOAA / suncalc), accurate to about a minute.
const rad = Math.PI / 180;
const DAY = 864e5;
const J1970 = 2440588;
const J2000 = 2451545;
const toDays = (d) => d.valueOf() / DAY - 0.5 + J1970 - J2000;
const fromJ = (j) => new Date((j + 0.5 - J1970) * DAY);

export function sunTimes(date, lat, lon) {
  const lw = rad * -lon;
  const phi = rad * lat;
  const n = Math.round(toDays(date) - 0.0009 - lw / (2 * Math.PI));
  const ds = 0.0009 + lw / (2 * Math.PI) + n;
  const M = rad * (357.5291 + 0.98560028 * ds);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + rad * 102.9372 + Math.PI;
  const dec = Math.asin(Math.sin(L) * Math.sin(rad * 23.4397));
  const noon = J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  const cosw = (Math.sin(rad * -0.833) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
  if (cosw > 1) return { polar: 'night' };
  if (cosw < -1) return { polar: 'day' };
  const w = Math.acos(cosw);
  const set = J2000 + 0.0009 + (w + lw) / (2 * Math.PI) + n + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  return { sunrise: fromJ(noon - (set - noon)), sunset: fromJ(set) };
}

export const clockIn = (tz, d = new Date()) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(d);
