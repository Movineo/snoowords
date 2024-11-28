// Sound effect utility for battle events
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

interface SoundEffect {
  frequency: number;
  type: OscillatorType;
  duration: number;
  volume: number;
  fadeOut?: boolean;
}

const playTone = ({
  frequency,
  type = 'sine',
  duration = 150,
  volume = 0.1,
  fadeOut = true
}: SoundEffect) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  if (fadeOut) {
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
  }

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration / 1000);
};

export const sounds = {
  wordFound: () => {
    // Cheerful ascending arpeggio
    [440, 550, 660].forEach((freq, i) => {
      setTimeout(() => {
        playTone({ frequency: freq, type: 'sine', duration: 100, volume: 0.08 });
      }, i * 80);
    });
  },

  powerUp: () => {
    // Magical ascending sweep
    const startFreq = 200;
    const endFreq = 1000;
    const duration = 300;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      endFreq,
      audioContext.currentTime + duration / 1000
    );

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration / 1000
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
  },

  achievement: () => {
    // Triumphant fanfare
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone({ 
          frequency: freq, 
          type: 'triangle', 
          duration: 200, 
          volume: 0.1 
        });
      }, i * 100);
    });
  },

  milestone: () => {
    // Exciting ascending scale with harmonics
    const baseFreq = 440;
    [1, 1.25, 1.5, 2].forEach((mult, i) => {
      setTimeout(() => {
        playTone({ 
          frequency: baseFreq * mult, 
          type: 'sine', 
          duration: 150, 
          volume: 0.07 
        });
        playTone({ 
          frequency: baseFreq * mult * 1.5, 
          type: 'triangle', 
          duration: 150, 
          volume: 0.04 
        });
      }, i * 60);
    });
  },

  battleJoin: () => {
    // Epic entrance sound
    const freqs = [300, 400, 500];
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        playTone({ 
          frequency: freq, 
          type: 'sine', 
          duration: 200, 
          volume: 0.08,
          fadeOut: true
        });
      }, i * 100);
    });
  },

  battleCreate: () => {
    // Grand orchestral hit
    [220, 440, 550, 660].forEach((freq, i) => {
      setTimeout(() => {
        playTone({ 
          frequency: freq, 
          type: i === 0 ? 'sine' : 'triangle', 
          duration: 400, 
          volume: 0.07 - (i * 0.01)
        });
      }, i * 50);
    });
  }
};
