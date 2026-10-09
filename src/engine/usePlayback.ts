import { useState, useEffect, useCallback } from 'react';
import type { Step } from './types';

export function usePlayback(steps: Step[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(300);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  // Ao alterar os steps (ex: carregar um novo array), reseta o player
  useEffect(() => {
    reset();
  }, [steps, reset]);

  const next = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Loop de playback
  useEffect(() => {
    if (!isPlaying) return;
    if (currentIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => next(), speedMs);
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, speedMs, steps.length, next]);

  return {
    currentStep: steps[currentIndex],
    currentIndex,
    totalSteps: steps.length,
    isPlaying,
    speedMs,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next,
    prev,
    reset,
    setSpeedMs,
  };
}
