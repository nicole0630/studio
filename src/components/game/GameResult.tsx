"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, RotateCcw, Home, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface GameResultProps {
  score: number;
  totalNotes: number;
  misses: number;
  onPlayAgain: () => void;
}

export function GameResult({ score, totalNotes, misses, onPlayAgain }: GameResultProps) {
  const accuracy = totalNotes > 0 ? Math.round(((totalNotes - misses) / totalNotes) * 100) : 0;
  let message = "Good Effort!";
  if (accuracy > 90) message = "Amazing Performance!";
  else if (accuracy > 75) message = "Great Job!";
  else if (accuracy > 50) message = "Nice Try!";

  return (
    <Card className="w-full max-w-lg text-center p-6 rounded-2xl shadow-xl clay-inset bg-card/90 backdrop-blur-sm">
      <CardHeader className="items-center">
        <Award size={72} className="text-accent animate-pulse" />
        <CardTitle className="text-4xl font-extrabold text-primary mt-4">
          {message}
        </CardTitle>
        <CardDescription className="text-lg text-foreground/80 mt-2">
          You've completed the rhythm!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-semibold">
          Final Score: <span className="text-accent">{score}</span>
        </div>
        <div className="flex justify-around text-lg">
          <p className="flex items-center gap-1">
            <TrendingUp className="text-green-500" /> Hits: <span className="font-medium">{totalNotes - misses} / {totalNotes}</span>
          </p>
          <p className="flex items-center gap-1">
            <TrendingDown className="text-red-500" /> Accuracy: <span className="font-medium">{accuracy}%</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <Button onClick={onPlayAgain} size="lg" className="rounded-xl clay-button hover:scale-105 transition-transform duration-200 ease-out bg-primary hover:bg-primary/90 text-primary-foreground">
          <RotateCcw size={24} className="mr-2" /> Play Again
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-xl clay-button hover:scale-105 transition-transform duration-200 ease-out border-accent text-accent hover:bg-accent/10">
          <Link href="/">
            <Home size={24} className="mr-2" /> Other Games
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
