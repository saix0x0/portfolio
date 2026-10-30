// ─────────────────────────────────────────────────────────────────────────────
//  F1 — static data for the Racing Pavilion. Facts are historical and
//  well documented; edit/extend freely. No live APIs (by design, for now).
//  Champion counts are drivers' titles through the 2024 season.
// ─────────────────────────────────────────────────────────────────────────────

export const iconicCars = [
  { name: 'McLaren MP4/4', year: 1988, drivers: 'Ayrton Senna, Alain Prost', fact: 'Won 15 of the 16 races of 1988 with a Honda turbo engine.' },
  { name: 'Lotus 79', year: 1978, drivers: 'Mario Andretti, Ronnie Peterson', fact: 'Brought ground-effect aerodynamics to F1 and won the 1978 titles.' },
  { name: 'Brabham BT46B', year: 1978, drivers: 'Niki Lauda', fact: 'The “fan car”: raced once, won the Swedish GP, then was withdrawn.' },
  { name: 'Ferrari F2004', year: 2004, drivers: 'Michael Schumacher, Rubens Barrichello', fact: 'Won 15 of 18 races; Schumacher took his seventh title.' },
  { name: 'Red Bull RB19', year: 2023, drivers: 'Max Verstappen, Sergio Pérez', fact: 'Won 21 of the 22 Grands Prix of 2023.' },
];

export const circuits = [
  { name: 'Circuit de Monaco', country: 'Monaco', km: 3.337, laps: 78, since: 1950 },
  { name: 'Silverstone', country: 'United Kingdom', km: 5.891, laps: 52, since: 1950 },
  { name: 'Spa-Francorchamps', country: 'Belgium', km: 7.004, laps: 44, since: 1950 },
  { name: 'Monza', country: 'Italy', km: 5.793, laps: 53, since: 1950 },
  { name: 'Suzuka', country: 'Japan', km: 5.807, laps: 53, since: 1987 },
  { name: 'Interlagos', country: 'Brazil', km: 4.309, laps: 71, since: 1973 },
];

export const champions = [
  { name: 'Lewis Hamilton', titles: 7, years: '2008, 2014–15, 2017–20', helmet: '#e8e8f0' },
  { name: 'Michael Schumacher', titles: 7, years: '1994–95, 2000–04', helmet: '#e8343a' },
  { name: 'Juan Manuel Fangio', titles: 5, years: '1951, 1954–57', helmet: '#c8a040' },
  { name: 'Max Verstappen', titles: 4, years: '2021–24', helmet: '#2a3a8a' },
  { name: 'Alain Prost', titles: 4, years: '1985–86, 1989, 1993', helmet: '#3a6ad8' },
  { name: 'Sebastian Vettel', titles: 4, years: '2010–13', helmet: '#7a3ad8' },
  { name: 'Ayrton Senna', titles: 3, years: '1988, 1990–91', helmet: '#ffd23a' },
];

export const tyres = [
  { name: 'Soft', color: '#e8343a', note: 'Most grip, shortest life.' },
  { name: 'Medium', color: '#ffd23a', note: 'The balance.' },
  { name: 'Hard', color: '#f0f0f0', note: 'Least grip, lasts longest.' },
  { name: 'Intermediate', color: '#3dbb4a', note: 'Damp track.' },
  { name: 'Wet', color: '#3a7ad8', note: 'Standing water.' },
];
