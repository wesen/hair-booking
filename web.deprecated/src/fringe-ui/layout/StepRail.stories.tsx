import type { Meta, StoryObj } from "@storybook/react";
import { StepRail } from "./StepRail";

const meta: Meta<typeof StepRail> = {
  title: "Fringe/Layout/StepRail",
  component: StepRail,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StepRail>;

export const Step0: Story = {
  name: "Step 0 (first step)",
  args: { current: 0 },
};

export const Step2: Story = {
  name: "Step 2",
  args: { current: 2 },
};

export const Step5: Story = {
  name: "Step 5",
  args: { current: 5 },
};

export const Step8: Story = {
  name: "Step 8",
  args: { current: 8 },
};

export const WithButterAccent: Story = {
  name: "Butter accent",
  args: { current: 6, accent: "#f4c752" },
};

export const WithSageAccent: Story = {
  name: "Sage accent",
  args: { current: 7, accent: "#7a8f6b" },
};

export const InDesktopEstimateLayout: Story = {
  name: "In desktop layout (Estimate)",
  render: () => (
    <div style={{ display: "flex", minHeight: 680 }}>
      <StepRail current={6} accent="#f4c752" />
      <div style={{ flex: 1, padding: "48px 56px" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#6b3a4a", marginBottom: 10 }}>Chapter VII · The Quote</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 84, textTransform: "uppercase", letterSpacing: -1.5, color: "#111111", lineHeight: 0.9, marginBottom: 8 }}>Your<br/>estimate.</div>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 22, color: "#5b5852", maxWidth: 440, marginTop: 14 }}>Based on what you've shared.</div>
      </div>
    </div>
  ),
};

export const Unstyled: Story = {
  args: { current: 0 },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div — desktop sidebar)
      </div>
    ),
  ],
};