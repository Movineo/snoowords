import React from 'react';
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

  if (!isOpen) return null;

  const rarityOrder: Record<AchievementRarity, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    common: 3
  };

  const sortedAchievements = [...achievements].sort((a, b) => {
    // Sort by unlock status first
    if (!!a.unlockedAt !== !!b.unlockedAt) {
      return a.unlockedAt ? -1 : 1;
    }
    // Then by rarity
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Achievements</h2>
              <p className="text-gray-600">Total Points: {points}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto">
          {sortedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg ${
                achievement.unlockedAt
                  ? 'bg-white border-2 border-purple-200'
                  : 'bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 font-semibold">
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
                    <p className="text-sm text-gray-500 mt-2">
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
