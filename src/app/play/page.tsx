
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SwingingCharacter } from '@/components/game/SwingingCharacter';
import { RhythmBar } from '@/components/game/RhythmBar';
import type { Note } from '@/components/game/RhythmBar';
import { GameResult } from '@/components/game/GameResult';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

const TOTAL_NOTES = 20;
const NOTE_SPEED = 5; // pixels per frame (approx)
const TARGET_ZONE_START = 50; // For rhythm bar
const TARGET_ZONE_END = 150;  // For rhythm bar
const GAME_DURATION_MS = 60000; // 1 minute

type GameState = "initial" | "playing" | "paused" | "gameOver";
type GameOverReason = "miss" | "completed" | "timeUp" | null;

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState>("initial");
  const [score, setScore] = useState(0);
  const [swingDirection, setSwingDirection] = useState<"left" | "right" | "center">("center");
  const [notes, setNotes] = useState<Note[]>([]);
  const [combo, setCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [notesPlayed, setNotesPlayed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS / 1000);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>(null);

  // Refs for current state values to use in intervals/callbacks without stale closures
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const gameOverReasonRef = useRef(gameOverReason);
  useEffect(() => { gameOverReasonRef.current = gameOverReason; }, [gameOverReason]);


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
    setSwingDirection("center");
    setTimeLeft(GAME_DURATION_MS / 1000);
    setGameOverReason(null);
    setGameState("playing");
  };

  const handleMiss = useCallback((noteId: number) => {
    if (gameStateRef.current !== 'playing') return; 

    setNotes(prevNotes => prevNotes.map(n => n.id === noteId && !n.hit ? {...n, missed: true} : n));
    setCombo(0); // Use functional update if depending on prev combo: c => 0
    setMisses(m => m + 1);
    setNotesPlayed(p => p + 1);
    setGameOverReason("miss");
    setGameState("gameOver");
  }, []); // Dependencies are stable setters from useState, gameStateRef handles current gameState

  // Game loop for moving notes and decrementing time
  useEffect(() => {
    if (gameState !== "playing") return;

    const gameInterval = setInterval(() => {
      // 1. Update note positions
      setNotes(prevNotes =>
        prevNotes.map(note => ({
          ...note,
          // Active notes move. Hit/missed notes stop to show feedback, will be filtered if they stop moving.
          // To ensure they scroll off, all notes should continue moving or be handled differently.
          // For now, let's assume hit/missed notes might stop, relying on filter for removal.
          // Original behavior: note.hit || note.missed ? note.position : Math.max(0, note.position - NOTE_SPEED)
          // To ensure they clear screen:
          position: Math.max(-100, note.position - NOTE_SPEED),
        })).filter(note => note.position > -100) // Filter when they go far left
      );

      // 2. Update time left
      setTimeLeft(prevTime => {
        if (prevTime <= (16 / 1000)) { // Approx one frame's worth
            if (gameStateRef.current === "playing") { 
                setGameOverReason("timeUp");
                setGameState("gameOver");
            }
            return 0;
        }
        return prevTime - (16 / 1000);
      });
    }, 16); 

    return () => clearInterval(gameInterval);
  }, [gameState]);

  // useEffect for checking misses due to notes passing by
  useEffect(() => {
    if (gameState !== "playing") return;

    const notePassedBy = notes.find(
        note => !note.hit && !note.missed && note.position < TARGET_ZONE_START - 50 
    );

    if (notePassedBy) {
        handleMiss(notePassedBy.id);
    }
  }, [notes, gameState, handleMiss, TARGET_ZONE_START]);

  // useEffect for checking game completion by all notes played
  useEffect(() => {
    if (gameState !== "playing") return;

    if (notesPlayed >= TOTAL_NOTES) {
        // Ensure all notes in the current state array are also accounted for if it's not aggressively filtered
        // const allNotesInStateProcessed = notes.every(n => n.hit || n.missed || n.position < -50);
        // if (allNotesInStateProcessed) {
            if (gameOverReasonRef.current === null) { // Only set to completed if no other reason (like miss) set it first
                setGameOverReason("completed");
            }
            setGameState("gameOver");
        // }
    }
  }, [notesPlayed, gameState, TOTAL_NOTES]); // Removed 'notes' dependency to simplify, relying on notesPlayed

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState !== "playing") return;

    const keyType = event.key === "ArrowLeft" ? "left" : event.key === "ArrowRight" ? "right" : null;
    if (!keyType) return;

    setSwingDirection(keyType);
    setTimeout(() => setSwingDirection("center"), 200); 

    const currentNote = notes.find(n => !n.hit && !n.missed && n.position >= TARGET_ZONE_START && n.position <= TARGET_ZONE_END);

    if (currentNote) {
      if (currentNote.type === keyType) {
        setScore(s => s + 10 + combo * 5);
        setCombo(c => c + 1);
        setNotes(prevNotes => prevNotes.map(n => n.id === currentNote.id ? {...n, hit: true} : n));
        setNotesPlayed(p => p + 1);
      } else {
        // Hit wrong key for an active note
        handleMiss(currentNote.id);
      }
    } else {
      // Pressed key with no active note in zone - this currently only breaks combo
      setCombo(0);
      // If this should also end the game, call handleMiss with a dummy/special ID or modify handleMiss
    }
  }, [gameState, notes, combo, handleMiss, TARGET_ZONE_START, TARGET_ZONE_END]);


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
    return <GameResult 
        score={score} 
        totalNotes={TOTAL_NOTES} 
        misses={misses} 
        onPlayAgain={startGame} 
        gameOverReason={gameOverReason} 
      />;
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
