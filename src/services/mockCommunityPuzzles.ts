import { CommunityPuzzle } from '../types/game';

export const mockCommunityPuzzles: Record<string, CommunityPuzzle[]> = {
  popular: [
    {
      id: '1',
      title: 'Space Adventure',
      description: 'A cosmic journey through space-themed words!',
      creator: 'u/spacefan',
      plays: 2450,
      difficulty: 'Medium',
      words: ['galaxy', 'nebula', 'asteroid', 'comet', 'planet', 'star', 'moon', 'orbit'],
      upvotes: 342,
      dateCreated: '2024-01-15',
      category: 'popular',
      minWordLength: 4,
      maxWordLength: 8,
      timeLimit: 180,
      targetScore: 1000
    },
    {
      id: '2',
      title: 'Ocean Words',
      description: 'Dive deep into marine vocabulary!',
      creator: 'u/marinelife',
      plays: 1780,
      difficulty: 'Easy',
      words: ['wave', 'fish', 'coral', 'shark', 'whale', 'reef', 'tide', 'shell'],
      upvotes: 256,
      dateCreated: '2024-01-14',
      category: 'popular',
      minWordLength: 4,
      maxWordLength: 6,
      timeLimit: 120,
      targetScore: 800
    }
  ],
  new: [
    {
      id: '3',
      title: 'Tech Terms Challenge',
      description: 'Test your knowledge of technology vocabulary!',
      creator: 'u/techie',
      plays: 45,
      difficulty: 'Hard',
      words: ['code', 'data', 'cloud', 'pixel', 'cache', 'debug', 'query', 'stack'],
      upvotes: 12,
      dateCreated: '2024-01-20',
      category: 'new',
      minWordLength: 4,
      maxWordLength: 7,
      timeLimit: 240,
      targetScore: 1200
    },
    {
      id: '4',
      title: 'Food Frenzy',
      description: 'A delicious collection of food-related words!',
      creator: 'u/foodie',
      plays: 23,
      difficulty: 'Easy',
      words: ['cake', 'bread', 'pasta', 'soup', 'salad', 'pizza', 'steak', 'fruit'],
      upvotes: 8,
      dateCreated: '2024-01-19',
      category: 'new',
      minWordLength: 4,
      maxWordLength: 6,
      timeLimit: 150,
      targetScore: 600
    }
  ],
  trending: [
    {
      id: '5',
      title: 'Movie Magic',
      description: 'Words from the world of cinema!',
      creator: 'u/filmfan',
      plays: 567,
      difficulty: 'Medium',
      words: ['film', 'scene', 'actor', 'movie', 'drama', 'plot', 'stage', 'role'],
      upvotes: 89,
      dateCreated: '2024-01-18',
      category: 'trending',
      minWordLength: 4,
      maxWordLength: 7,
      timeLimit: 180,
      targetScore: 900
    },
    {
      id: '6',
      title: 'Sports Sprint',
      description: 'Athletic vocabulary for sports enthusiasts!',
      creator: 'u/sportsfan',
      plays: 432,
      difficulty: 'Medium',
      words: ['goal', 'team', 'ball', 'race', 'game', 'win', 'score', 'play'],
      upvotes: 67,
      dateCreated: '2024-01-17',
      category: 'trending',
      minWordLength: 3,
      maxWordLength: 6,
      timeLimit: 160,
      targetScore: 850
    }
  ]
};
