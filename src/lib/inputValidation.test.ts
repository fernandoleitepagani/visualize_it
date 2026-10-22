import { describe, expect, it } from 'vitest';
import type { Lesson } from '@/engine/types';
import { getEffectiveInputSchema, validateLessonInput } from './inputValidation';

describe('validateLessonInput', () => {
  it('accepts valid integers within default range', () => {
    const res = validateLessonInput('5, 2, 9, 1');
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.values).toEqual([5, 2, 9, 1]);
    }
  });

  it('accepts alternative delimiters like semicolons and spaces', () => {
    const res = validateLessonInput('10; 20 30\n40');
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.values).toEqual([10, 20, 30, 40]);
    }
  });

  it('rejects empty input', () => {
    const res = validateLessonInput('   ');
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toMatch(/Digite entre/);
    }
  });

  it('rejects non-numeric tokens and names the offender', () => {
    const res = validateLessonInput('5, foo, 9');
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('"foo"');
    }
  });

  it('rejects decimals when integerOnly is true', () => {
    const res = validateLessonInput('5, 2.5, 9', { integerOnly: true });
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toMatch(/números inteiros/);
    }
  });

  it('rejects values below minimum', () => {
    const res = validateLessonInput('5, -10, 8', { min: 0, max: 30 });
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('-10');
      expect(res.error).toContain('mínimo');
    }
  });

  it('rejects values above maximum', () => {
    const res = validateLessonInput('5, 45, 8', { min: 0, max: 30 });
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('45');
      expect(res.error).toContain('máximo');
    }
  });

  it('validates unit interval strictly in [0, 1)', () => {
    const valid = validateLessonInput('0, 0.25, 0.99', {
      format: 'unit-interval',
      integerOnly: false,
    });
    expect(valid.valid).toBe(true);

    const invalidNegative = validateLessonInput('-0.1', {
      format: 'unit-interval',
      integerOnly: false,
    });
    expect(invalidNegative.valid).toBe(false);

    const invalidOne = validateLessonInput('1.0', {
      format: 'unit-interval',
      integerOnly: false,
    });
    expect(invalidOne.valid).toBe(false);
  });

  it('validates single value constraints for N', () => {
    const valid = validateLessonInput('6', { minLength: 1, maxLength: 1 });
    expect(valid.valid).toBe(true);

    const multiple = validateLessonInput('6, 7', { minLength: 1, maxLength: 1 });
    expect(multiple.valid).toBe(false);
    if (!multiple.valid) {
      expect(multiple.error).toMatch(/único/);
    }
  });

  it('validates bounds on length (e.g. max 12 items)', () => {
    const tooMany = validateLessonInput('1,2,3,4,5,6,7,8,9,10,11,12,13', { maxLength: 12 });
    expect(tooMany.valid).toBe(false);
    if (!tooMany.valid) {
      expect(tooMany.error).toMatch(/no máximo 12/);
    }
  });
});

describe('getEffectiveInputSchema', () => {
  it('creates counting sort schema bounded to 0..30', () => {
    const fakeLesson = { id: 'counting', initial: [5, 2, 8] } as Lesson;
    const schema = getEffectiveInputSchema(fakeLesson);
    expect(schema.min).toBe(0);
    expect(schema.max).toBe(30);
    expect(schema.integerOnly).toBe(true);
  });

  it('creates unit-interval schema for bucket sort', () => {
    const fakeLesson = { id: 'bucket', inputFormat: 'unit-interval' } as Lesson;
    const schema = getEffectiveInputSchema(fakeLesson);
    expect(schema.format).toBe('unit-interval');
    expect(schema.integerOnly).toBe(false);
  });

  it('creates single-value schema for while/do-while', () => {
    const fakeLesson = { id: 'while', initial: [6] } as Lesson;
    const schema = getEffectiveInputSchema(fakeLesson);
    expect(schema.minLength).toBe(1);
    expect(schema.maxLength).toBe(1);
    expect(schema.min).toBe(1);
    expect(schema.max).toBe(20);
  });

  it('preserves custom lesson schema overrides', () => {
    const fakeLesson = {
      id: 'custom',
      initial: [1, 2, 3],
      inputSchema: { min: 10, max: 50 },
    } as Lesson;
    const schema = getEffectiveInputSchema(fakeLesson);
    expect(schema.min).toBe(10);
    expect(schema.max).toBe(50);
  });
});
