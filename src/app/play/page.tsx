"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { SwingingCharacter } from '@/components/game/SwingingCharacter';
import { RhythmBar } from '@/components/game/RhythmBar';
import { GameResult } from '@/components/game/GameResult';
import type { Note } from '@/components/game/RhythmBar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

const TOTAL_NOTES = 20;
const NOTE_SPEED = 5; // pixels per frame (approx)
const TARGET_ZONE_START = 50; // For rhythm bar
const TARGET_ZONE_END = 150;  // For rhythm bar
const GAME_DURATION_MS = 60000; // 1 minute, or handle by number of notes

type GameState = "initial" | "playing" | "paused" | "gameOver";

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState>("initial");
  const [score, setScore] = useState(0);
  const [swingDirection, setSwingDirection] = useState<"left" | "right" | "center">("center");
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [notesPlayed, setNotesPlayed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS / 1000);


  const generateInitialNotes = useCallback(() => {
    const newNotes: Note[] = [];
    for (let i = 0; i < TOTAL_NOTES; i++) {
      newNotes.push({
        id: i,
        position: 800 + i * 200, // Start off-screen, spaced out
        type: Math.random() > 0.5 ? 'left' : 'right',
        hit: false,
        missed: false,
      });
    }
    setNotes(newNotes);
  }, []);
  
  const startGame = () => {
    generateInitialNotes();
    setScore(0);
    setCombo(0);
    setMisses(0);
    setNotesPlayed(0);
    setActiveNoteIndex(0);
    setSwingDirection("center");
    setTimeLeft(GAME_DURATION_MS / 1000);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState === "initial") {
       // Wait for user to click start
    } else if (gameState === 'playing') {
      const gameInterval = setInterval(() => {
        setNotes(prevNotes =>
          prevNotes.map(note => ({
            ...note,
            position: note.hit || note.missed ? note.position : Math.max(0, note.position - NOTE_SPEED),
          })).filter(note => !note.hit && !note.missed && note.position > -50) // Keep notes until they are way past
        );

        // Check for misses for notes that have passed the target zone
         notes.forEach(note => {
          if (!note.hit && !note.missed && note.position < TARGET_ZONE_START - 50) { // Note fully passed target zone
            handleMiss(note.id);
          }
        });

        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState("gameOver");
            clearInterval(gameInterval);
            return 0;
          }
          return prev - (16/1000); // roughly 60fps interval
        });

        if (notesPlayed >= TOTAL_NOTES && notes.every(n => n.hit || n.missed)) {
           setGameState("gameOver");
        }

      }, 16); // Roughly 60 FPS

      return () => clearInterval(gameInterval);
    }
  }, [gameState, notes, notesPlayed, handleMiss]); // Added handleMiss to dependencies

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState !== "playing") return;

    const keyType = event.key === "ArrowLeft" ? "left" : event.key === "ArrowRight" ? "right" : null;
    if (!keyType) return;

    setSwingDirection(keyType);
    setTimeout(() => setSwingDirection("center"), 200); // Return to center after a brief swing

    const currentNote = notes.find(n => !n.hit && !n.missed && n.position >= TARGET_ZONE_START && n.position <= TARGET_ZONE_END);

    if (currentNote && currentNote.type === keyType) {
      setScore(s => s + 10 + combo * 5);
      setCombo(c => c + 1);
      setNotes(prevNotes => prevNotes.map(n => n.id === currentNote.id ? {...n, hit: true} : n));
      setNotesPlayed(p => p + 1);
    } else if (currentNote) {
      // Hit wrong key for an active note or missed timing
      handleMiss(currentNote.id);
    } else {
      // Pressed key with no active note in zone
      setCombo(0); // Break combo on any miss-timed press
    }
  }, [gameState, notes, combo]); // Removed handleMiss from here, it's called from useEffect or on wrong key

  // Define handleMiss outside useEffect or ensure it's stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function handleMiss(noteId: number) {
    setNotes(prevNotes => prevNotes.map(n => n.id === noteId && !n.hit ? {...n, missed: true} : n));
    setCombo(0);
    setMisses(m => m + 1);
    setNotesPlayed(p => p + 1);
  }


  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  if (gameState === "initial") {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h2 className="text-3xl font-semibold text-primary">Ready to Swing?</h2>
        <p className="text-lg text-muted-foreground">Use Left & Right Arrow keys to hit the notes!</p>
        <Button onClick={startGame} size="lg" className="rounded-lg text-xl px-8 py-4 clay-button bg-accent hover:bg-accent/90 text-accent-foreground">
          Start Playing
        </Button>
      </div>
    );
  }
  
  if (gameState === "gameOver") {
    return <GameResult score={score} totalNotes={TOTAL_NOTES} misses={misses} onPlayAgain={startGame} />;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl p-4 space-y-6">
      <div className="flex justify-between w-full text-2xl font-bold">
        <span className="text-primary">Score: {score}</span>
        <span className="text-accent">Combo: {combo}</span>
        <span className="text-destructive">Misses: {misses}</span>
      </div>
      <div className="w-full">
        <Progress value={(timeLeft / (GAME_DURATION_MS / 1000)) * 100} className="h-4 rounded-lg [&>div]:bg-secondary" />
        <p className="text-center text-sm text-muted-foreground mt-1">Time Left: {Math.ceil(timeLeft)}s</p>
      </div>
      
      <SwingingCharacter swingDirection={swingDirection} />
      <RhythmBar notes={notes} targetZoneStart={TARGET_ZONE_START} targetZoneEnd={TARGET_ZONE_END} />

      <div className="mt-8 flex space-x-4">
        <Button onClick={startGame} variant="outline" className="rounded-lg clay-button">
          <RefreshCw className="mr-2 h-5 w-5" /> Restart
        </Button>
        <Button asChild variant="outline" className="rounded-lg clay-button">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" /> Main Menu
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-4">Use ← and → arrow keys to play!</p>
    </div>
  );
}
