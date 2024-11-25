import React from 'react';
import { useStore } from '../store/gameStore';
import { Award, User } from 'react-feather';

interface HeaderProps {
  onLoginClick?: () => void;
  onShowRules?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onShowRules }) => {
  const { redditUser } = useStore();
  const { name, karma, isAuthenticated, avatar, trophies } = redditUser;

  return (
    <header className="w-full bg-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold text-white">SnooWords</h1>
        {onShowRules && (
          <button
            onClick={onShowRules}
            className="text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            Rules
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white">{trophies}</span>
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src={avatar || '/default-avatar.png'} 
                alt={`${name}'s avatar`}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-white font-medium">{name}</span>
                <span className="text-gray-400 text-sm">{karma} karma</span>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Login with Reddit</span>
          </button>
        )}
      </div>
    </header>
  );
};