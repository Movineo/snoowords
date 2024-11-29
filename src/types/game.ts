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
  type: 'daily' | 'weekly' | 'community';
  timeLimit: number;
  targetScore?: number;
  reward_karma?: number;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  theme?: string;
  participants?: number;
  bonus_words?: string[];
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
  is_reddit_user: boolean;
  words: string[];
  avatar_url?: string;
  username?: string;
  rank?: number;
  bestWord?: string;
  wordCount?: number;
  averageWordLength?: number;
  longestStreak?: number;
  totalTime?: number;
  date?: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

export type LeaderboardSortKey = 'score' | 'wordCount' | 'averageWordLength' | 'longestStreak' | 'totalTime';

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

export interface SubredditPack {
  id: string;
  name: string;
  theme: string;
  words: string[];
  upvotes: number;
  creator: string;
  subreddit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
  lastUpdated: string;
}

export interface RedditWordPack {
  id: string;
  name: string;
  theme: string;
  subreddit: string;
  words: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
  total_words: number;
  average_word_length: number;
  description?: string;
  upvotes: number;
  creator: string;
}

export const convertToSubredditPack = (pack: RedditWordPack): SubredditPack => {
  return {
    id: pack.id,
    name: pack.name,
    theme: pack.theme,
    words: pack.words,
    upvotes: pack.upvotes,
    creator: pack.creator,
    subreddit: pack.subreddit,
    difficulty: pack.difficulty,
    created_at: pack.created_at,
    updated_at: pack.updated_at,
    lastUpdated: new Date().toISOString()
  };
};

export interface MultiplayerGameState {
  roomId: string;
  players: {
    id: string;
    name: string;
    score: number;
    words: string[];
  }[];
  status: 'waiting' | 'playing' | 'ended';
  timeLeft: number;
  winner?: string;
}

export interface ConnectedPlayer {
  id: string;
  name: string;
  status: 'online' | 'playing' | 'spectating';
  currentGame?: string;
}

export interface CommunityChallenge {
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

export interface SubredditBattle {
  id: string;
  subreddit1: string;
  subreddit2: string;
  scores: {
    [subreddit: string]: number;
  };
  players: {
    [subreddit: string]: string[];
  };
  status: 'waiting' | 'active' | 'ended';
  winner?: string;
  startTime: Date;
  endTime: Date;
}

export interface LiveAction {
  type: 'word_found' | 'power_up_used' | 'battle_end';
  player?: string;
  word?: string;
  points?: number;
  powerUp?: string;
  battleId?: string;
  winner?: string;
  timestamp?: Date;
}

export interface AwardEffect {
  pointMultiplier?: number;
  timeBonus?: number;
  comboMultiplier?: number;
  bonusWordsRevealed?: boolean;
  teamBoostActive?: boolean;
  powerUpBoostActive?: boolean;
  karmaBoostActive?: boolean;
}

export interface AwardEffects {
  pointMultiplier: number;
  timeBonus: number;
  comboMultiplier: number;
  bonusWordsRevealed: boolean;
  teamBoostActive: boolean;
  powerUpBoostActive: boolean;
  karmaBoostActive: boolean;
}

export interface GameSession {
  score: number;
  words: string[];
  timeLeft: number;
  timestamp: string;
  gameMode: GameMode;
  duration: number;
}

export type MilestoneType = 'score' | 'words' | 'streak';

export interface MilestoneReward {
  karma?: number;
  powerUps?: string[];
  achievements?: string[];
}

export interface Milestone {
  type: MilestoneType;
  threshold: number;
  reward: MilestoneReward;
  description?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'score' | 'words' | 'streak' | 'karma';
  requirement: number;
  karmaReward?: number;
  icon?: string;
}

export interface RedditUser {
  id: string;
  name: string;
  avatarUrl?: string;
  karma: number;
  created_at: string;
  achievements: { [key: string]: {
    id: string;
    name: string;
    description: string;
    type: 'score' | 'words' | 'streak' | 'karma';
    requirement: number;
    karmaReward?: number;
    unlockedAt?: string;
  }};
  preferences: {
    soundEnabled: boolean;
    theme: string;
  };
  isAuthenticated?: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'ended' | 'finished';

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  creator: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
  minWordLength: number;
  maxWordLength: number;
  timeLimit: number;
  created_at: string;
  updated_at: string;
  upvotes: number;
  plays: number;
  completionRate: number;
  averageScore: number;
  tags: string[];
  isActive: boolean;
  words: string[];
}
