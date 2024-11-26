import { supabase } from '../config/supabase';
import { Word, GameMode, Challenge, AchievementType, CommunityPuzzle } from '../types/game';
import { SubredditPack } from '../types/supabase';
import { mockSubredditPacks } from './mockData';
import { mockCommunityPuzzles } from './mockCommunityPuzzles';

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
    const { data, error } = await supabase.rpc('check_achievements', {
      p_reddit_username: redditUsername
    });

    if (error) {
      console.error('Error checking achievements:', error);
      return [];
    }

    return data;
  },

  async getWordSuggestion(letters: string[], usedWords: string[]): Promise<string | null> {
    try {
      // Call the Supabase function to get word suggestions
      const { data, error } = await supabase.rpc('get_word_suggestion', {
        p_letters: letters,
        p_used_words: usedWords
      });

      if (error) {
        console.error('Error getting word suggestion:', error);
        return null;
      }

      return data?.suggestion || null;
    } catch (error) {
      console.error('Error in getWordSuggestion:', error);
      return null;
    }
  },

  async getSubredditWordPacks(subreddit: string): Promise<string[]> {
    try {
      // Use mock data during development
      const mockPack = mockSubredditPacks[subreddit];
      if (mockPack) {
        return mockPack.words;
      }

      // Fallback to database if no mock data exists
      const { data, error } = await supabase
        .from('subreddit_word_packs')
        .select('words')
        .eq('subreddit', subreddit)
        .order('upvotes', { ascending: false });

      if (error) {
        console.error('Error fetching word packs:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Efficiently combine words from all packs using a Set to remove duplicates
      const uniqueWords = new Set<string>();
      data.forEach(pack => {
        if (Array.isArray(pack.words)) {
          pack.words.forEach(word => uniqueWords.add(word.toLowerCase().trim()));
        }
      });

      return Array.from(uniqueWords);
    } catch (error) {
      console.error('Unexpected error in getSubredditWordPacks:', error);
      return [];
    }
  },

  async getAllSubreddits() {
    const { data, error } = await supabase
      .from('subreddit_word_packs')
      .select('subreddit')
      .order('subreddit');

    if (error) {
      console.error('Error fetching subreddits:', error);
      return [];
    }

    // Filter unique subreddits
    const uniqueSubreddits = [...new Set(data.map(row => row.subreddit))];
    return uniqueSubreddits;
  },

  async getCommunityPuzzles(category: 'popular' | 'new' | 'trending'): Promise<CommunityPuzzle[]> {
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return mockCommunityPuzzles[category] || [];
    }

    try {
      const { data, error } = await supabase
        .from('community_puzzles')
        .select('*')
        .eq('category', category)
        .order('plays', { ascending: false });

      if (error) throw error;
      return data as CommunityPuzzle[];
    } catch (error) {
      console.error('Error fetching community puzzles:', error);
      return [];
    }
  },

  async validateWord(word: string): Promise<boolean> {
    try {
      // First check local dictionary if available
      const localDictionary = ['cat', 'dog', 'house']; // Replace with actual dictionary
      if (localDictionary.includes(word.toLowerCase())) {
        return true;
      }

      // If not in local dictionary, check external API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      return response.ok;
    } catch (error) {
      console.error('Error validating word:', error);
      return false;
    }
  },
};

export type GameService = typeof gameService;
