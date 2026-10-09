export type SortElement = {
  id: string; // Garante que o DOM mantenha o elemento vivo durante os swaps para a transição CSS funcionar
  value: number;
};

export type SortState = {
  array: SortElement[];
  comparing: number[]; // índices que estão sendo comparados no momento
  currentMin: number | null; // índice do menor elemento encontrado até o momento
  swapping: number[]; // índices que estão trocando de lugar
};

export type Step = {
  state: SortState;
  activeLine: number; // Linha do pseudocódigo que representa este estado
};

export type Lesson = {
  id: string;
  title: string;
  pseudocode: string[];
  generateSteps: (input: number[]) => Step[];
};
