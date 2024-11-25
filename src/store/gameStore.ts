import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { showAchievementToast } from '../utils/notifications';
import { Word, AchievementType, Challenge } from '../types';
import { submitScore } from '../services/supabase';
import { gameService } from '../services/gameService';
import { generateLetters } from '../utils/gameUtils';
import { isThemeRelated } from '../utils/wordUtils';

type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';

interface GameState {
  playerName: string;
  score: number;
  streak: number;
  longestStreak: number;
  karma: number;
  words: Word[];
  letters: string[];
  timeLeft: number;
  currentWord: string;
  error: string | null;
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
  redditUser: {
    name: string | null;
    karma: number;
    isAuthenticated: boolean;
    achievements: {
      [key: string]: {
        unlocked: boolean;
        progress: number;
      }
    };
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: AchievementType;
    unlocked: boolean;
    progress: number;
  }[];
  currentChallenge: Challenge | null;
  dailyTheme: string;
  showAchievements: boolean;
  showRules: boolean;
  gameStatus: GameStatus;
  timeRemaining: number;
  multiplier: number;
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

export const useStore = create<GameState & GameActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      playerName: '',
      score: 0,
      streak: 0,
      longestStreak: 0,
      karma: 0,
      words: [],
      letters: generateLetters(),
      timeLeft: 60,
      currentWord: '',
      error: null,
      gameMode: null,
      powerUps: {
        timeAward: false,
        doubleKarma: false,
        karmaBoost: false,
        awardsMultiplier: false,
        redditGold: false,
      },
      redditUser: {
        isAuthenticated: false,
        name: null,
        karma: 0,
        achievements: {
          first_post: { unlocked: false, progress: 0 },
          karma_collector: { unlocked: false, progress: 0 },
          award_giver: { unlocked: false, progress: 0 },
          community_leader: { unlocked: false, progress: 0 },
        },
      },
      achievements: INITIAL_ACHIEVEMENTS,
      currentChallenge: null,
      dailyTheme: DAILY_THEMES[Math.floor(Math.random() * DAILY_THEMES.length)],
      showAchievements: false,
      showRules: false,
      gameStatus: 'idle',
      timeRemaining: 60,
      multiplier: 1,

      // Actions
      setPlayerName: (name: string) => set({ playerName: name }),

      addWord: (word: string) => {
        const state = get();
        const newWord: Word = {
          word,
          points: word.length,
          player: state.playerName || 'Anonymous',
        };
        set((state: GameState) => ({
          words: [...state.words, newWord],
        } as Partial<GameState>));
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
        let updated = false;
        const unlockedAchievements: string[] = [];

        const newAchievements = state.achievements.map(achievement => {
          if (!achievement.unlocked && achievement.progress >= 100) {
            updated = true;
            unlockedAchievements.push(achievement.name);
            return { ...achievement, unlocked: true };
          }
          return achievement;
        });

        if (updated) {
          set({ achievements: newAchievements } as Partial<GameState>);
          unlockedAchievements.forEach(name => showAchievementToast(name));
        }
      },

      toggleAchievements: () =>
        set((state: GameState) => ({
          showAchievements: !state.showAchievements,
        } as Partial<GameState>)),

      startGame: () => {
        const state = get();
        set({
          gameStatus: 'playing',
          timeLeft: 60,
          letters: generateLetters(),
          words: [],
          score: 0,
          streak: 0,
          currentWord: '',
          error: null,
        } as Partial<GameState>);

        // Load daily challenge
        gameService.getDailyChallenge().then(challenge => {
          if (challenge) {
            set({
              dailyTheme: challenge.theme || 'technology',
              currentChallenge: challenge,
            } as Partial<GameState>);
          }
        });
      },

      pauseGame: () => set({ gameStatus: 'paused' } as Partial<GameState>),
      endGame: () => {
        const state = get();
        const { score, words, gameMode, dailyTheme } = state;

        // Submit score to leaderboard
        if (state.playerName) {
          submitScore(
            state.playerName,
            score,
            words.map(w => w.word),
            gameMode?.name || 'classic',
            dailyTheme,
            60
          ).catch(console.error);
        }

        // Check for achievements
        get().checkAchievements();

        // Update game state
        set({
          gameStatus: 'ended',
          timeLeft: 0,
          currentWord: '',
        } as Partial<GameState>);
      },

      updateTime: (delta: number) =>
        set((state: GameState) => ({
          timeRemaining: Math.max(0, state.timeRemaining + delta),
        } as Partial<GameState>)),

      resetGame: () =>
        set({
          score: 0,
          streak: 0,
          words: [],
          letters: generateLetters(),
          timeLeft: 60,
          currentWord: '',
          error: null,
          gameStatus: 'idle',
          timeRemaining: 60,
          multiplier: 1,
        } as Partial<GameState>),

      tick: () => {
        const state = get();
        if (state.timeLeft > 0 && state.gameStatus === 'playing') {
          set({ timeLeft: state.timeLeft - 1 } as Partial<GameState>);
        } else if (state.timeLeft === 0 && state.gameStatus === 'playing') {
          get().endGame();
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

        // Basic validation
        if (word.length < 3) {
          set({ error: 'Words must be at least 3 letters long' } as Partial<GameState>);
          return;
        }

        if (state.words.some(w => w.word === word)) {
          set({ error: 'Word already found!' } as Partial<GameState>);
          return;
        }

        // Calculate points
        let points = word.length;

        // Theme bonus (2x points for theme-related words)
        const themeCheck = (word: string, theme: string): boolean => isThemeRelated(word, theme);
        const matchesTheme = state.dailyTheme && themeCheck(word, state.dailyTheme);
        if (matchesTheme) {
          points *= 2;
          showAchievementToast(`Theme Bonus! 🌟 "${word}" matches today's theme "${state.dailyTheme}"!`);
        }

        // Streak bonus
        if (state.streak > 0) {
          points = Math.floor(points * (1 + state.streak * 0.1));
        }

        // Game mode multiplier
        if (state.gameMode?.multiplier) {
          points = Math.floor(points * state.gameMode.multiplier);
        }

        const newWord: Word = {
          word,
          points,
          player: state.playerName || 'Anonymous',
        };

        set({
          words: [...state.words, newWord],
          currentWord: '',
          error: null,
          score: state.score + points,
          streak: state.streak + 1,
        } as Partial<GameState>);
      },

      toggleRules: () =>
        set((state: GameState) => ({
          showRules: !state.showRules,
        } as Partial<GameState>)),

      setRedditUser: (user: GameState['redditUser']) => set({ redditUser: user }),

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
    })
  )
);