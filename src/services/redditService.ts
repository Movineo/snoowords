import { supabase } from "../config/supabase";
import { toast } from 'react-hot-toast';
import { RedditUser } from '../types/game';
import { Database } from '../types/supabase';

type RedditUserRow = Database['public']['Tables']['reddit_users']['Row'];

interface RedditAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface RedditUserResponse {
  name: string;
  icon_img: string;
  created_utc: number;
  total_karma: number;
}

export interface RedditWordPack {
  id: string;
  title: string;
  description: string;
  subreddit: string;
  words: string[];
  created_by: string;
  created_at: string;
  upvotes: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SubredditBattle {
  id: string;
  subreddit1: string;
  subreddit2: string;
  startTime: string;
  endTime: string;
  scores: {
    [subreddit: string]: number;
  };
  participants: {
    [subreddit: string]: string[];
  };
  wordPack: RedditWordPack;
  status: 'pending' | 'active' | 'completed';
}

export interface BattleParticipant {
  userId: string;
  subreddit: string;
  score: number;
  words: string[];
}

export class RedditService {
  private clientId = import.meta.env.VITE_REDDIT_CLIENT_ID;
  private clientSecret = import.meta.env.VITE_REDDIT_CLIENT_SECRET;
  private redirectUri = import.meta.env.VITE_REDDIT_REDIRECT_URI;
  private enableRedditIntegration = import.meta.env.VITE_ENABLE_REDDIT_INTEGRATION === 'true';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private currentUserId: string | null = null;

  public getAuthUrl(): string {
    if (!this.clientId || !this.clientSecret) {
      toast('Reddit client credentials not configured', {
        icon: '⚠️',
        duration: 3000
      });
      return '';
    }

    if (!this.enableRedditIntegration) {
      toast('Reddit integration is disabled', {
        icon: '⚠️',
        duration: 3000
      });
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

  public async handleCallback(code: string, state: string): Promise<RedditUser> {
    if (!this.enableRedditIntegration) {
      toast('Reddit integration is disabled', {
        icon: '⚠️',
        duration: 3000
      });
      throw new Error('Reddit integration is disabled');
    }

    if (!this.clientId || !this.clientSecret) {
      toast('Reddit client credentials not configured', {
        icon: '⚠️',
        duration: 3000
      });
      throw new Error('Reddit client credentials not configured');
    }

    const storedState = localStorage.getItem('reddit_auth_state');
    if (!storedState) {
      toast('No authentication state found', {
        icon: '⚠️',
        duration: 3000
      });
      throw new Error('No authentication state found');
    }

    if (state !== storedState) {
      toast('Invalid authentication state', {
        icon: '⚠️',
        duration: 3000
      });
      throw new Error('Invalid authentication state');
    }

    try {
      const tokenResponse = await this.getAccessToken(code);
      if (!tokenResponse) {
        toast('Failed to get access token', {
          icon: '⚠️',
          duration: 3000
        });
        throw new Error('Failed to get access token');
      }

      const { access_token, refresh_token } = tokenResponse;
      
      // Get user data before storing tokens
      const userResponse = await this.fetchRedditUserData(access_token);
      if (!userResponse) {
        toast('Failed to fetch user data', {
          icon: '⚠️',
          duration: 3000
        });
        throw new Error('Failed to fetch user data');
      }

      // Store tokens and user data in Supabase
      const { error } = await supabase
        .from('reddit_users')
        .upsert(
          {
            id: userResponse.name,
            name: userResponse.name,
            avatar_url: userResponse.icon_img,
            karma: userResponse.total_karma,
            created_at: new Date(userResponse.created_utc * 1000).toISOString(),
            access_token,
            refresh_token,
          },
          {
            onConflict: 'id',
            ignoreDuplicates: false
          }
        );

      if (error) {
        console.error('Error storing user data:', error);
        toast('Failed to store user data', {
          icon: '⚠️',
          duration: 3000
        });
        throw new Error('Failed to store user data');
      }

      // Store user info in localStorage for quick access
      const user: RedditUser = {
        id: userResponse.name,
        name: userResponse.name,
        isAuthenticated: true,
        avatarUrl: userResponse.icon_img,
        karma: userResponse.total_karma,
        created_at: new Date(userResponse.created_utc * 1000).toISOString(),
        achievements: {},  // Initialize with empty achievements
        preferences: {
          soundEnabled: true,
          theme: 'default'
        }
      };

      localStorage.setItem('reddit_user', JSON.stringify(user));

      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      this.currentUserId = userResponse.name;

      toast('Successfully logged in with Reddit!', {
        icon: '🎉',
        duration: 3000
      });
      return user;
    } catch (error) {
      console.error('Error during Reddit authentication:', error);
      toast('Authentication failed', {
        icon: '⚠️',
        duration: 3000
      });
      throw new Error('Authentication failed');
    }
  }

  public async getCurrentUserData(): Promise<RedditUser | null> {
    if (!this.currentUserId) {
      return null;
    }
    return this.getUserData(this.currentUserId);
  }

  public async getUserData(userId: string): Promise<RedditUser | null> {
    try {
      const { data: user, error } = await supabase
        .from('reddit_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      if (!user) {
        console.error('No user found with ID:', userId);
        return null;
      }

      const dbUser = user as RedditUserRow;

      // Update cache
      const userData: RedditUser = {
        id: dbUser.id,
        name: dbUser.name,
        isAuthenticated: true,
        avatarUrl: dbUser.avatar_url || undefined,
        karma: dbUser.karma,
        created_at: dbUser.created_at,
        achievements: dbUser.achievements || {},
        preferences: dbUser.preferences || {
          soundEnabled: true,
          theme: 'default'
        }
      };

      localStorage.setItem('reddit_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error in getUserData:', error);
      return null;
    }
  }

  private async getAccessToken(code: string): Promise<RedditAuthResponse | null> {
    if (!this.clientId || !this.clientSecret) {
      toast('Reddit client credentials not configured', {
        icon: '⚠️',
        duration: 3000
      });
      return null;
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri
    });

    try {
      console.log('Requesting access token...');
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
        toast('Failed to get access token', {
          icon: '⚠️',
          duration: 3000
        });
        return null;
      }

      const data = await response.json();
      console.log('Access token received');
      return data;
    } catch (error) {
      console.error('Error getting access token:', error);
      toast('Failed to get access token', {
        icon: '⚠️',
        duration: 3000
      });
      return null;
    }
  }

  private async fetchRedditUserData(accessToken: string): Promise<RedditUserResponse> {
    if (!accessToken) {
      throw new Error('Not authenticated with Reddit');
    }

    const response = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  }

  public async refreshUserData(): Promise<RedditUser | null> {
    try {
      const { data: user, error } = await supabase
        .from('reddit_users')
        .select('*')
        .single();

      if (error) throw error;

      const userData = user as RedditUserRow;
      
      const redditUser: RedditUser = {
        id: userData.id,
        name: userData.name,
        isAuthenticated: true,
        avatarUrl: userData.avatar_url || undefined,
        karma: userData.karma,
        created_at: userData.created_at,
        achievements: userData.achievements || {},
        preferences: userData.preferences || {
          soundEnabled: true,
          theme: 'default'
        }
      };

      localStorage.setItem('reddit_user', JSON.stringify(redditUser));
      return redditUser;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  }

  public async submitScore(score: number, words: string[]): Promise<boolean> {
    if (!this.enableRedditIntegration) {
      toast('Reddit integration is disabled', {
        icon: '⚠️',
        duration: 3000
      });
      return false;
    }

    try {
      const { data: user, error } = await supabase
        .from('reddit_users')
        .select('access_token, name')
        .single();

      if (error) {
        console.error('Error fetching Reddit user:', error);
        toast('Failed to get Reddit user data', {
          icon: '⚠️',
          duration: 3000
        });
        return false;
      }

      if (!user?.access_token) {
        toast('Please log in with Reddit first', {
          icon: '⚠️',
          duration: 3000
        });
        return false;
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

      // Post to the SnooWords subreddit
      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${user.access_token}`,
          'User-Agent': 'SnooWords/1.0.0'
        },
        body: new URLSearchParams({
          sr: 'SnooWords',  // Your subreddit name
          kind: 'self',
          title,
          text,
          api_type: 'json'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Reddit API error:', errorData);
        toast('Failed to share score to Reddit', {
          icon: '⚠️',
          duration: 3000
        });
        return false;
      }

      const result = await response.json();
      if (result.json.errors?.length) {
        console.error('Reddit submission errors:', result.json.errors);
        toast('Failed to share score: ' + result.json.errors[0][1], {
          icon: '⚠️',
          duration: 3000
        });
        return false;
      }

      toast('Score shared to Reddit!', {
        icon: '🎉',
        duration: 3000
      });
      return true;
    } catch (error) {
      console.error('Error submitting score to Reddit:', error);
      toast('Failed to share score', {
        icon: '⚠️',
        duration: 3000
      });
      return false;
    }
  }

  private async fetchTrendingPosts(subreddit: string): Promise<string[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Reddit');
    }

    const response = await fetch(
      `https://oauth.reddit.com/r/${subreddit}/top.json?t=day&limit=25`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch trending posts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.children.map((child: any) => child.data.title);
  }

  public async createWordPack(
    title: string,
    description: string,
    subreddit: string,
    words: string[],
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<RedditWordPack> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not logged in');

    const { data, error } = await supabase
      .from('word_packs')
      .insert([
        {
          title,
          description,
          subreddit,
          words,
          created_by: user.id,
          difficulty,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as RedditWordPack;
  }

  public async getWordPacks(filter: 'popular' | 'new' | 'trending' = 'popular'): Promise<RedditWordPack[]> {
    let query = supabase
      .from('word_packs')
      .select('*');

    switch (filter) {
      case 'popular':
        query = query.order('upvotes', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'trending':
        // Trending combines recent + popular
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        query = query
          .gte('created_at', threeDaysAgo.toISOString())
          .order('upvotes', { ascending: false });
        break;
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data as RedditWordPack[];
  }

  public async getTrendingWords(options: {
    subreddits?: string[],
    timeframe?: 'day' | 'week',
    minWordLength?: number,
    maxWords?: number
  } = {}): Promise<RedditWordPack[]> {
    const {
      subreddits = ['popular', 'todayilearned', 'science', 'worldnews'],
      timeframe = 'day',
      minWordLength = 3,
      maxWords = 50
    } = options;

    const wordPacks: RedditWordPack[] = [];

    for (const subreddit of subreddits) {
      try {
        const posts = await this.fetchTrendingPosts(subreddit);
        const allWords = new Set<string>();
        const wordFrequency: { [key: string]: number } = {};

        // Process all posts
        posts.forEach(post => {
          const titleWords = this.extractWords(post);
          titleWords.forEach(word => {
            if (word.length >= minWordLength) {
              allWords.add(word);
              wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            }
          });
        });

        // Sort words by frequency and length
        const sortedWords = Array.from(allWords)
          .sort((a, b) => {
            const freqDiff = wordFrequency[b] - wordFrequency[a];
            return freqDiff !== 0 ? freqDiff : b.length - a.length;
          })
          .slice(0, maxWords);

        if (sortedWords.length > 0) {
          wordPacks.push({
            id: `${subreddit}-${Date.now()}`,
            title: `Trending words from r/${subreddit}`,
            description: `Trending words from r/${subreddit}`,
            subreddit,
            words: sortedWords,
            created_by: '',
            created_at: new Date().toISOString(),
            upvotes: 0,
            difficulty: 'medium'
          });
        }
      } catch (error) {
        console.error(`Error fetching words from r/${subreddit}:`, error);
      }
    }

    return wordPacks;
  }

  public async incrementKarma(amount: number): Promise<RedditUser | null> {
    try {
      const { data: userData, error } = await supabase
        .from('reddit_users')
        .select('*')
        .single();

      if (error) throw error;

      const dbUser = userData as RedditUserRow;
      
      const user: RedditUser = {
        id: dbUser.id,
        name: dbUser.name,
        isAuthenticated: true,
        avatarUrl: dbUser.avatar_url || undefined,
        karma: dbUser.karma + amount,
        created_at: dbUser.created_at,
        achievements: dbUser.achievements || {},
        preferences: dbUser.preferences || {
          soundEnabled: true,
          theme: 'default'
        }
      };

      const { error: updateError } = await supabase
        .from('reddit_users')
        .update({ 
          karma: user.karma,
          achievements: user.achievements,
          preferences: user.preferences
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return user;
    } catch (error) {
      console.error('Error incrementing karma:', error);
      return null;
    }
  }

  private extractWords(text: string): string[] {
    // Remove URLs, special characters, and normalize text
    const cleanText = text
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');

    // Split into words and filter
    return cleanText
      .split(/\s+/)
      .filter(word => {
        return word.length >= 3 && // Min length
               word.length <= 15 && // Max length
               !['the', 'and', 'a', 'an', 'is', 'in', 'it', 'of', 'to', 'for', 'with', 'on', 'at', 'by', 'from'].includes(word); // Filter common words
      });
  }

  public async createSubredditBattle(subreddit1: string, subreddit2: string): Promise<SubredditBattle> {
    const wordPack = await this.generateSubredditWordPack([subreddit1, subreddit2]);
  
    const battle: SubredditBattle = {
      id: crypto.randomUUID(),
      subreddit1,
      subreddit2,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      scores: {
        [subreddit1]: 0,
        [subreddit2]: 0
      },
      participants: {
        [subreddit1]: [],
        [subreddit2]: []
      },
      wordPack,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('subreddit_battles')
      .insert(battle)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async generateSubredditWordPack(subreddits: string[]): Promise<RedditWordPack> {
    const allWords: string[] = [];
  
    for (const subreddit of subreddits) {
      const posts = await this.fetchTrendingPosts(subreddit);
      const words = posts.flatMap(post => this.extractWords(post))
        .filter(word => word.length >= 3)
        .slice(0, 50); // Take top 50 words
      allWords.push(...words);
    }

    // Create unique word pack
    return this.createWordPack(
      `${subreddits.join(' vs ')} Battle Pack`,
      `Special word pack for the battle between r/${subreddits.join(' and r/')}`,
      subreddits.join('+'),
      [...new Set(allWords)],
      'medium'
    );
  }

  public async joinBattle(battleId: string, userId: string, subreddit: string): Promise<void> {
    // First get the current participants
    const { data: battle, error: fetchError } = await supabase
      .from('subreddit_battles')
      .select('participants')
      .eq('id', battleId)
      .single();

    if (fetchError) throw fetchError;

    // Update the participants array for the specific subreddit
    const participants = battle?.participants || {};
    const updatedParticipants = {
      ...participants,
      [subreddit]: [...(participants[subreddit] || []), userId]
    };

    const { error } = await supabase
      .from('subreddit_battles')
      .update({ participants: updatedParticipants })
      .eq('id', battleId);

    if (error) throw error;
  }

  public async submitBattleScore(
    battleId: string,
    participant: BattleParticipant
  ): Promise<void> {
    const { data: battle, error: fetchError } = await supabase
      .from('subreddit_battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (fetchError) throw fetchError;

    const newScore = (battle.scores[participant.subreddit] || 0) + participant.score;

    const { error: updateError } = await supabase
      .from('subreddit_battles')
      .update({
        [`scores.${participant.subreddit}`]: newScore
      })
      .eq('id', battleId);

    if (updateError) throw updateError;

    // Post to Reddit if it's a significant score
    if (participant.score > 1000) {
      await this.postToReddit(
        participant.subreddit,
        `New High Score in r/${participant.subreddit} Battle!`,
        `🏆 A player just scored ${participant.score} points using words like: ${participant.words.join(', ')}! Join the battle now!`
      );
    }
  }

  private async postToReddit(subreddit: string, title: string, text: string): Promise<void> {
    if (!this.accessToken) throw new Error('Not authenticated with Reddit');

    const response = await fetch(`https://oauth.reddit.com/api/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        sr: subreddit,
        kind: 'self',
        title,
        text,
        api_type: 'json'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to post to Reddit');
    }
  }

  public isEnabled(): boolean {
    return this.enableRedditIntegration && Boolean(this.clientId) && Boolean(this.clientSecret);
  }
}

// Export a singleton instance
export const redditService = new RedditService();
