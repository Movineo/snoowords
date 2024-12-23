// Function to check if a word is related to a theme
export function isThemeRelated(word: string, theme: string): boolean {
  // Convert both to lowercase for case-insensitive comparison
  word = word.toLowerCase();
  theme = theme.toLowerCase();

  // Technology theme words
  const techWords = new Set([
    'app', 'web', 'code', 'data', 'tech', 'byte', 'chip', 'wifi',
    'net', 'blog', 'site', 'file', 'game', 'user', 'link', 'post',
    'chat', 'hack', 'soft', 'hard', 'disk', 'port', 'host', 'cloud',
    'node', 'sync', 'boot', 'spam', 'ping', 'core', 'beta', 'bits',
    'tech', 'code', 'data', 'file', 'user', 'link', 'post', 'chat',
    'hack', 'soft', 'disk', 'port', 'host', 'node', 'sync', 'boot',
  ]);

  // Science theme words
  const scienceWords = new Set([
    'lab', 'test', 'cell', 'atom', 'gene', 'dna', 'rna', 'mass',
    'wave', 'heat', 'acid', 'base', 'ion', 'bond', 'gas', 'stem',
    'core', 'data', 'dose', 'drug', 'flow', 'gene', 'germ', 'host',
    'life', 'mass', 'node', 'peak', 'rate', 'salt', 'seed', 'test',
  ]);

  // Gaming theme words
  const gamingWords = new Set([
    'game', 'play', 'win', 'lose', 'team', 'mode', 'save', 'load',
    'boss', 'loot', 'raid', 'tank', 'heal', 'buff', 'nerf', 'meta',
    'farm', 'grind', 'kill', 'loot', 'mana', 'raid', 'rank', 'role',
    'team', 'tier', 'tank', 'unit', 'zone', 'boss', 'camp', 'drop',
  ]);

  // Movies theme words
  const movieWords = new Set([
    'film', 'star', 'role', 'cast', 'plot', 'show', 'act', 'scene',
    'hero', 'edit', 'cut', 'take', 'shot', 'view', 'zoom', 'pan',
    'role', 'saga', 'tale', 'time', 'tone', 'view', 'work', 'year',
    'film', 'hero', 'line', 'plot', 'role', 'saga', 'star', 'tale',
  ]);

  // Select word set based on theme
  let themeWords: Set<string>;
  switch (theme.toLowerCase()) {
    case 'technology':
      themeWords = techWords;
      break;
    case 'science':
      themeWords = scienceWords;
      break;
    case 'gaming':
      themeWords = gamingWords;
      break;
    case 'movies':
      themeWords = movieWords;
      break;
    default:
      themeWords = new Set();
  }

  return themeWords.has(word);
};

// Function to check if a word is valid (at least 3 letters and contains only letters)
export function isValidWord(word: string): boolean {
  return word.length >= 3 && /^[a-zA-Z]+$/.test(word);
}

// Calculate word score based on length and letter complexity
export function calculateWordScore(word: string): number {
  if (!isValidWord(word)) return 0;
  
  // Base points: 1 point per letter
  let score = word.length;
  
  // Bonus points for complex letters (Q, X, J, Z)
  const complexLetters = new Set(['q', 'x', 'j', 'z']);
  for (const letter of word.toLowerCase()) {
    if (complexLetters.has(letter)) {
      score += 2; // Extra points for complex letters
    }
  }
  
  // Length bonuses
  if (word.length >= 6) score += 3;  // Bonus for longer words
  if (word.length >= 8) score += 5;  // Extra bonus for very long words
  
  return score;
}
