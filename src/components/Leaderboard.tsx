import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { LeaderboardEntry, Word } from '../types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Trophy, Crown, Medal, Star, Zap } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { score, redditUser, leaderboard, fetchLeaderboard, status, words } = useGameStore(state => ({
    score: state.score,
    redditUser: state.redditUser,
    leaderboard: state.leaderboard,
    fetchLeaderboard: state.fetchLeaderboard,
    status: state.status,
    words: state.words as Word[]
  }));

  // Fetch leaderboard on mount and when game ends
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        await fetchLeaderboard();
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };
    
    loadLeaderboard();
    
    // Refresh more frequently during and after game
    const interval = setInterval(loadLeaderboard, status === 'ended' ? 5000 : 15000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchLeaderboard, status, score]);

  // Add current player's score if it would make it to the top 10
  const getEnhancedLeaderboard = (entries: LeaderboardEntry[]) => {
    const allEntries = [...entries];
    const playerName = redditUser?.name || 'Anonymous';
    
    // If we have a score and it's not already in the leaderboard
    if (score > 0 && !allEntries.some(entry => 
      entry.player_name === playerName && 
      entry.score === score &&
      new Date(entry.created_at).toDateString() === new Date().toDateString()
    )) {
      const currentPlayerEntry: LeaderboardEntry = {
        id: `temp-${Date.now()}`,
        player_name: playerName,
        score,
        is_reddit_user: redditUser?.isAuthenticated || false,
        words: words.map(w => w.word),
        created_at: new Date().toISOString()
      };
      
      allEntries.push(currentPlayerEntry);
    }
    
    // Sort by score and get top 10
    return allEntries
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
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

      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Today</h2>
        <div className="space-y-2">
          <AnimatePresence>
            {leaderboardData.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg ${getRankStyle(index)}`}
              >
                <div className="flex items-center space-x-4">
                  {getRankIcon(index)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{entry.player_name}</span>
                      {entry.is_reddit_user && (
                        <img src="/reddit-icon.png" alt="Reddit User" className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-sm opacity-80">
                      <span className="flex items-center gap-2">
                        <Book className="w-4 h-4" /> {formatValue(entry, 'words')} words
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-xl font-bold">{formatValue(entry, 'score')} pts</span>
                    </div>
                    {entry['karma'] !== undefined && Number(entry['karma']) > 0 && (
                      <div className="flex items-center gap-2 text-sm opacity-80">
                        <Zap className="w-4 h-4 text-purple-400" />
                        {formatValue(entry, 'karma')} karma
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const formatValue = (entry: LeaderboardEntry, key: string): string => {
  const value = entry[key];
  if (value === undefined) return '0';
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (Array.isArray(value)) {
    return value.length.toString();
  }
  return String(value);
};