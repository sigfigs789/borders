import { COUNTRIES, areNeighbors } from '../data/countries';

export type GuessStatus = 'correct' | 'wrong' | 'pending';

export interface GuessResult {
  code: string;
  name: string;
  status: GuessStatus;
  isOnPath: boolean;
}

export interface GameState {
  startCode: string;
  endCode: string;
  optimalPath: string[];
  maxGuesses: number;
  guesses: GuessResult[];
  currentPath: string[]; // the chain of correctly placed countries
  isComplete: boolean;
  isWon: boolean;
}

// BFS: returns shortest path array of country codes, or null if unreachable
export function findShortestPath(from: string, to: string): string[] | null {
  if (from === to) return [from];
  if (!COUNTRIES[from] || !COUNTRIES[to]) return null;

  const queue: string[][] = [[from]];
  const visited = new Set<string>([from]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    for (const neighbor of COUNTRIES[current].neighbors) {
      if (neighbor === to) return [...path, neighbor];
      if (!visited.has(neighbor) && COUNTRIES[neighbor]) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

export function createGame(startCode: string, endCode: string): GameState {
  const optimalPath = findShortestPath(startCode, endCode) ?? [startCode, endCode];
  // optimal includes start and end; the number of guesses needed to win
  // optimally is one per step from start to end (optimalPath.length - 1).
  // Player gets 75% more guesses than that, rounded up.
  const optimalGuesses = Math.max(1, optimalPath.length - 1);
  const maxGuesses = Math.ceil(optimalGuesses * 1.75);

  return {
    startCode,
    endCode,
    optimalPath,
    maxGuesses,
    guesses: [],
    currentPath: [startCode],
    isComplete: false,
    isWon: false,
  };
}

export function makeGuess(state: GameState, guessCode: string): GameState {
  if (state.isComplete) return state;
  if (!COUNTRIES[guessCode]) return state;

  // Prevent re-guessing
  const alreadyGuessed = state.guesses.some(g => g.code === guessCode);
  if (alreadyGuessed) return state;

  const lastInPath = state.currentPath[state.currentPath.length - 1];
  const isNeighborOfLast = areNeighbors(lastInPath, guessCode);
  const isEndCountry = guessCode === state.endCode;

  let newPath = [...state.currentPath];
  let status: GuessStatus = 'wrong';
  let isOnPath = false;

  if (isNeighborOfLast) {
    // Valid step: add to path
    newPath.push(guessCode);
    status = 'correct';
    isOnPath = true;
  }

  const newGuesses: GuessResult[] = [
    ...state.guesses,
    {
      code: guessCode,
      name: COUNTRIES[guessCode].name,
      status,
      isOnPath,
    },
  ];

  const won = isNeighborOfLast && isEndCountry;
  const outOfGuesses = newGuesses.length >= state.maxGuesses;

  return {
    ...state,
    guesses: newGuesses,
    currentPath: newPath,
    isComplete: won || outOfGuesses,
    isWon: won,
  };
}

export function getGuessesRemaining(state: GameState): number {
  return Math.max(0, state.maxGuesses - state.guesses.length);
}

export function getScoreEmoji(state: GameState): string {
  if (!state.isWon) return '❌';
  // Don't count the final destination guess — only intermediate steps matter
  const used = state.guesses.filter(g => g.isOnPath && g.code !== state.endCode).length;
  const optimal = state.optimalPath.length - 2;
  if (used === optimal) return '✨';
  if (used <= optimal + 1) return '⭐';
  return '✅';
}

export function buildShareText(state: GameState, puzzleNumber: number): string {
  const emoji = getScoreEmoji(state);
  const correct = state.guesses.filter(g => g.isOnPath).length;
  const total = state.guesses.length;
  const optimal = state.optimalPath.length - 2;

  const rows = state.guesses.map(g => (g.isOnPath ? '🟩' : '🟥')).join('');

  return `Borders #${puzzleNumber} ${emoji}\n${correct}/${total} (optimal: ${optimal})\n${rows}\nborders.app`;
}
