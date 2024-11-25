import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/gameStore';
import { X } from 'react-feather';

export const WordInput: React.FC = () => {
  const { selectedLetters, letters } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = selectedLetters
        .map(index => letters[index])
        .join('');
    }
  }, [selectedLetters, letters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    useStore.getState().submitWord();
  };

  const handleClear = () => {
    useStore.getState().clearSelection();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          placeholder="Select letters to form a word..."
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg placeholder:text-white/30"
        />
        {selectedLetters.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        )}
      </div>
    </form>
  );
};