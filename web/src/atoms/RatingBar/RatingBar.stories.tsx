import type { Meta, StoryObj } from "@storybook/react";
import { RatingBar } from "./RatingBar";

const meta: Meta<typeof RatingBar> = {
  title: "Atoms/RatingBar",
  component: RatingBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RatingBar>;

export const Breakage2of5: Story = { args: { label: "Breakage", value: 2 } };
export const SplitEnds3of5: Story = { args: { label: "Split ends", value: 3 } };
export const Dryness1of5: Story = { args: { label: "Dryness", value: 1 } };
export const Frizz4of5: Story = { args: { label: "Frizz", value: 4 } };
export const Shine5of5: Story = { args: { label: "Shine", value: 5 } };

export const NoLabel: Story = { args: { value: 3 } };

export const CustomColor: Story = {
  args: { label: "Breakage", value: 3, color: "#e8573c" },
};

export const InSection: Story = {
  name: "In hair history section",
  render: () => (
    <div style={{ maxWidth: 480, padding: "14px 0", borderTop: "1px solid #ebe7df" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#6b3a4a", marginBottom: 12 }}>
        03 — RATE CONDITION
      </div>
      <RatingBar label="Breakage"   value={2} />
      <RatingBar label="Split ends" value={3} />
      <RatingBar label="Dryness"    value={1} />
      <RatingBar label="Frizz"      value={4} />
    </div>
  ),
};

export const AllLevels: Story = {
  name: "All levels 1-5",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <RatingBar key={v} label={`Level ${v} (${v}/5)`} value={v} />
      ))}
    </div>
  ),
};

export const Unstyled: Story = {
  args: { label: "Unstyled", value: 3 },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (flex row with 5 div segments)
      </div>
    ),
  ],
};