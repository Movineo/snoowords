import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Book, Zap, Crown, Star } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { LeaderboardEntry } from '../types/game';
import { motion, AnimatePresence } from 'framer-motion';

export const Leaderboard: React.FC = () => {
  const { score, redditUser, leaderboard, fetchLeaderboard } = useGameStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Add current player's score if it would make it to the top 10
  const getEnhancedLeaderboard = (entries: LeaderboardEntry[]) => {
    const allEntries = [...entries];
    const playerName = redditUser?.name || 'Anonymous';
    
    if (score > 0 && !entries.some(entry => 
      entry.player_name === playerName && entry.score === score
    )) {
      const currentPlayerEntry: LeaderboardEntry = {
        id: `temp-${Date.now()}`,
        player_name: playerName,
        score,
        is_reddit_user: redditUser?.isAuthenticated || false,
        words: [],
        created_at: new Date().toISOString()
      };
      
      allEntries.push(currentPlayerEntry);
      allEntries.sort((a, b) => b.score - a.score);
      if (allEntries.length > 10) allEntries.pop();
    }
    return allEntries;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-orange-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-400 opacity-50" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 0:
        return 'bg-yellow-900/30 text-yellow-100 border-yellow-700/50';
      case 1:
        return 'bg-gray-800/30 text-gray-100 border-gray-700/50';
      case 2:
        return 'bg-orange-900/30 text-orange-100 border-orange-700/50';
      default:
        return 'bg-gray-800/20 text-gray-300 border-gray-700/30';
    }
  };

  const [timeRange, setTimeRange] = useState('daily');
  const [category, setCategory] = useState('points');

  const dailyEntries = getEnhancedLeaderboard(leaderboard.daily);
  const allTimeEntries = getEnhancedLeaderboard(leaderboard.allTime);

  const leaderboardData = timeRange === 'daily' ? dailyEntries : allTimeEntries;

  if (leaderboard.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Leaderboard
        </h2>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'daily' | 'weekly' | 'monthly' | 'allTime')}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="allTime">All Time</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'points' | 'words' | 'powerUps')}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="points">Points</option>
            <option value="words">Words Found</option>
            <option value="powerUps">Power-ups Used</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`${getRankStyle(index)} rounded-lg border p-4 transition-all hover:shadow-md hover:bg-opacity-75`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-gray-700">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={entry.avatar_url || `https://api.dicebear.com/6.x/bottts/svg?seed=${entry.player_name}`}
                      alt={`${entry.player_name}'s avatar`}
                      className="h-12 w-12 rounded-full border-2 border-gray-700 shadow-sm"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold truncate text-gray-100">
                        {entry.player_name}
                      </p>
                      {entry.is_reddit_user && (
                        <img
                          src="/reddit-icon.svg"
                          alt="Reddit User"
                          className="w-5 h-5"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {entry.words?.length || 0} words • {entry.karma || 0} karma
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {category === 'points' && <Trophy className="w-5 h-5 text-yellow-500" />}
                    {category === 'words' && <Book className="w-5 h-5 text-blue-400" />}
                    {category === 'powerUps' && <Zap className="w-5 h-5 text-purple-400" />}
                    <span className="text-lg font-bold text-gray-100">
                      {formatValue(entry, category)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const formatValue = (entry: LeaderboardEntry, key: string): string => {
  const value = entry[key];
  if (value === undefined) return '-';
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
};