import { supabase } from '../config/supabase';
import { Word, GameMode, Challenge, AchievementType } from '../types';

export interface GameSession {
  score: number;
  words: Word[];
  gameMode: GameMode;
  dailyTheme?: string;
  duration: number;
}

export interface LeaderboardStats {
  dailyLeaders: Array<{
    reddit_username: string;
    score: number;
    words_found: string[];
    created_at: string;
  }>;
  allTimeLeaders: Array<{
    reddit_username: string;
    total_score: number;
    games_played: number;
    best_score: number;
  }>;
}

export const gameService = {
  generateLetters(): string[] {
    const vowels = 'AEIOU';
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    const letters: string[] = [];
    
    // Ensure at least 4 vowels
    for (let i = 0; i < 4; i++) {
      letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    
    // Fill the rest with random letters (total 16 letters)
    while (letters.length < 16) {
      const isVowel = Math.random() < 0.3;
      const source = isVowel ? vowels : consonants;
      letters.push(source[Math.floor(Math.random() * source.length)]);
    }
    
    return letters.sort(() => Math.random() - 0.5);
  },

  async submitScore(redditUsername: string, session: GameSession) {
    const { data, error } = await supabase.rpc('submit_score', {
      p_reddit_username: redditUsername,
      p_score: session.score,
      p_words: session.words.map(w => w.word),
      p_game_mode: session.gameMode.id,
      p_theme: session.dailyTheme,
      p_duration: session.duration
    });

    if (error) throw error;
    return data;
  },

  async getLeaderboards(): Promise<LeaderboardStats> {
    const [dailyResponse, allTimeResponse] = await Promise.all([
      supabase
        .from('daily_leaderboard')
        .select('*')
        .limit(10),
      supabase
        .from('all_time_leaderboard')
        .select('*')
        .limit(10)
    ]);

    if (dailyResponse.error) throw dailyResponse.error;
    if (allTimeResponse.error) throw allTimeResponse.error;

    return {
      dailyLeaders: dailyResponse.data || [],
      allTimeLeaders: allTimeResponse.data || []
    };
  },

  async getDailyChallenge(): Promise<Challenge | null> {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString())
      .single();

    if (error) return null;
    return data;
  },

  async checkAchievements(redditUsername: string) {
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, karma_points, games_played')
      .eq('reddit_username', redditUsername)
      .single();

    if (playerError) return;

    // Check for achievements based on karma points and games played
    const achievements: AchievementType[] = [];
    
    if (player.karma_points >= 1000) achievements.push('karma_master');
    if (player.games_played >= 10) achievements.push('dedicated_player');
    if (player.karma_points >= 100 && player.games_played >= 5) achievements.push('rising_star');

    // Add new achievements
    for (const achievement of achievements) {
      await supabase
        .from('achievements')
        .insert({
          player_id: player.id,
          achievement_type: achievement
        })
        .select()
        .single();
    }

    return achievements;
  }
};
