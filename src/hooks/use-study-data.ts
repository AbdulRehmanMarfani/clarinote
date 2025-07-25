
"use client";

import { useLocalStorage } from './use-local-storage';
import type { Subject, Session, Deck, AppSettings, Flashcard, SrsRating } from '@/lib/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

const defaultSettings: AppSettings = {
  pomodoro: {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsPerLongBreak: 4,
  },
  blockedSites: [],
};

export function useStudyData() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('studybot-subjects', []);
  const [sessions, setSessions] = useLocalStorage<Session[]>('studybot-sessions', []);
  const [decks, setDecks] = useLocalStorage<Deck[]>('studybot-decks', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('studybot-settings', defaultSettings);
  const [aiQuestionsCount, setAiQuestionsCount] = useLocalStorage<number>('studybot-ai-questions-count', 0);
  
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useLocalStorage<string>('studybot-session-notes', '');

  useEffect(() => {
    if(!currentSubjectId && subjects.length > 0) {
        setCurrentSubjectId(subjects[0].id);
    }
  }, [subjects, currentSubjectId]);
  
  const addSubject = useCallback((subject: Omit<Subject, 'id'>) => {
    const newSubject = { ...subject, id: `subj-${Date.now()}` };
    setSubjects(prev => [...prev, newSubject]);
    return newSubject;
  }, [setSubjects]);

  const addSession = useCallback((session: Omit<Session, 'id' | 'notes'>) => {
    const newSession = { ...session, id: `sess-${Date.now()}`, notes: sessionNotes };
    setSessions(prev => [...prev, newSession]);
    setSessionNotes(''); // Clear notes after session
  }, [setSessions, sessionNotes, setSessionNotes]);
  
  const addDeck = useCallback((deck: Omit<Deck, 'id'>) => {
    const now = new Date().toISOString();
    const flashcardsWithSrs: Flashcard[] = deck.flashcards.map((fc, i) => ({
      ...fc,
      id: `fc-${Date.now()}-${i}`,
      srsLevel: 0,
      nextReviewDate: now,
    }))

    const newDeck = { ...deck, id: `deck-${Date.now()}`, flashcards: flashcardsWithSrs };
    setDecks(prev => [...prev, newDeck]);
    return newDeck;
  }, [setDecks]);
  
  const removeDeck = useCallback((deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
    // Also remove associated sessions and flashcards if needed, for now just deck
  }, [setDecks]);

  const allFlashcards = useMemo((): Flashcard[] => {
    return decks.flatMap(deck => 
        deck.flashcards.map((card) => ({
            ...card,
            subjectId: deck.subjectId,
            topic: deck.topic
        }))
    );
  }, [decks]);

  const updateFlashcardSrs = useCallback((flashcardId: string, rating: SrsRating) => {
    setDecks(prevDecks => {
      return prevDecks.map(deck => {
        const cardIndex = deck.flashcards.findIndex(c => c.id === flashcardId);
        if (cardIndex === -1) {
          return deck;
        }

        const card = deck.flashcards[cardIndex];
        let newSrsLevel = card.srsLevel || 0;
        let nextIntervalDays;

        switch (rating) {
            case 'forgot':
                newSrsLevel = 0;
                nextIntervalDays = 1; // Show again tomorrow
                break;
            case 'hard':
                // Stays at the same level, but reviews sooner
                nextIntervalDays = Math.max(1, Math.pow(2, newSrsLevel -1));
                break;
            case 'good':
                newSrsLevel++;
                nextIntervalDays = Math.pow(2, newSrsLevel);
                break;
            case 'easy':
                newSrsLevel += 2; // Jumps a level
                nextIntervalDays = Math.pow(2, newSrsLevel);
                break;
        }

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + nextIntervalDays);

        const updatedCard = {
          ...card,
          srsLevel: newSrsLevel,
          nextReviewDate: nextReviewDate.toISOString(),
        };
        
        const newFlashcards = [...deck.flashcards];
        newFlashcards[cardIndex] = updatedCard;

        return {
          ...deck,
          flashcards: newFlashcards,
        };
      });
    });
  }, [setDecks]);


  const getAllDecks = useCallback(() => {
    const decksBySubject = subjects.map(subject => {
        const subjectDecks = decks
            .filter(deck => deck.subjectId === subject.id)
            .sort((a,b) => a.topic.localeCompare(b.topic));
        
        return {
            subject,
            decks: subjectDecks
        };
    }).filter(s => s.decks.length > 0);
    
    return decksBySubject;
  }, [subjects, decks]);

  const incrementAiQuestionsCount = useCallback(() => {
    setAiQuestionsCount(prev => prev + 1);
  }, [setAiQuestionsCount]);

  return {
    subjects,
    setSubjects,
    addSubject,
    sessions,
    addSession,
    decks,
    setDecks,
    addDeck,
    removeDeck,
    flashcards: allFlashcards,
    updateFlashcardSrs,
    getAllDecks,
    settings,
    setSettings,
    aiQuestionsCount,
    incrementAiQuestionsCount,
    currentSubjectId,
    setCurrentSubjectId,
    sessionNotes,
    setSessionNotes,
  };
}
