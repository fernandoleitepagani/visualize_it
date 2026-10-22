import { Group, Text } from '@mantine/core';
import { font, vizVar } from '@/theme';
import type { VimState } from '../types';
import { VimModeBadge } from './VimModeBadge';

interface Props {
  state: VimState;
  fileName: string;
  strokes: number;
  best?: number;
}

/** Buffer status: mode, file, cursor, keystrokes and the last message. */
export function VimStatusline({ state, fileName, strokes, best }: Props) {
  return (
    <Group
      gap={10}
      wrap="nowrap"
      fz={font.micro}
      aria-live="polite"
      style={{ fontFamily: 'var(--mantine-font-family-monospace)', overflow: 'hidden' }}
    >
      <VimModeBadge mode={state.mode} />
      <Text component="span" fz={font.micro} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {fileName}
      </Text>
      <Text component="span" fz={font.micro} style={{ color: vizVar.ink2, whiteSpace: 'nowrap' }}>
        {state.cursor.line + 1}:{state.cursor.col + 1}
      </Text>
      <Text component="span" fz={font.micro} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {strokes} teclas
      </Text>
      {best !== undefined ? (
        <Text component="span" fz={font.micro} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          recorde {best}
        </Text>
      ) : null}
      <Text
        component="span"
        fz={font.micro}
        style={{
          color: state.message.startsWith('E') ? vizVar.danger : vizVar.accent,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {state.message || '—'}
      </Text>
    </Group>
  );
}
