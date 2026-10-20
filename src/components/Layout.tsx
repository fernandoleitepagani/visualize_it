import type { ReactNode } from 'react';
import { Anchor, AppShell, Box, Container } from '@mantine/core';
import { palette } from '@/theme';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

/** Page shell: fixed header, readable width, skip link and footer at the end. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <AppShell header={{ height: 56 }} padding={0}>
      <AppShell.Header className="app-header-blur">
        <AppHeader />
      </AppShell.Header>

      <AppShell.Main
        id="conteudo"
        tabIndex={-1}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 56px)',
        }}
      >
        <Anchor href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </Anchor>
        <Container
          size={1200}
          px="md"
          py="lg"
          style={{ flex: 1, width: '100%', minWidth: 0 }}
        >
          {children}
        </Container>
        <Box component="footer" mt="xl" py="md" style={{ borderTop: `1px solid ${palette.line}` }}>
          <AppFooter />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
