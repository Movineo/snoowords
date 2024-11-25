import React, { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { supabase } from '../config/supabase';

interface LeaderboardEntry {
  id?: string;
  player_name: string;
  score: number;
  is_reddit_user: boolean;
  created_at?: string;
}

export const Leaderboard: React.FC = () => {
  const { score, redditUser } = useStore();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .limit(10);

        if (error) throw error;

        setLeaderboardData(data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Subscribe to realtime updates
    const subscription = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add current player's score if it would make it to the top 10
  const allEntries = [...leaderboardData];
  if (score > 0 && !leaderboardData.some(entry => 
    entry.player_name === (redditUser.name || 'Anonymous') && entry.score === score
  )) {
    const currentPlayerEntry: LeaderboardEntry = {
      player_name: redditUser.name || 'Anonymous',
      score,
      is_reddit_user: redditUser.isAuthenticated,
      created_at: new Date().toISOString()
    };
    
    allEntries.push(currentPlayerEntry);
    allEntries.sort((a, b) => b.score - a.score);
    if (allEntries.length > 10) allEntries.pop();
  }

  if (isLoading) {
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

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold">Leaderboard</h2>
        </div>
        <div className="text-center py-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>

      <div className="space-y-2">
        {allEntries.map((entry, index) => (
          <div
            key={entry.id || `current-${index}`}
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
                {entry.created_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                )}
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

        {allEntries.length === 0 && (
          <div className="text-center py-4 text-gray-400">
            No scores yet. Be the first to play!
          </div>
        )}
      </div>
    </div>
  );
};