import { SubredditPack } from '../types/game';

export const mockSubredditPacks: Record<string, SubredditPack> = {
  books: {
    id: 'books-1',
    name: 'Book Lovers Pack',
    subreddit: 'books',
    words: [
      'novel', 'author', 'chapter', 'library', 'reading',
      'fiction', 'story', 'literature', 'bookmark', 'paperback',
      'hardcover', 'bestseller', 'publisher', 'manuscript', 'character'
    ],
    theme: 'Literature & Reading',
    difficulty: 'medium',
    upvotes: 100,
    creator: 'bookworm123',
    created_at: new Date().toISOString(),
    description: 'A collection of book-related words for literature enthusiasts'
  },
  food: {
    id: 'food-1',
    name: 'Culinary Collection',
    subreddit: 'food',
    words: [
      'recipe', 'cooking', 'kitchen', 'delicious', 'flavor',
      'ingredient', 'cuisine', 'restaurant', 'chef', 'meal',
      'baking', 'taste', 'spice', 'dish', 'dessert', 'appetizer',
      'gourmet', 'culinary', 'menu', 'foodie'
    ],
    theme: 'Cooking & Cuisine',
    difficulty: 'easy',
    upvotes: 95,
    creator: 'chefmaster',
    created_at: new Date().toISOString(),
    description: 'Delicious food-related words for cooking enthusiasts'
  },
  gaming: {
    id: 'gaming-1',
    name: 'Gamer Pack',
    subreddit: 'gaming',
    words: [
      'console', 'player', 'level', 'score', 'achievement',
      'quest', 'character', 'strategy', 'multiplayer', 'controller',
      'graphics', 'gameplay', 'developer', 'esports', 'arcade',
      'virtual', 'gaming', 'platform', 'adventure', 'puzzle'
    ],
    theme: 'Video Games',
    difficulty: 'hard',
    upvotes: 120,
    creator: 'gamer4life',
    created_at: new Date().toISOString(),
    description: 'Gaming terminology for the true gamers'
  },
  movies: {
    id: 'movies-1',
    name: 'Cinema Pack',
    subreddit: 'movies',
    words: [
      'cinema', 'actor', 'director', 'film', 'scene',
      'script', 'movie', 'genre', 'studio', 'production',
      'camera', 'soundtrack', 'premiere', 'review', 'theater',
      'drama', 'comedy', 'action', 'plot', 'character'
    ],
    theme: 'Film & Cinema',
    difficulty: 'medium',
    upvotes: 110,
    creator: 'cinephile42',
    created_at: new Date().toISOString(),
    description: 'Movie-related words for film buffs'
  },
  music: {
    id: 'music-1',
    name: 'Melodic Mix',
    subreddit: 'music',
    words: [
      'rhythm', 'melody', 'song', 'artist', 'album',
      'concert', 'genre', 'instrument', 'band', 'musician',
      'lyrics', 'tempo', 'harmony', 'performance', 'playlist',
      'studio', 'record', 'acoustic', 'digital', 'audio'
    ],
    theme: 'Music & Melody',
    difficulty: 'medium',
    upvotes: 105,
    creator: 'musiclover23',
    created_at: new Date().toISOString(),
    description: 'A mix of music-related words for music enthusiasts'
  },
  science: {
    id: 'science-1',
    name: 'Scientific Discovery',
    subreddit: 'science',
    words: [
      'research', 'experiment', 'theory', 'discovery', 'laboratory',
      'scientist', 'hypothesis', 'data', 'analysis', 'study',
      'method', 'observation', 'evidence', 'chemistry', 'physics',
      'biology', 'quantum', 'molecule', 'element', 'reaction'
    ],
    theme: 'Science & Technology',
    difficulty: 'hard',
    upvotes: 115,
    creator: 'sciencegeek90',
    created_at: new Date().toISOString(),
    description: 'Scientific terminology for the curious minds'
  },
  sports: {
    id: 'sports-1',
    name: 'Sports Frenzy',
    subreddit: 'sports',
    words: [
      'athlete', 'team', 'game', 'score', 'championship',
      'player', 'coach', 'stadium', 'tournament', 'victory',
      'league', 'match', 'competition', 'training', 'fitness',
      'record', 'medal', 'season', 'sport', 'winner'
    ],
    theme: 'Sports & Fitness',
    difficulty: 'easy',
    upvotes: 98,
    creator: 'sportsfan12',
    created_at: new Date().toISOString(),
    description: 'Sports-related words for the sports enthusiasts'
  },
  technology: {
    id: 'technology-1',
    name: 'Tech Pack',
    subreddit: 'technology',
    words: [
      'computer', 'software', 'hardware', 'internet', 'digital',
      'network', 'device', 'innovation', 'programming', 'algorithm',
      'database', 'security', 'cloud', 'mobile', 'application',
      'system', 'interface', 'code', 'developer', 'platform'
    ],
    theme: 'Technology & Computing',
    difficulty: 'medium',
    upvotes: 125,
    creator: 'techwizard',
    created_at: new Date().toISOString(),
    description: 'Technology-related words for the tech-savvy'
  },
  todayilearned: {
    id: 'todayilearned-1',
    name: 'Knowledge Pack',
    subreddit: 'todayilearned',
    words: [
      'fact', 'discovery', 'history', 'knowledge', 'interesting',
      'learn', 'study', 'research', 'information', 'education',
      'science', 'culture', 'society', 'world', 'development',
      'understanding', 'insight', 'perspective', 'wisdom', 'truth'
    ],
    theme: 'Learning & Education',
    difficulty: 'medium',
    upvotes: 108,
    creator: 'curiousmind',
    created_at: new Date().toISOString(),
    description: 'Interesting facts and knowledge for the curious'
  },
  worldnews: {
    id: 'worldnews-1',
    name: 'Global News',
    subreddit: 'worldnews',
    words: [
      'global', 'international', 'politics', 'economy', 'society',
      'government', 'policy', 'leader', 'nation', 'development',
      'crisis', 'report', 'analysis', 'impact', 'change',
      'world', 'update', 'headline', 'breaking', 'current'
    ],
    theme: 'Global News & Politics',
    difficulty: 'hard',
    upvotes: 112,
    creator: 'newsjunkie',
    created_at: new Date().toISOString(),
    description: 'Global news and current events for the informed'
  }
};
