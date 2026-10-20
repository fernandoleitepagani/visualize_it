import { Box, Group, Text } from '@mantine/core';
import { palette, radius, font, space } from '@/theme';

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
      style={{ borderTop: `1px solid ${palette.line}` }}
    >
      {items.map((item) => (
        <Group key={item.key} gap={6} wrap="nowrap">
          <Box
            w={8}
            h={8}
            style={{ background: item.color, borderRadius: radius.pill, flexShrink: 0 }}
          />
          <Text fz={font.micro} style={{ color: palette.muted }}>
            {item.label}
          </Text>
        </Group>
      ))}
    </Group>
  );
}
