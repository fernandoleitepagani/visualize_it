import type { Lesson, Step, SortElement } from '../../engine/types';

// ... resto do arquivo

const pseudocode = [
  "function selectionSort(arr) {",
  "  for (let i = 0; i < arr.length - 1; i++) {",
  "    let minIdx = i;",
  "    for (let j = i + 1; j < arr.length; j++) {",
  "      if (arr[j] < arr[minIdx]) {",
  "        minIdx = j;",
  "      }",
  "    }",
  "    if (minIdx !== i) {",
  "      swap(arr, i, minIdx);",
  "    }",
  "  }",
  "  return arr;",
  "}"
];

export const selectionSortLesson: Lesson = {
  id: 'selection-sort',
  title: 'Selection Sort',
  pseudocode,
  generateSteps: (input: number[]): Step[] => {
    const steps: Step[] = [];
    const arr: SortElement[] = input.map((val, idx) => ({ id: `el-${idx}-${val}-${Math.random()}`, value: val }));

    const pushStep = (activeLine: number, comparing: number[] = [], currentMin: number | null = null, swapping: number[] = []) => {
      steps.push({
        activeLine,
        state: { array: [...arr], comparing, currentMin, swapping }
      });
    };

    pushStep(0);

    for (let i = 0; i < arr.length - 1; i++) {
      pushStep(1, [], i);
      let minIdx = i;
      pushStep(2, [], minIdx);

      for (let j = i + 1; j < arr.length; j++) {
        pushStep(3, [j], minIdx);
        pushStep(4, [j, minIdx], minIdx);

        if (arr[j].value < arr[minIdx].value) {
          minIdx = j;
          pushStep(5, [j], minIdx);
        }
      }

      pushStep(8, [], minIdx);
      if (minIdx !== i) {
        pushStep(9, [], minIdx, [i, minIdx]);
        // Mutação real do array interno para o próximo step
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        // Snapshot logo após a troca
        pushStep(9, [], minIdx, [i, minIdx]);
      }
    }

    pushStep(12);
    pushStep(13);

    return steps;
  }
};
