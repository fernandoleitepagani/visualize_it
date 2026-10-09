import type { Lesson, Step, SortElement } from '../../engine/types';

const pseudocode = [
  "function insertionSort(arr) {",
  "  for (let i = 1; i < arr.length; i++) {",
  "    let j = i;",
  "    while (j > 0 && arr[j - 1] > arr[j]) {",
  "      swap(arr, j, j - 1);",
  "      j--;",
  "    }",
  "  }",
  "  return arr;",
  "}"
];

export const insertionSortLesson: Lesson = {
  id: 'insertion-sort',
  title: 'Insertion Sort',
  pseudocode,
  generateSteps: (input: number[]): Step[] => {
    const steps: Step[] = [];
    const arr: SortElement[] = input.map((val, idx) => ({
      id: `el-${idx}-${val}-${Math.random()}`,
      value: val
    }));

    const pushStep = (activeLine: number, comparing: number[] = [], currentMin: number | null = null, swapping: number[] = []) => {
      steps.push({
        activeLine,
        state: { array: [...arr], comparing, currentMin, swapping }
      });
    };

    pushStep(0);

    for (let i = 1; i < arr.length; i++) {
      pushStep(1, [i]);
      let j = i;
      pushStep(2, [j]);

      // Avalia a condição do while
      if (j > 0) pushStep(3, [j, j - 1]);

      while (j > 0 && arr[j - 1].value > arr[j].value) {
        // Marca para a cor de swap (vermelho) antes de efetivar
        pushStep(4, [], null, [j, j - 1]);

        // Mutação real do array
        const temp = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = temp;

        // Snapshot logo após a troca para renderizar o movimento
        pushStep(4, [], null, [j, j - 1]);

        j--;
        pushStep(5, [j]);

        // Re-avalia o while visualmente
        pushStep(3, j > 0 ? [j, j - 1] : [j]);
      }
    }

    pushStep(7);
    pushStep(8);

    return steps;
  }
};
