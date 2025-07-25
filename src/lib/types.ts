

export type SrsRating = 'forgot' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  srsLevel: number;
  nextReviewDate: string; // ISO string
  // These are added when retrieving, not stored in deck
  subjectId?: string; 
  topic?: string;
}

export interface Deck {
  id: string;
  subjectId: string;
  topic: string;
  summary: string;
  flashcards: Flashcard[];
}

export interface FlashcardTopic {
  name: string;
  summary: string;
  flashcards: Flashcard[];
}

export interface Session {
  id: string;
  subjectId: string;
  duration: number; // in seconds
  startTime: number; // timestamp
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon?: string;
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsPerLongBreak: number;
}

export interface AppSettings {
  pomodoro: PomodoroSettings;
  blockedSites: string[];
}
