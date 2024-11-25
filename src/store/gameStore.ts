import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { showAchievementToast } from '../utils/notifications';
import { Word, AchievementType, Challenge } from '../types';
import { supabase } from '../services/supabase';
import { gameService } from '../services/gameService';
import { themeService } from '../services/themeService'; // Import themeService
import { generateLetters } from '../utils/gameUtils';

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

interface LeaderboardEntry {
  player: string;
  score: number;
  isRedditUser: boolean;
  timestamp: string;
  words?: string[];
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
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: AchievementType;
    unlocked: boolean;
    progress: number;
  }[];
  gameMode: {
    name: string;
    multiplier: number;
  } | null;
  powerUps: {
    timeAward: boolean;
    doubleKarma: boolean;
    karmaBoost: boolean;
    awardsMultiplier: boolean;
    redditGold: boolean;
  };
  karma: number;
  currentChallenge: Challenge | null;
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

const INITIAL_STATE: GameState = {
  playerName: '',
  score: 0,
  streak: 0,
  longestStreak: 0,
  words: [],
  letters: generateLetters(),
  selectedLetters: [],
  timeLeft: 60,
  currentWord: '',
  error: null,
  status: 'idle',
  redditUser: {
    isAuthenticated: false,
    name: '',
    avatar: null,
    trophies: null,
    achievements: {}
  },
  gameStartTime: null,
  finalScore: null,
  showRules: false,
  dailyTheme: DAILY_THEMES[Math.floor(Math.random() * DAILY_THEMES.length)],
  showAchievements: false,
  achievements: INITIAL_ACHIEVEMENTS,
  gameMode: null,
  powerUps: {
    timeAward: false,
    doubleKarma: false,
    karmaBoost: false,
    awardsMultiplier: false,
    redditGold: false
  },
  karma: 0,
  currentChallenge: null
};

export const useStore = create<GameState & GameActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...INITIAL_STATE,

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
        set({
          status: 'playing',
          timeLeft: 60,
          letters: generateLetters(),
          words: [],
          score: 0,
          streak: 0,
          currentWord: '',
          error: null,
          selectedLetters: [],
          gameStartTime: new Date()
        } as Partial<GameState>);

        // Load daily theme
        themeService.getDailyTheme().then(theme => {
          if (theme) {
            set({
              dailyTheme: theme.theme,
              currentChallenge: {
                id: theme.id,
                title: 'Daily Theme Challenge',
                description: theme.description,
                theme: theme.theme,
                targetScore: 100,
                participants: 0,
                start_date: theme.created_at,
                end_date: theme.expires_at
              }
            } as Partial<GameState>);
          }
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
        const { currentWord, words, streak, score, gameMode, redditUser, playerName, longestStreak, letters } = state;
        const word = currentWord.toUpperCase();

        // Basic validation
        if (word.length < 3) {
          set({ error: 'Words must be at least 3 letters long' } as Partial<GameState>);
          return;
        }

        if (words.some(w => w.word.toUpperCase() === word)) {
          set({ error: 'Word already found!' } as Partial<GameState>);
          return;
        }

        // Validate word can be made from available letters
        const letterCounts = letters.reduce((acc, letter) => {
          acc[letter] = (acc[letter] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Check if word can be made from available letters
        const lettersInWord = word.split('');
        const isValidWord = lettersInWord.every(letter => 
          letterCounts[letter] && letterCounts[letter] > 0
        );

        if (!isValidWord) {
          set({ error: 'Word can only contain available letters!' } as Partial<GameState>);
          return;
        }

        // Calculate base points
        let points = word.length;

        // Check for theme bonus
        themeService.checkWordBonus(word).then(multiplier => {
          // Apply theme bonus
          points *= multiplier;
          if (multiplier > 1) {
            showAchievementToast(`Theme Bonus! 🌟 "${word}" matches today's theme!`);
          }

          // Streak bonus
          if (streak > 0) {
            points = Math.floor(points * (1 + streak * 0.1));
          }

          // Game mode multiplier
          if (gameMode?.multiplier) {
            points = Math.floor(points * gameMode.multiplier);
          }

          // Update longest streak
          const newStreak = streak + 1;
          const newLongestStreak = Math.max(longestStreak, newStreak);

          const newWord: Word = {
            word: word,
            points,
            player: playerName || 'Anonymous',
          };

          // Update game state
          set({
            words: [...words, newWord],
            currentWord: '',
            error: null,
            score: score + points,
            streak: newStreak,
            longestStreak: newLongestStreak,
            selectedLetters: [],
          } as Partial<GameState>);

          // Update karma for authenticated users
          if (redditUser.isAuthenticated) {
            get().updateKarma(points);
          }
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
        // Allow selecting the same letter multiple times
        const newSelectedLetters = [...selectedLetters, index];
        const newWord = newSelectedLetters.map(i => letters[i]).join('');
        set({ 
          selectedLetters: newSelectedLetters,
          currentWord: newWord.toUpperCase()
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
          ...INITIAL_STATE,
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
    })
  )
);