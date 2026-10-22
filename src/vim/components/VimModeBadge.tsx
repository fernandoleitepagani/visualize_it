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

/** Small mode chip shown in the buffer panel header and statusline. */
export function VimModeBadge({ mode }: { mode: VimMode }) {
  const color = mode === 'insert' ? vizVar.purple : vizVar.accent;
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
      }}
    >
      {LABELS[mode]}
    </Text>
  );
}
