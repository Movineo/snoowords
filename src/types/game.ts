export interface WordSuggestion {
  word: string;
  confidence: number;
  theme?: string;
}

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
  targetScore?: number;
  participants?: number;
  completed?: boolean;
}

export interface LeaderboardEntry {
  id?: string;
  player_name: string;
  score: number;
  is_reddit_user: boolean;
  created_at: string;
  type?: 'daily' | 'all_time';
  words?: string[];
}

export type AchievementType = 'silver' | 'gold' | 'platinum' | 'ternion';

export interface CommunityPuzzle {
  id: string;
  title: string;
  description: string;
  creator: string;
  plays: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  words: string[];
  upvotes: number;
  dateCreated: string;
  category: 'popular' | 'new' | 'trending';
  minWordLength: number;
  maxWordLength: number;
  timeLimit: number;
  targetScore: number;
}
