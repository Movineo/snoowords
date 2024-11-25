import React, { useEffect, useState } from 'react';
import { Trophy, Users, TrendingUp, Clock } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { redditService } from '../services/redditService';

interface ChallengeStats {
    participants: number;
    avgScore: number;
    timeLeft: string;
}

export const CommunityChallenge: React.FC = () => {
    const { currentChallenge, redditUser } = useStore();
    const [stats, setStats] = useState<ChallengeStats>({
        participants: 0,
        avgScore: 0,
        timeLeft: ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (currentChallenge && redditUser.isAuthenticated) {
                try {
                    const subredditInfo = await redditService.getSubredditInfo();
                    // In a real app, we'd get this from the subreddit's challenge post
                    setStats({
                        participants: subredditInfo.subscribers || 0,
                        avgScore: Math.floor(Math.random() * 1000),
                        timeLeft: '2h 30m'
                    });
                } catch (error) {
                    console.error('Failed to fetch challenge stats:', error);
                }
            }
        };

        fetchStats();
    }, [currentChallenge, redditUser.isAuthenticated]);

    if (!currentChallenge || !redditUser.isAuthenticated) {
        return null;
    }

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

            <div className="grid grid-cols-3 gap-4">
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
                    <div className="text-xl font-bold">{stats.timeLeft}</div>
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-400">
                Top 3 players will receive special Reddit awards!
            </div>
        </div>
    );
};
