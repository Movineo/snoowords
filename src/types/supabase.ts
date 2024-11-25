export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
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
      players: {
        Row: {
          id: string
          reddit_username: string
          karma_points: number
          games_played: number
          created_at: string
        }
        Insert: {
          id?: string
          reddit_username: string
          karma_points?: number
          games_played?: number
          created_at?: string
        }
        Update: {
          id?: string
          reddit_username?: string
          karma_points?: number
          games_played?: number
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          player_id: string
          score: number
          words_found: string[]
          game_mode: string
          daily_theme?: string
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          score: number
          words_found: string[]
          game_mode: string
          daily_theme?: string
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          score?: number
          words_found?: string[]
          game_mode?: string
          daily_theme?: string
          duration?: number
          created_at?: string
        }
      }
      daily_challenges: {
        Row: {
          id: string
          theme: string
          letters: string[]
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          theme: string
          letters: string[]
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          theme?: string
          letters?: string[]
          created_at?: string
          expires_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          player_id: string
          type: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          player_id: string
          type: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          type?: string
          unlocked_at?: string
        }
      }
    }
    Views: {
      daily_leaderboard: {
        Row: {
          reddit_username: string
          score: number
          words_found: string[]
          created_at: string
        }
      }
      all_time_leaderboard: {
        Row: {
          reddit_username: string
          total_score: number
          games_played: number
          best_score: number
        }
      }
    }
    Functions: {
      submit_score: {
        Args: {
          p_reddit_username: string
          p_score: number
          p_words: string[]
          p_game_mode: string
          p_theme: string | null
          p_duration: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
