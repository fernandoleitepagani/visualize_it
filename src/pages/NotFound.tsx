import { Anchor, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { font } from '@/theme';

export function NotFound() {
  return (
    <Stack align="center" py={96} gap="xs">
      <Text ff="monospace" c="amber">
        404
      </Text>
      <Title order={1} fz={font.h2} fw={600}>
        Página não encontrada
      </Title>
      <Text c="dimmed">O conteúdo que você procura não existe (ou mudou de lugar).</Text>
      <Anchor component={Link} to="/" mt="md">
        ← voltar para todos os algoritmos
      </Anchor>
    </Stack>
  );
}
