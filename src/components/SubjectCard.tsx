import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Box, Group, Paper, Text, Title } from '@mantine/core';
import type { Subject } from '@/content/subjects';
import { font, radius, vizVar } from '@/theme';
import { ArrowRightIcon } from './icons';

const accents = {
  accent: vizVar.accent,
  success: vizVar.green,
  info: vizVar.purple,
} as const;

/** Large card shown on the home page for each subject. */
export function SubjectCard({ subject, index }: { subject: Subject; index?: number }) {
  const total = subject.groups.reduce((count, group) => count + group.entries.length, 0);
  const theoryOnly = subject.groups.every((group) =>
    group.entries.every((entry) => entry.kind === 'theory'),
  );
  const accent = accents[subject.accent];
  const style = {
    '--card-glow': `color-mix(in srgb, ${accent} 14%, transparent)`,
    borderColor: vizVar.line,
    background: vizVar.panel,
  } as CSSProperties;

  return (
    <Paper
      component={Link}
      to={`/materias/${subject.id}`}
      withBorder
      radius="xl"
      p="lg"
      className="subject-card"
      style={style}
    >
      <Box
        aria-hidden
        pos="absolute"
        top={0}
        left={0}
        right={0}
        h={2}
        style={{ background: `linear-gradient(90deg, ${accent}, transparent 78%)`, opacity: 0.75 }}
      />
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Text
          fz={font.micro}
          tt="uppercase"
          style={{ color: accent, letterSpacing: '0.14em' }}
        >
          {index !== undefined ? `${String(index).padStart(2, '0')} · ` : ''}
          {theoryOnly ? 'análise' : 'matéria'}
        </Text>
        <Text fz={font.tiny} c="dimmed">
          {total} {theoryOnly ? (total === 1 ? 'artigo' : 'artigos') : total === 1 ? 'lição' : 'lições'}
        </Text>
      </Group>

      <Title order={2} fz={font.h3} fw={600} mb={6} style={{ letterSpacing: '-0.02em' }}>
        {subject.title}
      </Title>
      <Text fz={font.small} c="dimmed" lh={1.55} mb="md" maw="34ch">
        {subject.description}
      </Text>

      <Group gap={6} mb="lg" wrap="wrap">
        {subject.groups.map((group) => (
          <Text
            key={group.id}
            fz={font.micro}
            c="dimmed"
            style={{
              border: `1px solid ${vizVar.line}`,
              borderRadius: radius.pill,
              padding: '2px 8px',
              background: 'color-mix(in srgb, var(--viz-surface-2) 52%, transparent)',
            }}
          >
            {group.title}
          </Text>
        ))}
      </Group>

      <Group justify="space-between" align="center">
        <Text fz={font.small} style={{ color: accent }} fw={500}>
          Explorar
        </Text>
        <Box style={{ display: 'inline-flex', color: accent }}>
          <ArrowRightIcon size={16} className="card-arrow" />
        </Box>
      </Group>
    </Paper>
  );
}
