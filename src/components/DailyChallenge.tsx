import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, Trophy, Calendar } from 'lucide-react';
import { gameService } from '../services/gameService';
import { Challenge } from '../types';
import { format } from 'date-fns';

export const DailyChallenge: React.FC = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const data = await gameService.getDailyChallenge();
        setChallenge(data);
      } catch (error) {
        console.error('Failed to load daily challenge:', error);
      }
    };

    loadChallenge();
  }, []);

  if (!challenge) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-bold">Daily Challenge</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>{challenge.targetScore} points to win!</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-lg font-semibold mb-1">{challenge.title}</div>
        <p className="text-purple-200">{challenge.description}</p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 px-3 py-1 rounded-full">
            Theme: {challenge.theme}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(challenge.start_date), 'MMM d')} -{' '}
              {format(new Date(challenge.end_date), 'MMM d')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span>{challenge.participants} players</span>
        </div>
      </div>
    </div>
  );
};
