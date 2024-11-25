import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { GameSetup } from './components/GameSetup';
import { GameBoard } from './components/GameBoard';
import { GameOver } from './components/GameOver';
import { RedditCallback } from './components/RedditCallback';
import { useStore } from './store/gameStore';
import { gameService } from './services/gameService';
import { toast } from 'react-hot-toast';
import { DailyChallenge } from './components/DailyChallenge';
import { GameRules } from './components/GameRules';
import { Leaderboard } from './components/Leaderboard';
import { CommunityChallenge } from './components/CommunityChallenge';

function App() {
  const { gameStatus, showRules, words, timeLeft, toggleRules } = useStore();
  const [playerName, setPlayerName] = useState('');

  const handleStartGame = () => {
    useStore.setState({ gameStatus: 'playing' });
  };

  const handlePlayAgain = () => {
    useStore.getState().resetGame();
  };

  // Submit score when game ends
  useEffect(() => {
    const submitScore = async () => {
      if (gameStatus === 'idle' && words.length > 0 && playerName) {
        try {
          await gameService.submitScore(playerName, {
            score: words.reduce((sum, word) => sum + word.points, 0),
            words: words,
            gameMode: { 
              id: 'classic', 
              name: 'Classic', 
              description: 'Classic mode', 
              duration: 60, 
              icon: 'clock' 
            },
            duration: timeLeft
          });
          toast.success('Score submitted successfully!');
        } catch (error) {
          console.error('Error submitting score:', error);
          toast.error('Failed to submit score');
        }
      }
    };

    submitScore();
  }, [gameStatus, words, playerName, timeLeft]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header onShowRules={toggleRules} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  {gameStatus === 'idle' && !words.length && (
                    <div className="space-y-6">
                      <DailyChallenge />
                      <GameSetup onStartGame={handleStartGame} />
                    </div>
                  )}
                  {showRules && <GameRules />}
                  {gameStatus === 'playing' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                      <div className="lg:col-span-2 space-y-4">
                        <GameBoard />
                      </div>
                      <div className="space-y-4">
                        <CommunityChallenge />
                      </div>
                    </div>
                  )}
                  {gameStatus === 'ended' && (
                    <div className="space-y-6">
                      <GameOver
                        words={words}
                        onPlayAgain={handlePlayAgain}
                      />
                      <Leaderboard />
                    </div>
                  )}
                  {gameStatus === 'idle' && !words.length && (
                    <div className="mt-6">
                      <Leaderboard />
                    </div>
                  )}
                </>
              } 
            />
            <Route path="/auth/callback" element={<RedditCallback />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;