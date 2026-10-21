export const SPEEDS = [
  { label: '0,5×', value: 1800 },
  { label: '1×', value: 900 },
  { label: '2×', value: 450 },
  { label: '4×', value: 225 },
] as const;

export function nextSpeed(current: number): number {
  const index = SPEEDS.findIndex((speed) => speed.value === current);
  return SPEEDS[Math.min(Math.max(index, 0) + 1, SPEEDS.length - 1)].value;
}

export function previousSpeed(current: number): number {
  const index = SPEEDS.findIndex((speed) => speed.value === current);
  return SPEEDS[Math.max(index - 1, 0)].value;
}
