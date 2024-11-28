import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabase';
import { gameService } from '../services/gameService';
import { animationService } from '../services/animationService';
import type {
  Word,
  GameMode,
  Challenge,
  CommunityChallenge,
  SubredditPack,
  MultiplayerGameState,
  ConnectedPlayer,
  SubredditBattle,
  LiveAction,
  AwardEffects,
  RedditUser,
  Achievement,
  GameStatus,
  CommunityPuzzle,
  LeaderboardEntry,
  Milestone,
} from '../types/game';
import { convertToSubredditPack } from '../types/game';
import { AwardEffect } from '../config/reddit';

interface IGameState {
  playerName: string;
  score: number;
  streak: number;
  words: Word[];
  letters: string[];
  currentWord: string;
  selectedIndices: number[];
  selectedLetters: number[];
  status: GameStatus;
  timeLeft: number;
  showRules: boolean;
  showAchievements: boolean;
  showLeaderboard: boolean;
  showChallenges: boolean;
  showPowerUps: boolean;
  showBattles: boolean;
  achievements: Record<string, Achievement>;
  karma: number;
  dailyTheme: Challenge | null;
  powerUps: {
    timeFreeze: {
      active: boolean;
      word?: Word;
    };
    wordHint: {
      active: boolean;
      word?: Word;
    };
    scoreBooster: {
      active: boolean;
      word?: Word;
    };
    shieldProtection: {
      active: boolean;
      word?: Word;
    };
  };
  activePowerUps: Set<string>;
  voiceEnabled: boolean;
  error: string | null;
  loading: boolean;
  redditUser: RedditUser | null;
  isAuthenticated: boolean;
  isVoiceEnabled: boolean;
  showSubredditPacks: boolean;
  showCommunityPuzzles: boolean;
  subredditPacks: { [key: string]: SubredditPack };
  availableSubreddits: string[];
  communityPuzzles: CommunityPuzzle[];
  selectedCommunityPuzzle: CommunityPuzzle | null;
  selectedWordPack: SubredditPack | null;
  multiplayerState: MultiplayerGameState | null;
  connectedPlayers: ConnectedPlayer[];
  currentBattle: SubredditBattle | null;
  spectatingBattle: SubredditBattle | null;
  liveActions: LiveAction[];
  awardEffects: AwardEffects;
  dailyStreak: number;
  lastPlayedDate: string | null;
  dailyChallenge: Challenge | null;
  weeklyChallenge: Challenge | null;
  activeChallenges: Challenge[];
  communityChallenge: CommunityChallenge | null;
  leaderboard: {
    daily: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
    loading: boolean;
    error: string | null;
  };
  currentCombo: number;
  maxCombo: number;
  gameStartTime: Date | null;
  finalScore: number | null;
  currentGameMode: GameMode | null;
  unlockedAchievements: string[];
  challengeLeaderboard: LeaderboardEntry[];
  currentChallenge: Challenge | CommunityChallenge | null;
  setCurrentWord: (word: string) => void;
}

interface GameActions {
  setPlayerName: (name: string) => void;
  addWord: (word: string) => void;
  activatePowerUp: (powerUp: keyof IGameState['powerUps'], word?: string) => void;
  deactivatePowerUp: (powerUp: keyof IGameState['powerUps']) => void;
  updateKarma: (amount: number) => void;
  incrementKarma: (amount: number) => void;
  checkAchievements: () => void;
  toggleAchievements: () => void;
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  updateTime: (delta: number) => void;
  resetGame: () => void;
  tick: () => void;
  setCurrentWord: (word: string) => void;
  addLetter: (letter: string, index: number) => void;
  removeLetter: (index: number) => void;
  clearWord: () => void;
  toggleRules: () => void;
  toggleLeaderboard: () => void;
  toggleChallenges: () => void;
  togglePowerUps: () => void;
  toggleBattles: () => void;
  setRedditUser: (user: RedditUser | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  resetGameState: () => void;
  setActiveGame: (game: MultiplayerGameState | null) => void;
  setActiveBattle: (battle: SubredditBattle | null) => void;
  toggleSubredditPacks: () => void;
  toggleCommunityPuzzles: () => void;
  setSelectedCommunityPuzzle: (puzzle: CommunityPuzzle | null) => void;
  setSelectedWordPack: (pack: SubredditPack | null) => void;
  setMultiplayerState: (state: MultiplayerGameState | null) => void;
  updateConnectedPlayers: (players: ConnectedPlayer[]) => void;
  setCurrentBattle: (battle: SubredditBattle | null) => void;
  setSpectatingBattle: (battle: SubredditBattle | null) => void;
  addLiveAction: (action: LiveAction) => void;
  clearLiveActions: () => void;
  updateAwardEffects: (effects: Partial<AwardEffects>) => void;
  updateDailyStreak: () => void;
  setDailyChallenge: (challenge: Challenge | null) => void;
  setWeeklyChallenge: (challenge: Challenge | null) => void;
  setActiveChallenges: (challenges: Challenge[]) => void;
  setCommunityChallenge: (challenge: CommunityChallenge | null) => void;
  updateLeaderboard: (entries: { daily: LeaderboardEntry[]; allTime: LeaderboardEntry[] }) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  setGameStartTime: (time: Date | null) => void;
  setFinalScore: (score: number | null) => void;
  setGameMode: (mode: GameMode | null) => void;
  checkMilestones: () => void;
  startCommunityChallenge: () => void;
  submitChallengeScore: (score: number) => Promise<void>;
  setCurrentChallenge: (challenge: Challenge | CommunityChallenge | null) => void;
  fetchLeaderboard: () => Promise<void>;
  selectLetter: (index: number) => void;
  clearSelection: () => void;
  submitWord: () => Promise<boolean>;
  applyGameEffect: (effect: AwardEffect) => void;
  applyBattleEffect: (effect: AwardEffect) => void;
  toggleVoice: () => void;
  setShowSubredditPacks: (show: boolean) => void;
  setShowCommunityPuzzles: (show: boolean) => void;
  setConnectedPlayers: (players: ConnectedPlayer[]) => void;
  updateMultiplayerState: (state: MultiplayerGameState) => void;
  addOpponentWord: (word: string, player: string) => void;
  playWordFound: (word: string) => void;
}

interface Store extends IGameState, GameActions {
  availableSubreddits: string[];
  subredditPacks: Record<string, SubredditPack>;
  currentSubreddit: string | null;
  currentWord: string;
  fetchAvailableSubreddits: () => Promise<void>;
  fetchSubredditPacks: (subreddit: string) => Promise<void>;
  setCurrentWord: (word: string) => void;
}

const initialState: IGameState = {
  playerName: '',
  score: 0,
  streak: 0,
  words: [] as Word[],
  letters: [] as string[],
  currentWord: '',
  selectedIndices: [] as number[],
  selectedLetters: [] as number[],
  status: 'idle' as GameStatus,
  timeLeft: 0,
  showRules: false,
  showAchievements: false,
  showLeaderboard: false,
  showChallenges: false,
  showPowerUps: false,
  showBattles: false,
  achievements: {} as Record<string, Achievement>,
  karma: 0,
  dailyTheme: null as Challenge | null,
  powerUps: {
    timeFreeze: {
      active: false,
      word: undefined
    },
    wordHint: {
      active: false,
      word: undefined
    },
    scoreBooster: {
      active: false,
      word: undefined
    },
    shieldProtection: {
      active: false,
      word: undefined
    }
  },
  activePowerUps: new Set<string>(),
  voiceEnabled: false,
  error: null,
  loading: false,
  redditUser: null as RedditUser | null,
  isAuthenticated: false,
  isVoiceEnabled: false,
  showSubredditPacks: false,
  showCommunityPuzzles: false,
  subredditPacks: {} as { [key: string]: SubredditPack },
  availableSubreddits: [] as string[],
  communityPuzzles: [] as CommunityPuzzle[],
  selectedCommunityPuzzle: null as CommunityPuzzle | null,
  selectedWordPack: null as SubredditPack | null,
  multiplayerState: null as MultiplayerGameState | null,
  connectedPlayers: [] as ConnectedPlayer[],
  currentBattle: null as SubredditBattle | null,
  spectatingBattle: null as SubredditBattle | null,
  liveActions: [] as LiveAction[],
  awardEffects: {
    pointMultiplier: 1,
    timeBonus: 0,
    comboMultiplier: 1,
    bonusWordsRevealed: false,
    teamBoostActive: false,
    powerUpBoostActive: false,
    karmaBoostActive: false
  } as AwardEffects,
  dailyStreak: 0,
  lastPlayedDate: null as string | null,
  dailyChallenge: null as Challenge | null,
  weeklyChallenge: null as Challenge | null,
  activeChallenges: [] as Challenge[],
  communityChallenge: null as CommunityChallenge | null,
  leaderboard: {
    daily: [] as LeaderboardEntry[],
    allTime: [] as LeaderboardEntry[],
    loading: false,
    error: null
  },
  currentCombo: 0,
  maxCombo: 0,
  gameStartTime: null as Date | null,
  finalScore: null as number | null,
  currentGameMode: null as GameMode | null,
  unlockedAchievements: [],
  challengeLeaderboard: [],
  currentChallenge: null,
  setCurrentWord: (word: string) => {
    initialState.currentWord = word;
    initialState.selectedIndices = [];
    initialState.selectedLetters = [];
  },
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'word_master',
    name: 'Word Master',
    description: 'Find 50 words in a single game',
    type: 'words',
    requirement: 50,
    karmaReward: 100,
    icon: '📚'
  },
  {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Score over 1000 points in a single game',
    type: 'score',
    requirement: 1000,
    karmaReward: 200,
    icon: '🏆'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day play streak',
    type: 'streak',
    requirement: 7,
    karmaReward: 300,
    icon: '🔥'
  },
  {
    id: 'karma_lord',
    name: 'Karma Lord',
    description: 'Accumulate 5000 karma points',
    type: 'karma',
    requirement: 5000,
    karmaReward: 1000,
    icon: '⭐'
  }
];

const MILESTONES: Milestone[] = [
  { 
    type: 'score',
    threshold: 1000,
    reward: { karma: 100 },
    description: 'Score 1000 points in a single game'
  },
  { 
    type: 'words',
    threshold: 50,
    reward: { karma: 200 },
    description: 'Find 50 words in a single game'
  },
  { 
    type: 'streak',
    threshold: 7,
    reward: { karma: 500 },
    description: 'Maintain a 7-day play streak'
  }
];

const playCelebrationSound = async (type: 'achievement' | 'milestone' | 'battle' | 'streak') => {
  try {
    const soundMap = {
      achievement: 'celebration',
      milestone: 'levelUp',
      battle: 'powerup',
      streak: 'success'
    };

    await animationService.playSound(soundMap[type]);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

const triggerCelebration = (type: 'achievement' | 'milestone' | 'battle' | 'streak', intensity: number = 1) => {
  // Play celebration sound
  playCelebrationSound(type);

  // Map celebration types to confetti parameters
  const confettiParams = {
    achievement: {
      particleCount: 100,
      spread: 70,
      colors: ['#FFD700', '#FFA500', '#FF6347']  // Gold, orange, tomato
    },
    milestone: {
      particleCount: 150,
      spread: 90,
      colors: ['#4CAF50', '#8BC34A', '#CDDC39']  // Green shades
    },
    battle: {
      particleCount: 120,
      spread: 80,
      colors: ['#FF4081', '#E040FB', '#7C4DFF']  // Pink and purple
    },
    streak: {
      particleCount: 80,
      spread: 60,
      colors: ['#2196F3', '#03A9F4', '#00BCD4']  // Blue shades
    }
  };

  // Trigger confetti animation with type-specific parameters
  animationService.triggerConfetti({
    ...confettiParams[type],
    particleCount: confettiParams[type].particleCount * intensity,
    origin: { x: 0.5, y: 0.6 }
  });
};

const playWordSound = (word: string, points: number) => {
  // Play different sounds based on word characteristics
  if (word.length >= 7) {
    // Long words get the celebration sound
    animationService.playCelebrationSound();
  } else if (points >= 15) {
    // High scoring words get the levelUp sound
    animationService.playLevelUpSound();
  } else if (word.length >= 5) {
    // Medium length words get the combo sound
    animationService.playComboSound();
  } else {
    // Regular words get the success sound
    animationService.playSuccessSound();
  }
};

const devtoolsOptions = {
  name: 'SnooWords Game Store',
  enabled: process.env.NODE_ENV === 'development'
};

const useGameStore = create<Store>()(
  devtools(
    (setState, getState) => ({
      ...initialState,
      availableSubreddits: [],
      subredditPacks: {},
      currentSubreddit: null,
      currentWord: '',
      
      fetchAvailableSubreddits: async () => {
        try {
          const { data, error } = await supabase
            .from('subreddits')
            .select('name');
          if (error) throw error;
          setState((state) => ({
            ...state,
            availableSubreddits: data.map((s) => s.name),
          }));
        } catch (error) {
          console.error('Error fetching subreddits:', error);
        }
      },

      fetchSubredditPacks: async (subreddit: string) => {
        try {
          const { data, error } = await supabase
            .from('word_packs')
            .select('*')
            .eq('subreddit', subreddit);
          if (error) throw error;
          setState((state) => ({
            ...state,
            subredditPacks: {
              ...state.subredditPacks,
              [subreddit]: convertToSubredditPack(data[0]),
            },
          }));
        } catch (error) {
          console.error('Error fetching word packs:', error);
        }
      },

      setCurrentWord: (word: string) => {
        setState((state) => ({
          ...state,
          currentWord: word,
          selectedIndices: [],
          selectedLetters: []
        }));
      },

      setPlayerName: (name: string) => {
        setState({ playerName: name });
      },
      addWord: (word: string) => {
        const { words, selectedWordPack, redditUser } = getState();
        const wordObj: Word = {
          word,
          points: gameService.calculateWordPoints(word),
          player: redditUser?.name || 'anonymous',
          themed: selectedWordPack?.theme ? selectedWordPack.words.includes(word) : false
        };
        setState({ words: [...words, wordObj] });
      },
      activatePowerUp: (powerUp: keyof IGameState['powerUps'], word?: string) =>
        setState((state) => {
          const wordObj = word ? {
            word,
            points: gameService.calculateWordPoints(word),
            player: state.redditUser?.name || 'anonymous',
            themed: state.selectedWordPack?.theme ? state.selectedWordPack.words.includes(word) : false
          } : undefined;

          return {
            ...state,
            powerUps: {
              ...state.powerUps,
              [powerUp]: {
                active: true,
                word: wordObj
              }
            }
          };
        }),
      deactivatePowerUp: (powerUp: keyof IGameState['powerUps']) => {
        setState((state) => ({
          powerUps: { ...state.powerUps, [powerUp]: { active: false, word: undefined } },
          activePowerUps: new Set([...state.activePowerUps].filter(p => p !== powerUp))
        }));
      },
      updateKarma: (amount: number) => {
        setState((state) => ({ karma: state.karma + amount }));
      },
      incrementKarma: (amount: number) => {
        const { karma } = getState();
        setState({ karma: karma + amount });
      },
      toggleAchievements: () => {
        setState((state) => ({ showAchievements: !state.showAchievements }));
      },
      startGame: () => {
        const letters = gameService.generateLetters();
        setState({
          letters,
          status: 'playing',
          timeLeft: 60,
          score: 0,
          words: [],
          currentWord: '',
          selectedIndices: [],
          selectedLetters: []
        });
        fetchDailyTheme();
        animationService.playStartSound();
      },
      addLetter: (letter: string, index: number) => {
        setState((state) => ({
          currentWord: state.currentWord + letter,
          selectedIndices: [...state.selectedIndices, index]
        }));
        animationService.playLetterSelectSound();
      },
      removeLetter: (index: number) => {
        setState((state) => ({
          currentWord: state.currentWord.slice(0, -1),
          selectedIndices: state.selectedIndices.slice(0, -1)
        }));
      },
      clearWord: () => {
        setState({
          currentWord: '',
          selectedIndices: []
        });
      },
      toggleRules: () => {
        setState((state) => ({ showRules: !state.showRules }));
      },
      toggleLeaderboard: () => {
        setState((state) => ({ showLeaderboard: !state.showLeaderboard }));
      },
      toggleChallenges: () => {
        setState((state) => ({ showChallenges: !state.showChallenges }));
      },
      togglePowerUps: () => {
        setState((state) => ({ showPowerUps: !state.showPowerUps }));
      },
      toggleBattles: () => {
        setState((state) => ({ showBattles: !state.showBattles }));
      },
      setRedditUser: (user: RedditUser | null) => {
        setState({ redditUser: user });
      },
      setIsAuthenticated: (isAuthenticated: boolean) => {
        setState({ isAuthenticated });
      },
      resetGameState: () => {
        setState({
          score: 0,
          streak: 0,
          words: [],
          letters: [],
          currentWord: '',
          selectedIndices: [],
          selectedLetters: [],
          status: 'idle',
          timeLeft: 60,
          currentCombo: 0,
          maxCombo: 0,
          gameStartTime: null,
          finalScore: null,
          currentGameMode: null,
          activePowerUps: new Set(),
          powerUps: {
            timeFreeze: { active: false },
            wordHint: { active: false },
            scoreBooster: { active: false },
            shieldProtection: { active: false }
          }
        });
      },
      checkMilestones: () => {
        const state = getState();
        
        MILESTONES.forEach(milestone => {
          if (state.unlockedAchievements.includes(milestone.type)) {
            return;
          }

          let requirementMet = false;
          
          switch (milestone.type) {
            case 'score':
              requirementMet = state.score >= milestone.threshold;
              break;
            case 'words':
              requirementMet = state.words.length >= milestone.threshold;
              break;
            case 'streak':
              requirementMet = state.dailyStreak >= milestone.threshold;
              break;
          }

          if (requirementMet) {
            setState({ 
              unlockedAchievements: [...state.unlockedAchievements, milestone.type],
              karma: state.karma + (milestone.reward.karma || 0)
            });

            toast.success(
              `🎉 Milestone Unlocked!\n${milestone.description}${milestone.reward.karma ? ` (+${milestone.reward.karma} karma)` : ''}`,
              { duration: 5000 }
            );

            triggerCelebration('milestone');
          }
        });
      },

      fetchLeaderboard: async () => {
        setState((state) => ({
          leaderboard: {
            ...state.leaderboard,
            loading: true,
            error: null
          }
        }));

        try {
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          
          const { data: dailyData, error: dailyError } = await supabase
            .from('leaderboard')
            .select('*')
            .gte('created_at', oneDayAgo.toISOString())
            .order('score', { ascending: false })
            .limit(10);

          if (dailyError) throw dailyError;

          const { data: allTimeData, error: allTimeError } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(10);

          if (allTimeError) throw allTimeError;

          setState((state) => ({
            leaderboard: {
              ...state.leaderboard,
              daily: dailyData || [],
              allTime: allTimeData || [],
              loading: false,
              error: null
            }
          }));
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
          setState((state) => ({
            leaderboard: {
              ...state.leaderboard,
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch leaderboard'
            }
          }));
        }
      },
      checkAchievements: () => {
        const state = getState();
        
        ACHIEVEMENTS.forEach(achievement => {
          if (state.unlockedAchievements.includes(achievement.id)) {
            return;
          }

          let requirementMet = false;
          
          switch (achievement.type) {
            case 'score':
              requirementMet = state.score >= achievement.requirement;
              break;
            case 'words':
              requirementMet = state.words.length >= achievement.requirement;
              break;
            case 'streak':
              requirementMet = state.dailyStreak >= achievement.requirement;
              break;
            case 'karma':
              requirementMet = state.karma >= achievement.requirement;
              break;
          }

          if (requirementMet) {
            setState({ 
              unlockedAchievements: [...state.unlockedAchievements, achievement.id],
              karma: state.karma + (achievement.karmaReward || 0)
            });

            toast.success(
              `🏆 Achievement Unlocked!\n${achievement.name}\n${achievement.description}${achievement.karmaReward ? ` (+${achievement.karmaReward} karma)` : ''}`,
              { duration: 5000 }
            );

            triggerCelebration('achievement');
          }
        });
      },
      pauseGame: () => {
        setState({ status: 'paused' });
      },
      endGame: () => {
        const { score } = getState();
        setState({ 
          status: 'ended',
          finalScore: score
        });
        animationService.playGameOverSound();
      },
      updateTime: (delta: number) => {
        setState((state) => ({ timeLeft: state.timeLeft + delta }));
      },
      tick: () => {
        const { timeLeft, status } = getState();
        if (status === 'playing' && timeLeft > 0) {
          setState((state) => ({ timeLeft: state.timeLeft - 1 }));
          if (timeLeft <= 1) {
            setState((state) => ({ status: 'ended' }));
            animationService.playGameOverSound();
          }
        }
      },
      setActiveGame: (game: MultiplayerGameState | null) => {
        setState({ multiplayerState: game });
      },
      setActiveBattle: (battle: SubredditBattle | null) => {
        setState({ currentBattle: battle });
      },
      setMultiplayerState: (state: MultiplayerGameState | null) => {
        setState({ multiplayerState: state });
      },
      updateConnectedPlayers: (players: ConnectedPlayer[]) => {
        setState({ connectedPlayers: players });
      },
      setCurrentBattle: (battle: SubredditBattle | null) => {
        setState({ currentBattle: battle });
      },
      setSpectatingBattle: (battle: SubredditBattle | null) => {
        setState({ spectatingBattle: battle });
      },
      addLiveAction: (action: LiveAction) => {
        setState((state) => ({
          liveActions: [...state.liveActions, action]
        }));
      },
      clearLiveActions: () => {
        setState({ liveActions: [] });
      },
      updateAwardEffects: (effects: Partial<AwardEffects>) => {
        setState((state) => ({
          awardEffects: { ...state.awardEffects, ...effects }
        }));
      },
      updateDailyStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        setState((state) => ({
          dailyStreak: state.lastPlayedDate === today ? state.dailyStreak : state.dailyStreak + 1,
          lastPlayedDate: today
        }));
      },
      setDailyChallenge: (challenge: Challenge | null) => {
        setState({ dailyChallenge: challenge });
      },
      setWeeklyChallenge: (challenge: Challenge | null) => {
        setState({ weeklyChallenge: challenge });
      },
      setActiveChallenges: (challenges: Challenge[]) => {
        setState({ activeChallenges: challenges });
      },
      setCommunityChallenge: (challenge: CommunityChallenge | null) => {
        setState({ communityChallenge: challenge });
      },
      incrementCombo: () => {
        setState((state) => ({
          currentCombo: state.currentCombo + 1,
          maxCombo: Math.max(state.maxCombo, state.currentCombo + 1)
        }));
      },
      resetCombo: () => {
        setState({ currentCombo: 0 });
      },
      setGameStartTime: (time: Date | null) => {
        setState({ gameStartTime: time });
      },
      setFinalScore: (score: number | null) => {
        setState({ finalScore: score });
      },
      setGameMode: (mode: GameMode | null) => {
        setState({ currentGameMode: mode });
      },
      startCommunityChallenge: () => {
        const { currentChallenge } = getState();
        if (currentChallenge) {
          const letters = gameService.generateLetters();
          setState({
            status: 'playing',
            score: 0,
            timeLeft: currentChallenge.timeLimit || 180,
            letters,
            words: [],
            currentWord: '',
            selectedIndices: [],
            selectedLetters: [],
            gameStartTime: new Date(),
            currentGameMode: {
              id: 'community_challenge',
              name: 'Community Challenge',
              description: currentChallenge.description,
              duration: currentChallenge.timeLimit || 180,
              icon: 'users',
              rules: {
                minWordLength: 3,
                maxWordLength: 15,
                allowedCategories: ['all'],
                bonusPoints: [
                  {
                    category: 'themed',
                    multiplier: 2
                  }
                ]
              }
            }
          });
          toast.success(`Challenge started! Find ${currentChallenge.theme}-related words!`);
        }
      },
      submitChallengeScore: async (score: number) => {
        try {
          const { data, error } = await supabase
            .from('community_challenge_scores')
            .insert([{ score, challenge_id: getState().currentChallenge?.id }]);
          
          if (error) throw error;
          toast.success('Score submitted successfully!');
        } catch (error) {
          console.error('Error submitting score:', error);
          toast.error('Failed to submit score');
        }
      },
      setCurrentChallenge: (challenge) => {
        setState({ currentChallenge: challenge });
      },
      updateLeaderboard: (entries: { daily: LeaderboardEntry[]; allTime: LeaderboardEntry[] }) => {
        setState({
          leaderboard: {
            ...getState().leaderboard,
            daily: entries.daily,
            allTime: entries.allTime,
            loading: false,
            error: null
          }
        });
      },
      selectLetter: (index: number) => {
        const { selectedLetters } = getState();
        if (!selectedLetters.includes(index)) {
          setState({ selectedLetters: [...selectedLetters, index] });
        }
      },
      clearSelection: () => {
        setState({ selectedLetters: [] });
      },
      submitWord: async () => {
        const { currentWord, words, score, selectedWordPack, redditUser } = getState();
        if (currentWord.length >= 3) {
          const isValid = await gameService.validateWord(currentWord);
          if (isValid) {
            const points = gameService.calculateWordPoints(currentWord);
            const wordObj: Word = {
              word: currentWord,
              points,
              player: redditUser?.name || 'anonymous',
              themed: selectedWordPack?.theme ? selectedWordPack.words.includes(currentWord) : false
            };
            setState({
              words: [...words, wordObj],
              score: score + points,
              currentWord: '',
              selectedLetters: []
            });
            
            playWordSound(currentWord, points);
            return true;
          }
        }
        return false;
      },
      applyGameEffect: (effect: AwardEffect) => {
        const { type, gameEffect, duration, multiplier } = effect;
        
        if (type !== 'game' || !gameEffect) return;
        
        switch (gameEffect) {
          case 'double_points_30s':
            setState((state) => ({
              ...state,
              awardEffects: {
                ...state.awardEffects,
                pointMultiplier: multiplier
              }
            }));
            setTimeout(() => {
              setState((state) => ({
                ...state,
                awardEffects: {
                  ...state.awardEffects,
                  pointMultiplier: 1
                }
              }));
            }, duration * 1000);
            break;
            
          case 'reveal_bonus_words':
            setState((state) => ({
              ...state,
              awardEffects: {
                ...state.awardEffects,
                bonusWordsRevealed: true
              }
            }));
            setTimeout(() => {
              setState((state) => ({
                ...state,
                awardEffects: {
                  ...state.awardEffects,
                  bonusWordsRevealed: false
                }
              }));
            }, duration * 1000);
            break;
            
          case 'extra_time_30s':
            setState((state) => ({
              ...state,
              timeLeft: state.timeLeft + 30
            }));
            break;
            
          case 'combo_multiplier_2x':
            setState((state) => ({
              ...state,
              awardEffects: {
                ...state.awardEffects,
                comboMultiplier: multiplier
              }
            }));
            setTimeout(() => {
              setState((state) => ({
                ...state,
                awardEffects: {
                  ...state.awardEffects,
                  comboMultiplier: 1
                }
              }));
            }, duration * 1000);
            break;
        }
      },
      applyBattleEffect: (effect: AwardEffect) => {
        const { type, battleEffect, duration } = effect;
        
        if (type !== 'battle' || !battleEffect) return;
        
        switch (battleEffect) {
          case 'team_boost':
            setState((state) => ({
              ...state,
              awardEffects: {
                ...state.awardEffects,
                teamBoostActive: true
              }
            }));
            setTimeout(() => {
              setState((state) => ({
                ...state,
                awardEffects: {
                  ...state.awardEffects,
                  teamBoostActive: false
                }
              }));
            }, duration * 1000);
            break;
            
          case 'power_up_boost':
            setState((state) => ({
              ...state,
              awardEffects: {
                ...state.awardEffects,
                powerUpBoostActive: true
              }
            }));
            setTimeout(() => {
              setState((state) => ({
                ...state,
                awardEffects: {
                  ...state.awardEffects,
                  powerUpBoostActive: false
                }
              }));
            }, duration * 1000);
            break;
            
          case 'karma_boost':
            setState((state) => ({
              ...state,
              awardEffects: {
                ...state.awardEffects,
                karmaBoostActive: true
              }
            }));
            setTimeout(() => {
              setState((state) => ({
                ...state,
                awardEffects: {
                  ...state.awardEffects,
                  karmaBoostActive: false
                }
              }));
            }, duration * 1000);
            break;
        }
      },
      toggleVoice: () => {
        setState((state) => ({ isVoiceEnabled: !state.isVoiceEnabled }));
      },
      setShowSubredditPacks: (show: boolean) => {
        setState({ showSubredditPacks: show });
      },
      setShowCommunityPuzzles: (show: boolean) => {
        setState({ showCommunityPuzzles: show });
      },
      setConnectedPlayers: (players: ConnectedPlayer[]) => {
        setState({ connectedPlayers: players });
      },
      updateMultiplayerState: (state: MultiplayerGameState) => {
        setState({ multiplayerState: state });
      },
      addOpponentWord: (word: string, player: string) => {
        const { words } = getState();
        setState({
          words: [...words, { word, points: word.length, player }]
        });
        playWordSound(word, word.length);
      },
      playWordFound: (word: string) => {
        playWordSound(word, word.length);
      },
      resetGame: () => {
        setState({
          ...initialState,
          playerName: getState().playerName,
          redditUser: getState().redditUser,
          isAuthenticated: getState().isAuthenticated
        });
      },
      toggleSubredditPacks: () => {
        setState((state) => ({ 
          ...state,
          showSubredditPacks: !state.showSubredditPacks 
        }));
      },
      toggleCommunityPuzzles: () => {
        setState((state) => ({ 
          ...state,
          showCommunityPuzzles: !state.showCommunityPuzzles 
        }));
      },
      setSelectedCommunityPuzzle: (puzzle: CommunityPuzzle | null) => {
        setState((state) => ({
          ...state,
          selectedCommunityPuzzle: puzzle
        }));
      },
      setSelectedWordPack: (pack: SubredditPack | null) => {
        setState((state) => ({
          ...state,
          selectedWordPack: pack
        }));
      }
    }),
    devtoolsOptions
  )
);

async function fetchDailyTheme() {
  try {
    const theme = await gameService.getDailyChallenge();
    useGameStore.setState({ dailyTheme: theme });
  } catch (error) {
    console.error('Failed to fetch daily theme:', error);
  }
}

export { useGameStore };