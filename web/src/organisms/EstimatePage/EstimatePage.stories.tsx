import type { Meta, StoryObj } from "@storybook/react";
import { EstimatePage } from "./EstimatePage";

const meta: Meta<typeof EstimatePage> = {
  title: "Pages/EstimatePage",
  component: EstimatePage,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof EstimatePage>;

export const Default: Story = {
  args: {
    estimateLow: 220,
    estimateHigh: 270,
    service: "Partial highlights + cut",
    colorLevel: "Level 7 → Level 8",
    length: "Mid-back · no extensions",
    addOns: "Olaplex bond treatment · $45",
    onNext: () => console.log("next"),
    onBack: () => console.log("back"),
  },
};
