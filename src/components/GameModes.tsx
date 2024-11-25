import React from 'react';
import { Clock, Link, Sparkles, Trophy } from 'lucide-react';
import { GameMode } from '../types';

const gameModes: GameMode[] = [
  {
    id: 'classic',
    name: 'Classic Mode',
    description: 'Create words within 60 seconds',
    duration: 60,
    icon: 'Trophy'
  },
  {
    id: 'timeAttack',
    name: 'Time Attack',
    description: 'Each word adds more time',
    duration: 30,
    icon: 'Clock'
  },
  {
    id: 'wordChain',
    name: 'Word Chain',
    description: 'Each word must start with the last letter of previous word',
    duration: 90,
    icon: 'Link'
  },
  {
    id: 'challenge',
    name: 'Daily Challenge',
    description: 'Complete special themed challenges',
    duration: 120,
    icon: 'Sparkles'
  }
];

interface GameModesProps {
  onSelectMode: (mode: GameMode) => void;
}

export const GameModes: React.FC<GameModesProps> = ({ onSelectMode }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return <Trophy className="w-6 h-6" />;
      case 'Clock': return <Clock className="w-6 h-6" />;
      case 'Link': return <Link className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      default: return <Trophy className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
      {gameModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelectMode(mode)}
          className="bg-white/10 backdrop-blur-lg p-4 rounded-lg hover:bg-white/20 transition-colors text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            {getIcon(mode.icon)}
            <h3 className="text-lg font-bold">{mode.name}</h3>
          </div>
          <p className="text-sm text-purple-200">{mode.description}</p>
          <div className="mt-2 text-xs text-purple-300">
            Duration: {mode.duration}s
          </div>
        </button>
      ))}
    </div>
  );
};