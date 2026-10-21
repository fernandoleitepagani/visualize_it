// src/theme/tokens.ts
import { createTheme, type CSSVariablesResolver, type MantineColorsTuple } from '@mantine/core';

/** Single source of truth for every visual value in the app. */
export const palette = {
  // Deep ink graphite — the dark canvas.
  canvas: '#0b0e11',
  surface: '#11151a',
  surface2: '#171c22',
  surface3: '#1e242c',
  surface4: '#252c35',

  line: 'rgba(255, 255, 255, 0.075)',
  line2: 'rgba(255, 255, 255, 0.12)',
  line3: 'rgba(255, 255, 255, 0.19)',

  ink: '#f1f4ee',
  ink2: '#cbd2ca',
  muted: '#9aa39a',
  dim: '#737d75',
  faint: '#4c554e',

  accent: '#fbbf24',
  accentSoft: 'rgba(251, 191, 36, 0.13)',
  accentLine: 'rgba(251, 191, 36, 0.34)',
  accentDim: '#b07d0a',
  accentHalo: 'rgba(251, 191, 36, 0.22)',
  accentGlow: 'rgba(251, 191, 36, 0.08)',
  accentInk: '#2a1d02',

  success: '#4ade80',
  successSoft: 'rgba(74, 222, 128, 0.12)',
  successLine: 'rgba(74, 222, 128, 0.34)',

  info: '#c084fc',
  infoSoft: 'rgba(192, 132, 252, 0.14)',
  infoLine: 'rgba(192, 132, 252, 0.34)',

  danger: '#f87171',
  dangerSoft: 'rgba(248, 113, 113, 0.12)',
} as const;

/**
 * Warm paper values for the light scheme. Kept here (not in a stylesheet) so
 * the resolver can expose them as CSS variables from a single source.
 */
export const lightPalette = {
  canvas: '#f6f3ea',
  surface: '#fffdf7',
  surface2: '#f1ece0',
  surface3: '#e8e1d2',
  surface4: '#ddd4c2',

  line: '#e5decd',
  line2: '#d7ceba',
  line3: '#c7bba3',

  ink: '#1c211d',
  ink2: '#39423a',
  muted: '#5c655c',
  dim: '#787f76',
  faint: '#a9afa6',

  accent: '#8a5a00',
  accentSoft: 'rgba(138, 90, 0, 0.09)',
  accentLine: 'rgba(138, 90, 0, 0.26)',
  accentDim: '#a8730a',
  accentHalo: 'rgba(138, 90, 0, 0.16)',
  accentGlow: 'rgba(138, 90, 0, 0.06)',

  success: '#1f7a3d',
  successSoft: 'rgba(31, 122, 61, 0.10)',
  successLine: 'rgba(31, 122, 61, 0.28)',

  info: '#6d3fc0',
  infoSoft: 'rgba(109, 63, 192, 0.10)',
  infoLine: 'rgba(109, 63, 192, 0.28)',

  danger: '#b42318',
  dangerSoft: 'rgba(180, 35, 24, 0.09)',
} as const;

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40, huge: 64 } as const;

export const radius = { xs: 4, sm: 8, md: 12, lg: 18, xl: 24, xxl: 32, pill: 999 } as const;

export const font = {
  micro: 10.5,
  tiny: 11.5,
  small: 13,
  body: 15,
  lead: 17,
  h3: 20,
  h2: 26,
  h1: 34,
  display: 'clamp(2.35rem, 4.6vw, 3.6rem)',
} as const;

export const sans =
  "'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
export const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const shadow = {
  card: '0 1px 0 0 rgba(255,255,255,0.04) inset',
  panel:
    '0 1px 0 0 rgba(255,255,255,0.045) inset, 0 28px 64px -38px rgba(0,0,0,0.72), 0 2px 10px rgba(0,0,0,0.12)',
  deck: '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 22px 50px -28px rgba(0,0,0,0.62)',
  primary: `0 10px 28px -10px ${palette.accentHalo}`,
  lift: '0 18px 40px -24px rgba(0,0,0,0.55)',
  focus: `0 0 0 3px ${palette.accentSoft}`,
} as const;

/**
 * Theme-aware aliases for the visualization palette. The views use inline
 * styles, so surface/ink colours must resolve through CSS variables to follow
 * the Mantine color scheme.
 */
export const vizVar = {
  canvas: 'var(--viz-canvas)',
  surface: 'var(--viz-surface)',
  surface2: 'var(--viz-surface-2)',
  surface3: 'var(--viz-surface-3)',
  line: 'var(--viz-line)',
  line2: 'var(--viz-line-2)',
  line3: 'var(--viz-line-3)',
  ink: 'var(--viz-ink)',
  ink2: 'var(--viz-ink-2)',
  muted: 'var(--viz-muted)',
  dim: 'var(--viz-dim)',
  faint: 'var(--viz-faint)',
  accent: 'var(--viz-accent)',
  accentSoft: 'var(--viz-accent-soft)',
  accentLine: 'var(--viz-accent-line)',
  accentDim: 'var(--viz-accent-dim)',
  green: 'var(--viz-green)',
  greenSoft: 'var(--viz-green-soft)',
  purple: 'var(--viz-purple)',
  purpleSoft: 'var(--viz-purple-soft)',
  danger: 'var(--viz-danger)',
  grid: 'var(--viz-grid)',
  gridMajor: 'var(--viz-grid-major)',
  panel: 'var(--viz-panel)',
  codeBg: 'var(--viz-code-bg)',
  codeInk: 'var(--viz-code-ink)',
  codeKeyword: 'var(--viz-code-keyword)',
  codeNumber: 'var(--viz-code-number)',
  codeComment: 'var(--viz-code-comment)',
  codeString: 'var(--viz-code-string)',
} as const;

/** Translucent tint of a palette colour, for highlighted states. */
export const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

export const transition = {
  fast: '140ms cubic-bezier(0.22, 1, 0.36, 1)',
  base: '220ms cubic-bezier(0.22, 1, 0.36, 1)',
  slow: '340ms cubic-bezier(0.22, 1, 0.36, 1)',
  spring: '440ms cubic-bezier(0.22, 1, 0.36, 1)',
  pop: '260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

const amber: MantineColorsTuple = [
  '#fff8e1',
  '#ffeeb8',
  '#ffe48a',
  '#ffda58',
  '#ffd033',
  '#ffc91a',
  palette.accent,
  '#f0ab0e',
  '#d99405',
  palette.accentDim,
];

const dark: MantineColorsTuple = [
  palette.ink,
  palette.ink2,
  palette.muted,
  palette.dim,
  palette.faint,
  palette.surface3,
  palette.surface2,
  palette.surface,
  palette.canvas,
  '#05070a',
];

/** Dark + amber terminal theme, with a humanist sans for reading. */
export const theme = createTheme({
  primaryColor: 'amber',
  primaryShade: { light: 8, dark: 6 },
  autoContrast: true,
  respectReducedMotion: true,
  fontFamily: sans,
  fontFamilyMonospace: mono,
  headings: { fontFamily: sans, fontWeight: '600', textWrap: 'balance' },
  defaultRadius: 'md',
  radius: { xs: '4px', sm: '8px', md: '12px', lg: '18px', xl: '24px' },
  colors: { amber, dark },
  components: {
    Button: { defaultProps: { radius: 'md' } },
    Paper: { defaultProps: { radius: 'lg' } },
    TextInput: { defaultProps: { radius: 'md' } },
    Textarea: { defaultProps: { radius: 'md' } },
    SegmentedControl: { defaultProps: { radius: 'md' } },
    Modal: { defaultProps: { radius: 'xl', centered: true } },
  },
});

/**
 * Every scheme-dependent variable is generated from the tokens above, so the
 * stylesheet never keeps a second copy of the palette. Components can use the
 * `vizVar.*` aliases or the raw `--viz-*` variables in CSS.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--viz-radius-card': `${radius.xl}px`,
    '--viz-radius-control': `${radius.md}px`,
    '--viz-grid-size': '28px',
    '--viz-grid-major-size': '112px',
    '--viz-gutter': `${space.lg}px`,
    '--viz-shadow-panel': shadow.panel,
    '--viz-shadow-lift': shadow.lift,
    '--viz-shadow-deck': shadow.deck,
  },
  dark: {
    '--viz-canvas': palette.canvas,
    '--viz-panel': palette.surface,
    '--viz-surface': palette.surface,
    '--viz-surface-2': palette.surface2,
    '--viz-surface-3': palette.surface3,
    '--viz-line': palette.line,
    '--viz-line-2': palette.line2,
    '--viz-line-3': palette.line3,
    '--viz-ink': palette.ink,
    '--viz-ink-2': palette.ink2,
    '--viz-muted': palette.muted,
    '--viz-dim': palette.dim,
    '--viz-faint': palette.faint,
    '--viz-accent': palette.accent,
    '--viz-accent-soft': palette.accentSoft,
    '--viz-accent-line': palette.accentLine,
    '--viz-accent-dim': palette.accentDim,
    '--viz-green': palette.success,
    '--viz-green-soft': palette.successSoft,
    '--viz-purple': palette.info,
    '--viz-purple-soft': palette.infoSoft,
    '--viz-danger': palette.danger,
    '--viz-grid': 'rgba(255, 255, 255, 0.032)',
    '--viz-grid-major': 'rgba(255, 255, 255, 0.055)',
    '--viz-glow-a': 'rgba(251, 191, 36, 0.07)',
    '--viz-glow-b': 'rgba(74, 222, 128, 0.045)',
    '--viz-code-bg': '#0e1216',
    '--viz-code-ink': palette.ink,
    '--viz-code-keyword': '#c9a4ff',
    '--viz-code-number': palette.accent,
    '--viz-code-comment': palette.dim,
    '--viz-code-string': '#7ee2a8',
    '--viz-noise-opacity': '0.022',
  },
  light: {
    '--viz-canvas': lightPalette.canvas,
    '--viz-panel': lightPalette.surface,
    '--viz-surface': lightPalette.surface,
    '--viz-surface-2': lightPalette.surface2,
    '--viz-surface-3': lightPalette.surface3,
    '--viz-line': lightPalette.line,
    '--viz-line-2': lightPalette.line2,
    '--viz-line-3': lightPalette.line3,
    '--viz-ink': lightPalette.ink,
    '--viz-ink-2': lightPalette.ink2,
    '--viz-muted': lightPalette.muted,
    '--viz-dim': lightPalette.dim,
    '--viz-faint': lightPalette.faint,
    '--viz-accent': lightPalette.accent,
    '--viz-accent-soft': lightPalette.accentSoft,
    '--viz-accent-line': lightPalette.accentLine,
    '--viz-accent-dim': lightPalette.accentDim,
    '--viz-green': lightPalette.success,
    '--viz-green-soft': lightPalette.successSoft,
    '--viz-purple': lightPalette.info,
    '--viz-purple-soft': lightPalette.infoSoft,
    '--viz-danger': lightPalette.danger,
    '--viz-grid': 'rgba(28, 33, 29, 0.045)',
    '--viz-grid-major': 'rgba(28, 33, 29, 0.075)',
    '--viz-glow-a': 'rgba(138, 90, 0, 0.075)',
    '--viz-glow-b': 'rgba(31, 122, 61, 0.045)',
    '--viz-code-bg': '#fbf8f0',
    '--viz-code-ink': lightPalette.ink,
    '--viz-code-keyword': '#7b3fbf',
    '--viz-code-number': lightPalette.accent,
    '--viz-code-comment': lightPalette.dim,
    '--viz-code-string': lightPalette.success,
    '--viz-noise-opacity': '0.016',
  },
});
