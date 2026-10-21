import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Group, Paper, Stack, Tabs, Text, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import type { CodeApproach, CodeLang, Lesson, Step } from '@/engine/types';
import { DEFAULT_INPUT } from '@/engine/types';
import { assignElementIds } from '@/engine/elementIds';
import {
  getCodeFileBaseName,
  getLessonCode,
  getLessonLanguages,
} from '@/engine/code';
import { usePlayback } from '@/engine/usePlayback';
import { parseInput } from '@/lib/parseInput';
import { nextSpeed, previousSpeed } from '@/lib/speeds';
import { readStoredInput, storeInput } from '@/lib/persistedInput';
import { getInsight } from '@/content/insights';
import { font, radius, vizVar } from '@/theme';
import { BarsView } from './BarsView';
import { CellsView } from './CellsView';
import { CodePanel } from './CodePanel';
import { ComplexityAnalysisCard } from './ComplexityAnalysisCard';
import { ComplexityTable } from './ComplexityTable';
import { NodesView } from './NodesView';
import { Panel } from './Panel';
import { PlayerControls } from './PlayerControls';
import { ShortcutsModal } from './ShortcutsModal';
import { PlotView } from './PlotView';
import { QuizPanel } from './QuizPanel';
import { VarsPanel } from './VarsPanel';
import { BarsIcon, CheckIcon, GaugeIcon, InfoIcon, LightbulbIcon, ShuffleIcon, SparkIcon } from './icons';

/** Picks the renderer for the lesson's view. */
function Canvas({ lesson, step, ids }: { lesson: Lesson; step: Step | undefined; ids: string[] }) {
  if (lesson.view === 'cells') return <CellsView cells={step?.cells} />;
  if (lesson.view === 'nodes') return <NodesView nodes={step?.nodes} linked={lesson.linked} />;
  if (lesson.view === 'plot') return <PlotView plot={step?.plot} />;
  return <BarsView state={step} ids={ids} />;
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const languages = getLessonLanguages(lesson);
  const hasApproaches = Boolean(
    lesson.codeVariants?.iterativo && lesson.codeVariants?.recursivo,
  );
  const requestedApproach = searchParams.get('approach');
  const initialApproach: CodeApproach =
    requestedApproach === 'recursivo' && lesson.codeVariants?.recursivo
      ? 'recursivo'
      : 'iterativo';
  const requestedLang = searchParams.get('lang') as CodeLang | null;
  const initialLang: CodeLang =
    requestedLang && languages.includes(requestedLang) ? requestedLang : languages[0];

  // Read the URL once: it wins over stored/local state on first load.
  const [initial] = useState(() => {
    const fromUrl = parseInput(searchParams.get('arr') ?? '');
    const step = Number(searchParams.get('step'));
    return {
      input: fromUrl ?? readStoredInput(lesson.id) ?? lesson.initial ?? DEFAULT_INPUT,
      index: Number.isFinite(step) && step >= 1 ? Math.floor(step) - 1 : 0,
      lang: initialLang,
      approach: initialApproach,
    };
  });

  const [input, setInput] = useState<number[]>(initial.input);
  const [inputValue, setInputValue] = useState(() => initial.input.join(', '));
  const [error, setError] = useState('');
  const [lang, setLang] = useState<CodeLang>(initial.lang);
  const [approach, setApproach] = useState<CodeApproach>(initial.approach);
  const [quiz, setQuiz] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const isDesktop = useMediaQuery('(min-width: 62em)');

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
  const { next, prev, toggle, reset, pause, goTo, total, speedMs, setSpeedMs } = playback;

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
        next.set('lang', lang);
        if (hasApproaches) next.set('approach', approach);
        else next.delete('approach');
        return next;
      },
      { replace: true },
    );
  }, [approach, hasApproaches, input, lang, playback.index, setSearchParams]);

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
    if (helpOpen) return;
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
      } else if (event.key === 'Home' || event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        reset();
      } else if (event.key === 'End') {
        event.preventDefault();
        goTo(total - 1);
      } else if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        randomize();
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        setSpeedMs(nextSpeed(speedMs));
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        setSpeedMs(previousSpeed(speedMs));
      } else if (event.key === '?') {
        event.preventDefault();
        setHelpOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev, toggle, reset, pause, goTo, total, randomize, setSpeedMs, speedMs, helpOpen]);

  const vizPanel = (
    <Panel
      label={lesson.panelLabel ?? 'visualização'}
      icon={<BarsIcon size={13} />}
      aside={
        <Group gap={6} wrap="nowrap" align="center" h={22}>
          <Box
            aria-hidden
            w={6}
            h={6}
            style={{
              borderRadius: 999,
              background: 'var(--subject-accent, var(--viz-accent))',
              boxShadow: '0 0 8px var(--subject-accent, var(--viz-accent))',
            }}
          />
          <Text fz={font.micro} style={{ color: vizVar.ink2, whiteSpace: 'nowrap' }}>
            passo {playback.index + 1} / {playback.total}
          </Text>
        </Group>
      }
    >
      <Box
        className="viz-stage"
        px="md"
        pt="md"
        pb="sm"
      >
        <Box className="viz-canvas">
          <Canvas lesson={lesson} step={step} ids={ids[playback.index] ?? []} />
        </Box>

        <Box
          mt="lg"
          pl="md"
          pr="sm"
          py={10}
          style={{
            borderLeft: '2px solid var(--subject-accent, var(--viz-accent))',
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--subject-accent, var(--viz-accent)) 7%, var(--viz-surface-2)), var(--viz-surface-2) 72%)',
            borderRadius: `0 ${radius.sm}px ${radius.sm}px 0`,
            minHeight: 58,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Text
            fz={font.micro}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: '0.12em', marginBottom: 2 }}
          >
            narração
          </Text>
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
      code={getLessonCode(lesson, lang, approach)}
      activeLine={step?.line ?? 0}
      lang={lang}
      languages={languages}
      fileBaseName={getCodeFileBaseName(lesson, hasApproaches ? approach : undefined)}
      onLangChange={setLang}
      approach={hasApproaches ? approach : undefined}
      onApproachChange={hasApproaches ? changeApproach : undefined}
    />
  );

  const insight = getInsight(lesson.id);
  const hasInsight = Boolean(insight?.tip || insight?.funFact);

  const aboutPanel = (
    <Box className="lesson-about-grid">
      <Panel label="sobre" icon={<InfoIcon size={13} />}>
        <Box p="md">
          <Text c="dimmed" lh={1.7} fz={font.body} style={{ maxWidth: '68ch' }}>
            {lesson.description ?? 'Sem descrição disponível.'}
          </Text>
          {hasInsight ? (
            <Stack gap="sm" mt="md" pt="sm" style={{ borderTop: `1px solid ${vizVar.line}` }}>
              {insight?.tip ? (
                <Group align="flex-start" gap="sm" wrap="nowrap">
                  <Box aria-hidden style={{ color: 'var(--subject-accent, var(--viz-accent))', flexShrink: 0 }}>
                    <LightbulbIcon size={15} />
                  </Box>
                  <Box>
                    <Text fz={font.micro} ff="monospace" tt="uppercase" c="dimmed" style={{ letterSpacing: '0.1em' }}>
                      dica
                    </Text>
                    <Text fz={font.small} c="dimmed" lh={1.6}>
                      {insight.tip}
                    </Text>
                  </Box>
                </Group>
              ) : null}
              {insight?.funFact ? (
                <Group align="flex-start" gap="sm" wrap="nowrap">
                  <Box aria-hidden style={{ color: 'var(--subject-accent, var(--viz-accent))', flexShrink: 0 }}>
                    <SparkIcon size={15} />
                  </Box>
                  <Box>
                    <Text fz={font.micro} ff="monospace" tt="uppercase" c="dimmed" style={{ letterSpacing: '0.1em' }}>
                      curiosidade
                    </Text>
                    <Text fz={font.small} c="dimmed" lh={1.6}>
                      {insight.funFact}
                    </Text>
                  </Box>
                </Group>
              ) : null}
            </Stack>
          ) : null}
        </Box>
      </Panel>
      <Panel label="complexidade" icon={<GaugeIcon size={13} />}>
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
    <Box mt="md">
      <ComplexityAnalysisCard analysis={lesson.complexityAnalysis} />
    </Box>
  ) : null;

  return (
    <>
      {!lesson.inputless ? (
      <Paper
        withBorder
        radius="xl"
        px="md"
        py={10}
        mt="sm"
        style={{
          borderColor: vizVar.line,
          background: 'color-mix(in srgb, var(--viz-panel) 78%, transparent)',
        }}
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
              <Text fz={font.micro} fw={600} c="dimmed">
                {singleValue ? 'n =' : 'vetor'}
              </Text>
            }
            leftSectionWidth={singleValue ? 42 : 54}
            value={inputValue}
            onChange={(event) => setInputValue(event.currentTarget.value)}
            error={error || undefined}
            size="sm"
            className="lesson-input"
            style={{ flex: '1 1 220px', maxWidth: 320 }}
          />
          <Button type="submit" variant="default" size="sm" leftSection={<CheckIcon size={14} />}>
            Aplicar
          </Button>
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={randomize}
            aria-keyshortcuts="N"
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
                style={{ letterSpacing: '0.1em' }}
              >
                presets
              </Text>
              {[
                ['ordered', 'Ordenado'],
                ['reversed', 'Invertido'],
                ['repeated', 'Repetido'],
              ].map(([kind, label]) => (
                <Button
                  key={kind}
                  type="button"
                  variant="default"
                  size="compact-sm"
                  radius="pill"
                  onClick={() => applyPreset(kind as 'ordered' | 'reversed' | 'repeated')}
                >
                  {label}
                </Button>
              ))}
            </Group>
          ) : null}
        </Box>
      </Paper>
      ) : null}

      {isDesktop ? (
        <>
          <Box className="lesson-grid">
            {vizPanel}
            {codePanel}
          </Box>
          <Box mt="lg">
            <PlayerControls
              playback={playback}
              steps={steps}
              quiz={quizSupported ? quiz : undefined}
              onQuizChange={quizSupported ? setQuiz : undefined}
              onShowShortcuts={() => setHelpOpen(true)}
            />
          </Box>
          {quizPanel}
          {analysisPanel}
          <Box mt="lg">{aboutPanel}</Box>
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
              steps={steps}
              quiz={quizSupported ? quiz : undefined}
              onQuizChange={quizSupported ? setQuiz : undefined}
              onShowShortcuts={() => setHelpOpen(true)}
            />
          </Box>
          {quizPanel}
        </>
      )}
      <ShortcutsModal opened={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
