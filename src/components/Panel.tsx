import type { ReactNode } from 'react';
import { Group, Paper, Text } from '@mantine/core';

interface Props {
  /** Left-aligned header text. */
  label: ReactNode;
  /** Optional right-aligned header content (counter, tabs, …). */
  aside?: ReactNode;
  children: ReactNode;
}

/** Shared card chrome: a header strip over a body. */
export function Panel({ label, aside, children }: Props) {
  return (
    <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
      <Group
        justify="space-between"
        gap="xs"
        px="md"
        py="sm"
        wrap="nowrap"
        style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
      >
        <Text fz="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
          {label}
        </Text>
        {aside}
      </Group>
      {children}
    </Paper>
  );
}
