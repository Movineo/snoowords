import React from 'react';
import { useStore } from '../store/gameStore';

interface GameSetupProps {
  onStartGame: () => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ 
  onStartGame, 
  playerName, 
  onPlayerNameChange 
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [error, setError] = React.useState('');

  const setPlayerName = (name: string) => useStore.setState({ playerName: name });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Reddit username validation
    if (!inputValue.trim()) {
      setError('Please enter your Reddit username');
      return;
    }

    if (!/^[A-Za-z0-9_-]{3,20}$/.test(inputValue)) {
      setError('Invalid Reddit username format');
      return;
    }

    setError('');
    setPlayerName(inputValue);
    onStartGame();
  };

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to SnooWords!</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Enter your Reddit username
          </label>
          <input
            id="username"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="u/username"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {error && (
            <p className="text-red-400 text-sm mt-1">{error}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="playerName" className="block text-sm font-medium">
            Your Name (optional)
          </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            placeholder="Enter your name to save scores"
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Start Game
        </button>
      </form>
    </div>
  );
};