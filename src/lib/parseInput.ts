/**
 * Parses a free-form list of 1–12 finite numbers.
 *
 * Accepts commas, semicolons, spaces and newlines. Returns `null` when the
 * input is empty, out of bounds or contains a non-numeric token.
 */
export function parseInput(raw: string): number[] | null {
  const parts = raw
    .trim()
    .split(/[,\s;]+/)
    .filter(Boolean)
    .map(Number);

  if (parts.length < 1 || parts.length > 12 || parts.some((n) => !Number.isFinite(n))) {
    return null;
  }

  return parts;
}
