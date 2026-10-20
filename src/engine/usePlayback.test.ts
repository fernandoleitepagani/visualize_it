import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Step } from './types';
import { usePlayback } from './usePlayback';

const steps: Step[] = [
  { line: 0, desc: 'a' },
  { line: 1, desc: 'b' },
  { line: 2, desc: 'c' },
];

describe('usePlayback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at the first frame with the default speed', () => {
    const { result } = renderHook(() => usePlayback(steps));

    expect(result.current.index).toBe(0);
    expect(result.current.total).toBe(3);
    expect(result.current.step).toEqual(steps[0]);
    expect(result.current.speedMs).toBe(900);
    expect(result.current.atStart).toBe(true);
    expect(result.current.atEnd).toBe(false);
  });

  it('clamps next and prev at the ends', () => {
    const { result } = renderHook(() => usePlayback(steps));

    act(() => result.current.prev());
    expect(result.current.index).toBe(0);

    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());

    expect(result.current.index).toBe(2);
    expect(result.current.atEnd).toBe(true);
  });

  it('honours and clamps initialIndex', () => {
    const atEnd = renderHook(() => usePlayback(steps, { initialIndex: 2 }));
    expect(atEnd.result.current.index).toBe(2);

    const overflow = renderHook(() => usePlayback(steps, { initialIndex: 99 }));
    expect(overflow.result.current.index).toBe(2);
  });

  it('resets to the first frame and stops', () => {
    const { result } = renderHook(() => usePlayback(steps, { initialIndex: 2 }));

    act(() => result.current.play());
    act(() => result.current.reset());

    expect(result.current.index).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it('wraps to the first frame when loop is enabled', () => {
    const { result } = renderHook(() => usePlayback(steps, { initialIndex: 2, loop: true }));

    act(() => result.current.next());

    expect(result.current.index).toBe(0);
  });

  it('fires onStepChange on next, prev and reset', () => {
    const onStepChange = vi.fn();
    const { result } = renderHook(() => usePlayback(steps, { onStepChange }));
    onStepChange.mockClear();

    act(() => result.current.next());
    expect(onStepChange).toHaveBeenLastCalledWith(steps[1], 1);

    act(() => result.current.prev());
    expect(onStepChange).toHaveBeenLastCalledWith(steps[0], 0);

    act(() => result.current.next());
    act(() => result.current.reset());
    expect(onStepChange).toHaveBeenLastCalledWith(steps[0], 0);
  });

  it('resets to the first frame when the frame list changes', () => {
    const { result, rerender } = renderHook(({ frames }) => usePlayback(frames), {
      initialProps: { frames: steps },
    });

    act(() => result.current.next());
    expect(result.current.index).toBe(1);

    rerender({ frames: [...steps] });
    expect(result.current.index).toBe(0);
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
