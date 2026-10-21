import { describe, expect, it } from 'vitest';
import { lessons } from './lessons';
import { insights } from './insights';

describe('lesson insights', () => {
  it('only references registered lessons', () => {
    for (const slug of Object.keys(insights)) {
      expect(lessons).toHaveProperty(slug);
    }
  });

  it('provides useful copy for every entry', () => {
    for (const insight of Object.values(insights)) {
      expect(Boolean(insight.tip || insight.funFact)).toBe(true);
    }
  });
});
