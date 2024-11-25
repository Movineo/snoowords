import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Trophy, Crown, Gift, TrendingUp, Users, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/gameStore';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: keyof typeof achievementIcons;
    unlocked: boolean;
    progress: number;
    karmaReward: number;
}

const achievementIcons = {
    karma: TrendingUp,
    social: Users,
    awards: Award,
    posts: MessageSquare,
    silver: Award,
    gold: Star,
    platinum: Trophy,
    ternion: Crown,
};

const achievementColors = {
    karma: 'text-green-400 bg-green-500/10',
    social: 'text-blue-400 bg-blue-500/10',
    awards: 'text-purple-400 bg-purple-500/10',
    posts: 'text-orange-400 bg-orange-500/10',
    silver: 'text-gray-400 bg-gray-500/10',
    gold: 'text-yellow-400 bg-yellow-500/10',
    platinum: 'text-blue-400 bg-blue-500/10',
    ternion: 'text-purple-400 bg-purple-500/10',
};

const REDDIT_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_post',
        name: 'First Post',
        description: 'Share your first score on Reddit',
        icon: 'posts',
        unlocked: false,
        progress: 0,
        karmaReward: 100
    },
    {
        id: 'karma_collector',
        name: 'Karma Collector',
        description: 'Earn 1000 karma points',
        icon: 'karma',
        unlocked: false,
        progress: 0,
        karmaReward: 250
    },
    {
        id: 'award_giver',
        name: 'Award Giver',
        description: 'Give 5 awards to other players',
        icon: 'awards',
        unlocked: false,
        progress: 0,
        karmaReward: 500
    },
    {
        id: 'community_leader',
        name: 'Community Leader',
        description: 'Complete 10 daily challenges',
        icon: 'social',
        unlocked: false,
        progress: 0,
        karmaReward: 1000
    }
];

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
    exit: {
        scale: 0.8,
        opacity: 0,
    },
};

const progressVariants = {
    hidden: { width: 0 },
    visible: (progress: number) => ({
        width: `${progress}%`,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
        },
    }),
};

export const RedditAchievements: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
    isOpen,
    onClose,
}) => {
    const { redditUser, updateKarma } = useStore();

    const handleAchievementClick = (achievement: Achievement) => {
        if (achievement.unlocked) {
            toast.success(`${achievement.name} - ${achievement.karmaReward} karma earned!`);
            updateKarma(achievement.karmaReward);
        }
    };

    if (!redditUser.isAuthenticated) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Reddit Achievements</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {REDDIT_ACHIEVEMENTS.map((achievement) => {
                                const Icon = achievementIcons[achievement.icon];
                                return (
                                    <motion.div
                                        key={achievement.id}
                                        className={`
                                            relative p-4 rounded-lg cursor-pointer
                                            ${achievementColors[achievement.icon]}
                                            ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}
                                        `}
                                        onClick={() => handleAchievementClick(achievement)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-full bg-white/10">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">
                                                    {achievement.name}
                                                </h3>
                                                <p className="text-sm opacity-80">
                                                    {achievement.description}
                                                </p>
                                                <div className="mt-2">
                                                    <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-white/20"
                                                            variants={progressVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            custom={achievement.progress}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-1 text-xs">
                                                        <span>{achievement.progress}%</span>
                                                        <span>+{achievement.karmaReward} karma</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
