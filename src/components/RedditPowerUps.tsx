import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Shuffle, Star, Rocket, Gift, Crown } from 'lucide-react';
import { PowerUp, PowerUpId } from '../types';
import toast from 'react-hot-toast';

const POWER_UPS: PowerUp[] = [
  {
    id: 'timeBonus',
    name: 'Time Award',
    description: '+10 seconds',
    cost: 50,
    icon: 'Clock',
    duration: 10
  },
  {
    id: 'doublePoints',
    name: 'Double Karma',
    description: '2x points for next word',
    cost: 100,
    icon: 'Zap',
    multiplier: 2
  },
  {
    id: 'shuffle',
    name: 'Shuffle Award',
    description: 'New letter set',
    cost: 75,
    icon: 'Shuffle'
  },
  {
    id: 'karmaBoost',
    name: 'Karma Boost',
    description: '3x karma for 15s',
    cost: 200,
    icon: 'Rocket',
    duration: 15,
    multiplier: 3
  },
  {
    id: 'awardsMultiplier',
    name: 'Awards Multiplier',
    description: 'Double all awards',
    cost: 300,
    icon: 'Gift',
    multiplier: 2
  },
  {
    id: 'redditGold',
    name: 'Reddit Gold',
    description: 'All bonuses active',
    cost: 1000,
    icon: 'Crown',
    duration: 30
  }
];

interface Props {
  karma: number;
  onActivatePowerUp: (powerUpId: PowerUpId) => void;
  activePowerUps: Record<PowerUpId, boolean>;
}

const IconMap = {
  Clock,
  Zap,
  Shuffle,
  Star,
  Rocket,
  Gift,
  Crown
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export const RedditPowerUps: React.FC<Props> = ({
  karma,
  onActivatePowerUp,
  activePowerUps
}) => {
  const handleActivate = (powerUp: PowerUp) => {
    if (karma < powerUp.cost) {
      toast.error('Not enough karma!');
      return;
    }

    onActivatePowerUp(powerUp.id);
    toast.success(`🎉 ${powerUp.name} activated!`);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4"
    >
      <AnimatePresence>
        {POWER_UPS.map((powerUp) => {
          const Icon = IconMap[powerUp.icon as keyof typeof IconMap];
          const isActive = activePowerUps[powerUp.id];
          const canAfford = karma >= powerUp.cost;

          return (
            <motion.button
              key={powerUp.id}
              variants={item}
              whileHover={{ scale: canAfford ? 1.05 : 1 }}
              whileTap={{ scale: canAfford ? 0.95 : 1 }}
              className={`relative flex flex-col items-center justify-center p-4 rounded-lg ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : canAfford
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-gray-800/50 opacity-50 cursor-not-allowed'
              } transition-colors duration-200`}
              onClick={() => handleActivate(powerUp)}
              disabled={isActive || !canAfford}
            >
              <Icon className={`w-8 h-8 mb-2 ${isActive ? 'text-white' : 'text-purple-500'}`} />
              <h3 className="font-bold text-sm">{powerUp.name}</h3>
              <p className="text-xs opacity-75">{powerUp.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <Star className="w-3 h-3" />
                {powerUp.cost}
              </div>
              {isActive && powerUp.duration && (
                <motion.div
                  className="absolute inset-0 bg-purple-500/20 rounded-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
              {isActive && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
