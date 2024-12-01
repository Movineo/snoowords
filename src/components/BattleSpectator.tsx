import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Clock, Eye, MessageSquare } from 'lucide-react';
import { supabase } from '../config/supabase';
import { SubredditBattle } from '../services/redditService';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

interface SpectatorProps {
  battleId: string;
}

interface LiveAction {
  id: string;
  type: 'word_found' | 'power_up' | 'achievement' | 'milestone';
  player: string;
  subreddit: string;
  details: string;
  timestamp: string;
  points?: number;
}

interface TeamStats {
  wordCount: number;
  longestWord: string;
  powerUpsUsed: number;
  achievements: string[];
}

export const BattleSpectator: React.FC<SpectatorProps> = ({ battleId }) => {
  const [battle, setBattle] = useState<SubredditBattle | null>(null);
  const [liveActions, setLiveActions] = useState<LiveAction[]>([]);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [teamStats, setTeamStats] = useState<Record<string, TeamStats>>({});

  useEffect(() => {
    loadBattle();
    const channels = subscribeToLiveUpdates();
    const presenceChannel = trackSpectators();

    return () => {
      channels.forEach(channel => channel.unsubscribe());
      presenceChannel.unsubscribe();
    };
  }, [battleId]);

  useEffect(() => {
    if (battle) {
      const timer = setInterval(() => {
        const end = new Date(battle.endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) {
          clearInterval(timer);
          setTimeRemaining('Battle Ended');
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [battle]);

  const initializeTeamStats = () => {
    if (battle) {
      setTeamStats({
        [battle.subreddit1]: {
          wordCount: 0,
          longestWord: '',
          powerUpsUsed: 0,
          achievements: []
        },
        [battle.subreddit2]: {
          wordCount: 0,
          longestWord: '',
          powerUpsUsed: 0,
          achievements: []
        }
      });
    }
  };

  const loadBattle = async () => {
    const { data } = await supabase
      .from('subreddit_battles')
      .select('*')
      .eq('id', battleId)
      .single();
    
    setBattle(data);
    initializeTeamStats();
  };

  const updateTeamStats = (action: LiveAction) => {
    setTeamStats(prev => {
      const stats = { ...prev };
      const team = stats[action.subreddit];
      
      if (team) {
        switch (action.type) {
          case 'word_found':
            team.wordCount++;
            if (action.details.length > team.longestWord.length) {
              team.longestWord = action.details;
            }
            break;
          case 'power_up':
            team.powerUpsUsed++;
            break;
          case 'achievement':
            if (!team.achievements.includes(action.details)) {
              team.achievements.push(action.details);
            }
            break;
        }
      }
      
      return stats;
    });
  };

  const subscribeToLiveUpdates = () => {
    const battleChannel = supabase
      .channel(`battle:${battleId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'subreddit_battles',
        filter: `id=eq.${battleId}`
      }, (payload) => {
        setBattle(payload.new as SubredditBattle);
      })
      .subscribe();

    const actionsChannel = supabase
      .channel(`battle_actions:${battleId}`)
      .on('broadcast', { event: 'action' }, (payload) => {
        const action = payload.payload as LiveAction;
        setLiveActions(prev => [action, ...prev].slice(0, 50));
        updateTeamStats(action);

        // Play appropriate sound effect for each action type
        switch (action.type) {
          case 'word_found':
            sounds.wordFound();
            break;
          case 'power_up':
            sounds.powerUp();
            break;
          case 'achievement':
            sounds.achievement();
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            break;
          case 'milestone':
            sounds.milestone();
            confetti({
              particleCount: 50,
              spread: 45,
              origin: { y: 0.7 }
            });
            break;
        }
      })
      .subscribe();

    return [battleChannel, actionsChannel];
  };

  const trackSpectators = () => {
    const presence = supabase.channel('spectators');
    
    presence.on('presence', { event: 'sync' }, () => {
      const presenceState = presence.presenceState();
      const count = Object.keys(presenceState).length;
      setSpectatorCount(count);
    }).subscribe();

    // Track this spectator
    presence.track({ user: 'spectator', time: new Date().toISOString() });

    return presence;
  };

  if (!battle) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Battle Status Bar */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${battle?.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="font-bold text-lg">
            {battle?.status === 'active' ? 'Battle in Progress' : battle?.status}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-xl font-mono bg-gray-700/50 px-3 py-1 rounded-lg">{timeRemaining}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <span className="text-sm">
              {spectatorCount} {spectatorCount === 1 ? 'spectator' : 'spectators'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Team 1 */}
        <div className="space-y-4">
          <motion.div 
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden"
            animate={{ 
              scale: battle?.scores[battle.subreddit1] > battle?.scores[battle.subreddit2] ? 1.02 : 1,
              boxShadow: battle?.scores[battle.subreddit1] > battle?.scores[battle.subreddit2] 
                ? '0 4px 20px rgba(59, 130, 246, 0.5)' 
                : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                r/{battle?.subreddit1}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{battle?.scores[battle?.subreddit1]}</div>
                    <div className="text-sm text-blue-200">points</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {teamStats[battle?.subreddit1] && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-200">Words Found</span>
                        <span className="font-bold">{teamStats[battle?.subreddit1].wordCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-200">Longest Word</span>
                        <span className="font-bold truncate ml-2">{teamStats[battle?.subreddit1].longestWord}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-200">Power-ups Used</span>
                        <span className="font-bold">{teamStats[battle?.subreddit1].powerUpsUsed}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-200">Players</span>
                        <span className="font-bold">{battle?.participants[battle?.subreddit1]?.length || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-br from-blue-600/50 to-indigo-700/50 backdrop-blur-sm">
              <div className="text-sm text-blue-100">
                Team Progress
                <div className="mt-2 h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, (battle?.scores[battle.subreddit1] / 1000) * 100)}%` 
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Column - Live Feed */}
        <div className="lg:col-span-1 space-y-4 order-first lg:order-none">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-800">Live Battle Feed</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <AnimatePresence>
                  {liveActions.map(action => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-3 rounded-lg border ${
                        action.type === 'achievement' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
                        action.type === 'power_up' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' :
                        'bg-gradient-to-r from-gray-50 to-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {action.type === 'word_found' && <Star size={16} className="text-yellow-500 shrink-0" />}
                        {action.type === 'power_up' && <Trophy size={16} className="text-purple-500 shrink-0" />}
                        {action.type === 'achievement' && <Trophy size={16} className="text-amber-500 shrink-0" />}
                        <span className="font-semibold truncate">{action.player}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 truncate">r/{action.subreddit}</span>
                        {action.points && (
                          <span className="ml-auto text-green-500 font-semibold shrink-0">+{action.points}</span>
                        )}
                      </div>
                      <p className="mt-1.5 text-gray-600 break-words text-sm">{action.details}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Team 2 */}
        <div className="space-y-4">
          <motion.div 
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg overflow-hidden"
            animate={{ 
              scale: battle?.scores[battle.subreddit2] > battle?.scores[battle.subreddit1] ? 1.02 : 1,
              boxShadow: battle?.scores[battle.subreddit2] > battle?.scores[battle.subreddit1] 
                ? '0 4px 20px rgba(168, 85, 247, 0.5)' 
                : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                r/{battle?.subreddit2}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{battle?.scores[battle?.subreddit2]}</div>
                    <div className="text-sm text-purple-200">points</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {teamStats[battle?.subreddit2] && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-200">Words Found</span>
                        <span className="font-bold">{teamStats[battle?.subreddit2].wordCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-200">Longest Word</span>
                        <span className="font-bold truncate ml-2">{teamStats[battle?.subreddit2].longestWord}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-200">Power-ups Used</span>
                        <span className="font-bold">{teamStats[battle?.subreddit2].powerUpsUsed}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-200">Players</span>
                        <span className="font-bold">{battle?.participants[battle?.subreddit2]?.length || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-br from-purple-600/50 to-pink-700/50 backdrop-blur-sm">
              <div className="text-sm text-purple-100">
                Team Progress
                <div className="mt-2 h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-300 to-pink-300 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, (battle?.scores[battle.subreddit2] / 1000) * 100)}%` 
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
