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

      {/* Daily Theme */}
      <DailyTheme />

      {/* Voice Commands */}
      <div className="mb-4">
        <button
          onClick={toggleVoice}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isVoiceEnabled ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Mic className={`w-5 h-5 ${isVoiceEnabled ? 'animate-pulse' : ''}`} />
          {isVoiceEnabled ? 'Voice Active' : 'Enable Voice'}
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Word Input */}
        <div className="mb-4 w-full">
          <WordInput />
        </div>

        {/* Letters Grid */}
        <div className="w-full mb-6">
          <div className="grid grid-cols-4 gap-2 aspect-square max-w-[400px] mx-auto">
            {letters.map((letter, index) => (
              <button
                key={index}
                data-index={index}
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
                `}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Community Features */}
        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={() => setShowSubredditPacks(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Star className="w-5 h-5" />
            Subreddit Packs
          </button>
          <button
            onClick={() => setShowCommunityPuzzles(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Book className="w-5 h-5" />
            Community Puzzles
          </button>
        </div>

        {/* Words List */}
        <div className="bg-gray-800/30 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium mb-2">Found Words</h3>
          <div className="flex flex-wrap gap-2">
            {words.map((wordObj, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
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