import React from 'react';
import { RedditLoginButton } from './RedditLoginButton';
import { useStore } from '../store/gameStore';

interface HeaderProps {
    onShowRules?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowRules }) => {
    const { score, karma } = useStore();

    return (
        <header className="bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-orange-500">SnooWords</h1>
                        <button
                            onClick={onShowRules}
                            className="text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            Rules
                        </button>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300">Score:</span>
                            <span className="text-lg font-bold">{score}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300">Karma:</span>
                            <span className="text-lg font-bold text-orange-500">{karma}</span>
                        </div>
                        <RedditLoginButton />
                    </div>
                </div>
            </div>
        </header>
    );
};