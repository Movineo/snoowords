import React from 'react';
import { Award, Lock, X } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-gray-800/90 backdrop-blur-lg rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Award className="w-6 h-6 text-yellow-400" />
        Achievements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg ${
              achievement.unlockedAt
                ? 'bg-purple-600/20'
                : 'bg-white/5 opacity-75'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {achievement.unlockedAt ? (
                <Award className="w-6 h-6 text-yellow-400" />
              ) : (
                <Lock className="w-6 h-6 text-purple-400" />
              )}
              <h3 className="font-bold">{achievement.title}</h3>
            </div>
            <p className="text-sm text-purple-200">{achievement.description}</p>
            {achievement.unlockedAt && (
              <p className="text-xs text-purple-300 mt-2">
                Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);