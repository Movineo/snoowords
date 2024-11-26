import React, { useState, useEffect } from 'react';
import { CommunityPuzzle } from '../types/game';
import { gameService } from '../services/gameService';
import { X } from 'lucide-react';

interface CommunityPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPuzzle: (puzzle: CommunityPuzzle) => void;
}

export const CommunityPuzzleModal: React.FC<CommunityPuzzleModalProps> = ({
  isOpen,
  onClose,
  onSelectPuzzle,
}) => {
  const [activeCategory, setActiveCategory] = useState<'popular' | 'new' | 'trending'>('popular');
  const [puzzles, setPuzzles] = useState<CommunityPuzzle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPuzzles = async () => {
      setLoading(true);
      try {
        const data = await gameService.getCommunityPuzzles(activeCategory);
        setPuzzles(data);
      } catch (error) {
        console.error('Error fetching puzzles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPuzzles();
    }
  }, [isOpen, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Community Puzzles</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['popular', 'new', 'trending'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full capitalize transition-colors ${
                activeCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {puzzles.map((puzzle) => (
                <button
                  key={puzzle.id}
                  onClick={() => onSelectPuzzle(puzzle)}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{puzzle.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{puzzle.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Created by {puzzle.creator}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-400">{puzzle.plays.toLocaleString()} plays</p>
                      <p className="text-xs text-gray-500 mt-1">{puzzle.difficulty}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
