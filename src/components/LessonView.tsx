import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { Lesson, Step } from '@/engine/types';
import { DEFAULT_INPUT } from '@/engine/types';
import { assignElementIds } from '@/engine/elementIds';
import { usePlayback } from '@/engine/usePlayback';
import { palette, font, radius } from '@/theme';
import { BarsView } from './BarsView';
import { CellsView } from './CellsView';
import { CodePanel } from './CodePanel';
import type { CodeLang } from './CodePanel';
import { ComplexityTable } from './ComplexityTable';
import { NodesView } from './NodesView';
import { Panel } from './Panel';
import { PlayerControls } from './PlayerControls';
import { VarsPanel } from './VarsPanel';
import { BarsIcon, CheckIcon, GaugeIcon, InfoIcon, ShuffleIcon } from './icons';

function parseInput(raw: string): number[] | null {
  const parts = raw
    .trim()
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
  if (
    parts.length < 1 ||
    parts.length > 12 ||
    parts.some((n) => !Number.isFinite(n) || !Number.isInteger(n))
  ) {
    return null;
  }
  return parts;
}

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
  const isDesktop = useMediaQuery('(min-width: 62em)');

  const steps = useMemo(() => lesson.steps(input), [lesson, input]);
  const playback = usePlayback(steps);
  const step = playback.step ?? steps[0];
  const prevStep = playback.index > 0 ? steps[playback.index - 1] : undefined;
  const { next, prev, toggle, reset, pause, goTo, total } = playback;

  // Element identities let the bars view animate swaps (only the bars view uses them).
  const ids = useMemo(
    () => ((lesson.view ?? 'bars') === 'bars' ? assignElementIds(steps) : []),
    [lesson.view, steps],
  );

  const singleValue = initialInput.length === 1;
  // Single-number lessons (for/while/do-while) do not benefit from ordering presets.
  const canPreset = !singleValue;

  const setValues = useCallback((values: number[]) => {
    setError('');
    setInput(values);
    setInputValue(values.join(', '));
  }, []);

  const apply = useCallback(() => {
    const parsed = parseInput(inputValue);
    if (!parsed) {
      setError('Use entre 1 e 12 números inteiros separados por vírgula.');
      return;
    }
    if (singleValue && parsed.length !== 1) {
      setError('Use um único inteiro para n.');
      return;
    }
    setValues(parsed);
  }, [inputValue, setValues, singleValue]);

  const randomize = useCallback(() => {
    const values = singleValue
      ? [3 + Math.floor(Math.random() * 8)]
      : Array.from(
          { length: 4 + Math.floor(Math.random() * 4) },
          () => 1 + Math.floor(Math.random() * 60),
        );
    setValues(values);
  }, [setValues, singleValue]);

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
          style={{ color: palette.ink2, textTransform: 'none' }}
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
            background: palette.surface2,
            border: `1px solid ${palette.line}`,
            borderLeft: `3px solid ${palette.accent}`,
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
            style={{ color: palette.ink }}
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
      code={lesson.code[lang]}
      activeLine={step?.line ?? 0}
      lang={lang}
      onLangChange={setLang}
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

  return (
    <>
      <Paper withBorder radius="md" px="md" py="xs" mt="sm" style={{ background: palette.surface }}>
        <Box
          component="form"
          className="lesson-toolbar-row"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
        >
          <TextInput
            aria-label={canPreset ? 'valores' : 'valor de n'}
            placeholder={canPreset ? 'ex: 45, 12, 85, 32' : 'ex: 5'}
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
          <Button
            type="submit"
            variant="light"
            size="sm"
            leftSection={<CheckIcon size={14} />}
          >
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
            <PlayerControls playback={playback} />
          </Box>
          <Box mt="xl">{aboutPanel}</Box>
        </>
      ) : (
        <>
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
            <PlayerControls playback={playback} />
          </Box>
        </>
      )}
    </>
  );
}
