import type { CSSProperties } from 'react';
import { Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { Cell } from '@/engine/types';
import { tint, vizVar } from '@/theme';

function boxStyle(state: string): CSSProperties {
  switch (state) {
    case 'active':
    case 'write':
      return { borderColor: vizVar.accent, background: tint(vizVar.accent, 15) };
    case 'compare':
      return { borderColor: vizVar.green, background: tint(vizVar.green, 12) };
    case 'empty':
      return { borderColor: vizVar.line2, borderStyle: 'dashed', background: 'transparent' };
    default:
      return { borderColor: vizVar.line2, background: vizVar.surface };
  }
}

/** Cells view — array-backed structures (stacks, queues, lists, loop vars). */
export function CellsView({ cells }: { cells: Cell[] | undefined }) {
  const reducedMotion = useReducedMotion();
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
                transition: reducedMotion ? 'none' : 'background-color 150ms, border-color 150ms',
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
