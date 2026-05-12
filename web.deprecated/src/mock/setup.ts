// src/mock/setup.ts — MSW worker setup for Storybook + dev
import { worker } from './browser';

// In Storybook and dev, MSW intercepts all fetch calls.
// This file should be imported before React renders.
worker.start({
  onUnhandledRequest: 'bypass',
  quiet: true,
});