import { Link } from 'react-router-dom';
import { Anchor, Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { font, radius, vizVar } from '@/theme';
import { ArrowRightIcon } from '@/components/icons';

export function NotFound() {
  return (
    <Stack align="center" py={96} gap="sm">
      <Box
        aria-hidden
        style={{
          width: 92,
          height: 92,
          display: 'grid',
          placeItems: 'center',
          borderRadius: radius.pill,
          border: `1px solid ${vizVar.accentLine}`,
          background: `radial-gradient(circle, ${vizVar.accentSoft}, transparent 70%)`,
          color: vizVar.accent,
          fontFamily: 'var(--mantine-font-family-monospace)',
          fontSize: 38,
          lineHeight: 1,
        }}
      >
        ∅
      </Box>
      <Text ff="monospace" c="amber" fz={font.tiny} mt="sm" style={{ letterSpacing: '0.16em' }}>
        404
      </Text>
      <Title order={1} fz={font.h2} fw={500} style={{ letterSpacing: '-0.03em' }}>
        Página não encontrada
      </Title>
      <Text c="dimmed" ta="center" maw="46ch">
        O conteúdo que você procura não existe (ou mudou de lugar).
      </Text>
      <Group gap="sm" mt="md">
        <Button component={Link} to="/" radius="md">
          Voltar ao início
        </Button>
        <Anchor component={Link} to="/materias/aeds-ii" fz={font.small} underline="never">
          explorar AEDS II <ArrowRightIcon size={13} style={{ verticalAlign: 'middle' }} />
        </Anchor>
      </Group>
    </Stack>
  );
}
