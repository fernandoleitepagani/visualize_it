import { describe, expect, it } from 'vitest';
import { cssVariablesResolver, palette, theme } from './tokens';

describe('theme tokens', () => {
  it('keeps the amber identity and a system sans/mono pair', () => {
    expect(theme.primaryColor).toBe('amber');
    expect(theme.fontFamily).toContain('system-ui');
    expect(theme.fontFamily).not.toContain('Space Grotesk');
    expect(theme.fontFamilyMonospace).toContain('monospace');
  });

  it('derives scheme-aware visualization variables from the tokens', () => {
    const vars = cssVariablesResolver({} as never);

    expect(vars.variables?.['--viz-grid-size']).toBe('28px');
    expect(vars.dark?.['--viz-accent']).toBe(palette.accent);
    expect(vars.dark?.['--viz-canvas']).toBe(palette.canvas);
    expect(vars.light?.['--viz-canvas']).toBeTruthy();
    expect(vars.light?.['--viz-accent']).not.toBe(vars.dark?.['--viz-accent']);
    expect(vars.dark?.['--viz-subject-blue']).toBeTruthy();
    expect(vars.dark?.['--viz-subject-teal']).toBeTruthy();
    expect(vars.light?.['--viz-subject-violet']).toBeTruthy();
  });
});
