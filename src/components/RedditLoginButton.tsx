import React from 'react';
import { redditService } from '../services/redditService';
import { useStore } from '../store/gameStore';
import { toast } from 'react-hot-toast';

export const RedditLoginButton: React.FC = () => {
    const { redditUser } = useStore();

    const handleLogin = () => {
        const authUrl = redditService.getAuthUrl();
        if (!authUrl) {
            toast.error('Reddit login is not available at the moment');
            return;
        }
        window.location.href = authUrl;
    };

    if (redditUser.isAuthenticated) {
        return (
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
                {redditUser.avatar ? (
                    <img
                        src={redditUser.avatar}
                        alt={`${redditUser.name}'s avatar`}
                        className="w-6 h-6 rounded-full"
                    />
                ) : (
                    <img
                        src="https://www.redditstatic.com/avatars/avatar_default_02_FF4500.png"
                        alt="Default Reddit avatar"
                        className="w-6 h-6 rounded-full"
                    />
                )}
                <span className="text-sm font-medium">{redditUser.name}</span>
                <span className="text-xs text-orange-500">{redditUser.karma} karma</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            disabled={!redditService.isEnabled()}
        >
            <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M10 0C4.478 0 0 4.478 0 10c0 5.523 4.478 10 10 10 5.523 0 10-4.477 10-10 0-5.522-4.477-10-10-10zm5.977 11.41c-.1.287-.333.45-.622.45-.128 0-.256-.04-.366-.118-.366-.257-.366-.752-.366-1.274 0-1.147.366-2.207.366-3.354 0-.287-.366-.45-.732-.45-.366 0-.732.163-.732.45 0 1.147.366 2.207.366 3.354 0 .522 0 1.017-.366 1.274-.11.078-.238.118-.366.118-.289 0-.522-.163-.622-.45-.366-1.017-1.098-1.712-2.196-1.712-1.464 0-2.562 1.147-2.562 2.562 0 1.414 1.098 2.562 2.562 2.562 1.098 0 1.83-.695 2.196-1.712.1-.287.333-.45.622-.45.128 0 .256.04.366.118.366.257.366.752.366 1.274 0 1.147-.366 2.207-.366 3.354 0 .287.366.45.732.45.366 0 .732-.163.732-.45 0-1.147-.366-2.207-.366-3.354 0-.522 0-1.017.366-1.274.11-.078.238-.118.366-.118.289 0 .522.163.622.45.366 1.017 1.098 1.712 2.196 1.712 1.464 0 2.562-1.147 2.562-2.562 0-1.414-1.098-2.562-2.562-2.562-1.098 0-1.83.695-2.196 1.712z" />
            </svg>
            <span>{redditService.isEnabled() ? 'Login with Reddit' : 'Reddit Login Unavailable'}</span>
        </button>
    );
};
