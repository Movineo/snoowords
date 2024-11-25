export interface Word {
  word: string;
  points: number;
  themed?: boolean;
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
  start_date: string;
  end_date: string;
  theme: string;
  reward_karma: number;
  completed?: boolean;
}

export type AchievementType = 'silver' | 'gold' | 'platinum' | 'ternion';
