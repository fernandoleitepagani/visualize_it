import type { CSSProperties } from 'react';
import { Flex, Text } from '@mantine/core';
import type { Cell } from '@/engine/types';
import { viz } from '@/theme';

function boxStyle(state: string): CSSProperties {
  switch (state) {
    case 'active':
    case 'write':
      return { borderColor: viz.accent, background: 'rgba(251, 191, 36, 0.15)' };
    case 'compare':
      return { borderColor: viz.green, background: 'rgba(74, 222, 128, 0.1)' };
    case 'empty':
      return { borderColor: viz.line2, borderStyle: 'dashed', background: 'transparent' };
    default:
      return { borderColor: viz.line2, background: viz.surface2 };
  }
}

/** Cells view — array-backed structures (stacks, queues, lists, loop vars). */
export function CellsView({ cells }: { cells: Cell[] | undefined }) {
  const list = cells ?? [];

  return (
    <Flex
      gap="xs"
      align="flex-end"
      justify="center"
      wrap="nowrap"
      pt="xl"
      pb="sm"
      mih={240}
      style={{ overflowX: 'auto' }}
    >
      {list.map((cell, i) => {
        const empty = cell.val === null || cell.val === undefined;
        const state = cell.state || (empty ? 'empty' : '');

        return (
          <Flex key={i} direction="column" align="center" gap={6} style={{ flexShrink: 0, minWidth: 52 }}>
            <Flex gap={4} wrap="nowrap" h={14} ff="monospace" fz={10} c="amber">
              {(cell.labels ?? []).map((label, j) => (
                <Text key={j} span>
                  {label}
                </Text>
              ))}
            </Flex>
            <Flex
              w={48}
              h={44}
              align="center"
              justify="center"
              ff="monospace"
              fz="sm"
              fw={600}
              c={empty ? 'dimmed' : undefined}
              style={{
                border: '1.5px solid',
                borderRadius: 6,
                transition: 'background-color 150ms, border-color 150ms',
                ...boxStyle(state),
              }}
            >
              {empty ? '' : cell.val}
            </Flex>
            <Text ff="monospace" fz={10} c="dimmed">
              {i}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
}
