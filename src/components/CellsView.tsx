import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { Cell } from '@/engine/types';
import { radius, font, transition, shadow, space, tint, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

function boxStyle(state: string): CSSProperties {
  switch (state) {
    case 'active':
    case 'write':
      return { borderColor: vizVar.accent, background: tint(vizVar.accent, 15), boxShadow: shadow.focus };
    case 'compare':
      return { borderColor: vizVar.green, background: tint(vizVar.green, 12) };
    case 'empty':
      return { borderColor: vizVar.line2, borderStyle: 'dashed', background: 'transparent' };
    default:
      return { borderColor: vizVar.line2, background: vizVar.surface2 };
  }
}

const LEGEND = [
  { key: 'active', label: 'ativo', color: vizVar.accent },
  { key: 'compare', label: 'comparação', color: vizVar.green },
  { key: 'empty', label: 'vazio', color: vizVar.line2 },
] as const;

/** Cells view — array-backed structures (stacks, queues, lists, loop vars). */
export function CellsView({ cells }: { cells: Cell[] | undefined }) {
  const reducedMotion = useReducedMotion();
  const list = cells ?? [];
  const states = new Set(
    list.map((cell) => {
      const empty = cell.val === null || cell.val === undefined;
      return cell.state || (empty ? 'empty' : '');
    }),
  );
  const hasActive = states.has('active') || states.has('write');
  const activeLegend = LEGEND.filter((item) => {
    if (item.key === 'active') return hasActive;
    return states.has(item.key);
  });

  return (
    <Box>
      <Flex
        gap={6}
        align="flex-end"
        justify="center"
        wrap="nowrap"
        pt="xl"
        pb="sm"
        mih={240}
        style={{ overflowX: 'auto' }}
        role="img"
        aria-label={list.length > 0 ? `Estrutura com ${list.length} células` : 'Estrutura vazia'}
      >
        {list.length === 0 ? (
          <Text fz="sm" c="dimmed" pb="xl">
            Estrutura vazia
          </Text>
        ) : null}
        {list.map((cell, i) => {
          const empty = cell.val === null || cell.val === undefined;
          const state = cell.state || (empty ? 'empty' : '');
          const isActive = state === 'active' || state === 'write' || state === 'compare';

          return (
            <Flex
              key={i}
              direction="column"
              align="center"
              gap={6}
              style={{ flexShrink: 0, minWidth: 50 }}
            >
              <Flex gap={space.xs} wrap="nowrap" h={14} ff="monospace" fz={font.micro} c="amber">
                {(cell.labels ?? []).map((label, j) => (
                  <Text key={j} span className="viz-pointer-badge">
                    {label}
                  </Text>
                ))}
              </Flex>
              <Flex
                w={50}
                h={48}
                align="center"
                justify="center"
                ff="monospace"
                fz="sm"
                fw={600}
                c={empty ? 'dimmed' : undefined}
                style={{
                  border: '1.5px solid',
                  borderRadius: radius.sm,
                  transform: isActive ? 'translateY(-3px)' : undefined,
                  transition: reducedMotion
                    ? 'none'
                    : `transform ${transition.base}, background-color ${transition.base}, border-color ${transition.base}, box-shadow ${transition.base}`,
                  ...boxStyle(state),
                }}
              >
                {empty ? '' : cell.val}
              </Flex>
              <Text ff="monospace" fz={font.micro} c="dimmed">
                {i}
              </Text>
            </Flex>
          );
        })}
      </Flex>
      <ViewLegend items={activeLegend} />
    </Box>
  );
}
