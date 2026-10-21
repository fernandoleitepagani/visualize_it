import { Link, useLocation } from 'react-router-dom';
import { Anchor, Box, Burger, Container, Drawer, Group, Stack, Text } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { allEntryLocations, getEntryPath, subjects } from '@/content/subjects';
import { font, space } from '@/theme';
import { GlobalSearch } from './GlobalSearch';
import { SparkIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

const DESKTOP_QUERY = '(min-width: 62em)';

function BrandMark() {
  return (
    <Box className="brand-mark" aria-hidden>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 18v-6M12 18V6M19 18v-9"
          stroke="var(--viz-accent)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="19" cy="5" r="1.8" fill="var(--viz-accent)" />
      </svg>
    </Box>
  );
}

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
  const playgroundActive = pathname === '/playground';

  return (
    <Container
      size={1280}
      h="100%"
      px={{ base: 'md', sm: 'lg', md: 'xl' }}
      style={{ position: 'relative' }}
    >
      <Group h="100%" justify="space-between" wrap="nowrap" gap="md">
        <Group gap="xl" wrap="nowrap" h="100%">
          <Anchor
            component={Link}
            to="/"
            underline="never"
            c="inherit"
            fw={600}
            fz="sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, letterSpacing: '-0.01em' }}
          >
            <BrandMark />
            <span>
              Visualize It
              <Text span c="amber">
                .
              </Text>
            </span>
          </Anchor>

          {isDesktop ? (
            <Box component="nav" aria-label="Matérias">
              <Group gap={4} wrap="nowrap">
                {subjects.map((subject) => {
                  const active = subject.id === activeSubjectId;
                  return (
                    <Anchor
                      key={subject.id}
                      component={Link}
                      to={`/materias/${subject.id}`}
                      underline="never"
                      className="nav-link"
                      data-active={active ? 'true' : undefined}
                      fz={font.small}
                      fw={active ? 600 : 500}
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
          {isDesktop ? (
            <Anchor
              component={Link}
              to="/playground"
              underline="never"
              className="nav-link"
              data-active={playgroundActive ? 'true' : undefined}
              fz={font.small}
              aria-current={playgroundActive ? 'page' : undefined}
            >
              <SparkIcon size={13} />
              Playground
            </Anchor>
          ) : null}
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
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        styles={{
          content: { background: 'var(--viz-panel)' },
          header: { background: 'var(--viz-panel)' },
        }}
      >
        <Stack gap={6}>
          <Anchor
            component={Link}
            to="/"
            onClick={drawer.close}
            underline="never"
            className="nav-link"
            data-active={pathname === '/' ? 'true' : undefined}
            h={38}
          >
            Início
          </Anchor>
          {subjects.map((subject) => (
            <Anchor
              key={subject.id}
              component={Link}
              to={`/materias/${subject.id}`}
              onClick={drawer.close}
              underline="never"
              className="nav-link"
              data-active={subject.id === activeSubjectId ? 'true' : undefined}
              fw={subject.id === activeSubjectId ? 600 : 400}
              h={38}
            >
              {subject.title}
            </Anchor>
          ))}
          <Anchor
            component={Link}
            to="/playground"
            onClick={drawer.close}
            underline="never"
            className="nav-link"
            data-active={playgroundActive ? 'true' : undefined}
            h={38}
          >
            <SparkIcon size={14} />
            Playground
          </Anchor>
        </Stack>
        <Text fz={font.tiny} c="dimmed" mt={space.xl} ff="monospace">
          AEDS I/II · Java & C
        </Text>
      </Drawer>
    </Container>
  );
}
