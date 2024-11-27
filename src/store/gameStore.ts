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
import { animationService } from '../services/animationService'; // Import animationService

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
    id: 'wordsmith',
    name: 'Wordsmith',
    description: 'Find your first 5-letter word',
    icon: 'silver' as AchievementType,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'theme_master',
    name: 'Theme Master',
    description: 'Find 3 theme-related words',
    icon: 'silver' as AchievementType,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'silver',
    name: 'Silver Award',
    description: 'Score 50 points in one game',
    icon: 'silver' as AchievementType,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'gold',
    name: 'Gold Award',
    description: 'Score 100 points in one game',
    icon: 'gold' as AchievementType,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'platinum',
    name: 'Platinum Award',
    description: 'Score 200 points and find a 7+ letter word',
    icon: 'platinum' as AchievementType,
    unlocked: false,
    progress: 0,
  },
  {
    id: 'ternion',
    name: 'Ternion Award',
    description: 'Score 500 points and maintain a 3-word streak',
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
          player: state.playerName || 'Anonymous'
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

        // Track theme-related words
        const themeWords = state.words.filter(w => w.themed).length;
        
        // Update achievement progress
        const achievements = state.achievements.map(achievement => {
          let progress = 0;

          switch (achievement.id) {
            case 'wordsmith':
              // Check for 5-letter words
              progress = state.words.some(w => w.word.length >= 5) ? 100 : 0;
              break;

            case 'theme_master':
              // Progress based on theme-related words (need 3)
              progress = Math.min((themeWords / 3) * 100, 100);
              break;

            case 'silver':
              // Progress towards 50 points
              progress = Math.min((state.score / 50) * 100, 100);
              break;

            case 'gold':
              // Progress towards 100 points
              progress = Math.min((state.score / 100) * 100, 100);
              break;

            case 'platinum':
              // Need both 200 points and a 7+ letter word
              const hasLongWord = state.words.some(w => w.word.length >= 7);
              const scoreProgress = Math.min((state.score / 200) * 100, 100);
              progress = hasLongWord ? scoreProgress : Math.min(scoreProgress, 90);
              break;

            case 'ternion':
              // Need 500 points and 3-word streak
              const streakProgress = Math.min((state.streak / 3) * 100, 100);
              const highScoreProgress = Math.min((state.score / 500) * 100, 100);
              progress = Math.min(streakProgress, highScoreProgress);
              break;
          }

          if (!achievement.unlocked && progress >= 100) {
            showAchievementToast(achievement.name);
            animationService.playCelebrationSound();
            return { ...achievement, progress: 100, unlocked: true };
          }

          return { ...achievement, progress };
        });

        if (achievements.some((a, i) => a.progress !== state.achievements[i].progress)) {
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

        // Always fetch a fresh theme when starting a game
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
        }).catch(error => {
          console.error('Failed to fetch theme:', error);
        });
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

            // Check for theme updates every 10 seconds during gameplay
            if (state.timeLeft % 10 === 0) {
              themeService.getDailyTheme().then(theme => {
                if (theme && theme.theme !== state.dailyTheme) {
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

      submitWord: async () => {
        const state = get();
        const word = state.currentWord.toLowerCase();

        // Get current leaderboard scores
        let dailyTopScore = 0;
        let allTimeTopScore = 0;
        try {
          // Get daily top score
          const today = new Date().toISOString().split('T')[0];
          const { data: dailyData } = await supabase
            .from('leaderboard')
            .select('score')
            .gte('created_at', today)
            .order('score', { ascending: false })
            .limit(1)
            .single();
          
          if (dailyData) {
            dailyTopScore = dailyData.score;
            console.log('Current daily top score:', dailyTopScore);
          }

          // Get all-time top score
          const { data: allTimeData } = await supabase
            .from('leaderboard')
            .select('score')
            .order('score', { ascending: false })
            .limit(1)
            .single();
          
          if (allTimeData) {
            allTimeTopScore = allTimeData.score;
            console.log('Current all-time top score:', allTimeTopScore);
          }
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
        }

        // Validation checks
        if (!word) {
          set({ error: 'Please enter a word' });
          animationService.playErrorSound();
          return;
        }

        if (word.length < 3) {
          set({ error: 'Word must be at least 3 letters long' });
          animationService.playErrorSound();
          return;
        }

        if (state.words.some(w => w.word.toLowerCase() === word)) {
          set({ error: 'Word already used' });
          animationService.playErrorSound();
          return;
        }

        // Calculate points (1 point per letter, bonus for theme-related words)
        let points = word.length;
        const isThemeBonus = Boolean(state.dailyTheme && word.toLowerCase().includes(state.dailyTheme.toLowerCase()));
        
        if (isThemeBonus) {
          points *= 2; // Double points for theme-related words
          animationService.playPowerupSound();
        } else {
          animationService.playSuccessSound();
        }

        if (points >= 10) {
          animationService.playComboSound();
        }

        const newScore = state.score + points;

        // Check if player took the lead in either leaderboard
        if ((dailyTopScore > 0 && newScore > dailyTopScore) || 
            (allTimeTopScore > 0 && newScore > allTimeTopScore)) {
          console.log('Player took the lead! Playing celebration sound');
          animationService.playCelebrationSound();
          
          if (newScore > allTimeTopScore) {
            showAchievementToast('New All-Time High Score! 🏆');
          } else {
            showAchievementToast('New Daily High Score! 🌟');
          }
        }

        // Add word to list
        const newWord: Word = {
          word,
          points,
          themed: isThemeBonus || undefined,
          player: state.playerName || 'Guest'
        };

        set({
          words: [...state.words, newWord],
          currentWord: '',
          selectedLetters: [],
          error: null,
          score: newScore
        });

        // Check for level up
        if (state.words.length % 5 === 0) {
          animationService.playLevelUpSound();
        }
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
        
        // Prevent selecting the same letter position twice
        if (selectedLetters.includes(index)) {
          return;
        }
        
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