import { gsap } from 'gsap';

interface CelebrationConfig {
  duration?: number;
  ease?: string;
  scale?: number;
  rotation?: number;
  opacity?: number;
}

export const triggerCelebration = (
  type: 'achievement' | 'milestone' | 'battle' | 'streak',
  intensity: number = 1,
  config: CelebrationConfig = {}
) => {
  const defaultConfig = {
    duration: 0.5,
    ease: 'power2.out',
    scale: 1.2,
    rotation: 360,
    opacity: 0.8,
    ...config
  };

  switch (type) {
    case 'achievement':
      gsap.to('.achievement-icon', {
        scale: defaultConfig.scale,
        rotation: defaultConfig.rotation * intensity,
        duration: defaultConfig.duration,
        ease: defaultConfig.ease,
        yoyo: true,
        repeat: 1
      });
      break;
    case 'milestone':
      gsap.to('.milestone-indicator', {
        scale: defaultConfig.scale * intensity,
        opacity: defaultConfig.opacity,
        duration: defaultConfig.duration,
        ease: defaultConfig.ease,
        yoyo: true,
        repeat: 1
      });
      break;
    case 'battle':
      gsap.to('.battle-effect', {
        scale: defaultConfig.scale,
        rotation: defaultConfig.rotation * intensity,
        duration: defaultConfig.duration,
        ease: defaultConfig.ease,
        yoyo: true,
        repeat: 2
      });
      break;
    case 'streak':
      gsap.to('.streak-counter', {
        scale: defaultConfig.scale * intensity,
        y: -20 * intensity,
        duration: defaultConfig.duration,
        ease: defaultConfig.ease,
        yoyo: true,
        repeat: 1
      });
      break;
  }
};

export const playCelebrationSound = (type: 'achievement' | 'milestone' | 'battle' | 'streak') => {
  const sounds = {
    achievement: new Audio('/sounds/achievement.mp3'),
    milestone: new Audio('/sounds/milestone.mp3'),
    battle: new Audio('/sounds/battle.mp3'),
    streak: new Audio('/sounds/streak.mp3')
  };

  const sound = sounds[type];
  sound.volume = 0.5;
  sound.play().catch(error => {
    console.warn('Could not play celebration sound:', error);
  });
};
