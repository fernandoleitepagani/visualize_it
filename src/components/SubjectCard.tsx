import { Link } from 'react-router-dom';
import { Group, Paper, Text, Title } from '@mantine/core';
import type { Subject } from '@/content/subjects';
import { font, palette, radius } from '@/theme';

/** Large card shown on the home page for each subject. */
export function SubjectCard({ subject }: { subject: Subject }) {
  const total = subject.groups.reduce((count, group) => count + group.entries.length, 0);
  const theoryOnly = subject.groups.every((group) =>
    group.entries.every((entry) => entry.kind === 'theory'),
  );
  const accent = palette[subject.accent];

  return (
    <Paper
      component={Link}
      to={`/materias/${subject.id}`}
      withBorder
      radius="md"
      p="lg"
      className="subject-card"
      style={{
        display: 'block',
        textDecoration: 'none',
        height: '100%',
        borderTop: `3px solid ${accent}`,
      }}
    >
      <Group justify="space-between" mb="xs">
        <Text fz={font.tiny} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.08em' }}>
          {theoryOnly ? 'análise' : 'matéria'}
        </Text>
        <Text fz={font.tiny} c="dimmed">
          {total} {theoryOnly ? (total === 1 ? 'artigo' : 'artigos') : total === 1 ? 'lição' : 'lições'}
        </Text>
      </Group>

      <Title order={2} fz={font.h3} fw={600} mb={4}>
        {subject.title}
      </Title>
      <Text fz={font.small} c="dimmed" lh={1.4} mb="md">
        {subject.description}
      </Text>

      <Group gap={6} mb="md" wrap="wrap">
        {subject.groups.map((group) => (
          <Text
            key={group.id}
            fz={font.tiny}
            c="dimmed"
            style={{
              border: `1px solid ${palette.line}`,
              borderRadius: radius.pill,
              padding: '2px 8px',
            }}
          >
            {group.title}
          </Text>
        ))}
      </Group>

      <Text fz={font.small} c="amber" fw={600}>
        Explorar →
      </Text>
    </Paper>
  );
}
