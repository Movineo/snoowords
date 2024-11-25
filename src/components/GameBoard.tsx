import React from 'react';
import { Clock, Star, Book, ScrollText } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { PowerUps } from './PowerUps';
import { WordInput } from './WordInput';

export const GameBoard: React.FC = () => {
  const { letters, selectedLetters, timeLeft, selectLetter } = useStore();

  const handleLetterClick = (index: number) => {
    selectLetter(index);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <span className="text-lg font-medium">{timeLeft}s</span>
        </div>
        <PowerUps />
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {letters.map((letter, index) => (
          <button
            key={index}
            onClick={() => handleLetterClick(index)}
            disabled={selectedLetters.includes(index)}
            className={`
              aspect-square flex items-center justify-center text-2xl sm:text-3xl font-bold rounded-lg
              transition-all transform hover:scale-105 active:scale-95
              ${
                selectedLetters.includes(index)
                  ? 'bg-purple-600/50 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20'
              }
            `}
          >
            {letter}
          </button>
        ))}
      </div>

      <WordInput />
    </div>
  );
};