import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { CheckIcon, InfoIcon, KeyboardIcon } from '@/components/icons';
import { MetaPill } from '@/components/MetaPill';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { font, space, vizVar } from '@/theme';
import { challenges, challengeIndex, getChallenge, isSolved } from '../challenges';
import type { CheatGroup } from '../cheatsheet';
import { VimChallengePanel } from '../components/VimChallengePanel';
import { VimCheatsheet } from '../components/VimCheatsheet';
import { VimEditor } from '../components/VimEditor';
import { VimStatusline } from '../components/VimStatusline';
import { VimTouchKeys } from '../components/VimTouchKeys';
import { applyKeys, applyText, createState } from '../keymap';
import { clearProgress, loadProgress, recordSolved, saveProgress } from '../progress';
import type { VimProgress, VimState } from '../types';
import { NotFound } from '@/pages/NotFound';

const DEFAULT_PRACTICE = {
  lines: ['pratique h, j, k, l, w, b, e, 0, $, gg e G'],
  cursor: { line: 0, col: 0 },
};

export function VimPage() {
  const { slug } = useParams();
  const challengeMode = Boolean(slug);
  const initialIndex = challengeIndex(slug);

  const [index, setIndex] = useState(initialIndex);
  const [state, setState] = useState(() =>
    createState(challenges[initialIndex].initialLines, challenges[initialIndex].start),
  );
  const [strokes, setStrokes] = useState(0);
  const [solvedNow, setSolvedNow] = useState(false);
  const [practiceLabel, setPracticeLabel] = useState<string | null>(null);
  const [progress, setProgress] = useState<VimProgress>(() => loadProgress());

  const challenge = challenges[index];
  const best = progress.best[challenge.slug];

  /**
   * Event handlers are stable; they read the newest session from this ref. That
   * keeps the cheatsheet, mission rail and touch deck from re-rendering on every
   * keystroke.
   */
  const latest = useRef({
    state,
    strokes,
    progress,
    challenge,
    index,
    practice: practiceLabel !== null,
  });

  useEffect(() => {
    latest.current = {
      state,
      strokes,
      progress,
      challenge,
      index,
      practice: practiceLabel !== null,
    };
  });

  const select = useCallback((next: number) => {
    const target = challenges[Math.min(Math.max(next, 0), challenges.length - 1)];
    const targetIndex = challenges.indexOf(target);
    setIndex(targetIndex);
    setState(createState(target.initialLines, target.start));
    setStrokes(0);
    setSolvedNow(false);
    setPracticeLabel(null);
  }, []);

  const reset = useCallback(() => {
    select(latest.current.index);
  }, [select]);

  const restartAll = useCallback(() => {
    const empty: VimProgress = { solved: [], best: {} };
    clearProgress();
    setProgress(empty);
    setSolvedNow(false);
    setPracticeLabel(null);
    latest.current = { ...latest.current, progress: empty, practice: false, strokes: 0 };
    select(0);
  }, [select]);

  const recordOutcome = useCallback((next: VimState, used: number) => {
    const current = latest.current;
    if (current.practice || !isSolved(current.challenge, next)) return;

    setSolvedNow(true);
    const slugToRecord = current.challenge.slug;
    const bestKnown = current.progress.best[slugToRecord];
    if (current.progress.solved.includes(slugToRecord) && used >= (bestKnown ?? Infinity)) {
      return;
    }

    const updated = recordSolved(current.progress, slugToRecord, Math.max(1, used));
    saveProgress(updated);
    latest.current = { ...current, progress: updated };
    setProgress(updated);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      const current = latest.current;
      const next = applyKeys(current.state, [key]);
      const used = current.strokes + 1;

      latest.current = { ...current, state: next, strokes: used };
      if (next !== current.state) setState(next);
      setStrokes(used);
      recordOutcome(next, used);
    },
    [recordOutcome],
  );

  const handleText = useCallback(
    (text: string) => {
      const current = latest.current;
      const count = Array.from(text).length;
      const next = applyText(current.state, text);
      const used = current.strokes + count;

      latest.current = { ...current, state: next, strokes: used };
      if (next !== current.state) setState(next);
      setStrokes(used);
      recordOutcome(next, used);
    },
    [recordOutcome],
  );

  const practiceGroup = useCallback((group: CheatGroup) => {
    const snippet = group.practice ?? DEFAULT_PRACTICE;
    const next = createState(snippet.lines, snippet.cursor, {
      message: `pratique: ${group.title}`,
    });

    latest.current = { ...latest.current, state: next, strokes: 0, practice: true };
    setPracticeLabel(group.title);
    setSolvedNow(false);
    setStrokes(0);
    setState(next);
  }, []);

  if (challengeMode && !getChallenge(slug)) return <NotFound />;

  const title = challengeMode ? challenge.title : 'Vim';
  const subtitle = challengeMode
    ? challenge.brief
    : 'Aprenda Vim praticando: mova o cursor, edite o buffer e consulte o cheatsheet essencial.';

  return (
    <Box style={{ '--subject-accent': vizVar.accent } as CSSProperties}>
      <PageHeader
        breadcrumb={
          challengeMode
            ? [
                { label: 'Início', to: '/' },
                { label: 'Vim', to: '/vim' },
                { label: challenge.title },
              ]
            : [{ label: 'Início', to: '/' }, { label: 'Vim' }]
        }
        kicker="laboratório"
        title={title}
        subtitle={subtitle}
        accent={vizVar.accent}
        meta={
          <>
            <MetaPill>modo normal</MetaPill>
            <MetaPill>{challenges.length} desafios</MetaPill>
            <MetaPill>{progress.solved.length} concluídos</MetaPill>
            <MetaPill tone="accent">sem plugins</MetaPill>
          </>
        }
      />

      <Box className="vim-grid">
        <Panel
          label="buffer"
          icon={<KeyboardIcon size={13} />}
          aside={
            <Text
              fz={font.micro}
              c="dimmed"
              style={{ fontFamily: 'var(--mantine-font-family-monospace)', whiteSpace: 'nowrap' }}
            >
              {index + 1} / {challenges.length}
            </Text>
          }
          footer={
            <VimStatusline
              state={state}
              fileName={`${challenge.slug}.txt`}
              strokes={strokes}
              best={best}
            />
          }
        >
          <VimEditor state={state} onKey={handleKey} onText={handleText} />
          <Box className="vim-shortcuts" px="md" py={6}>
            <Text fz={font.micro} c="dimmed">
              Esc normal · : comando · / busca · Tab sair
            </Text>
          </Box>
          <VimTouchKeys mode={state.mode} onKey={handleKey} />
        </Panel>

        <Panel
          label="missão"
          icon={<CheckIcon size={13} />}
          aside={
            <Text
              fz={font.micro}
              c="dimmed"
              style={{ fontFamily: 'var(--mantine-font-family-monospace)', whiteSpace: 'nowrap' }}
            >
              {index + 1} / {challenges.length}
            </Text>
          }
        >
          <VimChallengePanel
            challenge={challenge}
            index={index}
            progress={progress}
            solvedNow={solvedNow}
            practiceLabel={practiceLabel ?? undefined}
            onSelect={select}
            onReset={reset}
            onRestartAll={restartAll}
            onBackToChallenge={reset}
          />
        </Panel>
      </Box>

      <Box mt={space.xl} id="cheatsheet" style={{ scrollMarginTop: 80 }}>
        <Panel label="cheatsheet essencial" icon={<InfoIcon size={13} />}>
          <VimCheatsheet onPractice={practiceGroup} />
        </Panel>
      </Box>
    </Box>
  );
}
