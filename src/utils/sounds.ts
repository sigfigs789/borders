import { Audio } from 'expo-av';

// Pre-load all sounds once so playback is instant
let correctSound: Audio.Sound | null = null;
let wrongSound: Audio.Sound | null = null;
let winSound: Audio.Sound | null = null;

export async function loadSounds() {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: false });
    ({ sound: correctSound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/correct.wav')
    ));
    ({ sound: wrongSound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/wrong.wav')
    ));
    ({ sound: winSound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/win.wav')
    ));
  } catch (e) {
    // Sound is non-critical — silently fail on unsupported environments
  }
}

async function play(sound: Audio.Sound | null) {
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {}
}

export const SFX = {
  correct: () => play(correctSound),
  wrong: () => play(wrongSound),
  win: () => play(winSound),
};
