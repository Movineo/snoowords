import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useStore } from '../store/gameStore';
import { REDDIT_CONFIG, REDDIT_ENDPOINTS } from '../config/reddit';

export const RedditCallback = () => {
  const navigate = useNavigate();
  const { setRedditUser } = useStore();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const storedState = localStorage.getItem('reddit_auth_state');

      if (!code || !state || state !== storedState) {
        console.error('Invalid state or missing code');
        navigate('/');
        return;
      }

      try {
        console.log('Exchanging code for tokens...');
        // Exchange code for tokens
        const response = await fetch(REDDIT_ENDPOINTS.ACCESS_TOKEN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(`${REDDIT_CONFIG.CLIENT_ID}:${REDDIT_CONFIG.CLIENT_SECRET}`)}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDDIT_CONFIG.REDIRECT_URI,
          }).toString(),
        });

        const tokens = await response.json();
        console.log('Token response:', { ok: response.ok, status: response.status });

        if (!response.ok) {
          throw new Error(tokens.error || 'Failed to get access token');
        }

        console.log('Getting user info...');
        // Get user info
        const userResponse = await fetch(REDDIT_ENDPOINTS.ME, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'User-Agent': 'SnooWords/1.0',
          },
        });

        const userData = await userResponse.json();
        console.log('User response:', { ok: userResponse.ok, status: userResponse.status });

        if (!userResponse.ok) {
          throw new Error('Failed to get user data');
        }

        console.log('Storing user data in Supabase...');
        // Store user data in Supabase
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('reddit_users')
          .upsert({
            username: userData.name,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            karma: userData.total_karma,
            avatar_url: userData.icon_img,
            last_login: new Date().toISOString(),
          })
          .select()
          .single();

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          throw new Error(`Failed to store user data: ${supabaseError.message}`);
        }

        console.log('Updating app state...');
        // Update app state
        setRedditUser({
          isAuthenticated: true,
          name: userData.name,
          karma: userData.total_karma,
          avatar: userData.icon_img,
          achievements: {}, // Initialize with empty achievements
        });

        // Clean up
        localStorage.removeItem('reddit_auth_state');

        console.log('Redirecting to game...');
        // Redirect to game
        navigate('/');
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setRedditUser]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Logging you in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    </div>
  );
};
