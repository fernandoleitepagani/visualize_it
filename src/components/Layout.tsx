import type { ReactNode } from 'react';

/** Page container: shared max width and padding. */
export function Layout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1100px] px-5 pt-7 pb-20">{children}</div>;
}
