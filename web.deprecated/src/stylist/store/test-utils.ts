import { createAppStore } from "./index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTestStore(preloadedState?: any) {
  return createAppStore(preloadedState);
}
