import { describe, expect, it } from 'vitest';
import { cssVariablesResolver, palette, theme } from './tokens';

describe('theme tokens', () => {
  it('keeps the amber identity and the sans/mono pair', () => {
    expect(theme.primaryColor).toBe('amber');
    expect(theme.fontFamily).toContain('Space Grotesk');
    expect(theme.fontFamilyMonospace).toContain('JetBrains Mono');
  });

  it('derives scheme-aware visualization variables from the tokens', () => {
    const vars = cssVariablesResolver({} as never);

    expect(vars.variables?.['--viz-grid-size']).toBe('28px');
    expect(vars.dark?.['--viz-accent']).toBe(palette.accent);
    expect(vars.dark?.['--viz-canvas']).toBe(palette.canvas);
    expect(vars.light?.['--viz-canvas']).toBeTruthy();
    expect(vars.light?.['--viz-accent']).not.toBe(vars.dark?.['--viz-accent']);
  });
});
