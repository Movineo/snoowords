import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../config/supabase';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface UnlockedAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity: AchievementRarity;
  unlockedAt?: Date;
}

interface AchievementState {
  achievements: Achievement[];
  points: number;
  unlockAchievement: (id: string) => Promise<void>;
  getAchievements: () => Promise<Achievement[]>;
  getPoints: () => number;
  startVoiceGame: () => Promise<void>;
  onSubredditVisited: (subreddit: string) => Promise<void>;
  onWordGuessed: (word: string, isCorrect: boolean) => Promise<void>;
  onPuzzleCompleted: (difficulty: string) => Promise<void>;
  onWordPackCreated: () => Promise<void>;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_voice_game',
    title: 'Voice Commander',
    description: 'Start your first game using voice commands',
    icon: '🎤',
    points: 10,
    rarity: 'common'
  },
  {
    id: 'subreddit_explorer',
    title: 'Subreddit Explorer',
    description: 'Visit 5 different subreddits',
    icon: '🌍',
    points: 20,
    rarity: 'rare'
  },
  {
    id: 'word_master',
    title: 'Word Master',
    description: 'Correctly guess 50 words',
    icon: '📚',
    points: 30,
    rarity: 'epic'
  },
  {
    id: 'puzzle_creator',
    title: 'Puzzle Architect',
    description: 'Create your first word pack',
    icon: '🏗️',
    points: 15,
    rarity: 'common'
  },
  {
    id: 'legendary_solver',
    title: 'Legendary Solver',
    description: 'Complete a legendary difficulty puzzle',
    icon: '👑',
    points: 50,
    rarity: 'legendary'
  },
  {
    id: 'community_contributor',
    title: 'Community Star',
    description: 'Create 3 word packs that get upvoted',
    icon: '⭐',
    points: 40,
    rarity: 'epic'
  }
];

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: ACHIEVEMENTS,
      points: 0,

      unlockAchievement: async (id: string) => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) return;

        const { achievements, points } = get();
        const achievement = achievements.find(a => a.id === id);
        
        if (achievement && !achievement.unlockedAt) {
          await supabase.rpc('unlock_achievement', {
            user_id: user.user.id,
            achievement_id: id
          });

          const updatedAchievements = achievements.map(a =>
            a.id === id ? { ...a, unlockedAt: new Date() } : a
          );
          
          set({
            achievements: updatedAchievements,
            points: points + (achievement.points || 0)
          });

          const event = new CustomEvent('achievement-unlocked', {
            detail: { achievement: { ...achievement, unlockedAt: new Date() } }
          });
          window.dispatchEvent(event);
        }
      },

      getAchievements: async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) return ACHIEVEMENTS;

        const { data } = await supabase.rpc('get_user_achievements', {
          user_id: user.user.id
        }) as { data: UnlockedAchievement[] | null };

        const unlockedAchievements = data || [];

        return ACHIEVEMENTS.map(achievement => ({
          ...achievement,
          unlockedAt: unlockedAchievements.find((ua: UnlockedAchievement) => ua.achievement_id === achievement.id)?.unlocked_at ? 
            new Date(unlockedAchievements.find((ua: UnlockedAchievement) => ua.achievement_id === achievement.id)!.unlocked_at) : 
            undefined
        }));
      },

      getPoints: () => get().points,

      startVoiceGame: async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) return;

        await supabase.rpc('track_voice_game_start', {
          user_id: user.user.id
        });

        await get().unlockAchievement('first_voice_game');
      },

      onSubredditVisited: async (subreddit: string) => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) return;

        await supabase.rpc('track_subreddit_visit', {
          user_id: user.user.id,
          subreddit
        });

        const { data: stats } = await supabase
          .from('user_stats')
          .select('visited_subreddits')
          .eq('user_id', user.user.id)
          .single();

        if (stats?.visited_subreddits?.length >= 5) {
          await get().unlockAchievement('subreddit_explorer');
        }
      },

      onWordGuessed: async (_word: string, isCorrect: boolean) => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) return;

        await supabase.rpc('track_word_guess', {
          user_id: user.user.id,
          is_correct: isCorrect
        });

        if (isCorrect) {
          const { data: stats } = await supabase
            .from('user_stats')
            .select('correct_guesses')
            .eq('user_id', user.user.id)
            .single();

          if (stats?.correct_guesses >= 50) {
            await get().unlockAchievement('word_master');
          }
        }
      },

      onPuzzleCompleted: async (difficulty: string) => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) return;

        if (difficulty.toLowerCase() === 'legendary') {
          await supabase.rpc('track_legendary_puzzle_completion', {
            user_id: user.user.id
          });
          await get().unlockAchievement('legendary_solver');
        }
      },

      onWordPackCreated: async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) return;

        await supabase.rpc('track_word_pack_creation', {
          user_id: user.user.id
        });

        const { data: stats } = await supabase
          .from('user_stats')
          .select('created_packs')
          .eq('user_id', user.user.id)
          .single();

        if (stats?.created_packs === 1) {
          await get().unlockAchievement('puzzle_creator');
        }

        if (stats?.created_packs >= 3) {
          await get().unlockAchievement('community_contributor');
        }
      }
    }),
    {
      name: 'snoowords-achievements'
    }
  )
);

// Singleton service for easier imports
export const achievementService = {
  startVoiceGame: () => useAchievementStore.getState().startVoiceGame(),
  onSubredditVisited: (subreddit: string) => useAchievementStore.getState().onSubredditVisited(subreddit),
  onWordGuessed: (word: string, isCorrect: boolean) => useAchievementStore.getState().onWordGuessed(word, isCorrect),
  onPuzzleCompleted: (difficulty: string) => useAchievementStore.getState().onPuzzleCompleted(difficulty),
  onWordPackCreated: () => useAchievementStore.getState().onWordPackCreated(),
  getAchievements: () => useAchievementStore.getState().getAchievements(),
  getPoints: () => useAchievementStore.getState().getPoints()
};
