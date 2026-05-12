// .storybook/preview.ts — MSW browser worker + global imports
import type { Preview } from "@storybook/react";
import "../src/stylist/styles/stylist.css";
import "../src/stylist/styles/theme-default.css";
import "../src/fringe-ui/tokens/index.css";

// Start MSW mock worker before any stories render
// This sets up interception for all API calls in stories
async function prepareStorybook() {
  const { worker } = await import("../src/mock/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}

prepareStorybook();

const MOBILE_VIEWPORTS = {
  iPhone14: {
    name: "iPhone 14",
    styles: { width: "390px", height: "844px" },
  },
  iPhone14ProMax: {
    name: "iPhone 14 Pro Max",
    styles: { width: "430px", height: "932px" },
  },
  iPadMini: {
    name: "iPad Mini",
    styles: { width: "768px", height: "1024px" },
  },
};

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "salon",
      values: [
        { name: "salon",  value: "#faf7f5" },
        { name: "dark",   value: "#1a1412" },
        { name: "paper",  value: "#faf8f5" },
        { name: "white",  value: "#ffffff" },
        { name: "peach",  value: "#f2b89a" },
        { name: "butter", value: "#f7efd0" },
      ],
    },
    viewport: {
      viewports: MOBILE_VIEWPORTS,
      defaultViewport: "iPhone14ProMax",
    },
  },
};

export default preview;