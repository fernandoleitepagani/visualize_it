import { Group, Text } from '@mantine/core';
import type { VarValue } from '@/engine/types';

/** Chips showing the named variables captured by the current step. */
export function VarsPanel({ vars }: { vars?: Record<string, VarValue> }) {
  const entries = Object.entries(vars ?? {});
  if (entries.length === 0) return null;

  return (
    <Group
      justify="center"
      gap="xs"
      mt="md"
      pt="sm"
      ff="monospace"
      fz="xs"
      style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
    >
      {entries.map(([name, value]) => (
        <Group
          key={name}
          gap={6}
          px="xs"
          py={2}
          bg="var(--viz-surface)"
          style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 6 }}
        >
          <Text span fs="italic" c="dimmed">
            {name}
          </Text>
          {value === null || value === undefined ? (
            <Text span c="dimmed">
              —
            </Text>
          ) : (
            <Text span fw={600} c="amber">
              {String(value)}
            </Text>
          )}
        </Group>
      ))}
    </Group>
  );
}
