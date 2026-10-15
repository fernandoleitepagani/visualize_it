import type { Cell } from '@/engine/types';
import { cx } from '@/lib/cx';

/** Cells view — array-backed structures (stacks, queues, lists, loop vars). */
export function CellsView({ cells }: { cells: Cell[] | undefined }) {
  const list = cells ?? [];

  return (
    <div className="flex min-h-60 flex-nowrap items-end justify-center gap-1 overflow-x-auto pt-8 pb-2.5">
      {list.map((cell, i) => {
        const empty = cell.val === null || cell.val === undefined;
        const state = cell.state || (empty ? 'empty' : '');

        return (
          <div key={i} className="flex shrink-0 flex-col items-center gap-1.5 min-w-[3.25rem]">
            <div className="flex h-3.5 gap-1 whitespace-nowrap font-mono text-[10px] text-accent">
              {(cell.labels ?? []).map((label, j) => (
                <i key={j} className="not-italic">
                  {label}
                </i>
              ))}
            </div>
            <div
              className={cx(
                'flex h-11 w-12 items-center justify-center rounded-md border-[1.5px] font-mono text-sm font-semibold transition-colors',
                state === 'empty' && 'border-dashed border-line-2 bg-transparent text-dim',
                state === 'active' && 'border-accent bg-accent/15',
                state === 'write' && 'border-accent bg-accent/15',
                state === 'compare' && 'border-green bg-green/10',
                state === '' && 'border-line-2 bg-surface-2',
              )}
            >
              {empty ? '' : cell.val}
            </div>
            <div className="font-mono text-[10px] text-dim">{i}</div>
          </div>
        );
      })}
    </div>
  );
}
