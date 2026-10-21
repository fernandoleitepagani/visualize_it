import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Box, Group, Paper, Text, Title } from '@mantine/core';
import type { EntryLocation } from '@/content/subjects';
import { getEntryPath, getEntrySubtitle, getEntryTitle, getEntryView } from '@/content/subjects';
import { font, vizVar } from '@/theme';
import { ArrowRightIcon } from './icons';
import { MetaPill } from './MetaPill';
import { ViewPreview } from './ViewPreview';

const accents = {
  accent: vizVar.accent,
  success: vizVar.green,
  info: vizVar.purple,
} as const;

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
  const accent = accents[location.subject.accent];
  const glowStyle = { '--card-glow': `color-mix(in srgb, ${accent} 14%, transparent)` } as CSSProperties;

  if (compact) {
    return (
      <Paper
        component={Link}
        to={getEntryPath(entry)}
        withBorder
        radius="xl"
        p="sm"
        className="algorithm-card"
        style={{ ...glowStyle, display: 'block', borderColor: vizVar.line }}
      >
        <Group wrap="nowrap" align="center" gap="md">
          <ViewPreview view={view} kind={entry.kind} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Title order={3} fz={font.small} fw={600} lineClamp={1}>
                {title}
              </Title>
              <Group gap={6} wrap="nowrap">
                <Text ff="monospace" fz={font.micro} style={{ color: accent, whiteSpace: 'nowrap' }}>
                  {entry.tag}
                </Text>
                <ArrowRightIcon size={13} className="card-arrow" style={{ color: accent }} />
              </Group>
            </Group>
            <Text fz={font.tiny} c="dimmed" lineClamp={1}>
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
      radius="xl"
      p="md"
      className="algorithm-card"
      style={{
        ...glowStyle,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderColor: vizVar.line,
        background: vizVar.panel,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap" mb="sm">
        <ViewPreview view={view} kind={entry.kind} />
        <MetaPill tone="accent">{entry.tag}</MetaPill>
      </Group>

      <Title order={3} fz={font.lead} fw={600} mb={2} style={{ letterSpacing: '-0.015em' }}>
        {title}
      </Title>
      {subtitle ? (
        <Text fz={font.tiny} c="dimmed" mb={6}>
          {subtitle}
        </Text>
      ) : null}

      <Text fz={font.small} c="dimmed" lh={1.5} lineClamp={2} style={{ flexGrow: 1 }}>
        {entry.blurb}
      </Text>

      <Group justify="space-between" align="center" mt="md">
        <Text fz={font.tiny} ff="monospace" c="dimmed">
          abrir lição
        </Text>
        <Box style={{ display: 'inline-flex', color: accent }}>
          <ArrowRightIcon size={15} className="card-arrow" />
        </Box>
      </Group>
    </Paper>
  );
}
