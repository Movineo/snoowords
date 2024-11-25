import React from 'react';
import { motion } from 'framer-motion';

interface AchievementToastProps {
  name: string;
}

const AchievementToast = ({ name }: AchievementToastProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="bg-gray-900 text-white p-4 rounded-lg shadow-xl flex items-center gap-3"
  >
    <div className="text-2xl">🏆</div>
    <div>
      <p className="font-medium">Achievement Unlocked!</p>
      <p className="text-sm text-gray-400">{name}</p>
    </div>
  </motion.div>
);

export default AchievementToast;
