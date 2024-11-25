import React from 'react';
import { Clock, Award, Star, TrendingUp, Gift } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { toast } from 'react-hot-toast';

type PowerUpId = 'timeAward' | 'doubleKarma' | 'karmaBoost' | 'awardsMultiplier' | 'redditGold';

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
    const { activatePowerUp, redditUser, powerUps } = useStore();

    const powerUpsList: PowerUp[] = [
        {
            id: 'timeAward',
            name: 'Time Award',
            description: 'Adds 15 seconds to the clock',
            icon: Clock,
            color: 'text-blue-400',
            karmaRequired: 50,
            cooldown: 30
        },
        {
            id: 'doubleKarma',
            name: 'Double Karma',
            description: '2x karma for 15 seconds',
            icon: Star,
            color: 'text-yellow-400',
            karmaRequired: 100,
            cooldown: 45
        },
        {
            id: 'karmaBoost',
            name: 'Karma Boost',
            description: 'Bonus karma for themed words',
            icon: TrendingUp,
            color: 'text-green-400',
            karmaRequired: 75,
            cooldown: 30
        },
        {
            id: 'awardsMultiplier',
            name: 'Awards Multiplier',
            description: 'Increases award chances',
            icon: Award,
            color: 'text-purple-400',
            karmaRequired: 150,
            cooldown: 60
        },
        {
            id: 'redditGold',
            name: 'Reddit Gold',
            description: 'All bonuses for 10 seconds',
            icon: Gift,
            color: 'text-yellow-500',
            karmaRequired: 200,
            cooldown: 90
        }
    ];

    const handlePowerUp = (powerUp: PowerUp) => {
        if (!redditUser.isAuthenticated) {
            toast.error('Login with Reddit to use power-ups!');
            return;
        }

        if (redditUser.karma < powerUp.karmaRequired) {
            toast.error(`Not enough karma! Need ${powerUp.karmaRequired} karma.`);
            return;
        }

        if (powerUps[powerUp.id]) {
            toast.error('Power-up already active!');
            return;
        }

        activatePowerUp(powerUp.id);
        toast.success(`${powerUp.name} activated!`);
    };

    return (
        <div className="grid grid-cols-5 gap-3 mb-6">
            {powerUpsList.map((powerUp) => {
                const Icon = powerUp.icon;
                const isActive = powerUps[powerUp.id];
                const canAfford = redditUser.karma >= powerUp.karmaRequired;
                const isAuthenticated = redditUser.isAuthenticated;

                return (
                    <button
                        key={powerUp.id}
                        onClick={() => handlePowerUp(powerUp)}
                        disabled={isActive || !canAfford || !isAuthenticated}
                        className={`
                            relative p-3 rounded-lg transition-all transform hover:scale-105
                            ${isActive ? 'bg-gray-700 cursor-not-allowed' : 
                              !isAuthenticated ? 'bg-gray-800 cursor-not-allowed' :
                              canAfford ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-800 cursor-not-allowed'}
                        `}
                        title={powerUp.description}
                    >
                        <Icon className={`w-6 h-6 ${powerUp.color} mx-auto mb-1 ${!canAfford && 'opacity-50'}`} />
                        <div className="text-xs font-semibold text-center mb-1">{powerUp.name}</div>
                        <div className={`text-xs text-center ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                            {powerUp.karmaRequired} karma
                        </div>
                        {isActive && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-white">ACTIVE</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};