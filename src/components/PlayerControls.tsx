import { useCallback, useState } from 'react';
import { Button, Group, Paper, Slider, Text } from '@mantine/core';
import type { Playback } from '@/engine/usePlayback';

const BASE_MS = 1600;
const MIN_SPEED = 1;
const MAX_SPEED = 10;

const toSlider = (speedMs: number) =>
  Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(BASE_MS / Math.max(speedMs, 1))));
const toMs = (slider: number) => Math.round(BASE_MS / slider);

export function PlayerControls({ playback }: { playback: Playback }) {
  const { isPlaying, atStart, atEnd, index, total, speedMs } = playback;
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
    <Paper withBorder radius="md" px="md" py="sm" mt="md">
      <Group gap="xs">
        <Button variant="default" size="sm" onClick={playback.reset}>
          Recomeçar
        </Button>
        <Button variant="default" size="sm" onClick={playback.prev} disabled={atStart}>
          Anterior
        </Button>
        <Button size="sm" onClick={playback.toggle} disabled={atEnd && !isPlaying}>
          {isPlaying ? 'Pausar' : 'Executar'}
        </Button>
        <Button variant="default" size="sm" onClick={playback.next} disabled={atEnd}>
          Próximo
        </Button>

        <Group gap="xs" ml="auto" wrap="nowrap">
          <Text fz="xs" c="dimmed">
            velocidade
          </Text>
          <Slider
            aria-label="velocidade"
            size="sm"
            w={100}
            min={MIN_SPEED}
            max={MAX_SPEED}
            value={toSlider(speedMs)}
            onChange={(value) => playback.setSpeedMs(toMs(value))}
          />
        </Group>

        <Text fz="xs" c="dimmed" ff="monospace">
          {index + 1} / {total}
        </Text>

        <Button variant="subtle" size="sm" onClick={copyLink}>
          {copied ? 'Copiado!' : 'Copiar link'}
        </Button>
      </Group>
    </Paper>
  );
}
