import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { LogIn, User, Play } from 'lucide-react';
import { REDDIT_CONFIG, REDDIT_ENDPOINTS } from '../config/reddit';
import { animationService } from '../services/animationService';

interface GameSetupProps {
  onStartGame: () => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, playerName, onPlayerNameChange }) => {
  const store = useGameStore();
  const { redditUser } = store;
  const [error, setError] = useState<string | null>(null);

  const handleGuestStart = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    store.setPlayerName(playerName);
    animationService.playClickSound();
    onStartGame();
  };

  const handleRedditLogin = () => {
    try {
      animationService.playClickSound();
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

  // Early return for loading state
  if (redditUser === undefined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome to SnooWords!</h1>
            <p className="text-gray-300">Choose how you'd like to play:</p>
          </div>

          {redditUser?.isAuthenticated ? (
            /* Reddit User View */
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Welcome back, {redditUser.name}!</h3>
                  <p className="text-sm text-gray-400">Karma: {redditUser.karma}</p>
                </div>
                <button
                  onClick={onStartGame}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Play
                </button>
              </div>
            </div>
          ) : (
            /* Guest View */
            <div className="space-y-4">
              <form onSubmit={handleGuestStart} className="space-y-4">
                <div>
                  <label htmlFor="playerName" className="block text-sm font-medium mb-1">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    id="playerName"
                    value={playerName}
                    onChange={(e) => onPlayerNameChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Play as Guest
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">or</span>
                </div>
              </div>

              <button
                onClick={handleRedditLogin}
                className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Continue with Reddit
              </button>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};