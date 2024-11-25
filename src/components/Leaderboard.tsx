import React, { useEffect, useState } from 'react';
import { Trophy, Award, Star, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { gameService, LeaderboardStats } from '../services/gameService';
import { supabase } from '../config/supabase';

export const Leaderboard: React.FC = () => {
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'allTime'>('daily');

  useEffect(() => {
    const loadLeaderboards = async () => {
      try {
        const data = await gameService.getLeaderboards();
        setStats(data);
      } catch (error) {
        console.error('Failed to load leaderboards:', error);
      }
    };

    loadLeaderboards();
    // Set up real-time subscription
    const subscription = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'game_sessions' 
      }, loadLeaderboards)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!stats) return <div>Loading leaderboards...</div>;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Leaderboard
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              activeTab === 'daily'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            Daily
          </button>
          <button
            onClick={() => setActiveTab('allTime')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              activeTab === 'allTime'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            All Time
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {activeTab === 'daily'
          ? stats.dailyLeaders.map((entry, index) => (
              <div
                key={entry.reddit_username}
                className="flex items-center justify-between bg-white/5 p-3 rounded hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-purple-300">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-semibold">u/{entry.reddit_username}</div>
                    <div className="text-sm text-purple-300">
                      {formatDistanceToNow(new Date(entry.created_at))} ago
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold">{entry.score}</span>
                  </div>
                </div>
              </div>
            ))
          : stats.allTimeLeaders.map((entry, index) => (
              <div
                key={entry.reddit_username}
                className="flex items-center justify-between bg-white/5 p-3 rounded hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-purple-300">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-semibold">u/{entry.reddit_username}</div>
                    <div className="text-sm text-purple-300">
                      {entry.games_played} games played
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold">{entry.total_score}</div>
                    <div className="text-sm text-purple-300">
                      Best: {entry.best_score}
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};