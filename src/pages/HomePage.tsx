import { Link } from 'react-router-dom';
import { Anchor, Box, Group, Paper, SimpleGrid, Text, Title } from '@mantine/core';
import { AlgorithmCard } from '@/components/AlgorithmCard';
import { GlobalSearch } from '@/components/GlobalSearch';
import { HeroFigure } from '@/components/HeroFigure';
import { MetaPill } from '@/components/MetaPill';
import { SectionHeading } from '@/components/SectionHeading';
import { SubjectCard } from '@/components/SubjectCard';
import type { EntryLocation } from '@/content/subjects';
import {
  allEntryLocations,
  getEntryLocation,
  getEntryView,
  subjects,
} from '@/content/subjects';
import { font, radius, space, vizVar } from '@/theme';
import { ArrowRightIcon, KeyboardIcon, SigmaIcon } from '@/components/icons';

const featuredSlugs = ['selecao', 'busca-binaria', 'pilha-sequencial'];

export function HomePage() {
  const all = allEntryLocations();
  const lessons = all.filter((location) => location.entry.kind === 'lesson').length;
  const views = new Set(
    all
      .map((location) => getEntryView(location.entry))
      .filter((view): view is NonNullable<typeof view> => Boolean(view)),
  ).size;

  const featured = featuredSlugs
    .map((slug) => getEntryLocation(slug))
    .filter((location): location is EntryLocation => Boolean(location));

  return (
    <>
      <Box component="section" className="hero" aria-labelledby="hero-title">
        <Box>
          <Text className="hero-kicker">visualizador interativo · AEDS I/II</Text>
          <Title order={1} id="hero-title" className="hero-title" fw={500}>
            Escolha uma <em>matéria</em> para começar.
          </Title>
          <Text className="hero-lead">
            Percorra cada algoritmo linha por linha, com a estrutura animada, código em Java ou C e
            a análise assintótica lado a lado.
          </Text>
          <Group className="hero-stats" gap={8}>
            <MetaPill>{lessons} lições</MetaPill>
            <MetaPill>{views} views</MetaPill>
            <MetaPill>Java &amp; C</MetaPill>
            <MetaPill tone="accent">passo a passo</MetaPill>
          </Group>
          <Box maw={620} mt="lg">
            <GlobalSearch
              trigger="input"
              fullWidth
              placeholder="Buscar por algoritmo, matéria ou tag..."
            />
          </Box>
        </Box>
        <HeroFigure />
      </Box>

      <Box component="section" aria-labelledby="materias" mb={space.xxl}>
        <SectionHeading id="materias" index="01" kicker="trilha">
          Matérias
        </SectionHeading>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {subjects.map((subject, index) => (
            <SubjectCard key={subject.id} subject={subject} index={index + 1} />
          ))}
        </SimpleGrid>
      </Box>

      <Box component="section" aria-labelledby="comece-por-aqui" mb={space.xxl}>
        <SectionHeading id="comece-por-aqui" index="02" kicker="destaques">
          Comece por aqui
        </SectionHeading>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {featured.map((location) => (
            <AlgorithmCard key={location.entry.slug} location={location} />
          ))}
        </SimpleGrid>
      </Box>

      <Box component="section" aria-labelledby="ferramentas" mb={space.xxl}>
        <SectionHeading id="ferramentas" index="03" kicker="ferramentas">
          Ferramentas
        </SectionHeading>
        <Paper
          component={Link}
          to="/vim"
          withBorder
          radius="xl"
          p="lg"
          style={{
            display: 'block',
            borderColor: vizVar.line,
            background: vizVar.panel,
          }}
        >
          <Group justify="space-between" align="center" gap="lg" wrap="wrap">
            <Group gap="md" align="flex-start" wrap="nowrap">
              <Box
                aria-hidden
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  background: vizVar.accentSoft,
                  border: `1px solid ${vizVar.accentLine}`,
                  color: vizVar.accent,
                  flexShrink: 0,
                }}
              >
                <KeyboardIcon size={20} />
              </Box>
              <Box>
                <Title order={2} fz={font.lead} fw={600} mb={4}>
                  Vim — pratique no buffer
                </Title>
                <Text fz={font.small} c="dimmed" maw="58ch">
                  Doze desafios curtos, cursor de bloco e um cheatsheet essencial para aprender os
                  movimentos e operadores que realmente importam.
                </Text>
              </Box>
            </Group>
            <Text
              fz={font.small}
              fw={600}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--viz-accent)',
                whiteSpace: 'nowrap',
              }}
            >
              abrir treinador
              <ArrowRightIcon size={14} />
            </Text>
          </Group>
        </Paper>
      </Box>

      <Paper
        withBorder
        radius="xl"
        p={{ base: 'md', sm: 'lg' }}
        mt={space.xxl}
        style={{
          borderColor: vizVar.line,
          background: vizVar.panel,
        }}
      >
        <Group justify="space-between" align="center" gap="lg" wrap="wrap">
          <Group gap="md" align="flex-start" wrap="nowrap">
            <Box
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: radius.md,
                background: vizVar.accentSoft,
                border: `1px solid ${vizVar.accentLine}`,
                color: vizVar.accent,
                flexShrink: 0,
              }}
            >
              <SigmaIcon size={20} />
            </Box>
            <Box>
              <Title order={2} fz={font.lead} fw={600} mb={4}>
                Playground — escreva o seu próprio algoritmo
              </Title>
              <Text fz={font.small} c="dimmed" maw="58ch">
                Um sandbox isolado que transforma <code>generateSteps(arr)</code> em uma visualização
                animada. Ideal para testar variações e comparar com as lições.
              </Text>
            </Box>
          </Group>
          <Anchor
            component={Link}
            to="/playground"
            underline="never"
            fz={font.small}
            fw={600}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--viz-accent)',
              border: `1px solid ${vizVar.accentLine}`,
              background: vizVar.accentSoft,
              borderRadius: radius.pill,
              padding: '8px 14px',
              whiteSpace: 'nowrap',
            }}
          >
            abrir playground
            <ArrowRightIcon size={14} />
          </Anchor>
        </Group>
      </Paper>
    </>
  );
}
