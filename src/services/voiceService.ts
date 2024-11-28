/// <reference path="../types/speech.d.ts" />

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis = window.speechSynthesis;
  private isListening = false;
  private retryCount = 0;
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

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
      this.retryCount = 0; // Reset retry count on successful recognition
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
      
      if (event.error === 'no-speech') {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Retrying speech recognition (attempt ${this.retryCount}/${this.maxRetries})`);
          
          // Clear any existing retry timeout
          if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
          }
          
          // Retry after a short delay
          this.retryTimeout = setTimeout(() => {
            if (this.isListening) {
              this.stopListening();
              this.startListening();
            }
          }, 1000);
        } else {
          console.log('Max retry attempts reached. Stopping voice recognition.');
          this.stopListening();
          this.speak('Voice recognition stopped due to no speech detected');
        }
      } else {
        this.stopListening();
      }
    };

    this.recognition.onend = () => {
      // If we're supposed to be listening but recognition ended, restart it
      if (this.isListening && this.retryCount < this.maxRetries) {
        this.recognition?.start();
      }
    };
  }

  public startListening() {
    if (!this.recognition || this.isListening) return;
    
    try {
      this.retryCount = 0; // Reset retry count when starting
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
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }
      this.retryCount = 0;
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
    utterance.volume = 0.8;
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
