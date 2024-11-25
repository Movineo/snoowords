import React from 'react';
import { Award, Star, TrendingUp } from 'react-feather';
import { ShareResults } from './ShareResults';
import { Word } from '../types';
import { useStore } from '../store/gameStore';

interface GameOverProps {
  words: Word[];
  onPlayAgain: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ words, onPlayAgain }) => {
  const { redditUser } = useStore();
  const totalScore = words.reduce((sum, word) => sum + word.points, 0);
  const longestWord = words.reduce(
    (longest, word) => (word.word.length > longest.length ? word.word : longest),
    ''
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Game Over!</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-sm text-purple-200">Total Score</div>
            <div className="text-2xl sm:text-3xl font-bold">{totalScore}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-sm text-purple-200">Words Found</div>
            <div className="text-2xl sm:text-3xl font-bold">{words.length}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-sm text-purple-200">Avg Points/Word</div>
            <div className="text-2xl sm:text-3xl font-bold">
              {words.length ? Math.round(totalScore / words.length) : 0}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-sm text-purple-200">Longest Word</div>
            <div className="text-2xl sm:text-3xl font-bold">
              {longestWord || '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Top Words
          </h3>
          <div className="space-y-2">
            {words
              .sort((a, b) => b.points - a.points)
              .slice(0, 5)
              .map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-purple-300">#{index + 1}</span>
                    <span className="font-medium">{word.word}</span>
                  </div>
                  <span className="bg-purple-600/20 px-2 py-1 rounded text-sm">
                    {word.points} pts
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Achievements
          </h3>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <h4 className="font-medium">Word Master</h4>
              </div>
              <p className="text-sm text-purple-200">
                Found {words.length} words in one game!
              </p>
            </div>
            {totalScore >= 100 && (
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <h4 className="font-medium">High Scorer</h4>
                </div>
                <p className="text-sm text-purple-200">
                  Scored over 100 points in one game!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center">
        <button
          onClick={onPlayAgain}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
        >
          Play Again
        </button>
        {redditUser.isAuthenticated && (
          <ShareResults
            score={totalScore}
            words={words}
            playerName={redditUser.name || undefined}
          />
        )}
      </div>
    </div>
  );
};