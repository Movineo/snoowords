import { CommunityPuzzle } from '../types/game';

export const mockCommunityPuzzles: Record<string, CommunityPuzzle[]> = {
  popular: [
    {
      id: '1',
      title: 'Movie Magic',
      description: 'Words from the world of cinema!',
      creator: 'u/filmfan',
      plays: 567,
      difficulty: 'Medium',
      words: ['actor', 'scene', 'movie', 'drama', 'film', 'plot', 'role', 'cast'],
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
      title: 'Sports Sprint',
      description: 'Athletic vocabulary for sports enthusiasts!',
      creator: 'u/sportsfan',
      plays: 432,
      difficulty: 'Medium',
      words: ['team', 'goal', 'ball', 'game', 'win', 'race', 'jump', 'play'],
      upvotes: 256,
      dateCreated: '2024-01-14',
      category: 'popular',
      minWordLength: 3,
      maxWordLength: 6,
      timeLimit: 120,
      targetScore: 800
    }
  ],
  new: [
    {
      id: '3',
      title: 'Food Frenzy',
      description: 'Delicious words for food lovers!',
      creator: 'u/foodie',
      plays: 45,
      difficulty: 'Easy',
      words: ['cook', 'meal', 'food', 'dish', 'chef', 'bake', 'soup', 'cake'],
      upvotes: 12,
      dateCreated: '2024-01-20',
      category: 'new',
      minWordLength: 4,
      maxWordLength: 7,
      timeLimit: 150,
      targetScore: 600
    },
    {
      id: '4',
      title: 'Animal Kingdom',
      description: 'A wild collection of animal words!',
      creator: 'u/zookeeper',
      plays: 23,
      difficulty: 'Easy',
      words: ['lion', 'bear', 'wolf', 'bird', 'fish', 'frog', 'deer', 'duck'],
      upvotes: 8,
      dateCreated: '2024-01-19',
      category: 'new',
      minWordLength: 3,
      maxWordLength: 6,
      timeLimit: 120,
      targetScore: 500
    }
  ],
  trending: [
    {
      id: '5',
      title: 'Music Mania',
      description: 'Musical terms and instruments!',
      creator: 'u/musician',
      plays: 234,
      difficulty: 'Medium',
      words: ['song', 'note', 'beat', 'tune', 'drum', 'band', 'jazz', 'rock'],
      upvotes: 156,
      dateCreated: '2024-01-18',
      category: 'trending',
      minWordLength: 4,
      maxWordLength: 7,
      timeLimit: 150,
      targetScore: 700
    },
    {
      id: '6',
      title: 'Nature Walk',
      description: 'Words from the great outdoors!',
      creator: 'u/naturelover',
      plays: 189,
      difficulty: 'Easy',
      words: ['tree', 'leaf', 'rock', 'lake', 'wind', 'rain', 'sun', 'moon'],
      upvotes: 134,
      dateCreated: '2024-01-17',
      category: 'trending',
      minWordLength: 3,
      maxWordLength: 6,
      timeLimit: 120,
      targetScore: 600
    }
  ]
};
