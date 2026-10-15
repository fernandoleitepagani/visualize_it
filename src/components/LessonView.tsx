import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lesson, Step } from '@/engine/types';
import { DEFAULT_INPUT } from '@/engine/types';
import { assignElementIds } from '@/engine/elementIds';
import { usePlayback } from '@/engine/usePlayback';
import { BarsView } from './BarsView';
import { CellsView } from './CellsView';
import { CodePanel } from './CodePanel';
import type { CodeLang } from './CodePanel';
import { ComplexityTable } from './ComplexityTable';
import { NodesView } from './NodesView';
import { Panel } from './Panel';
import { PlayerControls } from './PlayerControls';
import { VarsPanel } from './VarsPanel';

const button =
  'rounded-md border border-line-2 bg-surface-2 px-3.5 py-1.5 text-[13.5px] text-ink transition-colors hover:border-accent-dim';

function parseInput(raw: string): number[] | null {
  const parts = raw
    .trim()
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
  if (parts.length < 1 || parts.length > 12 || parts.some((n) => !Number.isFinite(n))) return null;
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

  const steps = useMemo(() => lesson.steps(input), [lesson, input]);
  const playback = usePlayback(steps);
  const step = playback.step ?? steps[0];

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
        playback.pause();
        playback.next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        playback.pause();
        playback.prev();
      } else if (event.key === ' ') {
        event.preventDefault();
        playback.toggle();
      } else if (event.key === 'Home') {
        event.preventDefault();
        playback.reset();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [playback]);

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          label={lesson.panelLabel ?? 'vetor'}
          aside={
            <span className="font-mono text-[12.5px] text-muted normal-case">
              {playback.index + 1} / {playback.total}
            </span>
          }
        >
          <div className="flex flex-col justify-center px-4 pt-5 pb-4">
            <Canvas lesson={lesson} step={step} ids={ids[playback.index] ?? []} />
            <div className="mt-4 min-h-[52px] border-t border-line pt-4">
              <div className="mb-1 text-[11px] font-semibold tracking-widest text-dim uppercase">
                passo atual
              </div>
              <p className="text-sm leading-relaxed text-ink">{step?.desc}</p>
            </div>
            <VarsPanel vars={step?.vars} />
          </div>
        </Panel>

        <CodePanel
          code={lesson.code[lang]}
          activeLine={step?.line ?? 0}
          lang={lang}
          onLangChange={setLang}
        />
      </div>

      <PlayerControls playback={playback} />

      <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-line bg-surface px-4 py-3.5">
        <label className="flex flex-col gap-1.5 text-xs text-muted">
          valores
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') apply();
            }}
            className="w-[260px] rounded-md border border-line-2 bg-surface-2 px-2.5 py-1.5 font-mono text-[13px] text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <button type="button" className={button} onClick={apply}>
          Aplicar
        </button>
        <button type="button" className={button} onClick={randomize}>
          Sortear
        </button>
      </div>
      {error ? <p className="mt-1.5 text-[12.5px] text-red">{error}</p> : null}

      <section className="mt-6">
        <h2 className="mb-2.5 text-base font-semibold">Sobre</h2>
        <p className="mb-3 text-muted">{lesson.description}</p>
        <h2 className="mt-7 mb-2.5 text-base font-semibold">Complexidade</h2>
        <ComplexityTable complexity={lesson.complexity} />
      </section>
    </>
  );
}
