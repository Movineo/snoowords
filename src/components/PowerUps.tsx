import React from 'react';
import { Clock, Award, Star, TrendingUp, Gift, Shield } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { toast } from 'react-hot-toast';

type PowerUpId = 'timeFreeze' | 'wordHint' | 'scoreBooster' | 'shieldProtection';

interface PowerUp {
    id: PowerUpId;
    name: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    karmaRequired: number;
    cooldown: number; // in seconds
}

export const PowerUps = () => {
    const { activatePowerUp, redditUser, powerUps } = useGameStore();

    const powerUpsList: PowerUp[] = [
        {
            id: 'timeFreeze',
            name: 'Time Freeze',
            description: 'Freezes the timer for 15 seconds',
            icon: Clock,
            color: 'text-blue-400',
            karmaRequired: 50,
            cooldown: 30
        },
        {
            id: 'wordHint',
            name: 'Word Hint',
            description: 'Reveals a possible word',
            icon: Star,
            color: 'text-yellow-400',
            karmaRequired: 100,
            cooldown: 45
        },
        {
            id: 'scoreBooster',
            name: 'Score Booster',
            description: '2x points for 15 seconds',
            icon: TrendingUp,
            color: 'text-green-400',
            karmaRequired: 75,
            cooldown: 30
        },
        {
            id: 'shieldProtection',
            name: 'Shield',
            description: 'Protects against time penalties',
            icon: Shield,
            color: 'text-purple-400',
            karmaRequired: 150,
            cooldown: 60
        }
    ];

    const handlePowerUp = (powerUp: PowerUp) => {
        if (!redditUser?.isAuthenticated) {
            toast.error('Login with Reddit to use power-ups!');
            return;
        }

        if ((redditUser?.karma || 0) < powerUp.karmaRequired) {
            toast.error(`Not enough karma! Need ${powerUp.karmaRequired} karma.`);
            return;
        }

        if (powerUps[powerUp.id] && powerUps[powerUp.id].active) {
            toast.error('Power-up already active!');
            return;
        }

        activatePowerUp(powerUp.id);
        toast.success(`${powerUp.name} activated!`);
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {powerUpsList.map((powerUp) => {
                const Icon = powerUp.icon;
                const isActive = powerUps[powerUp.id] && powerUps[powerUp.id].active;
                const canAfford = (redditUser?.karma || 0) >= powerUp.karmaRequired;
                const isAuthenticated = redditUser?.isAuthenticated || false;

                return (
                    <button
                        key={powerUp.id}
                        onClick={() => handlePowerUp(powerUp)}
                        disabled={!canAfford || isActive || !isAuthenticated}
                        className={`
                            relative p-3 rounded-lg border transition-all duration-200
                            ${isActive ? 'bg-gray-700 border-gray-600' : 'bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50'}
                            ${canAfford ? 'border-gray-600' : 'border-red-500/50'}
                            ${isAuthenticated ? '' : 'opacity-50 cursor-not-allowed'}
                        `}
                        title={!isAuthenticated ? 'Login to use power-ups' : !canAfford ? `Need ${powerUp.karmaRequired} karma` : powerUp.description}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Icon className={`w-6 h-6 ${powerUp.color}`} />
                            <div className="text-sm font-medium">{powerUp.name}</div>
                            <div className="text-xs text-gray-400">{powerUp.karmaRequired} karma</div>
                        </div>
                        {isActive && (
                            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <div className="text-sm font-medium text-gray-300">Active</div>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};