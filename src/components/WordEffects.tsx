import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Trophy } from 'lucide-react';

interface Props {
  word: string;
  points: number;
  isNew?: boolean;
}

const rarityConfig = {
  common: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    icon: Star,
    particleCount: 3
  },
  rare: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    icon: Zap,
    particleCount: 5
  },
  epic: {
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    icon: Trophy,
    particleCount: 8
  }
};

const getRarity = (points: number) => {
  if (points >= 50) return 'epic';
  if (points >= 20) return 'rare';
  return 'common';
};

const Particle = ({ delay, x, y, icon: Icon, color }: any) => (
  <motion.div
    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: 0,
      scale: 1.5,
      x: x * 40,
      y: y * 40
    }}
    transition={{
      duration: 0.8,
      delay,
      ease: "easeOut"
    }}
    className={`absolute ${color}`}
  >
    <Icon className="w-4 h-4" />
  </motion.div>
);

export const WordEffects: React.FC<Props> = ({ word, points, isNew = false }) => {
  const rarity = getRarity(points);
  const config = rarityConfig[rarity];

  return (
    <motion.div
      layout
      initial={isNew ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative ${config.bgColor} rounded-lg p-3 flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        <config.icon className={`w-5 h-5 ${config.color}`} />
        <div>
          <motion.p
            initial={isNew ? { y: 10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            className="font-medium"
          >
            {word}
          </motion.p>
          <motion.p
            initial={isNew ? { y: 5, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`text-sm ${config.color}`}
          >
            +{points} karma
          </motion.p>
        </div>
      </div>

      <AnimatePresence>
        {isNew && (
          <>
            {Array.from({ length: config.particleCount }).map((_, i) => (
              <Particle
                key={i}
                delay={i * 0.1}
                x={Math.cos((i / config.particleCount) * Math.PI * 2)}
                y={Math.sin((i / config.particleCount) * Math.PI * 2)}
                icon={config.icon}
                color={config.color}
              />
            ))}
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`absolute inset-0 ${config.bgColor} rounded-lg`}
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
