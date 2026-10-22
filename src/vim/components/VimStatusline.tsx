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

const Separator = () => (
  <Text component="span" aria-hidden="true" fz={font.micro} style={{ color: vizVar.faint }}>
    ·
  </Text>
);

/** Buffer status: mode, file, cursor, keystrokes and the last message. */
export function VimStatusline({ state, fileName, strokes, best }: Props) {
  return (
    <Group
      gap={8}
      wrap="nowrap"
      fz={font.micro}
      aria-live="polite"
      style={{ fontFamily: 'var(--mantine-font-family-monospace)', overflow: 'hidden' }}
    >
      <VimModeBadge mode={state.mode} />
      <Separator />
      <Text component="span" fz={font.micro} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {fileName}
      </Text>
      <Separator />
      <Text component="span" fz={font.micro} style={{ color: vizVar.ink2, whiteSpace: 'nowrap' }}>
        {state.cursor.line + 1}:{state.cursor.col + 1}
      </Text>
      <Separator />
      <Text component="span" fz={font.micro} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {strokes} teclas
      </Text>
      {best !== undefined ? (
        <>
          <Separator />
          <Text component="span" fz={font.micro} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            rec {best}
          </Text>
        </>
      ) : null}
      <Separator />
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
