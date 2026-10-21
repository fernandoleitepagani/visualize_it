import { describe, expect, it } from 'vitest';
import { nextSpeed, previousSpeed, SPEEDS } from './speeds';

describe('playback speeds', () => {
  it('moves forward and backward through the scale', () => {
    expect(nextSpeed(900)).toBe(450);
    expect(previousSpeed(900)).toBe(1800);
  });

  it('clamps at both ends', () => {
    expect(nextSpeed(SPEEDS[SPEEDS.length - 1].value)).toBe(SPEEDS[SPEEDS.length - 1].value);
    expect(previousSpeed(SPEEDS[0].value)).toBe(SPEEDS[0].value);
  });
});
