import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Step } from './types';
import { usePlayback } from './usePlayback';

const steps: Step[] = [
  { line: 0, desc: 'primeiro' },
  { line: 1, desc: 'segundo' },
  { line: 2, desc: 'terceiro' },
];

describe('usePlayback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('jumps to a step and pauses', () => {
    const { result } = renderHook(() => usePlayback(steps));

    act(() => result.current.goTo(2));

    expect(result.current.index).toBe(2);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.atEnd).toBe(true);
  });

  it('clamps the target index to the available steps', () => {
    const { result } = renderHook(() => usePlayback(steps));

    act(() => result.current.goTo(99));
    expect(result.current.index).toBe(2);

    act(() => result.current.goTo(-5));
    expect(result.current.index).toBe(0);
  });

  it('restarts from the beginning when toggled at the last step', () => {
    const { result } = renderHook(() => usePlayback(steps));

    act(() => result.current.goTo(2));
    act(() => result.current.toggle());

    expect(result.current.index).toBe(0);
    expect(result.current.isPlaying).toBe(true);
  });
});
