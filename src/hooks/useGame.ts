import { useState, useEffect, useCallback } from 'react';
import { createGame, makeGuess, GameState } from '../game/gameLogic';
import { getDailyPuzzle, formatDate } from '../data/puzzles';
import { loadSavedGame, saveGame, updateStatsOnComplete, GameStats } from '../utils/storage';
import { COUNTRIES } from '../data/countries';

interface UseGameReturn {
  gameState: GameState | null;
  puzzleNumber: number;
  dateString: string;
  stats: GameStats | null;
  loading: boolean;
  submitGuess: (code: string) => void;
  resetForTesting: () => void;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [puzzleNumber, setPuzzleNumber] = useState(0);
  const [dateString, setDateString] = useState('');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsUpdated, setStatsUpdated] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  async function initGame() {
    setLoading(true);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const puzzle = getDailyPuzzle(today);
    setPuzzleNumber(puzzle.number);
    setDateString(formatDate(today));

    const saved = await loadSavedGame();
    if (saved && saved.puzzleNumber === puzzle.number) {
      // Restore saved game
      let state = createGame(puzzle.start, puzzle.end);
      for (const code of saved.guesses) {
        state = makeGuess(state, code);
      }
      setGameState(state);
    } else {
      setGameState(createGame(puzzle.start, puzzle.end));
    }

    setLoading(false);
  }

  const submitGuess = useCallback(
    async (code: string) => {
      if (!gameState || gameState.isComplete) return;

      const newState = makeGuess(gameState, code);
      setGameState(newState);

      const todayStr = new Date().toISOString().split('T')[0];
      await saveGame({
        puzzleNumber,
        date: todayStr,
        guesses: newState.guesses.map(g => g.code),
        isComplete: newState.isComplete,
        isWon: newState.isWon,
      });

      if (newState.isComplete && !statsUpdated) {
        setStatsUpdated(true);
        const updated = await updateStatsOnComplete(newState.isWon, todayStr);
        setStats(updated);
      }
    },
    [gameState, puzzleNumber, statsUpdated]
  );

  const resetForTesting = useCallback(() => {
    const pairs = [
      ['PRT', 'RUS'],
      ['ESP', 'CHN'],
      ['NOR', 'ZAF'],
      ['USA', 'IRN'],
    ];
    const idx = Math.floor(Math.random() * pairs.length);
    const [start, end] = pairs[idx];
    setGameState(createGame(start, end));
    setStatsUpdated(false);
  }, []);

  return { gameState, puzzleNumber, dateString, stats, loading, submitGuess, resetForTesting };
}
