import { supabase } from "../config/supabase";

interface RedditAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface RedditUserData {
  name: string;
  karma: number;
  avatar: string | null;
  trophies: number;
}

class RedditService {
  private clientId = import.meta.env.VITE_REDDIT_CLIENT_ID;
  private clientSecret = import.meta.env.VITE_REDDIT_CLIENT_SECRET;
  private redirectUri = import.meta.env.VITE_REDDIT_REDIRECT_URI;
  private enableRedditIntegration = import.meta.env.VITE_ENABLE_REDDIT_INTEGRATION === 'true';

  public getAuthUrl(): string {
    if (!this.enableRedditIntegration) {
      console.warn('Reddit integration is disabled');
      return '';
    }

    const state = crypto.randomUUID();
    localStorage.setItem('reddit_auth_state', state);
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      state,
      redirect_uri: this.redirectUri,
      duration: 'permanent',
      scope: 'identity read submit'
    });

    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
  }

  public async handleCallback(code: string, state: string): Promise<boolean> {
    if (!this.enableRedditIntegration) {
      console.warn('Reddit integration is disabled');
      return false;
    }

    const storedState = localStorage.getItem('reddit_auth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    try {
      const tokenResponse = await this.getAccessToken(code);
      if (!tokenResponse) return false;

      const { access_token, refresh_token } = tokenResponse;
      
      // Get user data before storing tokens
      const userData = await this.fetchUserData(access_token);
      if (!userData) return false;

      // Store tokens and user data in Supabase
      const { error } = await supabase
        .from('reddit_users')
        .upsert([
          {
            username: userData.name,
            access_token,
            refresh_token,
            karma: userData.karma,
            avatar_url: userData.avatar,
            last_login: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error storing user data:', error);
        return false;
      }

      // Store user info in localStorage for quick access
      localStorage.setItem('reddit_user', JSON.stringify({
        username: userData.name,
        karma: userData.karma,
        avatar: userData.avatar
      }));

      return true;
    } catch (error) {
      console.error('Error during Reddit authentication:', error);
      return false;
    }
  }

  private async getAccessToken(code: string): Promise<RedditAuthResponse | null> {
    if (!this.clientId || !this.clientSecret) {
      console.error('Reddit client credentials not configured');
      return null;
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri
    });

    try {
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: params
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Reddit token error:', errorData);
        throw new Error('Failed to get access token');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private async fetchUserData(accessToken: string): Promise<RedditUserData | null> {
    try {
      const response = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'SnooWords/1.0.0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      return {
        name: data.name,
        karma: data.total_karma || 0,
        avatar: data.icon_img || null,
        trophies: data.trophies || 0
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  public async getUserData(): Promise<RedditUserData | null> {
    try {
      // First try to get from localStorage for quick access
      const cachedUser = localStorage.getItem('reddit_user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      const { data: user } = await supabase
        .from('reddit_users')
        .select('*')
        .single();

      if (!user) return null;

      // Update cache
      localStorage.setItem('reddit_user', JSON.stringify({
        name: user.username,
        karma: user.karma,
        avatar: user.avatar_url
      }));

      return {
        name: user.username,
        karma: user.karma,
        avatar: user.avatar_url,
        trophies: 0
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  public async submitScore(score: number, words: string[], subreddit?: string): Promise<boolean> {
    if (!this.enableRedditIntegration) {
      console.warn('Reddit integration is disabled');
      return false;
    }

    try {
      const { data: user } = await supabase
        .from('reddit_users')
        .select('access_token, username')
        .single();

      if (!user?.access_token) {
        throw new Error('No Reddit access token found');
      }

      // Format the words list nicely
      const formattedWords = words
        .map(word => `- ${word}`)
        .join('\n');

      const title = `SnooWords Score: ${score} points! 🎮`;
      const text = `Just scored ${score} points in SnooWords!\n\n` +
        `Words found:\n${formattedWords}\n\n` +
        `Play SnooWords at: ${window.location.origin}\n\n` +
        `#SnooWords #WordGame`;

      // If no subreddit is provided, post to user's profile
      const targetSubreddit = subreddit || `u_${user.username}`;

      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${user.access_token}`,
          'User-Agent': 'SnooWords/1.0.0'
        },
        body: new URLSearchParams({
          sr: targetSubreddit,
          kind: 'self',
          title,
          text,
          api_type: 'json'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reddit API error:', errorData);
        throw new Error(`Failed to submit to Reddit: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.json.errors?.length) {
        console.error('Reddit submission errors:', result.json.errors);
        throw new Error('Failed to submit post: ' + result.json.errors[0][1]);
      }

      return true;
    } catch (error) {
      console.error('Error submitting score to Reddit:', error);
      throw error;
    }
  }

  public isEnabled(): boolean {
    return this.enableRedditIntegration;
  }
}

export const redditService = new RedditService();
