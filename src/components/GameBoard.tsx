import React, { useEffect } from 'react';
import { Timer, TrendingUp } from 'lucide-react';
import { LettersGrid } from './LettersGrid';
import { WordInput } from './WordInput';
import { WordsList } from './WordsList';
import { DailyTheme } from './DailyTheme';
import { PowerUps } from './PowerUps';
import { useStore } from '../store/gameStore';

export const GameBoard: React.FC = () => {
  const { timeLeft, letters, words, tick, gameMode } = useStore();

  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Timer className="w-6 h-6" />
            <span className="text-2xl font-bold">{timeLeft}s</span>
          </div>
          {gameMode && (
            <div className="bg-purple-600/20 px-4 py-1 rounded-full">
              <span className="text-sm font-semibold">{gameMode.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <span className="font-bold">{words.reduce((sum, w) => sum + w.points, 0)} karma</span>
        </div>
      </div>
      <DailyTheme />
      <PowerUps />
      <LettersGrid letters={letters} />
      <WordInput />
      <WordsList words={words} />
    </div>
  );
};