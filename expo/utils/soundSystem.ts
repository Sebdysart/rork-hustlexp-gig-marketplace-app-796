import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export type SoundType =
  | 'tap'
  | 'swipe'
  | 'success'
  | 'error'
  | 'warning'
  | 'coin'
  | 'xpGain'
  | 'levelUp'
  | 'badgeUnlock'
  | 'questComplete'
  | 'notification'
  | 'menuOpen'
  | 'menuClose'
  | 'taskAccept'
  | 'taskComplete'
  | 'achievementUnlock'
  | 'confetti'
  | 'whoosh'
  | 'pop'
  | 'click'
  | 'error_buzz'
  | 'success_chime';

interface SoundConfig {
  frequency?: number;
  duration?: number;
  volume?: number;
  type?: OscillatorType;
}

const soundConfigs: Record<SoundType, SoundConfig> = {
  tap: { frequency: 800, duration: 50, volume: 0.3, type: 'sine' },
  click: { frequency: 1000, duration: 30, volume: 0.2, type: 'sine' },
  swipe: { frequency: 600, duration: 100, volume: 0.2, type: 'sine' },
  pop: { frequency: 1200, duration: 80, volume: 0.3, type: 'sine' },
  whoosh: { frequency: 400, duration: 150, volume: 0.25, type: 'sawtooth' },
  
  success: { frequency: 880, duration: 200, volume: 0.4, type: 'sine' },
  success_chime: { frequency: 1047, duration: 250, volume: 0.4, type: 'triangle' },
  error: { frequency: 200, duration: 300, volume: 0.4, type: 'square' },
  error_buzz: { frequency: 150, duration: 200, volume: 0.35, type: 'sawtooth' },
  warning: { frequency: 600, duration: 150, volume: 0.35, type: 'triangle' },
  
  coin: { frequency: 1200, duration: 100, volume: 0.35, type: 'sine' },
  xpGain: { frequency: 1000, duration: 150, volume: 0.35, type: 'triangle' },
  
  levelUp: { frequency: 523, duration: 400, volume: 0.5, type: 'triangle' },
  badgeUnlock: { frequency: 784, duration: 350, volume: 0.45, type: 'sine' },
  achievementUnlock: { frequency: 1047, duration: 400, volume: 0.5, type: 'triangle' },
  questComplete: { frequency: 880, duration: 300, volume: 0.45, type: 'sine' },
  
  notification: { frequency: 1200, duration: 120, volume: 0.3, type: 'sine' },
  menuOpen: { frequency: 600, duration: 100, volume: 0.25, type: 'sine' },
  menuClose: { frequency: 500, duration: 100, volume: 0.25, type: 'sine' },
  
  taskAccept: { frequency: 700, duration: 200, volume: 0.35, type: 'triangle' },
  taskComplete: { frequency: 1000, duration: 250, volume: 0.4, type: 'sine' },
  
  confetti: { frequency: 1500, duration: 200, volume: 0.4, type: 'sine' },
};

const complexSoundSequences: Partial<Record<SoundType, SoundConfig[]>> = {
  levelUp: [
    { frequency: 523, duration: 100, volume: 0.4, type: 'sine' },
    { frequency: 659, duration: 100, volume: 0.45, type: 'sine' },
    { frequency: 784, duration: 200, volume: 0.5, type: 'sine' },
  ],
  achievementUnlock: [
    { frequency: 1047, duration: 80, volume: 0.4, type: 'triangle' },
    { frequency: 1318, duration: 80, volume: 0.45, type: 'triangle' },
    { frequency: 1568, duration: 150, volume: 0.5, type: 'triangle' },
  ],
  questComplete: [
    { frequency: 880, duration: 100, volume: 0.35, type: 'sine' },
    { frequency: 1047, duration: 150, volume: 0.4, type: 'sine' },
  ],
  coin: [
    { frequency: 1200, duration: 60, volume: 0.3, type: 'sine' },
    { frequency: 1400, duration: 80, volume: 0.35, type: 'sine' },
  ],
  confetti: [
    { frequency: 1500, duration: 50, volume: 0.35, type: 'sine' },
    { frequency: 1700, duration: 50, volume: 0.35, type: 'sine' },
    { frequency: 1900, duration: 100, volume: 0.4, type: 'sine' },
  ],
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, Audio.Sound> = new Map();
  private enabled: boolean = true;
  private masterVolume: number = 0.7;

  constructor() {
    if (Platform.OS === 'web') {
      this.initializeWebAudio();
    } else {
      this.initializeNativeAudio();
    }
  }

  private async initializeNativeAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.log('Failed to initialize native audio:', error);
    }
  }

  private initializeWebAudio() {
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  private playWebSound(config: SoundConfig) {
    if (!this.audioContext || !this.enabled) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = config.type || 'sine';
      oscillator.frequency.value = config.frequency || 440;

      const volume = (config.volume || 0.3) * this.masterVolume;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + (config.duration || 100) / 1000
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + (config.duration || 100) / 1000);
    } catch (error) {
      console.log('Error playing web sound:', error);
    }
  }

  private async playWebSoundSequence(configs: SoundConfig[]) {
    if (!this.audioContext || !this.enabled) return;

    let offset = 0;
    for (const config of configs) {
      setTimeout(() => this.playWebSound(config), offset);
      offset += (config.duration || 100) + 30;
    }
  }

  private async playNativeSound(config: SoundConfig) {
    if (!this.enabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.generateDataUri(config) },
        { volume: (config.volume || 0.3) * this.masterVolume, shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing native sound:', error);
    }
  }

  private generateDataUri(config: SoundConfig): string {
    return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  }

  async play(type: SoundType) {
    if (!this.enabled) return;

    const sequence = complexSoundSequences[type];
    if (sequence) {
      if (Platform.OS === 'web') {
        this.playWebSoundSequence(sequence);
      } else {
        for (let i = 0; i < sequence.length; i++) {
          setTimeout(() => this.playNativeSound(sequence[i]), i * 100);
        }
      }
    } else {
      const config = soundConfigs[type];
      if (Platform.OS === 'web') {
        this.playWebSound(config);
      } else {
        this.playNativeSound(config);
      }
    }
  }

  async playCustom(frequency: number, duration: number, volume: number = 0.3) {
    const config: SoundConfig = { frequency, duration, volume, type: 'sine' };
    
    if (Platform.OS === 'web') {
      this.playWebSound(config);
    } else {
      this.playNativeSound(config);
    }
  }

  cleanup() {
    if (Platform.OS !== 'web') {
      this.sounds.forEach(sound => {
        sound.unloadAsync();
      });
      this.sounds.clear();
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

const soundManager = new SoundManager();

export const playSound = (type: SoundType) => soundManager.play(type);

export const playSoundWithSettings = (type: SoundType, soundEnabled: boolean) => {
  if (soundEnabled) {
    soundManager.play(type);
  }
};

export const setSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled);

export const setMasterVolume = (volume: number) => soundManager.setMasterVolume(volume);

export const playCustomSound = (frequency: number, duration: number, volume?: number) => 
  soundManager.playCustom(frequency, duration, volume);

export const cleanupSounds = () => soundManager.cleanup();

export default soundManager;
