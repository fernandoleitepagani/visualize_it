import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Anchor,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
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
import { font, mono, radius, space, subjectAccent, vizVar } from '@/theme';
import { ArrowRightIcon, KeyboardIcon, SigmaIcon } from '@/components/icons';

const featuredSlugs = ['selecao', 'busca-binaria', 'pilha-sequencial'];

const learning = [
  {
    title: 'Fundamentos',
    blurb: 'A base de C e de orientação a objetos, sem atalhos.',
    items: ['Laços e repetição', 'Ponteiros e memória', 'Structs, vetores e matrizes', 'Classes e polimorfismo'],
  },
  {
    title: 'Algoritmos e estruturas',
    blurb: 'O que roda por baixo de qualquer aplicação.',
    items: ['Ordenação por comparação', 'Busca sequencial e binária', 'Listas, pilhas e filas'],
  },
  {
    title: 'Rigor',
    blurb: 'Por que o algoritmo funciona e quanto ele custa.',
    items: ['Notações Θ, O e Ω', 'Contagem de operações', 'Provas por indução'],
  },
];

const starterCode = [
  'for (int i = 0; i < n - 1; i++) {',
  '  int min = i;',
  '  for (int j = i + 1; j < n; j++)',
  '    if (a[j] < a[min]) min = j;',
  '  swap(a, i, min);',
  '}',
];

function ToolCard({
  to,
  icon,
  title,
  description,
  cta,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Paper
      withBorder
      radius="xl"
      p="lg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: space.md,
        height: '100%',
        borderColor: vizVar.line,
        background: vizVar.panel,
      }}
    >
      <Group gap="md" align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
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
          {icon}
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Title order={2} fz={font.lead} fw={600} mb={4}>
            {title}
          </Title>
          <Text fz={font.small} c="dimmed" maw="54ch" lh={1.55}>
            {description}
          </Text>
        </Box>
      </Group>

      <Group justify="flex-end" mt="auto">
        <Button
          component={Link}
          to={to}
          variant="default"
          size="xs"
          radius="pill"
          rightSection={<ArrowRightIcon size={13} />}
          style={{
            color: vizVar.accent,
            background: vizVar.accentSoft,
            borderColor: vizVar.accentLine,
            fontFamily: 'var(--mantine-font-family-monospace)',
            fontSize: font.tiny,
            letterSpacing: '0.02em',
          }}
        >
          {cta}
        </Button>
      </Group>
    </Paper>
  );
}

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

          <Group gap="sm" mt="lg" wrap="wrap">
            <Button component="a" href="#materias" radius="pill" size="sm">
              Ver matérias
            </Button>
            <Button
              component={Link}
              to="/vim"
              variant="default"
              radius="pill"
              size="sm"
              leftSection={<KeyboardIcon size={14} />}
            >
              Treinar Vim
            </Button>
          </Group>

          <Box maw={620} mt="md">
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

      <Box component="section" aria-labelledby="aprendizado" mb={space.xxl}>
        <SectionHeading id="aprendizado" index="02" kicker="aprendizado">
          O que você vai aprender
        </SectionHeading>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {learning.map((area, index) => {
            const subject = subjects[index];
            const accent = subjectAccent[subject.accent];
            return (
              <Paper
                key={area.title}
                withBorder
                radius="xl"
                p="lg"
                style={
                  {
                    borderColor: vizVar.line,
                    background: vizVar.panel,
                    '--subject-accent': accent,
                  } as CSSProperties
                }
              >
                <Group gap={8} mb={6}>
                  <Box
                    aria-hidden
                    w={6}
                    h={6}
                    style={{ borderRadius: 999, background: accent }}
                  />
                  <Text
                    fz={font.micro}
                    tt="uppercase"
                    fw={600}
                    style={{ color: accent, letterSpacing: '0.12em' }}
                  >
                    {subject.title}
                  </Text>
                </Group>
                <Title order={2} fz={font.h3} fw={600} mb={4}>
                  {area.title}
                </Title>
                <Text fz={font.small} c="dimmed" lh={1.5} mb="sm">
                  {area.blurb}
                </Text>
                <Box component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
                  {area.items.map((item) => (
                    <Text
                      key={item}
                      component="li"
                      fz={font.small}
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        padding: '3px 0',
                        color: vizVar.ink2,
                      }}
                    >
                      <Box
                        aria-hidden
                        w={4}
                        h={4}
                        style={{ borderRadius: 999, background: vizVar.line3, flexShrink: 0 }}
                      />
                      {item}
                    </Text>
                  ))}
                </Box>
                <Anchor
                  component={Link}
                  to={`/materias/${subject.id}`}
                  underline="never"
                  fz={font.small}
                  fw={600}
                  mt="sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: accent }}
                >
                  Explorar
                  <ArrowRightIcon size={13} />
                </Anchor>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Box>

      <Box component="section" aria-labelledby="comece-por-aqui" mb={space.xxl}>
        <SectionHeading id="comece-por-aqui" index="03" kicker="destaques">
          Comece por aqui
        </SectionHeading>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {featured.map((location) => (
            <AlgorithmCard key={location.entry.slug} location={location} />
          ))}
        </SimpleGrid>
      </Box>

      <Box component="section" aria-labelledby="ponto-de-partida" mb={space.xxl}>
        <SectionHeading id="ponto-de-partida" index="04" kicker="ponto de partida">
          Linha por linha
        </SectionHeading>
        <Paper
          withBorder
          radius="xl"
          p={{ base: 'md', sm: 'lg' }}
          style={{ borderColor: vizVar.line, background: vizVar.panel }}
        >
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
            <Box>
              <Title order={2} fz={font.h2} fw={600} mb={6} style={{ letterSpacing: '-0.03em' }}>
                Veja o algoritmo, não só o resultado.
              </Title>
              <Text fz={font.body} c="dimmed" lh={1.6} maw="52ch" mb="md">
                Cada passo destaca a linha executada, as variáveis que mudaram e o estado da
                estrutura. O mesmo player serve para ordenação, busca, listas, pilhas, filas e
                análise de complexidade.
              </Text>
              <Group gap="sm" wrap="wrap">
                <Button component={Link} to="/algoritmos/selecao" radius="pill" size="sm">
                  Abrir Selection Sort
                </Button>
                <Button
                  component={Link}
                  to="/comparar"
                  variant="default"
                  radius="pill"
                  size="sm"
                >
                  Comparar algoritmos
                </Button>
              </Group>
            </Box>

            <Box
              style={{
                border: `1px solid ${vizVar.line}`,
                borderRadius: radius.lg,
                background: vizVar.codeBg,
                padding: '14px 16px',
                overflowX: 'auto',
                fontFamily: mono,
                fontSize: 12.5,
                lineHeight: 1.7,
              }}
            >
              {starterCode.map((line, index) => (
                <Box
                  key={line}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '0 6px',
                    borderRadius: 4,
                    background:
                      index === 3
                        ? 'color-mix(in srgb, var(--viz-accent) 10%, transparent)'
                        : undefined,
                  }}
                >
                  <Text
                    component="span"
                    fz={font.micro}
                    style={{ color: vizVar.dim, width: 14, textAlign: 'right', flexShrink: 0 }}
                  >
                    {index + 1}
                  </Text>
                  <Text
                    component="span"
                    style={{
                      color: index === 3 ? vizVar.accent : vizVar.codeInk,
                      whiteSpace: 'pre',
                    }}
                  >
                    {line}
                  </Text>
                </Box>
              ))}
              <Text fz={font.micro} c="dimmed" mt={8}>
                linha 4 · comparação
              </Text>
            </Box>
          </SimpleGrid>
        </Paper>
      </Box>

      <Box component="section" aria-labelledby="ferramentas" mb={space.xxl}>
        <SectionHeading id="ferramentas" index="05" kicker="ferramentas">
          Ferramentas
        </SectionHeading>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <ToolCard
            to="/vim"
            icon={<KeyboardIcon size={20} />}
            title="Vim — pratique no buffer"
            description="Doze desafios curtos, cursor de bloco e um cheatsheet essencial para aprender os movimentos e operadores que realmente importam."
            cta="abrir treinador"
          />
          <ToolCard
            to="/playground"
            icon={<SigmaIcon size={20} />}
            title="Playground — escreva o seu próprio algoritmo"
            description="Um sandbox isolado que transforma generateSteps(arr) em uma visualização animada. Ideal para testar variações e comparar com as lições."
            cta="abrir playground"
          />
        </SimpleGrid>
      </Box>

      <Paper
        withBorder
        radius="xl"
        p={{ base: 'md', sm: 'xl' }}
        style={{
          borderColor: vizVar.accentLine,
          background:
            'linear-gradient(120deg, color-mix(in srgb, var(--viz-accent) 8%, var(--viz-panel)), var(--viz-panel) 62%)',
        }}
      >
        <Group justify="space-between" align="center" gap="lg" wrap="wrap">
          <Box>
            <Text
              fz={font.micro}
              tt="uppercase"
              style={{ color: vizVar.accent, letterSpacing: '0.14em' }}
            >
              comece agora
            </Text>
            <Title order={2} fz={font.h2} fw={600} mt={4} mb={4} style={{ letterSpacing: '-0.03em' }}>
              Pronto para ver os algoritmos acontecerem?
            </Title>
            <Text fz={font.small} c="dimmed" maw="58ch">
              Comece por ordenação e busca, ou abra uma lição de estrutura de dados.
            </Text>
          </Box>
          <Stack gap="xs">
            <Button component={Link} to="/materias/aeds-ii" radius="pill" size="sm">
              Explorar AEDS II
            </Button>
            <Button
              component={Link}
              to="/materias/aeds-i"
              variant="default"
              radius="pill"
              size="sm"
            >
              Começar por AEDS I
            </Button>
          </Stack>
        </Group>
      </Paper>
    </>
  );
}
