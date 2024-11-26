import { supabase } from '../config/supabase';

export interface DailyTheme {
  id: string;
  theme: string;
  description: string;
  bonus_words: string[];
  created_at: string;
  expires_at: string;
}

class ThemeService {
  private async getCurrentTheme(): Promise<DailyTheme | null> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('daily_themes')
        .select('*')
        .gte('expires_at', now)
        .lte('created_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching current theme:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching current theme:', error);
      return null;
    }
  }

  private async createNewTheme(): Promise<DailyTheme | null> {
    const themes = [
      {
        theme: 'Space Exploration',
        description: 'Find words related to space, astronomy, and cosmic exploration!',
        bonus_words: ['rocket', 'planet', 'galaxy', 'star', 'orbit', 'moon', 'space']
      },
      {
        theme: 'Technology',
        description: 'Discover words about computers, gadgets, and innovation!',
        bonus_words: ['code', 'data', 'robot', 'cyber', 'tech', 'smart', 'web']
      },
      {
        theme: 'Nature',
        description: 'Connect with words about the natural world!',
        bonus_words: ['tree', 'river', 'plant', 'leaf', 'bird', 'flower', 'green']
      },
      {
        theme: 'Gaming',
        description: 'Level up with video game related words!',
        bonus_words: ['game', 'play', 'score', 'level', 'quest', 'win', 'bonus']
      },
      {
        theme: 'Science',
        description: 'Experiment with scientific terminology!',
        bonus_words: ['atom', 'cell', 'lab', 'test', 'gene', 'study', 'react']
      },
      {
        theme: 'Movies',
        description: 'Action! Find words related to cinema and films!',
        bonus_words: ['film', 'actor', 'scene', 'movie', 'star', 'plot', 'role']
      }
    ];

    // Pick a random theme
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    // Create expiration date (end of current day in UTC)
    const now = new Date();
    const expires = new Date(now);
    expires.setUTCHours(23, 59, 59, 999);

    try {
      const { data, error } = await supabase
        .from('daily_themes')
        .insert({
          theme: randomTheme.theme,
          description: randomTheme.description,
          bonus_words: randomTheme.bonus_words,
          created_at: now.toISOString(),
          expires_at: expires.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating new theme:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating new theme:', error);
      return null;
    }
  }

  public async getDailyTheme(): Promise<DailyTheme | null> {
    // Try to get current theme
    let theme = await this.getCurrentTheme();
    
    // If no current theme exists, create a new one
    if (!theme) {
      theme = await this.createNewTheme();
    }

    return theme;
  }

  public async checkWordBonus(word: string): Promise<number> {
    const theme = await this.getCurrentTheme();
    if (!theme) return 1;

    // Convert to lowercase for case-insensitive comparison
    const lowercaseWord = word.toLowerCase();
    
    // Check if the word is in bonus words
    if (theme.bonus_words.map(w => w.toLowerCase()).includes(lowercaseWord)) {
      return 2; // Double points for bonus words
    }

    return 1;
  }
}

export const themeService = new ThemeService();
