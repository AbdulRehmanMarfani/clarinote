
"use client";

import React, { useState } from 'react';
import type { Quiz } from '@/ai/flows/generate-quiz';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface QuizDialogProps {
  quiz: Quiz;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuizDialog({ quiz, open, onOpenChange }: QuizDialogProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = optionIndex;
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(quiz.questions.length).fill(null));
    setShowResults(false);
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    if(!isOpen) {
        // Reset state when closing the dialog
        setTimeout(resetQuiz, 300);
    }
    onOpenChange(isOpen);
  }

  const score = selectedAnswers.reduce((acc, answer, index) => {
    if (answer === quiz.questions[index].correctAnswerIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswerForCurrent = selectedAnswers[currentQuestionIndex];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quiz.quizTitle}</DialogTitle>
          <DialogDescription>
            Test your knowledge. Good luck!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {!showResults ? (
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </p>
                <p className="font-semibold">{currentQuestion.questionText}</p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={String(selectedAnswerForCurrent)}
                  onValueChange={(val) => handleSelectAnswer(Number(val))}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(index)} id={`q${currentQuestionIndex}-o${index}`} />
                      <Label htmlFor={`q${currentQuestionIndex}-o${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleNextQuestion} disabled={selectedAnswerForCurrent === null}>
                  {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Quiz Complete!</AlertTitle>
                <AlertDescription>
                  You scored {score} out of {quiz.questions.length}.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {quiz.questions.map((q, index) => {
                    const isCorrect = selectedAnswers[index] === q.correctAnswerIndex;
                    return (
                        <Card key={index} className={cn("border-l-4", isCorrect ? "border-green-500" : "border-red-500")}>
                            <CardHeader>
                                <p className="font-semibold">{q.questionText}</p>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>Your answer: <span className="font-medium">{q.options[selectedAnswers[index]!]}</span></p>
                                {!isCorrect && <p>Correct answer: <span className="font-medium">{q.options[q.correctAnswerIndex]}</span></p>}
                                <p className="text-muted-foreground pt-2">Explanation: {q.explanation}</p>
                            </CardContent>
                        </Card>
                    )
                })}
              </div>

               <Button onClick={resetQuiz} className="w-full">
                    Try Again
                </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
