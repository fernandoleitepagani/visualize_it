const STORAGE_PREFIX = 'visualize-it:input:';

const storageKey = (lessonId: string) => `${STORAGE_PREFIX}${lessonId}`;

/**
 * Reads the last applied array for a lesson.
 *
 * Returns `null` when nothing is stored, the stored value is corrupt, or it
 * falls outside the same 1–12 bound enforced by the input bar.
 */
export function readStoredInput(lessonId: string): number[] | null {
  try {
    const raw = localStorage.getItem(storageKey(lessonId));
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const values = parsed.filter(
      (value): value is number => typeof value === 'number' && Number.isFinite(value),
    );
    if (values.length !== parsed.length || values.length < 1 || values.length > 12) return null;

    return values;
  } catch {
    return null;
  }
}

/** Persists the last applied array for a lesson (best-effort). */
export function storeInput(lessonId: string, input: number[]): void {
  try {
    localStorage.setItem(storageKey(lessonId), JSON.stringify(input));
  } catch {
    // Storage can be unavailable (private mode, quota); persistence is best-effort.
  }
}
