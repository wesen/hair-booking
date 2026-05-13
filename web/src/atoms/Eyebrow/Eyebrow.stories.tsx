import type { Meta, StoryObj } from "@storybook/react";
import { Eyebrow } from "./Eyebrow";

const meta: Meta<typeof Eyebrow> = {
  title: "Atoms/Eyebrow",
  component: Eyebrow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Eyebrow>;

export const Default: Story = { args: { children: "Chapter I · The Ask" } };
export const Plum: Story    = { args: { children: "Chapter I · The Ask", color: "#6b3a4a" } };
export const PlumDeep: Story= { args: { children: "TUE · JUN 18 · TODAY", color: "#4a2431" } };
export const Coral: Story   = { args: { children: "ROSTER · 142 ACTIVE", color: "#e8573c" } };
export const Sage: Story    = { args: { children: "YOUR STYLIST", color: "#7a8f6b" } };
export const White: Story   = { args: { children: "CONFIRMATION · #4281", color: "#ffffff" } };
export const OnPeach: Story = {
  args: { children: "GOOD MORNING · MIA" },
  decorators: [
    (Story) => (
      <div style={{ background: "#f2b89a", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};
export const OnButter: Story = {
  args: { children: "ESTIMATED · USD" },
  decorators: [
    (Story) => (
      <div style={{ background: "#f4c752", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};
export const OnDark: Story = {
  args: { children: "TODAY · 5 APPOINTMENTS" },
  decorators: [
    (Story) => (
      <div style={{ background: "#111111", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const AllPositions: Story = {
  name: "All positions",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <Eyebrow color="#6b3a4a">Chapter I · The Ask</Eyebrow>
      <Eyebrow color="#e8573c">ROSTER · 142 ACTIVE</Eyebrow>
      <Eyebrow color="#7a8f6b">YOUR STYLIST</Eyebrow>
      <Eyebrow color="#ffffff">CONFIRMATION · #4281</Eyebrow>
    </div>
  ),
};

export const Unstyled: Story = {
  args: { children: "Unstyled eyebrow" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div, no Fringe styles)
      </div>
    ),
  ],
};