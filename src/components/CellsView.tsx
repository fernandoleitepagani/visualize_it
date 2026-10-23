import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { Cell } from '@/engine/types';
import { radius, font, transition, space, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

function boxStyle(state: string): CSSProperties {
  switch (state) {
    case 'active':
    case 'write':
      return {
        borderColor: vizVar.accent,
        background: `linear-gradient(180deg, ${vizVar.accentSoft}, color-mix(in srgb, var(--viz-surface-2) 70%, transparent))`,
        boxShadow: `0 0 0 3px ${vizVar.accentSoft}, 0 12px 24px -16px ${vizVar.accent}`,
      };
    case 'compare':
      return {
        borderColor: vizVar.green,
        background: `linear-gradient(180deg, ${vizVar.greenSoft}, color-mix(in srgb, var(--viz-surface-2) 70%, transparent))`,
      };
    case 'empty':
      return { borderColor: vizVar.line2, borderStyle: 'dashed', background: 'transparent' };
    default:
      return {
        borderColor: vizVar.line2,
        background: `linear-gradient(180deg, ${vizVar.surface4}, ${vizVar.surface3})`,
      };
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
      <Box
        className="scroll-fade-x"
        style={{ overflowX: 'auto', paddingInline: 8 }}
        role="img"
        tabIndex={0}
        aria-label={list.length > 0 ? `Estrutura com ${list.length} células` : 'Estrutura vazia'}
      >
        <Flex
          gap={8}
          align="flex-end"
          justify="center"
          wrap="nowrap"
          pt="lg"
          pb="sm"
          mih={250}
          style={{ minWidth: 'max-content', width: 'fit-content', margin: '0 auto' }}
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
                style={{ flexShrink: 0, minWidth: 58 }}
              >
                <Flex
                  gap={space.xs}
                  wrap="wrap"
                  mih={20}
                  w="100%"
                  align="center"
                  justify="center"
                  fz={font.micro}
                  style={{ color: vizVar.accent }}
                >
                  {(cell.labels ?? []).map((label, j) => (
                    <Text
                      key={j}
                      span
                      className="viz-pointer-badge"
                      px={6}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: radius.pill,
                        border: `1px solid ${vizVar.accentLine}`,
                        background: vizVar.accentSoft,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </Text>
                  ))}
                </Flex>
                <Flex
                  w={56}
                  h={54}
                  align="center"
                  justify="center"
                  fz="sm"
                  fw={600}
                  c={empty ? 'dimmed' : undefined}
                  style={{
                    border: '1.5px solid',
                    borderRadius: radius.md,
                    transform: isActive ? 'translateY(-4px)' : undefined,
                    transition: reducedMotion
                      ? 'none'
                      : `transform ${transition.base}, background ${transition.base}, border-color ${transition.base}, box-shadow ${transition.base}`,
                    ...boxStyle(state),
                  }}
                >
                  {empty ? '' : cell.val}
                </Flex>
                <Text fz={font.micro} style={{ color: vizVar.dim }}>
                  {i}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Box>
      <ViewLegend items={activeLegend} />
    </Box>
  );
}
