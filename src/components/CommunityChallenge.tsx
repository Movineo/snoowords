import React from 'react';
import { Users, Trophy, Clock, Star, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { toast } from 'react-hot-toast';
import type { Challenge } from '../types/game';
import '../styles/scrollbar.css';

export const CommunityChallenge: React.FC = () => {
  const { 
    currentChallenge, 
    challengeLeaderboard, 
    startCommunityChallenge, 
    submitChallengeScore, 
    score,
    status,
    setCurrentChallenge,
    words 
  } = useGameStore();

  const isCommunityChallenge = (challenge: Challenge | null): challenge is Challenge => {
    return challenge !== null && challenge.type === 'community';
  };

  const handleStartChallenge = () => {
    // Create a new community challenge
    const newChallenge: Challenge = {
      id: `cc-${Date.now()}`,
      title: "Today's Community Challenge",
      description: "Find words related to today's theme and compete with other players!",
      type: 'community',
      theme: "technology", // You can randomize this or fetch from a list
      bonus_words: ["computer", "internet", "software", "digital", "innovation"],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      timeLimit: 180, // 3 minutes
      targetScore: 1000,
      participants: 0,
      reward_karma: 100
    };
    
    // Set the current challenge
    setCurrentChallenge(newChallenge);
    
    // Start the challenge
    startCommunityChallenge();
    toast.success(`Community Challenge started! Find ${newChallenge.theme}-related words!`);
  };

  const handleSubmitScore = () => {
    if (currentChallenge) {
      submitChallengeScore(score);
      toast.success('Score submitted! See where you rank on the leaderboard.');
    }
  };

  const handlePlayAgain = () => {
    handleStartChallenge();
  };

  if (!currentChallenge) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Community Challenge
        </h2>
        <motion.button
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartChallenge}
        >
          Start Today's Challenge
        </motion.button>
      </div>
    );
  }

  if (status === 'ended') {
    const avgPointsPerWord = words.length > 0 ? Math.round(score / words.length) : 0;
    
    // Sort words by points in descending order
    const sortedWords = [...words].sort((a, b) => b.points - a.points);
    const longestWord = sortedWords.reduce((longest, current) => 
      current.word.length > longest.length ? current.word : longest, '');
    const topWords = sortedWords.slice(0, 5);

    return (
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-lg p-8 max-w-4xl mx-auto shadow-2xl border border-purple-500/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Community Challenge Complete!
          </h2>
          <p className="text-purple-200">You've completed today's community word challenge!</p>
        </div>
        
        <div className="space-y-8">
          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-300 mb-2">{score}</div>
              <div className="text-sm text-purple-200 uppercase tracking-wider">Total Score</div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-300 mb-2">{words.length}</div>
              <div className="text-sm text-purple-200 uppercase tracking-wider">Words Found</div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-200">
              <Star className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-300 mb-2">{avgPointsPerWord}</div>
              <div className="text-sm text-purple-200 uppercase tracking-wider">Avg Points/Word</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Longest Word */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Longest Word
                </h3>
                <p className="text-3xl font-bold text-purple-300">{longestWord}</p>
              </div>

              {/* Top Words */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Top Words
                </h3>
                <div className="space-y-3">
                  {topWords.map((word, index) => (
                    <div key={word.word} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-purple-300">#{index + 1}</span>
                        <span className="font-semibold">{word.word}</span>
                      </div>
                      <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm font-medium">
                        {word.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Words Found */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Words Found
                </h3>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto scrollbar">
                  {words.map(word => (
                    <div key={word.word} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                      <span className="font-medium">{word.word}</span>
                      <span className="text-green-400 font-medium">+{word.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              {challengeLeaderboard.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Daily Top 10
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar">
                    {challengeLeaderboard.slice(0, 10).map((entry, index) => (
                      <div key={entry.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-purple-300">#{index + 1}</span>
                          <span className="font-semibold">{entry.player_name || 'Anonymous'}</span>
                        </div>
                        <span className="px-3 py-1 bg-purple-500/20 rounded-full text-sm font-medium">
                          {entry.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitScore}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-white flex items-center gap-2 transition-colors"
            >
              <Trophy className="w-5 h-5" />
              Submit Score
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayAgain}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-purple-400" />
        Community Challenge
      </h2>

      <div className="space-y-4">
        <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">Theme: {currentChallenge.theme}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(currentChallenge.timeLimit / 60)}:00</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Bonus Words (2x points):</h3>
              <div className="flex flex-wrap gap-2">
                {isCommunityChallenge(currentChallenge) && currentChallenge.bonus_words?.map((word) => (
                  <span key={word} className="text-sm bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
