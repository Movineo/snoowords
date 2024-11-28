import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { voiceService } from '../services/voiceService';
import { wordPackService } from '../services/wordPackService';
import { animationService } from '../services/animationService';
import { achievementService } from '../services/achievementService';
import { Mic, MicOff, Trophy } from 'lucide-react';
import { CommunityPuzzleModal } from './CommunityPuzzleModal';
import { SubredditPackModal } from './SubredditPackModal';
import { AchievementsModal } from './AchievementsModal';

export const VoiceCommands: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const store = useGameStore();

  useEffect(() => {
    if (!isListening) return;
    
    setIsSupported(voiceService.isSupported());
    const handleVoiceCommand = async (event: Event) => {
      const customEvent = event as CustomEvent<{ transcript: string }>;
      const command = customEvent.detail.transcript.trim().toLowerCase();
      
      // Game commands
      if (command.startsWith('guess ')) {
        const word = command.replace('guess ', '');
        store.setCurrentWord(word);
        store.submitWord();
        voiceService.speak(`Guessing ${word}`);
      } else if (command.includes('reset game') || command.includes('new game')) {
        store.resetGame();
        voiceService.speak('Starting new game');
        achievementService.startVoiceGame();
      } 
      // Word pack commands
      else if (command.startsWith('load subreddit ')) {
        const subreddit = command.replace('load subreddit ', '');
        try {
          const packs = await wordPackService.getSubredditPacks(subreddit);
          if (packs.length > 0) {
            store.setCurrentWord(packs[0].words[0]);
            voiceService.speak(`Loaded word pack from r/${subreddit}`);
            animationService.playSound('levelUp');
            achievementService.onSubredditVisited(subreddit);
          } else {
            voiceService.speak(`No word packs found for r/${subreddit}`);
          }
        } catch (error) {
          voiceService.speak('Failed to load subreddit word pack');
        }
      }
      // Community puzzle commands
      else if (command.includes('browse puzzles')) {
        setShowPuzzleModal(true);
        voiceService.speak('Opening community puzzles');
      }
      else if (command.includes('browse subreddits')) {
        setShowPackModal(true);
        voiceService.speak('Opening subreddit word packs');
      }
      else if (command.includes('show achievements')) {
        setShowAchievementsModal(true);
        voiceService.speak('Opening achievements');
        animationService.playSound('click');
      }
      else if (command.includes('load popular puzzles')) {
        try {
          const puzzles = await wordPackService.getCommunityPuzzles('popular');
          if (puzzles.length > 0) {
            store.setCurrentWord(puzzles[0].words[0]);
            voiceService.speak(`Loaded popular puzzle: ${puzzles[0].title}`);
            animationService.playSound('levelUp');
          }
        } catch (error) {
          voiceService.speak('Failed to load popular puzzles');
        }
      }
      // Help commands
      else if (command.includes('help')) {
        voiceService.speak(`
          Available commands:
          guess [word] - Submit a word guess
          reset game or new game - Start a new game
          load subreddit [name] - Load words from a subreddit
          browse puzzles - Open community puzzles
          browse subreddits - Open subreddit word packs
          show achievements - View your achievements
          load popular puzzles - Play community puzzles
          stop listening - Disable voice commands
        `);
      } else if (command.includes('stop listening')) {
        toggleVoiceCommands();
      }
    };

    document.addEventListener('voiceCommand', handleVoiceCommand);
    return () => {
      document.removeEventListener('voiceCommand', handleVoiceCommand);
    };
  }, [isListening, store]);

  const toggleVoiceCommands = () => {
    if (isListening) {
      voiceService.stopListening();
      animationService.playSound('click');
    } else {
      voiceService.startListening();
      animationService.playSound('click');
    }
    setIsListening(!isListening);
  };

  if (!isSupported) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setShowAchievementsModal(true)}
          className="p-3 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg transition-colors"
          title="View Achievements"
        >
          <Trophy size={24} />
        </button>
        <button
          onClick={toggleVoiceCommands}
          className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-colors"
          title={isListening ? 'Stop voice commands' : 'Start voice commands'}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
      </div>

      <CommunityPuzzleModal
        isOpen={showPuzzleModal}
        onClose={() => setShowPuzzleModal(false)}
        onSelectPuzzle={(puzzle) => {
          store.setCurrentWord(puzzle.words[0]);
        }}
      />

      <SubredditPackModal
        isOpen={showPackModal}
        onClose={() => setShowPackModal(false)}
        onSelectPack={(pack) => store.setCurrentWord(pack.words[0])}
      />

      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </>
  );
};
