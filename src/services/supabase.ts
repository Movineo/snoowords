import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Add debug logging for Supabase connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', event, session?.user?.id);
});

export interface DailyChallenge {
  id: string;
  theme: string;
  bonus_words: string[];
  start_date: string;
  end_date: string;
  target_score: number;
}

export interface GameSession {
  id: string;
  player_id: string;
  score: number;
  words_found: string[];
  game_mode: string;
  daily_theme?: string;
  duration: number;
  created_at: string;
}

export const getDailyChallenges = async () => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .gte('end_date', now)
    .lte('start_date', now);

  if (error) throw error;
  return data;
};

export const getDailyLeaderboard = async (limit = 10) => {
  const { data, error } = await supabase
    .from('daily_leaderboard')
    .select('*')
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getAllTimeLeaderboard = async (limit = 10) => {
  const { data, error } = await supabase
    .from('all_time_leaderboard')
    .select('*')
    .limit(limit);

  if (error) throw error;
  return data;
};

export const submitScore = async (
  redditUsername: string,
  score: number,
  wordsFound: string[],
  gameMode: string,
  dailyTheme?: string | null,
  duration: number = 60
) => {
  const { data, error } = await supabase
    .rpc('submit_score', {
      p_reddit_username: redditUsername,
      p_score: score,
      p_words: wordsFound,
      p_game_mode: gameMode,
      p_theme: dailyTheme ?? null,
      p_duration: duration
    });

  if (error) throw error;
  return data;
};

export const unlockAchievement = async (
  playerId: string,
  achievementType: string
) => {
  const { data, error } = await supabase
    .from('player_achievements')
    .insert({
      player_id: playerId,
      achievement_type: achievementType,
      unlocked_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }

  return data;
};

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('subreddit_word_packs')
      .select('subreddit')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('Database connection test succeeded:', data);
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};

// Call test on initialization
testDatabaseConnection().then(connected => {
  console.log('Initial database connection status:', connected);
});
