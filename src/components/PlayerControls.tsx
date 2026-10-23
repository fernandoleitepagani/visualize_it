import { useCallback, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  SegmentedControl,
  Switch,
  Text,
} from '@mantine/core';
import type { Playback } from '@/engine/usePlayback';
import type { Step } from '@/engine/types';
import { font, vizVar } from '@/theme';
import { SPEEDS } from '@/lib/speeds';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyboardIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  ShareIcon,
} from './icons';
import { TimelineBar } from './TimelineBar';

export function PlayerControls({
  playback,
  steps,
  quiz,
  onQuizChange,
  onShowShortcuts,
}: {
  playback: Playback;
  /** Step list used by the timeline; omitted in isolated tests. */
  steps?: Step[];
  /** Enables the quiz toggle; omit it on views that cannot quiz. */
  quiz?: boolean;
  onQuizChange?: (value: boolean) => void;
  /** Opens the keyboard shortcut help. */
  onShowShortcuts?: () => void;
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

      <Flex className="player-deck-inner" align="center" justify="space-between" gap="md" px="md" py="sm">
        <Group className="player-transport" gap={6} wrap="nowrap">
          <Button
            variant="subtle"
            size="md"
            radius="pill"
            onClick={playback.reset}
            disabled={empty}
            aria-label="Voltar ao início"
            aria-keyshortcuts="Home R"
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

        <Group className="player-progress" gap={8} wrap="nowrap" justify="center">
          <Badge
            variant="light"
            size="lg"
            radius="md"
            styles={{
              root: {
                background: 'var(--viz-surface-3)',
                borderColor: vizVar.line2,
                borderWidth: 1,
                borderStyle: 'solid',
                textTransform: 'none',
                fontFamily: 'monospace',
                fontSize: font.small,
                fontWeight: 700,
                color: vizVar.ink,
                padding: '0 12px',
                height: 32,
              },
            }}
          >
            {empty ? '0 / 0' : `${index + 1} / ${total}`}
          </Badge>
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
          {onShowShortcuts ? (
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label="Atalhos de teclado"
              aria-keyshortcuts="?"
              onClick={onShowShortcuts}
            >
              <KeyboardIcon size={14} />
            </ActionIcon>
          ) : null}
          <Button
            variant="subtle"
            size="xs"
            radius="pill"
            onClick={copyLink}
            leftSection={<ShareIcon size={13} />}
            style={{ color: 'var(--subject-accent, var(--viz-accent))' }}
          >
            {copied ? 'Copiado!' : 'Copiar link'}
          </Button>
        </Group>
      </Flex>
    </Paper>
  );
}
