import React from 'react';
import { useStore } from '../store/gameStore';

export const WordInput: React.FC = () => {
  const { currentWord, error, setCurrentWord, submitWord } = useStore();

  return (
    <div className="space-y-2 mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          className="flex-1 p-2 rounded bg-white/20 border border-purple-300 text-white placeholder-purple-200"
          placeholder="Type your word..."
        />
        <button
          onClick={() => submitWord()}
          disabled={currentWord.length < 3}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-bold disabled:opacity-50 transition-colors"
        >
          Submit
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};