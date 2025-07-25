
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Bot,
  Menu,
  TimerIcon,
} from 'lucide-react';

import { Button, buttonVariants } from './ui/button';
import { AiAssistantSheet } from './assistant/AiAssistantSheet';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from './ThemeToggle';
import { Separator } from './ui/separator';
import { PageTransition } from './PageTransition';
import Image from 'next/image';

const ClariNoteLogo = () => (
    <Image src="/logo.svg" alt="ClariNote Logo" width={28} height={28} />
);

const navItems = [
  { href: '/', label: 'Focus Timer', icon: TimerIcon },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAssistantOpen, setAssistantOpen] = React.useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = React.useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-14 flex items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="flex items-center gap-2">
                <ClariNoteLogo />
                <span className="font-bold">ClariNote</span>
            </Link>
          </div>
          
          {isMobile ? (
             <Sheet open={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto">
                        <Menu />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs pr-0">
                    <SheetHeader className="p-4 pt-6 text-left">
                        <SheetTitle className="flex items-center gap-2">
                            <ClariNoteLogo />
                            <span className="font-bold">ClariNote</span>
                        </SheetTitle>
                        <SheetDescription className="sr-only">Main navigation links for the application.</SheetDescription>
                    </SheetHeader>
                    <nav className="flex flex-col gap-2 p-4 text-lg">
                        {navItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileNavOpen(false)}
                            className={cn(
                                "transition-colors hover:text-foreground/80 flex items-center p-2 rounded-md text-base",
                                pathname === item.href ? "bg-secondary text-foreground font-semibold" : "text-foreground/60"
                            )}
                          >
                            <item.icon className="size-5 mr-3" />
                            {item.label}
                          </Link>
                        ))}
                    </nav>
                    <Separator />
                     <div className="flex flex-col gap-2 p-4">
                        <Button 
                            onClick={() => { setAssistantOpen(true); setMobileNavOpen(false); }} 
                            variant="ghost" 
                            className="justify-start p-2 text-base text-foreground/60">
                            <Bot className="size-5 mr-3" />
                            AI Assistant
                        </Button>
                        <div className="flex items-center justify-between p-2 text-foreground/60">
                             <span className='text-base'>Theme</span>
                            <ThemeToggle />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
          ) : (
            <>
                <nav className="hidden md:flex items-center gap-4 text-sm lg:gap-6">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "transition-colors hover:text-foreground/80",
                            pathname === item.href ? "text-foreground" : "text-foreground/60",
                            buttonVariants({ 
                                variant: pathname === item.href ? 'secondary' : 'ghost',
                                size: 'sm'
                            })
                        )}
                    >
                        <item.icon className="size-4 mr-2" />
                        {item.label}
                    </Link>
                    ))}
                </nav>
                <div className="flex flex-1 items-center justify-end gap-2">
                    <Button onClick={() => setAssistantOpen(true)} variant="ghost" size="sm">
                    <Bot className="mr-2 h-4 w-4" />
                    AI Assistant
                    </Button>
                    <ThemeToggle />
                </div>
            </>
          )}

        </div>
      </header>
      <main className="flex-1 pb-16 md:pb-0">
        <PageTransition>
          {children}
        </PageTransition>
        <AiAssistantSheet
            open={isAssistantOpen}
            onOpenChange={setAssistantOpen}
        />
      </main>
    </div>
  );
}
