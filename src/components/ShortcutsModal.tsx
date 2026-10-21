import { Group, Kbd, Modal, Stack, Text } from '@mantine/core';
import { font } from '@/theme';

const SHORTCUTS = [
  ['← / →', 'passo anterior / próximo'],
  ['Espaço', 'executar / pausar'],
  ['Home', 'voltar ao início'],
  ['End', 'ir ao último passo'],
  ['R', 'reiniciar a reprodução'],
  ['N', 'sortear nova entrada'],
  ['+ / −', 'aumentar / diminuir a velocidade'],
  ['?', 'abrir esta ajuda'],
] as const;

export function ShortcutsModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Atalhos de teclado"
      size="md"
      centered
      closeButtonProps={{ 'aria-label': 'Fechar atalhos' }}
    >
      <Stack gap="sm">
        {SHORTCUTS.map(([keys, label]) => (
          <Group key={keys} justify="space-between" wrap="nowrap" gap="md">
            <Text fz={font.small} c="dimmed">
              {label}
            </Text>
            <Kbd>{keys}</Kbd>
          </Group>
        ))}
      </Stack>
      <Text fz={font.micro} c="dimmed" mt="md">
        Os atalhos são ignorados enquanto o foco está em campos de texto, botões ou links.
      </Text>
    </Modal>
  );
}
