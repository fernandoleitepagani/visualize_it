import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Group,
  Paper,
  SegmentedControl,
  Slider,
  Switch,
  Text,
} from '@mantine/core';
import type { Playback } from '@/engine/usePlayback';
import type { Step } from '@/engine/types';
import { font, vizVar } from '@/theme';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  ShareIcon,
} from './icons';
import { TimelineBar } from './TimelineBar';

const SPEEDS = [
  { label: '0,5×', value: 1800 },
  { label: '1×', value: 900 },
  { label: '2×', value: 450 },
  { label: '4×', value: 225 },
];

export function PlayerControls({
  playback,
  steps,
  quiz,
  onQuizChange,
}: {
  playback: Playback;
  /** Step list used by the timeline; omitted in isolated tests. */
  steps?: Step[];
  /** Enables the quiz toggle; omit it on views that cannot quiz. */
  quiz?: boolean;
  onQuizChange?: (value: boolean) => void;
}) {
  const { isPlaying, atStart, atEnd, index, total, speedMs } = playback;
  const empty = total === 0;
  const playLabel = empty ? 'Executar' : isPlaying ? 'Pausar' : atEnd ? 'Recomeçar' : 'Executar';
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied (insecure context or permissions).
    }
  }, []);

  return (
    <Paper
      withBorder
      className="player-deck"
      radius="xl"
      style={{
        background: 'color-mix(in srgb, var(--viz-panel) 94%, transparent)',
        borderColor: vizVar.line,
        boxShadow: 'var(--viz-shadow-deck)',
        overflow: 'hidden',
      }}
    >
      {steps && steps.length > 0 ? (
        <Box className="player-timeline">
          <TimelineBar steps={steps} currentIndex={index} onSeek={playback.goTo} />
        </Box>
      ) : null}

      <Flex className="player-deck-inner" align="center" gap="md" wrap="wrap" px="md" py="sm">
        <Group className="player-transport" gap={6} wrap="nowrap">
          <Button
            variant="subtle"
            size="md"
            radius="pill"
            onClick={playback.reset}
            disabled={empty}
            aria-label="Voltar ao início"
            aria-keyshortcuts="Home"
            leftSection={<ResetIcon size={15} />}
            className="player-action"
          >
            <Text span visibleFrom="sm">
              Início
            </Text>
          </Button>
          <Button
            variant="default"
            size="md"
            radius="pill"
            onClick={playback.prev}
            disabled={atStart || empty}
            aria-label="Passo anterior"
            aria-keyshortcuts="ArrowLeft"
            leftSection={<ChevronLeftIcon size={15} />}
            className="player-action"
          >
            <Text span visibleFrom="sm">
              Anterior
            </Text>
          </Button>
          <Button
            size="md"
            radius="pill"
            aria-pressed={isPlaying}
            aria-keyshortcuts="Space"
            disabled={empty}
            onClick={playback.toggle}
            leftSection={isPlaying ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
            className="player-action player-action-play btn-primary"
          >
            {playLabel}
          </Button>
          <Button
            variant="default"
            size="md"
            radius="pill"
            onClick={playback.next}
            disabled={atEnd || empty}
            aria-label="Próximo passo"
            aria-keyshortcuts="ArrowRight"
            rightSection={<ChevronRightIcon size={15} />}
            className="player-action"
          >
            <Text span visibleFrom="sm">
              Próximo
            </Text>
          </Button>
        </Group>

        <Group className="player-progress" gap={10} wrap="nowrap">
          <Slider
            aria-label="Passo atual"
            size="md"
            className="player-slider"
            min={0}
            max={Math.max(total - 1, 0)}
            value={index}
            onChange={playback.goTo}
            disabled={total <= 1}
            label={(value) => (empty ? 'Sem passos' : `Passo ${value + 1} de ${total}`)}
          />
          <Text
            fz={font.small}
            fw={600}
            style={{ color: vizVar.ink, minWidth: 60, textAlign: 'right' }}
          >
            {empty ? '0 / 0' : `${index + 1} / ${total}`}
          </Text>
        </Group>

        <Group className="player-speed" gap={10} wrap="nowrap" justify="flex-end">
          {onQuizChange ? (
            <Switch
              size="xs"
              label="quiz"
              checked={quiz ?? false}
              onChange={(event) => onQuizChange(event.currentTarget.checked)}
              styles={{ label: { fontSize: font.micro } }}
            />
          ) : null}
          <SegmentedControl
            size="xs"
            aria-label="Velocidade"
            value={String(speedMs)}
            onChange={(value) => playback.setSpeedMs(Number(value))}
            data={SPEEDS.map((speed) => ({
              label: speed.label,
              value: String(speed.value),
            }))}
          />
          <Button
            variant="subtle"
            size="xs"
            radius="pill"
            onClick={copyLink}
            leftSection={<ShareIcon size={13} />}
            style={{ color: vizVar.accent }}
          >
            {copied ? 'Copiado!' : 'Copiar link'}
          </Button>
        </Group>
      </Flex>
    </Paper>
  );
}
