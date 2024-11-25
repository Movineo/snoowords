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
    const state = crypto.randomUUID();
    localStorage.setItem('reddit_auth_state', state);
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      state,
      redirect_uri: this.redirectUri,
      duration: 'permanent',
      scope: 'identity submit'
    });

    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
  }

  public async handleCallback(code: string, state: string): Promise<boolean> {
    const storedState = localStorage.getItem('reddit_auth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    const tokenResponse = await this.getAccessToken(code);
    if (!tokenResponse) return false;

    const { access_token, refresh_token } = tokenResponse;
    
    // Store tokens in Supabase
    const { error } = await supabase
      .from('reddit_tokens')
      .upsert([
        {
          access_token,
          refresh_token,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error storing tokens:', error);
      return false;
    }

    return true;
  }

  private async getAccessToken(code: string): Promise<RedditAuthResponse | null> {
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
        throw new Error('Failed to get access token');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  public async getUserData(): Promise<RedditUserData | null> {
    try {
      const { data: tokens } = await supabase
        .from('reddit_tokens')
        .select('access_token')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!tokens?.access_token) {
        throw new Error('No access token found');
      }

      const response = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'User-Agent': 'SnooWords/1.0.0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user data');
      }

      const data = await response.json();
      return {
        name: data.name,
        karma: data.total_karma || 0,
        avatar: data.icon_img || null,
        trophies: data.trophies?.length || 0
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  public async submitScore(score: number, words: string[]): Promise<boolean> {
    if (!this.enableRedditIntegration) {
      console.log('Reddit integration is disabled');
      return false;
    }

    try {
      const { data: tokens } = await supabase
        .from('reddit_tokens')
        .select('access_token')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!tokens?.access_token) {
        throw new Error('No Reddit access token found');
      }

      const subreddit = 'u_SnooWords_Bot'; // Your bot's user profile
      const title = `New SnooWords High Score: ${score} points!`;
      const text = `I just scored ${score} points in SnooWords!\n\nWords found:\n${words.join(', ')}\n\nPlay SnooWords at: ${window.location.origin}`;

      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${tokens.access_token}`,
          'User-Agent': 'SnooWords/1.0.0'
        },
        body: new URLSearchParams({
          sr: subreddit,
          kind: 'self',
          title,
          text,
          api_type: 'json'
        }).toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return !result.json.errors?.length;
    } catch (error) {
      console.error('Error submitting score to Reddit:', error);
      return false;
    }
  }
}

export const redditService = new RedditService();
