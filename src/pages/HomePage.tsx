import { Anchor, Box, Group, SimpleGrid, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { AlgorithmCard } from '@/components/AlgorithmCard';
import { GlobalSearch } from '@/components/GlobalSearch';
import { SubjectCard } from '@/components/SubjectCard';
import type { EntryLocation } from '@/content/subjects';
import { getEntryLocation, subjects } from '@/content/subjects';
import { font, space } from '@/theme';

const featuredSlugs = ['selecao', 'busca-binaria', 'pilha-sequencial'];

export function HomePage() {
  const featured = featuredSlugs
    .map((slug) => getEntryLocation(slug))
    .filter((location): location is EntryLocation => Boolean(location));

  return (
    <>
      <Box
        pt="md"
        pb="xl"
        mb="lg"
        style={{
          background:
            'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(251, 191, 36, 0.05), transparent 70%)',
        }}
      >
        <Title order={1} fz={{ base: font.h2, sm: font.h1 }} fw={600} mb="sm">
          Escolha uma matéria para começar.
        </Title>
        <Text c="dimmed" fz={font.lead} maw={720} mb="lg">
          Percorra cada algoritmo linha por linha, com a estrutura animada, código em Java ou C e a
          análise assintótica lado a lado.
        </Text>
        <Box maw={640}>
          <GlobalSearch
            trigger="input"
            fullWidth
            placeholder="Buscar por algoritmo, matéria ou tag..."
          />
        </Box>
      </Box>

      <Box component="section" aria-labelledby="materias" mb={space.xxl}>
        <Title order={2} id="materias" fz={font.h3} fw={600} mb="md">
          Matérias
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </SimpleGrid>
      </Box>

      <Box component="section" aria-labelledby="comece-por-aqui" mb={space.xxl}>
        <Title order={2} id="comece-por-aqui" fz={font.h3} fw={600} mb="md">
          Comece por aqui
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {featured.map((location) => (
            <AlgorithmCard key={location.entry.slug} location={location} />
          ))}
        </SimpleGrid>
      </Box>

      <Box mt={space.xxl} pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
        <Group justify="space-between" gap="sm">
          <Text fz={font.small} c="dimmed">
            Última fase — busca, complexidade e provas por indução.
          </Text>
          <Anchor component={Link} to="/playground" fz={font.small}>
            playground
          </Anchor>
        </Group>
      </Box>
    </>
  );
}
