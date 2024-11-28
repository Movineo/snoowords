const getRequiredEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Please check your .env file.`
    );
  }
  return value;
};

export const REDDIT_CONFIG = {
  CLIENT_ID: getRequiredEnvVar('VITE_REDDIT_CLIENT_ID'),
  CLIENT_SECRET: getRequiredEnvVar('VITE_REDDIT_CLIENT_SECRET'),
  REDIRECT_URI: import.meta.env.VITE_REDDIT_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  SUBREDDIT: 'SnooWords',
  SCOPES: ['identity', 'submit', 'read', 'history']
} as const;

export const REDDIT_ENDPOINTS = {
  AUTHORIZE: 'https://www.reddit.com/api/v1/authorize',
  ACCESS_TOKEN: 'https://www.reddit.com/api/v1/access_token',
  ME: 'https://oauth.reddit.com/api/v1/me',
  SUBMIT: 'https://oauth.reddit.com/api/submit',
  SUBREDDIT_ABOUT: (subreddit: string) => 
    `https://oauth.reddit.com/r/${subreddit}/about`,
} as const;

export type AwardEffect = {
  type: 'game' | 'battle';
  description: string;
  duration: number;
  multiplier: number;
  gameEffect?: 'double_points_30s' | 'reveal_bonus_words' | 'extra_time_30s' | 'combo_multiplier_2x';
  battleEffect?: 'team_boost' | 'power_up_boost' | 'karma_boost';
};

export interface BaseAward {
  name: string;
  cost: number;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface RedditAward extends BaseAward {
  type: 'reddit';
}

export interface GameAward extends BaseAward {
  type: 'game';
  gameEffect: AwardEffect;
}

export interface BattleAward extends BaseAward {
  type: 'battle';
  battleEffect: AwardEffect;
}

export type Award = RedditAward | GameAward | BattleAward;

export const REDDIT_AWARDS: Record<string, Award> = {
  SILVER: {
    name: 'Silver Award',
    cost: 100,
    description: 'Shows appreciation for an outstanding contribution',
    icon: '🥈',
    type: 'reddit',
    rarity: 'common'
  },
  GOLD: {
    name: 'Gold Award',
    cost: 500,
    description: 'Gives the author a week of Reddit Premium',
    icon: '🏆',
    type: 'reddit',
    rarity: 'rare'
  },
  PLATINUM: {
    name: 'Platinum Award',
    cost: 1800,
    description: 'Gives the author a month of Reddit Premium',
    icon: '💎',
    type: 'reddit',
    rarity: 'legendary'
  },
  // Game-specific awards
  WORDSMITH: {
    name: 'Wordsmith Award',
    cost: 300,
    description: 'Boosts word score multiplier',
    icon: '✍️',
    type: 'game',
    rarity: 'rare',
    gameEffect: {
      type: 'game',
      description: 'Doubles points for all words',
      duration: 30,
      multiplier: 2,
      gameEffect: 'double_points_30s'
    }
  },
  TIME_LORD: {
    name: 'Time Lord Award',
    cost: 400,
    description: 'Adds bonus time to the clock',
    icon: '⌛',
    type: 'game',
    rarity: 'epic',
    gameEffect: {
      type: 'game',
      description: 'Adds 30 seconds to the game timer',
      duration: 30,
      multiplier: 1,
      gameEffect: 'extra_time_30s'
    }
  },
  COMBO_MASTER: {
    name: 'Combo Master',
    cost: 500,
    description: 'Increases combo multiplier',
    icon: '🔥',
    type: 'game',
    rarity: 'epic',
    gameEffect: {
      type: 'game',
      description: 'Doubles combo multiplier',
      duration: 20,
      multiplier: 2,
      gameEffect: 'combo_multiplier_2x'
    }
  },
  // Battle-specific awards
  TEAM_BOOST: {
    name: 'Team Boost',
    cost: 600,
    description: 'Boosts entire team performance',
    icon: '🚀',
    type: 'battle',
    rarity: 'rare',
    battleEffect: {
      type: 'battle',
      description: 'Increases team performance by 50%',
      duration: 30,
      multiplier: 1.5,
      battleEffect: 'team_boost'
    }
  },
  POWER_SURGE: {
    name: 'Power Surge',
    cost: 800,
    description: 'Enhances power-up effects',
    icon: '⚡',
    type: 'battle',
    rarity: 'epic',
    battleEffect: {
      type: 'battle',
      description: 'Doubles the effectiveness of power-ups',
      duration: 20,
      multiplier: 2,
      battleEffect: 'power_up_boost'
    }
  },
  KARMA_STORM: {
    name: 'Karma Storm',
    cost: 1000,
    description: 'Massive karma boost for the team',
    icon: '🌪️',
    type: 'battle',
    rarity: 'legendary',
    battleEffect: {
      type: 'battle',
      description: 'Triples karma gains for the team',
      duration: 15,
      multiplier: 3,
      battleEffect: 'karma_boost'
    }
  }
} as const;

export type AwardType = keyof typeof REDDIT_AWARDS;
