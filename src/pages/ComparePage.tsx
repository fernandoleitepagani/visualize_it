import type { CSSProperties } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Group, Paper, SimpleGrid, Table, Text, TextInput } from '@mantine/core';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { SectionHeading } from '@/components/SectionHeading';
import { MetaPill } from '@/components/MetaPill';
import { GaugeIcon, ShuffleIcon } from '@/components/icons';
import { getSubject, getSubjectEntries } from '@/content/subjects';
import { getLesson } from '@/content/lessons';
import { countRunMetrics } from '@/engine/runMetrics';
import { parseInput } from '@/lib/parseInput';
import { font, radius, subjectAccent, vizVar } from '@/theme';

const DEFAULT_INPUT = [7, 3, 9, 1, 5, 8, 2];
const accent = subjectAccent.teal;

interface Row {
  slug: string;
  title: string;
  tag: string;
  steps: number;
  comparisons: number;
  swaps: number;
  worst?: string;
}

export function ComparePage() {
  const subject = getSubject('aeds-ii');
  const entries = useMemo(
    () =>
      subject
        ? getSubjectEntries(subject).filter(
            (location) =>
              location.group.id === 'ordenacao' &&
              location.entry.kind === 'lesson' &&
              getLesson(location.entry.slug)?.inputFormat !== 'unit-interval',
          )
        : [],
    [subject],
  );

  const [inputValue, setInputValue] = useState(DEFAULT_INPUT.join(', '));
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>(() =>
    entries.map((location) => location.entry.slug),
  );

  const apply = useCallback(() => {
    const parsed = parseInput(inputValue);
    if (!parsed || parsed.some((value) => !Number.isInteger(value)) || parsed.length === 0) {
      setError('Use entre 1 e 12 números inteiros separados por vírgula.');
      return;
    }
    setError('');
    setInput(parsed);
  }, [inputValue]);

  const randomize = useCallback(() => {
    const next = Array.from({ length: 6 }, () => 1 + Math.floor(Math.random() * 60));
    setInputValue(next.join(', '));
    setInput(next);
    setError('');
  }, []);

  const preset = (kind: 'ordered' | 'reversed' | 'nearly') => {
    const base = [...input];
    if (kind === 'ordered') base.sort((a, b) => a - b);
    else if (kind === 'reversed') base.sort((a, b) => b - a);
    else if (base.length > 2) {
      base.sort((a, b) => a - b);
      [base[1], base[2]] = [base[2], base[1]];
    }
    setInputValue(base.join(', '));
    setInput(base);
    setError('');
  };

  const rows = useMemo<Row[]>(
    () =>
      selected
        .flatMap((slug) => {
          const location = entries.find((item) => item.entry.slug === slug);
          const lesson = getLesson(slug);
          if (!location || !lesson) return [];
          const metrics = countRunMetrics(lesson.steps([...input]));
          return [{
            slug,
            title: lesson.title,
            tag: location.entry.tag,
            steps: metrics.steps,
            comparisons: metrics.comparisons,
            swaps: metrics.swaps,
            worst: lesson.complexity.time?.worst,
          }];
        })
        .sort((a, b) => a.steps - b.steps || a.comparisons - b.comparisons),
    [entries, input, selected],
  );

  const maxSteps = Math.max(...rows.map((row) => row.steps), 1);

  const toggle = (slug: string) => {
    setSelected((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  };

  return (
    <Box
      style={
        {
          '--subject-accent': accent,
          '--subject-accent-ink': 'var(--viz-subject-ink)',
        } as CSSProperties
      }
    >
      <PageHeader
        breadcrumb={[
          { label: 'Início', to: '/' },
          { label: 'AEDS II', to: '/materias/aeds-ii' },
          { label: 'Comparar algoritmos' },
        ]}
        kicker="AEDS II · análise"
        title="Comparar algoritmos"
        subtitle="Mesma entrada, algoritmos diferentes: compare passos e eventos de comparação/troca."
        accent={accent}
        meta={
          <>
            <MetaPill>contagem determinística</MetaPill>
            <MetaPill>sem tempo de animação</MetaPill>
            <MetaPill tone="subject">{entries.length} algoritmos elegíveis</MetaPill>
          </>
        }
      />

      <Paper
        withBorder
        radius="xl"
        p="md"
        style={{ borderColor: vizVar.line, background: vizVar.panel }}
      >
        <Group align="flex-end" gap="sm" wrap="wrap">
          <TextInput
            label="vetor"
            value={inputValue}
            onChange={(event) => setInputValue(event.currentTarget.value)}
            error={error || undefined}
            style={{ flex: '1 1 240px', maxWidth: 360 }}
            size="sm"
          />
          <Button onClick={apply} variant="default" size="sm">
            Aplicar
          </Button>
          <Button
            onClick={randomize}
            variant="subtle"
            size="sm"
            leftSection={<ShuffleIcon size={14} />}
          >
            Sortear
          </Button>
          <Group gap={6} wrap="wrap" style={{ marginLeft: 'auto' }}>
            <Button size="compact-sm" radius="pill" variant="default" onClick={() => preset('ordered')}>
              Ordenado
            </Button>
            <Button size="compact-sm" radius="pill" variant="default" onClick={() => preset('reversed')}>
              Invertido
            </Button>
            <Button size="compact-sm" radius="pill" variant="default" onClick={() => preset('nearly')}>
              Quase ordenado
            </Button>
          </Group>
        </Group>

        <Group gap={6} mt="md" wrap="wrap">
          <Text fz={font.micro} c="dimmed" ff="monospace" tt="uppercase" style={{ letterSpacing: '0.1em' }}>
            algoritmos
          </Text>
          {entries.map((location) => {
            const active = selected.includes(location.entry.slug);
            return (
              <Button
                key={location.entry.slug}
                size="compact-sm"
                radius="pill"
                variant="default"
                aria-pressed={active}
                onClick={() => toggle(location.entry.slug)}
                style={
                  active
                    ? {
                        borderColor: accent,
                        color: accent,
                        background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                      }
                    : undefined
                }
              >
                {getLesson(location.entry.slug)?.title ?? location.entry.slug}
              </Button>
            );
          })}
        </Group>
        <Text fz={font.tiny} c="dimmed" mt="xs">
          Bucket Sort fica de fora porque usa valores no intervalo [0, 1).
        </Text>
      </Paper>

      <Box mt="xl">
        <SectionHeading index="01" kicker="mesma entrada" count={`${rows.length} algoritmos`}>
          Resultados
        </SectionHeading>
        {rows.length === 0 ? (
          <Paper withBorder radius="xl" p="xl" style={{ borderColor: vizVar.line, background: vizVar.panel }}>
            <Text c="dimmed">Selecione ao menos um algoritmo para comparar.</Text>
          </Paper>
        ) : (
          <Panel label="comparação" icon={<GaugeIcon size={13} />}>
            <Box p="md" style={{ overflowX: 'auto' }}>
              <Table verticalSpacing="xs" fz={font.small} style={{ minWidth: 620 }}>
                <Table.Thead>
                  <Table.Tr>
                    {['algoritmo', 'passos', 'comparações', 'trocas', 'pior caso', 'escala'].map((heading) => (
                      <Table.Th
                        key={heading}
                        fz={font.micro}
                        tt="uppercase"
                        c="dimmed"
                        ff="monospace"
                        style={{ letterSpacing: '0.08em', borderColor: vizVar.line }}
                      >
                        {heading}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((row) => (
                    <Table.Tr key={row.slug}>
                      <Table.Td style={{ borderColor: vizVar.line }}>
                        <Text fz={font.small} fw={600}>
                          {row.title}
                        </Text>
                        <Text fz={font.micro} c="dimmed" ff="monospace">
                          {row.tag}
                        </Text>
                      </Table.Td>
                      <Table.Td ff="monospace" style={{ borderColor: vizVar.line }}>
                        {row.steps}
                      </Table.Td>
                      <Table.Td ff="monospace" style={{ borderColor: vizVar.line }}>
                        {row.comparisons}
                      </Table.Td>
                      <Table.Td ff="monospace" style={{ borderColor: vizVar.line }}>
                        {row.swaps}
                      </Table.Td>
                      <Table.Td ff="monospace" c="dimmed" style={{ borderColor: vizVar.line }}>
                        {row.worst ?? '—'}
                      </Table.Td>
                      <Table.Td style={{ borderColor: vizVar.line, minWidth: 120 }}>
                        <Box
                          aria-hidden
                          h={6}
                          style={{
                            width: `${Math.max((row.steps / maxSteps) * 100, 4)}%`,
                            minWidth: 4,
                            borderRadius: radius.pill,
                            background: accent,
                          }}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Panel>
        )}
      </Box>

      <Text fz={font.tiny} c="dimmed" mt="sm" maw="74ch">
        Contagem de eventos registrados pela simulação. Alguns algoritmos agrupam operações em um
        passo; por isso os números servem para comparar comportamento, não como benchmark de CPU.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="lg">
        <Button component={Link} to="/materias/aeds-ii" variant="default" radius="md">
          Voltar para AEDS II
        </Button>
        <Button component={Link} to="/algoritmos/selecao" radius="md">
          Abrir uma lição
        </Button>
      </SimpleGrid>
    </Box>
  );
}
