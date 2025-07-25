
"use client";

import React, { useMemo } from 'react';
import type { Subject, FlashcardTopic, Deck } from '@/lib/types';
import { Flashcard } from './Flashcard';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, RefreshCw, Trash2, HelpCircle, Share2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import type { Quiz } from '@/ai/flows/generate-quiz';
import { QuizDialog } from './QuizDialog';
import type { Flashcard as FlashcardType, SrsRating } from '@/lib/types';
import { useStudyData } from '@/hooks/use-study-data';
import { Input } from '../ui/input';

interface FlashcardDeckProps {
  deck: Deck & { subjectName: string };
  onRemove: () => void;
}

export function FlashcardDeck({ deck, onRemove }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isShareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [isQuizLoading, setQuizLoading] = React.useState(false);
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [isQuizDialogOpen, setQuizDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { updateFlashcardSrs } = useStudyData();

  const dueFlashcards = useMemo(() => {
    return deck.flashcards.filter(card => !card.nextReviewDate || new Date(card.nextReviewDate) <= new Date());
  }, [deck.flashcards]);
  
  const cardsToStudy = dueFlashcards.length > 0 ? dueFlashcards : deck.flashcards;

  React.useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck.id]);

  if (!cardsToStudy || cardsToStudy.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{deck.topic}</CardTitle>
                <CardDescription>All cards reviewed for today!</CardDescription>
            </CardHeader>
            <CardContent>
                <p className='text-sm text-muted-foreground text-center'>Come back tomorrow to study more.</p>
            </CardContent>
        </Card>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cardsToStudy.length), 100);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cardsToStudy.length) % cardsToStudy.length), 100);
  };
  
  const handleDeleteConfirm = () => {
    onRemove();
    setDeleteDialogOpen(false);
    toast({
      title: "Deck Deleted",
      description: `The "${deck.topic}" deck has been removed.`,
      variant: "destructive"
    });
  }

  const handleTestMe = async () => {
    setQuizLoading(true);
    try {
        const result = await generateQuiz({
            topic: deck.topic,
            flashcards: deck.flashcards,
        });
        setQuiz(result);
        setQuizDialogOpen(true);
    } catch(error) {
        console.error("Quiz generation failed", error);
        toast({
            title: "Quiz Generation Failed",
            description: "Sorry, I couldn't create a quiz right now. Please try again.",
            variant: "destructive"
        })
    } finally {
        setQuizLoading(false);
    }
  }

  const handleSrsRating = (rating: SrsRating) => {
    updateFlashcardSrs(currentCard.id, rating);
    handleNext();
  }

  const handleShare = () => {
    setShareDialogOpen(true);
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ title: 'Link Copied!', description: 'The share link has been copied to your clipboard.' });
  }

  const currentCard = cardsToStudy[currentIndex];
  
  const shareableData = {
      topic: deck.topic,
      summary: deck.summary,
      flashcards: deck.flashcards.map(({ question, answer }) => ({ question, answer }))
  };
  const shareLink = `${window.location.origin}/import?data=${btoa(encodeURIComponent(JSON.stringify(shareableData)))}`;


  return (
    <>
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>{deck.topic}</CardTitle>
            <CardDescription>
              {dueFlashcards.length > 0 ? `Reviewing ${currentIndex + 1} of ${dueFlashcards.length} due cards` : `Practicing all ${deck.flashcards.length} cards`}
            </CardDescription>
          </div>
           <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
           </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Flashcard
            question={currentCard.question}
            answer={currentCard.answer}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />

          {isFlipped ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <Button variant="destructive" onClick={() => handleSrsRating('forgot')}>Forgot</Button>
                <Button variant="outline" onClick={() => handleSrsRating('hard')}>Hard</Button>
                <Button variant="outline" onClick={() => handleSrsRating('good')}>Good</Button>
                <Button variant="secondary" onClick={() => handleSrsRating('easy')}>Easy</Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={handlePrev} disabled={cardsToStudy.length <= 1}>
                <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsFlipped(!isFlipped)} className="w-24">
                <RefreshCw className="mr-2 h-4 w-4" />
                Flip
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext} disabled={cardsToStudy.length <= 1}>
                <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
          )}
          
          <Button variant="secondary" className="w-full" onClick={handleTestMe} disabled={isQuizLoading}>
            <HelpCircle className="mr-2 h-4 w-4" />
            {isQuizLoading ? 'Generating Quiz...' : 'Test Me!'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete all flashcards from the "{deck.topic}" deck.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete Deck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isShareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Deck</DialogTitle>
            <DialogDescription>
              Anyone with this link will be able to import a copy of your "{deck.topic}" deck.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 pt-4">
            <Input value={shareLink} readOnly />
            <Button type="button" size="sm" onClick={() => handleCopyLink(shareLink)}>
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {quiz && (
        <QuizDialog
            quiz={quiz}
            open={isQuizDialogOpen}
            onOpenChange={setQuizDialogOpen}
        />
      )}
    </>
  );
}
