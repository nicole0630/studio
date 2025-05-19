"use client";

import React from 'react';
import { MusicalNote } from './MusicalNote';
import { cn } from '@/lib/utils';

export interface Note {
  id: number;
  position: number; // x-coordinate
  type: 'left' | 'right';
  hit: boolean;
  missed: boolean;
}

interface RhythmBarProps {
  notes: Note[];
  targetZoneStart: number;
  targetZoneEnd: number;
}

export function RhythmBar({ notes, targetZoneStart, targetZoneEnd }: RhythmBarProps) {
  return (
    <div className="relative w-full h-20 bg-secondary/30 rounded-lg shadow-inner clay-inset overflow-hidden my-4">
      {/* Target Zone Indicator */}
      <div
        className="absolute top-0 h-full bg-primary/20 border-x-2 border-primary/50"
        style={{
          left: `${targetZoneStart}px`,
          width: `${targetZoneEnd - targetZoneStart}px`,
        }}
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/70 font-bold text-sm">
          HIT ZONE
        </div>
      </div>

      {notes.filter(note => note.position > -50 && note.position < 850).map((note) => ( // Render notes within viewport + buffer
        <MusicalNote key={note.id} note={note} />
      ))}
    </div>
  );
}
