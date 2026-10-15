import type { Step } from '@/engine/types';
import { cx } from '@/lib/cx';

/** Bars view — sorting and search over a numeric vector. */
export function BarsView({ state }: { state: Step | undefined }) {
  const arr = state?.arr ?? [];
  const cmp = new Set(state?.cmp ?? []);
  const swap = new Set(state?.swap ?? []);
  const pivot = new Set(state?.pivot ?? []);
  const sorted = new Set(state?.sorted ?? []);
  const dim = new Set(state?.dim ?? []);
  const max = Math.max(...arr, 1);

  if (arr.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center text-sm text-dim">Gerando…</div>
    );
  }

  return (
    <div className="flex h-60 items-end gap-1.5">
      {arr.map((value, i) => {
        const isSwap = swap.has(i);
        const isPivot = pivot.has(i);
        const isCmp = cmp.has(i);
        const isSorted = sorted.has(i);
        const height = Math.max(8, Math.round((value / max) * 220));

        return (
          <div
            key={i}
            className={cx(
              'flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5 transition-opacity',
              dim.has(i) && 'opacity-30',
            )}
          >
            <span
              className={cx(
                'font-mono text-xs text-muted',
                isCmp && 'text-accent',
                isSwap && 'text-green',
                isPivot && 'text-purple',
              )}
            >
              {value}
            </span>
            <div
              className={cx(
                'w-full rounded-t-md border-[1.5px] transition-all duration-200',
                !isSwap && !isPivot && !isCmp && !isSorted && 'border-line-2 bg-surface-3',
                isCmp && 'border-accent bg-accent/15',
                isSwap && 'border-green bg-green/20',
                isPivot && 'border-purple bg-purple/20',
                isSorted && 'border-accent-dim bg-accent/5',
              )}
              style={{ height }}
            />
          </div>
        );
      })}
    </div>
  );
}
