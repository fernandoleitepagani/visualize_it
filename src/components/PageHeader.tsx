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
  /** Small mono label above the title. */
  kicker?: string;
  /** Pills rendered below the subtitle. */
  meta?: ReactNode;
  /** Optional subject accent for the title rule. */
  accent?: string;
}

/** Shared page header: breadcrumb, title, optional subtitle, meta and actions. */
export function PageHeader({ title, subtitle, breadcrumb, actions, kicker, meta, accent }: Props) {
  return (
    <Box mb="lg" pb="md">
      {breadcrumb?.length ? (
        <Breadcrumbs items={breadcrumb} />
      ) : (
        <Anchor component={Link} to="/" c="dimmed" fz="sm">
          ← Início
        </Anchor>
      )}

      {kicker ? (
        <Text
          mt="md"
          fz={font.micro}
          fw={500}
          tt="uppercase"
          style={{ color: accent ?? 'var(--viz-accent)', letterSpacing: '0.16em' }}
        >
          {kicker}
        </Text>
      ) : null}

      <Group justify="space-between" align="flex-end" gap="md" mt={kicker ? 6 : 'sm'} wrap="wrap">
        <Box style={{ minWidth: 0 }}>
          <Title
            order={1}
            fz={{ base: font.h2, sm: font.h1 }}
            fw={500}
            style={{ letterSpacing: '-0.035em', lineHeight: 1.05 }}
          >
            {title}
          </Title>
          {subtitle ? (
            <Text c="dimmed" fz={font.body} mt={space.xs} style={{ maxWidth: '62ch' }}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <Group gap={8} mt="sm" wrap="wrap">
              {meta}
            </Group>
          ) : null}
        </Box>
        {actions ? (
          <Group gap="sm" wrap="nowrap">
            {actions}
          </Group>
        ) : null}
      </Group>

      <Box
        mt="lg"
        className="flow-rule"
        style={
          accent
            ? { background: `linear-gradient(90deg, ${accent}, var(--viz-line-2) 26%, transparent 92%)` }
            : undefined
        }
      />
    </Box>
  );
}
