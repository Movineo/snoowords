import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { gameService } from '../services/gameService';
import { toast } from 'react-hot-toast';

export const DailyTheme = () => {
  const { karma, dailyTheme } = useGameStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true);
        await gameService.getDailyChallenge();
      } catch (error) {
        console.error('Failed to load daily theme:', error);
        toast.error('Failed to load daily theme');
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Daily Theme Challenge</h2>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200 font-semibold">{karma} karma</span>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          </div>
        ) : dailyTheme ? (
          <>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-purple-200 mb-2">Theme: {dailyTheme.theme}</h3>
              <p className="text-gray-200">{dailyTheme.description}</p>
            </div>

            <div className="flex items-center gap-2 text-gray-200 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-300" />
              <span className="font-medium">Target Score: {dailyTheme.targetScore}</span>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-purple-200">Bonus Words (2x points):</h4>
              <div className="flex flex-wrap gap-2">
                {dailyTheme.bonus_words && dailyTheme.bonus_words.length > 0 ? (
                  dailyTheme.bonus_words.map((word: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-800 px-4 py-1.5 rounded-full text-sm font-medium text-purple-200 border border-purple-500/30"
                    >
                      {word}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No bonus words available</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-300">
            No active theme available
          </div>
        )}
      </div>
    </div>
  );
};