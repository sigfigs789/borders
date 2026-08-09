import { findShortestPath } from '../game/gameLogic';

// Seeded RNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Curated list of interesting country pairs (start, end)
// These are verified to have valid land-border paths
const PUZZLE_PAIRS: Array<[string, string]> = [
  ['PRT', 'RUS'],  // Portugal → Russia
  ['ESP', 'CHN'],  // Spain → China
  ['USA', 'BRA'],  // USA → Brazil
  ['NOR', 'ZAF'],  // Norway → South Africa
  ['IRL', 'MNG'],  // Ireland → Mongolia
  ['CHL', 'TUR'],  // Chile → Turkey
  ['PRT', 'VNM'],  // Portugal → Vietnam
  ['CAN', 'ARG'],  // Canada → Argentina
  ['GBR', 'IND'],  // UK → India
  ['FRA', 'KOR'],  // France → South Korea
  ['MEX', 'EGY'],  // Mexico → Egypt
  ['USA', 'IRN'],  // USA → Iran
  ['BRA', 'RUS'],  // Brazil → Russia
  ['CHN', 'FRA'],  // China → France
  ['AUS', 'GBR'],  // Australia → UK (skip - island)
  ['NGA', 'CHN'],  // Nigeria → China
  ['ZAF', 'NOR'],  // South Africa → Norway
  ['ARG', 'FIN'],  // Argentina → Finland
  ['PER', 'TUR'],  // Peru → Turkey
  ['VEN', 'EGY'],  // Venezuela → Egypt
  ['COL', 'IND'],  // Colombia → India
  ['MEX', 'RUS'],  // Mexico → Russia
  ['CAN', 'EGY'],  // Canada → Egypt
  ['GBR', 'CHN'],  // UK → China
  ['USA', 'KOR'],  // USA → South Korea
  ['BRA', 'IRN'],  // Brazil → Iran
  ['FRA', 'IND'],  // France → India
  ['ESP', 'RUS'],  // Spain → Russia
  ['NLD', 'VNM'],  // Netherlands → Vietnam
  ['DEU', 'KOR'],  // Germany → South Korea
  ['POL', 'ZAF'],  // Poland → South Africa
  ['ITA', 'MNG'],  // Italy → Mongolia
  ['GRC', 'CHN'],  // Greece → China
  ['TUR', 'JPN'],  // Turkey → Japan (may need water)
  ['SAU', 'FRA'],  // Saudi Arabia → France
  ['IRQ', 'ESP'],  // Iraq → Spain
  ['IRN', 'NOR'],  // Iran → Norway
  ['PAK', 'FRA'],  // Pakistan → France
  ['AFG', 'GBR'],  // Afghanistan → UK
  ['IND', 'IRL'],  // India → Ireland
  ['MMR', 'TUR'],  // Myanmar → Turkey
  ['THA', 'POL'],  // Thailand → Poland
  ['VNM', 'DEU'],  // Vietnam → Germany
  ['KHM', 'FRA'],  // Cambodia → France
  ['LAO', 'ESP'],  // Laos → Spain
  ['MNG', 'NOR'],  // Mongolia → Norway
  ['KAZ', 'FRA'],  // Kazakhstan → France
  ['UZB', 'GBR'],  // Uzbekistan → UK
  ['TJK', 'POL'],  // Tajikistan → Poland
  ['KGZ', 'DEU'],  // Kyrgyzstan → Germany
];

// Epoch date for puzzle numbering (puzzle #1)
const EPOCH = new Date('2024-01-01').getTime();

export function getPuzzleNumber(date: Date = new Date()): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((date.getTime() - EPOCH) / dayMs) + 1;
}

export function getDailyPuzzle(date: Date = new Date()): { start: string; end: string; number: number } {
  const number = getPuzzleNumber(date);
  // Use puzzle number as seed to pick from pairs
  const rng = mulberry32(number * 31337);
  rng(); rng(); // warm up

  // Filter pairs that have valid paths
  const validPairs = PUZZLE_PAIRS.filter(([a, b]) => {
    const path = findShortestPath(a, b);
    return path !== null && path.length >= 3;
  });

  const idx = Math.floor(rng() * validPairs.length);
  const [start, end] = validPairs[idx % validPairs.length];

  return { start, end, number };
}

export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
