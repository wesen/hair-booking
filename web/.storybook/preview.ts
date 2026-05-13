import type { Preview } from "@storybook/react";
import "../src/fringe-ui/tokens/index.css";

// MSW for Storybook — intercepts API calls in stories
async function prepareStorybook() {
  const { worker } = await import("../src/mock/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}

prepareStorybook();

const FRINGE_VIEWPORTS = {
  iPhone14: {
    name: "iPhone 14",
    styles: { width: "390px", height: "844px" },
  },
  iPhone14ProMax: {
    name: "iPhone 14 Pro Max",
    styles: { width: "430px", height: "932px" },
  },
  desktop1440: {
    name: "Desktop 1440",
    styles: { width: "1440px", height: "900px" },
  },
};

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "cream",
      values: [
        { name: "cream",  value: "#f6efe4" },
        { name: "paper",  value: "#ffffff" },
        { name: "ink",    value: "#111111" },
        { name: "plum",   value: "#6b3a4a" },
        { name: "peach",  value: "#f2b89a" },
      ],
    },
    viewport: {
      viewports: FRINGE_VIEWPORTS,
      defaultViewport: "iPhone14",
    },
  },
};

export default preview;
