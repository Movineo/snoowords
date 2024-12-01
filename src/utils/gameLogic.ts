import words from 'an-array-of-english-words';
import { wordList } from './wordList';

// Common three-letter words that should be valid
const commonThreeLetterWords = new Set([
  // Food and Cooking
  'bun', 'ham', 'pie', 'egg', 'tea', 'jam', 'nut', 'pea', 'rye',
  
  // Animals
  'dog', 'cat', 'rat', 'bat', 'cow', 'pig', 'owl', 'ape', 'ant',
  
  // Actions
  'run', 'hop', 'jog', 'sit', 'eat', 'cry', 'fly', 'try', 'win',
  'put', 'get', 'let', 'see', 'use', 'buy', 'pay', 'say', 'ask',
  
  // Household
  'bed', 'cup', 'mug', 'pan', 'pot', 'lid', 'rug', 'mat', 'fan',
  
  // Nature
  'sun', 'sky', 'sea', 'air', 'fog', 'ice', 'dew', 'mud', 'hay',
  
  // Body Parts
  'arm', 'leg', 'eye', 'ear', 'lip', 'toe', 'jaw', 'hip',
  
  // Common Objects
  'bag', 'box', 'cap', 'hat', 'pen', 'key', 'map', 'tag', 'pin',
  'can', 'jar', 'tin', 'rod', 'axe', 'saw', 'gun', 'bow',
  
  // Qualities
  'big', 'old', 'new', 'raw', 'wet', 'dry', 'hot', 'red', 'bad',
  'sad', 'mad', 'shy', 'fat', 'fit', 'low', 'far', 'few',
  
  // Time
  'day', 'now', 'age',
  
  // Common Verbs
  'add', 'cut', 'dig', 'fix', 'mix', 'row', 'sew', 'tie', 'tap',
  'rub', 'pat', 'nap', 'dip', 'lay', 'set', 'hit', 'end',
  
  // Prepositions & Common Words
  'the', 'and', 'but', 'yet', 'for', 'not', 'all', 'any', 'out',
  'off', 'up', 'on', 'in', 'at', 'by', 'to'
]);

// Common four-letter words
const commonFourLetterWords = new Set([
  // Money and Business
  'bill', 'cash', 'coin', 'cost', 'debt', 'earn', 'fund', 'loan', 'paid', 'save',
  
  // Actions
  'walk', 'talk', 'jump', 'push', 'pull', 'lift', 'drop', 'grab', 'hold', 'give',
  'take', 'make', 'help', 'work', 'play', 'read', 'sing', 'swim', 'ride', 'fall',
  
  // Time
  'time', 'hour', 'week', 'year', 'date',
  
  // Nature
  'tree', 'leaf', 'fish', 'bird', 'rain', 'snow', 'wind', 'star', 'moon', 'lake',
  
  // Objects
  'door', 'wall', 'roof', 'book', 'desk', 'lamp', 'chair', 'table', 'phone', 'keys',
  
  // Qualities
  'good', 'nice', 'kind', 'cool', 'warm', 'cold', 'soft', 'hard', 'fast', 'slow',
  
  // Common Words
  'this', 'that', 'what', 'when', 'who', 'why', 'how', 'some', 'many', 'most',
  'with', 'from', 'into', 'over', 'down', 'away'
]);

// Combine multiple word lists for maximum coverage
const allWords = [
  ...words,
  ...(Array.from(wordList)),
  ...(Array.from(commonThreeLetterWords)),
  ...(Array.from(commonFourLetterWords)),
  // Include common contractions and possessives
  ...words.map(word => word + "'s"),
];

const dictionary = new Set(allWords);

export const generateLetters = () => {
  const vowels = 'AEIOU';
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const newLetters = [];
  
  // Ensure at least 3 vowels
  for (let i = 0; i < 3; i++) {
    newLetters.push(vowels[Math.floor(Math.random() * vowels.length)]);
  }
  
  // Fill rest with random letters
  for (let i = 0; i < 9; i++) {
    const isVowel = Math.random() < 0.3;
    const letter = isVowel 
      ? vowels[Math.floor(Math.random() * vowels.length)]
      : consonants[Math.floor(Math.random() * consonants.length)];
    newLetters.push(letter);
  }
  
  return newLetters.sort(() => Math.random() - 0.5);
};

export const calculatePoints = (word: string) => {
  const specialLetters = new Set(['Q', 'Z', 'X', 'J']);
  let points = word.length;
  
  for (const letter of word) {
    if (specialLetters.has(letter)) points += 2;
  }
  
  // Bonus points for longer words
  if (word.length >= 6) points += 3;
  if (word.length >= 8) points += 5;
  
  return points;
};

export const isValidWord = async (word: string, availableLetters?: string[]) => {
  // Convert to lowercase for consistency
  const wordLower = word.toLowerCase();
  
  // Basic length check
  if (wordLower.length < 3) {
    return false;
  }

  // First check common three and four-letter words
  if (commonThreeLetterWords.has(wordLower) || commonFourLetterWords.has(wordLower)) {
    // If word is in common words, only check available letters
    if (availableLetters) {
      const letterCount = new Map<string, number>();
      for (const letter of availableLetters) {
        letterCount.set(letter.toLowerCase(), (letterCount.get(letter.toLowerCase()) || 0) + 1);
      }

      for (const letter of wordLower) {
        const count = letterCount.get(letter) || 0;
        if (count === 0) return false;
        letterCount.set(letter, count - 1);
      }
    }
    return true;
  }

  // Then check main dictionary
  if (!dictionary.has(wordLower)) {
    // Try common variations
    const variations = [
      wordLower + 's',
      wordLower + 'ed',
      wordLower + 'ing',
      wordLower + "'s",
      // Handle some common prefixes
      'un' + wordLower,
      're' + wordLower,
    ];
    
    if (!variations.some(v => dictionary.has(v))) {
      return false;
    }
  }

  // If availableLetters provided, check if word can be formed
  if (availableLetters) {
    const letterCount = new Map<string, number>();
    for (const letter of availableLetters) {
      letterCount.set(letter.toLowerCase(), (letterCount.get(letter.toLowerCase()) || 0) + 1);
    }

    for (const letter of wordLower) {
      const count = letterCount.get(letter) || 0;
      if (count === 0) return false;
      letterCount.set(letter, count - 1);
    }
  }

  return true;
};