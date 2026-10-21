import { Box, Group, Text } from '@mantine/core';
import { font, radius, space, vizVar } from '@/theme';

export interface LegendItem {
  key: string;
  label: string;
  color: string;
}

/** Shared footer legend so the three views read the same way. */
export function ViewLegend({ items }: { items: LegendItem[] }) {
  if (items.length === 0) return null;

  return (
    <Group
      justify="center"
      gap="md"
      wrap="wrap"
      pt="xs"
      mt={space.xs}
      style={{ borderTop: `1px solid ${vizVar.line}` }}
    >
      {items.map((item) => (
        <Group key={item.key} gap={6} wrap="nowrap">
          <Box
            w={7}
            h={7}
            style={{ background: item.color, borderRadius: radius.pill, flexShrink: 0 }}
          />
          <Text fz={font.micro} ff="monospace" style={{ color: vizVar.muted }}>
            {item.label}
          </Text>
        </Group>
      ))}
    </Group>
  );
}
