import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { showAchievementToast } from '../utils/notifications';
import { Word, AchievementType, Challenge, GameMode, GameRules, LeaderboardEntry, CommunityPuzzle } from '../types/game';
import { SubredditPack } from '../types/supabase';
import { supabase } from '../services/supabase';
import { gameService } from '../services/gameService';
import { themeService } from '../services/themeService';
import { generateLetters } from '../utils/gameUtils';
import { mockSubredditPacks } from '../services/mockData';

type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';

interface RedditUser {
  isAuthenticated: boolean;
  name: string;
  karma?: number;
  avatar?: string | null;
  trophies?: number | null;
  achievements: {
    [key: string]: {
      unlocked: boolean;
      progress: number;
    }
  };
}

interface GameState {
  playerName: string;
  score: number;
  streak: number;
  longestStreak: number;
  words: Word[];
  currentWord: string;
  letters: string[];
  selectedLetters: number[];
  error: string | null;
  status: GameStatus;
  timeLeft: number;
  redditUser: RedditUser;
  gameStartTime: Date | null;
  finalScore: number | null;
  showRules: boolean;
  dailyTheme: string;
  showAchievements: boolean;
  leaderboard: {
    daily: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
    loading: boolean;
    error: string | null;
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: AchievementType;
    unlocked: boolean;
    progress: number;
  }[];
  powerUps: {
    timeAward: boolean;
    doubleKarma: boolean;
    karmaBoost: boolean;
    awardsMultiplier: boolean;
    redditGold: boolean;
    timeFreeze: boolean;
    wordHint: boolean;
    scoreBoost: boolean;
    letterShuffle: boolean;
  };
  karma: number;
  currentChallenge: Challenge | null;
  isVoiceEnabled: boolean;
  showSubredditPacks: boolean;
  showCommunityPuzzles: boolean;
  wordSuggestions: string[];
  gameMode: GameMode | null;
  subredditPacks: { [key: string]: SubredditPack };
  availableSubreddits: string[];
  currentSubreddit: string | null;
  communityPuzzles: CommunityPuzzle[];
  selectedCommunityPuzzle: CommunityPuzzle | null;
}

interface GameActions {
  setPlayerName: (name: string) => void;
  addWord: (word: string) => void;
  activatePowerUp: (powerUp: keyof GameState['powerUps']) => void;
  deactivatePowerUp: (powerUp: keyof GameState['powerUps']) => void;
  updateKarma: (amount: number) => void;
  checkAchievements: () => void;
  toggleAchievements: () => void;
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  updateTime: (delta: number) => void;
  resetGame: () => void;
  tick: () => void;
  setCurrentWord: (word: string) => void;
  submitWord: () => void;
  toggleRules: () => void;
  setRedditUser: (user: GameState['redditUser']) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  selectLetter: (index: number) => void;
  clearSelection: () => void;
  gameOver: () => void;
  toggleVoice: () => void;
  setShowSubredditPacks: (show: boolean) => void;
  setShowCommunityPuzzles: (show: boolean) => void;
  requestWordSuggestion: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  submitScore: () => Promise<void>;
  fetchSubredditPacks: (subreddit: string) => Promise<void>;
  fetchAvailableSubreddits: () => Promise<void>;
  fetchCommunityPuzzles: (category: 'popular' | 'new' | 'trending') => Promise<void>;
  setSelectedCommunityPuzzle: (puzzle: CommunityPuzzle | null) => void;
}

const INITIAL_ACHIEVEMENTS = [
  {
    id: 'silver',
    name: 'Silver Award',
    description: 'Earn 100 karma',
    icon: 'silver' as AchievementType,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'gold',
    name: 'Gold Award',
    description: 'Earn 500 karma',
    icon: 'gold' as AchievementType,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'platinum',
    name: 'Platinum Award',
    description: 'Earn 1000 karma and maintain a 5-word streak',
    icon: 'platinum' as AchievementType,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'ternion',
    name: 'Ternion Award',
    description: 'Earn 5000 karma and activate all power-ups',
    icon: 'ternion' as AchievementType,
    unlocked: false,
    progress: 0,
  },
];

const DAILY_THEMES = [
  'Space Exploration',
  'Technology',
  'Nature',
  'Gaming',
  'Science',
  'Movies',
  'Books',
];

const defaultGameRules: GameRules = {
  minWordLength: 3,
  maxWordLength: 16
};

const GAME_MODES: GameMode[] = [
  {
    id: 'classic',
    name: 'Classic Mode',
    description: 'Find as many words as you can in 3 minutes',
    duration: 180,
    icon: 'star',
    rules: defaultGameRules
  } as GameMode,
  {
    id: 'speed',
    name: 'Speed Run',
    description: 'Race against time with 2x points!',
    duration: 90,
    icon: 'zap',
    rules: {
      ...defaultGameRules,
      bonusPoints: [
        { category: 'all', multiplier: 2 }
      ]
    }
  } as GameMode,
  {
    id: 'challenge',
    name: 'Daily Challenge',
    description: 'Special themed words with bonus points',
    duration: 300,
    icon: 'trophy',
    rules: {
      ...defaultGameRules,
      minWordLength: 4,
      bonusPoints: [
        { category: 'theme', multiplier: 2 }
      ]
    }
  } as GameMode
];

const initialState: GameState = {
  playerName: '',
  score: 0,
  streak: 0,
  longestStreak: 0,
  words: [],
  currentWord: '',
  letters: generateLetters(),
  selectedLetters: [],
  error: null,
  status: 'idle',
  timeLeft: 180,
  redditUser: {
    isAuthenticated: false,
    name: '',
    achievements: {}
  },
  gameStartTime: null,
  finalScore: null,
  showRules: false,
  dailyTheme: '',
  showAchievements: false,
  leaderboard: {
    daily: [],
    allTime: [],
    loading: false,
    error: null
  },
  achievements: INITIAL_ACHIEVEMENTS,
  powerUps: {
    timeAward: false,
    doubleKarma: false,
    karmaBoost: false,
    awardsMultiplier: false,
    redditGold: false,
    timeFreeze: false,
    wordHint: false,
    scoreBoost: false,
    letterShuffle: false
  },
  karma: 0,
  currentChallenge: null,
  isVoiceEnabled: false,
  showSubredditPacks: false,
  showCommunityPuzzles: false,
  wordSuggestions: [],
  gameMode: GAME_MODES[0],
  subredditPacks: {},
  availableSubreddits: [],
  currentSubreddit: null,
  communityPuzzles: [],
  selectedCommunityPuzzle: null,
};

export const useStore = create<GameState & GameActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions
      setPlayerName: (name: string) => set({ playerName: name }),

      addWord: (word: string) => {
        const state = get();
        const newWord: Word = {
          word,
          points: word.length,
          player: state.playerName || 'Anonymous',
        };
        set({
          words: [...state.words, newWord],
        } as Partial<GameState>);
      },

      activatePowerUp: (powerUp: keyof GameState['powerUps']) =>
        set((state: GameState) => ({
          powerUps: {
            ...state.powerUps,
            [powerUp]: true,
          },
        } as Partial<GameState>)),

      deactivatePowerUp: (powerUp: keyof GameState['powerUps']) =>
        set((state: GameState) => ({
          powerUps: {
            ...state.powerUps,
            [powerUp]: false,
          },
        } as Partial<GameState>)),

      updateKarma: (amount: number) =>
        set((state: GameState) => ({
          karma: state.karma + amount,
        } as Partial<GameState>)),

      checkAchievements: () => {
        const state = get();
        const achievements = state.achievements.map(achievement => {
          if (!achievement.unlocked && achievement.progress >= 100) {
            showAchievementToast(achievement.name);
            return { ...achievement, unlocked: true };
          }
          return achievement;
        });

        if (achievements !== state.achievements) {
          set({ achievements } as Partial<GameState>);
        }
      },

      toggleAchievements: () =>
        set((state: GameState) => ({
          showAchievements: !state.showAchievements,
        } as Partial<GameState>)),

      startGame: () => {
        const letters = generateLetters();
        set({
          letters,
          status: 'playing',
          score: 0,
          words: [],
          currentWord: '',
          error: null,
          timeLeft: get().gameMode?.duration || 180,
          gameStartTime: new Date(),
          finalScore: null,
          selectedLetters: [],
        });

        // Fetch daily theme if not already set
        if (!get().dailyTheme) {
          themeService.getDailyTheme().then(theme => {
            if (theme) {
              const challenge: Challenge = {
                id: theme.id,
                title: 'Daily Theme Challenge',
                description: theme.description,
                theme: theme.theme,
                start_date: theme.created_at,
                end_date: theme.expires_at,
                reward_karma: 100,
                targetScore: 100,
                participants: 0
              };

              set({
                dailyTheme: theme.theme,
                currentChallenge: challenge
              });
            }
          });
        }
      },

      pauseGame: () => set({ status: 'paused' } as Partial<GameState>),

      endGame: () => {
        const state = get();
        const { score, words, redditUser, playerName } = state;

        // Ensure we have a valid player name
        const getPlayerName = (): string => {
          if (redditUser.isAuthenticated && redditUser.name) {
            return redditUser.name;
          }
          return playerName || 'Anonymous';
        };

        // Submit score to Supabase
        const submitGameScore = async () => {
          try {
            const { error } = await supabase
              .from('leaderboard')
              .insert([{
                player_name: getPlayerName(),
                score,
                is_reddit_user: redditUser.isAuthenticated,
                words: words.map(w => w.word)
              }]);

            if (error) throw error;
          } catch (err) {
            console.error('Error submitting score:', err);
          }
        };

        // Submit score if it's greater than 0
        if (score > 0) {
          submitGameScore();
        }

        set({ 
          status: 'ended',
          finalScore: score,
          gameStartTime: null
        });

        // If Reddit user, update their karma
        if (redditUser.isAuthenticated) {
          get().updateKarma(score);
        }
      },

      tick: () => {
        const state = get();
        if (state.status === 'playing') {
          if (state.timeLeft > 0) {
            set({ timeLeft: state.timeLeft - 1 } as Partial<GameState>);
          } else {
            get().endGame();
          }
        }
      },

      setCurrentWord: (word: string) => {
        set({
          currentWord: word.toUpperCase(),
          error: null,
        } as Partial<GameState>);
      },

      submitWord: () => {
        const state = get();
        const word = state.currentWord.toLowerCase();

        // Check if word is empty
        if (!word) {
          set({ error: 'Please enter a word' });
          return;
        }

        // Check if word is too short
        if (word.length < 3) {
          set({ error: 'Word must be at least 3 letters long' });
          return;
        }

        // Check if word has already been used
        if (state.words.some(w => w.word.toLowerCase() === word)) {
          set({ error: 'You have already used this word' });
          return;
        }

        // Create a frequency map of available letters
        const letterFrequency: { [key: string]: number } = {};
        state.letters.forEach(letter => {
          const lowerLetter = letter.toLowerCase();
          letterFrequency[lowerLetter] = (letterFrequency[lowerLetter] || 0) + 1;
        });

        // Check if we have enough of each letter to form the word
        const wordLetterFrequency: { [key: string]: number } = {};
        for (const letter of word) {
          wordLetterFrequency[letter] = (wordLetterFrequency[letter] || 0) + 1;
          if (!letterFrequency[letter] || wordLetterFrequency[letter] > letterFrequency[letter]) {
            set({ error: `Not enough letter "${letter.toUpperCase()}" available` });
            return;
          }
        }

        // Validate word against dictionary
        gameService.validateWord(word).then(isValid => {
          if (!isValid) {
            set({ error: 'Not a valid word' });
            return;
          }

          // Calculate points (you can adjust the scoring formula)
          const points = Math.pow(2, word.length - 2);

          // Create new word object with proper type
          const newWord: Word = {
            word,
            points,
            player: state.playerName
          };

          // Add word to the list with proper typing
          set((state: GameState) => ({
            words: [...state.words, newWord],
            score: state.score + points,
            currentWord: '',
            selectedLetters: [],
            error: null,
            streak: state.streak + 1,
            longestStreak: Math.max(state.streak + 1, state.longestStreak)
          }));

          // Check for achievements
          get().checkAchievements();
        });
      },

      toggleRules: () =>
        set((state: GameState) => ({
          showRules: !state.showRules,
        } as Partial<GameState>)),

      setRedditUser: (user: GameState['redditUser']) => {
        set({ redditUser: user });
      },

      updateAchievementProgress: (achievementId: string, progress: number) =>
        set((state: GameState) => ({
          redditUser: {
            ...state.redditUser,
            achievements: {
              ...state.redditUser.achievements,
              [achievementId]: {
                ...state.redditUser.achievements[achievementId],
                progress,
                unlocked: progress >= 100,
              },
            },
          },
        } as Partial<GameState>)),

      selectLetter: (index: number) => {
        const state = get();
        const { selectedLetters, letters } = state;
        
        // Allow selecting the same letter position multiple times for repeated letters
        // Don't clear selection when selecting a letter again
        const newSelectedLetters = [...selectedLetters, index];
        const newWord = newSelectedLetters.map(i => letters[i]).join('');
        set({ 
          selectedLetters: newSelectedLetters,
          currentWord: newWord.toUpperCase(),
          error: null
        });
      },

      clearSelection: () => {
        set({ 
          selectedLetters: [], 
          currentWord: '',
          error: null 
        });
      },

      resetGame: () => {
        const currentState = get();
        set({
          ...initialState,
          letters: generateLetters(),
          redditUser: currentState.redditUser, // Preserve Reddit user state
          dailyTheme: currentState.dailyTheme, // Preserve current theme
          currentChallenge: currentState.currentChallenge // Preserve current challenge
        });
      },

      updateTime: (delta: number) => {
        const state = get();
        if (state.status === 'playing') {
          const newTime = Math.max(0, state.timeLeft + delta);
          set({ timeLeft: newTime });
          if (newTime === 0) {
            get().endGame();
          }
        }
      },

      gameOver: () => {
        const state = get();
        const { score, words, redditUser, currentChallenge } = state;

        // Submit score to Reddit if authenticated
        if (redditUser.isAuthenticated) {
          // redditService.submitScore(score, words.map(w => w.word));
          
          // Submit score to current challenge if it exists
          if (currentChallenge) {
            // challengeService.submitScore(currentChallenge.id, redditUser.name, score);
          }
        }

        set({ status: 'ended' } as Partial<GameState>);

        // Show achievement toast for high scores
        if (score > 100) {
          showAchievementToast('High Score! 🏆');
        }
      },

      toggleVoice: () => {
        set(state => ({ isVoiceEnabled: !state.isVoiceEnabled }));
      },

      setShowSubredditPacks: (show: boolean) => {
        set((state: GameState) => ({
          ...state,
          showSubredditPacks: show,
          // Reset current subreddit when closing
          currentSubreddit: show ? state.currentSubreddit : null
        }));
      },

      setShowCommunityPuzzles: (show: boolean) => {
        set((state: GameState) => ({
          ...state,
          showCommunityPuzzles: show
        }));
      },

      async requestWordSuggestion() {
        const state = get();
        if (!state.letters || state.letters.length === 0) return;

        const usedWords = state.words.map(w => w.word);
        const suggestion = await gameService.getWordSuggestion(state.letters, usedWords);
        
        if (suggestion) {
          set({ wordSuggestions: [...state.wordSuggestions, suggestion] });
          showAchievementToast(`Try this word: ${suggestion}`);
        }
      },

      fetchLeaderboard: async () => {
        set((state: GameState) => ({
          ...state,
          leaderboard: {
            ...state.leaderboard,
            loading: true,
            error: null
          }
        } as Partial<GameState>));

        try {
          // First try to fetch all leaderboard entries
          const { data: leaderboardData, error: fetchError } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false });

          if (fetchError) throw fetchError;

          // Split into daily and all-time after fetching
          const now = new Date();
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          
          const transformedState: Partial<GameState> = {
            leaderboard: {
              daily: leaderboardData
                ?.filter(entry => entry.created_at >= startOfDay)
                .slice(0, 10)
                .map(entry => ({
                  id: entry.id,
                  player_name: entry.player_name,
                  score: entry.score,
                  is_reddit_user: entry.is_reddit_user,
                  created_at: entry.created_at,
                  type: 'daily' as const,
                  words: entry.words || []
                })) || [],
              allTime: leaderboardData
                ?.slice(0, 10)
                .map(entry => ({
                  id: entry.id,
                  player_name: entry.player_name,
                  score: entry.score,
                  is_reddit_user: entry.is_reddit_user,
                  created_at: entry.created_at,
                  type: 'all_time' as const,
                  words: entry.words || []
                })) || [],
              loading: false,
              error: null
            }
          };

          set((state: GameState) => ({
            ...state,
            ...transformedState
          }));
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
          set((state: GameState) => ({
            ...state,
            leaderboard: {
              ...state.leaderboard,
              loading: false,
              error: 'Failed to load leaderboard data'
            }
          } as Partial<GameState>));
        }
      },

      submitScore: async () => {
        const state = get();
        const { score, words, redditUser, gameMode, dailyTheme } = state;
        
        if (score <= 0) return;

        const entry = {
          player_name: redditUser.isAuthenticated ? redditUser.name : state.playerName || 'Anonymous',
          score,
          is_reddit_user: redditUser.isAuthenticated,
          created_at: new Date().toISOString(),
          words: words.map(w => w.word)
        };

        try {
          const { error } = await supabase
            .from('leaderboard')
            .insert([entry]);

          if (error) throw error;

          // Refresh leaderboard
          get().fetchLeaderboard();
        } catch (error) {
          console.error('Error submitting score:', error);
        }
      },

      fetchSubredditPacks: async (subreddit: string) => {
        try {
          const mockPack = mockSubredditPacks[subreddit];
          const words = await gameService.getSubredditWordPacks(subreddit);
          
          set((state: GameState & GameActions) => ({
            ...state,
            subredditPacks: {
              ...state.subredditPacks,
              [subreddit]: {
                id: mockPack?.id || `${subreddit}-${Date.now()}`,
                subreddit,
                words,
                lastUpdated: new Date().toISOString(),
                upvotes: mockPack?.upvotes || 0
              }
            },
            currentSubreddit: subreddit
          }));
        } catch (error) {
          console.error('Error fetching subreddit packs:', error);
        }
      },

      fetchAvailableSubreddits: async () => {
        try {
          const subreddits = await gameService.getAllSubreddits();
          set((state: GameState) => ({
            ...state,
            availableSubreddits: subreddits
          }));
        } catch (error) {
          console.error('Error fetching available subreddits:', error);
        }
      },

      fetchCommunityPuzzles: async (category: 'popular' | 'new' | 'trending') => {
        try {
          const puzzles = await gameService.getCommunityPuzzles(category);
          set({ communityPuzzles: puzzles });
        } catch (error) {
          console.error('Error fetching community puzzles:', error);
        }
      },

      setSelectedCommunityPuzzle: (puzzle: CommunityPuzzle | null) => {
        set({ selectedCommunityPuzzle: puzzle });
      },
    })
  )
);