import type { VimProgress } from './types';

const KEY = 'visualize-it:vim-progress';

const empty = (): VimProgress => ({ solved: [], best: {} });

export function loadProgress(): VimProgress {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return empty();
    const value = parsed as Partial<VimProgress>;
    const solved = Array.isArray(value.solved)
      ? value.solved.filter((slug): slug is string => typeof slug === 'string')
      : [];
    const best: Record<string, number> = {};
    if (value.best && typeof value.best === 'object') {
      for (const [slug, strokes] of Object.entries(value.best)) {
        if (typeof strokes === 'number' && Number.isFinite(strokes)) best[slug] = strokes;
      }
    }
    return { solved, best };
  } catch {
    return empty();
  }
}

export function saveProgress(progress: VimProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode); progress is best-effort.
  }
}

export function recordSolved(progress: VimProgress, slug: string, strokes: number): VimProgress {
  const previous = progress.best[slug];
  return {
    solved: progress.solved.includes(slug) ? progress.solved : [...progress.solved, slug],
    best: {
      ...progress.best,
      [slug]: previous === undefined ? strokes : Math.min(previous, strokes),
    },
  };
}
