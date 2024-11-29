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
          access_token: string
          refresh_token: string
          preferences: {
            soundEnabled: boolean
            theme: string
          }
          achievements: { [key: string]: Achievement }
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          karma?: number
          created_at?: string
          access_token: string
          refresh_token: string
          preferences?: {
            soundEnabled: boolean
            theme: string
          }
          achievements?: { [key: string]: Achievement }
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          karma?: number
          created_at?: string
          access_token?: string
          refresh_token?: string
          preferences?: {
            soundEnabled: boolean
            theme: string
          }
          achievements?: { [key: string]: Achievement }
        }
      }
      subreddit_battles: {
        Row: {
          id: string
          subreddit1: string
          subreddit2: string
          start_time: string
          end_time: string
          scores: { [subreddit: string]: number }
          participants: { [subreddit: string]: string[] }
          word_pack: {
            id: string
            name: string
            theme: string
            subreddit: string
            words: string[]
            category: string
            difficulty: 'easy' | 'medium' | 'hard'
            created_at: string
            updated_at: string
            total_words: number
            average_word_length: number
            description?: string
            upvotes: number
            creator: string
          }
          status: 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          subreddit1: string
          subreddit2: string
          start_time?: string
          end_time: string
          scores?: { [subreddit: string]: number }
          participants?: { [subreddit: string]: string[] }
          word_pack: {
            id: string
            name: string
            theme: string
            subreddit: string
            words: string[]
            category: string
            difficulty: 'easy' | 'medium' | 'hard'
            created_at: string
            updated_at: string
            total_words: number
            average_word_length: number
            description?: string
            upvotes: number
            creator: string
          }
          status?: 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subreddit1?: string
          subreddit2?: string
          start_time?: string
          end_time?: string
          scores?: { [subreddit: string]: number }
          participants?: { [subreddit: string]: string[] }
          word_pack?: {
            id: string
            name: string
            theme: string
            subreddit: string
            words: string[]
            category: string
            difficulty: 'easy' | 'medium' | 'hard'
            created_at: string
            updated_at: string
            total_words: number
            average_word_length: number
            description?: string
            upvotes: number
            creator: string
          }
          status?: 'active' | 'completed'
          created_at?: string
          updated_at?: string
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
  access_token: string;
  refresh_token: string;
  preferences: {
    soundEnabled: boolean;
    theme: string;
  };
  achievements: { [key: string]: Achievement };
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
