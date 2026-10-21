import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Box, Group, Text } from '@mantine/core';
import { font } from '@/theme';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

/** Accessible breadcrumb used by subject, lesson and theory pages. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Box component="nav" aria-label="breadcrumb">
      <Group gap={6} wrap="wrap">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <Text fz={font.tiny} c="dimmed" aria-hidden>
                  ›
                </Text>
              ) : null}
              {item.to ? (
                <Anchor component={Link} to={item.to} fz={font.tiny} c="dimmed" underline="never">
                  {item.label}
                </Anchor>
              ) : (
                <Text
                  fz={font.tiny}
                  c={last ? undefined : 'dimmed'}
                  aria-current="page"
                  lineClamp={1}
                  style={last ? { color: 'var(--viz-ink-2)' } : undefined}
                >
                  {item.label}
                </Text>
              )}
            </Fragment>
          );
        })}
      </Group>
    </Box>
  );
}
