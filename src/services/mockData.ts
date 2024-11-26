import { SubredditPack } from '../types/supabase';

export const mockSubredditPacks: Record<string, SubredditPack> = {
  books: {
    id: 'books-1',
    subreddit: 'books',
    words: [
      'novel', 'author', 'chapter', 'library', 'reading',
      'fiction', 'story', 'literature', 'bookmark', 'paperback',
      'hardcover', 'bestseller', 'publisher', 'manuscript', 'character'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 100
  },
  food: {
    id: 'food-1',
    subreddit: 'food',
    words: [
      'recipe', 'cooking', 'kitchen', 'delicious', 'flavor',
      'ingredient', 'cuisine', 'restaurant', 'chef', 'meal',
      'baking', 'taste', 'spice', 'dish', 'dessert', 'appetizer',
      'gourmet', 'culinary', 'menu', 'foodie'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 95
  },
  gaming: {
    id: 'gaming-1',
    subreddit: 'gaming',
    words: [
      'console', 'player', 'level', 'score', 'achievement',
      'quest', 'character', 'strategy', 'multiplayer', 'controller',
      'graphics', 'gameplay', 'developer', 'esports', 'arcade',
      'virtual', 'gaming', 'platform', 'adventure', 'puzzle'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 120
  },
  movies: {
    id: 'movies-1',
    subreddit: 'movies',
    words: [
      'cinema', 'actor', 'director', 'film', 'scene',
      'script', 'movie', 'genre', 'studio', 'production',
      'camera', 'soundtrack', 'premiere', 'review', 'theater',
      'drama', 'comedy', 'action', 'plot', 'character'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 110
  },
  music: {
    id: 'music-1',
    subreddit: 'music',
    words: [
      'rhythm', 'melody', 'song', 'artist', 'album',
      'concert', 'genre', 'instrument', 'band', 'musician',
      'lyrics', 'tempo', 'harmony', 'performance', 'playlist',
      'studio', 'record', 'acoustic', 'digital', 'audio'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 105
  },
  science: {
    id: 'science-1',
    subreddit: 'science',
    words: [
      'research', 'experiment', 'theory', 'discovery', 'laboratory',
      'scientist', 'hypothesis', 'data', 'analysis', 'study',
      'method', 'observation', 'evidence', 'chemistry', 'physics',
      'biology', 'quantum', 'molecule', 'element', 'reaction'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 115
  },
  sports: {
    id: 'sports-1',
    subreddit: 'sports',
    words: [
      'athlete', 'team', 'game', 'score', 'championship',
      'player', 'coach', 'stadium', 'tournament', 'victory',
      'league', 'match', 'competition', 'training', 'fitness',
      'record', 'medal', 'season', 'sport', 'winner'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 98
  },
  technology: {
    id: 'technology-1',
    subreddit: 'technology',
    words: [
      'computer', 'software', 'hardware', 'internet', 'digital',
      'network', 'device', 'innovation', 'programming', 'algorithm',
      'database', 'security', 'cloud', 'mobile', 'application',
      'system', 'interface', 'code', 'developer', 'platform'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 125
  },
  todayilearned: {
    id: 'todayilearned-1',
    subreddit: 'todayilearned',
    words: [
      'fact', 'discovery', 'history', 'knowledge', 'interesting',
      'learn', 'study', 'research', 'information', 'education',
      'science', 'culture', 'society', 'world', 'development',
      'understanding', 'insight', 'perspective', 'wisdom', 'truth'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 108
  },
  worldnews: {
    id: 'worldnews-1',
    subreddit: 'worldnews',
    words: [
      'global', 'international', 'politics', 'economy', 'society',
      'government', 'policy', 'leader', 'nation', 'development',
      'crisis', 'report', 'analysis', 'impact', 'change',
      'world', 'update', 'headline', 'breaking', 'current'
    ],
    lastUpdated: new Date().toISOString(),
    upvotes: 112
  }
};
