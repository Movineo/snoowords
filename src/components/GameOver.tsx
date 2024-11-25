import React from 'react';
import { PlayCircle } from 'lucide-react';
import { Word } from '../types';
import { ShareResults } from './ShareResults';
import { RedditAwards } from './RedditAwards';
import { useStore } from '../store/gameStore';
import { redditService } from '../services/redditService';

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

  const handleShareToReddit = async () => {
    if (!redditUser.isAuthenticated) {
      return;
    }

    try {
      await redditService.submitScore(totalScore, words.map(w => w.word));
    } catch (error) {
      console.error('Failed to share to Reddit:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Final Score</div>
            <div className="text-3xl font-bold">{totalScore}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Words Found</div>
            <div className="text-3xl font-bold">{words.length}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Words Used</div>
          <div className="flex flex-wrap gap-2">
            {words.map((word, index) => (
              <div
                key={index}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{word.word}</span>
                <span className="ml-2 text-orange-400">+{word.points}</span>
              </div>
            ))}
          </div>
        </div>

        {redditUser.isAuthenticated && <RedditAwards />}

        <div className="flex gap-4 mt-6">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors flex-1"
          >
            <PlayCircle className="w-5 h-5" />
            Play Again
          </button>
          
          <ShareResults score={totalScore} words={words} onShareReddit={handleShareToReddit} />
        </div>
      </div>
    </div>
  );
};