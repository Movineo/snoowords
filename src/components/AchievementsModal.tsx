import React, { useCallback, useEffect } from 'react';
import { useAchievementStore, AchievementRarity } from '../services/achievementService';
import { X, Trophy } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { achievements, points } = useAchievementStore();

  // Handle ESC key press
  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Add and remove event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscKey]);

  if (!isOpen) return null;

  const rarityOrder: Record<AchievementRarity, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    common: 3
  };

  const sortedAchievements = [...achievements].sort((a, b) => {
    if (!!a.unlockedAt !== !!b.unlockedAt) {
      return a.unlockedAt ? -1 : 1;
    }
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <div className="flex items-center gap-2 sm:gap-3">
            <Trophy className="text-yellow-500 w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Achievements</h2>
              <p className="text-sm sm:text-base text-gray-600">Total Points: {points}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close achievements"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {sortedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 sm:p-4 rounded-lg transition-all ${
                achievement.unlockedAt
                  ? 'bg-white border-2 border-purple-200 hover:border-purple-300'
                  : 'bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-2xl sm:text-4xl flex-shrink-0">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{achievement.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-yellow-500 font-semibold text-sm sm:text-base">
                        +{achievement.points}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          achievement.rarity === 'legendary'
                            ? 'bg-purple-100 text-purple-800'
                            : achievement.rarity === 'epic'
                            ? 'bg-yellow-100 text-yellow-800'
                            : achievement.rarity === 'rare'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                  {achievement.unlockedAt && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
