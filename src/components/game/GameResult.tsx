
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, RotateCcw, Home, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

type GameOverReason = "miss" | "completed" | "timeUp" | null;

interface GameResultProps {
  score: number;
  totalNotes: number;
  misses: number;
  onPlayAgain: () => void;
  gameOverReason: GameOverReason;
}

export function GameResult({ score, totalNotes, misses, onPlayAgain, gameOverReason }: GameResultProps) {
  const accuracy = totalNotes > 0 ? Math.round(((totalNotes - misses) / totalNotes) * 100) : 0;
  let titleMessage = "Good Effort!"; // Default message

  if (gameOverReason === "miss") {
    titleMessage = "回憶模糊"; // "Memories are blurry"
  } else if (gameOverReason === "timeUp") {
    titleMessage = "時間到!"; // "Time's Up!"
  } else if (gameOverReason === "completed") {
    if (accuracy > 90) titleMessage = "Amazing Performance!";
    else if (accuracy > 75) titleMessage = "Great Job!";
    else if (accuracy > 50) titleMessage = "Nice Try!";
    // "Good Effort!" remains if none of the above for "completed"
  }


  return (
    <Card className="w-full max-w-lg text-center p-6 rounded-2xl shadow-xl clay-inset bg-card/90 backdrop-blur-sm">
      <CardHeader className="items-center">
        <Award size={72} className="text-accent animate-pulse" />
        <CardTitle className="text-4xl font-extrabold text-primary mt-4">
          {titleMessage}
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
