import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, ArrowUp, MessageSquare, Eye, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGameStore } from '../store/gameStore';
import { redditService, SubredditBattle as SubredditBattleType } from '../services/redditService';
import { GameBoard } from './GameBoard';
import { BattleSpectator } from './BattleSpectator';
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
      setSelectedBattle(battle);
      setMode('play');
      
      sounds.battleCreate();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success('Battle created! 🎮');
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
    if (!redditUser) {
      toast.error('Please login to join battles');
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

  if (mode === 'play' && selectedBattle) {
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
                onClick={() => {
                  setSelectedBattle(null);
                  setMode('list');
                }}
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

  if (mode === 'spectate' && selectedBattle) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              setSelectedBattle(null);
              setMode('list');
            }}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200 font-medium flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Battles
          </button>
        </div>
        
        <BattleSpectator battleId={selectedBattle.id} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Subreddit Battles</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
          {!redditUser?.isAuthenticated && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg flex items-center gap-3 w-full sm:w-auto">
              <span className="hidden sm:inline text-yellow-800">Login with Reddit to participate</span>
              <span className="sm:hidden text-yellow-800">Login to participate</span>
              <button
                onClick={() => {
                  const authUrl = redditService.getAuthUrl();
                  if (authUrl) {
                    window.location.href = authUrl;
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white rounded-md hover:from-yellow-500 hover:to-amber-500 transition-all shadow-sm whitespace-nowrap font-medium"
              >
                Login
              </button>
            </div>
          )}
          <button
            onClick={handleCreateBattle}
            className={`px-4 py-2 rounded-md w-full sm:w-auto font-medium shadow-sm transition-all ${
              redditUser?.isAuthenticated
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!redditUser?.isAuthenticated}
          >
            Create Battle
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {battles.map(battle => (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      r/{battle.subreddit1} <span className="text-gray-400">vs</span> r/{battle.subreddit2}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>{battle.scores[battle.subreddit1] || 0} vs {battle.scores[battle.subreddit2] || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{(battle.participants[battle.subreddit1]?.length || 0) + (battle.participants[battle.subreddit2]?.length || 0)} players</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Ends {new Date(battle.endTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedBattle(battle);
                        setMode('spectate');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 flex-1 sm:flex-none justify-center transition-all shadow-sm font-medium"
                    >
                      <Eye size={18} />
                      <span className="hidden sm:inline">Spectate</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBattle(battle);
                        setMode('play');
                        handleJoinBattle(battle);
                      }}
                      className={`px-4 py-2 rounded-md flex items-center gap-2 flex-1 sm:flex-none justify-center shadow-sm font-medium transition-all ${
                        redditUser?.isAuthenticated
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!redditUser?.isAuthenticated}
                    >
                      <Users size={18} />
                      <span className="hidden sm:inline">Join Battle</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex justify-between items-center">
                <div className="grid grid-cols-2 gap-8 w-full">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">Team 1</div>
                    <div className="font-bold text-xl text-gray-900">{battle.scores[battle.subreddit1] || 0} points</div>
                    <div className="text-sm text-gray-500">{battle.participants[battle.subreddit1]?.length || 0} players</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">Team 2</div>
                    <div className="font-bold text-xl text-gray-900">{battle.scores[battle.subreddit2] || 0} points</div>
                    <div className="text-sm text-gray-500">{battle.participants[battle.subreddit2]?.length || 0} players</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
