import words from 'an-array-of-english-words';

// Create a set of words for efficient lookup
function createWordList(): Set<string> {
    const baseWords = new Set<string>();
    
    // Add all words from the package
    words.forEach(word => {
        if (word.length >= 3) {
            // Add base word
            baseWords.add(word.toLowerCase());
            
            // Add common variations
            const w = word.toLowerCase();
            
            // Add plural forms
            baseWords.add(w + 's');
            if (w.endsWith('y')) {
                baseWords.add(w.slice(0, -1) + 'ies');
            }
            if (w.endsWith('f')) {
                baseWords.add(w.slice(0, -1) + 'ves');
            }
            if (w.match(/[sxz]$/) || w.match(/[cs]h$/)) {
                baseWords.add(w + 'es');
            }
            
            // Add verb forms
            baseWords.add(w + 'ed');
            baseWords.add(w + 'ing');
            if (w.endsWith('e')) {
                baseWords.add(w.slice(0, -1) + 'ing');
            }
            if (w.match(/[^aeiou][aeiou][^aeiou]$/) && !w.endsWith('w')) {
                baseWords.add(w + w.slice(-1) + 'ing');
                baseWords.add(w + w.slice(-1) + 'ed');
            }
            
            // Add comparative and superlative forms for adjectives
            if (w.length <= 7) { // Only for shorter words
                baseWords.add(w + 'er');
                baseWords.add(w + 'est');
                if (w.endsWith('e')) {
                    baseWords.add(w + 'r');
                    baseWords.add(w + 'st');
                }
                if (w.match(/[^aeiou][aeiou][^aeiou]$/)) {
                    baseWords.add(w + w.slice(-1) + 'er');
                    baseWords.add(w + w.slice(-1) + 'est');
                }
            }
            
            // Add common prefixes
            ['un', 're', 'in', 'dis', 'over', 'under', 'pre', 'post', 'non', 'anti'].forEach(prefix => {
                baseWords.add(prefix + w);
            });
            
            // Add common suffixes
            ['able', 'ible', 'al', 'ial', 'ful', 'ic', 'ical', 'ish', 'less', 'ly', 'ous', 'y'].forEach(suffix => {
                if (w.length + suffix.length <= 12) { // Keep words reasonably sized
                    baseWords.add(w + suffix);
                }
            });
        }
    });
    
    return baseWords;
}

export const wordList = createWordList();

// Export function to check if a word is valid
export function isValidWord(word: string): boolean {
    const normalizedWord = word.toLowerCase();
    return wordList.has(normalizedWord);
}

// Export function to get word suggestions
export function getWordSuggestions(prefix: string, limit: number = 10): string[] {
    const normalizedPrefix = prefix.toLowerCase();
    return Array.from(wordList)
        .filter(word => word.startsWith(normalizedPrefix))
        .sort()
        .slice(0, limit);
}
