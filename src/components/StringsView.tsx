import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { Cell, StringState } from '@/engine/types';
import { font, radius, space, transition, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

const CELL_WIDTH = 41;
const CELL_HEIGHT = 46;
const CELL_GAP = 4;
const CELL_STEP = CELL_WIDTH + CELL_GAP;
const LABEL_WIDTH = 60;
const POINTER_HEIGHT = 18;
const ROW_HEIGHT = 90;
const CELL_TOP = 24;

function cellStyle(state: string): CSSProperties {
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
    case 'diff':
      return {
        borderColor: vizVar.danger,
        background: `linear-gradient(180deg, color-mix(in srgb, ${vizVar.danger} 12%, transparent), color-mix(in srgb, var(--viz-surface-2) 70%, transparent))`,
      };
    case 'terminator':
      return {
        borderColor: vizVar.line3,
        borderStyle: 'dashed',
        background: `color-mix(in srgb, ${vizVar.surface3} 70%, transparent)`,
        color: vizVar.muted,
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
  { key: 'diff', label: 'diferença', color: vizVar.danger },
  { key: 'terminator', label: 'terminador', color: vizVar.line3 },
  { key: 'empty', label: 'vazio', color: vizVar.line2 },
] as const;

function PointerBadges({ cell }: { cell: Cell }) {
  return (
    <Flex
      gap={space.xs}
      wrap="nowrap"
      h={POINTER_HEIGHT}
      w="100%"
      align="center"
      justify="center"
      fz={font.micro}
      style={{ color: vizVar.accent }}
    >
      {(cell.labels ?? []).map((label, index) => (
        <Text
          key={`${label}-${index}`}
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
  );
}

/** Character-focused view for C string lessons. */
export function StringsView({ state }: { state: StringState | undefined }) {
  const reducedMotion = useReducedMotion();
  const rows = state?.rows ?? [];
  const links = state?.links ?? [];
  const maxLength = Math.max(...rows.map((row) => row.cells.length), 1);
  const cellsWidth = maxLength * CELL_STEP - CELL_GAP;
  const canvasWidth = LABEL_WIDTH + cellsWidth;
  const states = new Set(rows.flatMap((row) => row.cells.map((cell) => cell.state || '')));
  const legend = LEGEND.filter((item) => {
    if (item.key === 'active') return states.has('active') || states.has('write');
    return states.has(item.key);
  });

  const description =
    rows.length > 0
      ? `String com ${rows.length} ${rows.length === 1 ? 'fileira' : 'fileiras'}: ${rows
          .map((row) => `${row.label} com ${row.cells.length} células`)
          .join('; ')}`
      : 'String vazia';

  return (
    <Box>
      <Box
        className="scroll-fade-x"
        style={{ overflowX: 'auto', overflowY: 'hidden', paddingInline: 4, paddingTop: 8 }}
        role="img"
        aria-label={description}
      >
        {rows.length === 0 ? (
          <Flex align="center" justify="center" mih={250}>
            <Text fz="sm" c="dimmed">
              String vazia
            </Text>
          </Flex>
        ) : (
          <Box
            style={{
              position: 'relative',
              width: canvasWidth,
              margin: '0 auto',
            }}
          >
            {links.length > 0 ? (
              <svg
                data-testid="string-links"
                width={cellsWidth}
                height={rows.length * ROW_HEIGHT}
                viewBox={`0 0 ${cellsWidth} ${rows.length * ROW_HEIGHT}`}
                aria-hidden
                style={{
                  position: 'absolute',
                  left: LABEL_WIDTH,
                  top: 0,
                  overflow: 'visible',
                  pointerEvents: 'none',
                }}
              >
                <defs>
                  <marker
                    id="string-arrowhead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill={vizVar.accent} />
                  </marker>
                </defs>
                {links.map((link, index) => {
                  const x1 = link.fromIndex * CELL_STEP + CELL_WIDTH / 2;
                  const x2 = link.toIndex * CELL_STEP + CELL_WIDTH / 2;
                  const y1 = link.fromRow * ROW_HEIGHT + CELL_TOP + CELL_HEIGHT;
                  const y2 = link.toRow * ROW_HEIGHT + CELL_TOP;
                  const bend = link.toRow > link.fromRow ? 20 : -20;

                  return (
                    <path
                      key={`${link.fromRow}-${link.fromIndex}-${link.toRow}-${link.toIndex}-${index}`}
                      d={`M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`}
                      fill="none"
                      stroke={vizVar.accent}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      markerEnd="url(#string-arrowhead)"
                      opacity="0.9"
                    />
                  );
                })}
              </svg>
            ) : null}

            {rows.map((row, rowIndex) => (
              <Flex key={`${row.label}-${rowIndex}`} align="flex-start" gap={0} h={ROW_HEIGHT}>
                <Flex
                  w={LABEL_WIDTH}
                  h={CELL_HEIGHT}
                  mt={`${CELL_TOP}px`}
                  align="center"
                  justify="flex-end"
                  pr="sm"
                  style={{ flexShrink: 0 }}
                >
                  <Text
                    fz={font.tiny}
                    fw={600}
                    style={{ color: vizVar.muted, whiteSpace: 'nowrap' }}
                  >
                    {row.label}
                  </Text>
                </Flex>
                <Flex gap={CELL_GAP} align="flex-start" style={{ flexShrink: 0 }}>
                  {row.cells.map((cell, cellIndex) => {
                    const stateName = cell.state || '';
                    const isEmpty = cell.val === null || cell.val === undefined;
                    const isActive =
                      stateName === 'active' ||
                      stateName === 'write' ||
                      stateName === 'compare' ||
                      stateName === 'diff';

                    return (
                      <Flex
                        key={`${rowIndex}-${cellIndex}`}
                        direction="column"
                        align="center"
                        gap={6}
                        w={CELL_WIDTH}
                        style={{ flexShrink: 0 }}
                      >
                        <PointerBadges cell={cell} />
                        <Flex
                          w={CELL_WIDTH}
                          h={CELL_HEIGHT}
                          align="center"
                          justify="center"
                          fz={stateName === 'terminator' ? font.small : 'sm'}
                          fw={600}
                          ff={stateName === 'terminator' ? 'monospace' : undefined}
                          c={isEmpty ? 'dimmed' : undefined}
                          style={{
                            border: '1.5px solid',
                            borderRadius: radius.md,
                            transform: isActive ? 'translateY(-4px)' : undefined,
                            transition: reducedMotion
                              ? 'none'
                              : `transform ${transition.base}, background ${transition.base}, border-color ${transition.base}, box-shadow ${transition.base}`,
                            ...cellStyle(stateName),
                          }}
                        >
                          {isEmpty ? '' : cell.val}
                        </Flex>
                        <Text fz={font.micro} style={{ color: vizVar.dim }}>
                          {cellIndex}
                        </Text>
                      </Flex>
                    );
                  })}
                </Flex>
              </Flex>
            ))}
          </Box>
        )}
      </Box>

      <ViewLegend items={legend} />

      {state?.result ? (
        <Flex justify="center" pt="sm">
          <Flex
            align="center"
            gap="xs"
            px="md"
            py={6}
            style={{
              border: `1px solid ${vizVar.accentLine}`,
              borderRadius: radius.pill,
              background: vizVar.accentSoft,
            }}
          >
            <Text fz={font.micro} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.1em' }}>
              {state.result.label}
            </Text>
            <Text fz={font.small} fw={600} ff="monospace" style={{ color: vizVar.accent }}>
              {state.result.value}
            </Text>
          </Flex>
        </Flex>
      ) : null}
    </Box>
  );
}
