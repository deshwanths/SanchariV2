
"use client";

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ScrambleTextProps = {
  text: string;
  className?: string;
};

const ScrambleText = ({ text, className }: ScrambleTextProps) => {
  const [displayedText, setDisplayedText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  const scramble = () => {
    let counter = 0;
    
    // Clear any existing intervals
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const newText = text
        .split('')
        .map((_, index) => {
          if (index < counter) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      setDisplayedText(newText);

      if (counter >= text.length) {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setDisplayedText(text);
      }
      
      counter += 1 / 3;
    }, 30);
  };

  const stopScramble = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
    }
    setDisplayedText(text);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className={cn('inline-block', className)}
      onMouseEnter={scramble}
      onMouseLeave={stopScramble}
    >
      {displayedText}
    </span>
  );
};

export default ScrambleText;
