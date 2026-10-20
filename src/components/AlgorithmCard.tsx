import { Link } from 'react-router-dom';
import { Box, Group, Paper, Text, Title } from '@mantine/core';
import type { EntryLocation } from '@/content/subjects';
import { getEntryPath, getEntrySubtitle, getEntryTitle, getEntryView } from '@/content/subjects';
import { font, palette, radius } from '@/theme';
import { ViewPreview } from './ViewPreview';

/** Card used in the subject catalog and in the home page highlights. */
export function AlgorithmCard({
  location,
  compact = false,
}: {
  location: EntryLocation;
  compact?: boolean;
}) {
  const { entry } = location;
  const title = getEntryTitle(entry);
  const subtitle = getEntrySubtitle(entry);
  const view = getEntryView(entry);

  if (compact) {
    return (
      <Paper
        component={Link}
        to={getEntryPath(entry)}
        withBorder
        radius="md"
        p="sm"
        className="algorithm-card"
        style={{ display: 'block', textDecoration: 'none' }}
      >
        <Group wrap="nowrap" align="center" gap="md">
          <ViewPreview view={view} kind={entry.kind} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Title order={3} fz={font.small} fw={600} lineClamp={1}>
                {title}
              </Title>
              <Group gap={6} wrap="nowrap">
                <Text ff="monospace" fz={font.tiny} c="amber" style={{ whiteSpace: 'nowrap' }}>
                  {entry.tag}
                </Text>
                <Text span className="card-arrow" c="amber" fz={font.tiny}>
                  →
                </Text>
              </Group>
            </Group>
            <Text fz={font.small} c="dimmed" lineClamp={1}>
              {entry.blurb}
            </Text>
          </Box>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper
      component={Link}
      to={getEntryPath(entry)}
      withBorder
      radius="md"
      p="md"
      className="algorithm-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        height: '100%',
        background: palette.surface,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap" mb="xs">
        <ViewPreview view={view} kind={entry.kind} />
        <Text
          ff="monospace"
          fz={font.micro}
          c="amber"
          style={{
            border: `1px solid ${palette.line2}`,
            borderRadius: radius.pill,
            padding: '2px 8px',
            background: palette.surface2,
            whiteSpace: 'nowrap',
          }}
        >
          {entry.tag}
        </Text>
      </Group>

      <Title order={3} fz={font.body} fw={600} mb={2}>
        {title}
      </Title>
      {subtitle ? (
        <Text fz={font.tiny} c="dimmed" mb={4}>
          {subtitle}
        </Text>
      ) : null}

      <Text fz={font.small} c="dimmed" lh={1.35} lineClamp={2} style={{ flexGrow: 1 }}>
        {entry.blurb}
      </Text>

      <Group justify="flex-end" align="center" mt="sm">
        <Text fz={font.small} c="amber" fw={600}>
          Abrir <span className="card-arrow">→</span>
        </Text>
      </Group>
    </Paper>
  );
}
