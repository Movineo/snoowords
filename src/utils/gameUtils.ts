// Function to generate a balanced set of letters for the game
export const generateLetters = (): string[] => {
  const vowels = 'AEIOU';
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const letters: string[] = [];
  
  // Ensure at least 4 vowels
  for (let i = 0; i < 4; i++) {
    letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
  }
  
  // Fill the rest with random letters (total 16 letters)
  while (letters.length < 16) {
    const isVowel = Math.random() < 0.3;
    const source = isVowel ? vowels : consonants;
    letters.push(source[Math.floor(Math.random() * source.length)]);
  }
  
  return letters.sort(() => Math.random() - 0.5);
};
