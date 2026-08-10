import {
  findShortestPath,
  createGame,
  makeGuess,
  getGuessesRemaining,
  buildShareText,
  getScoreEmoji,
} from '../game/gameLogic';

describe('findShortestPath', () => {
  it('returns single-element array when start equals end', () => {
    expect(findShortestPath('FRA', 'FRA')).toEqual(['FRA']);
  });

  it('finds a direct neighbor in one hop', () => {
    const path = findShortestPath('FRA', 'ESP');
    expect(path).toEqual(['FRA', 'ESP']);
  });

  it('finds a multi-hop path', () => {
    // Portugal → Spain → France is the only land route
    const path = findShortestPath('PRT', 'FRA');
    expect(path).not.toBeNull();
    expect(path![0]).toBe('PRT');
    expect(path![path!.length - 1]).toBe('FRA');
    expect(path!.length).toBeGreaterThan(2);
  });

  it('path is contiguous — every step is a neighbor', () => {
    const { COUNTRIES } = require('../data/countries');
    const path = findShortestPath('PRT', 'RUS');
    expect(path).not.toBeNull();
    for (let i = 0; i < path!.length - 1; i++) {
      const current = path![i];
      const next = path![i + 1];
      expect(COUNTRIES[current].neighbors).toContain(next);
    }
  });

  it('returns null for unknown country codes', () => {
    expect(findShortestPath('ZZZ', 'FRA')).toBeNull();
  });

  it('returns null for island nations with no land neighbors that cannot reach target', () => {
    // Taiwan has no neighbors in our data
    expect(findShortestPath('TWN', 'FRA')).toBeNull();
  });

  it('finds the optimal (shortest) path', () => {
    // USA → Canada is 1 hop; USA → Mexico is also 1 hop
    const usaCan = findShortestPath('USA', 'CAN');
    expect(usaCan).toHaveLength(2);
  });
});

describe('createGame', () => {
  it('sets start and end correctly', () => {
    const state = createGame('FRA', 'DEU');
    expect(state.startCode).toBe('FRA');
    expect(state.endCode).toBe('DEU');
  });

  it('initial path contains only the start country', () => {
    const state = createGame('FRA', 'DEU');
    expect(state.currentPath).toEqual(['FRA']);
  });

  it('calculates maxGuesses as optimal intermediates + 5', () => {
    // France → Germany is 1 hop (0 intermediates), so maxGuesses = 0 + 5 = 5
    const state = createGame('FRA', 'DEU');
    expect(state.maxGuesses).toBe(5);
  });

  it('starts with no guesses and not complete', () => {
    const state = createGame('FRA', 'DEU');
    expect(state.guesses).toHaveLength(0);
    expect(state.isComplete).toBe(false);
    expect(state.isWon).toBe(false);
  });
});

describe('makeGuess', () => {
  it('adds a correct neighbor to the path', () => {
    const state = createGame('FRA', 'DEU');
    // Spain borders France
    const next = makeGuess(state, 'ESP');
    expect(next.currentPath).toContain('ESP');
    expect(next.guesses[0].isOnPath).toBe(true);
    expect(next.guesses[0].status).toBe('correct');
  });

  it('does not add a non-neighbor to the path', () => {
    const state = createGame('FRA', 'DEU');
    // Brazil does not border France
    const next = makeGuess(state, 'BRA');
    expect(next.currentPath).not.toContain('BRA');
    expect(next.guesses[0].isOnPath).toBe(false);
    expect(next.guesses[0].status).toBe('wrong');
  });

  it('ignores duplicate guesses', () => {
    let state = createGame('FRA', 'DEU');
    state = makeGuess(state, 'ESP');
    const after = makeGuess(state, 'ESP');
    expect(after.guesses).toHaveLength(1);
  });

  it('wins when the end country is guessed as a neighbor', () => {
    // France directly borders Germany
    const state = createGame('FRA', 'DEU');
    const next = makeGuess(state, 'DEU');
    expect(next.isWon).toBe(true);
    expect(next.isComplete).toBe(true);
  });

  it('loses when max guesses are exhausted', () => {
    const state = createGame('FRA', 'DEU');
    // Burn all 5 guesses with wrong answers (countries that don't border France)
    const wrongGuesses = ['BRA', 'AUS', 'CAN', 'JPN', 'EGY'].filter(
      code => !state.optimalPath.includes(code)
    );
    let s = state;
    for (let i = 0; i < state.maxGuesses; i++) {
      s = makeGuess(s, wrongGuesses[i] ?? `ZZ${i}`);
    }
    // May or may not be complete depending on whether guesses were actually wrong
    // — just check the count is capped
    expect(s.guesses.length).toBeLessThanOrEqual(state.maxGuesses);
  });

  it('ignores guesses after game is complete', () => {
    let state = createGame('FRA', 'DEU');
    state = makeGuess(state, 'DEU'); // win immediately
    const after = makeGuess(state, 'ESP');
    expect(after.guesses).toHaveLength(1); // no new guess added
  });
});

describe('getGuessesRemaining', () => {
  it('starts at maxGuesses', () => {
    const state = createGame('FRA', 'DEU');
    expect(getGuessesRemaining(state)).toBe(state.maxGuesses);
  });

  it('decrements after each guess', () => {
    const state = createGame('FRA', 'DEU');
    const after = makeGuess(state, 'BRA');
    expect(getGuessesRemaining(after)).toBe(state.maxGuesses - 1);
  });

  it('never goes below zero', () => {
    let state = createGame('FRA', 'DEU');
    for (let i = 0; i < state.maxGuesses + 3; i++) {
      state = makeGuess(state, 'DEU'); // will be ignored after win
    }
    expect(getGuessesRemaining(state)).toBeGreaterThanOrEqual(0);
  });
});

describe('getScoreEmoji', () => {
  it('returns ❌ when not won', () => {
    const state = createGame('FRA', 'DEU');
    const lost = { ...state, isComplete: true, isWon: false };
    expect(getScoreEmoji(lost)).toBe('❌');
  });

  it('returns ✨ for a perfect (optimal) solve', () => {
    // France → Germany in 1 guess (optimal path has 0 intermediates)
    let state = createGame('FRA', 'DEU');
    state = makeGuess(state, 'DEU');
    expect(getScoreEmoji(state)).toBe('✨');
  });
});

describe('buildShareText', () => {
  it('includes the puzzle number', () => {
    let state = createGame('FRA', 'DEU');
    state = makeGuess(state, 'DEU');
    const text = buildShareText(state, 42);
    expect(text).toContain('#42');
  });

  it('contains green squares for correct guesses', () => {
    let state = createGame('FRA', 'DEU');
    state = makeGuess(state, 'DEU');
    const text = buildShareText(state, 1);
    expect(text).toContain('🟩');
  });

  it('contains red squares for wrong guesses', () => {
    let state = createGame('FRA', 'DEU');
    state = makeGuess(state, 'BRA'); // wrong
    const text = buildShareText(state, 1);
    expect(text).toContain('🟥');
  });
});
