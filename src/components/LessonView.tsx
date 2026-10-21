import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, Group, Paper, Tabs, Text, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import type { CodeApproach, Lesson, Step } from '@/engine/types';
import { DEFAULT_INPUT } from '@/engine/types';
import { assignElementIds } from '@/engine/elementIds';
import { usePlayback } from '@/engine/usePlayback';
import { parseInput } from '@/lib/parseInput';
import { readStoredInput, storeInput } from '@/lib/persistedInput';
import { palette, font, radius, vizVar } from '@/theme';
import { BarsView } from './BarsView';
import { CellsView } from './CellsView';
import { CodePanel } from './CodePanel';
import type { CodeLang } from './CodePanel';
import { ComplexityAnalysisCard } from './ComplexityAnalysisCard';
import { ComplexityTable } from './ComplexityTable';
import { NodesView } from './NodesView';
import { Panel } from './Panel';
import { PlayerControls } from './PlayerControls';
import { PlotView } from './PlotView';
import { QuizPanel } from './QuizPanel';
import { VarsPanel } from './VarsPanel';
import { BarsIcon, CheckIcon, GaugeIcon, InfoIcon, ShuffleIcon } from './icons';

/** Picks the renderer for the lesson's view. */
function Canvas({ lesson, step, ids }: { lesson: Lesson; step: Step | undefined; ids: string[] }) {
  if (lesson.view === 'cells') return <CellsView cells={step?.cells} />;
  if (lesson.view === 'nodes') return <NodesView nodes={step?.nodes} linked={lesson.linked} />;
  if (lesson.view === 'plot') return <PlotView plot={step?.plot} />;
  return <BarsView state={step} ids={ids} />;
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read the URL once: it wins over stored/local state on first load.
  const [initial] = useState(() => {
    const fromUrl = parseInput(searchParams.get('arr') ?? '');
    const step = Number(searchParams.get('step'));
    return {
      input: fromUrl ?? readStoredInput(lesson.id) ?? lesson.initial ?? DEFAULT_INPUT,
      index: Number.isFinite(step) && step >= 1 ? Math.floor(step) - 1 : 0,
    };
  });

  const [input, setInput] = useState<number[]>(initial.input);
  const [inputValue, setInputValue] = useState(() => initial.input.join(', '));
  const [error, setError] = useState('');
  const [lang, setLang] = useState<CodeLang>('java');
  const [approach, setApproach] = useState<CodeApproach>('iterativo');
  const [quiz, setQuiz] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const isDesktop = useMediaQuery('(min-width: 62em)');

  const hasApproaches = Boolean(
    lesson.codeVariants?.iterativo && lesson.codeVariants?.recursivo,
  );
  const listing = lesson.codeVariants?.[approach] ?? lesson.code;

  const initialInput = useMemo(() => lesson.initial ?? DEFAULT_INPUT, [lesson]);
  const inputFormat = lesson.inputFormat ?? 'integers';
  // Single-number lessons (for/while/do-while) do not benefit from ordering presets.
  const singleValue = initialInput.length === 1;
  // The ordering presets are integer-only; unit-interval lessons rely on "Sortear".
  const canPreset = !singleValue && inputFormat === 'integers';

  const steps = useMemo(() => lesson.steps(input, approach), [lesson, input, approach]);
  const quizSupported = (lesson.view ?? 'bars') === 'bars';
  const playback = usePlayback(steps, { initialIndex: initial.index });
  const step = playback.step ?? steps[0];
  const prevStep = playback.index > 0 ? steps[playback.index - 1] : undefined;
  const { next, prev, toggle, reset, pause, goTo, total } = playback;

  // Element identities let the bars view animate swaps (only the bars view uses them).
  const ids = useMemo(
    () => ((lesson.view ?? 'bars') === 'bars' ? assignElementIds(steps) : []),
    [lesson.view, steps],
  );

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('arr', input.join(','));
        next.set('step', String(playback.index + 1));
        return next;
      },
      { replace: true },
    );
  }, [input, playback.index, setSearchParams]);

  const setValues = useCallback(
    (values: number[]) => {
      setError('');
      setInput(values);
      setInputValue(values.join(', '));
      setScore({ correct: 0, total: 0 });
      storeInput(lesson.id, values);
    },
    [lesson.id],
  );

  const apply = useCallback(() => {
    const parsed = parseInput(inputValue);
    if (!parsed) {
      setError('Use entre 1 e 12 números separados por vírgula.');
      return;
    }
    if (inputFormat === 'integers' && parsed.some((value) => !Number.isInteger(value))) {
      setError('Use entre 1 e 12 números inteiros separados por vírgula.');
      return;
    }
    if (inputFormat === 'unit-interval' && parsed.some((value) => value < 0 || value >= 1)) {
      setError('Use valores entre 0 (inclusive) e 1 (exclusive), como 0.25 ou 0.70.');
      return;
    }
    if (singleValue && parsed.length !== 1) {
      setError(
        inputFormat === 'integers' ? 'Use um único inteiro para n.' : 'Use um único valor para n.',
      );
      return;
    }
    setValues(parsed);
  }, [inputFormat, inputValue, setValues, singleValue]);

  const randomize = useCallback(() => {
    const values =
      lesson.randomInput?.() ??
      (singleValue
        ? [3 + Math.floor(Math.random() * 8)]
        : Array.from(
            { length: 4 + Math.floor(Math.random() * 4) },
            () => 1 + Math.floor(Math.random() * 60),
          ));
    setValues(values);
  }, [lesson, setValues, singleValue]);

  const applyPreset = useCallback(
    (kind: 'ordered' | 'reversed' | 'repeated') => {
      const base = input.length > 0 ? input : initialInput;
      if (kind === 'ordered') {
        setValues([...base].sort((a, b) => a - b));
      } else if (kind === 'reversed') {
        setValues([...base].sort((a, b) => b - a));
      } else {
        const pattern = [3, 3, 7, 7, 1, 1, 9, 9];
        const length = Math.min(Math.max(base.length, 3), 12);
        setValues(Array.from({ length }, (_, index) => pattern[index % pattern.length]));
      }
    },
    [initialInput, input, setValues],
  );

  const changeApproach = useCallback((nextApproach: CodeApproach) => {
    setApproach(nextApproach);
    setScore({ correct: 0, total: 0 });
  }, []);

  // Keyboard shortcuts: ← → move, space plays, Home restarts, End goes to the last step.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, button, a, [role="slider"], [contenteditable="true"]',
        )
      ) {
        return;
      }
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
      } else if (event.key === 'End') {
        event.preventDefault();
        goTo(total - 1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev, toggle, reset, pause, goTo, total]);

  const vizPanel = (
    <Panel
      label={lesson.panelLabel ?? 'visualização'}
      icon={<BarsIcon size={14} />}
      aside={
        <Badge
          variant="light"
          color="gray"
          radius="sm"
          ff="monospace"
          fz={font.tiny}
          style={{ color: vizVar.ink, textTransform: 'none' }}
        >
          passo {playback.index + 1} / {playback.total}
        </Badge>
      }
    >
      <Box
        className="viz-stage"
        px="md"
        pt="md"
        pb="sm"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${palette.accentGlow}, transparent 62%)`,
        }}
      >
        <Box className="viz-canvas">
          <Canvas lesson={lesson} step={step} ids={ids[playback.index] ?? []} />
        </Box>

        <Box
          mt="md"
          p="sm"
          style={{
            background: vizVar.surface2,
            border: `1px solid ${vizVar.line}`,
            borderLeft: `3px solid ${vizVar.accent}`,
            borderRadius: radius.sm,
            minHeight: 52,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Text
            key={playback.index}
            className="viz-step-desc"
            aria-live="polite"
            fz={font.lead}
            fw={500}
            lh={1.5}
            style={{ color: vizVar.ink }}
          >
            {step?.desc}
          </Text>
        </Box>

        <VarsPanel vars={step?.vars} prevVars={prevStep?.vars} />
      </Box>
    </Panel>
  );

  const codePanel = (
    <CodePanel
      code={listing[lang]}
      activeLine={step?.line ?? 0}
      lang={lang}
      onLangChange={setLang}
      approach={hasApproaches ? approach : undefined}
      onApproachChange={hasApproaches ? changeApproach : undefined}
    />
  );

  const aboutPanel = (
    <Box className="lesson-about-grid">
      <Panel label="sobre" icon={<InfoIcon size={14} />}>
        <Box p="md">
          <Text c="dimmed" lh={1.65}>
            {lesson.description ?? 'Sem descrição disponível.'}
          </Text>
        </Box>
      </Panel>
      <Panel label="complexidade" icon={<GaugeIcon size={14} />}>
        <Box p="md" style={{ overflowX: 'auto' }}>
          <ComplexityTable complexity={lesson.complexity} />
        </Box>
      </Panel>
    </Box>
  );

  const quizPanel =
    quizSupported && quiz ? (
      <QuizPanel
        steps={steps}
        index={playback.index}
        score={score}
        onAnswer={(correct) =>
          setScore((current) => ({
            correct: current.correct + (correct ? 1 : 0),
            total: current.total + 1,
          }))
        }
      />
    ) : null;

  const analysisPanel = lesson.complexityAnalysis ? (
    <Box mt="xl">
      <ComplexityAnalysisCard analysis={lesson.complexityAnalysis} />
    </Box>
  ) : null;

  return (
    <>
      <Paper
        withBorder
        radius="md"
        px="md"
        py="xs"
        mt="sm"
        style={{ background: 'var(--mantine-color-body)' }}
      >
        <Box
          component="form"
          className="lesson-toolbar-row"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
        >
          <TextInput
            aria-label={singleValue ? 'valor de n' : 'valores'}
            placeholder={singleValue ? 'ex: 5' : 'ex: 45, 12, 85, 32'}
            leftSection={
              <Text fz={font.micro} fw={700} ff="monospace" c="dimmed">
                {singleValue ? 'n =' : 'vetor'}
              </Text>
            }
            leftSectionWidth={singleValue ? 38 : 52}
            value={inputValue}
            onChange={(event) => setInputValue(event.currentTarget.value)}
            error={error || undefined}
            size="sm"
            style={{ flex: '1 1 200px', maxWidth: 300 }}
          />
          <Button type="submit" variant="light" size="sm" leftSection={<CheckIcon size={14} />}>
            Aplicar
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={randomize}
            leftSection={<ShuffleIcon size={14} />}
          >
            Sortear
          </Button>
          {canPreset ? (
            <Group className="lesson-presets" gap={6} wrap="wrap">
              <Text
                visibleFrom="sm"
                fz={font.micro}
                fw={600}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: '0.08em' }}
              >
                presets:
              </Text>
              <Button
                type="button"
                variant="default"
                size="xs"
                radius="pill"
                onClick={() => applyPreset('ordered')}
              >
                Ordenado
              </Button>
              <Button
                type="button"
                variant="default"
                size="xs"
                radius="pill"
                onClick={() => applyPreset('reversed')}
              >
                Invertido
              </Button>
              <Button
                type="button"
                variant="default"
                size="xs"
                radius="pill"
                onClick={() => applyPreset('repeated')}
              >
                Repetido
              </Button>
            </Group>
          ) : null}
        </Box>
      </Paper>

      {isDesktop ? (
        <>
          <Box className="lesson-grid">
            {vizPanel}
            {codePanel}
          </Box>
          <Box mt="lg">
            <PlayerControls
              playback={playback}
              quiz={quizSupported ? quiz : undefined}
              onQuizChange={quizSupported ? setQuiz : undefined}
            />
          </Box>
          {quizPanel}
          {analysisPanel}
          <Box mt="xl">{aboutPanel}</Box>
        </>
      ) : (
        <>
          {analysisPanel}
          <Tabs defaultValue="viz" variant="default" mt="md">
            <Tabs.List grow>
              <Tabs.Tab value="viz">Visualização</Tabs.Tab>
              <Tabs.Tab value="code">Código</Tabs.Tab>
              <Tabs.Tab value="about">Sobre</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="viz" pt="md">
              {vizPanel}
            </Tabs.Panel>
            <Tabs.Panel value="code" pt="md">
              {codePanel}
            </Tabs.Panel>
            <Tabs.Panel value="about" pt="md">
              {aboutPanel}
            </Tabs.Panel>
          </Tabs>
          <Box mt="md">
            <PlayerControls
              playback={playback}
              quiz={quizSupported ? quiz : undefined}
              onQuizChange={quizSupported ? setQuiz : undefined}
            />
          </Box>
          {quizPanel}
        </>
      )}
    </>
  );
}
