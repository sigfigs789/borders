import { getPuzzleNumber, getDailyPuzzle, getRandomPuzzle } from '../data/puzzles';
import { COUNTRIES } from '../data/countries';
import { findShortestPath } from '../game/gameLogic';

describe('getPuzzleNumber', () => {
  it('returns a positive integer', () => {
    const n = getPuzzleNumber(new Date());
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThan(0);
  });

  it('is deterministic for the same date', () => {
    const d = new Date('2025-06-15');
    expect(getPuzzleNumber(d)).toBe(getPuzzleNumber(d));
  });

  it('increments by 1 each day', () => {
    const d1 = new Date('2025-06-15');
    const d2 = new Date('2025-06-16');
    expect(getPuzzleNumber(d2)).toBe(getPuzzleNumber(d1) + 1);
  });

  it('puzzle #1 is on the epoch date', () => {
    expect(getPuzzleNumber(new Date('2024-01-01'))).toBe(1);
  });
});

describe('getDailyPuzzle', () => {
  it('returns valid start and end country codes', () => {
    const { start, end } = getDailyPuzzle(new Date());
    expect(COUNTRIES[start]).toBeDefined();
    expect(COUNTRIES[end]).toBeDefined();
  });

  it('start and end are different countries', () => {
    const { start, end } = getDailyPuzzle(new Date());
    expect(start).not.toBe(end);
  });

  it('there is a valid land path between start and end', () => {
    const { start, end } = getDailyPuzzle(new Date());
    const path = findShortestPath(start, end);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThanOrEqual(2);
  });

  it('is deterministic — same date always returns same puzzle', () => {
    const d = new Date('2025-03-20');
    const a = getDailyPuzzle(d);
    const b = getDailyPuzzle(d);
    expect(a.start).toBe(b.start);
    expect(a.end).toBe(b.end);
    expect(a.number).toBe(b.number);
  });

  it('different dates return the correct puzzle number', () => {
    const d1 = new Date('2025-01-01');
    const d2 = new Date('2025-01-02');
    expect(getDailyPuzzle(d2).number).toBe(getDailyPuzzle(d1).number + 1);
  });
});

describe('getRandomPuzzle', () => {
  it('returns valid country codes', () => {
    const { start, end } = getRandomPuzzle();
    expect(COUNTRIES[start]).toBeDefined();
    expect(COUNTRIES[end]).toBeDefined();
  });

  it('start and end are different', () => {
    const { start, end } = getRandomPuzzle();
    expect(start).not.toBe(end);
  });

  it('there is a valid path between the pair', () => {
    const { start, end } = getRandomPuzzle();
    const path = findShortestPath(start, end);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThanOrEqual(3);
  });

  it('respects the exclude parameter — does not return the excluded pair', () => {
    // Run several times to make it statistically reliable
    const excluded = 'PRT-RUS';
    for (let i = 0; i < 20; i++) {
      const { start, end } = getRandomPuzzle('PRT-RUS');
      expect(`${start}-${end}`).not.toBe(excluded);
    }
  });
});
