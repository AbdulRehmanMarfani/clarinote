
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useStudyData } from '@/hooks/use-study-data';
import { Flashcard } from './Flashcard';
import { Button } from '../ui/button';
import { PlusCircle, Loader2, FileUp, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import { generateFlashcards } from '@/ai/flows/generate-flashcards';
import type { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { FlashcardDeck } from './FlashcardDeck';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

type InputMode = 'text' | 'file';
type GeneratedData = GenerateFlashcardsOutput;

export function FlashcardsClient() {
  const { subjects, addDeck, decks, removeDeck } = useStudyData();
  const [isGeneratorOpen, setGeneratorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedData | null>(null);
  const [currentGeneratedCardIndex, setCurrentGeneratedCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
  const [topicName, setTopicName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const { toast } = useToast();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const flashcardDecksBySubject = useMemo(() => {
    if (!isHydrated) return [];
    
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
  }, [subjects, decks, isHydrated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast({ title: "Invalid File Type", description: "Please select a PDF file.", variant: "destructive"});
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  }
  
  const resetGenerator = () => {
    setGenerated(null);
    setCurrentGeneratedCardIndex(0);
    setIsFlipped(false);
    setTextInput('');
    setSelectedFile(null);
    setTopicName('');
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !topicName.trim() || isLoading) {
        if(!topicName.trim()){
            toast({ title: "Topic name is required", description: "Please provide a name for this deck.", variant: "destructive" });
        }
        return;
    }
    
    let genInput: { inputType: 'text' | 'pdf'; inputText?: string; pdfDataUri?: string };

    if (inputMode === 'text') {
      if (!textInput.trim()) {
        toast({ title: "Input is empty", description: "Please enter some text to generate flashcards.", variant: "destructive" });
        return;
      }
      genInput = { inputType: 'text', inputText: textInput };
    } else if (inputMode === 'file') {
      if (!selectedFile) {
        toast({ title: "No file selected", description: "Please select a PDF file to generate flashcards.", variant: "destructive" });
        return;
      }
      
      setIsLoading(true);

      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const pdfDataUri = reader.result as string;
        genInput = { inputType: 'pdf', pdfDataUri };
        await runGeneration(genInput);
      };
      reader.onerror = () => {
        toast({ title: "Error reading file", variant: "destructive" });
        setIsLoading(false);
      }
      return;
    } else {
        toast({ title: "Invalid input type", variant: "destructive" });
        return;
    }
    
    await runGeneration(genInput);
  };
  
  const runGeneration = async (input: { inputType: 'text' | 'pdf'; inputText?: string; pdfDataUri?: string }) => {
    setIsLoading(true);
    setGenerated(null);
    setCurrentGeneratedCardIndex(0);
    setIsFlipped(false);

    try {
      const result = await generateFlashcards(input);
      if(result.flashcards.length > 0) {
        setGenerated(result);
      } else {
        toast({ title: "No flashcards generated", description: "The AI couldn't find any concepts to turn into flashcards. Try deleting and regenerating.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error)?.message || 'An unknown error occurred.';
      if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
          toast({
              title: "AI Model is Busy",
              description: "The AI is experiencing high demand right now. Please try again in a few moments.",
              variant: "destructive"
          });
      } else {
          toast({ title: "Error Generating Flashcards", description: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveFlashcards = () => {
    if (!generated || !selectedSubjectId || !topicName.trim()) return;
    
    addDeck({
        subjectId: selectedSubjectId,
        topic: topicName.trim(),
        summary: generated.summary,
        flashcards: generated.flashcards,
    });

    toast({ title: "Deck Saved!", description: `${generated.flashcards.length} cards added to '${topicName}'.` });
    setGeneratorOpen(false);
    resetGenerator();
  };

  const handleNextCard = () => {
    if (!generated) return;
    setIsFlipped(false);
    setCurrentGeneratedCardIndex((prev) => (prev + 1) % generated.flashcards.length);
  }

  const handlePrevCard = () => {
    if (!generated) return;
    setIsFlipped(false);
    setCurrentGeneratedCardIndex((prev) => (prev - 1 + generated.flashcards.length) % generated.flashcards.length);
  }

  if (!isHydrated) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading your decks...</p>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Flashcard Decks</h1>
        <Button onClick={() => { setGeneratorOpen(true); resetGenerator(); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Generate New Deck
        </Button>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">You don't have any flashcard decks yet.</p>
            <Button variant="link" onClick={() => { setGeneratorOpen(true); resetGenerator(); }}>Generate your first deck!</Button>
        </div>
      ) : (
        <div className="space-y-6">
            {flashcardDecksBySubject.map(({ subject, decks }) => (
                <div key={subject.id} className="space-y-4">
                    <h2 className="text-2xl font-semibold">{subject.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {decks.map(deck => (
                            <FlashcardDeck 
                                key={deck.id}
                                deck={{
                                    ...deck,
                                    subjectName: subject.name,
                                }}
                                onRemove={() => removeDeck(deck.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}

      <Dialog open={isGeneratorOpen} onOpenChange={setGeneratorOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI Flashcard Generator</DialogTitle>
            <DialogDescription>
              Generate a new deck of flashcards and a topic summary from your notes or a PDF file.
            </DialogDescription>
          </DialogHeader>
          
          {!generated && (
            <form onSubmit={handleGenerate}>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="subject-select">Subject</Label>
                       <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} required>
                          <SelectTrigger id="subject-select">
                              <SelectValue placeholder="Select a subject..." />
                          </SelectTrigger>
                          <SelectContent>
                              {subjects.length > 0 ? (
                                  subjects.map(subject => (
                                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                                  ))
                              ) : (
                                  <div className="text-center text-sm text-muted-foreground p-4">Please add a subject in Settings first.</div>
                              )}
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="topic-name">Topic / Deck Name</Label>
                        <Input id="topic-name" value={topicName} onChange={e => setTopicName(e.target.value)} placeholder="e.g., Chapter 1" required />
                    </div>
                  </div>

                  <Tabs defaultValue="text" onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
                      <TabsList className='grid w-full grid-cols-2'>
                          <TabsTrigger value="text">Paste Text</TabsTrigger>
                          <TabsTrigger value="file">Upload PDF</TabsTrigger>
                      </TabsList>
                      <TabsContent value="text" >
                         <Textarea name="inputText" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Paste your notes here..." rows={8} />
                      </TabsContent>
                      <TabsContent value="file">
                         <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-40">
                           <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                           <Input id="pdf-upload" type="file" onChange={handleFileChange} accept="application/pdf" className="hidden"/>
                           <Label htmlFor="pdf-upload" className={cn(buttonVariants({ variant: "link" }), "cursor-pointer")}>
                            {selectedFile ? `Selected: ${selectedFile.name}` : 'Select a PDF file'}
                           </Label>
                           {selectedFile && <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                         </div>
                      </TabsContent>
                  </Tabs>
                  <Button type="submit" disabled={isLoading || !selectedSubjectId} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Flashcards
                  </Button>
                </div>
            </form>
          )}

          {generated && (
            <div className='flex-1 flex flex-col min-h-0'>
                <ScrollArea className="flex-1 -mx-6">
                    <div className='px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        <Card className="w-full">
                            <CardContent className="p-4 space-y-4">
                                <Flashcard 
                                    question={generated.flashcards[currentGeneratedCardIndex].question}
                                    answer={generated.flashcards[currentGeneratedCardIndex].answer}
                                    isFlipped={isFlipped}
                                    onFlip={() => setIsFlipped(!isFlipped)}
                                />
                                <div className="flex items-center justify-between">
                                    <Button variant="outline" size="icon" onClick={handlePrevCard}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        {currentGeneratedCardIndex + 1} / {generated.flashcards.length}
                                    </div>
                                    <Button variant="outline" size="icon" onClick={handleNextCard}>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button onClick={() => setIsFlipped(!isFlipped)} variant="secondary" className="w-full">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Flip Card
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 h-full flex flex-col">
                                <Label>AI Generated Summary</Label>
                                <ScrollArea className="h-64 mt-2 p-3 rounded-md border bg-muted/50 flex-1">
                                <p className="text-sm">{generated.summary}</p>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
                <div className="mt-auto pt-4 border-t">
                    <Button onClick={handleSaveFlashcards} className="w-full">Save This Deck</Button>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
