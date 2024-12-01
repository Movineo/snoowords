import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { GameSetup } from './components/GameSetup';
import { GameBoard } from './components/GameBoard';
import { GameOver } from './components/GameOver';
import { RedditCallback } from './components/RedditCallback';
import { useGameStore } from './store/gameStore';
import { gameService } from './services/gameService';
import { LeaderboardEntry, Word } from './types/game';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DailyChallenge } from './components/DailyChallenge';
import { GameRules } from './components/GameRules';
import { Leaderboard } from './components/Leaderboard';
import { CommunityChallenge } from './components/CommunityChallenge';
import { Achievements } from './components/Achievements';
import { SubredditBattle } from './components/SubredditBattle';

function App() {
  const { status, words, timeLeft, showRules } = useGameStore(state => ({
    status: state.status,
    words: state.words as Word[],
    timeLeft: state.timeLeft,
    showRules: state.showRules
  }));
  const tick = useGameStore(state => state.tick);
  const toggleRules = useGameStore(state => state.toggleRules);
  const startGame = useGameStore(state => state.startGame);
  const [playerName, setPlayerName] = useState('');

  const handleStartGame = () => {
    startGame();
  };

  const handlePlayAgain = () => {
    useGameStore.getState().resetGame();
  };

  // Timer effect
  useEffect(() => {
    let timer: number | null = null;
    
    if (status === 'playing') {
      timer = window.setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [status, tick]);

  // Submit score when game ends
  useEffect(() => {
    const submitScore = async () => {
      if (status === 'idle' && words.length > 0) {
        try {
          const { redditUser } = useGameStore.getState();
          const finalPlayerName = redditUser?.name || playerName || 'Anonymous';
          const currentScore = words.reduce((sum, word) => sum + word.points, 0);
          
          // Create the leaderboard entry
          const newEntry: LeaderboardEntry = {
            id: `temp-${Date.now()}`,
            player_name: finalPlayerName,
            score: currentScore,
            is_reddit_user: redditUser?.isAuthenticated || false,
            words: words.map(w => w.word), // Convert Word[] to string[]
            created_at: new Date().toISOString()
          };

          // Always update the local leaderboard for all players
          useGameStore.getState().updateLeaderboard({
            daily: [newEntry],
            allTime: [newEntry]
          });

          // Only submit to backend if logged in
          if (redditUser?.isAuthenticated) {
            await gameService.submitScore(finalPlayerName, {
              score: currentScore,
              words: words.map(w => w.word), // Convert Word[] to string[]
              timeLeft,
              timestamp: new Date().toISOString(),
              gameMode: { 
                id: 'classic', 
                name: 'Classic', 
                description: 'Classic mode', 
                duration: 60, 
                icon: 'clock',
                rules: {
                  minWordLength: 3,
                  maxWordLength: 15,
                  allowedCategories: ['all'],
                  bonusPoints: [
                    {
                      category: 'themed',
                      multiplier: 2
                    }
                  ]
                }
              },
              duration: timeLeft
            });
            toast.success('Score submitted successfully!');
            // Fetch updated leaderboard after submitting score
            useGameStore.getState().fetchLeaderboard();
          }
        } catch (error) {
          console.error('Error submitting score:', error);
          toast.error('Failed to submit score');
        }
      }
    };

    submitScore();
  }, [status, words, playerName, timeLeft]);

  return (
    <div className="App">
      <ToastContainer />
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Header onShowRules={toggleRules} />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
            <Routes>
              <Route path="/auth/callback" element={<RedditCallback />} />
              <Route path="/battles" element={<SubredditBattle />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route 
                path="/" 
                element={
                  <>
                    {showRules && <GameRules />}
                    
                    {status === 'idle' && !words.length && (
                      <div className="space-y-6">
                        <DailyChallenge />
                        <GameSetup 
                          onStartGame={handleStartGame}
                          playerName={playerName}
                          onPlayerNameChange={setPlayerName}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h2 className="text-xl font-bold">Game Modes</h2>
                            <div className="grid gap-4">
                              <Link 
                                to="/battles" 
                                className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                              >
                                <h3 className="text-lg font-bold mb-2">Subreddit Battles</h3>
                                <p className="text-sm text-gray-200">
                                  Join epic word battles between subreddits! Create, play, or spectate live matches.
                                </p>
                              </Link>
                            </div>
                          </div>
                          <Achievements />
                        </div>
                        <div className="mt-6">
                          <Leaderboard />
                        </div>
                      </div>
                    )}
                    
                    {status === 'playing' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        <div className="lg:col-span-2 space-y-4">
                          <GameBoard />
                        </div>
                        <div className="space-y-4">
                          <CommunityChallenge />
                        </div>
                      </div>
                    )}
                    
                    {status === 'ended' && (
                      <div className="space-y-6">
                        <GameOver
                          words={words}
                          onPlayAgain={handlePlayAgain}
                          playerName={playerName}
                          onPlayerNameChange={setPlayerName}
                        />
                        <Leaderboard />
                      </div>
                    )}
                  </>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;