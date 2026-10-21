import { describe, expect, it } from 'vitest';
import { highlightLine } from './highlight';

describe('highlightLine', () => {
  it('carries block comments across lines', () => {
    const first = highlightLine('/* início do bloco', { inBlockComment: false });
    expect(first.state.inBlockComment).toBe(true);

    const second = highlightLine('fim */ int x = 1;', first.state);
    expect(second.state.inBlockComment).toBe(false);
    expect(second.parts.length).toBeGreaterThan(1);
  });

  it('does not treat // inside a string as a comment', () => {
    const { state } = highlightLine('String url = "https://exemplo";', { inBlockComment: false });
    expect(state.inBlockComment).toBe(false);
  });
});
