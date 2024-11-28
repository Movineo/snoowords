import React, { useState } from 'react';
import { Share, Trophy, Award, Star } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const ShareResults: React.FC = () => {
  const { score, words, redditUser } = useGameStore();
  const [shared, setShared] = useState(false);
  const [subreddit, setSubreddit] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subreddit) {
      setError('Please enter a subreddit name');
      return;
    }

    try {
      if (!redditUser || !redditUser.isAuthenticated || !redditUser.accessToken) {
        setError('You must be logged in to share results');
        return;
      }

      const content = generateShareContent();
      // Call Reddit API to create post
      const response = await fetch(`https://oauth.reddit.com/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${redditUser.accessToken}`,
        },
        body: JSON.stringify({
          kind: 'self',
          sr: subreddit,
          title: `My SnooWords Score: ${score} points!`,
          text: content,
        }),
      });

      if (response.ok) {
        setShared(true);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to share results. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while sharing results');
      console.error(err);
    }
  };

  const generateShareContent = () => {
    if (!redditUser || !redditUser.isAuthenticated) return '';
    
    const content = `
# SnooWords Score Report
- Player: ${redditUser.name}
- Score: ${score} points
- Words Found: ${words.length}
${words.map(word => `- ${word.word} (${word.points} pts)`).join('\n')}
    `;
    return content;
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
          {redditUser && redditUser.isAuthenticated ? (
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
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Words Found:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {words.map((word, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${word.themed ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'}
                  backdrop-blur-sm transition-all hover:scale-102
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">{word.word}</span>
                  {word.themed && (
                    <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded">
                      Theme Bonus
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-purple-300">+{word.points}</span>
                  {word.points >= 10 && (
                    <Star className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
