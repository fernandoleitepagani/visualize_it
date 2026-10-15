import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// With Vitest globals disabled, Testing Library's automatic cleanup is not
// registered, so unmount between tests to keep the DOM isolated.
afterEach(() => {
  cleanup();
});
