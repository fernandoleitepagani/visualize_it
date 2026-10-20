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
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <Text fz={font.small} c="dimmed" aria-hidden>
                /
              </Text>
            ) : null}
            {item.to ? (
              <Anchor component={Link} to={item.to} fz={font.small} c="dimmed">
                {item.label}
              </Anchor>
            ) : (
              <Text fz={font.small} c="dimmed" aria-current="page">
                {item.label}
              </Text>
            )}
          </Fragment>
        ))}
      </Group>
    </Box>
  );
}
