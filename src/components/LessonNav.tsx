import { Link } from 'react-router-dom';
import { Anchor, Button, Group, Paper, Text, Title } from '@mantine/core';
import type { EntryLocation } from '@/content/subjects';
import { getEntryPath, getEntryTitle } from '@/content/subjects';
import { font, vizVar } from '@/theme';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

function siblingLessons(location: EntryLocation) {
  return location.group.entries.filter((entry) => entry.kind === 'lesson');
}

/** Previous/next buttons within the current group. */
export function LessonPager({ location }: { location: EntryLocation }) {
  const entries = siblingLessons(location);
  const index = entries.findIndex((entry) => entry.slug === location.entry.slug);
  const previous = index > 0 ? entries[index - 1] : undefined;
  const next = index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined;

  return (
    <Group gap="xs" wrap="nowrap">
      {previous ? (
        <Button
          component={Link}
          to={getEntryPath(previous)}
          variant="default"
          size="xs"
          radius="pill"
          leftSection={<ChevronLeftIcon size={13} />}
          title={getEntryTitle(previous)}
        >
          Anterior
        </Button>
      ) : (
        <Button variant="default" size="xs" radius="pill" leftSection={<ChevronLeftIcon size={13} />} disabled>
          Anterior
        </Button>
      )}

      {next ? (
        <Button
          component={Link}
          to={getEntryPath(next)}
          variant="default"
          size="xs"
          radius="pill"
          rightSection={<ChevronRightIcon size={13} />}
          title={getEntryTitle(next)}
        >
          Próximo
        </Button>
      ) : (
        <Button variant="default" size="xs" radius="pill" rightSection={<ChevronRightIcon size={13} />} disabled>
          Próximo
        </Button>
      )}
    </Group>
  );
}

/** Bottom panel listing the other lessons in the same group. */
export function LessonRelated({ location }: { location: EntryLocation }) {
  const entries = siblingLessons(location);
  if (entries.length <= 1) return null;

  return (
    <Paper
      withBorder
      radius="xl"
      p="md"
      mt="xl"
      style={{ borderColor: vizVar.line, background: 'color-mix(in srgb, var(--viz-surface) 74%, transparent)' }}
    >
      <Group justify="space-between" align="baseline" mb="sm" wrap="wrap">
        <Title order={2} fz={font.small} fw={600}>
          Outros em {location.group.title}
        </Title>
        <Text fz={font.micro} c="dimmed" ff="monospace">
          {location.subject.title} · {location.group.title}
        </Text>
      </Group>
      <Group gap={6} wrap="wrap">
        {entries.map((entry) => {
          const current = entry.slug === location.entry.slug;
          return (
            <Anchor
              key={entry.slug}
              component={Link}
              to={getEntryPath(entry)}
              fz={font.tiny}
              underline="never"
              aria-current={current ? 'page' : undefined}
              style={{
                color: current ? vizVar.accent : vizVar.muted,
                border: `1px solid ${current ? vizVar.accentLine : vizVar.line}`,
                background: current ? vizVar.accentSoft : 'transparent',
                borderRadius: 999,
                padding: '3px 9px',
                fontWeight: current ? 600 : 400,
              }}
            >
              {getEntryTitle(entry)}
            </Anchor>
          );
        })}
      </Group>
    </Paper>
  );
}
