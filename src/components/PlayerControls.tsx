import { useCallback, useState } from 'react';
import { Button, Flex, Group, Paper, SegmentedControl, Slider, Switch, Text } from '@mantine/core';
import type { Playback } from '@/engine/usePlayback';
import { font, palette, shadow, vizVar } from '@/theme';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
} from './icons';

const SPEEDS = [
  { label: '0,5×', value: 1800 },
  { label: '1×', value: 900 },
  { label: '2×', value: 450 },
  { label: '4×', value: 225 },
];

export function PlayerControls({
  playback,
  quiz,
  onQuizChange,
}: {
  playback: Playback;
  /** Enables the quiz toggle; omit it on views that cannot quiz. */
  quiz?: boolean;
  onQuizChange?: (value: boolean) => void;
}) {
  const { isPlaying, atStart, atEnd, index, total, speedMs } = playback;
  const playLabel = isPlaying ? 'Pausar' : atEnd ? 'Recomeçar' : 'Executar';
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
      radius="md"
      px="md"
      py="sm"
      className="player-deck"
      style={{ background: 'var(--mantine-color-body)', boxShadow: shadow.deck }}
    >
      <Flex className="player-deck-inner" align="center" gap="md" wrap="wrap">
        <Group className="player-transport" gap={6} wrap="nowrap">
          <Button
            variant="subtle"
            size="md"
            onClick={playback.reset}
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
            onClick={playback.prev}
            disabled={atStart}
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
            aria-pressed={isPlaying}
            aria-keyshortcuts="Space"
            onClick={playback.toggle}
            leftSection={isPlaying ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
            className="player-action player-action-play"
            style={{ boxShadow: shadow.primary }}
          >
            {playLabel}
          </Button>
          <Button
            variant="default"
            size="md"
            onClick={playback.next}
            disabled={atEnd}
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
            label={(value) => `Passo ${value + 1} de ${total}`}
          />
          <Text
            fz={font.small}
            ff="monospace"
            fw={600}
            style={{ color: vizVar.ink, minWidth: 54, textAlign: 'right' }}
          >
            {index + 1} / {total}
          </Text>
        </Group>

        <Group className="player-speed" gap={10} wrap="nowrap" justify="flex-end">
          {onQuizChange ? (
            <Switch
              size="xs"
              label="quiz"
              checked={quiz ?? false}
              onChange={(event) => onQuizChange(event.currentTarget.checked)}
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
          <Button variant="subtle" size="xs" onClick={copyLink} style={{ color: palette.accent }}>
            {copied ? 'Copiado!' : 'Copiar link'}
          </Button>
        </Group>
      </Flex>
    </Paper>
  );
}
