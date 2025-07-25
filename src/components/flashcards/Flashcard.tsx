"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  question: string;
  answer: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ question, answer, isFlipped, onFlip }: FlashcardProps) {
  // Custom styles are used here to ensure the 3D transform works reliably,
  // as it can be tricky with pure Tailwind classes.
  const cardContainerStyle: React.CSSProperties = {
    perspective: '1000px',
  };

  const cardInnerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transition: 'transform 0.7s',
    transformStyle: 'preserve-3d',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const cardFaceStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden', // for Safari
  };

  const cardBackStyle: React.CSSProperties = {
    ...cardFaceStyle,
    transform: 'rotateY(180deg)',
  };

  return (
    <div
      style={cardContainerStyle}
      className="w-full h-64 cursor-pointer"
      onClick={onFlip}
    >
      <div style={cardInnerStyle}>
        {/* Front of the card (Question) */}
        <div style={cardFaceStyle}>
          <Card className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <p className="text-sm text-muted-foreground">Question</p>
              <p className="text-xl font-semibold">{question}</p>
            </CardContent>
          </Card>
        </div>

        {/* Back of the card (Answer) */}
        <div style={cardBackStyle}>
          <Card className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-secondary">
             <CardContent className="flex flex-col items-center justify-center gap-4">
              <p className="text-sm text-muted-foreground">Answer</p>
              <p className="text-lg">{answer}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
