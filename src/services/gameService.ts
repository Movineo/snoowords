import { supabase } from '../config/supabase';
import { Word, GameMode, Challenge, CommunityPuzzle } from '../types/game';
import { mockCommunityPuzzles } from './mockCommunityPuzzles';
import { mockSubredditPacks } from './mockData';

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
    // For development, return a mock daily challenge
    const mockChallenge: Challenge = {
      id: 'daily-1',
      title: 'Daily Theme Challenge',
      description: 'Find words related to today\'s theme to earn bonus points!',
      theme: 'Technology',
      start_date: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      end_date: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      reward_karma: 100,
      targetScore: 100,
      participants: 42
    };

    // In production, fetch from Supabase
    if (process.env.NODE_ENV === 'production') {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .gte('end_date', new Date().toISOString())
        .lte('start_date', new Date().toISOString())
        .single();

      if (error) return mockChallenge;
      return data;
    }

    return mockChallenge;
  },

  async checkAchievements(redditUsername: string) {
    const achievements = [
      {
        name: 'Time Award',
        description: 'Complete a game in under 120 seconds',
        karmaReward: 50000,
        check: async () => {
          const { data } = await supabase
            .from('game_sessions')
            .select('duration')
            .eq('reddit_username', redditUsername)
            .lt('duration', 120)
            .limit(1);
          return data && data.length > 0;
        }
      },
      {
        name: 'Double Karma',
        description: 'Score over 200 points in a single game',
        karmaReward: 100000,
        check: async () => {
          const { data } = await supabase
            .from('game_sessions')
            .select('score')
            .eq('reddit_username', redditUsername)
            .gt('score', 200)
            .limit(1);
          return data && data.length > 0;
        }
      },
      {
        name: 'Karma Boost',
        description: 'Find 10 themed words in a single game',
        karmaReward: 75000,
        check: async () => {
          const { data } = await supabase
            .from('game_sessions')
            .select('words')
            .eq('reddit_username', redditUsername)
            .limit(1)
            .single();
          if (!data) return false;
          const themedWords = data.words.filter((word: Word) => word.themed);
          return themedWords.length >= 10;
        }
      },
      {
        name: 'Awards Multiplier',
        description: 'Win 3 daily challenges',
        karmaReward: 150000,
        check: async () => {
          const { data } = await supabase
            .from('daily_challenge_winners')
            .select('challenge_id')
            .eq('reddit_username', redditUsername);
          return data && data.length >= 3;
        }
      },
      {
        name: 'Reddit Gold',
        description: 'Complete all other achievements',
        karmaReward: 500000,
        check: async () => {
          const otherAchievements = ['time_award', 'double_karma', 'karma_boost', 'awards_multiplier'];
          const { data } = await supabase
            .from('user_achievements')
            .select('achievement_name')
            .eq('reddit_username', redditUsername)
            .in('achievement_name', otherAchievements);
          return data && data.length >= 4;
        }
      }
    ];

    const unlockedAchievements = [];
    
    // Check each achievement
    for (const achievement of achievements) {
      const isUnlocked = await achievement.check();
      if (isUnlocked) {
        // Check if already awarded
        const { data } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('reddit_username', redditUsername)
          .eq('achievement_name', achievement.name.toLowerCase().replace(' ', '_'))
          .single();
        
        if (!data) {
          // Award new achievement
          await supabase.from('user_achievements').insert({
            reddit_username: redditUsername,
            achievement_name: achievement.name.toLowerCase().replace(' ', '_'),
            awarded_at: new Date().toISOString(),
            karma_reward: achievement.karmaReward
          });
          unlockedAchievements.push(achievement);
        }
      }
    }

    return unlockedAchievements;
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
      const word_lower = word.toLowerCase();

      // First check cached words
      try {
        const cachedWords = JSON.parse(localStorage.getItem('validatedWords') || '{}');
        if (cachedWords[word_lower] !== undefined) {
          return cachedWords[word_lower];
        }
      } catch (e) {
        console.error('Error checking cached words:', e);
      }

      // Try Free Dictionary API first
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word_lower}`);
        if (response.ok) {
          // Cache the valid word
          try {
            const cachedWords = JSON.parse(localStorage.getItem('validatedWords') || '{}');
            cachedWords[word_lower] = true;
            localStorage.setItem('validatedWords', JSON.stringify(cachedWords));
          } catch (e) {
            console.error('Error caching word:', e);
          }
          return true;
        }
      } catch (error) {
        console.error('Error with Free Dictionary API:', error);
      }

      // Fallback to Datamuse API
      try {
        const response = await fetch(`https://api.datamuse.com/words?sp=${word_lower}&md=d&max=1`);
        if (response.ok) {
          const data = await response.json();
          const isValid = data.length > 0 && data[0].word === word_lower && data[0].defs;
          
          // Cache the result
          try {
            const cachedWords = JSON.parse(localStorage.getItem('validatedWords') || '{}');
            cachedWords[word_lower] = isValid;
            localStorage.setItem('validatedWords', JSON.stringify(cachedWords));
          } catch (e) {
            console.error('Error caching word:', e);
          }

          return isValid;
        }
      } catch (error) {
        console.error('Error with Datamuse API:', error);
      }

      // If both APIs fail, check against a basic list of common words
      const commonWords = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as',
        'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will',
        'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which',
        'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
        'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its',
        'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
        'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
      ]);

      if (commonWords.has(word_lower)) {
        try {
          const cachedWords = JSON.parse(localStorage.getItem('validatedWords') || '{}');
          cachedWords[word_lower] = true;
          localStorage.setItem('validatedWords', JSON.stringify(cachedWords));
        } catch (e) {
          console.error('Error caching word:', e);
        }
        return true;
      }

      // If all checks fail, cache as invalid and return false
      try {
        const cachedWords = JSON.parse(localStorage.getItem('validatedWords') || '{}');
        cachedWords[word_lower] = false;
        localStorage.setItem('validatedWords', JSON.stringify(cachedWords));
      } catch (e) {
        console.error('Error caching word:', e);
      }
      return false;

    } catch (error) {
      console.error('Error validating word:', error);
      return false;
    }
  },
};

export type GameService = typeof gameService;
