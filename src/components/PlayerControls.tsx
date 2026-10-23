import { useCallback, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
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

      <Box className="player-deck-inner">
        <Group className="player-status-group" gap={8} wrap="nowrap" align="center">
          <Box
            aria-hidden
            className={isPlaying ? 'status-dot pulse' : 'status-dot'}
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: isPlaying
                ? 'var(--subject-accent, var(--viz-accent))'
                : atEnd
                ? 'var(--viz-muted)'
                : vizVar.line3,
              boxShadow: isPlaying
                ? '0 0 8px var(--subject-accent, var(--viz-accent))'
                : 'none',
              flexShrink: 0,
              transition: 'background-color 200ms ease, box-shadow 200ms ease',
            }}
          />
          <Badge
            variant="light"
            size="md"
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
                padding: '0 10px',
                height: 28,
              },
            }}
          >
            {empty ? '0 / 0' : `${index + 1} / ${total}`}
          </Badge>
          <Text
            fz={font.micro}
            fw={600}
            c="dimmed"
            visibleFrom="xs"
            style={{ whiteSpace: 'nowrap' }}
          >
            {empty ? 'Sem passos' : isPlaying ? 'Executando' : atEnd ? 'Concluído' : 'Pausado'}
          </Text>
        </Group>

        <Group className="player-transport" gap={6} wrap="nowrap" justify="center">
          <Button
            variant="default"
            size="md"
            radius="pill"
            onClick={playback.reset}
            disabled={empty}
            aria-label="Voltar ao início"
            aria-keyshortcuts="Home R"
            title="Voltar ao início (Home ou R)"
            leftSection={<ResetIcon size={15} />}
            className="player-action player-action-reset"
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
            title="Passo anterior (←)"
            leftSection={<ChevronLeftIcon size={15} />}
            className="player-action player-action-step"
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
            title="Executar ou Pausar (Espaço)"
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
            title="Próximo passo (→)"
            rightSection={<ChevronRightIcon size={15} />}
            className="player-action player-action-step"
          >
            <Text span visibleFrom="sm">
              Próximo
            </Text>
          </Button>
        </Group>

        <Group className="player-speed" gap={8} wrap="nowrap" justify="flex-end">
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
              title="Atalhos de teclado (?)"
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
      </Box>
    </Paper>
  );
}
