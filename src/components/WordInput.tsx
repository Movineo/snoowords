import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/gameStore';
import { X } from 'lucide-react';

export const WordInput: React.FC = () => {
  const { selectedLetters, letters, submitWord, clearSelection, setCurrentWord } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when letters are selected
  useEffect(() => {
    const word = selectedLetters.map(index => letters[index]).join('');
    setInputValue(word);
    setCurrentWord(word);
    setShowError(false);
  }, [selectedLetters, letters, setCurrentWord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.length >= 3) {
      setCurrentWord(inputValue);
      submitWord();
      setInputValue('');
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    setCurrentWord(value);
    setShowError(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.length >= 3) {
        setCurrentWord(inputValue);
        submitWord();
        setInputValue('');
        setShowError(false);
      } else {
        setShowError(true);
      }
    } else if (e.key === 'Escape') {
      clearSelection();
      setInputValue('');
      setShowError(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type or tap letters..."
          className={`
            w-full px-4 py-3 bg-white/10 border-2 rounded-lg
            placeholder-gray-400 text-white text-lg font-medium
            focus:outline-none focus:ring-2 focus:ring-purple-500
            transition-all relative z-50
            ${showError ? 'border-red-500' : 'border-transparent'}
            ${
              inputValue.length >= 3
                ? 'border-green-500'
                : inputValue.length > 0
                ? 'border-yellow-500'
                : ''
            }
          `}
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              clearSelection();
              setInputValue('');
              setShowError(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-50 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          Word must be at least 3 letters long
        </p>
      )}
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={inputValue.length < 3}
          className={`
            px-4 py-2 rounded-lg font-medium
            ${
              inputValue.length >= 3
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
            transition-colors
          `}
        >
          Submit
        </button>
      </div>
    </form>
  );
};