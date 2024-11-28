import { Achievement } from './game';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface SubredditPack {
  id: string;
  subreddit: string;
  words: string[];
  lastUpdated: string;
  upvotes: number;
}

export interface Database {
  public: {
    Tables: {
      reddit_users: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          karma: number
          created_at: string
          achievements: { [key: string]: Achievement }
          preferences: {
            soundEnabled: boolean
            theme: string
          }
          access_token: string
          refresh_token: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          karma?: number
          created_at?: string
          achievements?: { [key: string]: Achievement }
          preferences?: {
            soundEnabled: boolean
            theme: string
          }
          access_token: string
          refresh_token: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          karma?: number
          created_at?: string
          achievements?: { [key: string]: Achievement }
          preferences?: {
            soundEnabled: boolean
            theme: string
          }
          access_token?: string
          refresh_token?: string
        }
      }
      leaderboard: {
        Row: {
          id: string
          player_name: string
          score: number
          is_reddit_user: boolean
          words: string[]
          created_at: string
        }
        Insert: {
          id?: string
          player_name: string
          score: number
          is_reddit_user?: boolean
          words?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          player_name?: string
          score?: number
          is_reddit_user?: boolean
          words?: string[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface RedditUserDB {
  id: string;
  name: string;
  avatar_url: string | null;
  karma: number;
  created_at: string;
  achievements: { [key: string]: Achievement };
  preferences: {
    soundEnabled: boolean;
    theme: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface LeaderboardDB {
  id?: string;
  player_name: string;
  score: number;
  is_reddit_user?: boolean;
  words?: string[];
  created_at?: string;
}

export interface SubredditPackDB {
  id: string;
  subreddit: string;
  words: string[];
  created_at: string;
  updated_at: string;
}
