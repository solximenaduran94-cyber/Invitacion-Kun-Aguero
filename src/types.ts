export type EventTheme = 'independiente' | 'gaming' | 'mancity';

export interface RSVP {
  id: string;
  name: string;
  attending: boolean;
  foodChoice: 'asado' | 'burger' | 'veggie' | 'none';
  customMessage: string;
  timestamp: string;
  kunReplyText?: string;
  kunReplyAudio?: string; // Base64 audio string from TTS
}

export interface SoundEffect {
  id: string;
  title: string;
  phrase: string;
  audioUrl?: string; // In case we use synth or simple files
}
