import React, { useState } from 'react';
import { useStore } from '../store/gameStore';
import { LogIn, User, Play } from 'lucide-react';
import { REDDIT_CONFIG, REDDIT_ENDPOINTS } from '../config/reddit';
import { animationService } from '../services/animationService'; // Import animationService

interface GameSetupProps {
  onStartGame: () => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, playerName, onPlayerNameChange }) => {
  const { setPlayerName, redditUser } = useStore();
  const [error, setError] = useState<string | null>(null);

  const handleGuestStart = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPlayerName(playerName);
    animationService.playClickSound(); // Add click sound
    onStartGame();
  };

  const handleRedditLogin = () => {
    try {
      animationService.playClickSound(); // Add click sound
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('reddit_auth_state', state);

      const authUrl = new URL(REDDIT_ENDPOINTS.AUTHORIZE);
      authUrl.searchParams.append('client_id', REDDIT_CONFIG.CLIENT_ID);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('redirect_uri', REDDIT_CONFIG.REDIRECT_URI);
      authUrl.searchParams.append('duration', 'permanent');
      authUrl.searchParams.append('scope', REDDIT_CONFIG.SCOPES.join(' '));

      window.location.href = authUrl.toString();
    } catch (error) {
      setError('Failed to initiate Reddit login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome to SnooWords!</h1>
            <p className="text-gray-300">Choose how you'd like to play:</p>
          </div>

          {redditUser.isAuthenticated ? (
            /* Reddit User View */
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Playing as {redditUser.name}</h3>
                  <p className="text-sm text-gray-400">{redditUser.karma || 0} karma</p>
                </div>
                <button
                  onClick={onStartGame}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Guest View */
            <div className="space-y-4">
              <form onSubmit={handleGuestStart} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={playerName}
                    onChange={(e) => onPlayerNameChange(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Play as Guest
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800/30 text-gray-400">or</span>
                </div>
              </div>

              <button
                onClick={handleRedditLogin}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Login with Reddit
              </button>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};