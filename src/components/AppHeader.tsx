import { Link, useLocation } from 'react-router-dom';
import { Anchor, Box, Burger, Container, Drawer, Group, Menu, Stack, Text } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { allEntryLocations, getEntryPath, subjects } from '@/content/subjects';
import { font, space, subjectAccent } from '@/theme';
import { ChevronDownIcon } from './icons';
import { GlobalSearch } from './GlobalSearch';
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

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Anchor
      component={Link}
      to={to}
      underline="never"
      className="nav-link"
      data-active={active ? 'true' : undefined}
      fz={font.small}
      fw={active ? 600 : 500}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Anchor>
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
  const onSubjectPage = Boolean(activeSubjectId);
  const playgroundActive = pathname === '/playground';
  const vimActive = pathname.startsWith('/vim');
  const homeActive = pathname === '/';

  return (
    <Container
      size={1600}
      h="100%"
      px={{ base: 8, sm: 10, md: 16 }}
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
            <Box component="nav" aria-label="Principal">
              <Group gap={4} wrap="nowrap">
                <NavLink to="/" active={homeActive}>
                  Início
                </NavLink>

                <Menu
                  position="bottom-start"
                  withArrow
                  shadow="md"
                  width={220}
                  radius="md"
                  withinPortal
                  styles={{
                    dropdown: {
                      background: 'var(--viz-panel)',
                      borderColor: 'var(--viz-line)',
                    },
                    item: { fontSize: font.small },
                    label: {
                      fontSize: font.micro,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                    },
                  }}
                >
                  <Menu.Target>
                    <Box
                      component="button"
                      type="button"
                      className="nav-link nav-menu-trigger"
                      data-active={onSubjectPage ? 'true' : undefined}
                      aria-haspopup="menu"
                      aria-label="Escolher matéria"
                      fz={font.small}
                      fw={onSubjectPage ? 600 : 500}
                    >
                      Matérias
                      <ChevronDownIcon size={12} />
                    </Box>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>matérias</Menu.Label>
                    {subjects.map((subject) => {
                      const active = subject.id === activeSubjectId;
                      return (
                        <Menu.Item
                          key={subject.id}
                          component={Link}
                          to={`/materias/${subject.id}`}
                          fw={active ? 600 : 400}
                          leftSection={
                            <Box
                              w={6}
                              h={6}
                              aria-hidden
                              style={{
                                borderRadius: 999,
                                background: subjectAccent[subject.accent],
                              }}
                            />
                          }
                        >
                          {subject.title}
                        </Menu.Item>
                      );
                    })}
                  </Menu.Dropdown>
                </Menu>

                <NavLink to="/vim" active={vimActive}>
                  Vim
                </NavLink>
                <NavLink to="/playground" active={playgroundActive}>
                  Playground
                </NavLink>
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
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        styles={{
          content: { background: 'var(--viz-panel)' },
          header: { background: 'var(--viz-panel)' },
        }}
      >
        <Stack gap={4}>
          <Anchor
            component={Link}
            to="/"
            onClick={drawer.close}
            underline="never"
            className="nav-link"
            data-active={homeActive ? 'true' : undefined}
            h={38}
          >
            Início
          </Anchor>

          <Text
            fz={font.micro}
            tt="uppercase"
            c="dimmed"
            mt={space.sm}
            px={13}
            style={{ letterSpacing: '0.12em' }}
          >
            matérias
          </Text>
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
              <Box
                w={6}
                h={6}
                aria-hidden
                style={{ borderRadius: 999, background: subjectAccent[subject.accent] }}
              />
              {subject.title}
            </Anchor>
          ))}

          <Text
            fz={font.micro}
            tt="uppercase"
            c="dimmed"
            mt={space.sm}
            px={13}
            style={{ letterSpacing: '0.12em' }}
          >
            ferramentas
          </Text>
          <Anchor
            component={Link}
            to="/vim"
            onClick={drawer.close}
            underline="never"
            className="nav-link"
            data-active={vimActive ? 'true' : undefined}
            h={38}
          >
            Vim
          </Anchor>
          <Anchor
            component={Link}
            to="/playground"
            onClick={drawer.close}
            underline="never"
            className="nav-link"
            data-active={playgroundActive ? 'true' : undefined}
            h={38}
          >
            Playground
          </Anchor>
        </Stack>
        <Text fz={font.tiny} c="dimmed" mt={space.xl}>
          AEDS I/II · Java & C
        </Text>
      </Drawer>
    </Container>
  );
}
