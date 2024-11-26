interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
  speechSynthesis: SpeechSynthesis;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare class SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare class SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

declare class SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

declare class SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare class SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare class SpeechSynthesis extends EventTarget {
  cancel(): void;
  speak(utterance: SpeechSynthesisUtterance): void;
}

declare class SpeechSynthesisUtterance {
  constructor(text?: string);
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
  text: string;
}
