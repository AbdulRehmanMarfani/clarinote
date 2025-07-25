import { AppShell } from "@/components/AppShell";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";
import { SessionSetup } from "@/components/pomodoro/SessionSetup";

export default function Home() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Focus Timer</h1>
            <p className="text-muted-foreground mt-2">Stay focused with the Pomodoro Technique</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PomodoroTimer />
            <SessionSetup />
        </div>
      </div>
    </AppShell>
  );
}
