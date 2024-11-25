import React, { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useStore } from '../store/gameStore';

interface LeaderboardEntry {
  player: string;
  score: number;
  isRedditUser?: boolean;
  timestamp?: string;
}

export const Leaderboard: React.FC = () => {
  const { score, playerName, redditUser } = useStore();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  // Ensure we always have a valid player name
  const getPlayerName = (): string => {
    if (redditUser.isAuthenticated && redditUser.name) {
      return redditUser.name;
    }
    return playerName || 'Anonymous';
  };

  useEffect(() => {
    // Load saved scores from localStorage
    const savedScores = JSON.parse(localStorage.getItem('gameScores') || '[]') as LeaderboardEntry[];
    setLeaderboardData(savedScores);
  }, []);

  // Create current player entry with guaranteed string name
  const currentPlayerEntry: LeaderboardEntry = {
    player: getPlayerName(),
    score,
    isRedditUser: redditUser.isAuthenticated,
    timestamp: new Date().toISOString()
  };

  const allEntries: LeaderboardEntry[] = [
    currentPlayerEntry,
    ...leaderboardData,
    // Add demo entries if leaderboard is empty
    ...(leaderboardData.length === 0 ? [
      { player: "RedditPro", score: 120, isRedditUser: true },
      { player: "WordMaster", score: 110, isRedditUser: true },
      { player: "Guest123", score: 95 },
      { player: "WordNinja", score: 85, isRedditUser: true },
      { player: "CoolGuest", score: 75 }
    ] : [])
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>

      <div className="space-y-2">
        {allEntries.map((entry, index) => (
          <div
            key={index}
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
                    {entry.player}
                  </span>
                  {entry.isRedditUser && (
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
                      Reddit
                    </span>
                  )}
                </div>
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
  );
};