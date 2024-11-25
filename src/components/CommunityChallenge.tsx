import React, { useEffect, useState } from 'react';
import { Trophy, Users, TrendingUp, Clock, Award } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { challengeService } from '../services/challengeService';
import { formatDistanceToNow } from 'date-fns';

interface ChallengeStats {
    participants: number;
    avgScore: number;
    topScores: { username: string; score: number }[];
}

export const CommunityChallenge: React.FC = () => {
    const { currentChallenge, redditUser } = useStore();
    const [stats, setStats] = useState<ChallengeStats>({
        participants: 0,
        avgScore: 0,
        topScores: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (currentChallenge && redditUser.isAuthenticated) {
                try {
                    const challengeStats = await challengeService.getChallengeStats(currentChallenge.id);
                    if (challengeStats) {
                        setStats(challengeStats);
                    }
                } catch (error) {
                    console.error('Failed to fetch challenge stats:', error);
                }
            }
        };

        fetchStats();
        // Refresh stats every minute
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [currentChallenge, redditUser.isAuthenticated]);

    if (!currentChallenge || !redditUser.isAuthenticated) {
        return null;
    }

    const timeLeft = formatDistanceToNow(new Date(currentChallenge.end_date), { addSuffix: true });

    return (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Daily Community Challenge</h3>
            </div>

            <div className="mb-4">
                <h4 className="text-xl font-bold mb-2">{currentChallenge.title}</h4>
                <p className="text-gray-400">{currentChallenge.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Participants</span>
                    </div>
                    <div className="text-xl font-bold">{stats.participants}</div>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Avg Score</span>
                    </div>
                    <div className="text-xl font-bold">{stats.avgScore}</div>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Time Left</span>
                    </div>
                    <div className="text-xl font-bold">{timeLeft}</div>
                </div>
            </div>

            {stats.topScores.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <h4 className="font-semibold">Top Players</h4>
                    </div>
                    <div className="space-y-2">
                        {stats.topScores.map((score, index) => (
                            <div key={score.username} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full ${
                                        index === 0 ? 'bg-yellow-500' :
                                        index === 1 ? 'bg-gray-400' :
                                        'bg-yellow-800'
                                    }`}>
                                        {index + 1}
                                    </span>
                                    <span>{score.username}</span>
                                </div>
                                <span className="font-bold">{score.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="text-sm text-gray-400">
                Top 3 players will receive special Reddit awards when the challenge ends!
            </div>
        </div>
    );
};
