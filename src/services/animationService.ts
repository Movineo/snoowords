import { gsap } from 'gsap';

class AnimationService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Initialize Web Audio API on first user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.loadSounds();
      }
    }, { once: true });
  }

  private async loadSounds() {
    try {
      console.log('Initializing audio context...');
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const soundEffects: Record<string, string> = {
        correct: '/sounds/correct.mp3',
        incorrect: '/sounds/incorrect.mp3',
        levelUp: '/sounds/level-up.mp3',
        click: '/sounds/click.mp3',
        celebration: '/sounds/celebration.mp3',
        letterSelect: '/sounds/click.mp3',
        combo: '/sounds/combo.mp3',
        countdown: '/sounds/countdown.mp3',
        powerup: '/sounds/powerup.mp3',
        success: '/sounds/success.mp3',
        error: '/sounds/error.mp3'
      };

      // Load essential sounds first
      const essentialSounds = ['powerup', 'error', 'correct', 'incorrect'] as const;
      for (const name of essentialSounds) {
        try {
          console.log(`Loading essential sound: ${name}`);
          const response = await fetch(soundEffects[name]);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Decoding essential sound: ${name}`);
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.sounds.set(name, audioBuffer);
          console.log(`Successfully loaded essential sound: ${name}`);
        } catch (error) {
          console.error(`Failed to load essential sound: ${name}`, error);
        }
      }

      // Load remaining sounds
      const remainingSounds = Object.entries(soundEffects).filter(([name]) => !essentialSounds.includes(name as any));
      for (const [name, path] of remainingSounds) {
        try {
          console.log(`Loading sound: ${name} from ${path}`);
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Decoding sound: ${name}`);
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.sounds.set(name, audioBuffer);
          console.log(`Successfully loaded sound: ${name}`);
        } catch (error) {
          console.error(`Failed to load sound: ${name}`, error);
        }
      }
      console.log('Finished loading sounds. Available sounds:', Array.from(this.sounds.keys()));
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  playSound(name: string, volume = 1.0) {
    console.log(`Attempting to play sound: ${name} at volume ${volume}`);
    
    if (!this.audioContext) {
      try {
        console.log('Creating new audio context...');
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Resume audio context if it was suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      } catch (error) {
        console.error('Failed to create audio context:', error);
        return;
      }
    }

    if (!this.sounds.has(name)) {
      console.warn(`Sound ${name} not available, trying fallback...`);
      // Use fallback sounds
      switch (name) {
        case 'error':
          name = 'incorrect';
          break;
        case 'powerup':
          name = 'celebration';
          break;
        default:
          console.warn(`No fallback available for ${name}`);
          return;
      }
      if (!this.sounds.has(name)) {
        console.warn(`Fallback sound ${name} also not available`);
        return;
      }
      console.log(`Using fallback sound: ${name}`);
    }

    try {
      console.log(`Creating audio nodes for ${name}`);
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds.get(name)!;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Resume audio context if it was suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      console.log(`Starting playback of ${name}`);
      source.start(0);
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
    }
  }

  playLetterSelectSound() {
    this.playSound('letterSelect', 0.5);
  }

  playCorrectSound() {
    this.playSound('correct', 0.7);
  }

  playIncorrectSound() {
    this.playSound('incorrect', 0.7);
  }

  playLevelUpSound() {
    this.playSound('levelUp', 0.8);
  }

  playCelebrationSound() {
    console.log('Playing celebration sound...');
    this.playSound('celebration', 1.0); // Full volume for celebration
  }

  playClickSound() {
    this.playSound('click', 0.5);
  }

  playComboSound() {
    this.playSound('combo', 0.7);
  }

  playCountdownSound() {
    this.playSound('countdown', 0.6);
  }

  playPowerupSound() {
    console.log('Playing powerup sound...');
    this.playSound('powerup', 0.9);
  }

  playSuccessSound() {
    this.playSound('success', 0.7);
  }

  playErrorSound() {
    console.log('Playing error sound...');
    this.playSound('error', 0.7);
  }

  animateCorrectGuess(element: HTMLElement) {
    this.playCorrectSound();
    gsap.to(element, {
      scale: 1.2,
      duration: 0.2,
      ease: 'back.out(1.7)',
      backgroundColor: '#4ade80',
      color: '#ffffff',
      yoyo: true,
      repeat: 1
    });
  }

  animateIncorrectGuess(element: HTMLElement) {
    this.playIncorrectSound();
    
    // Create shake animation using timeline
    const timeline = gsap.timeline();
    timeline.to(element, {
      x: -5,
      duration: 0.1,
      backgroundColor: '#ef4444',
      color: '#ffffff',
      ease: 'power2.inOut'
    })
    .to(element, {
      x: 5,
      duration: 0.1,
      ease: 'power2.inOut'
    })
    .to(element, {
      x: -5,
      duration: 0.1,
      ease: 'power2.inOut'
    })
    .to(element, {
      x: 5,
      duration: 0.1,
      ease: 'power2.inOut'
    })
    .to(element, {
      x: 0,
      duration: 0.1,
      ease: 'power2.inOut'
    });
  }

  animateLevelUp(container: HTMLElement) {
    this.playLevelUpSound();
    this.playCelebrationSound();
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 rounded-full bg-yellow-400';
      container.appendChild(particle);

      const startX = container.offsetWidth / 2;
      const startY = container.offsetHeight / 2;
      const endX = gsap.utils.random(-container.offsetWidth/2, container.offsetWidth/2);
      const endY = gsap.utils.random(-container.offsetHeight/2, container.offsetHeight/2);
      const scale = gsap.utils.random(0.5, 1.5);
      const duration = gsap.utils.random(1, 2);

      gsap.fromTo(particle,
        {
          x: startX,
          y: startY,
          scale: 0
        },
        {
          x: endX,
          y: endY,
          scale: scale,
          opacity: 0,
          duration: duration,
          ease: 'power2.out',
          onComplete: () => particle.remove()
        }
      );
    }
  }

  animateWordReveal(letters: HTMLElement[]) {
    this.playClickSound();
    gsap.from(letters, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    });
  }

  animateScoreIncrease(scoreElement: HTMLElement, amount: number) {
    const currentScore = parseInt(scoreElement.textContent || '0');
    const targetScore = currentScore + amount;
    
    gsap.to(scoreElement, {
      innerText: targetScore,
      duration: 1,
      ease: 'power2.out',
      snap: { innerText: 1 },
      onUpdate: () => {
        const value = Math.round(parseFloat(scoreElement.innerText));
        scoreElement.innerText = value.toString();
      }
    });
  }

  playWordFoundAnimation(word: string, points: number) {
    // Word found animation
    const wordElement = document.createElement('div');
    wordElement.textContent = `${word} +${points}`;
    wordElement.className = 'fixed text-2xl font-bold text-purple-400 pointer-events-none';
    document.body.appendChild(wordElement);

    // Random position near the center of the screen
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;

    gsap.fromTo(wordElement,
      { 
        x, 
        y, 
        opacity: 0, 
        scale: 0.5 
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
        onComplete: () => {
          gsap.to(wordElement, {
            y: '-=100',
            opacity: 0,
            duration: 0.5,
            delay: 0.5,
            onComplete: () => {
              wordElement.remove();
            }
          });
        }
      }
    );

    // Play sound effect
    this.playCorrectSound();
  }
}

export const animationService = new AnimationService();
