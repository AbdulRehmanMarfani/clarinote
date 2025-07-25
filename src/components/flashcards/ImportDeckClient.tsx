
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStudyData } from '@/hooks/use-study-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import type { Deck } from '@/lib/types';
import Link from 'next/link';

type ImportedDeck = Omit<Deck, 'id' | 'subjectId'>;

function ImportDeckComponent() {
  const searchParams = useSearchParams();
  const { subjects, addDeck, addSubject } = useStudyData();
  const { toast } = useToast();
  
  const [decodedData, setDecodedData] = useState<ImportedDeck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(data)));
        // Basic validation
        if (decoded.topic && Array.isArray(decoded.flashcards)) {
          setDecodedData(decoded);
        } else {
          setError("The link is invalid or corrupted. The deck data is not in the correct format.");
        }
      } catch (e) {
        setError("Could not read the deck data from the link. It might be corrupted or invalid.");
      }
    } else {
      setError("No deck data found in the link.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const handleImport = () => {
    if (!decodedData || !selectedSubjectId) {
      toast({ title: 'Error', description: 'Cannot import deck. Please select a subject.', variant: 'destructive' });
      return;
    }
    
    setIsImporting(true);
    
    addDeck({
      subjectId: selectedSubjectId,
      topic: decodedData.topic,
      summary: decodedData.summary || `Imported deck for ${decodedData.topic}`,
      flashcards: decodedData.flashcards,
    });
    
    setTimeout(() => {
        setIsImporting(false);
        setIsImported(true);
        toast({ title: 'Success!', description: `The deck "${decodedData.topic}" has been added to your collection.` });
    }, 1000);
  };

  if (error) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Import Error</CardTitle>
          <CardDescription>We couldn't import the deck from this link.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
          <Button asChild className="mt-4 w-full">
            <Link href="/flashcards">Go to My Decks</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!decodedData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Reading deck data...</p>
      </div>
    );
  }
  
  if (isImported) {
      return (
        <Card className="max-w-xl mx-auto text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2"><CheckCircle className="text-green-500" /> Deck Imported!</CardTitle>
          <CardDescription>The deck is now available in your flashcards section.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="mt-4 w-full">
            <Link href="/flashcards">View My Decks</Link>
          </Button>
        </CardContent>
      </Card>
      )
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Import Deck</CardTitle>
        <CardDescription>You've been invited to import a deck. Choose a subject to add it to.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-md bg-muted/50">
          <p className="font-semibold text-lg">{decodedData.topic}</p>
          <p className="text-sm text-muted-foreground">{decodedData.flashcards.length} cards</p>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="subject-select">Add to Subject</Label>
            {subjects.length > 0 ? (
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                    <SelectTrigger id="subject-select">
                        <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <div className="p-3 text-sm text-muted-foreground border rounded-md bg-muted/50 text-center">
                    <p>You don't have any subjects yet. Please create one in Settings first.</p>
                     <Button asChild variant="link"><Link href="/settings">Go to Settings</Link></Button>
                </div>
            )}
        </div>

        <Button onClick={handleImport} disabled={isImporting || !selectedSubjectId} className="w-full">
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isImporting ? 'Importing...' : 'Import This Deck'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ImportDeckClient() {
    return (
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
            <ImportDeckComponent />
        </Suspense>
    )
}
