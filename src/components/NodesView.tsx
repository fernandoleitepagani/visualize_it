import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import type { LinkedKind, Node } from '@/engine/types';
import { palette, radius, font, transition, shadow, space } from '@/theme';
import { ViewLegend } from './ViewLegend';

function nodeStyle(state: string): CSSProperties {
  const base: CSSProperties = { borderColor: palette.line2 };
  if (state === 'active')
    return { borderColor: palette.accent, background: palette.accentSoft, boxShadow: shadow.focus };
  if (state === 'compare') return { borderColor: palette.success, background: palette.successSoft };
  if (state === 'write') return { borderColor: palette.accent, background: palette.accentSoft };
  return base;
}

const nodeTransition: CSSProperties = {
  transition: `transform ${transition.base}, border-color ${transition.base}, background-color ${transition.base}, box-shadow ${transition.base}`,
};

const LEGEND = [
  { key: 'active', label: 'ativo', color: palette.accent },
  { key: 'compare', label: 'comparação', color: palette.success },
] as const;

/** Nodes view — linked structures (singly/doubly linked lists, queues, stacks). */
export function NodesView({
  nodes,
  linked = 'singly',
}: {
  nodes: Node[] | undefined;
  linked?: LinkedKind;
}) {
  const list = nodes ?? [];
  const states = new Set(list.map((node) => node.state || ''));
  const hasActive = states.has('active') || states.has('write');
  const activeLegend = LEGEND.filter((item) =>
    item.key === 'active' ? hasActive : states.has(item.key),
  );

  return (
    <Box>
      <Flex
        gap="sm"
        align="center"
        justify="center"
        wrap="wrap"
        pt="xl"
        pb="sm"
        mih={240}
        role="img"
        aria-label={list.length > 0 ? `Lista com ${list.length} nós` : 'Lista vazia'}
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
          const isActive = state === 'active' || state === 'write' || state === 'compare';

          return (
            <Fragment key={node.id}>
              <Flex direction="column" align="center" gap={6}>
                <Flex gap={space.xs} wrap="nowrap" h={14} ff="monospace" fz={font.micro} c="amber">
                  {(node.labels ?? []).map((label, j) => (
                    <Text key={j} span className="viz-pointer-badge">
                      {label}
                    </Text>
                  ))}
                </Flex>
                <Flex
                  align="stretch"
                  bg="dark.5"
                  style={{
                    border: '1.5px solid',
                    borderRadius: radius.sm,
                    overflow: 'hidden',
                    transform: isActive ? 'translateY(-3px)' : undefined,
                    ...nodeTransition,
                    ...nodeStyle(state),
                  }}
                >
                  {linked === 'doubly' && (
                    <Flex
                      align="center"
                      px="xs"
                      py={space.sm}
                      bg="dark.8"
                      ff="monospace"
                      fz={font.tiny}
                      c="dimmed"
                      style={{ borderRight: `1px solid ${palette.line}` }}
                    >
                      {prev ? `←${prev}` : '∅'}
                    </Flex>
                  )}
                  <Flex align="center" px="sm" py={space.sm} ff="monospace" fz="sm" fw={600}>
                    {node.val}
                  </Flex>
                  <Flex
                    align="center"
                    px="xs"
                    py={space.sm}
                    bg="dark.8"
                    ff="monospace"
                    fz={font.tiny}
                    c="dimmed"
                    style={{ borderLeft: `1px solid ${palette.line}` }}
                  >
                    {next ? `→${next}` : '∅'}
                  </Flex>
                </Flex>
              </Flex>
              {i < list.length - 1 && (
                <Text
                  ff="monospace"
                  fz="sm"
                  c={isActive ? 'amber' : 'dimmed'}
                  fw={isActive ? 700 : 400}
                  style={{ transition: `color ${transition.base}` }}
                >
                  →
                </Text>
              )}
            </Fragment>
          );
        })}
      </Flex>
      <ViewLegend items={activeLegend} />
    </Box>
  );
}
