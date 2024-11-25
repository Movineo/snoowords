export interface Word {
  word: string;
  points: number;
  player: string;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  duration: number;
  icon: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  targetScore: number;
  participants: number;
  start_date: string;
  end_date: string;
}

export interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  awards: string[];
  lastPlayed: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export type PowerUpId = 'timeBonus' | 'doublePoints' | 'shuffle' | 'powerLetter' | 'karmaBoost' | 'awardsMultiplier' | 'redditGold';

export type AchievementType = 'karma_master' | 'dedicated_player' | 'rising_star';

export interface PowerUp {
  id: PowerUpId;
  name: string;
  description: string;
  cost: number;
  icon: string;
  duration?: number;
  multiplier?: number;
}

export interface RedditAward {
  id: string;
  name: string;
  icon: string;
  karmaBonus: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GameState {
  timeLeft: number;
  letters: string[];
  words: Word[];
  currentWord: string;
  error: string | null;
  gameMode: GameMode | null;
  gameActive: boolean;
  showRules: boolean;
  dailyTheme: string;
  currentChallenge: Challenge | null;
  powerUps: {
    timeBonus: boolean;
    doublePoints: boolean;
    shuffle: boolean;
    powerLetter: boolean;
    karmaBoost: boolean;
    awardsMultiplier: boolean;
    redditGold: boolean;
  };
  awards: RedditAward[];
  totalKarma: number;
  highestKarmaStreak: number;
  playerName: string;
  setCurrentWord: (word: string) => void;
  submitWord: () => void;
  tick: () => void;
  activatePowerUp: (powerUpId: PowerUpId) => void;
}