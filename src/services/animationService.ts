import { gsap } from 'gsap';

class AnimationService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Initialize Web Audio API on first user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
        this.loadSounds();
      }
    }, { once: true });
  }

  private async loadSounds() {
    // Disable sounds for now until we have proper sound files
    return;
    
    /* const soundEffects = {
      correct: '/sounds/correct.mp3',
      incorrect: '/sounds/incorrect.mp3',
      levelUp: '/sounds/level-up.mp3',
      click: '/sounds/click.mp3',
      celebration: '/sounds/celebration.mp3',
      letterSelect: '/sounds/letter-select.mp3'
    };

    for (const [name, path] of Object.entries(soundEffects)) {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.sounds.set(name, audioBuffer);
      } catch (error) {
        console.error(`Failed to load sound: ${name}`, error);
      }
    } */
  }

  playSound(name: string, volume = 1.0) {
    if (!this.audioContext || !this.sounds.has(name)) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.sounds.get(name)!;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }

  playLetterSelectSound() {
    this.playSound('letterSelect', 0.3);
  }

  animateCorrectGuess(element: HTMLElement) {
    this.playSound('correct');
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
    this.playSound('incorrect');
    
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
    this.playSound('levelUp');
    this.playSound('celebration', 0.7);
    
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
    this.playSound('click', 0.3);
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
    this.playSound('correct', 0.5);
  }
}

export const animationService = new AnimationService();
