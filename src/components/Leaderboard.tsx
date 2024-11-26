import React, { useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { LeaderboardEntry } from '../types/game';

export const Leaderboard: React.FC = () => {
  const { score, redditUser, leaderboard, fetchLeaderboard } = useStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Add current player's score if it would make it to the top 10
  const getEnhancedLeaderboard = (entries: LeaderboardEntry[]) => {
    const allEntries = [...entries];
    if (score > 0 && !entries.some(entry => 
      entry.player_name === (redditUser.name || 'Anonymous') && entry.score === score
    )) {
      const currentPlayerEntry: LeaderboardEntry = {
        player_name: redditUser.name || 'Anonymous',
        score,
        is_reddit_user: redditUser.isAuthenticated,
        created_at: new Date().toISOString(),
        words: []
      };
      
      allEntries.push(currentPlayerEntry);
      allEntries.sort((a, b) => b.score - a.score);
      if (allEntries.length > 10) allEntries.pop();
    }
    return allEntries;
  };

  if (leaderboard.loading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold">Leaderboard</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  if (leaderboard.error) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold">Leaderboard</h2>
        </div>
        <div className="text-center py-4 text-red-400">
          {leaderboard.error}
        </div>
      </div>
    );
  }

  const dailyEntries = getEnhancedLeaderboard(leaderboard.daily);
  const allTimeEntries = getEnhancedLeaderboard(leaderboard.allTime);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Leaderboard */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-purple-300">Daily Top 10</h3>
          <div className="space-y-2">
            {dailyEntries.map((entry, index) => (
              <div
                key={`daily-${entry.player_name}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-500/20' :
                  index === 1 ? 'bg-gray-400/20' :
                  index === 2 ? 'bg-orange-700/20' :
                  'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold w-8">
                    {index + 1}.
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {entry.player_name}
                      </span>
                      {entry.is_reddit_user && (
                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
                          Reddit
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{entry.score}</span>
                  {index < 3 && (
                    <Medal className={`w-5 h-5 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-400' :
                      'text-orange-700'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All-Time Leaderboard */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-purple-300">All-Time Top 10</h3>
          <div className="space-y-2">
            {allTimeEntries.map((entry, index) => (
              <div
                key={`alltime-${entry.player_name}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-500/20' :
                  index === 1 ? 'bg-gray-400/20' :
                  index === 2 ? 'bg-orange-700/20' :
                  'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold w-8">
                    {index + 1}.
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {entry.player_name}
                      </span>
                      {entry.is_reddit_user && (
                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
                          Reddit
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{entry.score}</span>
                  {index < 3 && (
                    <Medal className={`w-5 h-5 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-400' :
                      'text-orange-700'
                    }`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {dailyEntries.length === 0 && allTimeEntries.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          No scores yet. Be the first to play!
        </div>
      )}
    </div>
  );
};