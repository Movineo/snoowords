import React from 'react';
import { useStore } from '../store/gameStore';
import { Award, User, HelpCircle } from 'react-feather';
import { redditService } from '../services/redditService';

interface HeaderProps {
  onShowRules?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowRules }) => {
  const { redditUser } = useStore();
  const { name, karma, isAuthenticated, avatar, trophies } = redditUser || {};

  const handleLoginClick = () => {
    const authUrl = redditService.getAuthUrl();
    window.location.href = authUrl;
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <span>SnooWords</span>
            </div>
            {onShowRules && (
              <button
                onClick={onShowRules}
                className="text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Rules</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white">{trophies || 0} trophies</span>
                </div>
                <div className="flex items-center gap-2">
                  <img 
                    src={avatar || '/default-avatar.png'} 
                    alt={`${name}'s avatar`}
                    className="w-8 h-8 rounded-full bg-white/10"
                  />
                  <div className="hidden sm:block">
                    <div className="font-medium text-white">{name}</div>
                    <div className="text-xs text-gray-400">{karma || 0} karma</div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Login with Reddit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};