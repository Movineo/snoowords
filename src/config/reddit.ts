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

export const REDDIT_AWARDS = {
  SILVER: {
    name: 'Silver Award',
    cost: 100,
    description: 'Shows appreciation for an outstanding contribution',
    icon: '🥈'
  },
  GOLD: {
    name: 'Gold Award',
    cost: 500,
    description: 'Gives the author a week of Reddit Premium',
    icon: '🏆'
  },
  PLATINUM: {
    name: 'Platinum Award',
    cost: 1800,
    description: 'Gives the author a month of Reddit Premium',
    icon: '💎'
  }
} as const;
