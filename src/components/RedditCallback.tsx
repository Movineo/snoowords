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
      const error = urlParams.get('error');

      if (error) {
        console.error('Reddit OAuth error:', error);
        navigate('/');
        return;
      }

      if (!code) {
        console.error('No code received from Reddit');
        navigate('/');
        return;
      }

      try {
        const userData = await redditService.handleOAuthCallback(code);
        setRedditUser({
          name: userData.name,
          karma: userData.karma,
          isAuthenticated: true,
          achievements: {
            first_post: { unlocked: false, progress: 0 },
            karma_collector: { unlocked: false, progress: 0 },
            award_giver: { unlocked: false, progress: 0 },
            community_leader: { unlocked: false, progress: 0 },
          }
        });
        navigate('/');
      } catch (error) {
        console.error('Failed to handle Reddit callback:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setRedditUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-lg">Connecting to Reddit...</p>
      </div>
    </div>
  );
};
