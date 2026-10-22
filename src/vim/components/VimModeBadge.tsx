import { Text } from '@mantine/core';
import { font, vizVar } from '@/theme';
import type { VimMode } from '../types';

const LABELS: Record<VimMode, string> = {
  normal: 'NORMAL',
  insert: 'INSERT',
  visual: 'VISUAL',
  'visual-line': 'VISUAL LINE',
  command: 'COMANDO',
  search: 'BUSCA',
};

const COLORS: Record<VimMode, string> = {
  normal: vizVar.accent,
  insert: vizVar.purple,
  visual: vizVar.accent,
  'visual-line': vizVar.accent,
  command: vizVar.purple,
  search: vizVar.purple,
};

/** Small mode chip shown in the statusline. */
export function VimModeBadge({ mode }: { mode: VimMode }) {
  const color = COLORS[mode];
  return (
    <Text
      component="span"
      fz={font.micro}
      fw={700}
      style={{
        color,
        fontFamily: 'var(--mantine-font-family-monospace)',
        letterSpacing: '0.12em',
        border: `1px solid color-mix(in srgb, ${color} 42%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderRadius: 5,
        padding: '2px 7px',
        whiteSpace: 'nowrap',
        transition: 'color 140ms ease, border-color 140ms ease, background-color 140ms ease',
      }}
    >
      {LABELS[mode]}
    </Text>
  );
}
