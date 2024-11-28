// Function to generate a balanced set of letters for the game
export const generateLetters = (count: number = 16): string[] => {
  const vowels = 'AEIOU';
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const letters: string[] = [];
  
  // Ensure at least 4 vowels
  for (let i = 0; i < Math.min(4, Math.floor(count * 0.25)); i++) {
    letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
  }
  
  // Fill the rest with random letters
  while (letters.length < count) {
    const isVowel = Math.random() < 0.3;
    const source = isVowel ? vowels : consonants;
    letters.push(source[Math.floor(Math.random() * source.length)]);
  }
  
  return letters.sort(() => Math.random() - 0.5);
};

export const calculateWordScore = (word: string): number => {
  if (!word) return 0;
  
  const baseScore = word.length;
  let multiplier = 1;

  // Bonus for longer words
  if (word.length >= 7) multiplier *= 1.5;
  if (word.length >= 9) multiplier *= 1.5;

  // Bonus for using rare letters
  const rareLetters = ['J', 'K', 'Q', 'X', 'Z'];
  const hasRareLetter = rareLetters.some(letter => 
    word.toUpperCase().includes(letter)
  );
  if (hasRareLetter) multiplier *= 1.2;

  return Math.floor(baseScore * multiplier);
};
