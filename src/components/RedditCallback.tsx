import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/gameStore';
import { redditService } from '../services/redditService';

export const RedditCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setRedditUser } = useStore();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        console.error('Reddit OAuth error:', error);
        navigate('/');
        return;
      }

      if (!code || !state) {
        console.error('Missing code or state from Reddit');
        navigate('/');
        return;
      }

      try {
        // Handle the callback using redditService
        const success = await redditService.handleCallback(code, state);
        if (success) {
          // Get user data
          const userData = await redditService.getUserData();
          if (userData) {
            setRedditUser({
              name: userData.name,
              karma: userData.karma,
              isAuthenticated: true,
              avatar: userData.avatar,
              trophies: userData.trophies || 0,
              achievements: {
                first_post: { unlocked: false, progress: 0 },
                karma_collector: { unlocked: false, progress: 0 },
                award_giver: { unlocked: false, progress: 0 },
                community_leader: { unlocked: false, progress: 0 },
              }
            });
          }
        }
        navigate('/');
      } catch (error) {
        console.error('Failed to handle Reddit callback:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setRedditUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-white text-xl">
        Logging you in...
      </div>
    </div>
  );
};
