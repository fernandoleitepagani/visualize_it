import { useCallback, useEffect, useRef, useState } from 'react';
import type { Step } from './types';

/** Optional behaviour for {@link usePlayback}. */
export interface PlaybackOptions {
  /** Delay between frames, in milliseconds. */
  speedMs?: number;
  /** Restart from the first frame instead of stopping at the last one. */
  loop?: boolean;
  /** Frame to start on. Clamped to the frame list. */
  initialIndex?: number;
  /** Called whenever the visible frame changes, including resets. */
  onStepChange?: (step: Step, index: number) => void;
}

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
  reset(): void;
  setSpeedMs(ms: number): void;
}

interface Cursor {
  /** The frame list this cursor belongs to; a mismatch means "reset". */
  steps: Step[];
  index: number;
  playing: boolean;
}

const DEFAULT_SPEED_MS = 900;

function clampIndex(index: number, total: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.floor(index), 0), Math.max(total - 1, 0));
}

/**
 * Drives step-by-step playback of a pre-computed list of frames.
 *
 * The steps are recalculated by the caller (see `useMemo` in LessonView), so
 * this hook only owns the cursor, the play/pause flag and the speed. When the
 * frame list identity changes (new lesson or new input) the cursor resets
 * during render — React's recommended alternative to an effect.
 */
export function usePlayback(steps: Step[], options: PlaybackOptions = {}): Playback {
  const {
    speedMs: initialSpeedMs = DEFAULT_SPEED_MS,
    loop = false,
    initialIndex = 0,
    onStepChange,
  } = options;

  const total = steps.length;
  const [cursor, setCursor] = useState<Cursor>(() => ({
    steps,
    index: clampIndex(initialIndex, total),
    playing: false,
  }));
  const [speedMs, setSpeedMs] = useState(initialSpeedMs);

  if (cursor.steps !== steps) {
    setCursor({ steps, index: 0, playing: false });
  }

  const index = clampIndex(cursor.index, total);
  const isPlaying = cursor.playing;

  // Keep the callback fresh without making it an effect dependency.
  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  // Notify on every committed frame, including the first one and resets.
  useEffect(() => {
    const frame = steps[index];
    if (frame) onStepChangeRef.current?.(frame, index);
  }, [steps, index]);

  const next = useCallback(() => {
    setCursor((current) => {
      if (current.index >= total - 1) {
        return loop ? { ...current, index: 0 } : current;
      }
      return { ...current, index: current.index + 1 };
    });
  }, [total, loop]);

  const prev = useCallback(
    () => setCursor((current) => ({ ...current, index: Math.max(current.index - 1, 0) })),
    [],
  );

  const reset = useCallback(
    () => setCursor((current) => ({ ...current, index: 0, playing: false })),
    [],
  );

  const play = useCallback(
    () =>
      setCursor((current) => ({
        ...current,
        index: current.index >= total - 1 ? 0 : current.index,
        playing: true,
      })),
    [total],
  );

  const pause = useCallback(() => setCursor((current) => ({ ...current, playing: false })), []);
  const toggle = useCallback(
    () => setCursor((current) => ({ ...current, playing: !current.playing })),
    [],
  );

  // Playback loop: advance on a timer, wrapping around when `loop` is on.
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setCursor((current) => {
        if (current.index >= total - 1) {
          return loop ? { ...current, index: 0 } : { ...current, playing: false };
        }
        return { ...current, index: current.index + 1 };
      });
    }, speedMs);
    return () => clearTimeout(timer);
  }, [isPlaying, index, speedMs, total, loop]);

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
    reset,
    setSpeedMs,
  };
}
