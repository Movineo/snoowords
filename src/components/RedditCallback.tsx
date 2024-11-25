import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/gameStore';
import { redditService } from '../services/redditService';
import { toast } from 'react-hot-toast';

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
        toast.error(`Reddit login failed: ${error}`);
        navigate('/');
        return;
      }

      if (!code || !state) {
        console.error('Missing code or state from Reddit');
        toast.error('Invalid Reddit response');
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
            toast.success(`Welcome back, ${userData.name}!`);
          } else {
            toast.error('Failed to get user data');
          }
        } else {
          toast.error('Reddit login failed');
        }
      } catch (error) {
        console.error('Error during Reddit callback:', error);
        toast.error('Reddit login failed');
      } finally {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setRedditUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-lg">Logging in with Reddit...</p>
      </div>
    </div>
  );
};
