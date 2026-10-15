import type { ReactNode } from 'react';

interface Props {
  /** Left-aligned header text. */
  label: ReactNode;
  /** Optional right-aligned header content (counter, tabs, …). */
  aside?: ReactNode;
  children: ReactNode;
}

/** Shared card chrome: a header strip over a body. */
export function Panel({ label, aside, children }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 text-xs font-semibold tracking-wider text-dim uppercase">
        <span>{label}</span>
        {aside}
      </div>
      {children}
    </section>
  );
}
