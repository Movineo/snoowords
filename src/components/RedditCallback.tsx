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
      
      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      const isConnected = await redditService.testSupabaseConnection();
      if (!isConnected) {
        console.error('Failed to connect to Supabase');
        toast.error('Database connection failed. Please try again later.');
        navigate('/');
        return;
      }
      console.log('Supabase connection successful');

      // Check if Reddit integration is enabled
      if (!redditService.isEnabled()) {
        console.error('Reddit integration is disabled');
        toast.error('Reddit integration is currently disabled');
        navigate('/');
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      console.log('RedditCallback: Received params:', { 
        code: code ? 'present' : 'missing',
        state: state ? 'present' : 'missing',
        error: error || 'none',
        redirectUri: redditService.getRedirectUri()
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

      // Verify state matches
      const storedState = localStorage.getItem('reddit_auth_state');
      if (!storedState || state !== storedState) {
        console.error('State mismatch:', {
          received: state,
          stored: storedState
        });
        toast.error('Invalid authentication state');
        navigate('/');
        return;
      }

      try {
        console.log('RedditCallback: Exchanging code for token...');
        const userData = await redditService.handleCallback(code, state);
        
        if (!userData) {
          throw new Error('Failed to get user data from Reddit');
        }
        
        console.log('RedditCallback: Token exchange and user data fetch successful');
        setRedditUser(userData);
        toast.success('Successfully logged in with Reddit!');
        localStorage.removeItem('reddit_auth_state'); // Clean up state
      } catch (err) {
        console.error('RedditCallback: Error during authentication:', err);
        toast.error(err instanceof Error ? err.message : 'Failed to complete Reddit login');
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
