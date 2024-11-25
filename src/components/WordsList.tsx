import React from 'react';
import { Ghost, Users, Trophy } from 'lucide-react';
import { Word } from '../types';

interface WordsListProps {
  words: Word[];
}

export const WordsList: React.FC<WordsListProps> = ({ words }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
      <Trophy className="w-5 h-5" />
      Words Created
    </h3>
    <div className="space-y-2">
      {words.map((word, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white/5 p-2 rounded hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Ghost className="w-4 h-4" />
            <span>{word.word}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-purple-300">{word.player}</span>
            <span className="bg-purple-600 px-2 py-1 rounded text-sm">
              {word.points} pts
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);