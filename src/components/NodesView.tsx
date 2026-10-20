import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { Flex, Text } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import type { LinkedKind, Node } from '@/engine/types';
import { tint, vizVar } from '@/theme';

function nodeStyle(state: string): CSSProperties {
  const base: CSSProperties = { borderColor: vizVar.line2 };
  if (state === 'active')
    return { borderColor: vizVar.accent, boxShadow: `0 0 0 3px ${tint(vizVar.accent, 20)}` };
  if (state === 'compare') return { borderColor: vizVar.green };
  if (state === 'write') return { borderColor: vizVar.accent };
  return base;
}

const nodeTransition = (reducedMotion: boolean): CSSProperties => ({
  transition: reducedMotion ? 'none' : 'border-color 150ms ease-out, box-shadow 150ms ease-out',
});

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

  return (
    <Flex gap="sm" align="center" justify="center" wrap="wrap" pt="xl" pb="sm" mih={240}>
      {list.map((node, i) => {
        const state = node.state || '';
        const prev = node.prev ?? null;
        const next = node.next ?? null;

        return (
          <Fragment key={node.id}>
            <Flex direction="column" align="center" gap={6}>
              <Flex gap={4} wrap="nowrap" h={14} ff="monospace" fz={10} c="amber">
                {(node.labels ?? []).map((label, j) => (
                  <Text key={j} span>
                    {label}
                  </Text>
                ))}
              </Flex>
              <Flex
                align="stretch"
                bg="var(--viz-surface)"
                style={{
                  border: '1.5px solid',
                  borderRadius: 6,
                  overflow: 'hidden',
                  ...nodeTransition(reducedMotion),
                  ...nodeStyle(state),
                }}
              >
                {linked === 'doubly' && (
                  <Flex
                    align="center"
                    px="xs"
                    py={8}
                    bg="var(--viz-surface-2)"
                    ff="monospace"
                    fz={11}
                    c="dimmed"
                    style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
                  >
                    {prev ? `←${prev}` : '∅'}
                  </Flex>
                )}
                <Flex align="center" px="sm" py={8} ff="monospace" fz="sm" fw={600}>
                  {node.val}
                </Flex>
                <Flex
                  align="center"
                  px="xs"
                  py={8}
                  bg="var(--viz-surface-2)"
                  ff="monospace"
                  fz={11}
                  c="dimmed"
                  style={{ borderLeft: '1px solid var(--mantine-color-default-border)' }}
                >
                  {next ? `→${next}` : '∅'}
                </Flex>
              </Flex>
            </Flex>
            {i < list.length - 1 && (
              <Text ff="monospace" fz="sm" c="dimmed">
                →
              </Text>
            )}
          </Fragment>
        );
      })}
    </Flex>
  );
}
