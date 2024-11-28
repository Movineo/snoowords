import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const CommunityPuzzles: React.FC = () => {
  const { setShowCommunityPuzzles } = useGameStore();
  const [activeCategory, setActiveCategory] = useState<'popular' | 'new' | 'trending'>('popular');

  // Placeholder data - replace with actual data from your backend
  const puzzlesByCategory = {
    popular: [
      { id: 1, title: 'Space Adventure', creator: 'u/spacefan', plays: 2450 },
      { id: 2, title: 'Ocean Words', creator: 'u/marinelife', plays: 1780 },
      { id: 3, title: 'Tech Terms', creator: 'u/techie', plays: 1342 },
    ],
    new: [
      { id: 4, title: 'Fresh Puzzle', creator: 'u/newcreator', plays: 45 },
      { id: 5, title: 'Latest Challenge', creator: 'u/puzzlemaker', plays: 23 },
      { id: 6, title: 'New Words', creator: 'u/wordsmith', plays: 12 },
    ],
    trending: [
      { id: 7, title: 'Hot Topics', creator: 'u/trending', plays: 567 },
      { id: 8, title: 'Rising Stars', creator: 'u/rising', plays: 432 },
      { id: 9, title: 'Viral Words', creator: 'u/viral', plays: 345 },
    ],
  };

  return (
    <div className="absolute top-16 right-4 w-80 bg-white rounded-lg shadow-lg z-40 max-h-[80vh] overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Community Puzzles</h2>
          <button
            onClick={() => setShowCommunityPuzzles(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          {(['popular', 'new', 'trending'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {puzzlesByCategory[activeCategory].map((puzzle) => (
            <div
              key={puzzle.id}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm">{puzzle.title}</h3>
                  <p className="text-xs text-gray-600">Created by {puzzle.creator}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{puzzle.plays} plays</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          onClick={() => {/* Add puzzle creation logic */}}
        >
          Create New Puzzle
        </button>
      </div>
    </div>
  );
};

export default CommunityPuzzles;
