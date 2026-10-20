import type { Meta, StoryObj } from '@storybook/react';
import { CodePanel } from './CodePanel';

const code = [
  'int soma(int[] v) {',
  '    int total = 0;',
  '    for (int i = 0; i < v.length; i++) {',
  '        total += v[i];',
  '    }',
  '    return total;',
  '}',
];

const meta = {
  title: 'Panels/CodePanel',
  component: CodePanel,
  args: { code, activeLine: 3, lang: 'java', onLangChange: () => {} },
} satisfies Meta<typeof CodePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveLine: Story = {};

export const LongListing: Story = {
  args: {
    code: Array.from({ length: 60 }, (_, i) => `linha ${i + 1};`),
    activeLine: 12,
  },
};

export const CLanguage: Story = {
  args: {
    lang: 'c',
    code: [
      'int soma(int v[], int n) {',
      '    int total = 0;',
      '    for (int i = 0; i < n; i++) {',
      '        total += v[i];',
      '    }',
      '    return total;',
      '}',
    ],
  },
};
