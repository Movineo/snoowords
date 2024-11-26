import { supabase } from '../config/supabase';

export interface WordPack {
  id: string;
  name: string;
  subreddit: string;
  description: string;
  words: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  creator: string;
  upvotes: number;
  created_at: string;
}

export interface CommunityPuzzle {
  id: string;
  title: string;
  creator: string;
  description: string;
  words: string[];
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  upvotes: number;
  plays: number;
  created_at: string;
}

class WordPackService {
  async getSubredditPacks(subreddit: string): Promise<WordPack[]> {
    const { data, error } = await supabase
      .from('word_packs')
      .select('*')
      .eq('subreddit', subreddit)
      .order('upvotes', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCommunityPuzzles(filter: 'popular' | 'new' | 'trending' = 'popular'): Promise<CommunityPuzzle[]> {
    let query = supabase.from('community_puzzles').select('*');

    switch (filter) {
      case 'popular':
        query = query.order('upvotes', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'trending':
        query = query.order('plays', { ascending: false });
        break;
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data || [];
  }

  async createWordPack(pack: Omit<WordPack, 'id' | 'upvotes' | 'created_at'>): Promise<WordPack> {
    const { data, error } = await supabase
      .from('word_packs')
      .insert([pack])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createCommunityPuzzle(puzzle: Omit<CommunityPuzzle, 'id' | 'upvotes' | 'plays' | 'created_at'>): Promise<CommunityPuzzle> {
    const { data, error } = await supabase
      .from('community_puzzles')
      .insert([puzzle])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async upvoteWordPack(packId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_word_pack_upvotes', { pack_id: packId });
    if (error) throw error;
  }

  async upvotePuzzle(puzzleId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_puzzle_upvotes', { puzzle_id: puzzleId });
    if (error) throw error;
  }

  async incrementPuzzlePlays(puzzleId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_puzzle_plays', { puzzle_id: puzzleId });
    if (error) throw error;
  }
}

export const wordPackService = new WordPackService();
