import React, { useEffect } from 'react';
import { Clock, Star, Book, Mic } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { PowerUps } from './PowerUps';
import { WordInput } from './WordInput';
import { VoiceCommands } from './VoiceCommands';
import { DailyTheme } from './DailyTheme';
import { SubredditPackModal } from './SubredditPackModal';
import { WordEffects } from './WordEffects';
import { CommunityPuzzleModal } from './CommunityPuzzleModal';
import { voiceService } from '../services/voiceService';
import { gsap } from 'gsap';
import { animationService } from '../services/animationService';

export const GameBoard: React.FC = () => {
  const { 
    letters, 
    selectedLetters, 
    timeLeft, 
    score, 
    selectLetter, 
    words,
    isVoiceEnabled,
    toggleVoice,
    showSubredditPacks,
    setShowSubredditPacks,
    showCommunityPuzzles,
    setShowCommunityPuzzles
  } = useStore();

  useEffect(() => {
    if (isVoiceEnabled) {
      voiceService.startListening();
    } else {
      voiceService.stopListening();
    }
  }, [isVoiceEnabled]);

  const handleLetterClick = (index: number) => {
    selectLetter(index);
    const button = document.querySelector(`button[data-index="${index}"]`) as HTMLElement;
    if (button) {
      animationService.playLetterSelectSound();
      gsap.to(button, {
        scale: 1.2,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex flex-col">
      {/* Game Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-800/30 rounded-lg p-2 sm:p-3 backdrop-blur-sm mb-2 sm:mb-4 relative z-10">
        <div className="flex items-center gap-1 sm:gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          <span className="text-base sm:text-lg font-medium">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <span className="text-base sm:text-lg font-medium">{score} points</span>
        </div>
        <PowerUps />
      </div>

      {/* Daily Theme */}
      <DailyTheme />

      {/* Voice Commands */}
      <div className="mb-2 sm:mb-4">
        <button
          onClick={toggleVoice}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
            isVoiceEnabled ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Mic className={`w-4 h-4 sm:w-5 sm:h-5 ${isVoiceEnabled ? 'animate-pulse' : ''}`} />
          {isVoiceEnabled ? 'Voice Active' : 'Enable Voice'}
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Word Input */}
        <div className="mb-2 sm:mb-4 w-full">
          <WordInput />
        </div>

        {/* Letters Grid */}
        <div className="w-full mb-4 sm:mb-6">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 aspect-square w-full max-w-[min(400px,85vw)] mx-auto">
            {letters.map((letter, index) => {
              const isSelected = selectedLetters.includes(index);
              const selectionOrder = selectedLetters.indexOf(index) + 1;
              const isLastSelected = selectedLetters.length > 0 && selectedLetters[selectedLetters.length - 1] === index;
              
              return (
                <button
                  key={index}
                  data-index={index}
                  onTouchStart={(e) => {
                    e.preventDefault(); // Prevent default touch behavior
                    handleLetterClick(index);
                  }}
                  onClick={() => handleLetterClick(index)}
                  className={`
                    relative aspect-square flex items-center justify-center
                    text-xl sm:text-2xl md:text-3xl font-bold rounded-lg
                    transition-all transform active:scale-95
                    ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }
                    ${isLastSelected ? 'ring-4 ring-purple-300 animate-pulse' : ''}
                    select-none touch-manipulation
                    cursor-pointer
                    hover:brightness-110
                  `}
                  aria-label={`${letter} - ${isSelected ? 'Selected' : 'Not selected'}${isSelected ? ` (${selectionOrder})` : ''}`}
                  aria-pressed={isSelected}
                >
                  {letter}
                  {isSelected && (
                    <span className={`
                      absolute -top-1 -right-1 
                      bg-purple-400 text-white 
                      text-xs w-5 h-5 
                      flex items-center justify-center 
                      rounded-full
                      transition-all
                      ${isLastSelected ? 'animate-bounce' : ''}
                    `}>
                      {selectionOrder}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Community Features */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mb-2 sm:mb-4">
          <button
            onClick={() => setShowSubredditPacks(true)}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
            Subreddit Packs
          </button>
          <button
            onClick={() => setShowCommunityPuzzles(true)}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            <Book className="w-4 h-4 sm:w-5 sm:h-5" />
            Community Puzzles
          </button>
        </div>

        {/* Words List */}
        <div className="bg-gray-800/30 rounded-lg p-2 sm:p-4 backdrop-blur-sm">
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Found Words</h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {words.map((wordObj, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs sm:text-sm"
              >
                {wordObj.word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSubredditPacks && (
        <SubredditPackModal 
          isOpen={showSubredditPacks}
          onClose={() => setShowSubredditPacks(false)}
          onSelectPack={(pack) => {
            // Handle pack selection
            setShowSubredditPacks(false);
            // TODO: Load the selected pack
          }}
        />
      )}
      {showCommunityPuzzles && (
        <CommunityPuzzleModal 
          isOpen={showCommunityPuzzles}
          onClose={() => setShowCommunityPuzzles(false)}
          onSelectPuzzle={(puzzle) => {
            // Handle puzzle selection
            setShowCommunityPuzzles(false);
            // TODO: Load the selected puzzle
          }}
        />
      )}

      {/* Effects */}
      {words.length > 0 && words[words.length - 1] && (
        <WordEffects 
          word={words[words.length - 1].word}
          points={words[words.length - 1].points}
          isNew={true}
        />
      )}
      <VoiceCommands />
    </div>
  );
};