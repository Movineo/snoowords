import { REDDIT_CONFIG, REDDIT_ENDPOINTS } from '../config/reddit';

interface RedditUser {
  name: string;
  karma: number;
}

class RedditService {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: REDDIT_CONFIG.CLIENT_ID,
      response_type: 'code',
      state: 'random_state',
      redirect_uri: REDDIT_CONFIG.REDIRECT_URI,
      duration: 'temporary',
      scope: REDDIT_CONFIG.SCOPES.join(' ')
    });

    return `${REDDIT_ENDPOINTS.AUTHORIZE}?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDDIT_CONFIG.REDIRECT_URI
    });

    const response = await fetch(REDDIT_ENDPOINTS.ACCESS_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(
          `${REDDIT_CONFIG.CLIENT_ID}:${REDDIT_CONFIG.CLIENT_SECRET}`
        )}`
      },
      body: params
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return data.access_token;
  }

  async getUserInfo(): Promise<RedditUser> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(REDDIT_ENDPOINTS.ME, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const data = await response.json();
    return {
      name: data.name,
      karma: data.total_karma || 0,
    };
  }

  async handleOAuthCallback(code: string): Promise<RedditUser> {
    try {
      await this.getAccessToken(code);
      return await this.getUserInfo();
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error('Failed to authenticate with Reddit');
    }
  }

  async submitScore(score: number, words: string[]): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const title = `New SnooWords Score: ${score} points!`;
    const body = `Just scored ${score} points in SnooWords!\n\nWords used:\n${words.join(', ')}`;

    const params = new URLSearchParams({
      api_type: 'json',
      kind: 'self',
      sr: REDDIT_CONFIG.SUBREDDIT,
      title,
      text: body
    });

    const response = await fetch(REDDIT_ENDPOINTS.SUBMIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${this.accessToken}`
      },
      body: params
    });

    if (!response.ok) {
      throw new Error('Failed to submit score to Reddit');
    }
  }

  async getSubredditInfo(): Promise<{ subscribers: number }> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      REDDIT_ENDPOINTS.SUBREDDIT_ABOUT(REDDIT_CONFIG.SUBREDDIT),
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get subreddit info');
    }

    const data = await response.json();
    return {
      subscribers: data.data?.subscribers || 0,
    };
  }
}

export const redditService = new RedditService();
