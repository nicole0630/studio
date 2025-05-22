"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SwingingCharacter } from '@/components/game/SwingingCharacter';
import { RhythmBar, type Note } from '@/components/game/RhythmBar';
import { GameResult } from '@/components/game/GameResult';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, Music2 } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

const song1 = "/songs/butterfly.mp3";
const song2 = "/songs/field.mp3";
const song3 = "/songs/star.mp3";
const song4 = "/songs/tigers.mp3";

const BASE_NOTE_SPEED = 5;
const BASE_NOTE_SPACING = 220;
const TARGET_ZONE_START = 50;
const TARGET_ZONE_END = 150;
const GAME_DURATION_MS = 60000;

interface Song {
  id: string;
  name: string;
  pattern: ('l' | 'r' | 's')[];
  tempoFactor: number;
}

const SONGS_DATA: Song[] = [
  {
    id: 'song1',
    name: '蝴蝶',
    pattern: ['l', 's', 'r', 's', 'l', 'l', 's', 'r', 'r', 's', 'l', 's', 'r', 'l', 'r'],
    tempoFactor: 0.8,
  },
  {
    id: 'song2',
    name: '王老先生有塊地',
    pattern: ['l', 'r', 'l', 's', 'r', 'l', 'r', 's', 'l', 'r', 'l', 'r', 'l', 's', 'r', 'l', 'r', 'r'],
    tempoFactor: 1.0,
  },
  {
    id: 'song3',
    name: '小星星',
    pattern: ['l', 'r', 'l', 'r', 'l', 'l', 'r', 'r', 'l', 'r', 'l', 'r', 's', 'l', 'r', 'l', 'r', 'l', 'l', 'r', 'r'],
    tempoFactor: 1.2,
  },
  {
    id: 'song4',
    name: '兩隻老虎',
    pattern: ['l','r','l','r','s','l','r','l','r','s','l','l','r','r','s','l','r','l','r','l','r','s','l','r','l','r'],
    tempoFactor: 1.4,
  },
];

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
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [totalNotesInSong, setTotalNotesInSong] = useState(0);
  const [effectiveNoteSpeed, setEffectiveNoteSpeed] = useState(BASE_NOTE_SPEED);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 確保音頻元素在組件掛載時創建
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
      console.log("音頻元素已創建");
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const gameOverReasonRef = useRef(gameOverReason);
  useEffect(() => { gameOverReasonRef.current = gameOverReason; }, [gameOverReason]);

  const generateNotesForSong = useCallback((song: Song) => {
    const newNotes: Note[] = [];
    let currentPosition = 800;
    let noteIdCounter = 0;
    const songSpecificSpacing = BASE_NOTE_SPACING / song.tempoFactor;

    song.pattern.forEach((p) => {
      if (p === 'l' || p === 'r') {
        newNotes.push({
          id: noteIdCounter++,
          position: currentPosition,
          type: p === 'l' ? 'left' : 'right',
          hit: false,
          missed: false,
        });
        currentPosition += songSpecificSpacing;
      } else if (p === 's') {
        currentPosition += songSpecificSpacing * 0.6;
      }
    });

    setNotes(newNotes);
    const actualNotesCount = song.pattern.filter(char => char === 'l' || char === 'r').length;
    setTotalNotesInSong(actualNotesCount);
  }, []);

  const startGame = () => {
    const randomSongIndex = Math.floor(Math.random() * SONGS_DATA.length);
    const selectedSong = SONGS_DATA[randomSongIndex];
    setCurrentSong(selectedSong);
    setEffectiveNoteSpeed(BASE_NOTE_SPEED * selectedSong.tempoFactor);
    generateNotesForSong(selectedSong);
  
    setScore(0);
    setCombo(0);
    setMisses(0);
    setNotesPlayed(0);
    setSwingDirection("center");
    setTimeLeft(GAME_DURATION_MS / 1000);
    setGameOverReason(null);
    setGameState("playing");
  
    // 改進音樂播放邏輯
    if (audioRef.current) {
      const audio = audioRef.current;
      const audioSrcMap: Record<string, string> = {
        song1: song1,
        song2: song2,
        song3: song3,
        song4: song4,
      };

      // 重置音頻元素
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1.0;
      audio.preload = "auto";
      
      // 使用 Promise 處理播放
      const playAudio = async () => {
        try {
          await audio.play();
        } catch (error) {
          console.error("播放音樂失敗：", error);
          alert("無法播放音樂，請確保您的瀏覽器允許播放音頻。");
        }
      };

      // 設置音頻源並開始加載
      audio.src = audioSrcMap[selectedSong.id];
      audio.load();

      // 監聽加載完成事件
      audio.oncanplaythrough = () => {
        playAudio();
        audio.oncanplaythrough = null;
      };

      // 錯誤處理
      audio.onerror = () => {
        alert(`無法加載音樂文件：${selectedSong.name}\n請檢查網絡連接或刷新頁面重試。`);
      };
    } else {
      alert("音頻系統初始化失敗，請刷新頁面重試。");
    }
  };

  const handleMiss = useCallback((noteId: number) => {
    if (gameStateRef.current !== 'playing') return;
    setNotes(prevNotes => prevNotes.map(n => n.id === noteId && !n.hit ? {...n, missed: true} : n));
    setCombo(0);
    setMisses(m => m + 1);
    setNotesPlayed(p => p + 1);
    setGameOverReason("miss");
    setGameState("gameOver");
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    const gameInterval = setInterval(() => {
      setNotes(prevNotes =>
        prevNotes.map(note => ({
          ...note,
          position: Math.max(-100, note.position - effectiveNoteSpeed),
        })).filter(note => note.position > -100)
      );

      setTimeLeft(prevTime => {
        if (prevTime <= (16 / 1000)) {
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
  }, [gameState, effectiveNoteSpeed]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const notePassedBy = notes.find(
      note => !note.hit && !note.missed && note.position < TARGET_ZONE_START - 50
    );

    if (notePassedBy) {
      handleMiss(notePassedBy.id);
    }
  }, [notes, gameState, handleMiss]);

  useEffect(() => {
    if (gameState !== "playing" || !currentSong || totalNotesInSong === 0) return;
    if (notesPlayed >= totalNotesInSong) {
      if (gameOverReasonRef.current === null) {
        setGameOverReason("completed");
      }
      setGameState("gameOver");
    }
  }, [notesPlayed, gameState, currentSong, totalNotesInSong]);

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
        handleMiss(currentNote.id);
      }
    } else {
      setCombo(0);
    }
  }, [gameState, notes, combo, handleMiss]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 停止音樂
  useEffect(() => {
    if (gameState === "gameOver" && audioRef.current) {
      audioRef.current.pause();
    }
  }, [gameState]);

  if (gameState === "initial") {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h2 className="text-3xl font-semibold text-primary">Ready to Swing?</h2>
        <p className="text-lg text-muted-foreground">Use Left & Right Arrow keys to hit the notes!</p>
        <Button onClick={startGame} size="lg" className="rounded-lg text-xl px-8 py-4 clay-button bg-accent hover:bg-accent/90 text-accent-foreground">
          Start Playing
        </Button>
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    );
  }

  if (gameState === "gameOver") {
    return (
      <>
        <GameResult
          score={score}
          totalNotes={totalNotesInSong}
          misses={misses}
          onPlayAgain={startGame}
          gameOverReason={gameOverReason}
          songName={currentSong?.name || "Unknown Song"}
        />
        <audio ref={audioRef} style={{ display: 'none' }} />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl p-4 space-y-4">
      <div className="flex justify-between items-center w-full text-2xl font-bold">
        <span className="text-primary">Score: {score}</span>
        <span className="text-accent">Combo: {combo}</span>
        <span className="text-destructive">Misses: {misses}</span>
      </div>

      <div className="w-full text-center">
        <p className="text-md text-secondary-foreground flex items-center justify-center gap-2">
          <Music2 size={20} /> Now Playing: <span className="font-semibold">{currentSong?.name || "Loading..."}</span>
        </p>
      </div>

      <div className="w-full">
        <Progress value={(timeLeft / (GAME_DURATION_MS / 1000)) * 100} className="h-4 rounded-lg [&>div]:bg-secondary" />
        <p className="text-center text-sm text-muted-foreground mt-1">Time Left: {Math.ceil(timeLeft)}s</p>
      </div>

      <SwingingCharacter swingDirection={swingDirection} />
      <RhythmBar notes={notes} targetZoneStart={TARGET_ZONE_START} targetZoneEnd={TARGET_ZONE_END} />

      <div className="mt-6 flex space-x-4">
        <Button onClick={startGame} variant="outline" className="rounded-lg clay-button">
          <RefreshCw className="mr-2 h-5 w-5" /> Restart Game
        </Button>
        <Button asChild variant="outline" className="rounded-lg clay-button">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" /> Main Menu
          </Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-2">Use ← and → arrow keys to play!</p>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};
