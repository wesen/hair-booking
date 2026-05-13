import type { Preview } from "@storybook/react";
import { ReactRenderer } from "@storybook/react";
import { Decorator } from "@storybook/react";
import "../src/fringe-ui/tokens/index.css";

// MSW for Storybook — intercepts API calls in stories
async function prepareStorybook() {
  const { worker } = await import("../src/mock/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}

prepareStorybook();

// ── Phone frame decorator ──────────────────────────────────────
// Wraps stories tagged { phone: true } in a 390×844 phone-shaped
// container with rounded corners, dark bezel, and centered on cream.
const phoneFrame: Decorator<ReactRenderer> = (Story, { parameters }) => {
  if (!parameters.phone) return <Story />;
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "#f6efe4",
      padding: 24,
    }}>
      <div style={{
        width: 390,
        height: 844,
        borderRadius: 48,
        overflow: "hidden",
        border: "8px solid #1a1a1a",
        boxShadow: "0 24px 60px rgba(17,17,17,0.14)",
        background: "#ffffff",
        position: "relative",
        flexShrink: 0,
      }}>
        {/* Dynamic Island notch */}
        <div style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 110,
          height: 32,
          borderRadius: 20,
          background: "#000",
          zIndex: 100,
        }} />
        <Story />
      </div>
    </div>
  );
};

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
  decorators: [phoneFrame],
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
