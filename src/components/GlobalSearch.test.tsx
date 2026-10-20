import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { GlobalSearch } from './GlobalSearch';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe('GlobalSearch', () => {
  it('opens the panel, finds a lesson and navigates to it', async () => {
    renderWithProviders(
      <>
        <GlobalSearch trigger="input" />
        <LocationDisplay />
      </>,
      '/',
    );

    fireEvent.click(screen.getByPlaceholderText('Buscar algoritmo...'));

    const input = await screen.findByPlaceholderText('Nome, tema ou complexidade...');
    await waitFor(() => expect(input).toHaveFocus());
    fireEvent.change(input, { target: { value: 'quicksort' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByTestId('location')).toHaveTextContent('/algoritmos/quicksort');
  });
});
