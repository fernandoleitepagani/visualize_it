import { memo } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Group,
  Modal,
  Progress,
  SimpleGrid,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  ArrowRightIcon,
  CheckIcon,
  LightbulbIcon,
  ResetIcon,
} from '@/components/icons';
import { font, vizVar } from '@/theme';
import { challenges, goalLabel } from '../challenges';
import type { VimChallenge, VimProgress } from '../types';

interface Props {
  challenge: VimChallenge;
  index: number;
  progress: VimProgress;
  solvedNow: boolean;
  practiceLabel?: string;
  onSelect: (index: number) => void;
  onReset: () => void;
  onRestartAll: () => void;
  onBackToChallenge: () => void;
}

/** Mission card: goal, hint disclosure, success CTA and a 6×2 challenge rail. */
export const VimChallengePanel = memo(function VimChallengePanel({
  challenge,
  index,
  progress,
  solvedNow,
  practiceLabel,
  onSelect,
  onReset,
  onRestartAll,
  onBackToChallenge,
}: Props) {
  const [hintOpened, hint] = useDisclosure(false);
  const [confirmOpened, confirm] = useDisclosure(false);

  if (practiceLabel) {
    return (
      <Box p="md">
        <Text fz={font.micro} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.14em' }}>
          modo prática
        </Text>
        <Text fz={font.lead} fw={600} mt={4} mb={6} style={{ letterSpacing: '-0.01em' }}>
          {practiceLabel}
        </Text>
        <Text fz={font.small} c="dimmed" lh={1.55} mb="md">
          Explore o buffer à vontade. O progresso do desafio fica pausado até você voltar.
        </Text>
        <Button size="compact-sm" variant="default" onClick={onBackToChallenge}>
          Voltar ao desafio
        </Button>
      </Box>
    );
  }

  const last = index === challenges.length - 1;

  return (
    <Box p="md">
      <Group justify="space-between" align="baseline" gap="sm" mb={6}>
        <Text fz={font.micro} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.14em' }}>
          desafio {index + 1} / {challenges.length}
        </Text>
        <Group gap={4} wrap="nowrap">
          <Text fz={font.micro} c="dimmed">
            {progress.solved.length} concluídos
          </Text>
          <Button
            size="compact-xs"
            variant="subtle"
            radius="sm"
            aria-label="Reiniciar desafios e apagar histórico"
            onClick={confirm.open}
            leftSection={<ResetIcon size={11} />}
            style={{ color: vizVar.muted, paddingInline: 4 }}
            styles={{ label: { fontSize: font.micro } }}
          >
            reiniciar
          </Button>
        </Group>
      </Group>
      <Progress
        value={((index + 1) / challenges.length) * 100}
        size={3}
        radius="xl"
        mb="md"
        aria-label="progresso dos desafios"
        styles={{ section: { background: vizVar.accent } }}
      />

      <Text fz={font.lead} fw={600} mb={4} style={{ letterSpacing: '-0.01em' }}>
        {challenge.title}
      </Text>
      <Text fz={font.small} c="dimmed" lh={1.55} mb="sm">
        {challenge.brief}
      </Text>
      <Text
        fz={font.micro}
        c="dimmed"
        mb="sm"
        style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}
      >
        objetivo · {goalLabel(challenge)} · par {challenge.par} teclas
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
          <Text fz={font.small} mb={8}>
            Bom movimento. Siga para o próximo ou tente gastar menos teclas.
          </Text>
          <Group gap={6} wrap="wrap">
            <Button
              size="compact-xs"
              radius="sm"
              onClick={() => onSelect(index + 1)}
              disabled={last}
              rightSection={<ArrowRightIcon size={12} />}
            >
              Próximo desafio
            </Button>
            <Button
              size="compact-xs"
              variant="default"
              radius="sm"
              onClick={onReset}
              leftSection={<ResetIcon size={12} />}
            >
              Repetir
            </Button>
          </Group>
        </Alert>
      ) : null}

      <Button
        size="compact-xs"
        variant="subtle"
        radius="sm"
        onClick={hint.toggle}
        aria-expanded={hintOpened}
        leftSection={<LightbulbIcon size={12} />}
        style={{ color: vizVar.muted, paddingInline: 4 }}
      >
        dica
      </Button>
      <Collapse expanded={hintOpened}>
        <Text fz={font.small} c="dimmed" lh={1.5} mt={4} mb="xs">
          {challenge.hint}
        </Text>
      </Collapse>

      <Box mt="md" pt="sm" style={{ borderTop: `1px solid ${vizVar.line}` }}>
        <Group justify="space-between" mb={8}>
          <Text fz={font.micro} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.14em' }}>
            trilha
          </Text>
          <Text fz={font.micro} c="dimmed">
            {progress.solved.length} / {challenges.length}
          </Text>
        </Group>
        <SimpleGrid cols={6} spacing={4} verticalSpacing={4}>
          {challenges.map((item, itemIndex) => {
            const done = progress.solved.includes(item.slug);
            const active = itemIndex === index;
            return (
              <Tooltip key={item.slug} label={item.title} withArrow openDelay={200}>
                <UnstyledButton
                  className="vim-rail-chip"
                  data-active={active ? 'true' : undefined}
                  data-done={done ? 'true' : undefined}
                  aria-label={item.title}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => onSelect(itemIndex)}
                >
                  <Text
                    component="span"
                    fz={font.micro}
                    style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}
                  >
                    {done ? '✓' : String(itemIndex + 1).padStart(2, '0')}
                  </Text>
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </SimpleGrid>
      </Box>

      <Modal
        opened={confirmOpened}
        onClose={confirm.close}
        title="Reiniciar desafios?"
        centered
        radius="md"
        size="sm"
        transitionProps={{ duration: 0 }}
      >
        <Text fz={font.small} c="dimmed" lh={1.5} mb="md">
          Isso apaga o histórico de desafios concluídos e os recordes salvos neste navegador. O
          buffer atual volta para o primeiro desafio.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button size="compact-sm" variant="default" onClick={confirm.close}>
            Cancelar
          </Button>
          <Button
            size="compact-sm"
            color="red"
            onClick={() => {
              confirm.close();
              onRestartAll();
            }}
          >
            Reiniciar tudo
          </Button>
        </Group>
      </Modal>
    </Box>
  );
});
