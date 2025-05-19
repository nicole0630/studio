"use client";

import { cn } from '@/lib/utils';
import { ArrowLeftCircle, ArrowRightCircle, Music2, XCircle, CheckCircle } from 'lucide-react';
import type { Note } from './RhythmBar';

interface MusicalNoteProps {
  note: Note;
}

export function MusicalNote({ note }: MusicalNoteProps) {
  const Icon = note.type === 'left' ? ArrowLeftCircle : ArrowRightCircle;
  
  let noteColor = "text-primary";
  if (note.hit) noteColor = "text-green-500";
  if (note.missed) noteColor = "text-red-500";

  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 transition-all duration-75 ease-linear",
        noteColor
      )}
      style={{ left: `${note.position}px` }}
      aria-label={`Musical note ${note.type}`}
    >
      {note.hit ? <CheckCircle size={40} strokeWidth={2} /> : 
       note.missed ? <XCircle size={40} strokeWidth={2} /> :
       <Icon size={40} strokeWidth={2} />
      }
    </div>
  );
}
