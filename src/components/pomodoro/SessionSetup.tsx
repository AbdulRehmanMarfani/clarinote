
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStudyData } from '@/hooks/use-study-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Settings, PlusCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';

export function SessionSetup() {
  const { subjects, currentSubjectId, setCurrentSubjectId, sessionNotes, setSessionNotes, addSubject } = useStudyData();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAddSubjectOpen, setAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSaveNewSubject = () => {
    if (newSubjectName && newSubjectName.trim() !== '') {
      const newSubject = addSubject({ name: newSubjectName.trim() });
      setCurrentSubjectId(newSubject.id);
      setNewSubjectName('');
      setAddSubjectOpen(false);
    }
  };

  if (!isHydrated) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Session Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
              <CardTitle>Session Setup</CardTitle>
          </div>
          <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
              </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject">Study Subject</Label>
              <Button variant="ghost" size="sm" onClick={() => setAddSubjectOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            {subjects.length > 0 ? (
              <Select value={currentSubjectId ?? ""} onValueChange={setCurrentSubjectId}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Choose your subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 text-sm text-muted-foreground border rounded-md bg-muted/50 flex flex-col items-center justify-center text-center">
                <p className="mb-2">No subjects found.</p>
                <Button variant="secondary" onClick={() => setAddSubjectOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add your first subject
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="What are you working on?" 
              rows={5}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddSubjectOpen} onOpenChange={setAddSubjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Enter a name for your new study subject.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-subject-name" className="sr-only">
              Subject Name
            </Label>
            <Input
              id="new-subject-name"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g., Quantum Physics"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveNewSubject}>Save Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
