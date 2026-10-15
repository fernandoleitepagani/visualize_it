import { Anchor, Box, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

/** Shared page header: back link, title and optional subtitle. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box mb="lg" pb="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
      <Anchor component={Link} to="/" c="dimmed" fz="sm">
        ← todos os algoritmos
      </Anchor>
      <Title order={1} fz={24} fw={600} mt="xs">
        {title}
      </Title>
      {subtitle ? (
        <Text c="dimmed" fz={13.5} mt={4}>
          {subtitle}
        </Text>
      ) : null}
    </Box>
  );
}
