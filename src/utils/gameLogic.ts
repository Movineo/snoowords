import words from 'an-array-of-english-words';

const dictionary = new Set(words);

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
  // Check if word exists in dictionary
  if (!dictionary.has(word.toLowerCase())) {
    return false;
  }

  // If availableLetters provided, check if word can be formed
  if (availableLetters) {
    const letterCount = new Map<string, number>();
    for (const letter of availableLetters) {
      letterCount.set(letter, (letterCount.get(letter) || 0) + 1);
    }

    for (const letter of word) {
      const count = letterCount.get(letter) || 0;
      if (count === 0) return false;
      letterCount.set(letter, count - 1);
    }
  }

  return true;
};