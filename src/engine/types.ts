/**
 * Core data model for a lesson.
 *
 * A lesson is pure data + one pure function (`steps`) that turns an input
 * array into the list of frames the player walks through. Nothing here
 * touches the DOM, which keeps every algorithm trivially unit-testable.
 */

export type ViewKind = 'bars' | 'cells' | 'nodes' | 'plot';
export type LinkedKind = 'singly' | 'doubly';
export type CodeApproach = 'iterativo' | 'recursivo';
export type CodeLang = 'java' | 'c';

/** One source listing per language available for a lesson. */
export type CodeListing = Partial<Record<CodeLang, string[]>>;

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

/** One term of the plotted series (plot view). */
export interface PlotPoint {
  label: string;
  value: number;
}

/** Payload for the `plot` view: terms plus the accumulated total. */
export interface PlotState {
  points: PlotPoint[];
  /** Index of the term added in this step; -1 before the first addition. */
  current: number;
  /** Accumulated total up to and including `current`. */
  total: number;
}

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
  /** plot view */
  plot?: PlotState;
}

export interface Complexity {
  time?: { best?: string; avg?: string; worst?: string };
  space?: string;
  stable?: boolean;
  note?: string;
}

/** Reserved space for the comparison/movement cost analysis. */
export interface ComplexityAnalysis {
  comparisons?: string;
  movements?: string;
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
  /** Optional generator for the "Sortear" button (e.g. values in [0, 1)). */
  randomInput?: () => number[];
  /** Accepted values in the input bar. Defaults to `integers`. */
  inputFormat?: 'integers' | 'unit-interval';
  complexity: Complexity;
  /** Shown as an extra card above "Sobre" (sorting lessons). */
  complexityAnalysis?: ComplexityAnalysis;
  code: CodeListing;
  /** Languages shown in the UI. Default: ['java', 'c']. */
  languages?: CodeLang[];
  /**
   * Alternative listings for lessons that offer more than one implementation
   * (for example iterative and recursive). When present, the player shows an
   * extra switch next to the language picker.
   */
  codeVariants?: Partial<Record<CodeApproach, CodeListing>>;
  /**
   * `approach` lets a lesson pick line numbers for the listing being shown.
   * Lessons without variants can ignore it.
   */
  steps: (input: number[], approach?: CodeApproach) => Step[];
}

/** Input used when a lesson does not declare its own `initial`. */
export const DEFAULT_INPUT = [7, 3, 9, 1, 5, 8, 2];
