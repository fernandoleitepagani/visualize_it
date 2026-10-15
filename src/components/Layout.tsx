import type { ReactNode } from 'react';
import { Container } from '@mantine/core';

/** Page container: shared max width and padding. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <Container size={1100} px="md" pt="lg" pb={80}>
      {children}
    </Container>
  );
}
