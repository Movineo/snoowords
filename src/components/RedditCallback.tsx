import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { redditService } from '../services/redditService';
import { toast } from 'react-hot-toast';

export const RedditCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setRedditUser } = useGameStore();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('RedditCallback: Starting OAuth callback handling');
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      console.log('RedditCallback: Received params:', { 
        code: code ? 'present' : 'missing',
        state: state ? 'present' : 'missing',
        error: error || 'none'
      });

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
        console.log('RedditCallback: Exchanging code for token...');
        const userData = await redditService.handleCallback(code, state);
        console.log('RedditCallback: Token exchange successful');
        
        if (userData) {
          console.log('RedditCallback: Setting user data');
          setRedditUser(userData);
          toast.success('Successfully logged in with Reddit!');
        } else {
          toast.error('Failed to get user data');
        }
      } catch (err) {
        console.error('RedditCallback: Error during token exchange:', err);
        toast.error('Failed to complete Reddit login');
      }

      navigate('/');
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
