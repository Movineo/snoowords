import React from 'react';
import { useStore } from '../store/gameStore';
import { REDDIT_AWARDS } from '../config/reddit';
import { toast } from 'react-hot-toast';

export const RedditAwards: React.FC = () => {
    const { redditUser, karma, updateKarma } = useStore();

    const handleAward = (awardKey: keyof typeof REDDIT_AWARDS) => {
        const award = REDDIT_AWARDS[awardKey];
        
        if (!redditUser.isAuthenticated) {
            toast.error('Login with Reddit to give awards!');
            return;
        }

        if (karma < award.cost) {
            toast.error(`Not enough karma! Need ${award.cost} karma.`);
            return;
        }

        // Deduct karma and give award
        updateKarma(-award.cost);
        toast.success(`${award.name} awarded! -${award.cost} karma`);
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Reddit Awards</h3>
            <div className="grid grid-cols-3 gap-3">
                {Object.entries(REDDIT_AWARDS).map(([key, award]) => (
                    <button
                        key={key}
                        onClick={() => handleAward(key as keyof typeof REDDIT_AWARDS)}
                        disabled={!redditUser.isAuthenticated || karma < award.cost}
                        className={`
                            p-3 rounded-lg text-center transition-all transform hover:scale-105
                            ${!redditUser.isAuthenticated ? 'bg-gray-700 cursor-not-allowed' :
                              karma >= award.cost ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-700 cursor-not-allowed'}
                        `}
                        title={`Award ${award.name}`}
                    >
                        <div className="text-2xl mb-1">{award.icon}</div>
                        <div className="text-sm font-medium mb-1">{award.name}</div>
                        <div className={`text-xs ${karma >= award.cost ? 'text-green-400' : 'text-red-400'}`}>
                            {award.cost} karma
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
