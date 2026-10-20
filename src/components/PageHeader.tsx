import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Box, Group, Text, Title } from '@mantine/core';
import { font, space } from '@/theme';
import type { BreadcrumbItem } from './Breadcrumbs';
import { Breadcrumbs } from './Breadcrumbs';

interface Props {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
}

/** Shared page header: breadcrumb, title, optional subtitle and actions. */
export function PageHeader({ title, subtitle, breadcrumb, actions }: Props) {
  return (
    <Box mb="lg" pb="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
      {breadcrumb?.length ? (
        <Breadcrumbs items={breadcrumb} />
      ) : (
        <Anchor component={Link} to="/" c="dimmed" fz="sm">
          ← Início
        </Anchor>
      )}

      <Group justify="space-between" align="flex-end" gap="md" mt="xs" wrap="wrap">
        <Box style={{ minWidth: 0 }}>
          <Title order={1} fz={font.h2} fw={600}>
            {title}
          </Title>
          {subtitle ? (
            <Text c="dimmed" fz={font.small} mt={space.xs}>
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {actions ? (
          <Group gap="sm" wrap="nowrap">
            {actions}
          </Group>
        ) : null}
      </Group>
    </Box>
  );
}
