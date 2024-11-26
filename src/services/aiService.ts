import { WordSuggestion } from '../types/game';

class AIService {
  private apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  private model = 'gpt-3.5-turbo';

  public async getSuggestions(currentLetters: string[], theme?: string): Promise<WordSuggestion[]> {
    try {
      const prompt = this.buildPrompt(currentLetters, theme);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful word game assistant. Provide word suggestions based on available letters.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      return this.parseResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
  }

  private buildPrompt(letters: string[], theme?: string): string {
    let prompt = `Given these letters: ${letters.join(', ')}\n`;
    prompt += 'Suggest 3 possible words that can be formed using only these letters.\n';
    if (theme) {
      prompt += `The words should be related to the theme: ${theme}\n`;
    }
    prompt += 'Format your response as a JSON array of objects with "word" and "confidence" properties.';
    return prompt;
  }

  private parseResponse(content: string): WordSuggestion[] {
    try {
      return JSON.parse(content);
    } catch {
      // If parsing fails, try to extract words manually
      const words = content.match(/\b\w+\b/g) || [];
      return words.slice(0, 3).map(word => ({
        word: word.toLowerCase(),
        confidence: 0.8
      }));
    }
  }

  public async generateChallenge(theme: string): Promise<string[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a word game challenge creator.'
            },
            {
              role: 'user',
              content: `Create a list of 5 challenging words related to "${theme}". Format as JSON array.`
            }
          ],
          temperature: 0.8,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate challenge');
      }

      const data = await response.json();
      const words = JSON.parse(data.choices[0].message.content);
      return words;
    } catch (error) {
      console.error('Error generating challenge:', error);
      return [];
    }
  }
}

export const aiService = new AIService();
