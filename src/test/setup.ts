import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// With Vitest globals disabled, Testing Library's automatic cleanup is not
// registered, so unmount between tests to keep the DOM isolated.
afterEach(() => {
  cleanup();
});

// Mantine relies on a couple of browser APIs that jsdom does not implement.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

// jsdom does not implement scrolling; the app resets it on route changes.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

// Mantine's autosize textarea listens to the Font Loading API.
if (!document.fonts) {
  Object.defineProperty(document, 'fonts', {
    writable: true,
    value: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      ready: Promise.resolve(),
    },
  });
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
