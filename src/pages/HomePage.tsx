import { Box, Group, Paper, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { catalog } from '@/content/catalog';
import { getLesson } from '@/content/lessons';
import { ThemeToggle } from '@/components/ThemeToggle';

export function HomePage() {
  return (
    <>
      <Group
        justify="space-between"
        mb="lg"
        pb="md"
        style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
      >
        <Title order={1} fz={22} fw={600}>
          Visualize It
          <Text span c="amber">
            .
          </Text>
        </Title>
        <ThemeToggle />
      </Group>

      <Box pt="sm" pb="xl">
        <Title order={1} fz={34} fw={600} mb="xs">
          Veja os algoritmos{' '}
          <Text span c="amber">
            funcionando
          </Text>
          .
        </Title>
        <Text c="dimmed" fz={15.5} maw={640}>
          Percorra cada algoritmo linha por linha, com a estrutura animada, código em Java ou C e a
          análise assintótica lado a lado.
        </Text>
      </Box>

      {catalog.map((section) => (
        <Box key={section.title} mt={8}>
          <Title order={2} fz={19} fw={600} mb="md">
            {section.title}
          </Title>
          {section.groups.map((group) => (
            <Box key={group.title}>
              <Text
                fz="xs"
                fw={600}
                tt="uppercase"
                c="dimmed"
                mt="lg"
                mb="sm"
                style={{ letterSpacing: '0.12em' }}
              >
                {group.title}
              </Text>
              <Box
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                }}
              >
                {group.entries.map((entry) => {
                  const to =
                    entry.kind === 'lesson' ? `/algoritmos/${entry.slug}` : `/teoria/${entry.slug}`;
                  const title =
                    entry.kind === 'lesson'
                      ? (getLesson(entry.slug)?.title ?? entry.slug)
                      : entry.title;

                  return (
                    <Paper
                      key={entry.slug}
                      component={Link}
                      to={to}
                      withBorder
                      radius="md"
                      p="md"
                      className="catalog-card"
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <Title order={3} fz={15} fw={600} mb={6}>
                        {title}
                      </Title>
                      <Text fz={13} c="dimmed" lh={1.35}>
                        {entry.blurb}
                      </Text>
                      <Text ff="monospace" fz={11} c="amber" mt="sm" style={{ opacity: 0.85 }}>
                        {entry.tag}
                      </Text>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      ))}

      <Box mt={56} pt="md" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
        <Text fz={12.5} c="dimmed">
          Última fase — busca, complexidade e provas por indução.
        </Text>
      </Box>
    </>
  );
}
