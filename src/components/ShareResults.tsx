import React, { useState } from 'react';
import { Share, Trophy, Award } from 'lucide-react';
import { useStore } from '../store/gameStore';

export const ShareResults: React.FC = () => {
  const { score, words, redditUser } = useStore();
  const [shared, setShared] = useState(false);
  const [subreddit, setSubreddit] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      setError(null);
      // Share implementation here
      setShared(true);
    } catch (err) {
      setError('Failed to share results. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6">
      <div className="bg-gray-800/30 rounded-lg p-6 backdrop-blur-sm space-y-6">
        {/* Score Display */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Final Score: {score}
          </h2>
          <p className="text-gray-300">
            You found {words.length} word{words.length !== 1 ? 's' : ''}!
          </p>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          {redditUser.isAuthenticated ? (
            <>
              {/* Reddit Share Options */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-300">Share to Subreddit (optional)</span>
                  <input
                    type="text"
                    value={subreddit}
                    onChange={(e) => setSubreddit(e.target.value)}
                    placeholder="e.g., casualgames"
                    className="mt-1 block w-full rounded-md bg-white/10 border-transparent focus:border-purple-500 focus:ring-0 text-white placeholder-gray-500"
                  />
                </label>
              </div>
              <button
                onClick={handleShare}
                disabled={shared}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors
                  ${shared
                    ? 'bg-green-600/50 text-white cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }
                `}
              >
                {shared ? (
                  <>
                    <Award className="w-5 h-5" />
                    Shared!
                  </>
                ) : (
                  <>
                    <Share className="w-5 h-5" />
                    Share to Reddit
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-center text-gray-400">
              <p>Sign in with Reddit to share your score!</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Word List */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Words Found:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {words.map((word, index) => (
              <div
                key={index}
                className="bg-white/5 rounded px-3 py-1.5 flex items-center justify-between backdrop-blur-sm"
              >
                <span className="font-medium truncate">{word.word}</span>
                <span className="text-sm text-purple-400 ml-2">+{word.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
