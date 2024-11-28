export interface Word {
  word: string;
  points: number;
  themed?: boolean;
  player: string;
}

export interface GameRules {
  minWordLength: number;
  maxWordLength: number;
  allowedCategories?: string[];
  bonusPoints?: {
    category: string;
    multiplier: number;
  }[];
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  duration: number;
  icon: string;
  rules: GameRules;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  theme: string;
  reward_karma: number;
  completed?: boolean;
}

export interface ICommunityChallenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  bonus_words: string[];
  startTime: Date;
  endTime: Date;
  completed?: boolean;
  targetScore?: number;
  timeLimit: number;
  leaderboard: {
    username: string;
    score: number;
    words: string[];
  }[];
  username: string;
  score: number;
  words: string[];
}

export type AchievementType = 'silver' | 'gold' | 'platinum' | 'ternion';

export * from './game';
