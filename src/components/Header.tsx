import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy, Medal, LogOut, LogIn } from 'lucide-react';
import { redditService } from '../services/redditService';
import { Link, useNavigate } from 'react-router-dom';
import { playSound } from '../utils/soundUtils';

interface HeaderProps {
  onShowRules?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowRules }) => {
  const { redditUser } = useGameStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear Reddit session
    if (window.localStorage.getItem('reddit_token')) {
      window.localStorage.removeItem('reddit_token');
    }
    if (window.localStorage.getItem('reddit_refresh_token')) {
      window.localStorage.removeItem('reddit_refresh_token');
    }

    // Reset game store state
    useGameStore.getState().setRedditUser(null);
    useGameStore.getState().setIsAuthenticated(false);
    useGameStore.getState().resetGameState();

    // Clear any active games or battles
    useGameStore.getState().setActiveGame(null);
    useGameStore.getState().setActiveBattle(null);

    // Play logout sound
    playSound('logout');

    // Redirect to home page
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="SnooWords"
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">
                SnooWords
              </span>
            </Link>
            <nav className="ml-4 sm:ml-6 space-x-2 sm:space-x-4">
              <Link
                to="/battles"
                className="inline-flex items-center px-2 sm:px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Battles</span>
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center px-2 sm:px-3 py-2 text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <Medal className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {redditUser?.isAuthenticated ? (
              <div className="flex items-center">
                <div className="hidden sm:flex flex-col items-end mr-3">
                  <span className="text-sm font-medium text-gray-900">
                    {redditUser.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {redditUser.karma} karma
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline ml-2">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => redditService.getAuthUrl()}
                className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
              >
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Login with Reddit</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};