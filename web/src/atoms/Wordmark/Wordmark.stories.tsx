import type { Meta, StoryObj } from "@storybook/react";
import { Wordmark } from "./Wordmark";

const meta: Meta<typeof Wordmark> = {
  title: "Fringe/Primitives/Wordmark",
  component: Wordmark,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Wordmark>;

export const Size14: Story = { args: { size: 14 } };
export const Size16: Story = { args: { size: 16 } };
export const Size20: Story = { args: { size: 20 } };
export const Size24: Story = { args: { size: 24 } };
export const Size32: Story = { args: { size: 32 } };
export const Size48: Story = { args: { size: 48 } };

export const PlumColor: Story = { args: { size: 20, color: "#6b3a4a" } };
export const PeachColor: Story = { args: { size: 20, color: "#f2b89a" } };
export const WhiteColor: Story = { args: { size: 20, color: "#ffffff" } };

export const OnPeach: Story = {
  decorators: [
    (Story) => (
      <div style={{ background: "#f2b89a", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const OnDark: Story = {
  decorators: [
    (Story) => (
      <div style={{ background: "#111111", padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};

export const HeaderBar: Story = {
  name: "In header bar context",
  render: () => (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px 22px 0",
      borderBottom: "1px solid #ebe7df",
      background: "#fff",
      height: 52,
    }}>
      {/* Back button */}
      <button style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4L5 9l6 5"/>
        </svg>
      </button>
      <Wordmark size={14} />
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: "#9a958e" }}>01 / 09</div>
    </div>
  ),
};

export const Unstyled: Story = {
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div, no Fringe styles)
      </div>
    ),
  ],
};