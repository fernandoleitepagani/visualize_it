import { Link } from 'react-router-dom';
import { Anchor, Container, Group, Text } from '@mantine/core';
import { subjects } from '@/content/subjects';
import { font, space } from '@/theme';

export function AppFooter() {
  return (
    <Container size={1280} px={{ base: 'md', sm: 'lg', md: 'xl' }}>
      <Group justify="space-between" align="flex-start" gap="lg" wrap="wrap">
        <div>
          <Text fz={font.small} fw={600} style={{ color: 'var(--viz-ink)' }}>
            Visualize It<span style={{ color: 'var(--viz-accent)' }}>.</span>
          </Text>
          <Text fz={font.tiny} c="dimmed" mt={4}>
            Projeto acadêmico — AEDS I/II
          </Text>
        </div>

        <Group gap="lg" wrap="wrap">
          {subjects.map((subject) => (
            <Anchor
              key={subject.id}
              component={Link}
              to={`/materias/${subject.id}`}
              underline="never"
              fz={font.tiny}
              c="dimmed"
              className="footer-link"
            >
              {subject.title}
            </Anchor>
          ))}
          <Anchor component={Link} to="/playground" underline="never" fz={font.tiny} c="dimmed">
            Playground
          </Anchor>
        </Group>
      </Group>

      <Group justify="space-between" mt={space.lg} pt={space.md} gap="sm" wrap="wrap">
        <Text fz={font.micro} c="dimmed" style={{ letterSpacing: '0.08em' }}>
          PUC Minas · AEDS I/II
        </Text>
        <Text fz={font.micro} c="dimmed">
          feito para aprender passo a passo
        </Text>
      </Group>
    </Container>
  );
}
