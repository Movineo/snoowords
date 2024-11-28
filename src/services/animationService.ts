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
      if (!this.audioContext) {
        console.log('Initializing audio context...');
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      const soundEffects: Record<string, string> = {
        // Map our game events to existing sound files
        start: '/sounds/powerup.mp3',
        wordFound: '/sounds/success.mp3',
        achievement: '/sounds/celebration.mp3',
        error: '/sounds/error.mp3',
        correct: '/sounds/correct.mp3',
        incorrect: '/sounds/incorrect.mp3',
        countdown: '/sounds/countdown.mp3',
        powerup: '/sounds/powerup.mp3',
        success: '/sounds/success.mp3',
        levelUp: '/sounds/level-up.mp3',
        combo: '/sounds/combo.mp3',
        click: '/sounds/click.mp3',
        letterSelect: '/sounds/click.mp3',
        celebration: '/sounds/celebration.mp3'
      };

      // Load essential sounds first
      const essentialSounds = ['powerup', 'error', 'correct', 'incorrect'] as const;
      for (const name of essentialSounds) {
        if (!this.sounds.has(name)) {
          try {
            console.log(`Loading essential sound: ${name}`);
            const response = await fetch(soundEffects[name]);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            if (this.audioContext) {
              console.log(`Decoding essential sound: ${name}`);
              const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
              this.sounds.set(name, audioBuffer);
            }
            console.log(`Successfully loaded essential sound: ${name}`);
          } catch (error) {
            console.error(`Failed to load essential sound: ${name}`, error);
          }
        }
      }

      // Load remaining sounds
      const remainingSounds = Object.entries(soundEffects).filter(([name]) => !essentialSounds.includes(name as any));
      await Promise.all(
        remainingSounds.map(async ([name, url]) => {
          if (!this.sounds.has(name)) {
            try {
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const arrayBuffer = await response.arrayBuffer();
              if (this.audioContext) {
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.sounds.set(name, audioBuffer);
              }
            } catch (error) {
              console.error(`Failed to load sound: ${name}`, error);
            }
          }
        })
      );
      console.log('Finished loading sounds. Available sounds:', Array.from(this.sounds.keys()));
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  public async playSound(soundName: string, volume = 1.0) {
    if (!this.audioContext || !this.sounds.has(soundName)) {
      await this.loadSounds();
    }
    
    try {
      if (this.audioContext && this.sounds.has(soundName)) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const buffer = this.sounds.get(soundName);
        
        if (buffer) {
          source.buffer = buffer;
          gainNode.gain.value = volume;
          source.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          source.start(0);
        }
      }
    } catch (error) {
      console.error(`Failed to play sound: ${soundName}`, error);
    }
  }

  playStartSound() {
    this.playSound('start');
  }

  playWordFoundSound() {
    this.playSound('wordFound');
  }

  playAchievementSound() {
    this.playSound('achievement');
  }

  playErrorSound() {
    this.playSound('error');
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

  async playGameOverSound() {
    try {
      // Use the shared playSound method which handles audio context initialization
      await this.playSound('powerup', 1.0);
    } catch (error) {
      console.error('Error playing game over sound:', error);
    }
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

  playStartAnimation() {
    // Play start sound
    this.playStartSound();

    // Find the game board container
    const gameBoard = document.querySelector('.game-board');
    if (!gameBoard) return;

    // Create a flash effect
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white pointer-events-none';
    gameBoard.appendChild(flash);

    // Animate the flash
    gsap.to(flash, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        flash.remove();
      }
    });

    // Animate letters appearing
    const letters = gameBoard.querySelectorAll('.letter');
    gsap.from(letters, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'back.out(1.7)',
    });
  }

  triggerConfetti(options: { 
    particleCount?: number; 
    spread?: number; 
    origin?: { x: number; y: number }; 
    colors?: string[];
    startVelocity?: number;
    scalar?: number;
    ticks?: number;
    shapes?: string[];
    zIndex?: number;
  } = {}) {
    const defaultOptions = {
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
      startVelocity: 30,
      scalar: 1,
      ticks: 60,
      shapes: ['circle', 'square'],
      zIndex: 100
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    // Use GSAP for the confetti animation
    const particles: HTMLDivElement[] = [];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = finalOptions.zIndex.toString();
    document.body.appendChild(container);

    for (let i = 0; i < finalOptions.particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 10 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.position = 'absolute';
      particle.style.backgroundColor = finalOptions.colors[Math.floor(Math.random() * finalOptions.colors.length)];
      particle.style.borderRadius = finalOptions.shapes[Math.floor(Math.random() * finalOptions.shapes.length)] === 'circle' ? '50%' : '0';
      particles.push(particle);
      container.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * finalOptions.startVelocity * 0.5) + (finalOptions.startVelocity * 0.5);
      const x = finalOptions.origin.x * window.innerWidth;
      const y = finalOptions.origin.y * window.innerHeight;

      gsap.fromTo(particle, 
        {
          x: x,
          y: y,
          scale: 0,
          opacity: 1
        },
        {
          x: x + Math.cos(angle) * finalOptions.spread * (Math.random() + 0.5) * 2,
          y: y + Math.sin(angle) * finalOptions.spread * (Math.random() + 0.5) * 2 + (velocity * finalOptions.ticks * 0.1),
          scale: 1,
          opacity: 0,
          duration: finalOptions.ticks * 0.01,
          ease: 'power2.out',
          onComplete: () => {
            particle.remove();
            if (particles.indexOf(particle) === particles.length - 1) {
              container.remove();
            }
          }
        }
      );
    }

    // Play celebration sound
    this.playSound('celebration');
  }

  animateWordSubmit(word: string) {
    // Find the word element in the game board
    const wordElement = document.querySelector(`[data-word="${word}"]`);
    if (!wordElement) {
      console.warn('Word element not found for animation');
      return;
    }

    // Create a floating score element
    const scoreElement = document.createElement('div');
    scoreElement.textContent = word;
    scoreElement.style.position = 'absolute';
    scoreElement.style.fontSize = '24px';
    scoreElement.style.fontWeight = 'bold';
    scoreElement.style.color = '#4CAF50';
    scoreElement.style.pointerEvents = 'none';
    scoreElement.style.zIndex = '1000';

    // Get the position of the word element
    const rect = wordElement.getBoundingClientRect();
    scoreElement.style.left = `${rect.left}px`;
    scoreElement.style.top = `${rect.top}px`;
    document.body.appendChild(scoreElement);

    // Animate the word element with a pop effect
    gsap.fromTo(wordElement,
      { scale: 1, opacity: 1 },
      {
        scale: 1.2,
        opacity: 0.8,
        duration: 0.2,
        ease: 'back.out(1.7)',
        yoyo: true,
        repeat: 1
      }
    );

    // Animate the floating score
    gsap.to(scoreElement, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        scoreElement.remove();
      }
    });

    // Add a ripple effect from the word
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '2px solid #4CAF50';
    ripple.style.left = `${rect.left + rect.width / 2 - 10}px`;
    ripple.style.top = `${rect.top + rect.height / 2 - 10}px`;
    ripple.style.pointerEvents = 'none';
    document.body.appendChild(ripple);

    gsap.to(ripple, {
      scale: 3,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        ripple.remove();
      }
    });
  }

  triggerGameOverEffect() {
    // Create game over overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.opacity = '0';
    document.body.appendChild(overlay);

    // Create game over text
    const gameOverText = document.createElement('div');
    gameOverText.textContent = 'GAME OVER';
    gameOverText.style.color = '#FF4500';
    gameOverText.style.fontSize = '64px';
    gameOverText.style.fontWeight = 'bold';
    gameOverText.style.textShadow = '0 0 10px rgba(255, 69, 0, 0.5)';
    gameOverText.style.transform = 'scale(0)';
    overlay.appendChild(gameOverText);

    // Animate overlay
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.inOut'
    });

    // Animate game over text
    gsap.to(gameOverText, {
      scale: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
      onComplete: () => {
        // Trigger confetti after text animation
        this.triggerConfetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.5, x: 0.5 },
          colors: ['#FF4500', '#FF8C00', '#FFA500', '#FFD700'],
          startVelocity: 45,
          scalar: 1.2,
          ticks: 100
        });
      }
    });

    // Play game over sound
    this.playSound('celebration');

    // Remove overlay after animations
    gsap.to(overlay, {
      opacity: 0,
      delay: 2.5,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        overlay.remove();
      }
    });

    // Add shockwave effect
    const shockwave = document.createElement('div');
    shockwave.style.position = 'fixed';
    shockwave.style.top = '50%';
    shockwave.style.left = '50%';
    shockwave.style.width = '10px';
    shockwave.style.height = '10px';
    shockwave.style.borderRadius = '50%';
    shockwave.style.border = '2px solid #FF4500';
    shockwave.style.transform = 'translate(-50%, -50%)';
    shockwave.style.zIndex = '999';
    document.body.appendChild(shockwave);

    gsap.to(shockwave, {
      scale: 50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      onComplete: () => {
        shockwave.remove();
      }
    });
  }
}

export const animationService = new AnimationService();
