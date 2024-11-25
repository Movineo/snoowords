import React from 'react';
import { Clock, Star, Book } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { PowerUps } from './PowerUps';
import { WordInput } from './WordInput';

export const GameBoard: React.FC = () => {
  const { letters, selectedLetters, timeLeft, score, selectLetter, words } = useStore();

  const handleLetterClick = (index: number) => {
    selectLetter(index);
  };

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto p-4 flex flex-col">
      {/* Game Stats */}
      <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3 backdrop-blur-sm mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <span className="text-lg font-medium">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="text-lg font-medium">{score} points</span>
        </div>
        <PowerUps />
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Letters Grid and Input */}
        <div className="flex gap-6 mb-6">
          {/* Letters Grid */}
          <div className="w-[400px] shrink-0">
            <div className="grid grid-cols-4 gap-2 aspect-square">
              {letters.map((letter, index) => (
                <button
                  key={index}
                  onClick={() => handleLetterClick(index)}
                  className={`
                    aspect-square flex items-center justify-center
                    text-2xl sm:text-3xl font-bold rounded-lg
                    transition-all transform hover:scale-105 active:scale-95
                    ${
                      selectedLetters.includes(index)
                        ? 'bg-purple-600/80 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }
                    shadow-lg backdrop-blur-sm relative z-10
                  `}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Word Input */}
          <div className="flex-1 flex items-center">
            <WordInput />
          </div>
        </div>

        {/* Words List */}
        <div className="bg-gray-800/30 rounded-lg p-4 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Book className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium">Found Words</h3>
          </div>
          {words.length === 0 ? (
            <p className="text-gray-400 text-sm">No words found yet. Start typing!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
          )}
        </div>
      </div>
    </div>
  );
};