import type { InputSchema, Lesson } from '@/engine/types';

export interface ValidationSuccess {
  valid: true;
  values: number[];
}

export interface ValidationFailure {
  valid: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Returns the effective validation schema for a given lesson, deriving
 * sound defaults based on lesson characteristics (counting sort, unit-interval,
 * single value N, or standard array sorting).
 */
export function getEffectiveInputSchema(lesson: Lesson): InputSchema {
  const isUnitInterval = lesson.inputFormat === 'unit-interval';
  const isSingle = lesson.initial?.length === 1;
  const isCounting = lesson.id === 'counting';

  let defaults: InputSchema;

  if (isUnitInterval) {
    defaults = {
      min: 0,
      max: 1,
      minLength: 1,
      maxLength: 12,
      integerOnly: false,
      format: 'unit-interval',
    };
  } else if (isCounting) {
    defaults = {
      min: 0,
      max: 30,
      minLength: 1,
      maxLength: 12,
      integerOnly: true,
    };
  } else if (isSingle) {
    defaults = {
      min: 1,
      max: 20,
      minLength: 1,
      maxLength: 1,
      integerOnly: true,
    };
  } else {
    // Standard sorting or array collection
    defaults = {
      min: -99,
      max: 999,
      minLength: 1,
      maxLength: 12,
      integerOnly: true,
    };
  }

  return {
    ...defaults,
    ...lesson.inputSchema,
  };
}

/**
 * Parses and strictly validates a free-form list of numbers against an InputSchema.
 * Returns descriptive, user-friendly Portuguese error messages when input is out of bounds.
 */
export function validateLessonInput(raw: string, schema?: InputSchema): ValidationResult {
  const minLength = schema?.minLength ?? 1;
  const maxLength = schema?.maxLength ?? 12;
  const integerOnly = schema?.integerOnly ?? true;
  const isUnitInterval = schema?.format === 'unit-interval';
  const min = schema?.min;
  const max = schema?.max;

  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      valid: false,
      error:
        minLength === 1 && maxLength === 1
          ? 'Digite um número para iniciar.'
          : `Digite entre ${minLength} e ${maxLength} números separados por vírgula.`,
    };
  }

  const rawTokens = trimmed.split(/[,\s;]+/).filter(Boolean);

  if (rawTokens.length === 0) {
    return {
      valid: false,
      error: `Digite entre ${minLength} e ${maxLength} números separados por vírgula.`,
    };
  }

  const parsedNumbers: number[] = [];

  for (const token of rawTokens) {
    const num = Number(token);
    if (!Number.isFinite(num) || Number.isNaN(num)) {
      return {
        valid: false,
        error: `O valor "${token}" não é um número válido.`,
      };
    }
    parsedNumbers.push(num);
  }

  if (minLength === 1 && maxLength === 1 && parsedNumbers.length !== 1) {
    return {
      valid: false,
      error: 'Use um único valor para n.',
    };
  }

  if (parsedNumbers.length < minLength) {
    return {
      valid: false,
      error: `Use no mínimo ${minLength} número(s). Você informou ${parsedNumbers.length}.`,
    };
  }

  if (parsedNumbers.length > maxLength) {
    return {
      valid: false,
      error: `Use no máximo ${maxLength} números. Você informou ${parsedNumbers.length}.`,
    };
  }

  if (integerOnly) {
    const hasDecimals = parsedNumbers.some((val) => !Number.isInteger(val));
    if (hasDecimals) {
      return {
        valid: false,
        error:
          minLength === 1 && maxLength === 1
            ? 'Use um único inteiro para n.'
            : `Use entre ${minLength} e ${maxLength} números inteiros separados por vírgula.`,
      };
    }
  }

  if (isUnitInterval) {
    const outOfInterval = parsedNumbers.filter((val) => val < 0 || val >= 1);
    if (outOfInterval.length > 0) {
      return {
        valid: false,
        error: 'Use valores entre 0 (inclusive) e 1 (exclusive), como 0.25 ou 0.70.',
      };
    }
  }

  if (min !== undefined) {
    const belowMin = parsedNumbers.filter((val) => val < min);
    if (belowMin.length > 0) {
      return {
        valid: false,
        error: `O valor ${belowMin[0]} é menor que o limite mínimo permitido (${min}).`,
      };
    }
  }

  if (max !== undefined) {
    const aboveMax = parsedNumbers.filter((val) => val > max);
    if (aboveMax.length > 0) {
      return {
        valid: false,
        error: `O valor ${aboveMax[0]} é maior que o limite máximo permitido (${max}).`,
      };
    }
  }

  return {
    valid: true,
    values: parsedNumbers,
  };
}
