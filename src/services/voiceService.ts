/// <reference path="../types/speech.d.ts" />

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis = window.speechSynthesis;
  private isListening = false;

  constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      // Emit transcript event for components to handle
      window.dispatchEvent(new CustomEvent('voice-command', {
        detail: { transcript: transcript.toLowerCase() }
      }));
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.stopListening();
    };
  }

  public startListening() {
    if (!this.recognition || this.isListening) return;
    
    try {
      this.recognition.start();
      this.isListening = true;
      this.speak('Voice commands activated');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  }

  public stopListening() {
    if (!this.recognition || !this.isListening) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
      this.speak('Voice commands deactivated');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  public speak(text: string) {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    this.synthesis.speak(utterance);
  }

  public isSupported(): boolean {
    return (
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
      'speechSynthesis' in window
    );
  }
}

export const voiceService = new VoiceService();
