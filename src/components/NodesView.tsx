import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { LinkedKind, Node } from '@/engine/types';
import { radius, font, transition, space, vizVar } from '@/theme';
import { ViewLegend } from './ViewLegend';

function nodeStyle(state: string): CSSProperties {
  if (state === 'active')
    return {
      borderColor: vizVar.accent,
      background: `linear-gradient(180deg, ${vizVar.accentSoft}, color-mix(in srgb, var(--viz-surface-2) 74%, transparent))`,
      boxShadow: `0 0 0 3px ${vizVar.accentSoft}, 0 14px 26px -18px ${vizVar.accent}`,
    };
  if (state === 'compare')
    return {
      borderColor: vizVar.green,
      background: `linear-gradient(180deg, ${vizVar.greenSoft}, color-mix(in srgb, var(--viz-surface-2) 74%, transparent))`,
    };
  if (state === 'write')
    return {
      borderColor: vizVar.accentLine,
      background: `linear-gradient(180deg, ${vizVar.accentSoft}, color-mix(in srgb, var(--viz-surface-2) 74%, transparent))`,
    };
  return {
    borderColor: vizVar.line2,
    background: `linear-gradient(180deg, ${vizVar.surface4}, ${vizVar.surface3})`,
  };
}

const nodeTransition = (reducedMotion: boolean): CSSProperties => ({
  transition: reducedMotion
    ? 'none'
    : `transform ${transition.base}, border-color ${transition.base}, background ${transition.base}, box-shadow ${transition.base}`,
});

const LEGEND = [
  { key: 'active', label: 'ativo', color: vizVar.accent },
  { key: 'compare', label: 'comparação', color: vizVar.green },
] as const;

/** Curved connector between two nodes, with an organic arrowhead. */
function Connector({ active, doubly }: { active: boolean; doubly: boolean }) {
  const color = active ? vizVar.accent : vizVar.line3;
  return (
    <svg width="38" height="34" viewBox="0 0 38 34" aria-hidden style={{ flexShrink: 0 }}>
      {doubly ? (
        <>
          <path
            d="M2 11 C 12 11, 25 10, 33 10"
            fill="none"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path d="M29 6.5 35 10 29 13.5" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M36 24 C 26 24, 13 25, 5 25"
            fill="none"
            stroke={color}
            strokeWidth="1.1"
            strokeDasharray="3 3"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path d="M9 21.5 3 25 9 28.5" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
        </>
      ) : (
        <>
          <path
            d="M2 17 C 12 17, 25 17, 33 17"
            fill="none"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path d="M29 13 35 17 29 21" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Nodes view — linked structures (singly/doubly linked lists, queues, stacks). */
export function NodesView({
  nodes,
  linked = 'singly',
}: {
  nodes: Node[] | undefined;
  linked?: LinkedKind;
}) {
  const reducedMotion = useReducedMotion();
  const list = nodes ?? [];
  const byId = new Map(list.map((node) => [node.id, node]));
  const states = new Set(list.map((node) => node.state || ''));
  const hasActive = states.has('active') || states.has('write');
  const activeLegend = LEGEND.filter((item) =>
    item.key === 'active' ? hasActive : states.has(item.key),
  );

  return (
    <Box>
      <Box
        className="scroll-fade-x"
        style={{ overflowX: 'auto', paddingInline: 8 }}
        role="img"
        tabIndex={0}
        aria-label={list.length > 0 ? `Lista com ${list.length} nós` : 'Lista vazia'}
      >
        <Flex
          gap={0}
          align="center"
          justify="center"
          wrap="nowrap"
          pt="lg"
          pb="sm"
          mih={250}
          style={{ minWidth: 'max-content', width: 'fit-content', margin: '0 auto' }}
        >
          {list.length === 0 ? (
            <Text fz="sm" c="dimmed" pb="xl">
              Lista vazia
            </Text>
          ) : null}
          {list.map((node, i) => {
            const state = node.state || '';
            const prev = node.prev ?? null;
            const next = node.next ?? null;
            const prevVal = prev ? (byId.get(prev)?.val ?? prev) : null;
            const nextVal = next ? (byId.get(next)?.val ?? next) : null;
            const isActive = state === 'active' || state === 'write' || state === 'compare';

            return (
              <Fragment key={node.id}>
                <Flex direction="column" align="center" gap={6} style={{ flexShrink: 0 }}>
                  <Flex
                    gap={space.xs}
                    wrap="nowrap"
                    h={20}
                    w="100%"
                    align="center"
                    justify="center"
                    fz={font.micro}
                    style={{ color: vizVar.accent }}
                  >
                    {(node.labels ?? []).map((label, j) => (
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
                    align="stretch"
                    style={{
                      border: '1.5px solid',
                      borderRadius: radius.md,
                      overflow: 'hidden',
                      transform: isActive ? 'translateY(-4px)' : undefined,
                      ...nodeTransition(reducedMotion),
                      ...nodeStyle(state),
                    }}
                  >
                    {linked === 'doubly' ? (
                      <Flex
                        align="center"
                        px="xs"
                        py={space.sm}
                        fz={font.micro}
                        style={{
                          borderRight: `1px solid ${vizVar.line}`,
                          background: 'color-mix(in srgb, var(--viz-surface) 46%, transparent)',
                          color: prev ? vizVar.muted : vizVar.dim,
                          minWidth: 34,
                          justifyContent: 'center',
                        }}
                      >
                        {prev !== null ? `←${prevVal}` : '∅'}
                      </Flex>
                    ) : null}
                    <Flex
                      align="center"
                      px="md"
                      py={space.sm}
                      fz="sm"
                      fw={600}
                      style={{ color: vizVar.ink, minWidth: 42, justifyContent: 'center' }}
                    >
                      {node.val}
                    </Flex>
                    <Flex
                      align="center"
                      px="xs"
                      py={space.sm}
                      fz={font.micro}
                      style={{
                        borderLeft: `1px solid ${vizVar.line}`,
                        background: 'color-mix(in srgb, var(--viz-surface) 46%, transparent)',
                        color: next ? vizVar.muted : vizVar.dim,
                        minWidth: 34,
                        justifyContent: 'center',
                      }}
                    >
                      {next !== null ? `${nextVal}→` : '∅'}
                    </Flex>
                  </Flex>
                </Flex>
                {i < list.length - 1 ? (
                  <Connector active={isActive} doubly={linked === 'doubly'} />
                ) : (
                  <>
                    <Connector active={isActive} doubly={linked === 'doubly'} />
                    <Box
                      px="sm"
                      py={space.xs}
                      fz={font.tiny}
                      style={{
                        border: `1px dashed ${vizVar.line2}`,
                        borderRadius: radius.pill,
                        color: vizVar.dim,
                        flexShrink: 0,
                      }}
                    >
                      ∅
                    </Box>
                  </>
                )}
              </Fragment>
            );
          })}
        </Flex>
      </Box>
      <ViewLegend items={activeLegend} />
    </Box>
  );
}
