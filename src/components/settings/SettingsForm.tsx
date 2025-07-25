"use client";

import React, { useState } from 'react';
import { useStudyData } from '@/hooks/use-study-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

export function SettingsForm() {
  const { settings, setSettings, subjects, setSubjects, addSubject } = useStudyData();
  const [pomodoroSettings, setPomodoroSettings] = useState(settings.pomodoro);
  const [newSubjectName, setNewSubjectName] = useState('');
  const { toast } = useToast();

  const handlePomodoroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPomodoroSettings({ ...pomodoroSettings, [e.target.name]: Number(e.target.value) });
  };

  const savePomodoroSettings = () => {
    setSettings(prev => ({ ...prev, pomodoro: pomodoroSettings }));
    toast({ title: 'Pomodoro settings saved!' });
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    addSubject({ name: newSubjectName });
    setNewSubjectName('');
    toast({ title: 'Subject added!', description: `"${newSubjectName}" is now available.` });
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    toast({ title: 'Subject removed.', variant: 'destructive' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your ClariNote experience.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pomodoro Timer</CardTitle>
          <CardDescription>Set the durations for your focus and break sessions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workMinutes">Focus (minutes)</Label>
              <Input id="workMinutes" name="workMinutes" type="number" value={pomodoroSettings.workMinutes} onChange={handlePomodoroChange} />
            </div>
            <div>
              <Label htmlFor="shortBreakMinutes">Short Break (minutes)</Label>
              <Input id="shortBreakMinutes" name="shortBreakMinutes" type="number" value={pomodoroSettings.shortBreakMinutes} onChange={handlePomodoroChange} />
            </div>
            <div>
              <Label htmlFor="longBreakMinutes">Long Break (minutes)</Label>
              <Input id="longBreakMinutes" name="longBreakMinutes" type="number" value={pomodoroSettings.longBreakMinutes} onChange={handlePomodoroChange} />
            </div>
            <div>
              <Label htmlFor="sessionsPerLongBreak">Sessions per Long Break</Label>
              <Input id="sessionsPerLongBreak" name="sessionsPerLongBreak" type="number" value={pomodoroSettings.sessionsPerLongBreak} onChange={handlePomodoroChange} />
            </div>
          </div>
          <Button onClick={savePomodoroSettings}>Save Timer Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>Manage your study subjects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className='space-y-2'>
                {subjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                        <span>{subject.name}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeSubject(subject.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <Separator />
            <form onSubmit={handleAddSubject} className="flex gap-2">
                <Input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="New subject name..." />
                <Button type="submit">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add
                </Button>
            </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Distraction Blocker</CardTitle>
          <CardDescription>List of websites to block during focus sessions (requires browser extension).</CardDescription>
        </CardHeader>
        <CardContent>
            <p className='text-sm text-center text-muted-foreground p-8'>The ClariNote browser extension is coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
