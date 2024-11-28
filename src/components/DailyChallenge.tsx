import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, Trophy, Calendar } from 'lucide-react';
import { gameService } from '../services/gameService';
import { useGameStore } from '../store/gameStore';
import { format, parseISO } from 'date-fns';

export const DailyChallenge: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dailyTheme = useGameStore(state => state.dailyTheme);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const theme = await gameService.getDailyChallenge();
      if (theme) {
        useGameStore.setState({ dailyTheme: theme });
      }
    } catch (err) {
      setError('Failed to load daily challenge');
      console.error('Failed to load daily challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
    // Refresh every hour to check for new daily challenge
    const interval = setInterval(loadChallenge, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 mb-4 shadow-lg animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-gray-800 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-800 rounded w-4/5"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6 mb-4 shadow-lg">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!dailyTheme) return null;

  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'MMM d');
    } catch (error) {
      console.error('Invalid date format:', date);
      return '';
    }
  };

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 mb-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-white">Daily Theme Challenge</h2>
        </div>
        {dailyTheme.reward_karma && (
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200 font-medium">{dailyTheme.reward_karma} karma</span>
          </div>
        )}
      </div>
      
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-purple-200 mb-2">
          Today's Theme: {dailyTheme.theme}
        </h3>
        <p className="text-gray-200">{dailyTheme.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-200">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span>Target Score: {dailyTheme.targetScore}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-right">
          {dailyTheme.participants !== undefined && (
            <div className="flex items-center gap-2 justify-end text-gray-200">
              <span>{dailyTheme.participants} players</span>
            </div>
          )}
          <div className="flex items-center gap-2 justify-end text-gray-200">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>
              {formatDate(dailyTheme.startDate)} -{' '}
              {formatDate(dailyTheme.endDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
