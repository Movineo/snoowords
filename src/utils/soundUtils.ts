// Sound effect types
type SoundEffect = 'login' | 'logout' | 'word' | 'achievement' | 'error' | 'success' | 'battle';

// Audio context for web audio API
let audioContext: AudioContext | null = null;

// Initialize audio context on first user interaction
const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Generate sound based on type
const generateSound = (type: SoundEffect): OscillatorNode | null => {
  const context = initAudioContext();
  if (!context) return null;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  // Configure sound based on type
  switch (type) {
    case 'login':
      oscillator.frequency.setValueAtTime(440, context.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      break;
    case 'logout':
      oscillator.frequency.setValueAtTime(220, context.currentTime); // A3 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      break;
    case 'word':
      oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      break;
    case 'achievement':
      oscillator.frequency.setValueAtTime(659.25, context.currentTime); // E5 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      break;
    case 'error':
      oscillator.frequency.setValueAtTime(196, context.currentTime); // G3 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      break;
    case 'success':
      oscillator.frequency.setValueAtTime(587.33, context.currentTime); // D5 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      break;
    case 'battle':
      oscillator.frequency.setValueAtTime(392, context.currentTime); // G4 note
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      break;
    default:
      return null;
  }

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  return oscillator;
};

// Play a sound effect
export const playSound = (type: SoundEffect) => {
  const oscillator = generateSound(type);
  if (!oscillator) return;

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
  }, 200); // Sound duration in milliseconds
};

// Play a word completion sound with pitch based on points
export const playWordSound = (word: string, points: number) => {
  const context = initAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  // Base frequency increases with points
  const baseFreq = 440 + (points * 20);
  oscillator.frequency.setValueAtTime(baseFreq, context.currentTime);
  gainNode.gain.setValueAtTime(0.1, context.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
  }, 150);
};
