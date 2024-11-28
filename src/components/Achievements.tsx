import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Clock, Award, Star, Trophy, Gift, X } from 'lucide-react';
import { gameService } from '../services/gameService';

interface Achievement {
  name: string;
  description: string;
  karmaReward: number;
  icon: React.ReactNode;
  progress?: number;
}

export const Achievements: React.FC = () => {
  const { redditUser } = useGameStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const achievementsList: Achievement[] = [
    {
      name: 'Time Award',
      description: 'Complete a game in under 120 seconds',
      karmaReward: 50000,
      icon: <Clock className="w-6 h-6 text-blue-400" />
    },
    {
      name: 'Double Karma',
      description: 'Score over 200 points in a single game',
      karmaReward: 100000,
      icon: <Award className="w-6 h-6 text-yellow-400" />
    },
    {
      name: 'Karma Boost',
      description: 'Find 10 themed words in a single game',
      karmaReward: 75000,
      icon: <Star className="w-6 h-6 text-purple-400" />
    },
    {
      name: 'Awards Multiplier',
      description: 'Win 3 daily challenges',
      karmaReward: 150000,
      icon: <Trophy className="w-6 h-6 text-green-400" />
    },
    {
      name: 'Reddit Gold',
      description: 'Complete all other achievements',
      karmaReward: 500000,
      icon: <Gift className="w-6 h-6 text-orange-400" />
    }
  ];

  useEffect(() => {
    const loadAchievements = async () => {
      if (redditUser) {
        setLoading(true);
        try {
          const unlockedAchievements = await gameService.checkAchievements(redditUser.name);
          const updatedAchievements = achievementsList.map(achievement => {
            const unlocked = unlockedAchievements.find(
              a => a.name.toLowerCase() === achievement.name.toLowerCase()
            );
            return {
              ...achievement,
              progress: unlocked ? 100 : 0
            };
          });
          setAchievements(updatedAchievements);
        } catch (error) {
          console.error('Error loading achievements:', error);
        }
        setLoading(false);
      }
    };

    loadAchievements();
  }, [redditUser]);

  if (!redditUser) return null;
  if (loading) return <div className="text-center">Loading achievements...</div>;

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-400" />
          Achievements
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-purple-300 hover:text-purple-200"
        >
          View All
        </button>
      </div>

      {/* Grid view of achievements */}
      <div className="grid gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.name}
            className={`flex items-center justify-between p-4 rounded-lg ${
              achievement.progress === 100
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-gray-700/30'
            }`}
          >
            <div className="flex items-center gap-4">
              {achievement.icon}
              <div>
                <h3 className="font-semibold">{achievement.name}</h3>
                <p className="text-sm text-gray-300">{achievement.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                {achievement.karmaReward.toLocaleString()} karma
              </div>
              {achievement.progress === 100 ? (
                <span className="text-xs text-green-400">Completed!</span>
              ) : (
                <span className="text-xs text-gray-400">In Progress</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for detailed view */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              All Achievements
            </h2>
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    achievement.progress === 100
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-white/5 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {achievement.icon}
                    <div>
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-purple-200">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {achievement.karmaReward.toLocaleString()} karma
                    </div>
                    {achievement.progress === 100 ? (
                      <span className="text-xs text-green-400">Completed!</span>
                    ) : (
                      <span className="text-xs text-gray-400">In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};