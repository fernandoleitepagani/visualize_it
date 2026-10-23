import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { ViewPreview } from './ViewPreview';

describe('ViewPreview', () => {
  it('renders the pointers preview', () => {
    const { container } = renderWithProviders(<ViewPreview view="pointers" kind="lesson" />);

    expect(container.querySelector('[data-testid="view-preview-pointers"]')).toBeInTheDocument();
  });

  it('renders the call stack preview', () => {
    const { container } = renderWithProviders(<ViewPreview view="callstack" kind="lesson" />);

    expect(container.querySelector('[data-testid="view-preview-callstack"]')).toBeInTheDocument();
  });

  it('renders the heap preview', () => {
    const { container } = renderWithProviders(<ViewPreview view="heap" kind="lesson" />);

    expect(container.querySelector('[data-testid="view-preview-heap"]')).toBeInTheDocument();
  });
});
