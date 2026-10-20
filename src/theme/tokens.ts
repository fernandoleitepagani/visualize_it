// src/theme/tokens.ts
import { createTheme, type MantineColorsTuple } from '@mantine/core';

/** Single source of truth for every visual value in the app. */
export const palette = {
  canvas: '#0a0a0a',
  surface: '#111111',
  surface2: '#181818',
  surface3: '#1f1f1f',
  surface4: '#232323',

  line: '#262626',
  line2: '#333333',
  line3: '#404040',

  ink: '#e8e8e8',
  // Kept at the value the Mantine `dark` tuple already used (dark[1]).
  ink2: '#c0c0c0',
  muted: '#8a8a8a',
  dim: '#565656',
  faint: '#3a3a3a',

  accent: '#fbbf24',
  accentSoft: 'rgba(251, 191, 36, 0.14)',
  accentLine: 'rgba(251, 191, 36, 0.35)',
  accentDim: '#b07d0a',
  accentHalo: 'rgba(251, 191, 36, 0.24)',
  accentGlow: 'rgba(251, 191, 36, 0.08)',

  success: '#4ade80',
  successSoft: 'rgba(74, 222, 128, 0.12)',
  successLine: 'rgba(74, 222, 128, 0.35)',

  info: '#c084fc',
  infoSoft: 'rgba(192, 132, 252, 0.14)',
  infoLine: 'rgba(192, 132, 252, 0.35)',

  danger: '#f87171',
} as const;

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40 } as const;
export const radius = { sm: 6, md: 8, lg: 12, pill: 999 } as const;
export const font = {
  micro: 10,
  tiny: 11,
  small: 12.5,
  body: 14,
  lead: 16,
  h3: 18,
  h2: 22,
  h1: 30,
} as const;

export const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const shadow = {
  card: '0 1px 0 0 rgba(255,255,255,0.03) inset',
  panel: '0 1px 0 0 rgba(255,255,255,0.035) inset, 0 14px 32px rgba(0,0,0,0.18)',
  deck: '0 1px 0 0 rgba(255,255,255,0.045) inset, 0 12px 30px rgba(0,0,0,0.32)',
  primary: `0 6px 18px ${palette.accentHalo}`,
  focus: `0 0 0 3px ${palette.accentSoft}`,
} as const;

export const transition = {
  fast: '120ms ease-out',
  base: '180ms ease-out',
  slow: '300ms ease-out',
  spring: '340ms cubic-bezier(0.22, 1, 0.36, 1)',
  pop: '240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
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
  palette.line,
  palette.surface2,
  palette.surface,
  palette.canvas,
  palette.surface3,
  '#050505',
];

/** Dark + amber terminal theme. */
export const theme = createTheme({
  primaryColor: 'amber',
  primaryShade: 6,
  autoContrast: true,
  fontFamily: mono,
  fontFamilyMonospace: mono,
  headings: { fontFamily: mono, fontWeight: '600' },
  defaultRadius: 'md',
  colors: { amber, dark },
});
