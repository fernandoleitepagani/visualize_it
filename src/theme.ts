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
  purple: '#c084fc',
} as const;

/** Theme-aware aliases for the visualization palette (resolved in CSS). */
export const vizVar = {
  surface: 'var(--viz-surface)',
  surface2: 'var(--viz-surface-2)',
  surface3: 'var(--viz-surface-3)',
  line: 'var(--viz-line)',
  line2: 'var(--viz-line-2)',
  ink: 'var(--viz-ink)',
  muted: 'var(--viz-muted)',
  dim: 'var(--viz-dim)',
  accent: 'var(--viz-accent)',
  accentDim: 'var(--viz-accent-dim)',
  green: 'var(--viz-green)',
  purple: 'var(--viz-purple)',
} as const;

/** Translucent tint of a palette colour, for highlighted states. */
export const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

const amber: MantineColorsTuple = [
  '#fff8e1',
  '#ffeeb8',
  '#ffe48a',
  '#ffda58',
  '#ffd033',
  '#ffc91a',
  viz.accent,
  '#f0ab0e',
  '#d99405',
  viz.accentDim,
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
  primaryShade: { light: 8, dark: 6 },
  autoContrast: true,
  fontFamily: mono,
  fontFamilyMonospace: mono,
  headings: { fontFamily: mono, fontWeight: '600' },
  defaultRadius: 'md',
  colors: { amber, dark },
});
