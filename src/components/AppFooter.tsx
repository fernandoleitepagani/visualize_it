import { Link } from 'react-router-dom';
import { Anchor, Container, Group, Text } from '@mantine/core';
import { subjects } from '@/content/subjects';
import { font } from '@/theme';

export function AppFooter() {
  return (
    <Container size={1100} px="md">
      <Group justify="space-between" align="center" wrap="nowrap" gap="md">
        <Text fz={font.tiny} c="dimmed">
          Projeto acadêmico — AEDS I/II
        </Text>
        <Group gap="md" wrap="nowrap" visibleFrom="sm">
          {subjects.map((subject) => (
            <Anchor
              key={subject.id}
              component={Link}
              to={`/materias/${subject.id}`}
              underline="never"
              fz={font.tiny}
              c="dimmed"
            >
              {subject.title}
            </Anchor>
          ))}
        </Group>
      </Group>
    </Container>
  );
}
