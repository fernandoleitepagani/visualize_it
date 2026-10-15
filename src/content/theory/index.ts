import type { ComponentType } from 'react';

import { Complexidade } from './complexidade';
import { Inducao } from './inducao';

export interface TheoryPage {
  title: string;
  subtitle: string;
  Component: ComponentType;
}

export const theory: Record<string, TheoryPage> = {
  complexidade: {
    title: 'Complexidade de Algoritmos',
    subtitle: 'Contagem de operações, funções de custo e notações assintóticas',
    Component: Complexidade,
  },
  inducao: {
    title: 'Provas por Indução',
    subtitle: 'Indução simples, forte e estrutural em algoritmos',
    Component: Inducao,
  },
};
