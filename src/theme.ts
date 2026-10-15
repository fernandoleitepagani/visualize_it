import { createTheme, type MantineColorsTuple } from '@mantine/core';

/** Raw palette, shared by the Mantine theme and the visualizations' inline styles. */
export const viz = {
  canvas: '#0a0a0a',
  surface: '#111111',
  surface2: '#181818',
  surface3: '#1f1f1f',
  line: '#262626',
  line2: '#333333',
  ink: '#e8e8e8',
  muted: '#8a8a8a',
  dim: '#565656',
  accent: '#fbbf24',
  accentDim: '#b07d0a',
  green: '#4ade80',
  blue: '#60a5fa',
  purple: '#c084fc',
  red: '#f87171',
} as const;

const amber: MantineColorsTuple = [
  '#fff8e1',
  '#ffeeb8',
  '#ffe48a',
  '#ffda58',
  '#ffd033',
  '#ffc91a',
  '#fbbf24',
  '#f0ab0e',
  '#d99405',
  '#b07d0a',
];

const dark: MantineColorsTuple = [
  viz.ink,
  '#c0c0c0',
  viz.muted,
  viz.dim,
  viz.line,
  viz.surface2,
  viz.surface,
  viz.canvas,
  viz.surface3,
  '#050505',
];

const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

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
