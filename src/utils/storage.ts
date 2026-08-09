import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  lastWonDate: string | null;
}

export interface SavedGameState {
  puzzleNumber: number;
  date: string;
  guesses: string[];
  isComplete: boolean;
  isWon: boolean;
}

const KEYS = {
  stats: 'borders:stats',
  savedGame: 'borders:saved_game',
};

const defaultStats: GameStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
  lastWonDate: null,
};

export async function loadStats(): Promise<GameStats> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.stats);
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : defaultStats;
  } catch {
    return defaultStats;
  }
}

export async function saveStats(stats: GameStats): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.stats, JSON.stringify(stats));
  } catch {}
}

export async function updateStatsOnComplete(won: boolean, date: string): Promise<GameStats> {
  const stats = await loadStats();
  const today = date;
  const yesterday = new Date(Date.parse(date) - 86400000).toISOString().split('T')[0];

  const newStats: GameStats = {
    ...stats,
    played: stats.played + 1,
    won: won ? stats.won + 1 : stats.won,
    lastPlayedDate: today,
  };

  if (won) {
    newStats.lastWonDate = today;
    if (stats.lastWonDate === yesterday) {
      newStats.currentStreak = stats.currentStreak + 1;
    } else {
      newStats.currentStreak = 1;
    }
    newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
  } else {
    newStats.currentStreak = 0;
  }

  await saveStats(newStats);
  return newStats;
}

export async function loadSavedGame(): Promise<SavedGameState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.savedGame);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveGame(state: SavedGameState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.savedGame, JSON.stringify(state));
  } catch {}
}

export async function clearSavedGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.savedGame);
  } catch {}
}
