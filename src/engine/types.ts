/**
 * Core data model for a lesson.
 *
 * A lesson is pure data + one pure function (`steps`) that turns an input
 * array into the list of frames the player walks through. Nothing here
 * touches the DOM, which keeps every algorithm trivially unit-testable.
 */

export type ViewKind = 'bars' | 'cells' | 'nodes' | 'plot' | 'matrix' | 'strings' | 'pointers' | 'object' | 'loop';
export type LinkedKind = 'singly' | 'doubly';
export type CodeApproach = 'iterativo' | 'recursivo';
export type CodeLang = 'java' | 'c' | 'cpp';

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

/** Payload for the `matrix` view (2D array/grid structures). */
export interface MatrixState {
  rows: number;
  cols: number;
  grid: Cell[][];
  activeRow?: number;
  activeCol?: number;
  rowLabels?: string[];
  colLabels?: string[];
}

export type ObjectVisibility = 'public' | 'private' | 'protected';
export type ObjectItemState = 'default' | 'active' | 'write' | 'read';

export interface ObjectAttribute {
  name: string;
  type?: string;
  value?: string | number | boolean | null;
  visibility?: ObjectVisibility;
  state?: ObjectItemState;
  sourceValue?: string;
}

export interface ObjectMethod {
  name: string;
  returnType?: string;
  params?: string;
  visibility?: ObjectVisibility;
  isVirtual?: boolean;
  isOverride?: boolean;
  state?: ObjectItemState;
}

export interface ObjectClassBlueprint {
  name: string;
  baseClass?: string;
  attributes?: ObjectAttribute[];
  methods?: ObjectMethod[];
  state?: ObjectItemState;
}

export interface ObjectInstance {
  id: string;
  label: string;
  className: string;
  attributes: ObjectAttribute[];
  state?: ObjectItemState;
}

export interface ObjectPointer {
  name: string;
  type: string;
  targetId: string | null;
  targetLabel?: string;
}

export interface ObjectCallStack {
  caller?: string;
  target: string;
  dispatchedTo?: string;
  params?: Record<string, string | number>;
  returned?: string | number;
  effect?: string;
}

export interface ObjectExceptionState {
  stage: 'try' | 'throw' | 'catch' | 'handled';
  errorType?: string;
  message?: string;
  bypassed?: boolean;
}

/** Payload for the `object` view (OOP classes, instances, polymorphism, exceptions). */
export interface ObjectState {
  blueprints?: ObjectClassBlueprint[];
  instances?: ObjectInstance[];
  pointer?: ObjectPointer;
  call?: ObjectCallStack;
  exception?: ObjectExceptionState;
  explanationNote?: string;
}

/** One row of characters in the `strings` view. */
export interface StringRow {
  /** Row label, for example "origem", "destino" or "s". */
  label: string;
  cells: Cell[];
}

/** Arrow between two character cells (copy/concat operations). */
export interface StringLink {
  fromRow: number;
  fromIndex: number;
  toRow: number;
  toIndex: number;
}

/** Payload for the `strings` view. */
export interface StringState {
  rows: StringRow[];
  links?: StringLink[];
  /** Optional result chip shown under the rows. */
  result?: { label: string; value: string };
}

export type PointerStateName = 'active' | 'compare' | 'write' | 'empty';

/** One box of memory in the `pointers` view. */
export interface PointerBox {
  id: string;
  name: string;
  type: string;
  address: string;
  value: string | number;
  /** Target box id; absent when the value is not a pointer. */
  targetId?: string;
  /** Expression chips such as `*p` or `**pp`. */
  labels?: string[];
  state?: PointerStateName;
}

/** Payload for the `pointers` view. */
export interface PointerState {
  boxes: PointerBox[];
  /** printf output for the current step. */
  result?: { label: string; value: string };
}

export interface LoopIteration {
  current: number;
  total?: number;
  label?: string;
}

export interface LoopCondition {
  expression: string;
  evaluation?: string;
  satisfied: boolean | null;
  explanation?: string;
}

export interface LoopAccumulator {
  label: string;
  value: number | string;
  previousValue?: number | string;
  delta?: number | string;
}

export type LoopPhase = 'init' | 'check' | 'body' | 'update' | 'end';

/** Payload for the `loop` view (loop tracker: iterations, conditional test, accumulator). */
export interface LoopState {
  phase?: LoopPhase;
  iteration?: LoopIteration;
  innerIteration?: LoopIteration;
  condition?: LoopCondition;
  accumulator?: LoopAccumulator;
}

/** A line index or language-specific line mapping (0-based). */
export type StepLine = number | Partial<Record<CodeLang, number>>;

/**
 * Resolves the 0-based line index for a given language, falling back to a plain
 * number if specified.
 */
export function resolveStepLine(line: StepLine | undefined, lang: CodeLang): number | undefined {
  if (line === undefined) return undefined;
  if (typeof line === 'number') return line;
  return line[lang];
}

/** One frame of playback. Fields are grouped by the view that reads them. */
export interface Step {
  /** Index into the lesson's source-code listing (0-based) or mapping per language. */
  line: StepLine;
  /** Optional index of the caller / paused scope instruction (0-based). */
  callerLine?: StepLine;
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
  /** matrix view */
  matrix?: MatrixState;
  /** object view */
  object?: ObjectState;
  /** strings view */
  strings?: StringState;
  /** pointers view */
  pointers?: PointerState;
  /** loop view */
  loop?: LoopState;
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

export type StructureType = 'vetor' | 'matriz';
export type ArrayOperationType = 'preencher' | 'limpar' | 'buscar' | 'somar';

export interface LessonOperationConfig {
  id: ArrayOperationType;
  label: string;
  panelLabel?: string;
  code: (input: number[] | number[][]) => CodeListing;
  complexity?: Complexity;
  steps: (input: number[] | number[][]) => Step[];
}

export interface LessonStructureConfig {
  id: StructureType;
  label: string;
  defaultInput: number[] | number[][];
  operations: LessonOperationConfig[];
}

export interface LessonOperationsGroup {
  structures: LessonStructureConfig[];
}

/** Declarative constraints for lesson input validation. */
export interface InputSchema {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  integerOnly?: boolean;
  format?: 'integers' | 'unit-interval';
  helperText?: string;
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
  /** Declarative validation schema for custom ranges, lengths and type checks. */
  inputSchema?: InputSchema;
  /** Concept modules hide the input toolbar. */
  inputless?: boolean;
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
   * For lessons that offer multiple data structures and operations
   * (e.g. vetor vs matriz with preencher, limpar, buscar, somar).
   */
  operationsGroup?: LessonOperationsGroup;
  /**
   * `approach` lets a lesson pick line numbers for the listing being shown.
   * Lessons without variants can ignore it.
   */
  steps: (input: number[], approach?: CodeApproach) => Step[];
}

/** Input used when a lesson does not declare its own `initial`. */
export const DEFAULT_INPUT = [7, 3, 9, 1, 5, 8, 2];
