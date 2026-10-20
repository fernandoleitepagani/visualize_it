import { Link, useLocation } from 'react-router-dom';
import { Anchor, Box, Burger, Container, Drawer, Group, Stack, Text } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { allEntryLocations, getEntryPath, subjects } from '@/content/subjects';
import { font } from '@/theme';
import { GlobalSearch } from './GlobalSearch';
import { ThemeToggle } from './ThemeToggle';

const DESKTOP_QUERY = '(min-width: 62em)';

export function AppHeader() {
  const pathname = useLocation().pathname;
  const [drawerOpened, drawer] = useDisclosure(false);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const currentEntry = allEntryLocations().find(
    (location) => getEntryPath(location.entry) === pathname,
  );
  const activeSubjectId = pathname.startsWith('/materias/')
    ? pathname.split('/')[2]
    : currentEntry?.subject.id;

  return (
    <Container size={1200} h="100%" px="md" className="app-header-blur">
      <Group h="100%" justify="space-between" wrap="nowrap" gap="md">
        <Group gap="xl" wrap="nowrap" h="100%">
          <Anchor component={Link} to="/" underline="never" c="inherit" fw={600} fz="sm">
            Visualize It
            <Text span c="amber">
              .
            </Text>
          </Anchor>

          {isDesktop ? (
            <Box component="nav" aria-label="Matérias">
              <Group gap="lg" wrap="nowrap">
                {subjects.map((subject) => {
                  const active = subject.id === activeSubjectId;
                  return (
                    <Anchor
                      key={subject.id}
                      component={Link}
                      to={`/materias/${subject.id}`}
                      underline="never"
                      fz={font.small}
                      fw={active ? 600 : 500}
                      c={active ? 'amber' : 'dimmed'}
                      aria-current={active ? 'page' : undefined}
                    >
                      {subject.title}
                    </Anchor>
                  );
                })}
              </Group>
            </Box>
          ) : null}
        </Group>

        <Group gap="sm" wrap="nowrap">
          <ThemeToggle />
          {isDesktop ? (
            <GlobalSearch trigger="input" shortcut />
          ) : (
            <>
              <GlobalSearch trigger="icon" />
              <Burger
                opened={drawerOpened}
                onClick={drawer.toggle}
                size="sm"
                aria-label={drawerOpened ? 'Fechar menu' : 'Abrir menu'}
              />
            </>
          )}
        </Group>
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={drawer.close}
        title="Menu"
        position="right"
        size="xs"
        closeButtonProps={{ 'aria-label': 'Fechar menu' }}
      >
        <Stack gap="sm">
          <Anchor component={Link} to="/" onClick={drawer.close} underline="never" c="dimmed">
            Início
          </Anchor>
          {subjects.map((subject) => (
            <Anchor
              key={subject.id}
              component={Link}
              to={`/materias/${subject.id}`}
              onClick={drawer.close}
              underline="never"
              c={subject.id === activeSubjectId ? 'amber' : 'dimmed'}
              fw={subject.id === activeSubjectId ? 600 : 400}
            >
              {subject.title}
            </Anchor>
          ))}
        </Stack>
      </Drawer>
    </Container>
  );
}
