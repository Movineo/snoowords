import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, ArrowUp, MessageSquare, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGameStore } from '../store/gameStore';
import { redditService, SubredditBattle as SubredditBattleType } from '../services/redditService';
import { GameBoard } from './GameBoard';
import confetti from 'canvas-confetti';
import { supabase } from '../config/supabase';
import { sounds } from '../utils/soundEffects';

export const SubredditBattle: React.FC = () => {
  const { redditUser } = useGameStore();
  const [battles, setBattles] = useState<SubredditBattleType[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<SubredditBattleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'play' | 'spectate'>('list');

  const getScoreDifference = (battle: SubredditBattleType, subreddit: string) => {
    const score1 = battle.scores[battle.subreddit1] || 0;
    const score2 = battle.scores[battle.subreddit2] || 0;
    return subreddit === battle.subreddit1 ? score1 - score2 : score2 - score1;
  };

  const getScoreColor = (difference: number) => {
    if (difference > 0) return 'text-green-500';
    if (difference < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    try {
      const { data } = await supabase
        .from('subreddit_battles')
        .select('*')
        .order('created_at', { ascending: false });
      
      setBattles(data || []);
    } catch (error) {
      console.error('Error loading battles:', error);
      toast.error('Failed to load battles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBattle = async () => {
    if (!redditUser?.isAuthenticated) {
      toast.error('Please login with Reddit first to create a battle');
      return;
    }

    const subreddit1 = prompt('Enter first subreddit (without r/):');
    const subreddit2 = prompt('Enter second subreddit (without r/):');
    
    if (!subreddit1 || !subreddit2) return;

    try {
      setLoading(true);
      const battle = await redditService.createSubredditBattle(subreddit1, subreddit2);
      setBattles([battle, ...battles]);
      toast.success('Battle created! 🎮');
      
      sounds.battleCreate();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Error creating battle:', error);
      if (error instanceof Error && error.message.includes('Not authenticated')) {
        toast.error('Please login with Reddit first');
      } else {
        toast.error('Failed to create battle. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBattle = async (battle: SubredditBattleType) => {
    if (!redditUser?.isAuthenticated) {
      toast.error('Please login with Reddit first to join a battle');
      return;
    }

    try {
      const subreddit = prompt(`Which team do you want to join? (${battle.subreddit1} or ${battle.subreddit2})`);
      if (!subreddit || ![battle.subreddit1, battle.subreddit2].includes(subreddit)) {
        toast.error('Invalid subreddit selection');
        return;
      }

      await redditService.joinBattle(battle.id, redditUser.id, subreddit);
      setSelectedBattle(battle);
      setMode('play');
      
      sounds.battleJoin();
      toast.success(`Joined team r/${subreddit}! 🎮`);
    } catch (error) {
      console.error('Error joining battle:', error);
      toast.error('Failed to join battle');
    }
  };

  const handleScoreSubmit = async (score: number, words: string[]) => {
    if (!selectedBattle || !redditUser) return;

    try {
      await redditService.submitBattleScore(selectedBattle.id, {
        userId: redditUser.id,
        subreddit: selectedBattle.subreddit1, // TODO: Use actual selected subreddit
        score,
        words
      });

      toast.success('Score submitted! 🎯');
      loadBattles(); // Refresh battles
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error('Failed to submit score');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (selectedBattle) {
    return (
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key="selected-battle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                r/{selectedBattle.subreddit1} vs r/{selectedBattle.subreddit2}
              </h2>
              <button
                onClick={() => setSelectedBattle(null)}
                className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Back to Battles
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-blue-100 rounded-lg">
                <h3 className="font-bold">r/{selectedBattle.subreddit1}</h3>
                <p className="text-2xl flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {selectedBattle.scores[selectedBattle.subreddit1]} points
                  {getScoreDifference(selectedBattle, selectedBattle.subreddit1) !== 0 && (
                    <span className={getScoreColor(getScoreDifference(selectedBattle, selectedBattle.subreddit1))}>
                      <ArrowUp 
                        className={`w-4 h-4 ${getScoreDifference(selectedBattle, selectedBattle.subreddit1) < 0 ? 'rotate-180' : ''}`}
                      />
                      {Math.abs(getScoreDifference(selectedBattle, selectedBattle.subreddit1))}
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {selectedBattle.participants[selectedBattle.subreddit1]?.length || 0} players
                </p>
              </div>
              <div className="p-4 bg-red-100 rounded-lg">
                <h3 className="font-bold">r/{selectedBattle.subreddit2}</h3>
                <p className="text-2xl flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {selectedBattle.scores[selectedBattle.subreddit2]} points
                  {getScoreDifference(selectedBattle, selectedBattle.subreddit2) !== 0 && (
                    <span className={getScoreColor(getScoreDifference(selectedBattle, selectedBattle.subreddit2))}>
                      <ArrowUp 
                        className={`w-4 h-4 ${getScoreDifference(selectedBattle, selectedBattle.subreddit2) < 0 ? 'rotate-180' : ''}`}
                      />
                      {Math.abs(getScoreDifference(selectedBattle, selectedBattle.subreddit2))}
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {selectedBattle.participants[selectedBattle.subreddit2]?.length || 0} players
                </p>
              </div>
            </div>

            <GameBoard
              wordPack={selectedBattle.wordPack}
              onGameComplete={handleScoreSubmit}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Subreddit Battles</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
          {!redditUser?.isAuthenticated && (
            <div className="bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base">
              <span className="hidden sm:inline">Login with Reddit to participate</span>
              <span className="sm:hidden">Login to participate</span>
              <button
                onClick={() => redditService.getAuthUrl()}
                className="px-3 py-1 bg-yellow-200 rounded-md hover:bg-yellow-300 transition-colors whitespace-nowrap"
              >
                Login
              </button>
            </div>
          )}
          <button
            onClick={handleCreateBattle}
            className={`px-3 sm:px-4 py-2 rounded-md w-full sm:w-auto ${
              redditUser?.isAuthenticated
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            disabled={!redditUser?.isAuthenticated}
          >
            Create Battle
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {battles.map(battle => (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-3 sm:p-4 bg-white rounded-lg shadow-md"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg sm:text-xl font-bold">
                  r/{battle.subreddit1} vs r/{battle.subreddit2}
                </h3>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedBattle(battle);
                      setMode('spectate');
                    }}
                    className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center gap-2 flex-1 sm:flex-none justify-center sm:justify-start"
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline">Spectate</span>
                  </button>
                  <button
                    onClick={() => handleJoinBattle(battle)}
                    className={`px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 flex-1 sm:flex-none justify-center sm:justify-start ${
                      redditUser?.isAuthenticated
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                    disabled={!redditUser?.isAuthenticated}
                  >
                    <Users size={16} />
                    <span className="hidden sm:inline">Join Battle</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <p className="font-bold text-sm sm:text-base">Team 1</p>
                  <p className="flex items-center gap-2 text-sm sm:text-base">
                    <Trophy className="w-4 h-4" />
                    {battle.scores[battle.subreddit1]} points
                    {getScoreDifference(battle, battle.subreddit1) !== 0 && (
                      <span className={getScoreColor(getScoreDifference(battle, battle.subreddit1))}>
                        <ArrowUp 
                          className={`w-3 h-3 ${getScoreDifference(battle, battle.subreddit1) < 0 ? 'rotate-180' : ''}`}
                        />
                        {Math.abs(getScoreDifference(battle, battle.subreddit1))}
                      </span>
                    )}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    {battle.participants[battle.subreddit1]?.length || 0} players
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-sm sm:text-base">Team 2</p>
                  <p className="flex items-center gap-2 text-sm sm:text-base">
                    <Trophy className="w-4 h-4" />
                    {battle.scores[battle.subreddit2]} points
                    {getScoreDifference(battle, battle.subreddit2) !== 0 && (
                      <span className={getScoreColor(getScoreDifference(battle, battle.subreddit2))}>
                        <ArrowUp 
                          className={`w-3 h-3 ${getScoreDifference(battle, battle.subreddit2) < 0 ? 'rotate-180' : ''}`}
                        />
                        {Math.abs(getScoreDifference(battle, battle.subreddit2))}
                      </span>
                    )}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    {battle.participants[battle.subreddit2]?.length || 0} players
                  </p>
                </div>
              </div>

              <div className="mt-4 text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <p>Ends in: {new Date(battle.endTime).toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
