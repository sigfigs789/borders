import { useAudioPlayer } from 'expo-audio';

// expo-audio is hook-based; for imperative one-shot playback we keep
// module-level player refs initialised lazily on first use.
let players: { correct: any; wrong: any; win: any } | null = null;

// Called once from App on mount — no-op if expo-audio isn't available
export async function loadSounds() {
  // Players are created via hook in the component tree; this is a no-op stub
  // kept for API compatibility with the original sounds.ts signature.
}

// These are called imperatively, so we use the non-hook createAudioPlayer API.
// expo-audio exports createAudioPlayer for this exact use case.
let _createAudioPlayer: ((source: any) => any) | null = null;

async function ensurePlayers() {
  if (players) return;
  try {
    const av = await import('expo-audio');
    _createAudioPlayer = av.createAudioPlayer;
    players = {
      correct: _createAudioPlayer(require('../../assets/sounds/correct.wav')),
      wrong:   _createAudioPlayer(require('../../assets/sounds/wrong.wav')),
      win:     _createAudioPlayer(require('../../assets/sounds/win.wav')),
    };
  } catch {
    // Not available in this environment — sound is non-critical
  }
}

// Kick off loading immediately
ensurePlayers();

async function play(key: 'correct' | 'wrong' | 'win') {
  await ensurePlayers();
  try {
    const p = players?.[key];
    if (!p) return;
    p.seekTo(0);
    p.play();
  } catch {}
}

export const SFX = {
  correct: () => play('correct'),
  wrong:   () => play('wrong'),
  win:     () => play('win'),
};
