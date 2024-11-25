import React from 'react';

interface LettersGridProps {
  letters: string[];
}

export const LettersGrid: React.FC<LettersGridProps> = ({ letters }) => (
  <div className="grid grid-cols-6 gap-2 mb-6">
    {letters.map((letter, index) => (
      <div
        key={index}
        className="aspect-square bg-white/20 rounded-lg flex items-center justify-center text-2xl font-bold hover:bg-white/30 transition-colors cursor-pointer"
      >
        {letter}
      </div>
    ))}
  </div>
);