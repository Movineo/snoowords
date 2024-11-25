import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, Award, Zap, Crown } from 'lucide-react';

interface Props {
  score: number;
  streak: number;
  longestStreak: number;
  karma: number;
  awards: number;
}

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }),
  exit: { opacity: 0, y: -20 }
};

const pulseAnimation = {
  scale: [1, 1.1, 1],
  transition: {
    duration: 0.3
  }
};

export const GameStats: React.FC<Props> = ({
  score,
  streak,
  longestStreak,
  karma,
  awards
}) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 shadow-xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Crown className="w-6 h-6 text-yellow-500" />
        Game Stats
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {[
            {
              label: 'Score',
              value: score,
              icon: Star,
              color: 'text-yellow-500',
              bgColor: 'bg-yellow-500/10'
            },
            {
              label: 'Current Streak',
              value: streak,
              icon: Zap,
              color: 'text-blue-500',
              bgColor: 'bg-blue-500/10'
            },
            {
              label: 'Best Streak',
              value: longestStreak,
              icon: Crown,
              color: 'text-purple-500',
              bgColor: 'bg-purple-500/10'
            },
            {
              label: 'Total Karma',
              value: karma,
              icon: TrendingUp,
              color: 'text-green-500',
              bgColor: 'bg-green-500/10'
            },
            {
              label: 'Awards',
              value: awards,
              icon: Award,
              color: 'text-orange-500',
              bgColor: 'bg-orange-500/10'
            }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={statVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover="hover"
              className={`${stat.bgColor} rounded-lg p-4 relative overflow-hidden`}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm font-medium text-gray-300">
                  {stat.label}
                </span>
              </div>
              <motion.div
                key={stat.value}
                animate={stat.value > 0 ? pulseAnimation : {}}
                className="text-2xl font-bold"
              >
                {stat.value}
              </motion.div>
              {stat.value > 0 && (
                <motion.div
                  className="absolute -right-2 -top-2 w-12 h-12 opacity-10"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className={`w-full h-full ${stat.color}`} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
