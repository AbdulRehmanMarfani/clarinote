
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { useStudyData } from '@/hooks/use-study-data';
import type { PomodoroSettings } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export function PomodoroTimer() {
  const { settings, addSession, currentSubjectId } = useStudyData();
  const [isHydrated, setIsHydrated] = useState(false);

  const getDuration = useCallback((mode: TimerMode) => {
    switch (mode) {
      case 'work': return settings.pomodoro.workMinutes * 60;
      case 'shortBreak': return settings.pomodoro.shortBreakMinutes * 60;
      case 'longBreak': return settings.pomodoro.longBreakMinutes * 60;
      default: return settings.pomodoro.workMinutes * 60;
    }
  }, [settings.pomodoro]);

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(getDuration('work'));
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only reset the timer if the settings or mode change, and the timer is not active.
    if (!isActive) {
        setTimeLeft(getDuration(mode));
    }
  }, [settings.pomodoro, mode, getDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Pause the timer
      setIsActive(false);

      if (mode === 'work') {
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);
        if (currentSubjectId) {
          addSession({ 
            subjectId: currentSubjectId, 
            duration: getDuration('work'), 
            startTime: Date.now() - getDuration('work') 
          });
        }
        const nextMode = newSessionCount % settings.pomodoro.sessionsPerLongBreak === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(getDuration(nextMode));
      } else { // break finished
        setMode('work');
        setTimeLeft(getDuration('work'));
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, mode, sessionCount, currentSubjectId, settings.pomodoro.sessionsPerLongBreak, addSession, getDuration]);


  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDuration(mode));
  };
  
  const handleModeChange = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
  const totalDuration = getDuration(mode);
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  const getModeName = (m: TimerMode) => {
    switch(m){
      case 'work': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center gap-6 p-6">
        <div className='flex items-center gap-2 bg-muted p-1 rounded-lg'>
            <Button onClick={() => handleModeChange('work')} variant={mode === 'work' ? 'secondary' : 'ghost'} size="sm" className="w-24">Work</Button>
            <Button onClick={() => handleModeChange('shortBreak')} variant={mode === 'shortBreak' ? 'secondary' : 'ghost'} size="sm" className="w-24">Short Break</Button>
            <Button onClick={() => handleModeChange('longBreak')} variant={mode === 'longBreak' ? 'secondary' : 'ghost'} size="sm" className="w-24">Long Break</Button>
        </div>
        <div className="relative h-64 w-64 my-4">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <circle
              className="stroke-current text-muted"
              strokeWidth="7"
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
            ></circle>
            <circle
              className="stroke-current text-primary transition-all duration-1000 ease-linear"
              strokeWidth="7"
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              transform="rotate(-90 50 50)"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isHydrated ? (
              <>
                <span className="text-5xl font-bold font-mono tabular-nums">{formattedTime}</span>
                <span className="text-sm text-muted-foreground mt-1">{getModeName(mode)}</span>
              </>
            ) : (
               <>
                <Skeleton className="h-14 w-40" />
                <Skeleton className="h-5 w-24 mt-2" />
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={toggleTimer} size="lg" className="w-32" disabled={!isHydrated}>
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="icon" disabled={!isHydrated}>
            <RefreshCw />
          </Button>
        </div>
        {isHydrated ? (
            <p className="text-sm text-muted-foreground">Sessions completed today: {sessionCount}</p>
        ) : (
            <Skeleton className="h-5 w-48" />
        )}
      </CardContent>
    </Card>
  );
}
