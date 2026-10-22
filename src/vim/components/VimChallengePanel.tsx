import { Alert, Box, Button, Group, Progress, Stack, Text, UnstyledButton } from '@mantine/core';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, LightbulbIcon, ResetIcon } from '@/components/icons';
import { font, radius, vizVar } from '@/theme';
import { challenges, goalLabel } from '../challenges';
import type { VimChallenge, VimProgress } from '../types';

interface Props {
  challenge: VimChallenge;
  index: number;
  strokes: number;
  progress: VimProgress;
  solvedNow: boolean;
  practiceLabel?: string;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onBackToChallenge: () => void;
}

/** Mission list, current goal, hint and navigation. */
export function VimChallengePanel({
  challenge,
  index,
  strokes,
  progress,
  solvedNow,
  practiceLabel,
  onSelect,
  onPrev,
  onNext,
  onReset,
  onBackToChallenge,
}: Props) {
  return (
    <Box p="md">
      <Group justify="space-between" align="baseline" gap="sm" mb={6}>
        <Text fz={font.micro} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.14em' }}>
          desafio {index + 1} / {challenges.length}
        </Text>
        <Text fz={font.micro} c="dimmed">
          {progress.solved.length} concluídos
        </Text>
      </Group>
      <Progress
        value={((index + 1) / challenges.length) * 100}
        size={3}
        radius="xl"
        mb="md"
        aria-label="progresso dos desafios"
        styles={{ section: { background: vizVar.accent } }}
      />

      {practiceLabel ? (
        <Alert
          mb="md"
          radius="md"
          variant="light"
          color="gray"
          title="modo prática"
          styles={{ title: { fontSize: font.small }, body: { fontSize: font.small } }}
        >
          <Stack gap={8} align="flex-start">
            <Text fz={font.small} c="dimmed">
              {practiceLabel}
            </Text>
            <Button size="compact-xs" variant="default" onClick={onBackToChallenge}>
              Voltar ao desafio
            </Button>
          </Stack>
        </Alert>
      ) : null}

      <Text fz={font.lead} fw={600} mb={4} style={{ letterSpacing: '-0.01em' }}>
        {challenge.title}
      </Text>
      <Text fz={font.small} c="dimmed" lh={1.55} mb="sm">
        {challenge.brief}
      </Text>
      <Text fz={font.micro} c="dimmed" mb="sm" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
        objetivo · {goalLabel(challenge)} · par {challenge.par} teclas · você usou {strokes}
      </Text>

      {solvedNow ? (
        <Alert
          mb="sm"
          radius="md"
          variant="light"
          color="yellow"
          icon={<CheckIcon size={15} />}
          title="Desafio concluído"
          styles={{ title: { fontSize: font.small }, body: { fontSize: font.small } }}
        >
          <Group justify="space-between" gap="sm">
            <Text fz={font.small}>Bom movimento. Siga para o próximo ou tente gastar menos teclas.</Text>
            <Button size="compact-xs" variant="default" onClick={onReset}>
              Tentar de novo
            </Button>
          </Group>
        </Alert>
      ) : null}

      <Group gap={6} mb="md" wrap="wrap">
        <Button
          size="compact-xs"
          variant="default"
          radius="sm"
          onClick={onPrev}
          disabled={index === 0}
          leftSection={<ChevronLeftIcon size={12} />}
        >
          Anterior
        </Button>
        <Button
          size="compact-xs"
          variant="default"
          radius="sm"
          onClick={onReset}
          leftSection={<ResetIcon size={12} />}
        >
          Reiniciar
        </Button>
        <Button
          size="compact-xs"
          variant="default"
          radius="sm"
          onClick={onNext}
          disabled={index === challenges.length - 1}
          rightSection={<ChevronRightIcon size={12} />}
        >
          Próximo
        </Button>
      </Group>

      <Group gap={6} align="flex-start" mb={4} wrap="nowrap">
        <Box style={{ color: vizVar.accent, flexShrink: 0, paddingTop: 2 }}>
          <LightbulbIcon size={13} />
        </Box>
        <Text fz={font.small} c="dimmed" lh={1.5}>
          {challenge.hint}
        </Text>
      </Group>

      <Box
        mt="md"
        pt="sm"
        style={{ borderTop: `1px solid ${vizVar.line}`, maxHeight: 220, overflowY: 'auto' }}
      >
        <Stack gap={2}>
          {challenges.map((item, itemIndex) => {
            const done = progress.solved.includes(item.slug);
            const active = itemIndex === index;
            return (
              <UnstyledButton
                key={item.slug}
                onClick={() => onSelect(itemIndex)}
                aria-current={active ? 'true' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 7px',
                  borderRadius: radius.sm,
                  background: active ? 'var(--viz-surface-2)' : 'transparent',
                  color: active ? vizVar.ink : vizVar.muted,
                }}
              >
                <Text
                  component="span"
                  fz={font.micro}
                  style={{
                    width: 18,
                    color: done ? vizVar.accent : vizVar.faint,
                    fontFamily: 'var(--mantine-font-family-monospace)',
                  }}
                >
                  {done ? '✓' : String(itemIndex + 1).padStart(2, '0')}
                </Text>
                <Text component="span" fz={font.small} style={{ flex: 1, textAlign: 'left' }}>
                  {item.title}
                </Text>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
