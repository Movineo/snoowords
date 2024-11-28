import { supabase } from '../config/supabase';
import { Word, GameMode, Challenge, CommunityPuzzle, SubredditPack } from '../types/game';
import { mockCommunityPuzzles } from './mockCommunityPuzzles';
import { mockSubredditPacks } from './mockData';

export interface GameSession {
  score: number;
  words: string[];
  timeLeft: number;
  timestamp: string;
  gameMode: GameMode;
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
      p_words: session.words,
      p_game_mode: session.gameMode.id,
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
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // List of themes with their descriptions and bonus words
    const themes = [
      { 
        theme: 'Nature', 
        description: 'Find words related to the natural world - plants, animals, and landscapes!',
        bonus_words: ['TREE', 'FLOWER', 'RIVER', 'MOUNTAIN', 'FOREST']
      },
      { 
        theme: 'Technology', 
        description: 'Discover words about computers, gadgets, and innovation!',
        bonus_words: ['COMPUTER', 'PHONE', 'ROBOT', 'DIGITAL', 'NETWORK']
      },
      { 
        theme: 'Food', 
        description: 'Hunt for delicious food-related words!',
        bonus_words: ['PIZZA', 'PASTA', 'BREAD', 'FRUIT', 'SALAD']
      },
      { 
        theme: 'Space', 
        description: 'Find cosmic words about stars, planets, and the universe!',
        bonus_words: ['STAR', 'PLANET', 'GALAXY', 'COMET', 'MOON']
      },
      { 
        theme: 'Sports', 
        description: 'Score points with sports and athletic terms!',
        bonus_words: ['BALL', 'TEAM', 'SCORE', 'GAME', 'RACE']
      },
      { 
        theme: 'Music', 
        description: 'Find harmonious words related to music and sound!',
        bonus_words: ['SONG', 'BEAT', 'RHYTHM', 'MELODY', 'TUNE']
      },
      { 
        theme: 'Ocean', 
        description: 'Dive deep for marine and ocean-related words!',
        bonus_words: ['WAVE', 'FISH', 'CORAL', 'BEACH', 'SHELL']
      }
    ];

    // Use the day of the year to select a theme
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const todayTheme = themes[dayOfYear % themes.length];

    const mockChallenge: Challenge = {
      id: `daily-${dayOfYear}`,
      title: 'Daily Theme Challenge',
      description: todayTheme.description,
      type: 'daily',
      timeLimit: 24 * 60 * 60,
      targetScore: 100,
      reward_karma: 100,
      startDate: now.toISOString(),
      endDate: endOfDay.toISOString(),
      completed: false,
      theme: todayTheme.theme,
      bonus_words: todayTheme.bonus_words
    };

    // In production, fetch from Supabase
    if (process.env.NODE_ENV === 'production') {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('type', 'daily')
        .gte('endDate', now.toISOString())
        .order('startDate', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching daily challenge:', error);
        return mockChallenge; // Fallback to mock challenge if there's an error
      }
      return data || mockChallenge;
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

  calculateWordPoints(word: string): number {
    const basePoints = word.length;
    const bonusPoints = word.length >= 6 ? Math.floor(word.length * 0.5) : 0;
    return basePoints + bonusPoints;
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

  async getSubredditWordPacks(subreddit: string): Promise<SubredditPack[]> {
    if (process.env.NODE_ENV === 'development') {
      // Return mock data in development
      const mockPack = mockSubredditPacks[subreddit];
      return mockPack ? [mockPack] : [];
    }

    try {
      const { data, error } = await supabase
        .from('subreddit_word_packs')
        .select('*')
        .eq('subreddit', subreddit);

      if (error) {
        console.error('Error fetching word packs:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(pack => ({
        id: pack.id,
        name: pack.name || `${pack.subreddit} Pack`,
        subreddit: pack.subreddit,
        words: pack.words,
        theme: pack.theme || pack.subreddit,
        difficulty: pack.difficulty || 'medium',
        upvotes: pack.upvotes || 0,
        creator: pack.creator || 'anonymous',
        created_at: pack.created_at || new Date().toISOString(),
        description: pack.description || `Word pack for r/${pack.subreddit}`
      }));
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
    if (!word || word.length < 3) return false;

    const word_lower = word.toLowerCase();

    // Check cache first
    try {
      const cachedWords = JSON.parse(localStorage.getItem('validatedWords') || '{}');
      if (word_lower in cachedWords) {
        return cachedWords[word_lower];
      }
    } catch (e) {
      console.error('Error reading cache:', e);
    }

    // Check local dictionary first
    const commonWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for',
      'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but',
      'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an',
      'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
      'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when'
    ]);

    if (commonWords.has(word_lower)) {
      this.cacheWord(word_lower, true);
      return true;
    }

    // Try Free Dictionary API
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word_lower}`);
      const isValid = response.ok;
      this.cacheWord(word_lower, isValid);
      if (isValid) return true;
    } catch (error) {
      console.error('Error with Free Dictionary API:', error);
    }

    // Fallback to Datamuse API
    try {
      const response = await fetch(`https://api.datamuse.com/words?sp=${word_lower}&max=1`);
      if (!response.ok) throw new Error('Datamuse API error');
      
      const data = await response.json();
      const isValid = data.length > 0 && data[0].word.toLowerCase() === word_lower;
      this.cacheWord(word_lower, isValid);
      return isValid;
    } catch (error) {
      console.error('Error with Datamuse API:', error);
      return false;
    }
  },

  cacheWord(word: string, isValid: boolean) {
    try {
      const cachedWords = JSON.parse(localStorage.getItem('validatedWords') || '{}');
      cachedWords[word] = isValid;
      localStorage.setItem('validatedWords', JSON.stringify(cachedWords));
    } catch (e) {
      console.error('Error caching word:', e);
    }
  },

  async submitChallengeScore(challengeId: string, redditUsername: string, score: number, words: string[]): Promise<void> {
    const { error } = await supabase
      .from('challenge_scores')
      .insert([{
        challenge_id: challengeId,
        reddit_username: redditUsername,
        score,
        words
      }]);

    if (error) throw error;
  }
};

export type GameService = typeof gameService;
