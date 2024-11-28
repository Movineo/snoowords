import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Star } from 'lucide-react';
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
    subscribeToLiveUpdates();
    trackSpectators();
    initializeTeamStats();

    return () => {
      supabase.removeAllChannels();
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
  };

  if (!battle) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Battle Status Bar */}
      <div className="bg-gray-800 text-white p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <span className="font-bold text-base sm:text-lg order-1 sm:order-none">
          {battle?.status === 'active' ? 'Battle in Progress' : battle?.status}
        </span>
        <span className="text-lg sm:text-xl font-mono order-2 sm:order-none">{timeRemaining}</span>
        <span className="text-xs sm:text-sm order-3 sm:order-none">
          {spectatorCount} {spectatorCount === 1 ? 'spectator' : 'spectators'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Team 1 */}
        <div className="space-y-4">
          <motion.div 
            className="p-3 sm:p-4 bg-blue-100 rounded-lg"
            animate={{ scale: battle?.scores[battle.subreddit1] > battle?.scores[battle.subreddit2] ? 1.02 : 1 }}
          >
            <h3 className="text-lg sm:text-xl font-bold">r/{battle?.subreddit1}</h3>
            <p className="text-2xl sm:text-3xl font-bold">{battle?.scores[battle?.subreddit1]} points</p>
            <div className="mt-2 space-y-1 text-xs sm:text-sm">
              <p className="flex items-center gap-2">
                <Users size={16} />
                {battle?.participants[battle?.subreddit1]?.length || 0} players
              </p>
              {teamStats[battle?.subreddit1] && (
                <>
                  <p>Words Found: {teamStats[battle?.subreddit1].wordCount}</p>
                  <p className="truncate">
                    Longest Word: {teamStats[battle?.subreddit1].longestWord}
                  </p>
                  <p>Power-ups: {teamStats[battle?.subreddit1].powerUpsUsed}</p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Middle Column - Live Feed */}
        <div className="lg:col-span-1 space-y-4 order-first lg:order-none">
          <div className="p-3 sm:p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-4 text-base sm:text-lg">Live Battle Feed</h3>
            <div className="space-y-2 max-h-[50vh] lg:max-h-96 overflow-y-auto">
              <AnimatePresence>
                {liveActions.map(action => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-2 sm:p-3 ${
                      action.type === 'achievement' ? 'bg-yellow-50' :
                      action.type === 'power_up' ? 'bg-purple-50' :
                      'bg-white'
                    } rounded-md text-xs sm:text-sm border border-gray-200`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {action.type === 'word_found' && <Star size={14} className="text-yellow-500 shrink-0" />}
                      {action.type === 'power_up' && <Trophy size={14} className="text-purple-500 shrink-0" />}
                      {action.type === 'achievement' && <Trophy size={14} className="text-gold-500 shrink-0" />}
                      <span className="font-bold truncate">{action.player}</span>
                      <span className="text-gray-500">•</span>
                      <span className="truncate">r/{action.subreddit}</span>
                      {action.points && (
                        <span className="ml-auto text-green-500 shrink-0">+{action.points}</span>
                      )}
                    </div>
                    <p className="mt-1 break-words">{action.details}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column - Team 2 */}
        <div className="space-y-4">
          <motion.div 
            className="p-3 sm:p-4 bg-red-100 rounded-lg"
            animate={{ scale: battle?.scores[battle.subreddit2] > battle?.scores[battle.subreddit1] ? 1.02 : 1 }}
          >
            <h3 className="text-lg sm:text-xl font-bold">r/{battle?.subreddit2}</h3>
            <p className="text-2xl sm:text-3xl font-bold">{battle?.scores[battle?.subreddit2]} points</p>
            <div className="mt-2 space-y-1 text-xs sm:text-sm">
              <p className="flex items-center gap-2">
                <Users size={16} />
                {battle?.participants[battle?.subreddit2]?.length || 0} players
              </p>
              {teamStats[battle?.subreddit2] && (
                <>
                  <p>Words Found: {teamStats[battle?.subreddit2].wordCount}</p>
                  <p className="truncate">
                    Longest Word: {teamStats[battle?.subreddit2].longestWord}
                  </p>
                  <p>Power-ups: {teamStats[battle?.subreddit2].powerUpsUsed}</p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
