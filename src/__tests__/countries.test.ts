import { COUNTRIES, COUNTRY_LIST, searchCountries, areNeighbors } from '../data/countries';

describe('COUNTRIES data', () => {
  it('contains a reasonable number of countries', () => {
    expect(Object.keys(COUNTRIES).length).toBeGreaterThan(150);
  });

  it('every country has a non-empty name', () => {
    for (const [code, c] of Object.entries(COUNTRIES)) {
      expect(c.name).toBeTruthy();
    }
  });

  it('every country has valid coordinates', () => {
    for (const c of Object.values(COUNTRIES)) {
      expect(c.lat).toBeGreaterThanOrEqual(-90);
      expect(c.lat).toBeLessThanOrEqual(90);
      expect(c.lng).toBeGreaterThanOrEqual(-180);
      expect(c.lng).toBeLessThanOrEqual(180);
    }
  });

  it('adjacency is symmetric — if A borders B, B borders A', () => {
    const asymmetric: string[] = [];
    for (const [code, country] of Object.entries(COUNTRIES)) {
      for (const neighbor of country.neighbors) {
        if (!COUNTRIES[neighbor]) continue; // skip unknown codes
        if (!COUNTRIES[neighbor].neighbors.includes(code)) {
          asymmetric.push(`${code}↔${neighbor}`);
        }
      }
    }
    expect(asymmetric).toEqual([]);
  });

  it('no country lists itself as a neighbor', () => {
    for (const [code, c] of Object.entries(COUNTRIES)) {
      expect(c.neighbors).not.toContain(code);
    }
  });

  it('all neighbor codes refer to existing countries', () => {
    const missing: string[] = [];
    for (const [code, c] of Object.entries(COUNTRIES)) {
      for (const n of c.neighbors) {
        if (!COUNTRIES[n]) missing.push(`${code} → ${n}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('includes key countries', () => {
    expect(COUNTRIES['FRA']).toBeDefined();
    expect(COUNTRIES['USA']).toBeDefined();
    expect(COUNTRIES['CHN']).toBeDefined();
    expect(COUNTRIES['RUS']).toBeDefined();
    expect(COUNTRIES['BRA']).toBeDefined();
  });

  it('known borders are correct', () => {
    expect(COUNTRIES['FRA'].neighbors).toContain('ESP'); // France borders Spain
    expect(COUNTRIES['FRA'].neighbors).toContain('DEU'); // France borders Germany
    expect(COUNTRIES['USA'].neighbors).toContain('CAN'); // USA borders Canada
    expect(COUNTRIES['USA'].neighbors).toContain('MEX'); // USA borders Mexico
    expect(COUNTRIES['DEU'].neighbors).toContain('POL'); // Germany borders Poland
    expect(COUNTRIES['CHN'].neighbors).toContain('RUS'); // China borders Russia
  });

  it('known non-borders are absent', () => {
    expect(COUNTRIES['USA'].neighbors).not.toContain('FRA');  // USA doesn't border France
    expect(COUNTRIES['BRA'].neighbors).not.toContain('CHN');  // Brazil doesn't border China
    expect(COUNTRIES['AUS']?.neighbors ?? []).not.toContain('NZL'); // Australia doesn't border NZ
  });
});

describe('COUNTRY_LIST', () => {
  it('is sorted alphabetically by name', () => {
    for (let i = 0; i < COUNTRY_LIST.length - 1; i++) {
      expect(COUNTRY_LIST[i].name.localeCompare(COUNTRY_LIST[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });

  it('has the same count as COUNTRIES', () => {
    expect(COUNTRY_LIST.length).toBe(Object.keys(COUNTRIES).length);
  });
});

describe('searchCountries', () => {
  it('returns empty array for empty query', () => {
    expect(searchCountries('')).toEqual([]);
    expect(searchCountries('   ')).toEqual([]);
  });

  it('finds France by full name', () => {
    const results = searchCountries('France');
    expect(results.some(c => c.code === 'FRA')).toBe(true);
  });

  it('finds by partial name (case-insensitive)', () => {
    const results = searchCountries('ger');
    expect(results.some(c => c.code === 'DEU')).toBe(true);
  });

  it('returns at most 8 results', () => {
    expect(searchCountries('a').length).toBeLessThanOrEqual(8);
  });

  it('returns empty for a nonsense query', () => {
    expect(searchCountries('zzzzxxx')).toEqual([]);
  });
});

describe('areNeighbors', () => {
  it('returns true for adjacent countries', () => {
    expect(areNeighbors('FRA', 'ESP')).toBe(true);
    expect(areNeighbors('USA', 'CAN')).toBe(true);
  });

  it('is symmetric', () => {
    expect(areNeighbors('FRA', 'DEU')).toBe(areNeighbors('DEU', 'FRA'));
    expect(areNeighbors('BRA', 'ARG')).toBe(areNeighbors('ARG', 'BRA'));
  });

  it('returns false for non-adjacent countries', () => {
    expect(areNeighbors('USA', 'FRA')).toBe(false);
    expect(areNeighbors('BRA', 'CHN')).toBe(false);
  });

  it('returns false for unknown codes', () => {
    expect(areNeighbors('ZZZ', 'FRA')).toBe(false);
  });
});
