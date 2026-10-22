import type { CSSProperties } from 'react';
import { Box, Flex, Stack, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { Cell, MatrixState } from '@/engine/types';
import { font, radius, space, transition, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

function cellBoxStyle(state: string, isCrosshairActive: boolean): CSSProperties {
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
      return {
        borderColor: vizVar.line2,
        borderStyle: 'dashed',
        background: 'transparent',
      };
    default:
      return {
        borderColor: isCrosshairActive ? vizVar.accentLine : vizVar.line2,
        background: isCrosshairActive
          ? `linear-gradient(180deg, color-mix(in srgb, ${vizVar.accentSoft} 40%, ${vizVar.surface4}), ${vizVar.surface3})`
          : `linear-gradient(180deg, ${vizVar.surface4}, ${vizVar.surface3})`,
      };
  }
}

const LEGEND = [
  { key: 'active', label: 'ativo', color: vizVar.accent },
  { key: 'compare', label: 'comparação', color: vizVar.green },
  { key: 'empty', label: 'vazio', color: vizVar.line2 },
] as const;

export interface MatrixViewProps {
  matrix?: MatrixState;
}

/** Matrix view — 2D grid/table structures with coordinate highlights. */
export function MatrixView({ matrix }: MatrixViewProps) {
  const reducedMotion = useReducedMotion();

  if (!matrix || matrix.rows === 0 || matrix.cols === 0 || !matrix.grid || matrix.grid.length === 0) {
    return (
      <Box mih={250} display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text fz="sm" c="dimmed">
          Matriz vazia
        </Text>
      </Box>
    );
  }

  const { rows, cols, grid, activeRow, activeCol, rowLabels, colLabels } = matrix;

  const states = new Set<string>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r]?.[c];
      if (cell) {
        const empty = cell.val === null || cell.val === undefined;
        states.add(cell.state || (empty ? 'empty' : ''));
      }
    }
  }

  const hasActive = states.has('active') || states.has('write');
  const activeLegend = LEGEND.filter((item) => {
    if (item.key === 'active') return hasActive;
    return states.has(item.key);
  });

  return (
    <Box>
      <Box
        pt="md"
        pb="sm"
        mih={250}
        className="scroll-fade-x"
        style={{ overflowX: 'auto', paddingInline: 8 }}
      >
        <Stack
          gap={8}
          align="center"
          justify="center"
          role="grid"
          aria-label={`Matriz com ${rows} linhas e ${cols} colunas`}
          aria-rowcount={rows}
          aria-colcount={cols}
        >
          {/* Column headers (j indices or labels) */}
          <Flex gap={8} align="center" justify="center" role="row">
            {/* Corner spacer for row indices */}
            <Box w={32} h={24} style={{ flexShrink: 0 }} />
            {Array.from({ length: cols }).map((_, c) => {
              const label = colLabels?.[c] ?? `c[${c}]`;
              const isColActive = activeCol === c;
              return (
                <Box
                  key={c}
                  w={56}
                  style={{ flexShrink: 0, textAlign: 'center' }}
                  role="columnheader"
                  aria-colindex={c + 1}
                >
                  <Text
                    fz={font.micro}
                    fw={isColActive ? 700 : 500}
                    style={{
                      color: isColActive ? vizVar.accent : vizVar.dim,
                      transition: reducedMotion ? 'none' : `color ${transition.base}`,
                    }}
                  >
                    {label}
                  </Text>
                </Box>
              );
            })}
          </Flex>

          {/* Matrix rows */}
          {Array.from({ length: rows }).map((_, r) => {
            const isRowActive = activeRow === r;
            const rLabel = rowLabels?.[r] ?? `l[${r}]`;

            return (
              <Flex
                key={r}
                gap={8}
                align="center"
                justify="center"
                role="row"
                aria-rowindex={r + 1}
              >
                {/* Row header (i index or label) */}
                <Box
                  w={32}
                  style={{ flexShrink: 0, textAlign: 'right', paddingRight: 4 }}
                  role="rowheader"
                >
                  <Text
                    fz={font.micro}
                    fw={isRowActive ? 700 : 500}
                    style={{
                      color: isRowActive ? vizVar.accent : vizVar.dim,
                      transition: reducedMotion ? 'none' : `color ${transition.base}`,
                    }}
                  >
                    {rLabel}
                  </Text>
                </Box>

                {/* Cells in row */}
                {Array.from({ length: cols }).map((_, c) => {
                  const cell: Cell = grid[r]?.[c] ?? { val: null };
                  const empty = cell.val === null || cell.val === undefined;
                  const state = cell.state || (empty ? 'empty' : '');
                  const isActive = state === 'active' || state === 'write' || state === 'compare';
                  const isCrosshairActive = activeRow === r || activeCol === c;

                  return (
                    <Flex
                      key={c}
                      direction="column"
                      align="center"
                      gap={4}
                      style={{ flexShrink: 0 }}
                      role="gridcell"
                      aria-colindex={c + 1}
                      aria-rowindex={r + 1}
                    >
                      {/* Top label / badges */}
                      <Flex
                        gap={space.xs}
                        wrap="nowrap"
                        h={16}
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
                            px={5}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: radius.pill,
                              border: `1px solid ${vizVar.accentLine}`,
                              background: vizVar.accentSoft,
                              lineHeight: 1,
                              whiteSpace: 'nowrap',
                              fontSize: '10px',
                            }}
                          >
                            {label}
                          </Text>
                        ))}
                      </Flex>

                      {/* Cell box */}
                      <Flex
                        w={56}
                        h={48}
                        align="center"
                        justify="center"
                        fz="sm"
                        fw={600}
                        c={empty ? 'dimmed' : undefined}
                        style={{
                          border: '1.5px solid',
                          borderRadius: radius.md,
                          transform: isActive ? 'translateY(-2px)' : undefined,
                          transition: reducedMotion
                            ? 'none'
                            : `transform ${transition.base}, background ${transition.base}, border-color ${transition.base}, box-shadow ${transition.base}`,
                          ...cellBoxStyle(state, isCrosshairActive),
                        }}
                      >
                        {empty ? '' : cell.val}
                      </Flex>
                    </Flex>
                  );
                })}
              </Flex>
            );
          })}
        </Stack>
      </Box>
      <ViewLegend items={activeLegend} />
    </Box>
  );
}
