"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SwingingCharacterProps {
  swingDirection: "left" | "right" | "center";
}

export function SwingingCharacter({ swingDirection }: SwingingCharacterProps) {
  return (
    <div className="relative w-64 h-80 my-8">
      {/* Swing ropes */}
      <div className={cn(
        "absolute top-0 left-1/2 w-1 h-24 bg-yellow-600 origin-top transform -translate-x-1/2",
        swingDirection === 'left' && 'rotate-[-15deg]',
        swingDirection === 'right' && 'rotate-[15deg]',
        swingDirection === 'center' && 'rotate-[0deg]',
        'transition-transform duration-200 ease-in-out'
      )} style={{ left: 'calc(50% - 20px)' }}></div>
      <div className={cn(
        "absolute top-0 left-1/2 w-1 h-24 bg-yellow-600 origin-top transform -translate-x-1/2",
        swingDirection === 'left' && 'rotate-[-15deg]',
        swingDirection === 'right' && 'rotate-[15deg]',
        swingDirection === 'center' && 'rotate-[0deg]',
        'transition-transform duration-200 ease-in-out'
      )} style={{ left: 'calc(50% + 20px)' }}></div>
      
      {/* Swing seat - simple representation */}
      <div className={cn(
        "absolute top-20 left-1/2 w-24 h-4 bg-yellow-700 rounded transform -translate-x-1/2",
         swingDirection === 'left' && 'translate-x-[-15px] rotate-[-5deg]',
         swingDirection === 'right' && 'translate-x-[15px] rotate-[5deg]',
         swingDirection === 'center' && 'translate-x-0 rotate-0',
        'transition-transform duration-200 ease-in-out'
      )}></div>

      {/* Character */}
      <div
        className={cn(
          "absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-transform duration-200 ease-in-out",
          swingDirection === 'left' && 'translate-x-[-25px] rotate-[-15deg]',
          swingDirection === 'right' && 'translate-x-[25px] rotate-[15deg]',
          swingDirection === 'center' && 'translate-x-0 rotate-0'
        )}
        style={{ bottom: 'calc(50% - 100px)' }} // Adjust positioning to be on the seat
      >
        <Image
          src="https://placehold.co/100x150.png"
          alt="Swinging Character"
          width={100}
          height={150}
          className="rounded-md drop-shadow-lg"
          data-ai-hint="child student"
        />
      </div>
    </div>
  );
}
