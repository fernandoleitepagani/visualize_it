import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, Paper, SimpleGrid, Text, TextInput, Title } from '@mantine/core';
import type { CodeApproach, Lesson, Step } from '@/engine/types';
import { DEFAULT_INPUT } from '@/engine/types';
import { assignElementIds } from '@/engine/elementIds';
import { usePlayback } from '@/engine/usePlayback';
import { parseInput } from '@/lib/parseInput';
import { BarsView } from './BarsView';
import { CellsView } from './CellsView';
import { CodePanel } from './CodePanel';
import type { CodeLang } from './CodePanel';
import { ComplexityAnalysisCard } from './ComplexityAnalysisCard';
import { ComplexityTable } from './ComplexityTable';
import { NodesView } from './NodesView';
import { Panel } from './Panel';
import { PlayerControls } from './PlayerControls';
import { VarsPanel } from './VarsPanel';

/** Picks the renderer for the lesson's view. */
function Canvas({ lesson, step, ids }: { lesson: Lesson; step: Step | undefined; ids: string[] }) {
  if (lesson.view === 'cells') return <CellsView cells={step?.cells} />;
  if (lesson.view === 'nodes') return <NodesView nodes={step?.nodes} linked={lesson.linked} />;
  return <BarsView state={step} ids={ids} />;
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const initialInput = useMemo(() => lesson.initial ?? DEFAULT_INPUT, [lesson]);
  const [input, setInput] = useState<number[]>(initialInput);
  const [inputValue, setInputValue] = useState(() => initialInput.join(', '));
  const [error, setError] = useState('');
  const [lang, setLang] = useState<CodeLang>('java');
  const [approach, setApproach] = useState<CodeApproach>('iterativo');

  const hasApproaches = Boolean(
    lesson.codeVariants?.iterativo && lesson.codeVariants?.recursivo,
  );
  const listing = lesson.codeVariants?.[approach] ?? lesson.code;

  const steps = useMemo(() => lesson.steps(input, approach), [lesson, input, approach]);
  const playback = usePlayback(steps);
  const step = playback.step ?? steps[0];
  const { next, prev, toggle, reset, pause } = playback;

  // Element identities let the bars view animate swaps (only the bars view uses them).
  const ids = useMemo(
    () => ((lesson.view ?? 'bars') === 'bars' ? assignElementIds(steps) : []),
    [lesson.view, steps],
  );

  const apply = useCallback(() => {
    const parsed = parseInput(inputValue);
    if (!parsed) {
      setError('Use entre 1 e 12 números separados por vírgula.');
      return;
    }
    setError('');
    setInput(parsed);
  }, [inputValue]);

  const randomize = useCallback(() => {
    const n = 4 + Math.floor(Math.random() * 4);
    const values = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 60));
    setError('');
    setInputValue(values.join(', '));
    setInput(values);
  }, []);

  // Keyboard shortcuts: ← → move, space plays, Home restarts.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && target.tagName === 'INPUT') return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        pause();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        pause();
        prev();
      } else if (event.key === ' ') {
        event.preventDefault();
        toggle();
      } else if (event.key === 'Home') {
        event.preventDefault();
        reset();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev, toggle, reset, pause]);

  return (
    <>
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Panel
          label={lesson.panelLabel ?? 'vetor'}
          aside={
            <Text fz={12.5} ff="monospace" c="dimmed">
              {playback.index + 1} / {playback.total}
            </Text>
          }
        >
          <Box px="md" pt="lg" pb="md">
            <Canvas lesson={lesson} step={step} ids={ids[playback.index] ?? []} />
            <Box
              mt="md"
              pt="md"
              style={{ minHeight: 52, borderTop: '1px solid var(--mantine-color-dark-4)' }}
            >
              <Text
                fz={11}
                fw={600}
                tt="uppercase"
                c="dimmed"
                mb={4}
                style={{ letterSpacing: '0.1em' }}
              >
                passo atual
              </Text>
              <Text fz="sm">{step?.desc}</Text>
            </Box>
            <VarsPanel vars={step?.vars} />
          </Box>
        </Panel>

        <CodePanel
          code={listing[lang]}
          activeLine={step?.line ?? 0}
          lang={lang}
          onLangChange={setLang}
          approach={hasApproaches ? approach : undefined}
          onApproachChange={hasApproaches ? setApproach : undefined}
        />
      </SimpleGrid>

      <PlayerControls playback={playback} />

      <Paper withBorder radius="md" px="md" py="sm" mt="sm">
        <Flex align="flex-end" gap="sm" wrap="wrap">
          <TextInput
            label="valores"
            value={inputValue}
            onChange={(event) => setInputValue(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') apply();
            }}
            w={260}
            size="sm"
          />
          <Button variant="default" size="sm" onClick={apply}>
            Aplicar
          </Button>
          <Button variant="default" size="sm" onClick={randomize}>
            Sortear
          </Button>
        </Flex>
      </Paper>
      {error ? (
        <Text c="red" fz={12.5} mt={6}>
          {error}
        </Text>
      ) : null}

      {lesson.complexityAnalysis ? (
        <Box mt="xl">
          <ComplexityAnalysisCard analysis={lesson.complexityAnalysis} />
        </Box>
      ) : null}

      <Box mt="xl">
        <Title order={2} fz="md" fw={600} mb="xs">
          Sobre
        </Title>
        <Text c="dimmed" mb="md">
          {lesson.description}
        </Text>
        <Title order={2} fz="md" fw={600} mt="lg" mb="xs">
          Complexidade
        </Title>
        <ComplexityTable complexity={lesson.complexity} />
      </Box>
    </>
  );
}
