import type { VarValue } from '@/engine/types';

/** Chips showing the named variables captured by the current step. */
export function VarsPanel({ vars }: { vars?: Record<string, VarValue> }) {
  const entries = Object.entries(vars ?? {});
  if (entries.length === 0) return null;

  return (
    <div className="mt-3.5 flex flex-wrap justify-center gap-2.5 border-t border-line pt-3 font-mono text-xs">
      {entries.map(([name, value]) => (
        <span
          key={name}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1"
        >
          <span className="italic text-dim">{name}</span>
          {value === null || value === undefined ? (
            <span className="text-dim">—</span>
          ) : (
            <span className="min-w-3.5 text-center font-semibold text-accent">{String(value)}</span>
          )}
        </span>
      ))}
    </div>
  );
}
