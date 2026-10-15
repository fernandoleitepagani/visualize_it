import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { Flex, Text } from '@mantine/core';
import type { LinkedKind, Node } from '@/engine/types';
import { viz } from '@/theme';

function nodeStyle(state: string): CSSProperties {
  const base: CSSProperties = { borderColor: viz.line2 };
  if (state === 'active')
    return { borderColor: viz.accent, boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.2)' };
  if (state === 'compare') return { borderColor: viz.green };
  if (state === 'write') return { borderColor: viz.accent };
  return base;
}

const transition: CSSProperties = {
  transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
};

/** Nodes view — linked structures (singly/doubly linked lists, queues, stacks). */
export function NodesView({
  nodes,
  linked = 'singly',
}: {
  nodes: Node[] | undefined;
  linked?: LinkedKind;
}) {
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
                bg="dark.5"
                style={{
                  border: '1.5px solid',
                  borderRadius: 6,
                  overflow: 'hidden',
                  ...transition,
                  ...nodeStyle(state),
                }}
              >
                {linked === 'doubly' && (
                  <Flex
                    align="center"
                    px="xs"
                    py={8}
                    bg="dark.8"
                    ff="monospace"
                    fz={11}
                    c="dimmed"
                    style={{ borderRight: '1px solid var(--mantine-color-dark-4)' }}
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
                  bg="dark.8"
                  ff="monospace"
                  fz={11}
                  c="dimmed"
                  style={{ borderLeft: '1px solid var(--mantine-color-dark-4)' }}
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
