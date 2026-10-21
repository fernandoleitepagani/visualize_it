import type { ReactNode } from 'react';
import { font } from '@/theme';

interface Props {
  children: ReactNode;
  /** Optional semantic colour; defaults to the muted pill. */
  tone?: 'accent' | 'green' | 'purple' | 'danger';
}

const tones = {
  accent: 'var(--viz-accent)',
  green: 'var(--viz-green)',
  purple: 'var(--viz-purple)',
  danger: 'var(--viz-danger)',
} as const;

/** Compact mono pill used for complexity tags, group labels and metadata. */
export function MetaPill({ children, tone }: Props) {
  return (
    <span
      className="meta-pill"
      style={
        tone
          ? {
              color: tones[tone],
              borderColor: `color-mix(in srgb, ${tones[tone]} 32%, transparent)`,
              background: `color-mix(in srgb, ${tones[tone]} 8%, transparent)`,
              fontFamily: 'var(--mantine-font-family-monospace)',
              fontSize: font.micro,
            }
          : { fontSize: font.micro }
      }
    >
      {children}
    </span>
  );
}
