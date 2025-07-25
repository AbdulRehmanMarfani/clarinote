
"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useStudyData } from '@/hooks/use-study-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Bot, BookOpen, Timer, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from 'next-themes';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ProgressDashboard() {
  const { sessions, subjects, flashcards, aiQuestionsCount } = useStudyData();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();


  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const totalStudyTime = useMemo(() => sessions.reduce((acc, s) => acc + s.duration, 0), [sessions]);
  const totalSessions = sessions.length;
  const totalFlashcards = flashcards.length;

  const studyTimeBySubject = useMemo(() => {
    const data = subjects.map(subject => ({
      name: subject.name,
      minutes: 0,
    }));

    sessions.forEach(session => {
      const subject = subjects.find(s => s.id === session.subjectId);
      if (subject) {
        const subjectData = data.find(d => d.name === subject.name);
        if (subjectData) {
          subjectData.minutes += Math.round(session.duration / 60);
        }
      }
    });

    return data.filter(d => d.minutes > 0);
  }, [sessions, subjects]);
  
  const handleExport = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);

    try {
        const canvas = await html2canvas(dashboardRef.current, {
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
            scale: 2,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height],
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('ClariNote_Progress_Report.pdf');
    } catch (error) {
        console.error("Failed to export PDF", error);
    } finally {
        setIsExporting(false);
    }
  }

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Progress</h1>
        <Button onClick={handleExport} variant="outline" disabled={isExporting}>
            {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isExporting ? 'Exporting...' : 'Export as PDF'}
        </Button>
      </div>
      
      <div ref={dashboardRef} className="space-y-8 bg-background p-4 rounded-lg">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{Math.floor(totalStudyTime / 3600)}h {Math.floor((totalStudyTime % 3600) / 60)}m</div>
                <p className="text-xs text-muted-foreground">Across {totalSessions} sessions</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flashcards Created</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalFlashcards}</div>
                <p className="text-xs text-muted-foreground">Across {subjects.length} subjects</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Questions</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{aiQuestionsCount}</div>
                <p className="text-xs text-muted-foreground">Questions asked</p>
            </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Study Time by Subject</CardTitle>
            <CardDescription>Total minutes spent focusing on each subject.</CardDescription>
            </CardHeader>
            <CardContent>
                {studyTimeBySubject.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={studyTimeBySubject} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis unit="m" />
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                        />
                        <Legend />
                        <Bar dataKey="minutes" fill="var(--color-chart-1)" name="Study Minutes" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-center text-muted-foreground">
                        <p>No study sessions recorded yet. <br/> Start the timer to see your progress!</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
