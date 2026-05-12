// src/mock/browser.ts — MSW browser worker for dev + Storybook
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Start the MSW worker for browser use (dev server + Storybook)
export const worker = setupWorker(...handlers);
worker.start({
  onUnhandledRequest: 'bypass',
  quiet: true,
});