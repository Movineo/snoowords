import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { REDDIT_AWARDS, AwardType, Award, GameAward, BattleAward } from '../config/reddit';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Star, Trophy, Zap, Clock, Crown } from 'lucide-react';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

type RarityColors = {
  [K in Rarity]: string;
};

type AnimationTransition = {
  duration: number;
  repeat: number;
};

type RarityAnimation = {
  scale?: number[];
  rotate?: number[];
  filter?: string[];
  transition?: AnimationTransition;
};

type RarityAnimations = {
  [K in Rarity]: RarityAnimation;
};

const RARITY_COLORS: RarityColors = {
  common: 'bg-gray-200 text-gray-700',
  rare: 'bg-blue-200 text-blue-700',
  epic: 'bg-purple-200 text-purple-700',
  legendary: 'bg-yellow-200 text-yellow-700'
};

const RARITY_ANIMATIONS: RarityAnimations = {
  common: {},
  rare: { scale: [1, 1.1, 1], transition: { duration: 2, repeat: Infinity } },
  epic: { 
    scale: [1, 1.2, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 3, repeat: Infinity }
  },
  legendary: {
    scale: [1, 1.3, 1],
    rotate: [0, 10, -10, 0],
    filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
    transition: { duration: 4, repeat: Infinity }
  }
};

export const RedditAwards: React.FC = () => {
  const { 
    redditUser, 
    karma, 
    updateKarma, 
    currentBattle, 
    applyGameEffect, 
    applyBattleEffect 
  } = useGameStore();
  const [selectedType, setSelectedType] = useState<'reddit' | 'game' | 'battle'>('reddit');
  const [previewAward, setPreviewAward] = useState<AwardType | null>(null);
  const [history, setHistory] = useState<{ award: AwardType, timestamp: Date }[]>([]);

  const isGameAward = (award: Award): award is GameAward => {
    return award.type === 'game';
  };

  const isBattleAward = (award: Award): award is BattleAward => {
    return award.type === 'battle';
  };

  const handleAward = async (awardKey: AwardType) => {
    const award = REDDIT_AWARDS[awardKey];
    
    if (!redditUser?.isAuthenticated) {
      toast.error('Login with Reddit to give awards!');
      return;
    }

    if (karma < award.cost) {
      toast.error(`Not enough karma! Need ${award.cost} karma.`);
      return;
    }

    if (isBattleAward(award) && !currentBattle) {
      toast.error('Battle awards can only be used during battles!');
      return;
    }

    try {
      // Deduct karma
      updateKarma(-award.cost);

      // Apply award effects
      if (isGameAward(award)) {
        applyGameEffect(award.gameEffect);
      }

      if (isBattleAward(award) && currentBattle) {
        applyBattleEffect(award.battleEffect);
      }

      // Add to history
      setHistory(prev => [...prev, { award: awardKey, timestamp: new Date() }]);

      // Trigger award animation
      triggerAwardAnimation(award);

      toast.success(`${award.name} awarded! -${award.cost} karma`);
    } catch (error) {
      console.error('Error applying award:', error);
      toast.error('Failed to apply award');
      updateKarma(award.cost); // Refund karma on failure
    }
  };

  const getAwardIcon = (type: string) => {
    switch (type) {
      case 'reddit':
        return <Trophy className="w-4 h-4" />;
      case 'game':
        return <Star className="w-4 h-4" />;
      case 'battle':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const triggerAwardAnimation = (award: Award) => {
    // Play award sound
    const audio = new Audio('/sounds/award.mp3');
    audio.play().catch(console.error);

    // Show confetti with award-specific colors
    const colors = {
      reddit: ['#FF4500', '#FF6D00', '#FF8F00'],
      game: ['#4CAF50', '#45A049', '#388E3C'],
      battle: ['#9C27B0', '#8E24AA', '#7B1FA2']
    }[award.type];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      shapes: ['circle', 'square'],
      ticks: 200
    });
  };

  const renderEffects = (award: Award) => {
    if (!isGameAward(award) && !isBattleAward(award)) {
      return null;
    }

    return (
      <>
        <div className="font-semibold mb-1">Effects:</div>
        <ul className="list-disc list-inside">
          {isGameAward(award) && (
            <li>Game: {award.gameEffect.description}</li>
          )}
          {isBattleAward(award) && (
            <li>Battle: {award.battleEffect.description}</li>
          )}
        </ul>
      </>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reddit Awards</h2>
        <div className="text-sm text-gray-600">
          {karma} karma available
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['reddit', 'game', 'battle'].map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType(type as 'reddit' | 'game' | 'battle')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              selectedType === type
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {getAwardIcon(type)}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {Object.entries(REDDIT_AWARDS)
            .filter(([_, award]) => award.type === selectedType)
            .map(([key, award]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
                onMouseEnter={() => setPreviewAward(key as AwardType)}
                onMouseLeave={() => setPreviewAward(null)}
              >
                <motion.div
                  animate={RARITY_ANIMATIONS[award.rarity]}
                  className={`p-4 rounded-lg cursor-pointer ${RARITY_COLORS[award.rarity]}`}
                  onClick={() => handleAward(key as AwardType)}
                >
                  <div className="text-2xl mb-2">{award.icon}</div>
                  <div className="font-semibold">{award.name}</div>
                  <div className="text-sm opacity-75 mb-2">{award.description}</div>
                  {renderEffects(award)}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{award.cost} karma</span>
                    <span className="text-xs uppercase tracking-wider opacity-75">
                      {award.rarity}
                    </span>
                  </div>
                </motion.div>

                {previewAward === key && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 p-3 bg-black text-white text-sm rounded-lg z-10"
                  >
                    {renderEffects(award)}
                  </motion.div>
                )}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {history.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Recent Awards</h3>
          <div className="space-y-2">
            {history.slice(-3).reverse().map((entry, i) => {
              const award = REDDIT_AWARDS[entry.award];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span>{award.icon}</span>
                  <span className="font-medium">{award.name}</span>
                  <span className="text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
