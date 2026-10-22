import type { CSSProperties } from 'react';
import { useId } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { PointerBox, PointerState } from '@/engine/types';
import { font, radius, space, transition, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

const BOX_WIDTH = 120;
const BOX_HEIGHT = 116;
const BOX_GAP = 10;
const BOX_STEP = BOX_WIDTH + BOX_GAP;
const ANCHOR_OFFSET = 8;
const LANE_START = BOX_HEIGHT + 14;
const LANE_STEP = 12;

function boxStyle(state: string, reducedMotion: boolean): CSSProperties {
  const motion = reducedMotion
    ? undefined
    : `border-color ${transition.base}, background ${transition.base}, box-shadow ${transition.base}`;

  switch (state) {
    case 'active':
    case 'write':
      return {
        borderColor: vizVar.accent,
        background: `linear-gradient(180deg, ${vizVar.accentSoft}, color-mix(in srgb, var(--viz-surface-2) 70%, transparent))`,
        boxShadow: `0 0 0 3px ${vizVar.accentSoft}, 0 12px 24px -16px ${vizVar.accent}`,
        transition: motion,
      };
    case 'compare':
      return {
        borderColor: vizVar.purple,
        background: `linear-gradient(180deg, ${vizVar.purpleSoft}, color-mix(in srgb, var(--viz-surface-2) 70%, transparent))`,
        boxShadow: `0 0 0 3px ${vizVar.purpleSoft}`,
        transition: motion,
      };
    case 'empty':
      return {
        borderColor: vizVar.line2,
        borderStyle: 'dashed',
        background: 'transparent',
        transition: motion,
      };
    default:
      return {
        borderColor: vizVar.line2,
        background: `linear-gradient(180deg, ${vizVar.surface4}, ${vizVar.surface3})`,
        transition: motion,
      };
  }
}

const LEGEND = [
  { key: 'active', label: 'ativo', color: vizVar.accent },
  { key: 'compare', label: 'leitura', color: vizVar.purple },
  { key: 'write', label: 'escrita', color: vizVar.accent },
  { key: 'empty', label: 'vazio', color: vizVar.line2 },
] as const;

interface Link {
  from: PointerBox;
  to: PointerBox;
  fromIndex: number;
  toIndex: number;
  lane: number;
}

function linksFor(boxes: PointerBox[]): Link[] {
  const indexById = new Map(boxes.map((box, index) => [box.id, index]));
  const links: Link[] = [];

  boxes.forEach((from, fromIndex) => {
    if (!from.targetId) return;
    const toIndex = indexById.get(from.targetId);
    if (toIndex === undefined) return;
    links.push({ from, to: boxes[toIndex], fromIndex, toIndex, lane: links.length });
  });

  return links;
}

/** Address/value boxes for the pointer lessons. */
export function PointersView({ state }: { state: PointerState | undefined }) {
  const reducedMotion = useReducedMotion();
  const markerId = `pointer-arrowhead-${useId().replace(/:/g, '')}`;
  const boxes = state?.boxes ?? [];
  const links = linksFor(boxes);
  const canvasWidth = Math.max(boxes.length * BOX_STEP - BOX_GAP, BOX_WIDTH);
  const canvasHeight = LANE_START + links.length * LANE_STEP + 18;
  const states = new Set(boxes.map((box) => box.state || ''));
  const legend = LEGEND.filter((item) => states.has(item.key));

  const description =
    boxes.length === 0
      ? 'Memória vazia'
      : `Memória com ${boxes.length} ${boxes.length === 1 ? 'variável' : 'variáveis'}: ${boxes
          .map((box) => {
            const target = box.targetId
              ? boxes.find((candidate) => candidate.id === box.targetId)
              : undefined;
            const labels = box.labels?.length ? `, marcada como ${box.labels.join(' e ')}` : '';
            return `${box.type} ${box.name} no endereço ${box.address} com valor ${box.value}${labels}${
              target ? `, aponta para ${target.name}` : ''
            }`;
          })
          .join('; ')}`;

  return (
    <Box>
      <Box
        className="scroll-fade-x"
        style={{ overflowX: 'auto', overflowY: 'hidden', paddingInline: 4, paddingTop: 8 }}
        role="img"
        tabIndex={0}
        aria-label={description}
      >
        {boxes.length === 0 ? (
          <Flex align="center" justify="center" mih={250}>
            <Text fz="sm" c="dimmed">
              Memória vazia
            </Text>
          </Flex>
        ) : (
          <Box
            style={{
              position: 'relative',
              width: canvasWidth,
              height: canvasHeight,
              margin: '0 auto',
            }}
          >
            {links.length > 0 ? (
              <svg
                data-testid="pointer-links"
                width={canvasWidth}
                height={canvasHeight}
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'visible',
                  pointerEvents: 'none',
                }}
              >
                <defs>
                  <marker
                    id={markerId}
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill={vizVar.accent} />
                  </marker>
                </defs>
                {links.map((link) => {
                  const fromX =
                    link.fromIndex * BOX_STEP + BOX_WIDTH / 2 - ANCHOR_OFFSET;
                  const toX = link.toIndex * BOX_STEP + BOX_WIDTH / 2 + ANCHOR_OFFSET;
                  const laneY = LANE_START + link.lane * LANE_STEP;

                  return (
                    <path
                      key={`${link.from.id}-${link.to.id}-${link.lane}`}
                      data-lane={link.lane}
                      data-from={link.from.id}
                      data-to={link.to.id}
                      d={`M ${fromX} ${BOX_HEIGHT} C ${fromX} ${laneY}, ${toX} ${laneY}, ${toX} ${BOX_HEIGHT}`}
                      fill="none"
                      stroke={vizVar.accent}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      markerEnd={`url(#${markerId})`}
                      opacity="0.9"
                    />
                  );
                })}
              </svg>
            ) : null}

            <Flex gap={BOX_GAP} align="flex-start" wrap="nowrap" style={{ position: 'relative' }}>
              {boxes.map((box) => {
                const target = box.targetId
                  ? boxes.find((candidate) => candidate.id === box.targetId)
                  : undefined;
                return (
                  <Box
                    key={box.id}
                    data-testid={`pointer-box-${box.id}`}
                    style={{
                      width: BOX_WIDTH,
                      height: BOX_HEIGHT,
                      padding: space.sm,
                      border: '1px solid',
                      borderRadius: radius.lg,
                      ...boxStyle(box.state ?? '', reducedMotion),
                    }}
                  >
                    <Flex justify="space-between" align="baseline" gap={space.xs}>
                      <Text fz={font.micro} fw={600} ff="monospace" style={{ color: vizVar.ink }}>
                        {box.type.endsWith('*') ? `${box.type}${box.name}` : `${box.type} ${box.name}`}
                      </Text>
                      <Text fz={font.micro} ff="monospace" style={{ color: vizVar.muted }}>
                        {box.address}
                      </Text>
                    </Flex>

                    <Text
                      fz={font.h3}
                      fw={700}
                      ff="monospace"
                      ta="center"
                      mt={space.sm}
                      style={{ color: vizVar.ink, lineHeight: 1.1 }}
                    >
                      {box.value}
                    </Text>

                    {target ? (
                      <Text
                        fz={font.micro}
                        ta="center"
                        mt={space.xxs}
                        style={{ color: vizVar.muted }}
                      >
                        aponta para {target.name}
                      </Text>
                    ) : null}

                    {box.labels && box.labels.length > 0 ? (
                      <Flex gap={space.xxs} justify="center" wrap="wrap" mt={space.xs}>
                        {box.labels.map((label, index) => (
                          <Text
                            key={`${label}-${index}`}
                            span
                            px={4}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: radius.pill,
                              border: `1px solid ${vizVar.accentLine}`,
                              background: vizVar.accentSoft,
                              color: vizVar.accent,
                              fontSize: font.micro,
                              lineHeight: 1.4,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {label}
                          </Text>
                        ))}
                      </Flex>
                    ) : null}
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}
      </Box>

      {state?.result ? (
        <Flex justify="center" mt={space.sm}>
          <Flex
            gap={space.sm}
            align="baseline"
            px={space.md}
            py={space.xs}
            style={{
              border: `1px solid ${vizVar.accentLine}`,
              borderRadius: radius.pill,
              background: vizVar.accentSoft,
            }}
          >
            <Text fz={font.micro} tt="uppercase" style={{ color: vizVar.muted }}>
              {state.result.label}
            </Text>
            <Text fz={font.small} ff="monospace" style={{ color: vizVar.ink }}>
              {state.result.value}
            </Text>
          </Flex>
        </Flex>
      ) : null}

      <ViewLegend items={legend} />
    </Box>
  );
}
