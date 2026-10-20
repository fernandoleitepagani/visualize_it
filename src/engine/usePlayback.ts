import { useCallback, useEffect, useState } from 'react';
import type { Step } from './types';

export interface Playback {
  index: number;
  total: number;
  step: Step | undefined;
  isPlaying: boolean;
  speedMs: number;
  atStart: boolean;
  atEnd: boolean;
  play(): void;
  pause(): void;
  toggle(): void;
  next(): void;
  prev(): void;
  goTo(index: number): void;
  reset(): void;
  setSpeedMs(ms: number): void;
}

interface Cursor {
  /** The frame list this cursor belongs to; a mismatch means "reset". */
  steps: Step[];
  index: number;
  playing: boolean;
}

/**
 * Drives step-by-step playback of a pre-computed list of frames.
 *
 * The steps are recalculated by the caller (see `useMemo` in LessonView), so
 * this hook only owns the cursor, the play/pause flag and the speed. When the
 * frame list identity changes (new lesson or new input) the cursor resets
 * during render — React's recommended alternative to an effect.
 */
export function usePlayback(steps: Step[], initialSpeedMs = 900): Playback {
  const total = steps.length;
  const [cursor, setCursor] = useState<Cursor>(() => ({ steps, index: 0, playing: false }));
  const [speedMs, setSpeedMs] = useState(initialSpeedMs);

  if (cursor.steps !== steps) {
    setCursor({ steps, index: 0, playing: false });
  }

  const index = Math.min(cursor.index, Math.max(total - 1, 0));
  const isPlaying = cursor.playing;

  const next = useCallback(
    () => setCursor((c) => ({ ...c, index: Math.min(c.index + 1, total - 1) })),
    [total],
  );
  const prev = useCallback(() => setCursor((c) => ({ ...c, index: Math.max(c.index - 1, 0) })), []);
  const goTo = useCallback(
    (nextIndex: number) =>
      setCursor((c) => ({
        ...c,
        index: Math.min(Math.max(nextIndex, 0), Math.max(total - 1, 0)),
        playing: false,
      })),
    [total],
  );
  const reset = useCallback(() => setCursor((c) => ({ ...c, index: 0, playing: false })), []);
  const play = useCallback(
    () => setCursor((c) => ({ ...c, index: c.index >= total - 1 ? 0 : c.index, playing: true })),
    [total],
  );
  const pause = useCallback(() => setCursor((c) => ({ ...c, playing: false })), []);
  const toggle = useCallback(
    () =>
      setCursor((c) => {
        if (c.playing) return { ...c, playing: false };
        if (c.index >= total - 1) return { ...c, index: 0, playing: true };
        return { ...c, playing: true };
      }),
    [total],
  );

  // Playback loop: advance on a timer until the last frame, then stop. The
  // state updates happen inside the callback so the effect stays a plain
  // subscription to the timer.
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setCursor((c) => {
        if (c.index >= total - 1) return { ...c, playing: false };
        return { ...c, index: Math.min(c.index + 1, total - 1) };
      });
    }, speedMs);
    return () => clearTimeout(timer);
  }, [isPlaying, index, speedMs, total]);

  return {
    index,
    total,
    step: steps[index],
    isPlaying,
    speedMs,
    atStart: index === 0,
    atEnd: index >= total - 1,
    play,
    pause,
    toggle,
    next,
    prev,
    goTo,
    reset,
    setSpeedMs,
  };
}
