/**
 * Core data model for a lesson.
 *
 * A lesson is pure data + one pure function (`steps`) that turns an input
 * array into the list of frames the player walks through. Nothing here
 * touches the DOM, which keeps every algorithm trivially unit-testable.
 */

export type ViewKind = 'bars' | 'cells' | 'nodes';
export type LinkedKind = 'singly' | 'doubly';

/** A cell in the `cells` view (array-backed structures: stacks, queues, lists). */
export interface Cell {
  val: number | string | null;
  labels?: string[];
  state?: string;
}

/** A node in the `nodes` view (linked structures). */
export interface Node {
  id: string;
  val: number | string;
  prev?: string | null;
  next?: string | null;
  labels?: string[];
  state?: string;
}

export type VarValue = string | number | null;

/** One frame of playback. Fields are grouped by the view that reads them. */
export interface Step {
  /** Index into the lesson's source-code listing (0-based). */
  line: number;
  /** Human-readable description of what just happened. */
  desc: string;
  /** Optional named variables surfaced next to the visualization. */
  vars?: Record<string, VarValue>;
  /** bars view */
  arr?: number[];
  cmp?: number[];
  swap?: number[];
  pivot?: number[];
  sorted?: number[];
  dim?: number[];
  /** cells view */
  cells?: Cell[];
  /** nodes view */
  nodes?: Node[];
}

export interface Complexity {
  time?: { best?: string; avg?: string; worst?: string };
  space?: string;
  stable?: boolean;
  note?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** Rendering strategy. Defaults to `bars`. */
  view?: ViewKind;
  /** Only meaningful for the `nodes` view. Defaults to `singly`. */
  linked?: LinkedKind;
  /** Label shown above the visualization panel (e.g. "vetor", "fila"). */
  panelLabel?: string;
  /** Seed values for the input bar. Falls back to the shared default. */
  initial?: number[];
  complexity: Complexity;
  code: { java: string[]; c: string[] };
  steps: (input: number[]) => Step[];
}

/** Input used when a lesson does not declare its own `initial`. */
export const DEFAULT_INPUT = [7, 3, 9, 1, 5, 8, 2];
