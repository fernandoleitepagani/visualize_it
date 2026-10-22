import type {
  Cell,
  Step,
  StringLink,
  StringRow,
  StringState,
  VarValue,
} from '@/engine/types';

/** Finds the first code line containing `text`; lessons use it as a line anchor. */
export function lineOf(code: string[], text: string): number {
  const index = code.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Linha não encontrada: ${text}`);
  return index;
}

/** Builds cells from a plain string, optionally overriding state and labels. */
export function cellList(
  values: Array<Cell['val']>,
  states: Record<number, string> = {},
  labels: Record<number, string[]> = {},
): Cell[] {
  return values.map((val, index) => {
    const state = states[index] ?? (val === '\\0' ? 'terminator' : '');
    return {
      val,
      ...(state ? { state } : {}),
      ...(labels[index] ? { labels: labels[index] } : {}),
    };
  });
}

/** Builds one character per code point. */
export function cells(
  text: string,
  states: Record<number, string> = {},
  labels: Record<number, string[]> = {},
): Cell[] {
  return cellList([...text], states, labels);
}

/** The visible null terminator used by every C string lesson. */
export function terminator(labels: string[] = []): Cell {
  return { val: '\\0', state: 'terminator', ...(labels.length > 0 ? { labels } : {}) };
}

export function textWithTerminator(
  text: string,
  states: Record<number, string> = {},
  labels: Record<number, string[]> = {},
  terminatorLabels: string[] = [],
): Cell[] {
  return [...cells(text, states, labels), terminator(terminatorLabels)];
}

export function stringRow(label: string, cells: Cell[]): StringRow {
  return { label, cells };
}

interface StringStepOptions {
  links?: StringLink[];
  result?: StringState['result'];
  vars?: Record<string, VarValue>;
}

/** Creates a step carrying one strings-view frame. */
export function stringStep(
  line: number,
  desc: string,
  rows: StringRow[],
  options: StringStepOptions = {},
): Step {
  return {
    line,
    desc,
    ...(options.vars ? { vars: options.vars } : {}),
    strings: {
      rows,
      ...(options.links ? { links: options.links } : {}),
      ...(options.result ? { result: options.result } : {}),
    },
  };
}
