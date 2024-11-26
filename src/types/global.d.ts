interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

interface CustomEventMap {
  'voice-command': CustomEvent<{ transcript: string }>;
}
