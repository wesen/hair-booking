import type { Meta, StoryObj } from "@storybook/react";
import { IndexChip } from "./IndexChip";

const meta: Meta<typeof IndexChip> = {
  title: "Atoms/IndexChip",
  component: IndexChip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof IndexChip>;

export const Default: Story = { args: { n: 1 } };
export const N2: Story     = { args: { n: 2 } };
export const N3: Story     = { args: { n: 3 } };
export const N9: Story     = { args: { n: 9 } };
export const StringLabel: Story = { args: { n: "01" } };

export const CoralBg: Story = { args: { n: 1, bg: "#e8573c" } };
export const SageBg: Story  = { args: { n: 1, bg: "#7a8f6b" } };
export const ButterBg: Story= { args: { n: 1, bg: "#f4c752" } };
export const DarkBg: Story  = { args: { n: 1, bg: "#111111" } };

export const CoralOnDark: Story = { args: { n: 1, bg: "#e8573c", color: "#ffffff" } };
export const ButterOnDark: Story = { args: { n: 1, bg: "#f4c752", color: "#111111" } };

export const InRow: Story = {
  name: "In section row",
  render: () => (
    <div style={{ display: "flex", gap: 14, padding: "18px 0", borderTop: "1px solid #ebe7df" }}>
      <IndexChip n={1} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#6b3a4a", marginBottom: 10 }}>
          01 — LAST SERVICE
        </div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 22, textTransform: "uppercase" }}>Partial highlights</div>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 16, color: "#6b3a4a", marginTop: 2 }}>3 months ago</div>
      </div>
    </div>
  ),
};

export const Unstyled: Story = {
  args: { n: 1 },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div)
      </div>
    ),
  ],
};