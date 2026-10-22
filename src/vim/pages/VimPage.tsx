import { useCallback, useState } from 'react';
import { Box, Button } from '@mantine/core';
import { Link, useParams } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { CheckIcon, InfoIcon, KeyboardIcon } from '@/components/icons';
import { MetaPill } from '@/components/MetaPill';
import { PageHeader } from '@/components/PageHeader';
import { Panel } from '@/components/Panel';
import { space, vizVar } from '@/theme';
import { challenges, challengeIndex, getChallenge, isSolved } from '../challenges';
import type { CheatItem } from '../cheatsheet';
import { VimChallengePanel } from '../components/VimChallengePanel';
import { VimCheatsheet } from '../components/VimCheatsheet';
import { VimEditor } from '../components/VimEditor';
import { VimModeBadge } from '../components/VimModeBadge';
import { VimStatusline } from '../components/VimStatusline';
import { VimTouchKeys } from '../components/VimTouchKeys';
import { applyKeys, applyText, createState } from '../keymap';
import { loadProgress, recordSolved, saveProgress } from '../progress';
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
  const [practice, setPractice] = useState<CheatItem | null>(null);
  const [progress, setProgress] = useState<VimProgress>(() => loadProgress());

  const challenge = challenges[index];
  const best = progress.best[challenge.slug];

  const select = useCallback((next: number) => {
    const target = challenges[Math.min(Math.max(next, 0), challenges.length - 1)];
    const targetIndex = challenges.indexOf(target);
    setIndex(targetIndex);
    setState(createState(target.initialLines, target.start));
    setStrokes(0);
    setSolvedNow(false);
    setPractice(null);
  }, []);

  const reset = useCallback(() => select(index), [index, select]);

  const checkSolved = useCallback(
    (next: VimState, used: number) => {
      if (practice || !isSolved(challenge, next)) return;
      setSolvedNow(true);
      const bestKnown = progress.best[challenge.slug];
      if (progress.solved.includes(challenge.slug) && used >= (bestKnown ?? Infinity)) return;
      const updated = recordSolved(progress, challenge.slug, Math.max(1, used));
      saveProgress(updated);
      setProgress(updated);
    },
    [challenge, practice, progress],
  );

  const handleKey = useCallback(
    (key: string) => {
      const next = applyKeys(state, [key]);
      setState(next);
      setStrokes(strokes + 1);
      checkSolved(next, strokes + 1);
    },
    [state, strokes, checkSolved],
  );

  const handleText = useCallback(
    (text: string) => {
      const count = Array.from(text).length;
      const next = applyText(state, text);
      setState(next);
      setStrokes(strokes + count);
      checkSolved(next, strokes + count);
    },
    [state, strokes, checkSolved],
  );

  const practiceItem = useCallback((item: CheatItem) => {
    const snippet = item.practice ?? DEFAULT_PRACTICE;
    setPractice(item);
    setSolvedNow(false);
    setStrokes(0);
    setState(
      createState(snippet.lines, snippet.cursor, { message: `pratique: ${item.label}` }),
    );
  }, []);

  if (challengeMode && !getChallenge(slug)) return <NotFound />;

  const title = challengeMode ? challenge.title : 'Vim';
  const subtitle = challengeMode
    ? challenge.brief
    : 'Aprenda Vim praticando: mova o cursor, edite o buffer e consulte o cheatsheet essencial.';

  return (
    <Box
      style={
        { '--subject-accent': vizVar.accent } as CSSProperties
      }
    >
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
        actions={
          <Button
            component={Link}
            to="/vim"
            variant="default"
            size="xs"
            radius="pill"
            leftSection={<KeyboardIcon size={13} />}
          >
            {challengeMode ? 'Treinador livre' : 'Desafios'}
          </Button>
        }
      />

      <Box className="vim-grid">
        <Panel
          label="buffer"
          icon={<KeyboardIcon size={13} />}
          aside={<VimModeBadge mode={state.mode} />}
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
          <VimTouchKeys onKey={handleKey} />
        </Panel>

        <Panel label="missão" icon={<CheckIcon size={13} />}>
          <VimChallengePanel
            challenge={challenge}
            index={index}
            strokes={strokes}
            progress={progress}
            solvedNow={solvedNow}
            practiceLabel={practice ? `Praticando: ${practice.label}.` : undefined}
            onSelect={select}
            onPrev={() => select(index - 1)}
            onNext={() => select(index + 1)}
            onReset={reset}
            onBackToChallenge={reset}
          />
        </Panel>
      </Box>

      <Box mt={space.xl} id="cheatsheet" style={{ scrollMarginTop: 80 }}>
        <Panel label="cheatsheet essencial" icon={<InfoIcon size={13} />}>
          <VimCheatsheet onPractice={practiceItem} />
        </Panel>
      </Box>
    </Box>
  );
}
