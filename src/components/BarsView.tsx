import type { Step } from '@/engine/types';
import { cx } from '@/lib/cx';

interface Props {
  state: Step | undefined;
  /** Stable element ids (see assignElementIds) so swaps can glide. */
  ids?: string[];
}

/** Bars view — sorting and search over a numeric vector. */
export function BarsView({ state, ids = [] }: Props) {
  const arr = state?.arr ?? [];

  if (arr.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center text-sm text-dim">Gerando…</div>
    );
  }

  const cmp = new Set(state?.cmp ?? []);
  const swap = new Set(state?.swap ?? []);
  const pivot = new Set(state?.pivot ?? []);
  const sorted = new Set(state?.sorted ?? []);
  const dim = new Set(state?.dim ?? []);
  const max = Math.max(...arr, 1);
  const slot = 100 / arr.length;

  return (
    <div className="relative h-60">
      {arr.map((value, i) => {
        const isSwap = swap.has(i);
        const isPivot = pivot.has(i);
        const isCmp = cmp.has(i);
        const isSorted = sorted.has(i);
        const height = Math.max(8, Math.round((value / max) * 100));

        return (
          <div
            key={ids[i] ?? i}
            className={cx(
              'absolute bottom-0 flex flex-col items-center rounded-t-md border-[1.5px] pt-1.5 transition-[left,height,background-color,border-color] duration-300 ease-out',
              !isSwap && !isPivot && !isCmp && !isSorted && 'border-line-2 bg-surface-3',
              isCmp && 'border-accent bg-accent/15',
              isSwap && 'border-green bg-green/20',
              isPivot && 'border-purple bg-purple/20',
              isSorted && 'border-accent-dim bg-accent/5',
              dim.has(i) && 'opacity-30',
            )}
            style={{ left: `${i * slot}%`, width: `calc(${slot}% - 6px)`, height: `${height}%` }}
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
          </div>
        );
      })}
    </div>
  );
}
