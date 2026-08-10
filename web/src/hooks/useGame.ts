import { useState, useEffect, useCallback } from 'react';
import { createGame, makeGuess, GameState } from '@game/gameLogic';
import { getDailyPuzzle, getRandomPuzzle, formatDate } from '@data/puzzles';

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [puzzleNumber, setPuzzleNumber] = useState(0);
  const [dateString, setDateString] = useState('');
  const [statsUpdated, setStatsUpdated] = useState(false);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const puzzle = getDailyPuzzle(today);
    setPuzzleNumber(puzzle.number);
    setDateString(formatDate(today));

    const saved = localStorage.getItem(`map-trail:game:${puzzle.number}`);
    if (saved) {
      const guesses: string[] = JSON.parse(saved);
      let state = createGame(puzzle.start, puzzle.end);
      for (const code of guesses) state = makeGuess(state, code);
      setGameState(state);
    } else {
      setGameState(createGame(puzzle.start, puzzle.end));
    }
  }, []);

  const submitGuess = useCallback((code: string) => {
    setGameState(prev => {
      if (!prev || prev.isComplete) return prev;
      const next = makeGuess(prev, code);
      localStorage.setItem(
        `map-trail:game:${puzzleNumber}`,
        JSON.stringify(next.guesses.map(g => g.code))
      );
      return next;
    });
  }, [puzzleNumber]);

  const newPuzzle = useCallback((currentStart?: string, currentEnd?: string) => {
    const exclude = currentStart && currentEnd ? `${currentStart}-${currentEnd}` : undefined;
    const puzzle = getRandomPuzzle(exclude);
    setGameState(createGame(puzzle.start, puzzle.end));
    setStatsUpdated(false);
  }, []);

  return { gameState, puzzleNumber, dateString, submitGuess, newPuzzle };
}
