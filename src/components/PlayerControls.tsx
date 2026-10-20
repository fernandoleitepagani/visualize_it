import { Button, Flex, Group, Kbd, Paper, SegmentedControl, Slider, Text } from '@mantine/core';
import type { Playback } from '@/engine/usePlayback';
import { font, palette, shadow } from '@/theme';
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

export function PlayerControls({ playback }: { playback: Playback }) {
  const { isPlaying, atStart, atEnd, index, total, speedMs } = playback;
  const playLabel = isPlaying ? 'Pausar' : atEnd ? 'Recomeçar' : 'Executar';

  return (
    <Paper
      withBorder
      radius="md"
      px="md"
      py="sm"
      className="player-deck"
      style={{ background: palette.surface, boxShadow: shadow.deck }}
    >
      <Flex className="player-deck-inner" align="center" gap="md" wrap="wrap">
        <Group className="player-transport" gap={6} wrap="nowrap">
          <Button
            variant="subtle"
            size="md"
            onClick={playback.reset}
            aria-label="Voltar ao início"
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
            style={{ color: palette.ink2, minWidth: 54, textAlign: 'right' }}
          >
            {index + 1} / {total}
          </Text>
        </Group>

        <Group className="player-speed" gap={10} wrap="nowrap" justify="flex-end">
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
          <Group gap={4} wrap="nowrap" visibleFrom="lg" aria-hidden>
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            <Kbd>espaço</Kbd>
          </Group>
        </Group>
      </Flex>
    </Paper>
  );
}
